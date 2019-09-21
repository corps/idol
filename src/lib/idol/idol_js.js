"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IdolJsFile = exports.IdolJsCodegenScalar = exports.IdolJsCodegenTypeStructDeclaration = exports.IdolJsCodegenTypeStruct = exports.IdolJsCodegenEnum = exports.IdolJsCodegenStruct = exports.IdolJsScaffoldFile = exports.IdolJsCodegenFile = exports.IdolJs = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var scripter = _interopRequireWildcard(require("./scripter"));

var _cli = require("./cli");

var _Reference = require("./schema/Reference");

var _Type = require("./schema/Type");

var _generators = require("./generators");

var _functional = require("./functional");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

var IdolJs =
/*#__PURE__*/
function () {
  function IdolJs(config) {
    var codegenImpl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (idolJs, path, type) {
      return new IdolJsCodegenFile(idolJs, path, type);
    };
    var scaffoldImpl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (idolJs, path, type) {
      return new IdolJsScaffoldFile(idolJs, path, type);
    };

    _classCallCheck(this, IdolJs);

    this.state = new _generators.GeneratorAcc();
    this.config = config;
    this.codegenImpl = codegenImpl;
    this.scaffoldImpl = scaffoldImpl;
  }

  _createClass(IdolJs, [{
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

        if (!scaffoldFile.declaredTypeIdent.isEmpty()) {
          console.log("Generated ".concat(t.named.qualified_name, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        } else {
          console.log("Skipped ".concat(t.named.qualified_name, " (").concat(i + 1, " / ").concat(scaffoldTypes.length, ")"));
        }
      });
      return this.state.render({
        codegen: "DO NOT EDIT\nThis file was generated by idol_js, any changes will be overwritten when idol_js is run again.",
        scaffold: "This file was scaffolded by idol_js.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_js."
      });
    }
  }, {
    key: "idolJsFile",
    get: function get() {
      var _this4 = this;

      return (0, _functional.cachedProperty)(this, "idolJsFile", function () {
        return new IdolJsFile(_this4, _this4.state.reservePath({
          runtime: _this4.config.codegenRoot + "/__idol__.js"
        }));
      });
    }
  }]);

  return IdolJs;
}();

exports.IdolJs = IdolJs;

