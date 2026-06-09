interface Node<T> {
  value: T;
  left: Node<T> | null;
  right: Node<T> | null;
  npl: number;
}

export class LeftistHeap4<T> {
  private root: Node<T> | null;
  private _size: number;
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.root = null;
    this._size = 0;
    this.comparator = comparator || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
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

  insert(value: T): void {
    const singleNode: Node<T> = {
      value,
      left: null,
      right: null,
      npl: 0
    };
    const otherHeap = new LeftistHeap4<T>(this.comparator);
    otherHeap.root = singleNode;
    otherHeap._size = 1;
    this.merge(otherHeap);
  }

  extractMin(): T | undefined {
    if (!this.root) {
      return undefined;
    }
    const minValue = this.root.value;
    const left = this.root.left;
    const right = this.root.right;
    const leftHeap = new LeftistHeap4<T>(this.comparator);
    const rightHeap = new LeftistHeap4<T>(this.comparator);
    leftHeap.root = left;
    rightHeap.root = right;
    leftHeap._size = this._size - 1 - (rightHeap.size);
    rightHeap._size = this._size - 1 - leftHeap.size;
    this.root = null;
    this._size = 0;
    this.merge(leftHeap);
    this.merge(rightHeap);
    return minValue;
  }

  peek(): T | undefined {
    return this.root?.value;
  }

  merge(other: LeftistHeap4<T>): void {
    this.root = this.mergeNodes(this.root, other.root);
    this._size += other._size;
    other.root = null;
    other._size = 0;
  }

  private mergeNodes(a: Node<T> | null, b: Node<T> | null): Node<T> | null {
    if (!a) {
      return b;
    }
    if (!b) {
      return a;
    }
    if (this.comparator(a.value, b.value) <= 0) {
      a.right = this.mergeNodes(a.right, b);
      if (!a.left || (a.left.npl < (a.right?.npl ?? -1))) {
        const temp = a.left;
        a.left = a.right;
        a.right = temp;
      }
      a.npl = (a.right?.npl ?? -1) + 1;
      return a;
    } else {
      b.right = this.mergeNodes(b.right, a);
      if (!b.left || (b.left.npl < (b.right?.npl ?? -1))) {
        const temp = b.left;
        b.left = b.right;
        b.right = temp;
      }
      b.npl = (b.right?.npl ?? -1) + 1;
      return b;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    const tempHeap = new LeftistHeap4<T>(this.comparator);
    tempHeap.root = this.cloneNode(this.root);
    tempHeap._size = this._size;
    while (!tempHeap.isEmpty()) {
      result.push(tempHeap.extractMin()!);
    }
    return result;
  }

  private cloneNode(node: Node<T> | null): Node<T> | null {
    if (!node) {
      return null;
    }
    return {
      value: node.value,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
      npl: node.npl
    };
  }

  static fromArray<T>(values: T[], comparator?: (a: T, b: T) => number): LeftistHeap4<T> {
    const heap = new LeftistHeap4<T>(comparator);
    for (const value of values) {
      heap.insert(value);
    }
    return heap;
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
