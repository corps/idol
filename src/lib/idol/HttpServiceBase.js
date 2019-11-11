"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpServiceBase = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _querystring = require("querystring");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HttpServiceBase =
/*#__PURE__*/
function () {
  // Provide a default here for your development, production, or testing needs.
  function HttpServiceBase() {
    var urlRoot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "http://your.service.com";

    _classCallCheck(this, HttpServiceBase);

    this.urlRoot = urlRoot;
  }

  _createClass(HttpServiceBase, [{
    key: "_invoke",
    value: function _invoke(methodConfig, args) {
      var _this$_getRequestConf = this._getRequestConfig(methodConfig, args),
          url = _this$_getRequestConf.url,
          body = _this$_getRequestConf.body,
          method = _this$_getRequestConf.method,
          headers = _this$_getRequestConf.headers;

      return (0, _nodeFetch["default"])(url, {
        method: method,
        body: body,
        headers: headers
      });
    }
  }, {
    key: "_join",
    value: function _join(a, b) {
      if (a.endsWith("/")) {
        if (b.startsWith("/")) {
          return a + b.slice(1);
        }

        return a + b;
      }

      if (b.startsWith("/")) {
        return a + b;
      }

      return a + "/" + b;
    }
  }, {
    key: "_getRequestConfig",
    value: function _getRequestConfig(_ref, args) {
      var servicePath = _ref.servicePath,
          methodPath = _ref.methodPath,
          pathMappings = _ref.pathMappings,
          method = _ref.method;

      var baseUrl = this._join(this.urlRoot, servicePath);

      pathMappings = pathMappings.map(function (mapping) {
        return mapping.split("=");
      });
      var adjustedArgs = _typeof(args) === "object" ? _objectSpread({}, args) : args;
      methodPath = methodPath.split("/").map(function (segment) {
        if (segment.startsWith(":")) {
          if (_typeof(args) !== "object") throw new Error("No arguments provided for path parameter " + segment);
          segment = segment.slice(1);
          var replacement = args[segment];
          var mapping = pathMappings.find(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2),
                param = _ref3[0],
                _ = _ref3[1];

            return param === segment;
          });

          if (mapping) {
            replacement = args;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = mapping[1].split(".")[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var attr = _step.value;

                if (_typeof(replacement) !== "object") {
                  throw new Error("Path mapping " + mapping[1] + " could not find attribute " + attr + " of " + replacement);
                }

                replacement = args[attr];
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
          } else {
            // If this is being used as a path segment, don't include it in the args payload.
            delete adjustedArgs[segment];
          }

          var replacementType = _typeof(replacement);

          if (!(replacementType === "number" || replacementType === "string")) {
            throw new Error("Path argument " + segment + " did not result in a string or number, found " + replacementType);
          }

          return replacement;
        }

        return segment;
      }).join("/");

      var url = this._join(baseUrl, methodPath);

      var hasBody = method === "PUT" || method === "POST" || method === "PATCH";
      var headers = {};
      var body = undefined;

      if (hasBody && args) {
        var _this$_serialize = this._serialize(adjustedArgs);

        headers = _this$_serialize.headers;
        body = _this$_serialize.body;
      }

      if (args) {
        url = url + "?" + (0, _querystring.encode)(adjustedArgs);
      }

      return {
        url: url,
        headers: headers,
        body: body,
        method: method
      };
    }
  }, {
    key: "_serialize",
    value: function _serialize(args) {
      return {
        body: JSON.stringify(args),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
    }
  }]);

  return HttpServiceBase;
}();

exports.HttpServiceBase = HttpServiceBase;