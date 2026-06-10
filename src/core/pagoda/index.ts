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
}

export type { PagodaOptions, PagodaNode } from './types.js'
