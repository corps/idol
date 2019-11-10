"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaFieldFragment = void 0;

var _TypeStruct = require("../../schema/TypeStruct");

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment FieldFields on Field {\n    field_name\n    tags\n    type_struct {\n      ...TypeStructFields\n    }\n  }\n  ", "\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var SchemaFieldFragment = (0, _graphqlTag["default"])(_templateObject(), _TypeStruct.TypeStructFragment);
exports.SchemaFieldFragment = SchemaFieldFragment;