export class AVLTree4<T> {
  private root: Node<T> | null = null;
  private compare: (a: T, b: T) => number;
  private _size: number = 0;

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    this.root = this._insert(this.root, value);
  }

  private _insert(node: Node<T> | null, value: T): Node<T> {
    if (node === null) {
      this._size++;
      return { value, left: null, right: null, height: 1 };
    }

    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      node.left = this._insert(node.left, value);
    } else if (cmp > 0) {
      node.right = this._insert(node.right, value);
    } else {
      return node;
    }

    this.updateHeight(node);
    return this.balance(node);
  }

  remove(value: T): boolean {
    const result = this._remove(this.root, value);
    if (result.removed) {
      this.root = result.node;
      this._size--;
      return true;
    }
    return false;
  }

  private _remove(node: Node<T> | null, value: T): { removed: boolean; node: Node<T> | null } {
    if (node === null) return { removed: false, node: null };

    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      const result = this._remove(node.left, value);
      node.left = result.node;
      if (result.removed) {
        this.updateHeight(node);
        return { removed: true, node: this.balance(node) };
      }
      return { removed: false, node };
    } else if (cmp > 0) {
      const result = this._remove(node.right, value);
      node.right = result.node;
      if (result.removed) {
        this.updateHeight(node);
        return { removed: true, node: this.balance(node) };
      }
      return { removed: false, node };
    } else {
      if (node.left === null) return { removed: true, node: node.right };
      if (node.right === null) return { removed: true, node: node.left };

      const successor = this._minNode(node.right);
      node.value = successor.value;
      const result = this._remove(node.right, successor.value);
      node.right = result.node;
      this.updateHeight(node);
      return { removed: true, node: this.balance(node) };
    }
  }

  private _minNode(node: Node<T>): Node<T> {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  private _maxNode(node: Node<T>): Node<T> {
    while (node.right !== null) {
      node = node.right;
    }
    return node;
  }

  search(value: T): boolean {
    return this._search(this.root, value);
  }

  private _search(node: Node<T> | null, value: T): boolean {
    if (node === null) return false;
    const cmp = this.compare(value, node.value);
    if (cmp < 0) return this._search(node.left, value);
    if (cmp > 0) return this._search(node.right, value);
    return true;
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  min(): T | undefined {
    if (this.root === null) return undefined;
    return this._minNode(this.root).value;
  }

  max(): T | undefined {
    if (this.root === null) return undefined;
    return this._maxNode(this.root).value;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    this._inorder(this.root, result);
    return result;
  }

  private _inorder(node: Node<T> | null, result: T[]): void {
    if (node === null) return;
    this._inorder(node.left, result);
    result.push(node.value);
    this._inorder(node.right, result);
  }

  forEach(callback: (value: T) => void): void {
    const stack: Node<T>[] = [];
    let current: Node<T> | null = this.root;

    while (stack.length > 0 || current !== null) {
      while (current !== null) {
        stack.push(current);
        current = current.left;
      }
      current = stack.pop()!;
      callback(current.value);
      current = current.right;
    }
  }

  predecessor(value: T): T | undefined {
    if (this.root === null) return undefined;
    let pred: T | undefined = undefined;
    let node: Node<T> | null = this.root;

    while (node !== null) {
      const cmp = this.compare(value, node.value);
      if (cmp > 0) {
        pred = node.value;
        node = node.right;
      } else {
        node = node.left;
      }
    }
    return pred;
  }

  successor(value: T): T | undefined {
    if (this.root === null) return undefined;
    let succ: T | undefined = undefined;
    let node: Node<T> | null = this.root;

    while (node !== null) {
      const cmp = this.compare(value, node.value);
      if (cmp < 0) {
        succ = node.value;
        node = node.left;
      } else {
        node = node.right;
      }
    }
    return succ;
  }

  rangeSearch(low: T, high: T): T[] {
    const result: T[] = [];
    this._rangeSearch(this.root, low, high, result);
    return result;
  }

  private _rangeSearch(node: Node<T> | null, low: T, high: T, result: T[]): void {
    if (node === null) return;

    const cmpLow = this.compare(node.value, low);
    const cmpHigh = this.compare(node.value, high);

    if (cmpLow > 0) {
      this._rangeSearch(node.left, low, high, result);
    }

    if (cmpLow >= 0 && cmpHigh <= 0) {
      result.push(node.value);
    }

    if (cmpHigh < 0) {
      this._rangeSearch(node.right, low, high, result);
    }
  }

  height(): number {
    return this.getHeight();
  }

  getHeight(): number {
    return this.root ? this.root.height : 0;
  }

  private updateHeight(node: Node<T>): void {
    const leftHeight = node.left ? node.left.height : 0;
    const rightHeight = node.right ? node.right.height : 0;
    node.height = Math.max(leftHeight, rightHeight) + 1;
  }

  private getBalance(node: Node<T>): number {
    const leftHeight = node.left ? node.left.height : 0;
    const rightHeight = node.right ? node.right.height : 0;
    return leftHeight - rightHeight;
  }

  private balance(node: Node<T>): Node<T> {
    const balance = this.getBalance(node);

    if (balance > 1) {
      if (this.getBalance(node.left!) >= 0) {
        return this.rotateRight(node);
      } else {
        node.left = this.rotateLeft(node.left!);
        return this.rotateRight(node);
      }
    }

    if (balance < -1) {
      if (this.getBalance(node.right!) <= 0) {
        return this.rotateLeft(node);
      } else {
        node.right = this.rotateRight(node.right!);
        return this.rotateLeft(node);
      }
    }

    return node;
  }

  private rotateLeft(y: Node<T>): Node<T> {
    const x = y.right!;
    const T2 = x.left;

    x.left = y;
    y.right = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  private rotateRight(x: Node<T>): Node<T> {
    const y = x.left!;
    const T2 = y.right;

    y.right = x;
    x.left = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  _isBalanced(): boolean {
    return this._checkBalance(this.root) !== false;
  }

  private _checkBalance(node: Node<T> | null): number | false {
    if (node === null) return 0;

    const left = this._checkBalance(node.left);
    const right = this._checkBalance(node.right);

    if (left === false || right === false) return false;
    if (Math.abs(left - right) > 1) return false;

    return Math.max(left, right) + 1;
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
    return `${AVLTree4}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }
  toJSON() {
    return { type: 'AVLTree4', size: this.size, items: this.toArray() }
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


  tap(fn: (collection: AVLTree4<T>) => void): AVLTree4<T> {
    fn(this)
    return this
  }

  equals(other: AVLTree4<T>): boolean {
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
}

interface Node<T> {
  value: T;
  left: Node<T> | null;
  right: Node<T> | null;
  height: number;


}
