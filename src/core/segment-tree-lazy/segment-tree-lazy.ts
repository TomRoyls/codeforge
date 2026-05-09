import type { SegmentTreeLazyOptions } from './types.js'
import { DEFAULT_SEGMENT_TREE_LAZY_OPTIONS, SUM_OPTIONS, MIN_OPTIONS, MAX_OPTIONS } from './types.js'

const NO_LAZY = 0
const LAZY_ADD = 1
const LAZY_SET = 2

export class SegmentTreeLazy {
  private tree: number[] = []
  private lazyValue: number[] = []
  private lazyType: number[] = []
  private _size: number = 0
  private opts: SegmentTreeLazyOptions

  constructor(data: number[], options?: Partial<SegmentTreeLazyOptions>) {
    this.opts = { ...DEFAULT_SEGMENT_TREE_LAZY_OPTIONS, ...options }
    this.build(data)
  }

  static createSum(data: number[]): SegmentTreeLazy {
    return new SegmentTreeLazy(data, SUM_OPTIONS)
  }

  static createMin(data: number[]): SegmentTreeLazy {
    return new SegmentTreeLazy(data, MIN_OPTIONS)
  }

  static createMax(data: number[]): SegmentTreeLazy {
    return new SegmentTreeLazy(data, MAX_OPTIONS)
  }

  private build(data: number[]): void {
    this._size = data.length
    if (this._size === 0) {
      this.tree = []
      this.lazyValue = []
      this.lazyType = []
      return
    }
    const treeSize = 4 * this._size
    this.tree = new Array<number>(treeSize).fill(this.opts.identity)
    this.lazyValue = new Array<number>(treeSize).fill(0)
    this.lazyType = new Array<number>(treeSize).fill(NO_LAZY)
    this.buildTree(1, 0, this._size - 1, data)
  }

