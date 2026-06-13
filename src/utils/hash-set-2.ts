export class HashSet2<T> {
  private items = new Set<T>()

  add(item: T): void { this.items.add(item) }
  has(item: T): boolean { return this.items.has(item) }
  delete(item: T): boolean { return this.items.delete(item) }

  union(other: HashSet2<T>): HashSet2<T> {
    const result = new HashSet2<T>()
    for (const item of this.items) result.add(item)
    for (const item of other.items) result.add(item)
    return result
  }

  intersection(other: HashSet2<T>): HashSet2<T> {
    const result = new HashSet2<T>()
    for (const item of this.items) {
      if (other.has(item)) result.add(item)
    }
    return result
  }

  difference(other: HashSet2<T>): HashSet2<T> {
    const result = new HashSet2<T>()
    for (const item of this.items) {
      if (!other.has(item)) result.add(item)
    }
    return result
  }

  isSubsetOf(other: HashSet2<T>): boolean {
    for (const item of this.items) {
      if (!other.has(item)) return false
    }
    return true
  }

  get size(): number { return this.items.size }
  get isEmpty(): boolean { return this.items.size === 0 }

  clear(): void { this.items.clear() }

  toArray(): T[] { return Array.from(this.items) }
  toString(): string { return JSON.stringify({ size: this.items.size }) }
  toJSON(): Record<string, number> { return { size: this.items.size } }

  clone(): HashSet2<T> {
    const c = new HashSet2<T>()
    for (const item of this.items) c.add(item)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HashSet2)) return false
    return this.size === other.size
  }

  forEach(fn: (item: T) => void): void {
    this.items.forEach(fn)
  }
}
