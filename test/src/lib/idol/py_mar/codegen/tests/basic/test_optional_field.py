# DO NOT EDIT
# This file was generated by idol_mar, any changes will be lost when idol_mar is rerun again
from marshmallow import Schema
from marshmallow.fields import String, Nested
from ...__idol__ import wrap_field


class TestsBasicTestOptionalFieldSchema(Schema):
    optional = String(dump_to="optional", load_from="optional", allow_none=True)


TestsBasicTestOptionalFieldField = wrap_field(
    Nested,
    "TestsBasicTestOptionalFieldField",
    (lambda: TestsBasicTestOptionalFieldSchema),
)