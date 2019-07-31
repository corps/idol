"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schemaStructKind = void 0;

var _idol__ = require("./../__idol__.js");

/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
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