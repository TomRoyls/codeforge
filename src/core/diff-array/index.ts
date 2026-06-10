import type { ForEachCallback } from './types.js'

export class DiffArray {
  private diff: number[]
  private _size: number
  private dirty: boolean
  private cached: number[]

  constructor(size: number) {
    if (!Number.isInteger(size) || size < 0) {
      throw new RangeError(`Size must be a non-negative integer, got ${size}`)
    }
    this._size = size
    this.diff = new Array(size + 1).fill(0)
    this.dirty = false
    this.cached = new Array(size).fill(0)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  rangeAdd(from: number, to: number, delta: number): void {
    if (from < 0 || to < 0 || from >= this._size || to >= this._size) {
      throw new RangeError(`Range [${from}, ${to}] out of bounds [0, ${this._size})`)
    }
    if (from > to) {
      throw new RangeError(`Invalid range: from (${from}) > to (${to})`)
    }
    this.diff[from]! += delta
    this.diff[to + 1]! -= delta
    this.dirty = true
  }

  private rebuildCache(): void {
    if (!this.dirty) return
    let prefix = 0
    for (let i = 0; i < this._size; i++) {
      prefix += this.diff[i]!
      this.cached[i] = prefix
    }
    this.dirty = false
  }

  pointQuery(index: number): number {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    this.rebuildCache()
    return this.cached[index]!
  }

  rangeQuery(from: number, to: number): number {
    if (from < 0 || to < 0 || from >= this._size || to >= this._size) {
      throw new RangeError(`Range [${from}, ${to}] out of bounds [0, ${this._size})`)
    }
    if (from > to) {
      throw new RangeError(`Invalid range: from (${from}) > to (${to})`)
    }
    this.rebuildCache()
    let sum = 0
    for (let i = from; i <= to; i++) {
      sum += this.cached[i]!
    }
    return sum
  }

  get(index: number): number {
    return this.pointQuery(index)
  }

  set(index: number, value: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    this.rebuildCache()
    const current = this.cached[index]!
    const delta = value - current
    if (delta !== 0) {
      this.diff[index]! += delta
      if (index + 1 < this.diff.length) {
        this.diff[index + 1]! -= delta
      }
      this.cached[index] = value
    }
  }

  clear(): void {
    this.diff.fill(0)
    this.cached.fill(0)
    this.dirty = false
  }

  toArray(): number[] {
    this.rebuildCache()
    return this.cached.slice()
  }

  clone(): DiffArray {
    const copy = new DiffArray(this._size)
    copy.diff = this.diff.slice()
    copy.cached = this.cached.slice()
    copy.dirty = this.dirty
    return copy
  }

  push(item: number): number {
    this.rebuildCache()
    const prev = this._size > 0 ? this.cached[this._size - 1]! : 0
    this.diff[this._size] = item - prev
    this._size += 1
    this.diff.push(-item)
    this.cached.push(item)
    return this._size
  }

  pop(): number | undefined {
    if (this._size === 0) return undefined
    const value = this.pointQuery(this._size - 1)
    this._size -= 1
    this.diff.pop()
    this.cached.pop()
    this.dirty = false
    return value
  }

  static fromArray(arr: number[]): DiffArray {
    const da = new DiffArray(arr.length)
    for (let i = 0; i < arr.length; i++) {
      da.set(i, arr[i]!)
    }
    return da
  }

  forEach(callback: ForEachCallback): void {
    this.rebuildCache()
    for (let i = 0; i < this._size; i++) {
      callback(this.cached[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<number> {
    let index = 0
    const arr = this.toArray()
    return {
      next: () => {
        if (index < arr.length) {
          return { value: arr[index++]!, done: false }
        }
        return { value: undefined as unknown as number, done: true }
      },
    }
  }

  rebuild(): void {
    this.rebuildCache()
  }

  snapshot(): number[] {
    this.rebuildCache()
    return this.cached.slice()
  }

  toString(): string {
    return `${DiffArray}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'DiffArray', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'DiffArray'
  }
}
