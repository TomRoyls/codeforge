type BTreeNode<T> = {
  keys: T[];
  children: (BTreeNode<T> | null)[];
  leaf: boolean;
};

export class BTree<T> {
  private root: BTreeNode<T> | null;
  private order: number;
  private comparator: (a: T, b: T) => number;
  private treeSize: number;

  constructor(order?: number, comparator?: (a: T, b: T) => number) {
    if (order !== undefined && order < 2) {
      throw new RangeError(`B-tree order must be >= 2, got ${order}`);
    }
    this.order = order ?? 4;
    this.comparator = comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
    this.root = null;
    this.treeSize = 0;
  }

  insert(value: T): void {
    const root = this.root;
    if (root === null) {
      this.root = this.createNode();
      this.root!.keys.push(value);
      this.treeSize++;
      return;
    }

    if (root.keys.length === 2 * this.order - 1) {
      const newRoot = this.createNode();
      newRoot.children.push(this.root);
      this.root = newRoot;
      this.splitChild(newRoot, 0);
      this.insertNonFull(newRoot, value);
    } else {
      this.insertNonFull(root, value);
    }
    this.treeSize++;
  }

  delete(value: T): boolean {
    if (this.root === null) {
      return false;
    }

    const initialSize = this.treeSize;
    this.deleteFromNode(this.root, value);

    if (this.treeSize === initialSize) {
      return false;
    }

    if (this.root !== null && this.root.keys.length === 0 && !this.root.leaf) {
      this.root = this.root.children[0]!;
    }

    if (this.root !== null && this.root.keys.length === 0) {
      this.root = null;
    }

    return true;
  }

  search(value: T): boolean {
    return this.contains(value);
  }

  contains(value: T): boolean {
    return this.searchInNode(this.root, value);
  }

  min(): T | undefined {
    if (this.root === null) {
      return undefined;
    }
    let current = this.root;
    while (!current!.leaf) {
      current = current!.children[0]!;
    }
    return current!.keys[0];
  }

  max(): T | undefined {
    if (this.root === null) {
      return undefined;
    }
    let current = this.root;
    while (!current!.leaf) {
      current = current!.children[current!.keys.length]!;
    }
    return current!.keys[current!.keys.length - 1]!;
  }

  inOrderTraversal(): T[] {
    const result: T[] = [];
    this.traverseInOrder(this.root, result);
    return result;
  }

  size(): number {
    return this.treeSize;
  }

  isEmpty(): boolean {
    return this.root === null;
  }

  clear(): void {
    this.root = null;
    this.treeSize = 0;
  }

  toArray(): T[] {
    return this.inOrderTraversal();
  }

  *[Symbol.iterator](): IterableIterator<T> {
    const result = this.inOrderTraversal();
    for (const val of result) {
      yield val;
    }
  }

  getHeight(): number {
    if (this.root === null) {
      return 0;
    }
    return this.computeHeight(this.root);
  }

  getTimeComplexity(): string {
    return "O(log n)";
  }

  private createNode(): BTreeNode<T> {
    return {
      keys: [],
      children: [],
      leaf: true,
    };
  }

  private splitChild(parent: BTreeNode<T>, index: number): void {
    const order = this.order;
    const child = parent.children[index]!;
    const midIndex = order - 1;

    const newNode = this.createNode();
    newNode.leaf = child.leaf;

    newNode.keys = child.keys.slice(midIndex + 1);
    const midKey = child.keys[midIndex]!;
    child.keys = child.keys.slice(0, midIndex);

    if (!child.leaf) {
      newNode.children = child.children.slice(order);
      child.children = child.children.slice(0, order);
    }

    parent.leaf = false;
    parent.children.splice(index + 1, 0, newNode);
    parent.keys.splice(index, 0, midKey);
  }

  private insertNonFull(node: BTreeNode<T>, value: T): void {
    let i = node.keys.length - 1;
    if (node.leaf) {
      while (i >= 0 && this.comparator(value, node.keys[i]!) < 0) {
        i--;
      }
      node.keys.splice(i + 1, 0, value);
    } else {
      while (i >= 0 && this.comparator(value, node.keys[i]!) < 0) {
        i--;
      }
      i++;
      const child = node.children[i]!;
      if (child.keys.length === 2 * this.order - 1) {
        this.splitChild(node, i);
        if (this.comparator(value, node.keys[i]!) > 0) {
          i++;
        }
      }
      this.insertNonFull(node.children[i]!, value);
    }
  }

  private searchInNode(node: BTreeNode<T> | null, value: T): boolean {
    if (node === null) {
      return false;
    }

    let i = 0;
    while (i < node.keys.length && this.comparator(value, node.keys[i]!) > 0) {
      i++;
    }

    if (i < node.keys.length && this.comparator(value, node.keys[i]!) === 0) {
      return true;
    }

    if (node.leaf) {
      return false;
    }

    return this.searchInNode(node.children[i]!, value);
  }

