export class ThrottleQueue2<T> {
  private queue: T[] = [];
  private head: number = 0;
  private active: number = 0;
  private maxConcurrent: number;
  private delayMs: number = 0;

  constructor(options: { maxConcurrent: number; delayMs?: number }) {
    this.maxConcurrent = options.maxConcurrent;
    if (options.delayMs !== undefined) {
      this.delayMs = options.delayMs;
    }
  }

  private maybeCompact(): void {
    if (this.head > 256 && this.head > this.queue.length >> 1) {
      this.queue = this.queue.slice(this.head)
      this.head = 0
    }
  }

  enqueue(item: T): void {
    this.queue.push(item);
  }

  dequeue(): T | undefined {
    if (this.head >= this.queue.length) return undefined
    const item = this.queue[this.head]!
    this.queue[this.head] = undefined as T
    this.head++
    this.maybeCompact()
    return item
  }

  get size(): number {
    return this.queue.length - this.head;
  }

  isEmpty(): boolean {
    return this.head >= this.queue.length;
  }

  clear(): void {
    this.queue = [];
    this.head = 0;
    this.active = 0;
  }

  async processNext(): Promise<T | undefined> {
    if (this.active >= this.maxConcurrent || this.isEmpty()) {
      return undefined;
    }

    const item = this.queue[this.head]!
    this.queue[this.head] = undefined as T
    this.head++
    this.maybeCompact()

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
