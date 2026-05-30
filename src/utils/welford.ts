export class Welford {
  private count = 0
  private mean = 0
  private m2 = 0

  get n(): number {
    return this.count
  }

  get meanValue(): number {
    return this.count === 0 ? 0 : this.mean
  }

  get variance(): number {
    if (this.count < 2) return 0
    return this.m2 / this.count
  }

  get sampleVariance(): number {
    if (this.count < 2) return 0
    return this.m2 / (this.count - 1)
  }

  get stdDev(): number {
    return Math.sqrt(this.variance)
  }

  get sampleStdDev(): number {
    return Math.sqrt(this.sampleVariance)
  }

  get isEmpty(): boolean {
    return this.count === 0
  }

  update(value: number): void {
    this.count++
    const delta = value - this.mean
    this.mean += delta / this.count
    const delta2 = value - this.mean
    this.m2 += delta * delta2
  }

  addBatch(values: Iterable<number>): void {
    for (const v of values) {
      this.update(v)
    }
  }

  merge(other: Welford): void {
    if (other.count === 0) return
    const combinedCount = this.count + other.count
    const delta = other.mean - this.mean
    const combinedMean = (this.count * this.mean + other.count * other.mean) / combinedCount
    const combinedM2 = this.m2 + other.m2 + delta * delta * this.count * other.count / combinedCount
    this.count = combinedCount
    this.mean = combinedMean
    this.m2 = combinedM2
  }

  reset(): void {
    this.count = 0
    this.mean = 0
    this.m2 = 0
  }

  static fromArray(values: number[]): Welford {
    const w = new Welford()
    w.addBatch(values)
    return w
  }
}
