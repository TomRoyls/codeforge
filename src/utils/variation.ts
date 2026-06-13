export class Variation {
  private values: number[]

  constructor(values: number[]) {
    this.values = [...values]
  }

  mean(): number {
    if (this.values.length === 0) return 0
    return this.values.reduce((a, b) => a + b, 0) / this.values.length
  }

  variance(): number {
    if (this.values.length < 2) return 0
    const m = this.mean()
    return this.values.reduce((s, v) => s + (v - m) ** 2, 0) / (this.values.length - 1)
  }

  stddev(): number { return Math.sqrt(this.variance()) }

  coefficientOfVariation(): number {
    const m = this.mean()
    return m === 0 ? 0 : this.stddev() / m
  }

  range(): number { return this.max() - this.min() }

  min(): number { return this.values.length === 0 ? 0 : Math.min(...this.values) }
  max(): number { return this.values.length === 0 ? 0 : Math.max(...this.values) }

  get size(): number { return this.values.length }
  get isEmpty(): boolean { return this.values.length === 0 }

  add(val: number): void { this.values.push(val) }

  clear(): void { this.values = [] }

  toArray(): number[] { return [...this.values] }
  toString(): string { return JSON.stringify({ n: this.size, mean: this.mean(), stddev: this.stddev() }) }
  toJSON(): Record<string, number> { return { n: this.size, mean: this.mean(), variance: this.variance() } }

  clone(): Variation { return new Variation(this.values) }

  equals(other: unknown): boolean {
    if (!(other instanceof Variation)) return false
    return this.size === other.size
  }
}
