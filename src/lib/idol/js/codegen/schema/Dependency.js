"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaDependency = void 0;

var _Reference = require("../../schema/Reference");

var _idol__ = require("../__idol__");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
A structure describing a dependency relationship between two types.
Usually this comes from the types inside of a Structure, but it can also
come from a TypeStruct that builds a container from some other structure.
*/
var SchemaDependency =
/*#__PURE__*/
function () {
  function SchemaDependency(val) {
    _classCallCheck(this, SchemaDependency);

    this._original = val;
  } // These methods are implemented via the runtime, stubs exist here for reference.


  _createClass(SchemaDependency, [{
    key: "from",
    // The information on the type needing the to type.
    get: function get() {
      return _Reference.Reference.wrap(this._original["from"]);
    },
    set: function set(val) {
      this._original["from"] = _Reference.Reference.unwrap(val);
    } // True when the to reference is a higher kinded type (should take type_vars).

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
      return this.is_abstraction;
    },
    set: function set(val) {
      this.is_abstraction = val;
    } // Convenience attribute indicating when the module for the from and to are equal.

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
      return this.is_local;
    },
    set: function set(val) {
      this.is_local = val;
    } // The external type name required by the from type

  }, {
    key: "to",
    get: function get() {
      return _Reference.Reference.wrap(this._original["to"]);
    },
    set: function set(val) {
      this._original["to"] = _Reference.Reference.unwrap(val);
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

  return SchemaDependency;
}();

exports.SchemaDependency = SchemaDependency;
(0, _idol__.Struct)(SchemaDependency, [{
  fieldName: "from",
  type: _Reference.Reference,
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
  type: _Reference.Reference,
  optional: false
}]);