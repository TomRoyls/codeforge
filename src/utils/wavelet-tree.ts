export class WaveletTree {
  private readonly nodes: WaveletNode | null
  private readonly _length: number
  private readonly _alphabet: number[]

  constructor(data: number[] | string, alphabet?: number[]) {
    const numericData = typeof data === 'string'
      ? Array.from(data, (c) => c.charCodeAt(0))
      : data
    this._alphabet = alphabet
      ? [...alphabet].sort((a, b) => a - b)
      : [...new Set(numericData)].sort((a, b) => a - b)
    this._length = numericData.length
    this.nodes = this._alphabet.length > 0 ? this.build(numericData, this._alphabet) : null
  }

  private build(data: number[], alphabet: number[]): WaveletNode | null {
    if (data.length === 0) return null
    if (alphabet.length === 1) return { symbol: alphabet[0]!, isLeaf: true, size: data.length }

    const mid = Math.floor(alphabet.length / 2)
    const leftAlphabet = alphabet.slice(0, mid)
    const rightAlphabet = alphabet.slice(mid)
    const rightSet = new Set(rightAlphabet)

    const bitvector = new Uint8Array(Math.ceil(data.length / 8))
    const leftData: number[] = []
    const rightData: number[] = []

    for (let i = 0; i < data.length; i++) {
      const value = data[i]!
      const isRight = rightSet.has(value)
      if (isRight) {
        setBit(bitvector, i)
        rightData.push(value)
      } else {
        leftData.push(value)
      }
    }

    return {
      isLeaf: false,
      bitvector,
      left: this.build(leftData, leftAlphabet),
      right: this.build(rightData, rightAlphabet),
      alphabet,
      size: data.length,
    }
  }

  access(index: number): number {
    if (this.nodes === null) throw new RangeError('Index out of bounds')
    if (index < 0 || index >= this._length) throw new RangeError('Index out of bounds')
    return this.accessNode(this.nodes, index)
  }

  get text(): string {
    let result = ''
    for (let i = 0; i < this._length; i++) {
      result += String.fromCharCode(this.access(i))
    }
    return result
  }

  get length(): number {
    return this._length
  }

  private accessNode(node: WaveletNode, index: number): number {
    if (node.isLeaf) return node.symbol
    const bit = getBit(node.bitvector, index)
    if (bit === 0) {
      const zerosBefore = countZeros(node.bitvector, index)
      if (node.left === null) throw new RangeError('Invalid tree state')
      return this.accessNode(node.left, zerosBefore)
    } else {
      const onesBefore = countOnes(node.bitvector, index)
      if (node.right === null) throw new RangeError('Invalid tree state')
      return this.accessNode(node.right, onesBefore)
    }
  }

  rank(symbol: number | string, endIndex: number): number {
    const sym = typeof symbol === 'string' ? symbol.charCodeAt(0) : symbol
    if (this.nodes === null || sym === undefined) return 0
    return this.rankNode(this.nodes, sym, endIndex)
  }

  private rankNode(node: WaveletNode, symbol: number, endIndex: number): number {
    if (node.isLeaf) return (node.symbol === symbol ? endIndex : 0)
    if (!node.alphabet.includes(symbol)) return 0

    const mid = Math.floor(node.alphabet.length / 2)
    const inRight = symbol >= node.alphabet[mid]!

    if (inRight) {
      if (node.right === null) return 0
      const onesBefore = countOnes(node.bitvector, endIndex)
      return this.rankNode(node.right, symbol, onesBefore)
    } else {
      if (node.left === null) return 0
      const zerosBefore = countZeros(node.bitvector, endIndex)
      return this.rankNode(node.left, symbol, zerosBefore)
    }
  }

  select(symbol: number | string, occurrence: number): number {
    const sym = typeof symbol === 'string' ? symbol.charCodeAt(0) : symbol
    if (occurrence < 1) return -1
    const total = this.rank(sym, this._length)
    if (occurrence > total) return -1
    if (this.nodes === null) return -1
    return this.selectNode(this.nodes, sym, occurrence)
  }

  private selectNode(node: WaveletNode, symbol: number, occurrence: number): number {
    if (node.isLeaf) {
      if (node.symbol !== symbol) return -1
      if (occurrence > node.size) return -1
      return occurrence - 1
    }

    if (!node.alphabet.includes(symbol)) return -1

    const mid = Math.floor(node.alphabet.length / 2)
    const inRight = symbol >= node.alphabet[mid]!

    if (inRight) {
      if (node.right === null) return -1
      const rightPos = this.selectNode(node.right, symbol, occurrence)
      if (rightPos === -1) return -1
      return findNthOne(node.bitvector, rightPos + 1)
    } else {
      if (node.left === null) return -1
      const leftPos = this.selectNode(node.left, symbol, occurrence)
      if (leftPos === -1) return -1
      return findNthZero(node.bitvector, leftPos + 1)
    }
  }

  rangeCount(start: number, end: number, symbol: number): number {
    if (this.nodes === null) return 0
    if (start < 0 || end > this._length || start >= end) return 0
    return this.rankNode(this.nodes, symbol, end) - this.rankNode(this.nodes, symbol, start)
  }

  rangeCountAll(start: number, end: number): Map<number, number> {
    if (this.nodes === null) return new Map()
    if (start < 0 || end > this._length || start >= end) return new Map()
    const result = new Map<number, number>()
    this.rangeCountAllNode(this.nodes, start, end, result)
    return result
  }

  private rangeCountAllNode(
    node: WaveletNode,
    start: number,
    end: number,
    result: Map<number, number>,
  ): void {
    if (node.isLeaf) {
      const count = end - start
      const current = result.get(node.symbol) ?? 0
      result.set(node.symbol, current + count)
      return
    }

    const startZeros = countZeros(node.bitvector, start)
    const endZeros = countZeros(node.bitvector, end)
    const startOnes = countOnes(node.bitvector, start)
    const endOnes = countOnes(node.bitvector, end)

    if (node.left !== null && startZeros !== endZeros) {
      this.rangeCountAllNode(node.left, startZeros, endZeros, result)
    }

    if (node.right !== null && startOnes !== endOnes) {
      this.rangeCountAllNode(node.right, startOnes, endOnes, result)
    }
  }

  get alphabet(): number[] {
    return this._alphabet
  }
}

