"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaPrimitiveType = void 0;

var _idol__ = require("../__idol__");

var _SchemaPrimitiveType;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SchemaPrimitiveType = (_SchemaPrimitiveType = {
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
  }
}, _defineProperty(_SchemaPrimitiveType, "expand", function expand(wrap) {
  return val;
}), _defineProperty(_SchemaPrimitiveType, "expand", function expand(unwrap) {
  return val;
}), _SchemaPrimitiveType);
exports.SchemaPrimitiveType = SchemaPrimitiveType;
(0, _idol__.Enum)(SchemaPrimitiveType);