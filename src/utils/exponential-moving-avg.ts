export class ExponentialMovingAvg {
  private value: number
  private alpha: number
  private initialized = false
  private _count = 0

  constructor(alpha: number) {
    this.alpha = alpha
    this.value = 0
  }

  update(val: number): void {
    if (!this.initialized) { this.value = val; this.initialized = true }
    else this.value = this.alpha * val + (1 - this.alpha) * this.value
    this._count++
  }

  get current(): number { return this.value }
  get count(): number { return this._count }
  get isEmpty(): boolean { return !this.initialized }

  clear(): void { this.value = 0; this.initialized = false; this._count = 0 }

  toArray(): number[] { return [this.value] }
  toString(): string { return JSON.stringify({ value: this.value, alpha: this.alpha }) }
  toJSON(): Record<string, number> { return { value: this.value, alpha: this.alpha, count: this._count } }

  clone(): ExponentialMovingAvg {
    const c = new ExponentialMovingAvg(this.alpha)
    c.value = this.value
    c.initialized = this.initialized
    c._count = this._count
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ExponentialMovingAvg)) return false
    return this.alpha === other.alpha && this._count === other._count
  }
}
