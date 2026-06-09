type Comparator<T> = (a: T, b: T) => number;

class Node<T> {
  left: Node<T> | null;
  right: Node<T> | null;
  height: number;
  value: T;

  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

export class AVLTree3<T> {
  private root: Node<T> | null;
  private _size: number;
  private compare: Comparator<T>;

  constructor(comparator?: Comparator<T>) {
    this.root = null;
    this._size = 0;
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
    this._size++;
  }

  private insertNode(node: Node<T> | null, value: T): Node<T> {
    if (node === null) {
      return new Node(value);
    }

    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value);
    } else {
      this._size--;
      return node;
    }

    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    return this.rebalance(node);
  }

  delete(value: T): void {
    const deleted = this.contains(value);
    this.root = this.deleteNode(this.root, value);
    if (deleted) {
      this._size--;
    }
  }

  private deleteNode(node: Node<T> | null, value: T): Node<T> | null {
    if (node === null) {
      return null;
    }

    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, value);
    } else {
      if (node.left === null) {
        return node.right;
      }
      if (node.right === null) {
        return node.left;
      }
      const successor = this.getMinNode(node.right);
      node.value = successor!.value;
      node.right = this.deleteNode(node.right, successor!.value);
    }

    if (node === null) {
      return null;
    }

    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    return this.rebalance(node);
  }

  search(value: T): boolean {
    return this.contains(value);
  }

  contains(value: T): boolean {
    let current = this.root;
    while (current !== null) {
      const cmp = this.compare(value, current.value);
      if (cmp === 0) {
        return true;
      } else if (cmp < 0) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return false;
  }

  min(): T | null {
    const node = this.getMinNode(this.root);
    return node ? node.value : null;
  }

  private getMinNode(node: Node<T> | null): Node<T> | null {
    if (node === null) {
      return null;
    }
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  max(): T | null {
    const node = this.getMaxNode(this.root);
    return node ? node.value : null;
  }

  private getMaxNode(node: Node<T> | null): Node<T> | null {
    if (node === null) {
      return null;
    }
    while (node.right !== null) {
      node = node.right;
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

  toArray(): T[] {
    const result: T[] = [];
    this.inOrderTraversal(this.root, result);
    return result;
  }

  private inOrderTraversal(node: Node<T> | null, result: T[]): void {
    if (node === null) {
      return;
    }
    this.inOrderTraversal(node.left, result);
    result.push(node.value);
    this.inOrderTraversal(node.right, result);
  }

  forEach(callback: (value: T) => void): void {
    this.forEachInternal(this.root, callback);
  }

  private forEachInternal(node: Node<T> | null, callback: (value: T) => void): void {
    if (node === null) {
      return;
    }
    this.forEachInternal(node.left, callback);
    callback(node.value);
    this.forEachInternal(node.right, callback);
  }

  height(): number {
    return this.getHeight(this.root);
  }

  private getHeight(node: Node<T> | null): number {
    return node ? node.height : 0;
  }

  private getBalanceFactor(node: Node<T>): number {
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  private rebalance(node: Node<T>): Node<T> {
    const balance = this.getBalanceFactor(node);

    if (balance > 1) {
      if (this.getBalanceFactor(node.left!) >= 0) {
        return this.rotateRight(node);
      } else {
        node.left = this.rotateLeft(node.left!);
        return this.rotateRight(node);
      }
    }

    if (balance < -1) {
      if (this.getBalanceFactor(node.right!) <= 0) {
        return this.rotateLeft(node);
      } else {
        node.right = this.rotateRight(node.right!);
        return this.rotateLeft(node);
      }
    }

    return node;
  }

  private rotateRight(y: Node<T>): Node<T> {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));
    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));

    return x;
  }

  private rotateLeft(x: Node<T>): Node<T> {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));
    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));

    return y;
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
}
