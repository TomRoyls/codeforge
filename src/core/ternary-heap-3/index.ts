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

}
