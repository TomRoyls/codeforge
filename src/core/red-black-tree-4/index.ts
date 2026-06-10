enum Color {
  Red,
  Black
}

class RBNode<T> {
  value: T;
  color: Color;
  left: RBNode<T> | null;
  right: RBNode<T> | null;
  parent: RBNode<T> | null;
  size: number;

  constructor(value: T, color: Color = Color.Red) {
    this.value = value;
    this.color = color;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.size = 1;
  }
}

export class RedBlackTree4<T> {
  private root: RBNode<T> | null;
  private compare: (a: T, b: T) => number;
  private _size: number;

  constructor(compare?: (a: T, b: T) => number) {
    this.root = null;
    this.compare = compare || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this._size = 0;
  }

  private _compare(a: T, b: T): number {
    return this.compare(a, b);
  }

  private _updateNodeSize(node: RBNode<T>): void {
    node.size = 1;
    if (node.left !== null) {
      node.size += node.left.size;
    }
    if (node.right !== null) {
      node.size += node.right.size;
    }
  }

  insert(value: T): void {
    const newNode = new RBNode<T>(value, Color.Red);
    let parent: RBNode<T> | null = null;
    let current = this.root;

    while (current !== null) {
      parent = current;
      const cmp = this._compare(value, current.value);
      if (cmp < 0) {
        current = current.left;
      } else if (cmp > 0) {
        current = current.right;
      } else {
        return;
      }
    }

    newNode.parent = parent;
    if (parent === null) {
      this.root = newNode;
    } else if (this._compare(value, parent.value) < 0) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    this._size++;
    this._updateAncestorSizes(parent);
    this._insertFixup(newNode);
  }

  private _insertFixup(node: RBNode<T>): void {
    while (node !== this.root && node.parent !== null && node.parent.color === Color.Red) {
      const parent = node.parent;
      const grandparent = parent.parent;

      if (grandparent === null) break;

      if (parent === grandparent.left) {
        const uncle = grandparent.right;
        if (uncle !== null && uncle.color === Color.Red) {
          parent.color = Color.Black;
          uncle.color = Color.Black;
          grandparent.color = Color.Red;
          this._updateNodeSize(grandparent);
          node = grandparent;
        } else {
          if (node === parent.right) {
            node = parent;
            this._leftRotate(node);
          }
          node.parent!.color = Color.Black;
          node.parent!.parent!.color = Color.Red;
          this._rightRotate(node.parent!.parent!);
        }
      } else {
        const uncle = grandparent.left;
        if (uncle !== null && uncle.color === Color.Red) {
          parent.color = Color.Black;
          uncle.color = Color.Black;
          grandparent.color = Color.Red;
          this._updateNodeSize(grandparent);
          node = grandparent;
        } else {
          if (node === parent.left) {
            node = parent;
            this._rightRotate(node);
          }
          node.parent!.color = Color.Black;
          node.parent!.parent!.color = Color.Red;
          this._leftRotate(node.parent!.parent!);
        }
      }
    }

    if (this.root !== null) {
      this.root.color = Color.Black;
    }
  }

  private _leftRotate(x: RBNode<T>): void {
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

    this._updateNodeSize(x);
    this._updateNodeSize(y);
    if (y.parent !== null) {
      this._updateNodeSize(y.parent);
    }
  }

  private _rightRotate(y: RBNode<T>): void {
    const x = y.left;
    if (x === null) return;

    y.left = x.right;
    if (x.right !== null) {
      x.right.parent = y;
    }

    x.parent = y.parent;
    if (y.parent === null) {
      this.root = x;
    } else if (y === y.parent.left) {
      y.parent.left = x;
    } else {
      y.parent.right = x;
    }

    x.right = y;
    y.parent = x;

    this._updateNodeSize(y);
    this._updateNodeSize(x);
    if (x.parent !== null) {
      this._updateNodeSize(x.parent);
    }
  }

