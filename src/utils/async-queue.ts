export class AsyncQueue<T> {
  private readonly queue: T[] = []
  private readonly waiting: Array<{ resolve: (value: T) => void }> = []
  private _closed = false
  private _enqueued: number = 0
  private _dequeued: number = 0
  private _qi: number = 0

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
    if (this._qi < this.queue.length) {
      this._dequeued++
      const item = this.queue[this._qi]!
      this.queue[this._qi] = undefined as unknown as T
      this._qi++
      this.compactIfNeeded()
      return Promise.resolve(item)
    }
    if (this._closed) {
      return Promise.reject(new Error('AsyncQueue is closed and empty'))
    }
    return new Promise<T>((resolve) => {
      this.waiting.push({ resolve: (value: T) => { this._dequeued++; resolve(value) } })
    })
  }

  public peek(): T | undefined {
    return this._qi < this.queue.length ? this.queue[this._qi] : undefined
  }

  public get size(): number {
    return this.queue.length - this._qi
  }

  public get pending(): number {
    return this.waiting.length
  }

  public get closed(): boolean {
    return this._closed
  }

  public close(): void {
    this._closed = true
    this.waiting.length = 0
  }

  public getStats(): { size: number; pending: number; enqueued: number; dequeued: number; closed: boolean } {
    return {
      size: this.queue.length - this._qi,
      pending: this.waiting.length,
      enqueued: this._enqueued,
      dequeued: this._dequeued,
      closed: this._closed,
    }
  }

  public [Symbol.iterator](): Iterator<T> {
    let i = this._qi
    return {
      next: () => {
        if (i < this.queue.length) {
          return { value: this.queue[i++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  private compactIfNeeded(): void {
    if (this._qi >= 64 && this._qi > this.queue.length >> 1) {
      this.queue.splice(0, this._qi)
      this._qi = 0
    }
  }

  toString(): string {
    return `AsyncQueue(size=${this.size}, enqueued=${this._enqueued}, dequeued=${this._dequeued}, closed=${this._closed})`
  }

  toJSON(): unknown {
    return {
      items: this.queue.slice(this._qi),
      enqueued: this._enqueued,
      dequeued: this._dequeued,
      closed: this._closed,
    }
  }

  clone(): this {
    const c = new AsyncQueue<T>()
    for (let i = this._qi; i < this.queue.length; i++) {
      c.queue.push(this.queue[i]!)
    }
    c._enqueued = this._enqueued
    c._dequeued = this._dequeued
    c._closed = this._closed
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof AsyncQueue)) return false
    if (this._closed !== other._closed) return false
    if (this._enqueued !== other._enqueued) return false
    if (this._dequeued !== other._dequeued) return false
    if (this.size !== other.size) return false
    let i = this._qi, j = other._qi
    while (i < this.queue.length && j < other.queue.length) {
      if (!Object.is(this.queue[i], other.queue[j])) return false
      i++
      j++
    }
    return true
  }
}
