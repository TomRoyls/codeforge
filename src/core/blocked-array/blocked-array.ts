import { DEFAULT_BLOCK_SIZE } from './types.js'
import type { ElementComparator } from './types.js'

export class BlockedArray<T = unknown> {
  private blocks: T[][]
  private _size: number
  private _blockSize: number

  constructor(blockSize?: number) {
    this._blockSize = blockSize !== undefined ? blockSize : DEFAULT_BLOCK_SIZE
    if (this._blockSize < 1) {
      throw new RangeError('blockSize must be at least 1')
    }
    this.blocks = []
    this._size = 0
  }

  static from<T>(values: T[], blockSize?: number): BlockedArray<T> {
    const arr = new BlockedArray<T>(blockSize)
    for (const v of values) {
      arr.push(v)
    }
    return arr
  }

  private ensureCapacity(needed: number): void {
    const currentCapacity = this.blocks.length * this._blockSize
    if (needed <= currentCapacity) {
      return
    }
    const blocksNeeded = Math.ceil(needed / this._blockSize)
    while (this.blocks.length < blocksNeeded) {
      this.blocks.push([])
    }
  }

  private blockIndex(logicalIndex: number): number {
    return Math.floor(logicalIndex / this._blockSize)
  }

  private indexInBlock(logicalIndex: number): number {
    return logicalIndex % this._blockSize
  }

  private normalizeIndex(index: number): number {
    if (index < 0) {
      return this._size + index
    }
    return index
  }

