/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import {
  Struct as Struct_,
  Map as Map_,
  List as List_,
  Primitive as Primitive_
} from "./../__idol__.js";
import { Type as schemaType } from "./../../schema/Type.js";
import { Dependency as schemaDependency } from "./../../schema/Dependency.js";

export class schemaModule {
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
    return new schemaModule(val);
  }

  static unwrap(val) {
    return val;
  }

  get abstract_types_by_name() {
    return Map_.of(schemaType).wrap(this._original["abstract_types_by_name"]);
  }

  set abstract_types_by_name(val) {
    this._original["abstract_types_by_name"] = Map_.of(schemaType).unwrap(val);
  }

  get abstractTypesByName() {
    return this.abstract_types_by_name;
  }

  set abstractTypesByName(val) {
    this.abstract_types_by_name = val;
  }

  get dependencies() {
    return List_.of(schemaDependency, { atleastOne: false }).wrap(this._original["dependencies"]);
  }

  set dependencies(val) {
    this._original["dependencies"] = List_.of(schemaDependency, {
      atleastOne: false
    }).unwrap(val);
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

  get types_by_name() {
    return Map_.of(schemaType).wrap(this._original["types_by_name"]);
  }

  set types_by_name(val) {
    this._original["types_by_name"] = Map_.of(schemaType).unwrap(val);
  }

  get typesByName() {
    return this.types_by_name;
  }

  set typesByName(val) {
    this.types_by_name = val;
  }

  get types_dependency_ordering() {
    return List_.of(Primitive_.of("string"), { atleastOne: false }).wrap(
      this._original["types_dependency_ordering"]
    );
  }

  set types_dependency_ordering(val) {
    this._original["types_dependency_ordering"] = List_.of(Primitive_.of("string"), {
      atleastOne: false
    }).unwrap(val);
  }

  get typesDependencyOrdering() {
    return this.types_dependency_ordering;
  }

  set typesDependencyOrdering(val) {
    this.types_dependency_ordering = val;
  }
}

Struct_(schemaModule, [
  {
    fieldName: "abstract_types_by_name",
    type: Map_.of(schemaType),
    optional: false
  },
  {
    fieldName: "dependencies",
    type: List_.of(schemaDependency, { atleastOne: false }),
    optional: false
  },
  { fieldName: "module_name", type: Primitive_.of("string"), optional: false },
  { fieldName: "types_by_name", type: Map_.of(schemaType), optional: false },
  {
    fieldName: "types_dependency_ordering",
    type: List_.of(Primitive_.of("string"), { atleastOne: false }),
    optional: false
  }
]);
