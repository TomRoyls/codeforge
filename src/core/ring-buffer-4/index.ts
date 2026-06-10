export class RingBuffer4<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;

  constructor(public readonly capacity: number) {
    if (capacity <= 0 || !Number.isInteger(capacity)) {
      throw new Error('Capacity must be a positive integer');
    }
    this.buffer = new Array<T | undefined>(capacity);
  }

  push(value: T): boolean {
    if (this.isFull) {
      return false;
    }
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    return true;
  }

  pop(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    this.tail = (this.tail - 1 + this.capacity) % this.capacity;
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
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return value;
  }

  unshift(value: T): boolean {
    if (this.isFull) {
      return false;
    }
    this.head = (this.head - 1 + this.capacity) % this.capacity;
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
    return this.buffer[(this.tail - 1 + this.capacity) % this.capacity];
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  get isFull(): boolean {
    return this.count === this.capacity;
  }

  get size(): number {
    return this.count;
  }

  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.count = 0;
    for (let i = 0; i < this.capacity; i++) {
      this.buffer[i] = undefined;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      result.push(this.buffer[index] as T);
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      callback(this.buffer[index] as T, i);
    }
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined;
    }
    const actualIndex = (this.head + index) % this.capacity;
    return this.buffer[actualIndex];
  }

  set(index: number, value: T): boolean {
    if (index < 0 || index >= this.count) {
      return false;
    }
    const actualIndex = (this.head + index) % this.capacity;
    this.buffer[actualIndex] = value;
    return true;
  }

  [Symbol.iterator](): Iterator<T> {
    let i = 0;
    return {
      next: (): IteratorResult<T> => {
        if (i >= this.count) {
          return { done: true, value: undefined as unknown as T };
        }
        const index = (this.head + i) % this.capacity;
        const value = this.buffer[index]!;
        i++;
        return { done: false, value };
      },
    };
  }

  entries(): IterableIterator<[number, T]> {
    let i = 0;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: () => {
        if (i >= this.count) {
          return { done: true, value: undefined };
        }
        const index = (this.head + i) % this.capacity;
        const value = this.buffer[index] as T;
        const result: IteratorResult<[number, T]> = { done: false, value: [i, value] };
        i++;
        return result;
      },
    };
  }

  slice(start?: number, end?: number): T[] {
    const result: T[] = [];
    const startIndex = start === undefined ? 0 : Math.max(0, start);
    const endIndex = end === undefined ? this.count : Math.min(end, this.count);

    for (let i = startIndex; i < endIndex; i++) {
      const index = (this.head + i) % this.capacity;
      result.push(this.buffer[index] as T);
    }
    return result;
  }

  indexOf(value: T): number {
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      if (this.buffer[index] === value) {
        return i;
      }
    }
    return -1;
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `RingBuffer4({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RingBuffer4', size: this.size, items: this.toArray() }
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

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }
}
