#

from ..__idol__ import Struct as Struct_


class SchemaLiteral(Struct_):
    @property
    def bool(self) -> bool:
        return bool.wrap(self._orig.get("bool"))

    @bool.setter
    def bool(self, v):
        self._orig["bool"] = bool.unwrap(v)

    @property
    def double(self) -> float:
        return float.wrap(self._orig.get("double"))

    @double.setter
    def double(self, v):
        self._orig["double"] = float.unwrap(v)

    @property
    def int(self) -> int:
        return int.wrap(self._orig.get("int"))

    @int.setter
    def int(self, v):
        self._orig["int"] = int.unwrap(v)

    @property
    def string(self) -> str:
        return str.wrap(self._orig.get("string"))

    @string.setter
    def string(self, v):
        self._orig["string"] = str.unwrap(v)

    _FIELDS = [
        ["bool", "bool", bool, {"optional": False}],
        ["double", "double", float, {"optional": False}],
        ["int", "int", int, {"optional": False}],
        ["string", "string", str, {"optional": False}],
    ]