interface WaveletLeafNode {
  isLeaf: true
  symbol: number
  size: number
}

interface WaveletInternalNode {
  isLeaf: false
  bitvector: Uint8Array
  left: WaveletNode | null
  right: WaveletNode | null
  alphabet: number[]
  size: number
}

type WaveletNode = WaveletLeafNode | WaveletInternalNode

function setBit(bitvector: Uint8Array, index: number): void {
  const byteIndex = Math.floor(index / 8)
  const bitIndex = index % 8
  bitvector[byteIndex]! |= 1 << bitIndex
}

function getBit(bitvector: Uint8Array, index: number): number {
  const byteIndex = Math.floor(index / 8)
  const bitIndex = index % 8
  return (bitvector[byteIndex]! >> bitIndex) & 1
}

function countOnes(bitvector: Uint8Array, endIndex: number): number {
  let count = 0
  for (let i = 0; i < endIndex; i++) {
    count += getBit(bitvector, i)
  }
  return count
}

function countZeros(bitvector: Uint8Array, endIndex: number): number {
  return endIndex - countOnes(bitvector, endIndex)
}

function findNthOne(bitvector: Uint8Array, n: number): number {
  let count = 0
  for (let i = 0; i < bitvector.length * 8; i++) {
    if (getBit(bitvector, i) === 1) {
      count++
      if (count === n) return i
    }
  }
  return -1
}

function findNthZero(bitvector: Uint8Array, n: number): number {
  let count = 0
  for (let i = 0; i < bitvector.length * 8; i++) {
    if (getBit(bitvector, i) === 0) {
      count++
      if (count === n) return i
    }
  }
  return -1
}