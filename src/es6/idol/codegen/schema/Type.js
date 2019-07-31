/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import {
  Struct as Struct_,
  List as List_,
  Map as Map_,
  Primitive as Primitive_
} from "./../__idol__.js";
import { Dependency as schemaDependency } from "./../../schema/Dependency.js";
import { Field as schemaField } from "./../../schema/Field.js";
import { TypeStruct as schemaTypeStruct } from "./../../schema/TypeStruct.js";
import { Reference as schemaReference } from "./../../schema/Reference.js";

export class schemaType {
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
    return new schemaType(val);
  }

  static unwrap(val) {
    return val;
  }

  get dependencies() {
    return List_.of(schemaDependency, { atleastOne: false }).wrap(
      this._original["dependencies"]
    );
  }

  set dependencies(val) {
    this._original["dependencies"] = List_.of(schemaDependency, {
      atleastOne: false
    }).unwrap(val);
  }

  get fields() {
    return Map_.of(schemaField).wrap(this._original["fields"]);
  }

  set fields(val) {
    this._original["fields"] = Map_.of(schemaField).unwrap(val);
  }

  get is_a() {
    return schemaTypeStruct.wrap(this._original["is_a"]);
  }

  set is_a(val) {
    this._original["is_a"] = schemaTypeStruct.unwrap(val);
  }

  get isA() {
    return this.is_a;
  }

  set isA(val) {
    this.is_a = val;
  }

  get named() {
    return schemaReference.wrap(this._original["named"]);
  }

  set named(val) {
    this._original["named"] = schemaReference.unwrap(val);
  }

  get options() {
    return List_.of(Primitive_.of("string"), { atleastOne: false }).wrap(
      this._original["options"]
    );
  }

  set options(val) {
    this._original["options"] = List_.of(Primitive_.of("string"), {
      atleastOne: false
    }).unwrap(val);
  }

  get tags() {
    return List_.of(Primitive_.of("string"), { atleastOne: false }).wrap(
      this._original["tags"]
    );
  }

  set tags(val) {
    this._original["tags"] = List_.of(Primitive_.of("string"), {
      atleastOne: false
    }).unwrap(val);
  }

  get type_vars() {
    return List_.of(Primitive_.of("string"), { atleastOne: false }).wrap(
      this._original["type_vars"]
    );
  }

  set type_vars(val) {
    this._original["type_vars"] = List_.of(Primitive_.of("string"), {
      atleastOne: false
    }).unwrap(val);
  }

  get typeVars() {
    return this.type_vars;
  }

  set typeVars(val) {
    this.type_vars = val;
  }
}

Struct_(schemaType, [
  {
    fieldName: "dependencies",
    type: List_.of(schemaDependency, { atleastOne: false }),
    optional: false
  },
  { fieldName: "fields", type: Map_.of(schemaField), optional: false },
  { fieldName: "is_a", type: schemaTypeStruct, optional: true },
  { fieldName: "named", type: schemaReference, optional: false },
  {
    fieldName: "options",
    type: List_.of(Primitive_.of("string"), { atleastOne: false }),
    optional: false
  },
  {
    fieldName: "tags",
    type: List_.of(Primitive_.of("string"), { atleastOne: false }),
    optional: false
  },
  {
    fieldName: "type_vars",
    type: List_.of(Primitive_.of("string"), { atleastOne: false }),
    optional: false
  }
]);
