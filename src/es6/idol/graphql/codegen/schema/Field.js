// DO NOT EDIT
// This file was generated by idol_graphql, any changes will be overwritten when idol_graphql is run again.
import { GraphQLString, GraphQLList } from "graphql";
import { TypeStructType as ScaffoldTypeStructType } from "../../schema/TypeStruct";

export const SchemaFieldFields = {
  field_name: { type: GraphQLString, description: "" },
  tags: { type: new GraphQLList(GraphQLString), description: "" },
  type_struct: { type: ScaffoldTypeStructType, description: "" }
};
