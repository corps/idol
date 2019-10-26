#! /usr/bin/env node
// @flow
import { resolve } from "path";
import * as scripter from "./scripter";
import { start } from "./cli";
import { Reference } from "./js/schema/Reference";
import { Type } from "./js/schema/Type";
import {
  build,
  camelify,
  ExternFileContext,
  GeneratorAcc,
  GeneratorConfig,
  GeneratorFileContext,
  getMaterialTypeDeconstructor,
  getTagValues,
  importExpr,
  includesTag,
  Path,
  ScalarDeconstructor,
  TypeDeconstructor,
  TypeStructDeconstructor
} from "./generators";
import type { Exported, Expression, GeneratorContext } from "./generators";
import { Alt, cachedProperty, OrderedObj } from "./functional";

export class IdolGraphql implements GeneratorContext {
  config: GeneratorConfig;
  state: GeneratorAcc;
  codegenImpl: (IdolGraphql, Path, Type) => IdolGraphqlCodegenFile;
  scaffoldImpl: (IdolGraphql, Path, Type) => IdolGraphqlScaffoldFile;

  constructor(
    config: GeneratorConfig,
    codegenImpl: (IdolGraphql, Path, Type) => IdolGraphqlCodegenFile = (idolJs, path, type) =>
      new IdolGraphqlCodegenFile(idolJs, path, type),
    scaffoldImpl: (IdolGraphql, Path, Type) => IdolGraphqlScaffoldFile = (idolJs, path, type) =>
      new IdolGraphqlScaffoldFile(idolJs, path, type)
  ) {
    this.state = new GeneratorAcc();
    this.config = config;
    this.codegenImpl = codegenImpl;
    this.scaffoldImpl = scaffoldImpl;
  }

  get idolGraphQlFile(): IdolGraphqlFile {
    return cachedProperty(
      this,
      "idolGraphQlFile",
      () =>
        new IdolGraphqlFile(
          this,
          this.state.reservePath({ runtime: this.config.codegenRoot + "/__idol_graphql__.js" })
        )
    );
  }

  codegenFile(ref: Reference): IdolGraphqlCodegenFile {
    const path = this.state.reservePath(this.config.pathsOf({ codegen: ref }));
    const type = this.config.params.allTypes.obj[ref.qualified_name];
    return cachedProperty(this, `codegenFile${path.path}`, () =>
      this.codegenImpl(this, path, type)
    );
  }

  scaffoldFile(ref: Reference): IdolGraphqlScaffoldFile {
    const path = this.state.reservePath(this.config.pathsOf({ scaffold: ref }));
    const type = this.config.params.allTypes.obj[ref.qualified_name];
    return cachedProperty(this, `scaffoldFile${path.path}`, () =>
      this.scaffoldImpl(this, path, type)
    );
  }

  defaultGraphqlTypeName(type: Type): string {
    return type.named.typeName + "Type";
  }

  render(): OrderedObj<string> {
    const scaffoldTypes = this.config.params.scaffoldTypes.values();
    scaffoldTypes.forEach((t, i) => {
      const scaffoldFile = this.scaffoldFile(t.named);
      if (!scaffoldFile.declaredTypeIdent.isEmpty()) {
        console.log(`Generated ${t.named.qualified_name} (${i + 1} / ${scaffoldTypes.length})`);
      } else {
        console.log(`Skipped ${t.named.qualified_name} (${i + 1} / ${scaffoldTypes.length})`);
      }
    });

    return this.state.render({
      codegen:
        "DO NOT EDIT\nThis file was generated by idol_graphql, any changes will be overwritten when idol_graphql is run again.",
      scaffold:
        "This file was scaffolded by idol_graphql.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_graphql."
    });
  }
}

export function exportedFromGraphQL(ident: string): Exported {
  return {
    ident,
    path: new Path("graphql")
  };
}

export class IdolGraphqlCodegenFile extends GeneratorFileContext<IdolGraphql> {
  typeDecon: TypeDeconstructor;

