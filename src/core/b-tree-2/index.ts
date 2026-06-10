interface BTreeNode<T> {
  keys: T[];
  children: BTreeNode<T>[];
  leaf: boolean;
}

export class BTree2<T> {
  private root: BTreeNode<T> | null;
  private order: number;
  private comparator: (a: T, b: T) => number;
  private _size: number;

  constructor(order: number = 3, comparator?: (a: T, b: T) => number) {
    this.order = order;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.root = null;
    this._size = 0;
  }

  insert(value: T): void {
    if (this.root === null) {
      this.root = {
        keys: [value],
        children: [],
        leaf: true
      };
      this._size++;
      return;
    }

    const root = this.root;
    if (root.keys.length === 2 * this.order - 1) {
      const newRoot: BTreeNode<T> = {
        keys: [],
        children: [root],
        leaf: false
      };
      this.splitChild(newRoot, 0, root);
      this.root = newRoot;
      this.insertNonFull(newRoot, value);
    } else {
      this.insertNonFull(root, value);
    }
    this._size++;
  }

  private splitChild(parent: BTreeNode<T>, index: number, child: BTreeNode<T>): void {
    const order = this.order;
    const newNode: BTreeNode<T> = {
      keys: child.keys.slice(order),
      children: child.children.slice(order),
      leaf: child.leaf
    };
    const midKey = child.keys[order - 1];

    child.keys = child.keys.slice(0, order - 1);
    child.children = child.children.slice(0, order);

    parent.keys.splice(index, 0, midKey!);
    parent.children.splice(index + 1, 0, newNode);
  }

  private insertNonFull(node: BTreeNode<T>, value: T): void {
    if (node.leaf) {
      node.keys.push(value);
      let j = node.keys.length - 1;
      while (j > 0 && this.comparator(value, node.keys[j - 1]!) < 0) {
        node.keys[j] = node.keys[j - 1]!;
        j--;
      }
      node.keys[j] = value;
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

  search(value: T): boolean {
    return this.searchNode(this.root, value) !== null;
  }

  private searchNode(node: BTreeNode<T> | null, value: T): { node: BTreeNode<T>, index: number } | null {
    if (node === null) return null;

    let i = 0;
    while (i < node.keys.length && this.comparator(value, node.keys[i]!) > 0) {
      i++;
    }

    if (i < node.keys.length && this.comparator(value, node.keys[i]!) === 0) {
      return { node, index: i };
    }

    if (node.leaf) {
      return null;
    }

    return this.searchNode(node.children[i]!, value);
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  delete(value: T): void {
    if (this.root === null) return;

    const result = this.deleteFromNode(this.root, value);
    if (result) {
      this._size--;
    }

    if (this.root !== null && this.root.keys.length === 0) {
      if (!this.root.leaf) {
        this.root = this.root.children[0] || null;
      } else {
        this.root = null;
      }
    }
  }

  private deleteFromNode(node: BTreeNode<T>, value: T): boolean {
    const idx = this.findKeyIndex(node, value);

    if (idx < node.keys.length && this.comparator(value, node.keys[idx]!) === 0) {
      if (node.leaf) {
        node.keys.splice(idx, 1);
        return true;
      } else {
        return this.deleteInternalNode(node, value, idx);
      }
    } else {
      if (node.leaf) {
        return false;
      }

      const shouldMerge = node.children[idx]!.keys.length < this.order;

      if (shouldMerge) {
        this.fill(node, idx);
      }

      if (idx > node.keys.length) {
        return this.deleteFromNode(node.children[idx - 1]!, value);
      } else {
        return this.deleteFromNode(node.children[idx]!, value);
      }
    }
  }

  private deleteInternalNode(node: BTreeNode<T>, value: T, idx: number): boolean {
    const k = this.order - 1;

    if (node.children[idx]!.keys.length >= k) {
      const pred = this.getPredecessor(node.children[idx]!);
      node.keys[idx] = pred;
      return this.deleteFromNode(node.children[idx]!, pred);
    } else if (node.children[idx + 1]!.keys.length >= k) {
      const succ = this.getSuccessor(node.children[idx + 1]!);
      node.keys[idx] = succ;
      return this.deleteFromNode(node.children[idx + 1]!, succ);
    } else {
      this.merge(node, idx);
      return this.deleteFromNode(node.children[idx]!, value);
    }
  }

  private getPredecessor(node: BTreeNode<T>): T {
    while (!node.leaf) {
      node = node.children[node.children.length - 1]!;
    }
    return node.keys[node.keys.length - 1]!;
  }

  private getSuccessor(node: BTreeNode<T>): T {
    while (!node.leaf) {
      node = node.children[0]!;
    }
    return node.keys[0]!;
  }

  private fill(node: BTreeNode<T>, idx: number): void {
    const k = this.order - 1;

    if (idx !== 0 && node.children[idx - 1]!.keys.length >= k) {
      this.borrowFromPrev(node, idx);
    } else if (idx !== node.keys.length && node.children[idx + 1]!.keys.length >= k) {
      this.borrowFromNext(node, idx);
    } else {
      if (idx !== node.keys.length) {
        this.merge(node, idx);
      } else {
        this.merge(node, idx - 1);
      }
    }
  }

  private borrowFromPrev(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx - 1]!;

    child.keys.unshift(node.keys[idx - 1]!);
    node.keys[idx - 1] = sibling.keys[sibling.keys.length - 1]!;
    sibling.keys.pop();

    if (!child.leaf) {
      child.children.unshift(sibling.children[sibling.children.length - 1]!);
      sibling.children.pop();
    }
  }

  private borrowFromNext(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx + 1]!;

    child.keys.push(node.keys[idx]!);
    node.keys[idx] = sibling.keys[0]!;
    sibling.keys.shift();

    if (!child.leaf) {
      child.children.push(sibling.children[0]!);
      sibling.children.shift();
    }
  }

  private merge(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx + 1]!;

    child.keys.push(node.keys[idx]!);
    child.keys = [...child.keys, ...sibling.keys];

    if (!child.leaf) {
      child.children = [...child.children, ...sibling.children];
    }

    node.keys.splice(idx, 1);
    node.children.splice(idx + 1, 1);
  }

