export class RingBuffer3<T> {
  private buffer: Array<T | undefined>;
  private _capacity: number;
  private mask: number;
  private head: number;
  private tail: number;
  private count: number;

  constructor(capacity: number) {
    const powerOfTwo = 1 << Math.ceil(Math.log2(Math.max(1, capacity)));
    this._capacity = powerOfTwo;
    this.mask = powerOfTwo - 1;
    this.buffer = new Array<T | undefined>(powerOfTwo);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  push(value: T): boolean {
    if (this.isFull) {
      return false;
    }
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) & this.mask;
    this.count++;
    return true;
  }

  pop(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    this.tail = (this.tail - 1) & this.mask;
    const value = this.buffer[this.tail];
    this.buffer[this.tail] = undefined;
    this.count--;
    return value;
  }

  shift(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    const value = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) & this.mask;
    this.count--;
    return value;
  }

  unshift(value: T): boolean {
    if (this.isFull) {
      return false;
    }
    this.head = (this.head - 1) & this.mask;
    this.buffer[this.head] = value;
    this.count++;
    return true;
  }

  peekFront(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    return this.buffer[this.head];
  }

  peekBack(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    return this.buffer[(this.tail - 1) & this.mask];
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  get isFull(): boolean {
    return this.count === this._capacity;
  }

  get size(): number {
    return this.count;
  }

  get capacity(): number {
    return this._capacity;
  }

  clear(): void {
    this.buffer.fill(undefined);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let idx = this.head;
    for (let i = 0; i < this.count; i++) {
      const value = this.buffer[idx];
      if (value !== undefined) {
        result.push(value);
      }
      idx = (idx + 1) & this.mask;
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = this.head;
    for (let i = 0; i < this.count; i++) {
      const value = this.buffer[idx];
      if (value !== undefined) {
        callback(value, i);
      }
      idx = (idx + 1) & this.mask;
    }
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined;
    }
    const idx = (this.head + index) & this.mask;
    return this.buffer[idx];
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
    return `RingBuffer3({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RingBuffer3', size: this.size, items: this.toArray() }
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
