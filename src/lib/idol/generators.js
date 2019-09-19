"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMaterialTypeDeconstructor = getMaterialTypeDeconstructor;
exports.getSafeIdent = getSafeIdent;
exports.build = build;
exports.importExpr = importExpr;
exports.camelify = camelify;
exports.snakify = snakify;
exports.RESERVED_WORDS = exports.GeneratorFileContext = exports.GeneratorAcc = exports.ImportsAcc = exports.IdentifiersAcc = exports.GeneratorConfig = exports.TypeDeconstructor = exports.TypeStructDeconstructor = exports.ScalarDeconstructor = exports.ScalarContext = exports.TypeStructContext = exports.ImportPath = exports.Path = void 0;

var _Module = require("./schema/Module");

var _Type = require("./schema/Type");

var _Reference = require("./schema/Reference");

var _TypeStruct = require("./schema/TypeStruct");

var _StructKind = require("./schema/StructKind");

var _functional = require("./functional");

var scripter = _interopRequireWildcard(require("./scripter"));

var _build_env = require("./build_env");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Path =
/*#__PURE__*/
function () {
  function Path(path) {
    _classCallCheck(this, Path);

    this.path = path;
  }

  _createClass(Path, [{
    key: "toString",
    value: function toString() {
      return this.path;
    }
  }, {
    key: "importPathTo",
    value: function importPathTo(toPath) {
      if (this.path === toPath.path) {
        return new ImportPath(toPath, "");
      }

      if (toPath.isModule) {
        return ImportPath.module(toPath.path);
      }

      if (this.isModule) {
        throw new Error("Absolute path modules cannot express relative import paths!");
      }

      var fromParts = this.path.split("/");
      var toParts = toPath.path.split("/");
      var parts = [];
      var i = fromParts.length - 1;

      while (i >= 0 && fromParts.slice(0, i) !== toParts.slice(0, i)) {
        parts.push("..");
        i--;
      }

      while (i < toParts.length) {
        parts.push(toParts[i]);
        i += 1;
      }

      return new ImportPath(toPath, parts.join("/"));
    }
  }, {
    key: "isModule",
    get: function get() {
      return !this.path.endsWith(".js");
    }
  }]);

  return Path;
}();

exports.Path = Path;

var ImportPath =
/*#__PURE__*/
function () {
  function ImportPath(path, relPath) {
    _classCallCheck(this, ImportPath);

    this.path = path;
    this.relPath = relPath;
  }

  _createClass(ImportPath, [{
    key: "toString",
    value: function toString() {
      return this.path.toString();
    }
  }, {
    key: "isModule",
    get: function get() {
      return this.path.isModule;
    }
  }], [{
    key: "module",
    value: function module(path) {
      return new ImportPath(new Path(path), path);
    }
  }]);

  return ImportPath;
}();

exports.ImportPath = ImportPath;

var TypeStructContext =
/*#__PURE__*/
function () {
  function TypeStructContext() {
    var fieldTags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var typeTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, TypeStructContext);

    this.fieldTags = fieldTags || [];
    this.typeTags = typeTags || [];
    this.isTypeBound = !!typeTags && !fieldTags;
  }

  _createClass(TypeStructContext, [{
    key: "includesTag",
    value: function includesTag() {
      var fieldTag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var typeTag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return this.fieldTags.indexOf(fieldTag) !== -1 || this.typeTags.indexOf(typeTag) !== -1;
    }
  }, {
    key: "getTagValue",
    value: function getTagValue(d) {
      var fieldTag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var typeTag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var result = d;
      [[fieldTag, this.fieldTags], [typeTag, this.typeTags]].forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            tag = _ref2[0],
            tags = _ref2[1];

        if (!tag) return;
        tags.forEach(function (t) {
          if (t.startsWith(tag + ":")) {
            result = t.slice(tag.length + 1);
          }
        });
      });
      return result;
    }
  }]);

  return TypeStructContext;
}();

exports.TypeStructContext = TypeStructContext;

var ScalarContext =
/*#__PURE__*/
function () {
  function ScalarContext(typeStructContext, isContained) {
    _classCallCheck(this, ScalarContext);

    this.typeStructContext = typeStructContext;
    this.isContained = isContained;
  }

  _createClass(ScalarContext, [{
    key: "isTypeBound",
    get: function get() {
      return this.typeStructContext.isTypeBound;
    }
  }, {
    key: "isDeclarable",
    get: function get() {
      return this.isTypeBound && !this.isContained;
    }
  }]);

  return ScalarContext;
}();

