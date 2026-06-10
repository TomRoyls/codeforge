class Node<T> {
  value: T;
  left: Node<T> | null;
  right: Node<T> | null;
  parent: Node<T> | null;

  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

export class SplayTree3<T> {
  private root: Node<T> | null;
  private _size: number;
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.root = null;
    this._size = 0;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    if (this.root === null) {
      this.root = new Node(value);
      this._size++;
      return;
    }

    let current = this.root;

    while (current !== null) {
      const cmp = this.comparator(value, current.value);
      if (cmp < 0) {
        if (current.left === null) {
          current.left = new Node(value);
          current.left.parent = current;
          this._size++;
          this.splay(current.left);
          return;
        }
        current = current.left;
      } else if (cmp > 0) {
        if (current.right === null) {
          current.right = new Node(value);
          current.right.parent = current;
          this._size++;
          this.splay(current.right);
          return;
        }
        current = current.right;
      } else {
        this.splay(current);
        return;
      }
    }
  }

  search(value: T): boolean {
    const node = this.findNode(value);
    if (node !== null) {
      this.splay(node);
      return true;
    }
    return false;
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  remove(value: T): boolean {
    const node = this.findNode(value);
    if (node === null) {
      return false;
    }

    this.splay(node);

    if (node.left === null) {
      this.transplant(node, node.right);
    } else if (node.right === null) {
      this.transplant(node, node.left);
    } else {
      const successor = this.minimum(node.right);
      if (successor.parent !== node) {
        this.transplant(successor, successor.right);
        successor.right = node.right;
        if (successor.right !== null) {
          successor.right.parent = successor;
        }
      }
      this.transplant(node, successor);
      successor.left = node.left;
      if (successor.left !== null) {
        successor.left.parent = successor;
      }
    }

    this._size--;
    return true;
  }

  min(): T | undefined {
    if (this.root === null) {
      return undefined;
    }
    const minNode = this.minimum(this.root);
    this.splay(minNode);
    return minNode.value;
  }

  max(): T | undefined {
    if (this.root === null) {
      return undefined;
    }
    const maxNode = this.maximum(this.root);
    this.splay(maxNode);
    return maxNode.value;
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
    this.inorderTraversal(this.root, (value) => result.push(value));
    return result;
  }

  forEach(callback: (value: T) => void): void {
    this.inorderTraversal(this.root, callback);
  }

  predecessor(value: T): T | undefined {
    const node = this.findNode(value);
    if (node === null) {
      return undefined;
    }

    this.splay(node);

    if (node.left !== null) {
      const maxNode = this.maximum(node.left);
      this.splay(maxNode);
      return maxNode.value;
    }

    let current = node;
    let parent = current.parent;
    while (parent !== null && current === parent.left) {
      current = parent;
      parent = parent.parent;
    }

    if (parent === null) {
      return undefined;
    }

    this.splay(parent);
    return parent.value;
  }

  successor(value: T): T | undefined {
    const node = this.findNode(value);
    if (node === null) {
      return undefined;
    }

    this.splay(node);

    if (node.right !== null) {
      const minNode = this.minimum(node.right);
      this.splay(minNode);
      return minNode.value;
    }

    let current = node;
    let parent = current.parent;
    while (parent !== null && current === parent.right) {
      current = parent;
      parent = parent.parent;
    }

    if (parent === null) {
      return undefined;
    }

    this.splay(parent);
    return parent.value;
  }

  rangeSearch(low: T, high: T): T[] {
    const result: T[] = [];
    this.rangeTraversal(this.root, low, high, (value) => result.push(value));
    return result;
  }

  private findNode(value: T): Node<T> | null {
    let current = this.root;
    while (current !== null) {
      const cmp = this.comparator(value, current.value);
      if (cmp < 0) {
        current = current.left;
      } else if (cmp > 0) {
        current = current.right;
      } else {
        return current;
      }
    }
    return null;
  }

  private minimum(node: Node<T>): Node<T> {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  private maximum(node: Node<T>): Node<T> {
    while (node.right !== null) {
      node = node.right;
    }
    return node;
  }

  private transplant(u: Node<T>, v: Node<T> | null): void {
    if (u.parent === null) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }

    if (v !== null) {
      v.parent = u.parent;
    }
  }

  private splay(x: Node<T>): void {
    while (x.parent !== null) {
      if (x.parent.parent === null) {
        if (x === x.parent.left) {
          this.rotateRight(x.parent);
        } else {
          this.rotateLeft(x.parent);
        }
      } else if (x === x.parent.left && x.parent === x.parent.parent.left) {
        this.rotateRight(x.parent.parent);
        this.rotateRight(x.parent);
      } else if (x === x.parent.right && x.parent === x.parent.parent.right) {
        this.rotateLeft(x.parent.parent);
        this.rotateLeft(x.parent);
      } else if (x === x.parent.right && x.parent === x.parent.parent.left) {
        this.rotateLeft(x.parent);
        this.rotateRight(x.parent);
      } else {
        this.rotateRight(x.parent);
        this.rotateLeft(x.parent);
      }
    }
    this.root = x;
  }

  private rotateLeft(x: Node<T>): void {
    const y = x.right;
    if (y === null) return;

    x.right = y.left;
    if (y.left !== null) {
      y.left.parent = x;
    }

    y.parent = x.parent;
    if (x.parent === null) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }

    y.left = x;
    x.parent = y;
  }

  private rotateRight(x: Node<T>): void {
    const y = x.left;
    if (y === null) return;

    x.left = y.right;
    if (y.right !== null) {
      y.right.parent = x;
    }

    y.parent = x.parent;
    if (x.parent === null) {
      this.root = y;
    } else if (x === x.parent.right) {
      x.parent.right = y;
    } else {
      x.parent.left = y;
    }

    y.right = x;
    x.parent = y;
  }

  private inorderTraversal(node: Node<T> | null, callback: (value: T) => void): void {
    if (node === null) {
      return;
    }
    this.inorderTraversal(node.left, callback);
    callback(node.value);
    this.inorderTraversal(node.right, callback);
  }

  private rangeTraversal(node: Node<T> | null, low: T, high: T, callback: (value: T) => void): void {
    if (node === null) {
      return;
    }

    const cmpLow = this.comparator(low, node.value);
    const cmpHigh = this.comparator(high, node.value);

    if (cmpLow < 0) {
      this.rangeTraversal(node.left, low, high, callback);
    }

    if (cmpLow <= 0 && cmpHigh >= 0) {
      callback(node.value);
    }

    if (cmpHigh > 0) {
      this.rangeTraversal(node.right, low, high, callback);
    }
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

  toString(): string {
    return `SplayTree3({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SplayTree3', size: this.size, items: this.toArray() }
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

  unique(): T[] {
    return [...new Set(this.toArray())]
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }
}
