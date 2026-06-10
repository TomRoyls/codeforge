export class MinHeap<T> {
  private heap: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
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
      if (this.comparator(this.heap[i]!, this.heap[p]!) < 0) {
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
      let smallest = i;

      if (l < n && this.comparator(this.heap[l]!, this.heap[smallest]!) < 0) {
        smallest = l;
      }
      if (r < n && this.comparator(this.heap[r]!, this.heap[smallest]!) < 0) {
        smallest = r;
      }

      if (smallest !== i) {
        this.swap(i, smallest);
        i = smallest;
      } else {
        break;
      }
    }
  }

  insert(value: T): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    const min = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }
    return min;
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

  decreaseKey(index: number, newValue: T): void {
    if (index < 0 || index >= this.heap.length) {
      return;
    }
    if (this.comparator(newValue, this.heap[index]!) > 0) {
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

  merge(other: MinHeap<T>): MinHeap<T> {
    const result = new MinHeap<T>(this.comparator);
    const merged = [...this.heap, ...other.heap];
    result.heapify(merged);
    return result;
  }

  clear(): void {
    this.heap = [];
  }

  getTimeComplexity(): string {
    return "insert: O(log n), extractMin: O(log n), peek: O(1), size: O(1), isEmpty: O(1), decreaseKey: O(log n), delete: O(log n), heapify: O(n), toArray: O(n), contains: O(n), merge: O(m + n), clear: O(1)";
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

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `MinHeap({ size: ${this.heap.length} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'MinHeap', items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
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
}
