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
    return this.heap[0]!;
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
}
