#! /usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IdolGraphqlMethod = exports.IdolGraphqlService = exports.IdolGraphqlScaffoldStruct = exports.IdolGraphqlCodegenScalar = exports.IdolGraphqlCodegenTypeStructDeclaration = exports.IdolGraphQLCodegenTypeStruct = exports.IdolGraphqlCodegenEnum = exports.IdolGraphqlCodegenStruct = exports.IdolGraphqlQueriesScaffoldFile = exports.IdolGraphqlQueriesCodegenFile = exports.IdolGraphqlQueries = void 0;

var _path = require("path");

var scripter = _interopRequireWildcard(require("./scripter"));

var _cli = require("./cli");

var _Reference = require("./js/schema/Reference");

var _Type = require("./js/schema/Type");

var _generators = require("./generators");

var _functional = require("./functional");

var _PrimitiveType = require("./js/schema/PrimitiveType");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

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
        var scaffoldFile = _this3.scaffoldFile(t.named, false);

        if (!scaffoldFile.declaredTypeIdent.isEmpty()) {
          console.log("Generated ".concat(scaffoldFile.defaultTypeName, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        } else {
          console.log("Skipped ".concat(scaffoldFile.defaultTypeName, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        }
      });
      return this.state.render({
        codegen: "DO NOT EDIT\nThis file was generated by idol_graphql_queries, any changes will be overwritten when idol_graphql_queries is run again.",
        scaffold: "This file was scaffolded by idol_graphql_queries.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_graphql_queries."
      });
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
    return state.importIdent(path, gql) + "`" + lines.join("\n") + "`;";
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

    _this4.reserveIdent(_this4.defaultTypeIdentName);

    return _this4;
  }

  _createClass(IdolGraphqlQueriesCodegenFile, [{
    key: "type",
    get: function get() {
      return this.typeDecon.t;
    }
  }, {
    key: "defaultTypeIdentName",
    get: function get() {
      return this.defaultTypeName + "Type";
    }
  }, {
    key: "defaultTypeName",
    get: function get() {
      return this.type.named.asQualifiedIdent + (this.inputTypeVariant ? "Input" : "");
    }
  }, {
    key: "defaultGraphQLTypeName",
    get: function get() {
      if (this.type.named.qualifiedName in this.config.params.scaffoldTypes.obj) {
        return this.parent.defaultGraphqlTypeName(this.type, this.inputTypeVariant);
      }

      return this.defaultTypeName;
    }
  }, {
    key: "defaultFieldsName",
    get: function get() {
      return this.type.named.asQualifiedIdent + (this.inputTypeVariant ? "InputFields" : "Fields");
    }
  }, {
    key: "defaultEnumName",
    get: function get() {
      return this.type.named.asQualifiedIdent;
    }
  }, {
    key: "declaredTypeIdent",
    get: function get() {
      var _this5 = this;

      return (0, _functional.cachedProperty)(this, "declaredTypeIdent", function () {
        return _this5["enum"].bind(function (e) {
          return e.declaredType;
        }).either(_this5.typeStruct.bind(function (ts) {
          return ts.declaredType;
        })).either(_this5.struct.bind(function (struct) {
          return struct.declaredType;
        }));
      });
    }
  }, {
    key: "struct",
    get: function get() {
      var _this6 = this;

      return (0, _functional.cachedProperty)(this, "struct", function () {
        return _this6.typeDecon.getStruct().map(function (fields) {
          return new IdolGraphqlCodegenStruct(_this6, fields.map(function (tsDecon) {
            return new IdolGraphQLCodegenTypeStruct(_this6.parent, tsDecon, _this6.inputTypeVariant);
          }));
        });
      });
    }
  }, {
    key: "enum",
    get: function get() {
      var _this7 = this;

      return (0, _functional.cachedProperty)(this, "enum", function () {
        return _this7.typeDecon.getEnum().map(function (options) {
          return new IdolGraphqlCodegenEnum(_this7, options);
        });
      });
    }
  }, {
    key: "typeStruct",
    get: function get() {
      var _this8 = this;

      return (0, _functional.cachedProperty)(this, "typeStruct", function () {
        return _this8.typeDecon.getTypeStruct().map(function (tsDecon) {
          return new IdolGraphqlCodegenTypeStructDeclaration(_this8, tsDecon);
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
    var _this9;

    _classCallCheck(this, IdolGraphqlQueriesScaffoldFile);

    _this9 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlQueriesScaffoldFile).call(this, idolGraphqlQueries, path));
    _this9.typeDecon = (0, _generators.getMaterialTypeDeconstructor)(idolGraphqlQueries.config.params.allTypes, type);
    _this9.type = type;

    _this9.reserveIdent(_this9.defaultTypeIdentName);

    return _this9;
  }

  _createClass(IdolGraphqlQueriesScaffoldFile, [{
    key: "defaultTypeIdentName",
    get: function get() {
      return this.defaultTypeName + "Type";
    }
  }, {
    key: "defaultTypeName",
    get: function get() {
      return this.parent.defaultGraphqlTypeName(this.type, this.inputVariant);
    } // Used exclusively by services.

  }, {
    key: "defaultQueriesName",
    get: function get() {
      return this.type.named.typeName + "Queries";
    }
  }, {
    key: "struct",
    get: function get() {
      var _this10 = this;

      return (0, _functional.cachedProperty)(this, "struct", function () {
        return _this10.typeDecon.getStruct().map(function (fields) {
          return new ((0, _generators.includesTag)(_this10.type.tags, "service") ? IdolGraphqlService : IdolGraphqlScaffoldStruct)(_this10, fields.map(function (tsDecon) {
            return new IdolGraphQLCodegenTypeStruct(_this10.parent, tsDecon, _this10.inputVariant);
          }));
        });
      });
    }
  }, {
    key: "declaredTypeIdent",
    get: function get() {
      var _this11 = this;

      return (0, _functional.cachedProperty)(this, "declaredTypeIdent", function () {
        var codegenFile = _this11.parent.codegenFile(_this11.typeDecon.t.named, _this11.inputVariant);

        return _this11.struct.bind(function (struct) {
          return struct.declaredType;
        }).either(codegenFile.typeStruct.bind(function (ts) {
          return ts.declaredType;
        }).either(codegenFile["enum"].bind(function (e) {
          return e.declaredType;
        })).map(function (declaredType) {
          return scripter.variable(_this11.importIdent(declaredType));
        }).map(function (scriptable) {
          return _this11["export"](_this11.defaultTypeIdentName, scriptable);
        }));
      });
    }
  }]);

  return IdolGraphqlQueriesScaffoldFile;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlQueriesScaffoldFile = IdolGraphqlQueriesScaffoldFile;

var IdolGraphqlCodegenStruct =
/*#__PURE__*/
function (_GeneratorFileContext3) {
  _inherits(IdolGraphqlCodegenStruct, _GeneratorFileContext3);

  function IdolGraphqlCodegenStruct(codegenFile, fields) {
    var _this12;

    _classCallCheck(this, IdolGraphqlCodegenStruct);

    _this12 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlCodegenStruct).call(this, codegenFile.parent, codegenFile.path));
    _this12.fields = fields;
    _this12.codegenFile = codegenFile;
    return _this12;
  }

  _createClass(IdolGraphqlCodegenStruct, [{
    key: "declaredFields",
    get: function get() {
      var _this13 = this;

      return (0, _functional.cachedProperty)(this, "declaredFields", function () {
        var fieldTypes = _this13.fields.mapAndFilter(function (codegenTypeStruct) {
          return codegenTypeStruct.typeExpr;
        }).map(function (expr) {
          return _this13.applyExpr(expr);
        });

        return _functional.Alt.lift(_this13["export"](_this13.codegenFile.defaultFieldsName, function (ident) {
          return [scripter.comment((0, _generators.getTagValues)(_this13.codegenFile.typeDecon.t.tags, "description").join("\n")), scripter.variable(scripter.objLiteral.apply(scripter, _toConsumableArray(fieldTypes.concatMap(function (fieldName, fieldType) {
            return [scripter.propDec(fieldName, scripter.objLiteral(scripter.propDec("type", fieldType), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this13.fields.obj[fieldName].tsDecon.context.fieldTags, "description").join("\n")))))];
          }, []))))(ident)];
        }));
      });
    }
  }, {
    key: "declaredType",
    get: function get() {
      var _this14 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this14.declaredFields.map(function (declaredFields) {
          return _this14["export"](_this14.codegenFile.defaultTypeIdentName, scripter.variable("new " + scripter.invocation(_this14.importIdent(exportedFromGraphQL(_this14.codegenFile.inputTypeVariant ? "GraphQLInputObjectType" : "GraphQLObjectType")), scripter.objLiteral(scripter.propDec("name", scripter.literal(_this14.codegenFile.defaultGraphQLTypeName)), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this14.codegenFile.typeDecon.t.tags, "description").join("\n"))), scripter.propDec("fields", scripter.objLiteral(scripter.spread(_this14.importIdent(declaredFields))))))));
        });
      });
    }
  }]);

  return IdolGraphqlCodegenStruct;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlCodegenStruct = IdolGraphqlCodegenStruct;

