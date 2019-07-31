/* DO NO EDIT
This file is managed by idol_graphql.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import {
  GraphQLObjectType as GraphQLObjectType_,
  GraphQLList as GraphQLList_
} from "graphql";
import { testsBasicTestAtleastOneType } from "./TestAtleastOne.js";

export const testsBasicTestListOfListStructFields = {
  list_of_list: {
    description: "",
    type: new GraphQLList_(testsBasicTestAtleastOneType)
  }
};
export const testsBasicTestListOfListStructType = new GraphQLObjectType_({
  name: "TestListOfListStruct",
  description: "",
  fields: testsBasicTestListOfListStructFields
});
