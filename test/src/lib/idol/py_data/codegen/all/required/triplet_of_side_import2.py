# DO NOT EDIT
# This file was generated by idol_data, any changes will be lost when idol_data is rerun again
from ...tests.abs.three.side_import2 import TestsAbsThreeSideImport2Dataclass
from dataclasses import field, dataclass
from typing import List, Mapping
from ...tests.basic.test_literal_top import TestLiteralTop
from ...tests.basic.test_struct import TestsBasicTestStructDataclass


@dataclass
class AllRequiredTripletOfSideImport2Dataclass(object):
    a: TestsAbsThreeSideImport2Dataclass = field(
        default_factory=TestsAbsThreeSideImport2Dataclass
    )
    b: List[TestLiteralTop] = field(default_factory=list)
    c: Mapping[str, TestsBasicTestStructDataclass] = field(default_factory=dict)