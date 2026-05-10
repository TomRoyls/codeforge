import type { BlockListOptions } from './types.js'
import { DEFAULT_BLOCK_SIZE } from './types.js'

export class BlockList<T = unknown> {
  private blocks: T[][] = []
  private blockSize: number
  private _size: number = 0

  constructor(blockSize?: number)
  constructor(options?: Partial<BlockListOptions>)
  constructor(blockSizeOrOptions?: number | Partial<BlockListOptions>) {
    if (typeof blockSizeOrOptions === 'number') {
      this.blockSize = Math.max(2, blockSizeOrOptions)
    } else if (blockSizeOrOptions && typeof blockSizeOrOptions === 'object') {
      this.blockSize = Math.max(2, blockSizeOrOptions.blockSize ?? DEFAULT_BLOCK_SIZE)
    } else {
      this.blockSize = DEFAULT_BLOCK_SIZE
    }
  }

  private resolveIndex(index: number): { blockIndex: number; elementIndex: number } {
    let remaining = index
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const blockLen = this.blocks[bi]!.length
      if (remaining < blockLen) {
        return { blockIndex: bi, elementIndex: remaining }
      }
      remaining -= blockLen
    }
    return { blockIndex: -1, elementIndex: -1 }
  }

  private splitBlock(blockIndex: number): void {
    const block = this.blocks[blockIndex]!
    if (block.length <= this.blockSize) return
    const mid = Math.floor(block.length / 2)
    const right = block.splice(mid)
    this.blocks.splice(blockIndex + 1, 0, right)
  }

  private mergeBlocks(blockIndex: number): void {
    if (blockIndex < 0 || blockIndex >= this.blocks.length - 1) return
    const left = this.blocks[blockIndex]!
    const right = this.blocks[blockIndex + 1]!
    const halfCapacity = Math.floor(this.blockSize / 2)
    if (left.length < halfCapacity && right.length < halfCapacity) {
      left.push(...right)
      this.blocks.splice(blockIndex + 1, 1)
    }
  }

  private maybeMergeAround(blockIndex: number): void {
    if (blockIndex > 0) {
      this.mergeBlocks(blockIndex - 1)
    }
    if (blockIndex < this.blocks.length) {
      this.mergeBlocks(blockIndex)
    }
  }

  push(value: T): void {
    const lastBlock = this.blocks[this.blocks.length - 1]
    if (!lastBlock) {
      this.blocks.push([value])
    } else {
      lastBlock.push(value)
      if (lastBlock.length > this.blockSize) {
        this.splitBlock(this.blocks.length - 1)
      }
    }
    this._size++
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    const lastBlock = this.blocks[this.blocks.length - 1]!
    const removed = lastBlock.pop()!
    this._size--
    if (lastBlock.length === 0) {
      this.blocks.splice(this.blocks.length - 1, 1)
    }
    return removed
  }

  unshift(value: T): void {
    if (this.blocks.length === 0) {
      this.blocks.push([value])
    } else {
      const firstBlock = this.blocks[0]!
      firstBlock.unshift(value)
      if (firstBlock.length > this.blockSize) {
        this.splitBlock(0)
      }
    }
    this._size++
  }

  shift(): T | undefined {
    if (this._size === 0) return undefined
    const firstBlock = this.blocks[0]!
    const removed = firstBlock.shift()!
    this._size--
    if (firstBlock.length === 0) {
      this.blocks.splice(0, 1)
    }
    return removed
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const { blockIndex, elementIndex } = this.resolveIndex(index)
    return this.blocks[blockIndex]![elementIndex]
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds for BlockList of size ${this._size}`)
    }
    const { blockIndex, elementIndex } = this.resolveIndex(index)
    this.blocks[blockIndex]![elementIndex] = value
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds for insert on BlockList of size ${this._size}`)
    }
    if (index === 0) {
      this.unshift(value)
      return
    }
    if (index === this._size) {
      this.push(value)
      return
    }
    const { blockIndex, elementIndex } = this.resolveIndex(index)
    const block = this.blocks[blockIndex]!
    block.splice(elementIndex, 0, value)
    this._size++
    if (block.length > this.blockSize) {
      this.splitBlock(blockIndex)
    }
  }

  remove(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const { blockIndex, elementIndex } = this.resolveIndex(index)
    const block = this.blocks[blockIndex]!
    const removed = block.splice(elementIndex, 1)[0]!
    this._size--
    if (block.length === 0) {
      this.blocks.splice(blockIndex, 1)
    } else {
      this.maybeMergeAround(blockIndex)
    }
    return removed
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.blocks = []
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const block = this.blocks[bi]!
      for (let ei = 0; ei < block.length; ei++) {
        result.push(block[ei]!)
      }
    }
    return result
  }

  indexOf(value: T): number {
    let globalIndex = 0
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const block = this.blocks[bi]!
      for (let ei = 0; ei < block.length; ei++) {
        if (block[ei] === value) {
          return globalIndex
        }
        globalIndex++
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  forEach(callback: (item: T, index: number) => void): void {
    let idx = 0
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const block = this.blocks[bi]!
      for (let ei = 0; ei < block.length; ei++) {
        callback(block[ei]!, idx)
        idx++
      }
    }
  }

  map<U>(callback: (item: T, index: number) => U): BlockList<U> {
    const result = new BlockList<U>(this.blockSize)
    let idx = 0
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const block = this.blocks[bi]!
      for (let ei = 0; ei < block.length; ei++) {
        result.push(callback(block[ei]!, idx))
        idx++
      }
    }
    return result
  }

  filter(predicate: (item: T, index: number) => boolean): BlockList<T> {
    const result = new BlockList<T>(this.blockSize)
    let idx = 0
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const block = this.blocks[bi]!
      for (let ei = 0; ei < block.length; ei++) {
        if (predicate(block[ei]!, idx)) {
          result.push(block[ei]!)
        }
        idx++
      }
    }
    return result
  }

  slice(start: number, end?: number): BlockList<T> {
    const s = start < 0 ? Math.max(0, this._size + start) : Math.min(start, this._size)
    const e = end === undefined ? this._size : end < 0 ? Math.max(0, this._size + end) : Math.min(end, this._size)
    const result = new BlockList<T>(this.blockSize)
    for (let i = s; i < e; i++) {
      const { blockIndex, elementIndex } = this.resolveIndex(i)
      result.push(this.blocks[blockIndex]![elementIndex]!)
    }
    return result
  }

  concat(other: BlockList<T>): BlockList<T> {
    const result = new BlockList<T>(this.blockSize)
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const block = this.blocks[bi]!
      for (let ei = 0; ei < block.length; ei++) {
        result.push(block[ei]!)
      }
    }
    for (let bi = 0; bi < other.blocks.length; bi++) {
      const block = other.blocks[bi]!
      for (let ei = 0; ei < block.length; ei++) {
        result.push(block[ei]!)
      }
    }
    return result
  }

  reverse(): BlockList<T> {
    const arr = this.toArray()
    arr.reverse()
    const result = new BlockList<T>(this.blockSize)
    for (let i = 0; i < arr.length; i++) {
      result.push(arr[i]!)
    }
    return result
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const block = this.blocks[bi]!
      for (let ei = 0; ei < block.length; ei++) {
        yield block[ei]!
      }
    }
  }

  get blockCount(): number {
    return this.blocks.length
  }
}

export { DEFAULT_BLOCK_SIZE } from './types.js'
export type { BlockListOptions } from './types.js'
