import type { PagedArrayOptions, PagedArrayStatistics } from './types.js'
import { DEFAULT_PAGED_ARRAY_OPTIONS } from './types.js'

export class PagedArray<T = unknown> {
  private pages: T[][] = []
  private _size: number = 0
  private readonly _pageSize: number
  private stats: PagedArrayStatistics = {
    pushes: 0,
    pops: 0,
    sets: 0,
    gets: 0,
    pagesAllocated: 0,
    pagesFreed: 0,
    compactions: 0,
  }

  constructor(options?: Partial<PagedArrayOptions>) {
    const resolved = { ...DEFAULT_PAGED_ARRAY_OPTIONS, ...options }
    this._pageSize = Math.max(1, Math.floor(resolved.pageSize!))
  }

  push(value: T): void {
    const pageIndex = Math.floor(this._size / this._pageSize)
    const indexInPage = this._size % this._pageSize
    if (indexInPage === 0) {
      const page: T[] = new Array(this._pageSize)
      page[0] = value
      this.pages.push(page)
      this.stats.pagesAllocated++
    } else {
      this.pages[pageIndex]![indexInPage] = value
    }
    this._size++
    this.stats.pushes++
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    this._size--
    const pageIndex = Math.floor(this._size / this._pageSize)
    const indexInPage = this._size % this._pageSize
    const value = this.pages[pageIndex]![indexInPage]!
    this.pages[pageIndex]![indexInPage] = undefined as T
    this.stats.pops++
    if (this._size === 0) {
      this.pages.length = 0
      this.stats.pagesFreed++
    }
    return value
  }

  get(index: number): T | undefined {
    this.stats.gets++
    if (index < 0 || index >= this._size) return undefined
    const pageIndex = Math.floor(index / this._pageSize)
    const indexInPage = index % this._pageSize
    return this.pages[pageIndex]![indexInPage]
  }

  set(index: number, value: T): void {
    this.stats.sets++
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const pageIndex = Math.floor(index / this._pageSize)
    const indexInPage = index % this._pageSize
    this.pages[pageIndex]![indexInPage] = value
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size}]`)
    }
    if (index === this._size) {
      this.push(value)
      return
    }
    const lastValue = this.get(this._size - 1)!
    this.push(lastValue)
    for (let i = this._size - 2; i > index; i--) {
      this.set(i, this.get(i - 1)!)
    }
    this.set(index, value)
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const value = this.get(index)!
    for (let i = index; i < this._size - 1; i++) {
      this.set(i, this.get(i + 1)!)
    }
    this.pop()
    return value
  }

  get size(): number {
    return this._size
  }

  capacity(): number {
    return this.pages.length * this._pageSize
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.pages.length = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = new Array(this._size)
    for (let i = 0; i < this._size; i++) {
      const pageIndex = Math.floor(i / this._pageSize)
      const indexInPage = i % this._pageSize
      result[i] = this.pages[pageIndex]![indexInPage]!
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const pageIndex = Math.floor(i / this._pageSize)
      const indexInPage = i % this._pageSize
      callback(this.pages[pageIndex]![indexInPage]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      const pageIndex = Math.floor(i / this._pageSize)
      const indexInPage = i % this._pageSize
      yield this.pages[pageIndex]![indexInPage]!
    }
  }

  at(index: number): T | undefined {
    return this.get(index)
  }

  fill(value: T, start: number = 0, end?: number): void {
    const effectiveEnd = end === undefined ? this._size : (end < 0 ? Math.max(0, this._size + end) : end)
    const s = start < 0 ? Math.max(0, this._size + start) : Math.max(0, start)
    const e = Math.min(this._size, effectiveEnd)
    for (let i = s; i < e; i++) {
      const pageIndex = Math.floor(i / this._pageSize)
      const indexInPage = i % this._pageSize
      this.pages[pageIndex]![indexInPage] = value
    }
  }

  pageCount(): number {
    return this.pages.length
  }

  pageSize(): number {
    return this._pageSize
  }

  compact(): void {
    if (this._size === 0) return
    const needed = Math.ceil(this._size / this._pageSize)
    if (needed === this.pages.length) return
    const freed = this.pages.length - needed
    this.pages.length = needed
    this.stats.pagesFreed += freed
    this.stats.compactions++
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      const pageIndex = Math.floor(i / this._pageSize)
      const indexInPage = i % this._pageSize
      if (this.pages[pageIndex]![indexInPage] === value) return i
    }
    return -1
  }

  lastIndexOf(value: T): number {
    for (let i = this._size - 1; i >= 0; i--) {
      const pageIndex = Math.floor(i / this._pageSize)
      const indexInPage = i % this._pageSize
      if (this.pages[pageIndex]![indexInPage] === value) return i
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  slice(start: number = 0, end?: number): T[] {
    const s = start < 0 ? Math.max(0, this._size + start) : Math.min(this._size, start)
    const e = end === undefined ? this._size : (end < 0 ? Math.max(0, this._size + end) : Math.min(this._size, end))
    if (s >= e) return []
    const result: T[] = new Array(e - s)
    for (let i = s; i < e; i++) {
      const pageIndex = Math.floor(i / this._pageSize)
      const indexInPage = i % this._pageSize
      result[i - s] = this.pages[pageIndex]![indexInPage]!
    }
    return result
  }

  getStatistics(): PagedArrayStatistics {
    return { ...this.stats }
  }
}

export { DEFAULT_PAGED_ARRAY_OPTIONS } from './types.js'
export type { PagedArrayOptions, PagedArrayStatistics } from './types.js'
