import type { PagodaOptions } from './types.js'

export class Pagoda<T = number> {
  private items: T[] = []
  private compare: (a: T, b: T) => number
  private _head = 0

  constructor(options?: PagodaOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  insert(value: T): void {
    let lo = 0
    let hi = this.items.length - this._head
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (this.compare(this.items[mid + this._head]!, value) < 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    this.items.splice(lo + this._head, 0, value)
  }

  extractMin(): T {
    if (this.items.length - this._head === 0) {
      throw new Error('Pagoda is empty')
    }
    const result = this.items[this._head]!
    this._head++
    if (this._head > (this.items.length / 2)) {
      this._compact()
    }
    return result
  }

  peek(): T {
    if (this.items.length - this._head === 0) {
      throw new Error('Pagoda is empty')
    }
    return this.items[this._head]!
  }

  get size(): number {
    return this.items.length - this._head
  }

  get isEmpty(): boolean {
    return this.items.length - this._head === 0
  }

  clear(): void {
    this.items = []
    this._head = 0
  }

  merge(other: Pagoda<T>): void {
    if (other === this) return
    const merged: T[] = []
    let i = 0
    let j = 0
    const thisLength = this.items.length - this._head
    const otherLength = other.items.length - other._head
    while (i < thisLength && j < otherLength) {
      if (this.compare(this.items[i + this._head]!, other.items[j + other._head]!) <= 0) {
        merged.push(this.items[i + this._head]!)
        i++
      } else {
        merged.push(other.items[j + other._head]!)
        j++
      }
    }
    while (i < thisLength) {
      merged.push(this.items[i + this._head]!)
      i++
    }
    while (j < otherLength) {
      merged.push(other.items[j + other._head]!)
      j++
    }
    this.items = merged
    this._head = 0
    this._size += other._size
    other.items = []
    other._size = 0
    other._head = 0
  }

  private _size = 0

  private _compact(): void {
    if (this._head > 0) {
      this.items = this.items.slice(this._head)
      this._head = 0
    }
  }

  toArray(): T[] {
    return this.items.slice(this._head)
  }

  toSortedArray(): T[] {
    return this.items.slice(this._head)
  }

  contains(value: T): boolean {
    let lo = 0
    let hi = this.items.length - this._head - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const cmp = this.compare(this.items[mid + this._head]!, value)
      if (cmp === 0) return true
      if (cmp < 0) lo = mid + 1
      else hi = mid - 1
    }
    return false
  }

  clone(): Pagoda<T> {
    const cloned = new Pagoda<T>({ comparator: this.compare })
    cloned.items = [...this.items.slice(this._head)]
    cloned._head = 0
    cloned._size = this._size
    return cloned
  }

  static fromArray<U>(items: U[], options?: PagodaOptions<U>): Pagoda<U> {
    const heap = new Pagoda<U>(options)
    for (let i = 0; i < items.length; i++) {
      heap.insert(items[i]!)
    }
    return heap
  }

  static merge<U>(a: Pagoda<U>, b: Pagoda<U>): Pagoda<U> {
    const result = a.clone()
    result.merge(b.clone())
    return result
  }

  forEach(callback: (item: T) => void): void {
    for (let i = this._head; i < this.items.length; i++) {
      callback(this.items[i]!)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = this._head; i < this.items.length; i++) {
      yield this.items[i]!
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `Pagoda({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'Pagoda', size: this.size, items: this.toArray() }
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

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
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

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }

  with(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    arr[index] = value
    return arr
  }
}

export type { PagodaOptions, PagodaNode } from './types.js'
