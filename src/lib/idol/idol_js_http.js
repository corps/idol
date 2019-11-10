"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpServiceBase = exports.IdolJSHttpScaffoldFile = exports.IdolJSHttpCodegenMethod = exports.IdolJSHttpCodegenFile = exports.IdolJsHttp = void 0;

var _cli = require("./cli");

var _generators = require("./generators");

var _Type = require("./js/schema/Type");

var _idol_graphql = require("./idol_graphql");

var _Reference = require("./js/schema/Reference");

var _functional = require("./functional");

var scripter = _interopRequireWildcard(require("./scripter"));

var _path = require("path");

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

var IdolJsHttp =
/*#__PURE__*/
function () {
  function IdolJsHttp(config) {
    var codegenImpl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (idolJsHttp, path, type) {
      return new IdolJSHttpCodegenFile(idolJsHttp, path, type);
    };
    var scaffoldImpl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (idolJsHttp, path, type) {
      return new IdolJSHttpScaffoldFile(idolJsHttp, path, type);
    };
    var idolGraphql = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new _idol_graphql.IdolGraphql(config);

    _classCallCheck(this, IdolJsHttp);

    this.state = new _generators.GeneratorAcc();
    this.config = config;
    this.codegenImpl = codegenImpl;
    this.scaffoldImpl = scaffoldImpl;
    this.idolGraphql = idolGraphql;
  }

  _createClass(IdolJsHttp, [{
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

        if (!scaffoldFile.service.isEmpty()) {
          console.log("Generated ".concat(scaffoldFile.service.unwrap().ident, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        } else {
          console.log("Skipped ".concat(scaffoldFile.type.named.typeName, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        }
      });
      return this.state.render({
        codegen: "DO NOT EDIT\nThis file was generated by idol_js_http, any changes will be overwritten when idol_js_http is run again.",
        scaffold: "This file was scaffolded by idol_js_http.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_js_http."
      });
    }
  }, {
    key: "serviceBaseFile",
    get: function get() {
      var _this4 = this;

      return (0, _functional.cachedProperty)(this, "serviceBaseFile", function () {
        return new HttpServiceBase(_this4, _this4.state.reservePath({
          runtime: "service-base.js"
        }));
      });
    }
  }]);

  return IdolJsHttp;
}();

exports.IdolJsHttp = IdolJsHttp;

var IdolJSHttpCodegenFile =
/*#__PURE__*/
function (_GeneratorFileContext) {
  _inherits(IdolJSHttpCodegenFile, _GeneratorFileContext);

  function IdolJSHttpCodegenFile(idolJsHttp, path, type) {
    var _this5;

    _classCallCheck(this, IdolJSHttpCodegenFile);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(IdolJSHttpCodegenFile).call(this, idolJsHttp, path));
    _this5.typeDecon = new _generators.TypeDeconstructor(type);
    return _this5;
  }

  _createClass(IdolJSHttpCodegenFile, [{
    key: "methodFor",
    value: function methodFor(ref) {
      var _this6 = this;

      return (0, _functional.cachedProperty)(this, "methodFor".concat(ref.qualified_name), function () {
        return new IdolJSHttpCodegenMethod(_this6.parent, _this6.path, _this6.type.tags, (0, _generators.getMaterialTypeDeconstructor)(_this6.config.params.allTypes, _this6.config.params.allTypes.obj[ref.qualified_name]));
      });
    }
  }, {
    key: "service",
    get: function get() {
      var _this7 = this;

      return (0, _functional.cachedProperty)(this, "service", function () {
        return _this7.typeDecon.getStruct().filter(function (_) {
          return (0, _generators.includesTag)(_this7.type.tags, "service");
        }).map(function (fields) {
          var methods = fields.mapAndFilter(function (field) {
            return field.getScalar().bind(function (s) {
              return s.getAlias();
            }).bind(function (ref) {
              return _this7.methodFor(ref).methodConfiguration;
            });
          });
          return _this7["export"](_this7.defaultServiceName, scripter.classDec(_toConsumableArray(methods.mapIntoIterable(function (methodName, methodConfig) {
            return scripter.methodDec(methodName, ["args"], [scripter.ret(scripter.invocation(scripter.propAccess("this", "_invoke"), scripter.literal(methodConfig), "args"))]);
          })), _this7.importIdent(_this7.parent.serviceBaseFile.HttpServiceBase)));
        });
      });
    }
  }, {
    key: "defaultServiceName",
    get: function get() {
      return this.type.named.asQualifiedIdent;
    }
  }]);

  return IdolJSHttpCodegenFile;
}(_generators.GeneratorFileContext);

exports.IdolJSHttpCodegenFile = IdolJSHttpCodegenFile;

