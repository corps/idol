"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.naiveObjUpdate = naiveObjUpdate;
exports.naiveObjectConcat = naiveObjectConcat;
exports.cachedProperty = cachedProperty;
exports.Disjoint = exports.Alt = exports.StringSet = exports.OrderedObj = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var OrderedObj =
/*#__PURE__*/
function () {
  function OrderedObj() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var ordering = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Object.keys(obj).sort();

    _classCallCheck(this, OrderedObj);

    this.obj = obj;
    this.ordering = ordering;
  }

  _createClass(OrderedObj, [{
    key: "isEmpty",
    value: function isEmpty() {
      for (var _k in this.obj) {
        return true;
      }

      return false;
    }
  }, {
    key: "map",
    value: function map(f) {
      var _this = this;

      var newObj = {};
      this.ordering.forEach(function (k) {
        return newObj[k] = f(_this.obj[k]);
      });
      return new OrderedObj(newObj, this.ordering);
    }
  }, {
    key: "concat",
    value: function concat(other) {
      var _this2 = this;

      var ordering = this.ordering.concat(other.ordering.filter(function (k) {
        return !(k in _this2.obj);
      }));
      var result = {};
      ordering.forEach(function (k) {
        var left = _this2.obj[k];
        var right = other.obj[k];
        if (!left) result[k] = right;else if (!right) result[k] = left;else result[k] = left.concat(right);
      });
      return new OrderedObj(result, ordering);
    }
  }, {
    key: "keys",
    value: function keys() {
      return Object.keys(this.obj);
    }
  }, {
    key: "values",
    value: function values() {
      var _this3 = this;

      return this.ordering.map(function (k) {
        return _this3.obj[k];
      });
    }
  }, {
    key: "iter",
    value: function iter() {
      var _ref;

      var i = 0;
      var obj = this.obj;
      var keys = this.keys();
      return _ref = {}, _defineProperty(_ref, Symbol.iterator, function () {
        return this;
      }), _defineProperty(_ref, "next", function next() {
        if (i < keys.length) {
          var key = keys[i];
          return {
            done: false,
            value: [key, obj[key]]
          };
        }

        return {
          done: true
        };
      }), _ref;
    }
  }, {
    key: "get",
    value: function get(k) {
      if (k in this.obj) {
        return Alt.lift(this.obj[k]);
      }

      return Alt.empty();
    }
  }, {
    key: "length",
    get: function get() {
      return Object.keys(this.obj).length;
    }
  }], [{
    key: "fromIterable",
    value: function fromIterable(iter) {
      var result = new OrderedObj();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = iter[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var o = _step.value;
          result = result.concat(o);
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

      return result;
    }
  }]);

  return OrderedObj;
}();

exports.OrderedObj = OrderedObj;

var StringSet =
/*#__PURE__*/
function () {
  function StringSet() {
    var _this4 = this;

    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, StringSet);

    var obj = {};
    this.items = [];
    items.forEach(function (i) {
      if (i in obj) return;
      obj[i] = [];

      _this4.items.push(i);
    });
  }

  _createClass(StringSet, [{
    key: "concat",
    value: function concat(other) {
      return new StringSet(this.items.concat(other.items));
    }
  }]);

  return StringSet;
}();

exports.StringSet = StringSet;

