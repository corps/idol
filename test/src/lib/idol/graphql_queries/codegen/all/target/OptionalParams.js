// DO NOT EDIT
// This file was generated by idol_graphql_queries, any changes will be overwritten when idol_graphql_queries is run again.
import { AssembledOptionalFragment } from "../../../all/target/AssembledOptional";
import gql from "graphql-tag";

export const AllTargetOptionalParamsFragment = gql`
  fragment OptionalParamsFields on OptionalParams {
    optional {
      ...AllOptionalAssembledFields
    }
  }
  ${AssembledOptionalFragment}
`;
