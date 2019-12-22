from typing import Type, Callable, cast

import types

from marshmallow.fields import Function, Field


class Any(Function):
    def __init__(self, *args, **kwds):
        super(Any, self).__init__(lambda i: i, lambda i: i, *args, **kwds)


def wrap_field(field: Type[Field], name: str, *args, **kwds) -> Type[Field]:
    def wrapped_init(self, *a, **k):
        field.__init__(self, *list(arg() for arg in args), *a, **kwds, **k)

    new_class = types.new_class(
        name, (field,), exec_body=lambda class_dict: class_dict.update(__init__=wrapped_init)
    )

    return cast(Type[Field], new_class)
