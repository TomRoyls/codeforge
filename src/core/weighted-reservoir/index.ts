import type { WeightedReservoirOptions } from './types.js'

interface HeapEntry<T> {
  priority: number
  item: T
  weight: number
}

export class WeightedReservoir<T> {
  private heap: HeapEntry<T>[] = []
  private _totalSeen = 0
  private _reservoirSize: number

  constructor(options?: WeightedReservoirOptions) {
    this._reservoirSize = options?.reservoirSize ?? 100
    if (this._reservoirSize < 1) {
      throw new RangeError('reservoirSize must be at least 1')
    }
  }

  add(item: T, weight: number): void {
    if (weight <= 0) {
      throw new RangeError('weight must be greater than 0')
    }
    this._totalSeen++
    const priority = Math.pow(Math.random(), 1 / weight)
    if (this.heap.length < this._reservoirSize) {
      this.heapPush({ priority, item, weight })
    } else if (priority > this.heap[0]!.priority) {
      this.heap[0]! = { priority, item, weight }
      this.sinkDown(0)
    }
  }

  sample(): T[] {
    return this.heap.map((e) => e.item)
  }

  sampleOne(): T | undefined {
    if (this.heap.length === 0) return undefined
    const totalWeight = this.heap.reduce((sum, e) => sum + e.weight, 0)
    let r = Math.random() * totalWeight
    for (const entry of this.heap) {
      r -= entry.weight
      if (r <= 0) return entry.item
    }
    return this.heap[this.heap.length - 1]!.item
  }

  get size(): number {
    return this.heap.length
  }

  get totalSeen(): number {
    return this._totalSeen
  }

  get reservoirSize(): number {
    return this._reservoirSize
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
    this._totalSeen = 0
  }

  reset(newSize?: number): void {
    if (newSize !== undefined) {
      if (newSize < 1) {
        throw new RangeError('reservoirSize must be at least 1')
      }
      this._reservoirSize = newSize
    }
    this.heap = []
    this._totalSeen = 0
  }

  toArray(): T[] {
    return this.sample()
  }

  weights(): Map<T, number> {
    const result = new Map<T, number>()
    for (const entry of this.heap) {
      result.set(entry.item, entry.weight)
    }
    return result
  }

  clone(): WeightedReservoir<T> {
    const cloned = new WeightedReservoir<T>({ reservoirSize: this._reservoirSize })
    cloned.heap = this.heap.map((e) => ({ ...e }))
    cloned._totalSeen = this._totalSeen
    return cloned
  }

  static fromArray<U>(
    items: Array<{ item: U; weight: number }>,
    options?: WeightedReservoirOptions,
  ): WeightedReservoir<U> {
    const reservoir = new WeightedReservoir<U>(options)
    for (const { item, weight } of items) {
      reservoir.add(item, weight)
    }
    return reservoir
  }

  private heapPush(entry: HeapEntry<T>): void {
    this.heap.push(entry)
    this.bubbleUp(this.heap.length - 1)
  }

  private bubbleUp(index: number): void {
    const entry = this.heap[index]!
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.heap[parent]!.priority > entry.priority) {
        this.heap[index] = this.heap[parent]!
        this.heap[parent] = entry
        index = parent
      } else {
        break
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length
    const entry = this.heap[index]!
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < length && this.heap[left]!.priority < this.heap[smallest]!.priority) {
        smallest = left
      }
      if (right < length && this.heap[right]!.priority < this.heap[smallest]!.priority) {
        smallest = right
      }
      if (smallest !== index) {
        this.heap[index] = this.heap[smallest]!
        this.heap[smallest] = entry
        index = smallest
      } else {
        break
      }
    }
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }
}
