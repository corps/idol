# DO NOT EDIT
# This file was generated by idol_data, any changes will be lost when idol_data is rerun again
from dataclasses import field, dataclass
from ...tests.basic.test_atleast_one import TestAtleastOne
from ...tests.basic.test_enum import TestsBasicTestEnumEnum
from ...tests.basic.test_kind import TestKind
from .list_of_test_kind import ListOfTestKind
from ...tests.basic.test_list_of_list_struct import (
    TestsBasicTestListOfListStructDataclass,
)
from ...tests.basic.test_literal_struct import TestsBasicTestLiteralStructDataclass
from ...tests.basic.test_literal_top import TestLiteralTop
from ...tests.basic.test_map import TestMap
from ...tests.basic.test_optional_field import TestsBasicTestOptionalFieldDataclass
from ...tests.basic.test_struct import TestsBasicTestStructDataclass
from .triplet_of_side_import2 import AllRequiredTripletOfSideImport2Dataclass


@dataclass
class AllRequiredAssembledDataclass(object):
    test_atleast_one: TestAtleastOne = field(default_factory=list)
    test_enum: TestsBasicTestEnumEnum = field(
        default_factory=(lambda: next(iter(TestsBasicTestEnumEnum)))
    )
    test_kind: TestKind = field(default_factory=(lambda: ""))
    test_list_of: ListOfTestKind = field(default_factory=list)
    test_list_of_list_struct: TestsBasicTestListOfListStructDataclass = field(
        default_factory=TestsBasicTestListOfListStructDataclass
    )
    test_literal_struct: TestsBasicTestLiteralStructDataclass = field(
        default_factory=TestsBasicTestLiteralStructDataclass
    )
    test_literal_top: TestLiteralTop = field(default_factory=(lambda: "mooo"))
    test_map: TestMap = field(default_factory=dict)
    test_optional_field: TestsBasicTestOptionalFieldDataclass = field(
        default_factory=TestsBasicTestOptionalFieldDataclass
    )
    test_struct: TestsBasicTestStructDataclass = field(
        default_factory=TestsBasicTestStructDataclass
    )
    test_triplet: AllRequiredTripletOfSideImport2Dataclass = field(
        default_factory=AllRequiredTripletOfSideImport2Dataclass
    )