# DO NOT EDIT
# This file was generated by idol_py, any changes will be lost when idol_py is rerun again
from ...__idol__ import Struct, List, Map
from ...tests.abs.three.side_import2 import (
    TestsAbsThreeSideImport2 as CodegenTestsAbsThreeSideImport2,
)
from typing import MutableSequence, MutableMapping
from ...tests.basic.test_literal_top import (
    TestsBasicTestLiteralTop as CodegenTestsBasicTestLiteralTop,
)
from ...tests.basic.test_struct import (
    TestsBasicTestStruct as CodegenTestsBasicTestStruct,
)


class AllRequiredTripletOfSideImport2(Struct):
    a: CodegenTestsAbsThreeSideImport2

    b: MutableSequence[CodegenTestsBasicTestLiteralTop]

    c: MutableMapping[str, CodegenTestsBasicTestStruct]

    __field_constructors__ = [
        ("a", "a", CodegenTestsAbsThreeSideImport2, dict(optional=False)),
        (
            "b",
            "b",
            List.of(CodegenTestsBasicTestLiteralTop, dict(atleast_one=False)),
            dict(optional=False),
        ),
        (
            "c",
            "c",
            Map.of(CodegenTestsBasicTestStruct, dict(atleast_one=False)),
            dict(optional=False),
        ),
    ]
