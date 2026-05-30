import type { MonotonicQueueOptions } from './types.js'
import { defaultComparator } from './types.js'

export class MonotonicQueue<T> {
  private deque: T[] = []
  private _frontIdx = 0
  private compare: (a: T, b: T) => number
  private dir: 'increasing' | 'decreasing'

  constructor(options?: MonotonicQueueOptions<T>) {
    this.compare = options?.comparator ?? (defaultComparator as (a: T, b: T) => number)
    this.dir = options?.direction ?? 'decreasing'
  }

  private get _size(): number {
    return this.deque.length - this._frontIdx
  }

  private _maybeCompact(): void {
    if (this._frontIdx > 64 && this._frontIdx > this.deque.length >> 1) {
      this.deque = this.deque.slice(this._frontIdx)
      this._frontIdx = 0
    }
  }

  push(value: T): void {
    if (this.dir === 'decreasing') {
      while (
        this.deque.length > this._frontIdx &&
        this.compare(this.deque[this.deque.length - 1]!, value) < 0
      ) {
        this.deque.pop()
      }
    } else {
      while (
        this.deque.length > this._frontIdx &&
        this.compare(this.deque[this.deque.length - 1]!, value) > 0
      ) {
        this.deque.pop()
      }
    }
    this.deque.push(value)
  }

  pop(): T | undefined {
    if (this._frontIdx >= this.deque.length) return undefined
    const value = this.deque[this._frontIdx]!
    this._frontIdx++
    this._maybeCompact()
    return value
  }

  popIfFront(value: T): boolean {
    if (this._frontIdx < this.deque.length && this.compare(this.deque[this._frontIdx]!, value) === 0) {
      this._frontIdx++
      this._maybeCompact()
      return true
    }
    return false
  }

  front(): T | undefined {
    return this._frontIdx < this.deque.length ? this.deque[this._frontIdx] : undefined
  }

  back(): T | undefined {
    return this.deque.length > this._frontIdx ? this.deque[this.deque.length - 1] : undefined
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._frontIdx >= this.deque.length
  }

  clear(): void {
    this.deque = []
    this._frontIdx = 0
  }

  toArray(): T[] {
    return this.deque.slice(this._frontIdx)
  }

  clone(): MonotonicQueue<T> {
    const q = new MonotonicQueue<T>({
      comparator: this.compare,
      direction: this.dir,
    })
    q.deque = this.deque.slice(this._frontIdx)
    q._frontIdx = 0
    return q
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = this._frontIdx; i < this.deque.length; i++) {
      yield this.deque[i]!
    }
  }

  static slidingWindowMax<T>(arr: T[], k: number): T[] {
    const q = new MonotonicQueue<T>({ direction: 'decreasing' })
    const result: T[] = []
    for (let i = 0; i < arr.length; i++) {
      q.push(arr[i]!)
      if (i >= k - 1) {
        const front = q.front()
        if (front !== undefined) result.push(front)
        q.popIfFront(arr[i - k + 1]!)
      }
    }
    return result
  }

  static slidingWindowMin<T>(arr: T[], k: number): T[] {
    const q = new MonotonicQueue<T>({ direction: 'increasing' })
    const result: T[] = []
    for (let i = 0; i < arr.length; i++) {
      q.push(arr[i]!)
      if (i >= k - 1) {
        const front = q.front()
        if (front !== undefined) result.push(front)
        q.popIfFront(arr[i - k + 1]!)
      }
    }
    return result
  }
}

export { defaultComparator } from './types.js'
export type { MonotonicQueueOptions } from './types.js'
