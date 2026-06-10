import { fnv1a } from './hash-utils.js';

export interface CountMinSketchOptions {
  width: number
  depth: number
}

export class CountMinSketch {
  private readonly table: number[][]
  private readonly width: number
  private readonly depth: number
  private _totalCount: number = 0

  constructor(options: CountMinSketchOptions) {
    if (options.width < 1) throw new RangeError(`width must be >= 1, got ${options.width}`)
    if (options.depth < 1) throw new RangeError(`depth must be >= 1, got ${options.depth}`)
    this.width = options.width
    this.depth = options.depth
    this.table = Array.from({ length: this.depth }, () => new Array(this.width).fill(0) as number[])
  }

  public update(item: string, count: number = 1): void {
    for (let i = 0; i < this.depth; i++) {
      const idx = this.hash(item, i) % this.width
      this.table[i]![idx]! += count
    }
    this._totalCount += count
  }

  public estimate(item: string): number {
    let min = Infinity
    for (let i = 0; i < this.depth; i++) {
      const idx = this.hash(item, i) % this.width
      const val = this.table[i]![idx]!
      if (val < min) min = val
    }
    return min
  }

  public has(item: string): boolean {
    return this.estimate(item) > 0
  }

  public reset(): void {
    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        this.table[i]![j] = 0
      }
    }
    this._totalCount = 0
  }

  public get totalCount(): number {
    return this._totalCount
  }

  public getStats(): { width: number; depth: number; totalCells: number } {
    return { width: this.width, depth: this.depth, totalCells: this.width * this.depth }
  }

  public merge(other: CountMinSketch): void {
    if (this.width !== other.width || this.depth !== other.depth) {
      throw new Error('Cannot merge sketches with different dimensions')
    }
    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        this.table[i]![j] = (this.table[i]![j] ?? 0) + (other.table[i]![j] ?? 0)
      }
    }
    this._totalCount += other._totalCount
  }

  public clone(): CountMinSketch {
    const copy = new CountMinSketch({ width: this.width, depth: this.depth })
    for (let i = 0; i < this.depth; i++) {
      copy.table[i] = [...this.table[i]!]
    }
    copy._totalCount = this._totalCount
    return copy
  }

  public equals(other: unknown): boolean {
    if (!(other instanceof CountMinSketch)) return false
    if (this.width !== other.width || this.depth !== other.depth) return false
    if (this._totalCount !== other._totalCount) return false
    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.table[i]![j] !== other.table[i]![j]) return false
      }
    }
    return true
  }

  public toJSON(): unknown {
    return {
      width: this.width,
      depth: this.depth,
      totalCount: this._totalCount,
      table: this.table,
    }
  }

  public static fromJSON(data: { width: number; depth: number; totalCount: number; table: number[][] }): CountMinSketch {
    const cms = new CountMinSketch({ width: data.width, depth: data.depth })
    for (let i = 0; i < cms.depth; i++) {
      cms.table[i] = [...data.table[i]!]
    }
    cms._totalCount = data.totalCount
    return cms
  }

  public toString(): string {
    return `CountMinSketch(width=${this.width}, depth=${this.depth}, totalCount=${this._totalCount})`
  }

  private hash = fnv1a;
}
