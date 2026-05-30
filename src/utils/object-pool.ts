export class ObjectPool<T> {
  private pool: T[] = []
  private readonly factory: () => T
  private readonly reset: (item: T) => void
  private readonly _maxSize: number
  private createdCount: number = 0
  private reusedCount: number = 0
  private returnedCount: number = 0

  constructor(options: {
    factory: () => T
    reset: (item: T) => void
    maxSize?: number
  }) {
    this.factory = options.factory
    this.reset = options.reset
    const maxSize = options.maxSize ?? 1000
    if (maxSize < 1) {
      throw new RangeError(`maxSize must be >= 1, got ${maxSize}`)
    }
    this._maxSize = maxSize
  }

  acquire(): T {
    if (this.pool.length > 0) {
      this.reusedCount++
      return this.pool.pop()!
    }
    this.createdCount++
    return this.factory()
  }

  release(item: T): void {
    if (this.pool.length < this._maxSize) {
      this.reset(item)
      this.pool.push(item)
      this.returnedCount++
    }
  }

  prefill(count: number): void {
    for (let i = 0; i < count; i++) {
      this.pool.push(this.factory())
      this.createdCount++
    }
  }

  get size(): number {
    return this.pool.length
  }

  get available(): number {
    return this.pool.length
  }

  get totalCreated(): number {
    return this.createdCount
  }

  get capacity(): number {
    return this._maxSize
  }

  getStats(): { available: number; created: number; reused: number; returned: number } {
    return {
      available: this.pool.length,
      created: this.createdCount,
      reused: this.reusedCount,
      returned: this.returnedCount,
    }
  }

  drain(): T[] {
    const items = this.pool
    this.pool = []
    return items
  }
}
