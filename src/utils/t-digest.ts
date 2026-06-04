interface Centroid {
  mean: number
  weight: number
}

export class TDigest {
  private centroids: Centroid[]
  private totalWeight_: number
  private maxCentroids: number
  private min_: number
  private max_: number
  private buffer: number[]
  private bufferSize: number

  constructor(options?: { maxCentroids?: number }) {
    this.maxCentroids = options?.maxCentroids ?? 100
    this.centroids = []
    this.totalWeight_ = 0
    this.min_ = Infinity
    this.max_ = -Infinity
    this.buffer = []
    this.bufferSize = this.maxCentroids * 5
  }

  push(value: number): void {
    if (!Number.isFinite(value)) return
    if (value < this.min_) this.min_ = value
    if (value > this.max_) this.max_ = value

    this.buffer.push(value)
    if (this.buffer.length >= this.bufferSize) {
      this.flush()
    }
  }

  pushBatch(values: number[]): void {
    for (const v of values) {
      this.push(v)
    }
  }

  private flush(): void {
    if (this.buffer.length === 0) return

    const newCentroids: Centroid[] = this.buffer.map(v => ({ mean: v, weight: 1 }))
    this.buffer = []

    const all = [...this.centroids, ...newCentroids]
    all.sort((a, b) => a.mean - b.mean)

    if (all.length === 0) return

    this.centroids = this.compress(all)
    this.totalWeight_ = this.centroids.reduce((sum, c) => sum + c.weight, 0)
  }

  private compress(sorted: Centroid[]): Centroid[] {
    if (sorted.length <= this.maxCentroids) return sorted

    const totalWeight = sorted.reduce((sum, c) => sum + c.weight, 0)
    const result: Centroid[] = []
    let current = { ...sorted[0]! }
    let weightSoFar = 0

    for (let i = 1; i < sorted.length; i++) {
      const c = sorted[i]!
      const proposedWeight = current.weight + c.weight
      const q = (weightSoFar + proposedWeight / 2) / totalWeight
      const limit = 4 * totalWeight * q * (1 - q) / this.maxCentroids

      if (proposedWeight <= Math.max(limit, 1)) {
        current.weight += c.weight
        current.mean = (current.mean * (current.weight - c.weight) + c.mean * c.weight) / current.weight
      } else {
        weightSoFar += current.weight
        result.push(current)
        current = { ...c }
      }
    }
    result.push(current)

    return result
  }

  quantile(q: number): number {
    if (q < 0 || q > 1) return NaN
    if (this.centroids.length === 0 && this.buffer.length === 0) return NaN

    this.flush()

    if (this.centroids.length === 0) return NaN
    if (this.centroids.length === 1) return this.centroids[0]!.mean

    if (q <= 0) return this.min_
    if (q >= 1) return this.max_

    const totalWeight = this.totalWeight_
    let cumulativeWeight = 0

    for (let i = 0; i < this.centroids.length; i++) {
      const c = this.centroids[i]!
      if (cumulativeWeight + c.weight >= q * totalWeight) {
        const delta = i === 0
          ? (this.centroids.length > 1 ? this.centroids[1]!.mean - c.mean : 1)
          : i === this.centroids.length - 1
            ? c.mean - this.centroids[i - 1]!.mean
            : (this.centroids[i + 1]!.mean - this.centroids[i - 1]!.mean) / 2

        const innerQ = (q * totalWeight - cumulativeWeight) / c.weight
        return c.mean + (innerQ - 0.5) * delta
      }

      cumulativeWeight += c.weight
    }

    return this.max_
  }

  percentile(p: number): number {
    return this.quantile(p / 100)
  }

  cdf(value: number): number {
    this.flush()

    if (this.centroids.length === 0) return NaN
    if (value <= this.min_) return 0
    if (value >= this.max_) return 1

    const totalWeight = this.totalWeight_
    let cumulativeWeight = 0

    for (let i = 0; i < this.centroids.length; i++) {
      const c = this.centroids[i]!

      if (i === this.centroids.length - 1 || value < this.centroids[i + 1]!.mean) {
        const delta = i === 0
          ? (this.centroids.length > 1 ? this.centroids[1]!.mean - c.mean : 1)
          : i === this.centroids.length - 1
            ? c.mean - this.centroids[i - 1]!.mean
            : (this.centroids[i + 1]!.mean - this.centroids[i - 1]!.mean) / 2

        if (delta === 0) {
          return (cumulativeWeight + c.weight / 2) / totalWeight
        }

        const offset = (value - c.mean) / delta
        const innerCDF = 0.5 + offset * 0.5
        return (cumulativeWeight + c.weight * Math.min(1, Math.max(0, innerCDF))) / totalWeight
      }

      cumulativeWeight += c.weight
    }

    return 1
  }

  get mean(): number {
    this.flush()
    if (this.centroids.length === 0) return NaN
    let sumWeighted = 0
    let sumWeight = 0
    for (const c of this.centroids) {
      sumWeighted += c.mean * c.weight
      sumWeight += c.weight
    }
    return sumWeighted / sumWeight
  }

  get min(): number {
    this.flush()
    return this.min_ === Infinity ? NaN : this.min_
  }

  get max(): number {
    this.flush()
    return this.max_ === -Infinity ? NaN : this.max_
  }

  get size(): number {
    return this.totalWeight_ + this.buffer.length
  }

  get centroidCount(): number {
    return this.centroids.length
  }

  isEmpty(): boolean {
    return this.centroids.length === 0 && this.buffer.length === 0
  }

  merge(other: TDigest): TDigest {
    other.flush()
    this.flush()

    const result = new TDigest({ maxCentroids: Math.max(this.maxCentroids, other.maxCentroids) })
    result.min_ = Math.min(this.min_, other.min_)
    result.max_ = Math.max(this.max_, other.max_)

    const all = [...this.centroids, ...other.centroids]
    all.sort((a, b) => a.mean - b.mean)
    result.centroids = this.compress(all)
    result.totalWeight_ = result.centroids.reduce((sum, c) => sum + c.weight, 0)

    return result
  }

  reset(): void {
    this.centroids = []
    this.totalWeight_ = 0
    this.min_ = Infinity
    this.max_ = -Infinity
    this.buffer = []
  }

  toArray(): number[] {
    this.flush()
    const result: number[] = []
    for (const c of this.centroids) {
      for (let i = 0; i < c.weight; i++) {
        result.push(c.mean)
      }
    }
    return result
  }

  getCentroids(): Array<{ mean: number; weight: number }> {
    this.flush()
    return this.centroids.map(c => ({ mean: c.mean, weight: c.weight }))
  }

  static fromArray(data: number[], options?: { maxCentroids?: number }): TDigest {
    const td = new TDigest(options)
    td.pushBatch(data)
    td.flush()
    return td
  }
}
