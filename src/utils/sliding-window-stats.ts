export class SlidingWindowStats {
  private readonly window: number[] = []
  private readonly maxSize: number
  private _sum = 0
  private _sumSq = 0

  constructor(windowSize: number) {
    if (windowSize < 1) throw new RangeError('windowSize must be >= 1')
    this.maxSize = windowSize
  }

  push(value: number): void {
    this.window.push(value)
    this._sum += value
    this._sumSq += value * value
    if (this.window.length > this.maxSize) {
      const old = this.window.shift()!
      this._sum -= old
      this._sumSq -= old * old
    }
  }

  get mean(): number {
    if (this.window.length === 0) return 0
    return this._sum / this.window.length
  }

  get variance(): number {
    const n = this.window.length
    if (n < 2) return 0
    return (this._sumSq - (this._sum * this._sum) / n) / (n - 1)
  }

  get stddev(): number {
    return Math.sqrt(this.variance)
  }

  get min(): number {
    if (this.window.length === 0) return 0
    return Math.min(...this.window)
  }

  get max(): number {
    if (this.window.length === 0) return 0
    return Math.max(...this.window)
  }

  get count(): number {
    return this.window.length
  }

  get isFull(): boolean {
    return this.window.length === this.maxSize
  }

  get total(): number {
    return this._sum
  }

  clear(): void {
    this.window.length = 0
    this._sum = 0
    this._sumSq = 0
  }

  toArray(): number[] {
    return [...this.window]
  }
}
