class Node<T> {
  value: T;
  left: Node<T> | null;
  right: Node<T> | null;
  parent: Node<T> | null;

  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

export class SplayTree4<T> {
  private root: Node<T> | null;
  private _size: number;
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.root = null;
    this._size = 0;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    if (this.root === null) {
      this.root = new Node(value);
      this._size++;
      return;
    }

    let current = this.root;

    while (current !== null) {
      const cmp = this.comparator(value, current.value);
      if (cmp < 0) {
        if (current.left === null) {
          current.left = new Node(value);
          current.left.parent = current;
          this._size++;
          this.splay(current.left);
          return;
        }
        current = current.left;
      } else if (cmp > 0) {
        if (current.right === null) {
          current.right = new Node(value);
          current.right.parent = current;
          this._size++;
          this.splay(current.right);
          return;
        }
        current = current.right;
      } else {
        this.splay(current);
        return;
      }
    }
  }

  search(value: T): boolean {
    const node = this.findNode(value);
    if (node !== null) {
      this.splay(node);
      return true;
    }
    return false;
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  remove(value: T): boolean {
    const node = this.findNode(value);
    if (node === null) {
      return false;
    }

    this.splay(node);

    if (node.left === null) {
      this.transplant(node, node.right);
    } else if (node.right === null) {
      this.transplant(node, node.left);
    } else {
      const successor = this.minimum(node.right);
      if (successor.parent !== node) {
        this.transplant(successor, successor.right);
        successor.right = node.right;
        if (successor.right !== null) {
          successor.right.parent = successor;
        }
      }
      this.transplant(node, successor);
      successor.left = node.left;
      if (successor.left !== null) {
        successor.left.parent = successor;
      }
    }

    this._size--;
    return true;
  }

  min(): T | undefined {
    if (this.root === null) {
      return undefined;
    }
    const minNode = this.minimum(this.root);
    this.splay(minNode);
    return minNode.value;
  }

  max(): T | undefined {
    if (this.root === null) {
      return undefined;
    }
    const maxNode = this.maximum(this.root);
    this.splay(maxNode);
    return maxNode.value;
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
    this.inorderTraversal(this.root, (value) => result.push(value));
    return result;
  }

  forEach(callback: (value: T) => void): void {
    this.inorderTraversal(this.root, callback);
  }

  height(): number {
    return this.calculateHeight(this.root);
  }

  getTimeComplexity(): string {
    return "O(log n) amortized for insert, search, delete";
  }

  split(key: T): [SplayTree4<T>, SplayTree4<T>] {
    const tree1 = new SplayTree4<T>(this.comparator);
    const tree2 = new SplayTree4<T>(this.comparator);

    if (this.root === null) {
      return [tree1, tree2];
    }

    const node = this.findNode(key);
    if (node !== null) {
      this.splay(node);
    } else {
      this.insert(key);
      this.splay(this.root!);
      this._size--;
    }

    const splitNode = this.root!;
    tree1.root = splitNode.left;
    if (tree1.root !== null) {
      tree1.root.parent = null;
    }
    tree2.root = splitNode.right;
    if (tree2.root !== null) {
      tree2.root.parent = null;
    }

    tree1._size = this.countNodes(tree1.root);
    tree2._size = this.countNodes(tree2.root);
    this.root = null;
    this._size = 0;

    return [tree1, tree2];
  }

  merge(otherTree: SplayTree4<T>): void {
    if (this.isEmpty()) {
      this.root = otherTree.root;
      this._size = otherTree._size;
      otherTree.root = null;
      otherTree._size = 0;
      return;
    }

    if (otherTree.isEmpty()) {
      return;
    }

    if (otherTree.root === null) {
      return;
    }

    let maxNode = this.root!;
    while (maxNode.right !== null) {
      maxNode = maxNode.right;
    }

    let minOther = otherTree.root!;
    while (minOther.left !== null) {
      minOther = minOther.left;
    }

    if (this.comparator(maxNode.value, minOther.value) >= 0) {
      throw new Error("Cannot merge: all elements in this tree must be less than all elements in other tree");
    }

    if (otherTree.root !== null) {
      maxNode.right = otherTree.root;
      otherTree.root.parent = maxNode;
    }
    this._size += otherTree._size;

    otherTree.root = null;
    otherTree._size = 0;
  }

  rangeSearch(low: T, high: T): T[] {
    const result: T[] = [];
    this.rangeTraversal(this.root, low, high, (value) => result.push(value));
    return result;
  }

  rank(value: T): number {
    let count = 0;
    let current = this.root;
    while (current !== null) {
      const cmp = this.comparator(value, current.value);
      if (cmp < 0) {
        current = current.left;
      } else if (cmp > 0) {
        count += 1 + this.countNodes(current.left);
        current = current.right;
      } else {
        count += this.countNodes(current.left);
        this.splay(current);
        return count;
      }
    }
    return -1;
  }

  select(k: number): T | undefined {
    if (k < 0 || k >= this._size) {
      return undefined;
    }

    let current = this.root;
    let index = k;
    while (current !== null) {
      const leftSize = this.countNodes(current.left);
      if (index < leftSize) {
        current = current.left;
      } else if (index > leftSize) {
        index = index - leftSize - 1;
        current = current.right;
      } else {
        this.splay(current);
        return current.value;
      }
    }

    return undefined;
  }

  predecessor(value: T): T | undefined {
    const node = this.findNode(value);
    if (node === null) {
      return undefined;
    }

    this.splay(node);

    if (node.left !== null) {
      const maxNode = this.maximum(node.left);
      this.splay(maxNode);
      return maxNode.value;
    }

    let current = node;
    let parent = current.parent;
    while (parent !== null && current === parent.left) {
      current = parent;
      parent = parent.parent;
    }

    if (parent === null) {
      return undefined;
    }

    this.splay(parent);
    return parent.value;
  }

  successor(value: T): T | undefined {
    const node = this.findNode(value);
    if (node === null) {
      return undefined;
    }

    this.splay(node);

    if (node.right !== null) {
      const minNode = this.minimum(node.right);
      this.splay(minNode);
      return minNode.value;
    }

    let current = node;
    let parent = current.parent;
    while (parent !== null && current === parent.right) {
      current = parent;
      parent = parent.parent;
    }

    if (parent === null) {
      return undefined;
    }

    this.splay(parent);
    return parent.value;
  }

  private findNode(value: T): Node<T> | null {
    let current = this.root;
    while (current !== null) {
      const cmp = this.comparator(value, current.value);
      if (cmp < 0) {
        current = current.left;
      } else if (cmp > 0) {
        current = current.right;
      } else {
        return current;
      }
    }
    return null;
  }

  private minimum(node: Node<T>): Node<T> {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  private maximum(node: Node<T>): Node<T> {
    while (node.right !== null) {
      node = node.right;
    }
    return node;
  }

  private transplant(u: Node<T>, v: Node<T> | null): void {
    if (u.parent === null) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }

    if (v !== null) {
      v.parent = u.parent;
    }
  }

  private splay(x: Node<T>): void {
    while (x.parent !== null) {
      if (x.parent.parent === null) {
        if (x === x.parent.left) {
          this.rotateRight(x.parent);
        } else {
          this.rotateLeft(x.parent);
        }
      } else if (x === x.parent.left && x.parent === x.parent.parent.left) {
        this.rotateRight(x.parent.parent);
        this.rotateRight(x.parent);
      } else if (x === x.parent.right && x.parent === x.parent.parent.right) {
        this.rotateLeft(x.parent.parent);
        this.rotateLeft(x.parent);
      } else if (x === x.parent.right && x.parent === x.parent.parent.left) {
        this.rotateLeft(x.parent);
        this.rotateRight(x.parent);
      } else {
        this.rotateRight(x.parent);
        this.rotateLeft(x.parent);
      }
    }
    this.root = x;
  }

  private rotateLeft(x: Node<T>): void {
    const y = x.right;
    if (y === null) return;

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

  private rotateRight(x: Node<T>): void {
    const y = x.left;
    if (y === null) return;

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

  private inorderTraversal(node: Node<T> | null, callback: (value: T) => void): void {
    if (node === null) {
      return;
    }
    this.inorderTraversal(node.left, callback);
    callback(node.value);
    this.inorderTraversal(node.right, callback);
  }

  private rangeTraversal(node: Node<T> | null, low: T, high: T, callback: (value: T) => void): void {
    if (node === null) {
      return;
    }

    const cmpLow = this.comparator(low, node.value);
    const cmpHigh = this.comparator(high, node.value);

    if (cmpLow < 0) {
      this.rangeTraversal(node.left, low, high, callback);
    }

    if (cmpLow <= 0 && cmpHigh >= 0) {
      callback(node.value);
    }

    if (cmpHigh > 0) {
      this.rangeTraversal(node.right, low, high, callback);
    }
  }

  private countNodes(node: Node<T> | null): number {
    if (node === null) {
      return 0;
    }
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }

  private calculateHeight(node: Node<T> | null): number {
    if (node === null) {
      return 0;
    }
    return 1 + Math.max(this.calculateHeight(node.left), this.calculateHeight(node.right));
  }

  [Symbol.iterator](): Iterator<T> {
    const stack: Array<Node<T>> = [];
    let current: Node<T> | null = this.root;
    return {
      next(): IteratorResult<T> {
        while (current !== null || stack.length > 0) {
          while (current !== null) {
            stack.push(current);
            current = current.left;
          }
          current = stack.pop()!;
          const value = current.value;
          current = current.right;
          return { value: value as T, done: false };
        }
        return { value: undefined as unknown as T, done: true };
      }
    };
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `SplayTree4({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SplayTree4', size: this.size, items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
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

  interleave(other: T[]): T[] {
    const a = this.toArray()
    const result: T[] = []
    const maxLen = Math.max(a.length, other.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < a.length) result.push(a[i]!)
      if (i < other.length) result.push(other[i]!)
    }
    return result
  }

  toMap<K, V>(keyFn: (item: T) => K, valueFn: (item: T) => V): Map<K, V> {
    const map = new Map<K, V>()
    for (const item of this.toArray()) {
      map.set(keyFn(item), valueFn(item))
    }
    return map
  }

  groupBy<K>(keyFn: (item: T) => K): Record<string, T[]> {
    const groups: Record<string, T[]> = {}
    for (const item of this.toArray()) {
      const key = String(keyFn(item))
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }

  groupByMap<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      const group = groups.get(key)
      if (group) {
        group.push(item)
      } else {
        groups.set(key, [item])
      }
    }
    return groups
  }

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
  }

  reduceWhile<U>(
    predicate: (acc: U) => boolean,
    reducer: (acc: U, item: T) => U,
    initialValue: U
  ): U {
    let acc = initialValue
    for (const item of this.toArray()) {
      if (!predicate(acc)) break
      acc = reducer(acc, item)
    }
    return acc
  }

  minBy<K>(keyFn: (item: T) => K): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    let minItem = arr[0]!
    let minKey = keyFn(minItem)
    for (let i = 1; i < arr.length; i++) {
      const item = arr[i]!
      const key = keyFn(item)
      if (key < minKey) {
        minKey = key
        minItem = item
      }
    }
    return minItem
  }

  maxBy<K>(keyFn: (item: T) => K): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    let maxItem = arr[0]!
    let maxKey = keyFn(maxItem)
    for (let i = 1; i < arr.length; i++) {
      const item = arr[i]!
      const key = keyFn(item)
      if (key > maxKey) {
        maxKey = key
        maxItem = item
      }
    }
    return maxItem
  }

  span(predicate: (item: T) => boolean): [T[], T[]] {
    const arr = this.toArray()
    let i = 0
    while (i < arr.length && predicate(arr[i]!)) {
      i++
    }
    return [arr.slice(0, i), arr.slice(i)]
  }

  breakWhen(predicate: (item: T) => boolean): [T[], T[]] {
    return this.span(item => !predicate(item))
  }

  scan<U>(reducer: (acc: U, item: T) => U, initialValue: U): U[] {
    const result: U[] = []
    let acc = initialValue
    for (const item of this.toArray()) {
      acc = reducer(acc, item)
      result.push(acc)
    }
    return result
  }

  flatten(depth: number = 1): T[] {
    const flat = (arr: T[], d: number): T[] => {
      const result: T[] = []
      for (const item of arr) {
        if (Array.isArray(item) && d > 0) {
          result.push(...flat(item as unknown as T[], d - 1))
        } else {
          result.push(item)
        }
      }
      return result
    }
    return flat(this.toArray(), depth)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  get [Symbol.toStringTag](): string {
    return 'SplayTree4'
  }

  map<U>(fn: (item: T, index: number) => U): U[] {
    return this.toArray().map(fn)
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.toArray().filter(predicate)
  }

  reduce<U>(reducer: (acc: U, item: T) => U, initialValue: U): U {
    return this.toArray().reduce(reducer, initialValue)
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  reduceRight<U>(reducer: (acc: U, item: T) => U, initialValue: U): U {
    return this.toArray().reduceRight(reducer, initialValue)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: T[]): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  difference(other: T[]): T[] {
    const set = new Set(other)
    return this.toArray().filter(item => !set.has(item))
  }

  union(other: T[]): T[] {
    return [...new Set([...this.toArray(), ...other])]
  }

  pluck<K extends keyof T>(key: K): T[K][] {
    return this.toArray().map(item => item[key])
  }

  nth(n: number): T | undefined {
    return this.at(n - 1)
  }

  head(): T | undefined {
    return this.first()
  }

  tail(): T[] {
    return this.skip(1)
  }

  intersperse(separator: T): T[] {
    const arr = this.toArray()
    if (arr.length <= 1) return [...arr]
    const result: T[] = []
    for (let i = 0; i < arr.length; i++) {
      if (i > 0) result.push(separator)
      result.push(arr[i]!)
    }
    return result
  }

  prepend(item: T): T[] {
    return [item, ...this.toArray()]
  }

  append(item: T): T[] {
    return [...this.toArray(), item]
  }

  zipWith<U, R>(other: Iterable<U>, fn: (a: T, b: U) => R): R[] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: R[] = []
    for (let i = 0; i < len; i++) {
      result.push(fn(a[i]!, b[i]!))
    }
    return result
  }

  rotate(n: number): T[] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const k = ((n % arr.length) + arr.length) % arr.length
    return [...arr.slice(k), ...arr.slice(0, k)]
  }

  dot(this: { toArray(): number[] }, other: number[]): number {
    const a = this.toArray()
    const len = Math.min(a.length, other.length)
    let sum = 0
    for (let i = 0; i < len; i++) {
      sum += a[i]! * other[i]!
    }
    return sum
  }

  sliding(size: number, step = 1): T[][] {
    const arr = this.toArray()
    if (size <= 0 || step <= 0) return []
    const result: T[][] = []
    for (let i = 0; i + size <= arr.length; i += step) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  adjacentPairs(): [T, T][] {
    const arr = this.toArray()
    const result: [T, T][] = []
    for (let i = 0; i + 1 < arr.length; i++) {
      result.push([arr[i]!, arr[i + 1]!])
    }
    return result
  }

  transpose<U>(this: { toArray(): U[][] }): U[][] {
    const matrix = this.toArray()
    if (matrix.length === 0) return []
    const cols = Math.max(...matrix.map(r => r.length))
    const result: U[][] = []
    for (let c = 0; c < cols; c++) {
      const row: U[] = []
      for (let r = 0; r < matrix.length; r++) {
        if (c < matrix[r]!.length) {
          row.push(matrix[r]![c]!)
        }
      }
      result.push(row)
    }
    return result
  }

  countWhere(predicate: (item: T, index: number) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  associate<K, V>(fn: (item: T, index: number) => [K, V]): Map<K, V> {
    const result = new Map<K, V>()
    this.toArray().forEach((item, i) => {
      const [k, v] = fn(item, i)
      result.set(k, v)
    })
    return result
  }

  indexBy<K>(keyFn: (item: T) => K): Map<K, T> {
    const result = new Map<K, T>()
    this.toArray().forEach(item => {
      result.set(keyFn(item), item)
    })
    return result
  }

  takeWhile(predicate: (item: T, index: number) => boolean): T[] {
    const arr = this.toArray()
    const result: T[] = []
    for (let i = 0; i < arr.length; i++) {
      if (!predicate(arr[i]!, i)) break
      result.push(arr[i]!)
    }
    return result
  }

  dropWhile(predicate: (item: T, index: number) => boolean): T[] {
    const arr = this.toArray()
    let i = 0
    while (i < arr.length && predicate(arr[i]!, i)) {
      i++
    }
    return arr.slice(i)
  }

  gather(): T[][] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const result: T[][] = [[arr[0]!]]
    for (let i = 1; i < arr.length; i++) {
      const last = result[result.length - 1]!
      if (arr[i] === last[last.length - 1]) {
        last.push(arr[i]!)
      } else {
        result.push([arr[i]!])
      }
    }
    return result
  }

  splitWhen(predicate: (item: T, index: number) => boolean): [T[], T[]] {
    const arr = this.toArray()
    const idx = arr.findIndex(predicate)
    if (idx === -1) return [[...arr], []]
    return [arr.slice(0, idx), arr.slice(idx)]
  }

  satisfies<S extends T>(guard: (item: T) => item is S): this is { toArray(): S[] } {
    return this.every(guard)
  }

  fill(value: T, count: number): T[] {
    const arr = this.toArray()
    const pad = Array(Math.max(0, count)).fill(value) as T[]
    return [...arr, ...pad]
  }

  padStart(value: T, minLength: number): T[] {
    const arr = this.toArray()
    if (arr.length >= minLength) return [...arr]
    const pad = Array(minLength - arr.length).fill(value) as T[]
    return [...pad, ...arr]
  }

  takeRight(n: number): T[] {
    const arr = this.toArray()
    return arr.slice(Math.max(0, arr.length - n))
  }

  dropRight(n: number): T[] {
    const arr = this.toArray()
    return arr.slice(0, Math.max(0, arr.length - n))
  }

  firstOrDefault(defaultValue: T): T {
    const arr = this.toArray()
    return arr.length > 0 ? arr[0]! : defaultValue
  }

  lastOrDefault(defaultValue: T): T {
    const arr = this.toArray()
    return arr.length > 0 ? arr[arr.length - 1]! : defaultValue
  }

  elementAt(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 && index < arr.length ? arr[index]! : undefined
  }

  elementAtOrDefault(index: number, defaultValue: T): T {
    const arr = this.toArray()
    return index >= 0 && index < arr.length ? arr[index]! : defaultValue
  }

  indexedForEach(fn: (item: T, index: number) => void): void {
    this.toArray().forEach((item, i) => fn(item, i))
  }

  occurrencesOf(value: T): number {
    return this.toArray().filter(item => item === value).length
  }

  zip<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: [T, U][] = []
    for (let i = 0; i < len; i++) {
      result.push([a[i]!, b[i]!])
    }
    return result
  }

  unzip<K, V>(this: { toArray(): [K, V][] }): [K[], V[]] {
    const pairs = this.toArray()
    const keys: K[] = []
    const values: V[] = []
    for (const [k, v] of pairs) {
      keys.push(k)
      values.push(v)
    }
    return [keys, values]
  }

  memoize<R>(fn: (items: T[]) => R): () => R {
    let cached: R | undefined
    let computed = false
    return () => {
      if (!computed) {
        cached = fn(this.toArray())
        computed = true
      }
      return cached as R
    }
  }

  flattenDeep(this: { toArray(): any[] }): any[] {
    const result: any[] = []
    const stack = [...this.toArray()].reverse()
    while (stack.length > 0) {
      const item = stack.pop()!
      if (Array.isArray(item)) {
        stack.push(...item.reverse())
      } else {
        result.push(item)
      }
    }
    return result
  }

  cartesianProduct<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const result: [T, U][] = []
    for (const x of a) {
      for (const y of b) {
        result.push([x, y])
      }
    }
    return result
  }

  indexOf(item: T): number {
    return this.toArray().indexOf(item)
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  swap(i: number, j: number): T[] {
    const arr = [...this.toArray()]
    if (i < 0 || i >= arr.length || j < 0 || j >= arr.length || i === j) return arr
    const temp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = temp
    return arr
  }

  sumBy(fn: (item: T) => number): number {
    return this.toArray().reduce((acc, item) => acc + fn(item), 0)
  }

  averageBy(fn: (item: T) => number): number {
    const arr = this.toArray()
    if (arr.length === 0) return 0
    return this.sumBy(fn) / arr.length
  }

  distinctUntilChanged(): T[] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const result: T[] = [arr[0]!]
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1]) {
        result.push(arr[i]!)
      }
    }
    return result
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }

  reject(predicate: (item: T, index: number) => boolean): T[] {
    return this.toArray().filter((item, i) => !predicate(item, i))
  }

  compactMap<U>(fn: (item: T, index: number) => U | null | undefined): U[] {
    const result: U[] = []
    this.toArray().forEach((item, i) => {
      const mapped = fn(item, i)
      if (mapped != null) {
        result.push(mapped)
      }
    })
    return result
  }

  chunkWhen(predicate: (prev: T, curr: T) => boolean): T[][] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const result: T[][] = [[arr[0]!]]
    for (let i = 1; i < arr.length; i++) {
      if (predicate(arr[i - 1]!, arr[i]!)) {
        result.push([arr[i]!])
      } else {
        result[result.length - 1]!.push(arr[i]!)
      }
    }
    return result
  }

  permute(): T[][] {
    const arr = this.toArray()
    if (arr.length === 0) return [[]]
    if (arr.length > 8) return [arr]
    const result: T[][] = []
    const used = new Array(arr.length).fill(false)
    const permuteHelper = (current: number[]) => {
      if (current.length === arr.length) {
        result.push(current.map(i => arr[i]!))
        return
      }
      for (let i = 0; i < arr.length; i++) {
        if (used[i]) continue
        used[i] = true
        permuteHelper([...current, i])
        used[i] = false
      }
    }
    permuteHelper([])
    return result
  }

  combinations(k: number): T[][] {
    const arr = this.toArray()
    if (k <= 0 || k > arr.length) return []
    if (k === 1) return arr.map(item => [item])
    const result: T[][] = []
    const combine = (start: number, current: T[]) => {
      if (current.length === k) {
        result.push([...current])
        return
      }
      for (let i = start; i < arr.length; i++) {
        current.push(arr[i]!)
        combine(i + 1, current)
        current.pop()
      }
    }
    combine(0, [])
    return result
  }

  powerSet(): T[][] {
    const arr = this.toArray()
    if (arr.length > 16) return [[], [...arr]]
    const result: T[][] = []
    const n = 1 << arr.length
    for (let mask = 0; mask < n; mask++) {
      const subset: T[] = []
      for (let i = 0; i < arr.length; i++) {
        if (mask & (1 << i)) {
          subset.push(arr[i]!)
        }
      }
      result.push(subset)
    }
    return result
  }

  enumerate(): [number, T][] {
    return this.toArray().map((item, i) => [i, item] as [number, T])
  }

  isSorted(comparator?: (a: T, b: T) => number): boolean {
    const arr = this.toArray()
    const cmp = comparator ?? ((a: T, b: T) => a < b ? -1 : a > b ? 1 : 0)
    for (let i = 1; i < arr.length; i++) {
      if (cmp(arr[i - 1]!, arr[i]!) > 0) return false
    }
    return true
  }

  palindrome(): boolean {
    const arr = this.toArray()
    for (let i = 0; i < arr.length / 2; i++) {
      if (arr[i] !== arr[arr.length - 1 - i]) return false
    }
    return true
  }

  isStrictlyIncreasing(this: { toArray(): number[] }): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! >= arr[i]!) return false
    }
    return true
  }

  isStrictlyDecreasing(this: { toArray(): number[] }): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! <= arr[i]!) return false
    }
    return true
  }

  replaceAt(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    if (index >= 0 && index < arr.length) {
      arr[index] = value
    }
    return arr
  }
}
