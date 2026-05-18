import { fnv1a } from './hash-utils.js';

export class CountMinSketchWeighted {
  private readonly table: number[][]
  private readonly _width: number
  private readonly _depth: number
  private _totalCount: number
  private readonly _items: Map<string, number>

  constructor(width: number, depth: number) {
    if (width < 1) throw new RangeError(`width must be >= 1, got ${width}`)
    if (depth < 1) throw new RangeError(`depth must be >= 1, got ${depth}`)
    this._width = width
    this._depth = depth
    this.table = Array.from({ length: depth }, () => new Array(width).fill(0) as number[])
    this._totalCount = 0
    this._items = new Map()
  }

  static withAccuracy(epsilon: number, delta: number): CountMinSketchWeighted {
    if (epsilon <= 0 || epsilon >= 1) throw new RangeError(`epsilon must be in (0, 1), got ${epsilon}`)
    if (delta <= 0 || delta >= 1) throw new RangeError(`delta must be in (0, 1), got ${delta}`)
    const width = Math.ceil(Math.E / epsilon)
    const depth = Math.ceil(Math.log(1 / delta))
    return new CountMinSketchWeighted(width, depth)
  }

  add(item: string, count: number = 1): void {
    if (count < 0) throw new RangeError(`count must be >= 0, got ${count}`)

    let currentMin = Infinity
    const indices: number[] = new Array(this._depth)
    for (let i = 0; i < this._depth; i++) {
      indices[i] = this.hash(item, i) % this._width
      const val = this.table[i]![indices[i]!]!
      if (val < currentMin) currentMin = val
    }

    const target = currentMin + count
    for (let i = 0; i < this._depth; i++) {
      const idx = indices[i]!
      if (this.table[i]![idx]! < target) {
        this.table[i]![idx] = target
      }
    }

    this._totalCount += count
    const prev = this._items.get(item) ?? 0
    this._items.set(item, prev + count)
  }

  count(item: string): number {
    let min = Infinity
    for (let i = 0; i < this._depth; i++) {
      const idx = this.hash(item, i) % this._width
      const val = this.table[i]![idx]!
      if (val < min) min = val
    }
    return min
  }

  heavyHitters(threshold: number): string[] {
    if (threshold < 0 || threshold > 1) {
      throw new RangeError(`threshold must be in [0, 1], got ${threshold}`)
    }
    const result: string[] = []
    const minCount = threshold * this._totalCount
    for (const [item] of this._items) {
      if (this.count(item) >= minCount && this._totalCount > 0) {
        result.push(item)
      }
    }
    return result
  }

  merge(other: CountMinSketchWeighted): CountMinSketchWeighted {
    if (this._width !== other._width || this._depth !== other._depth) {
      throw new Error('Cannot merge sketches with different dimensions')
    }
    const result = new CountMinSketchWeighted(this._width, this._depth)
    for (let i = 0; i < this._depth; i++) {
      for (let j = 0; j < this._width; j++) {
        result.table[i]![j] = this.table[i]![j]! + other.table[i]![j]!
      }
    }
    result._totalCount = this._totalCount + other._totalCount
    for (const [k, v] of this._items) {
      result._items.set(k, v)
    }
    for (const [k, v] of other._items) {
      const existing = result._items.get(k) ?? 0
      result._items.set(k, existing + v)
    }
    return result
  }

  get total(): number {
    return this._totalCount
  }

  get width(): number {
    return this._width
  }

  get depth(): number {
    return this._depth
  }

  errorBound(): number {
    return this._totalCount > 0 ? this._totalCount / this._width : 0
  }

  confidence(): number {
    return 1 - 1 / Math.pow(Math.E, this._depth)
  }

  private hash = fnv1a;
}
