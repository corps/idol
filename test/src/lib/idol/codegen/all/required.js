/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import {
  Struct as Struct_,
  List as List_,
  Map as Map_
} from "./../__idol__.js";
import { testsAbsThreeSideImport2 } from "./../tests/abs/three.js";
import {
  testsBasicTestLiteralTop,
  testsBasicTestStruct,
  testsBasicTestKind,
  testsBasicTestAtleastOne,
  testsBasicTestEnum,
  testsBasicTestListOfListStruct,
  testsBasicTestLiteralStruct,
  testsBasicTestMap,
  testsBasicTestOptionalField
} from "./../tests/basic.js";
import { testsAbsTwoSideImport } from "./../tests/abs/two.js";

export class allRequiredTripletOfSideImport2 {
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
    return new allRequiredTripletOfSideImport2(val);
  }

  static unwrap(val) {
    return val;
  }

  get a() {
    return testsAbsThreeSideImport2.wrap(this._original["a"]);
  }

  set a(val) {
    this._original["a"] = testsAbsThreeSideImport2.unwrap(val);
  }

  get b() {
    return List_.of(testsBasicTestLiteralTop, { atleastOne: false }).wrap(
      this._original["b"]
    );
  }

  set b(val) {
    this._original["b"] = List_.of(testsBasicTestLiteralTop, {
      atleastOne: false
    }).unwrap(val);
  }

  get c() {
    return Map_.of(testsBasicTestStruct).wrap(this._original["c"]);
  }

  set c(val) {
    this._original["c"] = Map_.of(testsBasicTestStruct).unwrap(val);
  }

  get side_import() {
    return testsAbsTwoSideImport.wrap(this._original["side_import"]);
  }

  set side_import(val) {
    this._original["side_import"] = testsAbsTwoSideImport.unwrap(val);
  }

  get sideImport() {
    return this.side_import;
  }

  set sideImport(val) {
    this.side_import = val;
  }
}

Struct_(allRequiredTripletOfSideImport2, [
  { fieldName: "a", type: testsAbsThreeSideImport2, optional: false },
  {
    fieldName: "b",
    type: List_.of(testsBasicTestLiteralTop, { atleastOne: false }),
    optional: false
  },
  { fieldName: "c", type: Map_.of(testsBasicTestStruct), optional: false },
  { fieldName: "side_import", type: testsAbsTwoSideImport, optional: false }
]);

