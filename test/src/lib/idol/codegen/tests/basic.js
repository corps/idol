/* DO NO EDIT
This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import {
  Enum as Enum_,
  Literal as Literal_,
  Struct as Struct_,
  Primitive as Primitive_,
  List as List_,
  Map as Map_
} from "./../__idol__.js";

export const testsBasicTestEnum = {
  A: "a",
  B: "b",
  C: "c",

  options: ["a", "b", "c"],
  default: "a",

  validate(val) {},

  isValid(val) {
    return true;
  },

  expand(val) {
    return val;
  },

  wrap(val) {
    return val;
  },

  unwrap(val) {
    return val;
  }
};
Enum_(testsBasicTestEnum);

export const testsBasicTestLiteralTop = Literal_.of("mooo");
export class testsBasicTestOptionalField {
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
    return new testsBasicTestOptionalField(val);
  }

  static unwrap(val) {
    return val;
  }

  get optional() {
    return Primitive_.of("string").wrap(this._original["optional"]);
  }

  set optional(val) {
    this._original["optional"] = Primitive_.of("string").unwrap(val);
  }
}

Struct_(testsBasicTestOptionalField, [
  { fieldName: "optional", type: Primitive_.of("string"), optional: true }
]);

export class testsBasicTestTagsStruct {
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
    return new testsBasicTestTagsStruct(val);
  }

  static unwrap(val) {
    return val;
  }

  get a() {
    return Primitive_.of("int").wrap(this._original["a"]);
  }

  set a(val) {
    this._original["a"] = Primitive_.of("int").unwrap(val);
  }
}

Struct_(testsBasicTestTagsStruct, [
  { fieldName: "a", type: Primitive_.of("int"), optional: false }
]);

export class testsBasicTestStructInner {
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
    return new testsBasicTestStructInner(val);
  }

  static unwrap(val) {
    return val;
  }

  get d() {
    return Primitive_.of("bool").wrap(this._original["d"]);
  }

  set d(val) {
    this._original["d"] = Primitive_.of("bool").unwrap(val);
  }

  get e() {
    return Primitive_.of("double").wrap(this._original["e"]);
  }

  set e(val) {
    this._original["e"] = Primitive_.of("double").unwrap(val);
  }

  get f() {
    return Primitive_.of("int").wrap(this._original["f"]);
  }

  set f(val) {
    this._original["f"] = Primitive_.of("int").unwrap(val);
  }
}

Struct_(testsBasicTestStructInner, [
  { fieldName: "d", type: Primitive_.of("bool"), optional: false },
  { fieldName: "e", type: Primitive_.of("double"), optional: false },
  { fieldName: "f", type: Primitive_.of("int"), optional: false }
]);

export class testsBasicTestStruct {
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
    return new testsBasicTestStruct(val);
  }

  static unwrap(val) {
    return val;
  }

  get a() {
    return Primitive_.of("string").wrap(this._original["a"]);
  }

  set a(val) {
    this._original["a"] = Primitive_.of("string").unwrap(val);
  }

  get b() {
    return Primitive_.of("int").wrap(this._original["b"]);
  }

  set b(val) {
    this._original["b"] = Primitive_.of("int").unwrap(val);
  }

  get c() {
    return testsBasicTestStructInner.wrap(this._original["c"]);
  }

  set c(val) {
    this._original["c"] = testsBasicTestStructInner.unwrap(val);
  }
}

Struct_(testsBasicTestStruct, [
  { fieldName: "a", type: Primitive_.of("string"), optional: false },
  { fieldName: "b", type: Primitive_.of("int"), optional: false },
  { fieldName: "c", type: testsBasicTestStructInner, optional: false }
]);

export const testsBasicTestKind = Primitive_.of("string");
export const testsBasicTestAtleastOne = List_.of(testsBasicTestKind, {
  atleastOne: true
});
export const testsBasicTestMap = Map_.of(testsBasicTestAtleastOne);
export const testsBasicLiteralHello = Literal_.of("hello");
export const testsBasicLiteralThreeO = Literal_.of(3);
export const testsBasicLiteral1 = Literal_.of(1);
export const testsBasicLiteralTrue = Literal_.of(true);
export const testsBasicLiteralFive = Literal_.of(5);
export class testsBasicTestLiteralStruct {
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
    return new testsBasicTestLiteralStruct(val);
  }

  static unwrap(val) {
    return val;
  }

  get five() {
    return testsBasicLiteralFive.wrap(this._original["five"]);
  }

  set five(val) {
    this._original["five"] = testsBasicLiteralFive.unwrap(val);
  }

  get four() {
    return testsBasicLiteralTrue.wrap(this._original["four"]);
  }

  set four(val) {
    this._original["four"] = testsBasicLiteralTrue.unwrap(val);
  }

  get one() {
    return testsBasicLiteral1.wrap(this._original["one"]);
  }

  set one(val) {
    this._original["one"] = testsBasicLiteral1.unwrap(val);
  }

  get three() {
    return testsBasicLiteralThreeO.wrap(this._original["three"]);
  }

  set three(val) {
    this._original["three"] = testsBasicLiteralThreeO.unwrap(val);
  }

  get two() {
    return testsBasicLiteralHello.wrap(this._original["two"]);
  }

  set two(val) {
    this._original["two"] = testsBasicLiteralHello.unwrap(val);
  }
}

Struct_(testsBasicTestLiteralStruct, [
  { fieldName: "five", type: testsBasicLiteralFive, optional: true },
  { fieldName: "four", type: testsBasicLiteralTrue, optional: false },
  { fieldName: "one", type: testsBasicLiteral1, optional: false },
  { fieldName: "three", type: testsBasicLiteralThreeO, optional: false },
  { fieldName: "two", type: testsBasicLiteralHello, optional: false }
]);

export class testsBasicTestListOfListStruct {
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
    return new testsBasicTestListOfListStruct(val);
  }

  static unwrap(val) {
    return val;
  }

  get list_of_list() {
    return List_.of(testsBasicTestAtleastOne, { atleastOne: false }).wrap(
      this._original["list_of_list"]
    );
  }

  set list_of_list(val) {
    this._original["list_of_list"] = List_.of(testsBasicTestAtleastOne, {
      atleastOne: false
    }).unwrap(val);
  }

  get listOfList() {
    return this.list_of_list;
  }

  set listOfList(val) {
    this.list_of_list = val;
  }
}

Struct_(testsBasicTestListOfListStruct, [
  {
    fieldName: "list_of_list",
    type: List_.of(testsBasicTestAtleastOne, { atleastOne: false }),
    optional: false
  }
]);
