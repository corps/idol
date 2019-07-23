"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldDec = FieldDec;
exports.TypeDec = TypeDec;
exports.ModuleDec = ModuleDec;

var _idol__ = require("./__idol__");

// DO NOT EDIT THIS FILE
// This file is generated via idol_js.js.  You can either subclass these types
// in your own module file or update the relevant model.toml file and regenerate.
function FieldDec(val) {
  return FieldDec.wrap.apply(this, arguments);
}

(0, _idol__.List)(FieldDec, _idol__.Primitive.of("string"));
FieldDec.metadata = {
  "dependencies": [],
  "fields": {},
  "is_a": {
    "literal": null,
    "parameters": [],
    "primitive_type": "string",
    "reference": {
      "module_name": "",
      "qualified_name": "",
      "type_name": ""
    },
    "struct_kind": "Repeated"
  },
  "named": {
    "module_name": "declarations",
    "qualified_name": "declarations.FieldDec",
    "type_name": "FieldDec"
  },
  "options": [],
  "tags": ["atleast_one"],
  "type_vars": []
};

function TypeDec(val) {
  return TypeDec.wrap.apply(this, arguments);
}

(0, _idol__.Struct)(TypeDec, [["enum", "enum", _idol__.List.of(_idol__.Primitive.of("string"))], ["fields", "fields", _idol__.Map.of(FieldDec)], ["isA", "is_a", _idol__.Primitive.of("string")], ["tags", "tags", _idol__.List.of(_idol__.Primitive.of("string"))], ["typeVars", "type_vars", _idol__.List.of(_idol__.Primitive.of("string"))]]);
TypeDec.metadata = {
  "dependencies": [{
    "from": {
      "module_name": "declarations",
      "qualified_name": "declarations.TypeDec",
      "type_name": "TypeDec"
    },
    "is_abstraction": false,
    "is_local": true,
    "to": {
      "module_name": "declarations",
      "qualified_name": "declarations.FieldDec",
      "type_name": "FieldDec"
    }
  }],
  "fields": {
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
    },
    "fields": {
      "field_name": "fields",
      "tags": [],
      "type_struct": {
        "literal": null,
        "parameters": [],
        "primitive_type": "int",
        "reference": {
          "module_name": "declarations",
          "qualified_name": "declarations.FieldDec",
          "type_name": "FieldDec"
        },
        "struct_kind": "Map"
      }
    },
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

function ModuleDec(val) {
  return ModuleDec.wrap.apply(this, arguments);
}

(0, _idol__.Map)(ModuleDec, TypeDec);
ModuleDec.metadata = {
  "dependencies": [{
    "from": {
      "module_name": "declarations",
      "qualified_name": "declarations.ModuleDec",
      "type_name": "ModuleDec"
    },
    "is_abstraction": false,
    "is_local": true,
    "to": {
      "module_name": "declarations",
      "qualified_name": "declarations.TypeDec",
      "type_name": "TypeDec"
    }
  }],
  "fields": {},
  "is_a": {
    "literal": null,
    "parameters": [],
    "primitive_type": "int",
    "reference": {
      "module_name": "declarations",
      "qualified_name": "declarations.TypeDec",
      "type_name": "TypeDec"
    },
    "struct_kind": "Map"
  },
  "named": {
    "module_name": "declarations",
    "qualified_name": "declarations.ModuleDec",
    "type_name": "ModuleDec"
  },
  "options": [],
  "tags": [],
  "type_vars": []
};