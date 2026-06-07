export class CuckooHashTable<K, V> {
  private table1: Array<{ key: K; value: V } | undefined>
  private table2: Array<{ key: K; value: V } | undefined>
  private _size = 0
  private readonly capacity: number
  private static readonly MAX_KICKS = 100

  constructor(capacity: number = 16) {
    this.capacity = capacity
    this.table1 = new Array(capacity)
    this.table2 = new Array(capacity)
  }

  private hash1(key: K): number {
    const str = String(key)
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) | 0
    }
    return ((h % this.capacity) + this.capacity) % this.capacity
  }

  private hash2(key: K): number {
    const str = String(key)
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = (h * 37 + str.charCodeAt(i)) | 0
    }
    return ((h % this.capacity) + this.capacity) % this.capacity
  }

  set(key: K, value: V): boolean {
    const idx1 = this.hash1(key)
    const idx2 = this.hash2(key)

    if (this.table1[idx1]?.key === key) {
      this.table1[idx1] = { key, value }
      return true
    }
    if (this.table2[idx2]?.key === key) {
      this.table2[idx2] = { key, value }
      return true
    }

    if (this.table1[idx1] === undefined) {
      this.table1[idx1] = { key, value }
      this._size++
      return true
    }
    if (this.table2[idx2] === undefined) {
      this.table2[idx2] = { key, value }
      this._size++
      return true
    }

    let current = { key, value }
    let table = this.table1 as Array<{ key: K; value: V } | undefined>
    let idx = idx1
    const swapLog: Array<{ table: typeof this.table1, idx: number, prev: { key: K; value: V } | undefined }> = []

    for (let i = 0; i < CuckooHashTable.MAX_KICKS; i++) {
      const evicted = table[idx]
      table[idx] = current
      swapLog.push({ table, idx, prev: evicted })
      if (evicted === undefined) {
        this._size++
        return true
      }
      current = evicted
      table = table === this.table1 ? this.table2 : this.table1
      idx = table === this.table1 ? this.hash1(current.key) : this.hash2(current.key)
    }

    for (let i = swapLog.length - 1; i >= 0; i--) {
      const s = swapLog[i]!
      s.table[s.idx] = s.prev
    }
    return false
  }

  get(key: K): V | undefined {
    const idx1 = this.hash1(key)
    if (this.table1[idx1]?.key === key) return this.table1[idx1]!.value
    const idx2 = this.hash2(key)
    if (this.table2[idx2]?.key === key) return this.table2[idx2]!.value
    return undefined
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    const idx1 = this.hash1(key)
    if (this.table1[idx1]?.key === key) {
      this.table1[idx1] = undefined
      this._size--
      return true
    }
    const idx2 = this.hash2(key)
    if (this.table2[idx2]?.key === key) {
      this.table2[idx2] = undefined
      this._size--
      return true
    }
    return false
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }
}
