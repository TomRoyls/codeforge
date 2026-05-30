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
}
