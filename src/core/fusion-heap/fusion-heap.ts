import type { FusionHeapOptions, FusionHeapStatistics } from './types.js'
import { DEFAULT_FUSION_HEAP_OPTIONS } from './types.js'

export class FusionHeap<T = unknown> {
  private heap: T[] = []
  private buffer: T[] = []
  private compare: (a: T, b: T) => number
  private _size: number = 0
  private consolidationThreshold: number = 32
  private stats: FusionHeapStatistics = {
    inserts: 0,
    extracts: 0,
    decreaseKeys: 0,
    deletes: 0,
    merges: 0,
    consolidations: 0,
    maxSize: 0,
  }

  constructor(options?: Partial<FusionHeapOptions<T>>) {
    const merged = { ...DEFAULT_FUSION_HEAP_OPTIONS, ...options }
    this.compare = merged.comparator as (a: T, b: T) => number
  }

  insert(value: T): void {
    this.buffer.push(value)
    this._size++
    this.stats.inserts++
    if (this._size > this.stats.maxSize) {
      this.stats.maxSize = this._size
    }
  }

  extractMin(): T | undefined {
    if (this._size === 0) return undefined

    if (this.buffer.length >= this.consolidationThreshold) {
      this.consolidate()
    }

    if (this.heap.length === 0) {
      if (this.buffer.length === 0) return undefined
      let minIdx = 0
      for (let i = 1; i < this.buffer.length; i++) {
        if (this.compare(this.buffer[i]!, this.buffer[minIdx]!) < 0) minIdx = i
      }
      const result = this.buffer[minIdx]!
      this.buffer.splice(minIdx, 1)
      this._size--
      this.stats.extracts++
      return result
    }

    if (this.buffer.length > 0) {
      let bufferMinIdx = 0
      for (let i = 1; i < this.buffer.length; i++) {
        if (this.compare(this.buffer[i]!, this.buffer[bufferMinIdx]!) < 0) bufferMinIdx = i
      }

      if (this.compare(this.buffer[bufferMinIdx]!, this.heap[0]!) < 0) {
        const result = this.buffer[bufferMinIdx]!
        this.buffer.splice(bufferMinIdx, 1)
        this._size--
        this.stats.extracts++
        return result
      }
    }

    const result = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.siftDown(0)
    }
    this._size--
    this.stats.extracts++
    return result
  }

  findMin(): T | undefined {
    if (this._size === 0) return undefined
    let min: T | undefined = this.heap.length > 0 ? this.heap[0] : undefined
    for (let i = 0; i < this.buffer.length; i++) {
      if (min === undefined || this.compare(this.buffer[i]!, min) < 0) {
        min = this.buffer[i]!
      }
    }
    return min
  }

  delete(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, value) === 0) {
        this.removeAt(i)
        this._size--
        this.stats.deletes++
        return true
      }
    }
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.compare(this.buffer[i]!, value) === 0) {
        this.buffer.splice(i, 1)
        this._size--
        this.stats.deletes++
        return true
      }
    }
    return false
  }

  decreaseKey(oldValue: T, newValue: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, oldValue) === 0) {
        this.heap[i] = newValue
        this.siftUp(i)
        this.stats.decreaseKeys++
        return true
      }
    }
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.compare(this.buffer[i]!, oldValue) === 0) {
        this.buffer[i] = newValue
        this.stats.decreaseKeys++
        return true
      }
    }
    return false
  }

  merge(other: FusionHeap<T>): void {
    const otherAll = other.toArray()
    for (let i = 0; i < otherAll.length; i++) {
      this.buffer.push(otherAll[i]!)
      this.stats.inserts++
    }
    this._size += other.size
    this.stats.merges++
    if (this._size > this.stats.maxSize) {
      this.stats.maxSize = this._size
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.heap = []
    this.buffer = []
    this._size = 0
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, value) === 0) return true
    }
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.compare(this.buffer[i]!, value) === 0) return true
    }
    return false
  }

  toArray(): T[] {
    return [...this.heap, ...this.buffer]
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (let i = 0; i < this.heap.length; i++) {
      callback(this.heap[i]!, idx++)
    }
    for (let i = 0; i < this.buffer.length; i++) {
      callback(this.buffer[i]!, idx++)
    }
  }

  [Symbol.iterator](): Iterator<T> {
    const all = this.toArray()
    let index = 0
    return {
      next(): IteratorResult<T> {
        if (index < all.length) {
          return { value: all[index++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  values(): T[] {
    const all = [...this.heap, ...this.buffer]
    all.sort(this.compare)
    return all
  }

  getStatistics(): FusionHeapStatistics {
    return { ...this.stats }
  }

  toJSON(): { heap: T[]; buffer: T[]; size: number } {
    return {
      heap: [...this.heap],
      buffer: [...this.buffer],
      size: this._size,
    }
  }

  static fromJSON<T>(
    data: { heap: T[]; buffer: T[]; size: number },
    options?: Partial<FusionHeapOptions<T>>,
  ): FusionHeap<T> {
    const fh = new FusionHeap<T>(options)
    fh.heap = [...data.heap]
    fh.buffer = [...data.buffer]
    fh._size = data.size
    for (let i = Math.floor(fh.heap.length / 2) - 1; i >= 0; i--) {
      fh.siftDown(i)
    }
    if (fh._size > fh.stats.maxSize) {
      fh.stats.maxSize = fh._size
    }
    return fh
  }

  private consolidate(): void {
    if (this.buffer.length === 0) return
    this.heap.push(...this.buffer)
    this.buffer.length = 0
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.siftDown(i)
    }
    this.stats.consolidations++
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.compare(this.heap[index]!, this.heap[parent]!) < 0) {
        const temp = this.heap[index]!
        this.heap[index] = this.heap[parent]!
        this.heap[parent] = temp
        index = parent
      } else {
        break
      }
    }
  }

  private siftDown(index: number): void {
    const length = this.heap.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < length && this.compare(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left
      }
      if (right < length && this.compare(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right
      }
      if (smallest !== index) {
        const temp = this.heap[index]!
        this.heap[index] = this.heap[smallest]!
        this.heap[smallest] = temp
        index = smallest
      } else {
        break
      }
    }
  }

  private removeAt(index: number): void {
    const last = this.heap.pop()!
    if (index >= this.heap.length || this.heap.length === 0) return
    this.heap[index] = last
    const parentIdx = Math.floor((index - 1) / 2)
    if (index > 0 && this.compare(this.heap[index]!, this.heap[parentIdx]!) < 0) {
      this.siftUp(index)
    } else {
      this.siftDown(index)
    }
  }
}

export { DEFAULT_FUSION_HEAP_OPTIONS } from './types.js'
export type { FusionHeapOptions, FusionHeapStatistics } from './types.js'
