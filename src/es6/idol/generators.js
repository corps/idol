// @flow
import { BuildEnv } from './build_env';
import * as scripter from './scripter';
import { concatMap, Conflictable, OrderedObj, StringSet } from "./functional";
import { asPath, relativePathFrom } from './utils';
import { StatementBlock } from "./scripter";
import { Module } from "./schema/Module";
import { Type } from "./schema/Type";
import { Reference } from "./schema/Reference";
import { TypeStruct } from "./schema/TypeStruct";
import { StructKind } from "./schema/StructKind";
import { PrimitiveType } from "./schema/PrimitiveType";

export type OutputTypeSpecifier<T = string> = { codegen: T } | { scaffold: T };
export type OutputSpecifier<T = string, S = string> = OutputTypeSpecifier<T> | { supplemental: S };
export type DependencySpecifier<T = string, S = string, A = string> = OutputSpecifier<T, S> | { absolute: A };

export interface OutputTypeMapping<T = string> {
    codegen: T,
    scaffold: T
}

export interface OutputMapping<T = string, F = string> extends OutputTypeMapping<T> {
    supplemental: F
}

export const OutputTypeMappers = {
    fromTwo<T, R>(handler: OutputTypeMapping<T => R>): OutputTypeMapping<T> => OutputTypeMapping<R> {
        return (input: OutputTypeMapping<T>): OutputTypeMapping<R> => {
            return {
                codegen: handler.codegen(input.codegen),
                scaffold: handler.scaffold(input.scaffold),
            };
        };
    },

    fromOne<T, R>(f: T => R): OutputTypeMapping<T> => OutputTypeMapping<R> {
        return OutputTypeMappers.fromTwo({ codegen: f, scaffold: f });
    },

    zipper<A, B, C>(handler: OutputTypeMapping<([A, B])> => OutputTypeMapping<C>): (a: OutputTypeMapping<A>, b: OutputTypeMapping<B>) => OutputTypeMapping<C> {
        return (a, b) => handler({
            codegen: [a.codegen, b.codegen],
            scaffold: [a.scaffold, b.scaffold],
        });
    },
};

export function moduleTypesAsOrderedObj(module: Module): OrderedObj<Type> {
    return new OrderedObj<Type>(module.typesByName, module.typesDependencyOrdering).bimap((type, typeName) => [type.named.qualifiedName, type]);
}

export type GeneratorParams = {
    allModules: OrderedObj<Module>,
    allTypes: OrderedObj<Type>,
    scaffoldTypes: OrderedObj<Type>,
    outputDir: string,
    options: { [k: string]: Array<string> },
};

export type OutputTypePathConfig = OrderedObj<Conflictable<string>>;

export class GeneratorConfig {
    codegenRoot: string;
    qualifiedNamesToPaths: OutputTypeMapping<OutputTypePathConfig>;
    name: string;
    params: GeneratorParams;

    constructor(params: GeneratorParams) {
        this.codegenRoot = "codegen";
        this.qualifiedNamesToPaths = { codegen: new OrderedObj<Conflictable<string>>(), scaffold: new OrderedObj<Conflictable<string>>() };
        this.name = "idol_js";
        this.params = params;
    }

    static oneFilePerType(type: Type): string {
        return asPath(type.named.qualifiedName);
    }

    static oneFilePerModule(type: Type): string {
        return asPath(type.named.module_name);
    }

    static flatNamespace(type: Type): string {
        return asPath(type.named.typeName);
    }

    varyOnScaffold(withoutScaffold: Type => string, withScaffold: Type => string): Type => string {
        return (type: Type): string => {
            if (this.params.scaffoldTypes.obj[type.named.qualifiedName]) {
                return withScaffold(type);
            }

            return withoutScaffold(type);
        }
    }

    withPathConfig(pathOfOutputType: OutputTypeMapping<Type => string> = {
        scaffold: GeneratorConfig.oneFilePerType,
        codegen: this.varyOnScaffold(GeneratorConfig.oneFilePerModule, GeneratorConfig.oneFilePerType)
    }) {
        // Replace the codegen type to path mapper such that the codegenRoot will be prefixed.
        const { codegen, scaffold } = pathOfOutputType;
        pathOfOutputType = {
            codegen: (...args: any) => this.codegenRoot + "/" + codegen(...args),
            scaffold
        };

        this.qualifiedNamesToPaths = OutputTypeMappers.fromOne(pathOfType => {
            const typeToPathObj = (type: Type) => new OrderedObj<Conflictable<string>>({
                [type.named.qualifiedName]: new Conflictable([pathOfType(type)])
            });
            return concatMap(this.params.allTypes.items(), typeToPathObj, new OrderedObj());
        })(pathOfOutputType);
    }

