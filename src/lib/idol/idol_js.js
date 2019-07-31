"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.idolJsOutput = exports.ScaffoldTypeHandler = exports.CodegenTypeHandler = exports.CodegenTypeStructExpressionHandler = exports.CodegenScalarExpressionHandler = exports.GeneratorConfig = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var scripter = _interopRequireWildcard(require("./scripter"));

var _functional = require("./functional");

var _generators = require("./generators");

var _cli = require("./cli");

var _utils = require("./utils");

var _Reference = require("./schema/Reference");

var _Type = require("./schema/Type");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var GeneratorConfig =
/*#__PURE__*/
function (_BaseGeneratorConfig) {
  _inherits(GeneratorConfig, _BaseGeneratorConfig);

  function GeneratorConfig(params) {
    var _this;

    _classCallCheck(this, GeneratorConfig);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(GeneratorConfig).call(this, params));
    _this.idolJsPath = _this.codegenRoot + "/__idol__.js";
    return _this;
  }

  _createClass(GeneratorConfig, [{
    key: "idolJsImports",
    value: function idolJsImports(module) {
      var path = this.resolvePath(module, {
        supplemental: this.idolJsPath
      });

      for (var _len = arguments.length, imports = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        imports[_key - 1] = arguments[_key];
      }

      return new _functional.OrderedObj(_defineProperty({}, path, new _functional.StringSet(imports.map(function (i) {
        return "".concat(i, " as ").concat(i, "_");
      }))));
    }
  }, {
    key: "codegenReferenceImport",
    value: function codegenReferenceImport(from, reference) {
      return new _functional.OrderedObj(_defineProperty({}, this.resolvePath(from, {
        codegen: reference.qualifiedName
      }), new _functional.StringSet([(0, _utils.asQualifiedIdent)(reference)])));
    }
  }, {
    key: "scaffoldReferenceImport",
    value: function scaffoldReferenceImport(from, reference) {
      return new _functional.OrderedObj(_defineProperty({}, this.resolvePath(from, {
        scaffold: reference.qualifiedName
      }), new _functional.StringSet(["".concat(reference.typeName, " as ").concat((0, _utils.asQualifiedIdent)(reference))])));
    }
  }, {
    key: "scalarImports",
    value: function scalarImports(module) {
      var _this2 = this;

      return (0, _generators.scalarMapper)({
        Literal: function Literal() {
          return _this2.idolJsImports(module, "Literal");
        },
        Primitive: function Primitive() {
          return _this2.idolJsImports(module, "Primitive");
        },
        Alias: function Alias(reference) {
          if (reference.qualifiedName in _this2.params.scaffoldTypes.obj) {
            return _this2.scaffoldReferenceImport(module, reference);
          }

          return _this2.codegenReferenceImport(module, reference);
        }
      });
    }
  }, {
    key: "typeStructImports",
    value: function typeStructImports(module) {
      var _this3 = this;

      return (0, _generators.typeStructMapper)({
        Scalar: this.scalarImports(module),
        Repeated: function Repeated(scalarImports) {
          return scalarImports.concat(_this3.idolJsImports(module, "List"));
        },
        Map: function Map(scalarImports) {
          return scalarImports.concat(_this3.idolJsImports(module, "Map"));
        }
      });
    }
  }, {
    key: "typeImports",
    value: function typeImports(module) {
      var _this4 = this;

      var typeStructImportMapper = this.typeStructImports(module);
      return (0, _generators.typeMapper)({
        Field: typeStructImportMapper,
        TypeStruct: function TypeStruct(type) {
          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          return typeStructImportMapper.apply(void 0, args);
        },
        Enum: function Enum() {
          return _this4.idolJsImports(module, "Enum");
        },
        Struct: function Struct(type, fieldImports) {
          return _this4.idolJsImports(module, "Struct").concat((0, _functional.flattenOrderedObj)(fieldImports, new _functional.OrderedObj()));
        }
      });
    }
  }]);

  return GeneratorConfig;
}(_generators.GeneratorConfig);

