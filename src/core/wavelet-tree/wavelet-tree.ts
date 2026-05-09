import type { WaveletTreeOptions } from './types.js'
import { DEFAULT_WAVELETTREE_OPTIONS } from './types.js'

class WTNode {
  bitvector: number[]
  rankPrefix: number[]
  left: WTNode | null
  right: WTNode | null
  lo: number
  hi: number

  constructor(lo: number, hi: number) {
    this.bitvector = []
    this.rankPrefix = [0]
    this.left = null
    this.right = null
    this.lo = lo
    this.hi = hi
  }
}

export class WaveletTree {
  private root: WTNode | null
  private dataSize: number
  private options: WaveletTreeOptions

  constructor(data: number[], options?: Partial<WaveletTreeOptions>) {
    this.options = { ...DEFAULT_WAVELETTREE_OPTIONS, ...options }
    this.dataSize = data.length
    if (data.length === 0) {
      this.root = null
      return
    }
    this.root = this.build(data, 0, this.options.alphabetSize - 1)
  }

  private build(data: number[], lo: number, hi: number): WTNode | null {
    if (lo > hi) return null
    const node = new WTNode(lo, hi)
    if (lo === hi) {
      for (let i = 0; i < data.length; i++) {
        node.bitvector.push(0)
        node.rankPrefix.push(0)
      }
      return node
    }
    const mid = Math.floor((lo + hi) / 2)
    const leftData: number[] = []
    const rightData: number[] = []
    for (let i = 0; i < data.length; i++) {
      const val = data[i]!
      if (val <= mid) {
        node.bitvector.push(0)
        leftData.push(val)
      } else {
        node.bitvector.push(1)
        rightData.push(val)
      }
      node.rankPrefix.push(node.rankPrefix[node.rankPrefix.length - 1]! + (val > mid ? 1 : 0))
    }
    node.left = leftData.length > 0 ? this.build(leftData, lo, mid) : null
    node.right = rightData.length > 0 ? this.build(rightData, mid + 1, hi) : null
    return node
  }

  access(index: number): number | undefined {
    if (index < 0 || index >= this.dataSize || !this.root) return undefined
    return this.accessRec(this.root, index)
  }

  private accessRec(node: WTNode, index: number): number {
    if (node.lo === node.hi) return node.lo
    const bit = node.bitvector[index]!
    if (bit === 0) {
      const newIndex = index - node.rankPrefix[index]!
      return this.accessRec(node.left!, newIndex)
    } else {
      const newIndex = node.rankPrefix[index]!
      return this.accessRec(node.right!, newIndex)
    }
  }

  rank(symbol: number, end: number): number {
    if (end < 0 || end > this.dataSize || !this.root) return 0
    if (symbol < 0 || symbol >= this.options.alphabetSize) return 0
    return this.rankRec(this.root, symbol, end)
  }

  private rankRec(node: WTNode | null, symbol: number, end: number): number {
    if (!node || end <= 0) return 0
    if (node.lo === node.hi) return end
    const mid = Math.floor((node.lo + node.hi) / 2)
    if (symbol <= mid) {
      const newEnd = end - node.rankPrefix[end]!
      return this.rankRec(node.left, symbol, newEnd)
    } else {
      const newEnd = node.rankPrefix[end]!
      return this.rankRec(node.right, symbol, newEnd)
    }
  }

  select(symbol: number, occurrence: number): number | undefined {
    if (occurrence <= 0 || !this.root) return undefined
    if (symbol < 0 || symbol >= this.options.alphabetSize) return undefined
    const result = this.selectRec(this.root, symbol, occurrence)
    return result === -1 ? undefined : result
  }

  private selectRec(node: WTNode | null, symbol: number, occurrence: number): number {
    if (!node) return -1
    if (node.lo === node.hi) {
      if (occurrence > node.bitvector.length) return -1
      return occurrence - 1
    }
    const mid = Math.floor((node.lo + node.hi) / 2)
    if (symbol <= mid) {
      const pos = this.selectRec(node.left, symbol, occurrence)
      if (pos === -1) return -1
      return this.select0(node, pos + 1)
    } else {
      const pos = this.selectRec(node.right, symbol, occurrence)
      if (pos === -1) return -1
      return this.select1(node, pos + 1)
    }
  }

  private select0(node: WTNode, n: number): number {
    let lo = 0
    let hi = node.bitvector.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if ((mid + 1) - node.rankPrefix[mid + 1]! < n) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo < node.bitvector.length ? lo : -1
  }

  private select1(node: WTNode, n: number): number {
    let lo = 0
    let hi = node.bitvector.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (node.rankPrefix[mid + 1]! < n) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo < node.bitvector.length ? lo : -1
  }

  rangeCount(start: number, end: number, symbol: number): number {
    if (start < 0 || end > this.dataSize || start >= end) return 0
    return this.rank(symbol, end) - this.rank(symbol, start)
  }

  rangeQuantile(start: number, end: number, k: number): number | undefined {
    if (start < 0 || end > this.dataSize || start >= end || k < 0 || k >= end - start) return undefined
    if (!this.root) return undefined
    return this.rangeQuantileRec(this.root, start, end, k)
  }

  private rangeQuantileRec(node: WTNode, start: number, end: number, k: number): number {
    if (node.lo === node.hi) return node.lo
    const zerosBefore = start - node.rankPrefix[start]!
    const zerosEnd = end - node.rankPrefix[end]!
    const zerosInRange = zerosEnd - zerosBefore
    if (k < zerosInRange) {
      return this.rangeQuantileRec(node.left!, zerosBefore, zerosEnd, k)
    } else {
      const onesBefore = node.rankPrefix[start]!
      const onesEnd = node.rankPrefix[end]!
      return this.rangeQuantileRec(node.right!, onesBefore, onesEnd, k - zerosInRange)
    }
  }

  size(): number {
    return this.dataSize
  }

  isEmpty(): boolean {
    return this.dataSize === 0
  }
}

export { DEFAULT_WAVELETTREE_OPTIONS } from './types.js'
export type { WaveletTreeOptions } from './types.js'
