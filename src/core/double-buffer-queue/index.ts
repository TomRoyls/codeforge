import type { DoubleBufferQueueOptions } from "./types.js";

export class DoubleBufferQueue<T> {
  private frontBuffer: T[];
  private backBuffer: T[];
  private frontIndex: number;
  private frontCount: number;
  private capacity: number;

  constructor(options: DoubleBufferQueueOptions = {}) {
    this.capacity = options.capacity ?? Infinity;
    this.frontBuffer = [];
    this.backBuffer = [];
    this.frontIndex = 0;
    this.frontCount = 0;
  }

  enqueue(value: T): void {
    if (this.isFull()) {
      throw new Error("Queue is full");
    }
    this.backBuffer.push(value);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    if (this.frontCount === 0) {
      this.swapBuffers();
    }

    const value = this.frontBuffer[this.frontIndex]!;
    this.frontIndex++;
    this.frontCount--;
    return value;
  }

  peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    if (this.frontCount === 0) {
      this.swapBuffers();
    }

    return this.frontBuffer[this.frontIndex]!;
  }

  size(): number {
    return this.frontCount + this.backBuffer.length;
  }

  isEmpty(): boolean {
    return this.frontCount === 0 && this.backBuffer.length === 0;
  }

  isFull(): boolean {
    return this.capacity !== Infinity && this.size() >= this.capacity;
  }

  clear(): void {
    this.frontBuffer = [];
    this.backBuffer = [];
    this.frontIndex = 0;
    this.frontCount = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = this.frontIndex; i < this.frontIndex + this.frontCount; i++) {
      result.push(this.frontBuffer[i]!);
    }
    return [...result, ...this.backBuffer];
  }

  forEach(callback: (value: T, index: number) => void): void {
    const arr = this.toArray();
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, i);
    }
  }

  front(): T | undefined {
    return this.peek();
  }

  back(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    if (this.backBuffer.length > 0) {
      return this.backBuffer[this.backBuffer.length - 1]!;
    }
    return this.frontBuffer[this.frontIndex + this.frontCount - 1]!;
  }

  private swapBuffers(): void {
    this.frontBuffer = this.backBuffer;
    this.backBuffer = [];
    this.frontIndex = 0;
    this.frontCount = this.frontBuffer.length;
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
    return `${DoubleBufferQueue}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'DoubleBufferQueue', items: this.toArray() }
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
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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


  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
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
