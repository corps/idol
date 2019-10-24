# DO NOT EDIT
# This file was generated by idol_mar, any changes will be lost when idol_mar is rerun again
from marshmallow import Schema
from marshmallow.fields import Boolean, Float, Int, String, Nested
from importlib import import_module
from ..__idol__ import wrap_field


class SchemaLiteralSchema(Schema):
    bool = Boolean(dump_to="bool", load_from="bool")
    double = Float(dump_to="double", load_from="double")
    int = Int(dump_to="int", load_from="int")
    string = String(dump_to="string", load_from="string")


SchemaLiteralField = wrap_field(
    Nested,
    "SchemaLiteralField",
    (lambda: import_module("...schema.literal", __package__).Literal),
)
