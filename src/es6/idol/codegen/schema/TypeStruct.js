/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { Struct as Struct_, List as List_ } from "./../__idol__.js";
import { Literal as schemaLiteral } from "./../../schema/Literal.js";
import { Reference as schemaReference } from "./../../schema/Reference.js";
import { PrimitiveType as schemaPrimitiveType } from "./../../schema/PrimitiveType.js";
import { StructKind as schemaStructKind } from "./../../schema/StructKind.js";

export class schemaTypeStruct {
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
    return new schemaTypeStruct(val);
  }

  static unwrap(val) {
    return val;
  }

  get literal() {
    return schemaLiteral.wrap(this._original["literal"]);
  }

  set literal(val) {
    this._original["literal"] = schemaLiteral.unwrap(val);
  }

  get parameters() {
    return List_.of(schemaReference, { atleastOne: false }).wrap(this._original["parameters"]);
  }

  set parameters(val) {
    this._original["parameters"] = List_.of(schemaReference, {
      atleastOne: false
    }).unwrap(val);
  }

  get primitive_type() {
    return schemaPrimitiveType.wrap(this._original["primitive_type"]);
  }

  set primitive_type(val) {
    this._original["primitive_type"] = schemaPrimitiveType.unwrap(val);
  }

  get primitiveType() {
    return this.primitive_type;
  }

  set primitiveType(val) {
    this.primitive_type = val;
  }

  get reference() {
    return schemaReference.wrap(this._original["reference"]);
  }

  set reference(val) {
    this._original["reference"] = schemaReference.unwrap(val);
  }

  get struct_kind() {
    return schemaStructKind.wrap(this._original["struct_kind"]);
  }

  set struct_kind(val) {
    this._original["struct_kind"] = schemaStructKind.unwrap(val);
  }

  get structKind() {
    return this.struct_kind;
  }

  set structKind(val) {
    this.struct_kind = val;
  }
}

Struct_(schemaTypeStruct, [
  { fieldName: "literal", type: schemaLiteral, optional: true },
  {
    fieldName: "parameters",
    type: List_.of(schemaReference, { atleastOne: false }),
    optional: false
  },
  { fieldName: "primitive_type", type: schemaPrimitiveType, optional: false },
  { fieldName: "reference", type: schemaReference, optional: false },
  { fieldName: "struct_kind", type: schemaStructKind, optional: false }
]);
