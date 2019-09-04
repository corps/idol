"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTagValue = getTagValue;
exports.asPath = asPath;
exports.asQualifiedIdent = asQualifiedIdent;
exports.camelCase = camelCase;
exports.snakify = snakify;
exports.relativePathFrom = relativePathFrom;
exports.sortObj = sortObj;

var _Reference = require("./schema/Reference");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function getTagValue(tags, tag, d) {
  if (tags) {
    for (var i = 0; i < tags.length; ++i) {
      var _tag = tags[i];

      var pre = _tag.indexOf(_tag + ":");

      if (pre === 0) {
        return _tag.slice(_tag.length + 1);
      }
    }
  }

  return d;
}

function asPath(name) {
  return name.replace(/\./g, '/') + ".js";
}

function asQualifiedIdent(reference) {
  return camelCase(reference.qualified_name);
}

function camelCase(s) {
  return s.replace(/([-_.][a-z])/ig, function (v) {
    return v.toUpperCase().replace(/[-_.]/g, '');
  });
}

function snakify(s) {
  s = s.replace(/(.)([A-Z][a-z]+)/g, function (_, x, y) {
    return x + "_" + y;
  });
  return s.replace(/([a-z0-9])([A-Z])/g, function (x, y) {
    return x + "_" + y;
  }).toLowerCase();
}

function relativePathFrom(from, to) {
  var toParts = to.split("/");
  var fromParts = from.split("/");
  var parts = [];
  var i = fromParts.length - 1;

  for (; i >= 0 && fromParts.slice(0, i).toString() != toParts.slice(0, i).toString(); --i) {
    parts.push('..');
  }

  for (; i < toParts.length; ++i) {
    parts.push(toParts[i]);
  }

  return "./" + parts.join("/");
} // Last dicth approach to recursively sorting objects that do not use OrderedObj (ie: metadata)


function sortObj(obj) {
  if (obj == null || _typeof(obj) !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObj);
  var result = {};
  var keys = [];

  for (var k in obj) {
    keys.push(k);
  }

  keys.sort();
  keys.forEach(function (k) {
    return result[k] = sortObj(obj[k]);
  });
  return result;
}