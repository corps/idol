# This file was scaffold by idol_data, but it will not be overwritten, so feel free to edit.
# This file will be regenerated if you delete it.
from ..codegen.schema.struct_kind import SchemaStructKindEnum as StructKindCodegen


class StructKind(StructKindCodegen):
    """
    Scalars are non contained values
    Repeated are homogenous lists.  They can be upgraded or downgraded to and from Scalars.
    A repeated is indicated in a TypeDec by ending with '[]'
    Maps are homogenous 'dictionaries', whose key is always a string, mapping to js objects.
    A map is indicated in a TypeDec by ending with '{}'
    """

    pass
