"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaTypeStruct = void 0;

var _Literal = require("../../schema/Literal");

var _idol__ = require("../__idol__");

var _Reference = require("../../schema/Reference");

var _PrimitiveType = require("../../schema/PrimitiveType");

var _StructKind = require("../../schema/StructKind");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SchemaTypeStruct =
/*#__PURE__*/
function () {
  function SchemaTypeStruct(val) {
    _classCallCheck(this, SchemaTypeStruct);

    this._original = val;
  } // These methods are implemented via the runtime, stubs exist here for reference.


  _createClass(SchemaTypeStruct, [{
    key: "literal",
    get: function get() {
      return _Literal.Literal.wrap(this._original["literal"]);
    },
    set: function set(val) {
      this._original["literal"] = _Literal.Literal.unwrap(val);
    }
  }, {
    key: "parameters",
    get: function get() {
      return _idol__.List.of(_Reference.Reference, {
        atleastOne: false
      }).wrap(this._original["parameters"]);
    },
    set: function set(val) {
      this._original["parameters"] = _idol__.List.of(_Reference.Reference, {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "primitive_type",
    get: function get() {
      return _PrimitiveType.PrimitiveType.wrap(this._original["primitive_type"]);
    },
    set: function set(val) {
      this._original["primitive_type"] = _PrimitiveType.PrimitiveType.unwrap(val);
    }
  }, {
    key: "primitiveType",
    get: function get() {
      return this.primitive_type;
    },
    set: function set(val) {
      this.primitive_type = val;
    }
  }, {
    key: "reference",
    get: function get() {
      return _Reference.Reference.wrap(this._original["reference"]);
    },
    set: function set(val) {
      this._original["reference"] = _Reference.Reference.unwrap(val);
    }
  }, {
    key: "struct_kind",
    get: function get() {
      return _StructKind.StructKind.wrap(this._original["struct_kind"]);
    },
    set: function set(val) {
      this._original["struct_kind"] = _StructKind.StructKind.unwrap(val);
    }
  }, {
    key: "structKind",
    get: function get() {
      return this.struct_kind;
    },
    set: function set(val) {
      this.struct_kind = val;
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
    key: "unwrap",
    value: function unwrap(val) {
      return val;
    }
  }, {
    key: "wrap",
    value: function wrap(val) {
      return null;
    }
  }]);

  return SchemaTypeStruct;
}();

exports.SchemaTypeStruct = SchemaTypeStruct;
(0, _idol__.Struct)(SchemaTypeStruct, [{
  fieldName: "literal",
  type: _Literal.Literal,
  optional: true
}, {
  fieldName: "parameters",
  type: _idol__.List.of(_Reference.Reference, {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "primitive_type",
  type: _PrimitiveType.PrimitiveType,
  optional: false
}, {
  fieldName: "reference",
  type: _Reference.Reference,
  optional: false
}, {
  fieldName: "struct_kind",
  type: _StructKind.StructKind,
  optional: false
}]);