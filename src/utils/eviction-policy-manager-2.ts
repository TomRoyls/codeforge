export type EvictionPolicy2 = 'lru' | 'lfu' | 'fifo' | 'random' | 'ttl'
export type CacheEntryState2 = 'active' | 'expired' | 'evicted'

export interface CacheEntry2 {
  key: string
  value: unknown
  policy: EvictionPolicy2
  state: CacheEntryState2
  createdAt: number
  accessedAt: number
  accessCount: number
  ttl: number
  size: number
  tags: string[]
}

export class EvictionPolicy2Manager {
  private entries: Map<string, CacheEntry2> = new Map()
  private accessOrder: string[] = []
  private maxSize: number = 1000
  private defaultTtl: number = 0
  private listeners: Array<(event: string, entry: CacheEntry2) => void> = []
  private idCounter = 0
  private stats = { hits: 0, misses: 0, evictions: 0, expirations: 0 }

  setMaxSize(n: number): this { this.maxSize = n; return this }
  setDefaultTtl(ms: number): this { this.defaultTtl = ms; return this }

  put(key: string, value: unknown, policy: EvictionPolicy2 = 'lru', size = 1, ttl = this.defaultTtl, tags: string[] = []): void {
    while (this.entries.size >= this.maxSize) this.evictOne()
    const now = Date.now()
    const entry: CacheEntry2 = {
      key, value, policy, size, ttl, tags,
      state: 'active',
      createdAt: now,
      accessedAt: now,
      accessCount: 0,
    }
    this.entries.set(key, entry)
    this.accessOrder.push(key)
    this.notify('put', entry)
  }

  get(key: string): unknown {
    const entry = this.entries.get(key)
    if (!entry) { this.stats.misses++; return undefined }
    if (this.isExpired(entry)) {
      this.expire(key)
      this.stats.misses++
      return undefined
    }
    entry.accessedAt = Date.now()
    entry.accessCount++
    this.stats.hits++
    this.updateAccessOrder(key)
    this.notify('hit', entry)
    return entry.value
  }

  peek(key: string): unknown {
    const entry = this.entries.get(key)
    return entry ? entry.value : undefined
  }

  has(key: string): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false
    if (this.isExpired(entry)) { this.expire(key); return false }
    return true
  }

  remove(key: string): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false
    entry.state = 'evicted'
    this.entries.delete(key)
    this.accessOrder = this.accessOrder.filter(k => k !== key)
    this.notify('removed', entry)
    return true
  }

  private isExpired(entry: CacheEntry2): boolean {
    if (entry.ttl <= 0) return false
    return Date.now() - entry.createdAt >= entry.ttl
  }

  private expire(key: string): void {
    const entry = this.entries.get(key)
    if (!entry) return
    entry.state = 'expired'
    this.entries.delete(key)
    this.accessOrder = this.accessOrder.filter(k => k !== key)
    this.stats.expirations++
    this.notify('expired', entry)
  }

  evictOne(): CacheEntry2 | null {
    if (this.entries.size === 0) return null
    let victimKey: string | null = null
    const policies = new Set(Array.from(this.entries.values()).map(e => e.policy))
    if (policies.size === 1) {
      victimKey = this.selectVictin(Array.from(policies)[0])
    } else {
      victimKey = this.selectVictin('lru')
    }
    if (!victimKey) victimKey = this.accessOrder[0]
    const entry = this.entries.get(victimKey)
    if (!entry) return null
    entry.state = 'evicted'
    this.entries.delete(victimKey)
    this.accessOrder = this.accessOrder.filter(k => k !== victimKey)
    this.stats.evictions++
    this.notify('evicted', entry)
    return entry
  }

  private selectVictin(policy: EvictionPolicy2): string | null {
    if (this.accessOrder.length === 0) return null
    switch (policy) {
      case 'lru': {
        return this.accessOrder.reduce((oldest, key) => {
          const e = this.entries.get(key)
          return e && (!oldest || e.accessedAt < (this.entries.get(oldest)?.accessedAt ?? Infinity)) ? key : oldest
        }, this.accessOrder[0])
      }
      case 'lfu': {
        return this.accessOrder.reduce((min, key) => {
          const e = this.entries.get(key)
          return e && (!min || e.accessCount < (this.entries.get(min)?.accessCount ?? Infinity)) ? key : min
        }, this.accessOrder[0])
      }
      case 'fifo':
        return this.accessOrder[0]
      case 'random':
        return this.accessOrder[Math.floor(Math.random() * this.accessOrder.length)]
      case 'ttl': {
        return this.accessOrder.reduce((oldest, key) => {
          const e = this.entries.get(key)
          return e && (!oldest || e.createdAt < (this.entries.get(oldest)?.createdAt ?? Infinity)) ? key : oldest
        }, this.accessOrder[0])
      }
    }
  }

  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key)
    this.accessOrder.push(key)
  }

  purgeExpired(): number {
    let count = 0
    const now = Date.now()
    this.entries.forEach((entry, key) => {
      if (entry.ttl > 0 && now - entry.createdAt >= entry.ttl) {
        this.expire(key)
        count++
      }
    })
    return count
  }

  getByTag(tag: string): CacheEntry2[] {
    return Array.from(this.entries.values()).filter(e => e.tags.includes(tag))
  }

  touch(key: string): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false
    entry.accessedAt = Date.now()
    entry.accessCount++
    this.updateAccessOrder(key)
    return true
  }

  resize(newSize: number): number {
    let evicted = 0
    this.maxSize = newSize
    while (this.entries.size > this.maxSize) {
      if (this.evictOne()) evicted++
      else break
    }
    return evicted
  }

  listen(fn: (event: string, entry: CacheEntry2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, entry: CacheEntry2): void {
    this.listeners.forEach(fn => fn(event, entry))
  }

  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total === 0 ? 0 : this.stats.hits / total
  }

  getSize(): number { return this.entries.size }
  getTotalBytes(): number { return Array.from(this.entries.values()).reduce((s, e) => s + e.size, 0) }

  getStats(): { size: number; maxSize: number; hits: number; misses: number; evictions: number; expirations: number; hitRate: number } {
    return { ...this.stats, size: this.entries.size, maxSize: this.maxSize, hitRate: this.getHitRate() }
  }

  count(): number { return this.entries.size }

  toArray(): CacheEntry2[] { return Array.from(this.entries.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): EvictionPolicy2Manager {
    const epm = new EvictionPolicy2Manager()
    this.entries.forEach((e, key) => epm.entries.set(key, { ...e, tags: [...e.tags] }))
    epm.accessOrder = [...this.accessOrder]
    epm.maxSize = this.maxSize
    epm.defaultTtl = this.defaultTtl
    epm.stats = { ...this.stats }
    return epm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof EvictionPolicy2Manager)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.entries.clear()
    this.accessOrder = []
    this.listeners = []
    this.stats = { hits: 0, misses: 0, evictions: 0, expirations: 0 }
    this.idCounter = 0
  }
}
