import type { WaveletNode } from './types.js'

export class WaveletTree {
  private root: WaveletNode | null
  private dataSize: number
  private alphabet: number[]
  private symbolToIndex: Map<number, number>

  constructor(seq: number[]) {
    this.alphabet = [...new Set(seq)].sort((a, b) => a - b)
    this.symbolToIndex = new Map()
    for (let i = 0; i < this.alphabet.length; i++) {
      this.symbolToIndex.set(this.alphabet[i]!, i)
    }
    this.dataSize = seq.length
    if (seq.length === 0 || this.alphabet.length === 0) {
      this.root = null
      return
    }
    const mapped = seq.map(s => this.symbolToIndex.get(s)!)
    this.root = this.build(mapped, 0, this.alphabet.length - 1)
  }

  private createNode(lo: number, hi: number): WaveletNode {
    return { bitvector: [], rankPrefix: [0], left: null, right: null, lo, hi }
  }

  private build(data: number[], lo: number, hi: number): WaveletNode | null {
    if (lo > hi || data.length === 0) return null
    const node = this.createNode(lo, hi)
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

  access(index: number): number {
    if (index < 0 || index >= this.dataSize || !this.root) {
      throw new Error(`Index ${index} out of range, valid: 0..${this.dataSize - 1}`)
    }
    return this.alphabet[this.accessRec(this.root, index)]!
  }

  private accessRec(node: WaveletNode, index: number): number {
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

  rank(symbol: number, index: number): number {
    if (index < 0 || index > this.dataSize) {
      throw new Error(`Index ${index} out of range, valid: 0..${this.dataSize}`)
    }
    if (!this.symbolToIndex.has(symbol) || !this.root) return 0
    const mapped = this.symbolToIndex.get(symbol)!
    return this.rankRec(this.root, mapped, index)
  }

  private rankRec(node: WaveletNode | null, symbol: number, end: number): number {
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

  rangeCount(left: number, right: number, symbol: number): number {
    if (left < 0 || right > this.dataSize || left >= right) return 0
    return this.rank(symbol, right) - this.rank(symbol, left)
  }

  rangeFreq(left: number, right: number, min: number, max: number): number {
    if (left < 0 || right > this.dataSize || left >= right) return 0
    if (!this.root) return 0
    const minIdx = this.lowerBoundIndex(min)
    const maxIdx = this.upperBoundIndex(max)
    if (minIdx > maxIdx) return 0
    return this.rangeFreqRec(this.root, left, right, minIdx, maxIdx)
  }

  private lowerBoundIndex(val: number): number {
    let lo = 0
    let hi = this.alphabet.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (this.alphabet[mid]! < val) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  private upperBoundIndex(val: number): number {
    let lo = 0
    let hi = this.alphabet.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (this.alphabet[mid]! <= val) lo = mid + 1
      else hi = mid
    }
    return lo - 1
  }

  private rangeFreqRec(node: WaveletNode | null, left: number, right: number, lo: number, hi: number): number {
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

  quantile(left: number, right: number, k: number): number {
    if (left < 0 || right > this.dataSize || left >= right) {
      throw new Error(`Invalid range [${left}, ${right})`)
    }
    if (k < 0 || k >= right - left) {
      throw new Error(`k=${k} out of range for interval of size ${right - left}`)
    }
    if (!this.root) {
      throw new Error('Wavelet tree is empty')
    }
    const idx = this.quantileRec(this.root, left, right, k)
    return this.alphabet[idx]!
  }

  private quantileRec(node: WaveletNode, start: number, end: number, k: number): number {
    if (node.lo === node.hi) return node.lo
    const zerosBefore = start - node.rankPrefix[start]!
    const zerosEnd = end - node.rankPrefix[end]!
    const zerosInRange = zerosEnd - zerosBefore
    if (k < zerosInRange) {
      return this.quantileRec(node.left!, zerosBefore, zerosEnd, k)
    } else {
      const onesBefore = node.rankPrefix[start]!
      const onesEnd = node.rankPrefix[end]!
      return this.quantileRec(node.right!, onesBefore, onesEnd, k - zerosInRange)
    }
  }

  kthSmallest(left: number, right: number, k: number): number {
    return this.quantile(left, right, k)
  }

  length(): number {
    return this.dataSize
  }

  getAlphabet(): number[] {
    return [...this.alphabet]
  }

  clone(): WaveletTree {
    const cloned = Object.create(WaveletTree.prototype) as WaveletTree
    cloned.dataSize = this.dataSize
    cloned.alphabet = [...this.alphabet]
    cloned.symbolToIndex = new Map(this.symbolToIndex)
    cloned.root = this.cloneNode(this.root)
    return cloned
  }

  private cloneNode(node: WaveletNode | null): WaveletNode | null {
    if (!node) return null
    return {
      bitvector: [...node.bitvector],
      rankPrefix: [...node.rankPrefix],
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
      lo: node.lo,
      hi: node.hi,
    }
  }
}
