/*
DO NOT EDIT
This file was generated by idol_js, any changes will be overwritten when idol_js is run again.
*/
import { Primitive, Struct } from "../../__idol__";
import { TestsBasicTestStructInner as CodegenTestsBasicTestStructInner } from "./TestStructInner";

export class TestsBasicTestStruct {
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
  get a() {
    return Primitive.of("string").wrap(this._original["a"]);
  }
  set a(val) {
    this._original["a"] = Primitive.of("string").unwrap(val);
  }
  get b() {
    return Primitive.of("int").wrap(this._original["b"]);
  }
  set b(val) {
    this._original["b"] = Primitive.of("int").unwrap(val);
  }
  get c() {
    return CodegenTestsBasicTestStructInner.wrap(this._original["c"]);
  }
  set c(val) {
    this._original["c"] = CodegenTestsBasicTestStructInner.unwrap(val);
  }
}

Struct(TestsBasicTestStruct, [
  { fieldName: "a", type: Primitive.of("string"), optional: false },
  { fieldName: "b", type: Primitive.of("int"), optional: false },
  { fieldName: "c", type: CodegenTestsBasicTestStructInner, optional: false }
]);