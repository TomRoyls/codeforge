interface WTNode {
  bitmap: number[]
  prefixSum: number[]
  left: WTNode | null
  right: WTNode | null
  lo: number
  hi: number
}

export class WaveletTree {
  private _text: string
  private _alphabet: string[]
  private _charToIdx: Map<string, number>
  private _root: WTNode | null

  constructor(text: string) {
    this._text = text
    const charSet = new Set<string>()
    for (const c of text) {
      charSet.add(c)
    }
    this._alphabet = [...charSet].sort()
    this._charToIdx = new Map<string, number>()
    for (let i = 0; i < this._alphabet.length; i++) {
      this._charToIdx.set(this._alphabet[i], i)
    }
    this._root =
      this._alphabet.length > 0
        ? this._buildNode(text, 0, this._alphabet.length)
        : null
  }

  private _buildNode(text: string, lo: number, hi: number): WTNode {
    if (lo + 1 >= hi) {
      return { bitmap: [], prefixSum: [0], left: null, right: null, lo, hi }
    }
    const mid = (lo + hi) >> 1
    const bitmap: number[] = []
    const prefixSum: number[] = [0]
    const leftChars: string[] = []
    const rightChars: string[] = []
    for (let i = 0; i < text.length; i++) {
      const idx = this._charToIdx.get(text[i])!
      const bit = idx < mid ? 0 : 1
      bitmap.push(bit)
      prefixSum.push(prefixSum[i] + bit)
      if (bit === 0) {
        leftChars.push(text[i])
      } else {
        rightChars.push(text[i])
      }
    }
    return {
      bitmap,
      prefixSum,
      left: this._buildNode(leftChars.join(""), lo, mid),
      right: this._buildNode(rightChars.join(""), mid, hi),
      lo,
      hi,
    }
  }

  access(index: number): string {
    if (index < 0 || index >= this._text.length) {
      throw new RangeError(
        `Index ${index} out of range [0, ${this._text.length})`,
      )
    }
    let node = this._root!
    let pos = index
    while (node.left !== null) {
      const bit = node.bitmap[pos]
      if (bit === 0) {
        pos = pos + 1 - node.prefixSum[pos + 1] - 1
        node = node.left
      } else {
        pos = node.prefixSum[pos + 1] - 1
        node = node.right
      }
    }
    return this._alphabet[node.lo]
  }

  rank(char: string, position: number): number {
    if (position < 0 || this._root === null) return 0
    const charIdx = this._charToIdx.get(char)
    if (charIdx === undefined) return 0
    let pos = Math.min(position, this._text.length - 1)
    let node = this._root
    while (node.left !== null) {
      const mid = (node.lo + node.hi) >> 1
      if (charIdx < mid) {
        pos = pos + 1 - node.prefixSum[pos + 1] - 1
        node = node.left
      } else {
        pos = node.prefixSum[pos + 1] - 1
        node = node.right
      }
    }
    return pos + 1
  }

  select(char: string, occurrence: number): number {
    if (occurrence < 0 || this._root === null) return -1
    const charIdx = this._charToIdx.get(char)
    if (charIdx === undefined) return -1
    const result = this._selectRec(this._root, charIdx, occurrence)
    if (result < 0 || result >= this._text.length) return -1
    return result
  }

  private _selectRec(
    node: WTNode,
    charIdx: number,
    occurrence: number,
  ): number {
    if (node.left === null) {
      return occurrence
    }
    const mid = (node.lo + node.hi) >> 1
    if (charIdx < mid) {
      const childResult = this._selectRec(node.left, charIdx, occurrence)
      if (childResult === -1) return -1
      return this._findNthBit(node, 0, childResult + 1)
    } else {
      const childResult = this._selectRec(node.right, charIdx, occurrence)
      if (childResult === -1) return -1
      return this._findNthBit(node, 1, childResult + 1)
    }
  }

  private _findNthBit(node: WTNode, bit: number, n: number): number {
    let count = 0
    for (let i = 0; i < node.bitmap.length; i++) {
      if (node.bitmap[i] === bit) {
        count++
        if (count === n) return i
      }
    }
    return -1
  }

  get text(): string {
    return this._text
  }

  get length(): number {
    return this._text.length
  }
}