  constructor(idolGraphql: IdolGraphql, path: Path, type: Type) {
    super(idolGraphql, path);
    this.typeDecon = new TypeDeconstructor(type);
    this.reserveIdent(this.defaultTypeName);
    this.reserveIdent(this.defaultEnumName);
    this.reserveIdent(this.defaultFieldsName);
  }

  get type(): Type {
    return this.typeDecon.t;
  }

  get defaultTypeName(): string {
    return this.type.named.asQualifiedIdent + "Type";
  }

  get defaultGraphQLTypeName(): string {
    if (this.type.named.qualifiedName in this.config.params.scaffoldTypes.obj) {
      return this.parent.defaultGraphqlTypeName(this.type);
    }

    return this.defaultTypeName;
  }

  get defaultFieldsName(): string {
    return this.type.named.asQualifiedIdent + "Fields";
  }

  get defaultEnumName(): string {
    return this.type.named.asQualifiedIdent;
  }

  get declaredTypeIdent(): Alt<Exported> {
    return cachedProperty(this, "declaredTypeIdent", () => {
      return this.enum
        .bind(e => e.declaredIdent)
        .either(this.typeStruct.bind(ts => ts.declaredIdent))
        .either(this.struct.bind(struct => struct.declaredIdent));
    });
  }

  get struct(): Alt<IdolJsCodegenStruct> {
    return cachedProperty(this, "struct", () =>
      /*
                        this.typeDecon
                          .getStruct()
                          .map(
                            fields =>
                              new IdolJsCodegenStruct(
                                this,
                                fields.map(tsDecon => new IdolJsCodegenTypeStruct(this.parent, tsDecon))
                              )
                          )
                  */
      Alt.empty()
    );
  }

  get enum(): Alt<IdolGraphqlCodegenEnum> {
    return cachedProperty(this, "enum", () =>
      this.typeDecon.getEnum().map(options => new IdolGraphqlCodegenEnum(this, options))
    );
  }

  get typeStruct(): Alt<IdolJsCodegenTypeStructDeclaration> {
    return cachedProperty(this, "typeStruct", () =>
      /*
                        this.typeDecon
                          .getTypeStruct()
                          .map(tsDecon => new IdolJsCodegenTypeStructDeclaration(this, tsDecon))
                  */
      Alt.empty()
    );
  }
}

export class IdolGraphqlScaffoldFile extends GeneratorFileContext<IdolGraphql> {
  typeDecon: TypeDeconstructor;
  type: Type;

  constructor(idolJs: IdolGraphql, path: Path, type: Type) {
    super(idolJs, path);
    this.typeDecon = getMaterialTypeDeconstructor(idolJs.config.params.allTypes, type);
    this.type = type;
    this.reserveIdent(this.defaultTypeName);
  }

  get defaultTypeName() {
    return this.parent.defaultGraphqlTypeName(this.type);
  }

  get declaredTypeIdent(): Alt<Exported> {
    return cachedProperty(this, "declaredTypeIdent", () => {
      const codegenFile = this.parent.codegenFile(this.type.named);
      return codegenFile.declaredTypeIdent.bind(codegenType =>
        codegenFile.struct
          .map(codegenStruct =>
            scripter.classDec(
              [scripter.methodDec("constructor", ["val"], [scripter.invocation("super", "val")])],
              this.importIdent(codegenType)
            )
          )
          .concat(
            codegenFile.typeStruct.map(tsDecon => scripter.variable(this.importIdent(codegenType)))
          )
          .concat(codegenFile.enum.map(options => scripter.variable(this.importIdent(codegenType))))
          .map(scriptable => this.export(this.defaultTypeName, scriptable))
      );
    });
  }
}

export class IdolJsCodegenStruct extends GeneratorFileContext<IdolGraphql> {
  fields: OrderedObj<IdolJsCodegenTypeStruct>;
  codegenFile: IdolGraphqlCodegenFile;

  constructor(codegenFile: IdolGraphqlCodegenFile, fields: OrderedObj<IdolJsCodegenTypeStruct>) {
    super(codegenFile.parent, codegenFile.path);
    this.fields = fields;
    this.codegenFile = codegenFile;
  }

