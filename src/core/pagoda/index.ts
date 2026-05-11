import type { PagodaOptions } from './types.js'

export class Pagoda<T = number> {
  private items: T[] = []
  private compare: (a: T, b: T) => number

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
    let hi = this.items.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (this.compare(this.items[mid]!, value) < 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    this.items.splice(lo, 0, value)
  }

  extractMin(): T {
    if (this.items.length === 0) {
      throw new Error('Pagoda is empty')
    }
    return this.items.shift()!
  }

  peek(): T {
    if (this.items.length === 0) {
      throw new Error('Pagoda is empty')
    }
    return this.items[0]!
  }

  get size(): number {
    return this.items.length
  }

  get isEmpty(): boolean {
    return this.items.length === 0
  }

  clear(): void {
    this.items = []
  }

  merge(other: Pagoda<T>): void {
    if (other === this) return
    const merged: T[] = []
    let i = 0
    let j = 0
    while (i < this.items.length && j < other.items.length) {
      if (this.compare(this.items[i]!, other.items[j]!) <= 0) {
        merged.push(this.items[i]!)
        i++
      } else {
        merged.push(other.items[j]!)
        j++
      }
    }
    while (i < this.items.length) {
      merged.push(this.items[i]!)
      i++
    }
    while (j < other.items.length) {
      merged.push(other.items[j]!)
      j++
    }
    this.items = merged
    this._size += other._size
    other.items = []
    other._size = 0
  }

  private _size = 0

  toArray(): T[] {
    return [...this.items]
  }

  toSortedArray(): T[] {
    return [...this.items]
  }

  contains(value: T): boolean {
    let lo = 0
    let hi = this.items.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const cmp = this.compare(this.items[mid]!, value)
      if (cmp === 0) return true
      if (cmp < 0) lo = mid + 1
      else hi = mid - 1
    }
    return false
  }

  clone(): Pagoda<T> {
    const cloned = new Pagoda<T>({ comparator: this.compare })
    cloned.items = [...this.items]
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
    for (let i = 0; i < this.items.length; i++) {
      callback(this.items[i]!)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.items.length; i++) {
      yield this.items[i]!
    }
  }
}

export type { PagodaOptions, PagodaNode } from './types.js'
