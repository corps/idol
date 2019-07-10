from src.models.__idol__ import Struct as _Struct, List as _List, Map as _Map, Optional as _Optional, Enum as _Enum, Any as _Any, Literal as _Literal

__all__ = [
    "StructKind",
    "Reference",
    "PrimitiveType",
    "TypeStruct",
    "Field",
    "Type",
    "Dependency",
    "Module",
]


class StructKind(_Enum):
    Map = "Map"
    Repeated = "Repeated"
    Scalar = "Scalar"


class Reference(_Struct):
    module_name: str
    qualified_name: str
    type_name: str


class PrimitiveType(_Enum):
    any = "any"
    bool = "bool"
    double = "double"
    int53 = "int53"
    int64 = "int64"
    string = "string"


class TypeStruct(_Struct):
    is_literal: bool
    literal_bool: bool
    literal_double: float
    literal_int53: int
    literal_int64: int
    literal_string: str
    primitive_type: PrimitiveType
    reference: Reference
    struct_kind: StructKind


class Field(_Struct):
    field_name: str
    tags: _List[str]
    type_struct: TypeStruct


class Type(_Struct):
    fields: _Map[Field]
    is_a: TypeStruct
    options: _List[str]
    tags: _List[str]
    type_name: str


class Dependency(_Struct):
    from_: Reference
    is_local: bool
    to: Reference


class Module(_Struct):
    dependencies: _List[Dependency]
    module_name: str
    types_by_name: _Map[Type]
    types_dependency_ordering: _List[str]
