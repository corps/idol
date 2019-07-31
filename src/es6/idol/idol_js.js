// @flow
import fs from 'fs';
import path from 'path';
import * as scripter from "./scripter";
import { compose, concatMap, Conflictable, flattenOrderedObj, OrderedObj, StringSet } from "./functional";
import { asCodegenOutput, build, GeneratorConfig as BaseGeneratorConfig, SinglePassGeneratorOutput, scalarMapper, TypedOutputBuilder, asTypedGeneratorOutput, typeMapper, typeStructMapper, withCommentHeader, asScaffoldOutput, materialTypeMapper, render } from "./generators";
import type { OutputTypeSpecifier, GeneratorParams, ScalarMapper, TypeStructMapper, TypeMapper, ScalarHandler, TypeStructHandler, TypeHandler, Tags, MaterialTypeHandler } from "./generators";
import { start } from "./cli";
import { asQualifiedIdent, camelCase } from "./utils";
import type { Stringable } from "./scripter";
import { Reference } from "./schema/Reference";
import { Type } from "./schema/Type";

export class GeneratorConfig extends BaseGeneratorConfig {
    idolJsPath: string;

    constructor(params: GeneratorParams) {
        super(params);
        this.idolJsPath = this.codegenRoot + "/__idol__.js";
    }

    idolJsImports(module: OutputTypeSpecifier<>, ...imports: string[]): OrderedObj<StringSet> {
        const path = this.resolvePath(module, { supplemental: this.idolJsPath });

        return new OrderedObj<StringSet>({
            [path]: new StringSet(imports.map(i => `${i} as ${i}_`)),
        });
    }

    codegenReferenceImport(from: OutputTypeSpecifier<>, reference: Reference): OrderedObj<StringSet> {
        return new OrderedObj<StringSet>({
            [this.resolvePath(from, { codegen: reference.qualifiedName })]: new StringSet([asQualifiedIdent(reference)])
        })
    }

    scaffoldReferenceImport(from: OutputTypeSpecifier<>, reference: Reference): OrderedObj<StringSet> {
        return new OrderedObj<StringSet>({
            [this.resolvePath(from, { scaffold: reference.qualifiedName })]: new StringSet([`${reference.typeName} as ${asQualifiedIdent(reference)}`])
        })
    }

    scalarImports(module: OutputTypeSpecifier<>): ScalarMapper<OrderedObj<StringSet>> {
        return scalarMapper<OrderedObj<StringSet>>({
            Literal: () => this.idolJsImports(module, "Literal"),
            Primitive: () => this.idolJsImports(module, "Primitive"),
            Alias: (reference) => {
                if (reference.qualifiedName in this.params.scaffoldTypes.obj) {
                    return this.scaffoldReferenceImport(module, reference);
                }

                return this.codegenReferenceImport(module, reference);
            }
        });
    }

    typeStructImports(module: OutputTypeSpecifier<>): TypeStructMapper<OrderedObj<StringSet>> {
        return typeStructMapper({
            Scalar: this.scalarImports(module),
            Repeated: (scalarImports: OrderedObj<StringSet>) => scalarImports.concat(this.idolJsImports(module, "List")),
            Map: (scalarImports) => scalarImports.concat(this.idolJsImports(module, "Map")),
        });
    }

    typeImports(module: OutputTypeSpecifier<>): TypeMapper<OrderedObj<StringSet>> {
        const typeStructImportMapper = this.typeStructImports(module);
        return typeMapper<OrderedObj<StringSet>, OrderedObj<StringSet>>({
            Field: typeStructImportMapper,
            TypeStruct: (type, ...args) => typeStructImportMapper(...args),
            Enum: (...args) => this.idolJsImports(module, "Enum"),
            Struct: (type: Type, fieldImports: OrderedObj<OrderedObj<StringSet>>) =>
                this.idolJsImports(module, "Struct").concat(flattenOrderedObj(fieldImports, new OrderedObj()))
        })
    }
}

export class CodegenScalarExpressionHandler implements ScalarHandler<scripter.Stringable> {
    get Literal() {
        return (primitiveType: string, val: any) => scripter.invocation("Literal_.of", scripter.literal(val));
    }

    get Primitive() {
        return (primitiveType: string) => scripter.invocation("Primitive_.of", scripter.literal(primitiveType));
    }

    get Alias() {
        return (reference: Reference) => asQualifiedIdent(reference);
    }
}

export class CodegenTypeStructExpressionHandler implements TypeStructHandler<scripter.Stringable> {
    scalarHandler: ScalarHandler<scripter.Stringable>;

    constructor(scalarHandler: ScalarHandler<scripter.Stringable> = new CodegenScalarExpressionHandler()) {
        this.scalarHandler = scalarHandler;
    }

