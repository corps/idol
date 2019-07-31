"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exportedConst = exportedConst;
exports.exportedClass = exportedClass;
exports.invocation = invocation;
exports.newInvocation = newInvocation;
exports.methodDeclaration = methodDeclaration;
exports.propLiteralAccess = propLiteralAccess;
exports.propExprAccess = propExprAccess;
exports.propAccess = propAccess;
exports.literal = literal;
exports.objLiteral = objLiteral;
exports.propDec = propDec;
exports.methodDec = methodDec;
exports.staticMethodDec = staticMethodDec;
exports.getProp = getProp;
exports.setProp = setProp;
exports.assignment = assignment;
exports.ret = ret;
exports.comment = comment;
exports.arrayLiteral = arrayLiteral;
exports.exportImportDecon = exportImportDecon;
exports.ArrayLiteral = exports.ExportImportDeconstructor = exports.ImportDeconstructor = exports.Literal = exports.CallbableDeclaration = exports.FunctionDeclaration = exports.MethodDeclaration = exports.Invocation = exports.ArgsList = exports.NamedClassDec = exports.DeclarationBlock = exports.ObjectLiteral = exports.PropertyExpressionDeclaration = exports.PropertyDeclaration = exports.Assignment = exports.Comment = exports.CodeFile = exports.StatementBlock = exports.New = exports.PropertyExpressionAccess = exports.PropertyAccess = exports.Return = exports.Set = exports.Get = exports.Static = exports.Const = exports.Export = exports.ExpressionStatement = exports.CodeNode = void 0;

var _prettier = _interopRequireDefault(require("prettier"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function isExpression(a) {
  if (a instanceof CodeNode) {
    return a.isExpression;
  }

  return false;
}

var CodeNode =
/*#__PURE__*/
function () {
  function CodeNode() {
    _classCallCheck(this, CodeNode);

    this.cached = null;
    this.parent = null;
    this.isExpression = true;
  }

  _createClass(CodeNode, [{
    key: "toString",
    value: function toString() {
      if (this.cached == null) {
        this.cached = this.render();
      }

      return this.cached || "";
    }
  }, {
    key: "clearCache",
    value: function clearCache() {
      // No need to cascade up parents if this was never cached anywho.
      if (this.cached == null) return;
      this.cached = null;

      if (this.parent) {
        this.parent.clearCache();
      }
    }
  }, {
    key: "render",
    value: function render() {
      return "";
    }
  }]);

  return CodeNode;
}();

exports.CodeNode = CodeNode;

var Block =
/*#__PURE__*/
function (_CodeNode) {
  _inherits(Block, _CodeNode);

  function Block() {
    var _this;

    var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, Block);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Block).call(this));
    _this.body = [];
    children.forEach(function (i) {
      return _this.add(i);
    });
    return _this;
  }

  _createClass(Block, [{
    key: "add",
    value: function add(child) {
      this.body.push(child);
    }
  }, {
    key: "render",
    value: function render() {
      return this.body.map(function (v) {
        return v.toString();
      }).join(" ");
    }
  }]);

  return Block;
}(CodeNode);

var ExpressionStatement =
/*#__PURE__*/
function (_CodeNode2) {
  _inherits(ExpressionStatement, _CodeNode2);

  function ExpressionStatement(expression) {
    var _this2;

    _classCallCheck(this, ExpressionStatement);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(ExpressionStatement).call(this));
    _this2.expression = expression;
    _this2.isExpression = false;
    return _this2;
  }

  _createClass(ExpressionStatement, [{
    key: "render",
    value: function render() {
      return this.expression.toString() + ";";
    }
  }]);

  return ExpressionStatement;
}(CodeNode);

exports.ExpressionStatement = ExpressionStatement;

var Export =
/*#__PURE__*/
function (_CodeNode3) {
  _inherits(Export, _CodeNode3);

  function Export(exported) {
    var _this3;

    _classCallCheck(this, Export);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(Export).call(this));

    if (isExpression(exported)) {
      _this3.exported = new ExpressionStatement(exported);
    } else {
      _this3.exported = exported;
    }

    return _this3;
  }

  _createClass(Export, [{
    key: "render",
    value: function render() {
      return "export ".concat(this.exported.toString());
    }
  }]);

  return Export;
}(CodeNode);

exports.Export = Export;

