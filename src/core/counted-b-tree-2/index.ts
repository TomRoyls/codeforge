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

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
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


  tap(fn: (collection: CountedBTree2<T>) => void): CountedBTree2<T> {
    fn(this)
    return this
  }

  equals(other: CountedBTree2<T>): boolean {
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

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
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

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
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

  toSet(): Set<T> {
    return new Set(this.toArray())
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

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  toReversed(): T[] {
    return [...this.toArray()].reverse()
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

  get [Symbol.toStringTag](): string {
    return 'CountedBTree2'
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
}
