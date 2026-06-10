import type { WaveletStackOptions } from './types.js'
import { increment } from '../../utils/map-helpers.js'

export class WaveletStack<T = unknown> {
  private items: T[] = []
  private counts: Map<T, number> = new Map()
  private _capacity: number

  constructor(options?: WaveletStackOptions) {
    this._capacity = options?.alphabetSize ?? 1024
  }

  push(item: T): void {
    this.items.push(item)
    increment(this.counts, item)
    if (this.items.length > this._capacity) {
      this._capacity = this.items.length * 2
    }
  }

  pop(): T {
    if (this.items.length === 0) {
      throw new Error('Cannot pop from empty stack')
    }
    const item = this.items.pop()!
    const count = this.counts.get(item)!
    if (count === 1) {
      this.counts.delete(item)
    } else {
      this.counts.set(item, count - 1)
    }
    return item
  }

  peek(): T {
    if (this.items.length === 0) {
      throw new Error('Cannot peek empty stack')
    }
    return this.items[this.items.length - 1]!
  }

  size(): number {
    return this.items.length
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  clear(): void {
    this.items = []
    this.counts.clear()
  }

  toArray(): T[] {
    return [...this.items]
  }

  clone(): WaveletStack<T> {
    const cloned = new WaveletStack<T>({ alphabetSize: this._capacity })
    cloned.items = [...this.items]
    cloned.counts = new Map(this.counts)
    return cloned
  }

  count(item: T): number {
    return this.counts.get(item) ?? 0
  }

  rank(position: number, item: T): number {
    if (position < 0 || position >= this.items.length) {
      throw new Error(`Position ${position} out of range [0, ${this.items.length - 1}]`)
    }
    let result = 0
    for (let i = 0; i <= position; i++) {
      if (this.items[i] === item) {
        result++
      }
    }
    return result
  }

  select(occurrence: number, item: T): number {
    if (occurrence < 0) {
      throw new Error('Occurrence must be non-negative')
    }
    let found = 0
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i] === item) {
        if (found === occurrence) {
          return i
        }
        found++
      }
    }
    throw new Error(`Item has no ${occurrence}-th occurrence`)
  }

  access(position: number): T {
    if (position < 0 || position >= this.items.length) {
      throw new Error(`Position ${position} out of range [0, ${this.items.length - 1}]`)
    }
    return this.items[position]!
  }

  histogram(): Map<T, number> {
    return new Map(this.counts)
  }

  get capacity(): number {
    return this._capacity
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const items = this.items
    return {
      next(): IteratorResult<T> {
        if (index < items.length) {
          return { value: items[index++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'WaveletStack', items: this.toArray() }
  }

  toString(): string {
    return `WaveletStack({ size: ${this.items.length} })`
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }
}

export type { WaveletStackOptions } from './types.js'
