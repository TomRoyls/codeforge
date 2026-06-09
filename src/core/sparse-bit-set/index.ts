import type { SparseBitSetOptions, ForEachCallback } from './types.js'

const DEFAULT_BLOCK_SIZE = 1024

export class SparseBitSet {
  private blocks: Map<number, Uint32Array>
  private _blockSize: number
  private _size: number

  constructor(options?: SparseBitSetOptions) {
    this._blockSize = options?.blockSize ?? DEFAULT_BLOCK_SIZE
    if (this._blockSize <= 0 || !Number.isInteger(this._blockSize)) {
      throw new RangeError('blockSize must be a positive integer')
    }
    this.blocks = new Map()
    this._size = 0
  }

  private getBlockIndex(bitIndex: number): number {
    return Math.floor(bitIndex / this._blockSize)
  }

  private getWordOffset(bitIndex: number): number {
    const offsetInBlock = bitIndex % this._blockSize
    return Math.floor(offsetInBlock / 32)
  }

  private getBitMask(bitIndex: number): number {
    const offsetInBlock = bitIndex % this._blockSize
    return 1 << (offsetInBlock % 32)
  }

  private ensureBlock(blockIndex: number): Uint32Array {
    let block = this.blocks.get(blockIndex)
    if (block === undefined) {
      const wordCount = Math.ceil(this._blockSize / 32)
      block = new Uint32Array(wordCount)
      this.blocks.set(blockIndex, block)
    }
    return block
  }

  set(index: number): boolean {
    if (index < 0 || !Number.isInteger(index)) {
      throw new RangeError(`Invalid index: ${index}`)
    }
    const blockIndex = this.getBlockIndex(index)
    const block = this.ensureBlock(blockIndex)
    const wordOffset = this.getWordOffset(index)
    const mask = this.getBitMask(index)
    const wasUnset = (block[wordOffset]! & mask) === 0
    if (wasUnset) {
      block[wordOffset]! |= mask
      this._size++
    }
    return wasUnset
  }

  clear(index: number): boolean {
    if (index < 0 || !Number.isInteger(index)) {
      throw new RangeError(`Invalid index: ${index}`)
    }
    const blockIndex = this.getBlockIndex(index)
    const block = this.blocks.get(blockIndex)
    if (block === undefined) {
      return false
    }
    const wordOffset = this.getWordOffset(index)
    const mask = this.getBitMask(index)
    const wasSet = (block[wordOffset]! & mask) !== 0
    if (wasSet) {
      block[wordOffset]! &= ~mask
      this._size--
      if (this.isBlockEmpty(block)) {
        this.blocks.delete(blockIndex)
      }
    }
    return wasSet
  }

  get(index: number): boolean {
    if (index < 0 || !Number.isInteger(index)) {
      throw new RangeError(`Invalid index: ${index}`)
    }
    const blockIndex = this.getBlockIndex(index)
    const block = this.blocks.get(blockIndex)
    if (block === undefined) {
      return false
    }
    const wordOffset = this.getWordOffset(index)
    const mask = this.getBitMask(index)
    return (block[wordOffset]! & mask) !== 0
  }

  has(index: number): boolean {
    return this.get(index)
  }

  contains(index: number): boolean {
    return this.get(index)
  }

  flip(index: number): void {
    if (index < 0 || !Number.isInteger(index)) {
      throw new RangeError(`Invalid index: ${index}`)
    }
    if (this.get(index)) {
      this.clear(index)
    } else {
      this.set(index)
    }
  }

  setRange(from: number, to: number): void {
    if (from < 0 || to < 0 || !Number.isInteger(from) || !Number.isInteger(to)) {
      throw new RangeError(`Invalid range: [${from}, ${to}]`)
    }
    if (from > to) {
      throw new RangeError(`Invalid range: from (${from}) > to (${to})`)
    }
    for (let i = from; i <= to; i++) {
      this.set(i)
    }
  }

  clearRange(from: number, to: number): void {
    if (from < 0 || to < 0 || !Number.isInteger(from) || !Number.isInteger(to)) {
      throw new RangeError(`Invalid range: [${from}, ${to}]`)
    }
    if (from > to) {
      throw new RangeError(`Invalid range: from (${from}) > to (${to})`)
    }
    for (let i = from; i <= to; i++) {
      this.clear(i)
    }
  }

