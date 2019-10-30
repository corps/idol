#! /usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IdolGraphqlMethod = exports.IdolGraphqlService = exports.IdolGraphqlScaffoldStruct = exports.IdolGraphqlCodegenScalar = exports.IdolGraphqlCodegenTypeStructDeclaration = exports.IdolGraphQLQueriesCodegenTypeStruct = exports.IdolGraphqlQueriesCodegenStruct = exports.IdolGraphqlQueriesScaffoldFile = exports.IdolGraphqlQueriesCodegenFile = exports.IdolGraphqlQueries = void 0;

var _path = require("path");

var scripter = _interopRequireWildcard(require("./scripter"));

var _cli = require("./cli");

var _Reference = require("./js/schema/Reference");

var _Type = require("./js/schema/Type");

var _generators = require("./generators");

var _functional = require("./functional");

var _PrimitiveType = require("./js/schema/PrimitiveType");

var _TypeStruct = require("./js/schema/TypeStruct");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var IdolGraphqlQueries =
/*#__PURE__*/
function () {
  function IdolGraphqlQueries(config) {
    var codegenImpl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (idolGraphqlQueries, path, type) {
      return new IdolGraphqlQueriesCodegenFile(idolGraphqlQueries, path, type);
    };
    var scaffoldImpl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (idolGraphqlQueries, path, type) {
      return new IdolGraphqlQueriesScaffoldFile(idolGraphqlQueries, path, type);
    };

    _classCallCheck(this, IdolGraphqlQueries);

    this.state = new _generators.GeneratorAcc();
    this.config = config;
    this.codegenImpl = codegenImpl;
    this.scaffoldImpl = scaffoldImpl;
  }

  _createClass(IdolGraphqlQueries, [{
    key: "codegenFile",
    value: function codegenFile(ref) {
      var _this = this;

      var path = this.state.reservePath(this.config.pathsOf({
        codegen: ref
      }));
      var type = this.config.params.allTypes.obj[ref.qualified_name];
      return (0, _functional.cachedProperty)(this, "codegenFile".concat(path.path), function () {
        return _this.codegenImpl(_this, path, type);
      });
    }
  }, {
    key: "scaffoldFile",
    value: function scaffoldFile(ref) {
      var _this2 = this;

      var path = this.state.reservePath(this.config.pathsOf({
        scaffold: ref
      }));
      var type = this.config.params.allTypes.obj[ref.qualified_name];
      return (0, _functional.cachedProperty)(this, "scaffoldFile".concat(path.path), function () {
        return _this2.scaffoldImpl(_this2, path, type);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var scaffoldTypes = this.config.params.scaffoldTypes.values();
      scaffoldTypes.forEach(function (t, i) {
        var scaffoldFile = _this3.scaffoldFile(t.named);

        if (!scaffoldFile.declaredFragments.isEmpty()) {
          console.log("Generated ".concat(scaffoldFile.declaredFragments.unwrap().ident, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        } else {
          console.log("Skipped ".concat(scaffoldFile.defaultFragmentName, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        }
      });
      return this.state.render({
        codegen: "DO NOT EDIT\nThis file was generated by idol_graphql_queries, any changes will be overwritten when idol_graphql_queries is run again.",
        scaffold: "This file was scaffolded by idol_graphql_queries.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_graphql_queries."
      });
    }
  }, {
    key: "anythingGraphqlTypeName",
    get: function get() {
      return "IdolGraphQLAnything";
    }
  }]);

  return IdolGraphqlQueries;
}();

exports.IdolGraphqlQueries = IdolGraphqlQueries;
var gql = {
  ident: "gql",
  path: new _generators.Path("graphql-tag")
};

function graphqlTag() {
  for (var _len = arguments.length, lines = new Array(_len), _key = 0; _key < _len; _key++) {
    lines[_key] = arguments[_key];
  }

  return function (state, path) {
    return state.importIdent(path, gql) + "`\n" + lines.join("\n") + "\n`;";
  };
}

var IdolGraphqlQueriesCodegenFile =
/*#__PURE__*/
function (_GeneratorFileContext) {
  _inherits(IdolGraphqlQueriesCodegenFile, _GeneratorFileContext);

  function IdolGraphqlQueriesCodegenFile(idolGraphqlQueries, path, type) {
    var _this4;

    _classCallCheck(this, IdolGraphqlQueriesCodegenFile);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlQueriesCodegenFile).call(this, idolGraphqlQueries, path));
    _this4.typeDecon = new _generators.TypeDeconstructor(type);

    _this4.reserveIdent(_this4.defaultFragmentName);

    return _this4;
  }

  _createClass(IdolGraphqlQueriesCodegenFile, [{
    key: "type",
    get: function get() {
      return this.typeDecon.t;
    }
  }, {
    key: "graphqlTypeName",
    get: function get() {
      return this.type.named.asQualifiedIdent;
    }
  }, {
    key: "defaultFragmentName",
    get: function get() {
      return this.type.named.asQualifiedIdent + "Fragment";
    }
  }, {
    key: "graphqlFieldsName",
    get: function get() {
      return this.type.named.asQualifiedIdent + "Fields";
    }
  }, {
    key: "declaredFragments",
    get: function get() {
      var _this5 = this;

      return (0, _functional.cachedProperty)(this, "declaredFragments", function () {
        return _this5.typeStruct.bind(function (ts) {
          return ts.declaredFragment;
        }).either(_this5.struct.bind(function (struct) {
          return struct.declaredFragments;
        }));
      });
    }
  }, {
    key: "struct",
    get: function get() {
      var _this6 = this;

      return (0, _functional.cachedProperty)(this, "struct", function () {
        return _this6.typeDecon.getStruct().map(function (fields) {
          return new IdolGraphqlQueriesCodegenStruct(_this6, fields.map(function (tsDecon) {
            return new IdolGraphQLQueriesCodegenTypeStruct(_this6.parent, tsDecon);
          }));
        });
      });
    }
  }, {
    key: "typeStruct",
    get: function get() {
      var _this7 = this;

      return (0, _functional.cachedProperty)(this, "typeStruct", function () {
        return _this7.typeDecon.getTypeStruct().map(function (tsDecon) {
          return new IdolGraphqlCodegenTypeStructDeclaration(_this7, tsDecon);
        });
      });
    }
  }]);

  return IdolGraphqlQueriesCodegenFile;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlQueriesCodegenFile = IdolGraphqlQueriesCodegenFile;

var IdolGraphqlQueriesScaffoldFile =
/*#__PURE__*/
function (_GeneratorFileContext2) {
  _inherits(IdolGraphqlQueriesScaffoldFile, _GeneratorFileContext2);

  function IdolGraphqlQueriesScaffoldFile(idolGraphqlQueries, path, type) {
    var _this8;

    _classCallCheck(this, IdolGraphqlQueriesScaffoldFile);

    _this8 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlQueriesScaffoldFile).call(this, idolGraphqlQueries, path));
    _this8.typeDecon = (0, _generators.getMaterialTypeDeconstructor)(idolGraphqlQueries.config.params.allTypes, type);
    _this8.type = type;

    _this8.reserveIdent(_this8.defaultQueryName);

    _this8.reserveIdent(_this8.defaultMutationName);

    _this8.reserveIdent(_this8.defaultFragmentName);

    return _this8;
  }

  _createClass(IdolGraphqlQueriesScaffoldFile, [{
    key: "defaultGraphqlTypeName",
    value: function defaultGraphqlTypeName(inputVariant) {
      return this.type.named.typeName + (inputVariant ? "Input" : "");
    }
  }, {
    key: "defaultQueryName",
    get: function get() {
      return this.type.named.typeName + "Query";
    }
  }, {
    key: "defaultMutationName",
    get: function get() {
      return this.type.named.typeName + "Mutation";
    }
  }, {
    key: "defaultFragmentName",
    get: function get() {
      return this.type.named.typeName + "Fragment";
    }
  }, {
    key: "struct",
    get: function get() {
      var _this9 = this;

      return (0, _functional.cachedProperty)(this, "struct", function () {
        return _this9.typeDecon.getStruct().map(function (fields) {
          return new ((0, _generators.includesTag)(_this9.type.tags, "service") ? IdolGraphqlService : IdolGraphqlScaffoldStruct)(_this9, fields.map(function (tsDecon) {
            return new IdolGraphQLQueriesCodegenTypeStruct(_this9.parent, tsDecon);
          }));
        });
      });
    }
  }, {
    key: "declaredFragments",
    get: function get() {
      var _this10 = this;

      return (0, _functional.cachedProperty)(this, "declaredFragments", function () {
        var codegenFile = _this10.parent.codegenFile(_this10.typeDecon.t.named);

        return codegenFile.declaredFragments.map(function (fragment) {
          return _this10["export"](_this10.defaultFragmentName, scripter.variable(_this10.importIdent(fragment)));
        });
      });
    }
  }]);

  return IdolGraphqlQueriesScaffoldFile;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlQueriesScaffoldFile = IdolGraphqlQueriesScaffoldFile;

var IdolGraphqlQueriesCodegenStruct =
/*#__PURE__*/
function (_GeneratorFileContext3) {
  _inherits(IdolGraphqlQueriesCodegenStruct, _GeneratorFileContext3);

  function IdolGraphqlQueriesCodegenStruct(codegenFile, fields) {
    var _this11;

    _classCallCheck(this, IdolGraphqlQueriesCodegenStruct);

    _this11 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlQueriesCodegenStruct).call(this, codegenFile.parent, codegenFile.path));
    _this11.fields = fields;
    _this11.codegenFile = codegenFile;
    return _this11;
  }

  _createClass(IdolGraphqlQueriesCodegenStruct, [{
    key: "declaredFragments",
    get: function get() {
      var _this12 = this;

      return (0, _functional.cachedProperty)(this, "declaredFragments", function () {
        var fieldFragments = _this12.fields.mapAndFilter(function (codegenTypeStruct) {
          return codegenTypeStruct.fragmentExpr.bind(function (fragment) {
            return codegenTypeStruct.graphqlFieldsName.map(function (fragmentName) {
              return [fragmentName, _this12.applyExpr(fragment)];
            });
          });
        });

        var fragments = Object.keys(fieldFragments.values().reduce(function (o, n) {
          o[n[1]] = n;
          return o;
        }, {}));
        return _functional.Alt.lift(_this12["export"](_this12.codegenFile.defaultFragmentName, function (ident) {
          return [scripter.comment((0, _generators.getTagValues)(_this12.codegenFile.typeDecon.t.tags, "description").join("\n")), scripter.variable(_this12.applyExpr(graphqlTag.apply(void 0, ["fragment ".concat(_this12.codegenFile.graphqlFieldsName, " on ").concat(_this12.codegenFile.graphqlTypeName, " {")].concat(_toConsumableArray(_this12.fields.concatMap(function (fieldName, _) {
            return ["    " + fieldName + (fieldName in fieldFragments.obj ? "{ ...".concat(fieldFragments.obj[fieldName][0], " }") : "")];
          }, [])), ["}"], _toConsumableArray(fragments.map(function (fragmentIdent) {
            return "${" + fragmentIdent + "}";
          }))))))(ident)];
        }));
      });
    }
  }]);

  return IdolGraphqlQueriesCodegenStruct;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlQueriesCodegenStruct = IdolGraphqlQueriesCodegenStruct;

var IdolGraphQLQueriesCodegenTypeStruct =
/*#__PURE__*/
function () {
  function IdolGraphQLQueriesCodegenTypeStruct(idolGraphqlQueries, tsDecon) {
    _classCallCheck(this, IdolGraphQLQueriesCodegenTypeStruct);

    this.tsDecon = tsDecon;
    this.state = idolGraphqlQueries.state;
    this.config = idolGraphqlQueries.config;
    this.idolGraphqlQueries = idolGraphqlQueries;
  }

  _createClass(IdolGraphQLQueriesCodegenTypeStruct, [{
    key: "fragmentExpr",
    get: function get() {
      return this.innerScalar.bind(function (scalar) {
        return scalar.fragmentExpr;
      });
    }
  }, {
    key: "graphqlTypeName",
    get: function get() {
      var _this13 = this;

      return this.tsDecon.getRepeated().bind(function (_) {
        return _this13.innerScalar.bind(function (scalar) {
          return scalar.graphqlTypeName;
        }).map(function (s) {
          return s + "[]";
        });
      }).concat(this.innerScalar.bind(function (scalar) {
        return scalar.graphqlTypeName;
      }));
    }
  }, {
    key: "graphqlFieldsName",
    get: function get() {
      return this.innerScalar.bind(function (scalar) {
        return scalar.graphqlFieldsName;
      });
    }
  }, {
    key: "innerScalar",
    get: function get() {
      var _this14 = this;

      return (0, _functional.cachedProperty)(this, "innerScalar", function () {
        return _this14.tsDecon.getScalar().concat(_this14.tsDecon.getMap()).concat(_this14.tsDecon.getRepeated()).map(function (scalarDecon) {
          return new IdolGraphqlCodegenScalar(_this14.idolGraphqlQueries, scalarDecon);
        });
      }).concat(this.tsDecon.getMap().map(function (map) {
        return new IdolGraphqlCodegenScalar(_this14.idolGraphqlQueries, new _generators.ScalarDeconstructor(new _TypeStruct.TypeStruct(_TypeStruct.TypeStruct.expand({
          primitive_type: _PrimitiveType.PrimitiveType.ANY
        })), map.context));
      }));
    }
  }]);

  return IdolGraphQLQueriesCodegenTypeStruct;
}();

exports.IdolGraphQLQueriesCodegenTypeStruct = IdolGraphQLQueriesCodegenTypeStruct;

var IdolGraphqlCodegenTypeStructDeclaration =
/*#__PURE__*/
function (_IdolGraphQLQueriesCo) {
  _inherits(IdolGraphqlCodegenTypeStructDeclaration, _IdolGraphQLQueriesCo);

  function IdolGraphqlCodegenTypeStructDeclaration(codegenFile, tsDecon) {
    var _this15;

    _classCallCheck(this, IdolGraphqlCodegenTypeStructDeclaration);

    _this15 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlCodegenTypeStructDeclaration).call(this, codegenFile.parent, tsDecon));
    _this15.codegenFile = codegenFile;
    return _this15;
  }

  _createClass(IdolGraphqlCodegenTypeStructDeclaration, [{
    key: "path",
    get: function get() {
      return this.codegenFile.path;
    }
  }, {
    key: "export",
    get: function get() {
      return _generators.GeneratorFileContext.prototype["export"];
    }
  }, {
    key: "applyExpr",
    get: function get() {
      return _generators.GeneratorFileContext.prototype.applyExpr;
    }
  }, {
    key: "declaredFragment",
    get: function get() {
      var _this16 = this;

      return (0, _functional.cachedProperty)(this, "declaredFragment", function () {
        return _this16.fragmentExpr.map(function (expr) {
          return _this16["export"](_this16.codegenFile.defaultFragmentName, scripter.commented((0, _generators.getTagValues)(_this16.tsDecon.context.typeTags, "description").join("\n"), scripter.variable(_this16.applyExpr(expr))));
        });
      });
    }
  }]);

  return IdolGraphqlCodegenTypeStructDeclaration;
}(IdolGraphQLQueriesCodegenTypeStruct);

exports.IdolGraphqlCodegenTypeStructDeclaration = IdolGraphqlCodegenTypeStructDeclaration;

var IdolGraphqlCodegenScalar =
/*#__PURE__*/
function () {
  function IdolGraphqlCodegenScalar(idolGraphqlQueries, scalarDecon) {
    _classCallCheck(this, IdolGraphqlCodegenScalar);

    this.scalarDecon = scalarDecon;
    this.state = idolGraphqlQueries.state;
    this.config = idolGraphqlQueries.config;
    this.idolGraphqlQueries = idolGraphqlQueries;
  }

  _createClass(IdolGraphqlCodegenScalar, [{
    key: "fragmentExpr",
    get: function get() {
      var _this17 = this;

      return this.scalarDecon.getAlias().map(function (ref) {
        return (0, _generators.getMaterialTypeDeconstructor)(_this17.config.params.allTypes, _this17.config.params.allTypes.obj[ref.qualified_name]);
      }).bind(function (tDecon) {
        return _this17.idolGraphqlQueries.codegenFile(tDecon.t.named).declaredFragments.map(_generators.importExpr);
      });
    }
  }, {
    key: "graphqlFieldsName",
    get: function get() {
      var _this18 = this;

      return this.scalarDecon.getAlias().map(function (ref) {
        return (0, _generators.getMaterialTypeDeconstructor)(_this18.config.params.allTypes, _this18.config.params.allTypes.obj[ref.qualified_name]);
      }).map(function (tDecon) {
        return _this18.idolGraphqlQueries.codegenFile(tDecon.t.named).graphqlFieldsName;
      });
    }
  }, {
    key: "graphqlTypeName",
    get: function get() {
      var _this19 = this;

      return this.scalarDecon.getPrimitive().map(function (prim) {
        if (prim === _PrimitiveType.PrimitiveType.ANY) {
          return _this19.idolGraphqlQueries.anythingGraphqlTypeName;
        } else if (prim === _PrimitiveType.PrimitiveType.BOOL) {
          return "GraphQLBoolean";
        } else if (prim === _PrimitiveType.PrimitiveType.DOUBLE) {
          return "GraphQLFloat";
        } else if (prim === _PrimitiveType.PrimitiveType.INT) {
          return "GraphQLInt";
        } else if (prim === _PrimitiveType.PrimitiveType.STRING) {
          return "GraphQLString";
        }

        throw new Error("Unexpected primitive type ".concat(prim));
      });
    }
  }]);

  return IdolGraphqlCodegenScalar;
}();

exports.IdolGraphqlCodegenScalar = IdolGraphqlCodegenScalar;

var IdolGraphqlScaffoldStruct =
/*#__PURE__*/
function (_GeneratorFileContext4) {
  _inherits(IdolGraphqlScaffoldStruct, _GeneratorFileContext4);

  function IdolGraphqlScaffoldStruct(scaffoldFile, fields) {
    var _this20;

    _classCallCheck(this, IdolGraphqlScaffoldStruct);

    _this20 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlScaffoldStruct).call(this, scaffoldFile.parent, scaffoldFile.path));
    _this20.fields = fields;
    _this20.scaffoldFile = scaffoldFile;
    _this20.codegenFile = _this20.parent.codegenFile(_this20.scaffoldFile.typeDecon.t.named);
    return _this20;
  }

  _createClass(IdolGraphqlScaffoldStruct, [{
    key: "fragmentsExpr",
    get: function get() {
      return this.codegenFile.declaredFragments.map(_generators.importExpr);
    }
  }, {
    key: "declaredFragments",
    get: function get() {
      var _this21 = this;

      return (0, _functional.cachedProperty)(this, "declaredFragments", function () {
        return _this21.fragmentsExpr.map(function (fragments) {
          return _this21["export"](_this21.scaffoldFile.defaultFragmentName, scripter.variable(_this21.applyExpr(fragments)));
        });
      });
    }
  }]);

  return IdolGraphqlScaffoldStruct;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlScaffoldStruct = IdolGraphqlScaffoldStruct;

