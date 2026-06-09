import type { WaveletTreeNode, WaveletTreeOptions, RankAllResult, WaveletTreeStats } from './types.js'

export class WaveletTree {
  private root: WaveletTreeNode | null
  private _dataSize: number
  private _alphabet: number[]
  private _symbolToIndex: Map<number, number>

  constructor(data: number[], options?: WaveletTreeOptions) {
    const providedAlphabet = options?.alphabet
    if (providedAlphabet !== undefined && providedAlphabet.length > 0) {
      this._alphabet = [...providedAlphabet].sort((a, b) => a - b)
    } else {
      this._alphabet = [...new Set(data)].sort((a, b) => a - b)
    }
    this._symbolToIndex = new Map()
    for (let i = 0; i < this._alphabet.length; i++) {
      this._symbolToIndex.set(this._alphabet[i]!, i)
    }
    this._dataSize = data.length
    if (data.length === 0 || this._alphabet.length === 0) {
      this.root = null
      return
    }
    const mapped = data.map(s => {
      const idx = this._symbolToIndex.get(s)
      if (idx === undefined) {
        throw new Error(`Value ${s} not in alphabet`)
      }
      return idx
    })
    this.root = this.build(mapped, 0, this._alphabet.length - 1)
  }

  private build(data: number[], lo: number, hi: number): WaveletTreeNode | null {
    if (lo > hi || data.length === 0) return null
    const node: WaveletTreeNode = {
      bitvector: [],
      rankPrefix: [0],
      left: null,
      right: null,
      lo,
      hi,
    }
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
      node.rankPrefix.push(
        node.rankPrefix[node.rankPrefix.length - 1]! + (val > mid ? 1 : 0)
      )
    }
    node.left = leftData.length > 0 ? this.build(leftData, lo, mid) : null
    node.right = rightData.length > 0 ? this.build(rightData, mid + 1, hi) : null
    return node
  }

  access(index: number): number {
    if (index < 0 || index >= this._dataSize || !this.root) {
      throw new Error(`Index ${index} out of range`)
    }
    return this._alphabet[this.accessRec(this.root, index)]!
  }

  private accessRec(node: WaveletTreeNode, index: number): number {
    if (node.lo === node.hi) return node.lo
    const bit = node.bitvector[index]!
    if (bit === 0) {
      const newIndex = index - node.rankPrefix[index + 1]!
      return this.accessRec(node.left!, newIndex)
    } else {
      const newIndex = node.rankPrefix[index + 1]! - 1
      return this.accessRec(node.right!, newIndex)
    }
  }

  rank(element: number, endIndex: number): number {
    if (endIndex < 0 || endIndex > this._dataSize) {
      throw new Error(`Index ${endIndex} out of range`)
    }
    if (!this._symbolToIndex.has(element) || !this.root) return 0
    return this.rankRec(this.root, this._symbolToIndex.get(element)!, endIndex)
  }

  private rankRec(node: WaveletTreeNode | null, symbol: number, end: number): number {
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

  select(element: number, occurrence: number): number {
    if (occurrence < 1) {
      throw new Error('Occurrence must be positive (1-indexed)')
    }
    if (!this._symbolToIndex.has(element) || !this.root) {
      throw new Error(`Element ${element} not in alphabet`)
    }
    const total = this.rank(element, this._dataSize)
    if (occurrence > total) {
      throw new Error(`Element ${element} only has ${total} occurrences`)
    }
    let lo = 0
    let hi = this._dataSize
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (this.rank(element, mid + 1) < occurrence) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  quantile(left: number, right: number, k: number): number {
    if (left < 0 || right > this._dataSize || left >= right) {
      throw new Error(`Invalid range [${left}, ${right})`)
    }
    if (k < 1 || k > right - left) {
      throw new Error(`Invalid quantile k=${k} for range of size ${right - left}`)
    }
    if (!this.root) {
      throw new Error('WaveletTree is empty')
    }
    const symbolIdx = this.quantileRec(this.root, left, right, k)
    return this._alphabet[symbolIdx]!
  }

  private quantileRec(node: WaveletTreeNode, left: number, right: number, k: number): number {
    if (node.lo === node.hi) return node.lo
    const onesBeforeLeft = node.rankPrefix[left]!
    const onesBeforeRight = node.rankPrefix[right]!
    const zerosInLeft = left - onesBeforeLeft
    const zerosInRange = (right - left) - (onesBeforeRight - onesBeforeLeft)
    if (k <= zerosInRange) {
      const newLeft = zerosInLeft
      const newRight = zerosInLeft + zerosInRange
      return this.quantileRec(node.left!, newLeft, newRight, k)
    } else {
      const newLeft = onesBeforeLeft
      const newRight = onesBeforeRight
      return this.quantileRec(node.right!, newLeft, newRight, k - zerosInRange)
    }
  }

  get size(): number {
    return this._dataSize
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this.root = null
    this._dataSize = 0
    this._symbolToIndex.clear()
  }

  get length(): number {
    return this._dataSize
  }

  get alphabet(): number[] {
    return [...this._alphabet]
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._dataSize; i++) {
      result.push(this.access(i))
    }
    return result
  }

  forEach(callback: (element: number, index: number) => void): void {
    for (let i = 0; i < this._dataSize; i++) {
      callback(this.access(i), i)
    }
  }

  rankAll(element: number): RankAllResult {
    if (!this.root || this._dataSize === 0) {
      return { rankLess: 0, rankEqual: 0, rankGreater: 0 }
    }
    let rankLess = 0
    let rankEqual = 0
    for (const sym of this._alphabet) {
      const r = this.rank(sym, this._dataSize)
      if (sym < element) rankLess += r
      else if (sym === element) rankEqual = r
    }
    return {
      rankLess,
      rankEqual,
      rankGreater: this._dataSize - rankLess - rankEqual,
    }
  }

  rangeCount(start: number, end: number, valueFrom: number, valueTo: number): number {
    if (start < 0 || end > this._dataSize || start >= end) return 0
    if (valueFrom > valueTo) return 0
    if (!this.root) return 0
    const loIdx = this.lowerBoundIndex(valueFrom)
    const hiIdx = this.upperBoundIndex(valueTo)
    if (loIdx > hiIdx) return 0
    return this.rangeFreqRec(this.root, start, end, loIdx, hiIdx)
  }

  private lowerBoundIndex(val: number): number {
    let lo = 0
    let hi = this._alphabet.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (this._alphabet[mid]! < val) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  private upperBoundIndex(val: number): number {
    let lo = 0
    let hi = this._alphabet.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (this._alphabet[mid]! <= val) lo = mid + 1
      else hi = mid
    }
    return lo - 1
  }

  private rangeFreqRec(
    node: WaveletTreeNode | null,
    left: number,
    right: number,
    lo: number,
    hi: number
  ): number {
    if (!node || left >= right) return 0
    if (lo > hi) return 0
    if (lo <= node.lo && hi >= node.hi) return right - left
    if (node.lo === node.hi) {
      if (lo <= node.lo && hi >= node.hi) return right - left
      return 0
    }
    const mid = Math.floor((node.lo + node.hi) / 2)
    const leftLeft = left - node.rankPrefix[left]!
    const leftRight = right - node.rankPrefix[right]!
    const rightLeft = node.rankPrefix[left]!
    const rightRight = node.rankPrefix[right]!
    let result = 0
    if (lo <= mid && node.left) {
      result += this.rangeFreqRec(node.left, leftLeft, leftRight, lo, Math.min(hi, mid))
    }
    if (hi > mid && node.right) {
      result += this.rangeFreqRec(node.right, rightLeft, rightRight, Math.max(lo, mid + 1), hi)
    }
    return result
  }

  get stats(): WaveletTreeStats {
    return {
      length: this._dataSize,
      alphabetSize: this._alphabet.length,
      height: this.computeHeight(this.root),
      nodeCount: this.computeNodeCount(this.root),
      totalBits: this.computeTotalBits(this.root),
    }
  }

  private computeHeight(node: WaveletTreeNode | null): number {
    if (!node) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  private computeNodeCount(node: WaveletTreeNode | null): number {
    if (!node) return 0
    return 1 + this.computeNodeCount(node.left) + this.computeNodeCount(node.right)
  }

  private computeTotalBits(node: WaveletTreeNode | null): number {
    if (!node) return 0
    return node.bitvector.length + this.computeTotalBits(node.left) + this.computeTotalBits(node.right)
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }
}

export type { WaveletTreeNode, WaveletTreeOptions, RankAllResult, WaveletTreeStats } from './types.js'
