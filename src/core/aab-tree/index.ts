interface AABTreeNode<T> {
  value: T;
  level: number;
  left: AABTreeNode<T> | null;
  right: AABTreeNode<T> | null;
}

export class AABTree<T> {
  private root: AABTreeNode<T> | null = null;
  private comparator: (a: T, b: T) => number;
  private nodeCount: number = 0;

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator ?? ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: AABTreeNode<T> | null, value: T): AABTreeNode<T> {
    if (node === null) {
      this.nodeCount++;
      return { value, level: 1, left: null, right: null };
    }

    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value);
    } else {
      node.right = this.insertNode(node.right, value);
    }

    node = this.skew(node);
    node = this.split(node);

    return node;
  }

  private skew(node: AABTreeNode<T>): AABTreeNode<T> {
    if (node.left !== null && node.left.level === node.level) {
      const leftNode = node.left!;
      node.left = leftNode.right;
      leftNode.right = node;
      return leftNode;
    }
    return node;
  }

  private split(node: AABTreeNode<T>): AABTreeNode<T> {
    if (
      node.right !== null &&
      node.right.right !== null &&
      node.right.right.level === node.level
    ) {
      const rightNode = node.right!;
      node.right = rightNode.left;
      rightNode.left = node;
      rightNode.level++;
      return rightNode;
    }
    return node;
  }

  delete(value: T): boolean {
    const deleted = { value: false };
    this.root = this.deleteNode(this.root, value, deleted);
    return deleted.value;
  }

  private deleteNode(
    node: AABTreeNode<T> | null,
    value: T,
    deleted: { value: boolean },
  ): AABTreeNode<T> | null {
    if (node === null) return null;

    const cmp = this.comparator(value, node.value);

    if (cmp < 0) {
      node.left = this.deleteNode(node.left, value, deleted);
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, value, deleted);
    } else {
      deleted.value = true;

      if (node.left === null) {
        this.nodeCount--;
        return node.right;
      }
      if (node.right === null) {
        this.nodeCount--;
        return node.left;
      }

      const successor = this.findMin(node.right);
      node.value = successor.value;
      node.right = this.deleteNode(node.right, successor.value, { value: false });
    }

    const leftLevel = node.left !== null ? node.left.level : 0;
    const rightLevel = node.right !== null ? node.right.level : 0;
    node.level = Math.min(leftLevel, rightLevel) + 1;

    if (node.right !== null && node.right.level > node.level) {
      node.right.level = node.level;
    }

    node = this.skew(node);
    if (node.right !== null) {
      node.right = this.skew(node.right);
      if (node.right.right !== null) {
        node.right.right = this.skew(node.right.right);
      }
    }

    node = this.split(node);
    if (node.right !== null) {
      node.right = this.split(node.right);
    }

    return node;
  }

  private findMin(node: AABTreeNode<T>): AABTreeNode<T> {
    while (node.left !== null) {
      node = node.left!;
    }
    return node;
  }

  private calculateHeight(node: AABTreeNode<T> | null): number {
    if (node === null) return 0;
    const leftHeight = node.left !== null ? this.calculateHeight(node.left) : 0;
    const rightHeight = node.right !== null ? this.calculateHeight(node.right) : 0;
    return 1 + Math.max(leftHeight, rightHeight);
  }

  search(value: T): boolean {
    return this.contains(value);
  }

  contains(value: T): boolean {
    let current = this.root;
    while (current !== null) {
      const cmp = this.comparator(value, current.value);
      if (cmp === 0) return true;
      current = cmp < 0 ? current.left : current.right;
    }
    return false;
  }

  min(): T | undefined {
    let current = this.root;
    if (current === null) return undefined;
    while (current.left !== null) {
      current = current.left!;
    }
    return current.value;
  }

  max(): T | undefined {
    let current = this.root;
    if (current === null) return undefined;
    while (current.right !== null) {
      current = current.right!;
    }
    return current.value;
  }

  inOrderTraversal(): T[] {
    const result: T[] = [];
    this.inOrder(this.root, result);
    return result;
  }

  private inOrder(node: AABTreeNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.inOrder(node.left, result);
    result.push(node.value);
    this.inOrder(node.right, result);
  }

  size(): number {
    return this.nodeCount;
  }

  isEmpty(): boolean {
    return this.root === null;
  }

  clear(): void {
    this.root = null;
    this.nodeCount = 0;
  }

  toArray(): T[] {
    return this.inOrderTraversal();
  }

  getHeight(): number {
    return this.calculateHeight(this.root);
  }

  getTimeComplexity(): string {
    return "O(log n)";
  }


  *[Symbol.iterator](): IterableIterator<T> {
    const stack: Array<AABTreeNode<T>> = [];
    let current: AABTreeNode<T> | null = this.root;
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
    return `${AABTree}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'AABTree', items: this.toArray() }
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



  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
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

  groupBy<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }


  tap(fn: (collection: AABTree<T>) => void): AABTree<T> {
    fn(this)
    return this
  }
}
