type Entry<K, V> = { key: K; value: V; deleted: boolean }

export class HashMapOpen<K, V> {
  private table: (Entry<K, V> | null)[]
  private _size: number = 0
  private readonly loadFactor: number
  private capacity: number

  constructor(initialCapacity: number = 16, loadFactor: number = 0.75) {
    this.capacity = initialCapacity
    this.loadFactor = loadFactor
    this.table = new Array<Entry<K, V> | null>(initialCapacity).fill(null)
  }

  private hash(key: K): number {
    const str = String(key)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
  }

  private resize(): void {
    const oldTable = this.table
    const oldCap = this.capacity
    const newCap = oldCap * 2
    this.capacity = newCap
    this.table = new Array<Entry<K, V> | null>(newCap).fill(null)
    this._size = 0
    for (const entry of oldTable) {
      if (entry !== null && !entry.deleted) {
        this.set(entry.key, entry.value)
      }
    }
  }

  get size(): number {
    return this._size
  }

  set(key: K, value: V): void {
    if (this._size / this.capacity >= this.loadFactor) this.resize()
    let idx = this.hash(key) % this.capacity
    let i = 0
    let firstDeleted = -1
    while (this.table[idx] !== null) {
      if (this.table[idx]!.deleted && firstDeleted === -1) firstDeleted = idx
      if (!this.table[idx]!.deleted && this.table[idx]!.key === key) {
        this.table[idx]!.value = value
        return
      }
      i++
      idx = (idx + i) % this.capacity
    }
    const targetIdx = firstDeleted !== -1 ? firstDeleted : idx
    this.table[targetIdx] = { key, value, deleted: false }
    this._size++
  }

  get(key: K): V | undefined {
    let idx = this.hash(key) % this.capacity
    let i = 0
    while (this.table[idx] !== null) {
      if (!this.table[idx]!.deleted && this.table[idx]!.key === key) {
        return this.table[idx]!.value
      }
      i++
      idx = (idx + i) % this.capacity
    }
    return undefined
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    let idx = this.hash(key) % this.capacity
    let i = 0
    while (this.table[idx] !== null) {
      if (!this.table[idx]!.deleted && this.table[idx]!.key === key) {
        this.table[idx]!.deleted = true
        this._size--
        return true
      }
      i++
      idx = (idx + i) % this.capacity
    }
    return false
  }

  keys(): K[] {
    const result: K[] = []
    for (const entry of this.table) {
      if (entry !== null && !entry.deleted) result.push(entry.key)
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (const entry of this.table) {
      if (entry !== null && !entry.deleted) result.push(entry.value)
    }
    return result
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    for (const entry of this.table) {
      if (entry !== null && !entry.deleted) result.push([entry.key, entry.value])
    }
    return result
  }

  clear(): void {
    this.table = new Array<Entry<K, V> | null>(this.capacity).fill(null)
    this._size = 0
  }
}
