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
}
