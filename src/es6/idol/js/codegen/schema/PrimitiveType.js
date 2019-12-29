// DO NOT EDIT
// This file was generated by idol_js, any changes will be overwritten when idol_js is run again.
import { Enum } from "../__idol__";

export const SchemaPrimitiveType = {
  INT: "int",
  DOUBLE: "double",
  STRING: "string",
  BOOL: "bool",
  ANY: "any",

  options: ["int", "double", "string", "bool", "any"],
  default: "int",

  // These methods are implemented via the runtime, stubs exist here for reference.,
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

Enum(SchemaPrimitiveType);
