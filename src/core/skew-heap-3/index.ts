export class SkewHeap3<T> {
  private root: SkewNode<T> | null = null;
  private _size: number = 0;

  constructor(private comparator: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {}

  insert(value: T): void {
    const newHeap = new SkewHeap3<T>(this.comparator);
    newHeap.root = { value, left: null, right: null };
    newHeap._size = 1;
    this.merge(newHeap);
  }

  extractMin(): T | undefined {
    if (!this.root) return undefined;
    const min = this.root.value;
    const leftHeap = new SkewHeap3<T>(this.comparator);
    const rightHeap = new SkewHeap3<T>(this.comparator);
    leftHeap.root = this.root.left;
    rightHeap.root = this.root.right;
    this.root = this.mergeNodes(leftHeap.root, rightHeap.root);
    this._size--;
    return min;
  }

  peek(): T | undefined {
    return this.root?.value;
  }

  merge(other: SkewHeap3<T>): void {
    this.root = this.mergeNodes(this.root, other.root);
    this._size += other._size;
    other.clear();
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    const queue: SkewNode<T>[] = [];
    if (this.root) queue.push(this.root);
    let _qi = 0;
    while (_qi < queue.length) {
      const node = queue[_qi++]!;
      result.push(node.value);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    return result;
  }

  static fromArray<T>(values: T[], comparator?: (a: T, b: T) => number): SkewHeap3<T> {
    const heap = new SkewHeap3<T>(comparator);
    for (const v of values) heap.insert(v);
    return heap;
  }

  private mergeNodes(a: SkewNode<T> | null, b: SkewNode<T> | null): SkewNode<T> | null {
    if (!a) return b;
    if (!b) return a;
    if (this.comparator(a.value, b.value) > 0) [a, b] = [b, a];
    a.right = this.mergeNodes(a.right, b);
    [a.left, a.right] = [a.right, a.left];
    return a;
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
    return `SkewHeap3({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'SkewHeap3', size: this.size, items: this.toArray() }
  }
}

interface SkewNode<T> {
  value: T;
  left: SkewNode<T> | null;
  right: SkewNode<T> | null;
}
