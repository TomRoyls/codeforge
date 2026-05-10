import { DEFAULT_BLOCK_SIZE } from './types.js'
import type { BlockedBitmapOptions, BlockedBitmapStats } from './types.js'

function popcountByte(x: number): number {
  x = x - ((x >> 1) & 0x55)
  x = (x & 0x33) + ((x >> 2) & 0x33)
  return (x + (x >> 4)) & 0x0f
}

function isBlockEmpty(block: Uint8Array): boolean {
  for (let i = 0; i < block.length; i++) {
    if (block[i]! !== 0) return false
  }
  return true
}

export class BlockedBitmap {
  private blocks: Map<number, Uint8Array>
  private _blockSize: number
  private _size: number

  constructor(size: number, options?: BlockedBitmapOptions) {
    if (size < 0) {
      throw new RangeError(`Size must be non-negative, got ${size}`)
    }
    this._size = size
    this._blockSize = options?.blockSize ?? DEFAULT_BLOCK_SIZE
    if (this._blockSize <= 0 || (this._blockSize & 7) !== 0) {
      throw new RangeError(`Block size must be a positive multiple of 8, got ${this._blockSize}`)
    }
    this.blocks = new Map()
  }

  private blockIndex(bit: number): number {
    return (bit / this._blockSize) | 0
  }

  private bitInBlock(bit: number): number {
    return bit % this._blockSize
  }

  private getOrCreateBlock(blockIdx: number): Uint8Array {
    let block = this.blocks.get(blockIdx)
    if (block === undefined) {
      block = new Uint8Array(this._blockSize / 8)
      this.blocks.set(blockIdx, block)
    }
    return block
  }

