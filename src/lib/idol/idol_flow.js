#! /usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IdolFlowScaffoldFile = exports.IdolFlowCodegenScalar = exports.IdolFlowCodegenTypeStructDecalaration = exports.IdolFlowCodegenTypestruct = exports.IdolFlowCodegenStruct = exports.IdolFlowCodegenEnum = exports.IdolFlowCodegenFile = exports.IdolFlow = void 0;

var _cli = require("./cli");

var _generators = require("./generators");

var _Type = require("./js/schema/Type");

var _functional = require("./functional");

var _Reference = require("./js/schema/Reference");

var scripter = _interopRequireWildcard(require("./scripter"));

var _PrimitiveType = require("./js/schema/PrimitiveType");

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

var A = {
  A: "b",
  C: "c"
};

var IdolFlow =
/*#__PURE__*/
function () {
  function IdolFlow(config) {
    _classCallCheck(this, IdolFlow);

    this.state = new _generators.GeneratorAcc();
    this.config = config;
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
        return new _this.IdolFlowCodegenFile(_this, path, type);
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
        return new _this2.IdolFlowScaffoldFile(_this2, path, type);
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
          scaffoldFile.declaredEnum;
          scaffoldFile.declaredFactory;
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
  }, {
    key: "IdolFlowCodegenFile",
    get: function get() {
      return IdolFlowCodegenFile;
    }
  }, {
    key: "IdolFlowScaffoldFile",
    get: function get() {
      return IdolFlowScaffoldFile;
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
        }).either(_this5.typeStruct.bind(function (ts) {
          return ts.declaredType;
        })).either(_this5.struct.bind(function (struct) {
          return struct.declaredType;
        }));
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
        }).either(_this7.typeStruct.bind(function (ts) {
          return ts.declaredFactory;
        })).either(_this7.struct.bind(function (struct) {
          return struct.declaredFactory;
        }));
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
          return new _this9.IdolFlowCodegenEnum(_this9, options);
        });
      });
    }
  }, {
    key: "IdolFlowCodegenEnum",
    get: function get() {
      return IdolFlowCodegenEnum;
    }
  }, {
    key: "typeStruct",
    get: function get() {
      var _this10 = this;

      return (0, _functional.cachedProperty)(this, "typeStruct", function () {
        return _this10.typeDecon.getTypeStruct().map(function (tsDecon) {
          return new _this10.IdolFlowCodegenTypeStructDecalaration(_this10, tsDecon);
        });
      });
    }
  }, {
    key: "IdolFlowCodegenTypeStructDecalaration",
    get: function get() {
      return IdolFlowCodegenTypeStructDecalaration;
    }
  }, {
    key: "struct",
    get: function get() {
      var _this11 = this;

      return (0, _functional.cachedProperty)(this, "struct", function () {
        return _this11.typeDecon.getStruct().map(function (fields) {
          return new _this11.IdolFlowCodegenStruct(_this11, fields.map(function (tsDecon) {
            return new _this11.IdolFlowCodegenTypestruct(_this11.parent, tsDecon);
          }));
        });
      });
    }
  }, {
    key: "IdolFlowCodegenTypestruct",
    get: function get() {
      return IdolFlowCodegenTypestruct;
    }
  }, {
    key: "IdolFlowCodegenStruct",
    get: function get() {
      return IdolFlowCodegenStruct;
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
    var _this12;

    _classCallCheck(this, IdolFlowCodegenEnum);

    _this12 = _possibleConstructorReturn(this, _getPrototypeOf(IdolFlowCodegenEnum).call(this, codegenFile.parent, codegenFile.path));
    _this12.codegenFile = codegenFile;
    _this12.options = options;
    return _this12;
  }

  _createClass(IdolFlowCodegenEnum, [{
    key: "declaredType",
    get: function get() {
      var _this13 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _functional.Alt.lift(_this13["export"](_this13.codegenFile.defaultTypeName, scripter.variable(scripter.typeSum.apply(scripter, _toConsumableArray(_this13.options.map(scripter.literal))), "type"), true));
      });
    }
  }, {
    key: "declaredEnum",
    get: function get() {
      var _this14 = this;

      return (0, _functional.cachedProperty)(this, "declaredEnum", function () {
        return _this14.declaredType.map(function (declaredType) {
          return _this14["export"](_this14.codegenFile.defaultEnumName, scripter.variable(scripter.objLiteral.apply(scripter, _toConsumableArray(_this14.options.map(function (option) {
            return scripter.propDec(option.toUpperCase(), scripter.literal(option));
          }))), "const", true, "{ [k: string]: ".concat(_this14.importIdent(declaredType), " }")));
        });
      });
    }
  }, {
    key: "declaredFactory",
    get: function get() {
      var _this15 = this;

      return (0, _functional.cachedProperty)(this, "declaredFactory", function () {
        return _this15.codegenFile.declaredFactoryTyping.map(function (factoryTyping) {
          return _this15["export"](_this15.codegenFile.defaultFactoryName, scripter.variable(scripter.arrowFunc([], scripter.literal(_this15.options[0])), "const", true, _this15.applyExpr(factoryTyping)));
        });
      });
    }
  }]);

  return IdolFlowCodegenEnum;
}(_generators.GeneratorFileContext);

