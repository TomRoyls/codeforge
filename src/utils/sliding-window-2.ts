export class SlidingWindow2 {
  private data: number[] = []
  private capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
  }

  add(value: number): void {
    this.data.push(value)
    if (this.data.length > this.capacity) this.data.shift()
  }

  sum(): number { return this.data.reduce((a, b) => a + b, 0) }
  mean(): number { return this.data.length === 0 ? 0 : this.sum() / this.data.length }

  min(): number { return Math.min(...this.data) }
  max(): number { return Math.max(...this.data) }

  variance(): number {
    if (this.data.length < 2) return 0
    const avg = this.mean()
    return this.data.reduce((s, v) => s + (v - avg) ** 2, 0) / this.data.length
  }

  stddev(): number { return Math.sqrt(this.variance()) }

  median(): number {
    if (this.data.length === 0) return 0
    const sorted = [...this.data].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }

  get size(): number { return this.data.length }
  get isEmpty(): boolean { return this.data.length === 0 }
  get isFull(): boolean { return this.data.length === this.capacity }

  clear(): void { this.data = [] }

  toArray(): number[] { return [...this.data] }
  toString(): string { return JSON.stringify({ size: this.data.length, capacity: this.capacity }) }
  toJSON(): Record<string, number> { return { size: this.data.length, capacity: this.capacity } }

  clone(): SlidingWindow2 {
    const c = new SlidingWindow2(this.capacity)
    c.data = [...this.data]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SlidingWindow2)) return false
    return this.size === other.size
  }
}
