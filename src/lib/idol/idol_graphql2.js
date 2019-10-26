#! /usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exportedFromGraphQL = exportedFromGraphQL;
exports.IdolGraphqlFile = exports.IdolGraphqlCodegenScalar = exports.IdolGraphqlCodegenTypeStructDeclaration = exports.IdolGraphQLCodegenTypeStruct = exports.IdolGraphqlCodegenEnum = exports.IdolGraphqlCodegenStruct = exports.IdolGraphqlScaffoldFile = exports.IdolGraphqlCodegenFile = exports.IdolGraphql = void 0;

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

var IdolGraphql =
/*#__PURE__*/
function () {
  function IdolGraphql(config) {
    var codegenImpl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (idolGraphql, path, type) {
      return new IdolGraphqlCodegenFile(idolGraphql, path, type);
    };
    var scaffoldImpl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (idolGraphql, path, type) {
      return new IdolGraphqlScaffoldFile(idolGraphql, path, type);
    };

    _classCallCheck(this, IdolGraphql);

    this.state = new _generators.GeneratorAcc();
    this.config = config;
    this.codegenImpl = codegenImpl;
    this.scaffoldImpl = scaffoldImpl;
  }

  _createClass(IdolGraphql, [{
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
    key: "defaultGraphqlTypeName",
    value: function defaultGraphqlTypeName(type) {
      return type.named.typeName + "Type";
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var scaffoldTypes = this.config.params.scaffoldTypes.values();
      scaffoldTypes.forEach(function (t, i) {
        var scaffoldFile = _this3.scaffoldFile(t.named);

        if (!scaffoldFile.declaredTypeIdent.isEmpty()) {
          console.log("Generated ".concat(t.named.qualified_name, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        } else {
          console.log("Skipped ".concat(t.named.qualified_name, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        }
      });
      return this.state.render({
        codegen: "DO NOT EDIT\nThis file was generated by idol_graphql, any changes will be overwritten when idol_graphql is run again.",
        scaffold: "This file was scaffolded by idol_graphql.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_graphql."
      });
    }
  }, {
    key: "idolGraphQlFile",
    get: function get() {
      var _this4 = this;

      return (0, _functional.cachedProperty)(this, "idolGraphQlFile", function () {
        return new IdolGraphqlFile(_this4, _this4.state.reservePath({
          runtime: _this4.config.codegenRoot + "/__idol_graphql__.js"
        }));
      });
    }
  }]);

  return IdolGraphql;
}();

exports.IdolGraphql = IdolGraphql;

function exportedFromGraphQL(ident) {
  return {
    ident: ident,
    path: new _generators.Path("graphql")
  };
}

var IdolGraphqlCodegenFile =
/*#__PURE__*/
function (_GeneratorFileContext) {
  _inherits(IdolGraphqlCodegenFile, _GeneratorFileContext);

  function IdolGraphqlCodegenFile(idolGraphql, path, type) {
    var _this5;

    _classCallCheck(this, IdolGraphqlCodegenFile);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlCodegenFile).call(this, idolGraphql, path));
    _this5.typeDecon = new _generators.TypeDeconstructor(type);

    _this5.reserveIdent(_this5.defaultTypeName);

    _this5.reserveIdent(_this5.defaultEnumName);

    _this5.reserveIdent(_this5.defaultFieldsName);

    return _this5;
  }

  _createClass(IdolGraphqlCodegenFile, [{
    key: "type",
    get: function get() {
      return this.typeDecon.t;
    }
  }, {
    key: "defaultTypeName",
    get: function get() {
      return this.type.named.asQualifiedIdent + "Type";
    }
  }, {
    key: "defaultGraphQLTypeName",
    get: function get() {
      if (this.type.named.qualifiedName in this.config.params.scaffoldTypes.obj) {
        return this.parent.defaultGraphqlTypeName(this.type);
      }

      return this.defaultTypeName;
    }
  }, {
    key: "defaultFieldsName",
    get: function get() {
      return this.type.named.asQualifiedIdent + "Fields";
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
          return new IdolGraphqlCodegenStruct(_this7, fields.map(function (tsDecon) {
            return new IdolGraphQLCodegenTypeStruct(_this7.parent, tsDecon);
          }));
        });
      });
    }
  }, {
    key: "enum",
    get: function get() {
      var _this8 = this;

      return (0, _functional.cachedProperty)(this, "enum", function () {
        return _this8.typeDecon.getEnum().map(function (options) {
          return new IdolGraphqlCodegenEnum(_this8, options);
        });
      });
    }
  }, {
    key: "typeStruct",
    get: function get() {
      var _this9 = this;

      return (0, _functional.cachedProperty)(this, "typeStruct", function () {
        return _this9.typeDecon.getTypeStruct().map(function (tsDecon) {
          return new IdolGraphqlCodegenTypeStructDeclaration(_this9, tsDecon);
        });
      });
    }
  }]);

  return IdolGraphqlCodegenFile;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlCodegenFile = IdolGraphqlCodegenFile;

