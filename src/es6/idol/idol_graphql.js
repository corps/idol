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

export interface ExportedGraphqlType extends Exported {
  graphqlTypeName: string;
}

export interface GraphqlTypeExpression extends Expression {
  (state: GeneratorAcc, path: Path): string;
  graphqlTypeName: string;
}

export interface HasGraphqlTypeName {
  graphqlTypeName: string;
}

export function withGraphqlType(exported: Exported, graphqlTypeName: string): ExportedGraphqlType {
  return ({ ...exported, graphqlTypeName }: any);
}

export function addGraphqlTypeToExpr<T: HasGraphqlTypeName>(
  expr: T => Expression,
  t: T
): GraphqlTypeExpression {
  const wrapped: any = expr(t);
  wrapped.graphqlTypeName = t.graphqlTypeName;
  return wrapped;
}

export function wrapGraphqlExpression(
  graphqlExpr: GraphqlTypeExpression,
  expr: string => Expression,
  wrapType: string => string
): GraphqlTypeExpression {
  const newType = wrapType(graphqlExpr.graphqlTypeName);
  const wrapper: any = (state: GeneratorAcc, path: Path) => {
    return expr(graphqlExpr(state, path))(state, path);
  };

  wrapper.graphqlTypeName = newType;
  return wrapper;
}

