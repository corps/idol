// DO NOT EDIT
// This file was generated by idol_graphql_queries, any changes will be overwritten when idol_graphql_queries is run again.;
import { TypeStructFragment } from "../../schema/TypeStruct";
import gql from "graphql-tag";

export const SchemaFieldFragment = gql`
  fragment SchemaFieldFields on SchemaField {
    field_name
    tags
    type_struct {
      ...TypeStructFields
    }
  }
  ${TypeStructFragment}
`;
