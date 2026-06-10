export class TernaryHeap3<T> {
  private heap: T[];
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.heap = [];
    this.comparator = comparator || ((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    this.heap.push(value);
    this.siftUp(this.heap.length - 1);
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
    this.siftDown(0);
    return min;
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

  static fromArray<T>(values: T[], comparator?: (a: T, b: T) => number): TernaryHeap3<T> {
    const heap = new TernaryHeap3<T>(comparator);
    heap.heap = [...values];
    for (let i = Math.floor(heap.heap.length / 3); i >= 0; i--) {
      heap.siftDown(i);
    }
    return heap;
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 3);
  }

  private children(index: number): number[] {
    const base = 3 * index + 1;
    return [base, base + 1, base + 2];
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parentIndex = this.parent(index);
      if (this.comparator(this.heap[index]!, this.heap[parentIndex]!) >= 0) {
        break;
      }
      [this.heap[index]!, this.heap[parentIndex]!] = [this.heap[parentIndex]!, this.heap[index]!];
      index = parentIndex;
    }
  }

  private siftDown(index: number): void {
    while (true) {
      const childIndices = this.children(index);
      let minIndex = index;

      for (const childIndex of childIndices) {
        if (childIndex < this.heap.length && this.comparator(this.heap[childIndex]!, this.heap[minIndex]!) < 0) {
          minIndex = childIndex;
        }
      }

      if (minIndex === index) {
        break;
      }

      [this.heap[index]!, this.heap[minIndex]!] = [this.heap[minIndex]!, this.heap[index]!];
      index = minIndex;
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
    return `TernaryHeap3({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'TernaryHeap3', size: this.size, items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
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
}
