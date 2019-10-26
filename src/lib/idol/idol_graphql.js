"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.graphqlTypeOfPrimitive = graphqlTypeOfPrimitive;
exports.asGraphQLTypeIdent = asGraphQLTypeIdent;
exports.asGraphQLFieldsIdent = asGraphQLFieldsIdent;
exports.idolGraphQLJsOutput = exports.ScaffoldTypeHandler = exports.GeneratorConfig = exports.CodegenTypeHandler = exports.CodegenTypeStructExpressionHandler = exports.CodegenScalarExpressionHandler = void 0;

var _build_env = require("./build_env");

var scripter = _interopRequireWildcard(require("./scripter"));

var _cli = require("./cli");

var _generators = require("./generators");

var _functional = require("./functional");

var _Type = require("./schema/Type");

var _utils = require("./utils");

var _Reference = require("./schema/Reference");

var _PrimitiveType = require("./schema/PrimitiveType");

var _TypeStruct = require("./schema/TypeStruct");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function graphqlTypeOfPrimitive(primitiveType) {
  switch (primitiveType) {
    case _PrimitiveType.PrimitiveType.ANY:
      return "Anything";

    case _PrimitiveType.PrimitiveType.STRING:
      return "GraphQLString";

    case _PrimitiveType.PrimitiveType.BOOL:
      return "GraphQLBoolean";

    case _PrimitiveType.PrimitiveType.DOUBLE:
      return "GraphQLFloat";

    case _PrimitiveType.PrimitiveType.INT:
      return "GraphQLInt";
  }

  throw new Error("Unknown primitiveType " + primitiveType);
}

function asGraphQLTypeIdent(reference) {
  var qualified = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return qualified ? "".concat((0, _utils.asQualifiedIdent)(reference), "Type") : "".concat(reference.typeName, "Type");
}

function asGraphQLFieldsIdent(reference) {
  var qualified = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return qualified ? "".concat((0, _utils.asQualifiedIdent)(reference), "Fields") : "".concat(reference.typeName, "Fields");
}

var CodegenScalarExpressionHandler =
/*#__PURE__*/
function () {
  function CodegenScalarExpressionHandler() {
    _classCallCheck(this, CodegenScalarExpressionHandler);
  }

  _createClass(CodegenScalarExpressionHandler, [{
    key: "Literal",
    get: function get() {
      return function (primitiveType, val) {
        return graphqlTypeOfPrimitive(primitiveType);
      };
    }
  }, {
    key: "Primitive",
    get: function get() {
      return function (primitiveType) {
        return graphqlTypeOfPrimitive(primitiveType);
      };
    }
  }, {
    key: "Alias",
    get: function get() {
      return function (reference) {
        return asGraphQLTypeIdent(reference);
      };
    }
  }]);

  return CodegenScalarExpressionHandler;
}();

exports.CodegenScalarExpressionHandler = CodegenScalarExpressionHandler;

var CodegenTypeStructExpressionHandler =
/*#__PURE__*/
function () {
  function CodegenTypeStructExpressionHandler() {
    var scalarHandler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new CodegenScalarExpressionHandler();

    _classCallCheck(this, CodegenTypeStructExpressionHandler);

    this.scalarHandler = scalarHandler;
  }

  _createClass(CodegenTypeStructExpressionHandler, [{
    key: "Scalar",
    get: function get() {
      return (0, _generators.scalarMapper)(this.scalarHandler);
    }
  }, {
    key: "Repeated",
    get: function get() {
      return function (scalar) {
        var tags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return scripter.newInvocation("GraphQLList_", scalar);
      };
    }
  }, {
    key: "Map",
    get: function get() {
      return function (scalar) {
        return "Anything";
      };
    }
  }]);

  return CodegenTypeStructExpressionHandler;
}();

exports.CodegenTypeStructExpressionHandler = CodegenTypeStructExpressionHandler;

