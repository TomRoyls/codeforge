export interface ChainedHashEntry<V> {
  key: string
  value: V
  next: ChainedHashEntry<V> | null
}

export class ChainedHash2<V> {
  private buckets: (ChainedHashEntry<V> | null)[]
  private count: number
  private readonly capacity: number

  constructor(capacity: number = 16) {
    this.capacity = Math.max(1, capacity)
    this.buckets = new Array(this.capacity).fill(null)
    this.count = 0
  }

  private hash(key: string): number {
    let h = 0
    for (let i = 0; i < key.length; i++) {
      h = ((h << 5) - h + key.charCodeAt(i)) | 0
    }
    return Math.abs(h) % this.capacity
  }

  put(key: string, value: V): void {
    const idx = this.hash(key)
    let entry: ChainedHashEntry<V> | null = this.buckets[idx]!

    while (entry !== null) {
      if (entry.key === key) {
        entry.value = value
        return
      }
      entry = entry.next
    }

    const newEntry: ChainedHashEntry<V> = { key, value, next: this.buckets[idx]! }
    this.buckets[idx] = newEntry
    this.count++
  }

  get(key: string): V | undefined {
    const idx = this.hash(key)
    let entry: ChainedHashEntry<V> | null = this.buckets[idx]!

    while (entry !== null) {
      if (entry.key === key) return entry.value
      entry = entry.next
    }
    return undefined
  }

  remove(key: string): boolean {
    const idx = this.hash(key)
    let entry: ChainedHashEntry<V> | null = this.buckets[idx]!
    let prev: ChainedHashEntry<V> | null = null

    while (entry !== null) {
      if (entry.key === key) {
        if (prev === null) {
          this.buckets[idx] = entry.next
        } else {
          prev.next = entry.next
        }
        this.count--
        return true
      }
      prev = entry
      entry = entry.next
    }
    return false
  }

  contains(key: string): boolean {
    return this.get(key) !== undefined
  }

  size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  keys(): string[] {
    const result: string[] = []
    for (const bucket of this.buckets) {
      let entry = bucket
      while (entry !== null) {
        result.push(entry.key)
        entry = entry.next
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (const bucket of this.buckets) {
      let entry = bucket
      while (entry !== null) {
        result.push(entry.value)
        entry = entry.next
      }
    }
    return result
  }

  entries(): [string, V][] {
    const result: [string, V][] = []
    for (const bucket of this.buckets) {
      let entry = bucket
      while (entry !== null) {
        result.push([entry.key, entry.value])
        entry = entry.next
      }
    }
    return result
  }

  clear(): void {
    this.buckets = new Array(this.capacity).fill(null)
    this.count = 0
  }

  getCapacity(): number {
    return this.capacity
  }

  loadFactor(): number {
    return this.count / this.capacity
  }

  getBucketSizes(): number[] {
    const sizes: number[] = []
    for (const bucket of this.buckets) {
      let count = 0
      let entry = bucket
      while (entry !== null) {
        count++
        entry = entry.next
      }
      sizes.push(count)
    }
    return sizes
  }

  forEach(callback: (key: string, value: V) => void): void {
    for (const bucket of this.buckets) {
      let entry = bucket
      while (entry !== null) {
        callback(entry.key, entry.value)
        entry = entry.next
      }
    }
  }
}