    get Scalar() {
        return scalarMapper<scripter.Stringable>(this.scalarHandler);
    }

    get Repeated() {
        return (scalar: scripter.Stringable, tags?: Tags = {}) => scripter.invocation("List_.of", scalar, scripter.objLiteral(
            scripter.propDec("atleastOne", scripter.literal(!!tags.typeTags && tags.typeTags.indexOf('atleast_one') !== -1)),
        ));
    }

    get Map() {
        return (scalar: scripter.Stringable) => scripter.invocation("Map_.of", scalar);
    }
}

export class CodegenTypeHandler implements TypeHandler<TypedOutputBuilder, scripter.Stringable> {
    params: GeneratorParams;
    config: GeneratorConfig;
    typeStructHandler: TypeStructHandler<scripter.Stringable>;

    constructor(params: GeneratorParams, config: GeneratorConfig,
                typeStructHandler: TypeStructHandler<scripter.Stringable> = new CodegenTypeStructExpressionHandler()) {
        this.params = params;
        this.config = config;
        this.typeStructHandler = typeStructHandler;
    }

    enumConst(options: string[]): scripter.Stringable {
        const values = options.map(o =>
            scripter.propDec(o.toUpperCase(), scripter.literal(o)));
        return scripter.objLiteral(...values,
            "\n\n",
            scripter.propDec("options", scripter.literal(options)),
            scripter.propDec("default", scripter.literal(options[0])),
            "\n\n",
            scripter.methodDec("validate", ["val"], []),
            scripter.methodDec("isValid", ["val"], [
                scripter.ret("true"),
            ]),
            scripter.methodDec("expand", ["val"], [
                scripter.ret("val"),
            ]),
            scripter.methodDec("wrap", ["val"], [
                scripter.ret("val"),
            ]),
            scripter.methodDec("unwrap", ["val"], [
                scripter.ret("val"),
            ]),
        );
    }

    gettersAndSettersFor(propName: string, fieldName: string, field: scripter.Stringable): scripter.Stringable[] {
        return [
            scripter.getProp(
                propName,
                [],
                [
                    propName !== fieldName ?
                        scripter.ret(scripter.propAccess("this", fieldName)) :
                        scripter.ret(scripter.invocation(scripter.propAccess(field, "wrap"), scripter.propLiteralAccess("this._original", fieldName)))
                ]
            ),
            scripter.setProp(
                propName,
                ["val"],
                [
                    propName !== fieldName ?
                        scripter.assignment(scripter.propAccess("this", fieldName), "val") :
                        scripter.assignment(scripter.propLiteralAccess("this._original", fieldName),
                            scripter.invocation(scripter.propAccess(field, "unwrap"), "val"))
                ]
            )
        ];
    }

    structClass(type: Type, fields: OrderedObj<scripter.Stringable>) {
        return scripter.exportedClass(this.exportIdent(type), null,
            [
                scripter.methodDec("constructor", ["val"], [
                    scripter.assignment("this._original", "val")
                ]),
                scripter.staticMethodDec("validate", ["val"], []),
                scripter.staticMethodDec("isValid", ["val"], [
                    scripter.ret(scripter.literal(true))
                ]),
                scripter.staticMethodDec("expand", ["val"], [
                    scripter.ret("val"),
                ]),
                scripter.staticMethodDec("wrap", ["val"], [
                    scripter.ret(scripter.newInvocation(this.exportIdent(type), "val")),
                ]),
                scripter.staticMethodDec("unwrap", ["val"], [
                    scripter.ret("val"),
                ]),
            ].concat(concatMap(fields.ordering, fieldName => {
                    const originalField = this.gettersAndSettersFor(fieldName, fieldName, fields.obj[fieldName]);
                    const camelField = fieldName !== camelCase(fieldName) ? this.gettersAndSettersFor(camelCase(fieldName), fieldName, fields.obj[fieldName]) : [];
                    return originalField.concat(camelField);
                }
                , [])));
    }

    exportIdent(type: Type) {
        return asQualifiedIdent(type.named);
    }

    exportDec(type: Type, expr: scripter.Stringable) {
        return scripter.exportedConst(this.exportIdent(type), expr);
    }

    fieldsExpr(type: Type, fields: OrderedObj<Stringable>): Stringable {
        return scripter.arrayLiteral(...fields.map((field, name) => scripter.objLiteral(
            scripter.propDec("fieldName", scripter.literal(name)),
            scripter.propDec("type", field),
            scripter.propDec("optional", scripter.literal(type.fields[name].tags.indexOf('optional') !== -1)),
        )).items());
    }