export const allRequiredListOfTestKind = List_.of(testsBasicTestKind, {
  atleastOne: true
});
export class allRequiredAssembled {
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
    return new allRequiredAssembled(val);
  }

  static unwrap(val) {
    return val;
  }

  get test_atleast_one() {
    return testsBasicTestAtleastOne.wrap(this._original["test_atleast_one"]);
  }

  set test_atleast_one(val) {
    this._original["test_atleast_one"] = testsBasicTestAtleastOne.unwrap(val);
  }

  get testAtleastOne() {
    return this.test_atleast_one;
  }

  set testAtleastOne(val) {
    this.test_atleast_one = val;
  }

  get test_enum() {
    return testsBasicTestEnum.wrap(this._original["test_enum"]);
  }

  set test_enum(val) {
    this._original["test_enum"] = testsBasicTestEnum.unwrap(val);
  }

  get testEnum() {
    return this.test_enum;
  }

  set testEnum(val) {
    this.test_enum = val;
  }

  get test_kind() {
    return testsBasicTestKind.wrap(this._original["test_kind"]);
  }

  set test_kind(val) {
    this._original["test_kind"] = testsBasicTestKind.unwrap(val);
  }

  get testKind() {
    return this.test_kind;
  }

  set testKind(val) {
    this.test_kind = val;
  }

  get test_list_of() {
    return allRequiredListOfTestKind.wrap(this._original["test_list_of"]);
  }

  set test_list_of(val) {
    this._original["test_list_of"] = allRequiredListOfTestKind.unwrap(val);
  }

  get testListOf() {
    return this.test_list_of;
  }

  set testListOf(val) {
    this.test_list_of = val;
  }

  get test_list_of_list_struct() {
    return testsBasicTestListOfListStruct.wrap(
      this._original["test_list_of_list_struct"]
    );
  }

  set test_list_of_list_struct(val) {
    this._original[
      "test_list_of_list_struct"
    ] = testsBasicTestListOfListStruct.unwrap(val);
  }

  get testListOfListStruct() {
    return this.test_list_of_list_struct;
  }

  set testListOfListStruct(val) {
    this.test_list_of_list_struct = val;
  }

  get test_literal_struct() {
    return testsBasicTestLiteralStruct.wrap(
      this._original["test_literal_struct"]
    );
  }

  set test_literal_struct(val) {
    this._original["test_literal_struct"] = testsBasicTestLiteralStruct.unwrap(
      val
    );
  }

  get testLiteralStruct() {
    return this.test_literal_struct;
  }

  set testLiteralStruct(val) {
    this.test_literal_struct = val;
  }

  get test_literal_top() {
    return testsBasicTestLiteralTop.wrap(this._original["test_literal_top"]);
  }

  set test_literal_top(val) {
    this._original["test_literal_top"] = testsBasicTestLiteralTop.unwrap(val);
  }

  get testLiteralTop() {
    return this.test_literal_top;
  }

  set testLiteralTop(val) {
    this.test_literal_top = val;
  }

  get test_map() {
    return testsBasicTestMap.wrap(this._original["test_map"]);
  }

  set test_map(val) {
    this._original["test_map"] = testsBasicTestMap.unwrap(val);
  }

  get testMap() {
    return this.test_map;
  }

  set testMap(val) {
    this.test_map = val;
  }

  get test_optional_field() {
    return testsBasicTestOptionalField.wrap(
      this._original["test_optional_field"]
    );
  }

  set test_optional_field(val) {
    this._original["test_optional_field"] = testsBasicTestOptionalField.unwrap(
      val
    );
  }

  get testOptionalField() {
    return this.test_optional_field;
  }

  set testOptionalField(val) {
    this.test_optional_field = val;
  }

  get test_struct() {
    return testsBasicTestStruct.wrap(this._original["test_struct"]);
  }

  set test_struct(val) {
    this._original["test_struct"] = testsBasicTestStruct.unwrap(val);
  }

  get testStruct() {
    return this.test_struct;
  }

  set testStruct(val) {
    this.test_struct = val;
  }

  get test_triplet() {
    return allRequiredTripletOfSideImport2.wrap(this._original["test_triplet"]);
  }

  set test_triplet(val) {
    this._original["test_triplet"] = allRequiredTripletOfSideImport2.unwrap(
      val
    );
  }

  get testTriplet() {
    return this.test_triplet;
  }

  set testTriplet(val) {
    this.test_triplet = val;
  }
}

Struct_(allRequiredAssembled, [
  {
    fieldName: "test_atleast_one",
    type: testsBasicTestAtleastOne,
    optional: false
  },
  { fieldName: "test_enum", type: testsBasicTestEnum, optional: false },
  { fieldName: "test_kind", type: testsBasicTestKind, optional: false },
  {
    fieldName: "test_list_of",
    type: allRequiredListOfTestKind,
    optional: false
  },
  {
    fieldName: "test_list_of_list_struct",
    type: testsBasicTestListOfListStruct,
    optional: false
  },
  {
    fieldName: "test_literal_struct",
    type: testsBasicTestLiteralStruct,
    optional: false
  },
  {
    fieldName: "test_literal_top",
    type: testsBasicTestLiteralTop,
    optional: false
  },
  { fieldName: "test_map", type: testsBasicTestMap, optional: false },
  {
    fieldName: "test_optional_field",
    type: testsBasicTestOptionalField,
    optional: false
  },
  { fieldName: "test_struct", type: testsBasicTestStruct, optional: false },
  {
    fieldName: "test_triplet",
    type: allRequiredTripletOfSideImport2,
    optional: false
  }
]);
