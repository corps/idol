"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.moduleTypesAsOrderedObj = moduleTypesAsOrderedObj;
exports.withCommentHeader = withCommentHeader;
exports.typeMapper = typeMapper;
exports.materialTypeMapper = materialTypeMapper;
exports.asTypedGeneratorOutput = asTypedGeneratorOutput;
exports.asScaffoldOutput = asScaffoldOutput;
exports.asCodegenOutput = asCodegenOutput;
exports.typeStructMapper = typeStructMapper;
exports.scalarMapper = scalarMapper;
exports.render = render;
exports.build = build;
exports.SinglePassGeneratorOutput = exports.TypedOutputBuilder = exports.GeneratorConfig = exports.OutputTypeMappers = void 0;

var _build_env = require("./build_env");

var scripter = _interopRequireWildcard(require("./scripter"));

var _functional = require("./functional");

var _utils = require("./utils");

var _Module = require("./schema/Module");

var _Type = require("./schema/Type");

var _Reference = require("./schema/Reference");

var _TypeStruct2 = require("./schema/TypeStruct");

var _StructKind = require("./schema/StructKind");

var _PrimitiveType = require("./schema/PrimitiveType");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var OutputTypeMappers = {
  fromTwo: function fromTwo(handler) {
    return function (input) {
      return {
        codegen: handler.codegen(input.codegen),
        scaffold: handler.scaffold(input.scaffold)
      };
    };
  },
  fromOne: function fromOne(f) {
    return OutputTypeMappers.fromTwo({
      codegen: f,
      scaffold: f
    });
  },
  zipper: function zipper(handler) {
    return function (a, b) {
      return handler({
        codegen: [a.codegen, b.codegen],
        scaffold: [a.scaffold, b.scaffold]
      });
    };
  }
};
exports.OutputTypeMappers = OutputTypeMappers;

function moduleTypesAsOrderedObj(module) {
  return new _functional.OrderedObj(module.typesByName, module.typesDependencyOrdering).bimap(function (type, typeName) {
    return [type.named.qualifiedName, type];
  });
}

var GeneratorConfig =
/*#__PURE__*/
function () {
  function GeneratorConfig(params) {
    _classCallCheck(this, GeneratorConfig);

    this.codegenRoot = "codegen";
    this.qualifiedNamesToPaths = {
      codegen: new _functional.OrderedObj(),
      scaffold: new _functional.OrderedObj()
    };
    this.name = "idol_js";
    this.params = params;
  }

  _createClass(GeneratorConfig, [{
    key: "varyOnScaffold",
    value: function varyOnScaffold(withoutScaffold, withScaffold) {
      var _this = this;

      return function (type) {
        if (_this.params.scaffoldTypes.obj[type.named.qualifiedName]) {
          return withScaffold(type);
        }

        return withoutScaffold(type);
      };
    }
  }, {
    key: "withPathConfig",
    value: function withPathConfig() {
      var _this2 = this;

      var pathOfOutputType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        scaffold: GeneratorConfig.oneFilePerType,
        codegen: this.varyOnScaffold(GeneratorConfig.oneFilePerModule, GeneratorConfig.oneFilePerType)
      };
      // Replace the codegen type to path mapper such that the codegenRoot will be prefixed.
      var _pathOfOutputType = pathOfOutputType,
          _codegen = _pathOfOutputType.codegen,
          scaffold = _pathOfOutputType.scaffold;
      pathOfOutputType = {
        codegen: function codegen() {
          return _this2.codegenRoot + "/" + _codegen.apply(void 0, arguments);
        },
        scaffold: scaffold
      };
      this.qualifiedNamesToPaths = OutputTypeMappers.fromOne(function (pathOfType) {
        var typeToPathObj = function typeToPathObj(type) {
          return new _functional.OrderedObj(_defineProperty({}, type.named.qualifiedName, pathOfType(type)));
        };

        return (0, _functional.concatMap)(_this2.params.allTypes.items(), typeToPathObj, new _functional.OrderedObj());
      })(pathOfOutputType);
    }
  }, {
    key: "resolvePath",
    get: function get() {
      var _this3 = this;

      var lookupPath = function lookupPath(s) {
        if (s.supplemental != null) return s.supplemental;
        if (s.codegen != null) return _this3.qualifiedNamesToPaths.codegen.obj[s.codegen].unwrap();
        if (s.scaffold != null) return _this3.qualifiedNamesToPaths.scaffold.obj[s.scaffold].unwrap();
      };

      return function (from, to) {
        if (to.absolute != null) return to.absolute;
        var fromPath = lookupPath(from);
        var toPath = lookupPath(to); // Special case: local import.

        if (fromPath === toPath) {
          return "";
        }

        if (fromPath != null && toPath != null) {
          return (0, _utils.relativePathFrom)(fromPath, toPath);
        }

        throw new Error("Could not find ".concat(JSON.stringify(from), " -> ").concat(JSON.stringify(to), " in resolvePath"));
      };
    }
  }], [{
    key: "oneFilePerType",
    value: function oneFilePerType(type) {
      return (0, _utils.asPath)(type.named.qualifiedName);
    }
  }, {
    key: "oneFilePerModule",
    value: function oneFilePerModule(type) {
      return (0, _utils.asPath)(type.named.module_name);
    }
  }, {
    key: "flatNamespace",
    value: function flatNamespace(type) {
      return (0, _utils.asPath)(type.named.typeName);
    }
  }]);

  return GeneratorConfig;
}();

