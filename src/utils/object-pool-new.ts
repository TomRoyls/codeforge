export class ObjectPoolNew<T> {
  private available: T[] = []
  private inUse = new Set<T>()
  private factory: () => T
  private resetFn: (item: T) => void

  constructor(factory: () => T, resetFn: (item: T) => void, initialSize = 0) {
    this.factory = factory
    this.resetFn = resetFn
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory())
    }
  }

  acquire(): T {
    const item = this.available.length > 0 ? this.available.pop()! : this.factory()
    this.inUse.add(item)
    return item
  }

  release(item: T): boolean {
    if (!this.inUse.has(item)) return false
    this.inUse.delete(item)
    this.resetFn(item)
    this.available.push(item)
    return true
  }

  get availableCount(): number {
    return this.available.length
  }

  get inUseCount(): number {
    return this.inUse.size
  }

  get totalCount(): number {
    return this.available.length + this.inUse.size
  }

  clear(): void {
    this.available = []
    this.inUse.clear()
  }

  toString(): string {
    return JSON.stringify({ available: this.availableCount, inUse: this.inUseCount })
  }

  toJSON(): Record<string, number> {
    return { available: this.availableCount, inUse: this.inUseCount, total: this.totalCount }
  }

  clone(): ObjectPoolNew<T> {
    const copy = new ObjectPoolNew<T>(this.factory, this.resetFn)
    copy.available = [...this.available]
    for (const item of this.inUse) copy.inUse.add(item)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ObjectPoolNew)) return false
    return this.totalCount === other.totalCount
  }
}
