// @flow
import { Module } from "./schema/Module";
import { Type } from "./schema/Type";
import { Reference } from "./schema/Reference";
import { TypeStruct } from "./schema/TypeStruct";
import { StructKind } from "./schema/StructKind";
import { PrimitiveType } from "./schema/PrimitiveType";
import { Alt, OrderedObj } from "./functional";

export class Path {
    path: string;

    constructor(path: string) {
        this.path = path;
    }

    toString() { return this.path; }

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
        let i = fromParts.length - 1;

        while (i >= 0 && fromParts.slice(0, i) !== toParts.slice(0, i)) {
            parts.push(i);
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

    toString() { return this.path.toString(); }

    static module(path: string): ImportPath {
        return new ImportPath(new Path(path), path);
    }

    get isModule() {
        return this.path.isModule;
    }
}

export type Exported = {
    path: Path,
    ident: string,
}

export type GeneratorParams = {
    allModules: OrderedObj<Module>,
    allTypes: OrderedObj<Type>,
    scaffoldTypes: OrderedObj<Type>,
    outputDir: string,
    options: { [k: string]: Array<string> | boolean },
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
            })
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
        if (this.typeStruct.isAlias && this.typeStruct.isLiteral) {
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

        return Alt.lift(new ScalarDeconstructor(this.typeStruct, new ScalarContext(this.context, false)));
    }

    getMap(): Alt<ScalarDeconstructor> {
        if (this.typeStruct.structKind !== StructKind.MAP) {
            return Alt.empty();
        }

        return Alt.lift(new ScalarDeconstructor(this.typeStruct, new ScalarContext(this.context, false)));
    }

    getRepeated(): Alt<ScalarDeconstructor> {
        if (this.typeStruct.structKind !== StructKind.REPEATED) {
            return Alt.empty();
        }

        return Alt.lift(new ScalarDeconstructor(this.typeStruct, new ScalarContext(this.context, false)));
    }
}

export class TypeDeconstructor {
    t: Type

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

    getEnum(): Alt<TypeStructDeconstructor> {
        if (this.t.isA || this.t.options.length === 0) {
            return Alt.empty();
        }

        return Alt.lift(this.t.options);
    }

    getStruct(): Alt<OrderedObj<TypeStructDeconstructor>> {
        if (this.t.isA || this.t.options.length) {
            return Alt.empty();
        }

        return Alt.lift(OrderedObj.fromIterable(this.t.fields.keys().map(k => new OrderedObj<TypeStructDeconstructor>({
            [k]: new TypeStructDeconstructor(this.t.fields.obj[k].typeStruct, new TypeStructContext(this.t.fields.obj[k].tags))
        }))));
    }
}