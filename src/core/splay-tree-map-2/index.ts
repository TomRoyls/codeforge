class Node<K, V> {
  key: K;
  value: V;
  left: Node<K, V> | null;
  right: Node<K, V> | null;
  parent: Node<K, V> | null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

export class SplayTreeMap2<K, V> {
  private root: Node<K, V> | null;
  private comparator: (a: K, b: K) => number;
  private _size: number;

  constructor(comparator?: (a: K, b: K) => number) {
    this.root = null;
    this._size = 0;
    this.comparator = comparator || this.defaultComparator;
  }

  private defaultComparator(a: K, b: K): number {
    if (typeof a === 'number' && typeof b === 'number') {
      return (a as number) - (b as number);
    }
    const aStr = String(a);
    const bStr = String(b);
    return aStr.localeCompare(bStr);
  }

  private compare(a: K, b: K): number {
    return this.comparator(a, b);
  }

  private splay(node: Node<K, V>): void {
    while (node.parent !== null) {
      const parent = node.parent;
      const grandparent = parent.parent;

      if (grandparent === null) {
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
    this.root = node;
  }

  private rotateLeft(x: Node<K, V>): void {
    const y = x.right!;
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

  private rotateRight(x: Node<K, V>): void {
    const y = x.left!;
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

  private findNode(key: K): Node<K, V> | null {
    let current = this.root;
    while (current !== null) {
      const cmp = this.compare(key, current.key);
      if (cmp === 0) {
        return current;
      } else if (cmp < 0) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return current;
  }

  set(key: K, value: V): void {
    let node = this.findNode(key);
    if (node !== null) {
      node.value = value;
      this.splay(node);
      return;
    }

    const newNode = new Node(key, value);
    this._size++;

    if (this.root === null) {
      this.root = newNode;
      return;
    }

    let current: Node<K, V> | null = this.root;
    let parent: Node<K, V> | null = null;
    while (current !== null) {
      parent = current;
      const cmp = this.compare(key, current.key);
      if (cmp < 0) {
        current = current.left as Node<K, V> | null;
      } else {
        current = current.right as Node<K, V> | null;
      }
    }

    newNode.parent = parent;
    if (parent !== null) {
      const cmp = this.compare(key, parent.key);
      if (cmp < 0) {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }
    }

    this.splay(newNode);
  }

  get(key: K): V | undefined {
    const node = this.findNode(key);
    if (node !== null) {
      this.splay(node);
      return node.value;
    }
    return undefined;
  }

  has(key: K): boolean {
    return this.findNode(key) !== null;
  }

  delete(key: K): boolean {
    const node = this.findNode(key);
    if (node === null) {
      return false;
    }

    this.splay(node);
    this._size--;

    if (node.left === null) {
      this.root = node.right;
      if (this.root !== null) {
        this.root.parent = null;
      }
    } else if (node.right === null) {
      this.root = node.left;
      this.root.parent = null;
    } else {
      let maxLeft = node.left;
      while (maxLeft.right !== null) {
        maxLeft = maxLeft.right;
      }
      if (maxLeft.parent !== node) {
        maxLeft.parent!.right = maxLeft.left;
        if (maxLeft.left !== null) {
          maxLeft.left.parent = maxLeft.parent;
        }
        maxLeft.left = node.left;
        maxLeft.left!.parent = maxLeft;
      }
      maxLeft.right = node.right!;
      maxLeft.right!.parent = maxLeft;
      this.root = maxLeft;
      this.root.parent = null;
    }

    return true;
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

  min(): K | undefined {
    if (this.root === null) {
      return undefined;
    }
    let current = this.root;
    while (current.left !== null) {
      current = current.left;
    }
    return current.key;
  }

  max(): K | undefined {
    if (this.root === null) {
      return undefined;
    }
    let current = this.root;
    while (current.right !== null) {
      current = current.right;
    }
    return current.key;
  }

  private inorderTraversal(node: Node<K, V> | null, callback: (key: K, value: V) => void): void {
    if (node === null) {
      return;
    }
    this.inorderTraversal(node.left, callback);
    callback(node.key, node.value);
    this.inorderTraversal(node.right, callback);
  }

  forEach(callback: (key: K, value: V) => void): void {
    this.inorderTraversal(this.root, callback);
  }

  keys(): K[] {
    const result: K[] = [];
    this.forEach((key) => {
      result.push(key);
    });
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    this.forEach((_, value) => {
      result.push(value);
    });
    return result;
  }

  toArray(): [K, V][] {
    const result: [K, V][] = [];
    this.forEach((key, value) => {
      result.push([key, value]);
    });
    return result;
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