    get resolvePath(): (f: OutputSpecifier<>, t: DependencySpecifier<>) => string {
        const lookupPath = (s: OutputSpecifier<>): ?string => {
            if (s.supplemental != null) return (s: any).supplemental;
            if (s.codegen != null) return this.qualifiedNamesToPaths.codegen.obj[(s: any).codegen].unwrap();
            if (s.scaffold != null) return this.qualifiedNamesToPaths.scaffold.obj[(s: any).scaffold].unwrap();
        };

        return (from: OutputSpecifier<>, to: DependencySpecifier<>) => {
            if (to.absolute != null) return (to: any).absolute;

            let fromPath: ?string = lookupPath(from);
            let toPath: ?string = lookupPath((to: any));

            // Special case: local import.
            if (fromPath === toPath) {
                return "";
            }

            if (fromPath != null && toPath != null) {
                return relativePathFrom(fromPath, toPath);
            }

            throw new Error(`Could not find ${JSON.stringify(from)} -> ${JSON.stringify(to)} in resolvePath`);
        };
    }
}

export function withCommentHeader(commentHeader: string): TypedOutputBuilder => TypedOutputBuilder {
    return (a: TypedOutputBuilder) => a.concat(new TypedOutputBuilder([], { commentHeader }));
}

export type Tags = { typeTags?: Array<string>, fieldTags?: Array<string> };

export interface TypeHandler<R, F> {
    get TypeStruct(): (type: Type, typeStruct: TypeStruct, tags: Tags) => R;

    get Enum(): (type: Type, options: Array<string>) => R;

    get Field(): TypeStructMapper<F>;

    get Struct(): (type: Type, fields: OrderedObj<F>) => R;
}

export type TypeMapper<R> = (type: Type) => R;

export function typeMapper<R, F>({ TypeStruct, Enum, Struct, Field }: TypeHandler<R, F>): TypeMapper<R> {
    return (type: Type) => {
        if (type.isA) {
            return TypeStruct(type, type.isA, { typeTags: type.tags })
        } else if (type.isEnum) {
            return Enum(type, type.options);
        }


        const fields = new OrderedObj(type.fields).map(f => Field(f.typeStruct, { fieldTags: f.tags }));
        return Struct(type, fields);
    };
}

export interface MaterialTypeHandler<R> {
    get Struct(): (type: Type) => R,

    get Enum(): (type: Type) => R,

    get TypeStruct(): (type: Type) => R,
}

export function materialTypeMapper<R>(handler: MaterialTypeHandler<R>, allTypes: { [k: string]: Type }): TypeMapper<R> {
    const materialOfScalar = scalarMapper<Type | null>({
        Alias(reference: Reference, ...args: any[]) {
            return allTypes[reference.qualifiedName];
        },
        Literal(...args: any[]) {
            return null;
        },
        Primitive(...args: any[]) {
            return null;
        },
    });

    const materialOfTypeStruct = typeStructMapper<Type | null>({
        Scalar(typeStruct: TypeStruct, ...args: any[]) {
            return materialOfScalar(typeStruct);
        },
        Repeated(...args: any[]) {
            return null;
        },
        Map(...args: any[]) {
            return null;
        }
    });

    const mapMaterialType = typeMapper<R, null>({
        Enum(type: Type) {
            return handler.Enum(type);
        },
        TypeStruct(type: Type, typeStruct: TypeStruct) {
            const innerMaterialType = materialOfTypeStruct(typeStruct);
            if (innerMaterialType != null) {
                return mapMaterialType(innerMaterialType);
            }

            return handler.TypeStruct(type);
        },
        Struct(type: Type) {
            return handler.Struct(type);
        },
        Field() {
            return null;
        }
    });

    return mapMaterialType;
}

export function asTypedGeneratorOutput(mapper: TypeMapper<TypedOutputBuilder>): TypeMapper<TypedGeneratorOutput> {
    return (type: Type) => {
        return new OrderedObj({ [type.named.qualifiedName]: mapper(type) });
    };
}

export function asScaffoldOutput(mapper: TypeMapper<TypedGeneratorOutput>): TypeMapper<SinglePassGeneratorOutput> {
    return (type: Type) => new SinglePassGeneratorOutput({ scaffold: mapper(type) });
}

export function asCodegenOutput(mapper: TypeMapper<TypedGeneratorOutput>): TypeMapper<SinglePassGeneratorOutput> {
    return (type: Type) => new SinglePassGeneratorOutput({ codegen: mapper(type) });
}


export interface TypeStructHandler<R> {
    get Scalar(): (typeStruct: TypeStruct, tags?: Tags) => R;

    get Map(): (scalar: R, tags?: Tags) => R;

    get Repeated(): (scalar: R, tags?: Tags) => R;
}

export type TypeStructMapper<R> = (ts: TypeStruct, tags?: Tags) => R;

export function typeStructMapper<R>({ Scalar, Repeated, Map }: TypeStructHandler<R>): TypeStructMapper<R> {
    return (typeStruct: TypeStruct, tagsData: Tags = { typeTags: undefined, fieldTags: undefined }) => {
        const { structKind } = typeStruct;
        switch (structKind) {
            case StructKind.SCALAR:
                return Scalar(typeStruct, tagsData);
            case StructKind.MAP:
                return Map(Scalar(typeStruct), tagsData);
            case StructKind.REPEATED:
                return Repeated(Scalar(typeStruct), tagsData);
        }

        throw new Error("Unexpected struct kind " + structKind);
    }
}

