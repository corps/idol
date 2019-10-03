"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaLiteral = void 0;

var _idol__ = require("../__idol__");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SchemaLiteral =
/*#__PURE__*/
function () {
  function SchemaLiteral(val) {
    _classCallCheck(this, SchemaLiteral);

    this._original = val;
  } // These methods are implemented via the runtime, stubs exist here for reference.


  _createClass(SchemaLiteral, [{
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

  return SchemaLiteral;
}();

exports.SchemaLiteral = SchemaLiteral;
(0, _idol__.Struct)(SchemaLiteral, [{
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