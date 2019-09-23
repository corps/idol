// DO NOT EDIT
// This file was generated by idol_js, any changes will be overwritten when idol_js is run again.;
import { Map, List, Primitive, Struct } from "../__idol__";
import { Type as ScaffoldType } from "../../schema/Type";
import { Dependency as ScaffoldDependency } from "../../schema/Dependency";

// Metadata contained about a module.;
export class SchemaModule {
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

  get abstract_types_by_name() {
    return Map.of(ScaffoldType, {}).wrap(
      this._original["abstract_types_by_name"]
    );
  }
  set abstract_types_by_name(val) {
    this._original["abstract_types_by_name"] = Map.of(ScaffoldType, {}).unwrap(
      val
    );
  }
  get abstractTypesByName() {
    return this.abstract_types_by_name;
  }
  set abstractTypesByName(val) {
    this.abstract_types_by_name = val;
  }

  get dependencies() {
    return List.of(ScaffoldDependency, { atleastOne: false }).wrap(
      this._original["dependencies"]
    );
  }
  set dependencies(val) {
    this._original["dependencies"] = List.of(ScaffoldDependency, {
      atleastOne: false
    }).unwrap(val);
  }

  get module_name() {
    return Primitive.of("string").wrap(this._original["module_name"]);
  }
  set module_name(val) {
    this._original["module_name"] = Primitive.of("string").unwrap(val);
  }
  get moduleName() {
    return this.module_name;
  }
  set moduleName(val) {
    this.module_name = val;
  }

  get types_by_name() {
    return Map.of(ScaffoldType, {}).wrap(this._original["types_by_name"]);
  }
  set types_by_name(val) {
    this._original["types_by_name"] = Map.of(ScaffoldType, {}).unwrap(val);
  }
  get typesByName() {
    return this.types_by_name;
  }
  set typesByName(val) {
    this.types_by_name = val;
  }

  get types_dependency_ordering() {
    return List.of(Primitive.of("string"), { atleastOne: false }).wrap(
      this._original["types_dependency_ordering"]
    );
  }
  set types_dependency_ordering(val) {
    this._original["types_dependency_ordering"] = List.of(
      Primitive.of("string"),
      { atleastOne: false }
    ).unwrap(val);
  }
  get typesDependencyOrdering() {
    return this.types_dependency_ordering;
  }
  set typesDependencyOrdering(val) {
    this.types_dependency_ordering = val;
  }
}

Struct(SchemaModule, [
  {
    fieldName: "abstract_types_by_name",
    type: Map.of(ScaffoldType, {}),
    optional: false
  },
  {
    fieldName: "dependencies",
    type: List.of(ScaffoldDependency, { atleastOne: false }),
    optional: false
  },
  { fieldName: "module_name", type: Primitive.of("string"), optional: false },
  {
    fieldName: "types_by_name",
    type: Map.of(ScaffoldType, {}),
    optional: false
  },
  {
    fieldName: "types_dependency_ordering",
    type: List.of(Primitive.of("string"), { atleastOne: false }),
    optional: false
  }
]);