  remove(value: T): boolean {
    const node = this._searchNode(value);
    if (node === null) return false;

    let originalColor = node.color;
    let x: RBNode<T> | null;
    let xParent: RBNode<T> | null = node.parent;

    if (node.left === null) {
      x = node.right;
      this._transplant(node, node.right);
      this._updateAncestorSizes(node.parent);
    } else if (node.right === null) {
      x = node.left;
      this._transplant(node, node.left);
      this._updateAncestorSizes(node.parent);
    } else {
      const successor = this._minimumNode(node.right)!;
      originalColor = successor.color;
      x = successor.right;
      xParent = successor;

      if (successor.parent !== node) {
        xParent = successor.parent;
        this._transplant(successor, successor.right!);
        successor.right = node.right;
        if (successor.right !== null) {
          successor.right.parent = successor;
        }
        this._updateAncestorSizes(xParent);
      }

      this._transplant(node, successor);
      successor.left = node.left;
      if (successor.left !== null) {
        successor.left.parent = successor;
      }
      successor.color = node.color;
      this._updateNodeSize(successor);
      this._updateAncestorSizes(successor.parent);
    }

    this._size--;

    if (originalColor === Color.Black) {
      if (x === null) {
        this._deleteFixup(x, xParent);
      } else {
        this._deleteFixup(x, x.parent);
      }
    }

    return true;
  }

  private _updateAncestorSizes(node: RBNode<T> | null): void {
    let current = node;
    while (current !== null) {
      this._updateNodeSize(current);
      current = current.parent;
    }
  }

