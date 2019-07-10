from src.models.__idol__ import Struct, List, Map, Optional, Enum, Any

__all__ = [
    'PrimitiveType',
    'StructKind',
    'Reference',
    'Dependency',
    'TypeStruct',
    'Type',
    'Module',
    'Field'
]


class PrimitiveType(Enum):
    int53 = 'int53'
    int64 = 'int64'
    double = 'double'
    string = 'string'
    bool = 'bool'
    any = 'any'


class StructKind(Enum):
    Scalar = 'Scalar'
    Repeated = 'Repeated'
    Map = 'Map'


class Reference(Struct):
    module_name: str
    qualified_name: str
    type_name: str


class Dependency(Struct):
    from_: Reference
    to: Reference
    is_local: bool


class TypeStruct(Struct):
    is_literal: bool
    literal_bool: bool
    literal_double: float
    literal_int53: int
    literal_int64: int
    literal_string: str
    primitive_type: PrimitiveType
    reference: Reference
    struct_kind: StructKind


class Field(Struct):
    field_name: str
    type_struct: TypeStruct
    tags: List[str]


class Type(Struct):
    fields: Map[Field]
    is_a: Optional[TypeStruct]
    options: List[str]
    tags: List[str]
    type_name: str


class Module(Struct):
    dependencies: List[Dependency]
    module_name: str
    types_by_name: Map[Type]
    types_dependency_ordering: List[str]
