// @flow

export interface MethodSemigroup<T> {
    concat(other: T): T;
}

export interface Semigroup<T> {
    concat(a: T, b: T): T;
}

export interface Foldable<I> {
    reduce<R>(f: (result: R, next: I) => R, d: R): R;
}

export function getSemigroup<T, D: MethodSemigroup<T>>(source: D): Semigroup<T> {
    return {
        concat: (a: T, b: T) => ((a: any): D).concat(b)
    };
}

export function compose<A, B, C>(f: A => B, g: B => C): A => C {
    return (a: A) => g(f(a));
}

export function compose3<A, B, C, D>(f: A => B, g: B => C, h: C => D): A => D {
    return (a: A) => h(g(f(a)));
}


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

    concat<T: I & MethodSemigroup<I>>(other: OrderedObj<T>): OrderedObj<I> {
        const ordering = this.ordering.concat(other.ordering.filter(k => !(k in this.obj)));
        const result = {};
        ordering.forEach(k => {
            const left = this.obj[k];
            const right = other.obj[k];
            const { concat } = getSemigroup<I, T>(right);

            if (!left) result[k] = right;
            else if (!right) result[k] = left;
            else result[k] = concat(left, right);
        });

        return new OrderedObj<I>(result, ordering);
    }

    withKV(k: string, v: I): OrderedObj<I> {
        const ordering = this.ordering.concat(k in this.obj ? [] : [k]);
        return new OrderedObj<I>({ ...this.obj, [k]: v }, ordering);
    }

    zipWithKeysFrom(other: OrderedObj<string>): OrderedObj<I> {
        return this.reduce<OrderedObj<I>>((result: OrderedObj<I>, [next, k]: [any, string]) => {
            if (k in other.obj) {
                return result.concat(new OrderedObj<any>({ [other.obj[k]]: next }));
            }

            return result;
        }, new OrderedObj<I>());
    }

    map<R>(f: (obj: I, k: string) => R): OrderedObj<R> {
        const result = {};
        this.ordering.forEach(k => result[k] = f(this.obj[k], k));
        return new OrderedObj(result, this.ordering);
    }

    bimap<R>(f: (obj: I, k: string) => [string, R]): OrderedObj<R> {
        const result = {};
        const newOrdering = this.ordering.map(k => {
            const [k2, v] = f(this.obj[k], k);
            if (k2 in result) {
                throw new Error('bimap invariant broke: not all keys unique');
            }
            result[k2] = v;
            return k2;
        });
        return new OrderedObj(result, newOrdering);
    }

    forEach(f: (obj: I, k: string) => void) {
        this.ordering.forEach(k => f(this.obj[k], k));
    }

    reduce<R>(f: (result: R, next: [I, string]) => R, d: R): R {
        return this.ordering.reduce((p: R, n: string) => (f(p, [this.obj[n], n]): R), d);
    }

    items(): I[] {
        return this.ordering.map(k => this.obj[k]);
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

    reduce<R>(f: (result: R, next: string) => R, d: R): R {
        return this.items.reduce(f, d);
    }

    map(f: (v: string) => string): StringSet {
        return new StringSet(this.items.map(f));
    }

    concat(other: StringSet) {
        return new StringSet(this.items.concat(other.items));
    }
}

export class Conflictable<T> {
    values: Array<T>;

    constructor(values: Array<T>) {
        this.values = values;
    }

    concat(other: Conflictable<T>): Conflictable<T> {
        return new Conflictable(this.values.concat(other.values));
    }

    unwrap(errorMessage: string = "Unexpected conflict found."): ?T {
        if (this.values.length > 1) {
            throw new Error(errorMessage);
        }

        return this.values[0];
    }

    expectOne(emptyMessage: string = "No value was found.", conflictMessage: string = "Unexpected conflict found"): T {
        if (this.values.length === 0) {
            throw new Error(emptyMessage);
        }

        return (this.unwrap(conflictMessage): any);
    }

    unwrapConflicts<R>(mapConflict: (Array<T>) => R): R[] {
        if (this.values.length > 1) {
            return [mapConflict(this.values)];
        }

        return [];
    }
}

export function concatMap<T, R, D: MethodSemigroup<R>>(container: Foldable<T>, f: (val: T) => R, d: D): R {
    const { concat } = getSemigroup(d);
    return container.reduce((p: R, n) => concat(p, f(n)), (d: any));
}

export function flatten<T, D: MethodSemigroup<T>>(container: Foldable<T>, d: D): T {
    return concatMap<T, T, D>(container, i => i, d);
}

export function flattenOrderedObj<T, D: MethodSemigroup<T>>(container: OrderedObj<T>, d: D): T {
    return concatMap<[T, string], T, D>(container, ([i, _]) => i, d);
}