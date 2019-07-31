/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { Struct as Struct_, Primitive as Primitive_ } from "./../__idol__.js";

export class schemaLiteral {
  constructor(val) {
    this._original = val;
  }

  static validate(val) {}

  static isValid(val) {
    return true;
  }

  static expand(val) {
    return val;
  }

  static wrap(val) {
    return new schemaLiteral(val);
  }

  static unwrap(val) {
    return val;
  }

  get bool() {
    return Primitive_.of("bool").wrap(this._original["bool"]);
  }

  set bool(val) {
    this._original["bool"] = Primitive_.of("bool").unwrap(val);
  }

  get double() {
    return Primitive_.of("double").wrap(this._original["double"]);
  }

  set double(val) {
    this._original["double"] = Primitive_.of("double").unwrap(val);
  }

  get int() {
    return Primitive_.of("int").wrap(this._original["int"]);
  }

  set int(val) {
    this._original["int"] = Primitive_.of("int").unwrap(val);
  }

  get string() {
    return Primitive_.of("string").wrap(this._original["string"]);
  }

  set string(val) {
    this._original["string"] = Primitive_.of("string").unwrap(val);
  }
}

Struct_(schemaLiteral, [
  { fieldName: "bool", type: Primitive_.of("bool"), optional: false },
  { fieldName: "double", type: Primitive_.of("double"), optional: false },
  { fieldName: "int", type: Primitive_.of("int"), optional: false },
  { fieldName: "string", type: Primitive_.of("string"), optional: false }
]);
