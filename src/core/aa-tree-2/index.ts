type Comparator<T> = (a: T, b: T) => number;

class Node<T> {
  value: T;
  count: number;
  level: number;
  left: Node<T> | null;
  right: Node<T> | null;
  parent: Node<T> | null;

  constructor(value: T) {
    this.value = value;
    this.count = 1;
    this.level = 1;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

export class AATree2<T> {
  private root: Node<T> | null;
  private comparator: Comparator<T>;
  private _size: number;

  constructor(comparator?: Comparator<T>) {
    this.root = null;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this._size = 0;
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

  insert(value: T): this {
    this.root = this.insertNode(this.root, value);
    return this;
  }

  private insertNode(node: Node<T> | null, value: T): Node<T> {
    if (!node) {
      this._size++;
      return new Node(value);
    }

    const cmp = this.comparator(value, node.value);

    if (cmp < 0) {
      node.left = this.insertNode(node.left, value);
      if (node.left) {
        node.left.parent = node;
      }
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value);
      if (node.right) {
        node.right.parent = node;
      }
    } else {
      node.count++;
    }

    return this.skew(this.split(node));
  }

  private skew(node: Node<T>): Node<T> {
    if (!node.left || node.left.level !== node.level) {
      return node;
    }

    const left = node.left;
    node.left = left.right;
    if (left.right) {
      left.right.parent = node;
    }
    left.right = node;
    left.parent = node.parent;
    node.parent = left;

    return left;
  }

  private split(node: Node<T>): Node<T> {
    if (!node.right || !node.right.right || node.right.right.level !== node.level) {
      return node;
    }

    const right = node.right;
    node.right = right.left;
    if (right.left) {
      right.left.parent = node;
    }
    right.left = node;
    right.parent = node.parent;
    node.parent = right;
    right.level++;

    return right;
  }

  delete(value: T): this {
    this.root = this.deleteNode(this.root, value);
    return this;
  }

  private deleteNode(node: Node<T> | null, value: T): Node<T> | null {
    if (!node) {
      return null;
    }

    const cmp = this.comparator(value, node.value);

    if (cmp < 0) {
      node.left = this.deleteNode(node.left, value);
      if (node.left) {
        node.left.parent = node;
      }
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, value);
      if (node.right) {
        node.right.parent = node;
      }
    } else {
      node.count--;
      if (node.count > 0) {
        return node;
      }
      this._size--;
      if (!node.left && !node.right) {
        return null;
      }

      if (!node.left) {
        const successor = this.findMin(node.right!);
        node.value = successor.value;
        node.count = successor.count;
        this._size++;
        node.right = this.deleteNode(node.right, successor.value);
        if (node.right) {
          node.right.parent = node;
        }
      } else if (!node.right) {
        const predecessor = this.findMax(node.left);
        node.value = predecessor.value;
        node.count = predecessor.count;
        this._size++;
        node.left = this.deleteNode(node.left, predecessor.value);
        if (node.left) {
          node.left.parent = node;
        }
      } else {
        const successor = this.findMin(node.right!);
        node.value = successor.value;
        node.count = successor.count;
        this._size++;
        node.right = this.deleteNode(node.right, successor.value);
        if (node.right) {
          node.right.parent = node;
        }
      }
    }

    return this.rebalance(node);
  }

  private rebalance(node: Node<T>): Node<T> {
    let minLevel = 1;

    if (node.left) {
      minLevel = node.left.level;
    }
    if (node.right && node.right.level < minLevel) {
      minLevel = node.right.level;
    }

    minLevel++;

    if (node.level > minLevel) {
      node.level = minLevel;
      if (node.right && node.right.level > minLevel) {
        node.right.level = minLevel;
      }
    }

    return this.skew(this.split(this.skew(node)));
  }

  private findMin(node: Node<T>): Node<T> {
    while (node.left) {
      node = node.left;
    }
    return node;
  }

  private findMax(node: Node<T>): Node<T> {
    while (node.right) {
      node = node.right;
    }
    return node;
  }

  search(value: T): boolean {
    return this.contains(value);
  }

  contains(value: T): boolean {
    let node = this.root;
    while (node) {
      const cmp = this.comparator(value, node.value);
      if (cmp === 0) {
        return true;
      }
      node = cmp < 0 ? node.left : node.right;
    }
    return false;
  }

  min(): T | null {
    if (!this.root) {
      return null;
    }
    return this.findMin(this.root).value;
  }

  max(): T | null {
    if (!this.root) {
      return null;
    }
    return this.findMax(this.root).value;
  }

  toArray(): T[] {
    const result: T[] = [];
    this.inorderTraversal(this.root, result);
    return result;
  }

  private inorderTraversal(node: Node<T> | null, result: T[]): void {
    if (!node) {
      return;
    }
    this.inorderTraversal(node.left, result);
    result.push(node.value);
    this.inorderTraversal(node.right, result);
  }

  forEach(callback: (value: T, index: number) => void): void {
    const array = this.toArray();
    for (let i = 0; i < array.length; i++) {
      callback(array[i]!, i);
    }
  }

  height(): number {
    return this.calculateHeight(this.root);
  }

  private calculateHeight(node: Node<T> | null): number {
    if (!node) {
      return 0;
    }
    const leftHeight = this.calculateHeight(node.left);
    const rightHeight = this.calculateHeight(node.right);
    return 1 + Math.max(leftHeight, rightHeight);
  }


  *[Symbol.iterator](): IterableIterator<T> {
    const stack: Array<Node<T>> = [];
    let current: Node<T> | null = this.root;
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current);
        current = current.left;
      }
      current = stack.pop()!;
      yield current.value;
      current = current.right;
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `${AATree2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'AATree2', size: this.size, items: this.toArray() }
  }

  map<R>(fn: (item: T) => R): R[] {
    return this.toArray().map(fn)
  }

  filter(fn: (item: T) => boolean): T[] {
    return this.toArray().filter(fn)
  }

  reduce<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduce(fn, initial)
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
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }
}
