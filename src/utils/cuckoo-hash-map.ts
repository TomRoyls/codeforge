export interface CuckooHashMapOptions {
  capacity?: number
  maxKicks?: number
}

interface Entry<K, V> {
  key: K
  value: V
  hash1: number
  hash2: number
}

const EMPTY: unique symbol = Symbol('EMPTY')

export class CuckooHashMap<K, V> {
  private table1: Array<Entry<K, V> | typeof EMPTY>
  private table2: Array<Entry<K, V> | typeof EMPTY>
  private _size = 0
  private _capacity: number
  private readonly maxKicks: number

  constructor(options?: CuckooHashMapOptions) {
    this._capacity = options?.capacity ?? 64
    this.maxKicks = options?.maxKicks ?? 500
    this.table1 = new Array(this._capacity).fill(EMPTY)
    this.table2 = new Array(this._capacity).fill(EMPTY)
  }

  get(key: K): V | undefined {
    const h1 = this.hash1(key)
    const h2 = this.hash2(key)
    const i1 = h1 % this._capacity
    const i2 = h2 % this._capacity
    const e1 = this.table1[i1]!
    if (e1 !== EMPTY && e1.key === key) return e1.value
    const e2 = this.table2[i2]!
    if (e2 !== EMPTY && e2.key === key) return e2.value
    return undefined
  }

  set(key: K, value: V): void {
    const h1 = this.hash1(key)
    const h2 = this.hash2(key)

    const existing = this.findEntry(key, h1, h2)
    if (existing) {
      existing.value = value
      return
    }

    if (this._size >= this._capacity * 0.9) {
      this.resize()
    }

    const entry: Entry<K, V> = { key, value, hash1: h1, hash2: h2 }
    let current: Entry<K, V> = entry
    let useTable1 = true

    for (let kick = 0; kick < this.maxKicks; kick++) {
      if (useTable1) {
        const idx = current.hash1 % this._capacity
        const occupant = this.table1[idx]!
        this.table1[idx] = current
        if (occupant === EMPTY) {
          this._size++
          return
        }
        current = occupant
      } else {
        const idx = current.hash2 % this._capacity
        const occupant = this.table2[idx]!
        this.table2[idx] = current
        if (occupant === EMPTY) {
          this._size++
          return
        }
        current = occupant
      }
      useTable1 = !useTable1
    }

    this.resize()
    this.set(current.key, current.value)
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    const h1 = this.hash1(key)
    const h2 = this.hash2(key)
    const i1 = h1 % this._capacity
    const i2 = h2 % this._capacity
    const e1 = this.table1[i1]!
    if (e1 !== EMPTY && e1.key === key) {
      this.table1[i1] = EMPTY
      this._size--
      return true
    }
    const e2 = this.table2[i2]!
    if (e2 !== EMPTY && e2.key === key) {
      this.table2[i2] = EMPTY
      this._size--
      return true
    }
    return false
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get loadFactor(): number {
    return this._size / (this._capacity * 2)
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const entry of this.table1) {
      if (entry !== EMPTY) callback(entry.value, entry.key)
    }
    for (const entry of this.table2) {
      if (entry !== EMPTY) callback(entry.value, entry.key)
    }
  }

  keys(): K[] {
    const result: K[] = []
    this.forEach((_, key) => result.push(key))
    return result
  }

  values(): V[] {
    const result: V[] = []
    this.forEach((value) => result.push(value))
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    this.forEach((value, key) => result.push([key, value]))
    return result
  }

  clear(): void {
    this.table1.fill(EMPTY)
    this.table2.fill(EMPTY)
    this._size = 0
  }

  private findEntry(key: K, h1: number, h2: number): Entry<K, V> | null {
    const i1 = h1 % this._capacity
    const e1 = this.table1[i1]!
    if (e1 !== EMPTY && e1.key === key) return e1
    const i2 = h2 % this._capacity
    const e2 = this.table2[i2]!
    if (e2 !== EMPTY && e2.key === key) return e2
    return null
  }

  private resize(): void {
    const old1 = this.table1
    const old2 = this.table2
    this._capacity *= 2
    this.table1 = new Array(this._capacity).fill(EMPTY)
    this.table2 = new Array(this._capacity).fill(EMPTY)
    this._size = 0
    for (const entry of old1) {
      if (entry !== EMPTY) this.set(entry.key, entry.value)
    }
    for (const entry of old2) {
      if (entry !== EMPTY) this.set(entry.key, entry.value)
    }
  }

  private hash1(key: K): number {
    const str = String(key)
    let h = 5381
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) | 0
    }
    return Math.abs(h)
  }

  private hash2(key: K): number {
    const str = String(key)
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = ((h << 7) ^ (h >>> 3) ^ str.charCodeAt(i)) | 0
    }
    return Math.abs(h)
  }
}