var IdolGraphqlService =
/*#__PURE__*/
function (_IdolGraphqlScaffoldS) {
  _inherits(IdolGraphqlService, _IdolGraphqlScaffoldS);

  function IdolGraphqlService() {
    _classCallCheck(this, IdolGraphqlService);

    return _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlService).apply(this, arguments));
  }

  return IdolGraphqlService;
}(IdolGraphqlScaffoldStruct);

exports.IdolGraphqlService = IdolGraphqlService;

var IdolGraphqlMethod =
/*#__PURE__*/
function () {
  function IdolGraphqlMethod(idolGraphqlQueries, tDecon) {
    _classCallCheck(this, IdolGraphqlMethod);

    this.tDecon = tDecon;
    this.state = idolGraphqlQueries.state;
    this.config = idolGraphqlQueries.config;
    this.idolGraphqlQueries = idolGraphqlQueries;
  }

  _createClass(IdolGraphqlMethod, [{
    key: "methodExpr",
    get: function get() {
      var _this22 = this;

      return this.tDecon.getStruct().bind(function (fields) {
        var outputTypeExpr = fields.get("output").bind(function (outputTs) {
          return new IdolGraphQLQueriesCodegenTypeStruct(_this22.idolGraphqlQueries, outputTs, false).typeExpr;
        });
        var inputFields = fields.get("input").bind(function (inputTs) {
          return inputTs.getScalar().bind(function (scalar) {
            return scalar.getAlias();
          });
        }).bind(function (ref) {
          var materialType = (0, _generators.getMaterialTypeDeconstructor)(_this22.config.params.allTypes, _this22.config.params.allTypes.obj[ref.qualified_name]);
          return _this22.idolGraphqlQueries.codegenFile(materialType.t.named, true).struct.bind(function (struct) {
            return struct.declaredFields;
          });
        });

        if (outputTypeExpr.isEmpty() || inputFields.isEmpty()) {
          throw new Error("GraphQL methods required input and output fields, which must be structs with fields.");
        }

        return outputTypeExpr.bind(function (output) {
          return inputFields.map(function (inputFields) {
            return function (state, path) {
              return scripter.objLiteral(scripter.propDec("type", output(state, path)), scripter.propDec("resolve", scripter.arrowFunc(["root", "args", "context"], scripter.literal(null))), scripter.propDec("args", scripter.objLiteral(scripter.spread(state.importIdent(path, inputFields)))), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this22.tDecon.t.tags, "description").join("\n"))));
            };
          });
        });
      });
    }
  }]);

  return IdolGraphqlMethod;
}();

exports.IdolGraphqlMethod = IdolGraphqlMethod;

function main() {
  var params = (0, _cli.start)({
    flags: {},
    args: {
      target: "idol module names whose contents will have extensible types scaffolded.",
      output: "a directory to generate the scaffolds and codegen into."
    }
  });
  var config = new _generators.GeneratorConfig(params);
  config.withPathMappings({
    codegen: config.inCodegenDir(_generators.GeneratorConfig.oneFilePerType),
    scaffold: _generators.GeneratorConfig.oneFilePerType
  });
  var idolGraphqlQueries = new IdolGraphqlQueries(config);
  var moveTo = (0, _generators.build)(config, idolGraphqlQueries.render());
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}