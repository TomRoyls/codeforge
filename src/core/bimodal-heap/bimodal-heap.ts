import type { BimodalHeapOptions, HeapEntry } from './types.js'
import { defaultComparator } from './types.js'


export class BimodalHeap<T = number> {
  private minHeap: HeapEntry<T>[] = []
  private maxHeap: HeapEntry<T>[] = []
  private deleted: Set<number> = new Set()
  private nextId = 0
  private count = 0
  private compare: (a: T, b: T) => number
  private static readonly CLEANUP_THRESHOLD = 32

  constructor(options?: BimodalHeapOptions<T>) {
    this.compare = options?.comparator ?? defaultComparator
  }

  insert(value: T): void {
    const id = this.nextId++
    const entry: HeapEntry<T> = { id, value }
    this.minHeap.push(entry)
    this.bubbleUpMin(this.minHeap.length - 1)
    this.maxHeap.push({ id, value })
    this.bubbleUpMax(this.maxHeap.length - 1)
    this.count++
  }

  findMin(): T | undefined {
    this.cleanTopMin()
    if (this.minHeap.length === 0) return undefined
    return this.minHeap[0]!.value
  }

  findMax(): T | undefined {
    this.cleanTopMax()
    if (this.maxHeap.length === 0) return undefined
    return this.maxHeap[0]!.value
  }

  deleteMin(): T | undefined {
    this.cleanTopMin()
    if (this.minHeap.length === 0) return undefined
    const entry = this.minHeap[0]!
    this.deleted.add(entry.id)
    this.removeMinRoot()
    this.count--
    this.maybeCleanup()
    return entry.value
  }

  deleteMax(): T | undefined {
    this.cleanTopMax()
    if (this.maxHeap.length === 0) return undefined
    const entry = this.maxHeap[0]!
    this.deleted.add(entry.id)
    this.removeMaxRoot()
    this.count--
    this.maybeCleanup()
    return entry.value
  }

