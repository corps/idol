from idol.__idol__ import Struct as _Struct, List as _List, Map as _Map, Optional as _Optional, Enum as _Enum, Any as _Any, Literal as _Literal

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
    
    __metadata__ = {'fields': {'type_name': {'field_name': 'type_name', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'qualified_name': {'field_name': 'qualified_name', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'module_name': {'field_name': 'module_name', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}}, 'is_a': None, 'options': [], 'tags': [], 'type_name': 'Reference'}


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
    
    __metadata__ = {'fields': {'reference': {'field_name': 'reference', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'schema', 'qualified_name': 'schema.Reference', 'type_name': 'Reference'}, 'struct_kind': 'Scalar'}}, 'literal_string': {'field_name': 'literal_string', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'literal_double': {'field_name': 'literal_double', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'double', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'is_literal': {'field_name': 'is_literal', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'bool', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'literal_bool': {'field_name': 'literal_bool', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'bool', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'literal_int53': {'field_name': 'literal_int53', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'struct_kind': {'field_name': 'struct_kind', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'schema', 'qualified_name': 'schema.StructKind', 'type_name': 'StructKind'}, 'struct_kind': 'Scalar'}}, 'literal_int64': {'field_name': 'literal_int64', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int64', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'primitive_type': {'field_name': 'primitive_type', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'schema', 'qualified_name': 'schema.PrimitiveType', 'type_name': 'PrimitiveType'}, 'struct_kind': 'Scalar'}}}, 'is_a': None, 'options': [], 'tags': [], 'type_name': 'TypeStruct'}


class Field(_Struct):
    field_name: str
    tags: _List[str]
    type_struct: TypeStruct
    
    __metadata__ = {'fields': {'type_struct': {'field_name': 'type_struct', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'schema', 'qualified_name': 'schema.TypeStruct', 'type_name': 'TypeStruct'}, 'struct_kind': 'Scalar'}}, 'field_name': {'field_name': 'field_name', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'tags': {'field_name': 'tags', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Repeated'}}}, 'is_a': None, 'options': [], 'tags': [], 'type_name': 'Field'}


class Type(_Struct):
    fields: _Map[Field]
    is_a: TypeStruct
    options: _List[str]
    tags: _List[str]
    type_name: str
    
    __metadata__ = {'fields': {'tags': {'field_name': 'tags', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Repeated'}}, 'options': {'field_name': 'options', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Repeated'}}, 'type_name': {'field_name': 'type_name', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'fields': {'field_name': 'fields', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'schema', 'qualified_name': 'schema.Field', 'type_name': 'Field'}, 'struct_kind': 'Map'}}, 'is_a': {'field_name': 'is_a', 'tags': ['optional'], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'schema', 'qualified_name': 'schema.TypeStruct', 'type_name': 'TypeStruct'}, 'struct_kind': 'Scalar'}}}, 'is_a': None, 'options': [], 'tags': [], 'type_name': 'Type'}


class Dependency(_Struct):
    from_: Reference
    is_local: bool
    to: Reference
    
    __metadata__ = {'fields': {'to': {'field_name': 'to', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'schema', 'qualified_name': 'schema.Reference', 'type_name': 'Reference'}, 'struct_kind': 'Scalar'}}, 'is_local': {'field_name': 'is_local', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'bool', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'from': {'field_name': 'from', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'schema', 'qualified_name': 'schema.Reference', 'type_name': 'Reference'}, 'struct_kind': 'Scalar'}}}, 'is_a': None, 'options': [], 'tags': [], 'type_name': 'Dependency'}


class Module(_Struct):
    dependencies: _List[Dependency]
    module_name: str
    types_by_name: _Map[Type]
    types_dependency_ordering: _List[str]
    
    __metadata__ = {'fields': {'module_name': {'field_name': 'module_name', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'types_by_name': {'field_name': 'types_by_name', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'schema', 'qualified_name': 'schema.Type', 'type_name': 'Type'}, 'struct_kind': 'Map'}}, 'types_dependency_ordering': {'field_name': 'types_dependency_ordering', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Repeated'}}, 'dependencies': {'field_name': 'dependencies', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'schema', 'qualified_name': 'schema.Dependency', 'type_name': 'Dependency'}, 'struct_kind': 'Repeated'}}}, 'is_a': None, 'options': [], 'tags': [], 'type_name': 'Module'}