exports.ScalarContext = ScalarContext;

var ScalarDeconstructor =
/*#__PURE__*/
function () {
  function ScalarDeconstructor(typeStruct, context) {
    _classCallCheck(this, ScalarDeconstructor);

    this.typeStruct = typeStruct;
    this.context = context;
  }

  _createClass(ScalarDeconstructor, [{
    key: "getPrimitive",
    value: function getPrimitive() {
      if (this.typeStruct.isAlias || this.typeStruct.isLiteral) {
        return _functional.Alt.empty();
      }

      return _functional.Alt.lift(this.typeStruct.primitiveType);
    }
  }, {
    key: "getLiteral",
    value: function getLiteral() {
      if (!this.typeStruct.isLiteral) {
        return _functional.Alt.empty();
      }

      return _functional.Alt.lift([this.typeStruct.primitiveType, this.typeStruct.literalValue]);
    }
  }, {
    key: "getAlias",
    value: function getAlias() {
      if (!this.typeStruct.isAlias) {
        return _functional.Alt.empty();
      }

      return _functional.Alt.lift(this.typeStruct.reference);
    }
  }]);

  return ScalarDeconstructor;
}();

exports.ScalarDeconstructor = ScalarDeconstructor;

var TypeStructDeconstructor =
/*#__PURE__*/
function () {
  function TypeStructDeconstructor(typeStruct, context) {
    _classCallCheck(this, TypeStructDeconstructor);

    this.typeStruct = typeStruct;
    this.context = context;
  }

  _createClass(TypeStructDeconstructor, [{
    key: "getScalar",
    value: function getScalar() {
      if (this.typeStruct.structKind !== _StructKind.StructKind.SCALAR) {
        return _functional.Alt.empty();
      }

      return _functional.Alt.lift(new ScalarDeconstructor(this.typeStruct, new ScalarContext(this.context, false)));
    }
  }, {
    key: "getMap",
    value: function getMap() {
      if (this.typeStruct.structKind !== _StructKind.StructKind.MAP) {
        return _functional.Alt.empty();
      }

      return _functional.Alt.lift(new ScalarDeconstructor(this.typeStruct, new ScalarContext(this.context, false)));
    }
  }, {
    key: "getRepeated",
    value: function getRepeated() {
      if (this.typeStruct.structKind !== _StructKind.StructKind.REPEATED) {
        return _functional.Alt.empty();
      }

      return _functional.Alt.lift(new ScalarDeconstructor(this.typeStruct, new ScalarContext(this.context, false)));
    }
  }]);

  return TypeStructDeconstructor;
}();

exports.TypeStructDeconstructor = TypeStructDeconstructor;

var TypeDeconstructor =
/*#__PURE__*/
function () {
  function TypeDeconstructor(t) {
    _classCallCheck(this, TypeDeconstructor);

    this.t = t;
  }

  _createClass(TypeDeconstructor, [{
    key: "getTypeStruct",
    value: function getTypeStruct() {
      if (!this.t.isA) {
        return _functional.Alt.empty();
      }

      return _functional.Alt.lift(new TypeStructDeconstructor(this.t.isA, new TypeStructContext(null, this.t.tags)));
    }
  }, {
    key: "getEnum",
    value: function getEnum() {
      if (this.t.isA || this.t.options.length === 0) {
        return _functional.Alt.empty();
      }

      return _functional.Alt.lift(this.t.options);
    }
  }, {
    key: "getStruct",
    value: function getStruct() {
      var _this = this;

      if (this.t.isA || this.t.options.length) {
        return _functional.Alt.empty();
      }

      return _functional.Alt.lift(_functional.OrderedObj.fromIterable(Object.keys(this.t.fields).sort().map(function (k) {
        return new _functional.OrderedObj(_defineProperty({}, k, new TypeStructDeconstructor(_this.t.fields[k].typeStruct, new TypeStructContext(_this.t.fields[k].tags))));
      })));
    }
  }]);

  return TypeDeconstructor;
}();

