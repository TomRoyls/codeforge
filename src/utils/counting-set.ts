export class CountingSet<T> {
  private counts = new Map<T, number>()

  add(item: T): void {
    this.counts.set(item, (this.counts.get(item) ?? 0) + 1)
  }

  count(item: T): number {
    return this.counts.get(item) ?? 0
  }

  has(item: T): boolean {
    return (this.counts.get(item) ?? 0) > 0
  }

  remove(item: T): boolean {
    if (!this.counts.has(item)) return false
    const c = this.counts.get(item)! - 1
    if (c <= 0) this.counts.delete(item)
    else this.counts.set(item, c)
    return true
  }

  removeAll(item: T): boolean {
    return this.counts.delete(item)
  }

  get size(): number {
    let total = 0
    for (const c of this.counts.values()) total += c
    return total
  }

  get uniqueSize(): number {
    return this.counts.size
  }

  get isEmpty(): boolean {
    return this.counts.size === 0
  }

  entries(): Array<[T, number]> {
    return Array.from(this.counts.entries())
  }

  clear(): void { this.counts.clear() }

  toArray(): T[] {
    const result: T[] = []
    for (const [item, count] of this.counts) {
      for (let i = 0; i < count; i++) result.push(item)
    }
    return result
  }

  toString(): string { return JSON.stringify(Object.fromEntries(this.counts)) }
  toJSON(): Record<string, number> { return Object.fromEntries(this.counts as Map<string, number>) }

  clone(): CountingSet<T> {
    const copy = new CountingSet<T>()
    copy.counts = new Map(this.counts)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CountingSet)) return false
    if (this.counts.size !== other.counts.size) return false
    for (const [k, v] of this.counts) {
      if (other.counts.get(k) !== v) return false
    }
    return true
  }
}
