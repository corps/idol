// @flow
import prettier from 'prettier';

export type Stringable = { toString(): string } | CodeNode | string

function isExpression(a: Stringable) {
    if (a instanceof CodeNode) {
        return a.isExpression;
    }

    return false;
}

export class CodeNode {
    cached: string | null;
    parent: CodeNode | null;
    isExpression: boolean;

    constructor() {
        this.cached = null;
        this.parent = null;
        this.isExpression = true;
    }

    toString(): string {
        if (this.cached == null) {
            this.cached = this.render();
        }

        return this.cached || "";
    }

    clearCache(): void {
        // No need to cascade up parents if this was never cached anywho.
        if (this.cached == null) return;

        this.cached = null;

        if (this.parent) {
            this.parent.clearCache();
        }
    }

    render(): string {
        return "";
    }
}

class Block extends CodeNode {
    body: Stringable[];

    constructor(children: Stringable[] = []) {
        super();
        this.body = [];
        children.forEach(i => this.add(i));
    }


    add(child: Stringable) {
        this.body.push(child);
    }

    render() {
        return this.body.map(v => v.toString()).join(" ");
    }
}

export class ExpressionStatement extends CodeNode {
    expression: Stringable;

    constructor(expression: Stringable) {
        super();
        this.expression = expression;
        this.isExpression = false;
    }

    render() {
        return this.expression.toString() + ";";
    }
}

export class Export extends CodeNode {
    exported: Stringable;

    constructor(exported: Stringable) {
        super();

        if (isExpression(exported)) {
            this.exported = new ExpressionStatement(exported);
        } else {
            this.exported = exported;
        }
    }

    render() {
        return `export ${this.exported.toString()}`;
    }
}

export class Const extends CodeNode {
    expr: Stringable;

    constructor(expr: Stringable) {
        super();
        this.expr = expr;
    }

    render() {
        return `const ${this.expr.toString()}`;
    }
}

export class Static extends CodeNode {
    expr: Stringable;

    constructor(expr: Stringable) {
        super();
        this.expr = expr;
    }

    render() {
        return `static ${this.expr.toString()}`;
    }
}


export class Get extends CodeNode {
    expr: Stringable;

    constructor(expr: Stringable) {
        super();
        this.expr = expr;
    }

    render() {
        return `get ${this.expr.toString()}`;
    }
}

export class Set extends CodeNode {
    expr: Stringable;

    constructor(expr: Stringable) {
        super();
        this.expr = expr;
    }

    render() {
        return `set ${this.expr.toString()}`;
    }
}


export class Return extends CodeNode {
    expr: Stringable;

    constructor(expr: Stringable) {
        super();
        this.expr = expr;
    }

    render() {
        return `return ${this.expr.toString()}`;
    }
}

export class PropertyAccess extends CodeNode {
    expr: Stringable;
    properties: Stringable[];

    constructor(expr: Stringable, ...properties: Stringable[]) {
        super();
        this.expr = expr;
        this.properties = properties;
    }

    render() {
        return [this.expr, ...this.properties].join('.');
    }
}

export class PropertyExpressionAccess extends CodeNode {
    ident: Stringable;
    expr: Stringable;

    constructor(ident: Stringable, expr: Stringable) {
        super();
        this.ident = ident;
        this.expr = expr;
    }

    render() {
        return `${this.ident.toString()}[${this.expr.toString()}]`;
    }
}

export class New extends CodeNode {
    expr: Stringable;

    constructor(expr: Stringable) {
        super();
        this.expr = expr;
    }

    render() {
        return `new ${this.expr.toString()}`;
    }
}


export class StatementBlock extends Block {
    constructor(children: Stringable[] = []) {
        super(children);
        this.isExpression = false;
    }

    add(child: Stringable) {
        if (isExpression(child)) {
            super.add(new ExpressionStatement(child));
        } else {
            super.add(child);
        }
    }

