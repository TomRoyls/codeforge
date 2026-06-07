export class HopscotchHashTable<K, V> {
  private _entries: Array<{ key: K; value: V; hopInfo: number } | null>
  private readonly segmentSize: number
  private _size: number = 0
  private readonly maxLoadFactor: number
  private threshold: number

  constructor(options?: { capacity?: number; maxHop?: number }) {
    this.segmentSize = options?.maxHop ?? 32
    const capacity = options?.capacity ?? 16
    this.maxLoadFactor = 0.75
    this._entries = new Array(capacity).fill(null)
    this.threshold = Math.floor(capacity * this.maxLoadFactor)
  }

  static fromEntries<K, V>(entries: Array<[K, V]>): HopscotchHashTable<K, V> {
    const table = new HopscotchHashTable<K, V>({ capacity: Math.max(16, entries.length * 2) })
    for (const [key, value] of entries) {
      table.set(key, value)
    }
    return table
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  loadFactor(): number {
    return this._size / this._entries.length
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const entry of this._entries) {
      if (entry !== null) callback(entry.value, entry.key)
    }
  }

  set(key: K, value: V): void {
    if (this._size >= this.threshold) {
      this.resize()
    }
    const hash = this.hash(key)
    let idx = hash % this._entries.length
    const idealIdx = idx

    for (let i = 0; i < this.segmentSize; i++) {
      const probeIdx = (idx + i) % this._entries.length
      const entry = this._entries[probeIdx] ?? null
      if (entry === null) {
        this._entries[probeIdx] = { key, value, hopInfo: 0 }
        this._size++
        this.setHopBit(idealIdx, i)
        return
      }
      if (entry.key === key) {
        entry.value = value
        return
      }
    }

    const displaced = this.displace(idx)
    if (displaced !== -1) {
      this._entries[displaced] = { key, value, hopInfo: 0 }
      this._size++
      return
    }

    this.resize()
    this.set(key, value)
  }

  get(key: K): V | undefined {
    const idx = this.findIndex(key)
    if (idx !== -1) return this._entries[idx]!.value
    return undefined
  }

  has(key: K): boolean {
    return this.findIndex(key) !== -1
  }

  delete(key: K): boolean {
    const idx = this.findIndex(key)
    if (idx === -1) return false
    this._entries[idx] = null
    this._size--
    return true
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._entries.length
  }

  clear(): void {
    this._entries.fill(null)
    this._size = 0
  }

  keys(): K[] {
    const result: K[] = []
    for (const entry of this._entries) {
      if (entry !== null) result.push(entry.key)
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (const entry of this._entries) {
      if (entry !== null) result.push(entry.value)
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (const entry of this._entries) {
      if (entry !== null) result.push([entry.key, entry.value])
    }
    return result
  }

  private findIndex(key: K): number {
    const hash = this.hash(key)
    const idx = hash % this._entries.length
    const hopInfo = this._entries[idx]?.hopInfo ?? 0
    for (let i = 0; i < this.segmentSize; i++) {
      if (hopInfo & (1 << i)) {
        const probeIdx = (idx + i) % this._entries.length
        const entry = this._entries[probeIdx]
        if (entry?.key === key) return probeIdx
      }
    }
    return -1
  }

  private setHopBit(bucketIdx: number, offset: number): void {
    const entry = this._entries[bucketIdx]
    if (entry) entry.hopInfo |= (1 << offset)
  }

  private displace(startIdx: number): number {
    for (let dist = this.segmentSize; dist < this._entries.length; dist++) {
      const candidateIdx = (startIdx + dist) % this._entries.length
      if (this._entries[candidateIdx] === null) {
        let currentIdx = candidateIdx
        let currentDist = dist
        while (currentDist >= this.segmentSize) {
          const prevIdx = (currentIdx - this.segmentSize + 1 + this._entries.length) % this._entries.length
          let found = false
          for (let j = 0; j < this.segmentSize - 1; j++) {
            const sourceIdx = (prevIdx + j) % this._entries.length
            if (this._entries[sourceIdx] !== null) {
              const targetDist = (currentIdx - sourceIdx + this._entries.length) % this._entries.length
              if (targetDist < this.segmentSize) {
                this._entries[currentIdx] = this._entries[sourceIdx] ?? null
                this._entries[sourceIdx] = null
                currentIdx = sourceIdx
                currentDist = (currentIdx - startIdx + this._entries.length) % this._entries.length
                found = true
                break
              }
            }
          }
          if (!found) return -1
        }
        return currentIdx
      }
    }
    return -1
  }

  private resize(): void {
    const oldEntries = this._entries
    this._entries = new Array(oldEntries.length * 2).fill(null)
    this._size = 0
    this.threshold = Math.floor(this._entries.length * this.maxLoadFactor)
    for (const entry of oldEntries) {
      if (entry !== null) {
        this.set(entry.key, entry.value)
      }
    }
  }

  private hash(key: K): number {
    const str = String(key)
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0
    }
    return h >>> 0
  }

  toString(): string {
    return `HopscotchHashTable(${this._size})`
  }

  toJSON(): unknown {
    return this.entries()
  }

  clone(): HopscotchHashTable<K, V> {
    const copy = new HopscotchHashTable<K, V>({ capacity: this._entries.length, maxHop: this.segmentSize })
    for (const [k, v] of this.entries()) {
      copy.set(k, v)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HopscotchHashTable)) return false
    if (this._size !== other._size) return false
    for (const entry of this._entries) {
      if (entry !== null) {
        const v = other.get(entry.key)
        if (v !== entry.value) return false
      }
    }
    return true
  }
}
