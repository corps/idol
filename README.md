# idol

**idol is an IDL and codegeneration framework for meta programming with your application models.**

The IDL helps you define simple application models and services.
The codegen tools help you morph those abstractions into extensible, modifiable code.

---

Create a toml file, or a json file, _or an executable that outputs json_ (if you prefer config as code), describing your model

For instance, here's the entire idol grammar described in itself:

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

Run idol to create a build.json, which will contain a 'compiled' via of your models.

```bash
idol src/models/declarations.toml > build.json
```

```json
{"declarations":{"dependencies":[{"from":{"module_name":"declarations","qualified_name":"declarations.ModuleDec","type_name":"ModuleDec"},"is_local":true,"to":{"module_name":"declarations","qualified_name":"declarations.TypeDec","type_name":"TypeDec"}},{"from":{"module_name":"declarations","qualified_name":"declarations.TypeDec","type_name":"TypeDec"},"is_local":true,"to":{"module_name":"declarations","qualified_name":"declarations.FieldDec","type_name":"FieldDec"}}],"module_name":"declarations","types_by_name":{"ModuleDec":{"fields":{},"is_a":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"int","reference":{"module_name":"declarations","qualified_name":"declarations.TypeDec","type_name":"TypeDec"},"struct_kind":"Map"},"options":[],"tags":[],"type_name":"ModuleDec"},"TypeDec":{"fields":{"is_a":{"field_name":"is_a","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"enum":{"field_name":"enum","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"tags":{"field_name":"tags","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"fields":{"field_name":"fields","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"int","reference":{"module_name":"declarations","qualified_name":"declarations.FieldDec","type_name":"FieldDec"},"struct_kind":"Map"}}},"is_a":null,"options":[],"tags":[],"type_name":"TypeDec"},"FieldDec":{"fields":{},"is_a":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"},"options":[],"tags":[],"type_name":"FieldDec"}},"types_dependency_ordering":["FieldDec","TypeDec","ModuleDec"]}}
```

Now you can pass that compiled output through one of many existing codegen tools, or write your own workflow by extending.

```bash
cat build.json | idol_py --output src/generated/models --target "my.model.module"
cat build.json | idol_marshmallow --output src/generated/models --target "my.model.module"
cat build.json | idol_js --output src/generated/models --target "my.model.module"
cat build.json | idol_graphql --output src/generated/models --target "my.model.module"
cat build.json | idol_flow --output src/generated/models --target "my.model.module"
cat build.json | idol_rs --output src/generated --target "my.model.module"
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

## Getting Started


### Tools
You'll need to install `idol` the binary, which is responsible for model compilation.
Currently this binary is available under the Releases tab for Mac OSX and Linux amd64.

In addition, depending on your language, there is a supporting library for codegeneration:

#### Python
```bash
pip install idol
```

#### Javascript
```bash
npm install @lyric-travel/idol_js
```

### Define some models

Idol supports model definition in either of json, toml, or executable files that produce compatible json.

Each file represents a 'module', or namespace of definitions.  Everything up to the last `.ext` is
used from the filename to determine that module's name.

ie:

```
models.user.toml => models.users
org.java.services.json => org.java.services
```

Top level keys in a module's json or toml structure are models, and they are
required to match `[A-Z]+[a-zA-Z0-9_]*`.

```toml
[MyNewModel]
```

Models themselves use top level keys to define one of the following fundamental kinds:

1.  Enums
```
[MyNewEnum]
enum = ["a_list", "of_enum_values"]
```

2.  Structs
Each named field belongs as a key to the "fields" top level of model object.
```
[MyNewStruct]
fields.field_a = "int"
fields.field_b = "string"
```

3.  Aliases
```
[MyAliasType]
is_a = "MyNewStruct[]"
```

4.  Compositions
```
[LostPageWrapper]
fields.count = "int"
fields.links = "Links"
fields.data = "any[]"

[MyListModel]
is_a = "ListPageWrapper"
fields.data = "MyModel[]"
```

### 'Compile' a build.json

Regardless of your target language, you need a single normalized
json payload of all your types.  The default `idol` binary does this.
I recommend setting up a `Makefile` similar to the following:

```
MODELS := $(wildcard src/models/*.toml)
models: $(MODELS)
	idol $? > build.json
	python --version
	node --version
	pip --version
	npm install
	pip install -e ./src/lib

	cat build.json | ./target/debug/idol_rs --output src/models/ --mod "crate::models"
	cat build.json | ./src/lib/idol/idol_py --output src/lib/idol/py --target schema
	cat build.json | ./src/lib/idol/idol_js.js --output src/es6/idol/js --target schema
	cat build.json | ./src/lib/idol/idol_mar --output src/lib/idol/mar --target schema
	cat build.json | ./src/lib/idol/idol_graphql.js --output src/es6/idol/graphql --target schema
	cat build.json | ./src/lib/idol/idol_flow.js --output src/es6/idol/flow --target schema
```
