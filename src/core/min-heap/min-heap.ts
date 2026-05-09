import type { CompareFunction } from './types.js'
import { DEFAULT_COMPARE } from './types.js'

export class MinHeap<T = number> {
  private heap: T[] = []
  private compare: CompareFunction<T>

  constructor(compare?: CompareFunction<T>) {
    this.compare = (compare ?? DEFAULT_COMPARE) as CompareFunction<T>
  }

  insert(value: T): void {
    this.heap.push(value)
    this.bubbleUp(this.heap.length - 1)
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    if (this.heap.length === 1) {
      return this.heap.pop()!
    }
    const min = this.heap[0]!
    this.heap[0] = this.heap.pop()!
    this.sinkDown(0)
    return min
  }

  peek(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    return this.heap[0]!
  }

  delete(value: T): boolean {
    const index = this.heap.indexOf(value)
    if (index === -1) {
      return false
    }
    const lastIndex = this.heap.length - 1
    if (index === lastIndex) {
      this.heap.pop()!
      return true
    }
    this.heap[index] = this.heap.pop()!
    const parentIndex = this.parent(index)
    if (parentIndex >= 0 && this.compare(this.heap[index]!, this.heap[parentIndex]!) < 0) {
      this.bubbleUp(index)
    } else {
      this.sinkDown(index)
    }
    return true
  }

  replace(value: T): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    const oldMin = this.heap[0]!
    this.heap[0] = value
    this.sinkDown(0)
    return oldMin
  }

  merge(other: MinHeap<T>): void {
    for (let i = 0; i < other.heap.length; i++) {
      this.insert(other.heap[i]!)
    }
    other.clear()
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
    const result: T[] = []
    const copy = this.heap.slice()
    while (copy.length > 0) {
      result.push(copy[0]!)
      if (copy.length === 1) {
        break
      }
      copy[0] = copy.pop()!
      let i = 0
      while (true) {
        let smallest = i
        const left = 2 * i + 1
        const right = 2 * i + 2
        if (left < copy.length && this.compare(copy[left]!, copy[smallest]!) < 0) {
          smallest = left
        }
        if (right < copy.length && this.compare(copy[right]!, copy[smallest]!) < 0) {
          smallest = right
        }
        if (smallest === i) {
          break
        }
        const temp = copy[i]!
        copy[i] = copy[smallest]!
        copy[smallest] = temp
        i = smallest
      }
    }
    return result
  }

  contains(value: T): boolean {
    return this.heap.includes(value)
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.heap.length; i++) {
      callback(this.heap[i]!, i)
    }
  }

  clone(): MinHeap<T> {
    const cloned = new MinHeap<T>(this.compare)
    cloned.heap = this.heap.slice()
    return cloned
  }

  [Symbol.iterator](): Iterator<T> {
    const sorted = this.toArray()
    let index = 0
    return {
      next: () => {
        if (index >= sorted.length) {
          return { value: undefined, done: true } as IteratorResult<T>
        }
        return { value: sorted[index++]!, done: false }
      },
    }
  }

  static fromArray<T>(arr: T[], compare?: CompareFunction<T>): MinHeap<T> {
    const heap = new MinHeap<T>(compare)
    for (let i = 0; i < arr.length; i++) {
      heap.insert(arr[i]!)
    }
    return heap
  }

  static heapify<T>(arr: T[], compare?: CompareFunction<T>): T[] {
    const cmp: CompareFunction<T> = (compare ?? DEFAULT_COMPARE) as CompareFunction<T>
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      MinHeap.siftDown(arr, i, cmp)
    }
    for (let i = arr.length - 1; i > 0; i--) {
      const temp = arr[0]!
      arr[0] = arr[i]!
      arr[i] = temp
      MinHeap.siftDown(arr, 0, cmp, i)
    }
    return arr.reverse()
  }

  private static siftDown<T>(arr: T[], i: number, compare: CompareFunction<T>, endIndex?: number): void {
    const end = endIndex ?? arr.length
    while (true) {
      let smallest = i
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < end && compare(arr[left]!, arr[smallest]!) < 0) {
        smallest = left
      }
      if (right < end && compare(arr[right]!, arr[smallest]!) < 0) {
        smallest = right
      }
      if (smallest === i) {
        break
      }
      const temp = arr[i]!
      arr[i] = arr[smallest]!
      arr[smallest] = temp
      i = smallest
    }
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = this.parent(index)
      if (this.compare(this.heap[index]!, this.heap[parentIndex]!) >= 0) {
        break
      }
      const temp = this.heap[index]!
      this.heap[index] = this.heap[parentIndex]!
      this.heap[parentIndex] = temp
      index = parentIndex
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length
    while (true) {
      let smallest = index
      const left = this.leftChild(index)
      const right = this.rightChild(index)
      if (left < length && this.compare(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left
      }
      if (right < length && this.compare(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right
      }
      if (smallest === index) {
        break
      }
      const temp = this.heap[index]!
      this.heap[index] = this.heap[smallest]!
      this.heap[smallest] = temp
      index = smallest
    }
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2)
  }

  private leftChild(index: number): number {
    return 2 * index + 1
  }

  private rightChild(index: number): number {
    return 2 * index + 2
  }
}

export { DEFAULT_COMPARE } from './types.js'
export type { CompareFunction } from './types.js'