var CodegenTypeHandler =
/*#__PURE__*/
function () {
  function CodegenTypeHandler(params, config) {
    var typeStructHandler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new CodegenTypeStructExpressionHandler();

    _classCallCheck(this, CodegenTypeHandler);

    this.params = params;
    this.config = config;
    this.typeStructHandler = typeStructHandler;
  }

  _createClass(CodegenTypeHandler, [{
    key: "enumConst",
    value: function enumConst(options) {
      var values = options.map(function (o) {
        return scripter.propDec(o.toUpperCase(), scripter.literal(o));
      });
      return scripter.objLiteral.apply(scripter, _toConsumableArray(values));
    }
  }, {
    key: "objectTypeLiteral",
    value: function objectTypeLiteral(type) {
      return scripter.objLiteral(scripter.propDec("name", scripter.literal(type.named.typeName)), scripter.propDec("description", scripter.literal(type.getTagValue("description", ""))), scripter.propDec("fields", asGraphQLFieldsIdent(type.named)));
    }
  }, {
    key: "fieldsLiteral",
    value: function fieldsLiteral(type, fields) {
      return scripter.objLiteral.apply(scripter, _toConsumableArray(fields.map(function (field, fieldName) {
        return scripter.propDec(fieldName, field);
      }).items()));
    }
  }, {
    key: "TypeStruct",
    get: function get() {
      var _this = this;

      var typeStructExpression = (0, _generators.typeStructMapper)(this.typeStructHandler);
      return function (type) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return new _generators.TypedOutputBuilder([scripter.exportedConst(asGraphQLTypeIdent(type.named), typeStructExpression.apply(void 0, args))], {
          imports: _this.config.typeImports({
            codegen: type.named.qualifiedName
          })(type)
        });
      };
    }
  }, {
    key: "Enum",
    get: function get() {
      var _this2 = this;

      return function (type, options) {
        return new _generators.TypedOutputBuilder([scripter.exportedConst((0, _utils.asQualifiedIdent)(type.named), _this2.enumConst(options))].concat(type.named.qualifiedName in _this2.params.scaffoldTypes.obj ? [] : [scripter.exportedConst(asGraphQLTypeIdent(type.named), scripter.newInvocation("GraphQLEnumType_", scripter.invocation("wrapValues_", (0, _utils.asQualifiedIdent)(type.named))))]), {
          imports: _this2.config.typeImports({
            codegen: type.named.qualifiedName
          })(type)
        });
      };
    }
  }, {
    key: "Field",
    get: function get() {
      var typeExprMapper = (0, _generators.typeStructMapper)(this.typeStructHandler);
      return function (typeStruct) {
        var tags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var typeExpr = typeExprMapper(typeStruct, tags);
        return scripter.objLiteral(scripter.propDec("description", scripter.literal((0, _utils.getTagValue)(tags.fieldTags, "description", ""))), scripter.propDec("type", typeExpr));
      };
    }
  }, {
    key: "Struct",
    get: function get() {
      var _this3 = this;

      return function (type, fields) {
        return new _generators.TypedOutputBuilder([scripter.exportedConst(asGraphQLFieldsIdent(type.named), _this3.fieldsLiteral(type, fields))].concat(type.named.qualifiedName in _this3.params.scaffoldTypes.obj ? [] : [scripter.exportedConst(asGraphQLTypeIdent(type.named), scripter.newInvocation("GraphQLObjectType_", _this3.objectTypeLiteral(type)))]), {
          imports: _this3.config.typeImports({
            codegen: type.named.qualifiedName
          })(type)
        });
      };
    }
  }]);

  return CodegenTypeHandler;
}();

exports.CodegenTypeHandler = CodegenTypeHandler;

