export class QuantileEstimator {
  private values: number[] = []
  private maxSize: number

  constructor(maxSize = 10000) {
    this.maxSize = maxSize
  }

  add(value: number): void {
    const idx = this.binarySearch(value)
    this.values.splice(idx, 0, value)
    if (this.values.length > this.maxSize) {
      this.values.shift()
    }
  }

  private binarySearch(value: number): number {
    let lo = 0, hi = this.values.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.values[mid]! < value) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  quantile(p: number): number {
    if (this.values.length === 0) return 0
    const idx = Math.floor(p * (this.values.length - 1))
    return this.values[Math.min(idx, this.values.length - 1)]!
  }

  get median(): number { return this.quantile(0.5) }
  get p25(): number { return this.quantile(0.25) }
  get p75(): number { return this.quantile(0.75) }
  get p95(): number { return this.quantile(0.95) }
  get p99(): number { return this.quantile(0.99) }
  get min(): number { return this.values.length > 0 ? this.values[0]! : 0 }
  get max(): number { return this.values.length > 0 ? this.values[this.values.length - 1]! : 0 }

  get size(): number { return this.values.length }
  get isEmpty(): boolean { return this.values.length === 0 }

  clear(): void { this.values = [] }

  toArray(): number[] { return [...this.values] }
  toString(): string {
    return JSON.stringify({ size: this.size, median: this.median, p95: this.p95, p99: this.p99 })
  }
  toJSON(): Record<string, number> {
    return { size: this.size, min: this.min, p25: this.p25, median: this.median, p75: this.p75, p95: this.p95, p99: this.p99, max: this.max }
  }

  clone(): QuantileEstimator {
    const copy = new QuantileEstimator(this.maxSize)
    copy.values = [...this.values]
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof QuantileEstimator)) return false
    return this.size === other.size
  }
}