var Const =
/*#__PURE__*/
function (_CodeNode4) {
  _inherits(Const, _CodeNode4);

  function Const(expr) {
    var _this4;

    _classCallCheck(this, Const);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(Const).call(this));
    _this4.expr = expr;
    return _this4;
  }

  _createClass(Const, [{
    key: "render",
    value: function render() {
      return "const ".concat(this.expr.toString());
    }
  }]);

  return Const;
}(CodeNode);

exports.Const = Const;

var Static =
/*#__PURE__*/
function (_CodeNode5) {
  _inherits(Static, _CodeNode5);

  function Static(expr) {
    var _this5;

    _classCallCheck(this, Static);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(Static).call(this));
    _this5.expr = expr;
    return _this5;
  }

  _createClass(Static, [{
    key: "render",
    value: function render() {
      return "static ".concat(this.expr.toString());
    }
  }]);

  return Static;
}(CodeNode);

exports.Static = Static;

var Get =
/*#__PURE__*/
function (_CodeNode6) {
  _inherits(Get, _CodeNode6);

  function Get(expr) {
    var _this6;

    _classCallCheck(this, Get);

    _this6 = _possibleConstructorReturn(this, _getPrototypeOf(Get).call(this));
    _this6.expr = expr;
    return _this6;
  }

  _createClass(Get, [{
    key: "render",
    value: function render() {
      return "get ".concat(this.expr.toString());
    }
  }]);

  return Get;
}(CodeNode);

exports.Get = Get;

var Set =
/*#__PURE__*/
function (_CodeNode7) {
  _inherits(Set, _CodeNode7);

  function Set(expr) {
    var _this7;

    _classCallCheck(this, Set);

    _this7 = _possibleConstructorReturn(this, _getPrototypeOf(Set).call(this));
    _this7.expr = expr;
    return _this7;
  }

  _createClass(Set, [{
    key: "render",
    value: function render() {
      return "set ".concat(this.expr.toString());
    }
  }]);

  return Set;
}(CodeNode);

exports.Set = Set;

var Return =
/*#__PURE__*/
function (_CodeNode8) {
  _inherits(Return, _CodeNode8);

  function Return(expr) {
    var _this8;

    _classCallCheck(this, Return);

    _this8 = _possibleConstructorReturn(this, _getPrototypeOf(Return).call(this));
    _this8.expr = expr;
    return _this8;
  }

  _createClass(Return, [{
    key: "render",
    value: function render() {
      return "return ".concat(this.expr.toString());
    }
  }]);

  return Return;
}(CodeNode);

exports.Return = Return;

var PropertyAccess =
/*#__PURE__*/
function (_CodeNode9) {
  _inherits(PropertyAccess, _CodeNode9);

  function PropertyAccess(expr) {
    var _this9;

    _classCallCheck(this, PropertyAccess);

    _this9 = _possibleConstructorReturn(this, _getPrototypeOf(PropertyAccess).call(this));
    _this9.expr = expr;

    for (var _len = arguments.length, properties = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      properties[_key - 1] = arguments[_key];
    }

    _this9.properties = properties;
    return _this9;
  }

  _createClass(PropertyAccess, [{
    key: "render",
    value: function render() {
      return [this.expr].concat(_toConsumableArray(this.properties)).join('.');
    }
  }]);

  return PropertyAccess;
}(CodeNode);

exports.PropertyAccess = PropertyAccess;

var PropertyExpressionAccess =
/*#__PURE__*/
function (_CodeNode10) {
  _inherits(PropertyExpressionAccess, _CodeNode10);

  function PropertyExpressionAccess(ident, expr) {
    var _this10;

    _classCallCheck(this, PropertyExpressionAccess);

    _this10 = _possibleConstructorReturn(this, _getPrototypeOf(PropertyExpressionAccess).call(this));
    _this10.ident = ident;
    _this10.expr = expr;
    return _this10;
  }

  _createClass(PropertyExpressionAccess, [{
    key: "render",
    value: function render() {
      return "".concat(this.ident.toString(), "[").concat(this.expr.toString(), "]");
    }
  }]);

  return PropertyExpressionAccess;
}(CodeNode);

exports.PropertyExpressionAccess = PropertyExpressionAccess;

