// @flow
import fs from "fs";
import path from "path";
import * as scripter from "./scripter";
import { start } from "./cli";
import { Reference } from "./schema/Reference";
import { Type } from "./schema/Type";
import {
    build,
    camelify,
    GeneratorAcc,
    GeneratorConfig,
    GeneratorFileContext,
    importExpr,
    Path,
    ScalarDeconstructor,
    TypeDeconstructor,
    TypeStructDeconstructor
} from "./generators";
import type { Exported, Expression, GeneratorContext } from "./generators";
import { Alt, cachedProperty, OrderedObj } from "./functional";

export class IdolJs implements GeneratorContext {
    config: GeneratorConfig;
    state: GeneratorAcc;
    codegenImpl: (IdolJs, Path, Type) => IdolJsCodegenFile;
    scaffoldImpl: (IdolJs, Path, Type) => IdolJsScaffoldFile;

    constructor(
        config: GeneratorConfig,
        codegenImpl: (IdolJs, Path, Type) => IdolJsCodegenFile = (idolJs, path, type) =>
            new IdolJsCodegenFile(idolJs, path, type),
        scaffoldImpl: (IdolJs, Path, Type) => IdolJsScaffoldFile = (idolJs, path, type) =>
            new IdolJsScaffoldFile(idolJs, path, type)
    ) {
        this.state = new GeneratorAcc();
        this.config = config;
        this.codegenImpl = codegenImpl;
        this.scaffoldImpl = scaffoldImpl;
    }

    get idolJsFile(): IdolJsFile {
        return cachedProperty(
            this,
            "idolJsFile",
            () =>
                new IdolJsFile(
                    this,
                    this.state.reservePath({ runtime: this.config.codegenRoot + "/__idol__.js" })
                )
        );
    }

    codegenFile(ref: Reference): IdolJsCodegenFile {
        const path = this.state.reservePath(this.config.pathsOf({ codegen: ref }));
        const type = this.config.params.allTypes.obj[ref.qualified_name];
        return cachedProperty(this, `codegenFile${path.path}`, () =>
            this.codegenImpl(this, path, type)
        );
    }

    scaffoldFile(ref: Reference): IdolJsScaffoldFile {
        const path = this.state.reservePath(this.config.pathsOf({ codegen: ref }));
        const type = this.config.params.allTypes.obj[ref.qualified_name];
        return cachedProperty(this, `scaffoldFile${path.path}`, () =>
            this.scaffoldImpl(this, path, type)
        );
    }

    render(): OrderedObj<string> {
        const scaffoldTypes = this.config.params.scaffoldTypes.values();
        scaffoldTypes.forEach((t, i) => {
            const scaffoldFile = this.scaffoldFile(t.named);
            if (!scaffoldFile.declaredTypeIdent.isEmpty()) {
                console.log(`Rendered ${t.named.qualified_name} (${i} / ${scaffoldTypes.length})`);
            } else {
                console.log(`Skipped ${t.named.qualified_name} (${i} / ${scaffoldTypes.length})`);
            }
        });

        return this.state.render({
            codegen: "DO NOT EDIT\nThis file was generated by idol_js, any changes will be overwritten when idol_js is run again.",
            scaffold: "This file was scaffolded by idol_js.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_js."
        });
    }
}

export class IdolJsCodegenFile extends GeneratorFileContext<IdolJs> {
    typeDecon: TypeDeconstructor;

    constructor(idolJs: IdolJs, path: Path, type: Type) {
        super(idolJs, path);
        this.typeDecon = new TypeDeconstructor(type);
    }

    get type(): Type {
        return this.typeDecon.t;
    }

    get defaultTypeName(): string {
        return this.type.named.asQualifiedIdent;
    }

    get declaredTypeIdent(): Alt<Exported> {
        return cachedProperty(this, "declaredTypeIdent", () => {
            return this.enum
                .bind(e => e.declaredIdent)
                .asDisjoint()
                .concat(this.typeStruct.bind(ts => ts.declaredIdent).asDisjoint())
                .concat(this.struct.bind(struct => struct.declaredIdent).asDisjoint())
                .asAlt();
        });
    }

    get struct(): Alt<IdolJsCodegenStruct> {
        return cachedProperty(this, "struct", () =>
            this.typeDecon
                .getStruct()
                .map(
                    fields =>
                        new IdolJsCodegenStruct(
                            this,
                            fields.map(tsDecon => new IdolJsCodegenTypeStruct(this.parent, tsDecon))
                        )
                )
        );
    }

