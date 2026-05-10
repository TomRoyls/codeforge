import type {
  CountingSketchOptions,
  CountingSketchJSON,
  CountingSketchStatistics,
} from './types.js'
import { DEFAULT_COUNTING_SKETCH_OPTIONS } from './types.js'

export class CountingSketch<T = string> {
  private table: Int32Array[]
  private _width: number
  private _depth: number
  private _hashFunctions: number
  private _hasData: boolean
  private _stats: CountingSketchStatistics

  constructor(options: CountingSketchOptions = {}) {
    const opts = { ...DEFAULT_COUNTING_SKETCH_OPTIONS, ...options }
    this._width = Math.max(1, opts.width!)
    this._depth = Math.max(1, opts.depth!)
    this._hashFunctions = Math.max(1, options.hashFunctions ?? this._depth)
    this.table = this.createTable()
    this._hasData = false
    this._stats = {
      updates: 0,
      queries: 0,
      merges: 0,
      totalItemCount: 0,
    }
  }

  update(item: T, count: number = 1): void {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (let i = 0; i < positions.length; i++) {
      const row = Math.min(i, this._depth - 1)
      const col = positions[i]!
      this.table[row]![col]! += count
    }
    this._hasData = true
    this._stats.updates++
    this._stats.totalItemCount += Math.abs(count)
  }

  estimate(item: T): number {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    this._stats.queries++
    let min = Infinity
    for (let i = 0; i < positions.length; i++) {
      const row = Math.min(i, this._depth - 1)
      const col = positions[i]!
      const val = this.table[row]![col]!
      if (val < min) {
        min = val
      }
    }
    return min === Infinity ? 0 : min
  }

  merge(other: CountingSketch<T>): CountingSketch<T> {
    if (this._width !== other._width) {
      throw new Error('Cannot merge sketches with different widths')
    }
    if (this._depth !== other._depth) {
      throw new Error('Cannot merge sketches with different depths')
    }
    if (this._hashFunctions !== other._hashFunctions) {
      throw new Error('Cannot merge sketches with different hash function counts')
    }
    const result = new CountingSketch<T>({
      width: this._width,
      depth: this._depth,
      hashFunctions: this._hashFunctions,
    })
    for (let row = 0; row < this._depth; row++) {
      for (let col = 0; col < this._width; col++) {
        result.table[row]![col]! = this.table[row]![col]! + other.table[row]![col]!
      }
    }
    result._hasData = this._hasData || other._hasData
    result._stats.totalItemCount = this._stats.totalItemCount + other._stats.totalItemCount
    result._stats.merges = this._stats.merges + other._stats.merges + 1
    result._stats.updates = this._stats.updates + other._stats.updates
    result._stats.queries = this._stats.queries + other._stats.queries
    this._stats.merges++
    return result
  }

  clear(): void {
    this.table = this.createTable()
    this._hasData = false
    this._stats = {
      updates: 0,
      queries: 0,
      merges: 0,
      totalItemCount: 0,
    }
  }

  isEmpty(): boolean {
    return !this._hasData
  }

  get width(): number {
    return this._width
  }

  get depth(): number {
    return this._depth
  }

  get hashFunctionCount(): number {
    return this._hashFunctions
  }

  getStatistics(): CountingSketchStatistics {
    return { ...this._stats }
  }

  toJSON(): CountingSketchJSON {
    return {
      table: this.table.map((row) => Array.from(row)),
      width: this._width,
      depth: this._depth,
      hashFunctions: this._hashFunctions,
      statistics: { ...this._stats },
    }
  }

  static fromJSON<T = string>(data: CountingSketchJSON): CountingSketch<T> {
    const sketch = new CountingSketch<T>({
      width: data.width,
      depth: data.depth,
      hashFunctions: data.hashFunctions,
    })
    for (let row = 0; row < data.depth; row++) {
      for (let col = 0; col < data.width; col++) {
        sketch.table[row]![col]! = data.table[row]![col]!
      }
    }
    sketch._hasData = data.statistics.totalItemCount > 0
    sketch._stats = { ...data.statistics }
    return sketch
  }

  private createTable(): Int32Array[] {
    const rows: Int32Array[] = []
    for (let i = 0; i < this._depth; i++) {
      rows.push(new Int32Array(this._width))
    }
    return rows
  }

  private getHashPositions(key: string): number[] {
    const positions: number[] = []
    const h1 = this.hash(key, 0x12345678)
    const h2 = this.hash(key, 0x87654321)
    for (let i = 0; i < this._hashFunctions; i++) {
      const combined = (h1 + i * h2) >>> 0
      positions.push(combined % this._width)
    }
    return positions
  }

  private hash(str: string, seed: number): number {
    let h1 = 0xdeadbeef ^ seed
    let h2 = 0x41c6ce57 ^ seed
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
  }

  private serialize(item: T): string {
    return JSON.stringify(item)
  }
}

export { DEFAULT_COUNTING_SKETCH_OPTIONS } from './types.js'
export type { CountingSketchOptions, CountingSketchJSON, CountingSketchStatistics } from './types.js'
