import type { StreamingQuantileOptions } from './types.js'
import { DEFAULT_COMPARATOR } from './types.js'

interface GKTuple<T> {
  value: T
  gap: number
  delta: number
}

export class StreamingQuantile<T = number> {
  private _tuples: GKTuple<T>[]
  private _count: number
  private _error: number
  private _comparator: (a: T, b: T) => number
  private _min: T | undefined
  private _max: T | undefined
  private _sum: number
  private _hasNumericSum: boolean
  private _items: T[]

  constructor(options?: StreamingQuantileOptions<T>) {
    this._error = options?.error ?? 0.01
    this._comparator = options?.comparator ?? DEFAULT_COMPARATOR
    this._tuples = []
    this._count = 0
    this._min = undefined
    this._max = undefined
    this._sum = 0
    this._hasNumericSum = false
    this._items = []
  }

  insert(item: T): void {
    this._items.push(item)

    if (this._count === 0) {
      this._tuples.push({ value: item, gap: 1, delta: 0 })
      this._min = item
      this._max = item
      this._count = 1
      this._tryAddToSum(item)
      return
    }

    const delta = Math.floor(2 * this._error * this._count)
    let pos = this._tuples.length

    for (let i = 0; i < this._tuples.length; i++) {
      if (this._comparator(item, this._tuples[i]!.value) < 0) {
        pos = i
        break
      }
    }

    if (pos === 0) {
      this._tuples.unshift({ value: item, gap: 1, delta: 0 })
      this._min = item
    } else if (pos === this._tuples.length) {
      this._tuples.push({ value: item, gap: 1, delta: 0 })
      this._max = item
    } else {
      const prevDelta = this._tuples[pos - 1]!.delta
      const newDelta = prevDelta + this._tuples[pos - 1]!.gap - 1
      this._tuples.splice(pos, 0, {
        value: item,
        gap: 1,
        delta: Math.min(delta, newDelta),
      })
    }

    this._count++
    this._tryAddToSum(item)

    if (this._comparator(item, this._min!) < 0) {
      this._min = item
    }
    if (this._comparator(item, this._max!) > 0) {
      this._max = item
    }

    if (this._count % Math.max(1, Math.floor(1 / (2 * this._error))) === 0) {
      this.compress()
    }
  }

  query(quantile: number): T {
    if (this._count === 0) {
      throw new Error('Cannot query empty stream')
    }
    if (quantile <= 0) return this._min!
    if (quantile >= 1) return this._max!

    const targetRank = Math.ceil(quantile * this._count)
    const epsilon = this._error * this._count

    let cumulativeRank = 0

    for (let i = 0; i < this._tuples.length; i++) {
      const tuple = this._tuples[i]!
      cumulativeRank += tuple.gap

      if (i === this._tuples.length - 1) {
        return tuple.value
      }

      const minPossibleRank = cumulativeRank - tuple.delta
      if (minPossibleRank + tuple.delta <= targetRank + epsilon) {
        continue
      }

      return tuple.value
    }

    return this._tuples[this._tuples.length - 1]!.value
  }

  queryMultiple(quantiles: number[]): T[] {
    return quantiles.map((q) => this.query(q))
  }

  get count(): number {
    return this._count
  }

  get error(): number {
    return this._error
  }

  isEmpty(): boolean {
    return this._count === 0
  }

  clear(): void {
    this._tuples = []
    this._count = 0
    this._min = undefined
    this._max = undefined
    this._sum = 0
    this._hasNumericSum = false
    this._items = []
  }

  min(): T {
    if (this._count === 0) {
      throw new Error('Cannot get min of empty stream')
    }
    return this._min!
  }

  max(): T {
    if (this._count === 0) {
      throw new Error('Cannot get max of empty stream')
    }
    return this._max!
  }

  mean(): number {
    if (this._count === 0) {
      throw new Error('Cannot get mean of empty stream')
    }
    if (!this._hasNumericSum) {
      throw new Error('Mean is only available for numeric streams')
    }
    return this._sum / this._count
  }

  clone(): StreamingQuantile<T> {
    const cloned = new StreamingQuantile<T>({
      error: this._error,
      comparator: this._comparator,
    })
    cloned._tuples = this._tuples.map((t) => ({
      value: t.value,
      gap: t.gap,
      delta: t.delta,
    }))
    cloned._count = this._count
    cloned._min = this._min
    cloned._max = this._max
    cloned._sum = this._sum
    cloned._hasNumericSum = this._hasNumericSum
    cloned._items = [...this._items]
    return cloned
  }

  merge(other: StreamingQuantile<T>): StreamingQuantile<T> {
    const merged = new StreamingQuantile<T>({
      error: Math.max(this._error, other._error),
      comparator: this._comparator,
    })

    const allItems = [...this._items, ...other._items]
    for (const item of allItems) {
      merged.insert(item)
    }

    return merged
  }

  private compress(): void {
    if (this._tuples.length < 3) return

    const threshold = 2 * this._error * this._count

    let write = 1
    for (let read = 1; read < this._tuples.length - 1; read++) {
      const current = this._tuples[read]!
      const canMerge =
        current.gap +
          this._tuples[write - 1]!.gap +
          this._tuples[read + 1]!.delta <=
        threshold

      if (canMerge && write > 0) {
        this._tuples[write - 1]!.gap += current.gap
      } else {
        this._tuples[write] = current
        write++
      }
    }

    this._tuples[write] = this._tuples[this._tuples.length - 1]!
    this._tuples.length = write + 1
  }

  private _tryAddToSum(item: T): void {
    if (typeof item === 'number') {
      this._sum += item
      this._hasNumericSum = true
    }
  }

  toString(): string {
    return `StreamingQuantile()`
  }

  get [Symbol.toStringTag](): string {
    return 'StreamingQuantile'
  }
}
