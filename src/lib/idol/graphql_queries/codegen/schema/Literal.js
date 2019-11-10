"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaLiteralFragment = void 0;

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment LiteralFields on Literal {\n    bool\n    double\n    int\n    string\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var SchemaLiteralFragment = (0, _graphqlTag["default"])(_templateObject());
exports.SchemaLiteralFragment = SchemaLiteralFragment;