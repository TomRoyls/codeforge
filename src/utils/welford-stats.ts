export class WelfordStats {
  private count = 0
  private meanVal = 0
  private m2 = 0

  add(value: number): void {
    this.count++
    const delta = value - this.meanVal
    this.meanVal += delta / this.count
    const delta2 = value - this.meanVal
    this.m2 += delta * delta2
  }

  get mean(): number { return this.meanVal }
  get variance(): number { return this.count < 2 ? 0 : this.m2 / (this.count - 1) }
  get stddev(): number { return Math.sqrt(this.variance) }
  get sampleCount(): number { return this.count }
  get isEmpty(): boolean { return this.count === 0 }

  clear(): void { this.count = 0; this.meanVal = 0; this.m2 = 0 }

  toArray(): number[] { return [this.meanVal, this.variance] }
  toString(): string { return JSON.stringify({ n: this.count, mean: this.meanVal, variance: this.variance }) }
  toJSON(): Record<string, number> { return { n: this.count, mean: this.meanVal, variance: this.variance } }

  clone(): WelfordStats {
    const c = new WelfordStats()
    c.count = this.count
    c.meanVal = this.meanVal
    c.m2 = this.m2
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof WelfordStats)) return false
    return this.count === other.count
  }
}
