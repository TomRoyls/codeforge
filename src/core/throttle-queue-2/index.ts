export class ThrottleQueue2<T> {
  private queue: T[] = [];
  private active: number = 0;
  private maxConcurrent: number;
  private delayMs: number = 0;

  constructor(options: { maxConcurrent: number; delayMs?: number }) {
    this.maxConcurrent = options.maxConcurrent;
    if (options.delayMs !== undefined) {
      this.delayMs = options.delayMs;
    }
  }

  enqueue(item: T): void {
    this.queue.push(item);
  }

  dequeue(): T | undefined {
    return this.queue.shift();
  }

  get size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  clear(): void {
    this.queue = [];
    this.active = 0;
  }

  async processNext(): Promise<T | undefined> {
    if (this.active >= this.maxConcurrent || this.isEmpty()) {
      return undefined;
    }

    const item = this.queue.shift();
    if (item === undefined) {
      return undefined;
    }

    this.active++;
    try {
      if (this.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
      return item;
    } finally {
      this.active--;
    }
  }
}
