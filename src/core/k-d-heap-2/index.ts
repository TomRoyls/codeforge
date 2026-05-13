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
    this.comparator = comparator || ((a: T, b: T) => (a as any) - (b as any));
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
}
