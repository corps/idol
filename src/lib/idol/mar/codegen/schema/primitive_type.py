# DO NOT EDIT
# This file was generated by idol_mar, any changes will be lost when idol_mar is rerun again
from enum import Enum
from ..__idol__ import wrap_field
from marshmallow_enum import EnumField

SchemaPrimitiveTypeSchema = None


class SchemaPrimitiveTypeEnum(Enum):
    INT = "int"
    DOUBLE = "double"
    STRING = "string"
    BOOL = "bool"
    ANY = "any"


SchemaPrimitiveTypeField = wrap_field(
    EnumField,
    "SchemaPrimitiveTypeField",
    (lambda: SchemaPrimitiveTypeEnum),
    by_value=True,
)