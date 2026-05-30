export class StreamingQuantile {
  private samples: number[] = []
  private readonly maxSize: number

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize
  }

  push(value: number): void {
    if (this.samples.length >= this.maxSize) {
      const mid = this.samples.length >>> 1
      this.samples.splice(0, mid)
    }
    let lo = 0
    let hi = this.samples.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.samples[mid]! < value) lo = mid + 1
      else hi = mid
    }
    this.samples.splice(lo, 0, value)
  }

  quantile(q: number): number {
    if (this.samples.length === 0) return 0
    if (q <= 0) return this.samples[0]!
    if (q >= 1) return this.samples[this.samples.length - 1]!
    const idx = q * (this.samples.length - 1)
    const lo = Math.floor(idx)
    const hi = Math.ceil(idx)
    if (lo === hi) return this.samples[lo]!
    return this.samples[lo]! * (hi - idx) + this.samples[hi]! * (idx - lo)
  }

  median(): number {
    return this.quantile(0.5)
  }

  p90(): number {
    return this.quantile(0.9)
  }

  p95(): number {
    return this.quantile(0.95)
  }

  p99(): number {
    return this.quantile(0.99)
  }

  min(): number {
    if (this.samples.length === 0) return 0
    return this.samples[0]!
  }

  max(): number {
    if (this.samples.length === 0) return 0
    return this.samples[this.samples.length - 1]!
  }

  get count(): number {
    return this.samples.length
  }

  get capacity(): number {
    return this.maxSize
  }
}