  get(index: number): T {
    const i = this.normalizeIndex(index)
    if (i < 0 || i >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.blocks[this.blockIndex(i)]![this.indexInBlock(i)]!
  }

  set(index: number, value: T): void {
    const i = this.normalizeIndex(index)
    if (i < 0 || i >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    this.blocks[this.blockIndex(i)]![this.indexInBlock(i)] = value
  }

  push(value: T): number {
    this.ensureCapacity(this._size + 1)
    const bi = this.blockIndex(this._size)
    this.blocks[bi]!.push(value)
    this._size++
    return this._size
  }

  pop(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    this._size--
    const bi = this.blockIndex(this._size)
    const value = this.blocks[bi]!.pop()!
    if (this.blocks[bi]!.length === 0) {
      this.blocks.pop()
    }
    return value
  }

  shift(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const value = this.blocks[0]!.shift()!
    this._size--
    if (this.blocks[0]!.length === 0) {
      this.blocks.shift()
    } else {
      this.rebalance()
    }
    return value
  }

  unshift(value: T): number {
    this.ensureCapacity(this._size + 1)
    if (this.blocks.length === 0) {
      this.blocks.push([])
    }
    this.blocks[0]!.unshift(value)
    this._size++
    this.rebalance()
    return this._size
  }

  private rebalance(): void {
    for (let b = 0; b < this.blocks.length - 1; b++) {
      const current = this.blocks[b]!
      const next = this.blocks[b + 1]!
      while (current.length < this._blockSize && next.length > 0) {
        current.push(next.shift()!)
      }
    }
    for (let b = 0; b < this.blocks.length - 1; b++) {
      const current = this.blocks[b]!
      const next = this.blocks[b + 1]!
      while (current.length > this._blockSize) {
        next.unshift(current.pop()!)
      }
    }
    while (this.blocks.length > 0 && this.blocks[this.blocks.length - 1]!.length === 0) {
      this.blocks.pop()
    }
  }

  slice(start?: number, end?: number): BlockedArray<T> {
    const s = start !== undefined ? this.normalizeIndex(start) : 0
    const e = end !== undefined ? this.normalizeIndex(end) : this._size
    const clampedS = Math.max(0, s)
    const clampedE = Math.min(this._size, e)
    const result = new BlockedArray<T>(this._blockSize)
    for (let i = clampedS; i < clampedE; i++) {
      result.push(this.get(i))
    }
    return result
  }

  indexOf(value: T, comparator?: ElementComparator<T>): number {
    if (comparator) {
      for (let i = 0; i < this._size; i++) {
        if (comparator(this.get(i), value)) {
          return i
        }
      }
      return -1
    }
    for (let i = 0; i < this._size; i++) {
      const el = this.get(i)
      if (el === value) {
        return i
      }
    }
    return -1
  }

  includes(value: T, comparator?: ElementComparator<T>): boolean {
    return this.indexOf(value, comparator) !== -1
  }

  forEach(fn: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      fn(this.get(i), i)
    }
  }

  map<U>(fn: (value: T, index: number) => U): BlockedArray<U> {
    const result = new BlockedArray<U>(this._blockSize)
    for (let i = 0; i < this._size; i++) {
      result.push(fn(this.get(i), i))
    }
    return result
  }

  filter(fn: (value: T, index: number) => boolean): BlockedArray<T> {
    const result = new BlockedArray<T>(this._blockSize)
    for (let i = 0; i < this._size; i++) {
      const v = this.get(i)
      if (fn(v, i)) {
        result.push(v)
      }
    }
    return result
  }

  reduce<U>(fn: (acc: U, value: T) => U, initial: U): U {
    let acc = initial
    for (let i = 0; i < this._size; i++) {
      acc = fn(acc, this.get(i))
    }
    return acc
  }

  find(fn: (value: T) => boolean): T | undefined {
    for (let i = 0; i < this._size; i++) {
      const v = this.get(i)
      if (fn(v)) {
        return v
      }
    }
    return undefined
  }

  reverse(): BlockedArray<T> {
    const result = new BlockedArray<T>(this._blockSize)
    for (let i = this._size - 1; i >= 0; i--) {
      result.push(this.get(i))
    }
    return result
  }

  concat(other: BlockedArray<T>): BlockedArray<T> {
    const result = this.clone()
    other.forEach((v) => {
      result.push(v)
    })
    return result
  }

  toArray(): T[] {
    const arr: T[] = []
    for (let i = 0; i < this._size; i++) {
      arr.push(this.get(i))
    }
    return arr
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  blockCount(): number {
    return this.blocks.length
  }

  blockSize(): number {
    return this._blockSize
  }

  toString(): string {
    return this.toArray().toString()
  }

  equals(other: BlockedArray<T>, comparator?: ElementComparator<T>): boolean {
    if (this._size !== other.size()) {
      return false
    }
    for (let i = 0; i < this._size; i++) {
      const a = this.get(i)
      const b = other.get(i)
      if (comparator) {
        if (!comparator(a, b)) {
          return false
        }
      } else if (a !== b) {
        return false
      }
    }
    return true
  }

  clone(): BlockedArray<T> {
    return this.slice()
  }

  fill(value: T, start?: number, end?: number): void {
    const s = start !== undefined ? this.normalizeIndex(start) : 0
    const e = end !== undefined ? this.normalizeIndex(end) : this._size
    const clampedS = Math.max(0, s)
    const clampedE = Math.min(this._size, e)
    for (let i = clampedS; i < clampedE; i++) {
      this.set(i, value)
    }
  }

  splice(start: number, deleteCount?: number, ...items: T[]): BlockedArray<T> {
    const s = this.normalizeIndex(start)
    const clampedS = Math.max(0, Math.min(s, this._size))
    const dc = deleteCount !== undefined ? deleteCount : this._size - clampedS
    const actualDeleteCount = Math.min(dc, this._size - clampedS)

    const removed = new BlockedArray<T>(this._blockSize)
    const allItems: T[] = []

    for (let i = 0; i < clampedS; i++) {
      allItems.push(this.get(i))
    }
    for (let i = 0; i < items.length; i++) {
      allItems.push(items[i]!)
    }
    for (let i = clampedS + actualDeleteCount; i < this._size; i++) {
      allItems.push(this.get(i))
    }
    for (let i = clampedS; i < clampedS + actualDeleteCount; i++) {
      removed.push(this.get(i))
    }

    this.blocks = []
    this._size = 0
    for (const v of allItems) {
      this.push(v)
    }

    return removed
  }
}
