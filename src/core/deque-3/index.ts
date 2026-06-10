export class Deque3<T> {
  private data: (T | undefined)[];
  private front: number;
  private back: number;
  private count: number;
  private capacity: number;

  constructor() {
    this.capacity = 4;
    this.data = new Array(this.capacity);
    this.front = 0;
    this.back = 0;
    this.count = 0;
  }

  get size(): number {
    return this.count;
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  pushFront(value: T): void {
    if (this.count === this.capacity) {
      this.grow();
    }
    this.front = (this.front - 1 + this.capacity) % this.capacity;
    this.data[this.front] = value;
    this.count++;
  }

  pushBack(value: T): void {
    if (this.count === this.capacity) {
      this.grow();
    }
    this.data[this.back] = value;
    this.back = (this.back + 1) % this.capacity;
    this.count++;
  }

  popFront(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }
    const value = this.data[this.front];
    this.data[this.front] = undefined;
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return value;
  }

  popBack(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }
    this.back = (this.back - 1 + this.capacity) % this.capacity;
    const value = this.data[this.back];
    this.data[this.back] = undefined;
    this.count--;
    return value;
  }

  peekFront(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }
    return this.data[this.front];
  }

  peekBack(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }
    return this.data[(this.back - 1 + this.capacity) % this.capacity];
  }

  clear(): void {
    this.data = new Array(this.capacity);
    this.front = 0;
    this.back = 0;
    this.count = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const index = (this.front + i) % this.capacity;
      result.push(this.data[index] as T);
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.count; i++) {
      const index = (this.front + i) % this.capacity;
      callback(this.data[index] as T, i);
    }
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined;
    }
    const actualIndex = (this.front + index) % this.capacity;
    return this.data[actualIndex];
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.count; i++) {
      const index = (this.front + i) % this.capacity;
      if (this.data[index] === value) {
        return true;
      }
    }
    return false;
  }

  private grow(): void {
    const newCapacity = this.capacity * 2;
    const newData: (T | undefined)[] = new Array(newCapacity);
    for (let i = 0; i < this.count; i++) {
      const index = (this.front + i) % this.capacity;
      newData[i] = this.data[index];
    }
    this.data = newData;
    this.front = 0;
    this.back = this.count;
    this.capacity = newCapacity;
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
    return `${Deque3}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'Deque3', size: this.size, items: this.toArray() }
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

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
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


  static empty<T>(): Deque3<T> {
    return new Deque3<T>()
  }
}
