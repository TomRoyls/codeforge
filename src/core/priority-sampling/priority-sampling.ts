import type { PrioritySamplingOptions, PrioritySamplingStatistics } from './types.js'
import { DEFAULT_PRIORITY_SAMPLING_OPTIONS } from './types.js'

function createRng(seed: number): () => number {
  let state = seed | 0
  return () => {
    state = (state + 0x6D2B79F5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Entry<T> {
  item: T
  weight: number
  priority: number
}

export class PrioritySampling<T> {
  private _heap: Entry<T>[] = []
  private readonly k: number
  private rng: () => number
  private _adds = 0
  private _samples = 0
  private _updates = 0
  private _overflows = 0
  private _totalWeight = 0

  constructor(options?: PrioritySamplingOptions) {
    const opts = { ...DEFAULT_PRIORITY_SAMPLING_OPTIONS, ...options }
    if (opts.reservoirSize < 0) {
      throw new RangeError('reservoirSize must be non-negative')
    }
    this.k = opts.reservoirSize
    this.rng = createRng(opts.seed ?? ((Math.random() * 2147483647) | 0))
  }

  add(item: T, weight: number): void {
    if (weight <= 0) {
      throw new RangeError('weight must be positive')
    }
    this._adds++
    this._totalWeight += weight
    const priority = Math.pow(this.rng(), 1 / weight)
    if (this._heap.length < this.k) {
      this._heap.push({ item, weight, priority })
      this.bubbleUp(this._heap.length - 1)
    } else if (this.k > 0 && priority > this._heap[0]!.priority) {
      this._overflows++
      this._heap[0] = { item, weight, priority }
      this.sinkDown(0)
    } else if (this.k > 0) {
      this._overflows++
    }
  }

  sample(n?: number): T[] {
    this._samples++
    const items = this._heap.map((e) => e.item)
    const count = n !== undefined ? Math.min(n, items.length) : items.length
    const result: T[] = []
    const indices = Array.from({ length: items.length }, (_, i) => i)
    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(this.rng() * (indices.length - i))
      const tmp = indices[i]!
      indices[i] = indices[j]!
      indices[j] = tmp
      result.push(items[indices[i]!]!)
    }
    return result
  }

  reset(): void {
    this._heap = []
    this._adds = 0
    this._samples = 0
    this._updates = 0
    this._overflows = 0
    this._totalWeight = 0
  }

  reservoir(): T[] {
    return this._heap.map((e) => e.item)
  }

  get size(): number {
    return this._heap.length
  }

  get reservoirSize(): number {
    return this.k
  }

  get isEmpty(): boolean {
    return this._heap.length === 0
  }

  totalWeight(): number {
    return this._totalWeight
  }

  contains(item: T): boolean {
    for (const entry of this._heap) {
      if (Object.is(entry.item, item)) return true
    }
    return false
  }

  getWeight(item: T): number | undefined {
    for (const entry of this._heap) {
      if (Object.is(entry.item, item)) return entry.weight
    }
    return undefined
  }

  updateWeight(item: T, newWeight: number): boolean {
    if (newWeight <= 0) {
      throw new RangeError('weight must be positive')
    }
    for (let i = 0; i < this._heap.length; i++) {
      if (Object.is(this._heap[i]!.item, item)) {
        const oldWeight = this._heap[i]!.weight
        this._totalWeight += newWeight - oldWeight
        this._updates++
        this._heap[i]!.weight = newWeight
        this._heap[i]!.priority = Math.pow(this.rng(), 1 / newWeight)
        this.sinkDown(i)
        this.bubbleUp(i)
        return true
      }
    }
    return false
  }

  toArray(): T[] {
    return this._heap.map((e) => e.item)
  }

  forEach(callback: (item: T, weight: number, index: number) => void): void {
    for (let i = 0; i < this._heap.length; i++) {
      callback(this._heap[i]!.item, this._heap[i]!.weight, i)
    }
  }

  getStatistics(): PrioritySamplingStatistics {
    return {
      adds: this._adds,
      samples: this._samples,
      updates: this._updates,
      totalWeight: this._totalWeight,
      overflows: this._overflows,
    }
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = ((index - 1) / 2) | 0
      if (this._heap[index]!.priority >= this._heap[parent]!.priority) break
      const tmp = this._heap[index]!
      this._heap[index] = this._heap[parent]!
      this._heap[parent] = tmp
      index = parent
    }
  }

  private sinkDown(index: number): void {
    const len = this._heap.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < len && this._heap[left]!.priority < this._heap[smallest]!.priority) {
        smallest = left
      }
      if (right < len && this._heap[right]!.priority < this._heap[smallest]!.priority) {
        smallest = right
      }
      if (smallest === index) break
      const tmp = this._heap[index]!
      this._heap[index] = this._heap[smallest]!
      this._heap[smallest] = tmp
      index = smallest
    }
  }
}
