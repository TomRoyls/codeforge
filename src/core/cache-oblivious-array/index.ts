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

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  reverse(): T[] {
    return this.toArray().reverse()
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }




  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
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

  groupBy<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  tap(fn: (collection: CacheObliviousArray<T>) => void): CacheObliviousArray<T> {
    fn(this)
    return this
  }

  equals(other: CacheObliviousArray<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  zip<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: [T, U][] = []
    for (let i = 0; i < len; i++) {
      result.push([a[i]!, b[i]!])
    }
    return result
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  static empty<T>(): CacheObliviousArray<T> {
    return new CacheObliviousArray<T>()
  }

  get size(): number {
    return this._size
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }
}
