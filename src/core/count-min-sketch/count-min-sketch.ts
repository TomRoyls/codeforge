import type { CountMinSketchOptions, CountMinSketchJSON } from './types.js'
import { DEFAULT_COUNTMINSKETCH_OPTIONS } from './types.js'

export class CountMinSketch<T = string> {
  private matrix: number[][]
  private _width: number
  private _depth: number
  private _total: number

  constructor(width?: number, depth?: number)
  constructor(options?: Partial<CountMinSketchOptions>)
  constructor(
    widthOrOptions?: number | Partial<CountMinSketchOptions>,
    depth?: number,
  ) {
    let opts: CountMinSketchOptions
    if (typeof widthOrOptions === 'object' && widthOrOptions !== null) {
      opts = { ...DEFAULT_COUNTMINSKETCH_OPTIONS, ...widthOrOptions }
    } else {
      opts = {
        ...DEFAULT_COUNTMINSKETCH_OPTIONS,
        ...(widthOrOptions !== undefined ? { width: widthOrOptions } : {}),
        ...(depth !== undefined ? { depth } : {}),
      }
    }
    this._width = Math.max(1, Math.ceil(opts.width))
    this._depth = Math.max(1, Math.ceil(opts.depth))
    this._total = 0
    this.matrix = []
    for (let i = 0; i < this._depth; i++) {
      this.matrix.push(new Array(this._width).fill(0))
    }
  }

  static create<T = string>(epsilon: number, delta: number): CountMinSketch<T> {
    const width = Math.max(1, Math.ceil(Math.E / epsilon))
    const depth = Math.max(1, Math.ceil(-Math.log(delta)))
    return new CountMinSketch<T>(width, depth)
  }

  update(item: T, count: number = 1): void {
    if (count <= 0) return
    const key = this.serialize(item)
    const h1 = this.hash(key, 0)
    const h2 = this.hash(key, h1)
    for (let i = 0; i < this._depth; i++) {
      const pos = ((h1 + i * h2) >>> 0) % this._width
      this.matrix[i]![pos]! += count
    }
    this._total += count
  }

  query(item: T): number {
    const key = this.serialize(item)
    const h1 = this.hash(key, 0)
    const h2 = this.hash(key, h1)
    let min = Infinity
    for (let i = 0; i < this._depth; i++) {
      const pos = ((h1 + i * h2) >>> 0) % this._width
      const val = this.matrix[i]![pos]!
      if (val < min) {
        min = val
      }
    }
    return min
  }

  merge(other: CountMinSketch<T>): void {
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

  get width(): number {
    return this._width
  }

  get depth(): number {
    return this._depth
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

  clear(): void {
    for (let i = 0; i < this._depth; i++) {
      for (let j = 0; j < this._width; j++) {
        this.matrix[i]![j] = 0
      }
    }
    this._total = 0
  }

  clone(): CountMinSketch<T> {
    const cloned = new CountMinSketch<T>(this._width, this._depth)
    for (let i = 0; i < this._depth; i++) {
      for (let j = 0; j < this._width; j++) {
        cloned.matrix[i]![j]! = this.matrix[i]![j]!
      }
    }
    cloned._total = this._total
    return cloned
  }

  totalCount(): number {
    return this._total
  }

  relativeError(): number {
    return Math.E / this._width
  }

  confidence(): number {
    return 1 - Math.exp(-this._depth)
  }

  toJSON(): CountMinSketchJSON {
    const matrixCopy: number[][] = []
    for (let i = 0; i < this._depth; i++) {
      matrixCopy.push([...this.matrix[i]!])
    }
    return {
      matrix: matrixCopy,
      width: this._width,
      depth: this._depth,
      totalCount: this._total,
    }
  }

  static fromJSON<T = string>(data: CountMinSketchJSON): CountMinSketch<T> {
    const sketch = new CountMinSketch<T>(data.width, data.depth)
    for (let i = 0; i < data.depth; i++) {
      for (let j = 0; j < data.width; j++) {
        sketch.matrix[i]![j]! = data.matrix[i]![j]!
      }
    }
    sketch._total = data.totalCount
    return sketch
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

export { DEFAULT_COUNTMINSKETCH_OPTIONS } from './types.js'
export type { CountMinSketchOptions, CountMinSketchJSON } from './types.js'
