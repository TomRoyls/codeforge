export type ShardState2 = 'active' | 'draining' | 'disabled'

export interface Shard2 {
  id: number
  name: string
  state: ShardState2
  entries: Map<string, unknown>
  createdAt: number
  weight: number
}

export class CacheShard2 {
  private shards: Map<number, Shard2> = new Map()
  private shardCount: number = 4
  private hashFn: (key: string) => number
  private listeners: Array<(event: string, shard: Shard2) => void> = []
  private idCounter = 0
  private totalGets = 0
  private totalPuts = 0
  private rebalanceInProgress = false

  constructor(shardCount = 4, hashFn?: (key: string) => number) {
    this.shardCount = shardCount
    this.hashFn = hashFn || ((key: string) => {
      let hash = 0
      for (let i = 0; i < key.length; i++) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0
      return Math.abs(hash)
    })
    for (let i = 0; i < shardCount; i++) this.createShard(i, `shard_${i}`)
  }

  private createShard(id: number, name: string): Shard2 {
    const shard: Shard2 = {
      id, name, state: 'active',
      entries: new Map(),
      createdAt: Date.now(),
      weight: 1,
    }
    this.shards.set(id, shard)
    return shard
  }

  private getShardId(key: string): number {
    return this.hashFn(key) % this.shardCount
  }

  put(key: string, value: unknown): void {
    const shardId = this.getShardId(key)
    const shard = this.shards.get(shardId)
    if (!shard || shard.state === 'disabled') return
    shard.entries.set(key, value)
    this.totalPuts++
    this.notify('put', shard)
  }

  get(key: string): unknown {
    const shardId = this.getShardId(key)
    const shard = this.shards.get(shardId)
    if (!shard) return undefined
    this.totalGets++
    return shard.entries.get(key)
  }

  has(key: string): boolean {
    const shardId = this.getShardId(key)
    const shard = this.shards.get(shardId)
    return shard ? shard.entries.has(key) : false
  }

  remove(key: string): boolean {
    const shardId = this.getShardId(key)
    const shard = this.shards.get(shardId)
    if (!shard) return false
    return shard.entries.delete(key)
  }

  getShard(id: number): Shard2 | undefined { return this.shards.get(id) }

  getShardForKey(key: string): Shard2 | undefined {
    return this.shards.get(this.getShardId(key))
  }

  getAllShards(): Shard2[] { return Array.from(this.shards.values()) }
  getActiveShards(): Shard2[] { return this.getAllShards().filter(s => s.state === 'active') }
  getDisabledShards(): Shard2[] { return this.getAllShards().filter(s => s.state === 'disabled') }

  drainShard(id: number): number {
    const shard = this.shards.get(id)
    if (!shard) return 0
    shard.state = 'draining'
    let moved = 0
    shard.entries.forEach((value, key) => {
      shard.entries.delete(key)
      this.put(key, value)
      moved++
    })
    shard.state = 'disabled'
    this.notify('drained', shard)
    return moved
  }

  enableShard(id: number): boolean {
    const shard = this.shards.get(id)
    if (!shard) return false
    shard.state = 'active'
    this.notify('enabled', shard)
    return true
  }

  disableShard(id: number): boolean {
    const shard = this.shards.get(id)
    if (!shard) return false
    shard.state = 'disabled'
    this.notify('disabled', shard)
    return true
  }

  setWeight(id: number, weight: number): boolean {
    const shard = this.shards.get(id)
    if (!shard) return false
    shard.weight = weight
    return true
  }

  getImbalance(): { min: number; max: number; ratio: number } {
    const sizes = this.getAllShards().map(s => s.entries.size)
    if (sizes.length === 0) return { min: 0, max: 0, ratio: 1 }
    const min = Math.min(...sizes)
    const max = Math.max(...sizes)
    return { min, max, ratio: max === 0 ? 1 : min / max }
  }

  rebalance(): number {
    if (this.rebalanceInProgress) return 0
    this.rebalanceInProgress = true
    let moved = 0
    this.shards.forEach(shard => {
      shard.entries.forEach((value, key) => {
        const correctShard = this.getShardId(key)
        if (correctShard !== shard.id) {
          shard.entries.delete(key)
          this.put(key, value)
          moved++
        }
      })
    })
    this.rebalanceInProgress = false
    this.notify('rebalanced', this.getAllShards()[0])
    return moved
  }

  addShard(name: string): number {
    const id = ++this.idCounter + this.shardCount
    this.createShard(id, name)
    return id
  }

  removeShard(id: number): boolean {
    const shard = this.shards.get(id)
    if (!shard) return false
    shard.entries.forEach((value, key) => {
      shard.entries.delete(key)
      this.put(key, value)
    })
    this.shards.delete(id)
    return true
  }

  listen(fn: (event: string, shard: Shard2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, shard: Shard2): void {
    this.listeners.forEach(fn => fn(event, shard))
  }

  getTotalEntries(): number {
    return Array.from(this.shards.values()).reduce((s, shard) => s + shard.entries.size, 0)
  }

  getStats(): { shards: number; totalEntries: number; gets: number; puts: number; active: number; disabled: number } {
    return {
      shards: this.shards.size,
      totalEntries: this.getTotalEntries(),
      gets: this.totalGets,
      puts: this.totalPuts,
      active: this.getActiveShards().length,
      disabled: this.getDisabledShards().length,
    }
  }

  count(): number { return this.getTotalEntries() }

  toArray(): Shard2[] { return Array.from(this.shards.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): CacheShard2 {
    const cs = new CacheShard2(this.shardCount, this.hashFn)
    cs.totalGets = this.totalGets
    cs.totalPuts = this.totalPuts
    return cs
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CacheShard2)) return false
    return this.getTotalEntries() === other.getTotalEntries()
  }
  clear(): void {
    this.shards.forEach(s => s.entries.clear())
    this.listeners = []
    this.totalGets = 0
    this.totalPuts = 0
  }
}
