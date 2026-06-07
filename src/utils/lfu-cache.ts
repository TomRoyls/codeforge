export class LFUCache<K, V> {
  private capacity: number
  private minFreq = 0
  private keyMap: Map<K, { value: V; freq: number }>
  private freqMap: Map<number, Set<K>>

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError('Capacity must be at least 1')
    this.capacity = capacity
    this.keyMap = new Map()
    this.freqMap = new Map()
  }

  get(key: K): V | undefined {
    const entry = this.keyMap.get(key)
    if (entry === undefined) return undefined
    this.incrementFreq(key, entry)
    return entry.value
  }

  set(key: K, value: V): void {
    if (this.capacity === 0) return
    const existing = this.keyMap.get(key)
    if (existing !== undefined) {
      existing.value = value
      this.incrementFreq(key, existing)
      return
    }
    if (this.keyMap.size >= this.capacity) {
      this.evict()
    }
    this.keyMap.set(key, { value, freq: 1 })
    this.addToFreqMap(1, key)
    this.minFreq = 1
  }

  has(key: K): boolean {
    return this.keyMap.has(key)
  }

  delete(key: K): boolean {
    const entry = this.keyMap.get(key)
    if (entry === undefined) return false
    this.removeFromFreqMap(entry.freq, key)
    this.keyMap.delete(key)
    if (this.keyMap.size === 0) {
      this.minFreq = 0
    } else if (entry.freq === this.minFreq && !this.freqMap.has(this.minFreq)) {
      let nextMin = Infinity
      for (const freq of this.freqMap.keys()) {
        if (freq < nextMin) nextMin = freq
      }
      this.minFreq = nextMin
    }
    return true
  }

  get size(): number {
    return this.keyMap.size
  }

  get Capacity(): number {
    return this.capacity
  }

  clear(): void {
    this.keyMap.clear()
    this.freqMap.clear()
    this.minFreq = 0
  }

  peek(key: K): V | undefined {
    return this.keyMap.get(key)?.value
  }

  getFrequency(key: K): number {
    return this.keyMap.get(key)?.freq ?? 0
  }

  keys(): K[] {
    return Array.from(this.keyMap.keys())
  }

  values(): V[] {
    return Array.from(this.keyMap.values(), (e) => e.value)
  }

  entries(): Array<[K, V]> {
    return Array.from(this.keyMap.entries(), ([k, e]) => [k, e.value])
  }

  forEach(callback: (value: V, key: K, freq: number) => void): void {
    for (const [key, entry] of this.keyMap) {
      callback(entry.value, key, entry.freq)
    }
  }

  toMap(): Map<K, V> {
    const map = new Map<K, V>()
    for (const [key, entry] of this.keyMap) {
      map.set(key, entry.value)
    }
    return map
  }

  private incrementFreq(key: K, entry: { value: V; freq: number }): void {
    const oldFreq = entry.freq
    this.removeFromFreqMap(oldFreq, key)
    entry.freq = oldFreq + 1
    this.addToFreqMap(entry.freq, key)
    if (oldFreq === this.minFreq && !this.freqMap.has(oldFreq)) {
      this.minFreq = oldFreq + 1
    }
  }

  private addToFreqMap(freq: number, key: K): void {
    let set = this.freqMap.get(freq)
    if (!set) {
      set = new Set()
      this.freqMap.set(freq, set)
    }
    set.add(key)
  }

  private removeFromFreqMap(freq: number, key: K): void {
    const set = this.freqMap.get(freq)
    if (set) {
      set.delete(key)
      if (set.size === 0) {
        this.freqMap.delete(freq)
      }
    }
  }

  private evict(): void {
    const minSet = this.freqMap.get(this.minFreq)
    if (!minSet) return
    const evictKey = minSet.values().next().value
    if (evictKey !== undefined) {
      minSet.delete(evictKey)
      if (minSet.size === 0) {
        this.freqMap.delete(this.minFreq)
      }
      this.keyMap.delete(evictKey)
    }
  }

  toString(): string {
    return `LFUCache(${this.keyMap.size}/${this.capacity})`
  }

  toJSON(): unknown {
    return this.entries()
  }

  clone(): LFUCache<K, V> {
    const copy = new LFUCache<K, V>(this.capacity)
    for (const [key, entry] of this.keyMap) {
      copy.keyMap.set(key, { value: entry.value, freq: entry.freq })
      copy.addToFreqMap(entry.freq, key)
    }
    copy.minFreq = this.minFreq
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LFUCache)) return false
    if (this.capacity !== other.capacity) return false
    if (this.keyMap.size !== other.keyMap.size) return false
    for (const [k, e] of this.keyMap) {
      const oe = other.keyMap.get(k)
      if (!oe) return false
      if (!Object.is(e.value, oe.value)) return false
      if (e.freq !== oe.freq) return false
    }
    return true
  }
}
