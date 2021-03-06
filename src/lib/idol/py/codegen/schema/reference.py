# DO NOT EDIT
# This file was generated by idol_py, any changes will be lost when idol_py is rerun again
from ..__idol__ import Struct, Primitive


class SchemaReference(Struct):
    """
    A reference describes the location of a type in the module system.
    """

    # Just the module name
    module_name: str

    # The module_name.type_name string
    qualified_name: str

    # Just the type name
    type_name: str

    __field_constructors__ = [
        ("module_name", "module_name", Primitive.of(str), dict(optional=False),),
        ("qualified_name", "qualified_name", Primitive.of(str), dict(optional=False),),
        ("type_name", "type_name", Primitive.of(str), dict(optional=False),),
    ]
