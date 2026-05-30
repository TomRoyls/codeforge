interface HeavyKeeperEntry {
  key: string
  count: number
}

export class HeavyKeeper {
  private buckets: HeavyKeeperEntry[][]
  private decay: number
  private depth: number
  private width: number
  private total_: number

  constructor(options: { depth?: number; width?: number; decay?: number } = {}) {
    this.depth = options.depth ?? 4
    this.width = options.width ?? 256
    this.decay = options.decay ?? 0.9
    this.total_ = 0

    if (this.depth < 1 || this.width < 1) {
      throw new RangeError(`depth and width must be >= 1, got depth=${this.depth}, width=${this.width}`)
    }
    if (this.decay <= 0 || this.decay >= 1) {
      throw new RangeError(`decay must be in (0, 1), got ${this.decay}`)
    }

    this.buckets = []
    for (let i = 0; i < this.depth; i++) {
      const row: HeavyKeeperEntry[] = []
      for (let j = 0; j < this.width; j++) {
        row.push({ key: '', count: 0 })
      }
      this.buckets.push(row)
    }
  }

  private hash(row: number, key: string): number {
    let h = (row + 1) * 2654435761
    for (let i = 0; i < key.length; i++) {
      h = Math.imul(h ^ key.charCodeAt(i), 2654435761)
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    return ((h ^ (h >>> 13)) >>> 0) % this.width
  }

  update(key: string, count: number = 1): void {
    if (count <= 0) return
    this.total_ += count

    for (let i = 0; i < this.depth; i++) {
      const col = this.hash(i, key)
      const bucket = this.buckets[i]![col]!

      if (bucket.count === 0) {
        bucket.key = key
        bucket.count = count
      } else if (bucket.key === key) {
        bucket.count += count
      } else {
        const prob = Math.pow(this.decay, bucket.count)
        if (Math.random() < prob) {
          bucket.count--
          if (bucket.count <= 0) {
            bucket.key = key
            bucket.count = count
          }
        }
      }
    }
  }

  estimate(key: string): number {
    let maxCount = 0
    for (let i = 0; i < this.depth; i++) {
      const col = this.hash(i, key)
      const bucket = this.buckets[i]![col]!
      if (bucket.key === key && bucket.count > maxCount) {
        maxCount = bucket.count
      }
    }
    return maxCount
  }

  heavyHitters(threshold: number): Array<{ key: string; count: number }> {
    if (threshold < 0 || threshold > 1) {
      throw new RangeError(`threshold must be in [0, 1], got ${threshold}`)
    }

    const seen = new Map<string, number>()

    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        const bucket = this.buckets[i]![j]!
        if (bucket.count > 0 && bucket.key !== '') {
          const current = seen.get(bucket.key) ?? 0
          if (bucket.count > current) {
            seen.set(bucket.key, bucket.count)
          }
        }
      }
    }

    const results: Array<{ key: string; count: number }> = []
    for (const [key, count] of seen) {
      if (this.total_ > 0 && count / this.total_ >= threshold) {
        results.push({ key, count })
      }
    }

    results.sort((a, b) => b.count - a.count)
    return results
  }

  top(k: number): Array<{ key: string; count: number }> {
    const seen = new Map<string, number>()

    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        const bucket = this.buckets[i]![j]!
        if (bucket.count > 0 && bucket.key !== '') {
          const current = seen.get(bucket.key) ?? 0
          if (bucket.count > current) {
            seen.set(bucket.key, bucket.count)
          }
        }
      }
    }

    const all = Array.from(seen.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)

    return all.slice(0, k)
  }

  get total(): number {
    return this.total_
  }

  get size(): number {
    return this.depth * this.width
  }

  isEmpty(): boolean {
    return this.total_ === 0
  }

  reset(): void {
    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        this.buckets[i]![j]!.key = ''
        this.buckets[i]![j]!.count = 0
      }
    }
    this.total_ = 0
  }

  static fromItems(
    items: string[],
    options?: { depth?: number; width?: number; decay?: number },
  ): HeavyKeeper {
    const hk = new HeavyKeeper(options)
    for (const item of items) {
      hk.update(item)
    }
    return hk
  }
}
