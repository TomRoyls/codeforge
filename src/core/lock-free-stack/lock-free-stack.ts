import type {
  LockFreeStackOptions,
  LockFreeStackStatistics,
  StackNode,
} from "./types.js";
import { DEFAULT_LOCK_FREE_STACK_OPTIONS } from "./types.js";

export class LockFreeStack<T> {
  private top: StackNode<T> | null = null;
  private _size = 0;
  private readonly maxRetries: number;
  private stats: LockFreeStackStatistics = {
    pushes: 0,
    pops: 0,
    contentionRetries: 0,
    totalOperations: 0,
  };

  constructor(options?: LockFreeStackOptions) {
    const resolved = { ...DEFAULT_LOCK_FREE_STACK_OPTIONS, ...options };
    this.maxRetries = resolved.maxRetries;
  }

  push(value: T): void {
    const newNode: StackNode<T> = { value, next: null };
    let retries = 0;
    let currentTop = this.top;
    newNode.next = currentTop;
    while (!this.compareAndSwapTop(currentTop, newNode)) {
      retries++;
      currentTop = this.top;
      newNode.next = currentTop;
      if (retries >= this.maxRetries) {
        this.stats.contentionRetries += retries;
        throw new Error("Max retries exceeded during push");
      }
    }
    this._size++;
    this.stats.pushes++;
    this.stats.totalOperations++;
    this.stats.contentionRetries += retries;
  }

  pop(): T | undefined {
    if (this.top === null) {
      return undefined;
    }
    let retries = 0;
    let currentTop = this.top;
    while (!this.compareAndSwapTop(currentTop, currentTop.next)) {
      retries++;
      currentTop = this.top;
      if (currentTop === null) {
        this.stats.contentionRetries += retries;
        return undefined;
      }
      if (retries >= this.maxRetries) {
        this.stats.contentionRetries += retries;
        throw new Error("Max retries exceeded during pop");
      }
    }
    this._size--;
    this.stats.pops++;
    this.stats.totalOperations++;
    this.stats.contentionRetries += retries;
    return currentTop.value;
  }

  peek(): T | undefined {
    if (this.top === null) {
      return undefined;
    }
    return this.top.value;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this.top === null;
  }

  clear(): void {
    this.top = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.top;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this.top;
    let index = 0;
    while (current !== null) {
      callback(current.value, index);
      current = current.next;
      index++;
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.top;
    while (current !== null) {
      yield current.value;
      current = current.next;
    }
  }

  contains(value: T): boolean {
    let current = this.top;
    while (current !== null) {
      if (current.value === value) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  clone(): LockFreeStack<T> {
    const cloned = new LockFreeStack<T>({ maxRetries: this.maxRetries });
    const values = this.toArray().reverse();
    for (const value of values) {
      cloned.push(value);
    }
    cloned.stats = {
      pushes: 0,
      pops: 0,
      contentionRetries: 0,
      totalOperations: 0,
    };
    return cloned;
  }

  getStatistics(): LockFreeStackStatistics {
    return {
      pushes: this.stats.pushes,
      pops: this.stats.pops,
      contentionRetries: this.stats.contentionRetries,
      totalOperations: this.stats.totalOperations,
    };
  }

  resetStatistics(): void {
    this.stats = {
      pushes: 0,
      pops: 0,
      contentionRetries: 0,
      totalOperations: 0,
    };
  }

  simulateContention(retries: number = 1): void {
    this.stats.contentionRetries += retries;
  }

  private compareAndSwapTop(
    expected: StackNode<T> | null,
    newNode: StackNode<T> | null,
  ): boolean {
    if (this.top === expected) {
      this.top = newNode;
      return true;
    }
    return false;
  }
}
