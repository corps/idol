"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaReference = void 0;

var _idol__ = require("../__idol__");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SchemaReference =
/*#__PURE__*/
function () {
  function SchemaReference(val) {
    _classCallCheck(this, SchemaReference);

    this._original = val;
  } // These methods are implemented via the runtime, stubs exist here for reference.


  _createClass(SchemaReference, [{
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
      return this.module_name;
    },
    set: function set(val) {
      this.module_name = val;
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
      return this.qualified_name;
    },
    set: function set(val) {
      this.qualified_name = val;
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
      return this.type_name;
    },
    set: function set(val) {
      this.type_name = val;
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

  return SchemaReference;
}();

exports.SchemaReference = SchemaReference;
(0, _idol__.Struct)(SchemaReference, [{
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