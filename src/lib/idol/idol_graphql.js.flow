// @flow

import { BuildEnv } from "./build_env";
import * as scripter from "./scripter";
import { start } from "./cli";
import {
  asCodegenOutput,
  asScaffoldOutput,
  asTypedGeneratorOutput,
  build,
  GeneratorConfig as BaseGeneratorConfig,
  materialTypeMapper,
  render,
  scalarMapper,
  SinglePassGeneratorOutput,
  TypedOutputBuilder,
  typeMapper,
  typeStructMapper,
  withCommentHeader
} from "./generators";
import type {
  GeneratorParams,
  MaterialTypeHandler,
  OutputTypeSpecifier,
  ScalarHandler,
  ScalarMapper,
  Tags,
  TypeHandler,
  TypeMapper,
  TypeStructHandler,
  TypeStructMapper
} from "./generators";
import { compose, Conflictable, flattenOrderedObj, OrderedObj, StringSet } from "./functional";
import { Type } from "./schema/Type";
import { asQualifiedIdent, getTagValue } from "./utils";
import { Reference } from "./schema/Reference";
import { PrimitiveType } from "./schema/PrimitiveType";
import { TypeStruct } from "./schema/TypeStruct";

const idolGraphQlJs = `
import { GraphQLScalarType, Kind } from "graphql";

export function wrapValues(enumObj) {
    return Object.keys(enumObj).reduce((obj, entity) => {
        obj[entity] = { value: entity };
        return obj;
    }, {});
}

export const Anything = new GraphQLScalarType({
  name: 'IdolGraphQLAnything',
  description: 'Any json value, untyped',
  parseValue: (value) => value,
  parseLiteral,
  serialize: (value) => value,
})

function parseLiteral (ast) {
  switch (ast.kind) {
    case Kind.BOOLEAN:
    case Kind.STRING:  
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value)
    case Kind.LIST:
      return ast.values.map(parseLiteral)
    case Kind.OBJECT:
      return ast.fields.reduce((accumulator, field) => {
        accumulator[field.name.value] = parseLiteral(field.value)
        return accumulator
      }, {})
    case Kind.NULL:
        return null
    default:
      throw new Error("Unexpected kind in parseLiteral: " + ast.kind)
  }
}
`;

export function graphqlTypeOfPrimitive(primitiveType: string) {
  switch (primitiveType) {
    case PrimitiveType.ANY:
      return "Anything";
    case PrimitiveType.STRING:
      return "GraphQLString";
    case PrimitiveType.BOOL:
      return "GraphQLBoolean";
    case PrimitiveType.DOUBLE:
      return "GraphQLFloat";
    case PrimitiveType.INT:
      return "GraphQLInt";
  }

  throw new Error("Unknown primitiveType " + primitiveType);
}

export function asGraphQLTypeIdent(reference: Reference, qualified: boolean = true): string {
  return qualified ? `${asQualifiedIdent(reference)}Type` : `${reference.typeName}Type`;
}

export function asGraphQLFieldsIdent(reference: Reference, qualified: boolean = true): string {
  return qualified ? `${asQualifiedIdent(reference)}Fields` : `${reference.typeName}Fields`;
}

export class CodegenScalarExpressionHandler implements ScalarHandler<scripter.Stringable> {
  get Literal() {
    return (primitiveType: string, val: any) => graphqlTypeOfPrimitive(primitiveType);
  }

  get Primitive() {
    return (primitiveType: string) => graphqlTypeOfPrimitive(primitiveType);
  }

  get Alias() {
    return (reference: Reference) => asGraphQLTypeIdent(reference);
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
      scripter.newInvocation("GraphQLList_", scalar);
  }

  get Map() {
    return (scalar: scripter.Stringable) => "Anything";
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
    return scripter.objLiteral(...values);
  }

  objectTypeLiteral(type: Type) {
    return scripter.objLiteral(
      scripter.propDec("name", scripter.literal(type.named.typeName)),
      scripter.propDec("description", scripter.literal(type.getTagValue("description", ""))),
      scripter.propDec("fields", asGraphQLFieldsIdent(type.named))
    );
  }

  fieldsLiteral(type: Type, fields: OrderedObj<scripter.Stringable>) {
    return scripter.objLiteral(
      ...fields.map((field, fieldName) => scripter.propDec(fieldName, field)).items()
    );
  }

  get TypeStruct() {
    const typeStructExpression = typeStructMapper(this.typeStructHandler);

    return (type: Type, ...args: *) =>
      new TypedOutputBuilder(
        [scripter.exportedConst(asGraphQLTypeIdent(type.named), typeStructExpression(...args))],
        {
          imports: this.config.typeImports({ codegen: type.named.qualifiedName })(type)
        }
      );
  }

