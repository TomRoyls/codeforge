export class SortedLookup<V> {
  private entries: Array<{ key: number; value: V }> = []

  insert(key: number, value: V): void {
    let lo = 0, hi = this.entries.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.entries[mid]!.key < key) lo = mid + 1
      else hi = mid
    }
    this.entries.splice(lo, 0, { key, value })
  }

  get(key: number): V | undefined {
    const idx = this.binarySearch(key)
    if (idx >= 0) return this.entries[idx]!.value
    return undefined
  }

  has(key: number): boolean {
    return this.binarySearch(key) >= 0
  }

  delete(key: number): boolean {
    const idx = this.binarySearch(key)
    if (idx < 0) return false
    this.entries.splice(idx, 1)
    return true
  }

  floor(key: number): V | undefined {
    let lo = 0, hi = this.entries.length - 1
    let result: V | undefined
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (this.entries[mid]!.key <= key) {
        result = this.entries[mid]!.value
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return result
  }

  ceiling(key: number): V | undefined {
    let lo = 0, hi = this.entries.length - 1
    let result: V | undefined
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (this.entries[mid]!.key >= key) {
        result = this.entries[mid]!.value
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return result
  }

  get size(): number {
    return this.entries.length
  }

  get isEmpty(): boolean {
    return this.entries.length === 0
  }

  get min(): number | undefined {
    return this.entries.length > 0 ? this.entries[0]!.key : undefined
  }

  get max(): number | undefined {
    return this.entries.length > 0 ? this.entries[this.entries.length - 1]!.key : undefined
  }

  private binarySearch(key: number): number {
    let lo = 0, hi = this.entries.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (this.entries[mid]!.key === key) return mid
      if (this.entries[mid]!.key < key) lo = mid + 1
      else hi = mid - 1
    }
    return -1
  }

  clear(): void {
    this.entries = []
  }

  toArray(): Array<[number, V]> {
    return this.entries.map((e) => [e.key, e.value])
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): Array<[number, V]> {
    return this.toArray()
  }

  clone(): SortedLookup<V> {
    const copy = new SortedLookup<V>()
    copy.entries = this.entries.map((e) => ({ ...e }))
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SortedLookup)) return false
    if (this.size !== other.size) return false
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i]!.key !== other.entries[i]!.key) return false
    }
    return true
  }
}