  private deleteFromNode(node: BTreeNode<T>, value: T): void {
    const idx = this.findKeyIndex(node, value);

    if (idx < node.keys.length && this.comparator(value, node.keys[idx]!) === 0) {
      if (node.leaf) {
        this.deleteFromLeaf(node, idx);
        this.treeSize--;
      } else {
        this.deleteFromInternalNode(node, idx);
      }
    } else if (!node.leaf) {
      this.deleteFromNonLeaf(node, idx, value);
    }
  }

  private deleteFromLeaf(node: BTreeNode<T>, idx: number): void {
    node.keys.splice(idx, 1);
  }

  private deleteFromInternalNode(node: BTreeNode<T>, idx: number): void {
    const predChild = node.children[idx]!;
    if (predChild.keys.length >= this.order) {
      const pred = this.getPredecessor(predChild);
      node.keys[idx] = pred;
      this.deleteFromNode(predChild, pred);
    } else {
      const succChild = node.children[idx + 1]!;
      if (succChild.keys.length >= this.order) {
        const succ = this.getSuccessor(succChild);
        node.keys[idx] = succ;
        this.deleteFromNode(succChild, succ);
      } else {
        const keyToDelete = node.keys[idx]!;
        this.mergeChildren(node, idx);
        const leftChild = node.children[idx]!;
        this.deleteFromNode(leftChild, keyToDelete);
      }
    }
  }

  private deleteFromNonLeaf(node: BTreeNode<T>, idx: number, value: T): void {
    const childIdx = idx;
    const child = node.children[childIdx]!;

    if (child.keys.length >= this.order) {
      this.deleteFromNode(child, value);
    } else {
      this.ensureMinKeys(node, childIdx);
      const newIdx = this.findKeyIndex(node, value);
      this.deleteFromNode(node.children[newIdx]!, value);
    }
  }

  private ensureMinKeys(node: BTreeNode<T>, idx: number): void {
    const leftSibling = idx > 0 ? node.children[idx - 1]! : null;
    const rightSibling = idx < node.keys.length ? node.children[idx + 1]! : null;

    if (leftSibling !== null && leftSibling.keys.length >= this.order) {
      this.borrowFromPrev(node, idx);
    } else if (rightSibling !== null && rightSibling.keys.length >= this.order) {
      this.borrowFromNext(node, idx);
    } else {
      if (leftSibling !== null) {
        this.mergeChildren(node, idx - 1);
      } else {
        this.mergeChildren(node, idx);
      }
    }
  }

  private getPredecessor(node: BTreeNode<T>): T {
    while (!node.leaf) {
      node = node.children[node.keys.length]!;
    }
    return node.keys[node.keys.length - 1]!;
  }

  private getSuccessor(node: BTreeNode<T>): T {
    while (!node.leaf) {
      node = node.children[0]!;
    }
    return node.keys[0]!;
  }

  private borrowFromPrev(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx - 1]!;

    child.keys.unshift(node.keys[idx - 1]!);
    node.keys[idx - 1] = sibling.keys.pop()!;

    if (!child.leaf) {
      child.children.unshift(sibling.children.pop()!);
    }
  }

  private borrowFromNext(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx + 1]!;

    child.keys.push(node.keys[idx]!);
    node.keys[idx] = sibling.keys.shift()!;

    if (!child.leaf) {
      child.children.push(sibling.children.shift()!);
    }
  }

  private mergeChildren(node: BTreeNode<T>, idx: number): void {
    const leftChild = node.children[idx]!;
    const rightChild = node.children[idx + 1]!;

    leftChild.keys.push(node.keys[idx]!);
    leftChild.keys = [...leftChild.keys, ...rightChild.keys];

    if (!leftChild.leaf) {
      leftChild.children = [...leftChild.children, ...rightChild.children];
    }

    node.keys.splice(idx, 1);
    node.children.splice(idx + 1, 1);
  }

  private findKeyIndex(node: BTreeNode<T>, value: T): number {
    let idx = 0;
    while (idx < node.keys.length && this.comparator(value, node.keys[idx]!) > 0) {
      idx++;
    }
    return idx;
  }

  private traverseInOrder(node: BTreeNode<T> | null, result: T[]): void {
    if (node === null) {
      return;
    }

    for (let i = 0; i < node.keys.length; i++) {
      const child = node.children[i];
      if (child != null) {
        this.traverseInOrder(child, result);
      }
      result.push(node.keys[i]!);
    }

    const lastChild = node.children[node.keys.length];
    if (lastChild != null) {
      this.traverseInOrder(lastChild, result);
    }
  }

  private computeHeight(node: BTreeNode<T>): number {
    if (node.leaf) {
      return 1;
    }
    return 1 + this.computeHeight(node.children[0]!);
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `${BTree}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'BTree', items: this.toArray() }
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
}
