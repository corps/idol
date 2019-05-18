import {ModuleDef, Some} from "./flydl.def";
import {TypePath} from "./flydl.types";

export class ModelReference {
    qualified_name = "";
    model_name = "";
    module_name = "";
}

export class Dependency extends ModelReference {
    source = new ModelReference();
}

export class Model {
    paths: TypePath[] = [];
    model_name = "";
    docs: Some<string> = "";
    consts: { [k: string]: any } = {};
}

export class Module {
    dependencies: Some<Dependency> = [];
    module_name = "";
    models_by_name: { [k: string]: Model } = {};
    models_ordering: string[] = [];
}

export class ProcessingState {
    modules: { [k: string]: Module } = {};
    models: { [k: string]: Model } = {};

    // Maps from needed module to requiring module
    toFromModuleDeps: { [k: string]: { [k: string]: boolean } } = {};
    // Maps from requiring module to its missing deps
    fromToModuleDeps: { [k: string]: { [k: string]: boolean } } = {};

    // Maps from needed model to requiring model
    toFromModelDeps: { [k: string]: { [k: string]: boolean } } = {};
    // Maps from requiring module to its missing deps
    fromToModelDeps: { [k: string]: { [k: string]: boolean } } = {};

    // Keys of toFromModuleDeps not already in modules
    missingModuleLookups: string[] = [];

    // Keys of toFromModelDeps not already in models
    missingModelLookups: string[] = [];
}
