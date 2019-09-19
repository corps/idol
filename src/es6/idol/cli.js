// @flow

import fs from "fs";
import { Map } from "./__idol__";
import { Module } from "./schema/Module";
import { OrderedObj } from "./functional";
import { Type } from "./schema/Type";
import type { GeneratorParams } from "./generators";

export function start(config: CliConfig): GeneratorParams {
  const args = processArgs(config);

  let data: string;
  if (process.stdin.isTTY) {
    if (!args.input_json) {
      showHelp(config);
    }

    data = fs.readFileSync(args.input_json[0], "utf-8");
  } else {
    data = fs.readFileSync(0, "utf-8");
  }

  return prepareGeneratorParams((args: any), data);
}

export function processArgs(config: CliConfig): { [k: string]: Array<string> } {
  const result: { [k: string]: Array<string> } = {};
  let argName;

  const applyArgValue = (argName: string, argVal?: string) => {
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

  for (let i = 2; i < process.argv.length; ++i) {
    let arg = process.argv[i];
    let flag;

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

export type CliConfig = {
  flags: { [k: string]: string },
  args: { [k: string]: string }
};

function showHelp(config: CliConfig) {
  const parts: Array<string> = ["Usage:", process.argv[1]];

  Object.keys(config.args).forEach(k => {
    parts.push("--" + k);
    parts.push("<" + k + ">");
  });

  Object.keys(config.flags).forEach(k => {
    parts.push("[--" + k + "]");
  });

  parts.push("[input_json1]");

  console.error(...parts);
  console.error(
    "  [input_json] is ignored when stdin is piped into this program, otherwise it a file that is read as the idol output to process"
  );
  console.error("Options:");
  console.error("  -h --help:  Show this help");

  Object.keys(config.args).forEach(k => {
    console.error("  --" + k + ": " + config.args[k]);
  });

  Object.keys(config.flags).forEach(k => {
    console.error("  --" + k + ": " + config.flags[k]);
  });

  console.error("");
  process.exit(1);
}

export function prepareGeneratorParams(
  options: { [k: string]: Array<string> | boolean },
  data: string
): GeneratorParams {
  const json = JSON.parse(data);
  const MapOfModules = Map.of(Module);
  MapOfModules.validate(json);
  const modules: { [k: string]: Module } = MapOfModules.wrap(json);
  for (let k in json) {
    modules[k] = new Module(json[k]);
  }

  const allModules = new OrderedObj<Module>(modules);
  const allTypes: OrderedObj<Type> = OrderedObj.fromIterable(
    allModules.keys().map(k => {
      const module: Module = allModules.obj[k];
      return module.typesAsOrderedObject();
    })
  );

  const targets: Array<string> = (options.target || []: any);
  const scaffoldTypes = OrderedObj.fromIterable(
    targets.map(target => {
      const scaffoldModule = modules[target];

      if (scaffoldModule == null) {
        throw new Error("Module " + target + " does not exist in the given build.json");
      }

      return scaffoldModule.typesAsOrderedObject();
    })
  );

  return {
    allModules,
    allTypes,
    scaffoldTypes,
    options,
    outputDir: Array.isArray(options.output) ? options.output[0] : ""
  };
}
