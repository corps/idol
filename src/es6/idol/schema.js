import {
    Enum as Enum_,
    Struct as Struct_,
    List as List_,
    Map as Map_,
    Literal as Literal_,
    Primitive as Primitive_,
} from "./__idol__"
// DO NOT EDIT THIS FILE
// This file is generated via idol_js.js.  You can either subclass these types
// in your own module file or update the relevant model.toml file and regenerate.

export function StructKind(val) {
    return val;
}

StructKind.MAP = "Map";
StructKind.REPEATED = "Repeated";
StructKind.SCALAR = "Scalar";
StructKind.default = StructKind.SCALAR;
Enum_(StructKind, ["Scalar","Repeated","Map"]);
StructKind.metadata = {"dependencies":[],"fields":{},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.StructKind","type_name":"StructKind"},"options":["Scalar","Repeated","Map"],"tags":[],"type_vars":[]};

export function PrimitiveType(val) {
    return val;
}

PrimitiveType.ANY = "any";
PrimitiveType.BOOL = "bool";
PrimitiveType.DOUBLE = "double";
PrimitiveType.INT53 = "int53";
PrimitiveType.INT64 = "int64";
PrimitiveType.STRING = "string";
PrimitiveType.default = PrimitiveType.INT53;
Enum_(PrimitiveType, ["int53","int64","double","string","bool","any"]);
PrimitiveType.metadata = {"dependencies":[],"fields":{},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.PrimitiveType","type_name":"PrimitiveType"},"options":["int53","int64","double","string","bool","any"],"tags":[],"type_vars":[]};

export function Literal(val) {
    return Literal.wrap.apply(this, arguments)
}

Struct_(Literal, {
    bool: ["bool", Primitive_.of("bool")],
    double: ["double", Primitive_.of("double")],
    int53: ["int53", Primitive_.of("int53")],
    int64: ["int64", Primitive_.of("int64")],
    string: ["string", Primitive_.of("string")],
})

Literal.metadata = {"dependencies":[],"fields":{"bool":{"field_name":"bool","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"bool","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"double":{"field_name":"double","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"double","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"int53":{"field_name":"int53","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"int64":{"field_name":"int64","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int64","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"string":{"field_name":"string","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Literal","type_name":"Literal"},"options":[],"tags":[],"type_vars":[]};

export function Reference(val) {
    return Reference.wrap.apply(this, arguments)
}

Struct_(Reference, {
    moduleName: ["module_name", Primitive_.of("string")],
    qualifiedName: ["qualified_name", Primitive_.of("string")],
    typeName: ["type_name", Primitive_.of("string")],
})

Reference.metadata = {"dependencies":[],"fields":{"module_name":{"field_name":"module_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"qualified_name":{"field_name":"qualified_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"type_name":{"field_name":"type_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"options":[],"tags":[],"type_vars":[]};

export function TypeStruct(val) {
    return TypeStruct.wrap.apply(this, arguments)
}

Struct_(TypeStruct, {
    literal: ["literal", Literal],
    parameters: ["parameters", List_.of(Reference)],
    primitiveType: ["primitive_type", PrimitiveType],
    reference: ["reference", Reference],
    structKind: ["struct_kind", StructKind],
})

TypeStruct.metadata = {"dependencies":[{"from":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Literal","type_name":"Literal"}},{"from":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"}},{"from":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.PrimitiveType","type_name":"PrimitiveType"}},{"from":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"}},{"from":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.StructKind","type_name":"StructKind"}}],"fields":{"literal":{"field_name":"literal","tags":["optional"],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Literal","type_name":"Literal"},"struct_kind":"Scalar"}},"parameters":{"field_name":"parameters","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"struct_kind":"Repeated"}},"primitive_type":{"field_name":"primitive_type","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.PrimitiveType","type_name":"PrimitiveType"},"struct_kind":"Scalar"}},"reference":{"field_name":"reference","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"struct_kind":"Scalar"}},"struct_kind":{"field_name":"struct_kind","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.StructKind","type_name":"StructKind"},"struct_kind":"Scalar"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"options":[],"tags":[],"type_vars":[]};

export function Field(val) {
    return Field.wrap.apply(this, arguments)
}

Struct_(Field, {
    fieldName: ["field_name", Primitive_.of("string")],
    tags: ["tags", List_.of(Primitive_.of("string"))],
    typeStruct: ["type_struct", TypeStruct],
})

Field.metadata = {"dependencies":[{"from":{"module_name":"schema","qualified_name":"schema.Field","type_name":"Field"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"}}],"fields":{"field_name":{"field_name":"field_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"tags":{"field_name":"tags","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"type_struct":{"field_name":"type_struct","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"struct_kind":"Scalar"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Field","type_name":"Field"},"options":[],"tags":[],"type_vars":[]};

export function Dependency(val) {
    return Dependency.wrap.apply(this, arguments)
}

Struct_(Dependency, {
    from: ["from", Reference],
    isAbstraction: ["is_abstraction", Primitive_.of("bool")],
    isLocal: ["is_local", Primitive_.of("bool")],
    to: ["to", Reference],
})

Dependency.metadata = {"dependencies":[{"from":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"}},{"from":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"}}],"fields":{"from":{"field_name":"from","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"struct_kind":"Scalar"}},"is_abstraction":{"field_name":"is_abstraction","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"bool","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"is_local":{"field_name":"is_local","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"bool","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"to":{"field_name":"to","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"struct_kind":"Scalar"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"options":[],"tags":[],"type_vars":[]};

export function Type(val) {
    return Type.wrap.apply(this, arguments)
}

Struct_(Type, {
    dependencies: ["dependencies", List_.of(Dependency)],
    fields: ["fields", Map_.of(Field)],
    isA: ["is_a", TypeStruct],
    named: ["named", Reference],
    options: ["options", List_.of(Primitive_.of("string"))],
    tags: ["tags", List_.of(Primitive_.of("string"))],
    typeVars: ["type_vars", List_.of(Primitive_.of("string"))],
})

Type.metadata = {"dependencies":[{"from":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"}},{"from":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Field","type_name":"Field"}},{"from":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"}},{"from":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"}}],"fields":{"dependencies":{"field_name":"dependencies","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"struct_kind":"Repeated"}},"fields":{"field_name":"fields","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Field","type_name":"Field"},"struct_kind":"Map"}},"is_a":{"field_name":"is_a","tags":["optional"],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"struct_kind":"Scalar"}},"named":{"field_name":"named","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"struct_kind":"Scalar"}},"options":{"field_name":"options","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"tags":{"field_name":"tags","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"type_vars":{"field_name":"type_vars","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"options":[],"tags":[],"type_vars":[]};

export function Module(val) {
    return Module.wrap.apply(this, arguments)
}

Struct_(Module, {
    abstractTypesByName: ["abstract_types_by_name", Map_.of(Type)],
    dependencies: ["dependencies", List_.of(Dependency)],
    moduleName: ["module_name", Primitive_.of("string")],
    typesByName: ["types_by_name", Map_.of(Type)],
    typesDependencyOrdering: ["types_dependency_ordering", List_.of(Primitive_.of("string"))],
})

Module.metadata = {"dependencies":[{"from":{"module_name":"schema","qualified_name":"schema.Module","type_name":"Module"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"}},{"from":{"module_name":"schema","qualified_name":"schema.Module","type_name":"Module"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"}},{"from":{"module_name":"schema","qualified_name":"schema.Module","type_name":"Module"},"is_abstraction":false,"is_local":true,"to":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"}}],"fields":{"abstract_types_by_name":{"field_name":"abstract_types_by_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"struct_kind":"Map"}},"dependencies":{"field_name":"dependencies","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"struct_kind":"Repeated"}},"module_name":{"field_name":"module_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"types_by_name":{"field_name":"types_by_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"struct_kind":"Map"}},"types_dependency_ordering":{"field_name":"types_dependency_ordering","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Module","type_name":"Module"},"options":[],"tags":[],"type_vars":[]};
