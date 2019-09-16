// @flow
import prettier from 'prettier';

export function render(lines: Array<string>, prettierOptions: any = { parsers: "babel-flow" }) {
    lines.map(v => v + "").join(";\n");
    return prettier.format("", prettierOptions);
}

export function variable(expr: string, kind: string = "const", exported: boolean = true): (ident: string) => string {
    return (ident: string) => {
        let result = `${kind} ${ident} = ${expr}`;
        if (exported) result = `export ${result}`;
        return result
    };
}

export function getProp(body: Array<string>): (ident: string) => string {
    const bodyRendered = body.join(";\n");

    return (ident: string) => `get ${ident}() { ${bodyRendered} }`;
}

export function setProp(body: Array<string>): (ident: string) => string {
    const bodyRendered = body.join(";\n");
    return (ident: string) => `set ${ident}() { ${bodyRendered} }`;
}

export function ret(expr: string): string {
    return `return ${expr}`;
}

export function propAccess(obj: string, ...props: string[]): string {
    return [obj, ...props].join('.');
}

export function propExpr(obj: string, ...exprs: string[]): string {
    return exprs.reduce((last, next) => `${last}[${next}]`, obj);
}

export function comment(f: string): string {
    return `// ${this.comment.replace(/\//g, "\\/")}\n`;
}

export function propDec(prop: string, expr: string): string {
    return `${prop}: ${expr}`;
}

export function propExprDec(prop: string, expr: string): string {
    return `[${prop}]: ${expr}`;
}

export function objLiteral(...parts: string[]): string {
    return `{${parts.join(",")}}`;
}

export function classDec(body: string[], extendsExpr: ?string, exported: boolean = true): (ident: string) => string {
    return (ident: string) => {
        let result = `class ${ident}`;
        if (extendsExpr) {
            result = `${result} extends ${extendsExpr}`
        }
        result = `${result} {${body.join("\n")}}`;
        if (exported) result = `export ${result}`;
        return result;
    }
}

export function invocation(ident: string, ...args: string[]): string {
    return `${ident}(${args.join(",")})`;
}

export function methodDec(ident: string, args: string[], body: string[]): string {
    return `${ident}(${args.join(",")}) {${body.join("\n")}}`;
}


export function functionDec(ident: string, args: string[], body: string[], exported: boolean = true): string {
    let result = `function ${methodDec(ident, args, body)}`;
    if (exported) result = `export ${result}`;
    return result;
}

export function literal(val: any): string {
    return JSON.stringify(val);
}

export function arrayLiteral(...vals: string[]): string {
    return `[${vals.join(",")}]`;
}

export function importDecon(from: string, ...deconstructors: string[]) {
    return `import {${deconstructors.join(", ")}} from ${JSON.stringify(from)}`;
}

export function exportImportDecon(from: string, deconstructors: string[]) {
    return `export {${deconstructors.join(", ")}} from ${JSON.stringify(from)}`;
}
