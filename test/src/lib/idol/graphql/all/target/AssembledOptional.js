// This file was scaffolded by idol_graphql.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_graphql.;
import { GraphQLObjectType, GraphQLInputObjectType } from "graphql";
import {
  AllOptionalAssembledFields,
  AllOptionalAssembledInputFields
} from "../../codegen/all/optional/Assembled";

export const AssembledOptionalType = new GraphQLObjectType({
  name: "AllOptionalAssembled",
  description: "",
  fields: { ...AllOptionalAssembledFields }
});
export const AssembledOptionalInputType = new GraphQLInputObjectType({
  name: "AllOptionalAssembledInput",
  description: "",
  fields: { ...AllOptionalAssembledInputFields }
});
