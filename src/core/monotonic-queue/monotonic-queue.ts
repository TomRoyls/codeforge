import type { MonotonicQueueOptions } from './types.js'
import { defaultComparator } from './types.js'

export class MonotonicQueue<T> {
  private deque: T[] = []
  private compare: (a: T, b: T) => number
  private dir: 'increasing' | 'decreasing'

  constructor(options?: MonotonicQueueOptions<T>) {
    this.compare = options?.comparator ?? (defaultComparator as (a: T, b: T) => number)
    this.dir = options?.direction ?? 'decreasing'
  }

  push(value: T): void {
    if (this.dir === 'decreasing') {
      while (
        this.deque.length > 0 &&
        this.compare(this.deque[this.deque.length - 1]!, value) < 0
      ) {
        this.deque.pop()
      }
    } else {
      while (
        this.deque.length > 0 &&
        this.compare(this.deque[this.deque.length - 1]!, value) > 0
      ) {
        this.deque.pop()
      }
    }
    this.deque.push(value)
  }

  pop(): T | undefined {
    return this.deque.shift()
  }

  popIfFront(value: T): boolean {
    if (this.deque.length > 0 && this.compare(this.deque[0]!, value) === 0) {
      this.deque.shift()
      return true
    }
    return false
  }

  front(): T | undefined {
    return this.deque[0]
  }

  back(): T | undefined {
    return this.deque[this.deque.length - 1]
  }

  size(): number {
    return this.deque.length
  }

  isEmpty(): boolean {
    return this.deque.length === 0
  }

  clear(): void {
    this.deque = []
  }

  toArray(): T[] {
    return [...this.deque]
  }

  clone(): MonotonicQueue<T> {
    const q = new MonotonicQueue<T>({
      comparator: this.compare,
      direction: this.dir,
    })
    q.deque = [...this.deque]
    return q
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const item of this.deque) {
      yield item
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
