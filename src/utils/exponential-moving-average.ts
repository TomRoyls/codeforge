export class ExponentialMovingAverage {
  private ema: number | null = null
  private _count: number = 0
  private alpha: number

  constructor(alpha: number = 0.1) {
    if (alpha <= 0 || alpha > 1) throw new RangeError('alpha must be in (0, 1]')
    this.alpha = alpha
  }

  push(value: number): void {
    if (this.ema === null) {
      this.ema = value
    } else {
      this.ema = this.alpha * value + (1 - this.alpha) * this.ema
    }
    this._count++
  }

  get value(): number {
    return this.ema ?? 0
  }

  get count(): number {
    return this._count
  }

  reset(): void {
    this.ema = null
    this._count = 0
  }

  toString(): string {
    return `EMA(alpha=${this.alpha}, value=${this.value}, n=${this._count})`
  }

  toJSON(): { alpha: number; value: number; count: number } {
    return { alpha: this.alpha, value: this.value, count: this._count }
  }

  clone(): ExponentialMovingAverage {
    const copy = new ExponentialMovingAverage(this.alpha)
    copy.ema = this.ema
    copy._count = this._count
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ExponentialMovingAverage)) return false
    return this.alpha === other.alpha && this.value === other.value && this._count === other._count
  }
}

export class DoubleExponentialMovingAverage {
  private ema: ExponentialMovingAverage
  private ema2: ExponentialMovingAverage
  private lastEma: number | null = null

  constructor(alpha: number = 0.1) {
    this.ema = new ExponentialMovingAverage(alpha)
    this.ema2 = new ExponentialMovingAverage(alpha)
  }

  push(value: number): void {
    const prevEma = this.ema.value
    this.ema.push(value)
    this.ema2.push(this.ema.value)
    this.lastEma = prevEma
  }

  get level(): number {
    return 2 * this.ema.value - this.ema2.value
  }

  get trend(): number {
    if (this.lastEma === null) return 0
    return this.ema.value - this.ema2.value
  }

  forecast(steps: number = 1): number {
    return this.level + steps * this.trend
  }

  get count(): number {
    return this.ema.count
  }

  reset(): void {
    this.ema.reset()
    this.ema2.reset()
    this.lastEma = null
  }

  toString(): string {
    return `DEMA(level=${this.level}, trend=${this.trend}, n=${this.count})`
  }

  toJSON(): { level: number; trend: number; count: number } {
    return { level: this.level, trend: this.trend, count: this.count }
  }

  clone(): DoubleExponentialMovingAverage {
    const copy = new DoubleExponentialMovingAverage(this.ema['alpha'] ?? 0.1)
    copy.ema = this.ema.clone()
    copy.ema2 = this.ema2.clone()
    copy.lastEma = this.lastEma
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DoubleExponentialMovingAverage)) return false
    return this.level === other.level && this.trend === other.trend && this.count === other.count
  }
}
