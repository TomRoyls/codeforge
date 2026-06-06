export class BiKeyMap<K1, K2, V> {
  private readonly map = new Map<string, V>()
  private readonly k1Map = new Map<K1, Set<string>>()
  private readonly k2Map = new Map<K2, Set<string>>()
  private sizeValue = 0

  get size(): number {
    return this.sizeValue
  }

  private key(a: K1, b: K2): string {
    return `${String(a)}\x00${String(b)}`
  }

  set(k1: K1, k2: K2, value: V): void {
    const k = this.key(k1, k2)
    if (!this.map.has(k)) {
      this.sizeValue++
      let s1 = this.k1Map.get(k1)
      if (!s1) {
        s1 = new Set()
        this.k1Map.set(k1, s1)
      }
      s1.add(k)
      let s2 = this.k2Map.get(k2)
      if (!s2) {
        s2 = new Set()
        this.k2Map.set(k2, s2)
      }
      s2.add(k)
    }
    this.map.set(k, value)
  }

  get(k1: K1, k2: K2): V | undefined {
    return this.map.get(this.key(k1, k2))
  }

  has(k1: K1, k2: K2): boolean {
    return this.map.has(this.key(k1, k2))
  }

  delete(k1: K1, k2: K2): boolean {
    const k = this.key(k1, k2)
    if (!this.map.has(k)) return false
    this.map.delete(k)
    this.sizeValue--
    const s1 = this.k1Map.get(k1)
    if (s1) {
      s1.delete(k)
      if (s1.size === 0) this.k1Map.delete(k1)
    }
    const s2 = this.k2Map.get(k2)
    if (s2) {
      s2.delete(k)
      if (s2.size === 0) this.k2Map.delete(k2)
    }
    return true
  }

  getByK1(k1: K1): V[] {
    const s1 = this.k1Map.get(k1)
    if (!s1) return []
    const result: V[] = []
    for (const k of s1) {
      const v = this.map.get(k)
      if (v !== undefined) result.push(v)
    }
    return result
  }

  getByK2(k2: K2): V[] {
    const s2 = this.k2Map.get(k2)
    if (!s2) return []
    const result: V[] = []
    for (const k of s2) {
      const v = this.map.get(k)
      if (v !== undefined) result.push(v)
    }
    return result
  }

  hasK1(k1: K1): boolean {
    const s1 = this.k1Map.get(k1)
    return s1 !== undefined && s1.size > 0
  }

  hasK2(k2: K2): boolean {
    const s2 = this.k2Map.get(k2)
    return s2 !== undefined && s2.size > 0
  }

  clear(): void {
    this.map.clear()
    this.k1Map.clear()
    this.k2Map.clear()
    this.sizeValue = 0
  }

  entries(): Array<[K1, K2, V]> {
    const result: Array<[K1, K2, V]> = []
    for (const [k, v] of this.map) {
      const sep = k.indexOf('\x00')
      const k1Str = k.slice(0, sep)
      const k2Str = k.slice(sep + 1)
      result.push([k1Str as K1, k2Str as K2, v])
    }
    return result
  }

  values(): V[] {
    return Array.from(this.map.values())
  }

  forEach(fn: (value: V, k1: K1, k2: K2) => void): void {
    for (const [k, v] of this.map) {
      const sep = k.indexOf('\x00')
      const k1Str = k.slice(0, sep)
      const k2Str = k.slice(sep + 1)
      fn(v, k1Str as K1, k2Str as K2)
    }
  }

  [Symbol.iterator](): Iterator<[K1, K2, V]> {
    const entries = this.entries()
    let index = 0
    return {
      next: () => {
        if (index < entries.length) {
          return { done: false, value: entries[index++]! }
        }
        return { done: true, value: undefined }
      },
    }
  }

  toString(): string {
    const parts: string[] = []
    for (const [k1, k2, v] of this) {
      parts.push(`(${String(k1)}, ${String(k2)}) -> ${String(v)}`)
    }
    return `[${parts.join(', ')}]`
  }

  toJSON(): Array<[[K1, K2], V]> {
    const result: Array<[[K1, K2], V]> = []
    for (const [k1, k2, v] of this) {
      result.push([[k1, k2], v])
    }
    return result
  }

  clone(): this {
    const c = new BiKeyMap<K1, K2, V>()
    for (const [k1, k2, v] of this) {
      c.set(k1, k2, v)
    }
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BiKeyMap)) return false
    if (this.size !== other.size) return false
    for (const [k1, k2, v] of this) {
      const ov = other.get(k1, k2)
      if (!Object.is(ov, v)) return false
    }
    return true
  }
}
