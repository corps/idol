#! /usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withGraphqlType = withGraphqlType;
exports.addGraphqlTypeToExpr = addGraphqlTypeToExpr;
exports.wrapGraphqlExpression = wrapGraphqlExpression;
exports.importGraphqlExpr = importGraphqlExpr;
exports.exportedFromGraphQL = exportedFromGraphQL;
exports.IdolGraphqlFile = exports.IdolGraphqlMethod = exports.IdolGraphqlService = exports.IdolGraphqlScaffoldStruct = exports.IdolGraphqlCodegenScalar = exports.IdolGraphqlCodegenTypeStructDeclaration = exports.IdolGraphQLCodegenTypeStruct = exports.IdolGraphqlCodegenEnum = exports.IdolGraphqlCodegenStruct = exports.IdolGraphqlScaffoldFile = exports.IdolGraphqlCodegenFile = exports.IdolGraphqlGeneratorFileContext = exports.IdolGraphql = void 0;

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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function withGraphqlType(exported, graphqlTypeName) {
  return _objectSpread({}, exported, {
    graphqlTypeName: graphqlTypeName
  });
}

function addGraphqlTypeToExpr(expr, t) {
  var wrapped = expr(t);
  wrapped.graphqlTypeName = t.graphqlTypeName;
  return wrapped;
}

function wrapGraphqlExpression(graphqlExpr, expr, wrapType) {
  var newType = wrapType(graphqlExpr.graphqlTypeName);

  var wrapper = function wrapper(state, path) {
    return expr(graphqlExpr(state, path))(state, path);
  };

  wrapper.graphqlTypeName = newType;
  return wrapper;
}

function importGraphqlExpr(exported) {
  var asIdent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  return addGraphqlTypeToExpr(function (_) {
    return (0, _generators.importExpr)(exported, asIdent);
  }, exported);
}

