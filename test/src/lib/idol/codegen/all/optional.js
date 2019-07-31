/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { Struct as Struct_ } from "./../__idol__.js";
import {
  testsBasicTestAtleastOne,
  testsBasicTestEnum,
  testsBasicTestKind,
  testsBasicTestListOfListStruct,
  testsBasicTestLiteralStruct,
  testsBasicTestLiteralTop,
  testsBasicTestMap,
  testsBasicTestOptionalField,
  testsBasicTestStruct
} from "./../tests/basic.js";
import {
  allRequiredListOfTestKind,
  allRequiredTripletOfSideImport2
} from "./required.js";

export class allOptionalAssembled {
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
    return new allOptionalAssembled(val);
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

Struct_(allOptionalAssembled, [
  {
    fieldName: "test_atleast_one",
    type: testsBasicTestAtleastOne,
    optional: true
  },
  { fieldName: "test_enum", type: testsBasicTestEnum, optional: true },
  { fieldName: "test_kind", type: testsBasicTestKind, optional: true },
  {
    fieldName: "test_list_of",
    type: allRequiredListOfTestKind,
    optional: true
  },
  {
    fieldName: "test_list_of_list_struct",
    type: testsBasicTestListOfListStruct,
    optional: true
  },
  {
    fieldName: "test_literal_struct",
    type: testsBasicTestLiteralStruct,
    optional: true
  },
  {
    fieldName: "test_literal_top",
    type: testsBasicTestLiteralTop,
    optional: true
  },
  { fieldName: "test_map", type: testsBasicTestMap, optional: true },
  {
    fieldName: "test_optional_field",
    type: testsBasicTestOptionalField,
    optional: true
  },
  { fieldName: "test_struct", type: testsBasicTestStruct, optional: true },
  {
    fieldName: "test_triplet",
    type: allRequiredTripletOfSideImport2,
    optional: true
  }
]);
