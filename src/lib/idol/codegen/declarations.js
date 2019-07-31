"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.declarationsModuleDec = exports.declarationsTypeDec = exports.declarationsFieldDec = void 0;

var _idol__ = require("./__idol__.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var declarationsFieldDec = _idol__.List.of(_idol__.Primitive.of("string"), {
  atleastOne: true
});

exports.declarationsFieldDec = declarationsFieldDec;

var declarationsTypeDec =
/*#__PURE__*/
function () {
  function declarationsTypeDec(val) {
    _classCallCheck(this, declarationsTypeDec);

    this._original = val;
  }

  _createClass(declarationsTypeDec, [{
    key: "enum",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["enum"]);
    },
    set: function set(val) {
      this._original["enum"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "fields",
    get: function get() {
      return _idol__.Map.of(declarationsFieldDec).wrap(this._original["fields"]);
    },
    set: function set(val) {
      this._original["fields"] = _idol__.Map.of(declarationsFieldDec).unwrap(val);
    }
  }, {
    key: "is_a",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["is_a"]);
    },
    set: function set(val) {
      this._original["is_a"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "isA",
    get: function get() {
      return this.is_a;
    },
    set: function set(val) {
      this.is_a = val;
    }
  }, {
    key: "tags",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["tags"]);
    },
    set: function set(val) {
      this._original["tags"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "type_vars",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["type_vars"]);
    },
    set: function set(val) {
      this._original["type_vars"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "typeVars",
    get: function get() {
      return this.type_vars;
    },
    set: function set(val) {
      this.type_vars = val;
    }
  }], [{
    key: "validate",
    value: function validate(val) {}
  }, {
    key: "isValid",
    value: function isValid(val) {
      return true;
    }
  }, {
    key: "expand",
    value: function expand(val) {
      return val;
    }
  }, {
    key: "wrap",
    value: function wrap(val) {
      return new declarationsTypeDec(val);
    }
  }, {
    key: "unwrap",
    value: function unwrap(val) {
      return val;
    }
  }]);

  return declarationsTypeDec;
}();

exports.declarationsTypeDec = declarationsTypeDec;
(0, _idol__.Struct)(declarationsTypeDec, [{
  fieldName: "enum",
  type: _idol__.List.of(_idol__.Primitive.of("string"), {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "fields",
  type: _idol__.Map.of(declarationsFieldDec),
  optional: false
}, {
  fieldName: "is_a",
  type: _idol__.Primitive.of("string"),
  optional: false
}, {
  fieldName: "tags",
  type: _idol__.List.of(_idol__.Primitive.of("string"), {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "type_vars",
  type: _idol__.List.of(_idol__.Primitive.of("string"), {
    atleastOne: false
  }),
  optional: false
}]);

var declarationsModuleDec = _idol__.Map.of(declarationsTypeDec);

exports.declarationsModuleDec = declarationsModuleDec;