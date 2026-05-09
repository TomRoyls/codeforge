import type { HeapOptions } from './types.js'
import { DEFAULT_HEAP_OPTIONS } from './types.js'

export class BinaryHeap<T = unknown> {
  private heap: T[] = []
  private options: HeapOptions

  constructor(options?: Partial<HeapOptions>) {
    this.options = { ...DEFAULT_HEAP_OPTIONS, ...options }
  }

  insert(value: T): void {
    this.heap.push(value)
    this.bubbleUp(this.heap.length - 1)
  }

  extract(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    const top = this.heap[0]!
    const last = this.heap.pop()
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last
      this.sinkDown(0)
    }
    return top
  }

  peek(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    return this.heap[0]!
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === value) {
        return true
      }
    }
    return false
  }

  toArray(): T[] {
    const result: T[] = []
    const copy: T[] = [...this.heap]
    while (copy.length > 0) {
      result.push(copy[0]!)
      const last = copy.pop()
      if (copy.length > 0 && last !== undefined) {
        copy[0] = last
        this.sinkDownCopy(copy, 0)
      }
    }
    return result
  }

  fromArray(items: T[]): void {
    this.heap = [...items]
    this.heapify()
  }

  merge(other: BinaryHeap<T>): void {
    for (let i = 0; i < other.heap.length; i++) {
      this.insert(other.heap[i]!)
    }
  }

  update(oldValue: T, newValue: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === oldValue) {
        this.heap[i] = newValue
        const parentIndex = Math.floor((i - 1) / 2)
        if (i > 0 && this.shouldComeBefore(newValue, this.heap[parentIndex]!)) {
          this.bubbleUp(i)
        } else {
          this.sinkDown(i)
        }
        return true
      }
    }
    return false
  }

  delete(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === value) {
        this.removeAtIndex(i)
        return true
      }
    }
    return false
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.heap.length; i++) {
      callback(this.heap[i]!, i)
    }
  }

  heapify(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.sinkDown(i)
    }
  }

  private shouldComeBefore(a: T, b: T): boolean {
    if (this.options.comparator === 'min') {
      return a < b
    }
    return a > b
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      const current = this.heap[index]!
      const parent = this.heap[parentIndex]!
      if (this.shouldComeBefore(current, parent)) {
        this.swap(index, parentIndex)
        index = parentIndex
      } else {
        break
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length
    while (true) {
      let targetIndex = index
      const leftChildIndex = 2 * index + 1
      const rightChildIndex = 2 * index + 2

      if (leftChildIndex < length) {
        const leftChild = this.heap[leftChildIndex]!
        const target = this.heap[targetIndex]!
        if (this.shouldComeBefore(leftChild, target)) {
          targetIndex = leftChildIndex
        }
      }

      if (rightChildIndex < length) {
        const rightChild = this.heap[rightChildIndex]!
        const target = this.heap[targetIndex]!
        if (this.shouldComeBefore(rightChild, target)) {
          targetIndex = rightChildIndex
        }
      }

      if (targetIndex !== index) {
        this.swap(index, targetIndex)
        index = targetIndex
      } else {
        break
      }
    }
  }

  private sinkDownCopy(heap: T[], index: number): void {
    const length = heap.length
    while (true) {
      let targetIndex = index
      const leftChildIndex = 2 * index + 1
      const rightChildIndex = 2 * index + 2

      if (leftChildIndex < length) {
        const leftChild = heap[leftChildIndex]!
        const target = heap[targetIndex]!
        if (this.shouldComeBefore(leftChild, target)) {
          targetIndex = leftChildIndex
        }
      }

      if (rightChildIndex < length) {
        const rightChild = heap[rightChildIndex]!
        const target = heap[targetIndex]!
        if (this.shouldComeBefore(rightChild, target)) {
          targetIndex = rightChildIndex
        }
      }

      if (targetIndex !== index) {
        const temp = heap[index]!
        heap[index] = heap[targetIndex]!
        heap[targetIndex] = temp
        index = targetIndex
      } else {
        break
      }
    }
  }

  private removeAtIndex(index: number): void {
    const last = this.heap.pop()
    if (index === this.heap.length || this.heap.length === 0) {
      return
    }
    if (last !== undefined) {
      this.heap[index] = last
      const parentIndex = Math.floor((index - 1) / 2)
      if (index > 0 && this.shouldComeBefore(this.heap[index]!, this.heap[parentIndex]!)) {
        this.bubbleUp(index)
      } else {
        this.sinkDown(index)
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }
}

export { DEFAULT_HEAP_OPTIONS } from './types.js'
export type { HeapComparator, HeapOptions } from './types.js'
