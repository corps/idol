from idol.__idol__ import Struct as _Struct, List as _List, Map as _Map, Optional as _Optional, Enum as _Enum, Any as _Any, Literal as _Literal
import json
import idol.schema
# DO NOT EDIT THIS FILE
# This file is generated via idol_py.py.  You can either subclass these types
# in your own module file or update the relevant model.toml file and regenerate.

__all__ = [
    "StructKind",
    "PrimitiveType",
    "Reference",
    "TypeStruct",
    "Field",
    "Type",
    "Dependency",
    "Module",
]


class StructKind(_Enum):
    Map = 'Map'
    Repeated = 'Repeated'
    Scalar = 'Scalar'


class PrimitiveType(_Enum):
    any = 'any'
    bool = 'bool'
    double = 'double'
    int53 = 'int53'
    int64 = 'int64'
    string = 'string'


class Reference(_Struct):
    module_name: str
    qualified_name: str
    type_name: str
    
    # Required to ensure stable ordering.  str() on python dicts is unstable,
    # but the json.dumps is stable.
    __metadata__ = json.loads('{"fields": {"module_name": {"field_name": "module_name", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "qualified_name": {"field_name": "qualified_name", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "type_name": {"field_name": "type_name", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}}, "is_a": null, "options": [], "tags": [], "type_name": "Reference"}')


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
    
    # Required to ensure stable ordering.  str() on python dicts is unstable,
    # but the json.dumps is stable.
    __metadata__ = json.loads('{"fields": {"is_literal": {"field_name": "is_literal", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "bool", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "literal_bool": {"field_name": "literal_bool", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "bool", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "literal_double": {"field_name": "literal_double", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "double", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "literal_int53": {"field_name": "literal_int53", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "literal_int64": {"field_name": "literal_int64", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int64", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "literal_string": {"field_name": "literal_string", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "primitive_type": {"field_name": "primitive_type", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "schema", "qualified_name": "schema.PrimitiveType", "type_name": "PrimitiveType"}, "struct_kind": "Scalar"}}, "reference": {"field_name": "reference", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "schema", "qualified_name": "schema.Reference", "type_name": "Reference"}, "struct_kind": "Scalar"}}, "struct_kind": {"field_name": "struct_kind", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "schema", "qualified_name": "schema.StructKind", "type_name": "StructKind"}, "struct_kind": "Scalar"}}}, "is_a": null, "options": [], "tags": [], "type_name": "TypeStruct"}')


class Field(_Struct):
    field_name: str
    tags: _List[str]
    type_struct: TypeStruct
    
    # Required to ensure stable ordering.  str() on python dicts is unstable,
    # but the json.dumps is stable.
    __metadata__ = json.loads('{"fields": {"field_name": {"field_name": "field_name", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "tags": {"field_name": "tags", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Repeated"}}, "type_struct": {"field_name": "type_struct", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "schema", "qualified_name": "schema.TypeStruct", "type_name": "TypeStruct"}, "struct_kind": "Scalar"}}}, "is_a": null, "options": [], "tags": [], "type_name": "Field"}')


class Type(_Struct):
    fields: _Map[Field]
    is_a: TypeStruct
    options: _List[str]
    tags: _List[str]
    type_name: str
    
    # Required to ensure stable ordering.  str() on python dicts is unstable,
    # but the json.dumps is stable.
    __metadata__ = json.loads('{"fields": {"fields": {"field_name": "fields", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "schema", "qualified_name": "schema.Field", "type_name": "Field"}, "struct_kind": "Map"}}, "is_a": {"field_name": "is_a", "tags": ["optional"], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "schema", "qualified_name": "schema.TypeStruct", "type_name": "TypeStruct"}, "struct_kind": "Scalar"}}, "options": {"field_name": "options", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Repeated"}}, "tags": {"field_name": "tags", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Repeated"}}, "type_name": {"field_name": "type_name", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}}, "is_a": null, "options": [], "tags": [], "type_name": "Type"}')


class Dependency(_Struct):
    from_: Reference
    is_local: bool
    to: Reference
    
    # Required to ensure stable ordering.  str() on python dicts is unstable,
    # but the json.dumps is stable.
    __metadata__ = json.loads('{"fields": {"from": {"field_name": "from", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "schema", "qualified_name": "schema.Reference", "type_name": "Reference"}, "struct_kind": "Scalar"}}, "is_local": {"field_name": "is_local", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "bool", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "to": {"field_name": "to", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "schema", "qualified_name": "schema.Reference", "type_name": "Reference"}, "struct_kind": "Scalar"}}}, "is_a": null, "options": [], "tags": [], "type_name": "Dependency"}')


class Module(_Struct):
    dependencies: _List[Dependency]
    module_name: str
    types_by_name: _Map[Type]
    types_dependency_ordering: _List[str]
    
    # Required to ensure stable ordering.  str() on python dicts is unstable,
    # but the json.dumps is stable.
    __metadata__ = json.loads('{"fields": {"dependencies": {"field_name": "dependencies", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "schema", "qualified_name": "schema.Dependency", "type_name": "Dependency"}, "struct_kind": "Repeated"}}, "module_name": {"field_name": "module_name", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Scalar"}}, "types_by_name": {"field_name": "types_by_name", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "int53", "reference": {"module_name": "schema", "qualified_name": "schema.Type", "type_name": "Type"}, "struct_kind": "Map"}}, "types_dependency_ordering": {"field_name": "types_dependency_ordering", "tags": [], "type_struct": {"is_literal": false, "literal_bool": false, "literal_double": 0.0, "literal_int53": 0, "literal_int64": 0, "literal_string": "", "primitive_type": "string", "reference": {"module_name": "", "qualified_name": "", "type_name": ""}, "struct_kind": "Repeated"}}}, "is_a": null, "options": [], "tags": [], "type_name": "Module"}')
