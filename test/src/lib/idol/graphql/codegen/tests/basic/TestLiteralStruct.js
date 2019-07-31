/* DO NO EDIT
This file is managed by idol_graphql.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { GraphQLObjectType as GraphQLObjectType_ } from "graphql";
import { testsBasicLiteralFiveType } from "./LiteralFive.js";
import { testsBasicLiteralTrueType } from "./LiteralTrue.js";
import { testsBasicLiteral1Type } from "./Literal1.js";
import { testsBasicLiteralThreeOType } from "./LiteralThreeO.js";
import { testsBasicLiteralHelloType } from "./LiteralHello.js";

export const testsBasicTestLiteralStructFields = {
  five: { description: "", type: testsBasicLiteralFiveType },
  four: { description: "", type: testsBasicLiteralTrueType },
  one: { description: "", type: testsBasicLiteral1Type },
  three: { description: "", type: testsBasicLiteralThreeOType },
  two: { description: "", type: testsBasicLiteralHelloType }
};
export const testsBasicTestLiteralStructType = new GraphQLObjectType_({
  name: "TestLiteralStruct",
  description: "",
  fields: testsBasicTestLiteralStructFields
});