exports.IdolFlowCodegenEnum = IdolFlowCodegenEnum;

var IdolFlowCodegenStruct =
/*#__PURE__*/
function (_GeneratorFileContext3) {
  _inherits(IdolFlowCodegenStruct, _GeneratorFileContext3);

  function IdolFlowCodegenStruct(codegenFile, fields) {
    var _this16;

    _classCallCheck(this, IdolFlowCodegenStruct);

    _this16 = _possibleConstructorReturn(this, _getPrototypeOf(IdolFlowCodegenStruct).call(this, codegenFile.parent, codegenFile.path));
    _this16.codegenFile = codegenFile;
    _this16.fields = fields;
    return _this16;
  }

  _createClass(IdolFlowCodegenStruct, [{
    key: "declaredType",
    get: function get() {
      var _this17 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        var fieldExprs = _this17.fields.mapAndFilter(function (f) {
          return f.typeExpr;
        });

        return _functional.Alt.lift(_this17["export"](_this17.codegenFile.defaultTypeName, scripter.iface.apply(scripter, [true, null].concat(_toConsumableArray(fieldExprs.keys().map(function (fieldName) {
          return scripter.propDec(fieldName, _this17.applyExpr(fieldExprs.obj[fieldName]));
        })))), true));
      });
    }
  }, {
    key: "declaredFactory",
    get: function get() {
      var _this18 = this;

      return (0, _functional.cachedProperty)(this, "declaredFactory", function () {
        var fieldExprs = _this18.fields.mapAndFilter(function (f) {
          return f.factoryExpr;
        });

        return _this18.codegenFile.declaredFactoryTyping.map(function (factoryTyping) {
          return _this18["export"](_this18.codegenFile.defaultFactoryName, scripter.variable(scripter.arrowFunc([], scripter.objLiteral.apply(scripter, _toConsumableArray(fieldExprs.keys().map(function (fieldName) {
            return scripter.propDec(fieldName, scripter.invocation(_this18.applyExpr(fieldExprs.obj[fieldName])));
          })))), "const", true, _this18.applyExpr(factoryTyping)));
        });
      });
    }
  }]);

  return IdolFlowCodegenStruct;
}(_generators.GeneratorFileContext);

exports.IdolFlowCodegenStruct = IdolFlowCodegenStruct;

