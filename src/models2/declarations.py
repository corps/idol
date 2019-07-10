from src.models.__idol__ import Struct as _Struct, List as _List, Map as _Map, Optional as _Optional, Enum as _Enum, Any as _Any, Literal as _Literal

__all__ = [
    "FieldDec",
    "TypeDec",
    "ModuleDec",
]


FieldDec = _List[str]


class TypeDec(_Struct):
    enum: _List[str]
    fields: _Map[FieldDec]
    is_a: str
    tags: _List[str]


ModuleDec = _Map[TypeDec]
