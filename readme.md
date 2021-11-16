#  barnard59-validate-shacl

A barnard59 step that validates RDF using the [Shapes Constraint Language](https://www.w3.org/TR/shacl) (SHACL).

## Install

```
npm install barnard59-validate-shacl --save
```

## Exported steps

### `validate`

A step that automates the validation of RDF against a set of conditions specified in a SHACL graph. 

Note that this operation does not take care of partitioning the data, using this operation requires to prepare the data accordingly. 

The argument is a RDF stream containing the SHACL shapes. 