# DO NOT EDIT
# This file was generated by idol_py, any changes will be lost when idol_py is rerun again
from ..__idol__ import Struct
from typing import Optional
from ...schema.literal import Literal as ScaffoldLiteral
from ...schema.primitive_type import PrimitiveType as ScaffoldPrimitiveType
from ...schema.reference import Reference as ScaffoldReference
from ...schema.struct_kind import StructKind as ScaffoldStructKind


class SchemaTypeStruct(Struct):
    literal: Optional[ScaffoldLiteral]

    primitive_type: ScaffoldPrimitiveType

    reference: ScaffoldReference

    struct_kind: ScaffoldStructKind

    __field_constructors__ = [
        ("literal", "literal", ScaffoldLiteral, dict(optional=True),),
        (
            "primitive_type",
            "primitive_type",
            ScaffoldPrimitiveType,
            dict(optional=False),
        ),
        ("reference", "reference", ScaffoldReference, dict(optional=False),),
        ("struct_kind", "struct_kind", ScaffoldStructKind, dict(optional=False),),
    ]
