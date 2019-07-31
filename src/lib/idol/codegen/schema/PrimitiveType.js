"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schemaPrimitiveType = void 0;

var _idol__ = require("./../__idol__.js");

/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
var schemaPrimitiveType = {
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
  },
  wrap: function wrap(val) {
    return val;
  },
  unwrap: function unwrap(val) {
    return val;
  }
};
exports.schemaPrimitiveType = schemaPrimitiveType;
(0, _idol__.Enum)(schemaPrimitiveType);