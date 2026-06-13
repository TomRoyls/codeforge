export class FrequentItemSet {
  private counters = new Map<string, number>()
  private capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
  }

  add(item: string): void {
    if (this.counters.has(item)) {
      this.counters.set(item, this.counters.get(item)! + 1)
    } else if (this.counters.size < this.capacity) {
      this.counters.set(item, 1)
    } else {
      for (const [k] of this.counters) {
        const v = this.counters.get(k)! - 1
        if (v <= 0) this.counters.delete(k)
        else this.counters.set(k, v)
      }
    }
  }

  get(item: string): number { return this.counters.get(item) ?? 0 }

  top(n: number): Array<{ item: string; count: number }> {
    return Array.from(this.counters.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([item, count]) => ({ item, count }))
  }

  get size(): number { return this.counters.size }
  get isEmpty(): boolean { return this.counters.size === 0 }

  clear(): void { this.counters.clear() }

  toArray(): Array<{ item: string; count: number }> { return this.top(this.capacity) }
  toString(): string { return JSON.stringify({ capacity: this.capacity, tracked: this.counters.size }) }
  toJSON(): Record<string, number> { return { capacity: this.capacity, tracked: this.counters.size } }

  clone(): FrequentItemSet {
    const c = new FrequentItemSet(this.capacity)
    for (const [k, v] of this.counters) c.counters.set(k, v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof FrequentItemSet)) return false
    return this.capacity === other.capacity && this.size === other.size
  }
}
