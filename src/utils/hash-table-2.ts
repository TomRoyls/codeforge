export class HashTable2<K, V> {
  private buckets: Array<Array<{ key: K; value: V }>>
  private _size = 0

  constructor(bucketCount = 16) {
    this.buckets = Array.from({ length: bucketCount }, () => [])
  }

  private hash(key: K): number {
    const str = String(key)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) % this.buckets.length
  }

  set(key: K, value: V): void {
    const idx = this.hash(key)
    const bucket = this.buckets[idx]
    const entry = bucket.find(e => e.key === key)
    if (entry) {
      entry.value = value
    } else {
      bucket.push({ key, value })
      this._size++
    }
  }

  get(key: K): V | undefined {
    const idx = this.hash(key)
    const entry = this.buckets[idx].find(e => e.key === key)
    return entry?.value
  }

  has(key: K): boolean { return this.get(key) !== undefined }

  delete(key: K): boolean {
    const idx = this.hash(key)
    const bucket = this.buckets[idx]
    const entryIdx = bucket.findIndex(e => e.key === key)
    if (entryIdx === -1) return false
    bucket.splice(entryIdx, 1)
    this._size--
    return true
  }

  keys(): K[] { return this.buckets.flat().map(e => e.key) }
  values(): V[] { return this.buckets.flat().map(e => e.value) }

  get size(): number { return this._size }
  get isEmpty(): boolean { return this._size === 0 }

  clear(): void {
    for (const b of this.buckets) b.length = 0
    this._size = 0
  }

  toArray(): Array<[K, V]> { return this.buckets.flat().map(e => [e.key, e.value]) }
  toString(): string { return JSON.stringify({ size: this._size, buckets: this.buckets.length }) }
  toJSON(): Record<string, number> { return { size: this._size, buckets: this.buckets.length } }

  clone(): HashTable2<K, V> {
    const c = new HashTable2<K, V>(this.buckets.length)
    for (const [k, v] of this.toArray()) c.set(k, v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HashTable2)) return false
    return this._size === other._size
  }
}
