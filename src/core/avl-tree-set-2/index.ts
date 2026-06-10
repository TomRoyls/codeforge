export class AVLTreeSet2<T> {
  private root: AVLNode<T> | null = null;
  private _size: number = 0;

  constructor(
    private comparator: (a: T, b: T) => number = (a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0)
  ) {}

  add(value: T): boolean {
    const [newRoot, added] = this.insert(this.root, value);
    if (added) {
      this.root = newRoot;
      this._size++;
      return true;
    }
    return false;
  }

  has(value: T): boolean {
    return this.find(this.root, value) !== null;
  }

  delete(value: T): boolean {
    const [newRoot, deleted] = this.remove(this.root, value);
    if (deleted) {
      this.root = newRoot;
      this._size--;
      return true;
    }
    return false;
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

  min(): T | undefined {
    if (!this.root) return undefined;
    let node = this.root;
    while (node.left) {
      node = node.left;
    }
    return node.value;
  }

  max(): T | undefined {
    if (!this.root) return undefined;
    let node = this.root;
    while (node.right) {
      node = node.right;
    }
    return node.value;
  }

  forEach(callback: (value: T) => void): void {
    this.inorder(this.root, callback);
  }

  toArray(): T[] {
    const result: T[] = [];
    this.inorder(this.root, (value) => result.push(value));
    return result;
  }

  lowerBound(value: T): T | undefined {
    return this.findLowerBound(this.root, value);
  }

  upperBound(value: T): T | undefined {
    return this.findUpperBound(this.root, value);
  }

  private insert(node: AVLNode<T> | null, value: T): [AVLNode<T> | null, boolean] {
    if (!node) {
      return [new AVLNode(value), true];
    }

    const cmp = this.comparator(value, node.value);

    if (cmp < 0) {
      const [leftNode, added] = this.insert(node.left, value);
      node.left = leftNode;
      if (added) {
        node.updateHeight();
        return [this.balance(node), true];
      }
      return [node, false];
    } else if (cmp > 0) {
      const [rightNode, added] = this.insert(node.right, value);
      node.right = rightNode;
      if (added) {
        node.updateHeight();
        return [this.balance(node), true];
      }
      return [node, false];
    } else {
      return [node, false];
    }
  }

  private remove(node: AVLNode<T> | null, value: T): [AVLNode<T> | null, boolean] {
    if (!node) {
      return [null, false];
    }

    const cmp = this.comparator(value, node.value);

    if (cmp < 0) {
      const [leftNode, deleted] = this.remove(node.left, value);
      node.left = leftNode;
      if (deleted) {
        node.updateHeight();
        return [this.balance(node), true];
      }
      return [node, false];
    } else if (cmp > 0) {
      const [rightNode, deleted] = this.remove(node.right, value);
      node.right = rightNode;
      if (deleted) {
        node.updateHeight();
        return [this.balance(node), true];
      }
      return [node, false];
    } else {
      const result = this.removeNode(node);
      return [result, true];
    }
  }

  private removeNode(node: AVLNode<T>): AVLNode<T> | null {
    if (!node.left) {
      return node.right;
    }
    if (!node.right) {
      return node.left;
    }

    const successor = this.getMinNode(node.right);
    const newRight = this.removeMin(node.right);
    successor.right = newRight;
    successor.left = node.left;
    successor.updateHeight();
    return this.balance(successor);
  }

  private removeMin(node: AVLNode<T>): AVLNode<T> | null {
    if (!node.left) {
      return node.right;
    }
    node.left = this.removeMin(node.left);
    node.updateHeight();
    return this.balance(node);
  }

  private getMinNode(node: AVLNode<T>): AVLNode<T> {
    while (node.left) {
      node = node.left;
    }
    return node;
  }

  private find(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (!node) {
      return null;
    }

    const cmp = this.comparator(value, node.value);

    if (cmp < 0) {
      return this.find(node.left, value);
    } else if (cmp > 0) {
      return this.find(node.right, value);
    } else {
      return node;
    }
  }

  private findLowerBound(node: AVLNode<T> | null, value: T): T | undefined {
    let result: T | undefined = undefined;
    let current = node;

    while (current) {
      const cmp = this.comparator(value, current.value);
      if (cmp <= 0) {
        result = current.value;
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return result;
  }

  private findUpperBound(node: AVLNode<T> | null, value: T): T | undefined {
    let result: T | undefined = undefined;
    let current = node;

    while (current) {
      const cmp = this.comparator(value, current.value);
      if (cmp < 0) {
        result = current.value;
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return result;
  }

  private inorder(node: AVLNode<T> | null, callback: (value: T) => void): void {
    if (!node) {
      return;
    }
    this.inorder(node.left, callback);
    callback(node.value);
    this.inorder(node.right, callback);
  }

  private balance(node: AVLNode<T>): AVLNode<T> {
    const balanceFactor = this.getBalanceFactor(node);

    if (balanceFactor > 1) {
      if (this.getBalanceFactor(node.left!) >= 0) {
        return this.rotateRight(node);
      } else {
        return this.rotateLeftRight(node);
      }
    }

    if (balanceFactor < -1) {
      if (this.getBalanceFactor(node.right!) <= 0) {
        return this.rotateLeft(node);
      } else {
        return this.rotateRightLeft(node);
      }
    }

    return node;
  }

  private rotateLeft(node: AVLNode<T>): AVLNode<T> {
    const newRoot = node.right!;
    node.right = newRoot.left;
    newRoot.left = node;

    node.updateHeight();
    newRoot.updateHeight();

    return newRoot;
  }

  private rotateRight(node: AVLNode<T>): AVLNode<T> {
    const newRoot = node.left!;
    node.left = newRoot.right;
    newRoot.right = node;

    node.updateHeight();
    newRoot.updateHeight();

    return newRoot;
  }

  private rotateLeftRight(node: AVLNode<T>): AVLNode<T> {
    node.left = this.rotateLeft(node.left!);
    return this.rotateRight(node);
  }

  private rotateRightLeft(node: AVLNode<T>): AVLNode<T> {
    node.right = this.rotateRight(node.right!);
    return this.rotateLeft(node);
  }

  private getBalanceFactor(node: AVLNode<T>): number {
    const leftHeight = node.left ? node.left.height : 0;
    const rightHeight = node.right ? node.right.height : 0;
    return leftHeight - rightHeight;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    const stack: Array<AVLNode<T>> = [];
    let current: AVLNode<T> | null = this.root;
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

toString(): string {
    return `${AVLTreeSet2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }
  toJSON() {
    return { type: 'AVLTreeSet2', size: this.size, items: this.toArray() }
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
}

class AVLNode<T> {
  height: number = 1;

  constructor(
    public value: T,
    public left: AVLNode<T> | null = null,
    public right: AVLNode<T> | null = null
  ) {}

  updateHeight(): void {
    const leftHeight = this.left ? this.left.height : 0;
    const rightHeight = this.right ? this.right.height : 0;
    this.height = Math.max(leftHeight, rightHeight) + 1;
  }

  
}
