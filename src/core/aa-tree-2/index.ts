type Comparator<T> = (a: T, b: T) => number;

class Node<T> {
  value: T;
  count: number;
  level: number;
  left: Node<T> | null;
  right: Node<T> | null;
  parent: Node<T> | null;

  constructor(value: T) {
    this.value = value;
    this.count = 1;
    this.level = 1;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

export class AATree2<T> {
  private root: Node<T> | null;
  private comparator: Comparator<T>;
  private _size: number;

  constructor(comparator?: Comparator<T>) {
    this.root = null;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this._size = 0;
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

  insert(value: T): this {
    this.root = this.insertNode(this.root, value);
    return this;
  }

  private insertNode(node: Node<T> | null, value: T): Node<T> {
    if (!node) {
      this._size++;
      return new Node(value);
    }

    const cmp = this.comparator(value, node.value);

    if (cmp < 0) {
      node.left = this.insertNode(node.left, value);
      if (node.left) {
        node.left.parent = node;
      }
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value);
      if (node.right) {
        node.right.parent = node;
      }
    } else {
      node.count++;
    }

    return this.skew(this.split(node));
  }

  private skew(node: Node<T>): Node<T> {
    if (!node.left || node.left.level !== node.level) {
      return node;
    }

    const left = node.left;
    node.left = left.right;
    if (left.right) {
      left.right.parent = node;
    }
    left.right = node;
    left.parent = node.parent;
    node.parent = left;

    return left;
  }

  private split(node: Node<T>): Node<T> {
    if (!node.right || !node.right.right || node.right.right.level !== node.level) {
      return node;
    }

    const right = node.right;
    node.right = right.left;
    if (right.left) {
      right.left.parent = node;
    }
    right.left = node;
    right.parent = node.parent;
    node.parent = right;
    right.level++;

    return right;
  }

  delete(value: T): this {
    this.root = this.deleteNode(this.root, value);
    return this;
  }

  private deleteNode(node: Node<T> | null, value: T): Node<T> | null {
    if (!node) {
      return null;
    }

    const cmp = this.comparator(value, node.value);

    if (cmp < 0) {
      node.left = this.deleteNode(node.left, value);
      if (node.left) {
        node.left.parent = node;
      }
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, value);
      if (node.right) {
        node.right.parent = node;
      }
    } else {
      node.count--;
      if (node.count > 0) {
        return node;
      }
      this._size--;
      if (!node.left && !node.right) {
        return null;
      }

      if (!node.left) {
        const successor = this.findMin(node.right!);
        node.value = successor.value;
        node.count = successor.count;
        this._size++;
        node.right = this.deleteNode(node.right, successor.value);
        if (node.right) {
          node.right.parent = node;
        }
      } else if (!node.right) {
        const predecessor = this.findMax(node.left);
        node.value = predecessor.value;
        node.count = predecessor.count;
        this._size++;
        node.left = this.deleteNode(node.left, predecessor.value);
        if (node.left) {
          node.left.parent = node;
        }
      } else {
        const successor = this.findMin(node.right!);
        node.value = successor.value;
        node.count = successor.count;
        this._size++;
        node.right = this.deleteNode(node.right, successor.value);
        if (node.right) {
          node.right.parent = node;
        }
      }
    }

    return this.rebalance(node);
  }

  private rebalance(node: Node<T>): Node<T> {
    let minLevel = 1;

    if (node.left) {
      minLevel = node.left.level;
    }
    if (node.right && node.right.level < minLevel) {
      minLevel = node.right.level;
    }

    minLevel++;

    if (node.level > minLevel) {
      node.level = minLevel;
      if (node.right && node.right.level > minLevel) {
        node.right.level = minLevel;
      }
    }

    return this.skew(this.split(this.skew(node)));
  }

  private findMin(node: Node<T>): Node<T> {
    while (node.left) {
      node = node.left;
    }
    return node;
  }

  private findMax(node: Node<T>): Node<T> {
    while (node.right) {
      node = node.right;
    }
    return node;
  }

  search(value: T): boolean {
    return this.contains(value);
  }

  contains(value: T): boolean {
    let node = this.root;
    while (node) {
      const cmp = this.comparator(value, node.value);
      if (cmp === 0) {
        return true;
      }
      node = cmp < 0 ? node.left : node.right;
    }
    return false;
  }

  min(): T | null {
    if (!this.root) {
      return null;
    }
    return this.findMin(this.root).value;
  }

  max(): T | null {
    if (!this.root) {
      return null;
    }
    return this.findMax(this.root).value;
  }

  toArray(): T[] {
    const result: T[] = [];
    this.inorderTraversal(this.root, result);
    return result;
  }

  private inorderTraversal(node: Node<T> | null, result: T[]): void {
    if (!node) {
      return;
    }
    this.inorderTraversal(node.left, result);
    result.push(node.value);
    this.inorderTraversal(node.right, result);
  }

  forEach(callback: (value: T, index: number) => void): void {
    const array = this.toArray();
    for (let i = 0; i < array.length; i++) {
      callback(array[i]!, i);
    }
  }

  height(): number {
    return this.calculateHeight(this.root);
  }

  private calculateHeight(node: Node<T> | null): number {
    if (!node) {
      return 0;
    }
    const leftHeight = this.calculateHeight(node.left);
    const rightHeight = this.calculateHeight(node.right);
    return 1 + Math.max(leftHeight, rightHeight);
  }


  *[Symbol.iterator](): IterableIterator<T> {
    const stack: Array<Node<T>> = [];
    let current: Node<T> | null = this.root;
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
    return `${AATree2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'AATree2', size: this.size, items: this.toArray() }
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


  tap(fn: (collection: AATree2<T>) => void): AATree2<T> {
    fn(this)
    return this
  }

  equals(other: AATree2<T>): boolean {
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
}
