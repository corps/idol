# idol

**idol is a minimalistic, language-agnostic, transport agnostic, IDL**

---

Create a json file, _or an executable that outputs json_, describing your model

```toml
#! /usr/bin/env remarshal -if toml -of json
[ModuleDec]
is_a = "TypeDec{}"

[FieldDec]
is_a = "string[]"

[TypeDec.fields]
enum = "string[]"
is_a = "string"
fields = "FieldDec{}"
tags = "string[]"
```

Run idol 

```bash
idol src/models/declarations.toml
```

Get a json output describing the schema of all modules, dependencies, and types

```json
{"declarations":{"dependencies":[{"from":{"module_name":"declarations","qualified_name":"declarations.ModuleDec","type_name":"ModuleDec"},"is_local":true,"to":{"module_name":"declarations","qualified_name":"declarations.TypeDec","type_name":"TypeDec"}},{"from":{"module_name":"declarations","qualified_name":"declarations.TypeDec","type_name":"TypeDec"},"is_local":true,"to":{"module_name":"declarations","qualified_name":"declarations.FieldDec","type_name":"FieldDec"}}],"module_name":"declarations","types_by_name":{"ModuleDec":{"fields":{},"is_a":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int53":0,"literal_int64":0,"literal_string":"","primitive_type":"int53","reference":{"module_name":"declarations","qualified_name":"declarations.TypeDec","type_name":"TypeDec"},"struct_kind":"Map"},"options":[],"tags":[],"type_name":"ModuleDec"},"TypeDec":{"fields":{"is_a":{"field_name":"is_a","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int53":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"enum":{"field_name":"enum","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int53":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"tags":{"field_name":"tags","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int53":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"fields":{"field_name":"fields","tags":[],"type_struct":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int53":0,"literal_int64":0,"literal_string":"","primitive_type":"int53","reference":{"module_name":"declarations","qualified_name":"declarations.FieldDec","type_name":"FieldDec"},"struct_kind":"Map"}}},"is_a":null,"options":[],"tags":[],"type_name":"TypeDec"},"FieldDec":{"fields":{},"is_a":{"is_literal":false,"literal_bool":false,"literal_double":0.0,"literal_int53":0,"literal_int64":0,"literal_string":"","primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"},"options":[],"tags":[],"type_name":"FieldDec"}},"types_dependency_ordering":["FieldDec","TypeDec","ModuleDec"]}}
```

Run that output through a codegen tool for each target language.

## But why?

At numerous previous small companies, there comes a point when the amount of schema-less data, configuration, and apis becomes
impossible for a small team to wrap their mind around alone, much less document and share as they continue to develop.

At this point, two related problems are considered:
1.  How to document / validate data schemas
2.  How to document / share service interfaces

Both of these problems are solved traditionally using an *I*nterface *D*ata *L*anguage.  But in practice,
implementing such a tool at this stage is hard for startups I've worked with.

1.  Writing and keeping data models and interface definitions up to date between two or more (frontend / backend) languages is error prone and time costly.
2.  Moving to *protobufs*, *flatbuffers*, or *Thrift* involves complex new tooling, and they are often _also concerned with a binary transport and other opinionated architecture decisions_.  The json fit is usually not strong, or the opinions of the IDL itself do not feet the languages the company wants to use in practice.
3.  JSON Schema is both not well maintained, and also _extraordinarily complex_ involving JSON pointers, regexes, a huge list of types, and no one decisive tooling that covers the full spec.

__idol__ then aims to solve these main criteria:

1.  Easy to setup.  Install the `idol` binary and any other language specific generates from this repo, and copy the `Makefile` as a good starting place.  In fact, _idol itself is generated from idol_, so it's a great reference project for getting off the ground.

2.  Javascript minded out of the box.  Enough functionality to support, for instance, explicit distinction between i64 and i53 types (where only the later is guaranteed to fit in Javascript Number type)

3.  Easily extensible.  Use field and model tags to add metadata and build a service layer, or add slot ids and generate protobufs.  `idol` can start out doing one thing well, and easily grow into many other use cases, *while unifying your data language itself*.


## Project Status

The tooling itself is a work in progress. Currently a code generator for Rust exists which bootstraps idol directly.  Generators in other languages are to come.

The declarative meta language, however, is so simple as to be declared stable.  You can begin defining models using `idol` and expect them to continue to be compatible for the next few years of development.