"use strict";

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isObj = isObj;
exports.getListScalar = getListScalar;
exports.Enum = Enum;
exports.Struct = Struct;
exports.Map = exports.List = exports.Literal = exports.Primitive = void 0;

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

function isObj(v) {
  return !Array.isArray(v) && v instanceof Object;
}

function getListScalar(v) {
  while (v instanceof Array) {
    v = v[0];
  }

  return v;
}

var primCache = {};
var Primitive = {
  of: function of(primitiveKind) {
    if (primitiveKind in primCache) {
      return primCache[primitiveKind];
    }

    function validate(val) {
      var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      switch (_typeof(val)) {
        case "string":
          if (primitiveKind !== "string") {
            throw new Error("".concat(path.join("."), " Found string, expected ").concat(primitiveKind));
          }

          return;

        case "number":
          if ((val | 0) === val) {
            if (primitiveKind !== "int" && primitiveKind !== "double") {
              throw new Error("".concat(path.join("."), " Found int, expected ").concat(primitiveKind));
            }
          } else {
            if (primitiveKind !== "double") {
              throw new Error("".concat(path.join("."), " Found double, expected ").concat(primitiveKind));
            }
          }

          return;

        case "boolean":
          if (primitiveKind !== "bool") {
            throw new Error("".concat(path.join("."), " Found boolean, expected ").concat(primitiveKind));
          }

          return;

        case "object":
          if (val == null) {
            throw new Error("".concat(path.join("."), " Found null, expected ").concat(primitiveKind));
          }

      }

      throw new Error("".concat(path.join("."), " Found ").concat(_typeof(val), ", expected ").concat(primitiveKind));
    }

    var result = {
      validate: validate,
      isValid: function isValid(val) {
        try {
          validate(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      expand: function expand(val) {
        val = getListScalar(val);

        if (val == null) {
          switch (primitiveKind) {
            case "string":
              return "";

            case "int":
            case "double":
              return 0;

            case "bool":
              return false;
          }
        }

        return val;
      },
      wrap: function wrap(val) {
        return val;
      },
      unwrap: function unwrap(val) {
        return val;
      }
    };
    primCache[primitiveKind] = result;
    return result;
  }
};
exports.Primitive = Primitive;
var Literal = {
  of: function of(value) {
    function validate(val) {
      var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (val !== value) {
        throw new Error("".concat(path.join("."), " Expected ").concat(value, " but found ").concat(val));
      }
    }

    var result = {
      validate: validate,
      isValid: function isValid(val) {
        try {
          validate(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      expand: function expand(val) {
        return value;
      },
      wrap: function wrap(val) {
        return val;
      },
      unwrap: function unwrap(val) {
        return val;
      }
    };
    return result;
  }
};
exports.Literal = Literal;

function Enum(values) {
  var options = values.options;
  var def = values["default"];

  function validate(val) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if (options.indexOf(val) === -1) {
      throw new Error("".concat(path.join("."), " Expected one of ").concat(options.join(", "), ", found ").concat(val));
    }
  }

  var cons = {
    isValid: function isValid(val) {
      try {
        validate(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    validate: validate,
    wrap: function wrap(val) {
      return val;
    },
    unwrap: function unwrap(val) {
      return val;
    },
    expand: function expand(val) {
      val = getListScalar(val);
      return val == null ? def : val;
    }
  };
  Object.assign(values, cons);
}

function Struct(klass, fields) {
  function validate(json) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    if (!isObj(json)) throw new Error("".concat(path.join("."), " Expected an object, found ").concat(json));
    fields.forEach(function (field) {
      var fieldName = field.fieldName,
          type = field.type,
          optional = field.optional;
      var val = json[fieldName];

      if (optional) {
        if (val == null) return;
      } else {
        if (val == null) throw new Error("".concat(path.join("."), " Missing key ").concat(fieldName));
      }

      type.validate(val, path.concat([fieldName]));
    });
  }

  var cons = {
    validate: validate,
    isValid: function isValid(val) {
      try {
        validate(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    expand: function expand(json) {
      json = getListScalar(json);

      if (json == null) {
        json = {};
      }

      if (!isObj(json)) {
        return json;
      }

      fields.forEach(function (field) {
        var fieldName = field.fieldName,
            type = field.type,
            optional = field.optional;
        var val = json[fieldName];

        if (optional) {
          if (!type.isRepeated) {
            val = getListScalar(val);
          }

          if (val != null) {
            val = type.expand(val);
          } else {
            val = null;
          }

          json[fieldName] = val;
        } else {
          json[fieldName] = type.expand(val);
        }
      });
      return json;
    },
    wrap: function wrap(val) {
      if (val == null) {
        return val;
      }

      if (!(val instanceof klass)) {
        return new this(val);
      }

      return val;
    },
    unwrap: function unwrap(val) {
      if (val instanceof klass) {
        return val._original;
      }

      return val;
    }
  };
  Object.assign(klass, cons);
}

var List = {
  of: function of(innerKind, _ref) {
    var atleastOne = _ref.atleastOne;

    function validate(val) {
      var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (!Array.isArray(val)) {
        throw new Error("".concat(path.join("."), " Expected array but found ").concat(val));
      }

      if (atleastOne) {
        if (val.length < 1) {
          throw new Error("".concat(path.join("."), " Expected atleast one element but found empty list"));
        }
      }

      val.forEach(function (v, i) {
        innerKind.validate(v, path.concat("[".concat(i, "]")));
      });
    }

    var result = {
      isRepeated: true,
      validate: validate,
      isValid: function isValid(val) {
        try {
          validate(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      expand: function expand(val) {
        if (val == null) {
          val = [];
        }

        if (!Array.isArray(val)) {
          val = [val];
        }

        if (atleastOne) {
          if (val.length < 1) {
            val.push(null);
          }
        }

        val.forEach(function (v, i) {
          val[i] = innerKind.expand(v);
        });
        return val;
      },
      wrap: function wrap(val) {
        return val.map(function (v) {
          return innerKind.wrap(v);
        });
      },
      unwrap: function unwrap(val) {
        return val.map(function (v) {
          return innerKind.unwrap(v);
        });
      }
    };
    return result;
  }
};
exports.List = List;
var Map = {
  of: function of(innerKind) {
    function validate(val) {
      var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (!isObj(val)) {
        throw new Error("".concat(path.join("."), " Expected object but found ").concat(val));
      }

      for (var _k in val) {
        innerKind.validate(val[_k], path.concat([_k]));
      }
    }

    var result = {
      validate: validate,
      isValid: function isValid(val) {
        try {
          validate(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      expand: function expand(val) {
        val = getListScalar(val);

        if (val == null) {
          val = {};
        }

        if (!isObj(val)) {
          return val;
        }

        for (var _k2 in val) {
          val[_k2] = innerKind.expand(val[_k2]);
        }

        return val;
      },
      wrap: function wrap(val) {
        var result = {};

        for (var _k3 in val) {
          result[_k3] = innerKind.wrap(val[_k3]);
        }

        return result;
      },
      unwrap: function unwrap(val) {
        return val;
      }
    };
    return result;
  }
};
exports.Map = Map;