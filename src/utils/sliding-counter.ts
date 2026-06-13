export class SlidingCounter {
  private buckets: Map<number, number> = new Map()
  private bucketSize: number
  private numBuckets: number

  constructor(bucketSizeMs = 1000, numBuckets = 60) {
    this.bucketSize = bucketSizeMs
    this.numBuckets = numBuckets
  }

  increment(amount = 1, timestamp?: number): void {
    const bucket = this.bucketKey(timestamp ?? Date.now())
    this.buckets.set(bucket, (this.buckets.get(bucket) ?? 0) + amount)
  }

  sum(): number {
    this.trim()
    let total = 0
    for (const v of this.buckets.values()) total += v
    return total
  }

  rate(): number {
    return this.sum() / (this.numBuckets * this.bucketSize / 1000)
  }

  get isEmpty(): boolean { return this.sum() === 0 }

  private bucketKey(ts: number): number {
    return Math.floor(ts / this.bucketSize)
  }

  private trim(): void {
    const cutoff = this.bucketKey(Date.now()) - this.numBuckets
    for (const [key] of this.buckets) {
      if (key < cutoff) this.buckets.delete(key)
    }
  }

  clear(): void { this.buckets.clear() }

  toArray(): Array<[number, number]> {
    this.trim()
    return Array.from(this.buckets.entries())
  }

  toString(): string { return JSON.stringify({ sum: this.sum() }) }
  toJSON(): Record<string, number> { return { sum: this.sum() } }

  clone(): SlidingCounter {
    const c = new SlidingCounter(this.bucketSize, this.numBuckets)
    c.buckets = new Map(this.buckets)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SlidingCounter)) return false
    return this.bucketSize === other.bucketSize && this.numBuckets === other.numBuckets
  }
}
