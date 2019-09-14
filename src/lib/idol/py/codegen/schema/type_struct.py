# DO NOT EDIT
# This file was generated by idol_py, any changes will be lost when idol_py is rerun again
from ..__idol__ import Struct, List as List_
from ...schema.literal import Literal as ScaffoldLiteral
from ...schema.reference import Reference as ScaffoldReference
from typing import List
from ...schema.primitive_type import PrimitiveType as ScaffoldPrimitiveType
from ...schema.struct_kind import StructKind as ScaffoldStructKind

SchemaTypeStruct = ScaffoldLiteral
SchemaTypeStruct = ScaffoldReference
SchemaTypeStruct = ScaffoldPrimitiveType
SchemaTypeStruct = ScaffoldReference
SchemaTypeStruct = ScaffoldStructKind


class SchemaTypeStruct(Struct):
    literal: SchemaTypeStruct_
    parameters: List[SchemaTypeStruct_]
    primitive_type: SchemaTypeStruct_
    reference: SchemaTypeStruct_
    struct_kind: SchemaTypeStruct_
    __field_constructors__ = []
