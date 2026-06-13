export class PromisePool {
  private maxConcurrent: number
  private active = 0
  private queue: Array<() => Promise<unknown>> = []
  private results: unknown[] = []

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent
  }

  add<T>(fn: () => Promise<T>): void {
    this.queue.push(fn)
    this.tryRun()
  }

  private tryRun(): void {
    while (this.active < this.maxConcurrent && this.queue.length > 0) {
      const fn = this.queue.shift()!
      this.active++
      fn().then((result) => {
        this.results.push(result)
        this.active--
        this.tryRun()
      }).catch(() => {
        this.active--
        this.tryRun()
      })
    }
  }

  get pending(): number { return this.queue.length }
  get running(): number { return this.active }
  get completedCount(): number { return this.results.length }
  get isEmpty(): boolean { return this.queue.length === 0 && this.active === 0 }

  clear(): void { this.queue = []; this.results = [] }

  toArray(): unknown[] { return [...this.results] }
  toString(): string { return JSON.stringify({ max: this.maxConcurrent, active: this.active, pending: this.pending }) }
  toJSON(): Record<string, number> { return { max: this.maxConcurrent, active: this.active, pending: this.pending } }

  clone(): PromisePool {
    const c = new PromisePool(this.maxConcurrent)
    c.queue = [...this.queue]
    c.results = [...this.results]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof PromisePool)) return false
    return this.maxConcurrent === other.maxConcurrent
  }
}
