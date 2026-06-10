export class Beap2<T> {
  private data: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  insert(value: T): void {
    this.data.push(value);
    this.siftUp(this.data.length - 1);
  }

  extractMin(): T | undefined {
    if (this.data.length === 0) return undefined;

    const min = this.data[0];
    const last = this.data.pop()!;

    if (this.data.length > 0) {
      this.data[0] = last;
      this.siftDown(0);
    }

    return min;
  }

  peek(): T | undefined {
    return this.data[0];
  }

  has(value: T): boolean {
    return this.data.includes(value);
  }

  get size(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  clear(): void {
    this.data = [];
  }

  toArray(): T[] {
    return [...this.data];
  }

  private getRow(index: number): number {
    return Math.floor((Math.sqrt(8 * index + 1) - 1) / 2);
  }

  private getCol(index: number): number {
    const row = this.getRow(index);
    return index - (row * (row + 1)) / 2;
  }

  private getParentIndices(index: number): number[] {
    const row = this.getRow(index);
    const col = this.getCol(index);

    if (row === 0) return [];

    const parentRow = row - 1;
    const parents: number[] = [];

    if (col <= parentRow) {
      parents.push(parentRow * (parentRow + 1) / 2 + col);
    }
    if (col > 0) {
      parents.push(parentRow * (parentRow + 1) / 2 + col - 1);
    }

    return parents;
  }

  private siftUp(index: number): void {
    if (index === 0) return;

    const parents = this.getParentIndices(index);
    if (parents.length === 0) return;

    let swapWith = -1;
    for (const p of parents) {
      if (this.comparator(this.data[index]!, this.data[p]!) < 0) {
        if (swapWith === -1 || this.comparator(this.data[p]!, this.data[swapWith]!) < 0) {
          swapWith = p;
        }
      }
    }

    if (swapWith === -1) return;

    [this.data[index], this.data[swapWith]] = [this.data[swapWith]!, this.data[index]!];

    this.siftUp(swapWith);

    // In a biparental heap, the displaced value at index may violate
    // the heap property with its other parent after the swap above.
    const allParents = this.getParentIndices(index);
    for (const p of allParents) {
      if (this.comparator(this.data[index]!, this.data[p]!) < 0) {
        [this.data[index], this.data[p]] = [this.data[p]!, this.data[index]!];
        this.siftUp(p);
        this.siftUp(index);
        return;
      }
    }
  }

  private siftDown(index: number): void {
    const row = this.getRow(index);
    const col = this.getCol(index);

    const nextRow = row + 1;
    const child1Index = (nextRow * (nextRow + 1)) / 2 + col;
    const child2Index = (nextRow * (nextRow + 1)) / 2 + (col + 1);

    let smallest = index;

    if (child1Index < this.data.length && this.comparator(this.data[child1Index]!, this.data[smallest]!) < 0) {
      smallest = child1Index;
    }

    if (child2Index < this.data.length && this.comparator(this.data[child2Index]!, this.data[smallest]!) < 0) {
      smallest = child2Index;
    }

    if (smallest !== index) {
      [this.data[index], this.data[smallest]] = [this.data[smallest]!, this.data[index]!];
      this.siftDown(smallest);
    }
  }


  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = 0; i < this.size; i++) {
      yield this.data[i]!;
    }
  }

  toString(): string {
    return `${Beap2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'Beap2', size: this.size, items: this.toArray() }
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

  reverse(): T[] {
    return this.toArray().reverse()
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
}
