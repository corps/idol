"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = render;
exports.variable = variable;
exports.commented = commented;
exports.getProp = getProp;
exports.setProp = setProp;
exports.spread = spread;
exports.ret = ret;
exports.propAccess = propAccess;
exports.propExpr = propExpr;
exports.comment = comment;
exports.typeSum = typeSum;
exports.iface = iface;
exports.propDec = propDec;
exports.propExprDec = propExprDec;
exports.objLiteral = objLiteral;
exports.assignment = assignment;
exports.classDec = classDec;
exports.invocation = invocation;
exports.methodDec = methodDec;
exports.arrowFunc = arrowFunc;
exports.functionDec = functionDec;
exports.literal = literal;
exports.flowAs = flowAs;
exports.arrayLiteral = arrayLiteral;
exports.importDeconWithDefault = importDeconWithDefault;
exports.importDecon = importDecon;
exports.typeImportDecon = typeImportDecon;
exports.exportImportDecon = exportImportDecon;
exports.newMod = void 0;

var _prettier = _interopRequireDefault(require("prettier"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function render(lines) {
  var prettierOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    parser: "babel-flow"
  };
  var content = lines.map(function (v) {
    return v + "";
  }).join(";\n");
  return _prettier["default"].format(content, prettierOptions);
}

function variable(expr) {
  var kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "const";
  var exported = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var typing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  return function (ident) {
    typing = typing != null ? ": ".concat(typing) : "";
    var result = "".concat(kind, " ").concat(ident).concat(typing, " = ").concat(expr);
    if (exported) result = "export ".concat(result);
    return result;
  };
}

function commented(c, scriptable) {
  return function (ident) {
    return "".concat(comment(c), "\n").concat(scriptable(ident));
  };
}

function getProp(ident, body) {
  var bodyRendered = body.join(";\n");
  return "get ".concat(ident, "() { ").concat(bodyRendered, " }");
}

function setProp(ident, arg, body) {
  var bodyRendered = body.join(";\n");
  return "set ".concat(ident, "(").concat(arg, ") { ").concat(bodyRendered, " }");
}

function spread(expr) {
  return "...".concat(expr);
}

function ret(expr) {
  return "return ".concat(expr);
}

function propAccess(obj) {
  for (var _len = arguments.length, props = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    props[_key - 1] = arguments[_key];
  }

  return [obj].concat(props).join(".");
}

function propExpr(obj) {
  for (var _len2 = arguments.length, exprs = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    exprs[_key2 - 1] = arguments[_key2];
  }

  return exprs.reduce(function (last, next) {
    return "".concat(last, "[").concat(next, "]");
  }, obj);
}

function comment(comment) {
  if (!comment) return comment;
  comment = comment.replace(/\//g, "\\/");
  return comment.split("\n").map(function (l) {
    return "// ".concat(l);
  }).join("\n");
}

function typeSum() {
  for (var _len3 = arguments.length, options = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    options[_key3] = arguments[_key3];
  }

  return options.join(" | ");
}

function iface() {
  var exported = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var extds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  for (var _len4 = arguments.length, lines = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
    lines[_key4 - 2] = arguments[_key4];
  }

  return function (ident) {
    var exportPart = exported ? "export " : "";
    var extendPart = extds ? " extends ".concat(extds, " ") : "";
    return "".concat(exportPart, "interface ").concat(ident).concat(extendPart, " {").concat(lines.join(";\n"), "}");
  };
}

function propDec(prop, expr) {
  return "".concat(prop, ": ").concat(expr);
}

function propExprDec(prop, expr) {
  return "[".concat(prop, "]: ").concat(expr);
}

function objLiteral() {
  for (var _len5 = arguments.length, parts = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    parts[_key5] = arguments[_key5];
  }

  return "{".concat(parts.map(function (p) {
    return p.trim() ? p + "," : p;
  }).join("\n"), "}");
}

function assignment(ident, expr) {
  return "".concat(ident, " = ").concat(expr);
}

function classDec(body, extendsExpr) {
  var exported = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  return function (ident) {
    var result = "class ".concat(ident);

    if (extendsExpr) {
      result = "".concat(result, " extends ").concat(extendsExpr);
    }

    result = "".concat(result, " {").concat(body.join("\n"), "}");
    if (exported) result = "export ".concat(result);
    return result;
  };
}

var newMod = "new ";
exports.newMod = newMod;

function invocation(ident) {
  for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
    args[_key6 - 1] = arguments[_key6];
  }

  return "".concat(ident, "(").concat(args.join(","), ")");
}

function methodDec(ident, args, body) {
  var staticDec = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var dec = "".concat(ident, "(").concat(args.join(","), ") {").concat(body.join("\n"), "}");
  return staticDec ? "static ".concat(dec) : dec;
}

function arrowFunc(args, expr) {
  return "((".concat(args.join(","), ") => (").concat(expr, "))");
}

function functionDec(ident, args, body) {
  var exported = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  var result = "function ".concat(methodDec(ident, args, body));
  if (exported) result = "export ".concat(result);
  return result;
}

function literal(val) {
  return JSON.stringify(val);
}

function flowAs(expr, type) {
  return "(".concat(expr, ": ").concat(type, ")");
}

function arrayLiteral() {
  for (var _len7 = arguments.length, vals = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    vals[_key7] = arguments[_key7];
  }

  return "[".concat(vals.join(","), "]");
}

function importDeconWithDefault(from, defaultDecon) {
  for (var _len8 = arguments.length, deconstructors = new Array(_len8 > 2 ? _len8 - 2 : 0), _key8 = 2; _key8 < _len8; _key8++) {
    deconstructors[_key8 - 2] = arguments[_key8];
  }

  var decons = deconstructors.length ? ", {".concat(deconstructors.join(", "), "}") : "";
  return "import ".concat(defaultDecon).concat(decons, " from ").concat(JSON.stringify(from));
}

function importDecon(from) {
  for (var _len9 = arguments.length, deconstructors = new Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
    deconstructors[_key9 - 1] = arguments[_key9];
  }

  return "import {".concat(deconstructors.join(", "), "} from ").concat(JSON.stringify(from));
}

function typeImportDecon(from) {
  for (var _len10 = arguments.length, deconstructors = new Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
    deconstructors[_key10 - 1] = arguments[_key10];
  }

  return "import type {".concat(deconstructors.join(", "), "} from ").concat(JSON.stringify(from));
}

function exportImportDecon(from, deconstructors) {
  return "export {".concat(deconstructors.join(", "), "} from ").concat(JSON.stringify(from));
}