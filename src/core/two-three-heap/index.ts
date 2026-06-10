type Node<T> = {
  value: T;
  children: Node<T>[];
};

export class TwoThreeHeap<T> {
  private heap: Node<T>[] = [];
  private _frontIdx: number = 0;
  private compare: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    const newNode: Node<T> = { value, children: [] };
    this.heap.push(newNode);
    this.maintainHeap();
  }

  extractMin(): T | undefined {
    const effectiveLen = this.heap.length - this._frontIdx
    if (effectiveLen <= 0) return undefined;
    const minNode = this.heap[this._frontIdx]!;
    this._frontIdx++
    const value = minNode.value;
    for (const child of minNode.children) {
      this.heap.push(child);
    }
    this.maintainHeap();
    if (this._frontIdx > 0 && this._frontIdx > this.heap.length / 2) {
      this.heap = this.heap.slice(this._frontIdx)
      this._frontIdx = 0
    }
    return value;
  }

  peek(): T | undefined {
    const effectiveLen = this.heap.length - this._frontIdx
    if (effectiveLen <= 0) return undefined;
    return this.heap[this._frontIdx]!.value;
  }

  get size(): number {
    let count = 0;
    for (let i = this._frontIdx; i < this.heap.length; i++) {
      count += this.countNodes(this.heap[i]!);
    }
    return count;
  }

  isEmpty(): boolean {
    return this._frontIdx >= this.heap.length;
  }

  clear(): void {
    this.heap = [];
    this._frontIdx = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = this._frontIdx; i < this.heap.length; i++) {
      this.collectNodes(this.heap[i]!, result);
    }
    return result.sort((a, b) => this.compare(a, b));
  }

  meld(other: TwoThreeHeap<T>): void {
    for (let i = other._frontIdx; i < other.heap.length; i++) {
      this.heap.push(other.heap[i]!);
    }
    other.clear();
    this.maintainHeap();
  }

  private maintainHeap(): void {
    if (this._frontIdx > 0) {
      this.heap = this.heap.slice(this._frontIdx)
      this._frontIdx = 0
    }
    if (this.heap.length <= 1) return;
    this.heap.sort((a, b) => this.compare(a.value, b.value));
  }

  private countNodes(node: Node<T>): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  private collectNodes(node: Node<T>, result: T[]): void {
    result.push(node.value);
    for (const child of node.children) {
      this.collectNodes(child, result);
    }
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

  toJSON() {
    return { type: 'TwoThreeHeap', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `TwoThreeHeap({ size: ${this.size} })`
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
}
