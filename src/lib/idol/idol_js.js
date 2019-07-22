#! /usr/bin/env node
"use strict";

var _process = _interopRequireDefault(require("process"));

var _fs = _interopRequireDefault(require("fs"));

var _idol__ = require("./__idol__");

var _schema = require("./schema");

var _os = _interopRequireDefault(require("os"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var BuildEnv =
/*#__PURE__*/
function () {
  function BuildEnv() {
    _classCallCheck(this, BuildEnv);

    this.buildDir = _fs["default"].mkdtempSync('idol_js.js');
  }

  _createClass(BuildEnv, [{
    key: "buildModule",
    value: function buildModule(module) {
      return new ModuleBuildEnv(this, module.moduleName).writeModule(module);
    }
  }, {
    key: "finalize",
    value: function finalize(outputDir) {
      this.finalizeIdolFile(outputDir);
      recursiveCopy(this.buildDir, outputDir);
    }
  }, {
    key: "finalizeIdolFile",
    value: function finalizeIdolFile(outputDir) {
      _fs["default"].mkdirSync(outputDir, {
        recursive: true
      });

      var content = _fs["default"].readFileSync(_path["default"].join(__dirname, '__idol__.js'));

      _fs["default"].writeFileSync(_path["default"].join(outputDir, '__idol__.js'), content);
    }
  }]);

  return BuildEnv;
}();

var ModuleBuildEnv =
/*#__PURE__*/
function () {
  function ModuleBuildEnv(buildEnv, moduleName) {
    _classCallCheck(this, ModuleBuildEnv);

    this.buildEnv = buildEnv;
    this.moduleName = moduleName;
    this.moduleNameParts = moduleName.split(".");
    this.indentionLevel = 0;
  }

  _createClass(ModuleBuildEnv, [{
    key: "writeModule",
    value: function writeModule(module) {
      var moduleFilePath = _os["default"].path.join(this.buildEnv.buildDir, ModuleBuildEnv.modulePathOf(module));

      _fs["default"].mkdirSync(_path["default"].dirname(moduleFilePath), {
        recursive: true
      });

      var lines = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.genModule(module)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var line = _step.value;
          lines.push(ModuleBuildEnv.INDENTIONS[this.indentionLevel] + line);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      _fs["default"].writeFileSync(moduleFilePath, lines.join("\n"));
    }
  }, {
    key: "genModule",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function genModule(module) {
      var _this = this;

      var self, seenModules, i, type_name, type;
      return regeneratorRuntime.wrap(function genModule$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              self = this;
              _context2.next = 3;
              return "import {";

            case 3:
              return _context2.delegateYield(this.withIndention(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        return _context.delegateYield(['Enum', 'Struct', 'List', 'Map', 'Literal', 'Primitive'].map(function (s) {
                          return "".concat(s, " as ").concat(s, "_");
                        }), "t0", 1);

                      case 1:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              })), "t0", 4);

            case 4:
              _context2.next = 6;
              return "} from ".concat(this.importPathOf("__idol__"));

            case 6:
              seenModules = {};
              return _context2.delegateYield(module.dependencies.filter(function (dep) {
                if (seenModules[dep.to.module_name]) return false;
                seenModules[dep.to.module_name] = true;
                return true;
              }).map(function (dep) {
                return "import * as ".concat(_this.importedModuleNameOf(dep.to.module_name), " from ").concat(_this.importPathOf(dep.to.module_name));
              }), "t1", 8);

            case 8:
              _context2.next = 10;
              return "# DO NOT EDIT THIS FILE";

            case 10:
              _context2.next = 12;
              return "# This file is generated via idol_js.js.  You can either subclass these types";

            case 12:
              _context2.next = 14;
              return "# in your own module file or update the relevant model.toml file and regenerate.";

            case 14:
              i = 0;

            case 15:
              if (!(i < module.typesDependencyOrdering.length)) {
                _context2.next = 44;
                break;
              }

              _context2.next = 18;
              return "";

            case 18:
              type_name = module.typesDependencyOrdering[i];
              type = module.typesByName[type_name];

              if (!type.isA) {
                _context2.next = 36;
                break;
              }

              _context2.t2 = type.isA.structKind;
              _context2.next = _context2.t2 === _schema.StructKind.SCALAR ? 24 : _context2.t2 === _schema.StructKind.REPEATED ? 30 : _context2.t2 === _schema.StructKind.MAP ? 32 : 34;
              break;

            case 24:
              if (!type.isA.literal) {
                _context2.next = 28;
                break;
              }

              return _context2.delegateYield(this.genLiteral(module, type), "t3", 26);

            case 26:
              _context2.next = 29;
              break;

            case 28:
              return _context2.delegateYield(this.genPrimitive(module, type), "t4", 29);

            case 29:
              return _context2.abrupt("break", 34);

            case 30:
              return _context2.delegateYield(this.genRepeated(module, type), "t5", 31);

            case 31:
              return _context2.abrupt("break", 34);

            case 32:
              return _context2.delegateYield(this.genMapped(module, type), "t6", 33);

            case 33:
              return _context2.abrupt("break", 34);

            case 34:
              _context2.next = 41;
              break;

            case 36:
              if (!(type.options.length > 0)) {
                _context2.next = 40;
                break;
              }

              return _context2.delegateYield(this.genEnum(module, type), "t7", 38);

            case 38:
              _context2.next = 41;
              break;

            case 40:
              return _context2.delegateYield(this.genStruct(module, type), "t8", 41);

            case 41:
              ++i;
              _context2.next = 15;
              break;

            case 44:
              _context2.next = 46;
              return "";

            case 46:
            case "end":
              return _context2.stop();
          }
        }
      }, genModule, this);
    })
  }, {
    key: "genLiteral",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function genLiteral(module, type) {
      return regeneratorRuntime.wrap(function genLiteral$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return "export function ".concat(type.named.typeName, "(val) {");

            case 2:
              return _context4.delegateYield(this.withIndention(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return "".concat(type.named.typeName, ".literal");

                      case 2:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee2);
              })), "t0", 3);

            case 3:
              _context4.next = 5;
              return "}";

            case 5:
              _context4.next = 7;
              return "";

            case 7:
              _context4.t1 = type.isA.primitiveType;
              _context4.next = _context4.t1 === _schema.PrimitiveType.BOOL ? 10 : _context4.t1 === _schema.PrimitiveType.DOUBLE ? 13 : _context4.t1 === _schema.PrimitiveType.INT53 ? 16 : _context4.t1 === _schema.PrimitiveType.INT64 ? 19 : _context4.t1 === _schema.PrimitiveType.STRING ? 22 : 25;
              break;

            case 10:
              _context4.next = 12;
              return "".concat(type.named.typeName, ".literal = ").concat(JSON.stringify(type.isA.literal.bool), ";");

            case 12:
              return _context4.abrupt("break", 25);

            case 13:
              _context4.next = 15;
              return "".concat(type.named.typeName, ".literal = ").concat(JSON.stringify(type.isA.literal["double"]), ";");

            case 15:
              return _context4.abrupt("break", 25);

            case 16:
              _context4.next = 18;
              return "".concat(type.named.typeName, ".literal = ").concat(JSON.stringify(type.isA.literal.int53), ";");

            case 18:
              return _context4.abrupt("break", 25);

            case 19:
              _context4.next = 21;
              return "".concat(type.named.typeName, ".literal = ").concat(JSON.stringify(type.isA.literal.int64), ";");

            case 21:
              return _context4.abrupt("break", 25);

            case 22:
              _context4.next = 24;
              return "".concat(type.named.typeName, ".literal = ").concat(JSON.stringify(type.isA.literal.string), ";");

            case 24:
              return _context4.abrupt("break", 25);

            case 25:
              _context4.next = 27;
              return "Literal_(".concat(type.named.typeName, ");");

            case 27:
              _context4.next = 29;
              return "".concat(type.named.typeName, ".metadata = ").concat(JSON.stringify(type), ";");

            case 29:
            case "end":
              return _context4.stop();
          }
        }
      }, genLiteral, this);
    })
  }, {
    key: "genPrimitive",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function genPrimitive(module, type) {
      return regeneratorRuntime.wrap(function genPrimitive$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return "export function ".concat(type.named.typeName, "(val) {");

            case 2:
              return _context6.delegateYield(this.withIndention(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        _context5.next = 2;
                        return "return val;";

                      case 2:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee3);
              })), "t0", 3);

            case 3:
              _context6.next = 5;
              return "}";

            case 5:
              _context6.t1 = type.isA.primitiveType;
              _context6.next = _context6.t1 === _schema.PrimitiveType.BOOL ? 8 : _context6.t1 === _schema.PrimitiveType.DOUBLE ? 11 : _context6.t1 === _schema.PrimitiveType.INT53 ? 14 : _context6.t1 === _schema.PrimitiveType.INT64 ? 17 : _context6.t1 === _schema.PrimitiveType.STRING ? 20 : 23;
              break;

            case 8:
              _context6.next = 10;
              return "".concat(type.named.typeName, ".default = false;");

            case 10:
              return _context6.abrupt("break", 23);

            case 11:
              _context6.next = 13;
              return "".concat(type.named.typeName, ".default = 0.0;");

            case 13:
              return _context6.abrupt("break", 23);

            case 14:
              _context6.next = 16;
              return "".concat(type.named.typeName, ".default = 0;");

            case 16:
              return _context6.abrupt("break", 23);

            case 17:
              _context6.next = 19;
              return "".concat(type.named.typeName, ".default = 0;");

            case 19:
              return _context6.abrupt("break", 23);

            case 20:
              _context6.next = 22;
              return "".concat(type.named.typeName, ".default = \"\";");

            case 22:
              return _context6.abrupt("break", 23);

            case 23:
              _context6.next = 25;
              return "Primitive_(".concat(type.named.typeName, ");");

            case 25:
              _context6.next = 27;
              return "".concat(type.named.typeName, ".metadata = ").concat(JSON.stringify(type), ";");

            case 27:
            case "end":
              return _context6.stop();
          }
        }
      }, genPrimitive, this);
    })
  }, {
    key: "genRepeated",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function genRepeated(module, type) {
      return regeneratorRuntime.wrap(function genRepeated$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return "export function ".concat(type.named.typeName, "(val) {");

            case 2:
              return _context8.delegateYield(this.withIndention(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee4() {
                return regeneratorRuntime.wrap(function _callee4$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        _context7.next = 2;
                        return "return ".concat(type.named.typeName, ".wrap.apply(this, arguments);");

                      case 2:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee4);
              })), "t0", 3);

            case 3:
              _context8.next = 5;
              return "}";

            case 5:
              _context8.next = 7;
              return "";

            case 7:
              _context8.next = 9;
              return "List_(".concat(type.named.typeName, ", ").concat(this.typeStructScalarFunc(type.isA), ");");

            case 9:
              _context8.next = 11;
              return "".concat(type.named.typeName, ".metadata = ").concat(JSON.stringify(type), ";");

            case 11:
            case "end":
              return _context8.stop();
          }
        }
      }, genRepeated, this);
    })
  }, {
    key: "genMapped",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function genMapped(module, type) {
      return regeneratorRuntime.wrap(function genMapped$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return "export function ".concat(type.named.typeName, "(val) {");

            case 2:
              return _context10.delegateYield(this.withIndention(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee5() {
                return regeneratorRuntime.wrap(function _callee5$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        _context9.next = 2;
                        return "return ".concat(type.named.typeName, ".wrap.apply(this, arguments);");

                      case 2:
                      case "end":
                        return _context9.stop();
                    }
                  }
                }, _callee5);
              })), "t0", 3);

            case 3:
              _context10.next = 5;
              return "}";

            case 5:
              _context10.next = 7;
              return "";

            case 7:
              _context10.next = 9;
              return "Map_(".concat(type.named.typeName, ", ").concat(this.typeStructScalarFunc(type.isA), ");");

            case 9:
              _context10.next = 11;
              return "".concat(type.named.typeName, ".metadata = ").concat(JSON.stringify(type), ";");

            case 11:
            case "end":
              return _context10.stop();
          }
        }
      }, genMapped, this);
    })
  }, {
    key: "genEnum",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function genEnum(module, type) {
      var options;
      return regeneratorRuntime.wrap(function genEnum$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return "export function ".concat(type.named.typeName, "(val) {");

            case 2:
              return _context12.delegateYield(this.withIndention(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee6() {
                return regeneratorRuntime.wrap(function _callee6$(_context11) {
                  while (1) {
                    switch (_context11.prev = _context11.next) {
                      case 0:
                        _context11.next = 2;
                        return "return val;";

                      case 2:
                      case "end":
                        return _context11.stop();
                    }
                  }
                }, _callee6);
              })), "t0", 3);

            case 3:
              _context12.next = 5;
              return "}";

            case 5:
              _context12.next = 7;
              return "";

            case 7:
              options = type.options.slice();
              options.sort();
              return _context12.delegateYield(options.map(function (option) {
                return "".concat(type.named.typeName, ".").concat(option.toUpperCase(), " = ").concat(JSON.stringify(option), ";");
              }), "t1", 10);

            case 10:
              _context12.next = 12;
              return "".concat(type.named.typeName, ".default = ").concat(type.named.typeName, ".").concat(type.options[0].toUpperCase(), ");");

            case 12:
              _context12.next = 14;
              return "Enum_(".concat(type.named.typeName, ");");

            case 14:
              _context12.next = 16;
              return "".concat(type.named.typeName, ".metadata = ").concat(JSON.stringify(type), ";");

            case 16:
            case "end":
              return _context12.stop();
          }
        }
      }, genEnum, this);
    })
  }, {
    key: "genStruct",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function genStruct(module, type) {
      var fieldNames, self;
      return regeneratorRuntime.wrap(function genStruct$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              fieldNames = Object.keys(type.fields);
              fieldNames.sort();
              self = this;
              _context15.next = 5;
              return "export function ".concat(type.named.typeName, "(val) {");

            case 5:
              return _context15.delegateYield(this.withIndention(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee7() {
                return regeneratorRuntime.wrap(function _callee7$(_context13) {
                  while (1) {
                    switch (_context13.prev = _context13.next) {
                      case 0:
                        _context13.next = 2;
                        return "return ".concat(type.named.typeName, ".wrap.apply(this, arguments)");

                      case 2:
                      case "end":
                        return _context13.stop();
                    }
                  }
                }, _callee7);
              })), "t0", 6);

            case 6:
              _context15.next = 8;
              return "}";

            case 8:
              _context15.next = 10;
              return "";

            case 10:
              _context15.next = 12;
              return "Struct_(".concat(type.named.typeName, ", {");

            case 12:
              return _context15.delegateYield(this.withIndention(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee8() {
                var i, fieldName, cameled, field, func;
                return regeneratorRuntime.wrap(function _callee8$(_context14) {
                  while (1) {
                    switch (_context14.prev = _context14.next) {
                      case 0:
                        i = 0;

                      case 1:
                        if (!(i < fieldNames.length)) {
                          _context14.next = 11;
                          break;
                        }

                        fieldName = fieldNames[i];
                        cameled = camelCase(fieldName);
                        field = type.fields[fieldName];
                        func = self.typeStructFunc(field.typeStruct);
                        _context14.next = 8;
                        return "".concat(cameled, ": [").concat(JSON.stringify(fieldName), ", ").concat(func, "],");

                      case 8:
                        ++i;
                        _context14.next = 1;
                        break;

                      case 11:
                      case "end":
                        return _context14.stop();
                    }
                  }
                }, _callee8);
              })), "t1", 13);

            case 13:
              _context15.next = 15;
              return "})";

            case 15:
              _context15.next = 17;
              return "";

            case 17:
              return _context15.delegateYield(type.options.map(function (option) {
                return "".concat(type.named.typeName, ".options.").concat(option.toUpperCase(), " = ").concat(JSON.stringify(option), ";");
              }), "t2", 18);

            case 18:
              _context15.next = 20;
              return "Struct_(".concat(type.named.typeName, ");");

            case 20:
              _context15.next = 22;
              return "".concat(type.named.typeName, ".metadata = ").concat(JSON.stringify(type), ";");

            case 22:
            case "end":
              return _context15.stop();
          }
        }
      }, genStruct, this);
    })
  }, {
    key: "withIndention",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function withIndention(f) {
      return regeneratorRuntime.wrap(function withIndention$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              this.indentionLevel += 1;
              return _context16.delegateYield(f(), "t0", 2);

            case 2:
              this.indentionLevel -= 1;

            case 3:
            case "end":
              return _context16.stop();
          }
        }
      }, withIndention, this);
    })
  }, {
    key: "typeStructScalarFunc",
    value: function typeStructScalarFunc(typeStruct) {
      if (typeStruct.reference.moduleName) {
        var reference = typeStruct.reference;

        if (reference.moduleName === this.moduleName) {
          return reference.typeName;
        }

        return "".concat(this.importedModuleNameOf(reference.moduleName), ".").concat(reference.typeName);
      }

      return 'Prim_';
    }
  }, {
    key: "typeStructFunc",
    value: function typeStructFunc(typeStruct) {
      var scalar = this.typeStructScalarFunc(typeStruct);

      switch (typeStruct.structKind) {
        case _schema.StructKind.MAP:
          return "Map_.of(".concat(scalar, ")");

        case _schema.StructKind.REPEATED:
          return "List_.of(".concat(scalar, ")");
      }

      return scalar;
    }
  }, {
    key: "importedModuleNameOf",
    value: function importedModuleNameOf(moduleName) {
      return camelCase(moduleName.replace(".", "_"));
    }
  }, {
    key: "importPathOf",
    value: function importPathOf(moduleName) {
      var moduleNameParts = moduleName.split(".");
      var parts = [];
      var i = this.moduleNameParts.length - 1;

      for (; i > 0 && this.moduleNameParts.slice(0, i + 1).join("") != moduleNameParts.slice(0, i + 1).join("."); --i) {
        parts.push('..');
      }

      for (; i < moduleNameParts.length; ++i) {
        parts.push(moduleNameParts[i]);
      }

      return JSON.stringify(parts.join("/"));
    }
  }], [{
    key: "modulePathOf",
    value: function modulePathOf(module) {
      return module.split(".").join("/") + ".js";
    }
  }]);

  return ModuleBuildEnv;
}();