var GeneratorConfig =
/*#__PURE__*/
function (_BaseGeneratorConfig) {
  _inherits(GeneratorConfig, _BaseGeneratorConfig);

  function GeneratorConfig(params) {
    var _this4;

    _classCallCheck(this, GeneratorConfig);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(GeneratorConfig).call(this, params));
    _this4.idolGraphqlPath = _this4.codegenRoot + "/__idolGraphql__.js";
    return _this4;
  }

  _createClass(GeneratorConfig, [{
    key: "graphQLImports",
    value: function graphQLImports(module) {
      var path = this.resolvePath(module, {
        absolute: "graphql"
      });

      for (var _len2 = arguments.length, imports = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        imports[_key2 - 1] = arguments[_key2];
      }

      return new _functional.OrderedObj(_defineProperty({}, path, new _functional.StringSet(imports.map(function (i) {
        return "".concat(i, " as ").concat(i, "_");
      }))));
    }
  }, {
    key: "idolGraphQLImports",
    value: function idolGraphQLImports(module) {
      var path = this.resolvePath(module, {
        supplemental: this.idolGraphqlPath
      });

      for (var _len3 = arguments.length, imports = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        imports[_key3 - 1] = arguments[_key3];
      }

      return new _functional.OrderedObj(_defineProperty({}, path, new _functional.StringSet(imports.map(function (i) {
        return "".concat(i, " as ").concat(i, "_");
      }))));
    }
  }, {
    key: "fieldsImport",
    value: function fieldsImport(from, reference) {
      return new _functional.OrderedObj(_defineProperty({}, this.resolvePath(from, {
        codegen: reference.qualifiedName
      }), new _functional.StringSet([asGraphQLFieldsIdent(reference)])));
    }
  }, {
    key: "scaffoldTypeImport",
    value: function scaffoldTypeImport(from, reference) {
      return new _functional.OrderedObj(_defineProperty({}, this.resolvePath(from, {
        scaffold: reference.qualifiedName
      }), new _functional.StringSet(["".concat(asGraphQLTypeIdent(reference, false), " as ").concat(asGraphQLTypeIdent(reference))])));
    }
  }, {
    key: "codegenTypeImport",
    value: function codegenTypeImport(from, reference) {
      return new _functional.OrderedObj(_defineProperty({}, this.resolvePath(from, {
        codegen: reference.qualifiedName
      }), new _functional.StringSet([asGraphQLTypeIdent(reference)])));
    }
  }, {
    key: "codegenEnumImport",
    value: function codegenEnumImport(from, reference) {
      return new _functional.OrderedObj(_defineProperty({}, this.resolvePath(from, {
        codegen: reference.qualifiedName
      }), new _functional.StringSet([(0, _utils.asQualifiedIdent)(reference)])));
    }
  }, {
    key: "graphQLImportOfPrimitive",
    value: function graphQLImportOfPrimitive(module, primitiveType) {
      if (primitiveType === _PrimitiveType.PrimitiveType.ANY) {
        return this.idolGraphQLImports(module, "Anything");
      }

      return this.idolGraphQLImports(module, graphqlTypeOfPrimitive(primitiveType));
    }
  }, {
    key: "scalarImports",
    value: function scalarImports(module) {
      var _this5 = this;

      return (0, _generators.scalarMapper)({
        Literal: function Literal(primitiveType, value) {
          return _this5.graphQLImportOfPrimitive(module, primitiveType);
        },
        Primitive: function Primitive(primitiveType) {
          return _this5.graphQLImportOfPrimitive(module, primitiveType);
        },
        Alias: function Alias(reference) {
          if (module.scaffold) {
            return _this5.fieldsImport(module, reference);
          }

          if (reference.qualifiedName in _this5.params.scaffoldTypes.obj) {
            return _this5.scaffoldTypeImport(module, reference);
          }

          return _this5.codegenTypeImport(module, reference);
        }
      });
    }
  }, {
    key: "typeStructImports",
    value: function typeStructImports(module) {
      var _this6 = this;

      return (0, _generators.typeStructMapper)({
        Scalar: this.scalarImports(module),
        Repeated: function Repeated(scalarImports) {
          return scalarImports.concat(_this6.graphQLImports(module, "GraphQLList"));
        },
        // TODO: Use anytime here.
        Map: function Map(scalarImports) {
          return scalarImports;
        }
      });
    }
  }, {
    key: "typeImports",
    value: function typeImports(module) {
      var _this7 = this;

      var typeStructImportMapper = this.typeStructImports(module);
      return (0, _generators.typeMapper)({
        Field: typeStructImportMapper,
        TypeStruct: function TypeStruct(type) {
          for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            args[_key4 - 1] = arguments[_key4];
          }

          return typeStructImportMapper.apply(void 0, args);
        },
        Enum: function Enum() {
          return _this7.graphQLImports(module, "GraphQLEnumType").concat(_this7.idolGraphQLImports(module, "wrapValues"));
        },
        Struct: function Struct(type, fieldImports) {
          return _this7.graphQLImports(module, "GraphQLObjectType").concat((0, _functional.flattenOrderedObj)(fieldImports, new _functional.OrderedObj()));
        }
      });
    }
  }]);

  return GeneratorConfig;
}(_generators.GeneratorConfig);

exports.GeneratorConfig = GeneratorConfig;

