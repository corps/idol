from idol.__idol__ import Struct as _Struct, List as _List, Map as _Map, Optional as _Optional, Enum as _Enum, Any as _Any, Literal as _Literal

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
    
    __metadata__ = {'fields': {'enum': {'field_name': 'enum', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Repeated'}}, 'is_a': {'field_name': 'is_a', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Scalar'}}, 'fields': {'field_name': 'fields', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'int53', 'reference': {'module_name': 'declarations', 'qualified_name': 'declarations.FieldDec', 'type_name': 'FieldDec'}, 'struct_kind': 'Map'}}, 'tags': {'field_name': 'tags', 'tags': [], 'type_struct': {'is_literal': False, 'literal_bool': False, 'literal_double': 0.0, 'literal_int53': 0, 'literal_int64': 0, 'literal_string': '', 'primitive_type': 'string', 'reference': {'module_name': '', 'qualified_name': '', 'type_name': ''}, 'struct_kind': 'Repeated'}}}, 'is_a': None, 'options': [], 'tags': [], 'type_name': 'TypeDec'}


ModuleDec = _Map[TypeDec]
