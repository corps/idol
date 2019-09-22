"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "start", {
  enumerable: true,
  get: function get() {
    return _cli.start;
  }
});
Object.defineProperty(exports, "Reference", {
  enumerable: true,
  get: function get() {
    return _Reference.Reference;
  }
});
Object.defineProperty(exports, "Type", {
  enumerable: true,
  get: function get() {
    return _Type.Type;
  }
});
Object.defineProperty(exports, "build", {
  enumerable: true,
  get: function get() {
    return _generators.build;
  }
});
Object.defineProperty(exports, "camelify", {
  enumerable: true,
  get: function get() {
    return _generators.camelify;
  }
});
Object.defineProperty(exports, "GeneratorAcc", {
  enumerable: true,
  get: function get() {
    return _generators.GeneratorAcc;
  }
});
Object.defineProperty(exports, "GeneratorConfig", {
  enumerable: true,
  get: function get() {
    return _generators.GeneratorConfig;
  }
});
Object.defineProperty(exports, "GeneratorFileContext", {
  enumerable: true,
  get: function get() {
    return _generators.GeneratorFileContext;
  }
});
Object.defineProperty(exports, "importExpr", {
  enumerable: true,
  get: function get() {
    return _generators.importExpr;
  }
});
Object.defineProperty(exports, "Path", {
  enumerable: true,
  get: function get() {
    return _generators.Path;
  }
});
Object.defineProperty(exports, "ScalarDeconstructor", {
  enumerable: true,
  get: function get() {
    return _generators.ScalarDeconstructor;
  }
});
Object.defineProperty(exports, "TypeDeconstructor", {
  enumerable: true,
  get: function get() {
    return _generators.TypeDeconstructor;
  }
});
Object.defineProperty(exports, "TypeStructDeconstructor", {
  enumerable: true,
  get: function get() {
    return _generators.TypeStructDeconstructor;
  }
});
Object.defineProperty(exports, "Alt", {
  enumerable: true,
  get: function get() {
    return _functional.Alt;
  }
});
Object.defineProperty(exports, "cachedProperty", {
  enumerable: true,
  get: function get() {
    return _functional.cachedProperty;
  }
});
Object.defineProperty(exports, "OrderedObj", {
  enumerable: true,
  get: function get() {
    return _functional.OrderedObj;
  }
});
exports.scripter = void 0;

var _scripter = _interopRequireWildcard(require("./scripter"));

exports.scripter = _scripter;

var _cli = require("./cli");

var _Reference = require("./js/schema/Reference");

var _Type = require("./js/schema/Type");

var _generators = require("./generators");

var _functional = require("./functional");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }