export class OrderStatisticTree2<T> {
  private root: Node<T> | null = null;
  private compare: (a: T, b: T) => number;
  private _size: number = 0;

  constructor(comparator?: (a: T, b: T) => number) {
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    this.root = this._insert(this.root, value);
  }

  private _insert(node: Node<T> | null, value: T): Node<T> {
    if (node === null) {
      this._size++;
      return { value, left: null, right: null, size: 1 };
    }

    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      node.left = this._insert(node.left, value);
    } else if (cmp > 0) {
      node.right = this._insert(node.right, value);
    } else {
      return node;
    }

    this._updateSize(node);
    return node;
  }

  has(value: T): boolean {
    return this._has(this.root, value);
  }

  private _has(node: Node<T> | null, value: T): boolean {
    if (node === null) return false;

    const cmp = this.compare(value, node.value);
    if (cmp < 0) return this._has(node.left, value);
    if (cmp > 0) return this._has(node.right, value);
    return true;
  }

  delete(value: T): boolean {
    const result = this._delete(this.root, value);
    if (result.deleted) {
      this.root = result.node;
      this._size--;
      return true;
    }
    return false;
  }

  private _delete(node: Node<T> | null, value: T): { deleted: boolean; node: Node<T> | null } {
    if (node === null) return { deleted: false, node: null };

    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      const result = this._delete(node.left, value);
      node.left = result.node;
      if (!result.deleted) return result;
      this._updateSize(node);
      return { deleted: true, node };
    }
    if (cmp > 0) {
      const result = this._delete(node.right, value);
      node.right = result.node;
      if (!result.deleted) return result;
      this._updateSize(node);
      return { deleted: true, node };
    }

    if (node.left === null) return { deleted: true, node: node.right };
    if (node.right === null) return { deleted: true, node: node.left };

    const minNode = this._findMin(node.right);
    node.value = minNode.value;
    const result = this._delete(node.right, minNode.value);
    node.right = result.node;
    this._updateSize(node);
    return { deleted: true, node };
  }

  private _findMin(node: Node<T>): Node<T> {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
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

  rank(value: T): number {
    if (!this.has(value)) return 0;
    return this._rank(this.root, value);
  }

  private _rank(node: Node<T> | null, value: T): number {
    if (node === null) return 0;

    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      return this._rank(node.left, value);
    }
    if (cmp > 0) {
      const leftSize = node.left ? node.left.size : 0;
      return leftSize + 1 + this._rank(node.right, value);
    }
    return (node.left ? node.left.size : 0) + 1;
  }

  select(k: number): T | undefined {
    if (k < 1 || k > this._size) return undefined;
    return this._select(this.root, k);
  }

  private _select(node: Node<T> | null, k: number): T | undefined {
    if (node === null) return undefined;

    const leftSize = node.left ? node.left.size : 0;
    if (k <= leftSize) {
      return this._select(node.left, k);
    }
    if (k === leftSize + 1) {
      return node.value;
    }
    return this._select(node.right, k - leftSize - 1);
  }

  min(): T | undefined {
    if (this.root === null) return undefined;
    let node = this.root;
    while (node.left !== null) {
      node = node.left;
    }
    return node.value;
  }

  max(): T | undefined {
    if (this.root === null) return undefined;
    let node = this.root;
    while (node.right !== null) {
      node = node.right;
    }
    return node.value;
  }

  toArray(): T[] {
    const result: T[] = [];
    this._inorder(this.root, result);
    return result;
  }

  private _inorder(node: Node<T> | null, result: T[]): void {
    if (node === null) return;
    this._inorder(node.left, result);
    result.push(node.value);
    this._inorder(node.right, result);
  }

  forEach(callback: (value: T) => void): void {
    this._forEach(this.root, callback);
  }

  private _forEach(node: Node<T> | null, callback: (value: T) => void): void {
    if (node === null) return;
    this._forEach(node.left, callback);
    callback(node.value);
    this._forEach(node.right, callback);
  }

  private _updateSize(node: Node<T>): void {
    const leftSize = node.left ? node.left.size : 0;
    const rightSize = node.right ? node.right.size : 0;
    node.size = leftSize + rightSize + 1;
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

type Node<T> = {
  value: T;
  left: Node<T> | null;
  right: Node<T> | null;
  size: number;
};
