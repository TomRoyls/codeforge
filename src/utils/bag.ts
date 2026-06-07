export class Bag<T> {
  private readonly counts: Map<T, number> = new Map()
  private _size = 0

  add(item: T, count = 1): void {
    if (count < 1) throw new Error('Count must be at least 1')
    this.counts.set(item, (this.counts.get(item) ?? 0) + count)
    this._size += count
  }

  remove(item: T, count = 1): boolean {
    const current = this.counts.get(item) ?? 0
    if (current < count) return false
    if (current === count) {
      this.counts.delete(item)
    } else {
      this.counts.set(item, current - count)
    }
    this._size -= count
    return true
  }

  count(item: T): number {
    return this.counts.get(item) ?? 0
  }

  contains(item: T): boolean {
    return this.counts.has(item)
  }

  uniqueSize(): number {
    return this.counts.size
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.counts.clear()
    this._size = 0
  }

  items(): T[] {
    return [...this.counts.keys()]
  }

  entries(): Array<[T, number]> {
    return [...this.counts.entries()]
  }

  toArray(): T[] {
    const result: T[] = []
    for (const [item, count] of this.counts) {
      for (let i = 0; i < count; i++) {
        result.push(item)
      }
    }
    return result
  }

  forEach(callback: (item: T, count: number) => void): void {
    for (const [item, count] of this.counts) {
      callback(item, count)
    }
  }

  union(other: Bag<T>): Bag<T> {
    const result = new Bag<T>()
    for (const [item, count] of this.counts) {
      result.add(item, count)
    }
    for (const [item, count] of other.counts) {
      const existing = result.count(item)
      if (count > existing) {
        result.add(item, count - existing)
      }
    }
    return result
  }

  intersect(other: Bag<T>): Bag<T> {
    const result = new Bag<T>()
    for (const [item, count] of this.counts) {
      const otherCount = other.count(item)
      if (otherCount > 0) {
        result.add(item, Math.min(count, otherCount))
      }
    }
    return result
  }

  toString(): string {
    const parts: string[] = []
    for (const [item, count] of this.counts) {
      parts.push(`${String(item)}×${count}`)
    }
    return `Bag([${parts.join(', ')}])`
  }

  toJSON(): Array<[T, number]> {
    return [...this.counts.entries()]
  }

  clone(): this {
    const c = new Bag<T>()
    for (const [item, count] of this.counts) {
      c.add(item, count)
    }
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Bag)) return false
    if (this._size !== other._size) return false
    if (this.counts.size !== other.counts.size) return false
    for (const [item, count] of this.counts) {
      const oc = other.counts.get(item)
      if (oc !== count) return false
    }
    return true
  }
}
