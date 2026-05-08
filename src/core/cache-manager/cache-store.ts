import type { CacheEntry } from './types.js'

interface StoreEntry {
  key: string
  value: unknown
  size: number
  order: number
}

export class CacheStore {
  private entries: Map<string, StoreEntry> = new Map()
  private orderCounter: number = 0
  private totalSize: number = 0

  set(key: string, value: unknown, size: number = 1): void {
    const existing = this.entries.get(key)
    if (existing) {
      this.totalSize -= existing.size
      existing.value = value
      existing.size = size
      existing.order = this.orderCounter++
      this.totalSize += size
      return
    }

    const entry: StoreEntry = {
      key,
      value,
      size,
      order: this.orderCounter++,
    }
    this.entries.set(key, entry)
    this.totalSize += size
  }

  get(key: string): unknown | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    entry.order = this.orderCounter++
    return entry.value
  }

  has(key: string): boolean {
    return this.entries.has(key)
  }

  delete(key: string): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false
    this.totalSize -= entry.size
    return this.entries.delete(key)
  }

  clear(): void {
    this.entries.clear()
    this.totalSize = 0
    this.orderCounter = 0
  }

  size(): number {
    return this.totalSize
  }

  keys(): string[] {
    return [...this.entries.keys()]
  }

  getStats(): { entries: number; totalSize: number } {
    return {
      entries: this.entries.size,
      totalSize: this.totalSize,
    }
  }

  evict(): string | null {
    if (this.entries.size === 0) return null

    let lruKey: string | null = null
    let lruOrder = Infinity

    for (const entry of this.entries.values()) {
      if (entry.order < lruOrder) {
        lruOrder = entry.order
        lruKey = entry.key
      }
    }

    if (lruKey !== null) {
      this.delete(lruKey)
      return lruKey
    }

    return null
  }

  getEntry(key: string): CacheEntry | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    return {
      key: entry.key,
      value: entry.value,
      createdAt: 0,
      accessedAt: entry.order,
      ttl: 0,
      size: entry.size,
      tags: [],
      metadata: {},
    }
  }
}
