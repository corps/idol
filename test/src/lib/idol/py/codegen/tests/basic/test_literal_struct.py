# DO NOT EDIT
# This file was generated by idol_py, any changes will be lost when idol_py is rerun again
from ...__idol__ import Struct
from typing import Optional
from .literal_five import TestsBasicLiteralFive as CodegenTestsBasicLiteralFive
from .literal_true import TestsBasicLiteralTrue as CodegenTestsBasicLiteralTrue
from .literal1 import TestsBasicLiteral1 as CodegenTestsBasicLiteral1
from .literal_three_o import TestsBasicLiteralThreeO as CodegenTestsBasicLiteralThreeO
from .literal_hello import TestsBasicLiteralHello as CodegenTestsBasicLiteralHello


class TestsBasicTestLiteralStruct(Struct):
    five: Optional[CodegenTestsBasicLiteralFive]

    four: CodegenTestsBasicLiteralTrue

    one: CodegenTestsBasicLiteral1

    three: CodegenTestsBasicLiteralThreeO

    two: CodegenTestsBasicLiteralHello

    __field_constructors__ = [
        ("five", "five", CodegenTestsBasicLiteralFive, dict(optional=True),),
        ("four", "four", CodegenTestsBasicLiteralTrue, dict(optional=False),),
        ("one", "one", CodegenTestsBasicLiteral1, dict(optional=False),),
        ("three", "three", CodegenTestsBasicLiteralThreeO, dict(optional=False),),
        ("two", "two", CodegenTestsBasicLiteralHello, dict(optional=False),),
    ]
