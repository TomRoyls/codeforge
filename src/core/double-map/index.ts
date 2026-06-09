import type {
  DoubleMapOptions,
  DoubleMapEntry,
  DoubleMapForEachCallback,
} from './types.js'

type InternalEntry<K1, K2, V> = {
  k1: K1
  k2: K2
  v: V
}

export class DoubleMap<K1, K2, V> {
  private map1: Map<string, InternalEntry<K1, K2, V>>
  private map2: Map<string, InternalEntry<K1, K2, V>>
  private k1ToHash: (key: K1) => string
  private k2ToHash: (key: K2) => string

  constructor(options?: DoubleMapOptions<K1, K2>) {
    this.map1 = new Map()
    this.map2 = new Map()
    this.k1ToHash = options?.key1Hash ?? ((key: K1) => String(key))
    this.k2ToHash = options?.key2Hash ?? ((key: K2) => String(key))
  }

  set(k1: K1, k2: K2, v: V): void {
    const h1 = this.k1ToHash(k1)
    const h2 = this.k2ToHash(k2)
    const existing = this.map1.get(h1)
    if (existing) {
      const oldH2 = this.k2ToHash(existing.k2)
      this.map2.delete(oldH2)
    }
    const existingByK2 = this.map2.get(h2)
    if (existingByK2) {
      const oldH1 = this.k1ToHash(existingByK2.k1)
      this.map1.delete(oldH1)
    }
    const entry: InternalEntry<K1, K2, V> = { k1, k2, v }
    this.map1.set(h1, entry)
    this.map2.set(h2, entry)
  }

  getByKey1(k1: K1): V | undefined {
    return this.map1.get(this.k1ToHash(k1))?.v
  }

  getByKey2(k2: K2): V | undefined {
    return this.map2.get(this.k2ToHash(k2))?.v
  }

  deleteByKey1(k1: K1): boolean {
    const h1 = this.k1ToHash(k1)
    const entry = this.map1.get(h1)
    if (!entry) return false
    const h2 = this.k2ToHash(entry.k2)
    this.map1.delete(h1)
    this.map2.delete(h2)
    return true
  }

  deleteByKey2(k2: K2): boolean {
    const h2 = this.k2ToHash(k2)
    const entry = this.map2.get(h2)
    if (!entry) return false
    const h1 = this.k1ToHash(entry.k1)
    this.map1.delete(h1)
    this.map2.delete(h2)
    return true
  }

  hasKey1(k1: K1): boolean {
    return this.map1.has(this.k1ToHash(k1))
  }

  hasKey2(k2: K2): boolean {
    return this.map2.has(this.k2ToHash(k2))
  }

  get size(): number {
    return this.map1.size
  }

  get isEmpty(): boolean {
    return this.map1.size === 0
  }

  clear(): void {
    this.map1.clear()
    this.map2.clear()
  }

  toArray(): DoubleMapEntry<K1, K2, V>[] {
    const result: DoubleMapEntry<K1, K2, V>[] = []
    for (const entry of this.map1.values()) {
      result.push({ k1: entry.k1, k2: entry.k2, v: entry.v })
    }
    return result
  }

  clone(): DoubleMap<K1, K2, V> {
    const copy = new DoubleMap<K1, K2, V>({
      key1Hash: this.k1ToHash,
      key2Hash: this.k2ToHash,
    })
    for (const entry of this.map1.values()) {
      copy.set(entry.k1, entry.k2, entry.v)
    }
    return copy
  }

  static fromArray<K1, K2, V>(
    entries: DoubleMapEntry<K1, K2, V>[],
    options?: DoubleMapOptions<K1, K2>,
  ): DoubleMap<K1, K2, V> {
    const dm = new DoubleMap<K1, K2, V>(options)
    for (const entry of entries) {
      dm.set(entry.k1, entry.k2, entry.v)
    }
    return dm
  }

  forEach(callback: DoubleMapForEachCallback<K1, K2, V>): void {
    for (const entry of this.map1.values()) {
      callback(entry.k1, entry.k2, entry.v)
    }
  }

  *[Symbol.iterator](): Iterator<DoubleMapEntry<K1, K2, V>> {
    for (const entry of this.map1.values()) {
      yield { k1: entry.k1, k2: entry.k2, v: entry.v }
    }
  }

  keys1(): K1[] {
    const result: K1[] = []
    for (const entry of this.map1.values()) {
      result.push(entry.k1)
    }
    return result
  }

  keys2(): K2[] {
    const result: K2[] = []
    for (const entry of this.map2.values()) {
      result.push(entry.k2)
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (const entry of this.map1.values()) {
      result.push(entry.v)
    }
    return result
  }

  update(k1: K1, k2: K2, v: V): boolean {
    const h1 = this.k1ToHash(k1)
    const entry = this.map1.get(h1)
    if (!entry) return false
    if (this.k2ToHash(entry.k2) !== this.k2ToHash(k2)) return false
    entry.v = v
    return true
  }

  getKey1ByValue(v: V): K1 | undefined {
    for (const entry of this.map1.values()) {
      if (entry.v === v) return entry.k1
    }
    return undefined
  }

  getKey2ByValue(v: V): K2 | undefined {
    for (const entry of this.map2.values()) {
      if (entry.v === v) return entry.k2
    }
    return undefined
  }

  getByEither(k1OrK2: K1 | K2): V | undefined {
    const h1 = this.k1ToHash(k1OrK2 as K1)
    const byK1 = this.map1.get(h1)
    if (byK1) return byK1.v
    const h2 = this.k2ToHash(k1OrK2 as K2)
    const byK2 = this.map2.get(h2)
    if (byK2) return byK2.v
    return undefined
  }

  hasValue(v: V): boolean {
    for (const entry of this.map1.values()) {
      if (entry.v === v) return true
    }
    return false
  }

  entries(): [K1, K2, V][] {
    const result: [K1, K2, V][] = []
    for (const entry of this.map1.values()) {
      result.push([entry.k1, entry.k2, entry.v])
    }
    return result
  }

  count(): number {
    return this.map1.size
  }

  equals(
    other: DoubleMap<K1, K2, V>,
    valueEquals: (a: V, b: V) => boolean = (a, b) => a === b,
  ): boolean {
    if (this.map1.size !== other.size) return false
    for (const entry of this.map1.values()) {
      const otherVal = other.getByKey1(entry.k1)
      if (otherVal === undefined) return false
      if (!valueEquals(entry.v, otherVal)) return false
    }
    return true
  }

  toString(): string {
    return `${DoubleMap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'DoubleMap', size: this.size, items: this.toArray() }
  }


}
