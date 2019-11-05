"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaTypeStructFragment = void 0;

var _Literal = require("../../schema/Literal");

var _Reference = require("../../schema/Reference");

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment SchemaTypeStructFields on SchemaTypeStruct {\n    literal {\n      ...LiteralFields\n    }\n    primitive_type\n    reference {\n      ...ReferenceFields\n    }\n    struct_kind\n  }\n  ", "\n  ", "\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var SchemaTypeStructFragment = (0, _graphqlTag["default"])(_templateObject(), _Literal.LiteralFragment, _Reference.ReferenceFragment);
exports.SchemaTypeStructFragment = SchemaTypeStructFragment;