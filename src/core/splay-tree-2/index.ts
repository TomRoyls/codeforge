type Comparator<T> = (a: T, b: T) => number;

interface Node<T> {
  value: T;
  left: Node<T> | null;
  right: Node<T> | null;
  parent: Node<T> | null;
}

export class SplayTree2<T> {
  private root: Node<T> | null = null;
  private _size: number = 0;
  private compare: Comparator<T>;

  constructor(comparator?: Comparator<T>) {
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  insert(value: T): void {
    if (!this.root) {
      this.root = { value, left: null, right: null, parent: null };
      this._size++;
      return;
    }

    let current = this.root;

    while (current) {
      const cmp = this.compare(value, current.value);
      if (cmp === 0) return;
      if (cmp < 0) {
        if (!current.left) {
          current.left = { value, left: null, right: null, parent: current };
          this._size++;
          this.splay(current.left);
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = { value, left: null, right: null, parent: current };
          this._size++;
          this.splay(current.right);
          return;
        }
        current = current.right;
      }
    }
  }

  search(value: T): T | null {
    const node = this.findNode(value);
    if (node) {
      this.splay(node);
      return node.value;
    }
    return null;
  }

  contains(value: T): boolean {
    return this.search(value) !== null;
  }

  delete(value: T): void {
    const node = this.findNode(value);
    if (!node) return;

    this.splay(node);

    if (!node.left) {
      this.transplant(node, node.right);
    } else if (!node.right) {
      this.transplant(node, node.left);
    } else {
      const successor = this.minimumNode(node.right)!;
      if (successor.parent !== node) {
        this.transplant(successor, successor.right);
        successor.right = node.right;
        if (successor.right) {
          successor.right!.parent = successor;
        }
      }
      this.transplant(node, successor);
      successor.left = node.left;
      if (successor.left) {
        successor.left!.parent = successor;
      }
    }

    this._size--;
    this.root = this.root || null;
  }

  min(): T | null {
    const node = this.minimumNode(this.root);
    return node ? node.value : null;
  }

  max(): T | null {
    const node = this.maximumNode(this.root);
    return node ? node.value : null;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    this.inOrderTraversal((value) => result.push(value));
    return result;
  }

  inOrderTraversal(callback: (value: T) => void): void {
    this.inOrder(this.root, callback);
  }

  private findNode(value: T): Node<T> | null {
    let current = this.root;
    while (current) {
      const cmp = this.compare(value, current.value);
      if (cmp === 0) return current;
      current = cmp < 0 ? current.left : current.right;
    }
    return null;
  }

  private splay(node: Node<T>): void {
    while (node.parent) {
      const parent = node.parent;
      const grandparent = parent.parent;

      if (!grandparent) {
        if (node === parent.left) {
          this.rotateRight(parent);
        } else {
          this.rotateLeft(parent);
        }
      } else if (node === parent.left && parent === grandparent.left) {
        this.rotateRight(grandparent);
        this.rotateRight(parent);
      } else if (node === parent.right && parent === grandparent.right) {
        this.rotateLeft(grandparent);
        this.rotateLeft(parent);
      } else if (node === parent.right && parent === grandparent.left) {
        this.rotateLeft(parent);
        this.rotateRight(grandparent);
      } else {
        this.rotateRight(parent);
        this.rotateLeft(grandparent);
      }
    }
  }

  private rotateLeft(x: Node<T>): void {
    const y = x.right!;
    x.right = y.left;
    if (y.left) {
      y.left.parent = x;
    }
    y.parent = x.parent;
    if (!x.parent) {
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
    const y = x.left!;
    x.left = y.right;
    if (y.right) {
      y.right.parent = x;
    }
    y.parent = x.parent;
    if (!x.parent) {
      this.root = y;
    } else if (x === x.parent.right) {
      x.parent.right = y;
    } else {
      x.parent.left = y;
    }
    y.right = x;
    x.parent = y;
  }

  private transplant(u: Node<T>, v: Node<T> | null): void {
    if (!u.parent) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }
    if (v) {
      v.parent = u.parent;
    }
  }

  private minimumNode(node: Node<T> | null): Node<T> | null {
    while (node && node.left) {
      node = node.left;
    }
    return node;
  }

  private maximumNode(node: Node<T> | null): Node<T> | null {
    while (node && node.right) {
      node = node.right;
    }
    return node;
  }

  private inOrder(node: Node<T> | null, callback: (value: T) => void): void {
    if (!node) return;
    this.inOrder(node.left, callback);
    callback(node.value);
    this.inOrder(node.right, callback);
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const stack: Array<Node<T>> = [];
    let current: Node<T> | null = this.root;
    return {
      next: () => {
        while (current !== null || stack.length > 0) {
          while (current !== null) {
            stack.push(current);
            current = current.left;
          }
          current = stack.pop()!;
          const value = current.value;
          current = current.right;
          return { value: value as ReturnType<this['toArray']>[number], done: false };
        }
        return { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true };
      }
    };
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `SplayTree2({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'SplayTree2', size: this.size, items: this.toArray() }
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
    return 'SplayTree2'
  }
}
