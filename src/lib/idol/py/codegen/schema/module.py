#

from .type import SchemaType
from ..__idol__ import List as List_, Map as Map_, Struct as Struct_
from types import new_class
from .dependency import SchemaDependency


class SchemaModule(Struct_):
    @property
    def abstract_types_by_name(self) -> Map_[SchemaType]:
        return Map_[SchemaType].wrap(self._orig.get("abstract_types_by_name"))

    @abstract_types_by_name.setter
    def abstract_types_by_name(self, v):
        self._orig["abstract_types_by_name"] = Map_[SchemaType].unwrap(v)

    @property
    def dependencies(self) -> List_[SchemaDependency]:
        return List_[SchemaDependency].wrap(self._orig.get("dependencies"))

    @dependencies.setter
    def dependencies(self, v):
        self._orig["dependencies"] = List_[SchemaDependency].unwrap(v)

    @property
    def module_name(self) -> str:
        return str.wrap(self._orig.get("module_name"))

    @module_name.setter
    def module_name(self, v):
        self._orig["module_name"] = str.unwrap(v)

    @property
    def types_by_name(self) -> Map_[SchemaType]:
        return Map_[SchemaType].wrap(self._orig.get("types_by_name"))

    @types_by_name.setter
    def types_by_name(self, v):
        self._orig["types_by_name"] = Map_[SchemaType].unwrap(v)

    @property
    def types_dependency_ordering(self) -> List_[str]:
        return List_[str].wrap(self._orig.get("types_dependency_ordering"))

    @types_dependency_ordering.setter
    def types_dependency_ordering(self, v):
        self._orig["types_dependency_ordering"] = List_[str].unwrap(v)

    _FIELDS = [
        [
            "abstract_types_by_name",
            "abstract_types_by_name",
            Map_[SchemaType],
            {"optional": False},
        ],
        ["dependencies", "dependencies", List_[SchemaDependency], {"optional": False}],
        ["module_name", "module_name", str, {"optional": False}],
        ["types_by_name", "types_by_name", Map_[SchemaType], {"optional": False}],
        [
            "types_dependency_ordering",
            "types_dependency_ordering",
            List_[str],
            {"optional": False},
        ],
    ]
