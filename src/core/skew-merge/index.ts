class SkewMergeNode<T> {
  value: T;
  left: SkewMergeNode<T> | null;
  right: SkewMergeNode<T> | null;

  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class SkewMerge<T> {
  private root: SkewMergeNode<T> | null;
  private comparator: (a: T, b: T) => number;
  private _size: number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.root = null;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this._size = 0;
  }

  insert(value: T): void {
    const node = new SkewMergeNode(value);
    this.root = this._merge(this.root, node);
    this._size++;
  }

  extractMin(): T | undefined {
    if (!this.root) return undefined;
    const minValue = this.root.value;
    this.root = this._merge(this.root.left, this.root.right);
    this._size--;
    return minValue;
  }

  peek(): T | undefined {
    return this.root?.value;
  }

  merge(other: SkewMerge<T>): void {
    this.root = this._merge(this.root, other.root);
    this._size += other._size;
    other.clear();
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  private setSize(n: number): void {
    this._size = n;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    const temp = new SkewMerge<T>(this.comparator);
    temp.root = this._cloneNode(this.root);
    temp.setSize(this._size);

    while (!temp.isEmpty()) {
      const value = temp.extractMin();
      if (value !== undefined) {
        result.push(value);
      }
    }

    return result;
  }

  private _merge(a: SkewMergeNode<T> | null, b: SkewMergeNode<T> | null): SkewMergeNode<T> | null {
    if (!a) return b;
    if (!b) return a;

    if (this.comparator(a.value, b.value) > 0) {
      return this._merge(b, a);
    }

    a.right = this._merge(a.right, b);

    const temp = a.left;
    a.left = a.right;
    a.right = temp;

    return a;
  }

  private _cloneNode(node: SkewMergeNode<T> | null): SkewMergeNode<T> | null {
    if (!node) return null;

    const newNode = new SkewMergeNode(node.value);
    newNode.left = this._cloneNode(node.left);
    newNode.right = this._cloneNode(node.right);

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

  toString(): string {
    return `SkewMerge({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'SkewMerge', size: this.size, items: this.toArray() }
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
}