var IdolGraphqlScaffoldFile =
/*#__PURE__*/
function (_GeneratorFileContext2) {
  _inherits(IdolGraphqlScaffoldFile, _GeneratorFileContext2);

  function IdolGraphqlScaffoldFile(idolGraphql, path, type) {
    var _this10;

    _classCallCheck(this, IdolGraphqlScaffoldFile);

    _this10 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlScaffoldFile).call(this, idolGraphql, path));
    _this10.typeDecon = (0, _generators.getMaterialTypeDeconstructor)(idolGraphql.config.params.allTypes, type);
    _this10.type = type;

    _this10.reserveIdent(_this10.defaultTypeName);

    return _this10;
  }

  _createClass(IdolGraphqlScaffoldFile, [{
    key: "defaultTypeName",
    get: function get() {
      return this.parent.defaultGraphqlTypeName(this.type);
    }
  }, {
    key: "declaredTypeIdent",
    get: function get() {
      var _this11 = this;

      return (0, _functional.cachedProperty)(this, "declaredTypeIdent", function () {
        var codegenFile = _this11.parent.codegenFile(_this11.type.named);

        return codegenFile.struct.bind(function (codegenStruct) {
          return codegenStruct.declaredFields.map(function (declaredFields) {
            return function (ident) {
              return [scripter.variable("new " + scripter.invocation(_this11.importIdent(exportedFromGraphQL("GraphQLObjectType")), scripter.objLiteral(scripter.propDec("name", scripter.literal(_this11.defaultTypeName)), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this11.type.tags, "description").join("\n"))), scripter.propDec("fields", scripter.objLiteral(scripter.spread(_this11.importIdent(declaredFields)))))))(ident)];
            };
          });
        }).either(codegenFile.typeStruct.bind(function (ts) {
          return ts.declaredType;
        }).concat(codegenFile["enum"].bind(function (e) {
          return e.declaredType;
        })).map(function (declaredType) {
          return scripter.variable(_this11.importIdent(declaredType));
        })).map(function (scriptable) {
          return _this11["export"](_this11.defaultTypeName, scriptable);
        });
      });
    }
  }]);

  return IdolGraphqlScaffoldFile;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlScaffoldFile = IdolGraphqlScaffoldFile;

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
            return [scripter.comment((0, _generators.getTagValues)(_this13.fields.obj[fieldName].tsDecon.context.fieldTags, "description").join("\n")), scripter.propDec(fieldName, fieldType)];
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
          return console.trace("oh my", _this14.codegenFile.type.named) || _this14["export"](_this14.codegenFile.defaultTypeName, scripter.variable("new " + scripter.invocation(_this14.importIdent(exportedFromGraphQL("GraphQLObjectType")), scripter.objLiteral(scripter.propDec("name", scripter.literal(_this14.codegenFile.defaultGraphQLTypeName)), scripter.propDec("description", scripter.literal((0, _generators.getTagValues)(_this14.codegenFile.typeDecon.t.tags, "description").join("\n"))), scripter.propDec("fields", scripter.objLiteral(scripter.spread(_this14.importIdent(declaredFields))))))));
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
          return _this17["export"](_this17.codegenFile.defaultTypeName, function (ident) {
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
  function IdolGraphQLCodegenTypeStruct(idolGraphql, tsDecon) {
    _classCallCheck(this, IdolGraphQLCodegenTypeStruct);

    this.tsDecon = tsDecon;
    this.state = idolGraphql.state;
    this.config = idolGraphql.config;
    this.idolGraphql = idolGraphql;
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
        return (0, _generators.importExpr)(_this18.idolGraphql.idolGraphQlFile.Anything);
      });
    }
  }, {
    key: "repeatedTypeExpr",
    get: function get() {
      var _this19 = this;

      return this.tsDecon.getRepeated().bind(function () {
        return _this19.scalarTypeExpr;
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
          return new IdolGraphqlCodegenScalar(_this20.idolGraphql, scalarDecon);
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

    _this21 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlCodegenTypeStructDeclaration).call(this, codegenFile.parent, tsDecon));
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
          return _this22["export"](_this22.codegenFile.defaultTypeName, scripter.commented((0, _generators.getTagValues)(_this22.tsDecon.context.typeTags, "description").join("\n"), scripter.variable(_this22.applyExpr(expr))));
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
          return scripter.invocation(state.importIdent(path, _this23.idolGraphql.idolGraphQlFile.LiteralTypeOf), _this23.codegenFile.defaultTypeName, scripter.literal(val), scripter.literal((0, _generators.getTagValues)(_this23.tsDecon.context.typeTags, "description").join("\n")));
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
  function IdolGraphqlCodegenScalar(idolGraphql, scalarDecon) {
    _classCallCheck(this, IdolGraphqlCodegenScalar);

    this.scalarDecon = scalarDecon;
    this.state = idolGraphql.state;
    this.config = idolGraphql.config;
    this.idolGraphql = idolGraphql;
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
        return _this24.idolGraphql.scaffoldFile(ref);
      });

      if (aliasScaffoldFile.isEmpty()) {
        var aliasCodegenFile = this.scalarDecon.getAlias().map(function (ref) {
          return _this24.idolGraphql.codegenFile(ref);
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
          return (0, _generators.importExpr)(_this25.idolGraphql.idolGraphQlFile.Anything);
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

var IdolGraphqlFile =
/*#__PURE__*/
function (_ExternFileContext) {
  _inherits(IdolGraphqlFile, _ExternFileContext);

  function IdolGraphqlFile(parent, path) {
    _classCallCheck(this, IdolGraphqlFile);

    return _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlFile).call(this, (0, _path.resolve)(__dirname, "../../lib/idol/__idol_graphql__.js"), parent, path));
  }

  _createClass(IdolGraphqlFile, [{
    key: "wrapValues",
    get: function get() {
      return this.exportExtern("wrapValues");
    }
  }, {
    key: "Anything",
    get: function get() {
      return this.exportExtern("Anything");
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