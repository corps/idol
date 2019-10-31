"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.includesTag = includesTag;
exports.getTagValue = getTagValue;
exports.getTagValues = getTagValues;
exports.getMaterialTypeDeconstructor = getMaterialTypeDeconstructor;
exports.wrapExpression = wrapExpression;
exports.getSafeIdent = getSafeIdent;
exports.build = build;
exports.importExpr = importExpr;
exports.camelify = camelify;
exports.snakify = snakify;
exports.RESERVED_WORDS = exports.ExternFileContext = exports.GeneratorFileContext = exports.GeneratorAcc = exports.ImportsAcc = exports.IdentifiersAcc = exports.GeneratorConfig = exports.TypeDeconstructor = exports.TypeStructDeconstructor = exports.ScalarDeconstructor = exports.ScalarContext = exports.TypeStructContext = exports.ImportPath = exports.Path = void 0;

var _Module = require("./js/schema/Module");

var _Type = require("./js/schema/Type");

var _Reference = require("./js/schema/Reference");

var _TypeStruct = require("./js/schema/TypeStruct");

var _StructKind = require("./js/schema/StructKind");

var _functional = require("./functional");

var scripter = _interopRequireWildcard(require("./scripter"));

var _build_env = require("./build_env");

var _fs = _interopRequireDefault(require("fs"));

