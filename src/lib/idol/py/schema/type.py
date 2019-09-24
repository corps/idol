import json
from typing import Iterable
from ..codegen.schema.type import SchemaType


class Type(SchemaType):
    @property
    def is_enum(self):
        return bool(len(self.options))

    def with_tags(self, tags: Iterable[str]) -> "Type":
        new = Type(json.loads(json.dumps(SchemaType.unwrap(self))))
        new.tags = list(tags)
        return new
