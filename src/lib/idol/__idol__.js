"use strict";

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isObj = isObj;
exports.getListScalar = getListScalar;
exports.Primitive = Primitive;
exports.Enum = Enum;
exports.Literal = Literal;
exports.Struct = Struct;
exports.List = List;
exports.Map = Map;

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

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

function mkIsValid(Type) {
  return function isValid(val) {
    try {
      Type.validate(val);
      return true;
    } catch (e) {
      return false;
    }
  };
}

function Primitive(constructor, primitiveKind) {
  return Primitive.of(primitiveKind, constructor);
}

Primitive.of = function PrimitiveOf(primitiveKind, constructor) {
  if (constructor == null) {
    constructor = function Primitive(val) {
      return val;
    };
  }

  constructor.validate = function validate(val, path) {
    switch (_typeof(val)) {
      case "string":
        if (primitiveKind !== "string") {
          throw new Error("".concat(path.join('.'), " Found string, expected ").concat(primitiveKind));
        }

        return;

      case "number":
        if ((val | 0) === val) {
          if (primitiveKind !== "int53" || primitiveKind !== "int64" || primitiveKind !== "double") {
            throw new Error("".concat(path.join('.'), " Found int, expected ").concat(primitiveKind));
          }
        } else {
          if (primitiveKind !== "double") {
            throw new Error("".concat(path.join('.'), " Found double, expected ").concat(primitiveKind));
          }
        }

        return;

      case "boolean":
        if (primitiveKind !== "bool") {
          throw new Error("".concat(path.join('.'), " Found boolean, expected ").concat(primitiveKind));
        }

        return;

      case "object":
        if (val == null) {
          throw new Error("".concat(path.join('.'), " Found null, expected ").concat(primitiveKind));
        }

    }

    throw new Error("".concat(path.join('.'), " Found ").concat(_typeof(val), ", expected ").concat(primitiveKind));
  };

  constructor.expand = function expand(val) {
    val = getListScalar(val);

    if (val == null) {
      switch (primitiveKind) {
        case "string":
          return "";

        case "int53":
        case "int64":
        case "double":
          return 0;

        case "bool":
          return false;
      }
    }
  };

  constructor.isValid = mkIsValid(constructor);
  return constructor;
};

function Enum(constructor, options) {
  return Enum.of(options, constructor);
}

Enum.of = function EnumOf(options, constructor) {
  if (constructor == null) {
    constructor = function Enum(val) {
      return val;
    };
  }

  constructor["default"] = constructor["default"] === undefined ? options[0] : constructor["default"];

  constructor.validate = function validate(val, path) {
    if (options.indexOf(val) === -1) {
      throw new Error("".concat(path.join('.'), " Expected one of ").concat(options.join(', '), ", found ").concat(val));
    }
  };

  constructor.expand = function expand(val) {
    val = getListScalar(val);
    return val == null ? this["default"] : val;
  };

  constructor.isValid = mkIsValid(constructor);
  return constructor;
};

function Literal(constructor, literal) {
  return Literal.of(literal, constructor);
}

Literal.of = function LiteralOf(literal, constructor) {
  if (constructor == null) {
    constructor = function Literal(val) {
      return Literal.literal;
    };
  }

  constructor.literal = constructor.literal === undefined ? literal : constructor.literal;

  constructor.validate = function validate(val, path) {
    if (val !== literal) {
      throw new Error("".concat(path.join('.'), " Expected ").concat(literal, " but found ").concat(val));
    }
  };

  constructor.expand = function expand(val) {
    return constructor.literal;
  };

  constructor.isValid = mkIsValid(constructor);
  return constructor;
};

function Struct(constructor, fieldTypes) {
  return Struct.of(fieldTypes, constructor);
}

