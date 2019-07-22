import process from 'process';
import fs from 'fs';
import {Map} from "./__idol__";
import {Module, PrimitiveType, StructKind} from "./schema";
import os from 'os';
import path from 'path';

class BuildEnv {
    constructor() {
        this.buildDir = fs.mkdtempSync('tmp');
    }

    buildModule(module) {
        return new ModuleBuildEnv(this, module.moduleName).writeModule(module);
    }

    finalize(outputDir) {
        this.finalizeIdolFile(outputDir);
        recursiveCopy(this.buildDir, outputDir);
    }

    finalizeIdolFile(outputDir) {
        fs.mkdirSync(outputDir, {recursive: true});
        // const content = fs.readFileSync(path.join(__dirname, '__idol__.js'));
        // fs.writeFileSync(path.join(outputDir, '__idol__.js'), content);
    }
}

class ModuleBuildEnv {
    constructor(buildEnv, moduleName) {
        this.buildEnv = buildEnv;
        this.moduleName = moduleName;
        this.moduleNameParts = moduleName.split(".");
        this.indentionLevel = 0;
    }

    writeModule(module) {
        const moduleFilePath = path.join(this.buildEnv.buildDir, ModuleBuildEnv.modulePathOf(module));
        fs.mkdirSync(path.dirname(moduleFilePath), {recursive: true});

        const lines = [];
        for (let line of this.genModule(module)) {
            lines.push(ModuleBuildEnv.INDENTIONS[this.indentionLevel] + line);
        }

        fs.writeFileSync(moduleFilePath, lines.join("\n"));
    }

    * genModule(module) {
        const self = this;

        yield "import {";
        yield* this.withIndention(function* () {
            yield* (['Enum', 'Struct', 'List', 'Map', 'Literal', 'Primitive'].map(s => `${s} as ${s}_,`));
        });
        yield `} from ${this.importPathOf("__idol__")}`;

        const seenModules = {};
        yield* (module.dependencies.filter(dep => {
            if (seenModules[dep.to.module_name]) return false;
            seenModules[dep.to.module_name] = true;
            return dep.to.module_name !== module.moduleName;
        }).map(dep => {
            return `import * as ${this.importedModuleNameOf(dep.to.module_name)} from ${this.importPathOf(dep.to.module_name)}`;
        }));

        yield "// DO NOT EDIT THIS FILE";
        yield "// This file is generated via idol_js.js.  You can either subclass these types";
        yield "// in your own module file or update the relevant model.toml file and regenerate.";


        for (let i = 0; i < module.typesDependencyOrdering.length; ++i) {
            yield "";

            const type_name = module.typesDependencyOrdering[i];
            const type = module.typesByName[type_name];

            if (type.isA) {
                switch (type.isA.structKind) {
                    case StructKind.SCALAR:
                        if (type.isA.literal) {
                            yield* this.genLiteral(module, type);
                        } else {
                            yield* this.genPrimitive(module, type);
                        }
                        break;
                    case StructKind.REPEATED:
                        yield* this.genRepeated(module, type);
                        break;
                    case StructKind.MAP:
                        yield* this.genMapped(module, type);
                        break;
                }
            } else if (type.options.length > 0) {
                yield* this.genEnum(module, type);
            } else {
                yield* this.genStruct(module, type);
            }
        }

        yield ""
    }

    * genLiteral(module, type) {
        yield `export function ${type.named.typeName}(val) {`;

        yield* this.withIndention(function* () {
            yield `${type.named.typeName}.literal`;
        });

        yield "}";

        yield "";
        switch (type.isA.primitiveType) {
            case PrimitiveType.BOOL:
                yield `${type.named.typeName}.literal = ${JSON.stringify(type.isA.literal.bool)};`;
                break;
            case PrimitiveType.DOUBLE:
                yield `${type.named.typeName}.literal = ${JSON.stringify(type.isA.literal.double)};`;
                break;
            case PrimitiveType.INT53:
                yield `${type.named.typeName}.literal = ${JSON.stringify(type.isA.literal.int53)};`;
                break;
            case PrimitiveType.INT64:
                yield `${type.named.typeName}.literal = ${JSON.stringify(type.isA.literal.int64)};`;
                break;
            case PrimitiveType.STRING:
                yield `${type.named.typeName}.literal = ${JSON.stringify(type.isA.literal.string)};`;
                break;
        }

        yield `Literal_(${type.named.typeName});`;
        yield `${type.named.typeName}.metadata = ${JSON.stringify(type)};`
    }

    * genPrimitive(module, type) {
        yield `export function ${type.named.typeName}(val) {`;

        yield* this.withIndention(function* () {
            yield "return val;"
        });

        yield "}";

        switch (type.isA.primitiveType) {
            case PrimitiveType.BOOL:
                yield `${type.named.typeName}.default = false;`;
                break;
            case PrimitiveType.DOUBLE:
                yield `${type.named.typeName}.default = 0.0;`;
                break;
            case PrimitiveType.INT53:
                yield `${type.named.typeName}.default = 0;`;
                break;
            case PrimitiveType.INT64:
                yield `${type.named.typeName}.default = 0;`;
                break;
            case PrimitiveType.STRING:
                yield `${type.named.typeName}.default = "";`;
                break;
        }

        yield `Primitive_(${type.named.typeName});`;
        yield `${type.named.typeName}.metadata = ${JSON.stringify(type)};`
    }

    * genRepeated(module, type) {
        yield `export function ${type.named.typeName}(val) {`;

        yield* this.withIndention(function* () {
            yield `return ${type.named.typeName}.wrap.apply(this, arguments);`;
        });

        yield "}";

        yield "";
        yield `List_(${type.named.typeName}, ${this.typeStructScalarFunc(type.isA)});`
        yield `${type.named.typeName}.metadata = ${JSON.stringify(type)};`
    }

