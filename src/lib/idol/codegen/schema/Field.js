"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schemaField = void 0;

var _idol__ = require("./../__idol__.js");

var _TypeStruct = require("./../../schema/TypeStruct.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
      return this.field_name;
    },
    set: function set(val) {
      this.field_name = val;
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
      return _TypeStruct.TypeStruct.wrap(this._original["type_struct"]);
    },
    set: function set(val) {
      this._original["type_struct"] = _TypeStruct.TypeStruct.unwrap(val);
    }
  }, {
    key: "typeStruct",
    get: function get() {
      return this.type_struct;
    },
    set: function set(val) {
      this.type_struct = val;
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
  type: _TypeStruct.TypeStruct,
  optional: false
}]);