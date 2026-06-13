export class ObjectPool2<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (item: T) => void
  private created = 0

  constructor(factory: () => T, reset: (item: T) => void, preAllocate = 0) {
    this.factory = factory
    this.reset = reset
    for (let i = 0; i < preAllocate; i++) this.pool.push(factory())
  }

  acquire(): T {
    if (this.pool.length > 0) return this.pool.pop()!
    this.created++
    return this.factory()
  }

  release(item: T): void {
    this.reset(item)
    this.pool.push(item)
  }

  get available(): number { return this.pool.length }
  get totalCreated(): number { return this.created + this.pool.length }
  get isEmpty(): boolean { return this.pool.length === 0 }

  clear(): void { this.pool = [] }

  toArray(): T[] { return [...this.pool] }
  toString(): string { return JSON.stringify({ available: this.pool.length, created: this.totalCreated }) }
  toJSON(): Record<string, number> { return { available: this.pool.length, created: this.totalCreated } }

  clone(): ObjectPool2<T> {
    return new ObjectPool2(this.factory, this.reset, this.pool.length)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ObjectPool2)) return false
    return this.available === other.available
  }
}