    * genMapped(module, type) {
        yield `export function ${type.named.typeName}(val) {`;

        yield* this.withIndention(function* () {
            yield `return ${type.named.typeName}.wrap.apply(this, arguments);`;
        });

        yield "}";

        yield "";
        yield `Map_(${type.named.typeName}, ${this.typeStructScalarFunc(type.isA)});`
        yield `${type.named.typeName}.metadata = ${JSON.stringify(type)};`
    }

    * genEnum(module, type) {
        yield `export function ${type.named.typeName}(val) {`;

        yield* this.withIndention(function* () {
            yield "return val;"
        });

        yield "}";
        yield "";

        const options = type.options.slice();
        options.sort();
        yield* options.map(option => {
            return `${type.named.typeName}.${option.toUpperCase()} = ${JSON.stringify(option)};`;
        });

        yield `${type.named.typeName}.default = ${type.named.typeName}.${type.options[0].toUpperCase()};`;
        yield `Enum_(${type.named.typeName});`;
        yield `${type.named.typeName}.metadata = ${JSON.stringify(type)};`;
    }

    * genStruct(module, type) {
        const fieldNames = Object.keys(type.fields);
        fieldNames.sort();
        const self = this;

        yield `export function ${type.named.typeName}(val) {`;

        yield* this.withIndention(function* () {
            yield `return ${type.named.typeName}.wrap.apply(this, arguments)`;
        });

        yield "}";
        yield "";

        yield `Struct_(${type.named.typeName}, {`;
        yield* this.withIndention(function* () {
            for (let i = 0; i < fieldNames.length; ++i) {
                const fieldName = fieldNames[i];
                const cameled = camelCase(fieldName);
                const field = type.fields[fieldName];
                const func = self.typeStructFunc(field.typeStruct);
                yield `${cameled}: [${JSON.stringify(fieldName)}, ${func}],`;
            }
        });
        yield `})`;
        yield "";

        yield* type.options.map(option => {
            return `${type.named.typeName}.options.${option.toUpperCase()} = ${JSON.stringify(option)};`;
        });

        yield `${type.named.typeName}.metadata = ${JSON.stringify(type)};`
    }

    * withIndention(f) {
        this.indentionLevel += 1;
        yield* f();
        this.indentionLevel -= 1;
    }

    typeStructScalarFunc(typeStruct) {
        if (typeStruct.reference.moduleName) {
            const reference = typeStruct.reference;

            if (reference.moduleName === this.moduleName) {
                return reference.typeName;
            }
            return `${this.importedModuleNameOf(reference.moduleName)}.${reference.typeName}`;
        }

        return `Primitive_.of(${JSON.stringify(typeStruct.primitiveType)})`;
    }

    typeStructFunc(typeStruct) {
        const scalar = this.typeStructScalarFunc(typeStruct);

        switch (typeStruct.structKind) {
            case StructKind.MAP:
                return `Map_.of(${scalar})`;
            case StructKind.REPEATED:
                return `List_.of(${scalar})`;
        }

        return scalar;
    }

    importedModuleNameOf(moduleName) {
        return camelCase(moduleName.replace(".", "_"));
    }

    importPathOf(moduleName) {
        const moduleNameParts = moduleName.split(".");
        const parts = [];

        let i = this.moduleNameParts.length - 1;
        for (; i > 0 && this.moduleNameParts.slice(0, i + 1).join("") != moduleNameParts.slice(0, i + 1).join("."); --i) {
            parts.push('..');
        }

        for (; i < moduleNameParts.length; ++i) {
            parts.push(moduleNameParts[i]);
        }

        return JSON.stringify("./" + parts.join("/"));
    }

    static modulePathOf(module) {
        return module.moduleName.split(".").join("/") + ".js";
    }
}

ModuleBuildEnv.INDENTIONS = ['', '    ', '        ', '            ', '                ',
    '                    '];

function main() {
    const args = processArgs();

    let data;
    if (process.stdin.isTTY) {
        if (!args.input_json) {
            showHelp();
        }

        data = fs.readFileSync(args.input_json, 'utf-8');
    } else {
        data = fs.readFileSync(0, 'utf-8');
    }

    const json = JSON.parse(data);
    const modules = Map.of(Module)(json);

    const buildEnv = new BuildEnv();
    for (let moduleName in modules) {
        const module = modules[moduleName];
        buildEnv.buildModule(module);
    }

    buildEnv.finalize(args.output);
}

function processArgs() {
    const result = {};
    let flag;

    for (let i = 2; i < process.argv.length; ++i) {
        let arg = process.argv[i];

        if (flag) {
            result[flag] = arg;
            continue;
        }

        switch (arg) {
            case "-h":
            case "--help":
                showHelp();
                break;
            case "--output":
                flag = "output";
                break;
            default:
                if (i === process.argv.length - 1) result.input_json = arg;
        }
    }
    return result;
}

function showHelp() {
    console.error("Usage:", process.argv[1], "--output <output> <input_json>");
    console.error("");
    console.error("Options:");
    console.error(" -h --help:  Show this help");
    console.error("  --output: the output directory for the generated js files");
    console.error("");
    process.exit(1);
}

function recursiveCopy(src, dest) {
    if (fs.lstatSync(src).isDirectory()) {
        if (!fs.lstatSync(dest).isDirectory()) {
            fs.mkdirSync(dest, {recursive: true});
        }

        fs.readdirSync(src).forEach((file) => {
            recursiveCopy(path.join(src, file), path.join(dest, file));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

function camelCase(s) {
    return s.replace(/([-_][a-z])/ig, (v) => {
        return v.toUpperCase()
            .replace('_', '');
    });
}

main();