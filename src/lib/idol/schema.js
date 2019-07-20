import {Enum as Enum_, Struct as Struct_, isObj, wrapMap} from './__idol__';

export function StructKind(val) {
    return val;
}

StructKind.options = {};
StructKind.options.MAP = 'map';
StructKind.options.REPEATED = 'repeated';
StructKind.options.SCALAR = 'scalar';
Object.assign(StructKind, StructKind.options);
StructKind.default = StructKind.MAP;
Enum_(StructKind);

export function PrimitiveType(val) {
    return val;
}

PrimitiveType.options = {};
PrimitiveType.options.ANY = 'any';
PrimitiveType.options.BOOL = 'bool';
PrimitiveType.options.DOUBLE = 'double';
PrimitiveType.options.INT53 = 'int53';
PrimitiveType.options.INT64 = 'int64';
PrimitiveType.options.STRING = 'string';
Object.assign(PrimitiveType, PrimitiveType.options);
PrimitiveType.default = PrimitiveType.ANY;
Enum_(PrimitiveType);


export function Literal(val) {
    let result = this;
    if (!(this instanceof Literal)) {
        result = {};
    }

    result.bool = val.bool;
    result.double = val.double;
    result.int53 = val.int53;
    result.int64 = val.int64;
    result.string = val.string;

    return result;

}

Struct_(Literal);


export function Reference(val) {
    let result = this;
    if (!(this instanceof Literal)) {
        result = {};
    }

    result.moduleName = val.module_name;
    result.qualifiedName = val.qualified_name;
    result.typeName = val.type_name;

    return result;

}

Struct_(Reference);

export function TypeStruct(val) {
    let result = this;
    if (!(this instanceof Literal)) {
        result = {};
    }

    result.literal = val.literal;
    if (result.literal != null) result.literal = Literal(result.literal);
    result.parameters = val.parameters.map(Reference);
    result.primitiveType = val.primitive_type;
    result.reference = Reference(val.reference);
    result.structKind = StructKind(val.struct_kind);

    return result;

}

Struct_(TypeStruct);

export function Field(val) {
    let result = this;
    if (!(this instanceof Literal)) {
        result = {};
    }

    result.fieldName = val.field_name;
    result.tags = val.tags.slice();
    result.typeStruct = TypeStruct(val.type_struct);

    return result;

}

Struct_(Field);

export function Dependency(val) {
    let result = this;
    if (!(this instanceof Literal)) {
        result = {};
    }

    result.from = Reference(val.from);
    result.to = Reference(val.to);
    result.isAbstraction = val.is_abstraction;
    result.isLocal = val.is_local;

    return result;

}

Struct_(Dependency);


export function Type(val) {
    let result = this;
    if (!(this instanceof Literal)) {
        result = {};
    }

    result.dependencies = val.dependencies.map(v => Dependency(v));
    result.fields = wrapMap(val.fields, Field);
    result.isA = val.is_a;
    if (result.isA != null) result.isA = TypeStruct(result.isA);
    result.named = Reference(val.named);
    result.options = val.options.slice();
    result.tags = val.tags.slice();
    result.typeVars = val.typeVars.slice();

    return result;

}

Struct_(Type);

export function Module(val) {
    let result = this;
    if (!(this instanceof Literal)) {
        result = {};
    }

    result.abstractTypesByName = wrapMap(val.abstract_types_by_name, Type);
    result.dependencies = val.dependencies.map(Dependency);
    result.moduleName = val.module_name;
    result.typesByName = wrapMap(val.types_by_name, Type);
    result.typesDependencyOrdering = val.types_dependency_ordering.slice();

    return result;

}

Struct_(Module);
