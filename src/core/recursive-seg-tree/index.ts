import type { RecursiveSegTreeOptions, ForEachCallback } from './types.js'

const defaultMerge = (a: number, b: number): number => a + b
const defaultIdentity = 0

export class RecursiveSegTree {
  private tree: number[]
  private _data: number[]
  private _n: number
  private merge: (a: number, b: number) => number
  private identity: number

  constructor(arr: number[], options?: RecursiveSegTreeOptions) {
    this._data = arr.slice()
    this._n = arr.length
    this.merge = options?.merge ?? defaultMerge
    this.identity = options?.identity ?? defaultIdentity
    const size = this._n === 0 ? 1 : 4 * this._n
    this.tree = new Array<number>(size).fill(this.identity)
    if (this._n > 0) {
      this.buildTree(1, 0, this._n - 1)
    }
  }

  private buildTree(node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = this._data[start]!
      return
    }
    const mid = Math.floor((start + end) / 2)
    this.buildTree(node * 2, start, mid)
    this.buildTree(node * 2 + 1, mid + 1, end)
    this.tree[node] = this.merge(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private queryRange(node: number, start: number, end: number, l: number, r: number): number {
    if (r < start || l > end) {
      return this.identity
    }
    if (l <= start && end <= r) {
      return this.tree[node]!
    }
    const mid = Math.floor((start + end) / 2)
    const leftResult = this.queryRange(node * 2, start, mid, l, r)
    const rightResult = this.queryRange(node * 2 + 1, mid + 1, end, l, r)
    return this.merge(leftResult, rightResult)
  }

  private updatePoint(node: number, start: number, end: number, index: number, value: number): void {
    if (start === end) {
      this.tree[node] = value
      this._data[index] = value
      return
    }
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      this.updatePoint(node * 2, start, mid, index, value)
    } else {
      this.updatePoint(node * 2 + 1, mid + 1, end, index, value)
    }
    this.tree[node] = this.merge(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  query(l: number, r: number): number {
    if (this._n === 0) {
      throw new RangeError('Cannot query empty tree')
    }
    if (l < 0 || r > this._n || l >= r) {
      throw new RangeError(`Invalid range [${l}, ${r}) for size ${this._n}`)
    }
    if (l === r) return this.identity
    return this.queryRange(1, 0, this._n - 1, l, r - 1)
  }

  update(index: number, value: number): void {
    if (index < 0 || index >= this._n) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._n})`)
    }
    this.updatePoint(1, 0, this._n - 1, index, value)
  }

  get(index: number): number {
    if (index < 0 || index >= this._n) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._n})`)
    }
    return this._data[index]!
  }

  set(index: number, value: number): void {
    this.update(index, value)
  }

  get size(): number {
    return this._n
  }

  get isEmpty(): boolean {
    return this._n === 0
  }

  toArray(): number[] {
    return this._data.slice()
  }

  clone(): RecursiveSegTree {
    const copy = new RecursiveSegTree([], {
      merge: this.merge,
      identity: this.identity,
    })
    copy._data = this._data.slice()
    copy._n = this._n
    copy.tree = this.tree.slice()
    return copy
  }

  static fromArray(arr: number[], options?: RecursiveSegTreeOptions): RecursiveSegTree {
    return new RecursiveSegTree(arr, options)
  }

  clear(): void {
    this._data = []
    this._n = 0
    this.tree = [this.identity]
  }

  forEach(callback: ForEachCallback): void {
    for (let i = 0; i < this._n; i++) {
      callback(this._data[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    for (let i = 0; i < this._n; i++) {
      yield this._data[i]!
    }
  }

  first(): number {
    if (this._n === 0) {
      throw new RangeError('Cannot get first element of empty tree')
    }
    return this._data[0]!
  }

  last(): number {
    if (this._n === 0) {
      throw new RangeError('Cannot get last element of empty tree')
    }
    return this._data[this._n - 1]!
  }

  indexOf(value: number): number {
    for (let i = 0; i < this._n; i++) {
      if (this._data[i] === value) {
        return i
      }
    }
    return -1
  }

  min(): number {
    if (this._n === 0) {
      throw new RangeError('Cannot get min of empty tree')
    }
    let result = this._data[0]!
    for (let i = 1; i < this._n; i++) {
      if (this._data[i]! < result) {
        result = this._data[i]!
      }
    }
    return result
  }

  max(): number {
    if (this._n === 0) {
      throw new RangeError('Cannot get max of empty tree')
    }
    let result = this._data[0]!
    for (let i = 1; i < this._n; i++) {
      if (this._data[i]! > result) {
        result = this._data[i]!
      }
    }
    return result
  }

  sum(): number {
    if (this._n === 0) return this.identity
    return this.queryRange(1, 0, this._n - 1, 0, this._n - 1)
  }

  prefixSum(n: number): number {
    if (n < 0 || n > this._n) {
      throw new RangeError(`Invalid prefix length ${n} for size ${this._n}`)
    }
    if (n === 0) return this.identity
    return this.queryRange(1, 0, this._n - 1, 0, n - 1)
  }

  rangeMin(l: number, r: number): number {
    if (this._n === 0) {
      throw new RangeError('Cannot query empty tree')
    }
    if (l < 0 || r > this._n || l >= r) {
      throw new RangeError(`Invalid range [${l}, ${r}) for size ${this._n}`)
    }
    let result = this._data[l]!
    for (let i = l + 1; i < r; i++) {
      if (this._data[i]! < result) {
        result = this._data[i]!
      }
    }
    return result
  }

  rangeMax(l: number, r: number): number {
    if (this._n === 0) {
      throw new RangeError('Cannot query empty tree')
    }
    if (l < 0 || r > this._n || l >= r) {
      throw new RangeError(`Invalid range [${l}, ${r}) for size ${this._n}`)
    }
    let result = this._data[l]!
    for (let i = l + 1; i < r; i++) {
      if (this._data[i]! > result) {
        result = this._data[i]!
      }
    }
    return result
  }

  rangeSum(l: number, r: number): number {
    return this.query(l, r)
  }

  build(arr: number[]): void {
    this._data = arr.slice()
    this._n = arr.length
    const size = this._n === 0 ? 1 : 4 * this._n
    this.tree = new Array<number>(size).fill(this.identity)
    if (this._n > 0) {
      this.buildTree(1, 0, this._n - 1)
    }
  }

  push(value: number): void {
    this._data.push(value)
    this._n = this._data.length
    const size = this._n === 0 ? 1 : 4 * this._n
    this.tree = new Array<number>(size).fill(this.identity)
    if (this._n > 0) {
      this.buildTree(1, 0, this._n - 1)
    }
  }

  pop(): number | undefined {
    if (this._n === 0) return undefined
    const value = this._data.pop()!
    this._n = this._data.length
    const size = this._n === 0 ? 1 : 4 * this._n
    this.tree = new Array<number>(size).fill(this.identity)
    if (this._n > 0) {
      this.buildTree(1, 0, this._n - 1)
    }
    return value
  }

  static from(items: any[]): RecursiveSegTree {
    return new RecursiveSegTree(items)
  }
}
