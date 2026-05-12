import type { BucketQueueOptions, BucketQueueStats } from './types.js'

const DEFAULT_MAX_PRIORITY = 1000

export class BucketQueue<T> {
  private buckets: Array<Array<T>>
  private _size: number = 0
  private _minPriority: number | undefined = undefined
  private _maxPriority: number | undefined = undefined
  private _maxPriorityCap: number
  private valueToPriority: Map<T, number> = new Map()

  constructor(options?: BucketQueueOptions) {
    this._maxPriorityCap = options?.maxPriority ?? DEFAULT_MAX_PRIORITY
    this.buckets = []
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  enqueue(value: T, priority: number): void {
    if (priority < 0 || !Number.isInteger(priority)) {
      throw new RangeError('Priority must be a non-negative integer')
    }
    if (priority > this._maxPriorityCap) {
      throw new RangeError(`Priority ${priority} exceeds maxPriority ${this._maxPriorityCap}`)
    }

    if (this.buckets[priority] === undefined) {
      this.buckets[priority] = []
    }
    this.buckets[priority]!.push(value)
    this.valueToPriority.set(value, priority)
    this._size++

    if (this._minPriority === undefined || priority < this._minPriority) {
      this._minPriority = priority
    }
    if (this._maxPriority === undefined || priority > this._maxPriority) {
      this._maxPriority = priority
    }
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined

    const minP = this._minPriority!
    const bucket = this.buckets[minP]!
    const value = bucket.shift()!
    this.valueToPriority.delete(value)
    this._size--

    if (bucket.length === 0) {
      this.buckets[minP] = undefined!
      delete this.buckets[minP]
      this.recalculateMinPriority()
    }

    return value
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    const bucket = this.buckets[this._minPriority!]!
    return bucket[0]
  }

  peekPriority(): number | undefined {
    return this._minPriority
  }

  getMinPriority(): number | undefined {
    return this._minPriority
  }

  getMaxPriority(): number | undefined {
    if (this._size === 0) return undefined
    return this._maxPriority
  }

  priorities(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.buckets[i] !== undefined && this.buckets[i]!.length > 0) {
        result.push(i)
      }
    }
    return result
  }

  updatePriority(value: T, newPriority: number): boolean {
    if (newPriority < 0 || !Number.isInteger(newPriority)) {
      throw new RangeError('Priority must be a non-negative integer')
    }
    if (newPriority > this._maxPriorityCap) {
      throw new RangeError(`Priority ${newPriority} exceeds maxPriority ${this._maxPriorityCap}`)
    }

    const oldPriority = this.valueToPriority.get(value)
    if (oldPriority === undefined) return false

    if (oldPriority === newPriority) return true

    const oldBucket = this.buckets[oldPriority]
    if (oldBucket !== undefined) {
      const idx = oldBucket.indexOf(value)
      if (idx !== -1) {
        oldBucket.splice(idx, 1)
        if (oldBucket.length === 0) {
          this.buckets[oldPriority] = undefined!
          delete this.buckets[oldPriority]
        }
      }
    }

    if (this.buckets[newPriority] === undefined) {
      this.buckets[newPriority] = []
    }
    this.buckets[newPriority]!.push(value)
    this.valueToPriority.set(value, newPriority)

    this.recalculateBounds()
    return true
  }

  clear(): void {
    this.buckets = []
    this._size = 0
    this._minPriority = undefined
    this._maxPriority = undefined
    this.valueToPriority.clear()
  }

  toArray(): Array<{ value: T; priority: number }> {
    const result: Array<{ value: T; priority: number }> = []
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i]
      if (bucket !== undefined) {
        for (let j = 0; j < bucket.length; j++) {
          result.push({ value: bucket[j]!, priority: i })
        }
      }
    }
    return result
  }

  stats(): BucketQueueStats {
    return {
      size: this._size,
      bucketCount: this.priorities().length,
      minPriority: this._minPriority,
      maxPriority: this._maxPriority,
    }
  }

  contains(value: T): boolean {
    return this.valueToPriority.has(value)
  }

  getPriority(value: T): number | undefined {
    return this.valueToPriority.get(value)
  }

  remove(value: T): boolean {
    const priority = this.valueToPriority.get(value)
    if (priority === undefined) return false

    const bucket = this.buckets[priority]
    if (bucket !== undefined) {
      const idx = bucket.indexOf(value)
      if (idx !== -1) {
        bucket.splice(idx, 1)
        if (bucket.length === 0) {
          this.buckets[priority] = undefined!
          delete this.buckets[priority]
        }
      }
    }

    this.valueToPriority.delete(value)
    this._size--
    this.recalculateBounds()
    return true
  }

  private recalculateMinPriority(): void {
    if (this._size === 0) {
      this._minPriority = undefined
      this._maxPriority = undefined
      return
    }
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.buckets[i] !== undefined && this.buckets[i]!.length > 0) {
        this._minPriority = i
        return
      }
    }
    this._minPriority = undefined
  }

  private recalculateBounds(): void {
    if (this._size === 0) {
      this._minPriority = undefined
      this._maxPriority = undefined
      return
    }
    let foundMin: number | undefined
    let foundMax: number | undefined
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.buckets[i] !== undefined && this.buckets[i]!.length > 0) {
        if (foundMin === undefined) foundMin = i
        foundMax = i
      }
    }
    this._minPriority = foundMin
    this._maxPriority = foundMax
  }

  static from<T>(entries: Array<{ value: T; priority: number }>, options?: BucketQueueOptions): BucketQueue<T> {
    const q = new BucketQueue<T>(options)
    for (const entry of entries) {
      q.enqueue(entry.value, entry.priority)
    }
    return q
  }
}
