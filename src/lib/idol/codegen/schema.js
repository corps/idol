"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schemaModule = exports.schemaType = exports.schemaDependency = exports.schemaField = exports.schemaTypeStruct = exports.schemaReference = exports.schemaLiteral = exports.schemaPrimitiveType = exports.schemaStructKind = void 0;

var _idol__ = require("./__idol__.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var schemaStructKind = {
  SCALAR: "Scalar",
  REPEATED: "Repeated",
  MAP: "Map",
  options: ["Scalar", "Repeated", "Map"],
  "default": "Scalar",
  validate: function validate(val) {},
  isValid: function isValid(val) {
    return true;
  },
  expand: function expand(val) {
    return val;
  },
  wrap: function wrap(val) {
    return val;
  },
  unwrap: function unwrap(val) {
    return val;
  }
};
exports.schemaStructKind = schemaStructKind;
(0, _idol__.Enum)(schemaStructKind);
var schemaPrimitiveType = {
  INT: "int",
  DOUBLE: "double",
  STRING: "string",
  BOOL: "bool",
  ANY: "any",
  options: ["int", "double", "string", "bool", "any"],
  "default": "int",
  validate: function validate(val) {},
  isValid: function isValid(val) {
    return true;
  },
  expand: function expand(val) {
    return val;
  },
  wrap: function wrap(val) {
    return val;
  },
  unwrap: function unwrap(val) {
    return val;
  }
};
exports.schemaPrimitiveType = schemaPrimitiveType;
(0, _idol__.Enum)(schemaPrimitiveType);

var schemaLiteral =
/*#__PURE__*/
function () {
  function schemaLiteral(val) {
    _classCallCheck(this, schemaLiteral);

    this._original = val;
  }

  _createClass(schemaLiteral, [{
    key: "bool",
    get: function get() {
      return _idol__.Primitive.of("bool").wrap(this._original["bool"]);
    },
    set: function set(val) {
      this._original["bool"] = _idol__.Primitive.of("bool").unwrap(val);
    }
  }, {
    key: "double",
    get: function get() {
      return _idol__.Primitive.of("double").wrap(this._original["double"]);
    },
    set: function set(val) {
      this._original["double"] = _idol__.Primitive.of("double").unwrap(val);
    }
  }, {
    key: "int",
    get: function get() {
      return _idol__.Primitive.of("int").wrap(this._original["int"]);
    },
    set: function set(val) {
      this._original["int"] = _idol__.Primitive.of("int").unwrap(val);
    }
  }, {
    key: "string",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["string"]);
    },
    set: function set(val) {
      this._original["string"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }], [{
    key: "validate",
    value: function validate(val) {}
  }, {
    key: "isValid",
    value: function isValid(val) {
      return true;
    }
  }, {
    key: "expand",
    value: function expand(val) {
      return val;
    }
  }, {
    key: "wrap",
    value: function wrap(val) {
      return new schemaLiteral(val);
    }
  }, {
    key: "unwrap",
    value: function unwrap(val) {
      return val;
    }
  }]);

  return schemaLiteral;
}();

exports.schemaLiteral = schemaLiteral;
(0, _idol__.Struct)(schemaLiteral, [{
  fieldName: "bool",
  type: _idol__.Primitive.of("bool"),
  optional: false
}, {
  fieldName: "double",
  type: _idol__.Primitive.of("double"),
  optional: false
}, {
  fieldName: "int",
  type: _idol__.Primitive.of("int"),
  optional: false
}, {
  fieldName: "string",
  type: _idol__.Primitive.of("string"),
  optional: false
}]);

