class Node<T> {
  value: T;
  left: Node<T> | null;
  right: Node<T> | null;
  size: number;

  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.size = 1;
  }
}

export class WeightBalancedTree3<T> {
  private root: Node<T> | null;
  private comparator: (a: T, b: T) => number;
  private alpha: number;
  private _size: number;

  constructor(comparator?: (a: T, b: T) => number, alpha: number = 0.288) {
    this.root = null;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.alpha = alpha;
    this._size = 0;
  }

  insert(value: T): void {
    const { node, inserted } = this._insert(this.root, value);
    this.root = node;
    if (inserted) {
      this._size++;
    }
  }

  private _insert(node: Node<T> | null, value: T): { node: Node<T>; inserted: boolean } {
    if (!node) {
      return { node: new Node(value), inserted: true };
    }

    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      const result = this._insert(node.left, value);
      node.left = result.node;
      if (!result.inserted) {
        node.size = 1 + this._getSize(node.left) + this._getSize(node.right);
        return { node, inserted: false };
      }
    } else if (cmp > 0) {
      const result = this._insert(node.right, value);
      node.right = result.node;
      if (!result.inserted) {
        node.size = 1 + this._getSize(node.left) + this._getSize(node.right);
        return { node, inserted: false };
      }
    } else {
      return { node, inserted: false };
    }

    node.size = 1 + this._getSize(node.left) + this._getSize(node.right);
    return { node: this._rebalance(node), inserted: true };
  }

  delete(value: T): void {
    const { node, deleted } = this._delete(this.root, value);
    this.root = node;
    if (deleted) {
      this._size--;
    }
  }

  private _delete(node: Node<T> | null, value: T): { node: Node<T> | null; deleted: boolean } {
    if (!node) {
      return { node: null, deleted: false };
    }

    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      const result = this._delete(node.left, value);
      node.left = result.node;
      node.size = 1 + this._getSize(node.left) + this._getSize(node.right);
      return { node: this._rebalance(node), deleted: result.deleted };
    } else if (cmp > 0) {
      const result = this._delete(node.right, value);
      node.right = result.node;
      node.size = 1 + this._getSize(node.left) + this._getSize(node.right);
      return { node: this._rebalance(node), deleted: result.deleted };
    } else {
      if (!node.left && !node.right) {
        return { node: null, deleted: true };
      } else if (!node.left) {
        return { node: node.right, deleted: true };
      } else if (!node.right) {
        return { node: node.left, deleted: true };
      } else {
        const successor = this._findMin(node.right!);
        node.value = successor.value;
        const result = this._delete(node.right, successor.value);
        node.right = result.node;
        node.size = 1 + this._getSize(node.left) + this._getSize(node.right);
        return { node: this._rebalance(node), deleted: true };
      }
    }
  }

  private _findMin(node: Node<T>): Node<T> {
    while (node.left) {
      node = node.left;
    }
    return node;
  }

  search(value: T): boolean {
    let current = this.root;
    while (current) {
      const cmp = this.comparator(value, current.value);
      if (cmp === 0) return true;
      current = cmp < 0 ? current.left : current.right;
    }
    return false;
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  min(): T | null {
    if (!this.root) return null;
    let node = this.root;
    while (node.left) {
      node = node.left;
    }
    return node.value;
  }

  max(): T | null {
    if (!this.root) return null;
    let node = this.root;
    while (node.right) {
      node = node.right;
    }
    return node.value;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this.root === null;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    this._inorder(this.root, result);
    return result;
  }

  private _inorder(node: Node<T> | null, result: T[]): void {
    if (!node) return;
    this._inorder(node.left, result);
    result.push(node.value);
    this._inorder(node.right, result);
  }

  forEach(callback: (value: T) => void): void {
    this._inorderCallback(this.root, callback);
  }

  private _inorderCallback(node: Node<T> | null, callback: (value: T) => void): void {
    if (!node) return;
    this._inorderCallback(node.left, callback);
    callback(node.value);
    this._inorderCallback(node.right, callback);
  }

  height(): number {
    return this._height(this.root);
  }

  private _height(node: Node<T> | null): number {
    if (!node) return 0;
    return 1 + Math.max(this._height(node.left), this._height(node.right));
  }

  private _getSize(node: Node<T> | null): number {
    return node ? node.size : 0;
  }

  private _rebalance(node: Node<T>): Node<T> {
    if (!node) return node;

    const leftSize = this._getSize(node.left);
    const rightSize = this._getSize(node.right);
    const nodeSize = node.size;
    const threshold = this.alpha * nodeSize;

    if (Math.abs(leftSize - rightSize) > threshold) {
      if (leftSize > rightSize) {
        const left = node.left!;
        const leftLeftSize = this._getSize(left.left);
        const leftRightSize = this._getSize(left.right);

        if (leftLeftSize >= leftRightSize) {
          return this._rotateRight(node);
        } else {
          node.left = this._rotateLeft(left);
          return this._rotateRight(node);
        }
      } else {
        const right = node.right!;
        const rightLeftSize = this._getSize(right.left);
        const rightRightSize = this._getSize(right.right);

        if (rightRightSize >= rightLeftSize) {
          return this._rotateLeft(node);
        } else {
          node.right = this._rotateRight(right);
          return this._rotateLeft(node);
        }
      }
    }

    return node;
  }

  private _rotateLeft(node: Node<T>): Node<T> {
    const newRoot = node.right!;
    node.right = newRoot.left;
    newRoot.left = node;

    node.size = 1 + this._getSize(node.left) + this._getSize(node.right);
    newRoot.size = 1 + this._getSize(newRoot.left) + this._getSize(newRoot.right);

    return newRoot;
  }

  private _rotateRight(node: Node<T>): Node<T> {
    const newRoot = node.left!;
    node.left = newRoot.right;
    newRoot.right = node;

    node.size = 1 + this._getSize(node.left) + this._getSize(node.right);
    newRoot.size = 1 + this._getSize(newRoot.left) + this._getSize(newRoot.right);

    return newRoot;
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const stack: Array<Node<T>> = [];
    let current: Node<T> | null = this.root;
    return {
      next: () => {
        while (current !== null || stack.length > 0) {
          while (current !== null) {
            stack.push(current);
            current = current.left;
          }
          current = stack.pop()!;
          const value = current.value;
          current = current.right;
          return { value: value as ReturnType<this['toArray']>[number], done: false };
        }
        return { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true };
      }
    };
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'WeightBalancedTree3', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `WeightBalancedTree3({ size: ${this.size} })`
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }
}