var IdolFlowCodegenTypestruct =
/*#__PURE__*/
function () {
  function IdolFlowCodegenTypestruct(idolFlow, tsDecon) {
    _classCallCheck(this, IdolFlowCodegenTypestruct);

    this.tsDecon = tsDecon;
    this.state = idolFlow.state;
    this.config = idolFlow.config;
    this.idolFlow = idolFlow;
  }

  _createClass(IdolFlowCodegenTypestruct, [{
    key: "innerScalar",
    get: function get() {
      var _this19 = this;

      return (0, _functional.cachedProperty)(this, "innerScalar", function () {
        return _this19.tsDecon.getScalar().concat(_this19.tsDecon.getMap()).concat(_this19.tsDecon.getRepeated()).map(function (scalarDecon) {
          return new _this19.IdolFlowCodegenScalar(_this19.idolFlow, scalarDecon);
        });
      });
    }
  }, {
    key: "IdolFlowCodegenScalar",
    get: function get() {
      return IdolFlowCodegenScalar;
    }
  }, {
    key: "typeExpr",
    get: function get() {
      var _this20 = this;

      return this.innerScalar.bind(function (innerScalar) {
        return _this20.tsDecon.getScalar().bind(function (_) {
          return innerScalar.typeExpr;
        }).either(_this20.tsDecon.getRepeated().bind(function (_) {
          return innerScalar.typeExpr;
        }).map(function (expr) {
          return (0, _generators.wrapExpression)(expr, function (s) {
            return "Array<".concat(s, ">");
          });
        })).either(_this20.tsDecon.getMap().bind(function (_) {
          return innerScalar.typeExpr;
        }).map(function (expr) {
          return (0, _generators.wrapExpression)(expr, function (s) {
            return "{ [k: string]: ".concat(s, " }");
          });
        })).map(function (expr) {
          return (0, _generators.includesTag)(_this20.tsDecon.context.fieldTags, "optional") ? (0, _generators.wrapExpression)(expr, function (s) {
            return "".concat(s, " | null | typeof undefined");
          }) : expr;
        });
      });
    }
  }, {
    key: "factoryExpr",
    get: function get() {
      var _this21 = this;

      if ((0, _generators.includesTag)(this.tsDecon.context.fieldTags, "optional")) {
        return _functional.Alt.lift(function () {
          return scripter.arrowFunc([], scripter.literal(null));
        });
      }

      return this.tsDecon.getScalar().bind(function (_) {
        return _this21.innerScalar;
      }).bind(function (innerScalar) {
        return innerScalar.factoryExpr;
      }).either(this.tsDecon.getMap().map(function (_) {
        return function () {
          return scripter.arrowFunc([], scripter.literal({}));
        };
      })).either(this.tsDecon.getRepeated().map(function (_) {
        return function () {
          return scripter.arrowFunc([], scripter.literal([]));
        };
      }));
    }
  }]);

  return IdolFlowCodegenTypestruct;
}();

exports.IdolFlowCodegenTypestruct = IdolFlowCodegenTypestruct;

var IdolFlowCodegenTypeStructDecalaration =
/*#__PURE__*/
function (_IdolFlowCodegenTypes) {
  _inherits(IdolFlowCodegenTypeStructDecalaration, _IdolFlowCodegenTypes);

  function IdolFlowCodegenTypeStructDecalaration(codegenFile, tsDecon) {
    var _this22;

    _classCallCheck(this, IdolFlowCodegenTypeStructDecalaration);

    _this22 = _possibleConstructorReturn(this, _getPrototypeOf(IdolFlowCodegenTypeStructDecalaration).call(this, codegenFile.parent, tsDecon));
    _this22.codegenFile = codegenFile;
    return _this22;
  }

  _createClass(IdolFlowCodegenTypeStructDecalaration, [{
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
      var _this23 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this23.typeExpr.map(function (typeExpr) {
          return _this23["export"](_this23.codegenFile.defaultTypeName, scripter.variable(_this23.applyExpr(typeExpr), "type"), true);
        });
      });
    }
  }, {
    key: "declaredFactory",
    get: function get() {
      var _this24 = this;

      return (0, _functional.cachedProperty)(this, "declaredFactory", function () {
        return _this24.factoryExpr.map(function (factoryExpr) {
          return _this24["export"](_this24.codegenFile.defaultFactoryName, scripter.variable(_this24.applyExpr(factoryExpr), "const"));
        });
      });
    }
  }]);

  return IdolFlowCodegenTypeStructDecalaration;
}(IdolFlowCodegenTypestruct);

