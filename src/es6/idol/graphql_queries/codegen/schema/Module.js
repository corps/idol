// DO NOT EDIT
// This file was generated by idol_graphql_queries, any changes will be overwritten when idol_graphql_queries is run again.;
import { TypeFragment } from "../../schema/Type";
import { gql } from "graphql-tag";

// Metadata contained about a module.;
export const SchemaModuleFragment = gql`
  fragment ModuleFields on Module {
    module_name
    types_by_name {
      ...TypeFields
    }
    types_dependency_ordering
  }
  ${TypeFragment}
`;