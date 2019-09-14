#

from ..__idol__ import List as List_, Map as Map_, Struct as Struct_
from types import new_class
from .field_dec import DeclarationsFieldDec


class DeclarationsTypeDec(Struct_):
    @property
    def enum(self) -> List_[str]:
        return List_[str].wrap(self._orig.get("enum"))

    @enum.setter
    def enum(self, v):
        self._orig["enum"] = List_[str].unwrap(v)

    @property
    def fields(self) -> Map_[DeclarationsFieldDec]:
        return Map_[DeclarationsFieldDec].wrap(self._orig.get("fields"))

    @fields.setter
    def fields(self, v):
        self._orig["fields"] = Map_[DeclarationsFieldDec].unwrap(v)

    @property
    def is_a(self) -> str:
        return str.wrap(self._orig.get("is_a"))

    @is_a.setter
    def is_a(self, v):
        self._orig["is_a"] = str.unwrap(v)

    @property
    def tags(self) -> List_[str]:
        return List_[str].wrap(self._orig.get("tags"))

    @tags.setter
    def tags(self, v):
        self._orig["tags"] = List_[str].unwrap(v)

    @property
    def type_vars(self) -> List_[str]:
        return List_[str].wrap(self._orig.get("type_vars"))

    @type_vars.setter
    def type_vars(self, v):
        self._orig["type_vars"] = List_[str].unwrap(v)

    _FIELDS = [
        ["enum", "enum", List_[str], {"optional": False}],
        ["fields", "fields", Map_[DeclarationsFieldDec], {"optional": False}],
        ["is_a", "is_a", str, {"optional": False}],
        ["tags", "tags", List_[str], {"optional": False}],
        ["type_vars", "type_vars", List_[str], {"optional": False}],
    ]