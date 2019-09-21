"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaModule = void 0;

var _idol__ = require("../__idol__");

var _Type = require("../../schema/Type");

var _Dependency = require("../../schema/Dependency");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SchemaModule =
/*#__PURE__*/
function () {
  function SchemaModule(val) {
    _classCallCheck(this, SchemaModule);

    this._original = val;
  } // These methods are implemented via the runtime, stubs exist here for reference.


  _createClass(SchemaModule, [{
    key: "abstract_types_by_name",
    get: function get() {
      return _idol__.Map.of(_Type.Type, {}).wrap(this._original["abstract_types_by_name"]);
    },
    set: function set(val) {
      this._original["abstract_types_by_name"] = _idol__.Map.of(_Type.Type, {}).unwrap(val);
    }
  }, {
    key: "abstractTypesByName",
    get: function get() {
      return this.abstract_types_by_name;
    },
    set: function set(val) {
      this.abstract_types_by_name = val;
    }
  }, {
    key: "dependencies",
    get: function get() {
      return _idol__.List.of(_Dependency.Dependency, {
        atleastOne: false
      }).wrap(this._original["dependencies"]);
    },
    set: function set(val) {
      this._original["dependencies"] = _idol__.List.of(_Dependency.Dependency, {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "module_name",
    get: function get() {
      return _idol__.Primitive.of("string").wrap(this._original["module_name"]);
    },
    set: function set(val) {
      this._original["module_name"] = _idol__.Primitive.of("string").unwrap(val);
    }
  }, {
    key: "moduleName",
    get: function get() {
      return this.module_name;
    },
    set: function set(val) {
      this.module_name = val;
    }
  }, {
    key: "types_by_name",
    get: function get() {
      return _idol__.Map.of(_Type.Type, {}).wrap(this._original["types_by_name"]);
    },
    set: function set(val) {
      this._original["types_by_name"] = _idol__.Map.of(_Type.Type, {}).unwrap(val);
    }
  }, {
    key: "typesByName",
    get: function get() {
      return this.types_by_name;
    },
    set: function set(val) {
      this.types_by_name = val;
    }
  }, {
    key: "types_dependency_ordering",
    get: function get() {
      return _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).wrap(this._original["types_dependency_ordering"]);
    },
    set: function set(val) {
      this._original["types_dependency_ordering"] = _idol__.List.of(_idol__.Primitive.of("string"), {
        atleastOne: false
      }).unwrap(val);
    }
  }, {
    key: "typesDependencyOrdering",
    get: function get() {
      return this.types_dependency_ordering;
    },
    set: function set(val) {
      this.types_dependency_ordering = val;
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
    key: "unwrap",
    value: function unwrap(val) {
      return val;
    }
  }, {
    key: "wrap",
    value: function wrap(val) {
      return null;
    }
  }]);

  return SchemaModule;
}();

exports.SchemaModule = SchemaModule;
(0, _idol__.Struct)(SchemaModule, [{
  fieldName: "abstract_types_by_name",
  type: _idol__.Map.of(_Type.Type, {}),
  optional: false
}, {
  fieldName: "dependencies",
  type: _idol__.List.of(_Dependency.Dependency, {
    atleastOne: false
  }),
  optional: false
}, {
  fieldName: "module_name",
  type: _idol__.Primitive.of("string"),
  optional: false
}, {
  fieldName: "types_by_name",
  type: _idol__.Map.of(_Type.Type, {}),
  optional: false
}, {
  fieldName: "types_dependency_ordering",
  type: _idol__.List.of(_idol__.Primitive.of("string"), {
    atleastOne: false
  }),
  optional: false
}]);