  size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.minHeap = []
    this.maxHeap = []
    this.deleted.clear()
    this.count = 0
    this.nextId = 0
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.minHeap.length; i++) {
      if (!this.deleted.has(this.minHeap[i]!.id) && this.compare(this.minHeap[i]!.value, value) === 0) {
        return true
      }
    }
    return false
  }

  delete(value: T): boolean {
    for (let i = 0; i < this.minHeap.length; i++) {
      if (!this.deleted.has(this.minHeap[i]!.id) && this.compare(this.minHeap[i]!.value, value) === 0) {
        this.deleted.add(this.minHeap[i]!.id)
        this.count--
        this.maybeCleanup()
        return true
      }
    }
    return false
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.minHeap.length; i++) {
      if (!this.deleted.has(this.minHeap[i]!.id)) {
        result.push(this.minHeap[i]!.value)
      }
    }
    return result
  }

  fromArray(items: T[]): void {
    this.clear()
    for (const item of items) {
      this.insert(item)
    }
  }

  merge(other: BimodalHeap<T>): void {
    const items = other.toArray()
    for (const item of items) {
      this.insert(item)
    }
  }

  replaceMin(value: T): T {
    this.cleanTopMin()
    if (this.minHeap.length === 0) {
      this.insert(value)
      throw new Error('Heap was empty; inserted value')
    }
    const oldEntry = this.minHeap[0]!
    const oldValue = oldEntry.value
    this.deleted.add(oldEntry.id)
    this.removeMinRoot()
    this.count--
    this.insert(value)
    return oldValue
  }

  replaceMax(value: T): T {
    this.cleanTopMax()
    if (this.maxHeap.length === 0) {
      this.insert(value)
      throw new Error('Heap was empty; inserted value')
    }
    const oldEntry = this.maxHeap[0]!
    const oldValue = oldEntry.value
    this.deleted.add(oldEntry.id)
    this.removeMaxRoot()
    this.count--
    this.insert(value)
    return oldValue
  }

  private cleanTopMin(): void {
    while (this.minHeap.length > 0 && this.deleted.has(this.minHeap[0]!.id)) {
      this.removeMinRoot()
    }
  }

  private cleanTopMax(): void {
    while (this.maxHeap.length > 0 && this.deleted.has(this.maxHeap[0]!.id)) {
      this.removeMaxRoot()
    }
  }

  private removeMinRoot(): void {
    const last = this.minHeap.pop()
    if (this.minHeap.length > 0 && last !== undefined) {
      this.minHeap[0] = last
      this.sinkDownMin(0)
    }
  }

  private removeMaxRoot(): void {
    const last = this.maxHeap.pop()
    if (this.maxHeap.length > 0 && last !== undefined) {
      this.maxHeap[0] = last
      this.sinkDownMax(0)
    }
  }

  private maybeCleanup(): void {
    if (this.deleted.size >= BimodalHeap.CLEANUP_THRESHOLD && this.deleted.size > this.count) {
      this.fullCleanup()
    }
  }

  private fullCleanup(): void {
    const newMinHeap: HeapEntry<T>[] = []
    for (let i = 0; i < this.minHeap.length; i++) {
      if (!this.deleted.has(this.minHeap[i]!.id)) {
        newMinHeap.push(this.minHeap[i]!)
      }
    }
    const newMaxHeap: HeapEntry<T>[] = []
    for (let i = 0; i < this.maxHeap.length; i++) {
      if (!this.deleted.has(this.maxHeap[i]!.id)) {
        newMaxHeap.push(this.maxHeap[i]!)
      }
    }
    this.minHeap = newMinHeap
    this.maxHeap = newMaxHeap
    this.deleted.clear()
    this.buildMinHeap()
    this.buildMaxHeap()
  }

  private buildMinHeap(): void {
    for (let i = Math.floor(this.minHeap.length / 2) - 1; i >= 0; i--) {
      this.sinkDownMin(i)
    }
  }

  private buildMaxHeap(): void {
    for (let i = Math.floor(this.maxHeap.length / 2) - 1; i >= 0; i--) {
      this.sinkDownMax(i)
    }
  }

  private bubbleUpMin(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.compare(this.minHeap[index]!.value, this.minHeap[parent]!.value) < 0) {
        this.swapMin(index, parent)
        index = parent
      } else {
        break
      }
    }
  }

  private bubbleUpMax(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.compare(this.maxHeap[index]!.value, this.maxHeap[parent]!.value) > 0) {
        this.swapMax(index, parent)
        index = parent
      } else {
        break
      }
    }
  }

  private sinkDownMin(index: number): void {
    const length = this.minHeap.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < length && this.compare(this.minHeap[left]!.value, this.minHeap[smallest]!.value) < 0) {
        smallest = left
      }
      if (right < length && this.compare(this.minHeap[right]!.value, this.minHeap[smallest]!.value) < 0) {
        smallest = right
      }
      if (smallest !== index) {
        this.swapMin(index, smallest)
        index = smallest
      } else {
        break
      }
    }
  }

  private sinkDownMax(index: number): void {
    const length = this.maxHeap.length
    while (true) {
      let largest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < length && this.compare(this.maxHeap[left]!.value, this.maxHeap[largest]!.value) > 0) {
        largest = left
      }
      if (right < length && this.compare(this.maxHeap[right]!.value, this.maxHeap[largest]!.value) > 0) {
        largest = right
      }
      if (largest !== index) {
        this.swapMax(index, largest)
        index = largest
      } else {
        break
      }
    }
  }

  private swapMin(i: number, j: number): void {
    const temp = this.minHeap[i]!
    this.minHeap[i] = this.minHeap[j]!
    this.minHeap[j] = temp
  }

  private swapMax(i: number, j: number): void {
    const temp = this.maxHeap[i]!
    this.maxHeap[i] = this.maxHeap[j]!
    this.maxHeap[j] = temp
  }
}

export { defaultComparator } from './types.js'
export type { BimodalHeapOptions, HeapEntry } from './types.js'
