("use strict");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapValues = wrapValues;
exports.LiteralTypeOf = LiteralTypeOf;
exports.Anything = void 0;

var _graphql = require("graphql");

function wrapValues(enumObj) {
  return Object.keys(enumObj).reduce(function(obj, k) {
    obj[enumObj[k]] = {
      value: enumObj[k]
    };
    return obj;
  }, {});
}

var Anything = new _graphql.GraphQLScalarType({
  name: "IdolGraphQLAnything",
  description: "Any json value, untyped",
  parseValue: function parseValue(value) {
    return value;
  },
  serialize: function serialize(value) {
    return value;
  },
  parseLiteral: parseLiteral
});
exports.Anything = Anything;

function parseLiteral(ast) {
  switch (ast.kind) {
    case _graphql.Kind.BOOLEAN:
    case _graphql.Kind.STRING:
      return ast.value;

    case _graphql.Kind.INT:
    case _graphql.Kind.FLOAT:
      return Number(ast.value);

    case _graphql.Kind.LIST:
      return ast.values.map(parseLiteral);

    case _graphql.Kind.OBJECT:
      return ast.fields.reduce(function(accumulator, field) {
        accumulator[field.name.value] = parseLiteral(field.value);
        return accumulator;
      }, {});

    case _graphql.Kind.NULL:
      return null;

    default:
      throw new Error("Unexpected kind in parseLiteral: " + ast.kind);
  }
}

function LiteralTypeOf(name, val, description) {
  return new _graphql.GraphQLScalarType({
    name: name,
    description: description || "Literal " + val,
    parseValue: function parseValue(_) {
      return val;
    },
    serialize: function serialize(_) {
      return val;
    },
    parseLiteral: function parseLiteral(_) {
      return val;
    }
  });
}
