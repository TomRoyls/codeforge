import type { LazySegmentTreeOptions } from "./types.js"

export class LazySegmentTree {
  private _size: number
  private _identity: number
  private _tree: number[]
  private _lazy: number[]
  private _minTree: number[]
  private _maxTree: number[]
  private _actualSize: number

  constructor(sizeOrOptions?: number | LazySegmentTreeOptions, identity?: number) {
    if (typeof sizeOrOptions === "object") {
      this._size = sizeOrOptions.size
      this._identity = sizeOrOptions.identity ?? 0
    } else {
      this._size = sizeOrOptions ?? 0
      this._identity = identity ?? 0
    }
    this._actualSize = 1
    while (this._actualSize < this._size) {
      this._actualSize *= 2
    }
    const nodeCount = 2 * this._actualSize
    this._tree = new Array(nodeCount).fill(this._identity)
    this._lazy = new Array(nodeCount).fill(0)
    this._minTree = new Array(nodeCount).fill(Infinity)
    this._maxTree = new Array(nodeCount).fill(-Infinity)
  }

  private _pushDown(node: number, nodeLeft: number, nodeRight: number): void {
    const lazyVal = this._lazy[node]!
    if (lazyVal !== 0 && nodeLeft !== nodeRight) {
      const mid = Math.floor((nodeLeft + nodeRight) / 2)
      const leftLen = mid - nodeLeft + 1
      const rightLen = nodeRight - mid
      this._tree[node * 2]! += lazyVal * leftLen
      this._tree[node * 2 + 1]! += lazyVal * rightLen
      this._minTree[node * 2]! += lazyVal
      this._minTree[node * 2 + 1]! += lazyVal
      this._maxTree[node * 2]! += lazyVal
      this._maxTree[node * 2 + 1]! += lazyVal
      this._lazy[node * 2]! += lazyVal
      this._lazy[node * 2 + 1]! += lazyVal
      this._lazy[node] = 0
    }
  }

  private _updateRangeAdd(
    node: number,
    nodeLeft: number,
    nodeRight: number,
    queryLeft: number,
    queryRight: number,
    value: number,
  ): void {
    if (queryLeft > nodeRight || queryRight < nodeLeft) return
    if (queryLeft <= nodeLeft && nodeRight <= queryRight) {
      const len = nodeRight - nodeLeft + 1
      this._tree[node]! += value * len
      this._minTree[node]! += value
      this._maxTree[node]! += value
      this._lazy[node]! += value
      return
    }
    this._pushDown(node, nodeLeft, nodeRight)
    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    this._updateRangeAdd(node * 2, nodeLeft, mid, queryLeft, queryRight, value)
    this._updateRangeAdd(node * 2 + 1, mid + 1, nodeRight, queryLeft, queryRight, value)
    this._tree[node]! = this._tree[node * 2]! + this._tree[node * 2 + 1]!
    this._minTree[node]! = Math.min(this._minTree[node * 2]!, this._minTree[node * 2 + 1]!)
    this._maxTree[node]! = Math.max(this._maxTree[node * 2]!, this._maxTree[node * 2 + 1]!)
  }

  private _queryRangeSum(
    node: number,
    nodeLeft: number,
    nodeRight: number,
    queryLeft: number,
    queryRight: number,
  ): number {
    if (queryLeft > nodeRight || queryRight < nodeLeft) return this._identity
    if (queryLeft <= nodeLeft && nodeRight <= queryRight) return this._tree[node]!
    this._pushDown(node, nodeLeft, nodeRight)
    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    return (
      this._queryRangeSum(node * 2, nodeLeft, mid, queryLeft, queryRight) +
      this._queryRangeSum(node * 2 + 1, mid + 1, nodeRight, queryLeft, queryRight)
    )
  }

