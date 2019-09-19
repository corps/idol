// @flow
import fs from "fs";
import path from "path";
import * as scripter from "./scripter";
import { start } from "./cli";
import { Reference } from "./schema/Reference";
import { Type } from "./schema/Type";
import {
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
import { Alt, cachedProperty, Disjoint, OrderedObj } from "./functional";
import { TypeStruct } from "./schema/TypeStruct";

/*
export class GeneratorConfig extends BaseGeneratorConfig {
  idolJsPath: string;

  constructor(params: GeneratorParams) {
    super(params);
    this.idolJsPath = this.codegenRoot + "/__idol__.js";
  }

  idolJsImports(module: OutputTypeSpecifier<>, ...imports: string[]): OrderedObj<StringSet> {
    const path = this.resolvePath(module, { supplemental: this.idolJsPath });

    return new OrderedObj<StringSet>({
      [path]: new StringSet(imports.map(i => `${i} as ${i}_`))
    });
  }

  codegenReferenceImport(from: OutputTypeSpecifier<>, reference: Reference): OrderedObj<StringSet> {
    return new OrderedObj<StringSet>({
      [this.resolvePath(from, { codegen: reference.qualifiedName })]: new StringSet([
        asQualifiedIdent(reference)
      ])
    });
  }

  scaffoldReferenceImport(
    from: OutputTypeSpecifier<>,
    reference: Reference
  ): OrderedObj<StringSet> {
    return new OrderedObj<StringSet>({
      [this.resolvePath(from, { scaffold: reference.qualifiedName })]: new StringSet([
        `${reference.typeName} as ${asQualifiedIdent(reference)}`
      ])
    });
  }

  scalarImports(module: OutputTypeSpecifier<>): ScalarMapper<OrderedObj<StringSet>> {
    return scalarMapper<OrderedObj<StringSet>>({
      Literal: () => this.idolJsImports(module, "Literal"),
      Primitive: () => this.idolJsImports(module, "Primitive"),
      Alias: reference => {
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
      Repeated: (scalarImports: OrderedObj<StringSet>) =>
        scalarImports.concat(this.idolJsImports(module, "List")),
      Map: scalarImports => scalarImports.concat(this.idolJsImports(module, "Map"))
    });
  }

  typeImports(module: OutputTypeSpecifier<>): TypeMapper<OrderedObj<StringSet>> {
    const typeStructImportMapper = this.typeStructImports(module);
    return typeMapper<OrderedObj<StringSet>, OrderedObj<StringSet>>({
      Field: typeStructImportMapper,
      TypeStruct: (type, ...args) => typeStructImportMapper(...args),
      Enum: (...args) => this.idolJsImports(module, "Enum"),
      Struct: (type: Type, fieldImports: OrderedObj<OrderedObj<StringSet>>) =>
        this.idolJsImports(module, "Struct").concat(
          flattenOrderedObj(fieldImports, new OrderedObj())
        )
    });
  }
}

export class CodegenScalarExpressionHandler implements ScalarHandler<scripter.Stringable> {
  get Literal() {
    return (primitiveType: string, val: any) =>
      scripter.invocation("Literal_.of", scripter.literal(val));
  }

  get Primitive() {
    return (primitiveType: string) =>
      scripter.invocation("Primitive_.of", scripter.literal(primitiveType));
  }

  get Alias() {
    return (reference: Reference) => asQualifiedIdent(reference);
  }
}

export class CodegenTypeStructExpressionHandler implements TypeStructHandler<scripter.Stringable> {
  scalarHandler: ScalarHandler<scripter.Stringable>;

  constructor(
    scalarHandler: ScalarHandler<scripter.Stringable> = new CodegenScalarExpressionHandler()
  ) {
    this.scalarHandler = scalarHandler;
  }

  get Scalar() {
    return scalarMapper<scripter.Stringable>(this.scalarHandler);
  }

  get Repeated() {
    return (scalar: scripter.Stringable, tags?: Tags = {}) =>
      scripter.invocation(
        "List_.of",
        scalar,
        scripter.objLiteral(
          scripter.propDec(
            "atleastOne",
            scripter.literal(!!tags.typeTags && tags.typeTags.indexOf("atleast_one") !== -1)
          )
        )
      );
  }

  get Map() {
    return (scalar: scripter.Stringable) => scripter.invocation("Map_.of", scalar);
  }
}

export class CodegenTypeHandler implements TypeHandler<TypedOutputBuilder, scripter.Stringable> {
  params: GeneratorParams;
  config: GeneratorConfig;
  typeStructHandler: TypeStructHandler<scripter.Stringable>;

  constructor(
    params: GeneratorParams,
    config: GeneratorConfig,
    typeStructHandler: TypeStructHandler<scripter.Stringable> = new CodegenTypeStructExpressionHandler()
  ) {
    this.params = params;
    this.config = config;
    this.typeStructHandler = typeStructHandler;
  }

  enumConst(options: string[]): scripter.Stringable {
    const values = options.map(o => scripter.propDec(o.toUpperCase(), scripter.literal(o)));
    return scripter.objLiteral(
      ...values,
      "\n\n",
      scripter.propDec("options", scripter.literal(options)),
      scripter.propDec("default", scripter.literal(options[0])),
      "\n\n",
      scripter.methodDec("validate", ["val"], []),
      scripter.methodDec("isValid", ["val"], [scripter.ret("true")]),
      scripter.methodDec("expand", ["val"], [scripter.ret("val")]),
      scripter.methodDec("wrap", ["val"], [scripter.ret("val")]),
      scripter.methodDec("unwrap", ["val"], [scripter.ret("val")])
    );
  }

  gettersAndSettersFor(
    propName: string,
    fieldName: string,
    field: scripter.Stringable
  ): scripter.Stringable[] {
    return [
      scripter.getProp(
        propName,
        [],
        [
          propName !== fieldName
            ? scripter.ret(scripter.propAccess("this", fieldName))
            : scripter.ret(
                scripter.invocation(
                  scripter.propAccess(field, "wrap"),
                  scripter.propLiteralAccess("this._original", fieldName)
                )
              )
        ]
      ),
      scripter.setProp(
        propName,
        ["val"],
        [
          propName !== fieldName
            ? scripter.assignment(scripter.propAccess("this", fieldName), "val")
            : scripter.assignment(
                scripter.propLiteralAccess("this._original", fieldName),
                scripter.invocation(scripter.propAccess(field, "unwrap"), "val")
              )
        ]
      )
    ];
  }

  structClass(type: Type, fields: OrderedObj<scripter.Stringable>) {
  }

  exportIdent(type: Type) {
    return asQualifiedIdent(type.named);
  }

  exportDec(type: Type, expr: scripter.Stringable) {
    return scripter.exportedConst(this.exportIdent(type), expr);
  }

  fieldsExpr(type: Type, fields: OrderedObj<Stringable>): Stringable {
    return scripter.arrayLiteral(
      ...fields
        .map((field, name) =>
          scripter.objLiteral(
            scripter.propDec("fieldName", scripter.literal(name)),
            scripter.propDec("type", field),
            scripter.propDec(
              "optional",
              scripter.literal(type.fields[name].tags.indexOf("optional") !== -1)
            )
          )
        )
        .items()
    );
  }

  get TypeStruct() {
    const typeStructExpression = typeStructMapper(this.typeStructHandler);

    return (type: Type, ...args: *) =>
      new TypedOutputBuilder([this.exportDec(type, typeStructExpression(...args))], {
        imports: this.config.typeImports({ codegen: type.named.qualifiedName })(type)
      });
  }

  get Enum() {
    return (type: Type, options: string[]) =>
      new TypedOutputBuilder(
        [
          this.exportDec(type, this.enumConst(options)),
          scripter.invocation("Enum_", this.exportIdent(type)),
          "\n\n"
        ],
        {
          imports: this.config.typeImports({ codegen: type.named.qualifiedName })(type)
        }
      );
  }

  get Field() {
    return typeStructMapper<scripter.Stringable>(this.typeStructHandler);
  }

  get Struct() {
    return (type: Type, fields: OrderedObj<scripter.Stringable>) =>
      new TypedOutputBuilder(
        [
          this.structClass(type, fields),
          scripter.invocation("Struct_", this.exportIdent(type), this.fieldsExpr(type, fields)),
          "\n\n"
        ],
        {
          imports: this.config.typeImports({ codegen: type.named.qualifiedName })(type)
        }
      );
  }
}

export class ScaffoldTypeHandler implements MaterialTypeHandler<TypedOutputBuilder> {
  config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
  }

  get TypeStruct() {
    return (type: Type) =>
      new TypedOutputBuilder(
        [scripter.exportedConst(type.named.typeName, asQualifiedIdent(type.named))],
        {
          imports: this.config.codegenReferenceImport(
            { scaffold: type.named.qualifiedName },
            type.named
          )
        }
      );
  }

  get Enum() {
    return (type: Type) =>
      new TypedOutputBuilder(
        [scripter.exportedConst(type.named.typeName, asQualifiedIdent(type.named))],
        {
          imports: this.config.codegenReferenceImport(
            { scaffold: type.named.qualifiedName },
            type.named
          )
        }
      );
  }

  get Struct() {
    return (type: Type) =>
      new TypedOutputBuilder(
        [scripter.exportedClass(type.named.typeName, asQualifiedIdent(type.named), [])],
        {
          imports: this.config.codegenReferenceImport(
            { scaffold: type.named.qualifiedName },
            type.named
          )
        }
      );
  }
}

export const idolJsOutput = (config: GeneratorConfig) =>
  new SinglePassGeneratorOutput({
    supplemental: new OrderedObj<Conflictable<string>>({
      [config.idolJsPath]: new Conflictable([
        fs.readFileSync(path.resolve(__dirname, "../../lib/idol/__idol__.js"), "UTF-8").toString()
      ])
    })
  });

const CODEGEN_FILE_COMMENT_HEADER = [
  "DO NO EDIT",
  "This file is managed by idol_js.js.  Any edits will be overwritten on next run of the generator.",
  "Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there."
].join("\n");

const SCAFFOLD_FILE_COMMENT_HEADER = [
  "This file was scaffolded by idol_js.js  Please feel free to modify and extend, but do not delete or remove its exports."
].join("\n");

function runGenerator(
  params: GeneratorParams,
  config: GeneratorConfig,
  codegenTypeHandler: TypeHandler<TypedOutputBuilder, *> = new CodegenTypeHandler(params, config),
  scaffoldTypeHandler: MaterialTypeHandler<TypedOutputBuilder> = new ScaffoldTypeHandler(config)
): SinglePassGeneratorOutput {
  const codegenOutputs = params.allTypes.map(
    asCodegenOutput(
      asTypedGeneratorOutput(
        compose(
          typeMapper(codegenTypeHandler),
          withCommentHeader(CODEGEN_FILE_COMMENT_HEADER)
        )
      )
    )
  );

  const scaffoldOutputs = params.scaffoldTypes.map(
    asScaffoldOutput(
      asTypedGeneratorOutput(
        compose(
          materialTypeMapper(scaffoldTypeHandler, params.allTypes.obj),
          withCommentHeader(SCAFFOLD_FILE_COMMENT_HEADER)
        )
      )
    )
  );

  let output = flattenOrderedObj(codegenOutputs, new SinglePassGeneratorOutput());
  output = output.concat(flattenOrderedObj(scaffoldOutputs, new SinglePassGeneratorOutput()));
  output = output.concat(idolJsOutput(config));

  return output;
}
*/

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
    return this.enum
      .bind(e => e.declaredIdent)
      .asDisjoint()
      .concat(this.typeStruct.bind(ts => ts.declaredIdent).asDisjoint())
      .asAlt();
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
    return Alt.empty();
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
      this.parent.idolJsFile.enum.map(enumExported => ({
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
                scripter.propDec("options", scripter.literal(this.options)),
                scripter.propDec("default", scripter.literal(this.options[0])),
                scripter.methodDec("validate", ["val"], []),
                scripter.methodDec("isValid", ["val"], [scripter.ret("true")]),
                scripter.methodDec("expand", ["val"], [scripter.ret("val")]),
                scripter.methodDec("expand", ["wrap"], [scripter.ret("val")]),
                scripter.methodDec("expand", ["unwrap"], [scripter.ret("val")])
              )
            )(ident),
            scripter.invocation(this.state.importIdent(this.path, enumExported), ident)
          ]
        )
      }))
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
      .map(scaffoldType => importExpr(scaffoldType, "Scaffold" + codegenType.ident));
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

  /*
        const pojos = runGenerator(params, config);
        const renderedOutput = render(config, pojos);
        const moveTo = build(config, renderedOutput);
      */
  /*
        moveTo(params.outputDir);
      */
}

if (require.main === module) {
  main();
}
