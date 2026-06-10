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


  tap(fn: (collection: BTree<T>) => void): BTree<T> {
    fn(this)
    return this
  }

  equals(other: BTree<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
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

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: Iterable<T>): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  difference(other: Iterable<T>): T[] {
    const exclude = new Set(other)
    return this.toArray().filter(item => !exclude.has(item))
  }

  union(other: Iterable<T>): T[] {
    const set = new Set<T>([...this.toArray(), ...other])
    return [...set]
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

  reduceRight<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduceRight(fn, initial)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  static from<T>(items: T[]): BTree<T> {
    const instance = new BTree<T>()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }

  static of<T>(...items: T[]): BTree<T> {
    return BTree.from(items)
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

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
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

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
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


  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
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

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
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

  sampleN(n: number): T[] {
    return this.shuffle().slice(0, n)
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

  toSet(): Set<T> {
    return new Set(this.toArray())
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












  get [Symbol.toStringTag](): string {
    return 'BTree'
  }

  indexOf(item: T, fromIndex: number = 0): number {
    return this.toArray().indexOf(item, fromIndex)
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
}
