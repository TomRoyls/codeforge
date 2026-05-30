const DEFAULT_STRIPES = 16

export class ConcurrentHashMap<K, V> {
  private stripes: Array<Map<K, V>>
  private stripeCount: number
  private hashFn: (key: K) => number

  constructor(options?: { stripes?: number; hash?: (key: K) => number }) {
    this.stripeCount = options?.stripes ?? DEFAULT_STRIPES
    this.hashFn = options?.hash ?? ((key: K) => this.defaultHash(key))
    this.stripes = []
    for (let i = 0; i < this.stripeCount; i++) {
      this.stripes.push(new Map())
    }
  }

  private defaultHash(key: K): number {
    const str = String(key)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      hash = ((hash << 5) - hash + ch) | 0
    }
    return hash
  }

  private getStripe(key: K): Map<K, V> {
    const hash = this.hashFn(key)
    const idx = ((hash % this.stripeCount) + this.stripeCount) % this.stripeCount
    return this.stripes[idx]!
  }

  get(key: K): V | undefined {
    return this.getStripe(key).get(key)
  }

  set(key: K, value: V): void {
    this.getStripe(key).set(key, value)
  }

  has(key: K): boolean {
    return this.getStripe(key).has(key)
  }

  delete(key: K): boolean {
    return this.getStripe(key).delete(key)
  }

  get size(): number {
    let total = 0
    for (const stripe of this.stripes) {
      total += stripe.size
    }
    return total
  }

  get isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    for (const stripe of this.stripes) {
      stripe.clear()
    }
  }

  getOrDefault(key: K, defaultValue: V): V {
    const stripe = this.getStripe(key)
    if (stripe.has(key)) return stripe.get(key)!
    stripe.set(key, defaultValue)
    return defaultValue
  }

  computeIfAbsent(key: K, factory: (key: K) => V): V {
    const stripe = this.getStripe(key)
    if (stripe.has(key)) return stripe.get(key)!
    const value = factory(key)
    stripe.set(key, value)
    return value
  }

  compute(key: K, remapper: (key: K, value: V | undefined) => V | undefined): V | undefined {
    const stripe = this.getStripe(key)
    const oldValue = stripe.get(key)
    const newValue = remapper(key, oldValue)
    if (newValue === undefined) {
      stripe.delete(key)
    } else {
      stripe.set(key, newValue)
    }
    return newValue
  }

  merge(key: K, value: V, merger: (existing: V, newValue: V) => V): V {
    const stripe = this.getStripe(key)
    const existing = stripe.get(key)
    if (existing === undefined) {
      stripe.set(key, value)
      return value
    }
    const merged = merger(existing, value)
    stripe.set(key, merged)
    return merged
  }

  keys(): K[] {
    const result: K[] = []
    for (const stripe of this.stripes) {
      for (const key of stripe.keys()) {
        result.push(key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (const stripe of this.stripes) {
      for (const value of stripe.values()) {
        result.push(value)
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (const stripe of this.stripes) {
      for (const entry of stripe.entries()) {
        result.push(entry)
      }
    }
    return result
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const stripe of this.stripes) {
      for (const [key, value] of stripe) {
        callback(value, key)
      }
    }
  }

  toMap(): Map<K, V> {
    const map = new Map<K, V>()
    for (const stripe of this.stripes) {
      for (const [key, value] of stripe) {
        map.set(key, value)
      }
    }
    return map
  }

  get stripeSizes(): number[] {
    return this.stripes.map((s) => s.size)
  }

  get stripeCount_(): number {
    return this.stripeCount
  }
}