var _path2 = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

      while (i > 0 && fromParts.slice(0, i).join("/") !== toParts.slice(0, i).join("/")) {
        parts.push("..");
        i--;
      }

      if (parts.length === 0) {
        parts.push(".");
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

var TypeStructContext = function TypeStructContext() {
  var fieldTags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var typeTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  _classCallCheck(this, TypeStructContext);

  this.fieldTags = fieldTags || [];
  this.typeTags = typeTags || [];
  this.isTypeBound = !!typeTags && !fieldTags;
};

exports.TypeStructContext = TypeStructContext;

function includesTag(tags, tag) {
  if (tags == null) return false;
  return tags.indexOf(tag) !== -1;
}

function getTagValue(tags, d, tag) {
  if (tags == null) return d;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var t = _step.value;

      if (t.startsWith(tag + ":")) {
        return t.slice(tag.length + 1);
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

  return d;
}

function getTagValues(tags, tag) {
  if (tags == null) return [];
  var result = [];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = tags[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var t = _step2.value;

      if (t.startsWith(tag + ":")) {
        result.push(t.slice(tag.length + 1));
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

  return result;
}

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
      return searchType(new TypeDeconstructor(allTypes.obj[alias.qualifiedName].withTags(t.tags)));
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
        throw new Error("Cannot create ident ".concat(ident, " into path ").concat(intoPath.path, ", conflicts with existing from ").concat(existingSources.join(" ")));
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
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = self.idents.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _path = _step3.value;

          var idents = self.idents.obj[_path].keys();

          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = idents[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var ident = _step4.value;
              var sources = self.idents.obj[_path].obj[ident];

              if (sources.items.length > 1) {
                result.push([_path, ident, sources]);
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                _iterator4["return"]();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return result.map(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 3),
            path = _ref5[0],
            ident = _ref5[1],
            sources = _ref5[2];

        return "ident ".concat(ident, " was defined or imported into ").concat(path, " by conflicting sources: ").concat(sources.items.join(" "));
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
    var types = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, ImportsAcc);

    this.imports = imports || new _functional.OrderedObj();
    this.types = types || new _functional.OrderedObj();
  }

  _createClass(ImportsAcc, [{
    key: "concat",
    value: function concat(other) {
      return (0, _functional.naiveObjectConcat)(this, other);
    }
  }, {
    key: "addImport",
    value: function addImport(intoPath, fromPath, fromIdent, intoIdent) {
      var isType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      var newEntry = function newEntry() {
        return new _functional.OrderedObj(_defineProperty({}, intoPath.path, new _functional.OrderedObj(_defineProperty({}, fromPath.relPath, new _functional.OrderedObj(_defineProperty({}, fromIdent, new _functional.StringSet([intoIdent])))))));
      };

      this.imports = this.imports.concat(newEntry());

      if (isType) {
        this.types = this.types.concat(newEntry());
      }
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
      var _this3 = this;

      return this.imports.get(intoPath).map(function (imports) {
        return imports.keys().filter(Boolean).reduce(function (lines, relPath) {
          var decons = imports.obj[relPath];
          var importPath = relPath.endsWith(".js") ? relPath.slice(0, relPath.length - 3) : relPath;

          var typeDecons = _this3.types.get(intoPath).bind(function (imports) {
            return imports.get(relPath);
          }).getOr(new _functional.OrderedObj());

          if (!typeDecons.isEmpty()) {
            lines.push(scripter.typeImportDecon.apply(scripter, [importPath].concat(_toConsumableArray(typeDecons.keys().map(function (ident) {
              return typeDecons.obj[ident].items.map(function (asIdent) {
                return asIdent === ident ? ident : "".concat(ident, " as ").concat(asIdent);
              }).join(", ");
            })))));
          }

          var nonTypeDecons = _toConsumableArray(decons.mapIntoIterable(function (fromIdent, intoIdents) {
            if (fromIdent === '@@default' || fromIdent in typeDecons.obj) return null;
            return intoIdents.items.map(function (asIdent) {
              return "".concat(fromIdent, " as ").concat(asIdent);
            }).join(', ');
          })).filter(Boolean);

          var defaultDecon = decons.get("@@default").map(function (intoIdents) {
            return intoIdents.items.map(function (asIdent) {
              return "".concat(asIdent);
            }).join(', ');
          });

          if (nonTypeDecons.length || !defaultDecon.isEmpty()) {
            lines.push(defaultDecon.isEmpty() ? scripter.importDecon.apply(scripter, [importPath].concat(_toConsumableArray(nonTypeDecons))) : scripter.importDeconWithDefault.apply(scripter, [importPath, defaultDecon.unwrap()].concat(_toConsumableArray(nonTypeDecons))));
          }

          return lines;
        }, []);
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
      var _this4 = this;

      var pathErrors = [];
      this.groupOfPath.keys().forEach(function (path) {
        var groups = _this4.groupOfPath.obj[path];

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
      var _this5 = this;

      this.validate();
      return _functional.OrderedObj.fromIterable(this.groupOfPath.keys().map(function (path) {
        console.log("Rendering / formatting output for ".concat(path));
        return new _functional.OrderedObj(_defineProperty({}, path, scripter.render(_this5.groupOfPath.obj[path].items.map(function (group) {
          return group in commentHeaders ? commentHeaders[group] : "";
        }).filter(Boolean).map(scripter.comment).concat(_this5.imports.render(path)).concat(["\n"]).concat(_this5.content.get(path).getOr([])))));
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
      var group = Object.keys(path).reduce(function (result, n) {
        return result.either(_functional.Alt.lift(n));
      }, _functional.Alt.empty()).unwrap();
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

      if (intoPath.path === exported.path.path) {
        return ident;
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
      this.imports.addImport(intoPath, fromPath, ident, asIdent, !!exported.isType);
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

function wrapExpression(expr, wrapper) {
  return function (state, path) {
    return wrapper(expr(state, path));
  };
}

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
    key: "export",
    value: function _export(ident, scriptable) {
      var isType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (!this.state.idents.getIdentifierSources(this.path, ident).getOr(new _functional.StringSet()).items.length) {
        throw new Error("GeneratorFileContext.export called before ident was reserved!");
      }

      this.state.addContent(this.path, scriptable(ident));
      return {
        path: this.path,
        ident: ident,
        isType: isType
      };
    }
  }, {
    key: "reserveIdent",
    value: function reserveIdent(ident) {
      this.state.idents.addIdentifier(this.path, ident, this.state.getUniqueSource(this.path));
      return ident;
    }
  }, {
    key: "importIdent",
    value: function importIdent(exported) {
      var asIdent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return this.state.importIdent(this.path, exported, asIdent);
    }
  }, {
    key: "applyExpr",
    value: function applyExpr(expr) {
      return expr(this.state, this.path);
    }
  }, {
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

var ExternFileContext =
/*#__PURE__*/
function (_GeneratorFileContext) {
  _inherits(ExternFileContext, _GeneratorFileContext);

  // Subclasses required to provide this
  function ExternFileContext(externFile, parent, path) {
    var _this6;

    _classCallCheck(this, ExternFileContext);

    _this6 = _possibleConstructorReturn(this, _getPrototypeOf(ExternFileContext).call(this, parent, path));
    _this6.externFile = externFile;
    return _this6;
  }

  _createClass(ExternFileContext, [{
    key: "exportExtern",
    value: function exportExtern(ident) {
      var isType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return {
        path: this.dumpedFile,
        ident: this.state.idents.addIdentifier(this.dumpedFile, ident, "addExtern"),
        isType: isType
      };
    }
  }, {
    key: "dumpedFile",
    get: function get() {
      var _this7 = this;

      return (0, _functional.cachedProperty)(this, "dumpedFile", function () {
        var content = _fs["default"].readFileSync(_this7.externFile, "UTF-8").toString();

        _this7.state.addContent(_this7.path, content);

        return _this7.path;
      });
    }
  }]);

  return ExternFileContext;
}(GeneratorFileContext);

exports.ExternFileContext = ExternFileContext;

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
  var typeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return name.split(/[._]/).map(function (p, i) {
    return i > 0 || typeName ? p[0].toUpperCase() + p.slice(1) : p;
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