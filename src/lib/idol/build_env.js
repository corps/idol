"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuildEnv = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _os = _interopRequireDefault(require("os"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var BuildEnv =
/*#__PURE__*/
function () {
  function BuildEnv() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "idol_js";
    var codegenRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "codegen";

    _classCallCheck(this, BuildEnv);

    this.buildDir = _fs["default"].mkdtempSync(_os["default"].tmpdir() + _path["default"].sep + name);
    this.codegenRoot = codegenRoot;
  }

  _createClass(BuildEnv, [{
    key: "absPath",
    value: function absPath(relPath) {
      return _path["default"].resolve(this.buildDir, relPath);
    }
  }, {
    key: "writeBuildFile",
    value: function writeBuildFile(relPath, contents) {
      var p = this.absPath(relPath);

      if (!_fs["default"].existsSync(_path["default"].dirname(p))) {
        mkdirP(_path["default"].dirname(p));
      }

      return _fs["default"].writeFileSync(p, contents, "utf-8");
    }
  }, {
    key: "finalize",
    value: function finalize(outputDir) {
      var replace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var existingCodegen = _path["default"].resolve(outputDir, this.codegenRoot);

      if (_fs["default"].existsSync(existingCodegen)) {
        recursiveRmSync(existingCodegen);
      }

      recursiveCopy(this.buildDir, outputDir, replace);
    }
  }]);

  return BuildEnv;
}();

exports.BuildEnv = BuildEnv;

function recursiveRmSync(folder) {
  _fs["default"].readdirSync(folder).forEach(function (entry) {
    var entryPath = _path["default"].join(folder, entry);

    if (_fs["default"].lstatSync(entryPath).isDirectory()) {
      recursiveRmSync(entryPath);
    } else {
      _fs["default"].unlinkSync(entryPath);
    }
  });

  _fs["default"].rmdirSync(folder);
}

function recursiveCopy(src, dest) {
  var replace = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (_fs["default"].lstatSync(src).isDirectory()) {
    if (!_fs["default"].existsSync(dest)) {
      mkdirP(dest);
    }

    _fs["default"].readdirSync(src).forEach(function (file) {
      recursiveCopy(_path["default"].join(src, file), _path["default"].join(dest, file));
    });
  } else {
    if (!replace && _fs["default"].existsSync(dest)) {
      console.log("Skipping " + dest + "...");
    } else {
      _fs["default"].copyFileSync(src, dest);
    }
  }
}

function mkdirP(p) {
  if (_fs["default"].existsSync(p)) return;

  var parent = _path["default"].dirname(p);

  if (!_fs["default"].existsSync(parent)) {
    mkdirP(parent);
  }

  _fs["default"].mkdirSync(p);
}