import type { RandomizedSetOptions, RandomizedSetStats } from './types.js'
import { DEFAULT_RANDOMIZED_SET_OPTIONS } from './types.js'

export class RandomizedSet<T> {
  private readonly map: Map<T, number>
  private readonly arr: T[]

  constructor(items?: readonly T[], options?: RandomizedSetOptions) {
    const opts = options ?? DEFAULT_RANDOMIZED_SET_OPTIONS
    const capacity = opts.initialCapacity ?? DEFAULT_RANDOMIZED_SET_OPTIONS.initialCapacity!
    this.map = new Map()
    this.arr = []
    if (capacity > 0) {
      this.arr.length = capacity
      this.arr.length = 0
    }
    if (items) {
      for (const item of items) {
        this.add(item)
      }
    }
  }

  add(value: T): boolean {
    if (this.map.has(value)) {
      return false
    }
    this.map.set(value, this.arr.length)
    this.arr.push(value)
    return true
  }

  delete(value: T): boolean {
    const idx = this.map.get(value)
    if (idx === undefined) {
      return false
    }
    const lastIdx = this.arr.length - 1
    if (idx !== lastIdx) {
      const lastVal = this.arr[lastIdx]!
      this.arr[idx] = lastVal
      this.map.set(lastVal, idx)
    }
    this.arr.pop()
    this.map.delete(value)
    return true
  }

  has(value: T): boolean {
    return this.map.has(value)
  }

  getRandom(): T {
    if (this.arr.length === 0) {
      throw new Error('Cannot get random element from empty set')
    }
    const idx = Math.floor(Math.random() * this.arr.length)
    return this.arr[idx]!
  }

  get size(): number {
    return this.arr.length
  }

  isEmpty(): boolean {
    return this.arr.length === 0
  }

  clear(): void {
    this.map.clear()
    this.arr.length = 0
  }

  forEach(callback: (value: T) => void): void {
    for (let i = 0; i < this.arr.length; i++) {
      callback(this.arr[i]!)
    }
  }

  toArray(): T[] {
    return this.arr.slice()
  }

  values(): T[] {
    return this.arr.slice()
  }

  clone(): RandomizedSet<T> {
    const copy = new RandomizedSet<T>(undefined, { initialCapacity: this.arr.length })
    for (let i = 0; i < this.arr.length; i++) {
      const val = this.arr[i]!
      copy.map.set(val, i)
      copy.arr.push(val)
    }
    return copy
  }

  getStats(): RandomizedSetStats {
    return {
      size: this.arr.length,
      capacity: this.arr.length,
    }
  }

  static from<T>(items: readonly T[]): RandomizedSet<T> {
    return new RandomizedSet(items)
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const arr = this.arr
    const len = arr.length
    return {
      next(): IteratorResult<T> {
        if (index < len) {
          return { value: arr[index++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }
}

export type { RandomizedSetOptions, RandomizedSetStats } from './types.js'
export { DEFAULT_RANDOMIZED_SET_OPTIONS } from './types.js'
