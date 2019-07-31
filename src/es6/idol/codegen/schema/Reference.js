/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { Struct as Struct_, Primitive as Primitive_ } from "./../__idol__.js";

export class schemaReference {
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
    return new schemaReference(val);
  }

  static unwrap(val) {
    return val;
  }

  get module_name() {
    return Primitive_.of("string").wrap(this._original["module_name"]);
  }

  set module_name(val) {
    this._original["module_name"] = Primitive_.of("string").unwrap(val);
  }

  get moduleName() {
    return this.module_name;
  }

  set moduleName(val) {
    this.module_name = val;
  }

  get qualified_name() {
    return Primitive_.of("string").wrap(this._original["qualified_name"]);
  }

  set qualified_name(val) {
    this._original["qualified_name"] = Primitive_.of("string").unwrap(val);
  }

  get qualifiedName() {
    return this.qualified_name;
  }

  set qualifiedName(val) {
    this.qualified_name = val;
  }

  get type_name() {
    return Primitive_.of("string").wrap(this._original["type_name"]);
  }

  set type_name(val) {
    this._original["type_name"] = Primitive_.of("string").unwrap(val);
  }

  get typeName() {
    return this.type_name;
  }

  set typeName(val) {
    this.type_name = val;
  }
}

Struct_(schemaReference, [
  { fieldName: "module_name", type: Primitive_.of("string"), optional: false },
  {
    fieldName: "qualified_name",
    type: Primitive_.of("string"),
    optional: false
  },
  { fieldName: "type_name", type: Primitive_.of("string"), optional: false }
]);
