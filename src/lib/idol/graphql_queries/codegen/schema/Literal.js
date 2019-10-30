"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaLiteralFragment = void 0;

var _graphqlTag = require("graphql-tag");

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment SchemaLiteralFields on SchemaLiteral {\n    bool\n    double\n    int\n    string\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var SchemaLiteralFragment = (0, _graphqlTag.gql)(_templateObject());
exports.SchemaLiteralFragment = SchemaLiteralFragment;