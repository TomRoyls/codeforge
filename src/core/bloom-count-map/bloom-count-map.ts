import { CountingBloomFilter } from '../counting-bloom-filter/counting-bloom-filter.js'
import type { BloomCountMapOptions } from './types.js'
import { DEFAULT_BLOOM_COUNT_MAP_OPTIONS } from './types.js'

export class BloomCountMap<V> {
  private map: Map<string, V>
  private counts: Map<string, number>
  private bloom: CountingBloomFilter
  private mapCapacity: number

  constructor(options?: Partial<BloomCountMapOptions>) {
    const opts: Required<BloomCountMapOptions> = { ...DEFAULT_BLOOM_COUNT_MAP_OPTIONS, ...options }
    this.mapCapacity = opts.capacity
    this.map = new Map()
    this.counts = new Map()
    this.bloom = new CountingBloomFilter({ capacity: opts.capacity, errorRate: opts.errorRate })
  }

  set(key: string, value: V, count?: number): void {
    const oldCount = this.counts.get(key) ?? 0
    const newCount = count ?? (oldCount > 0 ? oldCount : 1)

    if (oldCount === 0) {
      for (let i = 0; i < newCount; i++) {
        this.bloom.add(key)
      }
    } else {
      const diff = newCount - oldCount
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          this.bloom.add(key)
        }
      } else if (diff < 0) {
        for (let i = 0; i < -diff; i++) {
          this.bloom.remove(key)
        }
      }
    }

    this.counts.set(key, newCount)
    this.map.set(key, value)
  }

  get(key: string): V | undefined {
    return this.map.get(key)
  }

  count(key: string): number {
    return this.bloom.count(key)
  }

  has(key: string): boolean {
    return this.map.has(key)
  }

  delete(key: string): boolean {
    if (!this.map.has(key)) {
      return false
    }
    const c = this.counts.get(key) ?? 1
    for (let i = 0; i < c; i++) {
      this.bloom.remove(key)
    }
    this.counts.delete(key)
    this.map.delete(key)
    return true
  }

  increment(key: string): boolean {
    if (!this.map.has(key)) {
      return false
    }
    this.bloom.add(key)
    const c = this.counts.get(key) ?? 1
    this.counts.set(key, c + 1)
    return true
  }

  decrement(key: string): boolean {
    if (!this.map.has(key)) {
      return false
    }
    const c = this.counts.get(key) ?? 1
    if (c <= 1) {
      return false
    }
    this.bloom.remove(key)
    this.counts.set(key, c - 1)
    return true
  }

  get size(): number {
    return this.map.size
  }

  get capacity(): number {
    return this.mapCapacity
  }

  clear(): void {
    this.map.clear()
    this.counts.clear()
    this.bloom.clear()
  }

  keys(): string[] {
    return [...this.map.keys()]
  }

  values(): V[] {
    return [...this.map.values()]
  }

  entries(): [string, V][] {
    return [...this.map.entries()]
  }

  forEach(callback: (value: V, key: string) => void): void {
    this.map.forEach((value, key) => {
      callback(value, key)
    })
  }

  get approximateSize(): number {
    return this.bloom.size()
  }
}

export { DEFAULT_BLOOM_COUNT_MAP_OPTIONS } from './types.js'
export type { BloomCountMapOptions } from './types.js'
