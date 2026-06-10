export class RunLengthQueue2<T> {
  private runs: { value: T; count: number }[];
  private _frontIdx: number = 0;

  constructor() {
    this.runs = [];
  }

  enqueue(value: T): void {
    const lastIdx = this.runs.length - 1
    if (lastIdx >= this._frontIdx && this.runs[lastIdx]!.value === value) {
      this.runs[lastIdx]!.count++;
    } else {
      this.runs.push({ value, count: 1 });
    }
  }

  dequeue(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    
    const run = this.runs[this._frontIdx]!;
    run.count--;
    
    if (run.count === 0) {
      this._frontIdx++;
      if (this._frontIdx > this.runs.length / 2) {
        this.runs = this.runs.slice(this._frontIdx)
        this._frontIdx = 0
      }
    }
    
    return run.value;
  }

  get peek(): T | undefined {
    return this.isEmpty ? undefined : this.runs[this._frontIdx]!.value;
  }

  get size(): number {
    let total = 0
    for (let i = this._frontIdx; i < this.runs.length; i++) {
      total += this.runs[i]!.count
    }
    return total;
  }

  get isEmpty(): boolean {
    if (this._frontIdx >= this.runs.length) return true
    for (let i = this._frontIdx; i < this.runs.length; i++) {
      if (this.runs[i]!.count > 0) return false
    }
    return true
  }

  clear(): void {
    this.runs = [];
    this._frontIdx = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = this._frontIdx; i < this.runs.length; i++) {
      const run = this.runs[i]!
      for (let j = 0; j < run.count; j++) {
        result.push(run.value);
      }
    }
    return result;
  }

  enqueueRun(value: T, count: number): void {
    if (count <= 0) {
      return;
    }
    const lastIdx = this.runs.length - 1
    if (lastIdx >= this._frontIdx && this.runs[lastIdx]!.value === value) {
      this.runs[lastIdx]!.count += count;
    } else {
      this.runs.push({ value, count });
    }
  }

  dequeueRun(): { value: T; count: number } | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    const run = this.runs[this._frontIdx]!;
    this._frontIdx++
    if (this._frontIdx > this.runs.length / 2) {
      this.runs = this.runs.slice(this._frontIdx)
      this._frontIdx = 0
    }
    return { value: run.value, count: run.count };
  }

  get uniqueValues(): T[] {
    const result: T[] = []
    for (let i = this._frontIdx; i < this.runs.length; i++) {
      result.push(this.runs[i]!.value)
    }
    return result;
  }

  get totalRuns(): number {
    return this.runs.length - this._frontIdx;
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
    return `RunLengthQueue2({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'RunLengthQueue2', size: this.size, items: this.toArray() }
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
