import type { RankedHeapOptions, RankedHeapJSON, RankedHeapStatistics, RankedHeapEntry, RankedHeapComparator } from './types.js'
import { DEFAULT_RANKED_HEAP_OPTIONS } from './types.js'

export class RankedHeap<T = unknown> {
  private _heap: RankedHeapEntry<T>[] = []
  private _valueMap: Map<T, number> = new Map()
  private _comparator: RankedHeapComparator
  private _stats: RankedHeapStatistics = {
    pushes: 0,
    pops: 0,
    rankQueries: 0,
    scoreUpdates: 0,
    deletes: 0,
    maxSize: 0,
  }

  constructor(options?: RankedHeapOptions) {
    const opts = { ...DEFAULT_RANKED_HEAP_OPTIONS, ...options }
    this._comparator = opts.comparator
  }

  push(value: T, score: number): void {
    if (this._valueMap.has(value)) {
      this.updateScore(value, score)
      return
    }
    const entry: RankedHeapEntry<T> = { value, score }
    this._heap.push(entry)
    const index = this._heap.length - 1
    this._valueMap.set(value, index)
    this.siftUp(index)
    this._stats.pushes++
    this.updateMaxSize()
  }

  pop(): T | undefined {
    if (this._heap.length === 0) return undefined
    const top = this._heap[0]!
    this.removeAt(0)
    this._stats.pops++
    return top.value
  }

  peek(): T | undefined {
    if (this._heap.length === 0) return undefined
    return this._heap[0]!.value
  }

  peekScore(): number | undefined {
    if (this._heap.length === 0) return undefined
    return this._heap[0]!.score
  }

  rank(k: number): T | undefined {
    this._stats.rankQueries++
    if (k < 1 || k > this._heap.length) return undefined
    const sorted = this.getSortedEntries()
    return sorted[k - 1]!.value
  }

  rankOf(value: T): number | undefined {
    this._stats.rankQueries++
    if (!this._valueMap.has(value)) return undefined
    const sorted = this.getSortedEntries()
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i]!.value === value) return i + 1
    }
    return undefined
  }

  updateScore(value: T, newScore: number): boolean {
    const index = this._valueMap.get(value)
    if (index === undefined) return false
    this._heap[index]!.score = newScore
    this.siftUp(index)
    const newIndex = this._valueMap.get(value)!
    this.siftDown(newIndex)
    this._stats.scoreUpdates++
    return true
  }

  delete(value: T): boolean {
    const index = this._valueMap.get(value)
    if (index === undefined) return false
    this.removeAt(index)
    this._stats.deletes++
    return true
  }

  has(value: T): boolean {
    return this._valueMap.has(value)
  }

  get size(): number {
    return this._heap.length
  }

  get isEmpty(): boolean {
    return this._heap.length === 0
  }

  clear(): void {
    this._heap = []
    this._valueMap.clear()
    this._stats = {
      pushes: 0,
      pops: 0,
      rankQueries: 0,
      scoreUpdates: 0,
      deletes: 0,
      maxSize: 0,
    }
  }

  toArray(): T[] {
    return this.getSortedEntries().map(e => e.value)
  }

  scores(): Array<{ value: T; score: number }> {
    return this.getSortedEntries().map(e => ({ value: e.value, score: e.score }))
  }

  forEach(callback: (value: T, score: number, rank: number) => void): void {
    const sorted = this.getSortedEntries()
    for (let i = 0; i < sorted.length; i++) {
      callback(sorted[i]!.value, sorted[i]!.score, i + 1)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const sorted = this.getSortedEntries()
    for (const entry of sorted) {
      yield entry.value
    }
  }

  getStatistics(): RankedHeapStatistics {
    return { ...this._stats }
  }

  toJSON(): RankedHeapJSON<T> {
    return {
      entries: this._heap.map(e => ({ value: e.value, score: e.score })),
      comparator: this._comparator,
      statistics: { ...this._stats },
    }
  }

  static fromJSON<T>(data: RankedHeapJSON<T>): RankedHeap<T> {
    const heap = new RankedHeap<T>({ comparator: data.comparator })
    for (const entry of data.entries) {
      heap.push(entry.value, entry.score)
    }
    heap._stats = { ...data.statistics }
    return heap
  }

  private compare(a: number, b: number): boolean {
    if (this._comparator === 'max') return a > b
    return a < b
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.compare(this._heap[index]!.score, this._heap[parent]!.score)) {
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
      let target = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < length && this.compare(this._heap[left]!.score, this._heap[target]!.score)) {
        target = left
      }
      if (right < length && this.compare(this._heap[right]!.score, this._heap[target]!.score)) {
        target = right
      }
      if (target !== index) {
        this.swap(index, target)
        index = target
      } else {
        break
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this._heap[i]!
    this._heap[i] = this._heap[j]!
    this._heap[j] = temp
    this._valueMap.set(this._heap[i]!.value, i)
    this._valueMap.set(this._heap[j]!.value, j)
  }

  private removeAt(index: number): void {
    const last = this._heap.length - 1
    if (index === last) {
      this._valueMap.delete(this._heap[index]!.value)
      this._heap.pop()
      return
    }
    this.swap(index, last)
    this._valueMap.delete(this._heap[last]!.value)
    this._heap.pop()
    if (index < this._heap.length) {
      this.siftUp(index)
      const newIndex = this._valueMap.get(this._heap[index]!.value)
      if (newIndex !== undefined) {
        this.siftDown(newIndex)
      }
    }
  }

  private getSortedEntries(): RankedHeapEntry<T>[] {
    return [...this._heap].sort((a, b) => {
      if (this._comparator === 'max') return b.score - a.score
      return a.score - b.score
    })
  }

  private updateMaxSize(): void {
    if (this._heap.length > this._stats.maxSize) {
      this._stats.maxSize = this._heap.length
    }
  }
}

export { DEFAULT_RANKED_HEAP_OPTIONS } from './types.js'
export type { RankedHeapOptions, RankedHeapJSON, RankedHeapStatistics, RankedHeapEntry, RankedHeapComparator } from './types.js'
