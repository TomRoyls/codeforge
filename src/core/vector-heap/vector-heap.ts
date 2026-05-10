import type { VectorHeapOptions, VectorHeapStatistics } from './types.js'
import { DEFAULT_VECTOR_HEAP_OPTIONS } from './types.js'

export class VectorHeap<T = unknown> {
  private heap: T[] = []
  private arity: number
  private compare: (a: T, b: T) => number
  private stats: VectorHeapStatistics = {
    pushes: 0,
    pops: 0,
    heapifies: 0,
    merges: 0,
    updates: 0,
    removes: 0,
    siftUps: 0,
    siftDowns: 0,
  }

  constructor(options?: Partial<VectorHeapOptions<T>>) {
    const merged = { ...DEFAULT_VECTOR_HEAP_OPTIONS, ...options }
    this.arity = merged.arity
    this.compare = merged.comparator as (a: T, b: T) => number
  }

  push(value: T): void {
    this.heap.push(value)
    this.siftUp(this.heap.length - 1)
    this.stats.pushes++
  }

  pop(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    const top = this.heap[0]!
    const last = this.heap.pop()
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last
      this.siftDown(0)
    }
    this.stats.pops++
    return top
  }

  peek(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    return this.heap[0]!
  }

  pushPop(value: T): T {
    if (this.heap.length === 0 || this.compare(value, this.heap[0]!) <= 0) {
      return value
    }
    const top = this.heap[0]!
    this.heap[0] = value
    this.siftDown(0)
    this.stats.pushes++
    this.stats.pops++
    return top
  }

  replace(value: T): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    const top = this.heap[0]!
    this.heap[0] = value
    this.siftDown(0)
    this.stats.pops++
    this.stats.pushes++
    return top
  }

  heapify(items: T[]): void {
    this.heap = [...items]
    const start = Math.floor((this.heap.length - 2) / this.arity)
    for (let i = start; i >= 0; i--) {
      this.siftDown(i)
    }
    this.stats.heapifies++
  }

  merge(other: VectorHeap<T>): void {
    const otherArr = other.toArray()
    for (let i = 0; i < otherArr.length; i++) {
      this.push(otherArr[i]!)
    }
    this.stats.merges++
  }

  get size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
  }

  toArray(): T[] {
    return [...this.heap]
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, value) === 0) {
        return true
      }
    }
    return false
  }

  update(oldValue: T, newValue: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, oldValue) === 0) {
        this.heap[i] = newValue
        const parentIndex = this.parentIndex(i)
        if (i > 0 && this.compare(newValue, this.heap[parentIndex]!) < 0) {
          this.siftUp(i)
        } else {
          this.siftDown(i)
        }
        this.stats.updates++
        return true
      }
    }
    return false
  }

  remove(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, value) === 0) {
        this.removeAtIndex(i)
        this.stats.removes++
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

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const heap = this.heap
    return {
      next(): IteratorResult<T> {
        if (index < heap.length) {
          return { value: heap[index++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  getStatistics(): VectorHeapStatistics {
    return { ...this.stats }
  }

  private parentIndex(index: number): number {
    return Math.floor((index - 1) / this.arity)
  }

  private firstChildIndex(index: number): number {
    return this.arity * index + 1
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = this.parentIndex(index)
      if (this.compare(this.heap[index]!, this.heap[parent]!) < 0) {
        this.swap(index, parent)
        index = parent
      } else {
        break
      }
    }
    this.stats.siftUps++
  }

  private siftDown(index: number): void {
    const length = this.heap.length
    while (true) {
      let smallest = index
      const firstChild = this.firstChildIndex(index)
      for (let c = 0; c < this.arity; c++) {
        const childIndex = firstChild + c
        if (childIndex < length && this.compare(this.heap[childIndex]!, this.heap[smallest]!) < 0) {
          smallest = childIndex
        }
      }
      if (smallest !== index) {
        this.swap(index, smallest)
        index = smallest
      } else {
        break
      }
    }
    this.stats.siftDowns++
  }

  private removeAtIndex(index: number): void {
    const last = this.heap.pop()
    if (index >= this.heap.length || this.heap.length === 0) {
      return
    }
    if (last !== undefined) {
      this.heap[index] = last
      const parentIndex = this.parentIndex(index)
      if (index > 0 && this.compare(this.heap[index]!, this.heap[parentIndex]!) < 0) {
        this.siftUp(index)
      } else {
        this.siftDown(index)
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }
}

export { DEFAULT_VECTOR_HEAP_OPTIONS } from './types.js'
export type { VectorHeapOptions, VectorHeapStatistics } from './types.js'
