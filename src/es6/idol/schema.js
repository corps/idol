import {
    Enum as Enum_,
    Struct as Struct_,
    Primitive as Prim_,
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
    bool: ['bool', Prim_.of('bool')],
    double: ['double', Prim_.of('double')],
    int53: ['int53', Prim_.of('int53')],
    int64: ['int64', Prim_.of('int64')],
    string: ['string', Prim_.of('string')],
});

export function Reference(val) {
    return Reference.wrap.apply(this, arguments);
}

Struct_(Reference, {
    moduleName: ['module_name', Prim_.of('string')],
    qualifiedName: ['qualified_name', Prim_.of('string')],
    typeName: ['type_name', Prim_.of('string')],
});

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
    fieldName: ['field_name', Prim_.of('string')],
    tags: ['tags', List_.of(Prim_.of('string'))],
    typeStruct: ['type_struct', TypeStruct],
});

export function Dependency(val) {
    return Dependency.wrap.apply(this, arguments);
}

Struct_(Dependency, {
    from: ['from', Reference],
    to: ['to', Reference],
    isAbstraction: ['is_abstraction', Prim_.of('bool')],
    isLocal: ['is_local', Prim_.of('bool')],
});

export function Type(val) {
    return Type.wrap.apply(this, arguments);
}

Struct_(Type, {
    dependencies: ['dependencies', List_.of(Dependency)],
    fields: ['fields', Map_.of(Field)],
    isA: ['is_a', TypeStruct],
    named: ['named', Reference],
    options: ['options', List_.of(Prim_.of('string'))],
    tags: ['tags', List_.of(Prim_.of('string'))],
    typeVars: ['type_vars', List_.of(Prim_.of('string'))],
});

export function Module(val) {
    return Module.wrap.apply(this, arguments);
}

Struct_(Module, {
    abstractTypesByName: ['abstract_types_by_name', Map_.of(Type)],
    dependencies: ['dependencies', List_.of(Dependency)],
    moduleName: ['module_name', Prim_.of('string')],
    typesByName: ['types_by_name', Map_.of(Type)],
    typesDependencyOrdering: ['types_dependency_ordering', List_.of(Prim_.of('string'))],
});
