import type { AmortizedPriorityQueueOptions } from './types.js'

export class AmortizedPriorityQueue<T> {
  private heap: T[] = []
  private buffer: T[] = []
  private _bufferSize: number
  private compare: (a: T, b: T) => number

  constructor(options?: AmortizedPriorityQueueOptions<T>) {
    this._bufferSize = options?.bufferSize ?? 64
    this.compare = options?.comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  enqueue(item: T): void {
    this.buffer.push(item)
    if (this.buffer.length >= this._bufferSize) {
      this.flush()
    }
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0 && this.buffer.length === 0) return undefined

    if (this.heap.length === 0) {
      this.flush()
    }

    if (this.buffer.length === 0) {
      if (this.heap.length === 1) return this.heap.pop()
      const result = this.heap[0]!
      this.heap[0] = this.heap.pop()!
      this.siftDown(0)
      return result
    }

    let bufferMinIdx = 0
    for (let i = 1; i < this.buffer.length; i++) {
      if (this.compare(this.buffer[i]!, this.buffer[bufferMinIdx]!) < 0) {
        bufferMinIdx = i
      }
    }

    if (this.compare(this.buffer[bufferMinIdx]!, this.heap[0]!) < 0) {
      return this.buffer.splice(bufferMinIdx, 1)[0]
    }

    const result = this.heap[0]!
    if (this.heap.length === 1) {
      this.heap.pop()
    } else {
      this.heap[0] = this.heap.pop()!
      this.siftDown(0)
    }
    return result
  }

  peek(): T | undefined {
    if (this.heap.length === 0 && this.buffer.length === 0) return undefined

    if (this.heap.length === 0) {
      let min = this.buffer[0]!
      for (let i = 1; i < this.buffer.length; i++) {
        if (this.compare(this.buffer[i]!, min) < 0) {
          min = this.buffer[i]!
        }
      }
      return min
    }

    if (this.buffer.length === 0) {
      return this.heap[0]
    }

    const heapTop = this.heap[0]!
    let bufferMin = this.buffer[0]!
    for (let i = 1; i < this.buffer.length; i++) {
      if (this.compare(this.buffer[i]!, bufferMin) < 0) {
        bufferMin = this.buffer[i]!
      }
    }

    return this.compare(bufferMin, heapTop) < 0 ? bufferMin : heapTop
  }

  get size(): number {
    return this.heap.length + this.buffer.length
  }

  get isEmpty(): boolean {
    return this.heap.length === 0 && this.buffer.length === 0
  }

  clear(): void {
    this.heap = []
    this.buffer = []
  }

  toArray(): T[] {
    const merged = [...this.heap, ...this.buffer]
    merged.sort(this.compare)
    return merged
  }

  contains(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === item) return true
    }
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i] === item) return true
    }
    return false
  }

  remove(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === item) {
        this.removeAtHeap(i)
        return true
      }
    }
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i] === item) {
        this.buffer.splice(i, 1)
        return true
      }
    }
    return false
  }

  drain(): T[] {
    const result = this.toArray()
    this.heap = []
    this.buffer = []
    return result
  }

  flush(): void {
    if (this.buffer.length === 0) return

    if (this.heap.length === 0) {
      this.heap = this.buffer
      this.buffer = []
      this.buildHeap()
      return
    }

    const merged = [...this.heap, ...this.buffer]
    merged.sort(this.compare)
    this.heap = merged
    this.buffer = []
  }

  get bufferSize(): number {
    return this.buffer.length
  }

  get heapSize(): number {
    return this.heap.length
  }

  merge(other: AmortizedPriorityQueue<T>): void {
    for (let i = 0; i < other.heap.length; i++) {
      this.enqueue(other.heap[i]!)
    }
    for (let i = 0; i < other.buffer.length; i++) {
      this.enqueue(other.buffer[i]!)
    }
    other.clear()
  }

  private removeAtHeap(index: number): void {
    if (index === this.heap.length - 1) {
      this.heap.pop()
      return
    }

    const last = this.heap.pop()!
    this.heap[index] = last

    const parentIdx = this.parentIndex(index)
    if (index > 0 && this.compare(last, this.heap[parentIdx]!) < 0) {
      this.siftUp(index)
    } else {
      this.siftDown(index)
    }
  }

  private buildHeap(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.siftDown(i)
    }
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

export type { AmortizedPriorityQueueOptions } from './types.js'
