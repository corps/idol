// @flow

export class OrderedObj<I> {
    obj: { [k: string]: I };
    ordering: Array<string>;

    constructor(obj: { [k: string]: I } = {},
                ordering: string[] = Object.keys(obj).sort()) {
        this.obj = obj;
        this.ordering = ordering;
    }

    isEmpty(): boolean {
        for (let k in this.obj) {
            return true;
        }
        return false;
    }

    get length(): number {
        return Object.keys(this.obj).length;
    }

    concat(other: OrderedObj<I>): OrderedObj<I> {
        const ordering = this.ordering.concat(other.ordering.filter(k => !(k in this.obj)));
        const result = {};
        ordering.forEach(k => {
            const left = this.obj[k];
            const right = other.obj[k];

            if (!left) result[k] = right;
            else if (!right) result[k] = left;
            else result[k] = (left: any).concat(right);
        });

        return new OrderedObj<I>(result, ordering);
    }

    static fromIterable<A>(iter: Iterable<OrderedObj<A>>): OrderedObj<A> {
        let result: OrderedObj<A> = new OrderedObj<A>();
        for (let o of iter) {
            result = result.concat(o)
        }
        return result;
    }


    keys(): Array<string> {
        return Object.keys(this.obj);
    }

    values(): I[] {
        return this.ordering.map(k => this.obj[k]);
    }

    iter(): Iterator<[string, I]> {
        let i = 0;
        const obj = this.obj;
        const keys = this.keys();

        return ({
            [Symbol.iterator]() { return this; },
            next(): IteratorResult<[string, I], null> {
                if (i < keys.length) {
                    const key = keys[i];
                    return { done: false, value: [key, obj[key]] }
                }
                return { done: true }
            }
        }: any);
    }

    get(k: string): Alt<I> {
        if (k in this.obj) {
            return Alt.lift(this.obj[k])
        }

        return Alt.empty();
    }
}

export class StringSet {
    items: Array<string>;

    constructor(items: string[] = []) {
        const obj: { [k: string]: any[] } = {};
        this.items = [];

        items.forEach(i => {
            if (i in obj) return;
            obj[i] = [];
            this.items.push(i);
        });
    }

    concat(other: StringSet) {
        return new StringSet(this.items.concat(other.items));
    }
}

export type AltBinding<T> = Generator<boolean, T, null>;

export class Alt<T> {
    value: Array<T>;

    constructor(value: Array<T>) {
        this.value = value.slice(0, 1);
    }

    static from<T>(f: AltBinding<T>): Alt<T> {
        let result: IteratorResult<boolean, T>;

        while (!(result = f.next()).done) {
            if (!result.value) {
                return new Alt([]);
            }
        }

        return new Alt([(result.value: any)]);
    }

    static lift<T>(v: T): Alt<T> {
        return new Alt([v]);
    }

    static empty<T>(): Alt<T> {
        return new Alt<T>([]);
    }

    unwrap(): T {
        if (this.value.length) {
            return this.value[0];
        }

        throw new Error("Unwrapped empty value!");
    }

    getOr(d: T): T {
        if (this.value.length) {
            return this.value[0];
        }

        return d;
    }

    binding(): AltBinding<T> {
        const value = this.value;
        return (function* () {
            if (!value.length) {
                yield false;
            }
            return value[0];
        })();
    }

    isEmpty(): boolean {
        return !this.value.length;
    }

    concat(other: Alt<T>): Alt<T> {
        if (this.isEmpty()) return other;
        return this;
    }

    map<A>(f: (v: T) => A): Alt<A> {
        if (this.isEmpty()) return Alt.empty();
        return Alt.lift(f(this.unwrap()));
    }

    either(other: Alt<T>): Alt<T> {
        if (!this.isEmpty()) {
            throw new Error("Unexpected conflict!")
        }

        return other;
    }
}

export class Disjoint<T> {
    value: Array<T>;

    constructor(value: Array<T>) {
        this.value = value.slice();
    }

    static from<T>(from: Iterable<T>): Disjoint<T> {
        const value: Array<T> = [];

        for (let i of from) {
            value.push(i);
        }

        return new Disjoint(value);
    }

    static lift<T>(v: T): Disjoint<T> {
        return new Disjoint([v]);
    }

    static empty<T>(): Disjoint<T> {
        return new Disjoint<T>([]);
    }

    unwrap(): T {
        if (this.value.length === 1) {
            return this.value[0];
        }

        if (this.value.length > 1) {
            throw new Error("Unexpected conflict!")
        }

        throw new Error("Unwrapped empty value!");
    }

    getOr(d: T): T {
        if (this.value.length) {
            return this.unwrap();
        }

        return d;
    }

    binding(): AltBinding<T> {
        const self = this;
        return (function* () {
            if (!self.value.length) {
                yield false;
            }
            return self.unwrap();
        })();
    }

    isEmpty(): boolean {
        return !this.value.length;
    }

    concat(other: Disjoint<T>): Disjoint<T> {
        return new Disjoint(this.value.concat(other.value));
    }

    map<A>(f: (v: T) => A): Disjoint<A> {
        if (this.isEmpty()) return Disjoint.empty();
        return Disjoint.lift(f(this.unwrap()));
    }
}

export function naiveObjUpdate(one: any, other: any) {
    for (let k in other) {
        if (k in one) one[k] = one[k].concat(other[k]);
        else one[k] = other[k];
    }
}

export function naiveObjectConcat(one: any, other: any) {
    const result = { ...one };
    naiveObjUpdate(result, other);
    result.constructor = one.constructor;
    return result;
}