exports.IdolFlowCodegenTypeStructDecalaration = IdolFlowCodegenTypeStructDecalaration;

var IdolFlowCodegenScalar =
/*#__PURE__*/
function () {
  function IdolFlowCodegenScalar(idolFlow, scalarDecon) {
    var _this25 = this;

    _classCallCheck(this, IdolFlowCodegenScalar);

    this.scalarDecon = scalarDecon;
    this.state = idolFlow.state;
    this.config = idolFlow.config;
    this.idolFlow = idolFlow;
    this.aliasScaffoldFile = this.scalarDecon.getAlias().filter(function (ref) {
      return ref.qualified_name in _this25.config.params.scaffoldTypes.obj;
    }).map(function (ref) {
      return _this25.idolFlow.scaffoldFile(ref);
    });
    this.aliasCodegenFile = this.scalarDecon.getAlias().map(function (ref) {
      return _this25.idolFlow.codegenFile(ref);
    });
  }

  _createClass(IdolFlowCodegenScalar, [{
    key: "typeExpr",
    get: function get() {
      return this.referenceImportType.either(this.primType).either(this.literalType);
    }
  }, {
    key: "factoryExpr",
    get: function get() {
      return this.referenceImportFactory.either(this.primFactory).either(this.literalFactory);
    }
  }, {
    key: "referenceImportType",
    get: function get() {
      if (this.aliasScaffoldFile.isEmpty()) {
        return this.aliasCodegenFile.bind(function (codegenFile) {
          return codegenFile.declaredType;
        }).map(function (codegenType) {
          return (0, _generators.importExpr)(codegenType, "Codegen" + codegenType.ident);
        });
      }

      return this.aliasScaffoldFile.bind(function (scaffoldFile) {
        return scaffoldFile.declaredType;
      }).map(function (scaffoldType) {
        return (0, _generators.importExpr)(scaffoldType, "Scaffold" + scaffoldType.ident);
      });
    }
  }, {
    key: "referenceImportFactory",
    get: function get() {
      if (this.aliasScaffoldFile.isEmpty()) {
        return this.aliasCodegenFile.bind(function (codegenFile) {
          return codegenFile.declaredFactory;
        }).map(function (codegenFactory) {
          return (0, _generators.importExpr)(codegenFactory, "Codegen" + codegenFactory.ident);
        });
      }

      return this.aliasScaffoldFile.bind(function (scaffoldFile) {
        return scaffoldFile.declaredFactory;
      }).map(function (scaffoldFactory) {
        return (0, _generators.importExpr)(scaffoldFactory, "Scaffold" + scaffoldFactory.ident);
      });
    }
  }, {
    key: "primType",
    get: function get() {
      return this.scalarDecon.getPrimitive().map(function (prim) {
        return function () {
          switch (prim) {
            case _PrimitiveType.PrimitiveType.STRING:
              return "string";

            case _PrimitiveType.PrimitiveType.INT:
            case _PrimitiveType.PrimitiveType.DOUBLE:
              return "number";

            case _PrimitiveType.PrimitiveType.BOOL:
              return "boolean";
          }

          return "any";
        };
      });
    }
  }, {
    key: "literalType",
    get: function get() {
      return this.scalarDecon.getLiteral().map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            _ = _ref2[0],
            val = _ref2[1];

        return function () {
          return scripter.literal(val);
        };
      });
    }
  }, {
    key: "primFactory",
    get: function get() {
      return this.scalarDecon.getPrimitive().map(function (prim) {
        switch (prim) {
          case _PrimitiveType.PrimitiveType.STRING:
            return scripter.literal("");

          case _PrimitiveType.PrimitiveType.INT:
            return scripter.literal(0);

          case _PrimitiveType.PrimitiveType.DOUBLE:
            return scripter.literal(0);

          case _PrimitiveType.PrimitiveType.BOOL:
            return scripter.literal(false);
        }

        return scripter.literal({});
      }).map(function (val) {
        return function () {
          return scripter.arrowFunc([], val);
        };
      });
    }
  }, {
    key: "literalFactory",
    get: function get() {
      return this.scalarDecon.getLiteral().map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            _ = _ref4[0],
            val = _ref4[1];

        return function () {
          return scripter.arrowFunc([], scripter.literal(val));
        };
      });
    }
  }]);

  return IdolFlowCodegenScalar;
}();

