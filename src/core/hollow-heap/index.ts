import type { HollowHeapOptions } from './types.js';

class HollowHeapNode<T> {
  value: T;
  rank: number;
  children: HollowHeapNode<T>[];
  next: HollowHeapNode<T> | null;
  isHollow: boolean;

  constructor(value: T) {
    this.value = value;
    this.rank = 0;
    this.children = [];
    this.next = null;
    this.isHollow = false;
  }
}

export class HollowHeap<T> {
  private roots: HollowHeapNode<T>[];
  private itemCount: number;
  private comparator: (a: T, b: T) => number;
  private minRoot: HollowHeapNode<T> | null;

  constructor(options?: HollowHeapOptions & { comparator?: (a: T, b: T) => number }) {
    this.roots = [];
    this.itemCount = 0;
    this.comparator = options?.comparator || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
    this.minRoot = null;
  }

  insert(value: T): HollowHeapNode<T> {
    const node = new HollowHeapNode(value);
    this.roots.push(node);
    this.updateMin(node);
    this.itemCount++;
    return node;
  }

  extractMin(): T | undefined {
    if (this.minRoot === null || this.minRoot === undefined) {
      return undefined;
    }

    const minValue = this.minRoot.value;
    const minNode = this.minRoot;
    this.minRoot = null;

    if (!minNode.isHollow) {
      minNode.isHollow = true;
      this.itemCount--;
      this.cleanup();
    }

    return minValue;
  }

  peek(): T | undefined {
    return this.minRoot?.value;
  }

  meld(other: HollowHeap<T>): void {
    for (const root of other.roots) {
      this.roots.push(root);
      this.updateMin(root);
    }
    this.itemCount += other.itemCount;
    other.roots = [];
    other.itemCount = 0;
    other.minRoot = null;
  }

  decreaseKey(node: HollowHeapNode<T>, newValue: T): void {
    if (this.comparator(newValue, node.value) > 0) {
      throw new Error('New value must be less than or equal to current value');
    }

    if (node.isHollow) {
      throw new Error('Node has already been deleted');
    }

    node.value = newValue;
    if (this.minRoot === null || this.comparator(newValue, this.minRoot.value) < 0) {
      this.minRoot = node;
    }
  }

  delete(node: HollowHeapNode<T>): void {
    if (node.isHollow) {
      return;
    }

    node.isHollow = true;
    this.itemCount--;

    if (node === this.minRoot) {
      this.minRoot = null;
      this.cleanup();
    }
  }

  get size(): number {
    return this.itemCount;
  }

  isEmpty(): boolean {
    return this.itemCount === 0;
  }

  clear(): void {
    this.roots = [];
    this.itemCount = 0;
    this.minRoot = null;
  }

  toArray(): T[] {
    const result: T[] = [];
    const visited = new Set<HollowHeapNode<T>>();
    const queue: HollowHeapNode<T>[] = [...this.roots];
    let _qi = 0;

    while (_qi < queue.length) {
      const node = queue[_qi++];
      if (!node) {
        break;
      }
      if (visited.has(node)) {
        continue;
      }
      visited.add(node);

      if (!node.isHollow) {
        result.push(node.value);
      }

      for (const child of node.children) {
        queue.push(child);
      }
    }

    return result.sort((a, b) => this.comparator(a, b));
  }

  forEach(callback: (value: T) => void): void {
    const values = this.toArray();
    for (const value of values) {
      callback(value);
    }
  }

  private updateMin(node: HollowHeapNode<T>): void {
    if (this.minRoot === null || this.comparator(node.value, this.minRoot.value) < 0) {
      this.minRoot = node;
    }
  }

