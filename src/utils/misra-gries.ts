export class MisraGries<T> {
  private readonly counters: Map<T, number> = new Map()
  private readonly k: number

  constructor(topK: number) {
    if (topK < 1) throw new Error('topK must be at least 1')
    this.k = topK
  }

  process(item: T): void {
    if (this.counters.has(item)) {
      this.counters.set(item, this.counters.get(item)! + 1)
    } else if (this.counters.size < this.k) {
      this.counters.set(item, 1)
    } else {
      const keys = [...this.counters.keys()]
      for (const key of keys) {
        const val = this.counters.get(key)! - 1
        if (val === 0) {
          this.counters.delete(key)
        } else {
          this.counters.set(key, val)
        }
      }
    }
  }

  processBatch(items: Iterable<T>): void {
    for (const item of items) {
      this.process(item)
    }
  }

  top(): Array<{ item: T; count: number }> {
    return [...this.counters.entries()]
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
  }

  getCount(item: T): number {
    return this.counters.get(item) ?? 0
  }

  has(item: T): boolean {
    return this.counters.has(item)
  }

  get size(): number {
    return this.counters.size
  }

  reset(): void {
    this.counters.clear()
  }
}
