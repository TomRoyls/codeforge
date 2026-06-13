export class ObjectPoolTyped<T extends object> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void
  private created = 0

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 0) {
    this.factory = factory
    this.reset = reset
    for (let i = 0; i < initialSize; i++) this.pool.push(this.factory())
    this.created = initialSize
  }

  acquire(): T {
    if (this.pool.length > 0) return this.pool.pop()!
    this.created++
    return this.factory()
  }

  release(obj: T): void {
    this.reset(obj)
    this.pool.push(obj)
  }

  get available(): number { return this.pool.length }
  get totalCreated(): number { return this.created }
  get isEmpty(): boolean { return this.pool.length === 0 }

  clear(): void { this.pool = [] }

  toArray(): T[] { return [...this.pool] }
  toString(): string { return JSON.stringify({ available: this.available, totalCreated: this.totalCreated }) }
  toJSON(): Record<string, number> { return { available: this.available, totalCreated: this.totalCreated } }

  clone(): ObjectPoolTyped<T> {
    const c = new ObjectPoolTyped(this.factory, this.reset)
    c.created = this.created
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ObjectPoolTyped)) return false
    return this.totalCreated === other.totalCreated
  }
}
