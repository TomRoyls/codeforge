export class PairingHeap4<T> {
  private root: PairingHeapNode<T> | null = null;
  private _size: number = 0;

  constructor(private comparator: (a: T, b: T) => number = (a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0)) {}

  insert(value: T): void {
    const node = new PairingHeapNode(value);
    this.root = this.mergeNodes(this.root, node);
    this._size++;
  }

  extractMin(): T | undefined {
    if (this.root === null) {
      return undefined;
    }

    const min = this.root.value;
    this._size--;

    if (this.root.child === null) {
      this.root = null;
      return min;
    }

    const children: PairingHeapNode<T>[] = [];
    let current: PairingHeapNode<T> | null = this.root.child;
    while (current !== null) {
      children.push(current);
      current = current.sibling;
    }

    this.root = this.mergeChildren(children);
    return min;
  }

  findMin(): T | undefined {
    return this.root?.value;
  }

  merge(other: PairingHeap4<T>): void {
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
    const copy = new PairingHeap4<T>(this.comparator);
    copy.root = this.cloneNode(this.root);
    copy._size = this._size;

    while (!copy.isEmpty()) {
      const min = copy.extractMin();
      if (min !== undefined) {
        result.push(min);
      }
    }

    return result;
  }

  static fromArray<T>(values: T[], comparator?: (a: T, b: T) => number): PairingHeap4<T> {
    const heap = new PairingHeap4<T>(comparator);
    for (const value of values) {
      heap.insert(value);
    }
    return heap;
  }

  private mergeNodes(a: PairingHeapNode<T> | null, b: PairingHeapNode<T> | null): PairingHeapNode<T> | null {
    if (a === null) {
      return b;
    }
    if (b === null) {
      return a;
    }

    if (this.comparator(a.value, b.value) <= 0) {
      b.sibling = a.child;
      a.child = b;
      return a;
    } else {
      a.sibling = b.child;
      b.child = a;
      return b;
    }
  }

  private mergeChildren(children: PairingHeapNode<T>[]): PairingHeapNode<T> | null {
    if (children.length === 0) {
      return null;
    }

    let pairs: PairingHeapNode<T>[] = [];
    let i = 0;
    while (i < children.length) {
      if (i + 1 < children.length) {
        const merged = this.mergeNodes(children[i]!, children[i + 1]!);
        if (merged !== null) {
          pairs.push(merged);
        }
      } else {
        pairs.push(children[i]!);
      }
      i += 2;
    }

    let result: PairingHeapNode<T> | null = null;
    for (let j = pairs.length - 1; j >= 0; j--) {
      result = this.mergeNodes(result, pairs[j]!);
    }

    return result;
  }

  private cloneNode(node: PairingHeapNode<T> | null): PairingHeapNode<T> | null {
    if (node === null) {
      return null;
    }

    const newNode = new PairingHeapNode(node.value);
    newNode.child = this.cloneNode(node.child);
    newNode.sibling = this.cloneNode(node.sibling);
    return newNode;
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
    return `PairingHeap4({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'PairingHeap4', size: this.size, items: this.toArray() }
  }
}

class PairingHeapNode<T> {
  constructor(public value: T, public child: PairingHeapNode<T> | null = null, public sibling: PairingHeapNode<T> | null = null) {}
}
