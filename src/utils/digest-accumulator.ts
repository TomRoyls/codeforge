export class DigestAccumulator {
  private count = 0
  private sum = 0
  private sumSq = 0
  private _min = Infinity
  private _max = -Infinity

  add(value: number): void {
    this.count++
    this.sum += value
    this.sumSq += value * value
    this._min = Math.min(this._min, value)
    this._max = Math.max(this._max, value)
  }

  get mean(): number {
    return this.count > 0 ? this.sum / this.count : 0
  }

  get variance(): number {
    if (this.count < 2) return 0
    return (this.sumSq - (this.sum * this.sum) / this.count) / (this.count - 1)
  }

  get stddev(): number {
    return Math.sqrt(this.variance)
  }

  get min(): number {
    return this.count > 0 ? this._min : 0
  }

  get max(): number {
    return this.count > 0 ? this._max : 0
  }

  get total(): number {
    return this.sum
  }

  get size(): number {
    return this.count
  }

  get isEmpty(): boolean {
    return this.count === 0
  }

  merge(other: DigestAccumulator): void {
    this.count += other.count
    this.sum += other.sum
    this.sumSq += other.sumSq
    this._min = Math.min(this._min, other._min)
    this._max = Math.max(this._max, other._max)
  }

  clear(): void {
    this.count = 0
    this.sum = 0
    this.sumSq = 0
    this._min = Infinity
    this._max = -Infinity
  }

  toString(): string {
    return JSON.stringify({ count: this.count, mean: this.mean, min: this.min, max: this.max })
  }

  toJSON(): Record<string, unknown> {
    return { count: this.count, mean: this.mean, stddev: this.stddev, min: this.min, max: this.max, total: this.sum }
  }

  clone(): DigestAccumulator {
    const copy = new DigestAccumulator()
    copy.count = this.count
    copy.sum = this.sum
    copy.sumSq = this.sumSq
    copy._min = this._min
    copy._max = this._max
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DigestAccumulator)) return false
    return this.count === other.count && this.sum === other.sum
  }
}
