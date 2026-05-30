export class MovingAverage {
  private window: number[]
  private maxSize: number
  private sum: number = 0
  private _frontIdx: number = 0

  constructor(windowSize: number = 10) {
    this.maxSize = windowSize
    this.window = []
  }

  push(value: number): void {
    if (this.window.length - this._frontIdx >= this.maxSize) {
      const removed = this.window[this._frontIdx]!
      this._frontIdx++
      this.sum -= removed
      this._maybeCompact()
    }
    this.window.push(value)
    this.sum += value
  }

  private _maybeCompact(): void {
    if (this._frontIdx > 16 && this._frontIdx > (this.window.length >> 1)) {
      this.window = this.window.slice(this._frontIdx)
      this._frontIdx = 0
    }
  }

  private _effectiveWindow(): number[] {
    return this.window.slice(this._frontIdx)
  }

  get average(): number {
    const len = this.window.length - this._frontIdx
    if (len === 0) return 0
    return this.sum / len
  }

  get min(): number {
    const w = this._effectiveWindow()
    if (w.length === 0) return 0
    return Math.min(...w)
  }

  get max(): number {
    const w = this._effectiveWindow()
    if (w.length === 0) return 0
    return Math.max(...w)
  }

  get variance(): number {
    const w = this._effectiveWindow()
    if (w.length === 0) return 0
    const avg = this.average
    let sumSq = 0
    for (const v of w) {
      sumSq += (v - avg) * (v - avg)
    }
    return sumSq / w.length
  }

  get stddev(): number {
    return Math.sqrt(this.variance)
  }

  get size(): number {
    return this.window.length - this._frontIdx
  }

  get windowSize(): number {
    return this.maxSize
  }

  reset(): void {
    this.window = []
    this._frontIdx = 0
    this.sum = 0
  }

  toArray(): number[] {
    return this._effectiveWindow()
  }
}
