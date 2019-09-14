#

from ..__idol__ import Struct as Struct_


class SchemaReference(Struct_):
    @property
    def module_name(self) -> str:
        return str.wrap(self._orig.get("module_name"))

    @module_name.setter
    def module_name(self, v):
        self._orig["module_name"] = str.unwrap(v)

    @property
    def qualified_name(self) -> str:
        return str.wrap(self._orig.get("qualified_name"))

    @qualified_name.setter
    def qualified_name(self, v):
        self._orig["qualified_name"] = str.unwrap(v)

    @property
    def type_name(self) -> str:
        return str.wrap(self._orig.get("type_name"))

    @type_name.setter
    def type_name(self, v):
        self._orig["type_name"] = str.unwrap(v)

    _FIELDS = [
        ["module_name", "module_name", str, {"optional": False}],
        ["qualified_name", "qualified_name", str, {"optional": False}],
        ["type_name", "type_name", str, {"optional": False}],
    ]