exports.TypeDeconstructor = TypeDeconstructor;

function getMaterialTypeDeconstructor(allTypes, t) {
  function searchType(typeDecon) {
    return typeDecon.getTypeStruct().bind(function (ts) {
      return ts.getScalar();
    }).bind(function (scalar) {
      return scalar.getAlias();
    }).map(function (alias) {
      return searchType(new TypeDeconstructor(allTypes.obj[alias.qualifiedName]));
    }).getOr(typeDecon);
  }

  return searchType(new TypeDeconstructor(t));
}

var GeneratorConfig =
/*#__PURE__*/
function () {
  function GeneratorConfig(params) {
    _classCallCheck(this, GeneratorConfig);

    this.params = params;
    this.codegenRoot = "codegen";
    this.name = "idol_js";
    this.pathMappings = {};
  }

  _createClass(GeneratorConfig, [{
    key: "pathsOf",
    value: function pathsOf(groupReferences) {
      var result = {};

      for (var _k in groupReferences) {
        result[_k] = this.pathMappings[_k](groupReferences[_k]);
      }

      return result;
    }
  }, {
    key: "inCodegenDir",
    value: function inCodegenDir(f) {
      var _this2 = this;

      return function (ref) {
        return _this2.codegenRoot + "/" + f(ref);
      };
    }
  }, {
    key: "withPathMappings",
    value: function withPathMappings(mappings) {
      this.pathMappings = mappings;
    }
  }], [{
    key: "oneFilePerType",
    value: function oneFilePerType(ref) {
      return ref.asQnPath;
    }
  }, {
    key: "oneFilePerModule",
    value: function oneFilePerModule(ref) {
      return ref.asModulePath;
    }
  }, {
    key: "flatNamespace",
    value: function flatNamespace(ref) {
      return ref.asTypePath;
    }
  }]);

  return GeneratorConfig;
}();

exports.GeneratorConfig = GeneratorConfig;

var IdentifiersAcc =
/*#__PURE__*/
function () {
  function IdentifiersAcc() {
    var idents = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, IdentifiersAcc);

    this.idents = idents || new _functional.OrderedObj();
  }

  _createClass(IdentifiersAcc, [{
    key: "concat",
    value: function concat(other) {
      return (0, _functional.naiveObjectConcat)(this, other);
    }
  }, {
    key: "addIdentifier",
    value: function addIdentifier(intoPath, ident, source) {
      var existingSources = this.idents.get(intoPath.path).bind(function (idents) {
        return idents.get(ident);
      }).getOr(new _functional.StringSet([source])).items;

      if (existingSources.indexOf(source) === -1) {
        throw new Error("Cannot create ident ".concat(ident, " into path ").concat(intoPath.path, ", conflicts with existing from ").concat(existingSources.join(' ')));
      }

      this.idents = this.idents.concat(new _functional.OrderedObj(_defineProperty({}, intoPath.path, new _functional.OrderedObj(_defineProperty({}, ident, new _functional.StringSet([source]))))));
      return ident;
    }
  }, {
    key: "getIdentifierSources",
    value: function getIdentifierSources(path, ident) {
      return this.idents.get(path.path).bind(function (idents) {
        return idents.get(ident);
      });
    }
  }, {
    key: "unwrapConflicts",
    value: function unwrapConflicts() {
      var self = this;
      var result = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = self.idents.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _path = _step.value;

          var idents = self.idents.obj[_path].keys();

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = idents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var ident = _step2.value;
              var sources = self.idents.obj[_path].obj[ident];

              if (sources.items.length > 1) {
                result.push([_path, ident, sources]);
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
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

      return result.map(function (_ref6) {
        var _ref7 = _slicedToArray(_ref6, 3),
            path = _ref7[0],
            ident = _ref7[1],
            sources = _ref7[2];

        return "ident ".concat(ident, " was defined or imported into ").concat(path, " by conflicting sources: ").concat(sources.items.join(' '));
      });
    }
  }]);

  return IdentifiersAcc;
}();

exports.IdentifiersAcc = IdentifiersAcc;

