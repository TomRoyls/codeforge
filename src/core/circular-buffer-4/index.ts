export class CircularBuffer4<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;
  private _capacity: number;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    this._capacity = capacity;
    this.buffer = new Array<T | undefined>(capacity);
  }

  get capacity(): number {
    return this._capacity;
  }

  get size(): number {
    return this.count;
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  get isFull(): boolean {
    return this.count === this._capacity;
  }

  get available(): number {
    return this._capacity - this.count;
  }

  write(value: T): void {
    if (this.count < this._capacity) {
      this.buffer[this.tail] = value;
      this.tail = (this.tail + 1) % this._capacity;
      this.count++;
    } else {
      this.buffer[this.head] = value;
      this.head = (this.head + 1) % this._capacity;
      this.tail = (this.tail + 1) % this._capacity;
    }
  }

  overwrite(value: T): void {
    if (this.count === this._capacity) {
      this.buffer[this.head] = value;
      this.head = (this.head + 1) % this._capacity;
      this.tail = (this.tail + 1) % this._capacity;
    } else {
      this.buffer[this.tail] = value;
      this.tail = (this.tail + 1) % this._capacity;
      this.count++;
    }
  }

  read(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    const value = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this._capacity;
    this.count--;
    return value;
  }

  peek(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    return this.buffer[this.head];
  }

  peekAt(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined;
    }
    const bufferIndex = (this.head + index) % this._capacity;
    return this.buffer[bufferIndex];
  }

  slice(start: number, end?: number): T[] {
    if (start < 0 || start >= this.count) {
      return [];
    }
    if (end === undefined) {
      end = this.count;
    }
    if (end <= start) {
      return [];
    }
    const normalizedEnd = Math.min(end, this.count);
    const result: T[] = [];
    for (let i = start; i < normalizedEnd; i++) {
      const bufferIndex = (this.head + i) % this._capacity;
      result.push(this.buffer[bufferIndex]!);
    }
    return result;
  }

  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.count = 0;
    for (let i = 0; i < this._capacity; i++) {
      this.buffer[i] = undefined;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    let index = this.head;
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[index]!);
      index = (index + 1) % this._capacity;
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let bufferIndex = this.head;
    for (let i = 0; i < this.count; i++) {
      callback(this.buffer[bufferIndex]!, i);
      bufferIndex = (bufferIndex + 1) % this._capacity;
    }
  }

  filter<U extends T>(predicate: (value: T, index: number) => value is U): U[];
  filter(predicate: (value: T, index: number) => boolean): T[];
  filter(predicate: (value: T, index: number) => boolean): T[] {
    const result: T[] = [];
    let bufferIndex = this.head;
    for (let i = 0; i < this.count; i++) {
      const value = this.buffer[bufferIndex]!;
      if (predicate(value, i)) {
        result.push(value);
      }
      bufferIndex = (bufferIndex + 1) % this._capacity;
    }
    return result;
  }

  map<U>(callback: (value: T, index: number) => U): U[] {
    const result: U[] = [];
    let bufferIndex = this.head;
    for (let i = 0; i < this.count; i++) {
      result.push(callback(this.buffer[bufferIndex]!, i));
      bufferIndex = (bufferIndex + 1) % this._capacity;
    }
    return result;
  }

  reduce<U>(callback: (accumulator: U, value: T, index: number) => U, initialValue: U): U {
    let accumulator = initialValue;
    let bufferIndex = this.head;
    for (let i = 0; i < this.count; i++) {
      accumulator = callback(accumulator, this.buffer[bufferIndex]!, i);
      bufferIndex = (bufferIndex + 1) % this._capacity;
    }
    return accumulator;
  }

  getTimeComplexity(operation: string): string {
    switch (operation) {
      case 'write':
        return 'O(1)';
      case 'overwrite':
        return 'O(1)';
      case 'read':
        return 'O(1)';
      case 'peek':
        return 'O(1)';
      case 'peekAt':
        return 'O(1)';
      case 'slice':
        return 'O(n)';
      case 'clear':
        return 'O(n)';
      case 'toArray':
        return 'O(n)';
      case 'forEach':
        return 'O(n)';
      case 'filter':
        return 'O(n)';
      case 'map':
        return 'O(n)';
      case 'reduce':
        return 'O(n)';
      default:
        return 'Unknown operation';
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

  toString(): string {
    return `${CircularBuffer4}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'CircularBuffer4', size: this.size, items: this.toArray() }
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


  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
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

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }


  tap(fn: (collection: CircularBuffer4<T>) => void): CircularBuffer4<T> {
    fn(this)
    return this
  }

  equals(other: CircularBuffer4<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  zip<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: [T, U][] = []
    for (let i = 0; i < len; i++) {
      result.push([a[i]!, b[i]!])
    }
    return result
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: Iterable<T>): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
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

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  filterMap<U>(fn: (item: T) => U | undefined): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      const mapped = fn(item)
      if (mapped !== undefined) {
        result.push(mapped)
      }
    }
    return result
  }

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
  }
}
