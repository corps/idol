"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.start = start;
exports.processArgs = processArgs;
exports.prepareGeneratorParams = prepareGeneratorParams;

var _fs = _interopRequireDefault(require("fs"));

var _idol__ = require("./__idol__");

var _Module = require("./schema/Module");

var _functional = require("./functional");

var _Type = require("./schema/Type");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function start(config) {
  var args = processArgs(config);
  var data;

  if (process.stdin.isTTY) {
    if (!args.input_json) {
      showHelp(config);
    }

    data = _fs["default"].readFileSync(args.input_json[0], "utf-8");
  } else {
    data = _fs["default"].readFileSync(0, "utf-8");
  }

  return prepareGeneratorParams(args, data);
}

function processArgs(config) {
  var result = {};
  var argName;

  var applyArgValue = function applyArgValue(argName, argVal) {
    if (argName in config.flags) {
      if (argVal) {
        showHelp(config);
      }

      result[argName] = [];
      return;
    }

    if (argName in config.args) {
      if (!argVal) {
        showHelp(config);
        return;
      }

      result[argName] = result[argName] || [];
      result[argName].push(argVal);
      return;
    }

    if (argName === "input_json" && argVal) {
      result[argName] = [argVal];
      return;
    }

    showHelp(config);
  };

  for (var i = 2; i < process.argv.length; ++i) {
    var arg = process.argv[i];
    var flag = void 0;

    if (arg.slice(0, 2) === "--") {
      flag = arg.slice(2);
    }

    if (argName && !flag) {
      applyArgValue(argName, arg);
      argName = null;
      continue;
    }

    if (flag) {
      if (flag in config.flags) {
        applyArgValue(flag);
      }

      argName = flag;
      continue;
    }

    applyArgValue("input_json", arg);
  }

  return result;
}

function showHelp(config) {
  var _console;

  var parts = ["Usage:", process.argv[1]];
  Object.keys(config.args).forEach(function (k) {
    parts.push("--" + k);
    parts.push("<" + k + ">");
  });
  Object.keys(config.flags).forEach(function (k) {
    parts.push("[--" + k + "]");
  });
  parts.push("[input_json1]");

  (_console = console).error.apply(_console, parts);

  console.error("  [input_json] is ignored when stdin is piped into this program, otherwise it a file that is read as the idol output to process");
  console.error("Options:");
  console.error("  -h --help:  Show this help");
  Object.keys(config.args).forEach(function (k) {
    console.error("  --" + k + ": " + config.args[k]);
  });
  Object.keys(config.flags).forEach(function (k) {
    console.error("  --" + k + ": " + config.flags[k]);
  });
  console.error("");
  process.exit(1);
}

function prepareGeneratorParams(options, data) {
  var json = JSON.parse(data);

  var MapOfModules = _idol__.Map.of(_Module.Module);

  MapOfModules.validate(json);
  var modules = MapOfModules.wrap(json);

  for (var _k in json) {
    modules[_k] = new _Module.Module(json[_k]);
  }

  var allModules = new _functional.OrderedObj(modules);

  var allTypes = _functional.OrderedObj.fromIterable(allModules.keys().map(function (k) {
    var module = allModules.obj[k];
    return module.typesAsOrderedObject();
  }));

  var targets = options.target || [];

  var scaffoldTypes = _functional.OrderedObj.fromIterable(targets.map(function (target) {
    var scaffoldModule = modules[target];

    if (scaffoldModule == null) {
      throw new Error("Module " + target + " does not exist in the given build.json");
    }

    return scaffoldModule.typesAsOrderedObject();
  }));

  return {
    allModules: allModules,
    allTypes: allTypes,
    scaffoldTypes: scaffoldTypes,
    options: options,
    outputDir: Array.isArray(options.output) ? options.output[0] : ""
  };
}