Struct.of = function StructOf(fieldTypes, constructor) {
  if (constructor == null) {
    constructor = function Struct(val) {
      return Struct.wrap.apply(this, arguments);
    };
  }

  constructor.fieldTypes = constructor.fieldTypes === undefined ? fieldTypes : constructor.fieldTypes;

  constructor.validate = function validate(json, path) {
    if (!isObj(json)) throw new Error("".concat(path.join('.'), " Expected an object, found ").concat(json));
    var metadata = this.metadata || {
      fields: {}
    };

    for (var fieldName in this.fieldTypes) {
      var val = json[fieldName];
      var typeFunc = this.fieldTypes[fieldName];
      var field = metadata.fields[fieldName];
      var optional = (field.tags || []).indexOf('optional') !== -1;

      if (optional) {
        if (val == null) continue;
      } else {
        if (val == null) throw new Error("".concat(path.join('.'), " Missing key ").concat(fieldName));
      }

      typeFunc.validate(val, path.concat([fieldName]));
    }
  };

  constructor.expand = function expand(json, path) {
    json = getListScalar(json);

    if (json == null) {
      json = {};
    }

    if (!isObj(json)) {
      return json;
    }

    var metadata = this.metadata || {
      fields: {}
    };

    for (var fieldName in this.fieldTypes) {
      var val = json[fieldName];
      var typeFunc = this.fieldTypes[fieldName];
      var field = metadata.fields[fieldName];
      var optional = (field.tags || []).indexOf('optional') !== -1;

      if (optional) {
        if (field.type_struct.struct_kind !== 'repeated') {
          val = getListScalar(val);
        }

        if (val != null) {
          val = typeFunc.expand(val);
        }

        json[fieldName] = val;
      } else {
        json[fieldName] = typeFunc.expand(val);
      }
    }
  };

  constructor.wrap = function wrap(val) {
    if (val == null) {
      return val;
    }

    if (!(this instanceof constructor)) {
      return new constructor(val);
    }

    var innerConstructor = this.constructor;

    for (var propName in innerConstructor.fieldTypes) {
      var _innerConstructor$fie = _slicedToArray(innerConstructor.fieldTypes[propName], 2),
          fieldName = _innerConstructor$fie[0],
          fieldType = _innerConstructor$fie[1];

      var fieldVal = val[fieldName];
      this[fieldName] = fieldType(fieldVal);
    }
  };

  var _loop = function _loop(propName) {
    var _constructor$fieldTyp = _slicedToArray(constructor.fieldTypes[propName], 1),
        fieldName = _constructor$fieldTyp[0]; // No need to make a recursive mapping.


    if (fieldName === propName) return "continue";
    Object.defineProperty(constructor.prototype, propName, {
      get: function get() {
        return this[fieldName];
      },
      set: function set(v) {
        this[fieldName] = v;
      }
    });
  };

  for (var propName in constructor.fieldTypes) {
    var _ret = _loop(propName);

    if (_ret === "continue") continue;
  }

  constructor.isValid = mkIsValid(constructor);
  return constructor;
};

function List(constructor, innerKind) {
  return List.of(innerKind, constructor);
}

List.of = function ListOf(innerKind, constructor) {
  if (constructor == null) {
    constructor = function List(val) {
      return List.wrap.apply(List, arguments);
    };
  }

  constructor.innerKind = constructor.innerKind === undefined ? innerKind : constructor.innerKind;

  constructor.validate = function validate(val, path) {
    var _this = this;

    if (!Array.isArray(val)) {
      throw new Error("".concat(path.join('.'), " Expected array but found ").concat(val));
    }

    var metadata = constructor.metadata;

    if (metadata.tags.indexOf('atleast_one') !== -1) {
      if (val.length < 1) {
        throw new Error("".concat(path.join('.'), " Expected atleast one element but found empty list"));
      }
    }

    val.forEach(function (v) {
      _this.innerKind.validate(v, path.concat("[".concat(i, "]")));
    });
  };

  constructor.expand = function expand(val) {
    if (val == null) {
      val = [];
    }

    if (!Array.isArray(val)) {
      return val;
    }

    var metadata = constructor.metadata;

    if (metadata.tags.indexOf('atleast_one') !== -1) {
      if (val.length < 1) {
        val.push(null);
      }
    }

    for (var _i2 = 0; _i2 < val.length; ++_i2) {
      val[_i2] = this.innerKind.expand(val[_i2]);
    }

    return val;
  };

  constructor.wrap = function wrap(val) {
    return val.map(this.innerKind);
  };

  constructor.isValid = mkIsValid(constructor);
  return constructor;
};

function Map(constructor, innerKind) {
  return Map.of(innerKind, constructor);
}

Map.of = function MapOf(innerKind, constructor) {
  if (constructor == null) {
    constructor = function Map(val) {
      return Map.wrap.apply(Map, arguments);
    };
  }

  constructor.innerKind = constructor.innerKind === undefined ? innerKind : constructor.innerKind;

  constructor.validate = function validate(val, path) {
    if (!isObj(val)) {
      throw new Error("".concat(path.join('.'), " Expected object but found ").concat(val));
    }

    for (var k in val) {
      if (!val.hasOwnProperty(k)) continue;
      this.innerKind.validate(val[k], path.concat([k]));
    }
  };

  constructor.expand = function expand(val) {
    if (val == null) {
      val = {};
    }

    if (!isObj(val)) {
      return val;
    }

    for (var k in val) {
      if (!val.hasOwnProperty(k)) continue;
      val[k] = this.innerKind.expand(val[k]);
    }

    return val;
  };

  constructor.wrap = function wrap(val) {
    var result = {};

    for (var k in val) {
      if (!val.hasOwnProperty(k)) continue;
      result[k] = this.innerKind(val[k]);
    }

    return result;
  };

  constructor.isValid = mkIsValid(constructor);
  return constructor;
};