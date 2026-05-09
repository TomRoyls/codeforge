import type { CountMinSketchOptions } from './types.js'
import { DEFAULT_COUNTMINSKETCH_OPTIONS } from './types.js'

export class CountMinSketch {
  private matrix: number[][]
  private _width: number
  private _depth: number
  private _total: number

  constructor(options?: Partial<CountMinSketchOptions>) {
    const opts: CountMinSketchOptions = { ...DEFAULT_COUNTMINSKETCH_OPTIONS, ...options }
    this._width = opts.width
    this._depth = opts.depth
    this._total = 0
    this.matrix = []
    for (let i = 0; i < this._depth; i++) {
      const row: number[] = new Array(this._width).fill(0)
      this.matrix.push(row)
    }
  }

  add(item: string, count: number = 1): void {
    if (count <= 0) return
    for (let i = 0; i < this._depth; i++) {
      const hash = this.hash(item, i) % this._width
      this.matrix[i]![hash]! += count
    }
    this._total += count
  }

  count(item: string): number {
    return this.estimateFrequency(item)
  }

  estimateFrequency(item: string): number {
    let min = Infinity
    for (let i = 0; i < this._depth; i++) {
      const hash = this.hash(item, i) % this._width
      const val = this.matrix[i]![hash]!
      if (val < min) {
        min = val
      }
    }
    return min
  }

  merge(other: CountMinSketch): void {
    if (other._width !== this._width || other._depth !== this._depth) {
      throw new Error('Cannot merge sketches with different dimensions')
    }
    for (let i = 0; i < this._depth; i++) {
      for (let j = 0; j < this._width; j++) {
        this.matrix[i]![j]! += other.matrix[i]![j]!
      }
    }
    this._total += other._total
  }

  reset(): void {
    for (let i = 0; i < this._depth; i++) {
      for (let j = 0; j < this._width; j++) {
        this.matrix[i]![j] = 0
      }
    }
    this._total = 0
  }

  isEmpty(): boolean {
    for (let i = 0; i < this._depth; i++) {
      for (let j = 0; j < this._width; j++) {
        if (this.matrix[i]![j]! !== 0) {
          return false
        }
      }
    }
    return true
  }

  total(): number {
    return this._total
  }

  width(): number {
    return this._width
  }

  depth(): number {
    return this._depth
  }

  table(): number[][] {
    const copy: number[][] = []
    for (let i = 0; i < this._depth; i++) {
      copy.push([...this.matrix[i]!])
    }
    return copy
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
}

export { DEFAULT_COUNTMINSKETCH_OPTIONS } from './types.js'
export type { CountMinSketchOptions } from './types.js'
