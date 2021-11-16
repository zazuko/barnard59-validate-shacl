import { strictEqual } from 'assert'
import fs from 'fs'
import ParserN3 from '@rdfjs/parser-n3'
import assertThrows from 'assert-throws-async'
import getStream from 'get-stream'
import { isReadable, isWritable } from 'isstream'
import { describe, it } from 'mocha'
import pkg from 'rdf-dataset-ext'
import rdf from 'rdf-ext'
import { shacl } from '../validate.js'

const { toStream } = pkg

const shapePath = 'support/simple.shape.ttl'
new URL(shapePath, import.meta.url).toString()

async function getRDFDataset (filePath) {
  return rdf.dataset().import(getRDFStream(filePath))
}

function getRDFStream (filePath) {
  const stream = fs.createReadStream(new URL(filePath, import.meta.url))
  const parser = new ParserN3({ factory: rdf })
  return parser.import(stream)
}

describe('validate-shacl', () => {
  describe('validate', () => {
    it('should be a factory', () => {
      strictEqual(typeof shacl, 'function')
    })

    it('should throw an error if no argument is given', async () => {
      await assertThrows(async () => {
        await shacl()
      }, Error, /Needs a SHACL shape as parameter/)
    })

    it('should return a duplex stream with a stream shape parameter', async () => {
      const stream = await shacl(getRDFStream(shapePath))

      strictEqual(isReadable(stream), true)
      strictEqual(isWritable(stream), true)
      stream.end()

      const res = await getStream(stream)
    })

    it('does not fail when validation ok', async () => {
      const data = await getRDFDataset('support/data.ttl')
      const dataset = [data, data, data, data]

      // Assumes partitioned data is sent through
      const validator = await shacl(getRDFStream(shapePath))
      const validatedInput = toStream(dataset).pipe(validator)

      const passedTrough = await getStream.array(validatedInput)
      strictEqual(passedTrough.length, dataset.length)
    })

    it('successfully fails when there are validation errors', async () => {
      const data = await getRDFDataset('support/data.ttl')
      const wrongData = await getRDFDataset('support/wrong-data.ttl')
      const dataset = [data, data, wrongData, data]

      // Assumes partitioned data is sent through
      const validator = await shacl(getRDFStream(shapePath))
      const validatedInput = toStream(dataset).pipe(validator)

      await assertThrows(async () => {
        await getStream.array(validatedInput)
      }, Error, /More than 1 values/)
    })

  })
})
