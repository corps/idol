// DO NOT EDIT
// This file was generated by idol_js, any changes will be overwritten when idol_js is run again.;
import { Map, List, Primitive, Struct } from "../__idol__";
import { Field as ScaffoldField } from "../../schema/Field";
import { TypeStruct as ScaffoldTypeStruct } from "../../schema/TypeStruct";
import { Reference as ScaffoldReference } from "../../schema/Reference";

// A wrapper type containing fields that can describe a Type, as well as its tag metadata.;
export class SchemaType {
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

  // When this type is a struct, each of its fields and the type of that field is included
  // Exclusive with is_a and options
  get fields() {
    return Map.of(ScaffoldField, {}).wrap(this._original["fields"]);
  }
  set fields(val) {
    this._original["fields"] = Map.of(ScaffoldField, {}).unwrap(val);
  }

  // Set when this is type is an alias or simply an type expression (such as a generic).
  // Exclusive with having values for options or fields.
  get is_a() {
    return ScaffoldTypeStruct.wrap(this._original["is_a"]);
  }
  set is_a(val) {
    this._original["is_a"] = ScaffoldTypeStruct.unwrap(val);
  }
  get isA() {
    return this.is_a;
  }
  set isA(val) {
    this.is_a = val;
  }

  // The name and module information of this type's definition.
  get named() {
    return ScaffoldReference.wrap(this._original["named"]);
  }
  set named(val) {
    this._original["named"] = ScaffoldReference.unwrap(val);
  }

  // When this type is an enum includes the string values for each enum entry.  Note that each
  // target language may have different rules for the enum constant names, but these entries are
  // canonical resident values.
  // Exclusive with is_a and fields.
  get options() {
    return List.of(Primitive.of("string"), { atleastOne: false }).wrap(this._original["options"]);
  }
  set options(val) {
    this._original["options"] = List.of(Primitive.of("string"), {
      atleastOne: false
    }).unwrap(val);
  }

  // General metadata given to a type.  Currently, atleast_one for Repeated types is supported.
  // Custom codegen can use these tags to implement semantic types on top of simple logic types.
  // In general, however, tags are considred optional and should not be required to
  // deserialize \/ serializeconsume correct logical values.
  get tags() {
    return List.of(Primitive.of("string"), { atleastOne: false }).wrap(this._original["tags"]);
  }
  set tags(val) {
    this._original["tags"] = List.of(Primitive.of("string"), {
      atleastOne: false
    }).unwrap(val);
  }
}

Struct(SchemaType, [
  { fieldName: "fields", type: Map.of(ScaffoldField, {}), optional: false },
  { fieldName: "is_a", type: ScaffoldTypeStruct, optional: true },
  { fieldName: "named", type: ScaffoldReference, optional: false },
  {
    fieldName: "options",
    type: List.of(Primitive.of("string"), { atleastOne: false }),
    optional: false
  },
  {
    fieldName: "tags",
    type: List.of(Primitive.of("string"), { atleastOne: false }),
    optional: false
  }
]);