var IdolGraphql =
/*#__PURE__*/
function () {
  function IdolGraphql(config) {
    _classCallCheck(this, IdolGraphql);

    this.state = new _generators.GeneratorAcc();
    this.config = config;
  }

  _createClass(IdolGraphql, [{
    key: "hasInputVariant",
    value: function hasInputVariant(t) {
      var tDecon = new _generators.TypeDeconstructor(t);
      return !tDecon.getStruct().isEmpty() || tDecon.getTypeStruct().map(function (tsDecon) {
        return tsDecon.typeStruct.isAlias;
      }).getOr(false);
    }
  }, {
    key: "codegenFile",
    value: function codegenFile(ref, inputVariant) {
      var _this = this;

      var path = this.state.reservePath(this.config.pathsOf({
        codegen: ref
      }));
      var type = this.config.params.allTypes.obj[ref.qualified_name];
      inputVariant = inputVariant && this.hasInputVariant(type);
      return (0, _functional.cachedProperty)(this, "codegenFile".concat(inputVariant.toString()).concat(path.path), function () {
        return new _this.IdolGraphqlCodegenFile(_this, path, type, inputVariant);
      });
    }
  }, {
    key: "scaffoldFile",
    value: function scaffoldFile(ref, inputVariant) {
      var _this2 = this;

      var path = this.state.reservePath(this.config.pathsOf({
        scaffold: ref
      }));
      var type = this.config.params.allTypes.obj[ref.qualified_name];
      inputVariant = inputVariant && this.hasInputVariant(type);
      return (0, _functional.cachedProperty)(this, "scaffoldFile".concat(inputVariant.toString()).concat(path.path), function () {
        return new _this2.IdolGraphqlScaffoldFile(_this2, path, type, inputVariant);
      });
    }
  }, {
    key: "defaultGraphqlTypeName",
    value: function defaultGraphqlTypeName(type, inputTypeVariant) {
      if (type.named.qualifiedName in this.config.params.scaffoldTypes.obj) {
        return type.named.typeName + (inputTypeVariant ? "Input" : "");
      }

      return type.named.asQualifiedIdent + (inputTypeVariant ? "Input" : "");
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var scaffoldTypes = this.config.params.scaffoldTypes.values();
      scaffoldTypes.forEach(function (t, i) {
        var scaffoldFile = _this3.scaffoldFile(t.named, false);

        if (!scaffoldFile.declaredTypeIdent.isEmpty()) {
          console.log("Generated ".concat(scaffoldFile.declaredGraphqlTypeName, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        } else {
          console.log("Skipped ".concat(scaffoldFile.declaredGraphqlTypeName, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        }
      });
      return this.state.render({
        codegen: "DO NOT EDIT\nThis file was generated by idol_graphql, any changes will be overwritten when idol_graphql is run again.",
        scaffold: "This file was scaffolded by idol_graphql.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_graphql."
      });
    }
  }, {
    key: "IdolGraphqlCodegenFile",
    get: function get() {
      return IdolGraphqlCodegenFile;
    }
  }, {
    key: "IdolGraphqlScaffoldFile",
    get: function get() {
      return IdolGraphqlScaffoldFile;
    }
  }, {
    key: "idolGraphQlFile",
    get: function get() {
      var _this4 = this;

      return (0, _functional.cachedProperty)(this, "idolGraphQlFile", function () {
        return new _this4.IdolGraphqlFile(_this4, _this4.state.reservePath({
          runtime: _this4.config.codegenRoot + "/__idol_graphql__.js"
        }));
      });
    }
  }, {
    key: "IdolGraphqlFile",
    get: function get() {
      return IdolGraphqlFile;
    }
  }]);

  return IdolGraphql;
}();

exports.IdolGraphql = IdolGraphql;

function exportedFromGraphQL(ident, graphqlTypeName) {
  return {
    ident: ident,
    path: new _generators.Path("graphql"),
    graphqlTypeName: graphqlTypeName
  };
}

var IdolGraphqlGeneratorFileContext =
/*#__PURE__*/
function (_GeneratorFileContext) {
  _inherits(IdolGraphqlGeneratorFileContext, _GeneratorFileContext);

  function IdolGraphqlGeneratorFileContext() {
    _classCallCheck(this, IdolGraphqlGeneratorFileContext);

    return _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlGeneratorFileContext).apply(this, arguments));
  }

  _createClass(IdolGraphqlGeneratorFileContext, [{
    key: "exportGraphqlType",
    value: function exportGraphqlType(ident, scriptable, t) {
      return withGraphqlType(this["export"](ident, scriptable(t)), t.graphqlTypeName);
    }
  }]);

  return IdolGraphqlGeneratorFileContext;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlGeneratorFileContext = IdolGraphqlGeneratorFileContext;

var IdolGraphqlCodegenFile =
/*#__PURE__*/
function (_IdolGraphqlGenerator) {
  _inherits(IdolGraphqlCodegenFile, _IdolGraphqlGenerator);

  function IdolGraphqlCodegenFile(idolGraphql, path, type, inputTypeVariant) {
    var _this5;

    _classCallCheck(this, IdolGraphqlCodegenFile);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlCodegenFile).call(this, idolGraphql, path));
    _this5.typeDecon = new _generators.TypeDeconstructor(type);
    _this5.inputTypeVariant = inputTypeVariant;

    _this5.reserveIdent(_this5.defaultTypeIdentName);

    if (!_this5.typeDecon.getEnum().isEmpty()) {
      _this5.reserveIdent(_this5.defaultEnumName);
    }

    if (!_this5.typeDecon.getStruct().isEmpty()) {
      _this5.reserveIdent(_this5.defaultFieldsName);
    }

    return _this5;
  }

  _createClass(IdolGraphqlCodegenFile, [{
    key: "type",
    get: function get() {
      return this.typeDecon.t;
    }
  }, {
    key: "defaultTypeIdentName",
    get: function get() {
      return this.newDeclaration.graphqlTypeName + "Type";
    }
  }, {
    key: "newDeclaration",
    get: function get() {
      return {
        graphqlTypeName: this.parent.defaultGraphqlTypeName(this.type, this.inputTypeVariant)
      };
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
      var _this6 = this;

      return (0, _functional.cachedProperty)(this, "declaredTypeIdent", function () {
        return _this6["enum"].bind(function (e) {
          return e.declaredType;
        }).either(_this6.typeStruct.bind(function (ts) {
          return ts.declaredType;
        })).either(_this6.struct.bind(function (struct) {
          return struct.declaredType;
        }));
      });
    }
  }, {
    key: "struct",
    get: function get() {
      var _this7 = this;

      return (0, _functional.cachedProperty)(this, "struct", function () {
        return _this7.typeDecon.getStruct().map(function (fields) {
          return new _this7.IdolGraphqlCodegenStruct(_this7, fields.map(function (tsDecon) {
            return new _this7.IdolGraphQLCodegenTypeStruct(_this7.parent, tsDecon, _this7.inputTypeVariant);
          }));
        });
      });
    }
  }, {
    key: "IdolGraphqlCodegenStruct",
    get: function get() {
      return IdolGraphqlCodegenStruct;
    }
  }, {
    key: "IdolGraphQLCodegenTypeStruct",
    get: function get() {
      return IdolGraphQLCodegenTypeStruct;
    }
  }, {
    key: "enum",
    get: function get() {
      var _this8 = this;

      return (0, _functional.cachedProperty)(this, "enum", function () {
        return _this8.typeDecon.getEnum().map(function (options) {
          return new _this8.IdolGraphqlCodegenEnum(_this8, options);
        });
      });
    }
  }, {
    key: "IdolGraphqlCodegenEnum",
    get: function get() {
      return IdolGraphqlCodegenEnum;
    }
  }, {
    key: "typeStruct",
    get: function get() {
      var _this9 = this;

      return (0, _functional.cachedProperty)(this, "typeStruct", function () {
        return _this9.typeDecon.getTypeStruct().map(function (tsDecon) {
          return new _this9.IdolGraphqlCodegenTypeStructDeclaration(_this9, tsDecon);
        });
      });
    }
  }, {
    key: "IdolGraphqlCodegenTypeStructDeclaration",
    get: function get() {
      return IdolGraphqlCodegenTypeStructDeclaration;
    }
  }]);

  return IdolGraphqlCodegenFile;
}(IdolGraphqlGeneratorFileContext);

exports.IdolGraphqlCodegenFile = IdolGraphqlCodegenFile;

var IdolGraphqlScaffoldFile =
/*#__PURE__*/
function (_IdolGraphqlGenerator2) {
  _inherits(IdolGraphqlScaffoldFile, _IdolGraphqlGenerator2);

  function IdolGraphqlScaffoldFile(idolGraphql, path, type, inputVariant) {
    var _this10;

    _classCallCheck(this, IdolGraphqlScaffoldFile);

    _this10 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlScaffoldFile).call(this, idolGraphql, path));
    _this10.typeDecon = (0, _generators.getMaterialTypeDeconstructor)(idolGraphql.config.params.allTypes, type);
    _this10.type = type;
    _this10.inputVariant = inputVariant;

    _this10.reserveIdent(_this10.defaultTypeIdentName); // Used exclusively by service objects, and not needed in the input variant form.


    if (!inputVariant) {
      _this10.reserveIdent(_this10.defaultQueriesName);
    }

    return _this10;
  }

  _createClass(IdolGraphqlScaffoldFile, [{
    key: "defaultTypeIdentName",
    get: function get() {
      return this.declaredGraphqlTypeName + "Type";
    }
  }, {
    key: "declaredGraphqlTypeName",
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
      var _this11 = this;

      return (0, _functional.cachedProperty)(this, "struct", function () {
        return _this11.typeDecon.getStruct().map(function (fields) {
          return new ((0, _generators.includesTag)(_this11.type.tags, "service") ? _this11.IdolGraphqlService : _this11.IdolGraphqlScaffoldStruct)(_this11, fields.map(function (tsDecon) {
            return new _this11.IdolGraphQLCodegenTypeStruct(_this11.parent, tsDecon, _this11.inputVariant);
          }));
        });
      });
    }
  }, {
    key: "IdolGraphqlService",
    get: function get() {
      return IdolGraphqlService;
    }
  }, {
    key: "IdolGraphqlScaffoldStruct",
    get: function get() {
      return IdolGraphqlScaffoldStruct;
    }
  }, {
    key: "IdolGraphQLCodegenTypeStruct",
    get: function get() {
      return IdolGraphQLCodegenTypeStruct;
    }
  }, {
    key: "declaredTypeIdent",
    get: function get() {
      var _this12 = this;

      return (0, _functional.cachedProperty)(this, "declaredTypeIdent", function () {
        var codegenFile = _this12.parent.codegenFile(_this12.typeDecon.t.named, _this12.inputVariant);

        return _this12.struct.bind(function (struct) {
          return struct.declaredType;
        }).either(codegenFile.typeStruct.bind(function (ts) {
          return ts.declaredType;
        }).either(codegenFile["enum"].bind(function (e) {
          return e.declaredType;
        })).map(function (declaredType) {
          return _this12.exportGraphqlType(_this12.defaultTypeIdentName, function (dt) {
            return scripter.variable(_this12.importIdent(dt));
          }, declaredType);
        }));
      });
    }
  }]);

  return IdolGraphqlScaffoldFile;
}(IdolGraphqlGeneratorFileContext);

