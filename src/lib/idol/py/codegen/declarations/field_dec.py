#

from ..__idol__ import List as List_, Primitive as Primitive_
from types import new_class

DeclarationsFieldDec = List_[str]
locals()["DeclarationsFieldDec"] = new_class(
    "DeclarationsFieldDec", (locals()["DeclarationsFieldDec"],), dict(inner_class=str)
)