var IdolJsCodegenFile =
/*#__PURE__*/
function (_GeneratorFileContext) {
  _inherits(IdolJsCodegenFile, _GeneratorFileContext);

  function IdolJsCodegenFile(idolJs, path, type) {
    var _this5;

    _classCallCheck(this, IdolJsCodegenFile);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(IdolJsCodegenFile).call(this, idolJs, path));
    _this5.typeDecon = new _generators.TypeDeconstructor(type);
    return _this5;
  }

  _createClass(IdolJsCodegenFile, [{
    key: "type",
    get: function get() {
      return this.typeDecon.t;
    }
  }, {
    key: "defaultTypeName",
    get: function get() {
      return this.type.named.asQualifiedIdent;
    }
  }, {
    key: "declaredTypeIdent",
    get: function get() {
      var _this6 = this;

      return (0, _functional.cachedProperty)(this, "declaredTypeIdent", function () {
        return _this6["enum"].bind(function (e) {
          return e.declaredIdent;
        }).either(_this6.typeStruct.bind(function (ts) {
          return ts.declaredIdent;
        })).either(_this6.struct.bind(function (struct) {
          return struct.declaredIdent;
        }));
      });
    }
  }, {
    key: "struct",
    get: function get() {
      var _this7 = this;

      return (0, _functional.cachedProperty)(this, "struct", function () {
        return _this7.typeDecon.getStruct().map(function (fields) {
          return new IdolJsCodegenStruct(_this7, fields.map(function (tsDecon) {
            return new IdolJsCodegenTypeStruct(_this7.parent, tsDecon);
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
          return new IdolJsCodegenEnum(_this8, options);
        });
      });
    }
  }, {
    key: "typeStruct",
    get: function get() {
      var _this9 = this;

      return (0, _functional.cachedProperty)(this, "typeStruct", function () {
        return _this9.typeDecon.getTypeStruct().map(function (tsDecon) {
          return new IdolJsCodegenTypeStructDeclaration(_this9, tsDecon);
        });
      });
    }
  }]);

  return IdolJsCodegenFile;
}(_generators.GeneratorFileContext);

exports.IdolJsCodegenFile = IdolJsCodegenFile;

var IdolJsScaffoldFile =
/*#__PURE__*/
function (_GeneratorFileContext2) {
  _inherits(IdolJsScaffoldFile, _GeneratorFileContext2);

  function IdolJsScaffoldFile(idolJs, path, type) {
    var _this10;

    _classCallCheck(this, IdolJsScaffoldFile);

    _this10 = _possibleConstructorReturn(this, _getPrototypeOf(IdolJsScaffoldFile).call(this, idolJs, path));
    _this10.typeDecon = new _generators.TypeDeconstructor(type);
    return _this10;
  }

  _createClass(IdolJsScaffoldFile, [{
    key: "type",
    get: function get() {
      return this.typeDecon.t;
    }
  }, {
    key: "defaultTypeName",
    get: function get() {
      return this.type.named.typeName;
    }
  }, {
    key: "declaredTypeIdent",
    get: function get() {
      var _this11 = this;

      return (0, _functional.cachedProperty)(this, "declaredTypeIdent", function () {
        var codegenFile = _this11.parent.codegenFile(_this11.type.named);

        return codegenFile.declaredTypeIdent.bind(function (codegenType) {
          return codegenFile.struct.map(function (codegenStruct) {
            return scripter.classDec([scripter.methodDec("constructor", ["val"], [scripter.invocation("super", "val")])], _this11.state.importIdent(_this11.path, codegenType));
          }).concat(codegenFile.typeStruct.map(function (tsDecon) {
            return scripter.variable(_this11.state.importIdent(_this11.path, codegenType));
          })).concat(codegenFile["enum"].map(function (options) {
            return scripter.variable(_this11.state.importIdent(_this11.path, codegenType));
          })).map(function (scriptable) {
            return {
              ident: _this11.state.addContentWithIdent(_this11.path, _this11.defaultTypeName, scriptable),
              path: _this11.path
            };
          });
        });
      });
    }
  }]);

  return IdolJsScaffoldFile;
}(_generators.GeneratorFileContext);

exports.IdolJsScaffoldFile = IdolJsScaffoldFile;

var IdolJsCodegenStruct =
/*#__PURE__*/
function (_GeneratorFileContext3) {
  _inherits(IdolJsCodegenStruct, _GeneratorFileContext3);

  function IdolJsCodegenStruct(codegenFile, fields) {
    var _this12;

    _classCallCheck(this, IdolJsCodegenStruct);

    _this12 = _possibleConstructorReturn(this, _getPrototypeOf(IdolJsCodegenStruct).call(this, codegenFile.parent, codegenFile.path));
    _this12.fields = fields;
    _this12.codegenFile = codegenFile;
    return _this12;
  }

  _createClass(IdolJsCodegenStruct, [{
    key: "gettersAndSettersFor",
    value: function gettersAndSettersFor(propName, fieldName, constructor) {
      return [scripter.getProp(propName, [propName !== fieldName ? scripter.ret(scripter.propAccess("this", fieldName)) : scripter.ret(scripter.invocation(scripter.propAccess(constructor, "wrap"), scripter.propExpr("this._original", scripter.literal(fieldName))))]), scripter.setProp(propName, "val", [propName !== fieldName ? scripter.assignment(scripter.propAccess("this", fieldName), "val") : scripter.assignment(scripter.propExpr("this._original", scripter.literal(fieldName)), scripter.invocation(scripter.propAccess(constructor, "unwrap"), "val"))])];
    }
  }, {
    key: "declaredIdent",
    get: function get() {
      var _this13 = this;

      return (0, _functional.cachedProperty)(this, "declaredIdent", function () {
        var fieldConstructorIdents = _this13.fields.mapAndFilter(function (codegenTypeStruct) {
          return codegenTypeStruct.constructorExpr;
        }).map(function (expr) {
          return expr(_this13.state, _this13.path);
        });

        return _functional.Alt.lift({
          path: _this13.path,
          ident: _this13.state.addContentWithIdent(_this13.path, _this13.codegenFile.defaultTypeName, function (ident) {
            return [scripter.classDec([scripter.methodDec("constructor", ["val"], [scripter.assignment("this._original", "val")])].concat(_toConsumableArray(_this13.stubMethods), _toConsumableArray(fieldConstructorIdents.concatMap(function (fieldName, constructor) {
              var camelFieldName = (0, _generators.camelify)(fieldName, false);

              var fields = _this13.gettersAndSettersFor(fieldName, fieldName, constructor);

              return fieldName === camelFieldName ? fields : fields.concat(_this13.gettersAndSettersFor(camelFieldName, fieldName, constructor));
            }, []))))(ident), "\n", scripter.invocation(_this13.state.importIdent(_this13.path, _this13.parent.idolJsFile.struct), ident, scripter.arrayLiteral.apply(scripter, _toConsumableArray(fieldConstructorIdents.mapIntoIterable(function (fieldName, constructor) {
              return scripter.objLiteral(scripter.propDec("fieldName", scripter.literal(fieldName)), scripter.propDec("type", constructor), scripter.propDec("optional", scripter.literal(_this13.fields.obj[fieldName].tsDecon.context.includesTag("optional"))));
            }))))];
          })
        });
      });
    }
  }, {
    key: "stubMethods",
    get: function get() {
      return [scripter.comment("These methods are implemented via the runtime, stubs exist here for reference."), scripter.methodDec("validate", ["val"], [], true), scripter.methodDec("isValid", ["val"], [scripter.ret(scripter.literal(true))], true), scripter.methodDec("expand", ["val"], [scripter.ret("val")], true), scripter.methodDec("unwrap", ["val"], [scripter.ret("val")], true), scripter.methodDec("wrap", ["val"], [scripter.ret("null")], true)];
    }
  }]);

  return IdolJsCodegenStruct;
}(_generators.GeneratorFileContext);

exports.IdolJsCodegenStruct = IdolJsCodegenStruct;

var IdolJsCodegenEnum =
/*#__PURE__*/
function (_GeneratorFileContext4) {
  _inherits(IdolJsCodegenEnum, _GeneratorFileContext4);

  function IdolJsCodegenEnum(codegenFile, options) {
    var _this14;

    _classCallCheck(this, IdolJsCodegenEnum);

    _this14 = _possibleConstructorReturn(this, _getPrototypeOf(IdolJsCodegenEnum).call(this, codegenFile.parent, codegenFile.path));
    _this14.codegenFile = codegenFile;
    _this14.options = options;
    return _this14;
  }

  _createClass(IdolJsCodegenEnum, [{
    key: "declaredIdent",
    get: function get() {
      var _this15 = this;

      return (0, _functional.cachedProperty)(this, "declaredIdent", function () {
        return _functional.Alt.lift({
          path: _this15.path,
          ident: _this15.state.addContentWithIdent(_this15.path, _this15.codegenFile.defaultTypeName, function (ident) {
            return [scripter.variable(scripter.objLiteral.apply(scripter, _toConsumableArray(_this15.options.map(function (option) {
              return scripter.propDec(option.toUpperCase(), scripter.literal(option));
            })).concat(["\n", scripter.propDec("options", scripter.literal(_this15.options)), scripter.propDec("default", scripter.literal(_this15.options[0])), "\n", scripter.comment("These methods are implemented via the runtime, stubs exist here for reference."), scripter.methodDec("validate", ["val"], []), scripter.methodDec("isValid", ["val"], [scripter.ret("true")]), scripter.methodDec("expand", ["val"], [scripter.ret("val")]), scripter.methodDec("wrap", ["val"], [scripter.ret("val")]), scripter.methodDec("unwrap", ["val"], [scripter.ret("val")])])))(ident), scripter.invocation(_this15.state.importIdent(_this15.path, _this15.parent.idolJsFile["enum"]), ident)];
          })
        });
      });
    }
  }]);

  return IdolJsCodegenEnum;
}(_generators.GeneratorFileContext);

exports.IdolJsCodegenEnum = IdolJsCodegenEnum;

var IdolJsCodegenTypeStruct =
/*#__PURE__*/
function () {
  function IdolJsCodegenTypeStruct(idolJs, tsDecon) {
    _classCallCheck(this, IdolJsCodegenTypeStruct);

    this.tsDecon = tsDecon;
    this.state = idolJs.state;
    this.config = idolJs.config;
    this.idolJS = idolJs;
  }

  _createClass(IdolJsCodegenTypeStruct, [{
    key: "constructorExpr",
    get: function get() {
      return this.scalarConstructorExpr.concat(this.collectionConstructorExpr);
    }
  }, {
    key: "scalarConstructorExpr",
    get: function get() {
      if (this.tsDecon.getScalar().isEmpty()) return _functional.Alt.empty();
      return this.innerScalar.bind(function (scalar) {
        return scalar.constructorExpr;
      });
    }
  }, {
    key: "listConstructorArgs",
    get: function get() {
      return {
        atleastOne: this.tsDecon.context.includesTag(null, "atleast_one")
      };
    }
  }, {
    key: "mapConstructorArgs",
    get: function get() {
      return {};
    }
  }, {
    key: "collectionConstructorExpr",
    get: function get() {
      var _this16 = this;

      var containerAndArgs = this.tsDecon.getMap().map(function (_) {
        return [(0, _generators.importExpr)(_this16.idolJS.idolJsFile.map), _this16.mapConstructorArgs];
      }).either(this.tsDecon.getRepeated().map(function (_) {
        return [(0, _generators.importExpr)(_this16.idolJS.idolJsFile.list), _this16.listConstructorArgs];
      }));
      return this.innerScalar.bind(function (scalar) {
        return scalar.constructorExpr;
      }).bind(function (scalarExpr) {
        return containerAndArgs.map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              containerExpr = _ref2[0],
              args = _ref2[1];

          return function (state, path) {
            return scripter.invocation(scripter.propAccess(containerExpr(state, path), "of"), scalarExpr(state, path), scripter.literal(args));
          };
        });
      });
    }
  }, {
    key: "innerScalar",
    get: function get() {
      var _this17 = this;

      return (0, _functional.cachedProperty)(this, "innerScalar", function () {
        return _this17.tsDecon.getScalar().concat(_this17.tsDecon.getMap()).concat(_this17.tsDecon.getRepeated()).map(function (scalarDecon) {
          return new IdolJsCodegenScalar(_this17.idolJS, scalarDecon);
        });
      });
    }
  }]);

  return IdolJsCodegenTypeStruct;
}();

