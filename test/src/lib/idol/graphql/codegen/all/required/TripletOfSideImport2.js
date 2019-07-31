/* DO NO EDIT
This file is managed by idol_graphql.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import {
  GraphQLObjectType as GraphQLObjectType_,
  GraphQLList as GraphQLList_
} from "graphql";
import { testsAbsThreeSideImport2Type } from "./../../tests/abs/three/SideImport2.js";
import { testsBasicTestLiteralTopType } from "./../../tests/basic/TestLiteralTop.js";
import { testsBasicTestStructType } from "./../../tests/basic/TestStruct.js";
import { testsAbsTwoSideImportType } from "./../../tests/abs/two/SideImport.js";

export const allRequiredTripletOfSideImport2Fields = {
  a: { description: "", type: testsAbsThreeSideImport2Type },
  b: { description: "", type: new GraphQLList_(testsBasicTestLiteralTopType) },
  c: { description: "", type: Anything },
  side_import: { description: "", type: testsAbsTwoSideImportType }
};
export const allRequiredTripletOfSideImport2Type = new GraphQLObjectType_({
  name: "TripletOfSideImport2",
  description: "",
  fields: allRequiredTripletOfSideImport2Fields
});