exports.IdolGraphqlScaffoldFile = IdolGraphqlScaffoldFile;

var IdolGraphqlCodegenStruct =
/*#__PURE__*/
function (_IdolGraphqlGenerator3) {
  _inherits(IdolGraphqlCodegenStruct, _IdolGraphqlGenerator3);

  function IdolGraphqlCodegenStruct(codegenFile, fields) {
    var _this13;

    _classCallCheck(this, IdolGraphqlCodegenStruct);

    _this13 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlCodegenStruct).call(this, codegenFile.parent, codegenFile.path));
    _this13.fields = fields;
    _this13.codegenFile = codegenFile;
    return _this13;
  }

  _createClass(IdolGraphqlCodegenStruct, [{
    key: "declaredFields",
    get: function get() {
      var _this14 = this;

      return (0, _functional.cachedProperty)(this, "declaredFields", function () {
        var fieldTypes = _this14.fields.mapAndFilter(function (codegenTypeStruct) {
          return codegenTypeStruct.typeExpr;
        }).map(function (expr) {
          return _this14.applyExpr(expr);
        });

        return _functional.Alt.lift(_this14["export"](_this14.codegenFile.defaultFieldsName, function (ident) {
          return [scripter.comment((0, _generators.getTagValues)(_this14.codegenFile.typeDecon.t.tags, "description").join("\n")), scripter.variable(scripter.objLiteral.apply(scripter, _toConsumableArray(fieldTypes.concatMap(function (fieldName, fieldType) {
            return [scripter.propDec(fieldName, scripter.objLiteral(scripter.propDec("type", fieldType), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this14.fields.obj[fieldName].tsDecon.context.fieldTags, "description").join("\n")))))];
          }, []))))(ident)];
        }));
      });
    }
  }, {
    key: "declaredType",
    get: function get() {
      var _this15 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this15.declaredFields.map(function (declaredFields) {
          return _this15.exportGraphqlType(_this15.codegenFile.defaultTypeIdentName, function (_ref) {
            var graphqlTypeName = _ref.graphqlTypeName;
            return scripter.variable("new " + scripter.invocation(_this15.importIdent(exportedFromGraphQL(_this15.codegenFile.inputTypeVariant ? "GraphQLInputObjectType" : "GraphQLObjectType", "")), scripter.objLiteral(scripter.propDec("name", scripter.literal(graphqlTypeName)), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this15.codegenFile.typeDecon.t.tags, "description").join("\n"))), scripter.propDec("fields", scripter.objLiteral(scripter.spread(_this15.importIdent(declaredFields)))))));
          }, _this15.codegenFile.newDeclaration);
        });
      });
    }
  }]);

  return IdolGraphqlCodegenStruct;
}(IdolGraphqlGeneratorFileContext);