  private   cleanup(): void {
    const rankBuckets = new Map<number, HollowHeapNode<T>>();
    const newRoots: HollowHeapNode<T>[] = [];
    const toProcess: HollowHeapNode<T>[] = [];
    const visited = new Set<HollowHeapNode<T>>();

    for (const root of this.roots) {
      if (!visited.has(root)) {
        toProcess.push(root);
        visited.add(root);
      }
    }

    let _qi = 0;
    while (_qi < toProcess.length) {
      const node = toProcess[_qi++]!;

      if (node.isHollow) {
        for (const child of node.children) {
          if (!visited.has(child)) {
            toProcess.push(child);
            visited.add(child);
          }
        }
      } else {
        let current = node;
        let iterationCount = 0;
        const maxIterations = 1000;

        while (rankBuckets.has(current.rank) && iterationCount < maxIterations) {
          const other = rankBuckets.get(current.rank)!;
          rankBuckets.delete(current.rank);
          current = this.linkNodes(current, other);
          iterationCount++;
        }

        if (iterationCount >= maxIterations) {
          break;
        }

        rankBuckets.set(current.rank, current);
      }
    }

    for (const node of Array.from(rankBuckets.values())) {
      newRoots.push(node);
    }

    this.roots = newRoots;
    this.recomputeMin();
  }

  private linkNodes(a: HollowHeapNode<T>, b: HollowHeapNode<T>): HollowHeapNode<T> {
    if (this.comparator(a.value, b.value) > 0) {
      b.children.push(a);
      b.rank = Math.max(b.rank, a.rank + 1);
      return b;
    } else {
      a.children.push(b);
      a.rank = Math.max(a.rank, b.rank + 1);
      return a;
    }
  }

  private recomputeMin(): void {
    this.minRoot = null;
    for (const root of this.roots) {
      if (!root.isHollow && (this.minRoot === null || this.comparator(root.value, this.minRoot.value) < 0)) {
        this.minRoot = root;
      }
    }
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
    return `${HollowHeap}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'HollowHeap', size: this.size, items: this.toArray() }
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
    return 'HollowHeap'
  }

  map<U>(fn: (item: T, index: number) => U): U[] {
    return this.toArray().map(fn)
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.toArray().filter(predicate)
  }

  reduce<U>(reducer: (acc: U, item: T) => U, initialValue: U): U {
    return this.toArray().reduce(reducer, initialValue)
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  reduceRight<U>(reducer: (acc: U, item: T) => U, initialValue: U): U {
    return this.toArray().reduceRight(reducer, initialValue)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: T[]): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  difference(other: T[]): T[] {
    const set = new Set(other)
    return this.toArray().filter(item => !set.has(item))
  }

  union(other: T[]): T[] {
    return [...new Set([...this.toArray(), ...other])]
  }

  pluck<K extends keyof T>(key: K): T[K][] {
    return this.toArray().map(item => item[key])
  }

  nth(n: number): T | undefined {
    return this.at(n - 1)
  }

  head(): T | undefined {
    return this.first()
  }

  tail(): T[] {
    return this.skip(1)
  }

  intersperse(separator: T): T[] {
    const arr = this.toArray()
    if (arr.length <= 1) return [...arr]
    const result: T[] = []
    for (let i = 0; i < arr.length; i++) {
      if (i > 0) result.push(separator)
      result.push(arr[i]!)
    }
    return result
  }

  prepend(item: T): T[] {
    return [item, ...this.toArray()]
  }

  append(item: T): T[] {
    return [...this.toArray(), item]
  }

  zipWith<U, R>(other: Iterable<U>, fn: (a: T, b: U) => R): R[] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: R[] = []
    for (let i = 0; i < len; i++) {
      result.push(fn(a[i]!, b[i]!))
    }
    return result
  }

  rotate(n: number): T[] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const k = ((n % arr.length) + arr.length) % arr.length
    return [...arr.slice(k), ...arr.slice(0, k)]
  }

  dot(this: { toArray(): number[] }, other: number[]): number {
    const a = this.toArray()
    const len = Math.min(a.length, other.length)
    let sum = 0
    for (let i = 0; i < len; i++) {
      sum += a[i]! * other[i]!
    }
    return sum
  }

  sliding(size: number, step = 1): T[][] {
    const arr = this.toArray()
    if (size <= 0 || step <= 0) return []
    const result: T[][] = []
    for (let i = 0; i + size <= arr.length; i += step) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  adjacentPairs(): [T, T][] {
    const arr = this.toArray()
    const result: [T, T][] = []
    for (let i = 0; i + 1 < arr.length; i++) {
      result.push([arr[i]!, arr[i + 1]!])
    }
    return result
  }
}

export type { HollowHeapOptions } from './types.js';
