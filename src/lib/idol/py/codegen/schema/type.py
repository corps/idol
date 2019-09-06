#

from .dependency import SchemaDependency
from ..__idol__ import List as List_, Map as Map_, Struct as Struct_
from types import new_class
from .field import SchemaField
from .type_struct import SchemaTypeStruct
from .reference import SchemaReference


class SchemaType(Struct_):
    @property
    def dependencies(self) -> List_[SchemaDependency]:
        return List_[SchemaDependency].wrap(self._orig.get("dependencies"))

    @dependencies.setter
    def dependencies(self, v):
        self._orig["dependencies"] = List_[SchemaDependency].unwrap(v)

    @property
    def fields(self) -> Map_[SchemaField]:
        return Map_[SchemaField].wrap(self._orig.get("fields"))

    @fields.setter
    def fields(self, v):
        self._orig["fields"] = Map_[SchemaField].unwrap(v)

    @property
    def is_a(self) -> SchemaTypeStruct:
        return SchemaTypeStruct.wrap(self._orig.get("is_a"))

    @is_a.setter
    def is_a(self, v):
        self._orig["is_a"] = SchemaTypeStruct.unwrap(v)

    @property
    def named(self) -> SchemaReference:
        return SchemaReference.wrap(self._orig.get("named"))

    @named.setter
    def named(self, v):
        self._orig["named"] = SchemaReference.unwrap(v)

    @property
    def options(self) -> List_[str]:
        return List_[str].wrap(self._orig.get("options"))

    @options.setter
    def options(self, v):
        self._orig["options"] = List_[str].unwrap(v)

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
        ["dependencies", "dependencies", List_[SchemaDependency], {"optional": False}],
        ["fields", "fields", Map_[SchemaField], {"optional": False}],
        ["is_a", "is_a", SchemaTypeStruct, {"optional": True}],
        ["named", "named", SchemaReference, {"optional": False}],
        ["options", "options", List_[str], {"optional": False}],
        ["tags", "tags", List_[str], {"optional": False}],
        ["type_vars", "type_vars", List_[str], {"optional": False}],
    ]
