/* DO NO EDIT
This file is managed by idol_graphql.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { GraphQLObjectType as GraphQLObjectType_ } from "graphql";
import {
  GraphQLBoolean as GraphQLBoolean_,
  GraphQLFloat as GraphQLFloat_,
  GraphQLInt as GraphQLInt_
} from "./../../__idolGraphql__.js";

export const testsBasicTestStructInnerFields = {
  d: { description: "", type: GraphQLBoolean },
  e: { description: "", type: GraphQLFloat },
  f: { description: "", type: GraphQLInt }
};
export const testsBasicTestStructInnerType = new GraphQLObjectType_({
  name: "TestStructInner",
  description: "",
  fields: testsBasicTestStructInnerFields
});