var IdolJSHttpCodegenMethod =
/*#__PURE__*/
function (_GeneratorFileContext2) {
  _inherits(IdolJSHttpCodegenMethod, _GeneratorFileContext2);

  function IdolJSHttpCodegenMethod(idolJsHttp, path, serviceTags, typeDecon) {
    var _this8;

    _classCallCheck(this, IdolJSHttpCodegenMethod);

    _this8 = _possibleConstructorReturn(this, _getPrototypeOf(IdolJSHttpCodegenMethod).call(this, idolJsHttp, path));
    _this8.typeDecon = typeDecon;
    _this8.serviceTags = serviceTags;
    return _this8;
  }

  _createClass(IdolJSHttpCodegenMethod, [{
    key: "inputTypeDecon",
    get: function get() {
      var _this9 = this;

      return (0, _functional.cachedProperty)(this, "inputTypeDecon", function () {
        return _this9.typeDecon.getStruct().bind(function (fields) {
          return fields.get("input").bind(function (input) {
            return input.getScalar().bind(function (s) {
              return s.getAlias();
            });
          }).map(function (ref) {
            return (0, _generators.getMaterialTypeDeconstructor)(_this9.config.params.allTypes, _this9.config.params.allTypes.obj[ref.qualified_name]);
          });
        }).filter(function (tDecon) {
          return !tDecon.getStruct().isEmpty();
        });
      });
    }
  }, {
    key: "methodConfiguration",
    get: function get() {
      var _this10 = this;

      return this.inputTypeDecon.map(function (inputTypeDecon) {
        return {
          servicePath: (0, _generators.getTagValue)(_this10.serviceTags, "path", "/"),
          methodPath: (0, _generators.getTagValue)(_this10.typeDecon.t.tags, "path", ""),
          pathMappings: (0, _generators.getTagValues)(_this10.typeDecon.t.tags, "pathMapping"),
          method: (0, _generators.getTagValue)(_this10.typeDecon.t.tags, "method", "POST").toUpperCase()
        };
      });
    }
  }]);

  return IdolJSHttpCodegenMethod;
}(_generators.GeneratorFileContext);

exports.IdolJSHttpCodegenMethod = IdolJSHttpCodegenMethod;

var IdolJSHttpScaffoldFile =
/*#__PURE__*/
function (_GeneratorFileContext3) {
  _inherits(IdolJSHttpScaffoldFile, _GeneratorFileContext3);

  function IdolJSHttpScaffoldFile(idolJsHttp, path, type) {
    var _this11;

    _classCallCheck(this, IdolJSHttpScaffoldFile);

    _this11 = _possibleConstructorReturn(this, _getPrototypeOf(IdolJSHttpScaffoldFile).call(this, idolJsHttp, path));
    _this11.typeDecon = (0, _generators.getMaterialTypeDeconstructor)(idolJsHttp.config.params.allTypes, type);
    _this11.type = type;

    _this11.reserveIdent(_this11.defaultServiceName);

    return _this11;
  }

  _createClass(IdolJSHttpScaffoldFile, [{
    key: "defaultServiceName",
    get: function get() {
      return this.type.named.typeName;
    }
  }, {
    key: "service",
    get: function get() {
      var _this12 = this;

      return (0, _functional.cachedProperty)(this, "service", function () {
        return _this12.parent.codegenFile(_this12.typeDecon.t.named).service.map(function (codegenService) {
          return _this12["export"](_this12.defaultServiceName, scripter.classDec([], _this12.importIdent(codegenService, "Codegen" + _this12.defaultServiceName)));
        });
      });
    }
  }]);

  return IdolJSHttpScaffoldFile;
}(_generators.GeneratorFileContext);

exports.IdolJSHttpScaffoldFile = IdolJSHttpScaffoldFile;

var HttpServiceBase =
/*#__PURE__*/
function (_ExternFileContext) {
  _inherits(HttpServiceBase, _ExternFileContext);

  function HttpServiceBase(parent, path) {
    _classCallCheck(this, HttpServiceBase);

    return _possibleConstructorReturn(this, _getPrototypeOf(HttpServiceBase).call(this, (0, _path.resolve)(__dirname, "../../lib/idol/HttpServiceBase.js"), parent, path));
  }

  _createClass(HttpServiceBase, [{
    key: "HttpServiceBase",
    get: function get() {
      return this.exportExtern("HttpServiceBase");
    }
  }]);

  return HttpServiceBase;
}(_generators.ExternFileContext);

exports.HttpServiceBase = HttpServiceBase;

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
  var idolJsHttp = new IdolJsHttp(config);
  var moveTo = (0, _generators.build)(config, idolJsHttp.render());
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}