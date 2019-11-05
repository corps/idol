#! /usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IdolGraphqlMethod = exports.IdolGraphqlQueriesService = exports.IdolGraphqlCodegenScalar = exports.IdolGraphqlQueriesCodegenTypeStructDeclaration = exports.IdolGraphQLQueriesCodegenTypeStruct = exports.IdolGraphqlQueriesCodegenStruct = exports.IdolGraphqlQueriesScaffoldFile = exports.IdolGraphqlQueriesCodegenFile = exports.IdolGraphqlQueries = void 0;

var _path = require("path");

var scripter = _interopRequireWildcard(require("./scripter"));

var _cli = require("./cli");

var _Reference = require("./js/schema/Reference");

var _Type = require("./js/schema/Type");

var _generators = require("./generators");

var _functional = require("./functional");

var _PrimitiveType = require("./js/schema/PrimitiveType");

var _TypeStruct = require("./js/schema/TypeStruct");

var _idol_graphql = require("./idol_graphql");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
    var idolGraphql = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new _idol_graphql.IdolGraphql(config);

    _classCallCheck(this, IdolGraphqlQueries);

    this.state = new _generators.GeneratorAcc();
    this.config = config;
    this.codegenImpl = codegenImpl;
    this.scaffoldImpl = scaffoldImpl;
    this.idolGraphql = idolGraphql;
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
  }]);

  return IdolGraphqlQueries;
}();

exports.IdolGraphqlQueries = IdolGraphqlQueries;
var gql = {
  ident: "@@default",
  path: new _generators.Path("graphql-tag")
};

