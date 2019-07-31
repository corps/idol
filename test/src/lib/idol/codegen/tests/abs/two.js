/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import {
  Struct as Struct_,
  Primitive as Primitive_
} from "./../../__idol__.js";

export class testsAbsTwoSideImport {
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
    return new testsAbsTwoSideImport(val);
  }

  static unwrap(val) {
    return val;
  }

  get side_import() {
    return Primitive_.of("string").wrap(this._original["side_import"]);
  }

  set side_import(val) {
    this._original["side_import"] = Primitive_.of("string").unwrap(val);
  }

  get sideImport() {
    return this.side_import;
  }

  set sideImport(val) {
    this.side_import = val;
  }
}

Struct_(testsAbsTwoSideImport, [
  { fieldName: "side_import", type: Primitive_.of("string"), optional: false }
]);
