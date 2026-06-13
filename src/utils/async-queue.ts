export class AsyncQueue<T> {
  private queue: T[] = []
  private waiting: Array<(value: T) => void> = []
  private closed = false

  enqueue(item: T): void {
    if (this.closed) return
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!
      resolve(item)
    } else {
      this.queue.push(item)
    }
  }

  dequeue(): T | undefined {
    return this.queue.shift()
  }

  get size(): number {
    return this.queue.length
  }

  get isEmpty(): boolean {
    return this.queue.length === 0
  }

  get isClosed(): boolean {
    return this.closed
  }

  get pendingResolvers(): number {
    return this.waiting.length
  }

  close(): void {
    this.closed = true
    for (const resolve of this.waiting) {
      resolve(undefined as T)
    }
    this.waiting = []
  }

  clear(): void {
    this.queue = []
  }

  toArray(): T[] {
    return [...this.queue]
  }

  toString(): string {
    return JSON.stringify({ size: this.size, closed: this.closed })
  }

  toJSON(): Record<string, unknown> {
    return { size: this.size, closed: this.closed }
  }

  clone(): AsyncQueue<T> {
    const copy = new AsyncQueue<T>()
    copy.queue = [...this.queue]
    copy.closed = this.closed
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof AsyncQueue)) return false
    return this.size === other.size && this.closed === other.closed
  }
}
