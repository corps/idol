# DO NOT EDIT
# This file was generated by idol_py, any changes will be lost when idol_py is rerun again
from ...__idol__ import Struct
from ....all.target.assembled_optional import (
    AssembledOptional as ScaffoldAssembledOptional,
)


class AllTargetOptionalParams(Struct):
    optional: ScaffoldAssembledOptional

    __field_constructors__ = [
        ("optional", "optional", ScaffoldAssembledOptional, dict(optional=False),)
    ]