exports.IdolGraphqlCodegenStruct = IdolGraphqlCodegenStruct;

var IdolGraphqlCodegenEnum =
/*#__PURE__*/
function (_IdolGraphqlGenerator4) {
  _inherits(IdolGraphqlCodegenEnum, _IdolGraphqlGenerator4);

  function IdolGraphqlCodegenEnum(codegenFile, options) {
    var _this16;

    _classCallCheck(this, IdolGraphqlCodegenEnum);

    _this16 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlCodegenEnum).call(this, codegenFile.parent, codegenFile.path));
    _this16.codegenFile = codegenFile;
    _this16.options = options;
    return _this16;
  }

  _createClass(IdolGraphqlCodegenEnum, [{
    key: "declaredEnum",
    get: function get() {
      var _this17 = this;

      return (0, _functional.cachedProperty)(this, "declaredEnum", function () {
        return _functional.Alt.lift(_this17["export"](_this17.codegenFile.defaultEnumName, function (ident) {
          return [scripter.comment((0, _generators.getTagValues)(_this17.codegenFile.typeDecon.t.tags, "description").join("\n")), scripter.variable(scripter.objLiteral.apply(scripter, _toConsumableArray(_this17.options.map(function (option) {
            return scripter.propDec(option.toUpperCase(), scripter.literal(option));
          }))))(ident)];
        }));
      });
    }
  }, {
    key: "declaredType",
    get: function get() {
      var _this18 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this18.declaredEnum.map(function (declaredEnum) {
          return _this18.exportGraphqlType(_this18.codegenFile.defaultTypeIdentName, function (_ref2) {
            var graphqlTypeName = _ref2.graphqlTypeName;
            return function (ident) {
              return [scripter.variable("new " + scripter.invocation(_this18.importIdent(exportedFromGraphQL("GraphQLEnumType", "")), scripter.objLiteral(scripter.propDec("name", scripter.literal(graphqlTypeName)), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this18.codegenFile.typeDecon.t.tags, "description").join("\n"))), scripter.propDec("values", scripter.invocation(_this18.importIdent(_this18.codegenFile.parent.idolGraphQlFile.wrapValues), _this18.importIdent(declaredEnum))))))(ident)];
            };
          }, _this18.codegenFile.newDeclaration);
        });
      });
    }
  }]);

  return IdolGraphqlCodegenEnum;
}(IdolGraphqlGeneratorFileContext);

