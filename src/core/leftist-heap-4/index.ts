interface Node<T> {
  value: T;
  left: Node<T> | null;
  right: Node<T> | null;
  npl: number;
}

export class LeftistHeap4<T> {
  private root: Node<T> | null;
  private _size: number;
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.root = null;
    this._size = 0;
    this.comparator = comparator || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
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

  insert(value: T): void {
    const singleNode: Node<T> = {
      value,
      left: null,
      right: null,
      npl: 0
    };
    const otherHeap = new LeftistHeap4<T>(this.comparator);
    otherHeap.root = singleNode;
    otherHeap._size = 1;
    this.merge(otherHeap);
  }

  extractMin(): T | undefined {
    if (!this.root) {
      return undefined;
    }
    const minValue = this.root.value;
    const left = this.root.left;
    const right = this.root.right;
    const leftHeap = new LeftistHeap4<T>(this.comparator);
    const rightHeap = new LeftistHeap4<T>(this.comparator);
    leftHeap.root = left;
    rightHeap.root = right;
    leftHeap._size = this._size - 1 - (rightHeap.size);
    rightHeap._size = this._size - 1 - leftHeap.size;
    this.root = null;
    this._size = 0;
    this.merge(leftHeap);
    this.merge(rightHeap);
    return minValue;
  }

  peek(): T | undefined {
    return this.root?.value;
  }

  merge(other: LeftistHeap4<T>): void {
    this.root = this.mergeNodes(this.root, other.root);
    this._size += other._size;
    other.root = null;
    other._size = 0;
  }

  private mergeNodes(a: Node<T> | null, b: Node<T> | null): Node<T> | null {
    if (!a) {
      return b;
    }
    if (!b) {
      return a;
    }
    if (this.comparator(a.value, b.value) <= 0) {
      a.right = this.mergeNodes(a.right, b);
      if (!a.left || (a.left.npl < (a.right?.npl ?? -1))) {
        const temp = a.left;
        a.left = a.right;
        a.right = temp;
      }
      a.npl = (a.right?.npl ?? -1) + 1;
      return a;
    } else {
      b.right = this.mergeNodes(b.right, a);
      if (!b.left || (b.left.npl < (b.right?.npl ?? -1))) {
        const temp = b.left;
        b.left = b.right;
        b.right = temp;
      }
      b.npl = (b.right?.npl ?? -1) + 1;
      return b;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    const tempHeap = new LeftistHeap4<T>(this.comparator);
    tempHeap.root = this.cloneNode(this.root);
    tempHeap._size = this._size;
    while (!tempHeap.isEmpty()) {
      result.push(tempHeap.extractMin()!);
    }
    return result;
  }

  private cloneNode(node: Node<T> | null): Node<T> | null {
    if (!node) {
      return null;
    }
    return {
      value: node.value,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
      npl: node.npl
    };
  }

  static fromArray<T>(values: T[], comparator?: (a: T, b: T) => number): LeftistHeap4<T> {
    const heap = new LeftistHeap4<T>(comparator);
    for (const value of values) {
      heap.insert(value);
    }
    return heap;
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
    return `LeftistHeap4({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LeftistHeap4', size: this.size, items: this.toArray() }
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
