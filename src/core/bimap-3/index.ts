export class BiMap3<K, V> {
  private readonly forwardMap: Map<K, V>
  private readonly reverseMap: Map<V, K>

  constructor() {
    this.forwardMap = new Map<K, V>()
    this.reverseMap = new Map<V, K>()
  }

  set(key: K, value: V): void {
    const existingValue = this.forwardMap.get(key)
    if (existingValue !== undefined) {
      this.reverseMap.delete(existingValue)
    }
    const existingKey = this.reverseMap.get(value)
    if (existingKey !== undefined && existingKey !== key) {
      this.forwardMap.delete(existingKey)
    }
    this.forwardMap.set(key, value)
    this.reverseMap.set(value, key)
  }

  get(key: K): V | undefined {
    return this.forwardMap.get(key)
  }

  getKey(value: V): K | undefined {
    return this.reverseMap.get(value)
  }

  has(key: K): boolean {
    return this.forwardMap.has(key)
  }

  hasValue(value: V): boolean {
    return this.reverseMap.has(value)
  }

  delete(key: K): boolean {
    const value = this.forwardMap.get(key)
    if (value === undefined) {
      return false
    }
    this.forwardMap.delete(key)
    this.reverseMap.delete(value)
    return true
  }

  deleteValue(value: V): boolean {
    const key = this.reverseMap.get(value)
    if (key === undefined) {
      return false
    }
    this.reverseMap.delete(value)
    this.forwardMap.delete(key)
    return true
  }

  get size(): number {
    return this.forwardMap.size
  }

  isEmpty(): boolean {
    return this.forwardMap.size === 0
  }

  clear(): void {
    this.forwardMap.clear()
    this.reverseMap.clear()
  }

  keys(): K[] {
    return Array.from(this.forwardMap.keys())
  }

  values(): V[] {
    return Array.from(this.forwardMap.values())
  }

  entries(): [K, V][] {
    return Array.from(this.forwardMap.entries())
  }

  forEach(callback: (key: K, value: V) => void): void {
    this.forwardMap.forEach((value, key) => {
      callback(key, value)
    })
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const items = this.entries();
    let index = 0;
    return {
      next(): IteratorResult<[K, V]> {
        if (index < items.length) {
          return { value: items[index++]!, done: false };
        }
        return { value: undefined as unknown as [K, V], done: true };
      },
    };
  }

  toArray() {
    return this.entries()
  }

  toString(): string {
    return `${BiMap3}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'BiMap3', size: this.size, items: this.toArray() }
  }

  static empty<K, V>(): BiMap3<K, V> {
    return new BiMap3<K, V>()
  }
}
