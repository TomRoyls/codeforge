export class BinaryHeap<T> {
  private heap: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator || ((a: T, b: T) => {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    });
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private left(i: number): number {
    return 2 * i + 1;
  }

  private right(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j]!, this.heap[i]!];
  }

  private heapifyUp(i: number): void {
    while (i > 0) {
      const p = this.parent(i);
      if (this.comparator(this.heap[i]!, this.heap[p]!) > 0) {
        this.swap(i, p);
        i = p;
      } else {
        break;
      }
    }
  }

  private heapifyDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      const l = this.left(i);
      const r = this.right(i);
      let largest = i;

      if (l < n && this.comparator(this.heap[l]!, this.heap[largest]!) > 0) {
        largest = l;
      }
      if (r < n && this.comparator(this.heap[r]!, this.heap[largest]!) > 0) {
        largest = r;
      }

      if (largest !== i) {
        this.swap(i, largest);
        i = largest;
      } else {
        break;
      }
    }
  }

  insert(value: T): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  extract(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    const max = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }
    return max;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  heapify(array: T[]): void {
    this.heap = [...array];
    const n = this.heap.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.heapifyDown(i);
    }
  }

  toArray(): T[] {
    return [...this.heap];
  }

  contains(value: T): boolean {
    return this.heap.some(item => this.comparator(item, value) === 0);
  }

  merge(other: BinaryHeap<T>): BinaryHeap<T> {
    const result = new BinaryHeap<T>(this.comparator);
    const merged = [...this.heap, ...other.heap];
    result.heapify(merged);
    return result;
  }

  replace(value: T): T | undefined {
    if (this.heap.length === 0) {
      this.insert(value);
      return undefined;
    }
    const max = this.heap[0]!;
    this.heap[0] = value;
    this.heapifyDown(0);
    return max;
  }

  increaseKey(index: number, newValue: T): void {
    if (index < 0 || index >= this.heap.length) {
      return;
    }
    if (this.comparator(newValue, this.heap[index]!) < 0) {
      return;
    }
    this.heap[index] = newValue;
    this.heapifyUp(index);
  }

  delete(index: number): void {
    if (index < 0 || index >= this.heap.length) {
      return;
    }
    const last = this.heap.pop()!;
    if (index < this.heap.length) {
      this.heap[index] = last;
      this.heapifyUp(index);
      this.heapifyDown(index);
    }
  }

  clear(): void {
    this.heap = [];
  }

  getTimeComplexity(): string {
    return "insert: O(log n), extract: O(log n), peek: O(1), size: O(1), isEmpty: O(1), increaseKey: O(log n), delete: O(log n), heapify: O(n), toArray: O(n), contains: O(n), merge: O(m + n), replace: O(log n), clear: O(1)";
  }


  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = 0; i < this.heap.length; i++) {
      yield this.heap[i]!;
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `${BinaryHeap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'BinaryHeap', items: this.toArray() }
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


  tap(fn: (collection: BinaryHeap<T>) => void): BinaryHeap<T> {
    fn(this)
    return this
  }

  equals(other: BinaryHeap<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
}