function graphqlTag() {
  for (var _len = arguments.length, lines = new Array(_len), _key = 0; _key < _len; _key++) {
    lines[_key] = arguments[_key];
  }

  return function (state, path) {
    return state.importIdent(path, gql, "gql") + "`\n" + lines.join("\n") + "\n`;";
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
    key: "graphqlTypeName",
    value: function graphqlTypeName(inputVariant) {
      return this.parent.idolGraphql.codegenFile(this.type.named, inputVariant).declaredTypeIdent.map(function (ex) {
        return ex.graphqlTypeName;
      });
    }
  }, {
    key: "graphqlCodegenFile",
    value: function graphqlCodegenFile(inputVariant) {
      return this.parent.idolGraphql.codegenFile(this.type.named, inputVariant);
    }
  }, {
    key: "struct",
    value: function struct(inputVariant) {
      var _this5 = this;

      return (0, _functional.cachedProperty)(this, "struct".concat(inputVariant.toString()), function () {
        return _this5.graphqlCodegenFile(inputVariant).struct.map(function (struct) {
          return new IdolGraphqlQueriesCodegenStruct(_this5, struct.fields.map(function (field) {
            return new IdolGraphQLQueriesCodegenTypeStruct(_this5.parent, field);
          }));
        });
      });
    }
  }, {
    key: "type",
    get: function get() {
      return this.typeDecon.t;
    }
  }, {
    key: "defaultFragmentName",
    get: function get() {
      return this.type.named.asQualifiedIdent + "Fragment";
    }
  }, {
    key: "graphqlFieldsName",
    get: function get() {
      return this.graphqlTypeName(false).map(function (s) {
        return s + "Fields";
      });
    }
  }, {
    key: "declaredFragments",
    get: function get() {
      var _this6 = this;

      return (0, _functional.cachedProperty)(this, "declaredFragments", function () {
        return _this6.typeStruct.bind(function (ts) {
          return ts.declaredFragment;
        }).either(_this6.struct(false).bind(function (struct) {
          return struct.declaredFragments;
        }));
      });
    }
  }, {
    key: "typeStruct",
    get: function get() {
      var _this7 = this;

      return (0, _functional.cachedProperty)(this, "typeStruct", function () {
        return _this7.graphqlCodegenFile(false).typeStruct.map(function (ts) {
          return new IdolGraphqlQueriesCodegenTypeStructDeclaration(_this7, ts);
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

    _this8.reserveIdent(_this8.defaultFragmentName);

    return _this8;
  }

  _createClass(IdolGraphqlQueriesScaffoldFile, [{
    key: "defaultFragmentName",
    get: function get() {
      return this.type.named.typeName + "Fragment";
    }
  }, {
    key: "service",
    get: function get() {
      var _this9 = this;

      return (0, _functional.cachedProperty)(this, "service", function () {
        return _this9.typeDecon.getStruct().filter(function (_) {
          return (0, _generators.includesTag)(_this9.type.tags, "service");
        }).map(function (fields) {
          return new IdolGraphqlQueriesService(_this9, fields);
        });
      });
    }
  }, {
    key: "declaredFragments",
    get: function get() {
      var _this10 = this;

      return (0, _functional.cachedProperty)(this, "declaredFragments", function () {
        var codegenFile = _this10.parent.codegenFile(_this10.typeDecon.t.named);

        if (!_this10.service.isEmpty()) {
          return _this10.service.bind(function (service) {
            return service.declaredFragments;
          });
        }

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
        return _this12.codegenFile.graphqlFieldsName.bind(function (fieldsName) {
          return _this12.codegenFile.graphqlTypeName(false).map(function (typeName) {
            return _this12["export"](_this12.codegenFile.defaultFragmentName, function (ident) {
              return [scripter.comment((0, _generators.getTagValues)(_this12.codegenFile.typeDecon.t.tags, "description").join("\n")), scripter.variable(_this12.applyExpr(graphqlTag.apply(void 0, ["fragment ".concat(fieldsName, " on ").concat(typeName, " {")].concat(_toConsumableArray(_this12.fields.concatMap(function (fieldName, _) {
                return ["    " + fieldName + (fieldName in fieldFragments.obj ? "{ ...".concat(fieldFragments.obj[fieldName][0], " }") : "")];
              }, [])), ["}"], _toConsumableArray(fragments.map(function (fragmentIdent) {
                return "${" + fragmentIdent + "}";
              }))))))(ident)];
            });
          });
        });
      });
    }
  }]);

  return IdolGraphqlQueriesCodegenStruct;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlQueriesCodegenStruct = IdolGraphqlQueriesCodegenStruct;

var IdolGraphQLQueriesCodegenTypeStruct =
/*#__PURE__*/
function () {
  function IdolGraphQLQueriesCodegenTypeStruct(idolGraphqlQueries, idolGraphqlTypeStruct) {
    _classCallCheck(this, IdolGraphQLQueriesCodegenTypeStruct);

    this.state = idolGraphqlQueries.state;
    this.config = idolGraphqlQueries.config;
    this.idolGraphqlQueries = idolGraphqlQueries;
    this.idolGraphqlTypeStruct = idolGraphqlTypeStruct;
  }

  _createClass(IdolGraphQLQueriesCodegenTypeStruct, [{
    key: "tsDecon",
    get: function get() {
      return this.idolGraphqlTypeStruct.tsDecon;
    }
  }, {
    key: "fragmentExpr",
    get: function get() {
      if (!this.tsDecon.getMap().isEmpty()) {
        return _functional.Alt.empty();
      }

      return this.innerScalar.bind(function (scalar) {
        return scalar.fragmentExpr;
      });
    }
  }, {
    key: "graphqlTypeName",
    get: function get() {
      return this.idolGraphqlTypeStruct.typeExpr.map(function (typeExpr) {
        return typeExpr.graphqlTypeName;
      });
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
      var _this13 = this;

      return (0, _functional.cachedProperty)(this, "innerScalar", function () {
        return _this13.tsDecon.getScalar().concat(_this13.tsDecon.getRepeated()).map(function (scalarDecon) {
          return new IdolGraphqlCodegenScalar(_this13.idolGraphqlQueries, scalarDecon);
        });
      }).concat(this.tsDecon.getMap().map(function (map) {
        return new IdolGraphqlCodegenScalar(_this13.idolGraphqlQueries, new _generators.ScalarDeconstructor(new _TypeStruct.TypeStruct(_TypeStruct.TypeStruct.expand({
          primitive_type: _PrimitiveType.PrimitiveType.ANY
        })), map.context));
      }));
    }
  }]);

  return IdolGraphQLQueriesCodegenTypeStruct;
}();

exports.IdolGraphQLQueriesCodegenTypeStruct = IdolGraphQLQueriesCodegenTypeStruct;

var IdolGraphqlQueriesCodegenTypeStructDeclaration =
/*#__PURE__*/
function (_IdolGraphQLQueriesCo) {
  _inherits(IdolGraphqlQueriesCodegenTypeStructDeclaration, _IdolGraphQLQueriesCo);

  function IdolGraphqlQueriesCodegenTypeStructDeclaration(codegenFile, idolGraphqlTsDec) {
    var _this14;

    _classCallCheck(this, IdolGraphqlQueriesCodegenTypeStructDeclaration);

    _this14 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlQueriesCodegenTypeStructDeclaration).call(this, codegenFile.parent, idolGraphqlTsDec));
    _this14.codegenFile = codegenFile;
    return _this14;
  }

  _createClass(IdolGraphqlQueriesCodegenTypeStructDeclaration, [{
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
      var _this15 = this;

      return (0, _functional.cachedProperty)(this, "declaredFragment", function () {
        return _this15.fragmentExpr.map(function (expr) {
          return _this15["export"](_this15.codegenFile.defaultFragmentName, scripter.commented((0, _generators.getTagValues)(_this15.tsDecon.context.typeTags, "description").join("\n"), scripter.variable(_this15.applyExpr(expr))));
        });
      });
    }
  }]);

  return IdolGraphqlQueriesCodegenTypeStructDeclaration;
}(IdolGraphQLQueriesCodegenTypeStruct);

exports.IdolGraphqlQueriesCodegenTypeStructDeclaration = IdolGraphqlQueriesCodegenTypeStructDeclaration;

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
    key: "aliasScaffoldFile",
    get: function get() {
      var _this16 = this;

      return this.scalarDecon.getAlias().filter(function (ref) {
        return ref.qualified_name in _this16.config.params.scaffoldTypes.obj;
      }).map(function (ref) {
        return _this16.idolGraphqlQueries.scaffoldFile(ref);
      });
    }
  }, {
    key: "aliasCodegenFile",
    get: function get() {
      var _this17 = this;

      return this.scalarDecon.getAlias().filter(function (ref) {
        return !(ref.qualified_name in _this17.config.params.scaffoldTypes.obj);
      }).map(function (ref) {
        return _this17.idolGraphqlQueries.codegenFile(ref);
      });
    } // TODO: REMOVE?

  }, {
    key: "materialTypeDecon",
    get: function get() {
      var _this18 = this;

      return this.scalarDecon.getAlias().map(function (ref) {
        return (0, _generators.getMaterialTypeDeconstructor)(_this18.config.params.allTypes, _this18.config.params.allTypes.obj[ref.qualified_name]);
      });
    }
  }, {
    key: "graphqlFieldsName",
    get: function get() {
      var _this19 = this;

      return this.scalarDecon.getAlias().bind(function (ref) {
        return _this19.idolGraphqlQueries.codegenFile(ref).graphqlFieldsName;
      });
    }
  }, {
    key: "fragmentExpr",
    get: function get() {
      return this.aliasScaffoldFile.bind(function (sf) {
        return sf.declaredFragments;
      }).either(this.aliasCodegenFile.bind(function (cf) {
        return cf.declaredFragments;
      })).map(_generators.importExpr);
    }
  }]);

  return IdolGraphqlCodegenScalar;
}();

