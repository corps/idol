import { GraphQLScalarType, Kind } from "graphql";

export function wrapValues(enumObj) {
  return Object.keys(enumObj).reduce((obj, k) => {
    obj[k] = { value: enumObj[k] };
    return obj;
  }, {});
}

export const Anything = new GraphQLScalarType({
  name: "IdolGraphQLAnything",
  description: "Any json value, untyped",
  parseValue: value => value,
  serialize: value => value,
  parseLiteral
});

function parseLiteral(ast) {
  switch (ast.kind) {
    case Kind.BOOLEAN:
    case Kind.STRING:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value);
    case Kind.LIST:
      return ast.values.map(parseLiteral);
    case Kind.OBJECT:
      return ast.fields.reduce((accumulator, field) => {
        accumulator[field.name.value] = parseLiteral(field.value);
        return accumulator;
      }, {});
    case Kind.NULL:
      return null;
    default:
      throw new Error("Unexpected kind in parseLiteral: " + ast.kind);
  }
}
