export class ObjectRecycler2<T> {
  private pool: T[] = []
  private factory: () => T
  private resetFn: ((obj: T) => void) | null
  private maxSize: number
  private stats = { created: 0, recycled: 0, discarded: 0 }

  constructor(factory: () => T, maxSize = 100, resetFn?: (obj: T) => void) {
    this.factory = factory
    this.maxSize = maxSize
    this.resetFn = resetFn ?? null
  }

  acquire(): T {
    if (this.pool.length > 0) {
      this.stats.recycled++
      return this.pool.pop()!
    }
    this.stats.created++
    return this.factory()
  }

  release(obj: T): void {
    if (this.pool.length >= this.maxSize) {
      this.stats.discarded++
      return
    }
    if (this.resetFn) {
      this.resetFn(obj)
    }
    this.pool.push(obj)
  }

  prefill(count: number): this {
    for (let i = 0; i < count && this.pool.length < this.maxSize; i++) {
      const obj = this.factory()
      if (this.resetFn) this.resetFn(obj)
      this.pool.push(obj)
      this.stats.created++
    }
    return this
  }

  getPoolSize(): number { return this.pool.length }
  getMaxSize(): number { return this.maxSize }
  getStats(): { created: number; recycled: number; discarded: number } {
    return { ...this.stats }
  }

  getRecycleRate(): number {
    const total = this.stats.created + this.stats.recycled
    return total === 0 ? 0 : this.stats.recycled / total
  }

  setMaxSize(size: number): this {
    this.maxSize = size
    while (this.pool.length > size) {
      this.pool.pop()
      this.stats.discarded++
    }
    return this
  }

  drain(): T[] {
    const items = [...this.pool]
    this.pool = []
    return items
  }

  count(): number { return this.pool.length }

  toArray(): T[] { return [...this.pool] }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return { poolSize: this.getPoolSize(), maxSize: this.maxSize, stats: this.getStats() } }
  clone(): ObjectRecycler2<T> {
    const r = new ObjectRecycler2(this.factory, this.maxSize, this.resetFn ?? undefined)
    r.pool = [...this.pool]
    r.stats = { ...this.stats }
    return r
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ObjectRecycler2)) return false
    return this.maxSize === other.maxSize
  }
  clear(): void {
    this.pool = []
    this.stats = { created: 0, recycled: 0, discarded: 0 }
  }
}