var IdolGraphqlCodegenEnum =
/*#__PURE__*/
function (_GeneratorFileContext4) {
  _inherits(IdolGraphqlCodegenEnum, _GeneratorFileContext4);

  function IdolGraphqlCodegenEnum(codegenFile, options) {
    var _this15;

    _classCallCheck(this, IdolGraphqlCodegenEnum);

    _this15 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlCodegenEnum).call(this, codegenFile.parent, codegenFile.path));
    _this15.codegenFile = codegenFile;
    _this15.options = options;
    return _this15;
  }

  _createClass(IdolGraphqlCodegenEnum, [{
    key: "declaredEnum",
    get: function get() {
      var _this16 = this;

      return (0, _functional.cachedProperty)(this, "declaredEnum", function () {
        return _functional.Alt.lift(_this16["export"](_this16.codegenFile.defaultEnumName, function (ident) {
          return [scripter.comment((0, _generators.getTagValues)(_this16.codegenFile.typeDecon.t.tags, "description").join("\n")), scripter.variable(scripter.objLiteral.apply(scripter, _toConsumableArray(_this16.options.map(function (option) {
            return scripter.propDec(option.toUpperCase(), scripter.literal(option));
          }))))(ident)];
        }));
      });
    }
  }, {
    key: "declaredType",
    get: function get() {
      var _this17 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this17.declaredEnum.map(function (declaredEnum) {
          return _this17["export"](_this17.codegenFile.defaultTypeIdentName, function (ident) {
            return [scripter.variable("new " + scripter.invocation(_this17.importIdent(exportedFromGraphQL("GraphQLEnumType")), scripter.objLiteral(scripter.propDec("name", scripter.literal(_this17.codegenFile.defaultGraphQLTypeName)), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this17.codegenFile.typeDecon.t.tags, "description").join("\n"))), scripter.propDec("values", scripter.invocation(_this17.importIdent(_this17.codegenFile.parent.idolGraphQlFile.wrapValues), _this17.importIdent(declaredEnum))))))(ident)];
          });
        });
      });
    }
  }]);

  return IdolGraphqlCodegenEnum;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlCodegenEnum = IdolGraphqlCodegenEnum;

