class LeftistTreeNode<T> {
  value: T;
  rank: number;
  left: LeftistTreeNode<T> | null;
  right: LeftistTreeNode<T> | null;

  constructor(value: T) {
    this.value = value;
    this.rank = 1;
    this.left = null;
    this.right = null;
  }
}

export class LeftistTree<T> {
  private root: LeftistTreeNode<T> | null;
  private itemCount: number;
  private comparator: (a: T, b: T) => number;
  private nodes: Set<LeftistTreeNode<T>>;

  constructor(comparator?: (a: T, b: T) => number) {
    this.root = null;
    this.itemCount = 0;
    this.comparator = comparator || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
    this.nodes = new Set();
  }

  insert(value: T): void {
    const node = new LeftistTreeNode(value);
    this.nodes.add(node);
    this.root = this.mergeTrees(this.root, node);
    this.itemCount++;
  }

  extractMin(): T | undefined {
    if (this.root === null) {
      return undefined;
    }

    const minValue = this.root.value;
    this.nodes.delete(this.root);
    const left = this.root.left;
    const right = this.root.right;
    this.root = this.mergeTrees(left, right);
    this.itemCount--;
    return minValue;
  }

  peek(): T | undefined {
    return this.root?.value;
  }

  merge(other: LeftistTree<T>): void {
    this.root = this.mergeTrees(this.root, other.root);
    this.itemCount += other.itemCount;
    for (const node of other.nodes) {
      this.nodes.add(node);
    }
    other.root = null;
    other.itemCount = 0;
    other.nodes.clear();
  }

  get size(): number {
    return this.itemCount;
  }

  isEmpty(): boolean {
    return this.itemCount === 0;
  }

  clear(): void {
    this.root = null;
    this.itemCount = 0;
    this.nodes.clear();
  }

  toArray(): T[] {
    const result: T[] = [];
    const tempTree = new LeftistTree<T>(this.comparator);
    tempTree.root = this.root;
    tempTree.itemCount = this.itemCount;
    tempTree.nodes = new Set(this.nodes);

    while (!tempTree.isEmpty()) {
      const value = tempTree.extractMin();
      if (value !== undefined) {
        result.push(value);
      }
    }

    return result;
  }

  decreaseKey(node: LeftistTreeNode<T>, newValue: T): boolean {
    if (!this.nodes.has(node)) {
      return false;
    }

    if (this.comparator(newValue, node.value) > 0) {
      return false;
    }

    node.value = newValue;

    this.root = this.cutSubtree(this.root, node);
    this.root = this.mergeTrees(this.root, node);
    return true;
  }

  delete(node: LeftistTreeNode<T>): T | undefined {
    if (!this.nodes.has(node)) {
      return undefined;
    }

    this.nodes.delete(node);
    const value = node.value;
    this.root = this.removeNodeFromTree(this.root, node);
    this.itemCount--;
    return value;
  }

  getNode(value: T): LeftistTreeNode<T> | undefined {
    for (const node of this.nodes) {
      if (this.comparator(node.value, value) === 0) {
        return node;
      }
    }
    return undefined;
  }

  private mergeTrees(a: LeftistTreeNode<T> | null, b: LeftistTreeNode<T> | null): LeftistTreeNode<T> | null {
    if (a === null) {
      return b;
    }
    if (b === null) {
      return a;
    }

    if (this.comparator(a.value, b.value) <= 0) {
      a.right = this.mergeTrees(a.right, b);
      this.restoreLeftistProperty(a);
      return a;
    } else {
      b.right = this.mergeTrees(b.right, a);
      this.restoreLeftistProperty(b);
      return b;
    }
  }

  private restoreLeftistProperty(node: LeftistTreeNode<T>): void {
    const leftRank = node.left?.rank ?? 0;
    const rightRank = node.right?.rank ?? 0;

    if (leftRank < rightRank) {
      const temp = node.left;
      node.left = node.right;
      node.right = temp;
    }

    node.rank = 1 + Math.min(node.left?.rank ?? 0, node.right?.rank ?? 0);
  }

  private removeNodeFromTree(tree: LeftistTreeNode<T> | null, target: LeftistTreeNode<T>): LeftistTreeNode<T> | null {
    if (tree === null) {
      return null;
    }

    if (tree === target) {
      return this.mergeTrees(tree.left, tree.right);
    }

    tree.left = this.removeNodeFromTree(tree.left, target);
    tree.right = this.removeNodeFromTree(tree.right, target);
    this.restoreLeftistProperty(tree);

    return tree;
  }

  private cutSubtree(tree: LeftistTreeNode<T> | null, target: LeftistTreeNode<T>): LeftistTreeNode<T> | null {
    if (tree === null) {
      return null;
    }

    if (tree === target) {
      return null;
    }

    tree.left = this.cutSubtree(tree.left, target);
    tree.right = this.cutSubtree(tree.right, target);
    this.restoreLeftistProperty(tree);

    return tree;
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

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toString(): string {
    return `LeftistTree({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LeftistTree', size: this.size, items: this.toArray() }
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

  reverse(): T[] {
    return this.toArray().reverse()
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
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

  max(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  equals(other: T[]): boolean {
    const a = this.toArray()
    if (a.length !== other.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== other[i]) return false
    }
    return true
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }

  with(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    arr[index] = value
    return arr
  }

  shuffle(): T[] {
    const arr = [...this.toArray()]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = tmp
    }
    return arr
  }

  sample(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr[Math.floor(Math.random() * arr.length)]
  }

  toSet(): Set<T> {
    return new Set(this.toArray())
  }

  filterMap<U>(fn: (item: T) => U | undefined): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      const mapped = fn(item)
      if (mapped !== undefined) {
        result.push(mapped)
      }
    }
    return result
  }

  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
  }

  distinctBy<K>(keyFn: (item: T) => K): T[] {
    const seen = new Set<K>()
    const result: T[] = []
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(item)
      }
    }
    return result
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  frequency(item: T): number {
    let count = 0
    for (const element of this.toArray()) {
      if (element === item) count++
    }
    return count
  }
}