    concat(other: StatementBlock): StatementBlock {
        return new this.constructor(this.body.concat(other.body));
    }
}

export class CodeFile extends StatementBlock {
    prettierOptions: any;

    constructor(children: Stringable[] = [], prettierOptions: any = { parser: "babel-flow" }) {
        super(children);
        this.prettierOptions = prettierOptions;
        this.isExpression = false;
    }

    render() {
        return prettier.format(super.render(), this.prettierOptions);
    }
}

export class Comment extends CodeNode {
    comment: string;

    constructor(comment: string) {
        super();
        this.comment = comment;
        this.isExpression = false;
    }

    render() {
        return `/* ${this.comment.replace(/\//g, "\\/")} */\n`;
    }
}

export class Assignment extends CodeNode {
    identifier: Stringable;
    expression: Stringable;

    constructor(identifier: Stringable, expression: Stringable) {
        super();
        this.identifier = identifier;
        this.expression = expression;
    }

    render() {
        return `${this.identifier.toString()} = ${this.expression.toString()}`;
    }
}

export class PropertyDeclaration extends CodeNode {
    property: Stringable;
    expression: Stringable;

    constructor(property: Stringable, expression: Stringable) {
        super();
        this.property = property;
        this.expression = expression;
        this.isExpression = false;
    }

    render() {
        return `${this.property.toString()}: ${this.expression.toString()}`;
    }
}

export class PropertyExpressionDeclaration extends CodeNode {
    propertyExpression: Stringable;
    expression: Stringable;

    constructor(propertyExpression: Stringable, expression: Stringable) {
        super();
        this.propertyExpression = propertyExpression;
        this.expression = expression;
        this.isExpression = false;
    }

    render() {
        return `[${this.propertyExpression.toString()}]: ${this.expression.toString()}`;
    }
}

export class ObjectLiteral extends Block {
    render() {
        return `{${this.body.map(v => v.toString() + (v.toString().trim() ? "," : "")).join("")}}`;
    }
}

export class DeclarationBlock extends Block {
    render() {
        return `{${this.body.map(v => v.toString()).join("")}}`;
    }
}


export class NamedClassDec extends CodeNode {
    ident: Stringable;
    extendsExpr: ?Stringable;
    body: Stringable;

    constructor(ident: Stringable, extendsExpr: ?Stringable, body: Stringable = new DeclarationBlock()) {
        super();
        this.ident = ident;
        this.extendsExpr = extendsExpr;
        this.body = body;
    }

    render() {
        const { extendsExpr } = this;
        let extendsStr = "";

        if (extendsExpr != null) {
            extendsStr = `extends ${extendsExpr.toString()}`;
        }

        return `class ${this.ident.toString()} ${extendsStr} ${this.body.toString()}\n\n`;
    }
}

export class ArgsList extends CodeNode {
    args: Stringable[];

    constructor(...args: Stringable[]) {
        super();
        this.args = args;
    }

    render() {
        return `(${this.args.map(v => v.toString()).join(", ")})`
    }
}

export class Invocation extends CodeNode {
    name: Stringable;
    args: Stringable;

    constructor(name: Stringable, args: Stringable) {
        super();
        this.name = name;
        this.args = args;
    }

    render() {
        return `${this.name.toString()}${this.args.toString()}`;
    }
}

export class MethodDeclaration extends StatementBlock {
    invocation: Stringable;

    constructor(invocation: Stringable, body: Stringable[] = []) {
        super(body);
        this.invocation = invocation;
    }

    render() {
        return `${this.invocation.toString()} { ${super.render()} }\n\n`;
    }
}

export class FunctionDeclaration extends MethodDeclaration {
    render() {
        return `function ${super.render()}`;
    }
}

export class CallbableDeclaration extends StatementBlock {
    args: ArgsList;

    constructor(args: ArgsList = new ArgsList()) {
        super();
        this.args = args;
    }

    render() {
        return `${this.args.toString()} => { ${super.render()} }`;
    }
}


