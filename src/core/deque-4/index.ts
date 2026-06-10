export class Deque4<T> {
  private data: (T | undefined)[];
  private front: number;
  private back: number;
  private count: number;
  private capacity: number;

  constructor() {
    this.capacity = 4;
    this.data = new Array(this.capacity);
    this.front = 0;
    this.back = 0;
    this.count = 0;
  }

  get size(): number {
    return this.count;
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  pushFront(value: T): void {
    if (this.count === this.capacity) {
      this.grow();
    }
    this.front = (this.front - 1 + this.capacity) % this.capacity;
    this.data[this.front] = value;
    this.count++;
  }

  pushBack(value: T): void {
    if (this.count === this.capacity) {
      this.grow();
    }
    this.data[this.back] = value;
    this.back = (this.back + 1) % this.capacity;
    this.count++;
  }

  popFront(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }
    const value = this.data[this.front];
    this.data[this.front] = undefined;
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return value;
  }

  popBack(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }
    this.back = (this.back - 1 + this.capacity) % this.capacity;
    const value = this.data[this.back];
    this.data[this.back] = undefined;
    this.count--;
    return value;
  }

  peekFront(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }
    return this.data[this.front];
  }

  peekBack(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }
    return this.data[(this.back - 1 + this.capacity) % this.capacity];
  }

  clear(): void {
    this.data = new Array(this.capacity);
    this.front = 0;
    this.back = 0;
    this.count = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const index = (this.front + i) % this.capacity;
      const value = this.data[index];
      if (value !== undefined) {
        result.push(value);
      }
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.count; i++) {
      const index = (this.front + i) % this.capacity;
      const value = this.data[index];
      if (value !== undefined) {
        callback(value, i);
      }
    }
  }

  filter(predicate: (value: T, index: number) => boolean): Deque4<T> {
    const result = new Deque4<T>();
    for (let i = 0; i < this.count; i++) {
      const index = (this.front + i) % this.capacity;
      const value = this.data[index];
      if (value !== undefined && predicate(value, i)) {
        result.pushBack(value);
      }
    }
    return result;
  }

  map<U>(transform: (value: T, index: number) => U): Deque4<U> {
    const result = new Deque4<U>();
    for (let i = 0; i < this.count; i++) {
      const index = (this.front + i) % this.capacity;
      const value = this.data[index];
      if (value !== undefined) {
        result.pushBack(transform(value, i));
      }
    }
    return result;
  }

  reduce<U>(callback: (accumulator: U, value: T, index: number) => U, initialValue: U): U {
    let accumulator = initialValue;
    for (let i = 0; i < this.count; i++) {
      const index = (this.front + i) % this.capacity;
      const value = this.data[index];
      if (value !== undefined) {
        accumulator = callback(accumulator, value, i);
      }
    }
    return accumulator;
  }

  rotate(n: number): Deque4<T> {
    if (this.count === 0) {
      return new Deque4<T>();
    }
    const normalizedN = n % this.count;
    if (normalizedN === 0) {
      return this.slice(0, this.count);
    }
    const result = new Deque4<T>();
    if (normalizedN > 0) {
      for (let i = this.count - normalizedN; i < this.count; i++) {
        const value = this.get(i);
        if (value !== undefined) {
          result.pushBack(value);
        }
      }
      for (let i = 0; i < this.count - normalizedN; i++) {
        const value = this.get(i);
        if (value !== undefined) {
          result.pushBack(value);
        }
      }
    } else {
      const shift = -normalizedN;
      for (let i = shift; i < this.count; i++) {
        const value = this.get(i);
        if (value !== undefined) {
          result.pushBack(value);
        }
      }
      for (let i = 0; i < shift; i++) {
        const value = this.get(i);
        if (value !== undefined) {
          result.pushBack(value);
        }
      }
    }
    return result;
  }

  slice(start: number, end?: number): Deque4<T> {
    const result = new Deque4<T>();
    let normalizedEnd: number;
    if (end === undefined) {
      normalizedEnd = this.count;
    } else if (end < 0) {
      normalizedEnd = Math.max(0, this.count + end);
    } else {
      normalizedEnd = Math.min(end, this.count);
    }
    const normalizedStart = start < 0 ? Math.max(0, this.count + start) : Math.min(start, this.count);
    const effectiveStart = normalizedStart;
    const effectiveEnd = normalizedEnd;
    for (let i = effectiveStart; i < effectiveEnd; i++) {
      const value = this.get(i);
      if (value !== undefined) {
        result.pushBack(value);
      }
    }
    return result;
  }

  getTimeComplexity(operation: string): string {
    const complexities: Record<string, string> = {
      pushFront: 'O(1) amortized',
      pushBack: 'O(1) amortized',
      popFront: 'O(1)',
      popBack: 'O(1)',
      peekFront: 'O(1)',
      peekBack: 'O(1)',
      size: 'O(1)',
      isEmpty: 'O(1)',
      clear: 'O(1)',
      toArray: 'O(n)',
      forEach: 'O(n)',
      filter: 'O(n)',
      map: 'O(n)',
      reduce: 'O(n)',
      rotate: 'O(n)',
      slice: 'O(n)'
    };
    return complexities[operation] || 'Unknown operation';
  }

  private grow(): void {
    const newCapacity = this.capacity * 2;
    const newData: (T | undefined)[] = new Array(newCapacity);
    for (let i = 0; i < this.count; i++) {
      const index = (this.front + i) % this.capacity;
      newData[i] = this.data[index];
    }
    this.data = newData;
    this.front = 0;
    this.back = this.count;
    this.capacity = newCapacity;
  }

  private get(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined;
    }
    const actualIndex = (this.front + index) % this.capacity;
    return this.data[actualIndex];
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
    return `${Deque4}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'Deque4', size: this.size, items: this.toArray() }
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


  static empty<T>(): Deque4<T> {
    return new Deque4<T>()
  }


  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }


  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
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

  get [Symbol.toStringTag](): string {
    return 'Deque4'
  }
}
