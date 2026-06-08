type CompareFn<T> = (a: T, b: T) => number;

class PairHeapNode<T> {
  constructor(public value: T, public children: PairHeapNode<T>[] = [], public parent: PairHeapNode<T> | null = null) {}
}

export class PairHeap2<T> {
  private root: PairHeapNode<T> | null = null;
  private _size: number = 0;
  private readonly compare: CompareFn<T>;

  constructor(comparator?: CompareFn<T>) {
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  insert(value: T): PairHeapNode<T> {
    const node = new PairHeapNode(value);
    this.root = this.mergeNodes(this.root, node);
    this._size++;
    return node;
  }

  peek(): T | null {
    return this.root ? this.root.value : null;
  }

  extractMin(): T | null {
    if (!this.root) return null;

    const minValue = this.root.value;

    if (this.root.children.length === 0) {
      this.root = null;
    } else {
      this.root = this.mergePairs(this.root.children);
    }

    this._size--;
    return minValue;
  }

  merge(other: PairHeap2<T>): void {
    this.root = this.mergeNodes(this.root, other.root);
    this._size += other._size;
    other.root = null;
    other._size = 0;
  }

  decreaseKey(node: PairHeapNode<T>, newValue: T): void {
    if (this.compare(newValue, node.value) > 0) {
      throw new Error('New value must be less than or equal to current value');
    }

    node.value = newValue;

    if (node.parent !== null) {
      const parent = node.parent;
      const index = parent.children.indexOf(node);
      if (index !== -1) {
        parent.children.splice(index, 1);
      }
      node.parent = null;
      this.root = this.mergeNodes(this.root, node);
    }
  }

  delete(node: PairHeapNode<T>): void {
    if (node.parent === null && node === this.root) {
      this.extractMin();
      return;
    }

    if (node.parent !== null) {
      const parent = node.parent;
      const index = parent.children.indexOf(node);
      if (index !== -1) {
        parent.children.splice(index, 1);
      }
      this._size--;
      if (node.children.length > 0) {
        this.root = this.mergeNodes(this.root, this.mergePairs(node.children));
      }
    }
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    const temp = new PairHeap2<T>(this.compare);

    while (!this.isEmpty()) {
      const value = this.extractMin()!;
      result.push(value);
      temp.insert(value);
    }

    while (!temp.isEmpty()) {
      const value = temp.extractMin()!;
      this.insert(value);
    }

    return result;
  }

  private mergeNodes(a: PairHeapNode<T> | null, b: PairHeapNode<T> | null): PairHeapNode<T> | null {
    if (!a) return b;
    if (!b) return a;

    if (this.compare(a.value, b.value) <= 0) {
      a.children.push(b);
      b.parent = a;
      return a;
    } else {
      b.children.push(a);
      a.parent = b;
      return b;
    }
  }

  private mergePairs(nodes: PairHeapNode<T>[]): PairHeapNode<T> | null {
    if (nodes.length === 0) return null;
    if (nodes.length === 1) return nodes[0]!;

    const merged: PairHeapNode<T>[] = [];

    for (let i = 0; i < nodes.length - 1; i += 2) {
      merged.push(this.mergeNodes(nodes[i]!, nodes[i + 1]!)!);
    }

    if (nodes.length % 2 === 1) {
      merged.push(nodes[nodes.length - 1]!);
    }

    let result = merged[merged.length - 1]!;
    for (let i = merged.length - 2; i >= 0; i--) {
      result = this.mergeNodes(merged[i]!, result)!;
    }

    result.parent = null;
    return result;
  }
}