exports.GeneratorConfig = GeneratorConfig;

function withCommentHeader(commentHeader) {
  return function (a) {
    return a.concat(new TypedOutputBuilder([], {
      commentHeader: commentHeader
    }));
  };
}

function typeMapper(_ref2) {
  var TypeStruct = _ref2.TypeStruct,
      Enum = _ref2.Enum,
      Struct = _ref2.Struct,
      Field = _ref2.Field;
  return function (type) {
    if (type.isA) {
      return TypeStruct(type, type.isA, {
        typeTags: type.tags
      });
    } else if (type.isEnum) {
      return Enum(type, type.options);
    }

    var fields = new _functional.OrderedObj(type.fields).map(function (f) {
      return Field(f.typeStruct, {
        fieldTags: f.tags
      });
    });
    return Struct(type, fields);
  };
}

function materialTypeMapper(handler, allTypes) {
  var materialOfScalar = scalarMapper({
    Alias: function Alias(reference) {
      return allTypes[reference.qualifiedName];
    },
    Literal: function Literal() {
      return null;
    },
    Primitive: function Primitive() {
      return null;
    }
  });
  var materialOfTypeStruct = typeStructMapper({
    Scalar: function Scalar(typeStruct) {
      return materialOfScalar(typeStruct);
    },
    Repeated: function Repeated() {
      return null;
    },
    Map: function Map() {
      return null;
    }
  });
  var mapMaterialType = typeMapper({
    Enum: function Enum(type) {
      return handler.Enum(type);
    },
    TypeStruct: function TypeStruct(type, typeStruct) {
      var innerMaterialType = materialOfTypeStruct(typeStruct);

      if (innerMaterialType != null) {
        return mapMaterialType(innerMaterialType);
      }

      return handler.TypeStruct(type);
    },
    Struct: function Struct(type) {
      return handler.Struct(type);
    },
    Field: function Field() {
      return null;
    }
  });
  return mapMaterialType;
}

function asTypedGeneratorOutput(mapper) {
  return function (type) {
    return new _functional.OrderedObj(_defineProperty({}, type.named.qualifiedName, mapper(type)));
  };
}

function asScaffoldOutput(mapper) {
  return function (type) {
    return new SinglePassGeneratorOutput({
      scaffold: mapper(type)
    });
  };
}

function asCodegenOutput(mapper) {
  return function (type) {
    return new SinglePassGeneratorOutput({
      codegen: mapper(type)
    });
  };
}

function typeStructMapper(_ref4) {
  var Scalar = _ref4.Scalar,
      Repeated = _ref4.Repeated,
      Map = _ref4.Map;
  return function (typeStruct) {
    var tagsData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      typeTags: undefined,
      fieldTags: undefined
    };
    var structKind = typeStruct.structKind;

    switch (structKind) {
      case _StructKind.StructKind.SCALAR:
        return Scalar(typeStruct, tagsData);

      case _StructKind.StructKind.MAP:
        return Map(Scalar(typeStruct), tagsData);

      case _StructKind.StructKind.REPEATED:
        return Repeated(Scalar(typeStruct), tagsData);
    }

    throw new Error("Unexpected struct kind " + structKind);
  };
}

function scalarMapper(_ref5) {
  var Literal = _ref5.Literal,
      Primitive = _ref5.Primitive,
      Alias = _ref5.Alias;
  return function (typeStruct) {
    var tagsData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      typeTags: undefined,
      fieldTags: undefined
    };
    var reference = typeStruct.reference,
        isAlias = typeStruct.isAlias,
        isLiteral = typeStruct.isLiteral,
        primitiveType = typeStruct.primitiveType,
        literalValue = typeStruct.literalValue;

    if (isAlias) {
      return Alias(reference, tagsData);
    } else if (isLiteral) {
      return Literal(primitiveType, literalValue, tagsData);
    }

    return Primitive(primitiveType, tagsData);
  };
}

