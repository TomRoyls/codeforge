export class AtomicSet2<T> {
  private _set: Set<T>;
  private _version: number;

  constructor() {
    this._set = new Set<T>();
    this._version = 0;
  }

  add(item: T): boolean {
    const existed = this._set.has(item);
    this._set.add(item);
    if (!existed) {
      this._version++;
    }
    return !existed;
  }

  delete(item: T): boolean {
    const result = this._set.delete(item);
    if (result) {
      this._version++;
    }
    return result;
  }

  has(item: T): boolean {
    return this._set.has(item);
  }

  compareAndSwap(expected: T, newValue: T): boolean {
    if (expected === newValue) {
      return false;
    }

    const currentVersion = this._version;
    const hasExpected = this._set.has(expected);

    if (!hasExpected) {
      return false;
    }

    this._set.delete(expected);
    const addResult = this._set.add(newValue);

    if (!addResult) {
      this._set.add(expected);
      return false;
    }

    this._version = currentVersion + 1;
    return true;
  }

  get size(): number {
    return this._set.size;
  }

  isEmpty(): boolean {
    return this._set.size === 0;
  }

  toArray(): T[] {
    return Array.from(this._set);
  }

  clear(): void {
    this._set.clear();
    this._version++;
  }

  forEach(callback: (item: T) => void): void {
    this._set.forEach(callback);
  }

  union(other: AtomicSet2<T>): AtomicSet2<T> {
    const result = new AtomicSet2<T>();
    this.forEach((item) => {
      result._set.add(item);
    });
    other.forEach((item) => {
      result._set.add(item);
    });
    return result;
  }

  intersection(other: AtomicSet2<T>): AtomicSet2<T> {
    const result = new AtomicSet2<T>();
    this.forEach((item) => {
      if (other.has(item)) {
        result._set.add(item);
      }
    });
    return result;
  }

  difference(other: AtomicSet2<T>): AtomicSet2<T> {
    const result = new AtomicSet2<T>();
    this.forEach((item) => {
      if (!other.has(item)) {
        result._set.add(item);
      }
    });
    return result;
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `${AtomicSet2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'AtomicSet2', size: this.size, items: this.toArray() }
  }

  static from<T>(items: T[]): AtomicSet2<T> {
    const instance = new AtomicSet2<T>()
    for (const item of items) {
      instance.add(item)
    }
    return instance
  }

  map<R>(fn: (item: T) => R): R[] {
    return this.toArray().map(fn)
  }

  filter(fn: (item: T) => boolean): T[] {
    return this.toArray().filter(fn)
  }

  reduce<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduce(fn, initial)
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  groupBy<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  clone(): AtomicSet2<T> {
    const c = new AtomicSet2<T>()
    for (const item of this.toArray()) {
      c.add(item)
    }
    return c
  }

  tap(fn: (collection: AtomicSet2<T>) => void): AtomicSet2<T> {
    fn(this)
    return this
  }

  equals(other: AtomicSet2<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  zip<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: [T, U][] = []
    for (let i = 0; i < len; i++) {
      result.push([a[i]!, b[i]!])
    }
    return result
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  static empty<T>(): AtomicSet2<T> {
    return new AtomicSet2<T>()
  }

  static of<T>(...items: T[]): AtomicSet2<T> {
    return AtomicSet2.from(items)
  }
}
