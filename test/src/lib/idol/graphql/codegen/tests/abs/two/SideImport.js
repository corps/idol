/* DO NO EDIT
This file is managed by idol_graphql.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { GraphQLObjectType as GraphQLObjectType_ } from "graphql";
import { GraphQLString as GraphQLString_ } from "./../../../__idolGraphql__.js";

export const testsAbsTwoSideImportFields = {
  side_import: { description: "", type: GraphQLString }
};
export const testsAbsTwoSideImportType = new GraphQLObjectType_({
  name: "SideImport",
  description: "",
  fields: testsAbsTwoSideImportFields
});