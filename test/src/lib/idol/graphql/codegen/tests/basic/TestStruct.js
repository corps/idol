/* DO NO EDIT
This file is managed by idol_graphql.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { GraphQLObjectType as GraphQLObjectType_ } from "graphql";
import {
  GraphQLString as GraphQLString_,
  GraphQLInt as GraphQLInt_
} from "./../../__idolGraphql__.js";
import { testsBasicTestStructInnerType } from "./TestStructInner.js";

export const testsBasicTestStructFields = {
  a: { description: "", type: GraphQLString },
  b: { description: "", type: GraphQLInt },
  c: { description: "", type: testsBasicTestStructInnerType }
};
export const testsBasicTestStructType = new GraphQLObjectType_({
  name: "TestStruct",
  description: "",
  fields: testsBasicTestStructFields
});