exports.IdolGraphqlCodegenEnum = IdolGraphqlCodegenEnum;

var IdolGraphQLCodegenTypeStruct =
/*#__PURE__*/
function () {
  function IdolGraphQLCodegenTypeStruct(idolGraphql, tsDecon, inputVariant) {
    _classCallCheck(this, IdolGraphQLCodegenTypeStruct);

    this.tsDecon = tsDecon;
    this.state = idolGraphql.state;
    this.config = idolGraphql.config;
    this.idolGraphql = idolGraphql;
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
      var _this19 = this;

      return this.tsDecon.getMap().map(function () {
        return importGraphqlExpr(_this19.idolGraphql.idolGraphQlFile.Anything);
      });
    }
  }, {
    key: "repeatedTypeExpr",
    get: function get() {
      var _this20 = this;

      return this.tsDecon.getRepeated().bind(function () {
        return _this20.innerScalar.bind(function (innerScalar) {
          return innerScalar.typeExpr;
        });
      }).map(function (scalarExpr) {
        return wrapGraphqlExpression(scalarExpr, function (scalarIdent) {
          return function (state, path) {
            return "new " + scripter.invocation(state.importIdent(path, exportedFromGraphQL("GraphQLList", "")), scalarIdent);
          };
        }, function (type) {
          return type + "[]";
        });
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
      var _this21 = this;

      return (0, _functional.cachedProperty)(this, "innerScalar", function () {
        return _this21.tsDecon.getScalar().concat(_this21.tsDecon.getMap()).concat(_this21.tsDecon.getRepeated()).map(function (scalarDecon) {
          return new _this21.IdolGraphqlCodegenScalar(_this21.idolGraphql, scalarDecon, _this21.inputVariant);
        });
      });
    }
  }, {
    key: "IdolGraphqlCodegenScalar",
    get: function get() {
      return IdolGraphqlCodegenScalar;
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
    var _this22;

    _classCallCheck(this, IdolGraphqlCodegenTypeStructDeclaration);

    _this22 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlCodegenTypeStructDeclaration).call(this, codegenFile.parent, tsDecon, codegenFile.inputTypeVariant));
    _this22.codegenFile = codegenFile;
    return _this22;
  } // Eww, this ought to be a mixin or composition rather than subclass.


  _createClass(IdolGraphqlCodegenTypeStructDeclaration, [{
    key: "path",
    get: function get() {
      return this.codegenFile.path;
    }
  }, {
    key: "exportGraphqlType",
    get: function get() {
      return IdolGraphqlGeneratorFileContext.prototype.exportGraphqlType;
    }
  }, {
    key: "export",
    get: function get() {
      return IdolGraphqlGeneratorFileContext.prototype["export"];
    }
  }, {
    key: "applyExpr",
    get: function get() {
      return _generators.GeneratorFileContext.prototype.applyExpr;
    }
  }, {
    key: "declaredType",
    get: function get() {
      var _this23 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this23.typeExpr.map(function (expr) {
          return _this23.exportGraphqlType(_this23.codegenFile.defaultTypeIdentName, function (expr) {
            return scripter.commented((0, _generators.getTagValues)(_this23.tsDecon.context.typeTags, "description").join("\n"), scripter.variable(_this23.applyExpr(expr)));
          }, expr);
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
      var _this24 = this;

      return this.tsDecon.getScalar().bind(function (scalar) {
        return scalar.getLiteral();
      }).map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            _ = _ref4[0],
            val = _ref4[1];

        return addGraphqlTypeToExpr(function (_ref5) {
          var graphqlTypeName = _ref5.graphqlTypeName;
          return function (state, path) {
            return scripter.invocation(state.importIdent(path, _this24.idolGraphql.idolGraphQlFile.LiteralTypeOf), scripter.literal(graphqlTypeName), scripter.literal(val), scripter.literal((0, _generators.getTagValues)(_this24.tsDecon.context.typeTags, "description").join("\n")));
          };
        }, _this24.codegenFile.newDeclaration);
      });
    }
  }]);

  return IdolGraphqlCodegenTypeStructDeclaration;
}(IdolGraphQLCodegenTypeStruct);

