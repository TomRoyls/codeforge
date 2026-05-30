export class TopK2<T> {
  private counts: Map<string, { item: T; count: number }> = new Map()
  private k: number

  constructor(k: number = 10) {
    this.k = k
  }

  add(item: T, count: number = 1): void {
    const key = this.key(item)
    const existing = this.counts.get(key)
    if (existing) {
      existing.count += count
    } else if (this.counts.size < this.k) {
      this.counts.set(key, { item, count })
    } else {
      let minKey = ''
      let minCount = Infinity
      for (const [k, v] of this.counts) {
        if (v.count < minCount) {
          minCount = v.count
          minKey = k
        }
      }
      if (count > minCount) {
        this.counts.delete(minKey)
        this.counts.set(key, { item, count })
      }
    }
  }

  top(): Array<{ item: T; count: number }> {
    return Array.from(this.counts.values())
      .sort((a, b) => b.count - a.count)
  }

  get size(): number {
    return this.counts.size
  }

  get capacity(): number {
    return this.k
  }

  reset(): void {
    this.counts.clear()
  }

  private key(item: T): string {
    return JSON.stringify(item)
  }
}
