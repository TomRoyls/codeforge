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
}
