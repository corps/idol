// @flow
import { Module } from "./schema/Module";
import { Type } from "./schema/Type";
import { Reference } from "./schema/Reference";
import { TypeStruct } from "./schema/TypeStruct";
import { StructKind } from "./schema/StructKind";
import { Alt, Disjoint, naiveObjectConcat, OrderedObj, StringSet } from "./functional";
import * as scripter from "./scripter";
import { BuildEnv } from "./build_env";

export class Path {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  toString() {
    return this.path;
  }

  get isModule() {
    return !this.path.endsWith(".js");
  }

  importPathTo(toPath: Path): ImportPath {
    if (this.path === toPath.path) {
      return new ImportPath(toPath, "");
    }

    if (toPath.isModule) {
      return ImportPath.module(toPath.path);
    }

    if (this.isModule) {
      throw new Error("Absolute path modules cannot express relative import paths!");
    }

    const fromParts = this.path.split("/");
    const toParts = toPath.path.split("/");
    const parts: Array<string> = [];
    let i = fromParts.length;

    while (i > 0 && fromParts.slice(0, i).join('/') !== toParts.slice(0, i).join('/')) {
      parts.push("..");
      i--;
    }

    while (i < toParts.length) {
      parts.push(toParts[i]);
      i += 1;
    }

    return new ImportPath(toPath, parts.join("/"));
  }
}

export class ImportPath {
  path: Path;
  relPath: string;

  constructor(path: Path, relPath: string) {
    this.path = path;
    this.relPath = relPath;
  }

  toString() {
    return this.path.toString();
  }

  static module(path: string): ImportPath {
    return new ImportPath(new Path(path), path);
  }

  get isModule() {
    return this.path.isModule;
  }
}

export type Exported = {
  path: Path,
  ident: string
};

export type GeneratorParams = {
  allModules: OrderedObj<Module>,
  allTypes: OrderedObj<Type>,
  scaffoldTypes: OrderedObj<Type>,
  outputDir: string,
  options: { [k: string]: Array<string> | boolean }
};

export class TypeStructContext {
  fieldTags: string[];
  typeTags: string[];
  isTypeBound: boolean;

  constructor(fieldTags: string[] | null = null, typeTags: string[] | null = null) {
    this.fieldTags = fieldTags || [];
    this.typeTags = typeTags || [];
    this.isTypeBound = !!typeTags && !fieldTags;
  }

  includesTag(fieldTag: string | null = null, typeTag: string | null = null) {
    return this.fieldTags.indexOf(fieldTag) !== -1 || this.typeTags.indexOf(typeTag) !== -1;
  }

  getTagValue(d: string, fieldTag: string | null = null, typeTag: string | null = null) {
    let result: string = d;
    [[fieldTag, this.fieldTags], [typeTag, this.typeTags]].forEach(([tag, tags]) => {
      if (!tag) return;

      tags.forEach(t => {
        if (t.startsWith(tag + ":")) {
          result = t.slice(tag.length + 1);
        }
      });
    });

    return result;
  }
}

export class ScalarContext {
  isContained: boolean;
  typeStructContext: TypeStructContext;

  constructor(typeStructContext: TypeStructContext, isContained: boolean) {
    this.typeStructContext = typeStructContext;
    this.isContained = isContained;
  }

  get isTypeBound(): boolean {
    return this.typeStructContext.isTypeBound;
  }

  get isDeclarable(): boolean {
    return this.isTypeBound && !this.isContained;
  }
}

export class ScalarDeconstructor {
  typeStruct: TypeStruct;
  context: ScalarContext;

  constructor(typeStruct: TypeStruct, context: ScalarContext) {
    this.typeStruct = typeStruct;
    this.context = context;
  }

  getPrimitive(): Alt<string> {
    if (this.typeStruct.isAlias || this.typeStruct.isLiteral) {
      return Alt.empty();
    }

    return Alt.lift(this.typeStruct.primitiveType);
  }

  getLiteral(): Alt<[string, any]> {
    if (!this.typeStruct.isLiteral) {
      return Alt.empty();
    }

    return Alt.lift([this.typeStruct.primitiveType, this.typeStruct.literalValue]);
  }

  getAlias(): Alt<Reference> {
    if (!this.typeStruct.isAlias) {
      return Alt.empty();
    }

    return Alt.lift(this.typeStruct.reference);
  }
}

export class TypeStructDeconstructor {
  typeStruct: TypeStruct;
  context: TypeStructContext;

  constructor(typeStruct: TypeStruct, context: TypeStructContext) {
    this.typeStruct = typeStruct;
    this.context = context;
  }

