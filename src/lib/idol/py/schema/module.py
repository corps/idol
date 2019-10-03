from idol.functional import OrderedObj
from ..codegen.schema.module import SchemaModule
from .type import Type


class Module(SchemaModule):
    def types_as_ordered_obj(self) -> OrderedObj[Type]:
        return OrderedObj.from_iterable(
            OrderedObj({t.named.qualified_name: t})
            for n in self.types_dependency_ordering
            for t in [self.types_by_name[n]]
        )
