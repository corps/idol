// DO NOT EDIT
// This file was generated by idol_graphql, any changes will be overwritten when idol_graphql is run again.;
import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLInputObjectType
} from "graphql";
import {
  TestsBasicTestAtleastOneType as CodegenTestsBasicTestAtleastOneType,
  TestsBasicTestAtleastOneInputType as CodegenTestsBasicTestAtleastOneInputType
} from "./TestAtleastOne";

export const TestsBasicTestListOfListStructFields = {
  list_of_list: {
    type: new GraphQLList(CodegenTestsBasicTestAtleastOneType),
    description: ""
  }
};
export const TestsBasicTestListOfListStructType = new GraphQLObjectType({
  name: "TestsBasicTestListOfListStruct",
  description: "",
  fields: { ...TestsBasicTestListOfListStructFields }
});
export const TestsBasicTestListOfListStructInputFields = {
  list_of_list: {
    type: new GraphQLList(CodegenTestsBasicTestAtleastOneInputType),
    description: ""
  }
};
export const TestsBasicTestListOfListStructInputType = new GraphQLInputObjectType(
  {
    name: "TestsBasicTestListOfListStructInput",
    description: "",
    fields: { ...TestsBasicTestListOfListStructInputFields }
  }
);