var ImportsAcc =
/*#__PURE__*/
function () {
  function ImportsAcc() {
    var imports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, ImportsAcc);

    this.imports = imports || new _functional.OrderedObj();
  }

  _createClass(ImportsAcc, [{
    key: "concat",
    value: function concat(other) {
      return (0, _functional.naiveObjectConcat)(this, other);
    }
  }, {
    key: "addImport",
    value: function addImport(intoPath, fromPath, fromIdent, intoIdent) {
      this.imports = this.imports.concat(new _functional.OrderedObj(_defineProperty({}, intoPath.path, new _functional.OrderedObj(_defineProperty({}, fromPath.relPath, new _functional.OrderedObj(_defineProperty({}, fromIdent, new _functional.StringSet([intoIdent]))))))));
    }
  }, {
    key: "getImportedIdents",
    value: function getImportedIdents(intoPath, fromPath, fromIdent) {
      return this.imports.get(intoPath.path).bind(function (from) {
        return from.get(fromPath.relPath);
      }).bind(function (idents) {
        return idents.get(fromIdent);
      });
    }
  }, {
    key: "render",
    value: function render(intoPath) {
      return this.imports.get(intoPath).map(function (imports) {
        return imports.keys().map(function (relPath) {
          var decons = imports.obj[relPath];
          return scripter.importDecon.apply(scripter, [relPath].concat(_toConsumableArray(decons.keys().map(function (ident) {
            return decons.obj[ident].items.map(function (asIdent) {
              return asIdent === ident ? ident : "".concat(ident, " as ").concat(asIdent);
            }).join(", ");
          }))));
        });
      }).getOr([]);
    }
  }]);

  return ImportsAcc;
}();

exports.ImportsAcc = ImportsAcc;

var GeneratorAcc =
/*#__PURE__*/
function () {
  function GeneratorAcc() {
    _classCallCheck(this, GeneratorAcc);

    this.idents = new IdentifiersAcc();
    this.imports = new ImportsAcc();
    this.content = new _functional.OrderedObj();
    this.groupOfPath = new _functional.OrderedObj();
    this.uniq = 0;
  }

  _createClass(GeneratorAcc, [{
    key: "concat",
    value: function concat(other) {
      return (0, _functional.naiveObjectConcat)(this, other);
    }
  }, {
    key: "validate",
    value: function validate() {
      var _this3 = this;

      var pathErrors = [];
      this.groupOfPath.keys().forEach(function (path) {
        var groups = _this3.groupOfPath.obj[path];

        if (groups.items.length > 1) {
          pathErrors.push("Conflict in paths: Multiple (".concat(groups.items.join(", "), ") for path ").concat(path));
        }
      });

      if (pathErrors.length) {
        throw new Error(pathErrors.join("\n"));
      }

      var identConflicts = this.idents.unwrapConflicts();

      if (identConflicts.length) {
        throw new Error("Found conflicting identifiers\n".concat(identConflicts.join("\n  ")));
      }
    }
  }, {
    key: "render",
    value: function render(commentHeaders) {
      var _this4 = this;

      this.validate();
      return _functional.OrderedObj.fromIterable(this.groupOfPath.keys().map(function (path) {
        return new _functional.OrderedObj(_defineProperty({}, path, scripter.render(_this4.groupOfPath.obj[path].items.map(function (group) {
          return group in commentHeaders ? commentHeaders[group] : "";
        }).filter(Boolean).map(scripter.comment).concat(_this4.imports.render(path)).concat(_this4.content.get(path).getOr([])))));
      }));
    }
  }, {
    key: "addContent",
    value: function addContent(path, content) {
      if (typeof content === "string") {
        content = [content];
      }

      this.content = this.content.concat(new _functional.OrderedObj(_defineProperty({}, path.path, content)));
    }
  }, {
    key: "reservePath",
    value: function reservePath(path) {
      var group = _functional.Disjoint.from(Object.keys(path)).unwrap();

      var p = path[group];
      var groups = this.groupOfPath.get(p).getOr(new _functional.StringSet([group]));

      if (groups.items.indexOf(group) !== -1) {
        this.groupOfPath = this.groupOfPath.concat(new _functional.OrderedObj(_defineProperty({}, p, new _functional.StringSet([group]))));
        return new Path(p);
      }

      throw new Error("Conflict: cannot create file ".concat(p, " for group ").concat(group, ", already exists for ").concat(groups.items.join(", ")));
    }
  }, {
    key: "createIdent",
    value: function createIdent(intoPath, asIdent, source) {
      asIdent = getSafeIdent(asIdent);

      while (this.idents.getIdentifierSources(intoPath, asIdent).getOr(new _functional.StringSet([source])).items.indexOf(source) === -1) {
        asIdent += "_";
      }

      this.idents.addIdentifier(intoPath, asIdent, source);
      return asIdent;
    }
  }, {
    key: "importIdent",
    value: function importIdent(intoPath, exported) {
      var asIdent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var ident = exported.ident;

      if (asIdent === null) {
        asIdent = ident;
      }

      var fromPath = intoPath.importPathTo(exported.path);

      if (!fromPath.isModule && this.idents.getIdentifierSources(fromPath.path, ident).isEmpty()) {
        throw new Error("identifier ".concat(ident, " required by ").concat(intoPath.path, " does not exist in ").concat(fromPath.path.path));
      }

      var importedAs = this.imports.getImportedIdents(intoPath, fromPath, ident).getOr(new _functional.StringSet([]));

      if (importedAs.items.length) {
        return importedAs.items[0];
      }

      asIdent = this.createIdent(intoPath, asIdent, fromPath.path.path);
      this.imports.addImport(intoPath, fromPath, ident, asIdent);
      return asIdent;
    }
  }, {
    key: "addContentWithIdent",
    value: function addContentWithIdent(path, ident, scriptable) {
      this.idents.addIdentifier(path, ident, this.getUniqueSource(path));
      this.addContent(path, scriptable(ident));
      return ident;
    }
  }, {
    key: "getUniqueSource",
    value: function getUniqueSource(path) {
      this.uniq += 1;
      return "".concat(path.path, ".").concat(this.uniq);
    }
  }]);

  return GeneratorAcc;
}();

