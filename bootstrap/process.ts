import {FieldDef, ModelDef, ModuleDef, Some} from "./models/flydl.def";
import {Model, Module, Dependency, ProcessingState, ModelReference} from "./models/flydl.process";
import {EnumNode, FieldNode, Kind, PrimitiveKind, ReferenceNode, TypeNode, TypePath} from "./models/flydl.types";
import * as fs from "fs";

export type Qualifier = (a: string) => string;

function qualify(qualification: string): Qualifier {
  return (i: string): string => {
    if (i.indexOf(".") != -1) {
      return i;
    }
    if (i.match(/^[A-Z]/)) {
      return qualification + "." + i;
    }
    if (i) {
      return qualification;
    }
    return i;
  }
}

function fieldValOfDef(fieldDef: FieldDef) {
  let fieldVal = fieldDef as string;
  if (fieldDef instanceof Array) {
    fieldVal = fieldDef[0] || "";
  }
  return fieldVal;
}

function some<T>(values: Some<T>): T[] {
  if (values instanceof Array) {
    return values;
  }

  return [values];
}

export function getModuleRefOfFieldDef(fieldDef: FieldDef): string | null {
  let fieldVal = fieldValOfDef(fieldDef);


  if (fieldVal.indexOf(".") != -1) {
    return fieldVal;
  }

  return fieldVal.match(/^[A-Z]/) && fieldVal;
}

export function typePathOfFieldVal(qualify: Qualifier, fieldVal: string): TypePath {
  const result = [new TypeNode()];
  let building = result[0];

  if (fieldVal.slice(0, 8) === "literal:") {
    const split = fieldVal.split(":");
    building.kind = Kind.Literal;

    let literalVal = JSON.parse(split[2]);
    let primitiveKind = split[1] as PrimitiveKind;

    switch (primitiveKind) {
      case PrimitiveKind.int53:
      case PrimitiveKind.bool:
      case PrimitiveKind.double:
      case PrimitiveKind.int64:
      case PrimitiveKind.string:
        building.primitive_kind = primitiveKind;
        building.literal_int53 = literalVal;
        break;
    }

    return result;
  }

  const len = fieldVal.length;
  if (fieldVal[len - 2] == "{" && fieldVal[len - 1] == "}") {
    building.kind = Kind.Map;

    building = new TypeNode();
    result.push(building);
  } else if (fieldVal[len - 1] == "*") {
    building.kind = Kind.Some;

    building = new TypeNode();
    result.push(building);
  }

  let modelRef = getModuleRefOfFieldDef(fieldVal);
  if (modelRef) {
    building.kind = Kind.Reference;
    building.label = modelRef;
    return result;
  }

  building.kind = Kind.Primitive;
  building.primitive_kind = fieldVal as any;

  return result;
}

export function typeTreeOfModel(qualify: Qualifier, modelDef: ModelDef): TypePath[] {

  if (modelDef.is_a.length > 0) {
    return [typePathOfFieldVal(qualify, modelDef.is_a)];
  }

  if (modelDef.resident_values.length > 0) {
    const result = new EnumNode();
    result.resident_values = modelDef.resident_values;
  }


  let result: TypePath[] = [];
  for (let k in modelDef.fields) {
    let fieldDef = modelDef.fields[k];
    let fieldNode = new FieldNode();
    fieldDef = some(fieldDef);

    fieldNode.label = k;
    fieldNode.comments = fieldDef.filter((a, i) => i != 0 && a[0] == "#");
    fieldNode.tags = fieldDef.filter((a, i) => i != 0 && a[0] != "#");

    result.push([{...new TypeNode(), ...fieldNode}, ...typePathOfFieldVal(qualify, fieldDef[0])]);
  }

  return result;
}

export function getMNodelReferenceOfNode(qualify: Qualifier, ref: ReferenceNode): ModelReference {
  const qualified = qualify(ref.label);
  const parts = qualified.split(".");
  return {
    ...new ModelReference(),
    model_name: parts[parts.length - 1],
    module_name: parts.slice(0, parts.length - 1).join("."),
    qualified_name: qualified
  }
}

export function referencesOfTypePaths(qualify: (a: string) => string, paths: TypePath[]): ModelReference[] {
  return paths.reduce((result: ModelReference[], branch: TypePath) => {
    const lastStep = branch[branch.length - 1];
    if (lastStep.kind === Kind.Reference) {
      return result.concat(getMNodelReferenceOfNode(qualify, lastStep as ReferenceNode));
    }
    return result;
  }, []);
}

