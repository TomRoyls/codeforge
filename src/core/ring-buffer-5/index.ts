export class RingBuffer5<T> {
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

  enqueue(value: T): boolean {
    return this.push(value);
  }

  dequeue(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    const value = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
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
    const actualIndex = (this.head + index) % this.capacity;
    return this.buffer[actualIndex];
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      callback(this.buffer[index] as T, i);
    }
  }

  filter(predicate: (value: T, index: number) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      const value = this.buffer[index] as T;
      if (predicate(value, i)) {
        result.push(value);
      }
    }
    return result;
  }

  map<U>(mapper: (value: T, index: number) => U): U[] {
    const result: U[] = [];
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      result.push(mapper(this.buffer[index] as T, i));
    }
    return result;
  }

  reduce<U>(reducer: (accumulator: U, value: T, index: number) => U, initialValue: U): U {
    let accumulator = initialValue;
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      accumulator = reducer(accumulator, this.buffer[index] as T, i);
    }
    return accumulator;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      result.push(this.buffer[index] as T);
    }
    return result;
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

  get isEmpty(): boolean {
    return this.count === 0;
  }

  get isFull(): boolean {
    return this.count === this.capacity;
  }

  get available(): number {
    return this.capacity - this.count;
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

  getTimeComplexity(method: string): string {
    const complexities: Record<string, string> = {
      push: 'O(1)',
      pop: 'O(1)',
      enqueue: 'O(1)',
      dequeue: 'O(1)',
      peek: 'O(1)',
      peekAt: 'O(1)',
      forEach: 'O(n)',
      filter: 'O(n)',
      map: 'O(n)',
      reduce: 'O(n)',
      toArray: 'O(n)',
      slice: 'O(k) where k is slice size',
      isEmpty: 'O(1)',
      isFull: 'O(1)',
      size: 'O(1)',
      available: 'O(1)',
      clear: 'O(n)',
    };
    return complexities[method] ?? 'Unknown';
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
}
