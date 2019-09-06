#

from .reference import SchemaReference
from ..__idol__ import Struct as Struct_


class SchemaDependency(Struct_):
    @property
    def from_(self) -> SchemaReference:
        return SchemaReference.wrap(self._orig.get("from"))

    @from_.setter
    def from_(self, v):
        self._orig["from"] = SchemaReference.unwrap(v)

    @property
    def is_abstraction(self) -> bool:
        return bool.wrap(self._orig.get("is_abstraction"))

    @is_abstraction.setter
    def is_abstraction(self, v):
        self._orig["is_abstraction"] = bool.unwrap(v)

    @property
    def is_local(self) -> bool:
        return bool.wrap(self._orig.get("is_local"))

    @is_local.setter
    def is_local(self, v):
        self._orig["is_local"] = bool.unwrap(v)

    @property
    def to(self) -> SchemaReference:
        return SchemaReference.wrap(self._orig.get("to"))

    @to.setter
    def to(self, v):
        self._orig["to"] = SchemaReference.unwrap(v)

    _FIELDS = [
        ["from", "from_", SchemaReference, {"optional": False}],
        ["is_abstraction", "is_abstraction", bool, {"optional": False}],
        ["is_local", "is_local", bool, {"optional": False}],
        ["to", "to", SchemaReference, {"optional": False}],
    ]
