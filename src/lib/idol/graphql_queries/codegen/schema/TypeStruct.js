"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaTypeStructFragment = void 0;

var _Literal = require("./Literal");

var _Reference = require("./Reference");

var _graphqlTag = require("graphql-tag");

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment SchemaTypeStructFields on SchemaTypeStruct {\n    literal {\n      ...SchemaLiteralFields\n    }\n    primitive_type\n    reference {\n      ...SchemaReferenceFields\n    }\n    struct_kind\n  }\n  ", "\n  ", "\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var SchemaTypeStructFragment = (0, _graphqlTag.gql)(_templateObject(), _Literal.SchemaLiteralFragment, _Reference.SchemaReferenceFragment);
exports.SchemaTypeStructFragment = SchemaTypeStructFragment;