var IdolGraphQLCodegenTypeStruct =
/*#__PURE__*/
function () {
  function IdolGraphQLCodegenTypeStruct(idolGraphqlQueries, tsDecon, inputVariant) {
    _classCallCheck(this, IdolGraphQLCodegenTypeStruct);

    this.tsDecon = tsDecon;
    this.state = idolGraphqlQueries.state;
    this.config = idolGraphqlQueries.config;
    this.idolGraphqlQueries = idolGraphqlQueries;
    this.inputVariant = inputVariant;
  }

  _createClass(IdolGraphQLCodegenTypeStruct, [{
    key: "typeExpr",
    get: function get() {
      return this.scalarTypeExpr.concat(this.collectionTypeExpr);
    }
  }, {
    key: "scalarTypeExpr",
    get: function get() {
      if (this.tsDecon.getScalar().isEmpty()) return _functional.Alt.empty();
      return this.innerScalar.bind(function (scalar) {
        return scalar.typeExpr;
      });
    }
  }, {
    key: "mapTypeExpr",
    get: function get() {
      var _this18 = this;

      return this.tsDecon.getMap().map(function () {
        return (0, _generators.importExpr)(_this18.idolGraphqlQueries.idolGraphQlFile.Anything);
      });
    }
  }, {
    key: "repeatedTypeExpr",
    get: function get() {
      var _this19 = this;

      return this.tsDecon.getRepeated().bind(function () {
        return _this19.innerScalar.bind(function (innerScalar) {
          return innerScalar.typeExpr;
        });
      }).map(function (scalarExpr) {
        return function (state, path) {
          return "new " + scripter.invocation(state.importIdent(path, exportedFromGraphQL("GraphQLList")), scalarExpr(state, path));
        };
      });
    }
  }, {
    key: "collectionTypeExpr",
    get: function get() {
      return this.mapTypeExpr.either(this.repeatedTypeExpr);
    }
  }, {
    key: "innerScalar",
    get: function get() {
      var _this20 = this;

      return (0, _functional.cachedProperty)(this, "innerScalar", function () {
        return _this20.tsDecon.getScalar().concat(_this20.tsDecon.getMap()).concat(_this20.tsDecon.getRepeated()).map(function (scalarDecon) {
          return new IdolGraphqlCodegenScalar(_this20.idolGraphqlQueries, scalarDecon, _this20.inputVariant);
        });
      });
    }
  }]);

  return IdolGraphQLCodegenTypeStruct;
}();

