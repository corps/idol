"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaStructKind = void 0;

var _idol__ = require("../__idol__");

var _SchemaStructKind;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SchemaStructKind = (_SchemaStructKind = {
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
  }
}, _defineProperty(_SchemaStructKind, "expand", function expand(wrap) {
  return val;
}), _defineProperty(_SchemaStructKind, "expand", function expand(unwrap) {
  return val;
}), _SchemaStructKind);
exports.SchemaStructKind = SchemaStructKind;
(0, _idol__.Enum)(SchemaStructKind);