import type { BoundedPriorityQueueOptions } from './types.js'

export class BoundedPriorityQueue<T> {
  private heap: T[] = []
  private _capacity: number
  private compare: (a: T, b: T) => number

  constructor(capacity: number, options?: BoundedPriorityQueueOptions<T>) {
    this._capacity = Math.max(0, capacity)
    this.compare = options?.comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  enqueue(item: T): T | undefined {
    if (this._capacity === 0) return undefined

    if (this.heap.length < this._capacity) {
      this.heap.push(item)
      this.siftUp(this.heap.length - 1)
      return undefined
    }

    if (this.compare(item, this.heap[0]!) > 0) {
      const evicted = this.heap[0]!
      this.heap[0] = item
      this.siftDown(0)
      return evicted
    }

    return undefined
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap.pop()

    const result = this.heap[0]!
    this.heap[0] = this.heap.pop()!
    this.siftDown(0)
    return result
  }

  peek(): T | undefined {
    return this.heap[0]
  }

  get size(): number {
    return this.heap.length
  }

  get capacity(): number {
    return this._capacity
  }

  get isFull(): boolean {
    return this.heap.length >= this._capacity
  }

  get isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
  }

  toArray(): T[] {
    return [...this.heap]
  }

  contains(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === item) return true
    }
    return false
  }

  remove(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === item) {
        return this.removeAt(i)
      }
    }
    return false
  }

  drain(): T[] {
    const result = this.heap
    this.heap = []
    return result
  }

  forEach(callback: (item: T) => void): void {
    for (let i = 0; i < this.heap.length; i++) {
      callback(this.heap[i]!)
    }
  }

  accept(item: T): boolean {
    if (this._capacity === 0) return false
    if (this.heap.length < this._capacity) return true
    return this.compare(item, this.heap[0]!) > 0
  }

  private removeAt(index: number): boolean {
    if (index === this.heap.length - 1) {
      this.heap.pop()
      return true
    }

    const last = this.heap.pop()!
    this.heap[index] = last

    const parentIdx = this.parentIndex(index)
    if (index > 0 && this.compare(last, this.heap[parentIdx]!) < 0) {
      this.siftUp(index)
    } else {
      this.siftDown(index)
    }

    return true
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = this.parentIndex(index)
      if (this.compare(this.heap[index]!, this.heap[parent]!) >= 0) break
      this.swap(index, parent)
      index = parent
    }
  }

  private siftDown(index: number): void {
    const length = this.heap.length
    while (true) {
      let smallest = index
      const left = this.leftIndex(index)
      const right = this.rightIndex(index)

      if (left < length && this.compare(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left
      }
      if (right < length && this.compare(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right
      }

      if (smallest === index) break
      this.swap(index, smallest)
      index = smallest
    }
  }

  private parentIndex(index: number): number {
    return (index - 1) >> 1
  }

  private leftIndex(index: number): number {
    return 2 * index + 1
  }

  private rightIndex(index: number): number {
    return 2 * index + 2
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }
}

export type { BoundedPriorityQueueOptions } from './types.js'