exports.IdolGraphQLCodegenTypeStruct = IdolGraphQLCodegenTypeStruct;

var IdolGraphqlCodegenTypeStructDeclaration =
/*#__PURE__*/
function (_IdolGraphQLCodegenTy) {
  _inherits(IdolGraphqlCodegenTypeStructDeclaration, _IdolGraphQLCodegenTy);

  function IdolGraphqlCodegenTypeStructDeclaration(codegenFile, tsDecon) {
    var _this21;

    _classCallCheck(this, IdolGraphqlCodegenTypeStructDeclaration);

    _this21 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlCodegenTypeStructDeclaration).call(this, codegenFile.parent, tsDecon, codegenFile.inputTypeVariant));
    _this21.codegenFile = codegenFile;
    return _this21;
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
    key: "declaredType",
    get: function get() {
      var _this22 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this22.typeExpr.map(function (expr) {
          return _this22["export"](_this22.codegenFile.defaultTypeIdentName, scripter.commented((0, _generators.getTagValues)(_this22.tsDecon.context.typeTags, "description").join("\n"), scripter.variable(_this22.applyExpr(expr))));
        });
      });
    }
  }, {
    key: "scalarTypeExpr",
    get: function get() {
      if (this.tsDecon.getScalar().isEmpty()) return _functional.Alt.empty();
      return _get(_getPrototypeOf(IdolGraphqlCodegenTypeStructDeclaration.prototype), "scalarTypeExpr", this).either(this.literalTypeExpr);
    }
  }, {
    key: "literalTypeExpr",
    get: function get() {
      var _this23 = this;

      return this.tsDecon.getScalar().bind(function (scalar) {
        return scalar.getLiteral();
      }).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            _ = _ref2[0],
            val = _ref2[1];

        return function (state, path) {
          return scripter.invocation(state.importIdent(path, _this23.idolGraphqlQueries.idolGraphQlFile.LiteralTypeOf), scripter.literal(_this23.codegenFile.defaultTypeName), scripter.literal(val), scripter.literal((0, _generators.getTagValues)(_this23.tsDecon.context.typeTags, "description").join("\n")));
        };
      });
    }
  }]);

  return IdolGraphqlCodegenTypeStructDeclaration;
}(IdolGraphQLCodegenTypeStruct);

