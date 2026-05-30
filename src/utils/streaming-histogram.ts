export class StreamingHistogram {
  private bins: Map<number, number> = new Map()
  private _size: number = 0

  constructor(private maxBins: number = 100) {}

  add(value: number): void {
    const key = value
    this.bins.set(key, (this.bins.get(key) ?? 0) + 1)
    this._size++
    if (this.bins.size > this.maxBins) {
      this.compress()
    }
  }

  quantile(q: number): number {
    if (this._size === 0) return 0
    const target = q * this._size
    let cumulative = 0
    const sorted = Array.from(this.bins.entries()).sort((a, b) => a[0] - b[0])
    for (const [value, count] of sorted) {
      cumulative += count
      if (cumulative >= target) return value
    }
    return sorted[sorted.length - 1]![0]
  }

  get min(): number {
    if (this._size === 0) return 0
    return Math.min(...this.bins.keys())
  }

  get max(): number {
    if (this._size === 0) return 0
    return Math.max(...this.bins.keys())
  }

  get mean(): number {
    if (this._size === 0) return 0
    let sum = 0
    for (const [value, count] of this.bins) {
      sum += value * count
    }
    return sum / this._size
  }

  get count(): number {
    return this._size
  }

  get binCount(): number {
    return this.bins.size
  }

  reset(): void {
    this.bins.clear()
    this._size = 0
  }

  private compress(): void {
    const sorted = Array.from(this.bins.entries()).sort((a, b) => a[0] - b[0])
    let minGap = Infinity
    let mergeIdx = 0
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1]![0] - sorted[i]![0]
      if (gap < minGap) {
        minGap = gap
        mergeIdx = i
      }
    }
    const a = sorted[mergeIdx]!
    const b = sorted[mergeIdx + 1]!
    const totalCount = a[1] + b[1]
    const mergedKey = (a[0] * a[1] + b[0] * b[1]) / totalCount
    this.bins.delete(a[0])
    this.bins.delete(b[0])
    this.bins.set(mergedKey, totalCount)
  }
}
