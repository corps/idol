"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schemaType = void 0;

var _idol__ = require("./../__idol__.js");

var _Dependency = require("./../../schema/Dependency.js");

var _Field = require("./../../schema/Field.js");

var _TypeStruct = require("./../../schema/TypeStruct.js");

var _Reference = require("./../../schema/Reference.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
      return _idol__.List.of(_Dependency.Dependency, {
        atleastOne: false
      }).wrap(this._original["dependencies"]);
    },
    set: function set(val) {
      this._original["dependencies"] = _idol__.List.of(_Dependency.Dependency, {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "fields",
    get: function get() {
      return _idol__.Map.of(_Field.Field).wrap(this._original["fields"]);
    },
    set: function set(val) {
      this._original["fields"] = _idol__.Map.of(_Field.Field).unwrap(val);
    }
  }, {
    key: "is_a",
    get: function get() {
      return _TypeStruct.TypeStruct.wrap(this._original["is_a"]);
    },
    set: function set(val) {
      this._original["is_a"] = _TypeStruct.TypeStruct.unwrap(val);
    }
  }, {
    key: "isA",
    get: function get() {
      return this.is_a;
    },
    set: function set(val) {
      this.is_a = val;
    }
  }, {
    key: "named",
    get: function get() {
      return _Reference.Reference.wrap(this._original["named"]);
    },
    set: function set(val) {
      this._original["named"] = _Reference.Reference.unwrap(val);
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
      return this.type_vars;
    },
    set: function set(val) {
      this.type_vars = val;
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
  type: _idol__.List.of(_Dependency.Dependency, {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "fields",
  type: _idol__.Map.of(_Field.Field),
  optional: false
}, {
  fieldName: "is_a",
  type: _TypeStruct.TypeStruct,
  optional: true
}, {
  fieldName: "named",
  type: _Reference.Reference,
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