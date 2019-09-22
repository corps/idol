/*
DO NOT EDIT
This file was generated by idol_js, any changes will be overwritten when idol_js is run again.
*/
import { Primitive, Struct } from "../__idol__";

export class SchemaLiteral {
  constructor(val) {
    this._original = val;
  }
  // These methods are implemented via the runtime, stubs exist here for reference.
  static validate(val) {}
  static isValid(val) {
    return true;
  }
  static expand(val) {
    return val;
  }
  static unwrap(val) {
    return val;
  }
  static wrap(val) {
    return null;
  }
  get bool() {
    return Primitive.of("bool").wrap(this._original["bool"]);
  }
  set bool(val) {
    this._original["bool"] = Primitive.of("bool").unwrap(val);
  }
  get double() {
    return Primitive.of("double").wrap(this._original["double"]);
  }
  set double(val) {
    this._original["double"] = Primitive.of("double").unwrap(val);
  }
  get int() {
    return Primitive.of("int").wrap(this._original["int"]);
  }
  set int(val) {
    this._original["int"] = Primitive.of("int").unwrap(val);
  }
  get string() {
    return Primitive.of("string").wrap(this._original["string"]);
  }
  set string(val) {
    this._original["string"] = Primitive.of("string").unwrap(val);
  }
}

Struct(SchemaLiteral, [
  { fieldName: "bool", type: Primitive.of("bool"), optional: false },
  { fieldName: "double", type: Primitive.of("double"), optional: false },
  { fieldName: "int", type: Primitive.of("int"), optional: false },
  { fieldName: "string", type: Primitive.of("string"), optional: false }
]);