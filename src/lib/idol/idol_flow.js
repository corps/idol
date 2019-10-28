#! /usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IdolFlowScaffoldFile = exports.IdolFlowCodegenEnum = exports.IdolFlowCodegenFile = exports.IdolFlow = void 0;

var _cli = require("./cli");

var _generators = require("./generators");

var _Type = require("./js/schema/Type");

var _functional = require("./functional");

var _Reference = require("./js/schema/Reference");

var scripter = _interopRequireWildcard(require("./scripter"));

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

var A = {
  A: "b",
  C: "c"
};

var IdolFlow =
/*#__PURE__*/
function () {
  function IdolFlow(config) {
    var codegenImpl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (idolFlow, path, type) {
      return new IdolFlowCodegenFile(idolFlow, path, type);
    };
    var scaffoldImpl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (idolFlow, path, type) {
      return new IdolFlowScaffoldFile(idolFlow, path, type);
    };

    _classCallCheck(this, IdolFlow);

    this.state = new _generators.GeneratorAcc();
    this.config = config;
    this.codegenImpl = codegenImpl;
    this.scaffoldImpl = scaffoldImpl;
  }

  _createClass(IdolFlow, [{
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

        if (!scaffoldFile.declaredType.isEmpty()) {
          // Also add the declared enum
          scaffoldFile.declaredEnum.unwrap();
          console.log("Generated ".concat(scaffoldFile.defaultTypeName, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        } else {
          console.log("Skipped ".concat(scaffoldFile.defaultTypeName, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        }
      });
      return this.state.render({
        codegen: " @flow\nDO NOT EDIT\nThis file was generated by idol_flow, any changes will be overwritten when idol_flow is run again.",
        scaffold: " @flow\nThis file was scaffolded by idol_flow.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_flow."
      });
    }
  }]);

  return IdolFlow;
}();

exports.IdolFlow = IdolFlow;

var IdolFlowCodegenFile =
/*#__PURE__*/
function (_GeneratorFileContext) {
  _inherits(IdolFlowCodegenFile, _GeneratorFileContext);

  function IdolFlowCodegenFile(idolFlow, path, type) {
    var _this4;

    _classCallCheck(this, IdolFlowCodegenFile);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(IdolFlowCodegenFile).call(this, idolFlow, path));
    _this4.typeDecon = new _generators.TypeDeconstructor(type);

    _this4.reserveIdent(_this4.defaultTypeName);

    _this4.reserveIdent(_this4.defaultEnumName);

    _this4.reserveIdent(_this4.defaultFactoryName);

    return _this4;
  }

  _createClass(IdolFlowCodegenFile, [{
    key: "defaultTypeName",
    get: function get() {
      return this.typeDecon.t.named.asQualifiedIdent + "Payload";
    }
  }, {
    key: "defaultEnumName",
    get: function get() {
      return this.typeDecon.t.named.asQualifiedIdent;
    }
  }, {
    key: "defaultFactoryName",
    get: function get() {
      return this.typeDecon.t.named.asQualifiedIdent + "Factory";
    }
  }, {
    key: "declaredType",
    get: function get() {
      var _this5 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this5["enum"].bind(function (e) {
          return e.declaredType;
        });
      });
    }
  }, {
    key: "declaredEnum",
    get: function get() {
      var _this6 = this;

      return (0, _functional.cachedProperty)(this, "declaredEnum", function () {
        return _this6["enum"].bind(function (e) {
          return e.declaredEnum;
        });
      });
    }
  }, {
    key: "declaredFactory",
    get: function get() {
      var _this7 = this;

      return (0, _functional.cachedProperty)(this, "declaredFactory", function () {
        return _this7["enum"].bind(function (e) {
          return e.declaredFactory;
        });
      });
    }
  }, {
    key: "declaredFactoryTyping",
    get: function get() {
      var _this8 = this;

      return (0, _functional.cachedProperty)(this, "declaredFactoryTyping", function () {
        return _this8.declaredType.map(function (declaredType) {
          return function (state, path) {
            return "() => ".concat(state.importIdent(path, declaredType));
          };
        });
      });
    }
  }, {
    key: "enum",
    get: function get() {
      var _this9 = this;

      return (0, _functional.cachedProperty)(this, "enum", function () {
        return _this9.typeDecon.getEnum().map(function (options) {
          return new IdolFlowCodegenEnum(_this9, options);
        });
      });
    }
  }]);

  return IdolFlowCodegenFile;
}(_generators.GeneratorFileContext);

exports.IdolFlowCodegenFile = IdolFlowCodegenFile;

