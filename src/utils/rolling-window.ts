export class RollingWindow {
  private values: number[]
  private index = 0
  private filled = false

  constructor(private windowSize: number) {
    this.values = new Array(windowSize).fill(0)
  }

  push(value: number): void {
    this.values[this.index] = value
    this.index = (this.index + 1) % this.windowSize
    if (this.index === 0) this.filled = true
  }

  get sum(): number {
    const count = this.count
    let s = 0
    for (let i = 0; i < count; i++) s += this.values[i]!
    return s
  }

  get mean(): number {
    const count = this.count
    return count > 0 ? this.sum / count : 0
  }

  get min(): number {
    const count = this.count
    if (count === 0) return 0
    let m = Infinity
    for (let i = 0; i < count; i++) m = Math.min(m, this.values[i]!)
    return m
  }

  get max(): number {
    const count = this.count
    if (count === 0) return 0
    let m = -Infinity
    for (let i = 0; i < count; i++) m = Math.max(m, this.values[i]!)
    return m
  }

  get count(): number {
    return this.filled ? this.windowSize : this.index
  }

  get isEmpty(): boolean {
    return this.index === 0 && !this.filled
  }

  get isFull(): boolean {
    return this.filled
  }

  variance(): number {
    const count = this.count
    if (count < 2) return 0
    const m = this.mean
    let ss = 0
    for (let i = 0; i < count; i++) ss += (this.values[i]! - m) ** 2
    return ss / (count - 1)
  }

  stddev(): number {
    return Math.sqrt(this.variance())
  }

  clear(): void {
    this.values.fill(0)
    this.index = 0
    this.filled = false
  }

  toArray(): number[] {
    const result: number[] = []
    const count = this.count
    const start = this.filled ? this.index : 0
    for (let i = 0; i < count; i++) {
      result.push(this.values[(start + i) % this.windowSize]!)
    }
    return result
  }

  toString(): string {
    return JSON.stringify({ count: this.count, mean: this.mean, size: this.windowSize })
  }

  toJSON(): Record<string, unknown> {
    return { count: this.count, mean: this.mean, min: this.min, max: this.max, size: this.windowSize }
  }

  clone(): RollingWindow {
    const copy = new RollingWindow(this.windowSize)
    copy.values = [...this.values]
    copy.index = this.index
    copy.filled = this.filled
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RollingWindow)) return false
    return this.count === other.count && this.windowSize === other.windowSize
  }
}
