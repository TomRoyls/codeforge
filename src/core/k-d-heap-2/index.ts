type Comparator<T> = (a: T, b: T) => number;

export class KDHeap2<T> {
  private heap: T[];
  private d: number;
  private comparator: Comparator<T>;

  constructor(d: number = 4, comparator?: Comparator<T>) {
    if (d < 2) {
      throw new Error('d must be at least 2');
    }
    this.d = d;
    this.heap = [];
    this.comparator = comparator || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  clear(): void {
    this.heap = [];
  }

  peek(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    return this.heap[0];
  }

  insert(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  extract(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    if (this.heap.length === 1) {
      return this.heap.pop()!;
    }
    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return root;
  }

  toArray(): T[] {
    return [...this.heap];
  }

  heapify(values: T[]): void {
    this.heap = [...values];
    for (let i = Math.floor((this.heap.length - 2) / this.d); i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  private parentIndex(i: number): number {
    return Math.floor((i - 1) / this.d);
  }

  private childIndex(i: number, k: number): number {
    return this.d * i + k + 1;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = this.parentIndex(i);
      if (this.comparator(this.heap[i]!, this.heap[parent]!) >= 0) {
        break;
      }
      [this.heap[i], this.heap[parent]] = [this.heap[parent]!, this.heap[i]!];
      i = parent;
    }
  }

  private bubbleDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      for (let k = 0; k < this.d; k++) {
        const child = this.childIndex(i, k);
        if (child >= n) {
          break;
        }
        if (this.comparator(this.heap[child]!, this.heap[smallest]!) < 0) {
          smallest = child;
        }
      }
      if (smallest === i) {
        break;
      }
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest]!, this.heap[i]!];
      i = smallest;
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
    return `${KDHeap2}({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }



  toJSON() {
    return { type: 'KDHeap2', items: this.toArray() }
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

  slice(start?: number, end?: number): T[] {
    return this.heap.slice(start, end)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }

}
