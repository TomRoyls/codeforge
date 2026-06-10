import type { HalvingHeapOptions } from './types.js';

class HalvingHeapNode<T> {
  children: HalvingHeapNode<T>[];
  rank: number;
  value: T;

  constructor(value: T) {
    this.value = value;
    this.rank = 0;
    this.children = [];
  }
}

export class HalvingHeap<T> {
  private capacity: number | undefined;
  private comparator: (a: T, b: T) => number;
  private itemCount: number;
  private roots: HalvingHeapNode<T>[];

  constructor(options?: HalvingHeapOptions & { comparator?: (a: T, b: T) => number }) {
    this.roots = [];
    this.itemCount = 0;
    this.comparator = options?.comparator || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
    this.capacity = options?.capacity;
  }

  get size(): number {
    return this.itemCount;
  }

  clear(): void {
    this.roots = [];
    this.itemCount = 0;
  }

  extractMin(): T | undefined {
    if (this.roots.length === 0) {
      return undefined;
    }

    let minIndex = 0;
    for (let i = 1; i < this.roots.length; i++) {
      if (this.comparator(this.roots[i]!.value, this.roots[minIndex]!.value) < 0) {
        minIndex = i;
      }
    }

    const minNode = this.roots.splice(minIndex, 1)[0]!;
    this.itemCount--;

    for (const child of minNode.children) {
      this.roots.push(child);
    }

    this.halve();

    return minNode.value;
  }

  forEach(callback: (value: T) => void): void {
    const values = this.toArray();
    for (const value of values) {
      callback(value);
    }
  }

  insert(value: T): void {
    const node = new HalvingHeapNode(value);
    this.roots.push(node);
    this.itemCount++;
  }

  isEmpty(): boolean {
    return this.itemCount === 0;
  }

  meld(other: HalvingHeap<T>): void {
    for (const root of other.roots) {
      this.roots.push(root);
    }

    this.itemCount += other.itemCount;
    other.roots = [];
    other.itemCount = 0;

    this.halve();
  }

  peek(): T | undefined {
    if (this.roots.length === 0) {
      return undefined;
    }

    let minValue = this.roots[0]!.value;
    for (let i = 1; i < this.roots.length; i++) {
      if (this.comparator(this.roots[i]!.value, minValue) < 0) {
        minValue = this.roots[i]!.value;
      }
    }

    return minValue;
  }

  toArray(): T[] {
    const result: T[] = [];
    const allNodes: HalvingHeapNode<T>[] = [];

    const collect = (nodes: HalvingHeapNode<T>[]): void => {
      for (const node of nodes) {
        allNodes.push(node);
        collect(node.children);
      }
    };

    collect(this.roots);

    for (const node of allNodes) {
      result.push(node.value);
    }

    return result.sort((a, b) => this.comparator(a, b));
  }

  private halve(): void {
    const rankMap = new Map<number, HalvingHeapNode<T>>();
    const newRoots: HalvingHeapNode<T>[] = [];

    for (const root of this.roots) {
      let current = root;
      const maxIterations = 1000;
      let iterationCount = 0;

      while (rankMap.has(current.rank) && iterationCount < maxIterations) {
        const other = rankMap.get(current.rank)!;
        rankMap.delete(current.rank);
        current = this.link(current, other);
        iterationCount++;
      }

      if (iterationCount >= maxIterations) {
        break;
      }

      rankMap.set(current.rank, current);
    }

    for (const node of rankMap.values()) {
      newRoots.push(node);
    }

    this.roots = newRoots;

    const targetCount = Math.ceil(this.roots.length / 2);

    while (this.roots.length > targetCount) {
      const a = this.roots.pop()!;
      const b = this.roots.pop()!;

      if (b) {
        const linked = this.link(a, b);
        this.roots.push(linked);
      } else {
        this.roots.push(a);
        break;
      }
    }

    if (this.capacity !== undefined && this.roots.length > this.capacity) {
      this.roots = this.roots.slice(0, this.capacity);
    }
  }

  private link(a: HalvingHeapNode<T>, b: HalvingHeapNode<T>): HalvingHeapNode<T> {
    if (this.comparator(a.value, b.value) <= 0) {
      a.children.push(b);
      a.rank = Math.max(a.rank, b.rank + 1);
      return a;
    }

    b.children.push(a);
    b.rank = Math.max(b.rank, a.rank + 1);
    return b;
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
    return `${HalvingHeap}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'HalvingHeap', size: this.size, items: this.toArray() }
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

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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
    return 'HalvingHeap'
  }
}

export type { HalvingHeapOptions } from './types.js';
