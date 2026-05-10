import type { HashedHeapOptions, HeapEntry } from './types.js'

const defaultComparator = (a: number, b: number): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class HashedHeap<K extends string | number, T> {
  private heap: HeapEntry<K, T>[] = []
  private indexMap: Map<K, number> = new Map()
  private comparator: (a: number, b: number) => number

  constructor(options?: HashedHeapOptions) {
    this.comparator = options?.comparator ?? defaultComparator
  }

  insert(key: K, value: T, priority: number): void {
    if (this.indexMap.has(key)) {
      throw new Error(`Duplicate key: ${String(key)}`)
    }
    const entry: HeapEntry<K, T> = { key, value, priority }
    const index = this.heap.length
    this.heap.push(entry)
    this.indexMap.set(key, index)
    this.bubbleUp(index)
  }

  extractMin(): HeapEntry<K, T> | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    const top = this.heap[0]!
    this.removeAtIndex(0)
    return top
  }

  peek(): HeapEntry<K, T> | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    return this.heap[0]
  }

  get size(): number {
    return this.heap.length
  }

  get isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
    this.indexMap.clear()
  }

  get(key: K): T | undefined {
    const index = this.indexMap.get(key)
    if (index === undefined) {
      return undefined
    }
    return this.heap[index]!.value
  }

  getPriority(key: K): number | undefined {
    const index = this.indexMap.get(key)
    if (index === undefined) {
      return undefined
    }
    return this.heap[index]!.priority
  }

  has(key: K): boolean {
    return this.indexMap.has(key)
  }

  update(key: K, priority: number): boolean {
    const index = this.indexMap.get(key)
    if (index === undefined) {
      return false
    }
    const entry = this.heap[index]!
    const oldPriority = entry.priority
    entry.priority = priority
    const cmp = this.comparator(priority, oldPriority)
    if (cmp < 0) {
      this.bubbleUp(index)
    } else if (cmp > 0) {
      this.sinkDown(index)
    }
    return true
  }

  updateValue(key: K, value: T): boolean {
    const index = this.indexMap.get(key)
    if (index === undefined) {
      return false
    }
    this.heap[index]!.value = value
    return true
  }

  delete(key: K): boolean {
    const index = this.indexMap.get(key)
    if (index === undefined) {
      return false
    }
    this.removeAtIndex(index)
    return true
  }

  decreaseKey(key: K, newPriority: number): boolean {
    const index = this.indexMap.get(key)
    if (index === undefined) {
      return false
    }
    const entry = this.heap[index]!
    if (this.comparator(newPriority, entry.priority) >= 0) {
      return false
    }
    entry.priority = newPriority
    this.bubbleUp(index)
    return true
  }

  increaseKey(key: K, newPriority: number): boolean {
    const index = this.indexMap.get(key)
    if (index === undefined) {
      return false
    }
    const entry = this.heap[index]!
    if (this.comparator(newPriority, entry.priority) <= 0) {
      return false
    }
    entry.priority = newPriority
    this.sinkDown(index)
    return true
  }

  toArray(): HeapEntry<K, T>[] {
    return this.heap.map((entry) => ({ ...entry }))
  }

  keys(): K[] {
    return this.heap.map((entry) => entry.key)
  }

  values(): T[] {
    return this.heap.map((entry) => entry.value)
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      if (
        this.comparator(
          this.heap[index]!.priority,
          this.heap[parentIndex]!.priority,
        ) < 0
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
        if (
          this.comparator(
            this.heap[leftChildIndex]!.priority,
            this.heap[targetIndex]!.priority,
          ) < 0
        ) {
          targetIndex = leftChildIndex
        }
      }

      if (rightChildIndex < length) {
        if (
          this.comparator(
            this.heap[rightChildIndex]!.priority,
            this.heap[targetIndex]!.priority,
          ) < 0
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

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
    this.indexMap.set(this.heap[i]!.key, i)
    this.indexMap.set(this.heap[j]!.key, j)
  }

  private removeAtIndex(index: number): void {
    const key = this.heap[index]!.key
    const lastIndex = this.heap.length - 1
    if (index === lastIndex) {
      this.heap.pop()
      this.indexMap.delete(key)
      return
    }
    this.swap(index, lastIndex)
    this.heap.pop()
    this.indexMap.delete(key)
    if (index < this.heap.length) {
      const parentIndex = Math.floor((index - 1) / 2)
      if (
        index > 0 &&
        this.comparator(
          this.heap[index]!.priority,
          this.heap[parentIndex]!.priority,
        ) < 0
      ) {
        this.bubbleUp(index)
      } else {
        this.sinkDown(index)
      }
    }
  }
}

export type { HashedHeapOptions, HeapEntry }