    get enum(): Alt<IdolJsCodegenEnum> {
        return cachedProperty(this, "enum", () =>
            this.typeDecon.getEnum().map(options => new IdolJsCodegenEnum(this, options))
        );
    }

    get typeStruct(): Alt<IdolJsCodegenTypeStructDeclaration> {
        return cachedProperty(this, "typeStruct", () =>
            this.typeDecon
                .getTypeStruct()
                .map(tsDecon => new IdolJsCodegenTypeStructDeclaration(this, tsDecon))
        );
    }
}

export class IdolJsScaffoldFile extends GeneratorFileContext<IdolJs> {
    typeDecon: TypeDeconstructor;

    constructor(idolJs: IdolJs, path: Path, type: Type) {
        super(idolJs, path);
        this.typeDecon = new TypeDeconstructor(type);
    }

    get type(): Type {
        return this.typeDecon.t;
    }

    get defaultTypeName(): string {
        return this.type.named.typeName;
    }

    get declaredTypeIdent(): Alt<Exported> {
        const codegenFile = this.parent.codegenFile(this.type.named);
        return codegenFile.declaredTypeIdent.bind(codegenType =>
            codegenFile.struct
                .map(codegenStruct =>
                    scripter.classDec(
                        [scripter.methodDec("constructor", ["val"], [scripter.invocation("super", "val")])],
                        this.state.importIdent(this.path, codegenType)
                    )
                )
                .concat(
                    codegenFile.typeStruct.map(tsDecon =>
                        scripter.variable(this.state.importIdent(this.path, codegenType))
                    )
                )
                .concat(
                    codegenFile.enum.map(options =>
                        scripter.variable(this.state.importIdent(this.path, codegenType))
                    )
                )
                .map(scriptable => ({ ident: this.state.addContentWithIdent(this.path, this.defaultTypeName, scriptable), path: this.path }))
        );
    }
}

export class IdolJsCodegenStruct extends GeneratorFileContext<IdolJs> {
    fields: OrderedObj<IdolJsCodegenTypeStruct>;
    codegenFile: IdolJsCodegenFile;

    constructor(codegenFile: IdolJsCodegenFile, fields: OrderedObj<IdolJsCodegenTypeStruct>) {
        super(codegenFile.parent, codegenFile.path);
        this.fields = fields;
    }

    get declaredIdent(): Alt<Exported> {
        return cachedProperty(this, "declaredIdent", () =>
            Alt.lift({
                path: this.path,
                ident: this.state.addContentWithIdent(
                    this.path,
                    this.codegenFile.defaultTypeName,
                    scripter.classDec([
                        scripter.methodDec(
                            "constructor",
                            ["val"],
                            [scripter.assignment("this._original", "val")]
                        ),
                        ...this.stubMethods,
                        ...this.fields.keys().reduce((lines, fieldName) => {
                            const field = this.fields.obj[fieldName];
                            const camelFieldName = camelify(fieldName);

                            return lines.concat(
                                field.constructorExpr
                                    .map(constructor =>
                                        this.gettersAndSettersFor(
                                            fieldName,
                                            fieldName,
                                            constructor(this.state, this.path)
                                        ).concat(
                                            this.gettersAndSettersFor(
                                                camelFieldName,
                                                fieldName,
                                                constructor(this.state, this.path)
                                            )
                                        )
                                    )
                                    .getOr([])
                            );
                        }, [])
                    ])
                )
            })
        );
    }

    get stubMethods(): string[] {
        return [
            scripter.comment(
                "These methods are implemented via the runtime, stubs exist here for reference."
            ),
            scripter.methodDec("validate", ["val"], [], true),
            scripter.methodDec("isValid", ["val"], [scripter.ret(scripter.literal(true))], true),
            scripter.methodDec("expand", ["val"], [scripter.ret("val")], true),
            scripter.methodDec("unwrap", ["val"], [scripter.ret("val")], true),
            scripter.methodDec("wrap", ["val"], [scripter.ret("null")], true)
        ];
    }

