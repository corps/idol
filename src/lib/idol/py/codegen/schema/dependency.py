# DO NOT EDIT
# This file was generated by idol_py, any changes will be lost when idol_py is rerun again
from ..__idol__ import Struct
from ...schema.reference import Reference as ScaffoldReference

SchemaDependency = ScaffoldReference
SchemaDependency = ScaffoldReference


class SchemaDependency(Struct):
    from_: SchemaDependency_
    is_abstraction: bool
    is_local: bool
    to: SchemaDependency_
    __field_constructors__ = []
