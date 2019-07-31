/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { Enum as Enum_ } from "./../__idol__.js";

export const schemaPrimitiveType = {
  INT: "int",
  DOUBLE: "double",
  STRING: "string",
  BOOL: "bool",
  ANY: "any",

  options: ["int", "double", "string", "bool", "any"],
  default: "int",

  validate(val) {},

  isValid(val) {
    return true;
  },

  expand(val) {
    return val;
  },

  wrap(val) {
    return val;
  },

  unwrap(val) {
    return val;
  }
};
Enum_(schemaPrimitiveType);
