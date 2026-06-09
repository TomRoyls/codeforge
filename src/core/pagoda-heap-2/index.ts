class Node<T> {
  constructor(
    public value: T,
    public left: Node<T> | null = null,
    public right: Node<T> | null = null
  ) {}
}

export class PagodaHeap2<T> {
  private root: Node<T> | null = null;
  private _size: number = 0;

  constructor(private comparator: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {}

  insert(value: T): void {
    const newNode = new Node(value);
    this.root = this.mergeNodes(this.root, newNode);
    this._size++;
  }

  extractMin(): T | undefined {
    if (!this.root) return undefined;
    const minValue = this.root.value;
    this.root = this.mergeNodes(this.root.left, this.root.right);
    this._size--;
    return minValue;
  }

  peek(): T | undefined {
    return this.root?.value;
  }

  merge(other: PagodaHeap2<T>): void {
    if (other === this) return;
    this.root = this.mergeNodes(this.root, other.root);
    this._size += other._size;
    other.root = null;
    other._size = 0;
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
    const nodes: Array<Node<T> | null> = [this.root];
    let _qi = 0
    while (_qi < nodes.length) {
      const node = nodes[_qi++]!;
      if (!node) continue;
      result.push(node.value);
      nodes.push(node.left);
      nodes.push(node.right);
    }
    return result;
  }

  static fromArray<T>(values: T[], comparator?: (a: T, b: T) => number): PagodaHeap2<T> {
    const heap = new PagodaHeap2<T>(comparator);
    for (const value of values) {
      heap.insert(value);
    }
    return heap;
  }

  private mergeNodes(a: Node<T> | null, b: Node<T> | null): Node<T> | null {
    if (!a) return b;
    if (!b) return a;
    if (this.comparator(a.value, b.value) <= 0) {
      a.right = this.mergeNodes(a.right, b);
      this.swapChildren(a);
      return a;
    } else {
      b.right = this.mergeNodes(b.right, a);
      this.swapChildren(b);
      return b;
    }
  }

  private swapChildren(node: Node<T>): void {
    const temp = node.left;
    node.left = node.right;
    node.right = temp;
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
    return `PagodaHeap2({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }
}
