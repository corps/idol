"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schemaDependency = void 0;

var _idol__ = require("./../__idol__.js");

var _Reference = require("./../../schema/Reference.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
      return _Reference.Reference.wrap(this._original["from"]);
    },
    set: function set(val) {
      this._original["from"] = _Reference.Reference.unwrap(val);
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
      return this.is_abstraction;
    },
    set: function set(val) {
      this.is_abstraction = val;
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
      return this.is_local;
    },
    set: function set(val) {
      this.is_local = val;
    }
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