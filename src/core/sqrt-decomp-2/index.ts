import type { SqrtDecomp2Options, ForEachCallback } from './types.js'

const defaultMerge = (a: number, b: number): number => a + b
const defaultIdentity = 0

export class SqrtDecomp2<T> {
  private data: T[]
  private blocks: T[]
  private lazy: T[]
  private _blockSize: number
  private _blockCount: number
  private merge: (a: T, b: T) => T
  private identity: T

  constructor(arr: T[], options?: SqrtDecomp2Options<T>) {
    const hasCustomMerge = options?.merge !== undefined
    const hasCustomIdentity = options?.identity !== undefined

    if (hasCustomMerge) {
      this.merge = options.merge!
    } else {
      this.merge = defaultMerge as unknown as (a: T, b: T) => T
    }

    if (hasCustomIdentity) {
      this.identity = options.identity!
    } else {
      this.identity = defaultIdentity as unknown as T
    }

    this.data = arr.slice()
    const n = this.data.length

    if (options?.blockSize !== undefined && options.blockSize > 0) {
      this._blockSize = options.blockSize
    } else {
      this._blockSize = n === 0 ? 1 : Math.ceil(Math.sqrt(n))
    }

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
      this.blocks[b] = this.merge(this.blocks[b]!, this.data[i]!)
    }
  }

  private pushLazy(blockIndex: number): void {
    const lazyVal = this.lazy[blockIndex]
    if (lazyVal === this.identity) return
    const start = blockIndex * this._blockSize
    const end = Math.min(start + this._blockSize, this.data.length)
    for (let i = start; i < end; i++) {
      this.data[i] = this.merge(this.data[i]!, lazyVal!)
    }
    this.lazy[blockIndex] = this.identity
  }

  private blockElementCount(blockIndex: number): number {
    const start = blockIndex * this._blockSize
    const end = Math.min(start + this._blockSize, this.data.length)
    return end - start
  }

  private recomputeBlock(blockIndex: number): void {
    const start = blockIndex * this._blockSize
    const end = Math.min(start + this._blockSize, this.data.length)
    this.blocks[blockIndex] = this.identity
    for (let i = start; i < end; i++) {
      this.blocks[blockIndex] = this.merge(this.blocks[blockIndex]!, this.data[i]!)
    }
  }

  query(l: number, r: number): T {
    if (l < 0 || r < 0 || l > this.data.length || r > this.data.length) {
      throw new RangeError(`Range [${l}, ${r}) out of bounds [0, ${this.data.length})`)
    }
    if (l > r) {
      throw new RangeError(`Invalid range: l (${l}) > r (${r})`)
    }
    if (l === r) return this.identity

    let result = this.identity
    const lastIdx = r - 1
    const firstBlock = Math.floor(l / this._blockSize)
    const lastBlock = Math.floor(lastIdx / this._blockSize)

    if (firstBlock === lastBlock) {
      for (let i = l; i <= lastIdx; i++) {
        result = this.merge(result, this.merge(this.data[i]!, this.lazy[firstBlock]!))
      }
      return result
    }

    const firstBlockEnd = Math.min((firstBlock + 1) * this._blockSize, r)
    for (let i = l; i < firstBlockEnd; i++) {
      result = this.merge(result, this.merge(this.data[i]!, this.lazy[firstBlock]!))
    }

    for (let b = firstBlock + 1; b < lastBlock; b++) {
      const count = this.blockElementCount(b)
      let blockResult: T = this.blocks[b]!
      for (let k = 0; k < count; k++) {
        blockResult = this.merge(blockResult, this.lazy[b]!)
      }
      result = this.merge(result, blockResult)
    }

    for (let i = lastBlock * this._blockSize; i <= lastIdx; i++) {
      result = this.merge(result, this.merge(this.data[i]!, this.lazy[lastBlock]!))
    }

    return result
  }

  update(index: number, value: T): void {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    const blockIndex = Math.floor(index / this._blockSize)
    this.pushLazy(blockIndex)
    this.data[index] = value
    this.recomputeBlock(blockIndex)
  }

  rangeAdd(l: number, r: number, value: T): void {
    if (l < 0 || r < 0 || l > this.data.length || r > this.data.length) {
      throw new RangeError(`Range [${l}, ${r}) out of bounds [0, ${this.data.length})`)
    }
    if (l > r) {
      throw new RangeError(`Invalid range: l (${l}) > r (${r})`)
    }
    if (l === r) return

    const lastIdx = r - 1
    const firstBlock = Math.floor(l / this._blockSize)
    const lastBlock = Math.floor(lastIdx / this._blockSize)

    if (firstBlock === lastBlock) {
      this.pushLazy(firstBlock)
      for (let i = l; i <= lastIdx; i++) {
        this.data[i] = this.merge(this.data[i]!, value)
      }
      this.recomputeBlock(firstBlock)
      return
    }

    this.pushLazy(firstBlock)
    const firstBlockEnd = Math.min((firstBlock + 1) * this._blockSize, r)
    for (let i = l; i < firstBlockEnd; i++) {
      this.data[i] = this.merge(this.data[i]!, value)
    }
    this.recomputeBlock(firstBlock)

    for (let b = firstBlock + 1; b < lastBlock; b++) {
      this.lazy[b] = this.merge(this.lazy[b]!, value)
    }

    this.pushLazy(lastBlock)
    for (let i = lastBlock * this._blockSize; i <= lastIdx; i++) {
      this.data[i] = this.merge(this.data[i]!, value)
    }
    this.recomputeBlock(lastBlock)
  }

  get(index: number): T {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    const blockIndex = Math.floor(index / this._blockSize)
    return this.merge(this.data[index]!, this.lazy[blockIndex]!)
  }

  set(index: number, value: T): void {
    this.update(index, value)
  }

  get size(): number {
    return this.data.length
  }

  get isEmpty(): boolean {
    return this.data.length === 0
  }

  get blockSize(): number {
    return this._blockSize
  }

  toArray(): T[] {
    const result: T[] = new Array(this.data.length) as T[]
    for (let i = 0; i < this.data.length; i++) {
      const blockIndex = Math.floor(i / this._blockSize)
      result[i] = this.merge(this.data[i]!, this.lazy[blockIndex]!)
    }
    return result
  }

  clone(): SqrtDecomp2<T> {
    const copy = new SqrtDecomp2<T>([], {
      blockSize: this._blockSize,
      merge: this.merge,
      identity: this.identity,
    })
    copy.data = this.data.slice()
    copy.blocks = this.blocks.slice()
    copy.lazy = this.lazy.slice()
    copy._blockSize = this._blockSize
    copy._blockCount = this._blockCount
    return copy
  }

  static fromArray<U>(arr: U[], options?: SqrtDecomp2Options<U>): SqrtDecomp2<U> {
    return new SqrtDecomp2<U>(arr, options)
  }

  clear(): void {
    this.data = []
    this.blocks = []
    this.lazy = []
    this._blockCount = 0
  }

  forEach(callback: ForEachCallback<T>): void {
    for (let i = 0; i < this.data.length; i++) {
      const blockIndex = Math.floor(i / this._blockSize)
      callback(this.merge(this.data[i]!, this.lazy[blockIndex]!), i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.data.length; i++) {
      const blockIndex = Math.floor(i / this._blockSize)
      yield this.merge(this.data[i]!, this.lazy[blockIndex]!)
    }
  }

  first(): T {
    if (this.data.length === 0) {
      throw new RangeError('Structure is empty')
    }
    return this.get(0)
  }

  last(): T {
    if (this.data.length === 0) {
      throw new RangeError('Structure is empty')
    }
    return this.get(this.data.length - 1)
  }

  indexOf(value: T): number {
    for (let i = 0; i < this.data.length; i++) {
      if (this.get(i) === value) return i
    }
    return -1
  }

  min(): T {
    if (this.data.length === 0) {
      throw new RangeError('Structure is empty')
    }
    let result = this.get(0)
    for (let i = 1; i < this.data.length; i++) {
      const val = this.get(i)
      if (val < result) result = val
    }
    return result
  }

  max(): T {
    if (this.data.length === 0) {
      throw new RangeError('Structure is empty')
    }
    let result = this.get(0)
    for (let i = 1; i < this.data.length; i++) {
      const val = this.get(i)
      if (val > result) result = val
    }
    return result
  }

  sum(): T {
    return this.query(0, this.data.length)
  }

  push(value: T): void {
    this.data.push(value)
    const n = this.data.length
    const newBlockCount = n === 0 ? 0 : Math.ceil(n / this._blockSize)
    if (newBlockCount > this._blockCount) {
      this._blockCount = newBlockCount
      this.blocks.push(this.identity)
      this.lazy.push(this.identity)
    }
    const blockIndex = Math.floor((n - 1) / this._blockSize)
    this.blocks[blockIndex] = this.merge(this.blocks[blockIndex]!, value)
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

  static from<T>(items: T[]): SqrtDecomp2<T> {
    return new SqrtDecomp2<T>(items)
  }

  toString(): string {
    return `SqrtDecomp2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SqrtDecomp2', size: this.size, items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }

  static of<T>(...items: T[]): SqrtDecomp2<T> {
    return SqrtDecomp2.from(items)
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  unique(): T[] {
    return [...new Set(this.toArray())]
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  equals(other: T[]): boolean {
    const a = this.toArray()
    if (a.length !== other.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== other[i]) return false
    }
    return true
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }
}
