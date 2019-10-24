from idol.py.schema.struct_kind import StructKind
from .primitive_type import PrimitiveType
from ..codegen.schema.type_struct import SchemaTypeStruct


class TypeStruct(SchemaTypeStruct):
    @property
    def is_primitive(self):
        return not bool(self.reference.qualified_name)

    @property
    def is_reference(self):
        return not self.is_primitive

    @property
    def is_literal(self):
        return bool(self.literal)

    @property
    def is_alias(self):
        return bool(self.reference.type_name)

    @property
    def literal_value(self):
        if self.primitive_type == PrimitiveType.BOOL:
            return self.literal.bool
        elif self.primitive_type == PrimitiveType.DOUBLE:
            return self.literal.double
        elif self.primitive_type == PrimitiveType.INT:
            return self.literal.int
        elif self.primitive_type == PrimitiveType.STRING:
            return self.literal.string

    @property
    def type_display_name(self) -> str:
        result: str = self.primitive_type.value

        if self.struct_kind == StructKind.REPEATED:
            result += "[]"
        if self.struct_kind == StructKind.MAP:
            result += "{}"

        return result