  scaffoldFile(): Alt<IdolGraphqlScaffoldFile> {
    return Alt.lift(this.codegenFile.type.named)
      .filter(ref => ref.qualified_name in this.config.params.scaffoldTypes.obj)
      .map(ref => this.parent.scaffoldFile(ref));
  }

  get declaredIdent(): Alt<Exported> {
    return cachedProperty(this, "declaredIdent", () => {
      const fieldConstructorIdents: OrderedObj<string> = this.fields
        .mapAndFilter(codegenTypeStruct => codegenTypeStruct.constructorExpr)
        .map(expr => this.applyExpr(expr));

      return Alt.lift(
        this.export(this.codegenFile.defaultTypeName, (ident: string) => [
          scripter.comment(
            getTagValues(this.codegenFile.typeDecon.t.tags, "description").join("\n")
          ),
          scripter.classDec([
            scripter.methodDec(
              "constructor",
              ["val"],
              [scripter.assignment("this._original", "val")]
            ),
            ...this.stubMethods,
            ...fieldConstructorIdents.concatMap<Array<string>>((fieldName, constructor) => {
              const camelFieldName = camelify(fieldName, false);

              const fields = this.gettersAndSettersFor(fieldName, fieldName, constructor);

              return [
                "\n",
                scripter.comment(
                  getTagValues(
                    this.fields.obj[fieldName].tsDecon.context.fieldTags,
                    "description"
                  ).join("\n")
                )
              ].concat(
                fieldName === camelFieldName
                  ? fields
                  : fields.concat(this.gettersAndSettersFor(camelFieldName, fieldName, constructor))
              );
            }, [])
          ])(ident),
          "\n",
          scripter.invocation(
            this.importIdent(this.parent.idolGraphQlFile.struct),
            ident,
            scripter.arrayLiteral(
              ...fieldConstructorIdents.mapIntoIterable((fieldName, constructor) =>
                scripter.objLiteral(
                  scripter.propDec("fieldName", scripter.literal(fieldName)),
                  scripter.propDec("type", constructor),
                  scripter.propDec(
                    "optional",
                    scripter.literal(
                      includesTag(this.fields.obj[fieldName].tsDecon.context.fieldTags, "optional")
                    )
                  )
                )
              )
            )
          )
        ])
      );
    });
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

export class IdolGraphqlCodegenEnum extends GeneratorFileContext<IdolGraphql> {
  options: string[];
  codegenFile: IdolGraphqlCodegenFile;

  constructor(codegenFile: IdolGraphqlCodegenFile, options: string[]) {
    super(codegenFile.parent, codegenFile.path);
    this.codegenFile = codegenFile;
    this.options = options;
  }

  get declaredEnum(): Alt<Exported> {
    return cachedProperty(this, "declaredEnum", () =>
      Alt.lift(
        this.export(this.codegenFile.defaultEnumName, ident => [
          scripter.comment(
            getTagValues(this.codegenFile.typeDecon.t.tags, "description").join("\n")
          ),
          scripter.variable(
            scripter.objLiteral(
              ...this.options.map(option =>
                scripter.propDec(option.toUpperCase(), scripter.literal(option))
              )
            )
          )(ident)
        ])
      )
    );
  }

  get declaredIdent(): Alt<Exported> {
    return cachedProperty(this, "declaredIdent", () =>
      this.declaredEnum.map(declaredEnum =>
        this.export(this.codegenFile.defaultTypeName, ident => [
          scripter.variable(
            "new " +
              scripter.invocation(
                this.importIdent(exportedFromGraphQL("GraphQLEnumType")),
                scripter.objLiteral(
                  scripter.propDec("name", this.codegenFile.defaultGraphQLTypeName),
                  scripter.propDec(
                    "description",
                    getTagValues(this.codegenFile.typeDecon.t.tags, "description").join("\n")
                  ),
                  scripter.propDec(
                    "values",
                    scripter.invocation(
                      this.importIdent(this.codegenFile.parent.idolGraphQlFile.wrapValues),
                      this.importIdent(declaredEnum)
                    )
                  )
                )
              )
          )(ident),
          scripter.invocation(this.importIdent(this.parent.idolGraphQlFile.enum), ident)
        ])
      )
    );
  }
}

export class IdolJsCodegenTypeStruct implements GeneratorContext {
  tsDecon: TypeStructDeconstructor;
  state: GeneratorAcc;
  config: GeneratorConfig;
  idolJS: IdolGraphql;

  constructor(idolJs: IdolGraphql, tsDecon: TypeStructDeconstructor) {
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

  get listConstructorArgs(): { [k: string]: any } {
    return { atleastOne: includesTag(this.tsDecon.context.typeTags, "atleast_one") };
  }

  get mapConstructorArgs(): { [k: string]: any } {
    return {};
  }

  get collectionConstructorExpr(): Alt<Expression> {
    const containerAndArgs: Alt<[Expression, { [k: string]: any }]> = this.tsDecon
      .getMap()
      .map(_ => [importExpr(this.idolJS.idolGraphQlFile.map), this.mapConstructorArgs])
      .either(
        this.tsDecon
          .getRepeated()
          .map(_ => [importExpr(this.idolJS.idolGraphQlFile.list), this.listConstructorArgs])
      );
    return this.innerScalar
      .bind(scalar => scalar.constructorExpr)
      .bind(scalarExpr =>
        containerAndArgs.map(([containerExpr, args]) => (state: GeneratorAcc, path: Path): string =>
          scripter.invocation(
            scripter.propAccess(containerExpr(state, path), "of"),
            scalarExpr(state, path),
            scripter.literal(args)
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
  codegenFile: IdolGraphqlCodegenFile;

  constructor(codegenFile: IdolGraphqlCodegenFile, tsDecon: TypeStructDeconstructor) {
    super(codegenFile.parent, tsDecon);
    this.codegenFile = codegenFile;
  }

  get path(): Path {
    return this.codegenFile.path;
  }

  get export() {
    return GeneratorFileContext.prototype.export;
  }

  get applyExpr() {
    return GeneratorFileContext.prototype.applyExpr;
  }

  get declaredIdent(): Alt<Exported> {
    return cachedProperty(this, "declaredIdent", () =>
      this.constructorExpr.map(expr => {
        return this.export(
          this.codegenFile.defaultTypeName,
          scripter.commented(
            getTagValues(this.tsDecon.context.typeTags, "description").join("\n"),
            scripter.variable(this.applyExpr(expr))
          )
        );
      })
    );
  }
}

export class IdolJsCodegenScalar implements GeneratorContext {
  scalarDecon: ScalarDeconstructor;
  state: GeneratorAcc;
  config: GeneratorConfig;
  idolJs: IdolGraphql;

  constructor(idolJs: IdolGraphql, scalarDecon: ScalarDeconstructor) {
    this.scalarDecon = scalarDecon;
    this.state = idolJs.state;
    this.config = idolJs.config;
    this.idolJs = idolJs;
  }

  get constructorExpr(): Alt<Expression> {
    return this.referenceImportExpr
      .either(this.primConstructorExpr)
      .either(this.literalConstructorExpr);
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
      const primCon = state.importIdent(path, this.idolJs.idolGraphQlFile.primitive);
      return scripter.invocation(scripter.propAccess(primCon, "of"), scripter.literal(prim));
    });
  }

  get literalConstructorExpr(): Alt<Expression> {
    return this.scalarDecon.getLiteral().map(([lit, val]) => (state: GeneratorAcc, path: Path) => {
      const literalCon = state.importIdent(path, this.idolJs.idolGraphQlFile.literal);
      return scripter.invocation(scripter.propAccess(literalCon, "of"), scripter.literal(val));
    });
  }
}

export class IdolGraphqlFile extends ExternFileContext<IdolGraphql> {
  constructor(parent: IdolGraphql, path: Path) {
    super(resolve(__dirname, "../../lib/idol/__idol_graphql_.js"), parent, path);
  }

  get wrapValues(): Exported {
    return this.exportExtern("wrapValues");
  }

  get Anything(): Exported {
    return this.exportExtern("Anything");
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

  const idolJs = new IdolGraphql(config);
  const moveTo = build(config, idolJs.render());
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}
