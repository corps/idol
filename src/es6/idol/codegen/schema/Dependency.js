/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { Struct as Struct_, Primitive as Primitive_ } from "./../__idol__.js";
import { Reference as schemaReference } from "./../../schema/Reference.js";

export class schemaDependency {
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
    return new schemaDependency(val);
  }

  static unwrap(val) {
    return val;
  }

  get from() {
    return schemaReference.wrap(this._original["from"]);
  }

  set from(val) {
    this._original["from"] = schemaReference.unwrap(val);
  }

  get is_abstraction() {
    return Primitive_.of("bool").wrap(this._original["is_abstraction"]);
  }

  set is_abstraction(val) {
    this._original["is_abstraction"] = Primitive_.of("bool").unwrap(val);
  }

  get isAbstraction() {
    return this.is_abstraction;
  }

  set isAbstraction(val) {
    this.is_abstraction = val;
  }

  get is_local() {
    return Primitive_.of("bool").wrap(this._original["is_local"]);
  }

  set is_local(val) {
    this._original["is_local"] = Primitive_.of("bool").unwrap(val);
  }

  get isLocal() {
    return this.is_local;
  }

  set isLocal(val) {
    this.is_local = val;
  }

  get to() {
    return schemaReference.wrap(this._original["to"]);
  }

  set to(val) {
    this._original["to"] = schemaReference.unwrap(val);
  }
}

Struct_(schemaDependency, [
  { fieldName: "from", type: schemaReference, optional: false },
  { fieldName: "is_abstraction", type: Primitive_.of("bool"), optional: false },
  { fieldName: "is_local", type: Primitive_.of("bool"), optional: false },
  { fieldName: "to", type: schemaReference, optional: false }
]);
