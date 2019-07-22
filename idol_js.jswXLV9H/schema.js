import {
    Enum as Enum_,
    Struct as Struct_,
    List as List_,
    Map as Map_,
    Literal as Literal_,
    Primitive as Primitive_,
} from "__idol__"
import * as schema from "schema"
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
Enum_(StructKind);
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
Enum_(PrimitiveType);
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

Struct_(Literal);
Literal.metadata = {"dependencies":[],"fields":{"bool":{"field_name":"bool","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"bool","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"string":{"field_name":"string","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"int53":{"field_name":"int53","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"double":{"field_name":"double","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"double","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"int64":{"field_name":"int64","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int64","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Literal","type_name":"Literal"},"options":[],"tags":[],"type_vars":[]};

export function Reference(val) {
    return Reference.wrap.apply(this, arguments)
}

Struct_(Reference, {
    moduleName: ["module_name", Primitive_.of("string")],
    qualifiedName: ["qualified_name", Primitive_.of("string")],
    typeName: ["type_name", Primitive_.of("string")],
})

Struct_(Reference);
Reference.metadata = {"dependencies":[],"fields":{"type_name":{"field_name":"type_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"qualified_name":{"field_name":"qualified_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"module_name":{"field_name":"module_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"options":[],"tags":[],"type_vars":[]};

export function TypeStruct(val) {
    return TypeStruct.wrap.apply(this, arguments)
}

Struct_(TypeStruct, {
    literal: ["literal", Literal],
    parameters: ["parameters", Reference],
    primitiveType: ["primitive_type", PrimitiveType],
    reference: ["reference", Reference],
    structKind: ["struct_kind", StructKind],
})

Struct_(TypeStruct);
TypeStruct.metadata = {"dependencies":[{"from":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"to":{"module_name":"schema","qualified_name":"schema.Literal","type_name":"Literal"},"is_abstraction":false,"is_local":true},{"from":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"to":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"is_abstraction":false,"is_local":true},{"from":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"to":{"module_name":"schema","qualified_name":"schema.PrimitiveType","type_name":"PrimitiveType"},"is_abstraction":false,"is_local":true},{"from":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"to":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"is_abstraction":false,"is_local":true},{"from":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"to":{"module_name":"schema","qualified_name":"schema.StructKind","type_name":"StructKind"},"is_abstraction":false,"is_local":true}],"fields":{"primitive_type":{"field_name":"primitive_type","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.PrimitiveType","type_name":"PrimitiveType"},"struct_kind":"Scalar"}},"parameters":{"field_name":"parameters","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"struct_kind":"Repeated"}},"reference":{"field_name":"reference","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"struct_kind":"Scalar"}},"literal":{"field_name":"literal","tags":["optional"],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Literal","type_name":"Literal"},"struct_kind":"Scalar"}},"struct_kind":{"field_name":"struct_kind","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.StructKind","type_name":"StructKind"},"struct_kind":"Scalar"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"options":[],"tags":[],"type_vars":[]};

export function Field(val) {
    return Field.wrap.apply(this, arguments)
}

Struct_(Field, {
    fieldName: ["field_name", Primitive_.of("string")],
    tags: ["tags", Primitive_.of("string")],
    typeStruct: ["type_struct", TypeStruct],
})

Struct_(Field);
Field.metadata = {"dependencies":[{"from":{"module_name":"schema","qualified_name":"schema.Field","type_name":"Field"},"to":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"is_abstraction":false,"is_local":true}],"fields":{"type_struct":{"field_name":"type_struct","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"struct_kind":"Scalar"}},"field_name":{"field_name":"field_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"tags":{"field_name":"tags","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Field","type_name":"Field"},"options":[],"tags":[],"type_vars":[]};

export function Dependency(val) {
    return Dependency.wrap.apply(this, arguments)
}

Struct_(Dependency, {
    from: ["from", Reference],
    isAbstraction: ["is_abstraction", Primitive_.of("bool")],
    isLocal: ["is_local", Primitive_.of("bool")],
    to: ["to", Reference],
})

Struct_(Dependency);
Dependency.metadata = {"dependencies":[{"from":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"to":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"is_abstraction":false,"is_local":true},{"from":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"to":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"is_abstraction":false,"is_local":true}],"fields":{"from":{"field_name":"from","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"struct_kind":"Scalar"}},"is_abstraction":{"field_name":"is_abstraction","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"bool","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"is_local":{"field_name":"is_local","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"bool","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"to":{"field_name":"to","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"struct_kind":"Scalar"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"options":[],"tags":[],"type_vars":[]};

export function Type(val) {
    return Type.wrap.apply(this, arguments)
}

Struct_(Type, {
    dependencies: ["dependencies", Dependency],
    fields: ["fields", Field],
    isA: ["is_a", TypeStruct],
    named: ["named", Reference],
    options: ["options", Primitive_.of("string")],
    tags: ["tags", Primitive_.of("string")],
    typeVars: ["type_vars", Primitive_.of("string")],
})

Struct_(Type);
Type.metadata = {"dependencies":[{"from":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"to":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"is_abstraction":false,"is_local":true},{"from":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"to":{"module_name":"schema","qualified_name":"schema.Field","type_name":"Field"},"is_abstraction":false,"is_local":true},{"from":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"to":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"is_abstraction":false,"is_local":true},{"from":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"to":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"is_abstraction":false,"is_local":true}],"fields":{"dependencies":{"field_name":"dependencies","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"struct_kind":"Repeated"}},"named":{"field_name":"named","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Reference","type_name":"Reference"},"struct_kind":"Scalar"}},"is_a":{"field_name":"is_a","tags":["optional"],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.TypeStruct","type_name":"TypeStruct"},"struct_kind":"Scalar"}},"type_vars":{"field_name":"type_vars","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"options":{"field_name":"options","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"fields":{"field_name":"fields","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Field","type_name":"Field"},"struct_kind":"Map"}},"tags":{"field_name":"tags","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"options":[],"tags":[],"type_vars":[]};

export function Module(val) {
    return Module.wrap.apply(this, arguments)
}

Struct_(Module, {
    abstractTypesByName: ["abstract_types_by_name", Type],
    dependencies: ["dependencies", Dependency],
    moduleName: ["module_name", Primitive_.of("string")],
    typesByName: ["types_by_name", Type],
    typesDependencyOrdering: ["types_dependency_ordering", Primitive_.of("string")],
})

Struct_(Module);
Module.metadata = {"dependencies":[{"from":{"module_name":"schema","qualified_name":"schema.Module","type_name":"Module"},"to":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"is_abstraction":false,"is_local":true},{"from":{"module_name":"schema","qualified_name":"schema.Module","type_name":"Module"},"to":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"is_abstraction":false,"is_local":true},{"from":{"module_name":"schema","qualified_name":"schema.Module","type_name":"Module"},"to":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"is_abstraction":false,"is_local":true}],"fields":{"dependencies":{"field_name":"dependencies","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Dependency","type_name":"Dependency"},"struct_kind":"Repeated"}},"types_dependency_ordering":{"field_name":"types_dependency_ordering","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Repeated"}},"types_by_name":{"field_name":"types_by_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"struct_kind":"Map"}},"module_name":{"field_name":"module_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"string","reference":{"module_name":"","qualified_name":"","type_name":""},"struct_kind":"Scalar"}},"abstract_types_by_name":{"field_name":"abstract_types_by_name","tags":[],"type_struct":{"literal":null,"parameters":[],"primitive_type":"int53","reference":{"module_name":"schema","qualified_name":"schema.Type","type_name":"Type"},"struct_kind":"Map"}}},"is_a":null,"named":{"module_name":"schema","qualified_name":"schema.Module","type_name":"Module"},"options":[],"tags":[],"type_vars":[]};
