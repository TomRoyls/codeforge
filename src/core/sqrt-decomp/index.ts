import type { SqrtDecompositionOptions, ForEachCallback } from './types.js'

const defaultOptions: SqrtDecompositionOptions<number> = {
  operation: (a, b) => a + b,
  identity: 0,
}

export class SqrtDecomposition<T> {
  private data: T[]
  private blocks: T[]
  private lazy: T[]
  private _blockSize: number
  private _blockCount: number
  private op: (a: T, b: T) => T
  private identity: T

  constructor(array: T[], options?: SqrtDecompositionOptions<T>) {
    const resolved = options ?? (defaultOptions as unknown as SqrtDecompositionOptions<T>)
    this.op = resolved.operation
    this.identity = resolved.identity
    this.data = array.slice()
    const n = this.data.length
    this._blockSize = n === 0 ? 1 : Math.ceil(Math.sqrt(n))
    this._blockCount = n === 0 ? 0 : Math.ceil(n / this._blockSize)
    this.blocks = []
    this.lazy = []
    this.buildBlocks()
  }

  private buildBlocks(): void {
    this.blocks = new Array(this._blockCount).fill(undefined) as T[]
    this.lazy = new Array(this._blockCount).fill(undefined) as T[]
    for (let b = 0; b < this._blockCount; b++) {
      this.blocks[b] = this.identity
      this.lazy[b] = this.identity
    }
    for (let i = 0; i < this.data.length; i++) {
      const b = Math.floor(i / this._blockSize)
      this.blocks[b] = this.op(this.blocks[b]!, this.data[i]!)
    }
  }

  private pushLazy(blockIndex: number): void {
    const lazyVal = this.lazy[blockIndex]
    if (lazyVal === this.identity) return
    const start = blockIndex * this._blockSize
    const end = Math.min(start + this._blockSize, this.data.length)
    for (let i = start; i < end; i++) {
      this.data[i] = this.op(this.data[i]!, lazyVal!)
    }
    this.lazy[blockIndex] = this.identity
  }

  private blockElementCount(blockIndex: number): number {
    const start = blockIndex * this._blockSize
    const end = Math.min(start + this._blockSize, this.data.length)
    return end - start
  }

  rangeQuery(from: number, to: number): T {
    if (from < 0 || to < 0 || from >= this.data.length || to >= this.data.length) {
      throw new RangeError(`Range [${from}, ${to}] out of bounds [0, ${this.data.length})`)
    }
    if (from > to) {
      throw new RangeError(`Invalid range: from (${from}) > to (${to})`)
    }
    let result = this.identity
    const firstBlock = Math.floor(from / this._blockSize)
    const lastBlock = Math.floor(to / this._blockSize)

    if (firstBlock === lastBlock) {
      for (let i = from; i <= to; i++) {
        result = this.op(result, this.op(this.data[i]!, this.lazy[firstBlock]!))
      }
      return result
    }

    for (let i = from; i < (firstBlock + 1) * this._blockSize && i <= to; i++) {
      result = this.op(result, this.op(this.data[i]!, this.lazy[firstBlock]!))
    }

    for (let b = firstBlock + 1; b < lastBlock; b++) {
      const count = this.blockElementCount(b)
      let blockResult: T = this.blocks[b]!
      for (let k = 0; k < count; k++) {
        blockResult = this.op(blockResult, this.lazy[b]!)
      }
      result = this.op(result, blockResult)
    }

    for (let i = lastBlock * this._blockSize; i <= to; i++) {
      result = this.op(result, this.op(this.data[i]!, this.lazy[lastBlock]!))
    }

    return result
  }

  pointUpdate(index: number, value: T): void {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    const blockIndex = Math.floor(index / this._blockSize)
    this.pushLazy(blockIndex)
    this.data[index] = value
    this.recomputeBlock(blockIndex)
  }

  rangeUpdate(from: number, to: number, delta: T): void {
    if (from < 0 || to < 0 || from >= this.data.length || to >= this.data.length) {
      throw new RangeError(`Range [${from}, ${to}] out of bounds [0, ${this.data.length})`)
    }
    if (from > to) {
      throw new RangeError(`Invalid range: from (${from}) > to (${to})`)
    }
    const firstBlock = Math.floor(from / this._blockSize)
    const lastBlock = Math.floor(to / this._blockSize)

    if (firstBlock === lastBlock) {
      this.pushLazy(firstBlock)
      for (let i = from; i <= to; i++) {
        this.data[i] = this.op(this.data[i]!, delta)
      }
      this.recomputeBlock(firstBlock)
      return
    }

    this.pushLazy(firstBlock)
    for (let i = from; i < (firstBlock + 1) * this._blockSize; i++) {
      this.data[i] = this.op(this.data[i]!, delta)
    }
    this.recomputeBlock(firstBlock)

    for (let b = firstBlock + 1; b < lastBlock; b++) {
      this.lazy[b] = this.op(this.lazy[b]!, delta)
    }

    this.pushLazy(lastBlock)
    for (let i = lastBlock * this._blockSize; i <= to; i++) {
      this.data[i] = this.op(this.data[i]!, delta)
    }
    this.recomputeBlock(lastBlock)
  }

