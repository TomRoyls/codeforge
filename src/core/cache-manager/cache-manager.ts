import type { CacheConfig, CacheStats, CacheEvent } from './types.js'
import { DEFAULT_CACHE_CONFIG } from './types.js'

interface InternalEntry {
  key: string
  value: unknown
  createdAt: number
  accessedAt: number
  ttl: number
  size: number
  tags: string[]
  metadata: Record<string, unknown>
  frequency: number
}

export class CacheManager {
  private store: Map<string, InternalEntry> = new Map()
  private config: CacheConfig
  private hits: number = 0
  private misses: number = 0
  private evictionCount: number = 0
  private totalSize: number = 0
  private eventLog: CacheEvent[] = []
  private orderCounter: number = 0
  private accessOrder: Map<string, number> = new Map()
  private insertOrder: Map<string, number> = new Map()
  private insertCounter: number = 0

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
  }

  set(key: string, value: unknown, options?: { ttl?: number; tags?: string[]; size?: number; metadata?: Record<string, unknown> }): void {
    const existing = this.store.get(key)
    if (existing) {
      this.totalSize -= existing.size
    }

    const entry: InternalEntry = {
      key,
      value,
      createdAt: existing?.createdAt ?? Date.now(),
      accessedAt: Date.now(),
      ttl: options?.ttl ?? this.config.defaultTTL,
      size: options?.size ?? 1,
      tags: options?.tags ?? existing?.tags ?? [],
      metadata: options?.metadata ?? existing?.metadata ?? {},
      frequency: existing?.frequency ?? 0,
    }

    this.totalSize += entry.size
    this.store.set(key, entry)
    this.accessOrder.set(key, this.orderCounter++)
    this.insertOrder.set(key, existing ? (this.insertOrder.get(key) ?? this.insertCounter++) : this.insertCounter++)
    this.logEvent('set', key)

    this.enforceLimits()
  }

  get(key: string): unknown | undefined {
    const entry = this.store.get(key)
    if (!entry) {
      this.misses++
      this.logEvent('miss', key)
      return undefined
    }

    if (this.isExpired(entry)) {
      this.removeEntry(key)
      this.misses++
      this.logEvent('expire', key)
      return undefined
    }

    entry.accessedAt = Date.now()
    entry.frequency++
    this.accessOrder.set(key, this.orderCounter++)
    this.hits++
    this.logEvent('hit', key)
    return entry.value
  }

  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false
    if (this.isExpired(entry)) {
      this.removeEntry(key)
      return false
    }
    return true
  }

  delete(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false
    this.removeEntry(key)
    this.logEvent('delete', key)
    return true
  }

  invalidateByTag(tag: string): number {
    let count = 0
    const keysToDelete: string[] = []
    for (const entry of this.store.values()) {
      if (entry.tags.includes(tag)) {
        keysToDelete.push(entry.key)
      }
    }
    for (const key of keysToDelete) {
      this.removeEntry(key)
      this.logEvent('delete', key)
      count++
    }
    return count
  }

  invalidateByPrefix(prefix: string): number {
    let count = 0
    const keysToDelete: string[] = []
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }
    for (const key of keysToDelete) {
      this.removeEntry(key)
      this.logEvent('delete', key)
      count++
    }
    return count
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      size: this.totalSize,
      entries: this.store.size,
      evictions: this.evictionCount,
    }
  }

  getEventLog(): CacheEvent[] {
    return [...this.eventLog]
  }

  clear(): void {
    this.store.clear()
    this.accessOrder.clear()
    this.insertOrder.clear()
    this.totalSize = 0
    this.orderCounter = 0
    this.insertCounter = 0
    this.logEvent('clear', '*')
  }

  getConfig(): CacheConfig {
    return { ...this.config }
  }

  private removeEntry(key: string): void {
    const entry = this.store.get(key)
    if (entry) {
      this.totalSize -= entry.size
    }
    this.store.delete(key)
    this.accessOrder.delete(key)
    this.insertOrder.delete(key)
  }

  private enforceLimits(): void {
    while (this.store.size > this.config.maxEntries) {
      this.evictOne()
    }
    while (this.totalSize > this.config.maxSize && this.store.size > 0) {
      this.evictOne()
    }
  }

  private evictOne(): void {
    const key = this.selectEvictionCandidate()
    if (key !== null) {
      this.removeEntry(key)
      this.evictionCount++
      this.logEvent('evict', key)
    }
  }

  private selectEvictionCandidate(): string | null {
    if (this.store.size === 0) return null

    if (this.config.evictionPolicy === 'lru') {
      let minOrder = Infinity
      let minKey: string | null = null
      for (const [key, order] of this.accessOrder) {
        if (order < minOrder) {
          minOrder = order
          minKey = key
        }
      }
      return minKey
    }

    if (this.config.evictionPolicy === 'fifo') {
      let minOrder = Infinity
      let minKey: string | null = null
      for (const [key, order] of this.insertOrder) {
        if (order < minOrder) {
          minOrder = order
          minKey = key
        }
      }
      return minKey
    }

    let minFreq = Infinity
    let lfuKey: string | null = null
    for (const entry of this.store.values()) {
      if (entry.frequency < minFreq) {
        minFreq = entry.frequency
        lfuKey = entry.key
      }
    }
    return lfuKey
  }

  private isExpired(entry: InternalEntry): boolean {
    if (entry.ttl <= 0) return false
    return Date.now() - entry.createdAt >= entry.ttl
  }

  private logEvent(type: CacheEvent['type'], key: string): void {
    this.eventLog.push({
      type,
      key,
      timestamp: Date.now(),
    })
  }
}
