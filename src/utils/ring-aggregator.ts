export class RingAggregator {
  private buffer: number[]
  private capacity: number
  private head = 0
  private count = 0

  constructor(capacity: number) {
    this.capacity = capacity
    this.buffer = new Array(capacity).fill(0)
  }

  push(value: number): void {
    this.buffer[this.head] = value
    this.head = (this.head + 1) % this.capacity
    if (this.count < this.capacity) this.count++
  }

  sum(): number {
    let s = 0
    for (let i = 0; i < this.count; i++) s += this.buffer[i]!
    return s
  }

  avg(): number {
    return this.count === 0 ? 0 : this.sum() / this.count
  }

  min(): number {
    if (this.count === 0) return 0
    let m = Infinity
    for (let i = 0; i < this.count; i++) if (this.buffer[i]! < m) m = this.buffer[i]!
    return m
  }

  max(): number {
    if (this.count === 0) return 0
    let m = -Infinity
    for (let i = 0; i < this.count; i++) if (this.buffer[i]! > m) m = this.buffer[i]!
    return m
  }

  variance(): number {
    if (this.count === 0) return 0
    const mean = this.avg()
    let s = 0
    for (let i = 0; i < this.count; i++) s += (this.buffer[i]! - mean) ** 2
    return s / this.count
  }

  stddev(): number { return Math.sqrt(this.variance()) }

  get size(): number { return this.count }
  get isEmpty(): boolean { return this.count === 0 }

  clear(): void { this.buffer.fill(0); this.head = 0; this.count = 0 }

  toArray(): number[] {
    const result: number[] = []
    const start = this.count < this.capacity ? 0 : this.head
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[(start + i) % this.capacity]!)
    }
    return result
  }

  toString(): string { return JSON.stringify({ size: this.count, capacity: this.capacity }) }
  toJSON(): Record<string, number> { return { size: this.count, capacity: this.capacity } }

  clone(): RingAggregator {
    const c = new RingAggregator(this.capacity)
    c.buffer = [...this.buffer]
    c.head = this.head
    c.count = this.count
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RingAggregator)) return false
    return this.capacity === other.capacity && this.count === other.count
  }
}
