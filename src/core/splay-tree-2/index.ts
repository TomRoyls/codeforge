type Comparator<T> = (a: T, b: T) => number;

interface Node<T> {
  value: T;
  left: Node<T> | null;
  right: Node<T> | null;
  parent: Node<T> | null;
}

export class SplayTree2<T> {
  private root: Node<T> | null = null;
  private _size: number = 0;
  private compare: Comparator<T>;

  constructor(comparator?: Comparator<T>) {
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

  insert(value: T): void {
    if (!this.root) {
      this.root = { value, left: null, right: null, parent: null };
      this._size++;
      return;
    }

    let current = this.root;

    while (current) {
      const cmp = this.compare(value, current.value);
      if (cmp === 0) return;
      if (cmp < 0) {
        if (!current.left) {
          current.left = { value, left: null, right: null, parent: current };
          this._size++;
          this.splay(current.left);
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = { value, left: null, right: null, parent: current };
          this._size++;
          this.splay(current.right);
          return;
        }
        current = current.right;
      }
    }
  }

  search(value: T): T | null {
    const node = this.findNode(value);
    if (node) {
      this.splay(node);
      return node.value;
    }
    return null;
  }

  contains(value: T): boolean {
    return this.search(value) !== null;
  }

  delete(value: T): void {
    const node = this.findNode(value);
    if (!node) return;

    this.splay(node);

    if (!node.left) {
      this.transplant(node, node.right);
    } else if (!node.right) {
      this.transplant(node, node.left);
    } else {
      const successor = this.minimumNode(node.right)!;
      if (successor.parent !== node) {
        this.transplant(successor, successor.right);
        successor.right = node.right;
        if (successor.right) {
          successor.right!.parent = successor;
        }
      }
      this.transplant(node, successor);
      successor.left = node.left;
      if (successor.left) {
        successor.left!.parent = successor;
      }
    }

    this._size--;
    this.root = this.root || null;
  }

  min(): T | null {
    const node = this.minimumNode(this.root);
    return node ? node.value : null;
  }

  max(): T | null {
    const node = this.maximumNode(this.root);
    return node ? node.value : null;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    this.inOrderTraversal((value) => result.push(value));
    return result;
  }

  inOrderTraversal(callback: (value: T) => void): void {
    this.inOrder(this.root, callback);
  }

  private findNode(value: T): Node<T> | null {
    let current = this.root;
    while (current) {
      const cmp = this.compare(value, current.value);
      if (cmp === 0) return current;
      current = cmp < 0 ? current.left : current.right;
    }
    return null;
  }

  private splay(node: Node<T>): void {
    while (node.parent) {
      const parent = node.parent;
      const grandparent = parent.parent;

      if (!grandparent) {
        if (node === parent.left) {
          this.rotateRight(parent);
        } else {
          this.rotateLeft(parent);
        }
      } else if (node === parent.left && parent === grandparent.left) {
        this.rotateRight(grandparent);
        this.rotateRight(parent);
      } else if (node === parent.right && parent === grandparent.right) {
        this.rotateLeft(grandparent);
        this.rotateLeft(parent);
      } else if (node === parent.right && parent === grandparent.left) {
        this.rotateLeft(parent);
        this.rotateRight(grandparent);
      } else {
        this.rotateRight(parent);
        this.rotateLeft(grandparent);
      }
    }
  }

  private rotateLeft(x: Node<T>): void {
    const y = x.right!;
    x.right = y.left;
    if (y.left) {
      y.left.parent = x;
    }
    y.parent = x.parent;
    if (!x.parent) {
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
    const y = x.left!;
    x.left = y.right;
    if (y.right) {
      y.right.parent = x;
    }
    y.parent = x.parent;
    if (!x.parent) {
      this.root = y;
    } else if (x === x.parent.right) {
      x.parent.right = y;
    } else {
      x.parent.left = y;
    }
    y.right = x;
    x.parent = y;
  }

  private transplant(u: Node<T>, v: Node<T> | null): void {
    if (!u.parent) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }
    if (v) {
      v.parent = u.parent;
    }
  }

  private minimumNode(node: Node<T> | null): Node<T> | null {
    while (node && node.left) {
      node = node.left;
    }
    return node;
  }

  private maximumNode(node: Node<T> | null): Node<T> | null {
    while (node && node.right) {
      node = node.right;
    }
    return node;
  }

  private inOrder(node: Node<T> | null, callback: (value: T) => void): void {
    if (!node) return;
    this.inOrder(node.left, callback);
    callback(node.value);
    this.inOrder(node.right, callback);
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
    return `SplayTree2({ size: ${this.size} })`
  }
}