var schemaReference =
/*#__PURE__*/
function () {
  function schemaReference(val) {
    _classCallCheck(this, schemaReference);

    this._original = val;
  }

  _createClass(schemaReference, [{
    key: "module_name",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["module_name"]);
    },
    set: function set(val) {
      this._original["module_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "moduleName",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["module_name"]);
    },
    set: function set(val) {
      this._original["module_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "qualified_name",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["qualified_name"]);
    },
    set: function set(val) {
      this._original["qualified_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "qualifiedName",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["qualified_name"]);
    },
    set: function set(val) {
      this._original["qualified_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "type_name",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["type_name"]);
    },
    set: function set(val) {
      this._original["type_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "typeName",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["type_name"]);
    },
    set: function set(val) {
      this._original["type_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }], [{
    key: "validate",
    value: function validate(val) {}
  }, {
    key: "isValid",
    value: function isValid(val) {
      return true;
    }
  }, {
    key: "expand",
    value: function expand(val) {
      return val;
    }
  }, {
    key: "wrap",
    value: function wrap(val) {
      return new schemaReference(val);
    }
  }, {
    key: "unwrap",
    value: function unwrap(val) {
      return val;
    }
  }]);

  return schemaReference;
}();

exports.schemaReference = schemaReference;
(0, _idol__.Struct)(schemaReference, [{
  fieldName: "module_name",
  type: _idol__.Primitive.of("string"),
  optional: false
}, {
  fieldName: "qualified_name",
  type: _idol__.Primitive.of("string"),
  optional: false
}, {
  fieldName: "type_name",
  type: _idol__.Primitive.of("string"),
  optional: false
}]);

var schemaTypeStruct =
/*#__PURE__*/
function () {
  function schemaTypeStruct(val) {
    _classCallCheck(this, schemaTypeStruct);

    this._original = val;
  }

  _createClass(schemaTypeStruct, [{
    key: "literal",
    get: function get() {
      return schemaLiteral.wrap(this._original["literal"]);
    },
    set: function set(val) {
      this._original["literal"] = schemaLiteral.unwrap(val);
    }
  }, {
    key: "parameters",
    get: function get() {
      return _idol__.List.of(schemaReference, {
        atleastOne: false
      }).wrap(this._original["parameters"]);
    },
    set: function set(val) {
      this._original["parameters"] = _idol__.List.of(schemaReference, {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "primitive_type",
    get: function get() {
      return schemaPrimitiveType.wrap(this._original["primitive_type"]);
    },
    set: function set(val) {
      this._original["primitive_type"] = schemaPrimitiveType.unwrap(val);
    }
  }, {
    key: "primitiveType",
    get: function get() {
      return schemaPrimitiveType.wrap(this._original["primitive_type"]);
    },
    set: function set(val) {
      this._original["primitive_type"] = schemaPrimitiveType.unwrap(val);
    }
  }, {
    key: "reference",
    get: function get() {
      return schemaReference.wrap(this._original["reference"]);
    },
    set: function set(val) {
      this._original["reference"] = schemaReference.unwrap(val);
    }
  }, {
    key: "struct_kind",
    get: function get() {
      return schemaStructKind.wrap(this._original["struct_kind"]);
    },
    set: function set(val) {
      this._original["struct_kind"] = schemaStructKind.unwrap(val);
    }
  }, {
    key: "structKind",
    get: function get() {
      return schemaStructKind.wrap(this._original["struct_kind"]);
    },
    set: function set(val) {
      this._original["struct_kind"] = schemaStructKind.unwrap(val);
    }
  }], [{
    key: "validate",
    value: function validate(val) {}
  }, {
    key: "isValid",
    value: function isValid(val) {
      return true;
    }
  }, {
    key: "expand",
    value: function expand(val) {
      return val;
    }
  }, {
    key: "wrap",
    value: function wrap(val) {
      return new schemaTypeStruct(val);
    }
  }, {
    key: "unwrap",
    value: function unwrap(val) {
      return val;
    }
  }]);

  return schemaTypeStruct;
}();

exports.schemaTypeStruct = schemaTypeStruct;
(0, _idol__.Struct)(schemaTypeStruct, [{
  fieldName: "literal",
  type: schemaLiteral,
  optional: true
}, {
  fieldName: "parameters",
  type: _idol__.List.of(schemaReference, {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "primitive_type",
  type: schemaPrimitiveType,
  optional: false
}, {
  fieldName: "reference",
  type: schemaReference,
  optional: false
}, {
  fieldName: "struct_kind",
  type: schemaStructKind,
  optional: false
}]);

var schemaField =
/*#__PURE__*/
function () {
  function schemaField(val) {
    _classCallCheck(this, schemaField);

    this._original = val;
  }

  _createClass(schemaField, [{
    key: "field_name",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["field_name"]);
    },
    set: function set(val) {
      this._original["field_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "fieldName",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["field_name"]);
    },
    set: function set(val) {
      this._original["field_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "tags",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["tags"]);
    },
    set: function set(val) {
      this._original["tags"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "type_struct",
    get: function get() {
      return schemaTypeStruct.wrap(this._original["type_struct"]);
    },
    set: function set(val) {
      this._original["type_struct"] = schemaTypeStruct.unwrap(val);
    }
  }, {
    key: "typeStruct",
    get: function get() {
      return schemaTypeStruct.wrap(this._original["type_struct"]);
    },
    set: function set(val) {
      this._original["type_struct"] = schemaTypeStruct.unwrap(val);
    }
  }], [{
    key: "validate",
    value: function validate(val) {}
  }, {
    key: "isValid",
    value: function isValid(val) {
      return true;
    }
  }, {
    key: "expand",
    value: function expand(val) {
      return val;
    }
  }, {
    key: "wrap",
    value: function wrap(val) {
      return new schemaField(val);
    }
  }, {
    key: "unwrap",
    value: function unwrap(val) {
      return val;
    }
  }]);

  return schemaField;
}();

exports.schemaField = schemaField;
(0, _idol__.Struct)(schemaField, [{
  fieldName: "field_name",
  type: _idol__.Primitive.of("string"),
  optional: false
}, {
  fieldName: "tags",
  type: _idol__.List.of(_idol__.Primitive.of("string"), {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "type_struct",
  type: schemaTypeStruct,
  optional: false
}]);

var schemaDependency =
/*#__PURE__*/
function () {
  function schemaDependency(val) {
    _classCallCheck(this, schemaDependency);

    this._original = val;
  }

  _createClass(schemaDependency, [{
    key: "from",
    get: function get() {
      return schemaReference.wrap(this._original["from"]);
    },
    set: function set(val) {
      this._original["from"] = schemaReference.unwrap(val);
    }
  }, {
    key: "is_abstraction",
    get: function get() {
      return _idol__.Primitive.of("bool").wrap(this._original["is_abstraction"]);
    },
    set: function set(val) {
      this._original["is_abstraction"] = _idol__.Primitive.of("bool").unwrap(val);
    }
  }, {
    key: "isAbstraction",
    get: function get() {
      return _idol__.Primitive.of("bool").wrap(this._original["is_abstraction"]);
    },
    set: function set(val) {
      this._original["is_abstraction"] = _idol__.Primitive.of("bool").unwrap(val);
    }
  }, {
    key: "is_local",
    get: function get() {
      return _idol__.Primitive.of("bool").wrap(this._original["is_local"]);
    },
    set: function set(val) {
      this._original["is_local"] = _idol__.Primitive.of("bool").unwrap(val);
    }
  }, {
    key: "isLocal",
    get: function get() {
      return _idol__.Primitive.of("bool").wrap(this._original["is_local"]);
    },
    set: function set(val) {
      this._original["is_local"] = _idol__.Primitive.of("bool").unwrap(val);
    }
  }, {
    key: "to",
    get: function get() {
      return schemaReference.wrap(this._original["to"]);
    },
    set: function set(val) {
      this._original["to"] = schemaReference.unwrap(val);
    }
  }], [{
    key: "validate",
    value: function validate(val) {}
  }, {
    key: "isValid",
    value: function isValid(val) {
      return true;
    }
  }, {
    key: "expand",
    value: function expand(val) {
      return val;
    }
  }, {
    key: "wrap",
    value: function wrap(val) {
      return new schemaDependency(val);
    }
  }, {
    key: "unwrap",
    value: function unwrap(val) {
      return val;
    }
  }]);

  return schemaDependency;
}();

exports.schemaDependency = schemaDependency;
(0, _idol__.Struct)(schemaDependency, [{
  fieldName: "from",
  type: schemaReference,
  optional: false
}, {
  fieldName: "is_abstraction",
  type: _idol__.Primitive.of("bool"),
  optional: false
}, {
  fieldName: "is_local",
  type: _idol__.Primitive.of("bool"),
  optional: false
}, {
  fieldName: "to",
  type: schemaReference,
  optional: false
}]);

var schemaType =
/*#__PURE__*/
function () {
  function schemaType(val) {
    _classCallCheck(this, schemaType);

    this._original = val;
  }

  _createClass(schemaType, [{
    key: "dependencies",
    get: function get() {
      return _idol__.List.of(schemaDependency, {
        atleastOne: false
      }).wrap(this._original["dependencies"]);
    },
    set: function set(val) {
      this._original["dependencies"] = _idol__.List.of(schemaDependency, {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "fields",
    get: function get() {
      return _idol__.Map.of(schemaField).wrap(this._original["fields"]);
    },
    set: function set(val) {
      this._original["fields"] = _idol__.Map.of(schemaField).unwrap(val);
    }
  }, {
    key: "is_a",
    get: function get() {
      return schemaTypeStruct.wrap(this._original["is_a"]);
    },
    set: function set(val) {
      this._original["is_a"] = schemaTypeStruct.unwrap(val);
    }
  }, {
    key: "isA",
    get: function get() {
      return schemaTypeStruct.wrap(this._original["is_a"]);
    },
    set: function set(val) {
      this._original["is_a"] = schemaTypeStruct.unwrap(val);
    }
  }, {
    key: "named",
    get: function get() {
      return schemaReference.wrap(this._original["named"]);
    },
    set: function set(val) {
      this._original["named"] = schemaReference.unwrap(val);
    }
  }, {
    key: "options",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["options"]);
    },
    set: function set(val) {
      this._original["options"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "tags",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["tags"]);
    },
    set: function set(val) {
      this._original["tags"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "type_vars",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["type_vars"]);
    },
    set: function set(val) {
      this._original["type_vars"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "typeVars",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["type_vars"]);
    },
    set: function set(val) {
      this._original["type_vars"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }], [{
    key: "validate",
    value: function validate(val) {}
  }, {
    key: "isValid",
    value: function isValid(val) {
      return true;
    }
  }, {
    key: "expand",
    value: function expand(val) {
      return val;
    }
  }, {
    key: "wrap",
    value: function wrap(val) {
      return new schemaType(val);
    }
  }, {
    key: "unwrap",
    value: function unwrap(val) {
      return val;
    }
  }]);

  return schemaType;
}();

exports.schemaType = schemaType;
(0, _idol__.Struct)(schemaType, [{
  fieldName: "dependencies",
  type: _idol__.List.of(schemaDependency, {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "fields",
  type: _idol__.Map.of(schemaField),
  optional: false
}, {
  fieldName: "is_a",
  type: schemaTypeStruct,
  optional: true
}, {
  fieldName: "named",
  type: schemaReference,
  optional: false
}, {
  fieldName: "options",
  type: _idol__.List.of(_idol__.Primitive.of("string"), {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "tags",
  type: _idol__.List.of(_idol__.Primitive.of("string"), {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "type_vars",
  type: _idol__.List.of(_idol__.Primitive.of("string"), {
    atleastOne: false
  }),
  optional: false
}]);

var schemaModule =
/*#__PURE__*/
function () {
  function schemaModule(val) {
    _classCallCheck(this, schemaModule);

    this._original = val;
  }

  _createClass(schemaModule, [{
    key: "abstract_types_by_name",
    get: function get() {
      return _idol__.Map.of(schemaType).wrap(this._original["abstract_types_by_name"]);
    },
    set: function set(val) {
      this._original["abstract_types_by_name"] = _idol__.Map.of(schemaType).unwrap(val);
    }
  }, {
    key: "abstractTypesByName",
    get: function get() {
      return _idol__.Map.of(schemaType).wrap(this._original["abstract_types_by_name"]);
    },
    set: function set(val) {
      this._original["abstract_types_by_name"] = _idol__.Map.of(schemaType).unwrap(val);
    }
  }, {
    key: "dependencies",
    get: function get() {
      return _idol__.List.of(schemaDependency, {
        atleastOne: false
      }).wrap(this._original["dependencies"]);
    },
    set: function set(val) {
      this._original["dependencies"] = _idol__.List.of(schemaDependency, {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "module_name",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["module_name"]);
    },
    set: function set(val) {
      this._original["module_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "moduleName",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["module_name"]);
    },
    set: function set(val) {
      this._original["module_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "types_by_name",
    get: function get() {
      return _idol__.Map.of(schemaType).wrap(this._original["types_by_name"]);
    },
    set: function set(val) {
      this._original["types_by_name"] = _idol__.Map.of(schemaType).unwrap(val);
    }
  }, {
    key: "typesByName",
    get: function get() {
      return _idol__.Map.of(schemaType).wrap(this._original["types_by_name"]);
    },
    set: function set(val) {
      this._original["types_by_name"] = _idol__.Map.of(schemaType).unwrap(val);
    }
  }, {
    key: "types_dependency_ordering",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["types_dependency_ordering"]);
    },
    set: function set(val) {
      this._original["types_dependency_ordering"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "typesDependencyOrdering",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["types_dependency_ordering"]);
    },
    set: function set(val) {
      this._original["types_dependency_ordering"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }], [{
    key: "validate",
    value: function validate(val) {}
  }, {
    key: "isValid",
    value: function isValid(val) {
      return true;
    }
  }, {
    key: "expand",
    value: function expand(val) {
      return val;
    }
  }, {
    key: "wrap",
    value: function wrap(val) {
      return new schemaModule(val);
    }
  }, {
    key: "unwrap",
    value: function unwrap(val) {
      return val;
    }
  }]);

  return schemaModule;
}();

exports.schemaModule = schemaModule;
(0, _idol__.Struct)(schemaModule, [{
  fieldName: "abstract_types_by_name",
  type: _idol__.Map.of(schemaType),
  optional: false
}, {
  fieldName: "dependencies",
  type: _idol__.List.of(schemaDependency, {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "module_name",
  type: _idol__.Primitive.of("string"),
  optional: false
}, {
  fieldName: "types_by_name",
  type: _idol__.Map.of(schemaType),
  optional: false
}, {
  fieldName: "types_dependency_ordering",
  type: _idol__.List.of(_idol__.Primitive.of("string"), {
    atleastOne: false
  }),
  optional: false
}]);