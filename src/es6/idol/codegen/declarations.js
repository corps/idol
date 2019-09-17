/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import {
  Primitive as Primitive_,
  List as List_,
  Struct as Struct_,
  Map as Map_
} from "./__idol__.js";

export const declarationsFieldDec = List_.of(Primitive_.of("string"), {
  atleastOne: true
});
export class declarationsTypeDec {
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
    return new declarationsTypeDec(val);
  }

  static unwrap(val) {
    return val;
  }

  get enum() {
    return List_.of(Primitive_.of("string"), { atleastOne: false }).wrap(this._original["enum"]);
  }

  set enum(val) {
    this._original["enum"] = List_.of(Primitive_.of("string"), {
      atleastOne: false
    }).unwrap(val);
  }

  get fields() {
    return Map_.of(declarationsFieldDec).wrap(this._original["fields"]);
  }

  set fields(val) {
    this._original["fields"] = Map_.of(declarationsFieldDec).unwrap(val);
  }

  get is_a() {
    return Primitive_.of("string").wrap(this._original["is_a"]);
  }

  set is_a(val) {
    this._original["is_a"] = Primitive_.of("string").unwrap(val);
  }

  get isA() {
    return this.is_a;
  }

  set isA(val) {
    this.is_a = val;
  }

  get tags() {
    return List_.of(Primitive_.of("string"), { atleastOne: false }).wrap(this._original["tags"]);
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

Struct_(declarationsTypeDec, [
  {
    fieldName: "enum",
    type: List_.of(Primitive_.of("string"), { atleastOne: false }),
    optional: false
  },
  { fieldName: "fields", type: Map_.of(declarationsFieldDec), optional: false },
  { fieldName: "is_a", type: Primitive_.of("string"), optional: false },
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

export const declarationsModuleDec = Map_.of(declarationsTypeDec);