ModuleBuildEnv.INDENTIONS = ['', '    ', '        ', '            ', '                ', '                    '];

function main() {
  var args = processArgs();
  var data;

  if (_process["default"].stdout.isTTY) {
    if (!args.input_json) {
      showHelp();
    }

    data = _fs["default"].readFileSync(args.input_json, 'utf-8');
  } else {
    data = _fs["default"].readFileSync(0, 'utf-8');
  }

  var json = JSON.parse(data);

  var modules = _idol__.Map.of(_schema.Module)(json);

  var buildEnv = new BuildEnv();

  for (var moduleName in modules) {
    var module = modules[moduleName];
    buildEnv.buildModule(module);
  }

  buildEnv.finalize(args.output);
}

function processArgs() {
  var result = {};
  var flag;

  for (var i = 1; i < _process["default"].argv.length; ++i) {
    var arg = _process["default"].argv[i];

    if (flag) {
      result[flag] = arg;
      continue;
    }

    switch (arg) {
      case "-h":
      case "--help":
        showHelp();
        break;

      case "--output":
        flag = "output";
        break;

      default:
        result.input_json = arg;
    }
  }

  return result;
}

function showHelp() {
  console.error("Usage:", _process["default"].argv0, "--output <output> <input_json>");
  console.error("");
  console.error("Options:");
  console.error(" -h --help:  Show this help");
  console.error("  --output: the output directory for the generated js files");
  console.error("");

  _process["default"].exit(1);
}

function recursiveCopy(src, dest) {
  if (_fs["default"].lstatSync(src).isDirectory()) {
    if (!_fs["default"].lstatSync(dest).isDirectory()) {
      _fs["default"].mkdirSync(dest, {
        recursive: true
      });
    }

    _fs["default"].readdirSync(src).forEach(function (file) {
      recursiveCopy(_path["default"].join(src, file), _path["default"].join(dest, file));
    });
  } else {
    _fs["default"].copyFileSync(src, dest);
  }
}

function camelCase(s) {
  return s.replace(/([-_][a-z])/ig, function (v) {
    return v.toUpperCase().replace('_', '');
  });
}