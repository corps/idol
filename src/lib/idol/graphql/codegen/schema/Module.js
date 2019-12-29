"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaModuleFields = void 0;

var _graphql = require("graphql");

var _idol_graphql__ = require("../__idol_graphql__");

// DO NOT EDIT
// This file was generated by idol_graphql, any changes will be overwritten when idol_graphql is run again.
// Metadata contained about a module.
var SchemaModuleFields = {
  module_name: {
    type: _graphql.GraphQLString,
    description: ""
  },
  types_by_name: {
    type: _idol_graphql__.Anything,
    description: ""
  },
  types_dependency_ordering: {
    type: new _graphql.GraphQLList(_graphql.GraphQLString),
    description: ""
  }
};
exports.SchemaModuleFields = SchemaModuleFields;