exports.IdolJsCodegenTypeStruct = IdolJsCodegenTypeStruct;

var IdolJsCodegenTypeStructDeclaration =
/*#__PURE__*/
function (_IdolJsCodegenTypeStr) {
  _inherits(IdolJsCodegenTypeStructDeclaration, _IdolJsCodegenTypeStr);

  function IdolJsCodegenTypeStructDeclaration(codegenFile, tsDecon) {
    var _this18;

    _classCallCheck(this, IdolJsCodegenTypeStructDeclaration);

    _this18 = _possibleConstructorReturn(this, _getPrototypeOf(IdolJsCodegenTypeStructDeclaration).call(this, codegenFile.parent, tsDecon));
    _this18.codegenFile = codegenFile;
    return _this18;
  }

  _createClass(IdolJsCodegenTypeStructDeclaration, [{
    key: "path",
    get: function get() {
      return this.codegenFile.path;
    }
  }, {
    key: "declaredIdent",
    get: function get() {
      var _this19 = this;

      return (0, _functional.cachedProperty)(this, "declaredIdent", function () {
        return _this19.constructorExpr.map(function (expr) {
          return {
            path: _this19.path,
            ident: _this19.state.addContentWithIdent(_this19.path, _this19.codegenFile.defaultTypeName, scripter.variable(expr(_this19.state, _this19.path)))
          };
        });
      });
    }
  }]);

  return IdolJsCodegenTypeStructDeclaration;
}(IdolJsCodegenTypeStruct);