var TypedOutputBuilder =
/*#__PURE__*/
function (_scripter$CodeNode) {
  _inherits(TypedOutputBuilder, _scripter$CodeNode);

  function TypedOutputBuilder() {
    var _this4;

    var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var _ref6 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        imports = _ref6.imports,
        commentHeader = _ref6.commentHeader;

    _classCallCheck(this, TypedOutputBuilder);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(TypedOutputBuilder).call(this));
    _this4.body = body;
    _this4.imports = imports || new _functional.OrderedObj();
    _this4.commentHeader = commentHeader || "";
    return _this4;
  }

  _createClass(TypedOutputBuilder, [{
    key: "render",
    value: function render() {
      return new scripter.CodeFile([scripter.comment(this.commentHeader), this.importsAsCodeNode(this.imports), "\n\n"].concat(_toConsumableArray(this.body))).render();
    }
  }, {
    key: "importsAsCodeNode",
    value: function importsAsCodeNode(imports) {
      return imports.reduce(function (r, _ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
            destructions = _ref8[0],
            path = _ref8[1];

        return path ? r.concat(new scripter.StatementBlock([_construct(scripter.ImportDeconstructor, [path].concat(_toConsumableArray(destructions.items)))])) : r;
      }, new scripter.StatementBlock());
    }
  }, {
    key: "concat",
    value: function concat(other) {
      return new TypedOutputBuilder(this.body.concat(other.body), {
        imports: this.imports.concat(other.imports),
        commentHeader: other.commentHeader ? other.commentHeader : this.commentHeader
      });
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return this.body.length === 0 && this.imports.isEmpty() && !!this.commentHeader;
    }
  }]);

  return TypedOutputBuilder;
}(scripter.CodeNode);

exports.TypedOutputBuilder = TypedOutputBuilder;

var SinglePassGeneratorOutput =
/*#__PURE__*/
function () {
  function SinglePassGeneratorOutput() {
    var output = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SinglePassGeneratorOutput);

    this.codegen = output.codegen || new _functional.OrderedObj();
    this.scaffold = output.scaffold || new _functional.OrderedObj();
    this.supplemental = output.supplemental || new _functional.OrderedObj();
  }

  _createClass(SinglePassGeneratorOutput, [{
    key: "concat",
    value: function concat(other) {
      return new SinglePassGeneratorOutput({
        codegen: this.codegen.concat(other.codegen),
        scaffold: this.scaffold.concat(other.scaffold),
        supplemental: this.supplemental.concat(other.supplemental)
      });
    }
  }]);

  return SinglePassGeneratorOutput;
}();

exports.SinglePassGeneratorOutput = SinglePassGeneratorOutput;

function render(config, output) {
  var lookupPathAndRender = function lookupPathAndRender(_ref9) {
    var _ref10 = _slicedToArray(_ref9, 2),
        output = _ref10[0],
        pathConfig = _ref10[1];

    return output.zipWithKeysFrom(pathConfig).map(function (file) {
      return new _functional.Conflictable(file.isEmpty() ? [] : [file.render()]);
    });
  };

  var combineModuleAndPathConfig = OutputTypeMappers.zipper(OutputTypeMappers.fromOne(lookupPathAndRender));
  var preparedTypeFileOutputs = combineModuleAndPathConfig({
    codegen: output.codegen,
    scaffold: output.scaffold
  }, config.qualifiedNamesToPaths);
  return preparedTypeFileOutputs.scaffold.concat(preparedTypeFileOutputs.codegen).concat(output.supplemental);
}

function build(config, output) {
  var allErrors = (0, _functional.concatMap)(output, function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
        conflictable = _ref12[0],
        path = _ref12[1];

    return conflictable.unwrapConflicts(function (conflicts) {
      return "Generator produced conflict in output!  Path ".concat(path, " generated ").concat(conflicts.length, " separate outputs.");
    });
  }, []);

  if (allErrors.length) {
    throw new Error("Error detected while running ".concat(this.name, ":\n  ").concat(allErrors.join("\n  ")));
  }

  var buildEnv = new _build_env.BuildEnv(config.name, config.codegenRoot);
  output.forEach(function (file, path) {
    var contents = file.unwrap();
    if (contents != null) buildEnv.writeBuildFile(path, contents);
  });
  return function (outputDir) {
    return buildEnv.finalize(outputDir);
  };
}