exports.GeneratorConfig = GeneratorConfig;

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
        return scripter.invocation("Literal_.of", scripter.literal(val));
      };
    }
  }, {
    key: "Primitive",
    get: function get() {
      return function (primitiveType) {
        return scripter.invocation("Primitive_.of", scripter.literal(primitiveType));
      };
    }
  }, {
    key: "Alias",
    get: function get() {
      return function (reference) {
        return (0, _utils.asQualifiedIdent)(reference);
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
        return scripter.invocation("List_.of", scalar, scripter.objLiteral(scripter.propDec("atleastOne", scripter.literal(!!tags.typeTags && tags.typeTags.indexOf('atleast_one') !== -1))));
      };
    }
  }, {
    key: "Map",
    get: function get() {
      return function (scalar) {
        return scripter.invocation("Map_.of", scalar);
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
      return scripter.objLiteral.apply(scripter, _toConsumableArray(values).concat(["\n\n", scripter.propDec("options", scripter.literal(options)), scripter.propDec("default", scripter.literal(options[0])), "\n\n", scripter.methodDec("validate", ["val"], []), scripter.methodDec("isValid", ["val"], [scripter.ret("true")]), scripter.methodDec("expand", ["val"], [scripter.ret("val")]), scripter.methodDec("wrap", ["val"], [scripter.ret("val")]), scripter.methodDec("unwrap", ["val"], [scripter.ret("val")])]));
    }
  }, {
    key: "gettersAndSettersFor",
    value: function gettersAndSettersFor(propName, fieldName, field) {
      return [scripter.getProp(propName, [], [propName !== fieldName ? scripter.ret(scripter.propAccess("this", fieldName)) : scripter.ret(scripter.invocation(scripter.propAccess(field, "wrap"), scripter.propLiteralAccess("this._original", fieldName)))]), scripter.setProp(propName, ["val"], [propName !== fieldName ? scripter.assignment(scripter.propAccess("this", fieldName), "val") : scripter.assignment(scripter.propLiteralAccess("this._original", fieldName), scripter.invocation(scripter.propAccess(field, "unwrap"), "val"))])];
    }
  }, {
    key: "structClass",
    value: function structClass(type, fields) {
      var _this5 = this;

      return scripter.exportedClass(this.exportIdent(type), null, [scripter.methodDec("constructor", ["val"], [scripter.assignment("this._original", "val")]), scripter.staticMethodDec("validate", ["val"], []), scripter.staticMethodDec("isValid", ["val"], [scripter.ret(scripter.literal(true))]), scripter.staticMethodDec("expand", ["val"], [scripter.ret("val")]), scripter.staticMethodDec("wrap", ["val"], [scripter.ret(scripter.newInvocation(this.exportIdent(type), "val"))]), scripter.staticMethodDec("unwrap", ["val"], [scripter.ret("val")])].concat((0, _functional.concatMap)(fields.ordering, function (fieldName) {
        var originalField = _this5.gettersAndSettersFor(fieldName, fieldName, fields.obj[fieldName]);

        var camelField = fieldName !== (0, _utils.camelCase)(fieldName) ? _this5.gettersAndSettersFor((0, _utils.camelCase)(fieldName), fieldName, fields.obj[fieldName]) : [];
        return originalField.concat(camelField);
      }, [])));
    }
  }, {
    key: "exportIdent",
    value: function exportIdent(type) {
      return (0, _utils.asQualifiedIdent)(type.named);
    }
  }, {
    key: "exportDec",
    value: function exportDec(type, expr) {
      return scripter.exportedConst(this.exportIdent(type), expr);
    }
  }, {
    key: "fieldsExpr",
    value: function fieldsExpr(type, fields) {
      return scripter.arrayLiteral.apply(scripter, _toConsumableArray(fields.map(function (field, name) {
        return scripter.objLiteral(scripter.propDec("fieldName", scripter.literal(name)), scripter.propDec("type", field), scripter.propDec("optional", scripter.literal(type.fields[name].tags.indexOf('optional') !== -1)));
      }).items()));
    }
  }, {
    key: "TypeStruct",
    get: function get() {
      var _this6 = this;

      var typeStructExpression = (0, _generators.typeStructMapper)(this.typeStructHandler);
      return function (type) {
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        return new _generators.TypedOutputBuilder([_this6.exportDec(type, typeStructExpression.apply(void 0, args))], {
          imports: _this6.config.typeImports({
            codegen: type.named.qualifiedName
          })(type)
        });
      };
    }
  }, {
    key: "Enum",
    get: function get() {
      var _this7 = this;

      return function (type, options) {
        return new _generators.TypedOutputBuilder([_this7.exportDec(type, _this7.enumConst(options)), scripter.invocation("Enum_", _this7.exportIdent(type)), "\n\n"], {
          imports: _this7.config.typeImports({
            codegen: type.named.qualifiedName
          })(type)
        });
      };
    }
  }, {
    key: "Field",
    get: function get() {
      return (0, _generators.typeStructMapper)(this.typeStructHandler);
    }
  }, {
    key: "Struct",
    get: function get() {
      var _this8 = this;

      return function (type, fields) {
        return new _generators.TypedOutputBuilder([_this8.structClass(type, fields), scripter.invocation("Struct_", _this8.exportIdent(type), _this8.fieldsExpr(type, fields)), "\n\n"], {
          imports: _this8.config.typeImports({
            codegen: type.named.qualifiedName
          })(type)
        });
      };
    }
  }]);

  return CodegenTypeHandler;
}();

