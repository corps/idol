// DO NOT EDIT
// This file was generated by idol_graphql_queries, any changes will be overwritten when idol_graphql_queries is run again.;
import { TestsBasicTestListOfListStructFragment } from "../../tests/basic/TestListOfListStruct";
import { TestsBasicTestLiteralStructFragment } from "../../tests/basic/TestLiteralStruct";
import { TestsBasicTestOptionalFieldFragment } from "../../tests/basic/TestOptionalField";
import { TestsBasicTestStructFragment } from "../../tests/basic/TestStruct";
import { AllRequiredTripletOfSideImport2Fragment } from "../required/TripletOfSideImport2";
import gql from "graphql-tag";

export const AllOptionalAssembledFragment = gql`
  fragment AllOptionalAssembledFields on AllOptionalAssembled {
    test_atleast_one
    test_enum
    test_kind
    test_list_of
    test_list_of_list_struct {
      ...TestsBasicTestListOfListStructFields
    }
    test_literal_struct {
      ...TestsBasicTestLiteralStructFields
    }
    test_literal_top
    test_map
    test_optional_field {
      ...TestsBasicTestOptionalFieldFields
    }
    test_struct {
      ...TestsBasicTestStructFields
    }
    test_triplet {
      ...AllRequiredTripletOfSideImport2Fields
    }
  }
  ${TestsBasicTestListOfListStructFragment}
  ${TestsBasicTestLiteralStructFragment}
  ${TestsBasicTestOptionalFieldFragment}
  ${TestsBasicTestStructFragment}
  ${AllRequiredTripletOfSideImport2Fragment}
`;
