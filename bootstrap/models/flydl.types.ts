import {Some} from "./flydl.def";

export type TypePath = TypeNode[];

export enum Kind {
  Primitive = "Primitive",
  Literal = "Literal",
  Field = "Field",
  Enum = "Enum",
  Map = "Map",
  Some = "Some",
  Reference = "Reference",
  Any = "Any"
}

export class TypeNode {
  kind = Kind.Primitive;
  primitive_kind = PrimitiveKind.int53;
  label = "";
  resident_values: Some<string> = [];
  literal_int64 = "0";
  literal_int53 = 0;
  literal_double = 0.0;
  literal_string = "";
  literal_bool = false;
  tags: Some<string> = [];
  comments: Some<string> = [];
}

export enum PrimitiveKind {
  int53 = "int53",
  int64 = "int64",
  double = "double",
  string = "string",
  bool = "bool",
}

export class MapNode {
  kind: Kind.Map = Kind.Map;
}

export class SomeNode {
  kind: Kind.Some = Kind.Some;
}

export class AnyNode {
  kind: Kind.Any = Kind.Any;
}

export class ReferenceNode {
  kind: Kind.Reference = Kind.Reference;
  label: string = "";
}

export class EnumNode {
  kind: Kind.Enum = Kind.Enum;
  resident_values: Some<string> = [];
}

export class LiteralNode {
  kind: Kind.Literal = Kind.Literal;
  primitive_kind = PrimitiveKind.int53;
  literal_int64 = "0";
  literal_int53 = 0;
  literal_double = 0.0;
  literal_string = "";
  literal_bool = false;
}

export class PrimitiveNode {
  kind: Kind.Primitive = Kind.Primitive;
  primitive_kind = PrimitiveKind.int53;
}

export class FieldNode {
  kind: Kind.Field = Kind.Field;
  label: string = "";

  tags: Some<string> = [];
  comments: Some<string> = [];
}
