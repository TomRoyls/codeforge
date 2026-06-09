interface CountedBTreeNode<T> {
  keys: T[];
  children: CountedBTreeNode<T>[];
  leaf: boolean;
  count: number;
}

export class CountedBTree2<T> {
  private root: CountedBTreeNode<T> | null;
  private order: number;
  private comparator: (a: T, b: T) => number;
  private _size: number;

  constructor(order?: number, compare?: (a: T, b: T) => number) {
    if (order !== undefined && order < 2) {
      throw new RangeError(`B-tree order must be >= 2, got ${order}`);
    }
    this.order = order ?? 4;
    this.comparator = compare ?? ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.root = null;
    this._size = 0;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  insert(value: T): void {
    if (this.root === null) {
      this.root = {
        keys: [value],
        children: [],
        leaf: true,
        count: 1
      };
      this._size++;
      return;
    }

    const root = this.root;
    if (root.keys.length === 2 * this.order - 1) {
      const newRoot: CountedBTreeNode<T> = {
        keys: [],
        children: [root],
        leaf: false,
        count: root.count
      };
      this.splitChild(newRoot, 0, root);
      this.root = newRoot;
      this.insertNonFull(newRoot, value);
    } else {
      this.insertNonFull(root, value);
    }
    this._size++;
  }

  private splitChild(parent: CountedBTreeNode<T>, index: number, child: CountedBTreeNode<T>): void {
    const order = this.order;
    const newNode: CountedBTreeNode<T> = {
      keys: child.keys.slice(order),
      children: child.children.slice(order),
      leaf: child.leaf,
      count: 0
    };
    const midKey = child.keys[order - 1];

    child.keys = child.keys.slice(0, order - 1);
    child.children = child.children.slice(0, order);

    newNode.count = newNode.keys.length;
    for (let i = 0; i < newNode.children.length; i++) {
      newNode.count += newNode.children[i]!.count;
    }

    child.count = child.keys.length;
    for (let i = 0; i < child.children.length; i++) {
      child.count += child.children[i]!.count;
    }

    parent.keys.splice(index, 0, midKey!);
    parent.children.splice(index + 1, 0, newNode);
    parent.count++;
  }

  private insertNonFull(node: CountedBTreeNode<T>, value: T): void {
    if (node.leaf) {
      let i = node.keys.length - 1;
      node.keys.push(value);
      while (i >= 0 && this.comparator(value, node.keys[i]!) < 0) {
        node.keys[i + 1] = node.keys[i]!;
        i--;
      }
      node.keys[i + 1] = value;
      node.count++;
    } else {
      let i = 0;
      while (i < node.keys.length && this.comparator(value, node.keys[i]!) > 0) {
        i++;
      }

      if (node.children[i]!.keys.length === 2 * this.order - 1) {
        this.splitChild(node, i, node.children[i]!);
        if (this.comparator(value, node.keys[i]!) > 0) {
          i++;
        }
      }
      this.insertNonFull(node.children[i]!, value);
    }
  }

  has(value: T): boolean {
    return this.searchNode(this.root, value) !== null;
  }

  private searchNode(node: CountedBTreeNode<T> | null, value: T): CountedBTreeNode<T> | null {
    if (node === null) return null;

    let i = 0;
    while (i < node.keys.length && this.comparator(value, node.keys[i]!) > 0) {
      i++;
    }

    if (i < node.keys.length && this.comparator(value, node.keys[i]!) === 0) {
      return node;
    }

    if (node.leaf) {
      return null;
    }

    return this.searchNode(node.children[i]!, value);
  }

  delete(value: T): boolean {
    if (this.root === null) return false;

    const result = { found: false };
    const deleted = this.deleteFromNode(this.root, value, result);
    if (deleted) {
      this._size--;
      if (this.root !== null && this.root.keys.length === 0 && !this.root.leaf) {
        this.root = this.root.children[0]!;
      }
    }
    return result.found;
  }

  private deleteFromNode(node: CountedBTreeNode<T>, value: T, result: { found: boolean }): boolean {
    let i = 0;
    while (i < node.keys.length && this.comparator(value, node.keys[i]!) > 0) {
      i++;
    }

    if (i < node.keys.length && this.comparator(value, node.keys[i]!) === 0) {
      result.found = true;
      if (node.leaf) {
        node.keys.splice(i, 1);
        node.count--;
        return true;
      } else {
        const pred = this.getPredecessor(node, i);
        node.keys[i] = pred;
        const predDeleted = this.deleteFromNode(node.children[i]!, pred, result);
        if (predDeleted) {
          node.count--;
        }
        return true;
      }
    } else if (!node.leaf) {
      const childDeleted = this.deleteFromNode(node.children[i]!, value, result);
      if (childDeleted) {
        node.count--;
      }
      return childDeleted;
    }
    return false;
  }

  private getPredecessor(node: CountedBTreeNode<T>, index: number): T {
    let current = node.children[index]!;
    while (!current.leaf) {
      current = current.children[current.children.length - 1]!;
    }
    return current.keys[current.keys.length - 1]!;
  }

  at(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;
    return this.atNode(this.root, index);
  }

  private atNode(node: CountedBTreeNode<T> | null, index: number): T | undefined {
    if (node === null) return undefined;

    let currentIndex = 0;
    for (let i = 0; i < node.keys.length; i++) {
      const childCount = node.leaf ? 0 : node.children[i]!.count;
      if (index < currentIndex + childCount) {
        return this.atNode(node.children[i]!, index - currentIndex);
      }
      currentIndex += childCount;
      if (index === currentIndex) {
        return node.keys[i]!;
      }
      currentIndex++;
    }

    if (node.leaf) {
      return undefined;
    }
    return this.atNode(node.children[node.children.length - 1]!, index - currentIndex);
  }

  indexOf(value: T): number {
    return this.indexOfNode(this.root, value, 0);
  }

  private indexOfNode(node: CountedBTreeNode<T> | null, value: T, offset: number): number {
    if (node === null) return -1;

    let currentIndex = offset;
    for (let i = 0; i < node.keys.length; i++) {
      const childCount = node.leaf ? 0 : node.children[i]!.count;
      const cmp = this.comparator(value, node.keys[i]!);
      if (cmp === 0) {
        return currentIndex + childCount;
      }
      if (cmp < 0) {
        if (!node.leaf) {
          return this.indexOfNode(node.children[i]!, value, currentIndex);
        }
        return -1;
      }
      currentIndex += childCount + 1;
    }

    if (node.leaf) {
      return -1;
    }
    return this.indexOfNode(node.children[node.children.length - 1]!, value, currentIndex);
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    this.inorderTraversal(this.root, result);
    return result;
  }

  private inorderTraversal(node: CountedBTreeNode<T> | null, result: T[]): void {
    if (node === null) return;

    for (let i = 0; i < node.keys.length; i++) {
      if (!node.leaf) {
        this.inorderTraversal(node.children[i]!, result);
      }
      result.push(node.keys[i]!);
    }
    if (!node.leaf) {
      this.inorderTraversal(node.children[node.children.length - 1]!, result);
    }
  }

  [Symbol.iterator](): Iterator<T> {
    type Frame = { node: CountedBTreeNode<T>; idx: number; childVisited: boolean };
    const stack: Frame[] = [];
    if (this.root !== null) {
      stack.push({ node: this.root, idx: 0, childVisited: false });
    }
    return {
      next: () => {
        while (stack.length > 0) {
          const frame = stack[stack.length - 1]!;
          if (!frame.node.leaf && !frame.childVisited && frame.idx < frame.node.children.length) {
            frame.childVisited = true;
            stack.push({ node: frame.node.children[frame.idx]!, idx: 0, childVisited: false });
            continue;
          }
          if (frame.idx < frame.node.keys.length) {
            const value = frame.node.keys[frame.idx]!;
            frame.idx++;
            frame.childVisited = false;
            return { value: value as T, done: false };
          }
          stack.pop();
        }
        return { value: undefined as unknown as T, done: true };
      }
    };
  }

  toString(): string {
    return `${CountedBTree2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'CountedBTree2', size: this.size, items: this.toArray() }
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

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }
}
