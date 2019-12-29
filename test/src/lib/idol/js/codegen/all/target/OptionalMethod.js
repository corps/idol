// DO NOT EDIT
// This file was generated by idol_js, any changes will be overwritten when idol_js is run again.
import { OptionalParams as ScaffoldOptionalParams } from "../../../all/target/OptionalParams";
import { AssembledOptional as ScaffoldAssembledOptional } from "../../../all/target/AssembledOptional";
import { Struct } from "../../__idol__";

export class AllTargetOptionalMethod {
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

  get input() {
    return ScaffoldOptionalParams.wrap(this._original["input"]);
  }
  set input(val) {
    this._original["input"] = ScaffoldOptionalParams.unwrap(val);
  }

  get output() {
    return ScaffoldAssembledOptional.wrap(this._original["output"]);
  }
  set output(val) {
    this._original["output"] = ScaffoldAssembledOptional.unwrap(val);
  }
}

Struct(AllTargetOptionalMethod, [
  { fieldName: "input", type: ScaffoldOptionalParams, optional: false },
  { fieldName: "output", type: ScaffoldAssembledOptional, optional: false }
]);
