export class AvgBuffer {
  private values: number[] = []
  private capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
  }

  push(value: number): void {
    this.values.push(value)
    if (this.values.length > this.capacity) this.values.shift()
  }

  avg(): number {
    if (this.values.length === 0) return 0
    return this.values.reduce((a, b) => a + b, 0) / this.values.length
  }

  weightedAvg(): number {
    if (this.values.length === 0) return 0
    let weightSum = 0
    let valueSum = 0
    for (let i = 0; i < this.values.length; i++) {
      const w = i + 1
      weightSum += w
      valueSum += this.values[i]! * w
    }
    return valueSum / weightSum
  }

  ema(alpha: number): number {
    if (this.values.length === 0) return 0
    let ema = this.values[0]!
    for (let i = 1; i < this.values.length; i++) {
      ema = alpha * this.values[i]! + (1 - alpha) * ema
    }
    return ema
  }

  get size(): number { return this.values.length }
  get isEmpty(): boolean { return this.values.length === 0 }

  clear(): void { this.values = [] }

  toArray(): number[] { return [...this.values] }
  toString(): string { return JSON.stringify({ size: this.size, capacity: this.capacity }) }
  toJSON(): Record<string, number> { return { size: this.size, capacity: this.capacity } }

  clone(): AvgBuffer {
    const c = new AvgBuffer(this.capacity)
    c.values = [...this.values]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof AvgBuffer)) return false
    return this.capacity === other.capacity
  }
}
