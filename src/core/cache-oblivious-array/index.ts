import type { SearchComparator, ForEachCallback } from './types.js'

export class CacheObliviousArray<T> {
  private data: T[]
  private _size: number
  private _blockSize: number

  constructor(items?: T[]) {
    this.data = []
    this._size = 0
    this._blockSize = 1
    if (items !== undefined && items.length > 0) {
      for (const item of items) {
        this.data.push(item)
      }
      this._size = items.length
      this._blockSize = this.computeBlockSize(this._size)
    }
  }

  private computeBlockSize(n: number): number {
    if (n <= 1) return 1
    return Math.max(1, Math.floor(Math.sqrt(n)))
  }

  blockSize(): number {
    return this._blockSize
  }

  blockCount(): number {
    if (this._size === 0) return 0
    return Math.ceil(this._size / this._blockSize)
  }

  private logicalToPhysical(index: number): number {
    const block = Math.floor(index / this._blockSize)
    const offset = index % this._blockSize
    return block * this._blockSize + offset
  }

  private updateBlockSize(): void {
    const newBlockSize = this.computeBlockSize(this._size)
    if (newBlockSize !== this._blockSize) {
      const elements = this.data.slice(0, this._size)
      this._blockSize = newBlockSize
      const newData: T[] = new Array(this._size)
      for (let i = 0; i < this._size; i++) {
        newData[this.logicalToPhysical(i)] = elements[i]!
      }
      this.data = newData
    }
  }

  get(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.data[this.logicalToPhysical(index)]!
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    this.data[this.logicalToPhysical(index)] = value
  }

  push(item: T): void {
    this.data.push(item)
    this._size++
    this.updateBlockSize()
  }

  pop(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot pop from empty array')
    }
    this._size--
    const result = this.data.pop()!
    this.updateBlockSize()
    return result
  }

  length(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.data = []
    this._size = 0
    this._blockSize = 1
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.data[this.logicalToPhysical(i)]!)
    }
    return result
  }

  indexOf(item: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.data[this.logicalToPhysical(i)] === item) {
        return i
      }
    }
    return -1
  }

  includes(item: T): boolean {
    return this.indexOf(item) !== -1
  }

  slice(start?: number, end?: number): T[] {
    const s = start !== undefined
      ? (start < 0 ? Math.max(0, this._size + start) : start)
      : 0
    const e = end !== undefined
      ? (end < 0 ? Math.max(0, this._size + end) : end)
      : this._size
    const result: T[] = []
    const endIdx = Math.min(e, this._size)
    for (let i = s; i < endIdx; i++) {
      result.push(this.data[this.logicalToPhysical(i)]!)
    }
    return result
  }

  forEach(callback: ForEachCallback<T>): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.data[this.logicalToPhysical(i)]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.data[this.logicalToPhysical(i)]!
    }
  }

  search(comparator: SearchComparator<T>): number {
    let lo = 0
    let hi = this._size - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = comparator(this.data[this.logicalToPhysical(mid)]!)
      if (cmp === 0) return mid
      if (cmp < 0) lo = mid + 1
      else hi = mid - 1
    }
    return -1
  }

  clone(): CacheObliviousArray<T> {
    return new CacheObliviousArray<T>(this.toArray())
  }

  static fromArray<U>(items: U[]): CacheObliviousArray<U> {
    return new CacheObliviousArray<U>(items)
  }

  toString(): string {
    return `CacheObliviousArray({ size: ${this._size} })`
  }

  toJSON() {
    return { type: 'CacheObliviousArray', items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }
}
