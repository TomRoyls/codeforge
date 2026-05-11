import type { BoundedPriorityQueueOptions, Comparator } from './types.js'

const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class BoundedPriorityQueue<T> {
  private _heap: T[]
  private readonly _capacity: number
  private readonly _comparator: Comparator<T>

  constructor(capacity: number, options?: BoundedPriorityQueueOptions<T>) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error('capacity must be a positive integer')
    }
    this._capacity = capacity
    this._comparator = options?.comparator ?? defaultComparator
    this._heap = []
  }

  private _parent(i: number): number {
    return (i - 1) >> 1
  }

  private _leftChild(i: number): number {
    return (i << 1) + 1
  }

  private _rightChild(i: number): number {
    return (i << 1) + 2
  }

  private _swap(i: number, j: number): void {
    const tmp = this._heap[i]!
    this._heap[i] = this._heap[j]!
    this._heap[j] = tmp
  }

  private _bubbleUp(i: number): void {
    while (i > 0) {
      const p = this._parent(i)
      if (this._comparator(this._heap[i]!, this._heap[p]!) < 0) {
        this._swap(i, p)
        i = p
      } else {
        break
      }
    }
  }

  private _sinkDown(i: number): void {
    const n = this._heap.length
    while (true) {
      let smallest = i
      const left = this._leftChild(i)
      const right = this._rightChild(i)
      if (left < n && this._comparator(this._heap[left]!, this._heap[smallest]!) < 0) {
        smallest = left
      }
      if (right < n && this._comparator(this._heap[right]!, this._heap[smallest]!) < 0) {
        smallest = right
      }
      if (smallest === i) break
      this._swap(i, smallest)
      i = smallest
    }
  }

  enqueue(value: T): T | undefined {
    return this.push(value)
  }

  push(value: T): T | undefined {
    if (this._heap.length < this._capacity) {
      this._heap.push(value)
      this._bubbleUp(this._heap.length - 1)
      return undefined
    }
    if (this._comparator(value, this._heap[0]!) <= 0) {
      return value
    }
    const evicted = this._heap[0]!
    this._heap[0] = value
    this._sinkDown(0)
    return evicted
  }

  dequeue(): T {
    return this.pop()
  }

  pop(): T {
    if (this._heap.length === 0) {
      throw new Error('pop called on empty queue')
    }
    const result = this._heap[0]!
    const last = this._heap.pop()!
    if (this._heap.length > 0) {
      this._heap[0] = last
      this._sinkDown(0)
    }
    return result
  }

  peek(): T {
    if (this._heap.length === 0) {
      throw new Error('peek called on empty queue')
    }
    return this._heap[0]!
  }

  get size(): number {
    return this._heap.length
  }

  get isEmpty(): boolean {
    return this._heap.length === 0
  }

  get isFull(): boolean {
    return this._heap.length === this._capacity
  }

  get capacity(): number {
    return this._capacity
  }

  clear(): void {
    this._heap = []
  }

  toArray(): T[] {
    const sorted = [...this._heap]
    sorted.sort(this._comparator)
    return sorted
  }

  contains(value: T): boolean {
    for (let i = 0; i < this._heap.length; i++) {
      if (this._comparator(this._heap[i]!, value) === 0) return true
    }
    return false
  }

  merge(other: BoundedPriorityQueue<T>): void {
    if (other === this) return
    const source = other.toArray()
    for (const item of source) {
      this.push(item)
    }
    other.clear()
  }

  *[Symbol.iterator](): Iterator<T> {
    const sorted = this.toArray()
    for (const item of sorted) {
      yield item
    }
  }
}

export type { BoundedPriorityQueueOptions, Comparator } from './types.js'