exports.IdolFlowCodegenScalar = IdolFlowCodegenScalar;

var IdolFlowScaffoldFile =
/*#__PURE__*/
function (_GeneratorFileContext4) {
  _inherits(IdolFlowScaffoldFile, _GeneratorFileContext4);

  function IdolFlowScaffoldFile(idolFlow, path, type) {
    var _this26;

    _classCallCheck(this, IdolFlowScaffoldFile);

    _this26 = _possibleConstructorReturn(this, _getPrototypeOf(IdolFlowScaffoldFile).call(this, idolFlow, path));
    _this26.typeDecon = (0, _generators.getMaterialTypeDeconstructor)(idolFlow.config.params.allTypes, type);
    _this26.type = type;
    _this26.codegenFile = idolFlow.codegenFile(_this26.typeDecon.t.named);

    _this26.reserveIdent(_this26.defaultTypeName);

    _this26.reserveIdent(_this26.defaultEnumName);

    _this26.reserveIdent(_this26.defaultFactoryName);

    return _this26;
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
    key: "defaultFactoryName",
    get: function get() {
      return this.type.named.typeName + "Factory";
    }
  }, {
    key: "declaredType",
    get: function get() {
      var _this27 = this;

      return (0, _functional.cachedProperty)(this, "declaredType", function () {
        return _this27.codegenFile.declaredType.bind(function (codegenType) {
          var codegenTypeIdent = _this27.importIdent(codegenType);

          var scriptable = scripter.variable(codegenTypeIdent, "type", true);

          if (!_this27.typeDecon.getStruct().isEmpty()) {
            scriptable = scripter.iface(true, codegenTypeIdent);
          }

          return _functional.Alt.lift(_this27["export"](_this27.defaultTypeName, scriptable, true));
        });
      });
    }
  }, {
    key: "declaredEnum",
    get: function get() {
      var _this28 = this;

      return (0, _functional.cachedProperty)(this, "declaredEnum", function () {
        return _this28.codegenFile.declaredEnum.map(function (codegenEnum) {
          return _this28["export"](_this28.defaultEnumName, scripter.variable(_this28.importIdent(codegenEnum)));
        });
      });
    }
  }, {
    key: "declaredFactoryTyping",
    get: function get() {
      var _this29 = this;

      return (0, _functional.cachedProperty)(this, "declaredFactoryTyping", function () {
        return _this29.declaredType.map(function (declaredType) {
          return function (state, path) {
            return "() => ".concat(state.importIdent(path, declaredType));
          };
        });
      });
    }
  }, {
    key: "declaredFactory",
    get: function get() {
      var _this30 = this;

      return (0, _functional.cachedProperty)(this, "declaredFactory", function () {
        return _this30.codegenFile.declaredFactory.bind(function (codegenFactory) {
          return _this30.declaredFactoryTyping.map(function (factoryTyping) {
            return _this30["export"](_this30.defaultFactoryName, scripter.variable(_this30.importIdent(codegenFactory), "const", true, _this30.applyExpr(factoryTyping)));
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