    gettersAndSettersFor(propName: string, fieldName: string, constructor: string): string[] {
        return [
            scripter.getProp(propName, [
                propName !== fieldName
                    ? scripter.ret(scripter.propAccess("this", fieldName))
                    : scripter.ret(
                    scripter.invocation(
                        scripter.propAccess(constructor, "wrap"),
                        scripter.propExpr("this._original", scripter.literal(fieldName))
                    )
                    )
            ]),
            scripter.setProp(propName, "val", [
                propName !== fieldName
                    ? scripter.assignment(scripter.propAccess("this", fieldName), "val")
                    : scripter.assignment(
                    scripter.propExpr("this._original", scripter.literal(fieldName)),
                    scripter.invocation(scripter.propAccess(constructor, "unwrap"), "val")
                    )
            ])
        ];
    }
}

export class IdolJsCodegenEnum extends GeneratorFileContext<IdolJs> {
    options: string[];
    codegenFile: IdolJsCodegenFile;

    constructor(codegenFile: IdolJsCodegenFile, options: string[]) {
        super(codegenFile.parent, codegenFile.path);
        this.codegenFile = codegenFile;
    }

    get declaredIdent(): Alt<Exported> {
        return cachedProperty(this, "declaredIdent", () =>
            Alt.lift({
                path: this.path,
                ident: this.state.addContentWithIdent(
                    this.path,
                    this.codegenFile.defaultTypeName,
                    ident => [
                        scripter.variable(
                            scripter.objLiteral(
                                ...this.options.map(option =>
                                    scripter.propDec(option.toUpperCase(), scripter.literal(option))
                                ),
                                "\n",
                                scripter.propDec("options", scripter.literal(this.options)),
                                scripter.propDec("default", scripter.literal(this.options[0])),
                                "\n",
                                scripter.methodDec("validate", ["val"], []),
                                scripter.methodDec("isValid", ["val"], [scripter.ret("true")]),
                                scripter.methodDec("expand", ["val"], [scripter.ret("val")]),
                                scripter.methodDec("expand", ["wrap"], [scripter.ret("val")]),
                                scripter.methodDec("expand", ["unwrap"], [scripter.ret("val")])
                            )
                        )(ident),
                        scripter.invocation(this.state.importIdent(this.path, this.parent.idolJsFile.enum), ident)
                    ]
                )
            })
        );
    }
}

export class IdolJsCodegenTypeStruct implements GeneratorContext {
    tsDecon: TypeStructDeconstructor;
    state: GeneratorAcc;
    config: GeneratorConfig;
    idolJS: IdolJs;

    constructor(idolJs: IdolJs, tsDecon: TypeStructDeconstructor) {
        this.tsDecon = tsDecon;
        this.state = idolJs.state;
        this.config = idolJs.config;
        this.idolJS = idolJs;
    }

    get constructorExpr(): Alt<Expression> {
        return this.scalarConstructorExpr.concat(this.collectionConstructorExpr);
    }

    get scalarConstructorExpr(): Alt<Expression> {
        if (this.tsDecon.getScalar().isEmpty()) return Alt.empty();
        return this.innerScalar.bind(scalar => scalar.constructorExpr);
    }

    get collectionConstructorExpr(): Alt<Expression> {
        const containerConstructorExpr: Alt<Expression> = this.tsDecon
            .getMap()
            .map(_ => importExpr(this.idolJS.idolJsFile.map))
            .concat(this.tsDecon.getRepeated().map(_ => importExpr(this.idolJS.idolJsFile.list)));
        return this.innerScalar
            .bind(scalar => scalar.constructorExpr)
            .bind(scalarExpr =>
                containerConstructorExpr.map(containerExpr => (state: GeneratorAcc, path: Path): string =>
                    scripter.invocation(
                        scripter.propAccess(containerExpr(state, path), "of"),
                        scalarExpr(state, path)
                    )
                )
            );
    }

    get innerScalar(): Alt<IdolJsCodegenScalar> {
        return cachedProperty(this, "innerScalar", () => {
            return this.tsDecon
                .getScalar()
                .concat(this.tsDecon.getMap())
                .concat(this.tsDecon.getRepeated())
                .map(scalarDecon => new IdolJsCodegenScalar(this.idolJS, scalarDecon));
        });
    }
}

export class IdolJsCodegenTypeStructDeclaration extends IdolJsCodegenTypeStruct {
    codegenFile: IdolJsCodegenFile;

    constructor(codegenFile: IdolJsCodegenFile, tsDecon: TypeStructDeconstructor) {
        super(codegenFile.parent, tsDecon);
        this.codegenFile = codegenFile;
    }

    get path(): Path {
        return this.codegenFile.path;
    }