var IdolFlowCodegenEnum =
/*#__PURE__*/
function (_GeneratorFileContext2) {
  _inherits(IdolFlowCodegenEnum, _GeneratorFileContext2);

  function IdolFlowCodegenEnum(codegenFile, options) {
    var _this10;

    _classCallCheck(this, IdolFlowCodegenEnum);

    _this10 = _possibleConstructorReturn(this, _getPrototypeOf(IdolFlowCodegenEnum).call(this, codegenFile.parent, codegenFile.path));
    _this10.codegenFile = codegenFile;
    _this10.options = options;
    return _this10;
  }

  _createClass(IdolFlowCodegenEnum, [{
    key: "declaredType",
    get: function get() {
      var _this11 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _functional.Alt.lift(_this11["export"](_this11.codegenFile.defaultTypeName, scripter.variable(scripter.typeSum.apply(scripter, _toConsumableArray(_this11.options.map(scripter.literal))), "type"), true));
      });
    }
  }, {
    key: "declaredEnum",
    get: function get() {
      var _this12 = this;

      return (0, _functional.cachedProperty)(this, "declaredEnum", function () {
        return _this12.declaredType.map(function (declaredType) {
          return _this12["export"](_this12.codegenFile.defaultEnumName, scripter.variable(scripter.objLiteral.apply(scripter, _toConsumableArray(_this12.options.map(function (option) {
            return scripter.propDec(option.toUpperCase(), scripter.literal(option));
          }))), "const", true, _this12.importIdent(declaredType)));
        });
      });
    }
  }, {
    key: "declaredFactory",
    get: function get() {
      var _this13 = this;

      return (0, _functional.cachedProperty)(this, "declaredFactory", function () {
        return _this13.codegenFile.declaredFactoryTyping.map(function (factoryTyping) {
          return _this13["export"](_this13.codegenFile.defaultFactoryName, scripter.variable(scripter.arrowFunc([], scripter.literal(_this13.options[0])), "const", true, _this13.applyExpr(factoryTyping)));
        });
      });
    }
  }]);

  return IdolFlowCodegenEnum;
}(_generators.GeneratorFileContext);

exports.IdolFlowCodegenEnum = IdolFlowCodegenEnum;

var IdolFlowScaffoldFile =
/*#__PURE__*/
function (_GeneratorFileContext3) {
  _inherits(IdolFlowScaffoldFile, _GeneratorFileContext3);

  function IdolFlowScaffoldFile(idolFlow, path, type) {
    var _this14;

    _classCallCheck(this, IdolFlowScaffoldFile);

    _this14 = _possibleConstructorReturn(this, _getPrototypeOf(IdolFlowScaffoldFile).call(this, idolFlow, path));
    _this14.typeDecon = (0, _generators.getMaterialTypeDeconstructor)(idolFlow.config.params.allTypes, type);
    _this14.type = type;
    _this14.codegenFile = idolFlow.codegenFile(_this14.typeDecon.t.named);

    _this14.reserveIdent(_this14.defaultTypeName);

    _this14.reserveIdent(_this14.defaultEnumName);

    return _this14;
  }

  _createClass(IdolFlowScaffoldFile, [{
    key: "defaultTypeName",
    get: function get() {
      return this.type.named.typeName + "Payload";
    }
  }, {
    key: "defaultEnumName",
    get: function get() {
      return this.type.named.typeName;
    }
  }, {
    key: "declaredType",
    get: function get() {
      var _this15 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this15.codegenFile.declaredType.bind(function (codegenType) {
          return _functional.Alt.lift(_this15["export"](_this15.defaultTypeName, scripter.variable(_this15.importIdent(codegenType), "type", true), true));
        });
      });
    }
  }, {
    key: "declaredEnum",
    get: function get() {
      var _this16 = this;

      return (0, _functional.cachedProperty)(this, "declaredEnum", function () {
        return _this16.codegenFile.declaredEnum.map(function (codegenEnum) {
          return _this16["export"](_this16.defaultEnumName, scripter.variable(_this16.importIdent(codegenEnum)));
        });
      });
    }
  }, {
    key: "declaredFactoryTyping",
    get: function get() {
      var _this17 = this;

      return (0, _functional.cachedProperty)(this, "declaredFactoryTyping", function () {
        return _this17.declaredType.map(function (declaredType) {
          return function (state, path) {
            return "() => ".concat(state.importIdent(path, declaredType));
          };
        });
      });
    }
  }, {
    key: "declaredFactory",
    get: function get() {
      var _this18 = this;

      return (0, _functional.cachedProperty)(this, "declaredFactory", function () {
        return _this18.codegenFile.declaredFactory.bind(function (codegenFactory) {
          return _this18.declaredFactoryTyping.map(function (factoryTyping) {
            return _this18["export"](_this18.defaultEnumName, scripter.variable(_this18.importIdent(codegenFactory), "const", true, _this18.applyExpr(factoryTyping)));
          });
        });
      });
    }
  }]);

  return IdolFlowScaffoldFile;
}(_generators.GeneratorFileContext);

exports.IdolFlowScaffoldFile = IdolFlowScaffoldFile;

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
  var idolFlow = new IdolFlow(config);
  var moveTo = (0, _generators.build)(config, idolFlow.render());
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}