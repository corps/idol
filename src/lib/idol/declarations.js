"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeDec = TypeDec;

var _idol__ = require("__idol__");

var declarations = _interopRequireWildcard(require("declarations"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

// DO NOT EDIT THIS FILE
// This file is generated via idol_js.js.  You can either subclass these types
// in your own module file or update the relevant model.toml file and regenerate.
function TypeDec(val) {
  return TypeDec.wrap.apply(this, arguments);
}

(0, _idol__.Struct)(TypeDec, {
  "enum": ["enum", _idol__.Primitive.of("string")],
  fields: ["fields", FieldDec],
  isA: ["is_a", _idol__.Primitive.of("string")],
  tags: ["tags", _idol__.Primitive.of("string")],
  typeVars: ["type_vars", _idol__.Primitive.of("string")]
});
(0, _idol__.Struct)(TypeDec);
TypeDec.metadata = {
  "dependencies": [{
    "from": {
      "module_name": "declarations",
      "qualified_name": "declarations.TypeDec",
      "type_name": "TypeDec"
    },
    "to": {
      "module_name": "declarations",
      "qualified_name": "declarations.FieldDec",
      "type_name": "FieldDec"
    },
    "is_abstraction": false,
    "is_local": true
  }],
  "fields": {
    "is_a": {
      "field_name": "is_a",
      "tags": [],
      "type_struct": {
        "literal": null,
        "parameters": [],
        "primitive_type": "string",
        "reference": {
          "module_name": "",
          "qualified_name": "",
          "type_name": ""
        },
        "struct_kind": "Scalar"
      }
    },
    "fields": {
      "field_name": "fields",
      "tags": [],
      "type_struct": {
        "literal": null,
        "parameters": [],
        "primitive_type": "int53",
        "reference": {
          "module_name": "declarations",
          "qualified_name": "declarations.FieldDec",
          "type_name": "FieldDec"
        },
        "struct_kind": "Map"
      }
    },
    "type_vars": {
      "field_name": "type_vars",
      "tags": [],
      "type_struct": {
        "literal": null,
        "parameters": [],
        "primitive_type": "string",
        "reference": {
          "module_name": "",
          "qualified_name": "",
          "type_name": ""
        },
        "struct_kind": "Repeated"
      }
    },
    "tags": {
      "field_name": "tags",
      "tags": [],
      "type_struct": {
        "literal": null,
        "parameters": [],
        "primitive_type": "string",
        "reference": {
          "module_name": "",
          "qualified_name": "",
          "type_name": ""
        },
        "struct_kind": "Repeated"
      }
    },
    "enum": {
      "field_name": "enum",
      "tags": [],
      "type_struct": {
        "literal": null,
        "parameters": [],
        "primitive_type": "string",
        "reference": {
          "module_name": "",
          "qualified_name": "",
          "type_name": ""
        },
        "struct_kind": "Repeated"
      }
    }
  },
  "is_a": null,
  "named": {
    "module_name": "declarations",
    "qualified_name": "declarations.TypeDec",
    "type_name": "TypeDec"
  },
  "options": [],
  "tags": [],
  "type_vars": []
};