exports.GeneratorAcc = GeneratorAcc;

function getSafeIdent(ident) {
  while (RESERVED_WORDS.indexOf(ident) !== -1) {
    ident += "_";
  }

  return ident;
}

var GeneratorFileContext =
/*#__PURE__*/
function () {
  function GeneratorFileContext(parent, path) {
    _classCallCheck(this, GeneratorFileContext);

    this.path = path;
    this.parent = parent;
  }

  _createClass(GeneratorFileContext, [{
    key: "state",
    get: function get() {
      return this.parent.state;
    }
  }, {
    key: "config",
    get: function get() {
      return this.parent.config;
    }
  }]);

  return GeneratorFileContext;
}();

exports.GeneratorFileContext = GeneratorFileContext;

function build(config, output) {
  var buildEnv = new _build_env.BuildEnv(config.name, config.codegenRoot);
  output.keys().forEach(function (path) {
    var contents = output.obj[path];

    if (contents) {
      buildEnv.writeBuildFile(path, contents);
    }
  });
  return function (outputDir) {
    return buildEnv.finalize(outputDir);
  };
}

function importExpr(exported) {
  var asIdent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (asIdent === null) {
    asIdent = exported.ident;
  }

  return function (state, path) {
    return state.importIdent(path, exported, asIdent);
  };
}

function camelify(name) {
  return name.split(/[._]/).map(function (p) {
    return p[0].toUpperCase() + p.slice(1);
  }).join("");
}

function snakify(name) {
  var firstPass = name.replace(/([^.])([A-Z][a-z]+)/, function (_, group1, group2) {
    return "".concat(group1, "_").concat(group2);
  });
  return firstPass.replace(/([a-z0-9])([A-Z])/, function (_, group1, group2) {
    return "".concat(group1, "_").concat(group2);
  });
}

var RESERVED_WORDS = "break\ncase\ncatch\nclass\nconst\ncontinue\ndebugger\ndefault\ndelete\ndo\nelse\nenum\nexport\nextends\nfalse\nfinally\nfor\nfunction\nif\nimport\nin\ninstanceof\nnew\nnull\nreturn\nsuper\nswitch\nthis\nthrow\ntrue\ntry\ntypeof\nvar\nvoid\nwhile\nwith\nany\nboolean\nconstructor\ndeclare\nget\nmodule\nrequire\nnumber\nset\nstring\nsymbol\ntype\nfrom\nof\nasync\nawait\nnamespace\n".split("\n");
exports.RESERVED_WORDS = RESERVED_WORDS;