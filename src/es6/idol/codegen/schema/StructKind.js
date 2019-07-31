/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { Enum as Enum_ } from "./../__idol__.js";

export const schemaStructKind = {
  SCALAR: "Scalar",
  REPEATED: "Repeated",
  MAP: "Map",

  options: ["Scalar", "Repeated", "Map"],
  default: "Scalar",

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
Enum_(schemaStructKind);