export function importGraphqlExpr(
  exported: ExportedGraphqlType,
  asIdent: string | null = null
): GraphqlTypeExpression {
  return addGraphqlTypeToExpr(_ => importExpr(exported, asIdent), exported);
}

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
    if (type.named.qualifiedName in this.config.params.scaffoldTypes.obj) {
      return type.named.typeName + (inputTypeVariant ? "Input" : "");
    }

    return type.named.asQualifiedIdent + (inputTypeVariant ? "Input" : "");
  }

  render(): OrderedObj<string> {
    const scaffoldTypes = this.config.params.scaffoldTypes.values();
    scaffoldTypes.forEach((t, i) => {
      const scaffoldFile = this.scaffoldFile(t.named, false);
      if (!scaffoldFile.declaredTypeIdent.isEmpty()) {
        console.log(
          `Generated ${scaffoldFile.declaredGraphqlTypeName} (${i + 1} / ${scaffoldTypes.length})`
        );
      } else {
        console.log(
          `Skipped ${scaffoldFile.declaredGraphqlTypeName} (${i + 1} / ${scaffoldTypes.length})`
        );
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

export function exportedFromGraphQL(ident: string, graphqlTypeName: string): ExportedGraphqlType {
  return {
    ident,
    path: new Path("graphql"),
    graphqlTypeName
  };
}

export class IdolGraphqlGeneratorFileContext extends GeneratorFileContext<IdolGraphql> {
  exportGraphqlType<T: HasGraphqlTypeName>(
    ident: string,
    scriptable: T => string => string | Array<string>,
    t: T
  ): ExportedGraphqlType {
    return withGraphqlType(this.export(ident, scriptable(t)), t.graphqlTypeName);
  }
}

export class IdolGraphqlCodegenFile extends IdolGraphqlGeneratorFileContext {
  typeDecon: TypeDeconstructor;
  inputTypeVariant: boolean;

  constructor(idolGraphql: IdolGraphql, path: Path, type: Type, inputTypeVariant: boolean) {
    super(idolGraphql, path);
    this.typeDecon = new TypeDeconstructor(type);
    this.inputTypeVariant = inputTypeVariant;

    this.reserveIdent(this.defaultTypeIdentName);
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

  get defaultTypeIdentName(): string {
    return this.newDeclaration.graphqlTypeName + "Type";
  }

  get newDeclaration(): HasGraphqlTypeName {
    return {
      graphqlTypeName: this.parent.defaultGraphqlTypeName(this.type, this.inputTypeVariant)
    };
  }

  get defaultFieldsName(): string {
    return this.type.named.asQualifiedIdent + (this.inputTypeVariant ? "InputFields" : "Fields");
  }

  get defaultEnumName(): string {
    return this.type.named.asQualifiedIdent;
  }

  get declaredTypeIdent(): Alt<ExportedGraphqlType> {
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

export class IdolGraphqlScaffoldFile extends IdolGraphqlGeneratorFileContext {
  typeDecon: TypeDeconstructor;
  type: Type;
  inputVariant: boolean;

  constructor(idolGraphql: IdolGraphql, path: Path, type: Type, inputVariant: boolean) {
    super(idolGraphql, path);
    this.typeDecon = getMaterialTypeDeconstructor(idolGraphql.config.params.allTypes, type);
    this.type = type;
    this.inputVariant = inputVariant;

    this.reserveIdent(this.defaultTypeIdentName);

    // Used exclusively by service objects, and not needed in the input variant form.
    if (!inputVariant) {
      this.reserveIdent(this.defaultQueriesName);
    }
  }

  get defaultTypeIdentName() {
    return this.declaredGraphqlTypeName + "Type";
  }

  get declaredGraphqlTypeName() {
    return this.parent.defaultGraphqlTypeName(this.type, this.inputVariant);
  }

  // Used exclusively by services.
  get defaultQueriesName(): string {
    return this.type.named.typeName + "Queries";
  }

  get struct(): Alt<IdolGraphqlScaffoldStruct> {
    return cachedProperty(this, "struct", () =>
      this.typeDecon
        .getStruct()
        .map(
          fields =>
            new (includesTag(this.type.tags, "service")
              ? IdolGraphqlService
              : IdolGraphqlScaffoldStruct)(
              this,
              fields.map(
                tsDecon => new IdolGraphQLCodegenTypeStruct(this.parent, tsDecon, this.inputVariant)
              )
            )
        )
    );
  }

  get declaredTypeIdent(): Alt<ExportedGraphqlType> {
    return cachedProperty(this, "declaredTypeIdent", () => {
      const codegenFile = this.parent.codegenFile(this.typeDecon.t.named, this.inputVariant);
      return this.struct
        .bind(struct => struct.declaredType)
        .either(
          codegenFile.typeStruct
            .bind(ts => ts.declaredType)
            .either(codegenFile.enum.bind(e => e.declaredType))
            .map(declaredType =>
              this.exportGraphqlType(
                this.defaultTypeIdentName,
                dt => scripter.variable(this.importIdent(dt)),
                declaredType
              )
            )
        );
    });
  }
}

export class IdolGraphqlCodegenStruct extends IdolGraphqlGeneratorFileContext {
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
                  scripter.propDec(
                    fieldName,
                    scripter.objLiteral(
                      scripter.propDec("type", fieldType),
                      scripter.propDec(
                        "description",
                        scripter.literal(
                          getTagValues(
                            this.fields.obj[fieldName].tsDecon.context.fieldTags,
                            "description"
                          ).join("\n")
                        )
                      )
                    )
                  )
                ],
                []
              )
            )
          )(ident)
        ])
      );
    });
  }

  get declaredType(): Alt<ExportedGraphqlType> {
    return cachedProperty(this, "declaredType", () => {
      return this.declaredFields.map(declaredFields =>
        this.exportGraphqlType(
          this.codegenFile.defaultTypeIdentName,
          ({ graphqlTypeName }) =>
            scripter.variable(
              "new " +
                scripter.invocation(
                  this.importIdent(
                    exportedFromGraphQL(
                      this.codegenFile.inputTypeVariant
                        ? "GraphQLInputObjectType"
                        : "GraphQLObjectType",
                      ""
                    )
                  ),
                  scripter.objLiteral(
                    scripter.propDec("name", scripter.literal(graphqlTypeName)),
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
            ),
          this.codegenFile.newDeclaration
        )
      );
    });
  }
}

export class IdolGraphqlCodegenEnum extends IdolGraphqlGeneratorFileContext {
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

  get declaredType(): Alt<ExportedGraphqlType> {
    return cachedProperty(this, "declaredType", () =>
      this.declaredEnum.map(declaredEnum =>
        this.exportGraphqlType(
          this.codegenFile.defaultTypeIdentName,
          ({ graphqlTypeName }) => ident => [
            scripter.variable(
              "new " +
                scripter.invocation(
                  this.importIdent(exportedFromGraphQL("GraphQLEnumType", "")),
                  scripter.objLiteral(
                    scripter.propDec("name", scripter.literal(graphqlTypeName)),
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
          ],
          this.codegenFile.newDeclaration
        )
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

  get typeExpr(): Alt<GraphqlTypeExpression> {
    return this.scalarTypeExpr.concat(this.collectionTypeExpr);
  }

  get scalarTypeExpr(): Alt<GraphqlTypeExpression> {
    if (this.tsDecon.getScalar().isEmpty()) return Alt.empty();
    return this.innerScalar.bind(scalar => scalar.typeExpr);
  }

  get mapTypeExpr(): Alt<GraphqlTypeExpression> {
    return this.tsDecon
      .getMap()
      .map(() => importGraphqlExpr(this.idolGraphql.idolGraphQlFile.Anything));
  }

  get repeatedTypeExpr(): Alt<GraphqlTypeExpression> {
    return this.tsDecon
      .getRepeated()
      .bind(() => this.innerScalar.bind(innerScalar => innerScalar.typeExpr))
      .map(scalarExpr =>
        wrapGraphqlExpression(
          scalarExpr,
          scalarIdent => (state: GeneratorAcc, path: Path): string =>
            "new " +
            scripter.invocation(
              state.importIdent(path, exportedFromGraphQL("GraphQLList", "")),
              scalarIdent
            ),
          type => type + "[]"
        )
      );
  }

  get collectionTypeExpr(): Alt<GraphqlTypeExpression> {
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

  // Eww, this ought to be a mixin or composition rather than subclass.
  get path(): Path {
    return this.codegenFile.path;
  }

  get exportGraphqlType() {
    return IdolGraphqlGeneratorFileContext.prototype.exportGraphqlType;
  }

  get export() {
    return IdolGraphqlGeneratorFileContext.prototype.export;
  }

  get applyExpr() {
    return GeneratorFileContext.prototype.applyExpr;
  }

  get declaredType(): Alt<ExportedGraphqlType> {
    return cachedProperty(this, "declaredType", () =>
      this.typeExpr.map(expr => {
        return this.exportGraphqlType(
          this.codegenFile.defaultTypeIdentName,
          expr =>
            scripter.commented(
              getTagValues(this.tsDecon.context.typeTags, "description").join("\n"),
              scripter.variable(this.applyExpr(expr))
            ),
          expr
        );
      })
    );
  }

  get scalarTypeExpr(): Alt<GraphqlTypeExpression> {
    if (this.tsDecon.getScalar().isEmpty()) return Alt.empty();
    return super.scalarTypeExpr.either(this.literalTypeExpr);
  }

  get literalTypeExpr(): Alt<GraphqlTypeExpression> {
    return this.tsDecon
      .getScalar()
      .bind(scalar => scalar.getLiteral())
      .map(([_, val]) =>
        addGraphqlTypeToExpr(
          ({ graphqlTypeName }) => (state: GeneratorAcc, path: Path) => {
            return scripter.invocation(
              state.importIdent(path, this.idolGraphql.idolGraphQlFile.LiteralTypeOf),
              scripter.literal(graphqlTypeName),
              scripter.literal(val),
              scripter.literal(
                getTagValues(this.tsDecon.context.typeTags, "description").join("\n")
              )
            );
          },
          this.codegenFile.newDeclaration
        )
      );
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

  get typeExpr(): Alt<GraphqlTypeExpression> {
    return this.referenceImportExpr.either(this.primTypeExpr);
  }

  get referenceImportExpr(): Alt<GraphqlTypeExpression> {
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
        .map(codegenType => importGraphqlExpr(codegenType, "Codegen" + codegenType.ident));
    }

    return aliasScaffoldFile
      .bind(scaffoldFile => scaffoldFile.declaredTypeIdent)
      .map(scaffoldType => importGraphqlExpr(scaffoldType, "Scaffold" + scaffoldType.ident));
  }

  get primTypeExpr(): Alt<GraphqlTypeExpression> {
    return this.scalarDecon.getPrimitive().map(prim => {
      if (prim === PrimitiveType.ANY) {
        return importGraphqlExpr(this.idolGraphql.idolGraphQlFile.Anything);
      } else if (prim === PrimitiveType.BOOL) {
        return importGraphqlExpr(exportedFromGraphQL("GraphQLBoolean", "Boolean"));
      } else if (prim === PrimitiveType.DOUBLE) {
        return importGraphqlExpr(exportedFromGraphQL("GraphQLFloat", "Float"));
      } else if (prim === PrimitiveType.INT) {
        return importGraphqlExpr(exportedFromGraphQL("GraphQLInt", "Int"));
      } else if (prim === PrimitiveType.STRING) {
        return importGraphqlExpr(exportedFromGraphQL("GraphQLString", "String"));
      }

      throw new Error(`Unexpected primitive type ${prim}`);
    });
  }
}

export class IdolGraphqlScaffoldStruct extends IdolGraphqlGeneratorFileContext {
  fields: OrderedObj<IdolGraphQLCodegenTypeStruct>;
  codegenFile: IdolGraphqlCodegenFile;
  scaffoldFile: IdolGraphqlScaffoldFile;

  constructor(
    scaffoldFile: IdolGraphqlScaffoldFile,
    fields: OrderedObj<IdolGraphQLCodegenTypeStruct>
  ) {
    super(scaffoldFile.parent, scaffoldFile.path);
    this.fields = fields;
    this.scaffoldFile = scaffoldFile;
    this.codegenFile = this.parent.codegenFile(
      this.scaffoldFile.typeDecon.t.named,
      this.scaffoldFile.inputVariant
    );
  }

  get declaredFields(): Alt<Expression> {
    return this.codegenFile.struct.bind(struct => struct.declaredFields).map(importExpr);
  }

  get declaredType(): Alt<ExportedGraphqlType> {
    return cachedProperty(this, "declaredType", () => {
      return this.declaredFields.map(declaredFields =>
        this.exportGraphqlType(
          this.scaffoldFile.defaultTypeIdentName,
          ({ graphqlTypeName }) =>
            scripter.variable(
              "new " +
                scripter.invocation(
                  this.importIdent(
                    exportedFromGraphQL(
                      this.scaffoldFile.inputVariant
                        ? "GraphQLInputObjectType"
                        : "GraphQLObjectType",
                      ""
                    )
                  ),
                  scripter.objLiteral(
                    scripter.propDec("name", scripter.literal(graphqlTypeName)),
                    scripter.propDec(
                      "description",
                      scripter.literal(
                        getTagValues(this.scaffoldFile.typeDecon.t.tags, "description").join("\n")
                      )
                    ),
                    scripter.propDec(
                      "fields",
                      scripter.objLiteral(scripter.spread(this.applyExpr(declaredFields)))
                    )
                  )
                )
            ),
          this.codegenFile.newDeclaration
        )
      );
    });
  }
}

export class IdolGraphqlService extends IdolGraphqlScaffoldStruct {
  fields: OrderedObj<IdolGraphQLCodegenTypeStruct>;
  codegenFile: IdolGraphqlCodegenFile;

  get declaredFields(): Alt<Expression> {
    return cachedProperty(this, "declaredFields", () => {
      const methods: OrderedObj<string> = this.fields
        .mapAndFilter(codegenTypeStruct =>
          codegenTypeStruct.tsDecon
            .getScalar()
            .bind(scalar => scalar.getAlias())
            .map(ref =>
              getMaterialTypeDeconstructor(
                this.config.params.allTypes,
                this.config.params.allTypes.obj[ref.qualified_name]
              )
            )
            .bind(tDecon => new IdolGraphqlMethod(this.parent, tDecon).methodExpr)
        )
        .map(expr => this.applyExpr(expr));

      return Alt.lift(
        this.export(this.scaffoldFile.defaultQueriesName, (ident: string) => [
          scripter.comment(getTagValues(this.scaffoldFile.type.tags, "description").join("\n")),
          scripter.variable(
            scripter.objLiteral(
              ...methods.concatMap((fieldName, method) => [scripter.propDec(fieldName, method)], [])
            )
          )(ident)
        ])
      ).map(importExpr);
    });
  }
}

export class IdolGraphqlMethod implements GeneratorContext {
  tDecon: TypeDeconstructor;
  state: GeneratorAcc;
  config: GeneratorConfig;
  idolGraphql: IdolGraphql;

  constructor(idolGraphql: IdolGraphql, tDecon: TypeDeconstructor) {
    this.tDecon = tDecon;
    this.state = idolGraphql.state;
    this.config = idolGraphql.config;
    this.idolGraphql = idolGraphql;
  }

  get methodExpr(): Alt<Expression> {
    return this.tDecon.getStruct().bind(fields => {
      const outputTypeExpr: Alt<GraphqlTypeExpression> = fields
        .get("output")
        .bind(
          outputTs => new IdolGraphQLCodegenTypeStruct(this.idolGraphql, outputTs, false).typeExpr
        );
      const inputFields: Alt<Exported> = fields
        .get("input")
        .bind(inputTs => inputTs.getScalar().bind(scalar => scalar.getAlias()))
        .bind(ref => {
          const materialType = getMaterialTypeDeconstructor(
            this.config.params.allTypes,
            this.config.params.allTypes.obj[ref.qualified_name]
          );
          return this.idolGraphql
            .codegenFile(materialType.t.named, true)
            .struct.bind(struct => struct.declaredFields);
        });

      if (outputTypeExpr.isEmpty() || inputFields.isEmpty()) {
        throw new Error("GraphQL methods required input and output fields.");
      }

      return outputTypeExpr.bind(output =>
        inputFields.map(inputFields => (state: GeneratorAcc, path: Path) =>
          scripter.objLiteral(
            scripter.propDec("type", output(state, path)),
            scripter.propDec(
              "resolve",
              scripter.arrowFunc(["root", "args", "context"], scripter.literal(null))
            ),
            scripter.propDec(
              "args",
              scripter.objLiteral(scripter.spread(state.importIdent(path, inputFields)))
            ),
            scripter.propDec(
              "description",
              scripter.literal(getTagValues(this.tDecon.t.tags, "description").join("\n"))
            )
          )
        )
      );
    });
  }
}

export class IdolGraphqlFile extends ExternFileContext<IdolGraphql> {
  constructor(parent: IdolGraphql, path: Path) {
    super(resolve(__dirname, "__idol_graphql__.js"), parent, path);
  }

  get wrapValues(): Exported {
    return this.exportExtern("wrapValues");
  }

  get Anything(): ExportedGraphqlType {
    return withGraphqlType(this.exportExtern("Anything"), "IdolGraphQLAnything");
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
