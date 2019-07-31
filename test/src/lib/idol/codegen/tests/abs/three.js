/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import {
  Struct as Struct_,
  Primitive as Primitive_
} from "./../../__idol__.js";

export class testsAbsThreeSideImport2 {
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
    return new testsAbsThreeSideImport2(val);
  }

  static unwrap(val) {
    return val;
  }

  get side_import2() {
    return Primitive_.of("int").wrap(this._original["side_import2"]);
  }

  set side_import2(val) {
    this._original["side_import2"] = Primitive_.of("int").unwrap(val);
  }

  get sideImport2() {
    return this.side_import2;
  }

  set sideImport2(val) {
    this.side_import2 = val;
  }
}

Struct_(testsAbsThreeSideImport2, [
  { fieldName: "side_import2", type: Primitive_.of("int"), optional: false }
]);
