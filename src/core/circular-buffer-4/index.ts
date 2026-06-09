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
}
