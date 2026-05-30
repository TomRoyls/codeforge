export class LRUEvictionCache<K, V> {
  private readonly capacity: number
  private readonly map = new Map<K, V>()
  private readonly onEvict?: (key: K, value: V) => void

  constructor(capacity: number, options?: { onEvict?: (key: K, value: V) => void }) {
    if (capacity <= 0) throw new Error('Capacity must be positive')
    this.capacity = capacity
    this.onEvict = options?.onEvict
  }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined
    const value = this.map.get(key)!
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key)
    } else if (this.map.size >= this.capacity) {
      const oldest = this.map.keys().next().value!
      const oldValue = this.map.get(oldest)!
      this.map.delete(oldest)
      this.onEvict?.(oldest, oldValue)
    }
    this.map.set(key, value)
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  delete(key: K): boolean {
    return this.map.delete(key)
  }

  get size(): number {
    return this.map.size
  }

  get capacity(): number {
    return this._capacity
  }

  private get _capacity(): number {
    return this.capacity
  }

  clear(): void {
    this.map.clear()
  }

  entries(): IterableIterator<[K, V]> {
    return this.map.entries()
  }

  keys(): IterableIterator<K> {
    return this.map.keys()
  }

  values(): IterableIterator<V> {
    return this.map.values()
  }
}