var New =
/*#__PURE__*/
function (_CodeNode11) {
  _inherits(New, _CodeNode11);

  function New(expr) {
    var _this11;

    _classCallCheck(this, New);

    _this11 = _possibleConstructorReturn(this, _getPrototypeOf(New).call(this));
    _this11.expr = expr;
    return _this11;
  }

  _createClass(New, [{
    key: "render",
    value: function render() {
      return "new ".concat(this.expr.toString());
    }
  }]);

  return New;
}(CodeNode);

exports.New = New;

var StatementBlock =
/*#__PURE__*/
function (_Block) {
  _inherits(StatementBlock, _Block);

  function StatementBlock() {
    var _this12;

    var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, StatementBlock);

    _this12 = _possibleConstructorReturn(this, _getPrototypeOf(StatementBlock).call(this, children));
    _this12.isExpression = false;
    return _this12;
  }

  _createClass(StatementBlock, [{
    key: "add",
    value: function add(child) {
      if (isExpression(child)) {
        _get(_getPrototypeOf(StatementBlock.prototype), "add", this).call(this, new ExpressionStatement(child));
      } else {
        _get(_getPrototypeOf(StatementBlock.prototype), "add", this).call(this, child);
      }
    }
  }, {
    key: "concat",
    value: function concat(other) {
      return new this.constructor(this.body.concat(other.body));
    }
  }]);

  return StatementBlock;
}(Block);

exports.StatementBlock = StatementBlock;

var CodeFile =
/*#__PURE__*/
function (_StatementBlock) {
  _inherits(CodeFile, _StatementBlock);

  function CodeFile() {
    var _this13;

    var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var prettierOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      parser: "babel-flow"
    };

    _classCallCheck(this, CodeFile);

    _this13 = _possibleConstructorReturn(this, _getPrototypeOf(CodeFile).call(this, children));
    _this13.prettierOptions = prettierOptions;
    _this13.isExpression = false;
    return _this13;
  }

  _createClass(CodeFile, [{
    key: "render",
    value: function render() {
      return _prettier["default"].format(_get(_getPrototypeOf(CodeFile.prototype), "render", this).call(this), this.prettierOptions);
    }
  }]);

  return CodeFile;
}(StatementBlock);

exports.CodeFile = CodeFile;

