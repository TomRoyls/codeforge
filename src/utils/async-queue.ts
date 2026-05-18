export class AsyncQueue<T> {
  private readonly queue: T[] = []
  private readonly waiting: Array<{ resolve: (value: T) => void }> = []
  private _closed = false
  private _enqueued: number = 0
  private _dequeued: number = 0

  public enqueue(item: T): void {
    if (this._closed) throw new Error('AsyncQueue is closed')
    this._enqueued++
    if (this.waiting.length > 0) {
      const waiter = this.waiting.shift()!
      waiter.resolve(item)
    } else {
      this.queue.push(item)
    }
  }

  public dequeue(): Promise<T> {
    if (this.queue.length > 0) {
      this._dequeued++
      return Promise.resolve(this.queue.shift()!)
    }
    if (this._closed) {
      return Promise.reject(new Error('AsyncQueue is closed and empty'))
    }
    return new Promise<T>((resolve) => {
      this.waiting.push({ resolve: (value: T) => { this._dequeued++; resolve(value) } })
    })
  }

  public peek(): T | undefined {
    return this.queue[0]
  }

  public get size(): number {
    return this.queue.length
  }

  public get pending(): number {
    return this.waiting.length
  }

  public get closed(): boolean {
    return this._closed
  }

  public close(): void {
    this._closed = true
    for (const waiter of this.waiting) {
      waiter.resolve = () => { throw new Error('AsyncQueue closed') }
    }
    this.waiting.length = 0
  }

  public getStats(): { size: number; pending: number; enqueued: number; dequeued: number; closed: boolean } {
    return {
      size: this.queue.length,
      pending: this.waiting.length,
      enqueued: this._enqueued,
      dequeued: this._dequeued,
      closed: this._closed,
    }
  }

  public [Symbol.iterator](): Iterator<T> {
    let i = 0
    return {
      next: () => {
        if (i < this.queue.length) {
          return { value: this.queue[i++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }
}
