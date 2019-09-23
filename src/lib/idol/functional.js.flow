// @flow

export class OrderedObj<I> {
  obj: { [k: string]: I };
  ordering: Array<string>;

  constructor(obj: { [k: string]: I } = {}, ordering: string[] = Object.keys(obj).sort()) {
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

  map<R>(f: I => R): OrderedObj<R> {
    const newObj: { [k: string]: R } = {};
    this.ordering.forEach(k => (newObj[k] = f(this.obj[k])));
    return new OrderedObj<R>(newObj, this.ordering);
  }

  mapIntoIterable<R>(f: (string, I) => R): Iterable<R> {
    return this.ordering.map(k => f(k, this.obj[k]));
  }

  mapAndFilter<R>(f: I => Alt<R>): OrderedObj<R> {
    return OrderedObj.fromIterable<R>(
      this.keys().reduce(
        (result, k) =>
          result.concat(
            f(this.obj[k])
              .map(v => [new OrderedObj<R>({ [k]: v })])
              .getOr([])
          ),
        []
      )
    );
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
      result = result.concat(o);
    }
    return result;
  }

  keys(): Array<string> {
    return Object.keys(this.obj);
  }

  concatMap<R: { concat(r: any): any } | Array<any> | any[]>(f: (k: string, i: I) => R, d: R): R {
    return this.ordering.reduce(
      (result: R, nextK: string): R => result.concat(f(nextK, this.obj[nextK])),
      d
    );
  }

  values(): I[] {
    return this.ordering.map(k => this.obj[k]);
  }

  iter(): Iterator<[string, I]> {
    let i = 0;
    const obj = this.obj;
    const keys = this.keys();

    return ({
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<[string, I], null> {
        if (i < keys.length) {
          const key = keys[i];
          return { done: false, value: [key, obj[key]] };
        }
        return { done: true };
      }
    }: any);
  }

  get(k: string): Alt<I> {
    if (k in this.obj) {
      return Alt.lift(this.obj[k]);
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
    return (function*() {
      if (!value.length) {
        yield false;
      }
      return value[0];
    })();
  }

  bind<R>(f: (v: T) => Alt<R>): Alt<R> {
    if (this.isEmpty()) return (this: any);
    return f(this.unwrap());
  }

  isEmpty(): boolean {
    return !this.value.length;
  }

  concat(other: Alt<T>): Alt<T> {
    if (this.isEmpty()) return other;
    return this;
  }

  map<A>(f: (v: T) => A): Alt<A> {
    if (this.isEmpty()) return (this: any);
    return Alt.lift(f(this.unwrap()));
  }

  either(other: Alt<T>): Alt<T> {
    if (!this.isEmpty() && !other.isEmpty()) {
      throw new Error(`Unexpected conflict, found ${this.value.join(" ")}`);
    }

    return this.concat(other);
  }

  filter(pred: T => boolean): Alt<T> {
    if (this.isEmpty()) return this;
    if (pred(this.unwrap())) return this;
    return Alt.empty();
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

export function cachedProperty<T>(store: any, key: string, f: () => T): T {
  key = "__" + key;
  if (key in store) return store[key];
  return (store[key] = f());
}
