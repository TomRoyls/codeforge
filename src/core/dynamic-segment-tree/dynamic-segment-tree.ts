import type { SegmentNode } from "./types.js"

export class DynamicSegmentTree {
  private _root: SegmentNode | null
  private _minRange: number
  private _maxRange: number
  private _count: number

  constructor(minRange: number, maxRange: number) {
    if (minRange > maxRange) {
      throw new Error("minRange must be <= maxRange")
    }
    this._minRange = minRange
    this._maxRange = maxRange
    this._root = null
    this._count = 0
  }

  private _createNode(): SegmentNode {
    return { sum: 0, min: Infinity, max: -Infinity, left: null, right: null }
  }

  private _ensureNode(node: SegmentNode | null): SegmentNode {
    if (node === null) {
      return this._createNode()
    }
    return node
  }

  private _updatePoint(
    node: SegmentNode | null,
    nl: number,
    nr: number,
    index: number,
    value: number,
    mode: "set" | "add",
  ): SegmentNode {
    node = this._ensureNode(node)
    if (nl === nr) {
      if (mode === "set") {
        const prev = node.sum
        node.sum = value
        if (prev === 0 && value !== 0) {
          this._count++
        } else if (prev !== 0 && value === 0) {
          this._count--
        }
      } else {
        const wasZero = node.sum === 0
        node.sum += value
        if (wasZero && node.sum !== 0) {
          this._count++
        } else if (!wasZero && node.sum === 0) {
          this._count--
        }
      }
      node.min = node.sum
      node.max = node.sum
      return node
    }
    const mid = Math.floor((nl + nr) / 2)
    if (index <= mid) {
      node.left = this._updatePoint(node.left, nl, mid, index, value, mode)
    } else {
      node.right = this._updatePoint(node.right, mid + 1, nr, index, value, mode)
    }
    const leftNode = node.left
    const rightNode = node.right
    const leftSum = leftNode !== null ? leftNode.sum : 0
    const rightSum = rightNode !== null ? rightNode.sum : 0
    const leftMin = leftNode !== null ? leftNode.min : Infinity
    const rightMin = rightNode !== null ? rightNode.min : Infinity
    const leftMax = leftNode !== null ? leftNode.max : -Infinity
    const rightMax = rightNode !== null ? rightNode.max : -Infinity
    node.sum = leftSum + rightSum
    node.min = Math.min(leftMin, rightMin)
    node.max = Math.max(leftMax, rightMax)
    return node
  }

  update(index: number, value: number): void {
    if (index < this._minRange || index > this._maxRange) {
      throw new RangeError(`Index ${index} out of range [${this._minRange}, ${this._maxRange}]`)
    }
    this._root = this._updatePoint(this._root, this._minRange, this._maxRange, index, value, "set")
  }

  add(index: number, value: number): void {
    if (index < this._minRange || index > this._maxRange) {
      throw new RangeError(`Index ${index} out of range [${this._minRange}, ${this._maxRange}]`)
    }
    this._root = this._updatePoint(this._root, this._minRange, this._maxRange, index, value, "add")
  }

  private _querySum(
    node: SegmentNode | null,
    nl: number,
    nr: number,
    ql: number,
    qr: number,
  ): number {
    if (node === null || ql > nr || qr < nl) {
      return 0
    }
    if (ql <= nl && nr <= qr) {
      return node.sum
    }
    const mid = Math.floor((nl + nr) / 2)
    return (
      this._querySum(node.left, nl, mid, ql, qr) +
      this._querySum(node.right, mid + 1, nr, ql, qr)
    )
  }

  query(l: number, r: number): number {
    if (l > r) {
      throw new Error("Left bound must be <= right bound")
    }
    if (l < this._minRange || r > this._maxRange) {
      throw new RangeError(
        `Query range [${l}, ${r}] out of bounds [${this._minRange}, ${this._maxRange}]`,
      )
    }
    return this._querySum(this._root, this._minRange, this._maxRange, l, r)
  }

  private _queryPoint(node: SegmentNode | null, nl: number, nr: number, index: number): number {
    if (node === null) {
      return 0
    }
    if (nl === nr) {
      return node.sum
    }
    const mid = Math.floor((nl + nr) / 2)
    if (index <= mid) {
      return this._queryPoint(node.left, nl, mid, index)
    }
    return this._queryPoint(node.right, mid + 1, nr, index)
  }