  private validateIndex(index: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of range [0, ${this._size})`)
    }
  }

  set(bit: number): void {
    this.validateIndex(bit)
    const blockIdx = this.blockIndex(bit)
    const block = this.getOrCreateBlock(blockIdx)
    const bitOff = this.bitInBlock(bit)
    block[(bitOff / 8) | 0] = block[(bitOff / 8) | 0]! | (1 << (bitOff & 7))
  }

  clear(bit: number): void {
    this.validateIndex(bit)
    const blockIdx = this.blockIndex(bit)
    const block = this.blocks.get(blockIdx)
    if (block !== undefined) {
      const bitOff = this.bitInBlock(bit)
      block[(bitOff / 8) | 0] = block[(bitOff / 8) | 0]! & ~(1 << (bitOff & 7))
      if (isBlockEmpty(block)) {
        this.blocks.delete(blockIdx)
      }
    }
  }

  get(bit: number): number {
    this.validateIndex(bit)
    const blockIdx = this.blockIndex(bit)
    const block = this.blocks.get(blockIdx)
    if (block === undefined) return 0
    const bitOff = this.bitInBlock(bit)
    return (block[(bitOff / 8) | 0]! >>> (bitOff & 7)) & 1
  }

  flip(bit: number): void {
    this.validateIndex(bit)
    const blockIdx = this.blockIndex(bit)
    const bitOff = this.bitInBlock(bit)
    const block = this.getOrCreateBlock(blockIdx)
    block[(bitOff / 8) | 0] = block[(bitOff / 8) | 0]! ^ (1 << (bitOff & 7))
    if (isBlockEmpty(block)) {
      this.blocks.delete(blockIdx)
    }
  }

  setRange(start: number, end: number): void {
    this.validateRange(start, end)
    if (start === end) return
    for (let i = start; i < end; i++) {
      const blockIdx = this.blockIndex(i)
      const block = this.getOrCreateBlock(blockIdx)
      const bitOff = this.bitInBlock(i)
      block[(bitOff / 8) | 0] = block[(bitOff / 8) | 0]! | (1 << (bitOff & 7))
    }
  }

  clearRange(start: number, end: number): void {
    this.validateRange(start, end)
    if (start === end) return
    for (let i = start; i < end; i++) {
      const blockIdx = this.blockIndex(i)
      const block = this.blocks.get(blockIdx)
      if (block !== undefined) {
        const bitOff = this.bitInBlock(i)
        block[(bitOff / 8) | 0] = block[(bitOff / 8) | 0]! & ~(1 << (bitOff & 7))
        if (isBlockEmpty(block)) {
          this.blocks.delete(blockIdx)
        }
      }
    }
  }

  getRange(start: number, end: number): number[] {
    this.validateRange(start, end)
    const result: number[] = new Array(end - start)
    for (let i = start; i < end; i++) {
      result[i - start] = this.get(i)
    }
    return result
  }

  countSetBits(): number {
    let count = 0
    for (const block of this.blocks.values()) {
      for (let i = 0; i < block.length; i++) {
        count += popcountByte(block[i]!)
      }
    }
    return count
  }

  get cardinality(): number {
    return this.countSetBits()
  }

  findFirstSet(): number {
    if (this.blocks.size === 0) return -1
    let minBlock = Infinity
    for (const idx of this.blocks.keys()) {
      if (idx < minBlock) minBlock = idx
    }
    const block = this.blocks.get(minBlock!)!
    for (let byteIdx = 0; byteIdx < block.length; byteIdx++) {
      const byte = block[byteIdx]!
      if (byte !== 0) {
        let bit = 0
        while ((byte & (1 << bit)) === 0) bit++
        return minBlock! * this._blockSize + byteIdx * 8 + bit
      }
    }
    return -1
  }

  findFirstClear(): number {
    for (let i = 0; i < this._size; i++) {
      if (this.get(i) === 0) return i
    }
    return -1
  }

  get isEmpty(): boolean {
    return this.blocks.size === 0
  }

  get size(): number {
    return this._size
  }

  clearAll(): void {
    this.blocks.clear()
  }

  clone(): BlockedBitmap {
    const result = new BlockedBitmap(this._size, { blockSize: this._blockSize })
    for (const [idx, block] of this.blocks) {
      result.blocks.set(idx, new Uint8Array(block))
    }
    return result
  }

  static from(bits: number[], options?: BlockedBitmapOptions): BlockedBitmap {
    const bm = new BlockedBitmap(bits.length, options)
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === 1) {
        bm.set(i)
      } else if (bits[i] !== 0) {
        throw new Error(`Invalid bit value at index ${i}: ${bits[i]}`)
      }
    }
    return bm
  }

  toBitArray(): number[] {
    const result: number[] = new Array(this._size)
    for (let i = 0; i < this._size; i++) {
      result[i] = this.get(i)
    }
    return result
  }

  toSet(): Set<number> {
    const result = new Set<number>()
    for (const [blockIdx, block] of this.blocks) {
      const base = blockIdx * this._blockSize
      for (let byteIdx = 0; byteIdx < block.length; byteIdx++) {
        const byte = block[byteIdx]!
        if (byte === 0) continue
        for (let bit = 0; bit < 8; bit++) {
          if ((byte & (1 << bit)) !== 0) {
            const pos = base + byteIdx * 8 + bit
            if (pos < this._size) {
              result.add(pos)
            }
          }
        }
      }
    }
    return result
  }

  stats(): BlockedBitmapStats {
    let setBits = 0
    let bytesUsed = 0
    for (const block of this.blocks.values()) {
      bytesUsed += block.length
      for (let i = 0; i < block.length; i++) {
        setBits += popcountByte(block[i]!)
      }
    }
    const totalBlocks = this._size === 0 ? 0 : Math.ceil(this._size / this._blockSize)
    return {
      totalBits: this._size,
      storedBlocks: this.blocks.size,
      totalBlocks,
      blockSize: this._blockSize,
      bytesUsed,
      setBits,
    }
  }

  private validateRange(start: number, end: number): void {
    if (start < 0 || end < start || end > this._size) {
      throw new RangeError(`Invalid range [${start}, ${end}) for bitmap of size ${this._size}`)
    }
  }
}

export { DEFAULT_BLOCK_SIZE } from './types.js'
export type { BlockedBitmapOptions, BlockedBitmapStats } from './types.js'
