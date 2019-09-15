from ..codegen.schema.type import SchemaType


class Type(SchemaType):
    @property
    def is_enum(self):
        return bool(len(self.options))
