import {
    Enum as Enum_,
    Struct as Struct_,
    Prim as Prim_,
    List as List_,
    Map as Map_,
} from './__idol__';

export function StructKind(val) {
    return val;
}

StructKind.MAP = 'map';
StructKind.REPEATED = 'repeated';
StructKind.SCALAR = 'scalar';
Enum_(StructKind, StructKind.SCALAR);

export function PrimitiveType(val) {
    return val;
}

PrimitiveType.ANY = 'any';
PrimitiveType.BOOL = 'bool';
PrimitiveType.DOUBLE = 'double';
PrimitiveType.INT53 = 'int53';
PrimitiveType.INT64 = 'int64';
PrimitiveType.STRING = 'string';
Enum_(PrimitiveType, PrimitiveType.ANY);

export function Literal(val) {
    return Literal.wrap.apply(this, arguments);
}

Struct_(Literal, {
    bool: ['bool', Prim_],
    double: ['double', Prim_],
    int53: ['int53', Prim_],
    int64: ['int64', Prim_],
    string: ['string', Prim_],
});

export function Reference(val) {
    return Reference.wrap.apply(this, arguments);
}

Struct_(Reference, {
    moduleName: ['module_name', Prim_],
    qualifiedName: ['qualified_name', Prim_],
    typeName: ['type_name', Prim_],
});

Struct_(Reference);

export function TypeStruct(val) {
    return TypeStruct.wrap.apply(this, arguments);
}

Struct_(TypeStruct, {
    literal: ['literal', Literal],
    parameters: ['parameters', List_.of(Reference)],
    primitiveType: ['primitive_type', PrimitiveType],
    reference: ['reference', Reference],
    structKind: ['struct_kind', StructKind],
});

export function Field(val) {
    return Field.wrap.apply(this, arguments);
}

Struct_(Field, {
    fieldName: ['field_name', Prim_],
    tags: ['tags', List_.of(Prim_)],
    typeStruct: ['type_struct', TypeStruct],
});

export function Dependency(val) {
    return Dependency.wrap.apply(this, arguments);
}

Struct_(Dependency, {
    from: ['from', Reference],
    to: ['to', Reference],
    isAbstraction: ['is_abstraction', Prim_],
    isLocal: ['is_local', Prim_],
});

export function Type(val) {
    return Type.wrap.apply(this, arguments);
}

Struct_(Type, {
    dependencies: ['dependencies', List_.of(Dependency)],
    fields: ['fields', Map_.of(Field)],
    isA: ['is_a', TypeStruct],
    named: ['named', Reference],
    options: ['options', List_.of(Prim_)],
    tags: ['tags', List_.of(Prim_)],
    typeVars: ['type_vars', List_.of(Prim_)],
});

export function Module(val) {
    return Module.wrap.apply(this, arguments);
}

Struct_(Module, {
    abstractTypesByName: ['abstract_types_by_name', Map_.of(Type)],
    dependencies: ['dependencies', List_.of(Dependency)],
    moduleName: ['module_name', Prim_],
    typesByName: ['types_by_name', Map_.of(Type)],
    typesDependencyOrdering: ['types_dependency_ordering', List_.of(Prim_)],
});
