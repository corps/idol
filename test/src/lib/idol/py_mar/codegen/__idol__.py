from typing import Type, Callable, cast

import types

from marshmallow.fields import Function, Field


class Any(Function):
    def __init__(self, *args, **kwds):
        super(Any, self).__init__(lambda i: i, lambda i: i, *args, **kwds)


def wrap_field(
    field: Callable[[], Type[Field]], name: str, *args, **kwds
) -> Type[Field]:
    field = field()
    return cast(
        Type[Field],
        types.new_class(
            name,
            (field,),
            dict(
                __init__=(lambda self, *a, **k: field.__init__(*args, *a, **kwds, **k))
            ),
        ),
    )
