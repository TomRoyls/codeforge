export class DAryHeap4<T> {
  private heap: T[] = [];
  private cmp: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.cmp = comparator ?? this.defaultComparator;
  }

  private defaultComparator(a: T, b: T): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  insert(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  extract(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.trickleDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    if (this.heap.length === 0) return undefined;
    return this.heap[0];
  }

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  heapify(array: T[]): void {
    this.heap = [...array];
    const start = Math.floor((this.heap.length - 2) / 4);
    for (let i = start; i >= 0; i--) {
      this.trickleDown(i);
    }
  }

  toArray(): T[] {
    return [...this.heap];
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.cmp(this.heap[i]!, value) === 0) return true;
    }
    return false;
  }

  merge(other: DAryHeap4<T>): DAryHeap4<T> {
    const result = new DAryHeap4<T>(this.cmp);
    for (const item of this.heap) {
      result.insert(item);
    }
    for (const item of other.heap) {
      result.insert(item);
    }
    return result;
  }

  clear(): void {
    this.heap.length = 0;
  }

  update(index: number, value: T): void {
    if (index < 0 || index >= this.heap.length) return;
    const old = this.heap[index]!;
    this.heap[index] = value;
    const cmpResult = this.cmp(value, old);
    if (cmpResult > 0) {
      this.bubbleUp(index);
    } else if (cmpResult < 0) {
      this.trickleDown(index);
    }
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 4);
  }

  private child(index: number, k: number): number {
    return 4 * index + k + 1;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const p = this.parent(index);
      if (this.cmp(this.heap[index]!, this.heap[p]!) > 0) {
        this.swap(index, p);
        index = p;
      } else {
        break;
      }
    }
  }

  private trickleDown(index: number): void {
    const n = this.heap.length;
    while (true) {
      let largest = index;
      for (let k = 0; k < 4; k++) {
        const c = this.child(index, k);
        if (c < n && this.cmp(this.heap[c]!, this.heap[largest]!) > 0) {
          largest = c;
        }
      }
      if (largest !== index) {
        this.swap(index, largest);
        index = largest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const tmp = this.heap[i]!;
    this.heap[i] = this.heap[j]!;
    this.heap[j] = tmp;
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
    return `${DAryHeap4}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'DAryHeap4', size: this.size, items: this.toArray() }
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
}
