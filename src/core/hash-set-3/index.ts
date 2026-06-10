export type HashEntry<T> = {
  hash: number;
  value: T;
  distance: number;
};

export class HashSet3<T> {
  private entries: (HashEntry<T> | undefined)[];
  private _size: number;
  private capacity: number;
  private readonly loadFactor: number;

  constructor(initialCapacity: number = 16) {
    this.capacity = Math.max(2, this.nextPowerOfTwo(initialCapacity));
    this.entries = new Array(this.capacity);
    this._size = 0;
    this.loadFactor = 0.75;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.entries.fill(undefined);
    this._size = 0;
  }

  private hash(value: T): number {
    const str = String(value);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0;
  }

  private getIndex(hash: number): number {
    return hash & (this.capacity - 1);
  }

  private nextPowerOfTwo(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  private resize(): void {
    const oldEntries = this.entries;
    this.capacity = this.nextPowerOfTwo(Math.floor(this.capacity * 2));
    this.entries = new Array(this.capacity);
    this._size = 0;

    for (const entry of oldEntries) {
      if (entry !== undefined) {
        this.insertEntry(entry);
      }
    }
  }

  private insertEntry(entry: HashEntry<T>): void {
    let index = this.getIndex(entry.hash);
    let distance = 0;

    while (true) {
      const current = this.entries[index];

      if (current === undefined) {
        this.entries[index] = { ...entry, distance };
        this._size++;
        return;
      }

      if (current.hash === entry.hash && current.value === entry.value) {
        return;
      }

      if (current.distance < distance) {
        [this.entries[index], entry] = [entry, current];
        distance = entry.distance;
      }

      index = (index + 1) & (this.capacity - 1);
      distance++;
    }
  }

  add(value: T): boolean {
    const hash = this.hash(value);
    const entry: HashEntry<T> = { hash, value, distance: 0 };

    if (this._size >= this.capacity * this.loadFactor) {
      this.resize();
    }

    const oldSize = this._size;
    this.insertEntry(entry);
    return this._size > oldSize;
  }

  has(value: T): boolean {
    const hash = this.hash(value);
    let index = this.getIndex(hash);
    let distance = 0;

    while (distance < this.capacity) {
      const current = this.entries[index];

      if (current === undefined) {
        return false;
      }

      if (current.distance < distance) {
        return false;
      }

      if (current.hash === hash && current.value === value) {
        return true;
      }

      index = (index + 1) & (this.capacity - 1);
      distance++;
    }

    return false;
  }

  delete(value: T): boolean {
    const hash = this.hash(value);
    let index = this.getIndex(hash);
    let distance = 0;

    while (distance < this.capacity) {
      const current = this.entries[index];

      if (current === undefined) {
        return false;
      }

      if (current.distance < distance) {
        return false;
      }

      if (current.hash === hash && current.value === value) {
        this.entries[index] = undefined;
        this._size--;
        this.backshift(index);
        return true;
      }

      index = (index + 1) & (this.capacity - 1);
      distance++;
    }

    return false;
  }

  private backshift(index: number): void {
    let nextIndex = (index + 1) & (this.capacity - 1);

    while (this.entries[nextIndex] !== undefined && this.entries[nextIndex]!.distance > 0) {
      const entry = this.entries[nextIndex]!;
      entry.distance--;
      this.entries[index] = entry;
      this.entries[nextIndex] = undefined;
      index = nextIndex;
      nextIndex = (index + 1) & (this.capacity - 1);
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    for (const entry of this.entries) {
      if (entry !== undefined) {
        result.push(entry.value);
      }
    }
    return result;
  }

  forEach(callback: (value: T, set: HashSet3<T>) => void): void {
    for (const entry of this.entries) {
      if (entry !== undefined) {
        callback(entry.value, this);
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const entry of this.entries) {
      if (entry !== undefined) {
        yield entry.value;
      }
    }
  }

  union(other: HashSet3<T>): HashSet3<T> {
    const result = new HashSet3<T>(this.capacity + other.capacity);
    for (const value of this) {
      result.add(value);
    }
    for (const value of other) {
      result.add(value);
    }
    return result;
  }

  intersection(other: HashSet3<T>): HashSet3<T> {
    const result = new HashSet3<T>();
    for (const value of this) {
      if (other.has(value)) {
        result.add(value);
      }
    }
    return result;
  }

  difference(other: HashSet3<T>): HashSet3<T> {
    const result = new HashSet3<T>();
    for (const value of this) {
      if (!other.has(value)) {
        result.add(value);
      }
    }
    return result;
  }

  isSubsetOf(other: HashSet3<T>): boolean {
    if (this._size > other._size) {
      return false;
    }
    for (const value of this) {
      if (!other.has(value)) {
        return false;
      }
    }
    return true;
  }

  toString(): string {
    return `${HashSet3}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'HashSet3', size: this.size, items: this.toArray() }
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
    return this.toArray().filter(predicate).length
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    return [...new Set(this.toArray())]
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

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  equals(other: T[]): boolean {
    const a = this.toArray()
    if (a.length !== other.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== other[i]) return false
    }
    return true
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }

  with(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    arr[index] = value
    return arr
  }

  shuffle(): T[] {
    const arr = [...this.toArray()]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = tmp
    }
    return arr
  }

  sample(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr[Math.floor(Math.random() * arr.length)]
  }

  toSet(): Set<T> {
    return new Set(this.toArray())
  }

  filterMap<U>(fn: (item: T) => U | undefined): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      const mapped = fn(item)
      if (mapped !== undefined) {
        result.push(mapped)
      }
    }
    return result
  }

  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
  }

  distinctBy<K>(keyFn: (item: T) => K): T[] {
    const seen = new Set<K>()
    const result: T[] = []
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(item)
      }
    }
    return result
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  frequency(item: T): number {
    let count = 0
    for (const element of this.toArray()) {
      if (element === item) count++
    }
    return count
  }

  interleave(other: T[]): T[] {
    const a = this.toArray()
    const result: T[] = []
    const maxLen = Math.max(a.length, other.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < a.length) result.push(a[i]!)
      if (i < other.length) result.push(other[i]!)
    }
    return result
  }

  toMap<K, V>(keyFn: (item: T) => K, valueFn: (item: T) => V): Map<K, V> {
    const map = new Map<K, V>()
    for (const item of this.toArray()) {
      map.set(keyFn(item), valueFn(item))
    }
    return map
  }

  groupBy<K>(keyFn: (item: T) => K): Record<string, T[]> {
    const groups: Record<string, T[]> = {}
    for (const item of this.toArray()) {
      const key = String(keyFn(item))
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }

  groupByMap<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      const group = groups.get(key)
      if (group) {
        group.push(item)
      } else {
        groups.set(key, [item])
      }
    }
    return groups
  }

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
  }

  reduceWhile<U>(
    predicate: (acc: U) => boolean,
    reducer: (acc: U, item: T) => U,
    initialValue: U
  ): U {
    let acc = initialValue
    for (const item of this.toArray()) {
      if (!predicate(acc)) break
      acc = reducer(acc, item)
    }
    return acc
  }

  minBy<K>(keyFn: (item: T) => K): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    let minItem = arr[0]!
    let minKey = keyFn(minItem)
    for (let i = 1; i < arr.length; i++) {
      const item = arr[i]!
      const key = keyFn(item)
      if (key < minKey) {
        minKey = key
        minItem = item
      }
    }
    return minItem
  }

  maxBy<K>(keyFn: (item: T) => K): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    let maxItem = arr[0]!
    let maxKey = keyFn(maxItem)
    for (let i = 1; i < arr.length; i++) {
      const item = arr[i]!
      const key = keyFn(item)
      if (key > maxKey) {
        maxKey = key
        maxItem = item
      }
    }
    return maxItem
  }

  span(predicate: (item: T) => boolean): [T[], T[]] {
    const arr = this.toArray()
    let i = 0
    while (i < arr.length && predicate(arr[i]!)) {
      i++
    }
    return [arr.slice(0, i), arr.slice(i)]
  }

  breakWhen(predicate: (item: T) => boolean): [T[], T[]] {
    return this.span(item => !predicate(item))
  }

  scan<U>(reducer: (acc: U, item: T) => U, initialValue: U): U[] {
    const result: U[] = []
    let acc = initialValue
    for (const item of this.toArray()) {
      acc = reducer(acc, item)
      result.push(acc)
    }
    return result
  }

  flatten(depth: number = 1): T[] {
    const flat = (arr: T[], d: number): T[] => {
      const result: T[] = []
      for (const item of arr) {
        if (Array.isArray(item) && d > 0) {
          result.push(...flat(item as unknown as T[], d - 1))
        } else {
          result.push(item)
        }
      }
      return result
    }
    return flat(this.toArray(), depth)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  get [Symbol.toStringTag](): string {
    return 'HashSet3'
  }
}