  getScalar(): Alt<ScalarDeconstructor> {
    if (this.typeStruct.structKind !== StructKind.SCALAR) {
      return Alt.empty();
    }

    return Alt.lift(
      new ScalarDeconstructor(this.typeStruct, new ScalarContext(this.context, false))
    );
  }

  getMap(): Alt<ScalarDeconstructor> {
    if (this.typeStruct.structKind !== StructKind.MAP) {
      return Alt.empty();
    }

    return Alt.lift(
      new ScalarDeconstructor(this.typeStruct, new ScalarContext(this.context, false))
    );
  }

  getRepeated(): Alt<ScalarDeconstructor> {
    if (this.typeStruct.structKind !== StructKind.REPEATED) {
      return Alt.empty();
    }

    return Alt.lift(
      new ScalarDeconstructor(this.typeStruct, new ScalarContext(this.context, false))
    );
  }
}

export class TypeDeconstructor {
  t: Type;

  constructor(t: Type) {
    this.t = t;
  }

  getTypeStruct(): Alt<TypeStructDeconstructor> {
    if (!this.t.isA) {
      return Alt.empty();
    }

    return Alt.lift(
      new TypeStructDeconstructor(this.t.isA, new TypeStructContext(null, this.t.tags))
    );
  }

  getEnum(): Alt<Array<string>> {
    if (this.t.isA || this.t.options.length === 0) {
      return Alt.empty();
    }

    return Alt.lift(this.t.options);
  }

  getStruct(): Alt<OrderedObj<TypeStructDeconstructor>> {
    if (this.t.isA || this.t.options.length) {
      return Alt.empty();
    }

    return Alt.lift(
      OrderedObj.fromIterable(
        Object.keys(this.t.fields).sort().map(
          k =>
            new OrderedObj<TypeStructDeconstructor>({
              [k]: new TypeStructDeconstructor(
                this.t.fields[k].typeStruct,
                new TypeStructContext(this.t.fields[k].tags)
              )
            })
        )
      )
    );
  }
}

export function getMaterialTypeDeconstructor(
  allTypes: OrderedObj<Type>,
  t: Type
): TypeDeconstructor {
  function searchType(typeDecon: TypeDeconstructor): TypeDeconstructor {
    return typeDecon
      .getTypeStruct()
      .bind(ts => ts.getScalar())
      .bind(scalar => scalar.getAlias())
      .map(alias => searchType(new TypeDeconstructor(allTypes.obj[alias.qualifiedName])))
      .getOr(typeDecon);
  }

  return searchType(new TypeDeconstructor(t));
}

export class GeneratorConfig {
  codegenRoot: string;
  name: string;
  pathMappings: { [k: string]: (r: Reference) => string };
  params: GeneratorParams;

  constructor(params: GeneratorParams) {
    this.params = params;
    this.codegenRoot = "codegen";
    this.name = "idol_js";
    this.pathMappings = {};
  }

  pathsOf(groupReferences: { [k: string]: Reference }): { [k: string]: string } {
    const result = {};

    for (let k in groupReferences) {
      result[k] = this.pathMappings[k](groupReferences[k]);
    }

    return result;
  }

  static oneFilePerType(ref: Reference): string {
    return ref.asQnPath;
  }

  static oneFilePerModule(ref: Reference): string {
    return ref.asModulePath;
  }

  static flatNamespace(ref: Reference): string {
    return ref.asTypePath;
  }

  inCodegenDir(f: Reference => string): Reference => string {
    return (ref: Reference): string => {
      return this.codegenRoot + "/" + f(ref);
    };
  }

  withPathMappings(mappings: { [k: string]: (ref: Reference) => string }) {
    this.pathMappings = mappings;
  }
}

export class IdentifiersAcc {
  idents: OrderedObj<OrderedObj<StringSet>>;

  constructor(idents: OrderedObj<OrderedObj<StringSet>> | null = null) {
    this.idents = idents || new OrderedObj<OrderedObj<StringSet>>();
  }

  concat(other: IdentifiersAcc): IdentifiersAcc {
    return naiveObjectConcat(this, other);
  }

  addIdentifier(intoPath: Path, ident: string, source: string): string {
    const existingSources = this.idents.get(intoPath.path).bind(idents => idents.get(ident)).getOr(new StringSet([source])).items;
    if (existingSources.indexOf(source) === -1) {
      throw new Error(`Cannot create ident ${ident} into path ${intoPath.path}, conflicts with existing from ${existingSources.join(' ')}`)
    }

    this.idents = this.idents.concat(
      new OrderedObj<OrderedObj<StringSet>>({
        [intoPath.path]: new OrderedObj({ [ident]: new StringSet([source]) })
      })
    );
    return ident;
  }

