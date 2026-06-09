export class BeapSet2<T> {
  private data: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  add(value: T): boolean {
    if (this.has(value)) return false;
    this.data.push(value);
    this.siftUp(this.data.length - 1);
    return true;
  }

  has(value: T): boolean {
    return this.findIndex(value) !== -1;
  }

  delete(value: T): boolean {
    const index = this.findIndex(value);
    if (index === -1) return false;

    const last = this.data.pop()!;

    if (index < this.data.length) {
      this.data[index] = last;
      this.siftDown(index);
    }

    return true;
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

  min(): T | undefined {
    return this.data[0];
  }

  max(): T | undefined {
    if (this.data.length === 0) return undefined;
    let maxVal = this.data[0]!;
    for (let i = 1; i < this.data.length; i++) {
      if (this.comparator(this.data[i]!, maxVal) > 0) {
        maxVal = this.data[i]!;
      }
    }
    return maxVal;
  }

  forEach(callback: (value: T) => void): void {
    const sorted = this.toArray();
    for (const value of sorted) {
      callback(value);
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    const copy = [...this.data];

    while (copy.length > 0) {
      let minIndex = 0;
      for (let i = 1; i < copy.length; i++) {
        if (this.comparator(copy[i]!, copy[minIndex]!) < 0) {
          minIndex = i;
        }
      }
      result.push(copy[minIndex]!);
      copy.splice(minIndex, 1);
    }

    return result;
  }

  private findIndex(value: T): number {
    for (let i = 0; i < this.data.length; i++) {
      if (this.comparator(this.data[i]!, value) === 0) {
        return i;
      }
    }
    return -1;
  }

  private getRow(index: number): number {
    return Math.ceil((Math.sqrt(8 * index + 1) - 1) / 2);
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
    const parent1Index = parentRow * (parentRow + 1) / 2 + col;
    const parent2Index = col > 0 ? parentRow * (parentRow + 1) / 2 + col - 1 : -1;

    const parents = [parent1Index];
    if (parent2Index >= 0) {
      parents.push(parent2Index);
    }

    return parents;
  }

  private siftUp(index: number): void {
    if (index === 0) return;

    const parents = this.getParentIndices(index);
    const current = this.data[index]!;

    let shouldSwap = false;
    let swapParentIndex = -1;

    for (const parentIndex of parents) {
      if (this.comparator(current, this.data[parentIndex]!) < 0) {
        if (swapParentIndex === -1 || this.comparator(this.data[parentIndex]!, this.data[swapParentIndex]!) < 0) {
          swapParentIndex = parentIndex;
        }
        shouldSwap = true;
      }
    }

    if (shouldSwap && swapParentIndex >= 0) {
      [this.data[index], this.data[swapParentIndex]] = [this.data[swapParentIndex]!, this.data[index]!];
      this.siftUp(swapParentIndex);
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
    return `${BeapSet2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'BeapSet2', size: this.size, items: this.toArray() }
  }

  map<R>(fn: (item: T) => R): R[] {
    return this.toArray().map(fn)
  }

  filter(fn: (item: T) => boolean): T[] {
    return this.toArray().filter(fn)
  }
}
