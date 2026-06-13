export class StreamProcessor2 {
  private buffer: number[] = []
  private count = 0
  private sum = 0
  private sumSq = 0
  private min = Infinity
  private max = -Infinity
  private capacity: number

  constructor(capacity = Infinity) {
    this.capacity = capacity
  }

  push(value: number): void {
    this.count++
    this.sum += value
    this.sumSq += value * value
    this.min = Math.min(this.min, value)
    this.max = Math.max(this.max, value)
    this.buffer.push(value)
    if (this.buffer.length > this.capacity) this.buffer.shift()
  }

  mean(): number {
    return this.count === 0 ? 0 : this.sum / this.count
  }

  variance(): number {
    if (this.count === 0) return 0
    const m = this.mean()
    return this.sumSq / this.count - m * m
  }

  stddev(): number {
    return Math.sqrt(this.variance())
  }

  median(): number {
    if (this.buffer.length === 0) return 0
    const sorted = [...this.buffer].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }

  get size(): number { return this.count }
  get minVal(): number { return this.count === 0 ? 0 : this.min }
  get maxVal(): number { return this.count === 0 ? 0 : this.max }
  get lastBuffer(): number[] { return [...this.buffer] }

  clear(): void {
    this.buffer = []; this.count = 0; this.sum = 0; this.sumSq = 0
    this.min = Infinity; this.max = -Infinity
  }

  toArray(): number[] { return [...this.buffer] }
  toString(): string { return JSON.stringify({ count: this.count, mean: this.mean() }) }
  toJSON(): Record<string, number> { return { count: this.count, sum: this.sum, min: this.minVal, max: this.maxVal } }
  clone(): StreamProcessor2 {
    const c = new StreamProcessor2(this.capacity)
    c.buffer = [...this.buffer]; c.count = this.count; c.sum = this.sum
    c.sumSq = this.sumSq; c.min = this.min; c.max = this.max
    return c
  }
  equals(other: unknown): boolean { return other instanceof StreamProcessor2 }
}
