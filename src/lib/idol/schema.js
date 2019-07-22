"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StructKind = StructKind;
exports.PrimitiveType = PrimitiveType;
exports.Literal = Literal;
exports.Reference = Reference;
exports.TypeStruct = TypeStruct;
exports.Field = Field;
exports.Dependency = Dependency;
exports.Type = Type;
exports.Module = Module;

var _idol__ = require("./__idol__");

function StructKind(val) {
  return val;
}

StructKind.MAP = 'map';
StructKind.REPEATED = 'repeated';
StructKind.SCALAR = 'scalar';
(0, _idol__.Enum)(StructKind, StructKind.SCALAR);

function PrimitiveType(val) {
  return val;
}

PrimitiveType.ANY = 'any';
PrimitiveType.BOOL = 'bool';
PrimitiveType.DOUBLE = 'double';
PrimitiveType.INT53 = 'int53';
PrimitiveType.INT64 = 'int64';
PrimitiveType.STRING = 'string';
(0, _idol__.Enum)(PrimitiveType, PrimitiveType.ANY);

function Literal(val) {
  return Literal.wrap.apply(this, arguments);
}

(0, _idol__.Struct)(Literal, {
  bool: ['bool', _idol__.Primitive.of('bool')],
  "double": ['double', _idol__.Primitive.of('double')],
  int53: ['int53', _idol__.Primitive.of('int53')],
  int64: ['int64', _idol__.Primitive.of('int64')],
  string: ['string', _idol__.Primitive.of('string')]
});

function Reference(val) {
  return Reference.wrap.apply(this, arguments);
}

(0, _idol__.Struct)(Reference, {
  moduleName: ['module_name', _idol__.Primitive.of('string')],
  qualifiedName: ['qualified_name', _idol__.Primitive.of('string')],
  typeName: ['type_name', _idol__.Primitive.of('string')]
});

function TypeStruct(val) {
  return TypeStruct.wrap.apply(this, arguments);
}

(0, _idol__.Struct)(TypeStruct, {
  literal: ['literal', Literal],
  parameters: ['parameters', _idol__.List.of(Reference)],
  primitiveType: ['primitive_type', PrimitiveType],
  reference: ['reference', Reference],
  structKind: ['struct_kind', StructKind]
});

function Field(val) {
  return Field.wrap.apply(this, arguments);
}

(0, _idol__.Struct)(Field, {
  fieldName: ['field_name', _idol__.Primitive.of('string')],
  tags: ['tags', _idol__.List.of(_idol__.Primitive.of('string'))],
  typeStruct: ['type_struct', TypeStruct]
});

function Dependency(val) {
  return Dependency.wrap.apply(this, arguments);
}

(0, _idol__.Struct)(Dependency, {
  from: ['from', Reference],
  to: ['to', Reference],
  isAbstraction: ['is_abstraction', _idol__.Primitive.of('bool')],
  isLocal: ['is_local', _idol__.Primitive.of('bool')]
});

function Type(val) {
  return Type.wrap.apply(this, arguments);
}

(0, _idol__.Struct)(Type, {
  dependencies: ['dependencies', _idol__.List.of(Dependency)],
  fields: ['fields', _idol__.Map.of(Field)],
  isA: ['is_a', TypeStruct],
  named: ['named', Reference],
  options: ['options', _idol__.List.of(_idol__.Primitive.of('string'))],
  tags: ['tags', _idol__.List.of(_idol__.Primitive.of('string'))],
  typeVars: ['type_vars', _idol__.List.of(_idol__.Primitive.of('string'))]
});

function Module(val) {
  return Module.wrap.apply(this, arguments);
}

(0, _idol__.Struct)(Module, {
  abstractTypesByName: ['abstract_types_by_name', _idol__.Map.of(Type)],
  dependencies: ['dependencies', _idol__.List.of(Dependency)],
  moduleName: ['module_name', _idol__.Primitive.of('string')],
  typesByName: ['types_by_name', _idol__.Map.of(Type)],
  typesDependencyOrdering: ['types_dependency_ordering', _idol__.List.of(_idol__.Primitive.of('string'))]
});