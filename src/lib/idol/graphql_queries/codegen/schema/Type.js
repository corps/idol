"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaTypeFragment = void 0;

var _TypeStruct = require("../../schema/TypeStruct");

var _Reference = require("../../schema/Reference");

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment TypeFields on Type {\n    fields\n    is_a {\n      ...TypeStructFields\n    }\n    named {\n      ...ReferenceFields\n    }\n    options\n    tags\n  }\n  ", "\n  ", "\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// A wrapper type containing fields that can describe a Type, as well as its tag metadata.;
var SchemaTypeFragment = (0, _graphqlTag["default"])(_templateObject(), _TypeStruct.TypeStructFragment, _Reference.ReferenceFragment);
exports.SchemaTypeFragment = SchemaTypeFragment;