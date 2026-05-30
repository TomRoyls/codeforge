export class StreamSampler<T> {
  private readonly reservoir: T[]
  private count: number = 0
  private readonly _maxSize: number

  constructor(maxSize: number) {
    if (maxSize < 1) throw new RangeError(`size must be >= 1, got ${maxSize}`)
    this._maxSize = maxSize
    this.reservoir = []
  }

  add(item: T): void {
    this.count++
    if (this.reservoir.length < this._maxSize) {
      this.reservoir.push(item)
      return
    }
    const idx = Math.floor(Math.random() * this.count)
    if (idx < this._maxSize) {
      this.reservoir[idx] = item
    }
  }

  addAll(items: Iterable<T>): void {
    for (const item of items) {
      this.add(item)
    }
  }

  sample(): T[] {
    return [...this.reservoir]
  }

  get size(): number {
    return this.reservoir.length
  }

  get totalSeen(): number {
    return this.count
  }

  get isFull(): boolean {
    return this.reservoir.length >= this._maxSize
  }

  get isEmpty(): boolean {
    return this.reservoir.length === 0
  }

  reset(): void {
    this.reservoir.length = 0
    this.count = 0
  }

  forEach(callback: (item: T, index: number) => void): void {
    this.reservoir.forEach((item, i) => callback(item, i))
  }

  mean(): number | undefined {
    if (this.reservoir.length === 0) return undefined
    let sum = 0
    for (const item of this.reservoir) {
      if (typeof item !== 'number') return undefined
      sum += item
    }
    return sum / this.reservoir.length
  }

  min(): T | undefined {
    if (this.reservoir.length === 0) return undefined
    let min = this.reservoir[0]!
    for (let i = 1; i < this.reservoir.length; i++) {
      const item = this.reservoir[i]!
      if (item < min) min = item
    }
    return min
  }

  max(): T | undefined {
    if (this.reservoir.length === 0) return undefined
    let max = this.reservoir[0]!
    for (let i = 1; i < this.reservoir.length; i++) {
      const item = this.reservoir[i]!
      if (item > max) max = item
    }
    return max
  }
}
