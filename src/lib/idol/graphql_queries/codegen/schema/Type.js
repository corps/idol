"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaTypeFragment = void 0;

var _Field = require("./Field");

var _TypeStruct = require("./TypeStruct");

var _Reference = require("./Reference");

var _graphqlTag = require("graphql-tag");

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment SchemaTypeFields on SchemaType {\n    fields {\n      ...SchemaFieldFields\n    }\n    is_a {\n      ...SchemaTypeStructFields\n    }\n    named {\n      ...SchemaReferenceFields\n    }\n    options\n    tags\n  }\n  ", "\n  ", "\n  ", "\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// A wrapper type containing fields that can describe a Type, as well as its tag metadata.;
var SchemaTypeFragment = (0, _graphqlTag.gql)(_templateObject(), _Field.SchemaFieldFragment, _TypeStruct.SchemaTypeStructFragment, _Reference.SchemaReferenceFragment);
exports.SchemaTypeFragment = SchemaTypeFragment;