exports.IdolGraphqlCodegenTypeStructDeclaration = IdolGraphqlCodegenTypeStructDeclaration;

var IdolGraphqlCodegenScalar =
/*#__PURE__*/
function () {
  function IdolGraphqlCodegenScalar(idolGraphql, scalarDecon, inputVariant) {
    _classCallCheck(this, IdolGraphqlCodegenScalar);

    this.scalarDecon = scalarDecon;
    this.state = idolGraphql.state;
    this.config = idolGraphql.config;
    this.idolGraphql = idolGraphql;
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
      var _this25 = this;

      var aliasScaffoldFile = this.scalarDecon.getAlias().filter(function (ref) {
        return ref.qualified_name in _this25.config.params.scaffoldTypes.obj;
      }).map(function (ref) {
        return _this25.idolGraphql.scaffoldFile(ref, _this25.inputVariant);
      });

      if (aliasScaffoldFile.isEmpty()) {
        var aliasCodegenFile = this.scalarDecon.getAlias().map(function (ref) {
          return _this25.idolGraphql.codegenFile(ref, _this25.inputVariant);
        });
        return aliasCodegenFile.bind(function (codegenFile) {
          return codegenFile.declaredTypeIdent;
        }).map(function (codegenType) {
          return importGraphqlExpr(codegenType, "Codegen" + codegenType.ident);
        });
      }

      return aliasScaffoldFile.bind(function (scaffoldFile) {
        return scaffoldFile.declaredTypeIdent;
      }).map(function (scaffoldType) {
        return importGraphqlExpr(scaffoldType, "Scaffold" + scaffoldType.ident);
      });
    }
  }, {
    key: "primTypeExpr",
    get: function get() {
      var _this26 = this;

      return this.scalarDecon.getPrimitive().map(function (prim) {
        if (prim === _PrimitiveType.PrimitiveType.ANY) {
          return importGraphqlExpr(_this26.idolGraphql.idolGraphQlFile.Anything);
        } else if (prim === _PrimitiveType.PrimitiveType.BOOL) {
          return importGraphqlExpr(exportedFromGraphQL("GraphQLBoolean", "Boolean"));
        } else if (prim === _PrimitiveType.PrimitiveType.DOUBLE) {
          return importGraphqlExpr(exportedFromGraphQL("GraphQLFloat", "Float"));
        } else if (prim === _PrimitiveType.PrimitiveType.INT) {
          return importGraphqlExpr(exportedFromGraphQL("GraphQLInt", "Int"));
        } else if (prim === _PrimitiveType.PrimitiveType.STRING) {
          return importGraphqlExpr(exportedFromGraphQL("GraphQLString", "String"));
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
function (_IdolGraphqlGenerator5) {
  _inherits(IdolGraphqlScaffoldStruct, _IdolGraphqlGenerator5);

  function IdolGraphqlScaffoldStruct(scaffoldFile, fields) {
    var _this27;

    _classCallCheck(this, IdolGraphqlScaffoldStruct);

    _this27 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlScaffoldStruct).call(this, scaffoldFile.parent, scaffoldFile.path));
    _this27.fields = fields;
    _this27.scaffoldFile = scaffoldFile;
    _this27.codegenFile = _this27.parent.codegenFile(_this27.scaffoldFile.typeDecon.t.named, _this27.scaffoldFile.inputVariant);
    return _this27;
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
      var _this28 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this28.declaredFields.map(function (declaredFields) {
          return _this28.exportGraphqlType(_this28.scaffoldFile.defaultTypeIdentName, function (_ref6) {
            var graphqlTypeName = _ref6.graphqlTypeName;
            return scripter.variable("new " + scripter.invocation(_this28.importIdent(exportedFromGraphQL(_this28.scaffoldFile.inputVariant ? "GraphQLInputObjectType" : "GraphQLObjectType", "")), scripter.objLiteral(scripter.propDec("name", scripter.literal(graphqlTypeName)), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this28.scaffoldFile.typeDecon.t.tags, "description").join("\n"))), scripter.propDec("fields", scripter.objLiteral(scripter.spread(_this28.applyExpr(declaredFields)))))));
          }, _this28.codegenFile.newDeclaration);
        });
      });
    }
  }]);

  return IdolGraphqlScaffoldStruct;
}(IdolGraphqlGeneratorFileContext);

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
      var _this29 = this;

      return (0, _functional.cachedProperty)(this, "declaredFields", function () {
        var methods = _this29.fields.mapAndFilter(function (codegenTypeStruct) {
          return codegenTypeStruct.tsDecon.getScalar().bind(function (scalar) {
            return scalar.getAlias();
          }).map(function (ref) {
            return (0, _generators.getMaterialTypeDeconstructor)(_this29.config.params.allTypes, _this29.config.params.allTypes.obj[ref.qualified_name]);
          }).bind(function (tDecon) {
            return new _this29.IdolGraphqlMethod(_this29.parent, tDecon).methodExpr;
          });
        }).map(function (expr) {
          return _this29.applyExpr(expr);
        });

        return _functional.Alt.lift(_this29["export"](_this29.scaffoldFile.defaultQueriesName, function (ident) {
          return [scripter.comment((0, _generators.getTagValues)(_this29.scaffoldFile.type.tags, "description").join("\n")), scripter.variable(scripter.objLiteral.apply(scripter, _toConsumableArray(methods.concatMap(function (fieldName, method) {
            return [scripter.propDec(fieldName, method)];
          }, []))))(ident)];
        })).map(_generators.importExpr);
      });
    }
  }, {
    key: "IdolGraphqlMethod",
    get: function get() {
      return IdolGraphqlMethod;
    }
  }]);

  return IdolGraphqlService;
}(IdolGraphqlScaffoldStruct);

