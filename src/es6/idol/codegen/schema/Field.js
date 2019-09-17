/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { Struct as Struct_, Primitive as Primitive_, List as List_ } from "./../__idol__.js";
import { TypeStruct as schemaTypeStruct } from "./../../schema/TypeStruct.js";

export class schemaField {
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
    return new schemaField(val);
  }

  static unwrap(val) {
    return val;
  }

  get field_name() {
    return Primitive_.of("string").wrap(this._original["field_name"]);
  }

  set field_name(val) {
    this._original["field_name"] = Primitive_.of("string").unwrap(val);
  }

  get fieldName() {
    return this.field_name;
  }

  set fieldName(val) {
    this.field_name = val;
  }

  get tags() {
    return List_.of(Primitive_.of("string"), { atleastOne: false }).wrap(this._original["tags"]);
  }

  set tags(val) {
    this._original["tags"] = List_.of(Primitive_.of("string"), {
      atleastOne: false
    }).unwrap(val);
  }

  get type_struct() {
    return schemaTypeStruct.wrap(this._original["type_struct"]);
  }

  set type_struct(val) {
    this._original["type_struct"] = schemaTypeStruct.unwrap(val);
  }

  get typeStruct() {
    return this.type_struct;
  }

  set typeStruct(val) {
    this.type_struct = val;
  }
}

Struct_(schemaField, [
  { fieldName: "field_name", type: Primitive_.of("string"), optional: false },
  {
    fieldName: "tags",
    type: List_.of(Primitive_.of("string"), { atleastOne: false }),
    optional: false
  },
  { fieldName: "type_struct", type: schemaTypeStruct, optional: false }
]);