exports.IdolGraphqlCodegenScalar = IdolGraphqlCodegenScalar;

var IdolGraphqlQueriesService =
/*#__PURE__*/
function (_GeneratorFileContext4) {
  _inherits(IdolGraphqlQueriesService, _GeneratorFileContext4);

  function IdolGraphqlQueriesService(scaffoldFile, fields) {
    var _this20;

    _classCallCheck(this, IdolGraphqlQueriesService);

    _this20 = _possibleConstructorReturn(this, _getPrototypeOf(IdolGraphqlQueriesService).call(this, scaffoldFile.parent, scaffoldFile.path));
    _this20.fields = fields;
    _this20.scaffoldFile = scaffoldFile;
    _this20.codegenFile = _this20.parent.codegenFile(_this20.scaffoldFile.typeDecon.t.named);
    _this20.methods = _toConsumableArray(_this20.fields.mapAndFilter(function (tsDecon) {
      return tsDecon.getScalar().bind(function (scalar) {
        return scalar.getAlias();
      }).map(function (ref) {
        return (0, _generators.getMaterialTypeDeconstructor)(_this20.config.params.allTypes, _this20.config.params.allTypes.obj[ref.qualified_name]);
      });
    }).mapIntoIterable(function (fieldName, tDecon) {
      return _this20.methodFor(tDecon, fieldName, _this20.fields.obj[fieldName].context.fieldTags);
    }));

    _this20.methods.forEach(function (method) {
      return _this20.reserveIdent(method.serviceMethodFragmentName);
    });

    return _this20;
  }

  _createClass(IdolGraphqlQueriesService, [{
    key: "methodFor",
    value: function methodFor(tDecon, serviceFieldName, fieldTags) {
      return new IdolGraphqlMethod(this.scaffoldFile, tDecon, this.codegenFile.type.named.typeName, serviceFieldName, (0, _generators.includesTag)(fieldTags, "mutation"));
    }
  }, {
    key: "declaredFragments",
    get: function get() {
      var _this21 = this;

      return (0, _functional.cachedProperty)(this, "declaredFragments", function () {
        _this21.methods.forEach(function (method) {
          return method.declaredMethodFragment;
        });

        return _functional.Alt.empty();
      });
    }
  }]);

  return IdolGraphqlQueriesService;
}(_generators.GeneratorFileContext);

