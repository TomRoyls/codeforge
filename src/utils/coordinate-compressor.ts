export class CoordinateCompressor {
  private readonly sorted: number[]
  private readonly _size: number

  constructor(values: Iterable<number>) {
    const unique = [...new Set(values)]
    unique.sort((a, b) => a - b)
    this.sorted = unique
    this._size = unique.length
  }

  compress(value: number): number {
    let lo = 0
    let hi = this._size - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (this.sorted[mid]! < value) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return lo
  }

  decompress(index: number): number {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of range [0, ${this._size})`)
    }
    return this.sorted[index]!
  }

  has(value: number): boolean {
    return this.indexOf(value) !== -1
  }

  indexOf(value: number): number {
    const idx = this.compress(value)
    if (idx < this._size && this.sorted[idx] === value) return idx
    return -1
  }

  get size(): number {
    return this._size
  }

  get min(): number {
    return this.sorted[0]!
  }

  get max(): number {
    return this.sorted[this._size - 1]!
  }

  compressed(): number[] {
    return this.sorted.map((_, i) => i)
  }

  original(): number[] {
    return [...this.sorted]
  }
}
