# DO NOT EDIT
# This file was generated by idol_py, any changes will be lost when idol_py is rerun again
from ..__idol__ import Struct, List as List_, Map, Primitive
from typing import List, Dict
from ...schema.dependency import Dependency as ScaffoldDependency
from ...schema.field import Field as ScaffoldField
from ...schema.type_struct import TypeStruct as ScaffoldTypeStruct
from ...schema.reference import Reference as ScaffoldReference


class SchemaType(Struct):
    dependencies: List[ScaffoldDependency]
    fields: Dict[str, ScaffoldField]
    is_a: ScaffoldTypeStruct
    named: ScaffoldReference
    options: List[str]
    tags: List[str]
    type_vars: List[str]
    __field_constructors__ = [
        ("dependencies", "dependencies", List_.of(ScaffoldDependency)),
        ("fields", "fields", Map.of(ScaffoldField)),
        ("is_a", "is_a", ScaffoldTypeStruct),
        ("named", "named", ScaffoldReference),
        ("options", "options", List_.of(Primitive(str))),
        ("tags", "tags", List_.of(Primitive(str))),
        ("type_vars", "type_vars", List_.of(Primitive(str))),
    ]
