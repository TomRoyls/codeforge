export class BeapSet2<T> {
  private data: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  add(value: T): boolean {
    if (this.has(value)) return false;
    this.data.push(value);
    this.siftUp(this.data.length - 1);
    return true;
  }

  has(value: T): boolean {
    return this.findIndex(value) !== -1;
  }

  delete(value: T): boolean {
    const index = this.findIndex(value);
    if (index === -1) return false;

    const last = this.data.pop()!;

    if (index < this.data.length) {
      this.data[index] = last;
      this.siftDown(index);
    }

    return true;
  }

  get size(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  clear(): void {
    this.data = [];
  }

  min(): T | undefined {
    return this.data[0];
  }

  max(): T | undefined {
    if (this.data.length === 0) return undefined;
    let maxVal = this.data[0]!;
    for (let i = 1; i < this.data.length; i++) {
      if (this.comparator(this.data[i]!, maxVal) > 0) {
        maxVal = this.data[i]!;
      }
    }
    return maxVal;
  }

  forEach(callback: (value: T) => void): void {
    const sorted = this.toArray();
    for (const value of sorted) {
      callback(value);
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    const copy = [...this.data];

    while (copy.length > 0) {
      let minIndex = 0;
      for (let i = 1; i < copy.length; i++) {
        if (this.comparator(copy[i]!, copy[minIndex]!) < 0) {
          minIndex = i;
        }
      }
      result.push(copy[minIndex]!);
      copy.splice(minIndex, 1);
    }

    return result;
  }

  private findIndex(value: T): number {
    for (let i = 0; i < this.data.length; i++) {
      if (this.comparator(this.data[i]!, value) === 0) {
        return i;
      }
    }
    return -1;
  }

  private getRow(index: number): number {
    return Math.ceil((Math.sqrt(8 * index + 1) - 1) / 2);
  }

  private getCol(index: number): number {
    const row = this.getRow(index);
    return index - (row * (row + 1)) / 2;
  }

  private getParentIndices(index: number): number[] {
    const row = this.getRow(index);
    const col = this.getCol(index);

    if (row === 0) return [];

    const parentRow = row - 1;
    const parent1Index = parentRow * (parentRow + 1) / 2 + col;
    const parent2Index = col > 0 ? parentRow * (parentRow + 1) / 2 + col - 1 : -1;

    const parents = [parent1Index];
    if (parent2Index >= 0) {
      parents.push(parent2Index);
    }

    return parents;
  }

  private siftUp(index: number): void {
    if (index === 0) return;

    const parents = this.getParentIndices(index);
    const current = this.data[index]!;

    let shouldSwap = false;
    let swapParentIndex = -1;

    for (const parentIndex of parents) {
      if (this.comparator(current, this.data[parentIndex]!) < 0) {
        if (swapParentIndex === -1 || this.comparator(this.data[parentIndex]!, this.data[swapParentIndex]!) < 0) {
          swapParentIndex = parentIndex;
        }
        shouldSwap = true;
      }
    }

    if (shouldSwap && swapParentIndex >= 0) {
      [this.data[index], this.data[swapParentIndex]] = [this.data[swapParentIndex]!, this.data[index]!];
      this.siftUp(swapParentIndex);
    }
  }

  private siftDown(index: number): void {
    const row = this.getRow(index);
    const col = this.getCol(index);

    const nextRow = row + 1;
    const child1Index = (nextRow * (nextRow + 1)) / 2 + col;
    const child2Index = (nextRow * (nextRow + 1)) / 2 + (col + 1);

    let smallest = index;

    if (child1Index < this.data.length && this.comparator(this.data[child1Index]!, this.data[smallest]!) < 0) {
      smallest = child1Index;
    }

    if (child2Index < this.data.length && this.comparator(this.data[child2Index]!, this.data[smallest]!) < 0) {
      smallest = child2Index;
    }

    if (smallest !== index) {
      [this.data[index], this.data[smallest]] = [this.data[smallest]!, this.data[index]!];
      this.siftDown(smallest);
    }
  }


  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = 0; i < this.size; i++) {
      yield this.data[i]!;
    }
  }

  toString(): string {
    return `${BeapSet2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'BeapSet2', size: this.size, items: this.toArray() }
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



  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  reverse(): T[] {
    return this.toArray().reverse()
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

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  clone(): BeapSet2<T> {
    const c = new BeapSet2<T>()
    for (const item of this.toArray()) {
      c.add(item)
    }
    return c
  }

  tap(fn: (collection: BeapSet2<T>) => void): BeapSet2<T> {
    fn(this)
    return this
  }

  equals(other: BeapSet2<T>): boolean {
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

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: Iterable<T>): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  difference(other: Iterable<T>): T[] {
    const exclude = new Set(other)
    return this.toArray().filter(item => !exclude.has(item))
  }

  union(other: Iterable<T>): T[] {
    const set = new Set<T>([...this.toArray(), ...other])
    return [...set]
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

  reduceRight<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduceRight(fn, initial)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  static from<T>(items: T[]): BeapSet2<T> {
    const instance = new BeapSet2<T>()
    for (const item of items) {
      instance.add(item)
    }
    return instance
  }

  static of<T>(...items: T[]): BeapSet2<T> {
    return BeapSet2.from(items)
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

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
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

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
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


  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
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

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
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

  sampleN(n: number): T[] {
    return this.shuffle().slice(0, n)
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

  toSet(): Set<T> {
    return new Set(this.toArray())
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
}