  private findKeyIndex(node: BTreeNode<T>, value: T): number {
    let i = 0;
    while (i < node.keys.length && this.comparator(value, node.keys[i]!) > 0) {
      i++;
    }
    return i;
  }

  min(): T | null {
    if (this.root === null) return null;

    let node = this.root;
    while (!node.leaf) {
      node = node.children[0]!;
    }
    return node.keys[0]!;
  }

  max(): T | null {
    if (this.root === null) return null;

    let node = this.root;
    while (!node.leaf) {
      node = node.children[node.children.length - 1]!;
    }
    return node.keys[node.keys.length - 1]!;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this.root === null;
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

  private inorderTraversal(node: BTreeNode<T> | null, result: T[]): void {
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

  forEach(callback: (value: T) => void): void {
    const arr = this.toArray();
    arr.forEach(callback);
  }


  *[Symbol.iterator](): IterableIterator<T> {
    type N = BTreeNode<T>;
    type Frame = { node: N; keyIdx: number; childVisited: boolean };
    if (this.root === null) return;
    const stack: Array<Frame> = [];
    const pushLeftmost = (node: N): void => {
      stack.push({ node, keyIdx: 0, childVisited: false });
    };
    pushLeftmost(this.root);
    while (stack.length > 0) {
      const frame = stack[stack.length - 1]!;
      if (!frame.childVisited && !frame.node.leaf && frame.keyIdx < frame.node.children.length) {
        frame.childVisited = true;
        pushLeftmost(frame.node.children[frame.keyIdx]!);
        continue;
      }
      if (frame.keyIdx < frame.node.keys.length) {
        const key = frame.node.keys[frame.keyIdx]!;
        frame.keyIdx++;
        frame.childVisited = false;
        yield key;
        continue;
      }
      if (!frame.node.leaf && frame.keyIdx < frame.node.children.length) {
        frame.childVisited = false;
        pushLeftmost(frame.node.children[frame.keyIdx]!);
        continue;
      }
      stack.pop();
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `${BTree2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }



  toJSON() {
    return { type: 'BTree2', size: this.size, items: this.toArray() }
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


  tap(fn: (collection: BTree2<T>) => void): BTree2<T> {
    fn(this)
    return this
  }

  equals(other: BTree2<T>): boolean {
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

  static from<T>(items: T[]): BTree2<T> {
    const instance = new BTree2<T>()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }

  static of<T>(...items: T[]): BTree2<T> {
    return BTree2.from(items)
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
    return 'BTree2'
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

  move(fromIndex: number, toIndex: number): T[] {
    const arr = this.toArray()
    if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) return [...arr]
    const item = arr[fromIndex]!
    const result = arr.filter((_, i) => i !== fromIndex)
    result.splice(toIndex, 0, item)
    return result
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
    return !this.isEmpty
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
}
