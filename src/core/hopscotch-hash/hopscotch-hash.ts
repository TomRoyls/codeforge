import type { HopscotchEntry } from './types.js'

const NEIGHBORHOOD = 32
const DEFAULT_CAPACITY = 16
const LOAD_FACTOR_THRESHOLD = 0.75

export class HopscotchHashTable<K, V> {
  private _slots: (HopscotchEntry<K, V> | null)[]
  private hopInfos: number[]
  private _capacity: number
  private _size: number
  private _seed: number

  constructor(capacity?: number) {
    this._capacity = Math.max(DEFAULT_CAPACITY, capacity ?? DEFAULT_CAPACITY)
    this._seed = 0x9e3779b9
    this._slots = new Array<HopscotchEntry<K, V> | null>(this._capacity + NEIGHBORHOOD - 1).fill(null)
    this.hopInfos = new Array<number>(this._capacity).fill(0)
    this._size = 0
  }

  private hash(key: K): number {
    const str = String(key)
    let h = this._seed
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0
      h = Math.imul(h, 0x5bd1e995)
      h ^= h >>> 15
    }
    return Math.abs(h)
  }

  private homeIndex(key: K): number {
    return this.hash(key) % this._capacity
  }

  private findInNeighborhood(home: number, key: K): number {
    const hop = this.hopInfos[home]!
    for (let i = 0; i < NEIGHBORHOOD; i++) {
      if ((hop & (1 << i)) !== 0) {
        const idx = home + i
        const entry = this._slots[idx]
        if (entry && entry.key === key) {
          return idx
        }
      }
    }
    return -1
  }

  private tryInsert(key: K, value: V): boolean {
    const home = this.homeIndex(key)

    const existingIdx = this.findInNeighborhood(home, key)
    if (existingIdx >= 0) {
      this._slots[existingIdx] = { key, value }
      return true
    }

    const maxIdx = this._capacity + NEIGHBORHOOD - 1
    let emptyPos = -1
    for (let i = home; i < maxIdx; i++) {
      if (!this._slots[i]) {
        emptyPos = i
        break
      }
    }

    if (emptyPos === -1) return false

    while (emptyPos - home >= NEIGHBORHOOD) {
      let displaced = false
      const start = Math.max(0, emptyPos - NEIGHBORHOOD + 1)
      for (let j = emptyPos - 1; j >= start; j--) {
        const entry = this._slots[j]
        if (!entry) continue
        const homeJ = this.homeIndex(entry.key)
        if (emptyPos - homeJ < NEIGHBORHOOD) {
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

    this._slots[emptyPos] = { key, value }
    this.hopInfos[home] = this.hopInfos[home]! | (1 << (emptyPos - home))
    this._size++
    return true
  }

  set(key: K, value: V): void {
    if (this._size / this._capacity >= LOAD_FACTOR_THRESHOLD) {
      this.rehash(this._capacity * 2)
    }

    let attempts = 0
    while (!this.tryInsert(key, value)) {
      this.rehash(this._capacity * 2)
      attempts++
      if (attempts > 10) break
    }
  }

  get(key: K): V | undefined {
    const home = this.homeIndex(key)
    const idx = this.findInNeighborhood(home, key)
    if (idx >= 0) return this._slots[idx]!.value
    return undefined
  }

  has(key: K): boolean {
    const home = this.homeIndex(key)
    return this.findInNeighborhood(home, key) >= 0
  }

  delete(key: K): boolean {
    const home = this.homeIndex(key)
    const idx = this.findInNeighborhood(home, key)
    if (idx < 0) return false
    const offset = idx - home
    this.hopInfos[home] = this.hopInfos[home]! & ~(1 << offset)
    this._slots[idx] = null
    this._size--
    return true
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

  capacity(): number {
    return this._capacity
  }

  loadFactor(): number {
    return this._size / this._capacity
  }

  keys(): K[] {
    const result: K[] = []
    const len = this._capacity + NEIGHBORHOOD - 1
    for (let i = 0; i < len; i++) {
      const entry = this._slots[i]
      if (entry) result.push(entry.key)
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    const len = this._capacity + NEIGHBORHOOD - 1
    for (let i = 0; i < len; i++) {
      const entry = this._slots[i]
      if (entry) result.push(entry.value)
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    const len = this._capacity + NEIGHBORHOOD - 1
    for (let i = 0; i < len; i++) {
      const entry = this._slots[i]
      if (entry) result.push([entry.key, entry.value])
    }
    return result
  }

  forEach(fn: (key: K, value: V) => void): void {
    const len = this._capacity + NEIGHBORHOOD - 1
    for (let i = 0; i < len; i++) {
      const entry = this._slots[i]
      if (entry) fn(entry.key, entry.value)
    }
  }

  rehash(newCapacity?: number): void {
    const cap = Math.max(DEFAULT_CAPACITY, newCapacity ?? this._capacity)
    const oldEntries: Array<[K, V]> = []
    const oldLen = this._capacity + NEIGHBORHOOD - 1
    for (let i = 0; i < oldLen; i++) {
      const entry = this._slots[i]
      if (entry) oldEntries.push([entry.key, entry.value])
    }

    let attemptCap = cap
    let success = false

    while (!success) {
      this._capacity = attemptCap
      this._seed = (this._seed * 0x9e3779b9 + 0x6a09e667) | 0
      this._slots = new Array<HopscotchEntry<K, V> | null>(attemptCap + NEIGHBORHOOD - 1).fill(null)
      this.hopInfos = new Array<number>(attemptCap).fill(0)
      this._size = 0

      success = true
      for (const [key, value] of oldEntries) {
        if (!this.tryInsert(key, value)) {
          success = false
          break
        }
      }

      if (!success) {
        attemptCap *= 2
      }
    }
  }

  clone(): HopscotchHashTable<K, V> {
    const cloned = new HopscotchHashTable<K, V>(this._capacity)
    cloned._seed = this._seed
    cloned._size = this._size
    cloned._slots = this._slots.map(e => e ? { key: e.key, value: e.value } : null)
    cloned.hopInfos = [...this.hopInfos]
    return cloned
  }

  toString(): string {
    const pairs = this.entries()
      .map(([k, v]) => `${String(k)}:${String(v)}`)
      .join(', ')
    return `HopscotchHashTable{${pairs}}`
  }

  containsValue(value: V, comparator?: (a: V, b: V) => boolean): boolean {
    const len = this._capacity + NEIGHBORHOOD - 1
    for (let i = 0; i < len; i++) {
      const entry = this._slots[i]
      if (entry) {
        if (comparator ? comparator(entry.value, value) : entry.value === value) {
          return true
        }
      }
    }
    return false
  }
}
