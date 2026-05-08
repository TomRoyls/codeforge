import type { FenwickTreeOptions } from './types.js'
import { DEFAULT_FENWICK_TREE_OPTIONS } from './types.js'

export class FenwickTree {
  private tree: number[] = []
  private _size: number = 0
  private defaultValue: number

  constructor(size?: number, options?: Partial<FenwickTreeOptions>) {
    const opts: FenwickTreeOptions = { ...DEFAULT_FENWICK_TREE_OPTIONS, ...options }
    this.defaultValue = opts.defaultValue
    if (size !== undefined && size > 0) {
      this.build(new Array<number>(size).fill(this.defaultValue))
    }
  }

  build(data: number[]): void {
    this._size = data.length
    this.tree = new Array<number>(this._size + 1).fill(0)
    for (let i = 0; i < this._size; i++) {
      const idx = i + 1
      this.tree[idx]! += data[i]!
      const parent = idx + this.lsb(idx)
      if (parent <= this._size) {
        this.tree[parent]! += this.tree[idx]!
      }
    }
  }

  update(index: number, delta: number): void {
    this.validateIndex(index)
    let i = index + 1
    while (i <= this._size) {
      this.tree[i] = (this.tree[i] ?? this.defaultValue) + delta
      i += this.lsb(i)
    }
  }

  prefixSum(index: number): number {
    if (this._size === 0) {
      return 0
    }
    if (index < 0) {
      return 0
    }
    const clampedIndex = Math.min(index, this._size - 1)
    let sum = 0
    let i = clampedIndex + 1
    while (i > 0) {
      sum += this.tree[i] ?? 0
      i -= this.lsb(i)
    }
    return sum
  }

  rangeSum(start: number, end: number): number {
    if (start > end) {
      return 0
    }
    if (start <= 0) {
      return this.prefixSum(end)
    }
    return this.prefixSum(end) - this.prefixSum(start - 1)
  }

  get(index: number): number {
    this.validateIndex(index)
    return this.prefixSum(index) - this.prefixSum(index - 1)
  }

  set(index: number, value: number): void {
    const current = this.get(index)
    const delta = value - current
    this.update(index, delta)
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.tree = []
    this._size = 0
  }

  getData(): number[] {
    const data: number[] = []
    for (let i = 0; i < this._size; i++) {
      data.push(this.get(i))
    }
    return data
  }

  totalSum(): number {
    if (this._size === 0) {
      return this.defaultValue
    }
    return this.prefixSum(this._size - 1)
  }

  findKth(k: number): number {
    if (this._size === 0) {
      throw new Error('Tree is empty')
    }
    if (k < 1) {
      throw new RangeError('k must be >= 1')
    }
    let pos = 0
    let bitLength = 1
    while ((1 << bitLength) <= this._size) {
      bitLength++
    }
    for (let i = bitLength; i >= 0; i--) {
      const nextPos = pos + (1 << i)
      if (nextPos <= this._size && (this.tree[nextPos] ?? this.defaultValue) < k) {
        k -= this.tree[nextPos] ?? this.defaultValue
        pos = nextPos
      }
    }
    if (pos >= this._size) {
      throw new RangeError('k exceeds total sum')
    }
    return pos
  }

  private lsb(i: number): number {
    return i & (-i)
  }

  private validateIndex(index: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size - 1}]`)
    }
  }
}

export { DEFAULT_FENWICK_TREE_OPTIONS } from './types.js'
export type { FenwickTreeOptions } from './types.js'