exports.IdolGraphqlService = IdolGraphqlService;

var IdolGraphqlMethod =
/*#__PURE__*/
function () {
  function IdolGraphqlMethod(idolGraphql, tDecon) {
    _classCallCheck(this, IdolGraphqlMethod);

    this.tDecon = tDecon;
    this.state = idolGraphql.state;
    this.config = idolGraphql.config;
    this.idolGraphql = idolGraphql;
  }

  _createClass(IdolGraphqlMethod, [{
    key: "methodExpr",
    get: function get() {
      var _this30 = this;

      return this.tDecon.getStruct().bind(function (fields) {
        var outputTypeExpr = fields.get("output").bind(function (outputTs) {
          return new _this30.IdolGraphQLCodegenTypeStruct(_this30.idolGraphql, outputTs, false).typeExpr;
        });
        var inputFields = fields.get("input").bind(function (inputTs) {
          return inputTs.getScalar().bind(function (scalar) {
            return scalar.getAlias();
          });
        }).bind(function (ref) {
          var materialType = (0, _generators.getMaterialTypeDeconstructor)(_this30.config.params.allTypes, _this30.config.params.allTypes.obj[ref.qualified_name]);
          return _this30.idolGraphql.codegenFile(materialType.t.named, true).struct.bind(function (struct) {
            return struct.declaredFields;
          });
        });

        if (outputTypeExpr.isEmpty() || inputFields.isEmpty()) {
          throw new Error("GraphQL methods required input and output fields.");
        }

        return outputTypeExpr.bind(function (output) {
          return inputFields.map(function (inputFields) {
            return function (state, path) {
              return scripter.objLiteral(scripter.propDec("type", output(state, path)), scripter.propDec("resolve", scripter.arrowFunc(["root", "args", "context"], scripter.literal(null))), scripter.propDec("args", scripter.objLiteral(scripter.spread(state.importIdent(path, inputFields)))), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this30.tDecon.t.tags, "description").join("\n"))));
            };
          });
        });
      });
    }
  }, {
    key: "IdolGraphQLCodegenTypeStruct",
    get: function get() {
      return IdolGraphQLCodegenTypeStruct;
    }
  }]);

  return IdolGraphqlMethod;
}();

exports.IdolGraphqlMethod = IdolGraphqlMethod;

var IdolGraphqlFile =
/*#__PURE__*/
function (_ExternFileContext) {
  _inherits(IdolGraphqlFile, _ExternFileContext);

  function IdolGraphqlFile(parent, path) {
    _classCallCheck(this, IdolGraphqlFile);

    return _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlFile).call(this, (0, _path.resolve)(__dirname, "__idol_graphql__.js"), parent, path));
  }

  _createClass(IdolGraphqlFile, [{
    key: "wrapValues",
    get: function get() {
      return this.exportExtern("wrapValues");
    }
  }, {
    key: "Anything",
    get: function get() {
      return withGraphqlType(this.exportExtern("Anything"), "IdolGraphQLAnything");
    }
  }, {
    key: "LiteralTypeOf",
    get: function get() {
      return this.exportExtern("LiteralTypeOf");
    }
  }]);

  return IdolGraphqlFile;
}(_generators.ExternFileContext);

exports.IdolGraphqlFile = IdolGraphqlFile;

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
  var idolGraphql = new IdolGraphql(config);
  var moveTo = (0, _generators.build)(config, idolGraphql.render());
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}