exports.IdolGraphqlQueriesService = IdolGraphqlQueriesService;

var IdolGraphqlMethod =
/*#__PURE__*/
function () {
  function IdolGraphqlMethod(scaffoldFile, tDecon, serviceName, methodName, isMutation) {
    _classCallCheck(this, IdolGraphqlMethod);

    this.tDecon = tDecon;
    this.scaffoldFile = scaffoldFile;
    var idolGraphqlQueries = scaffoldFile.parent;
    this.state = idolGraphqlQueries.state;
    this.config = idolGraphqlQueries.config;
    this.idolGraphqlQueries = idolGraphqlQueries;
    this.serviceName = serviceName;
    this.methodName = methodName;
    this.isMutation = isMutation;
  }

  _createClass(IdolGraphqlMethod, [{
    key: "serviceMethodFragmentName",
    get: function get() {
      if (this.isMutation) {
        return this.serviceName + this.methodName[0].toUpperCase() + this.methodName.slice(1) + "Mutation";
      }

      return this.serviceName + this.methodName[0].toUpperCase() + this.methodName.slice(1) + "Query";
    }
  }, {
    key: "declaredMethodFragment",
    get: function get() {
      var _this22 = this;

      return (0, _functional.cachedProperty)(this, "declaredMethod", function () {
        return _this22.tDecon.getStruct().bind(function (fields) {
          var outputFields = fields.get("output").bind(function (outputTs) {
            return outputTs.getScalar().concat(outputTs.getRepeated());
          }).bind(function (s) {
            return s.getAlias();
          }).map(function (ref) {
            var materialType = (0, _generators.getMaterialTypeDeconstructor)(_this22.config.params.allTypes, _this22.config.params.allTypes.obj[ref.qualified_name]);
            return _this22.idolGraphqlQueries.codegenFile(materialType.t.named);
          }).bind(function (codegenFile) {
            return codegenFile.declaredFragments.bind(function (fragments) {
              return codegenFile.graphqlFieldsName.map(function (fieldsName) {
                return [fragments, fieldsName];
              });
            });
          });
          var inputFields = fields.get("input").bind(function (inputTs) {
            return inputTs.getScalar().bind(function (scalar) {
              return scalar.getAlias();
            });
          }).bind(function (ref) {
            var materialType = (0, _generators.getMaterialTypeDeconstructor)(_this22.config.params.allTypes, _this22.config.params.allTypes.obj[ref.qualified_name]);
            return _this22.idolGraphqlQueries.codegenFile(materialType.t.named).struct(true);
          }).map(function (struct) {
            return struct.fields.map(function (f) {
              return f.graphqlTypeName.unwrap();
            });
          });

          if (outputFields.isEmpty()) {
            throw new Error(_this22.serviceName + " is missing a valid output field.");
          }

          if (inputFields.isEmpty()) {
            throw new Error(_this22.serviceName + " is missing a valid input field.");
          }

          return inputFields.map(function (inputFields) {
            var operationArgs = _toConsumableArray(inputFields.mapIntoIterable(function (fieldName, fieldType) {
              return "$".concat(fieldName, ": ").concat(fieldType);
            }));

            var callArgs = _toConsumableArray(inputFields.mapIntoIterable(function (fieldName, fieldType) {
              return "".concat(fieldName, ": $").concat(fieldName);
            }));

            var outerHeaderLine = "".concat(_this22.isMutation ? "mutation" : "query", " ").concat(_this22.methodName, "(").concat(operationArgs.join(", "), ")");
            var innerHeaderLine = "".concat(_this22.methodName, "(").concat(callArgs.join(", "), ")");
            var fieldsSpread = outputFields.map(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  _ = _ref2[0],
                  fieldsName = _ref2[1];

              return "{ ...".concat(fieldsName, " }");
            }).getOr("");
            var fragment = outputFields.map(function (_ref3) {
              var _ref4 = _slicedToArray(_ref3, 2),
                  fragment = _ref4[0],
                  _ = _ref4[1];

              return "${" + _this22.scaffoldFile.importIdent(fragment) + "}";
            }).getOr("");
            return _this22.scaffoldFile["export"](_this22.serviceMethodFragmentName, scripter.variable(graphqlTag("  " + outerHeaderLine + " {", "    " + innerHeaderLine + " " + fieldsSpread, "  }", fragment)(_this22.state, _this22.scaffoldFile.path)));
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