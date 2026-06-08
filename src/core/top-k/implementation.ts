export class TopK<T> {
  private counts: Map<T, number>;
  private heap: Array<[T, number]>;
  private readonly k: number;
  private currentSize: number;

  constructor(k: number) {
    if (k <= 0) {
      throw new Error('k must be positive');
    }
    this.k = k;
    this.counts = new Map();
    this.heap = [];
    this.currentSize = 0;
  }

  add(item: T): void {
    const newCount = (this.counts.get(item) ?? 0) + 1;
    this.counts.set(item, newCount);

    const existingIndex = this.heap.findIndex(([key]) => key === item);
    if (existingIndex !== -1) {
      this.heap[existingIndex] = [item, newCount];
      this.bubbleDown(existingIndex);
      this.bubbleUp(existingIndex);
    } else if (this.currentSize < this.k) {
      this.heap.push([item, newCount]);
      this.bubbleUp(this.heap.length - 1);
      this.currentSize++;
    } else if (newCount >= this.heap[0]![1]) {
      this.heap[0]! = [item, newCount];
      this.bubbleDown(0);
    }
  }

  getTopK(): Array<[T, number]> {
    return [...this.heap].sort((a, b) => b[1] - a[1]);
  }

  contains(item: T): boolean {
    return this.heap.some(([key]) => key === item);
  }

  count(item: T): number {
    return this.counts.get(item) ?? 0;
  }

  get size(): number {
    return this.currentSize;
  }

  get isEmpty(): boolean {
    return this.currentSize === 0;
  }

  clear(): void {
    this.counts.clear();
    this.heap = [];
    this.currentSize = 0;
  }

  merge(other: TopK<T>): void {
    for (const [item, count] of other.counts) {
      for (let i = 0; i < count; i++) {
        this.add(item);
      }
    }
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex]![1] <= this.heap[index]![1]) {
        break;
      }
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index]!, this.heap[parentIndex]!];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < length && this.heap[leftChild]![1] < this.heap[smallest]![1]) {
        smallest = leftChild;
      }

      if (rightChild < length && this.heap[rightChild]![1] < this.heap[smallest]![1]) {
        smallest = rightChild;
      }

      if (smallest === index) {
        break;
      }

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest]!, this.heap[index]!];
      index = smallest;
    }
  }
}
