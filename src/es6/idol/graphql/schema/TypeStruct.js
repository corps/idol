// This file was scaffolded by idol_graphql.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_graphql.;
import { GraphQLObjectType } from "graphql";
import { SchemaTypeStructFields } from "../codegen/schema/TypeStruct";

export const TypeStructType = new GraphQLObjectType({
  name: "TypeStruct",
  description: "",
  fields: { ...SchemaTypeStructFields }
});