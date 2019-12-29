"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaTypeFields = void 0;

var _idol_graphql__ = require("../__idol_graphql__");

var _TypeStruct = require("../../schema/TypeStruct");

var _Reference = require("../../schema/Reference");

var _graphql = require("graphql");

// DO NOT EDIT
// This file was generated by idol_graphql, any changes will be overwritten when idol_graphql is run again.
// A wrapper type containing fields that can describe a Type, as well as its tag metadata.
var SchemaTypeFields = {
  fields: {
    type: _idol_graphql__.Anything,
    description: "When this type is a struct, each of its fields and the type of that field is included\nExclusive with is_a and options"
  },
  is_a: {
    type: _TypeStruct.TypeStructType,
    description: "Set when this is type is an alias or simply an type expression (such as a generic).\nExclusive with having values for options or fields."
  },
  named: {
    type: _Reference.ReferenceType,
    description: "The name and module information of this type's definition."
  },
  options: {
    type: new _graphql.GraphQLList(_graphql.GraphQLString),
    description: "When this type is an enum includes the string values for each enum entry.  Note that each\ntarget language may have different rules for the enum constant names, but these entries are\ncanonical resident values.\nExclusive with is_a and fields."
  },
  tags: {
    type: new _graphql.GraphQLList(_graphql.GraphQLString),
    description: "General metadata given to a type.  Currently, atleast_one for Repeated types is supported.\nCustom codegen can use these tags to implement semantic types on top of simple logic types.\nIn general, however, tags are considred optional and should not be required to\ndeserialize / serializeconsume correct logical values."
  }
};
exports.SchemaTypeFields = SchemaTypeFields;