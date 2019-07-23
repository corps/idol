# idol

**idol is a minimalistic, language-agnostic, transport agnostic, IDL**

---

Create a toml file, or a json file, _or an executable that outputs json_ (if you prefer config as code), describing your model

```toml
[ModuleDec]
is_a = "TypeDec{}"

[FieldDec]
# Fields can be defined as an array of strings, where the first entry is the logical
# type of the field, and each additional string is a semantic 'tag' attached to the
# field, which can be (optionally) used by codegen tools or the runtime to provide
# additional behavior.
is_a = "string[]"

[TypeDec.fields]
# Is exclusive with is_a and fields properties.  Specifies an enum type whose
# resident values are the given string elements of this enum.
enum = "string[]"

# Is exclusive with enum and fields properties.  Specifies a 'type alias' which will
# code gen into a new type representing the given logical type.  ie: is_a = "string[]"
# would create a new alias type for a string arrays.
is_a = ["string", "optional"]

# Is exlcusive with is_a and enum properties.
# Defines fields in a a struct type, where each key is a field name and each entry is the type of that
# field.
fields = "FieldDec{}"
tags = "string[]"
```

Run idol 

```bash
idol src/models/declarations.toml > build.json
```

Get a json output describing the schema of all modules, dependencies, and types

```json
{"declarations":{"dependencies":[{"from":{"module_name":"declarations","qualified_name":"declarations.ModuleDec","type_name":"ModuleDec"},"is_local":true,"to":{"module_name":"declarations","qualified_name":"declarations.TypeDec","type_name":"TypeDec"}},{"from":{"module_name":"declarations","qualified_name":"declarations.TypeDec","type_name":"TypeDec"},"is_local":true,"to":{"module_name":"declarations","qualified_name":"declarations.FieldDec","type_name":"FieldDec"}}],"module_name":"declarations","types_by_name":{"ModuleDec":{"fields":{},"is_a":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"int","reference":{"module_name":"declarations","qualified_name":"declarations.TypeDec","type_name":"TypeDec"},"struct_kind":"Map"},"options":[],"tags":[],"type_name":"ModuleDec"},"TypeDec":{"fields":{"is_a":{"field_name":"is_a","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"enum":{"field_name":"enum","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"tags":{"field_name":"tags","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"fields":{"field_name":"fields","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"int","reference":{"module_name":"declarations","qualified_name":"declarations.FieldDec","type_name":"FieldDec"},"struct_kind":"Map"}}},"is_a":null,"options":[],"tags":[],"type_name":"TypeDec"},"FieldDec":{"fields":{},"is_a":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"},"options":[],"tags":[],"type_name":"FieldDec"}},"types_dependency_ordering":["FieldDec","TypeDec","ModuleDec"]}}
```

Run that output through a codegen tool for each target language.

```bash
cat build.json | idol_py.py --output src/generated/models --mod "project.generated.models"
cat build.json | idol_rs --output src/generated --mod "mytomlproject.generated"
```

You'll get auto generated classes / structs that look something like

```python
...

class StructKind(_Enum):
    MAP = 'Map'
    REPEATED = 'Repeated'
    SCALAR = 'Scalar'

...
class TypeStruct(_Struct):
    is_literal: bool
    literal_bool: bool
    literal_double: float
    literal_int: int
    literal_string: str
    parameters: _List[Reference]
    primitive_type: PrimitiveType
    reference: Reference
    struct_kind: StructKind
    
...
```

And additional interfaces:

### validate
Validates a raw json payload matches the given schema (ignores extra fields by default).

### expand
"Expands" a raw json by providing default values for missing fields, and negotiating arrays and scalars by performing 
packing or unpacking as necessary.

## Model Files

Definition idol models is very simple.  In fact, the entire grammar of idol is captured as idol models itself, in the example given above.

Type values that can be given to `TypeDec` include:

1. `int` a signed int type.  Defaults to 0 from `expand`
3.  `string` a string type.  Defaults to "" from `expand`
4.  `double` a 64 bit precision float type.  Defaults to 0.0 from `expand`.
5.  `bool` a boolean type of true or false.  Defaults to false from `expand`

Types can also be decorated with container types:

1.  `int[]` is a list of ints.
2.  `bool{}` is a map of string -> bool entries.

Finally, tags can be used to provide additional typing / code gen information.  idol supports 2 by default.

1.  `atleast_one`.  When included in TypeDec.tags for a list type, the resulting list will validate only if atleast one entry exists, and `expand` will prefill atleast one value.  This is to support a safe upgrade path from a scalar to a list type in an existing field.

2.  `optional`.  When included in a FieldDec, the resulting field supports null as a default value.  Note: all fields are technically nullable in idol, however they will always be converted recursively into a default value when passed through `expand`.  When `optional` is added, the resulting codegen modifies that field's type to indicate the union with null explicitly, and the resulting `expand` will simply leave null values rather than change the into default values.

## Project Status

Current support languages: python, rust, nodejs
Target future languages: graphql, ruby, flowjs, typescript.
