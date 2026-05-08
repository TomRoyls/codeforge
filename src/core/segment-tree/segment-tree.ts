import type { SegmentTreeOptions } from './types.js'
import { DEFAULT_SEGMENT_TREE_OPTIONS } from './types.js'

export class SegmentTree {
  private tree: number[] = []
  private minTree: number[] = []
  private maxTree: number[] = []
  private _data: number[] = []
  private _size: number = 0
  private defaultValue: number

  constructor(options?: Partial<SegmentTreeOptions>) {
    const opts: SegmentTreeOptions = { ...DEFAULT_SEGMENT_TREE_OPTIONS, ...options }
    this.defaultValue = opts.defaultValue
  }

  build(data: number[]): void {
    this._data = [...data]
    this._size = data.length
    if (this._size === 0) {
      this.tree = []
      this.minTree = []
      this.maxTree = []
      return
    }
    const treeSize = 4 * this._size
    this.tree = new Array<number>(treeSize).fill(this.defaultValue)
    this.minTree = new Array<number>(treeSize).fill(0)
    this.maxTree = new Array<number>(treeSize).fill(0)
    this.buildSum(1, 0, this._size - 1)
    this.buildMin(1, 0, this._size - 1)
    this.buildMax(1, 0, this._size - 1)
  }

  private buildSum(node: number, start: number, end: number): void {
    if (start === end) {
      const val = this._data[start]
      this.tree[node] = val !== undefined ? val : this.defaultValue
      return
    }
    const mid = Math.floor((start + end) / 2)
    this.buildSum(node * 2, start, mid)
    this.buildSum(node * 2 + 1, mid + 1, end)
    this.tree[node] = this.tree[node * 2]! + this.tree[node * 2 + 1]!
  }

  private buildMin(node: number, start: number, end: number): void {
    if (start === end) {
      const val = this._data[start]
      this.minTree[node] = val !== undefined ? val : this.defaultValue
      return
    }
    const mid = Math.floor((start + end) / 2)
    this.buildMin(node * 2, start, mid)
    this.buildMin(node * 2 + 1, mid + 1, end)
    this.minTree[node] = Math.min(this.minTree[node * 2]!, this.minTree[node * 2 + 1]!)
  }

  private buildMax(node: number, start: number, end: number): void {
    if (start === end) {
      const val = this._data[start]
      this.maxTree[node] = val !== undefined ? val : this.defaultValue
      return
    }
    const mid = Math.floor((start + end) / 2)
    this.buildMax(node * 2, start, mid)
    this.buildMax(node * 2 + 1, mid + 1, end)
    this.maxTree[node] = Math.max(this.maxTree[node * 2]!, this.maxTree[node * 2 + 1]!)
  }

  update(index: number, value: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size - 1}]`)
    }
    this._data[index] = value
    this.updateSum(1, 0, this._size - 1, index, value)
    this.updateMin(1, 0, this._size - 1, index, value)
    this.updateMax(1, 0, this._size - 1, index, value)
  }

  private updateSum(node: number, start: number, end: number, index: number, value: number): void {
    if (start === end) {
      this.tree[node] = value
      return
    }
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      this.updateSum(node * 2, start, mid, index, value)
    } else {
      this.updateSum(node * 2 + 1, mid + 1, end, index, value)
    }
    this.tree[node] = this.tree[node * 2]! + this.tree[node * 2 + 1]!
  }

  private updateMin(node: number, start: number, end: number, index: number, value: number): void {
    if (start === end) {
      this.minTree[node] = value
      return
    }
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      this.updateMin(node * 2, start, mid, index, value)
    } else {
      this.updateMin(node * 2 + 1, mid + 1, end, index, value)
    }
    this.minTree[node] = Math.min(this.minTree[node * 2]!, this.minTree[node * 2 + 1]!)
  }

  private updateMax(node: number, start: number, end: number, index: number, value: number): void {
    if (start === end) {
      this.maxTree[node] = value
      return
    }
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      this.updateMax(node * 2, start, mid, index, value)
    } else {
      this.updateMax(node * 2 + 1, mid + 1, end, index, value)
    }
    this.maxTree[node] = Math.max(this.maxTree[node * 2]!, this.maxTree[node * 2 + 1]!)
  }

  query(start: number, end: number): number {
    if (this._size === 0) return this.defaultValue
    if (start < 0 || end >= this._size || start > end) {
      throw new RangeError(`Invalid range [${start}, ${end}] for size ${this._size}`)
    }
    return this.querySum(1, 0, this._size - 1, start, end)
  }

  private querySum(node: number, nodeStart: number, nodeEnd: number, queryStart: number, queryEnd: number): number {
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      return this.tree[node]!
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    if (queryEnd <= mid) {
      return this.querySum(node * 2, nodeStart, mid, queryStart, queryEnd)
    }
    if (queryStart > mid) {
      return this.querySum(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd)
    }
    return this.querySum(node * 2, nodeStart, mid, queryStart, queryEnd) +
      this.querySum(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd)
  }

  queryAll(): number {
    if (this._size === 0) return this.defaultValue
    return this.tree[1]!
  }

  get(index: number): number {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size - 1}]`)
    }
    return this._data[index]!
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.tree = []
    this.minTree = []
    this.maxTree = []
    this._data = []
    this._size = 0
  }

  getData(): number[] {
    return [...this._data]
  }

  getRangeMin(start: number, end: number): number {
    if (this._size === 0) return this.defaultValue
    if (start < 0 || end >= this._size || start > end) {
      throw new RangeError(`Invalid range [${start}, ${end}] for size ${this._size}`)
    }
    return this.queryMin(1, 0, this._size - 1, start, end)
  }

  private queryMin(node: number, nodeStart: number, nodeEnd: number, queryStart: number, queryEnd: number): number {
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      return this.minTree[node]!
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    if (queryEnd <= mid) {
      return this.queryMin(node * 2, nodeStart, mid, queryStart, queryEnd)
    }
    if (queryStart > mid) {
      return this.queryMin(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd)
    }
    return Math.min(
      this.queryMin(node * 2, nodeStart, mid, queryStart, queryEnd),
      this.queryMin(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd),
    )
  }

  getRangeMax(start: number, end: number): number {
    if (this._size === 0) return this.defaultValue
    if (start < 0 || end >= this._size || start > end) {
      throw new RangeError(`Invalid range [${start}, ${end}] for size ${this._size}`)
    }
    return this.queryMax(1, 0, this._size - 1, start, end)
  }

  private queryMax(node: number, nodeStart: number, nodeEnd: number, queryStart: number, queryEnd: number): number {
    if (queryStart <= nodeStart && nodeEnd <= queryEnd) {
      return this.maxTree[node]!
    }
    const mid = Math.floor((nodeStart + nodeEnd) / 2)
    if (queryEnd <= mid) {
      return this.queryMax(node * 2, nodeStart, mid, queryStart, queryEnd)
    }
    if (queryStart > mid) {
      return this.queryMax(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd)
    }
    return Math.max(
      this.queryMax(node * 2, nodeStart, mid, queryStart, queryEnd),
      this.queryMax(node * 2 + 1, mid + 1, nodeEnd, queryStart, queryEnd),
    )
  }

  getRangeSum(start: number, end: number): number {
    return this.query(start, end)
  }
}

export { DEFAULT_SEGMENT_TREE_OPTIONS } from './types.js'
export type { SegmentTreeOptions } from './types.js'