  private _queryRangeMin(
    node: number,
    nodeLeft: number,
    nodeRight: number,
    queryLeft: number,
    queryRight: number,
  ): number {
    if (queryLeft > nodeRight || queryRight < nodeLeft) return Infinity
    if (queryLeft <= nodeLeft && nodeRight <= queryRight) return this._minTree[node]!
    this._pushDown(node, nodeLeft, nodeRight)
    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    return Math.min(
      this._queryRangeMin(node * 2, nodeLeft, mid, queryLeft, queryRight),
      this._queryRangeMin(node * 2 + 1, mid + 1, nodeRight, queryLeft, queryRight),
    )
  }

  private _queryRangeMax(
    node: number,
    nodeLeft: number,
    nodeRight: number,
    queryLeft: number,
    queryRight: number,
  ): number {
    if (queryLeft > nodeRight || queryRight < nodeLeft) return -Infinity
    if (queryLeft <= nodeLeft && nodeRight <= queryRight) return this._maxTree[node]!
    this._pushDown(node, nodeLeft, nodeRight)
    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    return Math.max(
      this._queryRangeMax(node * 2, nodeLeft, mid, queryLeft, queryRight),
      this._queryRangeMax(node * 2 + 1, mid + 1, nodeRight, queryLeft, queryRight),
    )
  }

  private _setPoint(
    node: number,
    nodeLeft: number,
    nodeRight: number,
    index: number,
    value: number,
  ): void {
    if (nodeLeft === nodeRight) {
      this._tree[node] = value
      this._minTree[node] = value
      this._maxTree[node] = value
      return
    }
    this._pushDown(node, nodeLeft, nodeRight)
    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    if (index <= mid) {
      this._setPoint(node * 2, nodeLeft, mid, index, value)
    } else {
      this._setPoint(node * 2 + 1, mid + 1, nodeRight, index, value)
    }
    this._tree[node]! = this._tree[node * 2]! + this._tree[node * 2 + 1]!
    this._minTree[node]! = Math.min(this._minTree[node * 2]!, this._minTree[node * 2 + 1]!)
    this._maxTree[node]! = Math.max(this._maxTree[node * 2]!, this._maxTree[node * 2 + 1]!)
  }

  private _getPoint(node: number, nodeLeft: number, nodeRight: number, index: number): number {
    if (nodeLeft === nodeRight) return this._tree[node]!
    this._pushDown(node, nodeLeft, nodeRight)
    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    if (index <= mid) {
      return this._getPoint(node * 2, nodeLeft, mid, index)
    }
    return this._getPoint(node * 2 + 1, mid + 1, nodeRight, index)
  }

  private _multiplyRange(
    node: number,
    nodeLeft: number,
    nodeRight: number,
    queryLeft: number,
    queryRight: number,
    value: number,
  ): void {
    if (queryLeft > nodeRight || queryRight < nodeLeft) return
    if (nodeLeft === nodeRight) {
      this._tree[node]! *= value
      this._minTree[node]! *= value
      this._maxTree[node]! *= value
      return
    }
    this._pushDown(node, nodeLeft, nodeRight)
    const mid = Math.floor((nodeLeft + nodeRight) / 2)
    this._multiplyRange(node * 2, nodeLeft, mid, queryLeft, queryRight, value)
    this._multiplyRange(node * 2 + 1, mid + 1, nodeRight, queryLeft, queryRight, value)
    this._tree[node]! = this._tree[node * 2]! + this._tree[node * 2 + 1]!
    this._minTree[node]! = Math.min(this._minTree[node * 2]!, this._minTree[node * 2 + 1]!)
    this._maxTree[node]! = Math.max(this._maxTree[node * 2]!, this._maxTree[node * 2 + 1]!)
  }