  get Enum() {
    return (type: Type, options: string[]) =>
      new TypedOutputBuilder(
        [scripter.exportedConst(asQualifiedIdent(type.named), this.enumConst(options))].concat(
          type.named.qualifiedName in this.params.scaffoldTypes.obj
            ? []
            : [
                scripter.exportedConst(
                  asGraphQLTypeIdent(type.named),
                  scripter.newInvocation(
                    "GraphQLEnumType_",
                    scripter.invocation("wrapValues_", asQualifiedIdent(type.named))
                  )
                )
              ]
        ),
        {
          imports: this.config.typeImports({ codegen: type.named.qualifiedName })(type)
        }
      );
  }

  get Field() {
    const typeExprMapper = typeStructMapper<scripter.Stringable>(this.typeStructHandler);
    return (typeStruct: TypeStruct, tags?: Tags = {}) => {
      const typeExpr = typeExprMapper(typeStruct, tags);
      return scripter.objLiteral(
        scripter.propDec(
          "description",
          scripter.literal(getTagValue(tags.fieldTags, "description", ""))
        ),
        scripter.propDec("type", typeExpr)
      );
    };
  }

  get Struct() {
    return (type: Type, fields: OrderedObj<scripter.Stringable>) =>
      new TypedOutputBuilder(
        [
          scripter.exportedConst(asGraphQLFieldsIdent(type.named), this.fieldsLiteral(type, fields))
        ].concat(
          type.named.qualifiedName in this.params.scaffoldTypes.obj
            ? []
            : [
                scripter.exportedConst(
                  asGraphQLTypeIdent(type.named),
                  scripter.newInvocation("GraphQLObjectType_", this.objectTypeLiteral(type))
                )
              ]
        ),
        {
          imports: this.config.typeImports({ codegen: type.named.qualifiedName })(type)
        }
      );
  }
}

export class GeneratorConfig extends BaseGeneratorConfig {
  idolGraphqlPath: string;

  constructor(params: GeneratorParams) {
    super(params);
    this.idolGraphqlPath = this.codegenRoot + "/__idolGraphql__.js";
  }

  graphQLImports(module: OutputTypeSpecifier<>, ...imports: string[]): OrderedObj<StringSet> {
    const path = this.resolvePath(module, { absolute: "graphql" });

    return new OrderedObj<StringSet>({
      [path]: new StringSet(imports.map(i => `${i} as ${i}_`))
    });
  }

  idolGraphQLImports(module: OutputTypeSpecifier<>, ...imports: string[]): OrderedObj<StringSet> {
    const path = this.resolvePath(module, { supplemental: this.idolGraphqlPath });

    return new OrderedObj<StringSet>({
      [path]: new StringSet(imports.map(i => `${i} as ${i}_`))
    });
  }

  fieldsImport(from: OutputTypeSpecifier<>, reference: Reference): OrderedObj<StringSet> {
    return new OrderedObj<StringSet>({
      [this.resolvePath(from, { codegen: reference.qualifiedName })]: new StringSet([
        asGraphQLFieldsIdent(reference)
      ])
    });
  }

  scaffoldTypeImport(from: OutputTypeSpecifier<>, reference: Reference): OrderedObj<StringSet> {
    return new OrderedObj<StringSet>({
      [this.resolvePath(from, { scaffold: reference.qualifiedName })]: new StringSet([
        `${asGraphQLTypeIdent(reference, false)} as ${asGraphQLTypeIdent(reference)}`
      ])
    });
  }

  codegenTypeImport(from: OutputTypeSpecifier<>, reference: Reference): OrderedObj<StringSet> {
    return new OrderedObj<StringSet>({
      [this.resolvePath(from, { codegen: reference.qualifiedName })]: new StringSet([
        asGraphQLTypeIdent(reference)
      ])
    });
  }

  codegenEnumImport(from: OutputTypeSpecifier<>, reference: Reference): OrderedObj<StringSet> {
    return new OrderedObj<StringSet>({
      [this.resolvePath(from, { codegen: reference.qualifiedName })]: new StringSet([
        asQualifiedIdent(reference)
      ])
    });
  }

  graphQLImportOfPrimitive(module: OutputTypeSpecifier<>, primitiveType: string) {
    if (primitiveType === PrimitiveType.ANY) {
      return this.idolGraphQLImports(module, "Anything");
    }

    return this.idolGraphQLImports(module, graphqlTypeOfPrimitive(primitiveType));
  }

  scalarImports(module: OutputTypeSpecifier<>): ScalarMapper<OrderedObj<StringSet>> {
    return scalarMapper<OrderedObj<StringSet>>({
      Literal: (primitiveType: string, value: any) =>
        this.graphQLImportOfPrimitive(module, primitiveType),
      Primitive: (primitiveType: string) => this.graphQLImportOfPrimitive(module, primitiveType),
      Alias: reference => {
        if (module.scaffold) {
          return this.fieldsImport(module, reference);
        }

        if (reference.qualifiedName in this.params.scaffoldTypes.obj) {
          return this.scaffoldTypeImport(module, reference);
        }

        return this.codegenTypeImport(module, reference);
      }
    });
  }

