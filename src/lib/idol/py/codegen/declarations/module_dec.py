#

from .type_dec import DeclarationsTypeDec
from ..__idol__ import Map as Map_
from types import new_class

DeclarationsModuleDec = Map_[DeclarationsTypeDec]
locals()["DeclarationsModuleDec"] = new_class(
    "DeclarationsModuleDec",
    (locals()["DeclarationsModuleDec"],),
    dict(inner_class=DeclarationsTypeDec),
)