export interface ScalarHandler<R> {
    get Alias(): (alias: Reference, tags?: Tags) => R;

    get Literal(): (primitiveType: string, value: any, tags?: Tags) => R;

    get Primitive(): (primitiveType: string, tags?: Tags) => R;
}

export type ScalarMapper<R> = (ts: TypeStruct, tags?: Tags) => R;

export function scalarMapper<R>({ Literal, Primitive, Alias }: ScalarHandler<R>): ScalarMapper<R> {
    return (typeStruct, tagsData = { typeTags: undefined, fieldTags: undefined }) => {
        const { reference, isAlias, isLiteral, primitiveType, literalValue } = typeStruct;
        if (isAlias) {
            return Alias(reference, tagsData);
        } else if (isLiteral) {
            return Literal(primitiveType, literalValue, tagsData);
        }
        return Primitive(primitiveType, tagsData);
    }
}

export class TypedOutputBuilder extends scripter.CodeNode {
    imports: OrderedObj<StringSet>;
    commentHeader: string;
    body: Array<scripter.Stringable>;

    constructor(body: scripter.Stringable[] = [],
                { imports, commentHeader }: {
                    imports?: OrderedObj<StringSet>,
                    commentHeader?: string
                } = {}) {
        super();
        this.body = body;
        this.imports = imports || new OrderedObj<StringSet>();
        this.commentHeader = commentHeader || "";
    }

    render() {
        return new scripter.CodeFile([
            scripter.comment(this.commentHeader),
            this.importsAsCodeNode(this.imports),
            "\n\n",
            ...this.body,
        ]).render();
    }

    importsAsCodeNode(imports: OrderedObj<StringSet>): scripter.CodeNode {
        return imports.reduce((r: scripter.StatementBlock, [destructions, path]: [StringSet, string]) =>
                path
                    ? r.concat(new scripter.StatementBlock([new scripter.ImportDeconstructor(path, ...destructions.items)]))
                    : r,
            new StatementBlock());
    }

    concat(other: TypedOutputBuilder) {
        return new TypedOutputBuilder(this.body.concat(other.body), {
            imports: this.imports.concat(other.imports),
            commentHeader: other.commentHeader ? other.commentHeader : this.commentHeader,
        })
    }

    isEmpty() {
        return this.body.length === 0 && this.imports.isEmpty() && !!this.commentHeader;
    }
}

export type TypedGeneratorOutput = OrderedObj<TypedOutputBuilder>;
export type RenderedFilesOutput = OrderedObj<Conflictable<string>>;

export class SinglePassGeneratorOutput implements OutputMapping<TypedGeneratorOutput, RenderedFilesOutput> {
    codegen: TypedGeneratorOutput;
    scaffold: TypedGeneratorOutput;
    supplemental: RenderedFilesOutput;

    constructor(output: { codegen?: TypedGeneratorOutput, scaffold?: TypedGeneratorOutput, supplemental?: RenderedFilesOutput } = {}) {
        this.codegen = output.codegen || new OrderedObj();
        this.scaffold = output.scaffold || new OrderedObj();
        this.supplemental = output.supplemental || new OrderedObj();
    }

    concat(other: SinglePassGeneratorOutput): SinglePassGeneratorOutput {
        return new SinglePassGeneratorOutput({
            codegen: this.codegen.concat(other.codegen),
            scaffold: this.scaffold.concat(other.scaffold),
            supplemental: this.supplemental.concat(other.supplemental),
        })
    }
}

export function render(
    config: GeneratorConfig,
    output: SinglePassGeneratorOutput,
): RenderedFilesOutput {
    const lookupPathAndRender = ([output, pathConfig]: [TypedGeneratorOutput, OutputTypePathConfig]) =>
        output.zipWithKeysFrom(pathConfig.map(v => v.expectOne())).map(file => new Conflictable(file.isEmpty() ? [] : [file.render()]));
    const combineModuleAndPathConfig = OutputTypeMappers.zipper(OutputTypeMappers.fromOne(lookupPathAndRender));
    const preparedTypeFileOutputs = combineModuleAndPathConfig({ codegen: output.codegen, scaffold: output.scaffold }, config.qualifiedNamesToPaths);
    return preparedTypeFileOutputs.scaffold.concat(preparedTypeFileOutputs.codegen).concat(output.supplemental);
}

export function build(
    config: GeneratorConfig,
    output: RenderedFilesOutput,
) {
    const allErrors = concatMap(output, ([conflictable, path]) =>
        conflictable.unwrapConflicts(conflicts =>
            `Generator produced conflict in output!  Path ${path} generated ${conflicts.length} separate outputs.`), []);

    if (allErrors.length) {
        throw new Error(`Error detected while running ${this.name}:\n  ${allErrors.join("\n  ")}`);
    }

    const buildEnv = new BuildEnv(config.name, config.codegenRoot);
    output.forEach((file, path) => {
        const contents = file.unwrap();
        if (contents != null)
            buildEnv.writeBuildFile(path, contents);
    });

    return (outputDir: string) => buildEnv.finalize(outputDir);
}
