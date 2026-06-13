export class UniqueCounter {
  private seen = new Set<number>()
  private total = 0

  add(value: number): void {
    if (!this.seen.has(value)) {
      this.seen.add(value)
      this.total++
    }
  }

  has(value: number): boolean { return this.seen.has(value) }

  remove(value: number): boolean {
    if (this.seen.delete(value)) { this.total--; return true }
    return false
  }

  get count(): number { return this.total }
  get isEmpty(): boolean { return this.total === 0 }

  clear(): void { this.seen.clear(); this.total = 0 }

  toArray(): number[] { return Array.from(this.seen).sort((a, b) => a - b) }
  toString(): string { return JSON.stringify({ unique: this.total }) }
  toJSON(): Record<string, number> { return { unique: this.total } }

  clone(): UniqueCounter {
    const c = new UniqueCounter()
    for (const v of this.seen) c.add(v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof UniqueCounter)) return false
    return this.count === other.count
  }

  union(other: UniqueCounter): UniqueCounter {
    const result = new UniqueCounter()
    for (const v of this.seen) result.add(v)
    for (const v of other.seen) result.add(v)
    return result
  }

  intersection(other: UniqueCounter): UniqueCounter {
    const result = new UniqueCounter()
    for (const v of this.seen) if (other.has(v)) result.add(v)
    return result
  }
}