    get declaredIdent(): Alt<Exported> {
        return cachedProperty(this, "declaredIdent", () =>
            this.constructorExpr.map(expr => {
                return {
                    path: this.path,
                    ident: this.state.addContentWithIdent(
                        this.path,
                        this.codegenFile.defaultTypeName,
                        scripter.variable(expr(this.state, this.path))
                    )
                };
            })
        );
    }
}

export class IdolJsCodegenScalar implements GeneratorContext {
    scalarDecon: ScalarDeconstructor;
    state: GeneratorAcc;
    config: GeneratorConfig;
    idolJs: IdolJs;

    constructor(idolJs: IdolJs, scalarDecon: ScalarDeconstructor) {
        this.scalarDecon = scalarDecon;
        this.state = idolJs.state;
        this.config = idolJs.config;
        this.idolJs = idolJs;
    }

    get constructorExpr(): Alt<Expression> {
        return this.referenceImportExpr
            .asDisjoint()
            .concat(this.primConstructorExpr.asDisjoint())
            .concat(this.literalConstructorExpr.asDisjoint())
            .asAlt();
    }

    get referenceImportExpr(): Alt<Expression> {
        const aliasScaffoldFile = this.scalarDecon
            .getAlias()
            .filter(ref => ref.qualified_name in this.config.params.scaffoldTypes.obj)
            .map(ref => this.idolJs.scaffoldFile(ref));

        if (aliasScaffoldFile.isEmpty()) {
            const aliasCodegenFile = this.scalarDecon.getAlias().map(ref => this.idolJs.codegenFile(ref));
            return aliasCodegenFile
                .bind(codegenFile => codegenFile.declaredTypeIdent)
                .map(codegenType => importExpr(codegenType, "Codegen" + codegenType.ident));
        }

        return aliasScaffoldFile
            .bind(scaffoldFile => scaffoldFile.declaredTypeIdent)
            .map(scaffoldType => importExpr(scaffoldType, "Scaffold" + scaffoldType.ident));
    }

    get primConstructorExpr(): Alt<Expression> {
        return this.scalarDecon.getPrimitive().map(prim => (state: GeneratorAcc, path: Path) => {
            const primCon = state.importIdent(path, this.idolJs.idolJsFile.primitive);
            return scripter.invocation(scripter.propAccess(primCon, "of"), scripter.literal(prim));
        });
    }

    get literalConstructorExpr(): Alt<Expression> {
        return this.scalarDecon.getLiteral().map(([lit, val]) => (state: GeneratorAcc, path: Path) => {
            const literalCon = state.importIdent(path, this.idolJs.idolJsFile.literal);
            return scripter.invocation(scripter.propAccess(literalCon, "of"), scripter.literal(val));
        });
    }
}

export class IdolJsFile extends GeneratorFileContext<IdolJs> {
    get dumpedFile(): Path {
        return cachedProperty(this, "dumpedFile", () => {
            const content = fs
                .readFileSync(path.resolve(__dirname, "../../lib/idol/__idol__.js"), "UTF-8")
                .toString();
            this.state.addContent(this.path, content);
            return this.path;
        });
    }

    get literal(): Exported {
        return cachedProperty(this, "literal", () => {
            return { path: this.dumpedFile, ident: "Literal" };
        });
    }

    get primitive(): Exported {
        return cachedProperty(this, "primitive", () => {
            return { path: this.dumpedFile, ident: "Primitive" };
        });
    }

    get list(): Exported {
        return cachedProperty(this, "list", () => {
            return { path: this.dumpedFile, ident: "List" };
        });
    }

    get map(): Exported {
        return cachedProperty(this, "map", () => {
            return { path: this.dumpedFile, ident: "Map" };
        });
    }

    get enum(): Exported {
        return cachedProperty(this, "enum", () => {
            return { path: this.dumpedFile, ident: "Enum" };
        });
    }

    get struct(): Exported {
        return cachedProperty(this, "struct", () => {
            return { path: this.dumpedFile, ident: "Struct" };
        });
    }
}

function main() {
    const params = start({
        flags: {},
        args: {
            target: "idol module names whose contents will have extensible types scaffolded.",
            output: "a directory to generate the scaffolds and codegen into."
        }
    });

    const config = new GeneratorConfig(params);
    config.withPathMappings({
        codegen: config.inCodegenDir(GeneratorConfig.oneFilePerType),
        scaffold: GeneratorConfig.oneFilePerType
    });

    const idolJs = new IdolJs(config);
    const moveTo = build(config, idolJs.render());
    moveTo(params.outputDir);
}

if (require.main === module) {
    main();
}
