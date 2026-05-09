import type { RandomQueueOptions } from './types.js'
import { DEFAULT_RANDOM_QUEUE_OPTIONS } from './types.js'

class SeededRNG {
  private state: number

  constructor(seed: number) {
    this.state = seed
  }

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) | 0
    return (this.state >>> 0) / 4294967296
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max)
  }
}

function swap<T>(arr: T[], i: number, j: number): void {
  const tmp = arr[i]!
  arr[i] = arr[j]!
  arr[j] = tmp
}

export class RandomQueue<T = unknown> {
  private items: T[] = []
  private rng: SeededRNG
  private options: RandomQueueOptions

  constructor(options?: { seed?: number }) {
    const resolved = { ...DEFAULT_RANDOM_QUEUE_OPTIONS, ...options }
    this.options = resolved
    this.rng = new SeededRNG(resolved.seed)
  }

  enqueue(item: T): void {
    this.items.push(item)
  }

  dequeue(): T | undefined {
    if (this.items.length === 0) {
      return undefined
    }
    const idx = this.rng.nextInt(this.items.length)
    const item = this.items[idx]!
    const lastIdx = this.items.length - 1
    this.items[idx] = this.items[lastIdx]!
    this.items.pop()
    return item
  }

  peek(): T | undefined {
    if (this.items.length === 0) {
      return undefined
    }
    const idx = this.rng.nextInt(this.items.length)
    return this.items[idx]!
  }

  sample(count: number): T[] {
    const result: T[] = []
    const n = this.items.length
    const maxCount = Math.min(count, n)
    if (maxCount <= 0) {
      return result
    }
    const indices: number[] = []
    for (let i = 0; i < n; i++) {
      indices.push(i)
    }
    for (let i = indices.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(i + 1)
      swap(indices, i, j)
    }
    for (let i = 0; i < maxCount; i++) {
      const sampleIdx = indices[i]!
      result.push(this.items[sampleIdx]!)
    }
    return result
  }

  sampleWithReplacement(count: number): T[] {
    const result: T[] = []
    if (this.items.length === 0) {
      return result
    }
    for (let i = 0; i < count; i++) {
      const idx = this.rng.nextInt(this.items.length)
      result.push(this.items[idx]!)
    }
    return result
  }

  shuffle(): T[] {
    const result = [...this.items]
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(i + 1)
      swap(result, i, j)
    }
    return result
  }

  contains(item: T): boolean {
    return this.items.includes(item)
  }

  remove(predicate: (item: T) => boolean): number {
    let removed = 0
    for (let i = this.items.length - 1; i >= 0; i--) {
      const elem = this.items[i]!
      if (predicate(elem)) {
        const lastIdx = this.items.length - 1
        this.items[i] = this.items[lastIdx]!
        this.items.pop()
        removed++
      }
    }
    return removed
  }

  size(): number {
    return this.items.length
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  clear(): void {
    this.items = []
  }

  toArray(): T[] {
    return [...this.items]
  }

  clone(): RandomQueue<T> {
    const cloned = new RandomQueue<T>({ seed: this.options.seed })
    cloned.items = [...this.items]
    return cloned
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this.items.length; i++) {
      callback(this.items[i]!, i)
    }
  }

  drain(): T[] {
    const result = [...this.items]
    this.items = []
    return result
  }

  *[Symbol.iterator](): Iterator<T> {
    const shuffled = this.shuffle()
    for (const item of shuffled) {
      yield item
    }
  }

  static fromArray<U>(items: U[], options?: { seed?: number }): RandomQueue<U> {
    const queue = new RandomQueue<U>(options)
    for (const item of items) {
      queue.enqueue(item)
    }
    return queue
  }
}

export { DEFAULT_RANDOM_QUEUE_OPTIONS } from './types.js'
export type { RandomQueueOptions } from './types.js'
