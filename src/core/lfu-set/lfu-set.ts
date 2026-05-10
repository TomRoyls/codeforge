import type {
  LfuSetOptions,
  LfuSetStatistics,
  LfuEntry,
} from './types.js'
import { DEFAULT_LFU_SET_OPTIONS } from './types.js'

export class LfuSet<T> {
  private entries: Map<T, LfuEntry<T>> = new Map()
  private options: LfuSetOptions
  private stats: LfuSetStatistics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    frequencyUpdates: 0,
  }
  private tick: number = 0

  constructor(options?: Partial<LfuSetOptions>) {
    this.options = { ...DEFAULT_LFU_SET_OPTIONS, ...options }
  }

  add(value: T): boolean {
    const existing = this.entries.get(value)
    if (existing !== undefined) {
      existing.frequency++
      existing.lastAccess = this.tick++
      this.stats.frequencyUpdates++
      return false
    }

    if (this.options.capacity <= 0) {
      this.stats.evictions++
      return true
    }

    if (this.entries.size >= this.options.capacity) {
      this.evictOne()
    }

    this.entries.set(value, {
      value,
      frequency: 1,
      lastAccess: this.tick++,
    })
    return true
  }

  has(value: T): boolean {
    const entry = this.entries.get(value)
    if (entry !== undefined) {
      entry.frequency++
      entry.lastAccess = this.tick++
      this.stats.hits++
      this.stats.frequencyUpdates++
      return true
    }
    this.stats.misses++
    return false
  }

  delete(value: T): boolean {
    return this.entries.delete(value)
  }

  access(value: T): boolean {
    const entry = this.entries.get(value)
    if (entry !== undefined) {
      entry.frequency++
      entry.lastAccess = this.tick++
      this.stats.hits++
      this.stats.frequencyUpdates++
      return true
    }
    this.stats.misses++
    return false
  }

  get size(): number {
    return this.entries.size
  }

  get capacity(): number {
    return this.options.capacity
  }

  isEmpty(): boolean {
    return this.entries.size === 0
  }

  clear(): void {
    this.entries.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0, frequencyUpdates: 0 }
    this.tick = 0
  }

  values(): T[] {
    const arr = Array.from(this.entries.values())
    arr.sort((a, b) => b.frequency - a.frequency || b.lastAccess - a.lastAccess)
    return arr.map((e) => e.value)
  }

  toArray(): T[] {
    return Array.from(this.entries.keys())
  }

  forEach(callback: (value: T, index: number) => void): void {
    let index = 0
    for (const entry of this.entries.values()) {
      callback(entry.value, index++)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const entry of this.entries.values()) {
      yield entry.value
    }
  }

  getFrequency(value: T): number | undefined {
    const entry = this.entries.get(value)
    return entry?.frequency
  }

  getLeastFrequent(): T | undefined {
    let result: T | undefined
    let minFreq = Infinity
    let oldestAccess = Infinity

    for (const entry of this.entries.values()) {
      if (
        entry.frequency < minFreq ||
        (entry.frequency === minFreq && entry.lastAccess < oldestAccess)
      ) {
        minFreq = entry.frequency
        oldestAccess = entry.lastAccess
        result = entry.value
      }
    }
    return result
  }

  getMostFrequent(): T | undefined {
    let result: T | undefined
    let maxFreq = -1
    let newestAccess = -1

    for (const entry of this.entries.values()) {
      if (
        entry.frequency > maxFreq ||
        (entry.frequency === maxFreq && entry.lastAccess > newestAccess)
      ) {
        maxFreq = entry.frequency
        newestAccess = entry.lastAccess
        result = entry.value
      }
    }
    return result
  }

  getStatistics(): LfuSetStatistics {
    return { ...this.stats }
  }

  private evictOne(): void {
    let victim: T | undefined
    let minFreq = Infinity
    let oldestAccess = Infinity

    if (this.options.evictionPolicy === 'least-recent-least-frequent') {
      for (const [key, entry] of this.entries) {
        if (
          entry.frequency < minFreq ||
          (entry.frequency === minFreq && entry.lastAccess < oldestAccess)
        ) {
          minFreq = entry.frequency
          oldestAccess = entry.lastAccess
          victim = key
        }
      }
    } else {
      for (const [key, entry] of this.entries) {
        if (entry.frequency < minFreq) {
          minFreq = entry.frequency
          victim = key
        }
      }
    }

    if (victim !== undefined) {
      this.entries.delete(victim)
      this.stats.evictions++
    }
  }
}

export type { LfuSetOptions, LfuSetStatistics, LfuEntry } from './types.js'
