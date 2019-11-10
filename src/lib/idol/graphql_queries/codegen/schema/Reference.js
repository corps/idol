"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaReferenceFragment = void 0;

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment ReferenceFields on Reference {\n    module_name\n    qualified_name\n    type_name\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// A reference describes the location of a type in the module system.;
var SchemaReferenceFragment = (0, _graphqlTag["default"])(_templateObject());
exports.SchemaReferenceFragment = SchemaReferenceFragment;