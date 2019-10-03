"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Reference = void 0;

var _Reference = require("../codegen/schema/Reference");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Reference =
/*#__PURE__*/
function (_SchemaReference) {
  _inherits(Reference, _SchemaReference);

  function Reference(val) {
    _classCallCheck(this, Reference);

    return _possibleConstructorReturn(this, _getPrototypeOf(Reference).call(this, val));
  }

  _createClass(Reference, [{
    key: "snakify",
    value: function snakify() {
      var _require = require("../../generators"),
          snakify = _require.snakify;

      return new Reference({
        module_name: snakify(this.moduleName),
        qualified_name: snakify(this.qualifiedName),
        type_name: snakify(this.typeName)
      });
    }
  }, {
    key: "camelify",
    value: function camelify() {
      var _require2 = require("../../generators"),
          camelify = _require2.camelify;

      return new Reference({
        module_name: camelify(this.moduleName),
        qualified_name: camelify(this.qualifiedName),
        type_name: camelify(this.typeName)
      });
    }
  }, {
    key: "asQnPath",
    get: function get() {
      return this.qualifiedName.split(".").join("/") + ".js";
    }
  }, {
    key: "asTypePath",
    get: function get() {
      return this.typeName + ".js";
    }
  }, {
    key: "asModulePath",
    get: function get() {
      return this.moduleName.split(".").join("/") + ".js";
    }
  }, {
    key: "asQualifiedIdent",
    get: function get() {
      var cameled = this.camelify();
      return cameled.moduleName[0].toUpperCase() + cameled.moduleName.slice(1) + cameled.typeName;
    }
  }]);

  return Reference;
}(_Reference.SchemaReference);

exports.Reference = Reference;