var Comment =
/*#__PURE__*/
function (_CodeNode12) {
  _inherits(Comment, _CodeNode12);

  function Comment(comment) {
    var _this14;

    _classCallCheck(this, Comment);

    _this14 = _possibleConstructorReturn(this, _getPrototypeOf(Comment).call(this));
    _this14.comment = comment;
    _this14.isExpression = false;
    return _this14;
  }

  _createClass(Comment, [{
    key: "render",
    value: function render() {
      return "/* ".concat(this.comment.replace(/\//g, "\\/"), " */\n");
    }
  }]);

  return Comment;
}(CodeNode);

exports.Comment = Comment;

var Assignment =
/*#__PURE__*/
function (_CodeNode13) {
  _inherits(Assignment, _CodeNode13);

  function Assignment(identifier, expression) {
    var _this15;

    _classCallCheck(this, Assignment);

    _this15 = _possibleConstructorReturn(this, _getPrototypeOf(Assignment).call(this));
    _this15.identifier = identifier;
    _this15.expression = expression;
    return _this15;
  }

  _createClass(Assignment, [{
    key: "render",
    value: function render() {
      return "".concat(this.identifier.toString(), " = ").concat(this.expression.toString());
    }
  }]);

  return Assignment;
}(CodeNode);

exports.Assignment = Assignment;

var PropertyDeclaration =
/*#__PURE__*/
function (_CodeNode14) {
  _inherits(PropertyDeclaration, _CodeNode14);

  function PropertyDeclaration(property, expression) {
    var _this16;

    _classCallCheck(this, PropertyDeclaration);

    _this16 = _possibleConstructorReturn(this, _getPrototypeOf(PropertyDeclaration).call(this));
    _this16.property = property;
    _this16.expression = expression;
    _this16.isExpression = false;
    return _this16;
  }

  _createClass(PropertyDeclaration, [{
    key: "render",
    value: function render() {
      return "".concat(this.property.toString(), ": ").concat(this.expression.toString());
    }
  }]);

  return PropertyDeclaration;
}(CodeNode);

exports.PropertyDeclaration = PropertyDeclaration;

var PropertyExpressionDeclaration =
/*#__PURE__*/
function (_CodeNode15) {
  _inherits(PropertyExpressionDeclaration, _CodeNode15);

  function PropertyExpressionDeclaration(propertyExpression, expression) {
    var _this17;

    _classCallCheck(this, PropertyExpressionDeclaration);

    _this17 = _possibleConstructorReturn(this, _getPrototypeOf(PropertyExpressionDeclaration).call(this));
    _this17.propertyExpression = propertyExpression;
    _this17.expression = expression;
    _this17.isExpression = false;
    return _this17;
  }

  _createClass(PropertyExpressionDeclaration, [{
    key: "render",
    value: function render() {
      return "[".concat(this.propertyExpression.toString(), "]: ").concat(this.expression.toString());
    }
  }]);

  return PropertyExpressionDeclaration;
}(CodeNode);

exports.PropertyExpressionDeclaration = PropertyExpressionDeclaration;

var ObjectLiteral =
/*#__PURE__*/
function (_Block2) {
  _inherits(ObjectLiteral, _Block2);

  function ObjectLiteral() {
    _classCallCheck(this, ObjectLiteral);

    return _possibleConstructorReturn(this, _getPrototypeOf(ObjectLiteral).apply(this, arguments));
  }

  _createClass(ObjectLiteral, [{
    key: "render",
    value: function render() {
      return "{".concat(this.body.map(function (v) {
        return v.toString() + (v.toString().trim() ? "," : "");
      }).join(""), "}");
    }
  }]);

  return ObjectLiteral;
}(Block);

exports.ObjectLiteral = ObjectLiteral;

var DeclarationBlock =
/*#__PURE__*/
function (_Block3) {
  _inherits(DeclarationBlock, _Block3);

  function DeclarationBlock() {
    _classCallCheck(this, DeclarationBlock);

    return _possibleConstructorReturn(this, _getPrototypeOf(DeclarationBlock).apply(this, arguments));
  }

  _createClass(DeclarationBlock, [{
    key: "render",
    value: function render() {
      return "{".concat(this.body.map(function (v) {
        return v.toString();
      }).join(""), "}");
    }
  }]);

  return DeclarationBlock;
}(Block);

exports.DeclarationBlock = DeclarationBlock;

var NamedClassDec =
/*#__PURE__*/
function (_CodeNode16) {
  _inherits(NamedClassDec, _CodeNode16);

  function NamedClassDec(ident, extendsExpr) {
    var _this18;

    var body = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new DeclarationBlock();

    _classCallCheck(this, NamedClassDec);

    _this18 = _possibleConstructorReturn(this, _getPrototypeOf(NamedClassDec).call(this));
    _this18.ident = ident;
    _this18.extendsExpr = extendsExpr;
    _this18.body = body;
    return _this18;
  }

  _createClass(NamedClassDec, [{
    key: "render",
    value: function render() {
      var extendsExpr = this.extendsExpr;
      var extendsStr = "";

      if (extendsExpr != null) {
        extendsStr = "extends ".concat(extendsExpr.toString());
      }

      return "class ".concat(this.ident.toString(), " ").concat(extendsStr, " ").concat(this.body.toString(), "\n\n");
    }
  }]);

  return NamedClassDec;
}(CodeNode);

exports.NamedClassDec = NamedClassDec;

var ArgsList =
/*#__PURE__*/
function (_CodeNode17) {
  _inherits(ArgsList, _CodeNode17);

  function ArgsList() {
    var _this19;

    _classCallCheck(this, ArgsList);

    _this19 = _possibleConstructorReturn(this, _getPrototypeOf(ArgsList).call(this));

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this19.args = args;
    return _this19;
  }

  _createClass(ArgsList, [{
    key: "render",
    value: function render() {
      return "(".concat(this.args.map(function (v) {
        return v.toString();
      }).join(", "), ")");
    }
  }]);

  return ArgsList;
}(CodeNode);

exports.ArgsList = ArgsList;

var Invocation =
/*#__PURE__*/
function (_CodeNode18) {
  _inherits(Invocation, _CodeNode18);

  function Invocation(name, args) {
    var _this20;

    _classCallCheck(this, Invocation);

    _this20 = _possibleConstructorReturn(this, _getPrototypeOf(Invocation).call(this));
    _this20.name = name;
    _this20.args = args;
    return _this20;
  }

  _createClass(Invocation, [{
    key: "render",
    value: function render() {
      return "".concat(this.name.toString()).concat(this.args.toString());
    }
  }]);

  return Invocation;
}(CodeNode);

exports.Invocation = Invocation;

var MethodDeclaration =
/*#__PURE__*/
function (_StatementBlock2) {
  _inherits(MethodDeclaration, _StatementBlock2);

  function MethodDeclaration(invocation) {
    var _this21;

    var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, MethodDeclaration);

    _this21 = _possibleConstructorReturn(this, _getPrototypeOf(MethodDeclaration).call(this, body));
    _this21.invocation = invocation;
    return _this21;
  }

  _createClass(MethodDeclaration, [{
    key: "render",
    value: function render() {
      return "".concat(this.invocation.toString(), " { ").concat(_get(_getPrototypeOf(MethodDeclaration.prototype), "render", this).call(this), " }\n\n");
    }
  }]);

  return MethodDeclaration;
}(StatementBlock);

exports.MethodDeclaration = MethodDeclaration;

var FunctionDeclaration =
/*#__PURE__*/
function (_MethodDeclaration) {
  _inherits(FunctionDeclaration, _MethodDeclaration);

  function FunctionDeclaration() {
    _classCallCheck(this, FunctionDeclaration);

    return _possibleConstructorReturn(this, _getPrototypeOf(FunctionDeclaration).apply(this, arguments));
  }

  _createClass(FunctionDeclaration, [{
    key: "render",
    value: function render() {
      return "function ".concat(_get(_getPrototypeOf(FunctionDeclaration.prototype), "render", this).call(this));
    }
  }]);

  return FunctionDeclaration;
}(MethodDeclaration);

exports.FunctionDeclaration = FunctionDeclaration;

var CallbableDeclaration =
/*#__PURE__*/
function (_StatementBlock3) {
  _inherits(CallbableDeclaration, _StatementBlock3);

  function CallbableDeclaration() {
    var _this22;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new ArgsList();

    _classCallCheck(this, CallbableDeclaration);

    _this22 = _possibleConstructorReturn(this, _getPrototypeOf(CallbableDeclaration).call(this));
    _this22.args = args;
    return _this22;
  }

  _createClass(CallbableDeclaration, [{
    key: "render",
    value: function render() {
      return "".concat(this.args.toString(), " => { ").concat(_get(_getPrototypeOf(CallbableDeclaration.prototype), "render", this).call(this), " }");
    }
  }]);

  return CallbableDeclaration;
}(StatementBlock);

exports.CallbableDeclaration = CallbableDeclaration;

var Literal =
/*#__PURE__*/
function (_CodeNode19) {
  _inherits(Literal, _CodeNode19);

  function Literal(literal) {
    var _this23;

    _classCallCheck(this, Literal);

    _this23 = _possibleConstructorReturn(this, _getPrototypeOf(Literal).call(this));
    _this23.literal = literal;
    return _this23;
  }

  _createClass(Literal, [{
    key: "render",
    value: function render() {
      return JSON.stringify(this.literal);
    }
  }]);

  return Literal;
}(CodeNode);

exports.Literal = Literal;

var ImportDeconstructor =
/*#__PURE__*/
function (_CodeNode20) {
  _inherits(ImportDeconstructor, _CodeNode20);

  function ImportDeconstructor(from) {
    var _this24;

    _classCallCheck(this, ImportDeconstructor);

    _this24 = _possibleConstructorReturn(this, _getPrototypeOf(ImportDeconstructor).call(this));
    _this24.from = from;

    for (var _len3 = arguments.length, deconstructions = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      deconstructions[_key3 - 1] = arguments[_key3];
    }

    _this24.deconstructions = deconstructions;
    _this24.isExpression = false;
    return _this24;
  }

  _createClass(ImportDeconstructor, [{
    key: "render",
    value: function render() {
      return "import {".concat(this.deconstructions.map(function (v) {
        return v.toString();
      }).join(", "), "} from ").concat(JSON.stringify(this.from.toString()), ";");
    }
  }]);

  return ImportDeconstructor;
}(CodeNode);

exports.ImportDeconstructor = ImportDeconstructor;

var ExportImportDeconstructor =
/*#__PURE__*/
function (_CodeNode21) {
  _inherits(ExportImportDeconstructor, _CodeNode21);

  function ExportImportDeconstructor(from) {
    var _this25;

    _classCallCheck(this, ExportImportDeconstructor);

    _this25 = _possibleConstructorReturn(this, _getPrototypeOf(ExportImportDeconstructor).call(this));
    _this25.from = from;

    for (var _len4 = arguments.length, deconstructions = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      deconstructions[_key4 - 1] = arguments[_key4];
    }

    _this25.deconstructions = deconstructions;
    _this25.isExpression = false;
    return _this25;
  }

  _createClass(ExportImportDeconstructor, [{
    key: "render",
    value: function render() {
      return "export {".concat(this.deconstructions.map(function (v) {
        return v.toString();
      }).join(", "), "} from ").concat(JSON.stringify(this.from.toString()), ";");
    }
  }]);

  return ExportImportDeconstructor;
}(CodeNode);

exports.ExportImportDeconstructor = ExportImportDeconstructor;

var ArrayLiteral =
/*#__PURE__*/
function (_CodeNode22) {
  _inherits(ArrayLiteral, _CodeNode22);

  function ArrayLiteral() {
    var _this26;

    _classCallCheck(this, ArrayLiteral);

    _this26 = _possibleConstructorReturn(this, _getPrototypeOf(ArrayLiteral).call(this));

    for (var _len5 = arguments.length, elements = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      elements[_key5] = arguments[_key5];
    }

    _this26.elements = elements;
    return _this26;
  }

  _createClass(ArrayLiteral, [{
    key: "render",
    value: function render() {
      return "[".concat(this.elements.map(function (v) {
        return v.toString();
      }).join(", "), "]");
    }
  }]);

  return ArrayLiteral;
}(CodeNode);

exports.ArrayLiteral = ArrayLiteral;

function exportedConst(ident, expr) {
  return new Export(new Const(new Assignment(ident, expr)));
}

function exportedClass(ident, extendsExpr, body) {
  return new Export(new NamedClassDec(ident, extendsExpr, new DeclarationBlock(body)));
}

function invocation(expr) {
  for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
    args[_key6 - 1] = arguments[_key6];
  }

  return new Invocation(expr, _construct(ArgsList, args));
}