  private recomputeBlock(blockIndex: number): void {
    const start = blockIndex * this._blockSize
    const end = Math.min(start + this._blockSize, this.data.length)
    this.blocks[blockIndex] = this.identity
    for (let i = start; i < end; i++) {
      this.blocks[blockIndex] = this.op(this.blocks[blockIndex]!, this.data[i]!)
    }
  }

  get(index: number): T {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    const blockIndex = Math.floor(index / this._blockSize)
    return this.op(this.data[index]!, this.lazy[blockIndex]!)
  }

  set(index: number, value: T): void {
    this.pointUpdate(index, value)
  }

  get size(): number {
    return this.data.length
  }

  get isEmpty(): boolean {
    return this.data.length === 0
  }

  clear(): void {
    this.data = []
    this.blocks = []
    this.lazy = []
    this._blockSize = 1
    this._blockCount = 0
  }

  toArray(): T[] {
    const result: T[] = new Array(this.data.length) as T[]
    for (let i = 0; i < this.data.length; i++) {
      const blockIndex = Math.floor(i / this._blockSize)
      result[i] = this.op(this.data[i]!, this.lazy[blockIndex]!)
    }
    return result
  }

  clone(): SqrtDecomposition<T> {
    const copy = new SqrtDecomposition<T>([], { operation: this.op, identity: this.identity })
    copy.data = this.data.slice()
    copy.blocks = this.blocks.slice()
    copy.lazy = this.lazy.slice()
    copy._blockSize = this._blockSize
    copy._blockCount = this._blockCount
    return copy
  }

  push(item: T): void {
    this.data.push(item)
    const n = this.data.length
    const newBlockCount = n === 0 ? 0 : Math.ceil(n / this._blockSize)
    if (newBlockCount > this._blockCount) {
      this._blockCount = newBlockCount
      this.blocks.push(this.identity)
      this.lazy.push(this.identity)
    }
    const blockIndex = Math.floor((n - 1) / this._blockSize)
    this.blocks[blockIndex] = this.op(this.blocks[blockIndex]!, item)
  }

  pop(): T {
    if (this.data.length === 0) {
      throw new RangeError('Cannot pop from empty structure')
    }
    const lastBlockIndex = Math.floor((this.data.length - 1) / this._blockSize)
    this.pushLazy(lastBlockIndex)
    const value = this.data.pop()!
    const n = this.data.length
    const newBlockCount = n === 0 ? 0 : Math.ceil(n / this._blockSize)
    if (newBlockCount < this._blockCount) {
      this._blockCount = newBlockCount
      this.blocks.pop()
      this.lazy.pop()
    } else {
      this.recomputeBlock(lastBlockIndex)
    }
    return value
  }

  static fromArray<U>(items: U[], options?: SqrtDecompositionOptions<U>): SqrtDecomposition<U> {
    return new SqrtDecomposition<U>(items, options)
  }

  forEach(callback: ForEachCallback<T>): void {
    for (let i = 0; i < this.data.length; i++) {
      const blockIndex = Math.floor(i / this._blockSize)
      callback(this.op(this.data[i]!, this.lazy[blockIndex]!), i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.data.length; i++) {
      const blockIndex = Math.floor(i / this._blockSize)
      yield this.op(this.data[i]!, this.lazy[blockIndex]!)
    }
  }

  rebuild(): void {
    const n = this.data.length
    for (let b = 0; b < this._blockCount; b++) {
      this.pushLazy(b)
    }
    this._blockSize = n === 0 ? 1 : Math.ceil(Math.sqrt(n))
    this._blockCount = n === 0 ? 0 : Math.ceil(n / this._blockSize)
    this.buildBlocks()
  }

  get blockCount(): number {
    return this._blockCount
  }

  get blockSize(): number {
    return this._blockSize
  }

  static from<T>(items: T[]): SqrtDecomposition<T> {
    return new SqrtDecomposition<T>(items)
  }
}
