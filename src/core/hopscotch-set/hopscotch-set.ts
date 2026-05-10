import type { HopscotchSetOptions, HopscotchSetStats } from './types.js'

const DEFAULT_NEIGHBORHOOD = 32
const DEFAULT_CAPACITY = 16
const DEFAULT_LOAD_FACTOR_THRESHOLD = 0.75

export class HopscotchSet<T> {
  private _slots: (T | null)[]
  private hopInfos: number[]
  private _capacity: number
  private _size: number
  private _seed: number
  private _neighborhood: number
  private _loadFactorThreshold: number

  constructor(options?: HopscotchSetOptions) {
    this._neighborhood = options?.neighborhoodSize ?? DEFAULT_NEIGHBORHOOD
    if (this._neighborhood < 1) this._neighborhood = DEFAULT_NEIGHBORHOOD
    this._loadFactorThreshold = options?.loadFactorThreshold ?? DEFAULT_LOAD_FACTOR_THRESHOLD
    if (this._loadFactorThreshold <= 0 || this._loadFactorThreshold > 1) {
      this._loadFactorThreshold = DEFAULT_LOAD_FACTOR_THRESHOLD
    }
    this._capacity = Math.max(DEFAULT_CAPACITY, options?.capacity ?? DEFAULT_CAPACITY)
    this._seed = 0x9e3779b9
    this._slots = new Array<T | null>(this._capacity + this._neighborhood - 1).fill(null)
    this.hopInfos = new Array<number>(this._capacity).fill(0)
    this._size = 0
  }

  private hash(value: T): number {
    const str = String(value)
    let h = this._seed
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0
      h = Math.imul(h, 0x5bd1e995)
      h ^= h >>> 15
    }
    return Math.abs(h)
  }

  private homeIndex(value: T): number {
    return this.hash(value) % this._capacity
  }

  private findInNeighborhood(home: number, value: T): number {
    const hop = this.hopInfos[home]!
    for (let i = 0; i < this._neighborhood; i++) {
      if ((hop & (1 << i)) !== 0) {
        const idx = home + i
        const entry = this._slots[idx]
        if (entry != null && entry === value) {
          return idx
        }
      }
    }
    return -1
  }

  private tryInsert(value: T): boolean {
    const home = this.homeIndex(value)

    const existingIdx = this.findInNeighborhood(home, value)
    if (existingIdx >= 0) {
      this._slots[existingIdx] = value
      return true
    }

    const maxIdx = this._capacity + this._neighborhood - 1
    let emptyPos = -1
    for (let i = home; i < maxIdx; i++) {
      if (this._slots[i] == null) {
        emptyPos = i
        break
      }
    }

    if (emptyPos === -1) return false

    while (emptyPos - home >= this._neighborhood) {
      let displaced = false
      const start = Math.max(0, emptyPos - this._neighborhood + 1)
      for (let j = emptyPos - 1; j >= start; j--) {
        const entry = this._slots[j]
        if (entry == null) continue
        const homeJ = this.homeIndex(entry)
        if (emptyPos - homeJ < this._neighborhood) {
          const oldOffset = j - homeJ
          const newOffset = emptyPos - homeJ
          this.hopInfos[homeJ] = (this.hopInfos[homeJ]! & ~(1 << oldOffset)) | (1 << newOffset)
          this._slots[emptyPos] = entry
          this._slots[j] = null
          emptyPos = j
          displaced = true
          break
        }
      }
      if (!displaced) return false
    }

    this._slots[emptyPos] = value
    this.hopInfos[home] = this.hopInfos[home]! | (1 << (emptyPos - home))
    this._size++
    return true
  }

  add(value: T): void {
    if (this._size / this._capacity >= this._loadFactorThreshold) {
      this.rehash(this._capacity * 2)
    }

    let attempts = 0
    while (!this.tryInsert(value)) {
      this.rehash(this._capacity * 2)
      attempts++
      if (attempts > 10) break
    }
  }

  delete(value: T): boolean {
    const home = this.homeIndex(value)
    const idx = this.findInNeighborhood(home, value)
    if (idx < 0) return false
    const offset = idx - home
    this.hopInfos[home] = this.hopInfos[home]! & ~(1 << offset)
    this._slots[idx] = null
    this._size--
    return true
  }

  has(value: T): boolean {
    const home = this.homeIndex(value)
    return this.findInNeighborhood(home, value) >= 0
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._slots.fill(null)
    this.hopInfos.fill(0)
    this._size = 0
  }

  clone(): HopscotchSet<T> {
    const cloned = new HopscotchSet<T>({
      capacity: this._capacity,
      neighborhoodSize: this._neighborhood,
      loadFactorThreshold: this._loadFactorThreshold,
    })
    cloned._seed = this._seed
    cloned._size = this._size
    cloned._slots = this._slots.map(e => e)
    cloned.hopInfos = [...this.hopInfos]
    return cloned
  }

  toArray(): T[] {
    const result: T[] = []
    const len = this._capacity + this._neighborhood - 1
    for (let i = 0; i < len; i++) {
      const entry = this._slots[i]
      if (entry != null) result.push(entry)
    }
    return result
  }

  static from<T>(items: Iterable<T>, options?: HopscotchSetOptions): HopscotchSet<T> {
    const set = new HopscotchSet<T>(options)
    for (const item of items) {
      set.add(item)
    }
    return set
  }

  forEach(callback: (value: T) => void): void {
    const len = this._capacity + this._neighborhood - 1
    for (let i = 0; i < len; i++) {
      const entry = this._slots[i]
      if (entry != null) callback(entry)
    }
  }

  capacity(): number {
    return this._capacity
  }

  loadFactor(): number {
    return this._size / this._capacity
  }

  rehash(newCapacity?: number): void {
    const cap = Math.max(DEFAULT_CAPACITY, newCapacity ?? this._capacity)
    const oldValues: T[] = []
    const oldLen = this._capacity + this._neighborhood - 1
    for (let i = 0; i < oldLen; i++) {
      const entry = this._slots[i]
      if (entry != null) oldValues.push(entry)
    }

    let attemptCap = cap
    let success = false

    while (!success) {
      this._capacity = attemptCap
      this._seed = (this._seed * 0x9e3779b9 + 0x6a09e667) | 0
      this._slots = new Array<T | null>(attemptCap + this._neighborhood - 1).fill(null)
      this.hopInfos = new Array<number>(attemptCap).fill(0)
      this._size = 0

      success = true
      for (const value of oldValues) {
        if (!this.tryInsert(value)) {
          success = false
          break
        }
      }

      if (!success) {
        attemptCap *= 2
      }
    }
  }

  stats(): HopscotchSetStats {
    return {
      size: this._size,
      capacity: this._capacity,
      loadFactor: this._size / this._capacity,
      neighborhoodSize: this._neighborhood,
    }
  }
}

export type { HopscotchSetOptions, HopscotchSetStats } from './types.js'
