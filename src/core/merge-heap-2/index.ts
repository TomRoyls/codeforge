export class MergeHeap2<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare ?? ((a: T, b: T) => {
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
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return min;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  merge(other: MergeHeap2<T>): void {
    this.heap = [...this.heap, ...other.heap];
    this.heapify();
    other.clear();
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

  private siftUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index]!, this.heap[parentIndex]!) < 0) {
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex]!, this.heap[index]!];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.compare(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left;
      }
      if (right < length && this.compare(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right;
      }
      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest]!, this.heap[index]!];
        index = smallest;
      } else {
        break;
      }
    }
  }

  private heapify(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.siftDown(i);
    }
  }

  toString(): string {
    return `MergeHeap2({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'MergeHeap2'
  }
}
