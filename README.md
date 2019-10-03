# idol

**idol is a minimalistic, language-agnostic, transport agnostic, IDL**

---

Create a toml file, or a json file, _or an executable that outputs json_ (if you prefer config as code), describing your model

```toml
[ModuleDec]
is_a = "TypeDec{}"

[FieldDec]
is_a = "string[]"
tags = ["atleast_one"]

[TypeDec]
# Defines the inhabitants of an enum type, where the first entry is used
# as the 'default' when an out of bounds value is deserialized.
fields.enum = "string[]"

# Defines an alias or type structure for this type.
fields.is_a = "string[]"

# Defines the typestructures that compose the fields of this type.
fields.fields = "FieldDec{}"

# Defines metadata and type specialization to the field specifically.
fields.tags = "string[]"

# When specifying multiple types, such as through multiple is_a or the combination of
# is_a with a an enum or fields, idol will attempt to widen, narrow, or enforce type 'specifity'
# based on this variance value.  See the Variance enum for more information.
fields.variance = "Variance"
# When true, any fields marked optional are dropped from the resulting construction.  This is
# most useful in combination with Contravariant type composition to create slices of an original
# model.
fields.trim = "bool"

# A type which changes the behavior of type composition in TypeDec's.
# Covariant will ensure the resulting type could be read as any of
# the composing parts, by combining fields of all structures and using
# the most narrow type.
# Contravariant will ensure the resulting type could be written from any
# of the composing parts, by combining fields of all structures, marking
# any fields not shared amongst all as optional, and using the most
# wide type.
# Invariant will ensure the constituent types are all functionally identical.
[Variance]
enum = ["Covariant", "Invariant", "Contravariant"]
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

Defining idol models is very simple.  In fact, the entire grammar of idol is captured as idol models itself, in the example given above.

Type values that can be given to `TypeDec` include:

1. `int` a signed int type.  Defaults to 0 from `expand`
2.  `string` a string type.  Defaults to "" from `expand`
3.  `double` a 64 bit precision float type.  Defaults to 0.0 from `expand`.
4.  `bool` a boolean type of true or false.  Defaults to false from `expand`
5.  `any` type which can capture any other value opaquely.

Types can also be decorated with container types:

1.  `int[]` is a list of ints.
2.  `bool{}` is a map of string -> bool entries.

There are also type and field specializations which can be set that codegen will respect in
generating more specialized serialization and types.

1.  `atleast_one`.  When included in TypeDec.tags for a list type, the resulting list will validate only if atleast one entry exists, and `expand` will prefill atleast one value.  This is to support a safe upgrade path from a scalar to a list type in an existing field.

2.  `optional`.  When included in a FieldDec, the resulting field supports null as a default value.  Note: all fields are technically nullable in idol, however they will always be converted recursively into a default value when passed through `expand`.  When `optional` is added, the resulting codegen modifies that field's type to indicate the union with null explicitly, and the resulting `expand` will simply leave null values rather than change the into default values.

## Project Status

Very early development.

Current support languages: python, rust, nodejs
Target future languages: graphql, ruby, flowjs, etc
