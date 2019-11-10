"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaModuleFragment = void 0;

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  fragment ModuleFields on Module {\n    module_name\n    types_by_name\n    types_dependency_ordering\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// Metadata contained about a module.;
var SchemaModuleFragment = (0, _graphqlTag["default"])(_templateObject());
exports.SchemaModuleFragment = SchemaModuleFragment;