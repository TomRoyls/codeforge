class Node<T> {
  value: T;
  children: Node<T>[];
  prev: Node<T> | null;

  constructor(value: T) {
    this.value = value;
    this.children = [];
    this.prev = null;
  }
}

export class PairingQueue2<T> {
  private root: Node<T> | null = null;
  private _size: number = 0;
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  enqueue(value: T): void {
    const newNode = new Node(value);
    this.root = this.mergeNodes(this.root, newNode);
    this._size++;
  }

  dequeue(): T | undefined {
    if (!this.root) {
      return undefined;
    }

    const min = this.root.value;

    if (this.root.children.length === 0) {
      this.root = null;
    } else {
      this.root = this.mergePairs(this.root.children);
    }

    this._size--;
    return min;
  }

  peek(): T | undefined {
    return this.root?.value;
  }

  merge(other: PairingQueue2<T>): void {
    if (other === this) {
      return;
    }

    this.root = this.mergeNodes(this.root, other.root);
    this._size += other._size;
    other._size = 0;
    other.root = null;
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
    const queue = this.clone();
    while (!queue.isEmpty()) {
      result.push(queue.dequeue()!);
    }
    return result;
  }

  static fromArray<T>(values: T[], comparator?: (a: T, b: T) => number): PairingQueue2<T> {
    const queue = new PairingQueue2<T>(comparator);
    for (const value of values) {
      queue.enqueue(value);
    }
    return queue;
  }

  private mergeNodes(a: Node<T> | null, b: Node<T> | null): Node<T> | null {
    if (!a) {
      return b;
    }
    if (!b) {
      return a;
    }

    if (this.comparator(a.value, b.value) <= 0) {
      b.prev = a;
      a.children.push(b);
      return a;
    } else {
      a.prev = b;
      b.children.push(a);
      return b;
    }
  }

  private mergePairs(nodes: Node<T>[]): Node<T> | null {
    if (nodes.length === 0) {
      return null;
    }
    if (nodes.length === 1) {
      return nodes[0]!;
    }

    const merged: Node<T>[] = [];
    for (let i = 0; i < nodes.length; i += 2) {
      if (i + 1 < nodes.length) {
        const result = this.mergeNodes(nodes[i]!, nodes[i + 1]!);
        if (result) {
          merged.push(result);
        }
      } else {
        merged.push(nodes[i]!);
      }
    }

    let result: Node<T> | null = merged[0]!;
    for (let i = 1; i < merged.length; i++) {
      merged[i]!.prev = null;
      result = this.mergeNodes(result, merged[i]!);
    }

    return result;
  }

  private clone(): PairingQueue2<T> {
    const result = new PairingQueue2<T>(this.comparator);
    const stack: { node: Node<T>; target: Node<T> }[] = [];

    if (this.root) {
      result.root = new Node(this.root.value);
      stack.push({ node: this.root, target: result.root });
    }

    while (stack.length > 0) {
      const { node, target } = stack.pop()!;

      for (const child of node.children) {
        const childCopy = new Node(child.value);
        target.children.push(childCopy);
        stack.push({ node: child, target: childCopy });
      }
    }

    result._size = this._size;
    return result;
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

  toString(): string {
    return `PairingQueue2({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'PairingQueue2', size: this.size, items: this.toArray() }
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
}
