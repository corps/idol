/*
DO NOT EDIT
This file was generated by idol_js, any changes will be overwritten when idol_js is run again.
*/
import { Primitive, Struct } from "../../../__idol__";

export class TestsAbsThreeSideImport2 {
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
  get side_import2() {
    return Primitive.of("int").wrap(this._original["side_import2"]);
  }
  set side_import2(val) {
    this._original["side_import2"] = Primitive.of("int").unwrap(val);
  }
  get sideImport2() {
    return this.side_import2;
  }
  set sideImport2(val) {
    this.side_import2 = val;
  }
}

Struct(TestsAbsThreeSideImport2, [
  { fieldName: "side_import2", type: Primitive.of("int"), optional: false }
]);