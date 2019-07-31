/* DO NO EDIT
This file is managed by idol_graphql.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { GraphQLObjectType as GraphQLObjectType_ } from "graphql";
import { testsBasicTestAtleastOneType } from "./../../tests/basic/TestAtleastOne.js";
import { testsBasicTestEnumType } from "./../../tests/basic/TestEnum.js";
import { testsBasicTestKindType } from "./../../tests/basic/TestKind.js";
import { allRequiredListOfTestKindType } from "./../required/ListOfTestKind.js";
import { testsBasicTestListOfListStructType } from "./../../tests/basic/TestListOfListStruct.js";
import { testsBasicTestLiteralStructType } from "./../../tests/basic/TestLiteralStruct.js";
import { testsBasicTestLiteralTopType } from "./../../tests/basic/TestLiteralTop.js";
import { testsBasicTestMapType } from "./../../tests/basic/TestMap.js";
import { testsBasicTestOptionalFieldType } from "./../../tests/basic/TestOptionalField.js";
import { testsBasicTestStructType } from "./../../tests/basic/TestStruct.js";
import { allRequiredTripletOfSideImport2Type } from "./../required/TripletOfSideImport2.js";

export const allOptionalAssembledFields = {
  test_atleast_one: { description: "", type: testsBasicTestAtleastOneType },
  test_enum: { description: "", type: testsBasicTestEnumType },
  test_kind: { description: "", type: testsBasicTestKindType },
  test_list_of: { description: "", type: allRequiredListOfTestKindType },
  test_list_of_list_struct: {
    description: "",
    type: testsBasicTestListOfListStructType
  },
  test_literal_struct: {
    description: "",
    type: testsBasicTestLiteralStructType
  },
  test_literal_top: { description: "", type: testsBasicTestLiteralTopType },
  test_map: { description: "", type: testsBasicTestMapType },
  test_optional_field: {
    description: "",
    type: testsBasicTestOptionalFieldType
  },
  test_struct: { description: "", type: testsBasicTestStructType },
  test_triplet: { description: "", type: allRequiredTripletOfSideImport2Type }
};
export const allOptionalAssembledType = new GraphQLObjectType_({
  name: "Assembled",
  description: "",
  fields: allOptionalAssembledFields
});
