export class ElasticQueue2<T> {
  private items: T[] = [];
  private head = 0;
  private readonly maxSize: number | undefined;

  constructor(options?: { minSize?: number; maxSize?: number }) {
    this.maxSize = options?.maxSize;
  }

  private get logicalLength(): number {
    return this.items.length - this.head;
  }

  enqueue(item: T): void {
    if (this.maxSize !== undefined && this.logicalLength >= this.maxSize) {
      throw new Error('Queue is full');
    }
    this.items.push(item);
  }

  dequeue(): T | undefined {
    if (this.head >= this.items.length) return undefined
    const value = this.items[this.head]!
    this.head++
    if (this.head >= this.items.length) {
      this.items = []
      this.head = 0
    }
    return value
  }

  peek(): T | undefined {
    if (this.logicalLength === 0) {
      return undefined;
    }
    return this.items[this.head]!;
  }

  get size(): number {
    return this.logicalLength;
  }

  isEmpty(): boolean {
    return this.logicalLength === 0;
  }

  isFull(): boolean {
    return this.maxSize !== undefined && this.logicalLength >= this.maxSize;
  }

  clear(): void {
    this.items = [];
    this.head = 0;
  }

  capacity(): number | undefined {
    return this.maxSize;
  }

  toString(): string {
    return `${ElasticQueue2}({ size: ${this.size} })`
  }
}
