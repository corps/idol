#

from .literal import SchemaLiteral
from .reference import SchemaReference
from ..__idol__ import List as List_, Struct as Struct_
from types import new_class
from .primitive_type import SchemaPrimitiveType
from .struct_kind import SchemaStructKind


class SchemaTypeStruct(Struct_):
    @property
    def literal(self) -> SchemaLiteral:
        return SchemaLiteral.wrap(self._orig.get("literal"))

    @literal.setter
    def literal(self, v):
        self._orig["literal"] = SchemaLiteral.unwrap(v)

    @property
    def parameters(self) -> List_[SchemaReference]:
        return List_[SchemaReference].wrap(self._orig.get("parameters"))

    @parameters.setter
    def parameters(self, v):
        self._orig["parameters"] = List_[SchemaReference].unwrap(v)

    @property
    def primitive_type(self) -> SchemaPrimitiveType:
        return SchemaPrimitiveType.wrap(self._orig.get("primitive_type"))

    @primitive_type.setter
    def primitive_type(self, v):
        self._orig["primitive_type"] = SchemaPrimitiveType.unwrap(v)

    @property
    def reference(self) -> SchemaReference:
        return SchemaReference.wrap(self._orig.get("reference"))

    @reference.setter
    def reference(self, v):
        self._orig["reference"] = SchemaReference.unwrap(v)

    @property
    def struct_kind(self) -> SchemaStructKind:
        return SchemaStructKind.wrap(self._orig.get("struct_kind"))

    @struct_kind.setter
    def struct_kind(self, v):
        self._orig["struct_kind"] = SchemaStructKind.unwrap(v)

    _FIELDS = [
        ["literal", "literal", SchemaLiteral, {"optional": True}],
        ["parameters", "parameters", List_[SchemaReference], {"optional": False}],
        ["primitive_type", "primitive_type", SchemaPrimitiveType, {"optional": False}],
        ["reference", "reference", SchemaReference, {"optional": False}],
        ["struct_kind", "struct_kind", SchemaStructKind, {"optional": False}],
    ]
