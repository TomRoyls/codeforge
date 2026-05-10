import type { DoubleHashEntry, DoubleHashOptions, DoubleHashStats } from './types.js'
import { TOMBSTONE } from './types.js'

const DEFAULT_CAPACITY = 16
const DEFAULT_LOAD_FACTOR = 0.7

type Slot<K, V> = DoubleHashEntry<K, V> | typeof TOMBSTONE | null

export class DoubleHashTable<K, V> {
  private _slots: Slot<K, V>[]
  private _capacity: number
  private _size: number
  private _tombstoneCount: number
  private _loadFactorThreshold: number
  private _seed: number

  constructor(options?: DoubleHashOptions) {
    const cap = options?.capacity ?? DEFAULT_CAPACITY
    this._capacity = Math.max(DEFAULT_CAPACITY, cap)
    this._loadFactorThreshold = options?.loadFactorThreshold ?? DEFAULT_LOAD_FACTOR
    this._seed = 0x9e3779b9
    this._slots = new Array<Slot<K, V>>(this._capacity).fill(null)
    this._size = 0
    this._tombstoneCount = 0
  }

  private hash1(key: K): number {
    const str = String(key)
    let h = this._seed
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0
      h = Math.imul(h, 0x5bd1e995)
      h ^= h >>> 15
    }
    return Math.abs(h)
  }

  private hash2(key: K): number {
    const str = String(key)
    let h = 0x6a09e667
    for (let i = 0; i < str.length; i++) {
      h = ((h << 7) - h + str.charCodeAt(i)) | 0
      h = Math.imul(h, 0x1b873593)
      h ^= h >>> 13
    }
    const raw = Math.abs(h)
    return 1 + (raw % (this._capacity - 1))
  }

  private probeIndex(key: K, i: number): number {
    return (this.hash1(key) % this._capacity + i * this.hash2(key)) % this._capacity
  }

  private findIndex(key: K): number {
    for (let i = 0; i < this._capacity; i++) {
      const idx = this.probeIndex(key, i)
      const slot = this._slots[idx]
      if (slot === null) return -1
      if (slot !== TOMBSTONE && (slot as DoubleHashEntry<K, V>).key === key) {
        return idx
      }
    }
    return -1
  }

  set(key: K, value: V): void {
    const existingIdx = this.findIndex(key)
    if (existingIdx >= 0) {
      (this._slots[existingIdx] as DoubleHashEntry<K, V>).value = value
      return
    }

    if ((this._size + this._tombstoneCount) / this._capacity >= this._loadFactorThreshold) {
      this.rehash(this._capacity * 2)
    }

    for (let i = 0; i < this._capacity; i++) {
      const idx = this.probeIndex(key, i)
      const slot = this._slots[idx]
      if (slot === null || slot === TOMBSTONE) {
        if (slot === TOMBSTONE) {
          this._tombstoneCount--
        }
        this._slots[idx] = { key, value }
        this._size++
        return
      }
    }

    this.rehash(this._capacity * 2)
    this.set(key, value)
  }

  get(key: K): V | undefined {
    const idx = this.findIndex(key)
    if (idx < 0) return undefined
    return (this._slots[idx] as DoubleHashEntry<K, V>).value
  }

  has(key: K): boolean {
    return this.findIndex(key) >= 0
  }

  delete(key: K): boolean {
    const idx = this.findIndex(key)
    if (idx < 0) return false
    this._slots[idx] = TOMBSTONE
    this._size--
    this._tombstoneCount++
    return true
  }

  size(): number {
    return this._size
  }

  capacity(): number {
    return this._capacity
  }

  loadFactor(): number {
    return this._size / this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._slots.fill(null)
    this._size = 0
    this._tombstoneCount = 0
  }

  clone(): DoubleHashTable<K, V> {
    const cloned = new DoubleHashTable<K, V>({
      capacity: this._capacity,
      loadFactorThreshold: this._loadFactorThreshold,
    })
    cloned._seed = this._seed
    cloned._size = this._size
    cloned._tombstoneCount = this._tombstoneCount
    cloned._slots = this._slots.map(s => {
      if (s === TOMBSTONE) return TOMBSTONE
      if (s === null) return null
      return { key: (s as DoubleHashEntry<K, V>).key, value: (s as DoubleHashEntry<K, V>).value }
    })
    return cloned
  }

  toArray(): Array<[K, V]> {
    return this.entries()
  }

  keys(): K[] {
    const result: K[] = []
    for (let i = 0; i < this._capacity; i++) {
      const slot = this._slots[i]
      if (slot !== null && slot !== TOMBSTONE) {
        result.push((slot as DoubleHashEntry<K, V>).key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this._capacity; i++) {
      const slot = this._slots[i]
      if (slot !== null && slot !== TOMBSTONE) {
        result.push((slot as DoubleHashEntry<K, V>).value)
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (let i = 0; i < this._capacity; i++) {
      const slot = this._slots[i]
      if (slot !== null && slot !== TOMBSTONE) {
        const entry = slot as DoubleHashEntry<K, V>
        result.push([entry.key, entry.value])
      }
    }
    return result
  }

  forEach(fn: (key: K, value: V) => void): void {
    for (let i = 0; i < this._capacity; i++) {
      const slot = this._slots[i]
      if (slot !== null && slot !== TOMBSTONE) {
        const entry = slot as DoubleHashEntry<K, V>
        fn(entry.key, entry.value)
      }
    }
  }

  static from<K, V>(entries: Array<[K, V]>, options?: DoubleHashOptions): DoubleHashTable<K, V> {
    const ht = new DoubleHashTable<K, V>(options)
    for (const [key, value] of entries) {
      ht.set(key, value)
    }
    return ht
  }

  rehash(newCapacity?: number): void {
    const cap = Math.max(DEFAULT_CAPACITY, newCapacity ?? this._capacity)
    const oldEntries = this.entries()

    this._capacity = cap
    this._seed = (this._seed * 0x9e3779b9 + 0x6a09e667) | 0
    this._slots = new Array<Slot<K, V>>(cap).fill(null)
    this._size = 0
    this._tombstoneCount = 0

    for (const [key, value] of oldEntries) {
      this.set(key, value)
    }
  }

  stats(): DoubleHashStats {
    let maxProbe = 0
    let totalProbe = 0

    for (let i = 0; i < this._capacity; i++) {
      const slot = this._slots[i]
      if (slot !== null && slot !== TOMBSTONE) {
        const entry = slot as DoubleHashEntry<K, V>
        let probeLen = 0
        for (let j = 0; j < this._capacity; j++) {
          const idx = this.probeIndex(entry.key, j)
          if (idx === i) {
            probeLen = j
            break
          }
        }
        if (probeLen > maxProbe) maxProbe = probeLen
        totalProbe += probeLen
      }
    }

    return {
      size: this._size,
      capacity: this._capacity,
      loadFactor: this.loadFactor(),
      tombstoneCount: this._tombstoneCount,
      maxProbeLength: maxProbe,
      averageProbeLength: this._size === 0 ? 0 : totalProbe / this._size,
    }
  }

  toString(): string {
    const pairs = this.entries()
      .map(([k, v]) => `${String(k)}:${String(v)}`)
      .join(', ')
    return `DoubleHashTable{${pairs}}`
  }
}

export type { DoubleHashEntry, DoubleHashOptions, DoubleHashStats }
export { TOMBSTONE as TOMBSTONE }