function newInvocation(expr) {
  for (var _len7 = arguments.length, args = new Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
    args[_key7 - 1] = arguments[_key7];
  }

  return new New(new Invocation(expr, _construct(ArgsList, args)));
}

function methodDeclaration(name) {
  for (var _len8 = arguments.length, params = new Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
    params[_key8 - 1] = arguments[_key8];
  }

  return new MethodDeclaration(new Invocation(name, _construct(ArgsList, params)));
}

function propLiteralAccess(ident, val) {
  return new PropertyExpressionAccess(ident, new Literal(val));
}

function propExprAccess(ident, expr) {
  return new PropertyExpressionAccess(ident, expr);
}

function propAccess(ident) {
  for (var _len9 = arguments.length, access = new Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
    access[_key9 - 1] = arguments[_key9];
  }

  return _construct(PropertyAccess, [ident].concat(access));
}

function literal(val) {
  return new Literal(val);
}

function objLiteral() {
  for (var _len10 = arguments.length, props = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
    props[_key10] = arguments[_key10];
  }

  return new ObjectLiteral(props);
}

function propDec(prop, expression) {
  return new PropertyDeclaration(prop, expression);
}

function methodDec(name, args, body) {
  return new MethodDeclaration(new Invocation(name, _construct(ArgsList, _toConsumableArray(args))), body);
}

function staticMethodDec(name, args, body) {
  return new Static(new MethodDeclaration(new Invocation(name, _construct(ArgsList, _toConsumableArray(args))), body));
}

function getProp(name, args, body) {
  return new Get(methodDec(name, args, body));
}

function setProp(name, args, body) {
  return new Set(methodDec(name, args, body));
}

function assignment(name, val) {
  return new Assignment(name, val);
}

function ret(val) {
  return new Return(val);
}

function comment(str) {
  return new Comment(str);
}

function arrayLiteral() {
  for (var _len11 = arguments.length, items = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
    items[_key11] = arguments[_key11];
  }

  return _construct(ArrayLiteral, items);
}

function exportImportDecon(from) {
  for (var _len12 = arguments.length, deconstructions = new Array(_len12 > 1 ? _len12 - 1 : 0), _key12 = 1; _key12 < _len12; _key12++) {
    deconstructions[_key12 - 1] = arguments[_key12];
  }

  return _construct(ExportImportDeconstructor, [from].concat(deconstructions));
}