exports.IdolGraphqlCodegenTypeStructDeclaration = IdolGraphqlCodegenTypeStructDeclaration;

var IdolGraphqlCodegenScalar =
/*#__PURE__*/
function () {
  function IdolGraphqlCodegenScalar(idolGraphqlQueries, scalarDecon, inputVariant) {
    _classCallCheck(this, IdolGraphqlCodegenScalar);

    this.scalarDecon = scalarDecon;
    this.state = idolGraphqlQueries.state;
    this.config = idolGraphqlQueries.config;
    this.idolGraphqlQueries = idolGraphqlQueries;
    this.inputVariant = inputVariant;
  }

  _createClass(IdolGraphqlCodegenScalar, [{
    key: "typeExpr",
    get: function get() {
      return this.referenceImportExpr.either(this.primTypeExpr);
    }
  }, {
    key: "referenceImportExpr",
    get: function get() {
      var _this24 = this;

      var aliasScaffoldFile = this.scalarDecon.getAlias().filter(function (ref) {
        return ref.qualified_name in _this24.config.params.scaffoldTypes.obj;
      }).map(function (ref) {
        return _this24.idolGraphqlQueries.scaffoldFile(ref, _this24.inputVariant);
      });

      if (aliasScaffoldFile.isEmpty()) {
        var aliasCodegenFile = this.scalarDecon.getAlias().map(function (ref) {
          return _this24.idolGraphqlQueries.codegenFile(ref, _this24.inputVariant);
        });
        return aliasCodegenFile.bind(function (codegenFile) {
          return codegenFile.declaredTypeIdent;
        }).map(function (codegenType) {
          return (0, _generators.importExpr)(codegenType, "Codegen" + codegenType.ident);
        });
      }

      return aliasScaffoldFile.bind(function (scaffoldFile) {
        return scaffoldFile.declaredTypeIdent;
      }).map(function (scaffoldType) {
        return (0, _generators.importExpr)(scaffoldType, "Scaffold" + scaffoldType.ident);
      });
    }
  }, {
    key: "primTypeExpr",
    get: function get() {
      var _this25 = this;

      return this.scalarDecon.getPrimitive().map(function (prim) {
        if (prim === _PrimitiveType.PrimitiveType.ANY) {
          return (0, _generators.importExpr)(_this25.idolGraphqlQueries.idolGraphQlFile.Anything);
        } else if (prim === _PrimitiveType.PrimitiveType.BOOL) {
          return (0, _generators.importExpr)(exportedFromGraphQL("GraphQLBoolean"));
        } else if (prim === _PrimitiveType.PrimitiveType.DOUBLE) {
          return (0, _generators.importExpr)(exportedFromGraphQL("GraphQLFloat"));
        } else if (prim === _PrimitiveType.PrimitiveType.INT) {
          return (0, _generators.importExpr)(exportedFromGraphQL("GraphQLInt"));
        } else if (prim === _PrimitiveType.PrimitiveType.STRING) {
          return (0, _generators.importExpr)(exportedFromGraphQL("GraphQLString"));
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
function (_GeneratorFileContext5) {
  _inherits(IdolGraphqlScaffoldStruct, _GeneratorFileContext5);

  function IdolGraphqlScaffoldStruct(scaffoldFile, fields) {
    var _this26;

    _classCallCheck(this, IdolGraphqlScaffoldStruct);

    _this26 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlScaffoldStruct).call(this, scaffoldFile.parent, scaffoldFile.path));
    _this26.fields = fields;
    _this26.scaffoldFile = scaffoldFile;
    _this26.codegenFile = _this26.parent.codegenFile(_this26.scaffoldFile.typeDecon.t.named, _this26.scaffoldFile.inputVariant);
    return _this26;
  }

  _createClass(IdolGraphqlScaffoldStruct, [{
    key: "declaredFields",
    get: function get() {
      return this.codegenFile.struct.bind(function (struct) {
        return struct.declaredFields;
      }).map(_generators.importExpr);
    }
  }, {
    key: "declaredType",
    get: function get() {
      var _this27 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this27.declaredFields.map(function (declaredFields) {
          return _this27["export"](_this27.scaffoldFile.defaultTypeIdentName, scripter.variable("new " + scripter.invocation(_this27.importIdent(exportedFromGraphQL(_this27.scaffoldFile.inputVariant ? "GraphQLInputObjectType" : "GraphQLObjectType")), scripter.objLiteral(scripter.propDec("name", scripter.literal(_this27.scaffoldFile.defaultTypeName)), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this27.scaffoldFile.typeDecon.t.tags, "description").join("\n"))), scripter.propDec("fields", scripter.objLiteral(scripter.spread(_this27.applyExpr(declaredFields))))))));
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

  _createClass(IdolGraphqlService, [{
    key: "declaredFields",
    get: function get() {
      var _this28 = this;

      return (0, _functional.cachedProperty)(this, "declaredFields", function () {
        var methods = _this28.fields.mapAndFilter(function (codegenTypeStruct) {
          return codegenTypeStruct.tsDecon.getScalar().bind(function (scalar) {
            return scalar.getAlias();
          }).map(function (ref) {
            return (0, _generators.getMaterialTypeDeconstructor)(_this28.config.params.allTypes, _this28.config.params.allTypes.obj[ref.qualified_name]);
          }).bind(function (tDecon) {
            return new IdolGraphqlMethod(_this28.parent, tDecon).methodExpr;
          });
        }).map(function (expr) {
          return _this28.applyExpr(expr);
        });

        return _functional.Alt.lift(_this28["export"](_this28.scaffoldFile.defaultQueriesName, function (ident) {
          return [scripter.comment((0, _generators.getTagValues)(_this28.scaffoldFile.type.tags, "description").join("\n")), scripter.variable(scripter.objLiteral.apply(scripter, _toConsumableArray(methods.concatMap(function (fieldName, method) {
            return [scripter.propDec(fieldName, method)];
          }, []))))(ident)];
        })).map(_generators.importExpr);
      });
    }
  }]);

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
      var _this29 = this;

      return this.tDecon.getStruct().bind(function (fields) {
        var outputTypeExpr = fields.get("output").bind(function (outputTs) {
          return new IdolGraphQLCodegenTypeStruct(_this29.idolGraphqlQueries, outputTs, false).typeExpr;
        });
        var inputFields = fields.get("input").bind(function (inputTs) {
          return inputTs.getScalar().bind(function (scalar) {
            return scalar.getAlias();
          });
        }).bind(function (ref) {
          var materialType = (0, _generators.getMaterialTypeDeconstructor)(_this29.config.params.allTypes, _this29.config.params.allTypes.obj[ref.qualified_name]);
          return _this29.idolGraphqlQueries.codegenFile(materialType.t.named, true).struct.bind(function (struct) {
            return struct.declaredFields;
          });
        });

        if (outputTypeExpr.isEmpty() || inputFields.isEmpty()) {
          throw new Error("GraphQL methods required input and output fields, which must be structs with fields.");
        }

        return outputTypeExpr.bind(function (output) {
          return inputFields.map(function (inputFields) {
            return function (state, path) {
              return scripter.objLiteral(scripter.propDec("type", output(state, path)), scripter.propDec("resolve", scripter.arrowFunc(["root", "args", "context"], scripter.literal(null))), scripter.propDec("args", scripter.objLiteral(scripter.spread(state.importIdent(path, inputFields)))), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this29.tDecon.t.tags, "description").join("\n"))));
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