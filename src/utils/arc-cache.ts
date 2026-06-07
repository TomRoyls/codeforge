export class ARCCache<K, V> {
  private capacity: number
  private p = 0
  private t1: Map<K, V> = new Map()
  private t2: Map<K, V> = new Map()
  private b1: Set<K> = new Set()
  private b2: Set<K> = new Set()

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError('Capacity must be at least 1')
    this.capacity = capacity
  }

  get(key: K): V | undefined {
    if (this.t2.has(key)) {
      const value = this.t2.get(key)!
      this.t2.delete(key)
      this.t2.set(key, value)
      return value
    }
    if (this.t1.has(key)) {
      const value = this.t1.get(key)!
      this.t1.delete(key)
      this.t2.set(key, value)
      return value
    }
    return undefined
  }

  set(key: K, value: V): void {
    if (this.t2.has(key)) {
      this.t2.delete(key)
      this.t2.set(key, value)
      return
    }
    if (this.t1.has(key)) {
      this.t1.delete(key)
      this.t2.set(key, value)
      return
    }
    if (this.b1.has(key)) {
      this.adapt(key, true)
      this.b1.delete(key)
      if (this.t1.size + this.t2.size >= this.capacity) {
        this.replace(key)
      }
      this.t2.set(key, value)
      return
    }
    if (this.b2.has(key)) {
      this.adapt(key, false)
      this.b2.delete(key)
      if (this.t1.size + this.t2.size >= this.capacity) {
        this.replace(key)
      }
      this.t2.set(key, value)
      return
    }
    const totalSize = this.t1.size + this.t2.size + this.b1.size + this.b2.size
    if (totalSize >= this.capacity * 2) {
      if (this.b1.size > 0) {
        const oldest = this.b1.keys().next().value
        if (oldest !== undefined) this.b1.delete(oldest)
      } else {
        const oldest = this.b2.keys().next().value
        if (oldest !== undefined) this.b2.delete(oldest)
      }
    }
    if (this.t1.size + this.t2.size >= this.capacity) {
      this.replace(key)
    }
    this.t1.set(key, value)
  }

  has(key: K): boolean {
    return this.t1.has(key) || this.t2.has(key)
  }

  delete(key: K): boolean {
    if (this.t1.delete(key)) return true
    return this.t2.delete(key)
  }

  get size(): number {
    return this.t1.size + this.t2.size
  }

  get Capacity(): number {
    return this.capacity
  }

  clear(): void {
    this.t1.clear()
    this.t2.clear()
    this.b1.clear()
    this.b2.clear()
    this.p = 0
  }

  peek(key: K): V | undefined {
    if (this.t1.has(key)) return this.t1.get(key)
    return this.t2.get(key)
  }

  keys(): K[] {
    return [...this.t1.keys(), ...this.t2.keys()]
  }

  values(): V[] {
    return [...this.t1.values(), ...this.t2.values()]
  }

  entries(): Array<[K, V]> {
    return [...this.t1.entries(), ...this.t2.entries()]
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const [key, value] of this.t1) callback(value, key)
    for (const [key, value] of this.t2) callback(value, key)
  }

  private adapt(_key: K, fromB1: boolean): void {
    if (fromB1) {
      this.p = Math.min(this.p + 1, this.capacity)
    } else {
      this.p = Math.max(this.p - 1, 0)
    }
  }

  private replace(key: K): void {
    if (this.t1.size > 0 && (this.t1.size > this.p || (this.b2.has(key) && this.t1.size === this.p))) {
      const oldest = this.t1.keys().next().value
      if (oldest !== undefined) {
        this.t1.delete(oldest)
        this.b1.add(oldest)
      }
    } else if (this.t2.size > 0) {
      const oldest = this.t2.keys().next().value
      if (oldest !== undefined) {
        this.t2.delete(oldest)
        this.b2.add(oldest)
      }
    }
  }

  toString(): string {
    return `ARCCache(capacity=${this.capacity}, size=${this.size})`
  }

  toJSON(): unknown {
    return {
      capacity: this.capacity,
      p: this.p,
      t1: [...this.t1.entries()],
      t2: [...this.t2.entries()],
      b1: [...this.b1],
      b2: [...this.b2],
    }
  }

  clone(): this {
    const c = new ARCCache<K, V>(this.capacity)
    c.p = this.p
    c.t1 = new Map(this.t1)
    c.t2 = new Map(this.t2)
    c.b1 = new Set(this.b1)
    c.b2 = new Set(this.b2)
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ARCCache)) return false
    if (this.capacity !== other.capacity) return false
    if (this.p !== other.p) return false
    if (this.t1.size !== other.t1.size) return false
    for (const [k, v] of this.t1) {
      const ov = other.t1.get(k)
      if (!Object.is(ov, v)) return false
    }
    if (this.t2.size !== other.t2.size) return false
    for (const [k, v] of this.t2) {
      const ov = other.t2.get(k)
      if (!Object.is(ov, v)) return false
    }
    if (this.b1.size !== other.b1.size) return false
    for (const k of this.b1) {
      if (!other.b1.has(k)) return false
    }
    if (this.b2.size !== other.b2.size) return false
    for (const k of this.b2) {
      if (!other.b2.has(k)) return false
    }
    return true
  }
}