var ScaffoldTypeHandler =
/*#__PURE__*/
function () {
  function ScaffoldTypeHandler(config) {
    _classCallCheck(this, ScaffoldTypeHandler);

    this.config = config;
  }

  _createClass(ScaffoldTypeHandler, [{
    key: "TypeStruct",
    get: function get() {
      var _this8 = this;

      return function (type) {
        return new _generators.TypedOutputBuilder([scripter.exportedConst(type.named.typeName, asGraphQLTypeIdent(type.named))], {
          imports: _this8.config.codegenTypeImport({
            scaffold: type.named.qualifiedName
          }, type.named)
        });
      };
    }
  }, {
    key: "Enum",
    get: function get() {
      var _this9 = this;

      return function (type) {
        return new _generators.TypedOutputBuilder([// Export the enum values.
        scripter.exportedConst(type.named.typeName, scripter.objLiteral("..." + (0, _utils.asQualifiedIdent)(type.named))), // And then the type
        scripter.exportedConst(asGraphQLTypeIdent(type.named), scripter.newInvocation("GraphQLEnumType_", scripter.invocation("wrapValues_", type.named.typeName)))], {
          imports: _this9.config.codegenEnumImport({
            scaffold: type.named.qualifiedName
          }, type.named).concat(_this9.config.idolGraphQLImports({
            scaffold: type.named.qualifiedName
          }, "wrapValues")).concat(_this9.config.graphQLImports({
            scaffold: type.named.qualifiedName
          }, "GraphQLEnumType"))
        });
      };
    }
  }, {
    key: "Struct",
    get: function get() {
      var _this10 = this;

      return function (type) {
        return new _generators.TypedOutputBuilder([scripter.exportedConst(asGraphQLTypeIdent(type.named, false), scripter.newInvocation("GraphQLObjectType_", scripter.objLiteral(scripter.propDec("fields", scripter.objLiteral("...".concat(asGraphQLFieldsIdent(type.named)))), scripter.propDec("name", scripter.literal(type.named.typeName)), scripter.propDec("description", scripter.literal(type.getTagValue("description", ""))))))], {
          imports: _this10.config.fieldsImport({
            scaffold: type.named.qualifiedName
          }, type.named).concat(_this10.config.graphQLImports({
            scaffold: type.named.qualifiedName
          }, "GraphQLObjectType"))
        });
      };
    }
  }]);

  return ScaffoldTypeHandler;
}();

exports.ScaffoldTypeHandler = ScaffoldTypeHandler;
var CODEGEN_FILE_COMMENT_HEADER = ["DO NO EDIT", "This file is managed by idol_graphql.js.  Any edits will be overwritten on next run of the generator.", "Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there."].join("\n");
var SCAFFOLD_FILE_COMMENT_HEADER = ["This file was scaffolded by idol_graphql.js  Please feel free to modify and extend, but do not delete or remove its exports."].join("\n");

var idolGraphQLJsOutput = function idolGraphQLJsOutput(config) {
  return new _generators.SinglePassGeneratorOutput({
    supplemental: new _functional.OrderedObj(_defineProperty({}, config.idolGraphqlPath, new _functional.Conflictable([idolGraphQlJs])))
  });
};

exports.idolGraphQLJsOutput = idolGraphQLJsOutput;

function runGenerator(params, config) {
  var codegenTypeHandler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new CodegenTypeHandler(params, config);
  var scaffoldTypeHandler = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new ScaffoldTypeHandler(config);
  var codegenOutputs = params.allTypes.map((0, _generators.asCodegenOutput)((0, _generators.asTypedGeneratorOutput)((0, _functional.compose)((0, _generators.typeMapper)(codegenTypeHandler), (0, _generators.withCommentHeader)(CODEGEN_FILE_COMMENT_HEADER)))));
  var scaffoldOutputs = params.scaffoldTypes.map((0, _generators.asScaffoldOutput)((0, _generators.asTypedGeneratorOutput)((0, _functional.compose)((0, _generators.materialTypeMapper)(scaffoldTypeHandler, params.allTypes.obj), (0, _generators.withCommentHeader)(SCAFFOLD_FILE_COMMENT_HEADER)))));
  var output = (0, _functional.flattenOrderedObj)(codegenOutputs, new _generators.SinglePassGeneratorOutput());
  output = output.concat((0, _functional.flattenOrderedObj)(scaffoldOutputs, new _generators.SinglePassGeneratorOutput()));
  output = output.concat(idolGraphQLJsOutput(config));
  return output;
}

function main() {
  var params = (0, _cli.start)({
    flags: {},
    args: {
      target: "idol module names whose contents will have extensible GraphQLType's scaffolded.",
      output: "a directory to generate the scaffolds and codegen into."
    }
  });
  var config = new GeneratorConfig(params);
  config.withPathConfig({
    scaffold: _generators.GeneratorConfig.flatNamespace,
    codegen: _generators.GeneratorConfig.oneFilePerType
  });
  var types = runGenerator(params, config);
  var renderedOutput = (0, _generators.render)(config, types);
  var moveTo = (0, _generators.build)(config, renderedOutput);
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}