  private _transplant(u: RBNode<T>, v: RBNode<T> | null): void {
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

  private _deleteFixup(x: RBNode<T> | null, parent: RBNode<T> | null): void {
    while (x !== this.root && (x === null || x.color === Color.Black)) {
      if (parent === null) break;

      const isLeft = x === parent.left;

      if (isLeft) {
        let sibling = parent.right;
        if (sibling !== null && sibling.color === Color.Red) {
          sibling.color = Color.Black;
          parent.color = Color.Red;
          this._leftRotate(parent);
          sibling = parent.right;
        }

        if (sibling !== null &&
            (sibling.left === null || sibling.left.color === Color.Black) &&
            (sibling.right === null || sibling.right.color === Color.Black)) {
          sibling.color = Color.Red;
          x = parent;
          parent = x.parent;
        } else if (sibling !== null) {
          if (sibling.right === null || sibling.right.color === Color.Black) {
            if (sibling.left !== null) {
              sibling.left.color = Color.Black;
            }
            sibling.color = Color.Red;
            this._rightRotate(sibling);
            sibling = parent.right;
          }

          if (sibling !== null && sibling.right !== null) {
            sibling.color = parent.color;
            parent.color = Color.Black;
            sibling.right.color = Color.Black;
            this._leftRotate(parent);
          }
          x = this.root;
        } else {
          x = parent;
          parent = x.parent;
        }
      } else {
        let sibling = parent.left;
        if (sibling !== null && sibling.color === Color.Red) {
          sibling.color = Color.Black;
          parent.color = Color.Red;
          this._rightRotate(parent);
          sibling = parent.left;
        }

        if (sibling !== null &&
            (sibling.left === null || sibling.left.color === Color.Black) &&
            (sibling.right === null || sibling.right.color === Color.Black)) {
          sibling.color = Color.Red;
          x = parent;
          parent = x.parent;
        } else if (sibling !== null) {
          if (sibling.left === null || sibling.left.color === Color.Black) {
            if (sibling.right !== null) {
              sibling.right.color = Color.Black;
            }
            sibling.color = Color.Red;
            this._leftRotate(sibling);
            sibling = parent.left;
          }

          if (sibling !== null && sibling.left !== null) {
            sibling.color = parent.color;
            parent.color = Color.Black;
            sibling.left.color = Color.Black;
            this._rightRotate(parent);
          }
          x = this.root;
        } else {
          x = parent;
          parent = x.parent;
        }
      }
    }

    if (x !== null) {
      x.color = Color.Black;
    }
  }

  search(value: T): boolean {
    return this._searchNode(value) !== null;
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  private _searchNode(value: T): RBNode<T> | null {
    let current = this.root;
    while (current !== null) {
      const cmp = this._compare(value, current.value);
      if (cmp === 0) return current;
      else if (cmp < 0) current = current.left;
      else current = current.right;
    }
    return null;
  }

  min(): T | undefined {
    const node = this._minimumNode(this.root);
    return node ? node.value : undefined;
  }

  private _minimumNode(node: RBNode<T> | null): RBNode<T> | null {
    if (node === null) return null;
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  max(): T | undefined {
    const node = this._maximumNode(this.root);
    return node ? node.value : undefined;
  }

  private _maximumNode(node: RBNode<T> | null): RBNode<T> | null {
    if (node === null) return null;
    while (node.right !== null) {
      node = node.right;
    }
    return node;
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
    this._inorderTraversal(this.root, result);
    return result;
  }

  private _inorderTraversal(node: RBNode<T> | null, result: T[]): void {
    if (node === null) return;
    this._inorderTraversal(node.left, result);
    result.push(node.value);
    this._inorderTraversal(node.right, result);
  }

  forEach(callback: (value: T) => void): void {
    const arr = this.toArray();
    for (const value of arr) {
      callback(value);
    }
  }

  predecessor(value: T): T | undefined {
    const node = this._searchNode(value);
    if (node === null) return undefined;

    if (node.left !== null) {
      const pred = this._maximumNode(node.left);
      return pred ? pred.value : undefined;
    }

    let parent = node.parent;
    let current = node;
    while (parent !== null && current === parent.left) {
      current = parent;
      parent = parent.parent;
    }

    return parent ? parent.value : undefined;
  }

  successor(value: T): T | undefined {
    const node = this._searchNode(value);
    if (node === null) return undefined;

    if (node.right !== null) {
      const succ = this._minimumNode(node.right);
      return succ ? succ.value : undefined;
    }

    let parent = node.parent;
    let current = node;
    while (parent !== null && current === parent.right) {
      current = parent;
      parent = parent.parent;
    }

    return parent ? parent.value : undefined;
  }

  rangeSearch(low: T, high: T): T[] {
    const result: T[] = [];
    this._rangeSearchHelper(this.root, low, high, result);
    return result;
  }

  private _rangeSearchHelper(node: RBNode<T> | null, low: T, high: T, result: T[]): void {
    if (node === null) return;

    const cmpLow = this._compare(node.value, low);
    const cmpHigh = this._compare(node.value, high);

    if (cmpLow > 0) {
      this._rangeSearchHelper(node.left, low, high, result);
    }

    if (cmpLow >= 0 && cmpHigh <= 0) {
      result.push(node.value);
    }

    if (cmpHigh < 0) {
      this._rangeSearchHelper(node.right, low, high, result);
    }
  }

  rank(value: T): number {
    return this._rankHelper(this.root, value);
  }

  private _rankHelper(node: RBNode<T> | null, value: T): number {
    if (node === null) {
      return 0;
    }

    const cmp = this._compare(value, node.value);
    if (cmp === 0) {
      return (node.left ? node.left.size : 0) + 1;
    } else if (cmp < 0) {
      return this._rankHelper(node.left, value);
    } else {
      const leftSize = node.left ? node.left.size : 0;
      return leftSize + 1 + this._rankHelper(node.right, value);
    }
  }

  select(k: number): T | undefined {
    if (k < 1 || k > this._size) {
      return undefined;
    }
    return this._selectNode(this.root, k);
  }

  private _selectNode(node: RBNode<T> | null, k: number): T | undefined {
    if (node === null) {
      return undefined;
    }

    const leftSize = node.left ? node.left.size : 0;
    const currentRank = leftSize + 1;

    if (k === currentRank) {
      return node.value;
    } else if (k < currentRank) {
      return this._selectNode(node.left, k);
    } else {
      return this._selectNode(node.right, k - currentRank);
    }
  }

  height(): number {
    return this._calculateHeight(this.root);
  }

  private _calculateHeight(node: RBNode<T> | null): number {
    if (node === null) return 0;
    const leftHeight = this._calculateHeight(node.left);
    const rightHeight = this._calculateHeight(node.right);
    return Math.max(leftHeight, rightHeight) + 1;
  }

  getTimeComplexity(): string {
    return "O(log n) for insert, delete, search, min, max, rank, select; O(k + log n) for rangeSearch (k = result size); O(n) for traversals";
  }

  [Symbol.iterator](): Iterator<T> {
    const stack: Array<RBNode<T>> = [];
    let current: RBNode<T> | null = this.root;
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
    return `RedBlackTree4({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RedBlackTree4', size: this.size, items: this.toArray() }
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
    return 'RedBlackTree4'
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
}
