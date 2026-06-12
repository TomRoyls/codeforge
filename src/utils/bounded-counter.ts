export class BoundedCounter {
  private counts = new Map<string, number>()
  private maxSize: number
  private total = 0

  constructor(maxSize = 1000) {
    if (maxSize < 1) throw new RangeError('maxSize must be >= 1')
    this.maxSize = maxSize
  }

  increment(key: string, amount = 1): void {
    const current = this.counts.get(key) ?? 0
    this.counts.set(key, current + amount)
    this.total += amount
    this.evictIfNeeded()
  }

  decrement(key: string, amount = 1): void {
    const current = this.counts.get(key)
    if (current === undefined) return
    const newVal = current - amount
    if (newVal <= 0) {
      this.counts.delete(key)
      this.total -= current
    } else {
      this.counts.set(key, newVal)
      this.total -= amount
    }
  }

  get(key: string): number {
    return this.counts.get(key) ?? 0
  }

  has(key: string): boolean {
    return this.counts.has(key)
  }

  get size(): number {
    return this.counts.size
  }

  get totalCount(): number {
    return this.total
  }

  get capacity(): number {
    return this.maxSize
  }

  top(n: number): Array<[string, number]> {
    return Array.from(this.counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
  }

  bottom(n: number): Array<[string, number]> {
    return Array.from(this.counts.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, n)
  }

  delete(key: string): boolean {
    const val = this.counts.get(key)
    if (val === undefined) return false
    this.total -= val
    this.counts.delete(key)
    return true
  }

  clear(): void {
    this.counts.clear()
    this.total = 0
  }

  toArray(): Array<[string, number]> {
    return Array.from(this.counts.entries())
  }

  toString(): string {
    return JSON.stringify(Object.fromEntries(this.counts))
  }

  toJSON(): Record<string, number> {
    return Object.fromEntries(this.counts)
  }

  clone(): BoundedCounter {
    const copy = new BoundedCounter(this.maxSize)
    copy.counts = new Map(this.counts)
    copy.total = this.total
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BoundedCounter)) return false
    if (this.size !== other.size) return false
    if (this.total !== other.total) return false
    for (const [key, val] of this.counts) {
      if (other.counts.get(key) !== val) return false
    }
    return true
  }

  private evictIfNeeded(): void {
    while (this.counts.size > this.maxSize) {
      let minKey = ''
      let minVal = Infinity
      for (const [key, val] of this.counts) {
        if (val < minVal) {
          minVal = val
          minKey = key
        }
      }
      if (minKey) {
        this.total -= minVal
        this.counts.delete(minKey)
      }
    }
  }
}
