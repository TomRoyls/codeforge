export class ElasticQueue2<T> {
  private items: T[] = [];
  private readonly maxSize: number | undefined;

  constructor(options?: { minSize?: number; maxSize?: number }) {
    this.maxSize = options?.maxSize;
  }

  enqueue(item: T): void {
    if (this.maxSize !== undefined && this.items.length >= this.maxSize) {
      throw new Error('Queue is full');
    }
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    if (this.items.length === 0) {
      return undefined;
    }
    return this.items[0]!;
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  isFull(): boolean {
    return this.maxSize !== undefined && this.items.length >= this.maxSize;
  }

  clear(): void {
    this.items = [];
  }

  capacity(): number | undefined {
    return this.maxSize;
  }
}