exports.IdolJsCodegenTypeStructDeclaration = IdolJsCodegenTypeStructDeclaration;

var IdolJsCodegenScalar =
/*#__PURE__*/
function () {
  function IdolJsCodegenScalar(idolJs, scalarDecon) {
    _classCallCheck(this, IdolJsCodegenScalar);

    this.scalarDecon = scalarDecon;
    this.state = idolJs.state;
    this.config = idolJs.config;
    this.idolJs = idolJs;
  }

  _createClass(IdolJsCodegenScalar, [{
    key: "constructorExpr",
    get: function get() {
      return this.referenceImportExpr.either(this.primConstructorExpr).either(this.literalConstructorExpr);
    }
  }, {
    key: "referenceImportExpr",
    get: function get() {
      var _this20 = this;

      var aliasScaffoldFile = this.scalarDecon.getAlias().filter(function (ref) {
        return ref.qualified_name in _this20.config.params.scaffoldTypes.obj;
      }).map(function (ref) {
        return _this20.idolJs.scaffoldFile(ref);
      });

      if (aliasScaffoldFile.isEmpty()) {
        var aliasCodegenFile = this.scalarDecon.getAlias().map(function (ref) {
          return _this20.idolJs.codegenFile(ref);
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
    key: "primConstructorExpr",
    get: function get() {
      var _this21 = this;

      return this.scalarDecon.getPrimitive().map(function (prim) {
        return function (state, path) {
          var primCon = state.importIdent(path, _this21.idolJs.idolJsFile.primitive);
          return scripter.invocation(scripter.propAccess(primCon, "of"), scripter.literal(prim));
        };
      });
    }
  }, {
    key: "literalConstructorExpr",
    get: function get() {
      var _this22 = this;

      return this.scalarDecon.getLiteral().map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            lit = _ref4[0],
            val = _ref4[1];

        return function (state, path) {
          var literalCon = state.importIdent(path, _this22.idolJs.idolJsFile.literal);
          return scripter.invocation(scripter.propAccess(literalCon, "of"), scripter.literal(val));
        };
      });
    }
  }]);

  return IdolJsCodegenScalar;
}();

exports.IdolJsCodegenScalar = IdolJsCodegenScalar;

var IdolJsFile =
/*#__PURE__*/
function (_GeneratorFileContext5) {
  _inherits(IdolJsFile, _GeneratorFileContext5);

  function IdolJsFile() {
    _classCallCheck(this, IdolJsFile);

    return _possibleConstructorReturn(this, _getPrototypeOf(IdolJsFile).apply(this, arguments));
  }

  _createClass(IdolJsFile, [{
    key: "dumpedFile",
    get: function get() {
      var _this23 = this;

      return (0, _functional.cachedProperty)(this, "dumpedFile", function () {
        var content = _fs["default"].readFileSync(_path["default"].resolve(__dirname, "../../lib/idol/__idol__.js"), "UTF-8").toString();

        _this23.state.addContent(_this23.path, content);

        return _this23.path;
      });
    }
  }, {
    key: "literal",
    get: function get() {
      var _this24 = this;

      return (0, _functional.cachedProperty)(this, "literal", function () {
        return {
          path: _this24.dumpedFile,
          ident: _this24.state.idents.addIdentifier(_this24.path, "Literal", "literal")
        };
      });
    }
  }, {
    key: "primitive",
    get: function get() {
      var _this25 = this;

      return (0, _functional.cachedProperty)(this, "primitive", function () {
        return {
          path: _this25.dumpedFile,
          ident: _this25.state.idents.addIdentifier(_this25.path, "Primitive", "primitive")
        };
      });
    }
  }, {
    key: "list",
    get: function get() {
      var _this26 = this;

      return (0, _functional.cachedProperty)(this, "list", function () {
        return {
          path: _this26.dumpedFile,
          ident: _this26.state.idents.addIdentifier(_this26.path, "List", "list")
        };
      });
    }
  }, {
    key: "map",
    get: function get() {
      var _this27 = this;

      return (0, _functional.cachedProperty)(this, "map", function () {
        return {
          path: _this27.dumpedFile,
          ident: _this27.state.idents.addIdentifier(_this27.path, "Map", "map")
        };
      });
    }
  }, {
    key: "enum",
    get: function get() {
      var _this28 = this;

      return (0, _functional.cachedProperty)(this, "enum", function () {
        return {
          path: _this28.dumpedFile,
          ident: _this28.state.idents.addIdentifier(_this28.path, "Enum", "enum")
        };
      });
    }
  }, {
    key: "struct",
    get: function get() {
      var _this29 = this;

      return (0, _functional.cachedProperty)(this, "struct", function () {
        return {
          path: _this29.dumpedFile,
          ident: _this29.state.idents.addIdentifier(_this29.path, "Struct", "struct")
        };
      });
    }
  }]);

  return IdolJsFile;
}(_generators.GeneratorFileContext);

exports.IdolJsFile = IdolJsFile;

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
  var idolJs = new IdolJs(config);
  var moveTo = (0, _generators.build)(config, idolJs.render());
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}