// @flow
import prettier from "prettier";

export function render(lines: Array<string>, prettierOptions: any = { parser: "babel-flow" }) {
  const content = lines.map(v => v + "").join(";\n");
  return prettier.format(content, prettierOptions);
}

export function variable(
  expr: string,
  kind: string = "const",
  exported: boolean = true
): (ident: string) => string {
  return (ident: string) => {
    let result = `${kind} ${ident} = ${expr}`;
    if (exported) result = `export ${result}`;
    return result;
  };
}

export function commented(
  c: string,
  scriptable: (ident: string) => string
): (ident: string) => string {
  return (ident: string): string => {
    return `${comment(c)}\n${scriptable(ident)}`;
  };
}

export function getProp(ident: string, body: Array<string>): string {
  const bodyRendered = body.join(";\n");
  return `get ${ident}() { ${bodyRendered} }`;
}

export function setProp(ident: string, arg: string, body: Array<string>): string {
  const bodyRendered = body.join(";\n");
  return `set ${ident}(${arg}) { ${bodyRendered} }`;
}

export function spread(expr: string): string {
  return `...${expr}`;
}

export function ret(expr: string): string {
  return `return ${expr}`;
}

export function propAccess(obj: string, ...props: string[]): string {
  return [obj, ...props].join(".");
}

export function propExpr(obj: string, ...exprs: string[]): string {
  return exprs.reduce((last, next) => `${last}[${next}]`, obj);
}

export function comment(comment: string): string {
  if (!comment) return comment;
  comment = comment.replace(/\//g, "\\/");
  return comment
    .split("\n")
    .map(l => `// ${l}`)
    .join("\n");
}

export function propDec(prop: string, expr: string): string {
  return `${prop}: ${expr}`;
}

export function propExprDec(prop: string, expr: string): string {
  return `[${prop}]: ${expr}`;
}

export function objLiteral(...parts: string[]): string {
  return `{${parts.map(p => (p.trim() ? p + "," : p)).join("\n")}}`;
}

export function assignment(ident: string, expr: string): string {
  return `${ident} = ${expr}`;
}

export function classDec(
  body: string[],
  extendsExpr: ?string,
  exported: boolean = true
): (ident: string) => string {
  return (ident: string) => {
    let result = `class ${ident}`;
    if (extendsExpr) {
      result = `${result} extends ${extendsExpr}`;
    }
    result = `${result} {${body.join("\n")}}`;
    if (exported) result = `export ${result}`;
    return result;
  };
}

export const newMod = "new ";

export function invocation(ident: string, ...args: string[]): string {
  return `${ident}(${args.join(",")})`;
}

export function methodDec(
  ident: string,
  args: string[],
  body: string[],
  staticDec: boolean = false
): string {
  const dec = `${ident}(${args.join(",")}) {${body.join("\n")}}`;
  return staticDec ? `static ${dec}` : dec;
}

export function arrowFunc(args: string[], expr: string): string {
  return `(${args.join(",")}) => (${expr})`;
}

export function functionDec(
  ident: string,
  args: string[],
  body: string[],
  exported: boolean = true
): string {
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
