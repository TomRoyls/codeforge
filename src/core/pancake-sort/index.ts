export class PancakeSort<T> {
  private arr: T[];
  private comparator: (a: T, b: T) => number;
  private flipCount: number;

  constructor(array: T[], comparator?: (a: T, b: T) => number) {
    this.arr = [...array];
    this.comparator = comparator ?? ((a: T, b: T): number => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.flipCount = 0;
  }

  flip(k: number): void {
    if (k <= 1 || k > this.arr.length) {
      return;
    }

    let left = 0;
    let right = k - 1;

    while (left < right) {
      const temp = this.arr[left]!;
      this.arr[left] = this.arr[right]!;
      this.arr[right] = temp;
      left++;
      right--;
    }

    this.flipCount++;
  }

  sort(): T[] {
    const n = this.arr.length;

    for (let currSize = n; currSize > 1; currSize--) {
      let maxIdx = 0;

      for (let i = 1; i < currSize; i++) {
        if (this.comparator(this.arr[i]!, this.arr[maxIdx]!) > 0) {
          maxIdx = i;
        }
      }

      if (maxIdx !== currSize - 1) {
        if (maxIdx !== 0) {
          this.flip(maxIdx + 1);
        }
        this.flip(currSize);
      }
    }

    return this.arr;
  }

  isSorted(): boolean {
    for (let i = 0; i < this.arr.length - 1; i++) {
      if (this.comparator(this.arr[i]!, this.arr[i + 1]!) > 0) {
        return false;
      }
    }
    return true;
  }

  getFlipCount(): number {
    return this.flipCount;
  }

  toArray(): T[] {
    return [...this.arr];
  }

  getTimeComplexity(): string {
    return 'O(n²)';
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
    return `PancakeSort()`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'PancakeSort', items: this.toArray() }
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

  get isEmpty(): boolean {
    return this.toArray().length === 0
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
