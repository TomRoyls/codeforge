import type { KWayMergeOptions, HeapEntry } from './types.js'
import { defaultComparator } from './types.js'

export class KWayMerge<T = unknown> {
  private _sources: T[][]
  private _comparator: (a: T, b: T) => number
  private _heap: HeapEntry<T>[] = []
  private _iterators: Iterator<T>[] = []
  private _done = false

  constructor(sources: T[][], options?: KWayMergeOptions<T>) {
    this._sources = sources.map(s => [...s])
    this._comparator = options?.comparator ?? defaultComparator
    this.initialize()
  }

  private initialize(): void {
    this._heap = []
    this._iterators = []
    this._done = false
    for (let i = 0; i < this._sources.length; i++) {
      const iter = this._sources[i]![Symbol.iterator]()
      this._iterators.push(iter)
      const result = iter.next()
      if (!result.done) {
        this.heapPush({ value: result.value, sourceIndex: i })
      }
    }
    if (this._heap.length === 0) {
      this._done = true
    }
  }

  private heapPush(entry: HeapEntry<T>): void {
    this._heap.push(entry)
    this.siftUp(this._heap.length - 1)
  }

  private heapPop(): HeapEntry<T> | undefined {
    if (this._heap.length === 0) return undefined
    const top = this._heap[0]!
    const last = this._heap.pop()!
    if (this._heap.length > 0) {
      this._heap[0] = last
      this.siftDown(0)
    }
    return top
  }

  private heapPeek(): HeapEntry<T> | undefined {
    return this._heap[0]
  }

  private compareEntries(a: HeapEntry<T>, b: HeapEntry<T>): number {
    const cmp = this._comparator(a.value, b.value)
    if (cmp !== 0) return cmp
    return a.sourceIndex - b.sourceIndex
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.compareEntries(this._heap[index]!, this._heap[parent]!) < 0) {
        this.swap(index, parent)
        index = parent
      } else {
        break
      }
    }
  }

  private siftDown(index: number): void {
    const length = this._heap.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < length && this.compareEntries(this._heap[left]!, this._heap[smallest]!) < 0) {
        smallest = left
      }
      if (right < length && this.compareEntries(this._heap[right]!, this._heap[smallest]!) < 0) {
        smallest = right
      }
      if (smallest !== index) {
        this.swap(index, smallest)
        index = smallest
      } else {
        break
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this._heap[i]!
    this._heap[i] = this._heap[j]!
    this._heap[j] = temp
  }

  next(): IteratorResult<T> {
    if (this._done) return { done: true, value: undefined }
    const entry = this.heapPop()
    if (entry === undefined) {
      this._done = true
      return { done: true, value: undefined }
    }
    const iter = this._iterators[entry.sourceIndex]!
    const nextResult = iter.next()
    if (!nextResult.done) {
      this.heapPush({ value: nextResult.value, sourceIndex: entry.sourceIndex })
    }
    if (this._heap.length === 0) {
      this._done = true
    }
    return { done: false, value: entry.value }
  }

  get done(): boolean {
    return this._done
  }

  peek(): T | undefined {
    const entry = this.heapPeek()
    return entry?.value
  }

  toArray(): T[] {
    const result: T[] = []
    while (!this._done) {
      const next = this.next()
      if (!next.done && next.value !== undefined) {
        result.push(next.value)
      }
    }
    return result
  }

  merge(): T[] {
    return this.toArray()
  }

  drain(count?: number): T[] {
    const result: T[] = []
    const limit = count ?? Infinity
    while (result.length < limit && !this._done) {
      const next = this.next()
      if (!next.done && next.value !== undefined) {
        result.push(next.value)
      }
    }
    return result
  }

  get sourceCount(): number {
    return this._sources.length
  }

  reset(): void {
    this.initialize()
  }

  *[Symbol.iterator](): Generator<T> {
    while (!this._done) {
      const result = this.next()
      if (!result.done) {
        yield result.value
      }
    }
  }

  static merge<T>(sources: T[][], comparator?: (a: T, b: T) => number): T[] {
    const merger = new KWayMerge(sources, comparator ? { comparator } : undefined)
    return merger.toArray()
  }
}

export { defaultComparator } from './types.js'
export type { KWayMergeOptions, HeapEntry } from './types.js'