  private buildTree(node: number, start: number, end: number, data: number[]): void {
    if (start === end) {
      this.tree[node] = data[start]!
      return
    }
    const mid = Math.floor((start + end) / 2)
    this.buildTree(node * 2, start, mid, data)
    this.buildTree(node * 2 + 1, mid + 1, end, data)
    this.tree[node] = this.opts.combine(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private applyAdd(node: number, start: number, end: number, value: number): void {
    const rangeLen = end - start + 1
    if (this.lazyType[node] === LAZY_SET) {
      const newVal = this.lazyValue[node]! + value
      if (this.opts.identity === 0) {
        this.tree[node] = newVal * rangeLen
      } else {
        this.tree[node] = newVal
      }
      this.lazyValue[node] = newVal
      return
    }
    if (this.opts.identity === 0) {
      this.tree[node]! += value * rangeLen
    } else if (this.opts.identity === Infinity || this.opts.identity === -Infinity) {
      this.tree[node]! += value
    } else {
      this.tree[node]! += value * rangeLen
    }
    this.lazyType[node] = LAZY_ADD
    this.lazyValue[node] = this.lazyValue[node]! + value
  }

  private applySet(node: number, _start: number, end: number, value: number): void {
    const rangeLen = end - _start + 1
    if (this.opts.identity === 0) {
      this.tree[node] = value * rangeLen
    } else {
      this.tree[node] = value
      void rangeLen
    }
    this.lazyType[node] = LAZY_SET
    this.lazyValue[node] = value
  }

  private pushDown(node: number, start: number, end: number): void {
    if (this.lazyType[node] === NO_LAZY) return
    if (start === end) {
      this.lazyType[node] = NO_LAZY
      this.lazyValue[node] = 0
      return
    }
    const mid = Math.floor((start + end) / 2)
    const leftChild = node * 2
    const rightChild = node * 2 + 1
    if (this.lazyType[node] === LAZY_SET) {
      this.applySet(leftChild, start, mid, this.lazyValue[node]!)
      this.applySet(rightChild, mid + 1, end, this.lazyValue[node]!)
    } else if (this.lazyType[node] === LAZY_ADD) {
      this.applyAdd(leftChild, start, mid, this.lazyValue[node]!)
      this.applyAdd(rightChild, mid + 1, end, this.lazyValue[node]!)
    }
    this.lazyType[node] = NO_LAZY
    this.lazyValue[node] = 0
  }

  update(index: number, value: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size - 1}]`)
    }
    this.updatePoint(1, 0, this._size - 1, index, value)
  }

  private updatePoint(node: number, start: number, end: number, index: number, value: number): void {
    this.pushDown(node, start, end)
    if (start === end) {
      this.tree[node] = value
      return
    }
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      this.updatePoint(node * 2, start, mid, index, value)
    } else {
      this.updatePoint(node * 2 + 1, mid + 1, end, index, value)
    }
    this.tree[node] = this.opts.combine(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  query(left: number, right: number): number {
    if (this._size === 0) return this.opts.identity
    if (left < 0 || right >= this._size || left > right) {
      throw new RangeError(`Invalid range [${left}, ${right}] for size ${this._size}`)
    }
    return this.queryRange(1, 0, this._size - 1, left, right)
  }

  private queryRange(node: number, start: number, end: number, left: number, right: number): number {
    if (left <= start && end <= right) {
      return this.tree[node]!
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    if (right <= mid) {
      return this.queryRange(node * 2, start, mid, left, right)
    }
    if (left > mid) {
      return this.queryRange(node * 2 + 1, mid + 1, end, left, right)
    }
    return this.opts.combine(
      this.queryRange(node * 2, start, mid, left, right),
      this.queryRange(node * 2 + 1, mid + 1, end, left, right),
    )
  }

  rangeAdd(left: number, right: number, value: number): void {
    if (this._size === 0) return
    if (left < 0 || right >= this._size || left > right) {
      throw new RangeError(`Invalid range [${left}, ${right}] for size ${this._size}`)
    }
    this.rangeAddImpl(1, 0, this._size - 1, left, right, value)
  }

  private rangeAddImpl(node: number, start: number, end: number, left: number, right: number, value: number): void {
    if (left <= start && end <= right) {
      this.applyAdd(node, start, end, value)
      return
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    if (left <= mid) {
      this.rangeAddImpl(node * 2, start, mid, left, right, value)
    }
    if (right > mid) {
      this.rangeAddImpl(node * 2 + 1, mid + 1, end, left, right, value)
    }
    this.tree[node] = this.opts.combine(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  rangeSet(left: number, right: number, value: number): void {
    if (this._size === 0) return
    if (left < 0 || right >= this._size || left > right) {
      throw new RangeError(`Invalid range [${left}, ${right}] for size ${this._size}`)
    }
    this.rangeSetImpl(1, 0, this._size - 1, left, right, value)
  }

  private rangeSetImpl(node: number, start: number, end: number, left: number, right: number, value: number): void {
    if (left <= start && end <= right) {
      this.applySet(node, start, end, value)
      return
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    if (left <= mid) {
      this.rangeSetImpl(node * 2, start, mid, left, right, value)
    }
    if (right > mid) {
      this.rangeSetImpl(node * 2 + 1, mid + 1, end, left, right, value)
    }
    this.tree[node] = this.opts.combine(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  get(index: number): number {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size - 1}]`)
    }
    return this.getPoint(1, 0, this._size - 1, index)
  }

  private getPoint(node: number, start: number, end: number, index: number): number {
    if (start === end) {
      return this.tree[node]!
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      return this.getPoint(node * 2, start, mid, index)
    }
    return this.getPoint(node * 2 + 1, mid + 1, end, index)
  }

  size(): number {
    return this._size
  }

  toArray(): number[] {
    if (this._size === 0) return []
    const result: number[] = []
    this.collectToArray(1, 0, this._size - 1, result)
    return result
  }

  private collectToArray(node: number, start: number, end: number, result: number[]): void {
    if (start === end) {
      result[start] = this.tree[node]!
      return
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    this.collectToArray(node * 2, start, mid, result)
    this.collectToArray(node * 2 + 1, mid + 1, end, result)
  }

  clone(): SegmentTreeLazy {
    const data = this.toArray()
    const cloned = new SegmentTreeLazy(data, this.opts)
    return cloned
  }
}

export { DEFAULT_SEGMENT_TREE_LAZY_OPTIONS } from './types.js'
export type { SegmentTreeLazyOptions } from './types.js'
