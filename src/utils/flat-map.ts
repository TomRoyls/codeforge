export class FlatMap<K, V> {
  private _keys: K[]
  private _values: V[]
  private readonly compare: (a: K, b: K) => number

  constructor(options?: { comparator?: (a: K, b: K) => number }) {
    this._keys = []
    this._values = []
    this.compare = options?.comparator ?? ((a: K, b: K) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
  }

  static from<K, V>(entries: Iterable<[K, V]>, comparator?: (a: K, b: K) => number): FlatMap<K, V> {
    const map = new FlatMap<K, V>({ comparator })
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  get(key: K): V | undefined {
    const idx = this.binarySearch(key)
    if (idx >= 0) return this._values[idx]!
    return undefined
  }

  has(key: K): boolean {
    return this.binarySearch(key) >= 0
  }

  set(key: K, value: V): void {
    const idx = this.binarySearch(key)
    if (idx >= 0) {
      this._values[idx] = value
      return
    }
    const pos = ~idx
    this._keys.splice(pos, 0, key)
    this._values.splice(pos, 0, value)
  }

  delete(key: K): boolean {
    const idx = this.binarySearch(key)
    if (idx < 0) return false
    this._keys.splice(idx, 1)
    this._values.splice(idx, 1)
    return true
  }

  get size(): number {
    return this._keys.length
  }

  get isEmpty(): boolean {
    return this._keys.length === 0
  }

  get min(): K | undefined {
    return this._keys[0]
  }

  get max(): K | undefined {
    return this._keys[this._keys.length - 1]
  }

  atIndex(index: number): [K, V] | undefined {
    if (index < 0 || index >= this._keys.length) return undefined
    return [this._keys[index]!, this._values[index]!]
  }

  range(start: K, end: K): Array<[K, V]> {
    const result: Array<[K, V]> = []
    let lo = this.lowerBound(start)
    while (lo < this._keys.length && this.compare(this._keys[lo]!, end) < 0) {
      result.push([this._keys[lo]!, this._values[lo]!])
      lo++
    }
    return result
  }

  rangeInclusive(start: K, end: K): Array<[K, V]> {
    const result: Array<[K, V]> = []
    let lo = this.lowerBound(start)
    while (lo < this._keys.length && this.compare(this._keys[lo]!, end) <= 0) {
      result.push([this._keys[lo]!, this._values[lo]!])
      lo++
    }
    return result
  }

  forEach(callback: (value: V, key: K, index: number) => void): void {
    for (let i = 0; i < this._keys.length; i++) {
      callback(this._values[i]!, this._keys[i]!, i)
    }
  }

  keys(): K[] {
    return [...this._keys]
  }

  values(): V[] {
    return [...this._values]
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (let i = 0; i < this._keys.length; i++) {
      result.push([this._keys[i]!, this._values[i]!])
    }
    return result
  }

  clear(): void {
    this._keys.length = 0
    this._values.length = 0
  }

  indexOf(key: K): number {
    const idx = this.binarySearch(key)
    return idx >= 0 ? idx : -1
  }

  private binarySearch(key: K): number {
    let lo = 0
    let hi = this._keys.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this.compare(this._keys[mid]!, key)
      if (cmp === 0) return mid
      if (cmp < 0) lo = mid + 1
      else hi = mid - 1
    }
    return ~lo
  }

  private lowerBound(key: K): number {
    const idx = this.binarySearch(key)
    return idx >= 0 ? idx : ~idx
  }

  toString(): string {
    return `FlatMap(${this._keys.length})`
  }

  toJSON(): Array<[K, V]> {
    return this.entries()
  }

  clone(): FlatMap<K, V> {
    const copy = new FlatMap<K, V>({ comparator: this.compare })
    for (let i = 0; i < this._keys.length; i++) {
      copy._keys.push(this._keys[i]!)
      copy._values.push(this._values[i]!)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof FlatMap)) return false
    if (this._keys.length !== other._keys.length) return false
    for (let i = 0; i < this._keys.length; i++) {
      if (this.compare(this._keys[i]!, other._keys[i]!) !== 0) return false
      if (this._values[i] !== other._values[i]) return false
    }
    return true
  }
}
