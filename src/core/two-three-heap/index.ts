type Node<T> = {
  value: T;
  children: Node<T>[];
};

export class TwoThreeHeap<T> {
  private heap: Node<T>[] = [];
  private _frontIdx: number = 0;
  private compare: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    const newNode: Node<T> = { value, children: [] };
    this.heap.push(newNode);
    this.maintainHeap();
  }

  extractMin(): T | undefined {
    const effectiveLen = this.heap.length - this._frontIdx
    if (effectiveLen <= 0) return undefined;
    const minNode = this.heap[this._frontIdx]!;
    this._frontIdx++
    const value = minNode.value;
    for (const child of minNode.children) {
      this.heap.push(child);
    }
    this.maintainHeap();
    if (this._frontIdx > 0 && this._frontIdx > this.heap.length / 2) {
      this.heap = this.heap.slice(this._frontIdx)
      this._frontIdx = 0
    }
    return value;
  }

  peek(): T | undefined {
    const effectiveLen = this.heap.length - this._frontIdx
    if (effectiveLen <= 0) return undefined;
    return this.heap[this._frontIdx]!.value;
  }

  get size(): number {
    let count = 0;
    for (let i = this._frontIdx; i < this.heap.length; i++) {
      count += this.countNodes(this.heap[i]!);
    }
    return count;
  }

  isEmpty(): boolean {
    return this._frontIdx >= this.heap.length;
  }

  clear(): void {
    this.heap = [];
    this._frontIdx = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = this._frontIdx; i < this.heap.length; i++) {
      this.collectNodes(this.heap[i]!, result);
    }
    return result.sort((a, b) => this.compare(a, b));
  }

  meld(other: TwoThreeHeap<T>): void {
    for (let i = other._frontIdx; i < other.heap.length; i++) {
      this.heap.push(other.heap[i]!);
    }
    other.clear();
    this.maintainHeap();
  }

  private maintainHeap(): void {
    if (this._frontIdx > 0) {
      this.heap = this.heap.slice(this._frontIdx)
      this._frontIdx = 0
    }
    if (this.heap.length <= 1) return;
    this.heap.sort((a, b) => this.compare(a.value, b.value));
  }

  private countNodes(node: Node<T>): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  private collectNodes(node: Node<T>, result: T[]): void {
    result.push(node.value);
    for (const child of node.children) {
      this.collectNodes(child, result);
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

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'TwoThreeHeap', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `TwoThreeHeap({ size: ${this.size} })`
  }
}
