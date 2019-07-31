"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSemigroup = getSemigroup;
exports.compose = compose;
exports.compose3 = compose3;
exports.concatMap = concatMap;
exports.flatten = flatten;
exports.flattenOrderedObj = flattenOrderedObj;
exports.Conflictable = exports.StringSet = exports.OrderedObj = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function getSemigroup(source) {
  return {
    concat: function concat(a, b) {
      return a.concat(b);
    }
  };
}

function compose(f, g) {
  return function (a) {
    return g(f(a));
  };
}

function compose3(f, g, h) {
  return function (a) {
    return h(g(f(a)));
  };
}

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
    key: "concat",
    value: function concat(other) {
      var _this = this;

      var ordering = this.ordering.concat(other.ordering.filter(function (k) {
        return !(k in _this.obj);
      }));
      var result = {};
      ordering.forEach(function (k) {
        var left = _this.obj[k];
        var right = other.obj[k];

        var _getSemigroup = getSemigroup(right),
            concat = _getSemigroup.concat;

        if (!left) result[k] = right;else if (!right) result[k] = left;else result[k] = concat(left, right);
      });
      return new OrderedObj(result, ordering);
    }
  }, {
    key: "withKV",
    value: function withKV(k, v) {
      var ordering = this.ordering.concat(k in this.obj ? [] : [k]);
      return new OrderedObj(_objectSpread({}, this.obj, _defineProperty({}, k, v)), ordering);
    }
  }, {
    key: "zipWithKeysFrom",
    value: function zipWithKeysFrom(other) {
      return this.reduce(function (result, _ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            next = _ref2[0],
            k = _ref2[1];

        if (k in other.obj) {
          return result.concat(new OrderedObj(_defineProperty({}, other.obj[k], next)));
        }

        return result;
      }, new OrderedObj());
    }
  }, {
    key: "map",
    value: function map(f) {
      var _this2 = this;

      var result = {};
      this.ordering.forEach(function (k) {
        return result[k] = f(_this2.obj[k], k);
      });
      return new OrderedObj(result, this.ordering);
    }
  }, {
    key: "bimap",
    value: function bimap(f) {
      var _this3 = this;

      var result = {};
      var newOrdering = this.ordering.map(function (k) {
        var _f = f(_this3.obj[k], k),
            _f2 = _slicedToArray(_f, 2),
            k2 = _f2[0],
            v = _f2[1];

        if (k2 in result) {
          throw new Error('bimap invariant broke: not all keys unique');
        }

        result[k2] = v;
        return k2;
      });
      return new OrderedObj(result, newOrdering);
    }
  }, {
    key: "forEach",
    value: function forEach(f) {
      var _this4 = this;

      this.ordering.forEach(function (k) {
        return f(_this4.obj[k], k);
      });
    }
  }, {
    key: "reduce",
    value: function reduce(f, d) {
      var _this5 = this;

      return this.ordering.reduce(function (p, n) {
        return f(p, [_this5.obj[n], n]);
      }, d);
    }
  }, {
    key: "items",
    value: function items() {
      var _this6 = this;

      return this.ordering.map(function (k) {
        return _this6.obj[k];
      });
    }
  }]);

  return OrderedObj;
}();

exports.OrderedObj = OrderedObj;

var StringSet =
/*#__PURE__*/
function () {
  function StringSet() {
    var _this7 = this;

    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, StringSet);

    var obj = {};
    this.items = [];
    items.forEach(function (i) {
      if (i in obj) return;
      obj[i] = [];

      _this7.items.push(i);
    });
  }

  _createClass(StringSet, [{
    key: "reduce",
    value: function reduce(f, d) {
      return this.items.reduce(f, d);
    }
  }, {
    key: "map",
    value: function map(f) {
      return new StringSet(this.items.map(f));
    }
  }, {
    key: "concat",
    value: function concat(other) {
      return new StringSet(this.items.concat(other.items));
    }
  }]);

  return StringSet;
}();

exports.StringSet = StringSet;

var Conflictable =
/*#__PURE__*/
function () {
  function Conflictable(values) {
    _classCallCheck(this, Conflictable);

    this.values = values;
  }

  _createClass(Conflictable, [{
    key: "concat",
    value: function concat(other) {
      return new Conflictable(this.values.concat(other.values));
    }
  }, {
    key: "unwrap",
    value: function unwrap() {
      var errorMessage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Unexpected conflict found.";

      if (this.values.length > 1) {
        throw new Error(errorMessage);
      }

      return this.values[0];
    }
  }, {
    key: "expectOne",
    value: function expectOne() {
      var emptyMessage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "No value was found.";
      var conflictMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Unexpected conflict found";

      if (this.values.length === 0) {
        throw new Error(emptyMessage);
      }

      return this.unwrap(conflictMessage);
    }
  }, {
    key: "unwrapConflicts",
    value: function unwrapConflicts(mapConflict) {
      if (this.values.length > 1) {
        return [mapConflict(this.values)];
      }

      return [];
    }
  }]);

  return Conflictable;
}();

exports.Conflictable = Conflictable;

function concatMap(container, f, d) {
  var _getSemigroup2 = getSemigroup(d),
      concat = _getSemigroup2.concat;

  return container.reduce(function (p, n) {
    return concat(p, f(n));
  }, d);
}

function flatten(container, d) {
  return concatMap(container, function (i) {
    return i;
  }, d);
}

function flattenOrderedObj(container, d) {
  return concatMap(container, function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
        i = _ref5[0],
        _ = _ref5[1];

    return i;
  }, d);
}