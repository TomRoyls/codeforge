import type { RobinHoodEntry } from './types.js'

const DEFAULT_CAPACITY = 16
const LOAD_FACTOR_THRESHOLD = 0.75

export class RobinHoodHashTable<K, V> {
  private _slots: (RobinHoodEntry<K, V> | null)[]
  private _capacity: number
  private _size: number
  private _seed: number

  constructor(capacity?: number) {
    this._capacity = Math.max(DEFAULT_CAPACITY, capacity ?? DEFAULT_CAPACITY)
    this._seed = 0x9e3779b9
    this._slots = new Array<RobinHoodEntry<K, V> | null>(this._capacity).fill(null)
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

  private idealIndex(key: K): number {
    return this.hash(key) % this._capacity
  }

  private insertDirect(key: K, value: V): void {
    let idx = this.idealIndex(key)
    let probeDistance = 0
    let currentKey = key
    let currentValue = value

    for (let guard = 0; guard < this._capacity; guard++) {
      const entry = this._slots[idx]

      if (!entry) {
        this._slots[idx] = { key: currentKey, value: currentValue, probeDistance }
        this._size++
        return
      }

      if (entry.probeDistance < probeDistance) {
        const dk = entry.key
        const dv = entry.value
        const dp = entry.probeDistance

        entry.key = currentKey
        entry.value = currentValue
        entry.probeDistance = probeDistance

        currentKey = dk
        currentValue = dv
        probeDistance = dp
      }

      idx = (idx + 1) % this._capacity
      probeDistance++
    }
  }

  set(key: K, value: V): void {
    const existingIdx = this.findIndex(key)
    if (existingIdx >= 0) {
      this._slots[existingIdx]!.value = value
      return
    }

    if (this._size / this._capacity >= LOAD_FACTOR_THRESHOLD) {
      this.rehash(this._capacity * 2)
    }

    this.insertDirect(key, value)
  }

  private findIndex(key: K): number {
    const start = this.idealIndex(key)
    let idx = start
    let probeDistance = 0

    for (let guard = 0; guard < this._capacity; guard++) {
      const entry = this._slots[idx]

      if (!entry) return -1
      if (entry.key === key) return idx
      if (entry.probeDistance < probeDistance) return -1

      idx = (idx + 1) % this._capacity
      probeDistance++
    }

    return -1
  }

  get(key: K): V | undefined {
    const idx = this.findIndex(key)
    if (idx < 0) return undefined
    return this._slots[idx]!.value
  }

  has(key: K): boolean {
    return this.findIndex(key) >= 0
  }

  delete(key: K): boolean {
    const idx = this.findIndex(key)
    if (idx < 0) return false

    let current = idx
    for (let guard = 0; guard < this._capacity; guard++) {
      const next = (current + 1) % this._capacity
      const nextEntry = this._slots[next]

      if (!nextEntry || nextEntry.probeDistance === 0) {
        this._slots[current] = null
        break
      }

      nextEntry.probeDistance--
      this._slots[current] = nextEntry
      this._slots[next] = null
      current = next
    }

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
    for (let i = 0; i < this._capacity; i++) {
      const entry = this._slots[i]
      if (entry) result.push(entry.key)
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this._capacity; i++) {
      const entry = this._slots[i]
      if (entry) result.push(entry.value)
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (let i = 0; i < this._capacity; i++) {
      const entry = this._slots[i]
      if (entry) result.push([entry.key, entry.value])
    }
    return result
  }

  forEach(fn: (key: K, value: V) => void): void {
    for (let i = 0; i < this._capacity; i++) {
      const entry = this._slots[i]
      if (entry) fn(entry.key, entry.value)
    }
  }

  rehash(newCapacity?: number): void {
    const cap = Math.max(DEFAULT_CAPACITY, newCapacity ?? this._capacity)
    const oldEntries = this.entries()

    this._capacity = cap
    this._seed = (this._seed * 0x9e3779b9 + 0x6a09e667) | 0
    this._slots = new Array<RobinHoodEntry<K, V> | null>(cap).fill(null)
    this._size = 0

    for (const [key, value] of oldEntries) {
      this.insertDirect(key, value)
    }
  }

  clone(): RobinHoodHashTable<K, V> {
    const cloned = new RobinHoodHashTable<K, V>(this._capacity)
    cloned._seed = this._seed
    cloned._size = this._size
    cloned._slots = this._slots.map(e =>
      e ? { key: e.key, value: e.value, probeDistance: e.probeDistance } : null,
    )
    return cloned
  }

  toString(): string {
    const pairs = this.entries()
      .map(([k, v]) => `${String(k)}:${String(v)}`)
      .join(', ')
    return `RobinHoodHashTable{${pairs}}`
  }

  maxProbeLength(): number {
    let max = 0
    for (let i = 0; i < this._capacity; i++) {
      const entry = this._slots[i]
      if (entry && entry.probeDistance > max) {
        max = entry.probeDistance
      }
    }
    return max
  }

  averageProbeLength(): number {
    if (this._size === 0) return 0
    let total = 0
    for (let i = 0; i < this._capacity; i++) {
      const entry = this._slots[i]
      if (entry) total += entry.probeDistance
    }
    return total / this._size
  }
}
