import type { TieredVectorOptions, TieredVectorStatistics } from './types.js'
import { DEFAULT_TIERED_VECTOR_OPTIONS } from './types.js'

export class TieredVector<T = unknown> {
  private tiers: T[][] = []
  private _size: number = 0
  private readonly _baseSize: number
  private stats: TieredVectorStatistics = {
    inserts: 0,
    deletes: 0,
    accesses: 0,
    rebalances: 0,
    maxTierSize: 0,
  }

  constructor(options?: Partial<TieredVectorOptions>) {
    const resolved = { ...DEFAULT_TIERED_VECTOR_OPTIONS, ...options }
    this._baseSize = Math.max(2, Math.floor(resolved.baseSize!))
  }

  private resolveIndex(index: number): [number, number] {
    let remaining = index
    for (let t = 0; t < this.tiers.length; t++) {
      const tier = this.tiers[t]!
      if (remaining < tier.length) {
        return [t, remaining]
      }
      remaining -= tier.length
    }
    return [-1, -1]
  }

  private updateMaxTierSize(): void {
    let max = 0
    for (let i = 0; i < this.tiers.length; i++) {
      const len = this.tiers[i]!.length
      if (len > max) max = len
    }
    this.stats.maxTierSize = max
  }

  private rebalanceAfterInsert(tierIndex: number): void {
    const tier = this.tiers[tierIndex]!
    if (tier.length > this._baseSize * 2) {
      const mid = Math.floor(tier.length / 2)
      const left = tier.slice(0, mid)
      const right = tier.slice(mid)
      this.tiers[tierIndex] = left
      this.tiers.splice(tierIndex + 1, 0, right)
      this.stats.rebalances++
      this.updateMaxTierSize()
    } else {
      if (tier.length > this.stats.maxTierSize) {
        this.stats.maxTierSize = tier.length
      }
    }
  }

  private rebalanceAfterRemove(tierIndex: number): void {
    if (this.tiers.length <= 1) return
    const tier = this.tiers[tierIndex]!
    if (tier.length >= Math.floor(this._baseSize / 2)) return

    if (tierIndex > 0) {
      const prev = this.tiers[tierIndex - 1]!
      if (prev.length + tier.length <= this._baseSize * 2) {
        const merged = [...prev, ...tier]
        this.tiers[tierIndex - 1] = merged
        this.tiers.splice(tierIndex, 1)
        this.stats.rebalances++
        this.updateMaxTierSize()
        return
      }
    }

    if (tierIndex < this.tiers.length - 1) {
      const next = this.tiers[tierIndex + 1]!
      if (tier.length + next.length <= this._baseSize * 2) {
        const merged = [...tier, ...next]
        this.tiers[tierIndex] = merged
        this.tiers.splice(tierIndex + 1, 1)
        this.stats.rebalances++
        this.updateMaxTierSize()
      }
    }
  }

  get(index: number): T | undefined {
    this.stats.accesses++
    if (index < 0 || index >= this._size) return undefined
    const [t, i] = this.resolveIndex(index)
    if (t === -1) return undefined
    return this.tiers[t]![i]
  }

  set(index: number, value: T): void {
    this.stats.accesses++
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const [t, i] = this.resolveIndex(index)
    this.tiers[t]![i] = value
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size}]`)
    }

    if (this.tiers.length === 0) {
      this.tiers.push([value])
      this._size++
      this.stats.inserts++
      this.stats.maxTierSize = 1
      return
    }

    let tierIndex: number
    let localIndex: number

    if (index === this._size) {
      const lastTier = this.tiers[this.tiers.length - 1]!
      lastTier.push(value)
      tierIndex = this.tiers.length - 1
      localIndex = lastTier.length - 1
    } else {
      const [t, i] = this.resolveIndex(index)
      tierIndex = t
      localIndex = i
      this.tiers[tierIndex]!.splice(localIndex, 0, value)
    }

    this._size++
    this.stats.inserts++
    this.rebalanceAfterInsert(tierIndex)
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined

    const [t, i] = this.resolveIndex(index)
    if (t === -1) return undefined

    const tier = this.tiers[t]!
    const value = tier[i]!
    tier.splice(i, 1)

    this._size--
    this.stats.deletes++

    if (tier.length === 0) {
      this.tiers.splice(t, 1)
      this.stats.rebalances++
      this.updateMaxTierSize()
    } else {
      this.rebalanceAfterRemove(t)
    }

    return value
  }

  pushBack(value: T): void {
    this.insertAt(this._size, value)
  }

  popBack(): T | undefined {
    if (this._size === 0) return undefined
    return this.removeAt(this._size - 1)
  }

  pushFront(value: T): void {
    this.insertAt(0, value)
  }

  popFront(): T | undefined {
    return this.removeAt(0)
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.tiers.length = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = new Array(this._size)
    let offset = 0
    for (let t = 0; t < this.tiers.length; t++) {
      const tier = this.tiers[t]!
      for (let i = 0; i < tier.length; i++) {
        result[offset] = tier[i]!
        offset++
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let globalIndex = 0
    for (let t = 0; t < this.tiers.length; t++) {
      const tier = this.tiers[t]!
      for (let i = 0; i < tier.length; i++) {
        callback(tier[i]!, globalIndex)
        globalIndex++
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let t = 0; t < this.tiers.length; t++) {
      const tier = this.tiers[t]!
      for (let i = 0; i < tier.length; i++) {
        yield tier[i]!
      }
    }
  }

  at(index: number): T | undefined {
    return this.get(index)
  }

  indexOf(value: T): number {
    let globalIndex = 0
    for (let t = 0; t < this.tiers.length; t++) {
      const tier = this.tiers[t]!
      for (let i = 0; i < tier.length; i++) {
        if (tier[i] === value) return globalIndex
        globalIndex++
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  slice(start: number = 0, end?: number): T[] {
    const s = start < 0 ? Math.max(0, this._size + start) : Math.min(this._size, start)
    const e = end === undefined ? this._size : (end < 0 ? Math.max(0, this._size + end) : Math.min(this._size, end))
    if (s >= e) return []
    const result: T[] = new Array(e - s)

    let globalIndex = 0
    let resultIndex = 0
    for (let t = 0; t < this.tiers.length && resultIndex < result.length; t++) {
      const tier = this.tiers[t]!
      for (let i = 0; i < tier.length && resultIndex < result.length; i++) {
        if (globalIndex >= s && globalIndex < e) {
          result[resultIndex] = tier[i]!
          resultIndex++
        }
        globalIndex++
      }
    }
    return result
  }

  reverse(): void {
    if (this._size <= 1) return
    const all = this.toArray()
    let left = 0
    let right = all.length - 1
    while (left < right) {
      const tmp = all[left]!
      all[left] = all[right]!
      all[right] = tmp
      left++
      right--
    }

    this.tiers.length = 0
    let offset = 0
    while (offset < all.length) {
      const chunkSize = Math.min(this._baseSize, all.length - offset)
      const tier: T[] = new Array(chunkSize)
      for (let i = 0; i < chunkSize; i++) {
        tier[i] = all[offset + i]!
      }
      this.tiers.push(tier)
      offset += chunkSize
    }
    this.updateMaxTierSize()
  }

  getStatistics(): TieredVectorStatistics {
    return { ...this.stats }
  }
}

export { DEFAULT_TIERED_VECTOR_OPTIONS } from './types.js'
export type { TieredVectorOptions, TieredVectorStatistics } from './types.js'