  queryPoint(index: number): number {
    if (index < this._minRange || index > this._maxRange) {
      throw new RangeError(`Index ${index} out of range [${this._minRange}, ${this._maxRange}]`)
    }
    return this._queryPoint(this._root, this._minRange, this._maxRange, index)
  }

  private _queryMin(
    node: SegmentNode | null,
    nl: number,
    nr: number,
    ql: number,
    qr: number,
  ): number {
    if (node === null || ql > nr || qr < nl) {
      return Infinity
    }
    if (ql <= nl && nr <= qr) {
      return node.min
    }
    const mid = Math.floor((nl + nr) / 2)
    return Math.min(
      this._queryMin(node.left, nl, mid, ql, qr),
      this._queryMin(node.right, mid + 1, nr, ql, qr),
    )
  }

  rangeMin(l: number, r: number): number {
    if (l > r) {
      throw new Error("Left bound must be <= right bound")
    }
    if (l < this._minRange || r > this._maxRange) {
      throw new RangeError(
        `Query range [${l}, ${r}] out of bounds [${this._minRange}, ${this._maxRange}]`,
      )
    }
    return this._queryMin(this._root, this._minRange, this._maxRange, l, r)
  }

  private _queryMax(
    node: SegmentNode | null,
    nl: number,
    nr: number,
    ql: number,
    qr: number,
  ): number {
    if (node === null || ql > nr || qr < nl) {
      return -Infinity
    }
    if (ql <= nl && nr <= qr) {
      return node.max
    }
    const mid = Math.floor((nl + nr) / 2)
    return Math.max(
      this._queryMax(node.left, nl, mid, ql, qr),
      this._queryMax(node.right, mid + 1, nr, ql, qr),
    )
  }

  rangeMax(l: number, r: number): number {
    if (l > r) {
      throw new Error("Left bound must be <= right bound")
    }
    if (l < this._minRange || r > this._maxRange) {
      throw new RangeError(
        `Query range [${l}, ${r}] out of bounds [${this._minRange}, ${this._maxRange}]`,
      )
    }
    return this._queryMax(this._root, this._minRange, this._maxRange, l, r)
  }

  size(): number {
    return this._count
  }

  isEmpty(): boolean {
    return this._count === 0
  }

  private _collectPairs(
    node: SegmentNode | null,
    nl: number,
    nr: number,
    result: Array<[number, number]>,
  ): void {
    if (node === null) {
      return
    }
    if (nl === nr) {
      if (node.sum !== 0) {
        result.push([nl, node.sum])
      }
      return
    }
    if (node.left !== null || node.right !== null) {
      const mid = Math.floor((nl + nr) / 2)
      this._collectPairs(node.left, nl, mid, result)
      this._collectPairs(node.right, mid + 1, nr, result)
    }
  }

  toArray(): Array<[number, number]> {
    const result: Array<[number, number]> = []
    this._collectPairs(this._root, this._minRange, this._maxRange, result)
    result.sort((a, b) => a[0] - b[0])
    return result
  }

  private _buildString(
    node: SegmentNode | null,
    nl: number,
    nr: number,
    lines: string[],
  ): void {
    if (node === null) {
      return
    }
    if (nl === nr) {
      if (node.sum !== 0) {
        lines.push(`[${nl}]:${node.sum}`)
      }
      return
    }
    const mid = Math.floor((nl + nr) / 2)
    if (node.left !== null) {
      this._buildString(node.left, nl, mid, lines)
    }
    if (node.right !== null) {
      this._buildString(node.right, mid + 1, nr, lines)
    }
  }

  toString(): string {
    const lines: string[] = []
    this._buildString(this._root, this._minRange, this._maxRange, lines)
    if (lines.length === 0) {
      return "DynamicSegmentTree(empty)"
    }
    return `DynamicSegmentTree{${lines.join(", ")}}`
  }

  private _cloneNode(node: SegmentNode | null): SegmentNode | null {
    if (node === null) {
      return null
    }
    return {
      sum: node.sum,
      min: node.min,
      max: node.max,
      left: this._cloneNode(node.left),
      right: this._cloneNode(node.right),
    }
  }

  clone(): DynamicSegmentTree {
    const copy = new DynamicSegmentTree(this._minRange, this._maxRange)
    copy._root = this._cloneNode(this._root)
    copy._count = this._count
    return copy
  }

  reset(): void {
    this._root = null
    this._count = 0
  }
}