  getIdentifierSources(path: Path, ident: string): Alt<StringSet> {
    return this.idents.get(path.path).bind(idents => idents.get(ident));
  }

  unwrapConflicts(): Array<string> {
    const self = this;
    const result: Array<[string, string, StringSet]> = [];

    for (let path of self.idents.keys()) {
      const idents = self.idents.obj[path].keys();
      for (let ident of idents) {
        const sources = self.idents.obj[path].obj[ident];
        if (sources.items.length > 1) {
          result.push([path, ident, sources]);
        }
      }
    }

    return result.map(
      ([path, ident, sources]) =>
        `ident ${ident} was defined or imported into ${path} by conflicting sources: ${sources.items.join(' ')}`
    );
  }
}

export class ImportsAcc {
  imports: OrderedObj<OrderedObj<OrderedObj<StringSet>>>;

  constructor(imports: OrderedObj<OrderedObj<OrderedObj<StringSet>>> | null = null) {
    this.imports = imports || new OrderedObj<OrderedObj<OrderedObj<StringSet>>>();
  }

  concat(other: ImportsAcc): ImportsAcc {
    return naiveObjectConcat(this, other);
  }

  addImport(intoPath: Path, fromPath: ImportPath, fromIdent: string, intoIdent: string) {
    this.imports = this.imports.concat(
      new OrderedObj({
        [intoPath.path]: new OrderedObj({
          [fromPath.relPath]: new OrderedObj({ [fromIdent]: new StringSet([intoIdent]) })
        })
      })
    );
  }

  getImportedIdents(intoPath: Path, fromPath: ImportPath, fromIdent: string): Alt<StringSet> {
    return this.imports
      .get(intoPath.path)
      .bind(from => from.get(fromPath.relPath))
      .bind(idents => idents.get(fromIdent));
  }

  render(intoPath: string): Array<string> {
    return this.imports
      .get(intoPath)
      .map(imports =>
        imports.keys().map(relPath => {
          const decons: OrderedObj<StringSet> = imports.obj[relPath];

          return scripter.importDecon(
            relPath,
            ...decons
              .keys()
              .map(ident =>
                decons.obj[ident].items
                  .map(asIdent => (asIdent === ident ? ident : `${ident} as ${asIdent}`))
                  .join(", ")
              )
          );
        })
      )
      .getOr([]);
  }
}

export class GeneratorAcc {
  idents: IdentifiersAcc;
  imports: ImportsAcc;
  content: OrderedObj<Array<string>>;
  groupOfPath: OrderedObj<StringSet>;
  uniq: number;

  constructor() {
    this.idents = new IdentifiersAcc();
    this.imports = new ImportsAcc();
    this.content = new OrderedObj<Array<string>>();
    this.groupOfPath = new OrderedObj<StringSet>();
    this.uniq = 0;
  }

  concat(other: GeneratorAcc): GeneratorAcc {
    return naiveObjectConcat(this, other);
  }

  validate() {
    const pathErrors: Array<string> = [];
    this.groupOfPath.keys().forEach(path => {
      const groups = this.groupOfPath.obj[path];
      if (groups.items.length > 1) {
        pathErrors.push(
          `Conflict in paths: Multiple (${groups.items.join(", ")}) for path ${path}`
        );
      }
    });

    if (pathErrors.length) {
      throw new Error(pathErrors.join("\n"));
    }

    const identConflicts = this.idents.unwrapConflicts();
    if (identConflicts.length) {
      throw new Error(`Found conflicting identifiers\n${identConflicts.join("\n  ")}`);
    }
  }

  render(commentHeaders: { [k: string]: string }): OrderedObj<string> {
    this.validate();

    return OrderedObj.fromIterable(
      this.groupOfPath.keys().map(
        path => {
          console.log(`Rendering / formatting output for ${path}`)
          return new OrderedObj({
            [path]: scripter.render(
                this.groupOfPath.obj[path].items
                    .map(group => (group in commentHeaders ? commentHeaders[group] : ""))
                    .filter(Boolean)
                    .map(scripter.comment)
                    .concat(this.imports.render(path))
                    .concat(this.content.get(path).getOr([]))
            )
          })
        }
      )
    );
  }

  addContent(path: Path, content: string | string[]) {
    if (typeof content === "string") {
      content = [content];
    }

    this.content = this.content.concat(new OrderedObj<Array<string>>({ [path.path]: content }));
  }

