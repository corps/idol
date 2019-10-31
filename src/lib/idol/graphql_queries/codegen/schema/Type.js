"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaTypeFragment = void 0;

var _Field = require("../../schema/Field");

var _TypeStruct = require("../../schema/TypeStruct");

var _Reference = require("../../schema/Reference");

var _graphqlTag = require("graphql-tag");

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment TypeFields on Type {\n    fields {\n      ...FieldFields\n    }\n    is_a {\n      ...TypeStructFields\n    }\n    named {\n      ...ReferenceFields\n    }\n    options\n    tags\n  }\n  ", "\n  ", "\n  ", "\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// A wrapper type containing fields that can describe a Type, as well as its tag metadata.;
var SchemaTypeFragment = (0, _graphqlTag.gql)(_templateObject(), _Field.FieldFragment, _TypeStruct.TypeStructFragment, _Reference.ReferenceFragment);
exports.SchemaTypeFragment = SchemaTypeFragment;