export class Literal extends CodeNode {
    literal: any;

    constructor(literal: any) {
        super();
        this.literal = literal;
    }

    render() {
        return JSON.stringify(this.literal);
    }
}

export class ImportDeconstructor extends CodeNode {
    from: Stringable;
    deconstructions: Stringable[];

    constructor(from: Stringable, ...deconstructions: Stringable[]) {
        super();
        this.from = from;
        this.deconstructions = deconstructions;
        this.isExpression = false;
    }

    render() {
        return `import {${this.deconstructions.map(v => v.toString()).join(", ")}} from ${JSON.stringify(this.from.toString())};`;
    }
}

export class ExportImportDeconstructor extends CodeNode {
    from: Stringable;
    deconstructions: Stringable[];

    constructor(from: Stringable, ...deconstructions: Stringable[]) {
        super();
        this.from = from;
        this.deconstructions = deconstructions;
        this.isExpression = false;
    }

    render() {
        return `export {${this.deconstructions.map(v => v.toString()).join(", ")}} from ${JSON.stringify(this.from.toString())};`;
    }
}

export class ArrayLiteral extends CodeNode {
    elements: Array<Stringable>;

    constructor(...elements: Array<Stringable>) {
        super();
        this.elements = elements;
    }

    render() {
        return `[${this.elements.map(v => v.toString()).join(", ")}]`;
    }

}

export function exportedConst(ident: Stringable, expr: Stringable) {
    return new Export(new Const(new Assignment(ident, expr)));
}

export function exportedClass(ident: Stringable, extendsExpr: ?Stringable, body: Stringable[]) {
    return new Export(new NamedClassDec(ident, extendsExpr, new DeclarationBlock(body)));
}

export function invocation(expr: Stringable, ...args: Stringable[]) {
    return new Invocation(expr, new ArgsList(...args));
}

export function newInvocation(expr: Stringable, ...args: Stringable[]) {
    return new New(new Invocation(expr, new ArgsList(...args)));
}

export function methodDeclaration(name: Stringable, ...params: Stringable[]) {
    return new MethodDeclaration(new Invocation(name, new ArgsList(...params)));
}

export function propLiteralAccess(ident: Stringable, val: any) {
    return new PropertyExpressionAccess(ident, new Literal(val));
}

export function propExprAccess(ident: Stringable, expr: Stringable) {
    return new PropertyExpressionAccess(ident, expr);
}

export function propAccess(ident: Stringable, ...access: Stringable[]) {
    return new PropertyAccess(ident, ...access);
}

export function literal(val: any) {
    return new Literal(val);
}

export function objLiteral(...props: Stringable[]) {
    return new ObjectLiteral(props);
}

export function propDec(prop: Stringable, expression: Stringable) {
    return new PropertyDeclaration(prop, expression);
}

export function methodDec(name: Stringable, args: Stringable[], body: Stringable[]) {
    return new MethodDeclaration(new Invocation(name, new ArgsList(...args)), body);
}

export function staticMethodDec(name: Stringable, args: Stringable[], body: Stringable[]) {
    return new Static(new MethodDeclaration(new Invocation(name, new ArgsList(...args)), body));
}

export function getProp(name: Stringable, args: Stringable[], body: Stringable[]) {
    return new Get(methodDec(name, args, body));
}

export function setProp(name: Stringable, args: Stringable[], body: Stringable[]) {
    return new Set(methodDec(name, args, body));
}

export function assignment(name: Stringable, val: Stringable) {
    return new Assignment(name, val);
}

export function ret(val: Stringable) {
    return new Return(val);
}

export function comment(str: string) {
    return new Comment(str);
}

export function arrayLiteral(...items: Array<Stringable>) {
    return new ArrayLiteral(...items);
}

export function exportImportDecon(from: string, ...deconstructions: Array<Stringable>) {
    return new ExportImportDeconstructor(from, ...deconstructions);
}