  build(values: number[]): void {
    this._size = values.length
    this._actualSize = 1
    while (this._actualSize < this._size) {
      this._actualSize *= 2
    }
    const nodeCount = 2 * this._actualSize
    this._tree = new Array(nodeCount).fill(this._identity)
    this._lazy = new Array(nodeCount).fill(0)
    this._minTree = new Array(nodeCount).fill(Infinity)
    this._maxTree = new Array(nodeCount).fill(-Infinity)
    for (let i = 0; i < this._size; i++) {
      this._tree[this._actualSize + i]! = values[i]!
      this._minTree[this._actualSize + i]! = values[i]!
      this._maxTree[this._actualSize + i]! = values[i]!
    }
    for (let i = this._actualSize - 1; i >= 1; i--) {
      this._tree[i]! = this._tree[i * 2]! + this._tree[i * 2 + 1]!
      this._minTree[i]! = Math.min(this._minTree[i * 2]!, this._minTree[i * 2 + 1]!)
      this._maxTree[i]! = Math.max(this._maxTree[i * 2]!, this._maxTree[i * 2 + 1]!)
    }
  }

  updateRange(l: number, r: number, value: number): void {
    if (this._size === 0) return
    const clampedL = Math.max(0, l)
    const clampedR = Math.min(this._size - 1, r)
    if (clampedL > clampedR) return
    this._updateRangeAdd(1, 0, this._actualSize - 1, clampedL, clampedR, value)
  }

  queryRange(l: number, r: number): number {
    if (this._size === 0) return this._identity
    const clampedL = Math.max(0, l)
    const clampedR = Math.min(this._size - 1, r)
    if (clampedL > clampedR) return this._identity
    return this._queryRangeSum(1, 0, this._actualSize - 1, clampedL, clampedR)
  }

  setPoint(i: number, v: number): void {
    if (i < 0 || i >= this._size) return
    this._setPoint(1, 0, this._actualSize - 1, i, v)
  }

  getPoint(i: number): number {
    if (i < 0 || i >= this._size) return this._identity
    return this._getPoint(1, 0, this._actualSize - 1, i)
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.getPoint(i))
    }
    return result
  }

  toString(): string {
    return this.toArray().join(",")
  }

  clone(): LazySegmentTree {
    const cloned = new LazySegmentTree(this._size, this._identity)
    cloned._actualSize = this._actualSize
    cloned._tree = [...this._tree]
    cloned._lazy = [...this._lazy]
    cloned._minTree = [...this._minTree]
    cloned._maxTree = [...this._maxTree]
    return cloned
  }

  equals(other: LazySegmentTree): boolean {
    if (this._size !== other._size) return false
    for (let i = 0; i < this._size; i++) {
      if (this.getPoint(i) !== other.getPoint(i)) return false
    }
    return true
  }

  reset(): void {
    const nodeCount = 2 * this._actualSize
    this._tree = new Array(nodeCount).fill(this._identity)
    this._lazy = new Array(nodeCount).fill(0)
    this._minTree = new Array(nodeCount).fill(Infinity)
    this._maxTree = new Array(nodeCount).fill(-Infinity)
    this._size = 0
  }

  rangeMin(l: number, r: number): number {
    if (this._size === 0) return this._identity
    const clampedL = Math.max(0, l)
    const clampedR = Math.min(this._size - 1, r)
    if (clampedL > clampedR) return this._identity
    return this._queryRangeMin(1, 0, this._actualSize - 1, clampedL, clampedR)
  }

  rangeMax(l: number, r: number): number {
    if (this._size === 0) return this._identity
    const clampedL = Math.max(0, l)
    const clampedR = Math.min(this._size - 1, r)
    if (clampedL > clampedR) return this._identity
    return this._queryRangeMax(1, 0, this._actualSize - 1, clampedL, clampedR)
  }

  multiplyRange(l: number, r: number, value: number): void {
    if (this._size === 0) return
    const clampedL = Math.max(0, l)
    const clampedR = Math.min(this._size - 1, r)
    if (clampedL > clampedR) return
    this._multiplyRange(1, 0, this._actualSize - 1, clampedL, clampedR, value)
  }
}