    get TypeStruct() {
        const typeStructExpression = typeStructMapper(this.typeStructHandler);

        return (type: Type, ...args: *) => new TypedOutputBuilder([
            this.exportDec(type, typeStructExpression(...args)),
        ], {
            imports: this.config.typeImports({ codegen: type.named.qualifiedName })(type)
        });
    }

    get Enum() {
        return (type: Type, options: string[]) => new TypedOutputBuilder([
            this.exportDec(type, this.enumConst(options)),
            scripter.invocation("Enum_", this.exportIdent(type)),
            "\n\n"
        ], {
            imports: this.config.typeImports({ codegen: type.named.qualifiedName })(type)
        });
    }

    get Field() {
        return typeStructMapper<scripter.Stringable>(this.typeStructHandler);
    }

    get Struct() {
        return (type: Type, fields: OrderedObj<scripter.Stringable>) => new TypedOutputBuilder([
            this.structClass(type, fields),
            scripter.invocation("Struct_", this.exportIdent(type), this.fieldsExpr(type, fields)),
            "\n\n"
        ], {
            imports: this.config.typeImports({ codegen: type.named.qualifiedName })(type),
        });
    }
}

export class ScaffoldTypeHandler implements MaterialTypeHandler<TypedOutputBuilder> {
    config: GeneratorConfig;

    constructor(config: GeneratorConfig) {
        this.config = config;
    }

    get TypeStruct() {
        return (type: Type) => new TypedOutputBuilder([
            scripter.exportedConst(type.named.typeName, asQualifiedIdent(type.named)),
        ], {
            imports: this.config.codegenReferenceImport({ scaffold: type.named.qualifiedName }, type.named),
        });
    }

    get Enum() {
        return (type: Type) => new TypedOutputBuilder([
            scripter.exportedConst(type.named.typeName, asQualifiedIdent(type.named)),
        ], {
            imports: this.config.codegenReferenceImport({ scaffold: type.named.qualifiedName }, type.named),
        });
    }

    get Struct() {
        return (type: Type) => new TypedOutputBuilder([
            scripter.exportedClass(type.named.typeName, asQualifiedIdent(type.named), []),
        ], {
            imports: this.config.codegenReferenceImport({ scaffold: type.named.qualifiedName }, type.named),
        });
    }
}

export const idolJsOutput = (config: GeneratorConfig) => new SinglePassGeneratorOutput({
    supplemental: new OrderedObj<Conflictable<string>>({
        [config.idolJsPath]:
            new Conflictable([fs.readFileSync(path.resolve(__dirname, '../../lib/idol/__idol__.js'), "UTF-8").toString()]),
    }),
});

const CODEGEN_FILE_COMMENT_HEADER = [
    "DO NO EDIT",
    "This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.",
    "Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there.",
].join("\n");

const SCAFFOLD_FILE_COMMENT_HEADER = [
    "This file was scaffolded by idol_js.js  Please feel free to modify and extend, but do not delete or remove its exports.",
].join("\n");


function runGenerator(params: GeneratorParams, config: GeneratorConfig,
                      codegenTypeHandler: TypeHandler<TypedOutputBuilder, *> = new CodegenTypeHandler(params, config),
                      scaffoldTypeHandler: MaterialTypeHandler<TypedOutputBuilder> = new ScaffoldTypeHandler(config)): SinglePassGeneratorOutput {
    const codegenOutputs = params.allTypes.map(asCodegenOutput(
        asTypedGeneratorOutput(compose(typeMapper(codegenTypeHandler), withCommentHeader(CODEGEN_FILE_COMMENT_HEADER)))));

    const scaffoldOutputs = params.scaffoldTypes.map(asScaffoldOutput(asTypedGeneratorOutput(
        compose(materialTypeMapper(scaffoldTypeHandler, params.allTypes.obj), withCommentHeader(SCAFFOLD_FILE_COMMENT_HEADER))
    )));

    let output = flattenOrderedObj(codegenOutputs, new SinglePassGeneratorOutput());
    output = output.concat(flattenOrderedObj(scaffoldOutputs, new SinglePassGeneratorOutput()));
    output = output.concat(idolJsOutput(config));

    return output;
}

function main() {
    const params = start({
        flags: {},
        args: {
            "target":
                "idol module names whose contents will have extensible types scaffolded.",
            "output":
                "a directory to generate the scaffolds and codegen into.",
        }
    });

    const config = new GeneratorConfig(params);
    config.withPathConfig();

    const pojos = runGenerator(params, config);
    const renderedOutput = render(config, pojos);
    const moveTo = build(config, renderedOutput);
    moveTo(params.outputDir);
}

if (require.main === module) {
    main();
}
