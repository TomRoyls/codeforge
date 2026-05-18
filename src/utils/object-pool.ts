export interface ObjectPoolOptions<T> {
  factory: () => T
  reset: (obj: T) => void
  maxSize: number
}

export class ObjectPool<T> {
  private readonly pool: T[] = []
  private readonly factory: () => T
  private readonly resetFn: (obj: T) => void
  private readonly maxSize: number
  private created: number = 0
  private reused: number = 0
  private returned: number = 0

  constructor(options: ObjectPoolOptions<T>) {
    if (options.maxSize < 1) throw new RangeError(`maxSize must be >= 1, got ${options.maxSize}`)
    this.factory = options.factory
    this.resetFn = options.reset
    this.maxSize = options.maxSize
  }

  public acquire(): T {
    if (this.pool.length > 0) {
      this.reused++
      return this.pool.pop()!
    }
    this.created++
    return this.factory()
  }

  public release(obj: T): void {
    this.returned++
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj)
      this.pool.push(obj)
    }
  }

  public get size(): number {
    return this.pool.length
  }

  public getStats(): { available: number; created: number; reused: number; returned: number } {
    return {
      available: this.pool.length,
      created: this.created,
      reused: this.reused,
      returned: this.returned,
    }
  }

  public drain(): T[] {
    const items = [...this.pool]
    this.pool.length = 0
    return items
  }
}
