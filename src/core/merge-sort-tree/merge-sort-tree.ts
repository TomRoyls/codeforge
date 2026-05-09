import type { MergeSortTreeNode } from './types.js'

export class MergeSortTree {
  private tree: MergeSortTreeNode[] = []
  private _data: number[] = []
  private _size: number = 0

  constructor(values: number[]) {
    this._data = [...values]
    this._size = values.length
    if (this._size === 0) {
      this.tree = []
      return
    }
    const treeSize = 4 * this._size
    this.tree = new Array<MergeSortTreeNode>(treeSize)
    for (let i = 0; i < treeSize; i++) {
      this.tree[i] = { sorted: [] }
    }
    this.build(1, 0, this._size - 1)
  }

  private build(node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = { sorted: [this._data[start]!] }
      return
    }
    const mid = Math.floor((start + end) / 2)
    this.build(node * 2, start, mid)
    this.build(node * 2 + 1, mid + 1, end)
    this.tree[node] = { sorted: this.merge(this.tree[node * 2]!.sorted, this.tree[node * 2 + 1]!.sorted) }
  }

  private merge(a: number[], b: number[]): number[] {
    const result: number[] = []
    let i = 0
    let j = 0
    while (i < a.length && j < b.length) {
      if (a[i]! <= b[j]!) {
        result.push(a[i]!)
        i++
      } else {
        result.push(b[j]!)
        j++
      }
    }
    while (i < a.length) {
      result.push(a[i]!)
      i++
    }
    while (j < b.length) {
      result.push(b[j]!)
      j++
    }
    return result
  }

  private validateRange(l: number, r: number): void {
    if (l < 0 || r < 0 || l >= this._size || r >= this._size || l > r) {
      throw new RangeError(`Invalid range [${l}, ${r}] for size ${this._size}`)
    }
  }

  countLessThan(l: number, r: number, value: number): number {
    if (this._size === 0) return 0
    this.validateRange(l, r)
    return this.queryCountLessThan(1, 0, this._size - 1, l, r, value)
  }

  private queryCountLessThan(node: number, nodeStart: number, nodeEnd: number, queryStart: number, queryEnd: number, value: number): number {
    if (queryStart > nodeEnd || queryEnd < nodeStart) return 0
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      return this.lowerBound(this.tree[node]!.sorted, value)
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    return this.queryCountLessThan(node * 2, nodeStart, mid, queryStart, queryEnd, value) +
      this.queryCountLessThan(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd, value)
  }

  private lowerBound(arr: number[], value: number): number {
    let lo = 0
    let hi = arr.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid]! < value) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  countLessThanOrEqual(l: number, r: number, value: number): number {
    if (this._size === 0) return 0
    this.validateRange(l, r)
    return this.queryCountLessThanOrEqual(1, 0, this._size - 1, l, r, value)
  }

  private queryCountLessThanOrEqual(node: number, nodeStart: number, nodeEnd: number, queryStart: number, queryEnd: number, value: number): number {
    if (queryStart > nodeEnd || queryEnd < nodeStart) return 0
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      return this.upperBound(this.tree[node]!.sorted, value)
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    return this.queryCountLessThanOrEqual(node * 2, nodeStart, mid, queryStart, queryEnd, value) +
      this.queryCountLessThanOrEqual(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd, value)
  }

  private upperBound(arr: number[], value: number): number {
    let lo = 0
    let hi = arr.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid]! <= value) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  countGreaterThan(l: number, r: number, value: number): number {
    if (this._size === 0) return 0
    this.validateRange(l, r)
    return (r - l + 1) - this.countLessThanOrEqual(l, r, value)
  }

  countGreaterThanOrEqual(l: number, r: number, value: number): number {
    if (this._size === 0) return 0
    this.validateRange(l, r)
    return (r - l + 1) - this.countLessThan(l, r, value)
  }

  countInRange(l: number, r: number, minVal: number, maxVal: number): number {
    if (this._size === 0) return 0
    this.validateRange(l, r)
    return this.queryCountInRange(1, 0, this._size - 1, l, r, minVal, maxVal)
  }

  private queryCountInRange(node: number, nodeStart: number, nodeEnd: number, queryStart: number, queryEnd: number, minVal: number, maxVal: number): number {
    if (queryStart > nodeEnd || queryEnd < nodeStart) return 0
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      const arr = this.tree[node]!.sorted
      const lo = this.lowerBound(arr, minVal)
      const hi = this.upperBound(arr, maxVal)
      return hi - lo
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    return this.queryCountInRange(node * 2, nodeStart, mid, queryStart, queryEnd, minVal, maxVal) +
      this.queryCountInRange(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd, minVal, maxVal)
  }

  kthSmallest(l: number, r: number, k: number): number {
    if (this._size === 0) {
      throw new RangeError('Tree is empty')
    }
    this.validateRange(l, r)
    if (k < 1 || k > r - l + 1) {
      throw new RangeError(`k=${k} out of bounds for range [${l}, ${r}]`)
    }
    const values = this.extractRange(l, r)
    values.sort((a, b) => a - b)
    return values[k - 1]!
  }

  private extractRange(l: number, r: number): number[] {
    const result: number[] = []
    this.collectRange(1, 0, this._size - 1, l, r, result)
    return result
  }

  private collectRange(node: number, nodeStart: number, nodeEnd: number, queryStart: number, queryEnd: number, result: number[]): void {
    if (queryStart > nodeEnd || queryEnd < nodeStart) return
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      for (const v of this.tree[node]!.sorted) {
        result.push(v)
      }
      return
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    this.collectRange(node * 2, nodeStart, mid, queryStart, queryEnd, result)
    this.collectRange(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd, result)
  }

  rangeMin(l: number, r: number): number {
    if (this._size === 0) {
      throw new RangeError('Tree is empty')
    }
    this.validateRange(l, r)
    return this.queryRangeMin(1, 0, this._size - 1, l, r)
  }

  private queryRangeMin(node: number, nodeStart: number, nodeEnd: number, queryStart: number, queryEnd: number): number {
    if (queryStart > nodeEnd || queryEnd < nodeStart) return Infinity
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      return this.tree[node]!.sorted[0]!
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    return Math.min(
      this.queryRangeMin(node * 2, nodeStart, mid, queryStart, queryEnd),
      this.queryRangeMin(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd),
    )
  }

  rangeMax(l: number, r: number): number {
    if (this._size === 0) {
      throw new RangeError('Tree is empty')
    }
    this.validateRange(l, r)
    return this.queryRangeMax(1, 0, this._size - 1, l, r)
  }

  private queryRangeMax(node: number, nodeStart: number, nodeEnd: number, queryStart: number, queryEnd: number): number {
    if (queryStart > nodeEnd || queryEnd < nodeStart) return -Infinity
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      const sorted = this.tree[node]!.sorted
      return sorted[sorted.length - 1]!
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    return Math.max(
      this.queryRangeMax(node * 2, nodeStart, mid, queryStart, queryEnd),
      this.queryRangeMax(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd),
    )
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): number[] {
    return [...this._data]
  }

  toString(): string {
    return `MergeSortTree([${this._data.join(', ')}])`
  }

  clone(): MergeSortTree {
    return new MergeSortTree(this._data)
  }
}

export type { MergeSortTreeNode } from './types.js'