  flipRange(from: number, to: number): void {
    if (from < 0 || to < 0 || !Number.isInteger(from) || !Number.isInteger(to)) {
      throw new RangeError(`Invalid range: [${from}, ${to}]`)
    }
    if (from > to) {
      throw new RangeError(`Invalid range: from (${from}) > to (${to})`)
    }
    for (let i = from; i <= to; i++) {
      this.flip(i)
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  cardinality(): number {
    return this._size
  }

  min(): number {
    if (this._size === 0) {
      throw new RangeError('SparseBitSet is empty')
    }
    const sortedKeys = [...this.blocks.keys()].sort((a, b) => a - b)
    for (const blockIndex of sortedKeys) {
      const block = this.blocks.get(blockIndex)!
      const first = this.findFirstSetInBlock(block, blockIndex)
      if (first !== -1) {
        return first
      }
    }
    throw new RangeError('SparseBitSet is empty')
  }

  max(): number {
    if (this._size === 0) {
      throw new RangeError('SparseBitSet is empty')
    }
    const sortedKeys = [...this.blocks.keys()].sort((a, b) => b - a)
    for (const blockIndex of sortedKeys) {
      const block = this.blocks.get(blockIndex)!
      const last = this.findLastSetInBlock(block, blockIndex)
      if (last !== -1) {
        return last
      }
    }
    throw new RangeError('SparseBitSet is empty')
  }

  private findFirstSetInBlock(block: Uint32Array, blockIndex: number): number {
    const base = blockIndex * this._blockSize
    const wordCount = block.length
    for (let w = 0; w < wordCount; w++) {
      if (block[w] !== 0) {
        const bit = this.ctz(block[w]!)
        return base + w * 32 + bit
      }
    }
    return -1
  }

  private findLastSetInBlock(block: Uint32Array, blockIndex: number): number {
    const base = blockIndex * this._blockSize
    for (let w = block.length - 1; w >= 0; w--) {
      if (block[w] !== 0) {
        const bit = 31 - this.clz(block[w]!)
        return base + w * 32 + bit
      }
    }
    return -1
  }

  private ctz(value: number): number {
    if (value === 0) return 32
    let count = 0
    while ((value & 1) === 0) {
      count++
      value >>>= 1
    }
    return count
  }

  private clz(value: number): number {
    if (value === 0) return 32
    let count = 0
    if ((value & 0xFFFF0000) === 0) { count += 16; value <<= 16 }
    if ((value & 0xFF000000) === 0) { count += 8; value <<= 8 }
    if ((value & 0xF0000000) === 0) { count += 4; value <<= 4 }
    if ((value & 0xC0000000) === 0) { count += 2; value <<= 2 }
    if ((value & 0x80000000) === 0) { count += 1 }
    return count
  }

  nextSetBit(from: number): number {
    if (from < 0 || !Number.isInteger(from)) {
      throw new RangeError(`Invalid index: ${from}`)
    }
    let blockIndex = this.getBlockIndex(from)
    const offsetInBlock = from % this._blockSize
    const startWord = Math.floor(offsetInBlock / 32)
    const startBit = offsetInBlock % 32

    const block = this.blocks.get(blockIndex)
    if (block !== undefined) {
      const result = this.findNextSetInBlock(block, blockIndex, startWord, startBit)
      if (result !== -1) return result
    }
    blockIndex++

    const sortedKeys = [...this.blocks.keys()].filter(k => k >= blockIndex).sort((a, b) => a - b)
    for (const bi of sortedKeys) {
      const b = this.blocks.get(bi)!
      const first = this.findFirstSetInBlock(b, bi)
      if (first !== -1) return first
    }
    return -1
  }

  private findNextSetInBlock(block: Uint32Array, blockIndex: number, startWord: number, startBit: number): number {
    const base = blockIndex * this._blockSize
    for (let w = startWord; w < block.length; w++) {
      let word = block[w]!
      if (w === startWord) {
        word &= (~0 << startBit)
      }
      if (word !== 0) {
        return base + w * 32 + this.ctz(word)
      }
    }
    return -1
  }

  prevSetBit(from: number): number {
    if (from < -1 || !Number.isInteger(from)) {
      throw new RangeError(`Invalid index: ${from}`)
    }
    if (from === -1) return -1
    let blockIndex = this.getBlockIndex(from)
    const offsetInBlock = from % this._blockSize
    const startWord = Math.floor(offsetInBlock / 32)
    const startBit = offsetInBlock % 32

    const block = this.blocks.get(blockIndex)
    if (block !== undefined) {
      const result = this.findPrevSetInBlock(block, blockIndex, startWord, startBit)
      if (result !== -1) return result
    }
    blockIndex--

    const sortedKeys = [...this.blocks.keys()].filter(k => k <= blockIndex).sort((a, b) => b - a)
    for (const bi of sortedKeys) {
      const b = this.blocks.get(bi)!
      const last = this.findLastSetInBlock(b, bi)
      if (last !== -1) return last
    }
    return -1
  }

  private findPrevSetInBlock(block: Uint32Array, blockIndex: number, startWord: number, startBit: number): number {
    const base = blockIndex * this._blockSize
    for (let w = startWord; w >= 0; w--) {
      let word = block[w]!
      if (w === startWord) {
        word &= (~0 >>> (31 - startBit))
      }
      if (word !== 0) {
        return base + w * 32 + (31 - this.clz(word))
      }
    }
    return -1
  }

  clearAll(): void {
    this.blocks.clear()
    this._size = 0
  }

  toArray(): number[] {
    const result: number[] = []
    this.forEach((index) => {
      result.push(index)
    })
    return result
  }

  clone(): SparseBitSet {
    const copy = new SparseBitSet({ blockSize: this._blockSize })
    copy._size = this._size
    for (const [blockIndex, block] of this.blocks) {
      copy.blocks.set(blockIndex, new Uint32Array(block))
    }
    return copy
  }

  static fromArray(indices: number[], options?: SparseBitSetOptions): SparseBitSet {
    const bs = new SparseBitSet(options)
    for (const index of indices) {
      bs.set(index)
    }
    return bs
  }

  and(other: SparseBitSet): SparseBitSet {
    const result = new SparseBitSet({ blockSize: this._blockSize })
    for (const [blockIndex, block] of this.blocks) {
      const otherBlock = other.blocks.get(blockIndex)
      if (otherBlock === undefined) continue
      const wordCount = block.length
      const newBlock = new Uint32Array(wordCount)
      let hasBits = false
      for (let w = 0; w < wordCount; w++) {
        newBlock[w] = block[w]! & otherBlock[w]!
        if (newBlock[w] !== 0) hasBits = true
      }
      if (hasBits) {
        result.blocks.set(blockIndex, newBlock)
        result._size += popcountBlock(newBlock)
      }
    }
    return result
  }

  or(other: SparseBitSet): SparseBitSet {
    const result = this.clone()
    for (const [blockIndex, otherBlock] of other.blocks) {
      const existingBlock = result.blocks.get(blockIndex)
      if (existingBlock === undefined) {
        result.blocks.set(blockIndex, new Uint32Array(otherBlock))
        result._size += popcountBlock(otherBlock)
      } else {
        const oldCount = popcountBlock(existingBlock)
        const wordCount = existingBlock.length
        for (let w = 0; w < wordCount; w++) {
          existingBlock[w] = existingBlock[w]! | otherBlock[w]!
        }
        result._size += popcountBlock(existingBlock) - oldCount
      }
    }
    return result
  }

  xor(other: SparseBitSet): SparseBitSet {
    const result = this.clone()
    for (const [blockIndex, otherBlock] of other.blocks) {
      const existingBlock = result.blocks.get(blockIndex)
      if (existingBlock === undefined) {
        result.blocks.set(blockIndex, new Uint32Array(otherBlock))
        result._size += popcountBlock(otherBlock)
      } else {
        const oldCount = popcountBlock(existingBlock)
        const wordCount = existingBlock.length
        for (let w = 0; w < wordCount; w++) {
          existingBlock[w] = existingBlock[w]! ^ otherBlock[w]!
        }
        const newCount = popcountBlock(existingBlock)
        result._size += newCount - oldCount
        if (newCount === 0) {
          result.blocks.delete(blockIndex)
        }
      }
    }
    return result
  }

  andNot(other: SparseBitSet): SparseBitSet {
    const result = this.clone()
    for (const [blockIndex, otherBlock] of other.blocks) {
      const existingBlock = result.blocks.get(blockIndex)
      if (existingBlock === undefined) continue
      const oldCount = popcountBlock(existingBlock)
      const wordCount = existingBlock.length
      for (let w = 0; w < wordCount; w++) {
        existingBlock[w] = existingBlock[w]! & ~otherBlock[w]!
      }
      const newCount = popcountBlock(existingBlock)
      result._size += newCount - oldCount
      if (newCount === 0) {
        result.blocks.delete(blockIndex)
      }
    }
    return result
  }

  intersects(other: SparseBitSet): boolean {
    for (const [blockIndex, block] of this.blocks) {
      const otherBlock = other.blocks.get(blockIndex)
      if (otherBlock === undefined) continue
      for (let w = 0; w < block.length; w++) {
        if ((block[w]! & otherBlock[w]!) !== 0) return true
      }
    }
    return false
  }

  equals(other: SparseBitSet): boolean {
    if (this._size !== other._size) return false
    const allBlockKeys = new Set([...this.blocks.keys(), ...other.blocks.keys()])
    for (const blockIndex of allBlockKeys) {
      const thisBlock = this.blocks.get(blockIndex)
      const otherBlock = other.blocks.get(blockIndex)
      if (thisBlock === undefined && otherBlock === undefined) continue
      if (thisBlock === undefined || otherBlock === undefined) return false
      if (thisBlock.length !== otherBlock.length) return false
      for (let w = 0; w < thisBlock.length; w++) {
        if (thisBlock[w] !== otherBlock[w]) return false
      }
    }
    return true
  }

  forEach(callback: ForEachCallback): void {
    const sortedKeys = [...this.blocks.keys()].sort((a, b) => a - b)
    for (const blockIndex of sortedKeys) {
      const block = this.blocks.get(blockIndex)!
      const base = blockIndex * this._blockSize
      for (let w = 0; w < block.length; w++) {
        let word = block[w]!
        while (word !== 0) {
          const bit = this.ctz(word)
          callback(base + w * 32 + bit)
          word &= word - 1
        }
      }
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    const sortedKeys = [...this.blocks.keys()].sort((a, b) => a - b)
    for (const blockIndex of sortedKeys) {
      const block = this.blocks.get(blockIndex)!
      const base = blockIndex * this._blockSize
      for (let w = 0; w < block.length; w++) {
        let word = block[w]!
        while (word !== 0) {
          const bit = this.ctz(word)
          yield base + w * 32 + bit
          word &= word - 1
        }
      }
    }
  }

  isEmptyBlock(index: number): boolean {
    if (index < 0 || !Number.isInteger(index)) {
      throw new RangeError(`Invalid block index: ${index}`)
    }
    const block = this.blocks.get(index)
    if (block === undefined) return true
    return this.isBlockEmpty(block)
  }

  private isBlockEmpty(block: Uint32Array): boolean {
    for (let w = 0; w < block.length; w++) {
      if (block[w] !== 0) return false
    }
    return true
  }

  toBitString(): string {
    if (this._size === 0) return ''
    const maxIdx = this.max()
    let result = ''
    for (let i = 0; i <= maxIdx; i++) {
      result += this.get(i) ? '1' : '0'
    }
    return result
  }

  get blockSize(): number {
    return this._blockSize
  }

  toString(): string {
    return `SparseBitSet({ size: ${this.size} })`
  }
}

function popcountBlock(block: Uint32Array): number {
  let count = 0
  for (let w = 0; w < block.length; w++) {
    count += popcount(block[w]!)
  }
  return count
}

function popcount(value: number): number {
  let v = value >>> 0
  v = v - ((v >> 1) & 0x55555555)
  v = (v & 0x33333333) + ((v >> 2) & 0x33333333)
  v = (v + (v >> 4)) & 0x0F0F0F0F
  v = (v * 0x01010101) >>> 24
  return v
}
