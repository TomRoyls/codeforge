export class PairingHeapNode5<T> {
  value: T;
  children: PairingHeapNode5<T>[];
  parent: PairingHeapNode5<T> | undefined;

  constructor(value: T) {
    this.value = value;
    this.children = [];
    this.parent = undefined;
  }

}

export class PairingHeap5<T> {
  private _root: PairingHeapNode5<T> | undefined;
  private _size: number;
  private _comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this._comparator = comparator || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    this._root = undefined;
    this._size = 0;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  insert(value: T): void {
    const node = new PairingHeapNode5(value);
    this._root = this._merge(this._root, node);
    this._size++;
    if (this._root) {
      this._root.parent = undefined;
    }
  }

  extractMin(): T | undefined {
    if (!this._root) {
      return undefined;
    }

    const min = this._root.value;
    this._root = this._pair(this._root.children);
    if (this._root) {
      this._root.parent = undefined;
    }
    this._size--;

    return min;
  }

  peek(): T | undefined {
    return this._root?.value;
  }

  merge(other: PairingHeap5<T>): void {
    if (this === other) {
      return;
    }
    this._root = this._merge(this._root, other._root);
    this._size += other._size;
    other._root = undefined;
    other._size = 0;
    if (this._root) {
      this._root.parent = undefined;
    }
  }

  decreaseKey(node: PairingHeapNode5<T>, newValue: T): void {
    node.value = newValue;

    if (this._root === node) {
      return;
    }

    const parent = node.parent;
    if (!parent) {
      return;
    }

    const index = parent.children.indexOf(node);
    if (index !== -1) {
      parent.children.splice(index, 1);
    }

    node.parent = undefined;

    this._root = this._merge(this._root, node);
  }

  clear(): void {
    this._root = undefined;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    const temp = new PairingHeap5<T>(this._comparator);

    while (!this.isEmpty()) {
      const min = this.extractMin()!;
      result.push(min);
      temp.insert(min);
    }

    this._root = temp._root;
    this._size = temp._size;
    if (this._root) {
      this._root.parent = undefined;
    }

    return result;
  }

  static fromArray<T>(values: T[], comparator?: (a: T, b: T) => number): PairingHeap5<T> {
    const heap = new PairingHeap5<T>(comparator);
    for (let i = 0; i < values.length; i++) {
      heap.insert(values[i]!);
    }
    return heap;
  }

  private _merge(
    a: PairingHeapNode5<T> | undefined,
    b: PairingHeapNode5<T> | undefined
  ): PairingHeapNode5<T> | undefined {
    if (!a) {
      if (b) {
        b.parent = undefined;
      }
      return b;
    }
    if (!b) {
      a.parent = undefined;
      return a;
    }

    if (this._comparator(a.value, b.value) <= 0) {
      a.children.push(b);
      b.parent = a;
      a.parent = undefined;
      return a;
    } else {
      b.children.push(a);
      a.parent = b;
      b.parent = undefined;
      return b;
    }
  }

  private _pair(nodes: PairingHeapNode5<T>[]): PairingHeapNode5<T> | undefined {
    if (nodes.length === 0) {
      return undefined;
    }
    if (nodes.length === 1) {
      nodes[0]!.parent = undefined;
      return nodes[0]!;
    }

    const pairs: PairingHeapNode5<T>[] = [];
    for (let i = 0; i < nodes.length; i += 2) {
      if (i + 1 < nodes.length) {
        pairs.push(this._merge(nodes[i], nodes[i + 1])!);
      } else {
        const unpaired = nodes[i]!;
        unpaired.parent = undefined;
        pairs.push(unpaired);
      }
    }

    let result = pairs[pairs.length - 1];
    for (let i = pairs.length - 2; i >= 0; i--) {
      result = this._merge(pairs[i], result)!;
    }

    return result;
  }

  [Symbol.iterator](): Iterator<T> {
    const items = this.toArray();
    let index = 0;
    return {
      next(): IteratorResult<T> {
        if (index < items.length) {
          return { value: items[index++]!, done: false };
        }
        return { value: undefined as unknown as T, done: true };
      },
    };
  }
}
