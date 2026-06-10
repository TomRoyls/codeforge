class PagodaNode<T> {
  value: T;
  left: PagodaNode<T> | null;
  right: PagodaNode<T> | null;

  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class Pagoda2<T> {
  private root: PagodaNode<T> | null;
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
    const newNode = new PagodaNode(value);
    this.root = this.mergeNodes(this.root, newNode);
    this._size++;
  }

  extractMin(): T | null {
    if (this.root === null) {
      return null;
    }
    const minValue = this.root.value;
    this.root = this.mergeNodes(this.root.left, this.root.right);
    this._size--;
    return minValue;
  }

  peek(): T | null {
    return this.root ? this.root.value : null;
  }

  merge(other: Pagoda2<T>): void {
    this.root = this.mergeNodes(this.root, other.root);
    this._size += other._size;
    other.root = null;
    other._size = 0;
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
    const temp = new Pagoda2<T>(this.comparator);
    temp.root = this.cloneNode(this.root);
    temp._size = this._size;
    
    while (!temp.isEmpty()) {
      result.push(temp.extractMin()!);
    }
    return result;
  }

  contains(value: T): boolean {
    return this.containsNode(this.root, value);
  }

  decreaseKey(oldValue: T, newValue: T): boolean {
    if (this.contains(oldValue) && this.comparator(newValue, oldValue) < 0) {
      this.delete(oldValue);
      this.insert(newValue);
      return true;
    }
    return false;
  }

  delete(value: T): boolean {
    if (!this.contains(value)) {
      return false;
    }
    const values: T[] = [];
    let found = false;
    
    while (!this.isEmpty()) {
      const current = this.extractMin()!;
      if (!found && this.comparator(current, value) === 0) {
        found = true;
      } else {
        values.push(current);
      }
    }
    
    for (const v of values) {
      this.insert(v);
    }
    
    return found;
  }

  private mergeNodes(a: PagodaNode<T> | null, b: PagodaNode<T> | null): PagodaNode<T> | null {
    if (a === null) return b;
    if (b === null) return a;
    
    if (this.comparator(a.value, b.value) > 0) {
      const temp = a;
      a = b;
      b = temp;
    }
    
    const temp = a.right;
    a.right = a.left;
    a.left = this.mergeNodes(b, temp);
    
    return a;
  }

  private containsNode(node: PagodaNode<T> | null, value: T): boolean {
    if (node === null) {
      return false;
    }
    if (this.comparator(node.value, value) === 0) {
      return true;
    }
    return this.containsNode(node.left, value) || this.containsNode(node.right, value);
  }

  private cloneNode(node: PagodaNode<T> | null): PagodaNode<T> | null {
    if (node === null) {
      return null;
    }
    const newNode = new PagodaNode(node.value);
    newNode.left = this.cloneNode(node.left);
    newNode.right = this.cloneNode(node.right);
    return newNode;
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

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `Pagoda2({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'Pagoda2', size: this.size, items: this.toArray() }
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
}
