export class Histogram1D {
  private bins: number[]
  private _min: number
  private _max: number
  private binWidth: number
  private _count = 0

  constructor(bins = 10, min = 0, max = 1) {
    this._min = min
    this._max = max
    this.bins = new Array(bins).fill(0)
    this.binWidth = (max - min) / bins
  }

  add(value: number): boolean {
    if (value < this._min || value >= this._max) return false
    const idx = Math.floor((value - this._min) / this.binWidth)
    if (idx < 0 || idx >= this.bins.length) return false
    this.bins[idx]!++
    this._count++
    return true
  }

  getBin(index: number): number {
    return this.bins[index] ?? 0
  }

  get binCount(): number {
    return this.bins.length
  }

  get count(): number {
    return this._count
  }

  get isEmpty(): boolean {
    return this._count === 0
  }

  get mean(): number {
    if (this._count === 0) return 0
    let sum = 0
    for (let i = 0; i < this.bins.length; i++) {
      const midpoint = this._min + (i + 0.5) * this.binWidth
      sum += midpoint * this.bins[i]!
    }
    return sum / this._count
  }

  get mode(): number {
    let maxBin = 0
    let maxCount = 0
    for (let i = 0; i < this.bins.length; i++) {
      if (this.bins[i]! > maxCount) {
        maxCount = this.bins[i]!
        maxBin = i
      }
    }
    return this._min + (maxBin + 0.5) * this.binWidth
  }

  normalize(): number[] {
    if (this._count === 0) return this.bins.map(() => 0)
    return this.bins.map((b) => b / this._count)
  }

  clear(): void {
    this.bins.fill(0)
    this._count = 0
  }

  toArray(): number[] {
    return [...this.bins]
  }

  toString(): string {
    return JSON.stringify({ count: this._count, bins: this.bins })
  }

  toJSON(): Record<string, unknown> {
    return { count: this._count, min: this._min, max: this._max, bins: this.bins }
  }

  clone(): Histogram1D {
    const copy = new Histogram1D(this.bins.length, this._min, this._max)
    copy.bins = [...this.bins]
    copy._count = this._count
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Histogram1D)) return false
    return this._count === other._count
  }
}
