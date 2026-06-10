export class RingBuffer6<T> {
  private buffer: T[];
  private head: number;
  private tail: number;
  private _size: number;

  constructor(initialCapacity = 16) {
    this.buffer = new Array<T>(initialCapacity);
    this.head = 0;
    this.tail = 0;
    this._size = 0;
  }

  get size(): number {
    return this._size;
  }

  get capacity(): number {
    return this.buffer.length;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  isFull(): boolean {
    return this._size === this.buffer.length;
  }

  private resize(): void {
    const newCapacity = this.buffer.length * 2;
    const newBuffer = new Array<T>(newCapacity);
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this.buffer.length]!;
    }
    this.buffer = newBuffer;
    this.head = 0;
    this.tail = this._size;
  }

  push(item: T): void {
    if (this.isFull()) {
      this.resize();
    }
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.buffer.length;
    this._size++;
  }

  pop(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    this.tail = (this.tail - 1 + this.buffer.length) % this.buffer.length;
    const item = this.buffer[this.tail];
    this.buffer[this.tail] = undefined as unknown as T;
    this._size--;
    return item;
  }

  shift(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined as unknown as T;
    this.head = (this.head + 1) % this.buffer.length;
    this._size--;
    return item;
  }

  unshift(item: T): void {
    if (this.isFull()) {
      this.resize();
    }
    this.head = (this.head - 1 + this.buffer.length) % this.buffer.length;
    this.buffer[this.head] = item;
    this._size++;
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined;
    }
    return this.buffer[(this.head + index) % this.buffer.length];
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      return;
    }
    this.buffer[(this.head + index) % this.buffer.length] = value;
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.buffer[(this.head + i) % this.buffer.length] = undefined as unknown as T;
    }
    this.head = 0;
    this.tail = 0;
    this._size = 0;
  }

  toArray(): T[] {
    const arr: T[] = new Array(this._size);
    for (let i = 0; i < this._size; i++) {
      arr[i] = this.buffer[(this.head + i) % this.buffer.length]!;
    }
    return arr;
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[(this.head + i) % this.buffer.length]!, i);
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
    return `RingBuffer6({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RingBuffer6', size: this.size, items: this.toArray() }
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
