class LFUCache4<K, V> {
  private capacity: number
  private cache: Map<K, { value: V; freq: number; lruTime: number }>
  private minFreq: number
  private time: number
  private _size: number

  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map()
    this.minFreq = 0
    this.time = 0
    this._size = 0
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    entry.freq++
    entry.lruTime = this.time++
    this.updateMinFreq(key)
    return entry.value
  }

  set(key: K, value: V): void {
    if (this.capacity <= 0) return

    const existing = this.cache.get(key)
    if (existing) {
      existing.value = value
      existing.freq++
      existing.lruTime = this.time++
      this.updateMinFreq(key)
      return
    }

    if (this._size >= this.capacity) {
      this.evict()
    }

    this.cache.set(key, { value, freq: 1, lruTime: this.time++ })
    this._size++
    this.minFreq = 1
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): boolean {
    if (!this.cache.has(key)) return false

    const entry = this.cache.get(key)!
    if (entry.freq === this.minFreq) {
      this.recalcMinFreq()
    }

    this.cache.delete(key)
    this._size--
    return true
  }

  clear(): void {
    this.cache.clear()
    this.minFreq = 0
    this.time = 0
    this._size = 0
  }

  get size(): number {
    return this._size
  }

  private updateMinFreq(key: K): void {
    const entry = this.cache.get(key)!
    if (entry.freq === this.minFreq + 1) {
      let hasKeyWithOldMinFreq = false
      this.cache.forEach((e) => {
        if (e.freq === this.minFreq) {
          hasKeyWithOldMinFreq = true
        }
      })
      if (!hasKeyWithOldMinFreq) {
        this.minFreq++
      }
    }
  }

  private recalcMinFreq(): void {
    if (this._size === 0) {
      this.minFreq = 0
      return
    }

    this.minFreq = Infinity
    this.cache.forEach((entry) => {
      if (entry.freq < this.minFreq) {
        this.minFreq = entry.freq
      }
    })
  }

  private evict(): void {
    if (this._size === 0) return

    let evictKey: K | undefined
    let minLruTime = Infinity

    this.cache.forEach((entry, key) => {
      if (entry.freq === this.minFreq && entry.lruTime < minLruTime) {
        minLruTime = entry.lruTime
        evictKey = key
      }
    })

    if (evictKey !== undefined) {
      this.cache.delete(evictKey)
      this._size--
    }
  }
}

export { LFUCache4 }
