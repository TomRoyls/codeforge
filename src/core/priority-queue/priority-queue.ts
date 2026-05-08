import type { PriorityItem, QueueOptions, QueueStats } from './types.js'
import { DEFAULT_QUEUE_OPTIONS } from './types.js'

export class PriorityQueue<T = unknown> {
  private heap: PriorityItem<T>[] = []
  private options: QueueOptions
  private _peekCount: number = 0
  private _dequeueCount: number = 0
  private _enqueueCount: number = 0
  private _insertionCounter: number = 0

  constructor(options?: Partial<QueueOptions>) {
    this.options = { ...DEFAULT_QUEUE_OPTIONS, ...options }
  }

  enqueue(value: T, priority: number): boolean {
    if (this.heap.length >= this.options.maxSize) {
      return false
    }
    this._insertionCounter++
    const item: PriorityItem<T> = { value, priority, insertedAt: this._insertionCounter }
    this.heap.push(item)
    this.bubbleUp(this.heap.length - 1)
    this._enqueueCount++
    return true
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    const top = this.getAt(0)
    const last = this.heap.pop()
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last
      this.sinkDown(0)
    }
    this._dequeueCount++
    return top.value
  }

  peek(): T | undefined {
    this._peekCount++
    if (this.heap.length === 0) {
      return undefined
    }
    return this.getAt(0).value
  }

  peekPriority(): number | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    return this.getAt(0).priority
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  isFull(): boolean {
    return this.heap.length >= this.options.maxSize
  }

  clear(): void {
    this.heap = []
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      const item = this.getAt(i)
      if (item.value === value) {
        return true
      }
    }
    return false
  }

  toArray(): PriorityItem<T>[] {
    const result: PriorityItem<T>[] = []
    const copy: PriorityItem<T>[] = [...this.heap]
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

  updatePriority(value: T, newPriority: number): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      const item = this.getAt(i)
      if (item.value === value) {
        const oldPriority = item.priority
        item.priority = newPriority
        if (this.shouldComeBefore(newPriority, oldPriority)) {
          this.bubbleUp(i)
        } else {
          this.sinkDown(i)
        }
        return true
      }
    }
    return false
  }

  remove(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      const item = this.getAt(i)
      if (item.value === value) {
        this.removeAtIndex(i)
        return true
      }
    }
    return false
  }

  getStats(): QueueStats {
    return {
      size: this.heap.length,
      maxSize: this.options.maxSize,
      peekCount: this._peekCount,
      dequeueCount: this._dequeueCount,
      enqueueCount: this._enqueueCount,
    }
  }

  drain(): T[] {
    const result: T[] = []
    while (this.heap.length > 0) {
      const val = this.dequeue()
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  merge(other: PriorityQueue<T>): PriorityQueue<T> {
    const newMaxSize = this.options.maxSize === Infinity && other.options.maxSize === Infinity
      ? Infinity
      : this.options.maxSize === Infinity
        ? other.options.maxSize
        : other.options.maxSize === Infinity
          ? this.options.maxSize
          : Math.max(this.options.maxSize, other.options.maxSize)
    const merged = new PriorityQueue<T>({
      order: this.options.order,
      maxSize: newMaxSize,
    })
    for (let i = 0; i < this.heap.length; i++) {
      const item = this.getAt(i)
      merged.enqueue(item.value, item.priority)
    }
    for (let i = 0; i < other.heap.length; i++) {
      const item = other.getAt(i)
      merged.enqueue(item.value, item.priority)
    }
    return merged
  }

  private getAt(index: number): PriorityItem<T> {
    return this.heap[index]!
  }

  private shouldComeBefore(a: number, b: number): boolean {
    if (this.options.order === 'min') {
      return a < b
    }
    return a > b
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      const current = this.getAt(index)
      const parent = this.getAt(parentIndex)
      if (this.shouldComeBefore(current.priority, parent.priority)) {
        this.swap(index, parentIndex)
        index = parentIndex
      } else if (
        current.priority === parent.priority &&
        current.insertedAt < parent.insertedAt
      ) {
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
        const leftChild = this.getAt(leftChildIndex)
        const target = this.getAt(targetIndex)
        if (this.shouldComeBefore(leftChild.priority, target.priority)) {
          targetIndex = leftChildIndex
        } else if (
          leftChild.priority === target.priority &&
          leftChild.insertedAt < target.insertedAt
        ) {
          targetIndex = leftChildIndex
        }
      }

      if (rightChildIndex < length) {
        const rightChild = this.getAt(rightChildIndex)
        const target = this.getAt(targetIndex)
        if (this.shouldComeBefore(rightChild.priority, target.priority)) {
          targetIndex = rightChildIndex
        } else if (
          rightChild.priority === target.priority &&
          rightChild.insertedAt < target.insertedAt
        ) {
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

  private sinkDownCopy(heap: PriorityItem<T>[], index: number): void {
    const length = heap.length
    while (true) {
      let targetIndex = index
      const leftChildIndex = 2 * index + 1
      const rightChildIndex = 2 * index + 2

      if (leftChildIndex < length) {
        const leftChild = heap[leftChildIndex]!
        const target = heap[targetIndex]!
        if (this.shouldComeBefore(leftChild.priority, target.priority)) {
          targetIndex = leftChildIndex
        } else if (
          leftChild.priority === target.priority &&
          leftChild.insertedAt < target.insertedAt
        ) {
          targetIndex = leftChildIndex
        }
      }

      if (rightChildIndex < length) {
        const rightChild = heap[rightChildIndex]!
        const target = heap[targetIndex]!
        if (this.shouldComeBefore(rightChild.priority, target.priority)) {
          targetIndex = rightChildIndex
        } else if (
          rightChild.priority === target.priority &&
          rightChild.insertedAt < target.insertedAt
        ) {
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
      const current = this.getAt(index)
      const parent = this.getAt(parentIndex)
      if (index > 0 && this.shouldComeBefore(current.priority, parent.priority)) {
        this.bubbleUp(index)
      } else {
        this.sinkDown(index)
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.getAt(i)
    this.heap[i] = this.getAt(j)
    this.heap[j] = temp
  }
}

export { DEFAULT_QUEUE_OPTIONS } from './types.js'
export type { PriorityItem, QueueOptions, QueueStats } from './types.js'
