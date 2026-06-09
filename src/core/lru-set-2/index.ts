export class LRUSet2<T> {
  private items: Map<T, boolean>;
  private _capacity: number;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be positive');
    }
    this._capacity = capacity;
    this.items = new Map<T, boolean>();
  }

  get capacity(): number {
    return this._capacity;
  }

  get size(): number {
    return this.items.size;
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  add(item: T): boolean {
    const existing = this.items.has(item);
    if (existing) {
      this.items.delete(item);
      this.items.set(item, true);
      return false;
    }
    if (this.items.size >= this._capacity) {
      const keys = this.items.keys();
      const evicted = keys.next().value!;
      this.items.delete(evicted!);
    }
    this.items.set(item, true);
    return true;
  }

  has(item: T): boolean {
    return this.items.has(item);
  }

  delete(item: T): boolean {
    return this.items.delete(item);
  }

  touch(item: T): boolean {
    if (!this.items.has(item)) {
      return false;
    }
    this.items.delete(item);
    this.items.set(item, true);
    return true;
  }

  peek(): T | undefined {
    const keys = this.items.keys();
    return keys.next().value;
  }

  pop(): T | undefined {
    const keys = this.items.keys();
    const first = keys.next().value!;
    this.items.delete(first!);
    return first;
  }

  clear(): void {
    this.items.clear();
  }

  toArray(): T[] {
    const result: T[] = [];
    const keys = this.items.keys();
    for (const key of keys) {
      result.unshift(key);
    }
    return result;
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

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toString(): string {
    return `LRUSet2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LRUSet2', size: this.size, items: this.toArray() }
  }
}
