export class SoftHeap2<T> {
  private heap: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator || ((a: T, b: T) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return (a as number) - (b as number);
      }
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  private compare(a: T, b: T): number {
    return this.comparator(a, b);
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private left(index: number): number {
    return 2 * index + 1;
  }

  private right(index: number): number {
    return 2 * index + 2;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!;
    this.heap[i] = this.heap[j]!;
    this.heap[j] = temp;
  }

  private siftUp(index: number): void {
    while (index > 0 && this.compare(this.heap[this.parent(index)]!, this.heap[index]!) > 0) {
      this.swap(index, this.parent(index));
      index = this.parent(index);
    }
  }

  private siftDown(index: number): void {
    while (true) {
      const leftChild = this.left(index);
      const rightChild = this.right(index);
      let smallest = index;

      if (leftChild < this.heap.length && this.compare(this.heap[leftChild]!, this.heap[smallest]!) < 0) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.compare(this.heap[rightChild]!, this.heap[smallest]!) < 0) {
        smallest = rightChild;
      }

      if (smallest === index) break;
      this.swap(index, smallest);
      index = smallest;
    }
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
    return this.heap.length > 0 ? this.heap[0]! : undefined;
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
    const copy = [...this.heap];
    copy.sort((a, b) => this.compare(a, b));
    return copy;
  }

  delete(value: T): boolean {
    const index = this.heap.findIndex(item => this.compare(item, value) === 0);
    if (index === -1) return false;
    this.heap.splice(index, 1);
    if (index < this.heap.length) {
      this.siftDown(index);
      this.siftUp(index);
    }
    return true;
  }

  meld(other: SoftHeap2<T>): void {
    const otherArray = other.toArray();
    otherArray.forEach(value => this.insert(value));
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
    return `SoftHeap2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SoftHeap2', size: this.size, items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }
}
