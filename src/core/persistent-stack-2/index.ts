export class PersistentStack2<T> {
  private constructor(
    private readonly head: Node<T> | null,
    private readonly _size: number
  ) {}

  static from<T>(items: T[]): PersistentStack2<T> {
    let stack = new PersistentStack2<T>(null, 0);
    for (let i = 0; i < items.length; i++) {
      stack = stack.push(items[i]!);
    }
    return stack;
  }

  push(value: T): PersistentStack2<T> {
    return new PersistentStack2<T>(
      { value, next: this.head },
      this._size + 1
    );
  }

  pop(): PersistentStack2<T> {
    return new PersistentStack2<T>(this.head ? this.head.next : null, Math.max(0, this._size - 1));
  }

  peek(): T | undefined {
    return this.head?.value;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current: Node<T> | null = this.head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current: Node<T> | null = this.head;
    let index = 0;
    while (current !== null) {
      callback(current.value, index);
      current = current.next;
      index++;
    }
  }

  map<U>(fn: (value: T) => U): PersistentStack2<U> {
  const arr: U[] = [];
  let current: Node<T> | null = this.head;
  while (current !== null) {
    arr.push(fn(current.value));
    current = current.next;
  }
  return PersistentStack2.from(arr.reverse());
  }

  filter(fn: (value: T) => boolean): PersistentStack2<T> {
    const arr = this.toArray().filter(fn);
    return PersistentStack2.from(arr.reverse());
  }

  reverse(): PersistentStack2<T> {
    const arr = this.toArray();
    return PersistentStack2.from(arr);
  }

  concat(other: PersistentStack2<T>): PersistentStack2<T> {
    const thisArr = this.toArray();
    const otherArr = other.toArray();
    return PersistentStack2.from([...thisArr, ...otherArr].reverse());
  }

  every(fn: (value: T) => boolean): boolean {
    let current: Node<T> | null = this.head;
    while (current !== null) {
      if (!fn(current.value)) {
        return false;
      }
      current = current.next;
    }
    return true;
  }

  some(fn: (value: T) => boolean): boolean {
    let current: Node<T> | null = this.head;
    while (current !== null) {
      if (fn(current.value)) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  find(fn: (value: T) => boolean): T | undefined {
    let current: Node<T> | null = this.head;
    while (current !== null) {
      if (fn(current.value)) {
        return current.value;
      }
      current = current.next;
    }
    return undefined;
  }

  includes(value: T): boolean {
    return this.some(v => v === value);
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

  clone(): PersistentStack2<T> {
    return PersistentStack2.from(this.toArray())
  }

  toString(): string {
    return `PersistentStack2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'PersistentStack2', size: this.size, items: this.toArray() }
  }


  static of<T>(...items: T[]): PersistentStack2<T> {
    return PersistentStack2.from(items)
  }

  merge(other: PersistentStack2<T>): PersistentStack2<T> {
    return PersistentStack2.from([...this.toArray(), ...other.toArray()])
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }


  first(): T | undefined {
    const arr = this.toArray()
    return arr.length > 0 ? arr[0] : undefined
  }

  last(): T | undefined {
    const arr = this.toArray()
    return arr.length > 0 ? arr[arr.length - 1] : undefined
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
}

interface Node<T> {
  value: T;
  next: Node<T> | null;
}
