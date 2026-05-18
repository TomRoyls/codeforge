import { fnv1a } from './hash-utils.js';

export interface CountMinSketchOptions {
  width: number
  depth: number
}

export class CountMinSketch {
  private readonly table: number[][]
  private readonly width: number
  private readonly depth: number

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

  public reset(): void {
    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        this.table[i]![j] = 0
      }
    }
  }

  public getStats(): { width: number; depth: number; totalCells: number } {
    return { width: this.width, depth: this.depth, totalCells: this.width * this.depth }
  }

  private hash = fnv1a;
}
