import type { WeightedRoundRobinOptions, WeightedRoundRobinStatistics } from './types.js'
import { DEFAULT_WEIGHTED_ROUND_ROBIN_OPTIONS } from './types.js'

interface WeightedEntry<T> {
  item: T
  weight: number
  currentWeight: number
  effectiveWeight: number
}

export class WeightedRoundRobin<T> {
  private entries: WeightedEntry<T>[] = []
  private itemMap: Map<T, WeightedEntry<T>> = new Map()
  private options: WeightedRoundRobinOptions
  private stats: WeightedRoundRobinStatistics = {
    adds: 0,
    removes: 0,
    selections: 0,
    weightUpdates: 0,
    totalCycles: 0,
  }

  constructor(options: WeightedRoundRobinOptions = DEFAULT_WEIGHTED_ROUND_ROBIN_OPTIONS) {
    this.options = { ...DEFAULT_WEIGHTED_ROUND_ROBIN_OPTIONS, ...options }
  }

  add(item: T, weight: number): void {
    if (weight <= 0) {
      throw new Error('Weight must be a positive number')
    }
    if (this.itemMap.has(item)) {
      throw new Error('Item already exists')
    }
    const entry: WeightedEntry<T> = {
      item,
      weight,
      currentWeight: 0,
      effectiveWeight: weight,
    }
    this.entries.push(entry)
    this.itemMap.set(item, entry)
    this._sequenceCache = null
    this.stats.adds++
  }

  remove(item: T): boolean {
    const entry = this.itemMap.get(item)
    if (!entry) return false
    const index = this.entries.indexOf(entry)
    if (index !== -1) {
      this.entries.splice(index, 1)
    }
    this.itemMap.delete(item)
    this._sequenceCache = null
    this.stats.removes++
    return true
  }

  next(): T | undefined {
    if (this.entries.length === 0) return undefined

    if (this.options.smooth) {
      return this.smoothNext()
    }
    return this.basicNext()
  }

  private smoothNext(): T {
    let totalEffectiveWeight = 0
    let bestEntry: WeightedEntry<T> | null = null

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i]!
      entry.currentWeight += entry.effectiveWeight
      totalEffectiveWeight += entry.effectiveWeight

      if (bestEntry === null || entry.currentWeight > bestEntry.currentWeight) {
        bestEntry = entry
      }
    }

    bestEntry!.currentWeight -= totalEffectiveWeight

    this.stats.selections++
    if (this.stats.selections % this.entries.length === 0) {
      this.stats.totalCycles++
    }

    return bestEntry!.item
  }

  private basicNext(): T {
    if (this._sequenceCache === null) {
      this._sequenceCache = this.buildInterleavedSequence()
    }
    const seq = this._sequenceCache
    const result = seq[this._basicIndex % seq.length]!
    this._basicIndex = (this._basicIndex + 1) % seq.length

    this.stats.selections++
    if (this._basicIndex === 0) {
      this.stats.totalCycles++
    }

    return result
  }

  private _basicIndex = 0
  private _sequenceCache: T[] | null = null

  private buildInterleavedSequence(): T[] {
    const gcd = this.computeGcd()
    const sequence: T[] = []
    const remaining = this.entries.map((e) => e.weight / gcd)
    const total = remaining.reduce((s, v) => s + v, 0)

    for (let i = 0; i < total; i++) {
      let maxIdx = 0
      let maxVal = remaining[0]!
      for (let k = 1; k < remaining.length; k++) {
        if (remaining[k]! > maxVal) {
          maxVal = remaining[k]!
          maxIdx = k
        }
      }
      sequence.push(this.entries[maxIdx]!.item)
      remaining[maxIdx]!--
    }

    return sequence
  }

  private computeGcd(): number {
    if (this.entries.length === 0) return 0
    let result = this.entries[0]!.weight
    for (let i = 1; i < this.entries.length; i++) {
      result = gcd(result, this.entries[i]!.weight)
    }
    return result
  }

  reset(): void {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i]!
      entry.currentWeight = 0
      entry.effectiveWeight = entry.weight
    }
    this._basicIndex = 0
    this._sequenceCache = null
  }

  updateWeight(item: T, newWeight: number): boolean {
    if (newWeight <= 0) {
      throw new Error('Weight must be a positive number')
    }
    const entry = this.itemMap.get(item)
    if (!entry) return false
    entry.weight = newWeight
    entry.effectiveWeight = newWeight
    this._sequenceCache = null
    this.stats.weightUpdates++
    return true
  }

  getWeight(item: T): number | undefined {
    return this.itemMap.get(item)?.weight
  }

  items(): T[] {
    return this.entries.map((e) => e.item)
  }

  totalWeight(): number {
    let total = 0
    for (let i = 0; i < this.entries.length; i++) {
      total += this.entries[i]!.weight
    }
    return total
  }

  get size(): number {
    return this.entries.length
  }

  get isEmpty(): boolean {
    return this.entries.length === 0
  }

  clear(): void {
    this.entries = []
    this.itemMap.clear()
    this._basicIndex = 0
    this._sequenceCache = null
  }

  toArray(): T[] {
    return this.items()
  }

  forEach(callback: (item: T, weight: number, index: number) => void): void {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i]!
      callback(entry.item, entry.weight, i)
    }
  }

  getStatistics(): WeightedRoundRobinStatistics {
    return { ...this.stats }
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const entries = this.entries
    return {
      next(): IteratorResult<T> {
        if (index < entries.length) {
          return { value: entries[index++]!.item, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }
}

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}
