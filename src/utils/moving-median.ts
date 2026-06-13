export class MovingMedian {
  private window: number[] = []
  private maxSize: number

  constructor(windowSize: number) {
    this.maxSize = windowSize
  }

  add(value: number): void {
    this.window.push(value)
    if (this.window.length > this.maxSize) this.window.shift()
  }

  median(): number {
    if (this.window.length === 0) return 0
    const sorted = [...this.window].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2
  }

  mean(): number {
    if (this.window.length === 0) return 0
    return this.window.reduce((a, b) => a + b, 0) / this.window.length
  }

  min(): number { return this.window.length === 0 ? 0 : Math.min(...this.window) }
  max(): number { return this.window.length === 0 ? 0 : Math.max(...this.window) }

  get size(): number { return this.window.length }
  get isEmpty(): boolean { return this.window.length === 0 }

  clear(): void { this.window = [] }

  toArray(): number[] { return [...this.window] }
  toString(): string { return JSON.stringify({ size: this.size, median: this.median() }) }
  toJSON(): Record<string, number> { return { size: this.size, median: this.median() } }

  clone(): MovingMedian {
    const c = new MovingMedian(this.maxSize)
    c.window = [...this.window]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof MovingMedian)) return false
    return this.maxSize === other.maxSize && this.size === other.size
  }
}