  typeStructImports(module: OutputTypeSpecifier<>): TypeStructMapper<OrderedObj<StringSet>> {
    return typeStructMapper({
      Scalar: this.scalarImports(module),
      Repeated: (scalarImports: OrderedObj<StringSet>) =>
        scalarImports.concat(this.graphQLImports(module, "GraphQLList")),
      // TODO: Use anytime here.
      Map: scalarImports => scalarImports
    });
  }

  typeImports(module: OutputTypeSpecifier<>): TypeMapper<OrderedObj<StringSet>> {
    const typeStructImportMapper = this.typeStructImports(module);
    return typeMapper<OrderedObj<StringSet>, OrderedObj<StringSet>>({
      Field: typeStructImportMapper,
      TypeStruct: (type, ...args) => typeStructImportMapper(...args),
      Enum: (...args) =>
        this.graphQLImports(module, "GraphQLEnumType").concat(
          this.idolGraphQLImports(module, "wrapValues")
        ),
      Struct: (type: Type, fieldImports: OrderedObj<OrderedObj<StringSet>>) =>
        this.graphQLImports(module, "GraphQLObjectType").concat(
          flattenOrderedObj(fieldImports, new OrderedObj())
        )
    });
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
        [scripter.exportedConst(type.named.typeName, asGraphQLTypeIdent(type.named))],
        {
          imports: this.config.codegenTypeImport({ scaffold: type.named.qualifiedName }, type.named)
        }
      );
  }

  get Enum() {
    return (type: Type) =>
      new TypedOutputBuilder(
        [
          // Export the enum values.
          scripter.exportedConst(
            type.named.typeName,
            scripter.objLiteral("..." + asQualifiedIdent(type.named))
          ),
          // And then the type
          scripter.exportedConst(
            asGraphQLTypeIdent(type.named),
            scripter.newInvocation(
              "GraphQLEnumType_",
              scripter.invocation("wrapValues_", type.named.typeName)
            )
          )
        ],
        {
          imports: this.config
            .codegenEnumImport({ scaffold: type.named.qualifiedName }, type.named)
            .concat(
              this.config.idolGraphQLImports({ scaffold: type.named.qualifiedName }, "wrapValues")
            )
            .concat(
              this.config.graphQLImports({ scaffold: type.named.qualifiedName }, "GraphQLEnumType")
            )
        }
      );
  }

  get Struct() {
    return (type: Type) =>
      new TypedOutputBuilder(
        [
          scripter.exportedConst(
            asGraphQLTypeIdent(type.named, false),
            scripter.newInvocation(
              "GraphQLObjectType_",
              scripter.objLiteral(
                scripter.propDec(
                  "fields",
                  scripter.objLiteral(`...${asGraphQLFieldsIdent(type.named)}`)
                ),
                scripter.propDec("name", scripter.literal(type.named.typeName)),
                scripter.propDec(
                  "description",
                  scripter.literal(type.getTagValue("description", ""))
                )
              )
            )
          )
        ],
        {
          imports: this.config
            .fieldsImport({ scaffold: type.named.qualifiedName }, type.named)
            .concat(
              this.config.graphQLImports(
                { scaffold: type.named.qualifiedName },
                "GraphQLObjectType"
              )
            )
        }
      );
  }
}

const CODEGEN_FILE_COMMENT_HEADER = [
  "DO NO EDIT",
  "This file is managed by idol_graphql.js.  Any edits will be overwritten on next run of the generator.",
  "Please edit the scaffolded files generated outside of the codegen directory, as you can extend your models more effectively there."
].join("\n");

const SCAFFOLD_FILE_COMMENT_HEADER = [
  "This file was scaffolded by idol_graphql.js  Please feel free to modify and extend, but do not delete or remove its exports."
].join("\n");

export const idolGraphQLJsOutput = (config: GeneratorConfig) =>
  new SinglePassGeneratorOutput({
    supplemental: new OrderedObj<Conflictable<string>>({
      [config.idolGraphqlPath]: new Conflictable([idolGraphQlJs])
    })
  });

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
  output = output.concat(idolGraphQLJsOutput(config));

  return output;
}

function main() {
  const params = start({
    flags: {},
    args: {
      target: "idol module names whose contents will have extensible GraphQLType's scaffolded.",
      output: "a directory to generate the scaffolds and codegen into."
    }
  });

  const config = new GeneratorConfig(params);
  config.withPathConfig({
    scaffold: BaseGeneratorConfig.flatNamespace,
    codegen: BaseGeneratorConfig.oneFilePerType
  });

  const types = runGenerator(params, config);
  const renderedOutput = render(config, types);
  const moveTo = build(config, renderedOutput);
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}
