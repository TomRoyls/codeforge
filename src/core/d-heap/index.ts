export class DHeap<T> {
  private heap: T[] = [];
  private d: number;
  private comparator: (a: T, b: T) => number;

  constructor(d: number = 4, comparator?: (a: T, b: T) => number) {
    if (d < 2) {
      throw new Error('Branching factor d must be at least 2');
    }
    this.d = d;
    this.comparator = comparator || ((a: T, b: T) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return (a as number) - (b as number);
      }
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / this.d);
  }

  private child(i: number, k: number): number {
    return this.d * i + k + 1;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!;
    this.heap[i]! = this.heap[j]!;
    this.heap[j]! = temp;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const p = this.parent(i);
      if (this.comparator(this.heap[i]!, this.heap[p]!) >= 0) {
        break;
      }
      this.swap(i, p);
      i = p;
    }
  }

  private bubbleDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let minChild = i;
      for (let k = 1; k <= this.d; k++) {
        const c = this.child(i, k - 1);
        if (c < n && this.comparator(this.heap[c]!, this.heap[minChild]!) < 0) {
          minChild = c;
        }
      }
      if (minChild === i) {
        break;
      }
      this.swap(i, minChild);
      i = minChild;
    }
  }

  insert(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    if (this.heap.length === 1) {
      return this.heap.pop()!;
    }
    const min = this.heap[0]!;
    this.heap[0]! = this.heap.pop()!;
    this.bubbleDown(0);
    return min!;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  clear(): void {
    this.heap = [];
  }

  toArray(): T[] {
    return [...this.heap];
  }

  heapify(values: T[]): void {
    this.heap = [...values];
    const n = this.heap.length;
    for (let i = Math.floor(n / this.d) - 1; i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  update(i: number, value: T): void {
    if (i < 0 || i >= this.heap.length) {
      throw new Error(`Index out of bounds: index=${i}, size=${this.heap.length}`);
    }
    const oldValue = this.heap[i]!;
    this.heap[i] = value;
    if (this.comparator(value, oldValue) < 0) {
      this.bubbleUp(i);
    } else {
      this.bubbleDown(i);
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
    return `${DHeap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }



  toJSON() {
    return { type: 'DHeap', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.heap.every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.heap.some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.heap.find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.heap.findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.heap.includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.heap
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.heap.join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.heap.slice(start, end)
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
    const arr = this.heap
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.heap
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }


  tap(fn: (collection: DHeap<T>) => void): DHeap<T> {
    fn(this)
    return this
  }

  equals(other: DHeap<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  static from<T>(items: T[]): DHeap<T> {
    const instance = new DHeap<T>()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }

  static of<T>(...items: T[]): DHeap<T> {
    return DHeap.from(items)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }
}
