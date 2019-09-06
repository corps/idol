#

from ..__idol__ import List as List_, Struct as Struct_
from types import new_class
from .type_struct import SchemaTypeStruct


class SchemaField(Struct_):
    @property
    def field_name(self) -> str:
        return str.wrap(self._orig.get("field_name"))

    @field_name.setter
    def field_name(self, v):
        self._orig["field_name"] = str.unwrap(v)

    @property
    def tags(self) -> List_[str]:
        return List_[str].wrap(self._orig.get("tags"))

    @tags.setter
    def tags(self, v):
        self._orig["tags"] = List_[str].unwrap(v)

    @property
    def type_struct(self) -> SchemaTypeStruct:
        return SchemaTypeStruct.wrap(self._orig.get("type_struct"))

    @type_struct.setter
    def type_struct(self, v):
        self._orig["type_struct"] = SchemaTypeStruct.unwrap(v)

    _FIELDS = [
        ["field_name", "field_name", str, {"optional": False}],
        ["tags", "tags", List_[str], {"optional": False}],
        ["type_struct", "type_struct", SchemaTypeStruct, {"optional": False}],
    ]
