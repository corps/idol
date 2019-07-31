/* DO NO EDIT
This file is managed by idol_graphql.js.  Any edits will be overwritten on next run of the generator.
Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there. */
import { GraphQLEnumType as GraphQLEnumType_ } from "graphql";
import { wrapValues as wrapValues_ } from "./../../__idolGraphql__.js";

export const testsBasicTestEnum = { A: "a", B: "b", C: "c" };
export const testsBasicTestEnumType = new GraphQLEnumType_(
  wrapValues_(testsBasicTestEnum)
);
