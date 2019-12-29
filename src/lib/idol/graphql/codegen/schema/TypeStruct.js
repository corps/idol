"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaTypeStructFields = void 0;

var _Literal = require("../../schema/Literal");

var _PrimitiveType = require("../../schema/PrimitiveType");

var _Reference = require("../../schema/Reference");

var _StructKind = require("../../schema/StructKind");

// DO NOT EDIT
// This file was generated by idol_graphql, any changes will be overwritten when idol_graphql is run again.
var SchemaTypeStructFields = {
  literal: {
    type: _Literal.LiteralType,
    description: ""
  },
  primitive_type: {
    type: _PrimitiveType.PrimitiveTypeType,
    description: ""
  },
  reference: {
    type: _Reference.ReferenceType,
    description: ""
  },
  struct_kind: {
    type: _StructKind.StructKindType,
    description: ""
  }
};
exports.SchemaTypeStructFields = SchemaTypeStructFields;