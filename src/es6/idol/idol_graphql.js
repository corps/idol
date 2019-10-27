#! /usr/bin/env node
// @flow
import { resolve } from "path";
import * as scripter from "./scripter";
import { start } from "./cli";
import { Reference } from "./js/schema/Reference";
import { Type } from "./js/schema/Type";
import {
  build,
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
import { PrimitiveType } from "./js/schema/PrimitiveType";

export class IdolGraphql implements GeneratorContext {
  config: GeneratorConfig;
  state: GeneratorAcc;
  codegenImpl: (IdolGraphql, Path, Type, boolean) => IdolGraphqlCodegenFile;
  scaffoldImpl: (IdolGraphql, Path, Type, boolean) => IdolGraphqlScaffoldFile;

  constructor(
    config: GeneratorConfig,
    codegenImpl: (IdolGraphql, Path, Type, boolean) => IdolGraphqlCodegenFile = (
      idolGraphql,
      path,
      type,
      inputVariant
    ) => new IdolGraphqlCodegenFile(idolGraphql, path, type, inputVariant),
    scaffoldImpl: (IdolGraphql, Path, Type, boolean) => IdolGraphqlScaffoldFile = (
      idolGraphql,
      path,
      type,
      inputVariant
    ) => new IdolGraphqlScaffoldFile(idolGraphql, path, type, inputVariant)
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

  hasInputVariant(t: Type): boolean {
    const tDecon = new TypeDeconstructor(t);
    return (
      !tDecon.getStruct().isEmpty() ||
      tDecon
        .getTypeStruct()
        .map(tsDecon => tsDecon.typeStruct.isAlias)
        .getOr(false)
    );
  }

  codegenFile(ref: Reference, inputVariant: boolean): IdolGraphqlCodegenFile {
    const path = this.state.reservePath(this.config.pathsOf({ codegen: ref }));
    const type = this.config.params.allTypes.obj[ref.qualified_name];

    inputVariant = inputVariant && this.hasInputVariant(type);
    return cachedProperty(this, `codegenFile${inputVariant.toString()}${path.path}`, () =>
      this.codegenImpl(this, path, type, inputVariant)
    );
  }

  scaffoldFile(ref: Reference, inputVariant: boolean): IdolGraphqlScaffoldFile {
    const path = this.state.reservePath(this.config.pathsOf({ scaffold: ref }));
    const type = this.config.params.allTypes.obj[ref.qualified_name];

    inputVariant = inputVariant && this.hasInputVariant(type);
    return cachedProperty(this, `scaffoldFile${inputVariant.toString()}${path.path}`, () =>
      this.scaffoldImpl(this, path, type, inputVariant)
    );
  }

  defaultGraphqlTypeName(type: Type, inputTypeVariant: boolean): string {
    return type.named.typeName + (inputTypeVariant ? "InputType" : "Type");
  }

  render(): OrderedObj<string> {
    const scaffoldTypes = this.config.params.scaffoldTypes.values();
    scaffoldTypes.forEach((t, i) => {
      const scaffoldFile = this.scaffoldFile(t.named, includesTag(t.tags, "input"));
      if (!scaffoldFile.declaredTypeIdent.isEmpty()) {
        console.log(
          `Generated ${scaffoldFile.defaultTypeName} (${i + 1} / ${scaffoldTypes.length})`
        );
      } else {
        console.log(`Skipped ${scaffoldFile.defaultTypeName} (${i + 1} / ${scaffoldTypes.length})`);
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
  inputTypeVariant: boolean;

  constructor(idolGraphql: IdolGraphql, path: Path, type: Type, inputTypeVariant: boolean) {
    super(idolGraphql, path);
    this.typeDecon = new TypeDeconstructor(type);
    this.inputTypeVariant = inputTypeVariant;

    this.reserveIdent(this.defaultTypeName);
    if (!this.typeDecon.getEnum().isEmpty()) {
      this.reserveIdent(this.defaultEnumName);
    }
    if (!this.typeDecon.getStruct().isEmpty()) {
      this.reserveIdent(this.defaultFieldsName);
    }
  }

  get type(): Type {
    return this.typeDecon.t;
  }

  get defaultTypeName(): string {
    return this.type.named.asQualifiedIdent + (this.inputTypeVariant ? "InputType" : "Type");
  }

  get defaultGraphQLTypeName(): string {
    if (this.type.named.qualifiedName in this.config.params.scaffoldTypes.obj) {
      return this.parent.defaultGraphqlTypeName(this.type, this.inputTypeVariant);
    }

    return this.defaultTypeName;
  }

  get defaultFieldsName(): string {
    return this.type.named.asQualifiedIdent + (this.inputTypeVariant ? "InputFields" : "Fields");
  }

  get defaultEnumName(): string {
    return this.type.named.asQualifiedIdent;
  }

  get declaredTypeIdent(): Alt<Exported> {
    return cachedProperty(this, "declaredTypeIdent", () => {
      return this.enum
        .bind(e => e.declaredType)
        .either(this.typeStruct.bind(ts => ts.declaredType))
        .either(this.struct.bind(struct => struct.declaredType));
    });
  }

  get struct(): Alt<IdolGraphqlCodegenStruct> {
    return cachedProperty(this, "struct", () =>
      this.typeDecon
        .getStruct()
        .map(
          fields =>
            new IdolGraphqlCodegenStruct(
              this,
              fields.map(
                tsDecon =>
                  new IdolGraphQLCodegenTypeStruct(this.parent, tsDecon, this.inputTypeVariant)
              )
            )
        )
    );
  }

  get enum(): Alt<IdolGraphqlCodegenEnum> {
    return cachedProperty(this, "enum", () =>
      this.typeDecon.getEnum().map(options => new IdolGraphqlCodegenEnum(this, options))
    );
  }

  get typeStruct(): Alt<IdolGraphqlCodegenTypeStructDeclaration> {
    return cachedProperty(this, "typeStruct", () =>
      this.typeDecon
        .getTypeStruct()
        .map(tsDecon => new IdolGraphqlCodegenTypeStructDeclaration(this, tsDecon))
    );
  }
}

export class IdolGraphqlScaffoldFile extends GeneratorFileContext<IdolGraphql> {
  typeDecon: TypeDeconstructor;
  type: Type;
  inputVariant: boolean;

  constructor(idolGraphql: IdolGraphql, path: Path, type: Type, inputVariant: boolean) {
    super(idolGraphql, path);
    this.typeDecon = getMaterialTypeDeconstructor(idolGraphql.config.params.allTypes, type);
    this.type = type;
    this.inputVariant = inputVariant;

    this.reserveIdent(this.defaultTypeName);
  }

  get defaultTypeName() {
    return this.parent.defaultGraphqlTypeName(this.type, this.inputVariant);
  }

  get declaredTypeIdent(): Alt<Exported> {
    return cachedProperty(this, "declaredTypeIdent", () => {
      const codegenFile = this.parent.codegenFile(this.type.named, this.inputVariant);
      return codegenFile.struct
        .bind(codegenStruct =>
          codegenStruct.declaredFields.map(declaredFields => (ident: string) => [
            scripter.variable(
              "new " +
                scripter.invocation(
                  this.importIdent(
                    exportedFromGraphQL(
                      this.inputVariant ? "GraphQLInputObjectType" : "GraphQLObjectType"
                    )
                  ),
                  scripter.objLiteral(
                    scripter.propDec("name", scripter.literal(this.defaultTypeName)),
                    scripter.propDec(
                      "description",
                      scripter.literal(getTagValues(this.type.tags, "description").join("\n"))
                    ),
                    scripter.propDec(
                      "fields",
                      scripter.objLiteral(scripter.spread(this.importIdent(declaredFields)))
                    )
                  )
                )
            )(ident)
          ])
        )
        .either(
          codegenFile.typeStruct
            .bind(ts => ts.declaredType)
            .concat(codegenFile.enum.bind(e => e.declaredType))
            .map(declaredType => scripter.variable(this.importIdent(declaredType)))
        )
        .map(scriptable => this.export(this.defaultTypeName, scriptable));
    });
  }
}

export class IdolGraphqlCodegenStruct extends GeneratorFileContext<IdolGraphql> {
  fields: OrderedObj<IdolGraphQLCodegenTypeStruct>;
  codegenFile: IdolGraphqlCodegenFile;

  constructor(
    codegenFile: IdolGraphqlCodegenFile,
    fields: OrderedObj<IdolGraphQLCodegenTypeStruct>
  ) {
    super(codegenFile.parent, codegenFile.path);
    this.fields = fields;
    this.codegenFile = codegenFile;
  }

  get declaredFields(): Alt<Exported> {
    return cachedProperty(this, "declaredFields", () => {
      const fieldTypes: OrderedObj<string> = this.fields
        .mapAndFilter(codegenTypeStruct => codegenTypeStruct.typeExpr)
        .map(expr => this.applyExpr(expr));

      return Alt.lift(
        this.export(this.codegenFile.defaultFieldsName, (ident: string) => [
          scripter.comment(
            getTagValues(this.codegenFile.typeDecon.t.tags, "description").join("\n")
          ),
          scripter.variable(
            scripter.objLiteral(
              ...fieldTypes.concatMap(
                (fieldName, fieldType) => [
                  scripter.comment(
                    getTagValues(
                      this.fields.obj[fieldName].tsDecon.context.fieldTags,
                      "description"
                    ).join("\n")
                  ),
                  scripter.propDec(fieldName, fieldType)
                ],
                []
              )
            )
          )(ident)
        ])
      );
    });
  }

  get declaredType(): Alt<Exported> {
    return cachedProperty(this, "declaredType", () => {
      return this.declaredFields.map(declaredFields =>
        this.export(
          this.codegenFile.defaultTypeName,
          scripter.variable(
            "new " +
              scripter.invocation(
                this.importIdent(
                  exportedFromGraphQL(
                    this.codegenFile.inputTypeVariant
                      ? "GraphQLInputObjectType"
                      : "GraphQLObjectType"
                  )
                ),
                scripter.objLiteral(
                  scripter.propDec(
                    "name",
                    scripter.literal(this.codegenFile.defaultGraphQLTypeName)
                  ),
                  scripter.propDec(
                    "description",
                    scripter.literal(
                      getTagValues(this.codegenFile.typeDecon.t.tags, "description").join("\n")
                    )
                  ),
                  scripter.propDec(
                    "fields",
                    scripter.objLiteral(scripter.spread(this.importIdent(declaredFields)))
                  )
                )
              )
          )
        )
      );
    });
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

  get declaredType(): Alt<Exported> {
    return cachedProperty(this, "declaredType", () =>
      this.declaredEnum.map(declaredEnum =>
        this.export(this.codegenFile.defaultTypeName, ident => [
          scripter.variable(
            "new " +
              scripter.invocation(
                this.importIdent(exportedFromGraphQL("GraphQLEnumType")),
                scripter.objLiteral(
                  scripter.propDec(
                    "name",
                    scripter.literal(this.codegenFile.defaultGraphQLTypeName)
                  ),
                  scripter.propDec(
                    "description",
                    scripter.literal(
                      getTagValues(this.codegenFile.typeDecon.t.tags, "description").join("\n")
                    )
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
          )(ident)
        ])
      )
    );
  }
}

export class IdolGraphQLCodegenTypeStruct implements GeneratorContext {
  tsDecon: TypeStructDeconstructor;
  state: GeneratorAcc;
  config: GeneratorConfig;
  idolGraphql: IdolGraphql;
  inputVariant: boolean;

  constructor(idolGraphql: IdolGraphql, tsDecon: TypeStructDeconstructor, inputVariant: boolean) {
    this.tsDecon = tsDecon;
    this.state = idolGraphql.state;
    this.config = idolGraphql.config;
    this.idolGraphql = idolGraphql;
    this.inputVariant = inputVariant;
  }

  get typeExpr(): Alt<Expression> {
    return this.scalarTypeExpr.concat(this.collectionTypeExpr);
  }

  get scalarTypeExpr(): Alt<Expression> {
    if (this.tsDecon.getScalar().isEmpty()) return Alt.empty();
    return this.innerScalar.bind(scalar => scalar.typeExpr);
  }

  get mapTypeExpr(): Alt<Expression> {
    return this.tsDecon.getMap().map(() => importExpr(this.idolGraphql.idolGraphQlFile.Anything));
  }

  get repeatedTypeExpr(): Alt<Expression> {
    return this.tsDecon
      .getRepeated()
      .bind(() => this.innerScalar.bind(innerScalar => innerScalar.typeExpr))
      .map(scalarExpr => (state: GeneratorAcc, path: Path): string =>
        "new " +
        scripter.invocation(
          state.importIdent(path, exportedFromGraphQL("GraphQLList")),
          scalarExpr(state, path)
        )
      );
  }

  get collectionTypeExpr(): Alt<Expression> {
    return this.mapTypeExpr.either(this.repeatedTypeExpr);
  }

  get innerScalar(): Alt<IdolGraphqlCodegenScalar> {
    return cachedProperty(this, "innerScalar", () => {
      return this.tsDecon
        .getScalar()
        .concat(this.tsDecon.getMap())
        .concat(this.tsDecon.getRepeated())
        .map(
          scalarDecon =>
            new IdolGraphqlCodegenScalar(this.idolGraphql, scalarDecon, this.inputVariant)
        );
    });
  }
}

export class IdolGraphqlCodegenTypeStructDeclaration extends IdolGraphQLCodegenTypeStruct {
  codegenFile: IdolGraphqlCodegenFile;

  constructor(codegenFile: IdolGraphqlCodegenFile, tsDecon: TypeStructDeconstructor) {
    super(codegenFile.parent, tsDecon, codegenFile.inputTypeVariant);
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

  get declaredType(): Alt<Exported> {
    return cachedProperty(this, "declaredType", () =>
      this.typeExpr.map(expr => {
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

  get scalarTypeExpr(): Alt<Expression> {
    if (this.tsDecon.getScalar().isEmpty()) return Alt.empty();
    return super.scalarTypeExpr.either(this.literalTypeExpr);
  }

  get literalTypeExpr(): Alt<Expression> {
    return this.tsDecon
      .getScalar()
      .bind(scalar => scalar.getLiteral())
      .map(([_, val]) => (state: GeneratorAcc, path: Path) => {
        return scripter.invocation(
          state.importIdent(path, this.idolGraphql.idolGraphQlFile.LiteralTypeOf),
          scripter.literal(this.codegenFile.defaultTypeName),
          scripter.literal(val),
          scripter.literal(getTagValues(this.tsDecon.context.typeTags, "description").join("\n"))
        );
      });
  }
}

export class IdolGraphqlCodegenScalar implements GeneratorContext {
  scalarDecon: ScalarDeconstructor;
  state: GeneratorAcc;
  config: GeneratorConfig;
  idolGraphql: IdolGraphql;
  inputVariant: boolean;

  constructor(idolGraphql: IdolGraphql, scalarDecon: ScalarDeconstructor, inputVariant: boolean) {
    this.scalarDecon = scalarDecon;
    this.state = idolGraphql.state;
    this.config = idolGraphql.config;
    this.idolGraphql = idolGraphql;
    this.inputVariant = inputVariant;
  }

  get typeExpr(): Alt<Expression> {
    return this.referenceImportExpr.either(this.primTypeExpr);
  }

  get referenceImportExpr(): Alt<Expression> {
    const aliasScaffoldFile = this.scalarDecon
      .getAlias()
      .filter(ref => ref.qualified_name in this.config.params.scaffoldTypes.obj)
      .map(ref => this.idolGraphql.scaffoldFile(ref, this.inputVariant));

    if (aliasScaffoldFile.isEmpty()) {
      const aliasCodegenFile = this.scalarDecon
        .getAlias()
        .map(ref => this.idolGraphql.codegenFile(ref, this.inputVariant));
      return aliasCodegenFile
        .bind(codegenFile => codegenFile.declaredTypeIdent)
        .map(codegenType => importExpr(codegenType, "Codegen" + codegenType.ident));
    }

    return aliasScaffoldFile
      .bind(scaffoldFile => scaffoldFile.declaredTypeIdent)
      .map(scaffoldType => importExpr(scaffoldType, "Scaffold" + scaffoldType.ident));
  }

  get primTypeExpr(): Alt<Expression> {
    return this.scalarDecon.getPrimitive().map(prim => {
      if (prim === PrimitiveType.ANY) {
        return importExpr(this.idolGraphql.idolGraphQlFile.Anything);
      } else if (prim === PrimitiveType.BOOL) {
        return importExpr(exportedFromGraphQL("GraphQLBoolean"));
      } else if (prim === PrimitiveType.DOUBLE) {
        return importExpr(exportedFromGraphQL("GraphQLFloat"));
      } else if (prim === PrimitiveType.INT) {
        return importExpr(exportedFromGraphQL("GraphQLInt"));
      } else if (prim === PrimitiveType.STRING) {
        return importExpr(exportedFromGraphQL("GraphQLString"));
      }

      throw new Error(`Unexpected primitive type ${prim}`);
    });
  }
}

export class IdolGraphqlFile extends ExternFileContext<IdolGraphql> {
  constructor(parent: IdolGraphql, path: Path) {
    super(resolve(__dirname, "../../lib/idol/__idol_graphql__.js"), parent, path);
  }

  get wrapValues(): Exported {
    return this.exportExtern("wrapValues");
  }

  get Anything(): Exported {
    return this.exportExtern("Anything");
  }

  get LiteralTypeOf(): Exported {
    return this.exportExtern("LiteralTypeOf");
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

  const idolGraphql = new IdolGraphql(config);
  const moveTo = build(config, idolGraphql.render());
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}
