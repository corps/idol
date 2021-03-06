# DO NOT EDIT
# This file was generated by idol_py, any changes will be lost when idol_py is rerun again
from ..__idol__ import Struct, Primitive, List
from typing import MutableSequence
from ...schema.type_struct import TypeStruct as ScaffoldTypeStruct


class SchemaField(Struct):
    field_name: str

    tags: MutableSequence[str]

    type_struct: ScaffoldTypeStruct

    __field_constructors__ = [
        ("field_name", "field_name", Primitive.of(str), dict(optional=False),),
        (
            "tags",
            "tags",
            List.of(Primitive.of(str), dict(atleast_one=False)),
            dict(optional=False),
        ),
        ("type_struct", "type_struct", ScaffoldTypeStruct, dict(optional=False),),
    ]
