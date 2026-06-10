type AVLNode6<T> = {
  value: T;
  left: AVLNode6<T> | null;
  right: AVLNode6<T> | null;
  height: number;
  size: number;
};

export class AVLTree6<T> {
  private root: AVLNode6<T> | null;
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.root = null;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: AVLNode6<T> | null, value: T): AVLNode6<T> {
    if (node === null) {
      return { value, left: null, right: null, height: 1, size: 1 };
    }

    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value);
    } else {
      return node;
    }

    this.updateNode(node);
    return this.balance(node);
  }

  delete(value: T): boolean {
    const initialSize = this.size;
    this.root = this.deleteNode(this.root, value);
    return this.size < initialSize;
  }

  private deleteNode(node: AVLNode6<T> | null, value: T): AVLNode6<T> | null {
    if (node === null) {
      return null;
    }

    const cmp = this.comparator(value, node.value);
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

      const minNode = this.findMin(node.right)!;
      node.value = minNode.value;
      node.right = this.deleteNode(node.right, minNode.value);
    }

    if (node === null) {
      return null;
    }

    this.updateNode(node);
    return this.balance(node);
  }

  private findMin(node: AVLNode6<T>): AVLNode6<T> | null {
    let current = node;
    while (current!.left !== null) {
      current = current!.left;
    }
    return current;
  }

  private updateNode(node: AVLNode6<T>): void {
    const leftHeight = this.nodeHeight(node.left);
    const rightHeight = this.nodeHeight(node.right);
    node.height = 1 + Math.max(leftHeight, rightHeight);
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right);
  }

  private nodeSize(node: AVLNode6<T> | null): number {
    return node === null ? 0 : node.size;
  }

  search(value: T): boolean {
    return this.searchNode(this.root, value);
  }

  private searchNode(node: AVLNode6<T> | null, value: T): boolean {
    if (node === null) {
      return false;
    }

    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      return this.searchNode(node.left, value);
    } else if (cmp > 0) {
      return this.searchNode(node.right, value);
    }
    return true;
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  min(): T | undefined {
    if (this.root === null) {
      return undefined;
    }
    let current = this.root;
    while (current!.left !== null) {
      current = current!.left;
    }
    return current!.value;
  }

  max(): T | undefined {
    if (this.root === null) {
      return undefined;
    }
    let current = this.root;
    while (current!.right !== null) {
      current = current!.right;
    }
    return current!.value;
  }

  toArray(): T[] {
    const result: T[] = [];
    this.inOrder(this.root, result);
    return result;
  }

  private inOrder(node: AVLNode6<T> | null, result: T[]): void {
    if (node === null) {
      return;
    }
    this.inOrder(node.left, result);
    result.push(node.value);
    this.inOrder(node.right, result);
  }

  get size(): number {
    return this.nodeSize(this.root);
  }

  isEmpty(): boolean {
    return this.root === null;
  }

  clear(): void {
    this.root = null;
  }

  height(): number {
    return this.nodeHeight(this.root);
  }

  private nodeHeight(node: AVLNode6<T> | null): number {
    return node === null ? 0 : node.height;
  }

  getTimeComplexity(): string {
    return "O(log n) for insert, delete, search, min, max, rank, select, split, merge; O(n) for traversals";
  }

  private balanceFactor(node: AVLNode6<T>): number {
    return this.nodeHeight(node.left) - this.nodeHeight(node.right);
  }

  private balance(node: AVLNode6<T>): AVLNode6<T> {
    const bf = this.balanceFactor(node);

    if (bf > 1) {
      if (this.balanceFactor(node.left!) >= 0) {
        return this.rotateRight(node);
      } else {
        node.left = this.rotateLeft(node.left!);
        return this.rotateRight(node);
      }
    }

    if (bf < -1) {
      if (this.balanceFactor(node.right!) <= 0) {
        return this.rotateLeft(node);
      } else {
        node.right = this.rotateRight(node.right!);
        return this.rotateLeft(node);
      }
    }

    return node;
  }

  private rotateRight(y: AVLNode6<T>): AVLNode6<T> {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateNode(y);
    this.updateNode(x);

    return x;
  }

  private rotateLeft(x: AVLNode6<T>): AVLNode6<T> {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateNode(x);
    this.updateNode(y);

    return y;
  }

  rank(value: T): number {
    if (!this.search(value)) {
      return 0;
    }
    return this.rankNode(this.root, value);
  }

  private rankNode(node: AVLNode6<T> | null, value: T): number {
    if (node === null) {
      return 0;
    }

    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      return this.rankNode(node.left, value);
    } else if (cmp > 0) {
      return 1 + this.nodeSize(node.left) + this.rankNode(node.right, value);
    } else {
      return 1 + this.nodeSize(node.left);
    }
  }

  select(k: number): T | undefined {
    if (k < 1 || k > this.size) {
      return undefined;
    }
    return this.selectNode(this.root, k);
  }

  private selectNode(node: AVLNode6<T> | null, k: number): T | undefined {
    if (node === null) {
      return undefined;
    }

    const leftSize = this.nodeSize(node.left);
    if (k <= leftSize) {
      return this.selectNode(node.left, k);
    } else if (k === leftSize + 1) {
      return node.value;
    } else {
      return this.selectNode(node.right, k - leftSize - 1);
    }
  }

  split(key: T): { left: AVLTree6<T>; right: AVLTree6<T> } {
    const [leftRoot, rightRoot] = this.splitNode(this.root, key);
    const leftTree = new AVLTree6<T>(this.comparator);
    const rightTree = new AVLTree6<T>(this.comparator);
    leftTree.root = leftRoot;
    rightTree.root = rightRoot;
    return { left: leftTree, right: rightTree };
  }

  private splitNode(node: AVLNode6<T> | null, key: T): [AVLNode6<T> | null, AVLNode6<T> | null] {
    if (node === null) {
      return [null, null];
    }

    const cmp = this.comparator(key, node.value);
    if (cmp <= 0) {
      const [leftLeft, leftRight] = this.splitNode(node.left, key);
      node.left = leftRight;
      this.updateNode(node);
      const balancedNode = this.balance(node);
      return [leftLeft, balancedNode];
    } else {
      const [rightLeft, rightRight] = this.splitNode(node.right, key);
      node.right = rightLeft;
      this.updateNode(node);
      const balancedNode = this.balance(node);
      return [balancedNode, rightRight];
    }
  }

  merge(otherTree: AVLTree6<T>): AVLTree6<T> {
    const mergedTree = new AVLTree6<T>(this.comparator);
    const elements = [...this.toArray(), ...otherTree.toArray()];
    for (const element of elements) {
      mergedTree.insert(element);
    }
    return mergedTree;
  }


  *[Symbol.iterator](): IterableIterator<T> {
    const stack: Array<AVLNode6<T>> = [];
    let current: AVLNode6<T> | null = this.root;
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
    return `${AVLTree6}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'AVLTree6', size: this.size, items: this.toArray() }
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
}