var Alt =
/*#__PURE__*/
function () {
  function Alt(value) {
    _classCallCheck(this, Alt);

    this.value = value.slice(0, 1);
  }

  _createClass(Alt, [{
    key: "unwrap",
    value: function unwrap() {
      if (this.value.length) {
        return this.value[0];
      }

      throw new Error("Unwrapped empty value!");
    }
  }, {
    key: "getOr",
    value: function getOr(d) {
      if (this.value.length) {
        return this.value[0];
      }

      return d;
    }
  }, {
    key: "binding",
    value: function binding() {
      var value = this.value;
      return (
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (value.length) {
                    _context.next = 3;
                    break;
                  }

                  _context.next = 3;
                  return false;

                case 3:
                  return _context.abrupt("return", value[0]);

                case 4:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        })()
      );
    }
  }, {
    key: "bind",
    value: function bind(f) {
      if (this.isEmpty()) return this;
      return f(this.unwrap());
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return !this.value.length;
    }
  }, {
    key: "concat",
    value: function concat(other) {
      if (this.isEmpty()) return other;
      return this;
    }
  }, {
    key: "map",
    value: function map(f) {
      if (this.isEmpty()) return Alt.empty();
      return Alt.lift(f(this.unwrap()));
    }
  }, {
    key: "either",
    value: function either(other) {
      if (!this.isEmpty() && !other.isEmpty()) {
        throw new Error("Unexpected conflict, found ".concat(this.value.join(' ')));
      }

      return other;
    }
  }, {
    key: "filter",
    value: function filter(pred) {
      if (this.isEmpty()) return this;
      if (pred(this.unwrap())) return this;
      return Alt.empty();
    }
  }, {
    key: "asDisjoint",
    value: function asDisjoint() {
      return new Disjoint(this.value);
    }
  }], [{
    key: "from",
    value: function from(f) {
      var result;

      while (!(result = f.next()).done) {
        if (!result.value) {
          return new Alt([]);
        }
      }

      return new Alt([result.value]);
    }
  }, {
    key: "lift",
    value: function lift(v) {
      return new Alt([v]);
    }
  }, {
    key: "empty",
    value: function empty() {
      return new Alt([]);
    }
  }]);

  return Alt;
}();

exports.Alt = Alt;

var Disjoint =
/*#__PURE__*/
function () {
  function Disjoint(value) {
    _classCallCheck(this, Disjoint);

    this.value = value.slice();
  }

  _createClass(Disjoint, [{
    key: "asAlt",
    value: function asAlt() {
      if (this.isEmpty()) return Alt.empty();
      return Alt.lift(this.unwrap());
    }
  }, {
    key: "unwrap",
    value: function unwrap() {
      if (this.value.length === 1) {
        return this.value[0];
      }

      if (this.value.length > 1) {
        throw new Error("Unexpected conflict, found ".concat(this.value.join(' ')));
      }

      throw new Error("Unwrapped empty value!");
    }
  }, {
    key: "getOr",
    value: function getOr(d) {
      if (this.value.length) {
        return this.unwrap();
      }

      return d;
    }
  }, {
    key: "binding",
    value: function binding() {
      var self = this;
      return (
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (self.value.length) {
                    _context2.next = 3;
                    break;
                  }

                  _context2.next = 3;
                  return false;

                case 3:
                  return _context2.abrupt("return", self.unwrap());

                case 4:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        })()
      );
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return !this.value.length;
    }
  }, {
    key: "concat",
    value: function concat(other) {
      return new Disjoint(this.value.concat(other.value));
    }
  }, {
    key: "map",
    value: function map(f) {
      if (this.isEmpty()) return Disjoint.empty();
      return Disjoint.lift(f(this.unwrap()));
    }
  }], [{
    key: "from",
    value: function from(_from) {
      var value = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = _from[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var i = _step2.value;
          value.push(i);
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

      return new Disjoint(value);
    }
  }, {
    key: "lift",
    value: function lift(v) {
      return new Disjoint([v]);
    }
  }, {
    key: "empty",
    value: function empty() {
      return new Disjoint([]);
    }
  }]);

  return Disjoint;
}();

exports.Disjoint = Disjoint;

function naiveObjUpdate(one, other) {
  for (var _k2 in other) {
    if (_k2 in one) one[_k2] = one[_k2].concat(other[_k2]);else one[_k2] = other[_k2];
  }
}

function naiveObjectConcat(one, other) {
  var result = _objectSpread({}, one);

  naiveObjUpdate(result, other);
  result.constructor = one.constructor;
  return result;
}

function cachedProperty(store, key, f) {
  key = "__" + key;
  if (key in store) return store[key];
  return store[key] = f();
}