exports.CodegenTypeHandler = CodegenTypeHandler;

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
      var _this9 = this;

      return function (type) {
        return new _generators.TypedOutputBuilder([scripter.exportedConst(type.named.typeName, (0, _utils.asQualifiedIdent)(type.named))], {
          imports: _this9.config.codegenReferenceImport({
            scaffold: type.named.qualifiedName
          }, type.named)
        });
      };
    }
  }, {
    key: "Enum",
    get: function get() {
      var _this10 = this;

      return function (type) {
        return new _generators.TypedOutputBuilder([scripter.exportedConst(type.named.typeName, (0, _utils.asQualifiedIdent)(type.named))], {
          imports: _this10.config.codegenReferenceImport({
            scaffold: type.named.qualifiedName
          }, type.named)
        });
      };
    }
  }, {
    key: "Struct",
    get: function get() {
      var _this11 = this;

      return function (type) {
        return new _generators.TypedOutputBuilder([scripter.exportedClass(type.named.typeName, (0, _utils.asQualifiedIdent)(type.named), [])], {
          imports: _this11.config.codegenReferenceImport({
            scaffold: type.named.qualifiedName
          }, type.named)
        });
      };
    }
  }]);

  return ScaffoldTypeHandler;
}();

exports.ScaffoldTypeHandler = ScaffoldTypeHandler;

var idolJsOutput = function idolJsOutput(config) {
  return new _generators.SinglePassGeneratorOutput({
    supplemental: new _functional.OrderedObj(_defineProperty({}, config.idolJsPath, new _functional.Conflictable([_fs["default"].readFileSync(_path["default"].resolve(__dirname, '../../lib/idol/__idol__.js'), "UTF-8").toString()])))
  });
};

exports.idolJsOutput = idolJsOutput;
var CODEGEN_FILE_COMMENT_HEADER = ["DO NO EDIT", "This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.", "Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there."].join("\n");
var SCAFFOLD_FILE_COMMENT_HEADER = ["This file was scaffolded by idol_js.js  Please feel free to modify and extend, but do not delete or remove its exports."].join("\n");

function runGenerator(params, config) {
  var codegenTypeHandler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new CodegenTypeHandler(params, config);
  var scaffoldTypeHandler = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new ScaffoldTypeHandler(config);
  var codegenOutputs = params.allTypes.map((0, _generators.asCodegenOutput)((0, _generators.asTypedGeneratorOutput)((0, _functional.compose)((0, _generators.typeMapper)(codegenTypeHandler), (0, _generators.withCommentHeader)(CODEGEN_FILE_COMMENT_HEADER)))));
  var scaffoldOutputs = params.scaffoldTypes.map((0, _generators.asScaffoldOutput)((0, _generators.asTypedGeneratorOutput)((0, _functional.compose)((0, _generators.materialTypeMapper)(scaffoldTypeHandler, params.allTypes.obj), (0, _generators.withCommentHeader)(SCAFFOLD_FILE_COMMENT_HEADER)))));
  var output = (0, _functional.flattenOrderedObj)(codegenOutputs, new _generators.SinglePassGeneratorOutput());
  output = output.concat((0, _functional.flattenOrderedObj)(scaffoldOutputs, new _generators.SinglePassGeneratorOutput()));
  output = output.concat(idolJsOutput(config));
  return output;
}

function main() {
  var params = (0, _cli.start)({
    flags: {},
    args: {
      "target": "idol module names whose contents will have extensible types scaffolded.",
      "output": "a directory to generate the scaffolds and codegen into."
    }
  });
  var config = new GeneratorConfig(params);
  config.withPathConfig();
  var pojos = runGenerator(params, config);
  var renderedOutput = (0, _generators.render)(config, pojos);
  var moveTo = (0, _generators.build)(config, renderedOutput);
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}