  reservePath(path: { [k: string]: string }): Path {
    const group = Disjoint.from(Object.keys(path)).unwrap();
    const p = path[group];

    const groups = this.groupOfPath.get(p).getOr(new StringSet([group]));
    if (groups.items.indexOf(group) !== -1) {
      this.groupOfPath = this.groupOfPath.concat(new OrderedObj<StringSet>({ [p]: new StringSet([group] ) }));
      return new Path(p);
    }

    throw new Error(
      `Conflict: cannot create file ${p} for group ${group}, already exists for ${groups.items.join(
        ", "
      )}`
    );
  }

  createIdent(intoPath: Path, asIdent: string, source: string): string {
    asIdent = getSafeIdent(asIdent);
    while (
      this.idents
        .getIdentifierSources(intoPath, asIdent)
        .getOr(new StringSet([source]))
        .items.indexOf(source) === -1
    ) {
      asIdent += "_";
    }

    this.idents.addIdentifier(intoPath, asIdent, source);
    return asIdent;
  }

  importIdent(intoPath: Path, exported: Exported, asIdent: string | null = null): string {
    const ident = exported.ident;
    if (asIdent === null) {
      asIdent = ident;
    }

    const fromPath = intoPath.importPathTo(exported.path);

    if (!fromPath.isModule && this.idents.getIdentifierSources(fromPath.path, ident).isEmpty()) {
      throw new Error(
        `identifier ${ident} required by ${intoPath.path} does not exist in ${fromPath.path.path}`
      );
    }

    const importedAs = this.imports
      .getImportedIdents(intoPath, fromPath, ident)
      .getOr(new StringSet([]));

    if (importedAs.items.length) {
      return importedAs.items[0];
    }

    asIdent = this.createIdent(intoPath, asIdent, fromPath.path.path);
    this.imports.addImport(intoPath, fromPath, ident, asIdent);
    return asIdent;
  }

  addContentWithIdent(path: Path, ident: string, scriptable: string => Array<string> | string) {
    this.idents.addIdentifier(path, ident, this.getUniqueSource(path));
    this.addContent(path, scriptable(ident));
    return ident;
  }

  getUniqueSource(path: Path): string {
    this.uniq += 1;
    return `${path.path}.${this.uniq}`;
  }
}

export type Expression = (state: GeneratorAcc, path: Path) => string;

export function getSafeIdent(ident: string): string {
  while (RESERVED_WORDS.indexOf(ident) !== -1) ident += "_";
  return ident;
}

export interface GeneratorContext {
  state: GeneratorAcc;
  config: GeneratorConfig;
}

export class GeneratorFileContext<P: GeneratorContext> {
  path: Path;
  parent: P;

  constructor(parent: P, path: Path) {
    this.path = path;
    this.parent = parent;
  }

  get state(): GeneratorAcc {
    return this.parent.state;
  }

  get config(): GeneratorConfig {
    return this.parent.config;
  }
}

export function build(
  config: GeneratorConfig,
  output: OrderedObj<string>
): (outputDir: string) => void {
  const buildEnv = new BuildEnv(config.name, config.codegenRoot);

  output.keys().forEach(path => {
    const contents = output.obj[path];
    if (contents) {
      buildEnv.writeBuildFile(path, contents);
    }
  });

  return (outputDir: string) => buildEnv.finalize(outputDir);
}

export function importExpr(exported: Exported, asIdent: string | null = null): Expression {
  if (asIdent === null) {
    asIdent = exported.ident;
  }

  return (state: GeneratorAcc, path: Path): string => state.importIdent(path, exported, asIdent);
}

export function camelify(name: string): string {
  return name
    .split(/[._]/)
    .map(p => p[0].toUpperCase() + p.slice(1))
    .join("");
}

export function snakify(name: string): string {
  const firstPass = name.replace(
    /([^.])([A-Z][a-z]+)/,
    (_, group1, group2) => `${group1}_${group2}`
  );
  return firstPass.replace(/([a-z0-9])([A-Z])/, (_, group1, group2) => `${group1}_${group2}`);
}

export const RESERVED_WORDS: string[] = `break
case
catch
class
const
continue
debugger
default
delete
do
else
enum
export
extends
false
finally
for
function
if
import
in
instanceof
new
null
return
super
switch
this
throw
true
try
typeof
var
void
while
with
any
boolean
constructor
declare
get
module
require
number
set
string
symbol
type
from
of
async
await
namespace
`.split("\n");