function processModels(processState: ProcessingState, moduleDef: ModuleDef, qualify: Qualifier): ProcessingState {
  const moduleName = qualify("");

  let modelsByName = Object.keys(moduleDef).reduce((models: { [k: string]: Model }, k: string) => {
    const modelDef = moduleDef[k];
    const model = new Model();
    model.docs = modelDef.docs;
    model.consts = modelDef.consts;
    model.model_name = k;
    model.paths = typeTreeOfModel(qualify, moduleDef[k]);
    models[qualify(k)] = model;
    return models;
  }, {});

  processState.modules[moduleName].models_by_name = modelsByName;
  return processState;
}

function processLocalDepsAndOrdering(processState: ProcessingState,
                                     qualify: Qualifier,
                                     requiredDeps: (processState: ProcessingState) => string[],
                                     alreadyRecursed: (s: string) => boolean = () => false,): ProcessingState {
  const moduleName = qualify("");

  let deps = requiredDeps(processState);
  return deps.reduce((processState, nextModel) => {
    if (processState.modules[moduleName].models_ordering.indexOf(nextModel) !== -1) {
      return processState;
    }

    const nextRecursedPred = (s: string) => alreadyRecursed(s) || s == nextModel;

    if (!processState.modules[moduleName].models_by_name[nextModel]) {
      throw new Error(`Could not resolve model ${nextModel} in module ${moduleName}!`);
    }

    processState = {...processState};
    processState.modules = {...processState.modules};
    processState.modules[moduleName] = {...processState.modules[moduleName]};

    const source = {
      ...new ModelReference(),
      qualified_name: qualify(nextModel),
      model_name: nextModel,
      module_name: moduleName
    };

    processState.modules[moduleName].dependencies =
      referencesOfTypePaths(qualify, processState.modules[moduleName].models_by_name[nextModel].paths).map(r => ({
        ...r,
        source
      }));

    const nextRequiredDeps = (processState: ProcessingState) =>
      some(processState.modules[moduleName].dependencies).filter(d => d.module_name == moduleName).map(d => d.model_name);

    processState = processLocalDepsAndOrdering(processState, qualify, nextRequiredDeps, nextRecursedPred);

    processState = {...processState};
    processState.modules = {...processState.modules};
    processState.modules[moduleName] = {...processState.modules[moduleName]};
    processState.modules[moduleName].models_ordering =
      processState.modules[moduleName].models_ordering.slice();

    processState.modules[moduleName].models_ordering.push(nextModel);

    return processState;
  }, processState);
}

function processModuleDef(processState: ProcessingState, moduleName: string, moduleDef: ModuleDef): ProcessingState {
  processState = {...processState};
  processState.modules = {...processState.modules};
  processState.modules[moduleName] = {...new Module(), module_name: moduleName};

  const qualifier = qualify(moduleName);

  // Gets the models_by_name in place.
  processState = processModels(processState, moduleDef, qualifier);

  // Place the local dependencies and order the models.
  processState = processLocalDepsAndOrdering(processState, qualifier, (processState: ProcessingState) => Object.keys(processState.modules[moduleName].models_by_name));

  processState = some(processState.modules[moduleName].dependencies).reduce((processState, dep) => {
    processState = {...processState};
    processState.models = {...processState.models};

    processState.fromToModuleDeps = {...processState.fromToModuleDeps};
    processState.fromToModuleDeps[moduleName] = {...processState.fromToModuleDeps[moduleName]};
    processState.fromToModuleDeps[moduleName][dep.module_name] = true;

    processState.toFromModuleDeps = {...processState.toFromModuleDeps};
    processState.toFromModuleDeps[dep.module_name] = {...processState.toFromModuleDeps[dep.module_name]};
    processState.toFromModuleDeps[dep.module_name][moduleName] = true;

    processState.fromToModelDeps = {...processState.fromToModelDeps};
    processState.fromToModelDeps[dep.source.qualified_name] = {...processState.fromToModelDeps[dep.source.qualified_name]};
    processState.fromToModelDeps[dep.source.qualified_name][dep.qualified_name] = true;

    processState.toFromModelDeps = {...processState.toFromModelDeps};
    processState.toFromModelDeps[dep.qualified_name] = {...processState.toFromModelDeps[dep.qualified_name]};
    processState.toFromModelDeps[dep.qualified_name][dep.source.qualified_name] = true;

    return processState;
  }, processState);

  processState = Object.keys(processState.modules[moduleName].models_by_name).reduce((processState, nextModel) => {
    processState = {...processState};
    processState.models = {...processState.models};
    processState.models[qualifier(nextModel)] = processState.modules[moduleName].models_by_name[nextModel];

    return processState;
  }, processState);

  processState.missingModuleLookups = Object.keys(processState.toFromModuleDeps).filter(s => !processState.modules[s]);
  processState.missingModelLookups = Object.keys(processState.toFromModelDeps).filter(s => !processState.models[s]);

  return processState;
}

// const input = fs.readFileSync(0).toString("utf-8").split("\n");
// console.log(input);
