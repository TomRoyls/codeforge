export type CheckpointType2 = 'manual' | 'automatic' | 'scheduled' | 'pre-deploy' | 'post-deploy'
export type CheckpointStatus2 = 'created' | 'restoring' | 'restored' | 'failed' | 'expired'

export interface Checkpoint2 {
  id: string
  name: string
  type: CheckpointType2
  status: CheckpointStatus2
  data: Record<string, unknown>
  metadata: Record<string, string>
  createdAt: number
  size: number
  parentId: string | null
  tags: string[]
}

export class CheckpointStore2 {
  private checkpoints: Map<string, Checkpoint2> = new Map()
  private maxCheckpoints: number = 50
  private maxAge: number = 30 * 24 * 60 * 60 * 1000
  private idCounter = 0
  private compressionEnabled: boolean = true

  create(name: string, type: CheckpointType2, data: Record<string, unknown>, parentId: string | null = null, tags: string[] = []): string {
    const id = `cp_${++this.idCounter}`
    const size = JSON.stringify(data).length
    this.checkpoints.set(id, {
      id, name, type, status: 'created', data, metadata: {},
      createdAt: Date.now(), size, parentId, tags,
    })
    this.evict()
    return id
  }

  get(id: string): Checkpoint2 | undefined { return this.checkpoints.get(id) }

  restore(id: string): Record<string, unknown> | null {
    const cp = this.checkpoints.get(id)
    if (!cp || cp.status === 'expired') return null
    cp.status = 'restoring'
    const data = { ...cp.data }
    cp.status = 'restored'
    return data
  }

  remove(id: string): boolean { return this.checkpoints.delete(id) }

  addMetadata(id: string, key: string, value: string): boolean {
    const cp = this.checkpoints.get(id)
    if (!cp) return false
    cp.metadata[key] = value
    return true
  }

  addTag(id: string, tag: string): boolean {
    const cp = this.checkpoints.get(id)
    if (!cp) return false
    if (!cp.tags.includes(tag)) cp.tags.push(tag)
    return true
  }

  getByName(name: string): Checkpoint2[] {
    return Array.from(this.checkpoints.values()).filter(c => c.name === name)
  }

  getByType(type: CheckpointType2): Checkpoint2[] {
    return Array.from(this.checkpoints.values()).filter(c => c.type === type)
  }

  getByTag(tag: string): Checkpoint2[] {
    return Array.from(this.checkpoints.values()).filter(c => c.tags.includes(tag))
  }

  getChildren(parentId: string): Checkpoint2[] {
    return Array.from(this.checkpoints.values()).filter(c => c.parentId === parentId)
  }

  getRoots(): Checkpoint2[] {
    return Array.from(this.checkpoints.values()).filter(c => c.parentId === null)
  }

  getChain(id: string): Checkpoint2[] {
    const chain: Checkpoint2[] = []
    let current = this.checkpoints.get(id)
    while (current) {
      chain.unshift(current)
      current = current.parentId ? this.checkpoints.get(current.parentId) : undefined
    }
    return chain
  }

  diff(id1: string, id2: string): { added: string[]; removed: string[]; changed: string[] } {
    const cp1 = this.checkpoints.get(id1)
    const cp2 = this.checkpoints.get(id2)
    if (!cp1 || !cp2) return { added: [], removed: [], changed: [] }
    const keys1 = new Set(Object.keys(cp1.data))
    const keys2 = new Set(Object.keys(cp2.data))
    const added = Array.from(keys2).filter(k => !keys1.has(k))
    const removed = Array.from(keys1).filter(k => !keys2.has(k))
    const changed = Array.from(keys1).filter(k => keys2.has(k) && JSON.stringify(cp1.data[k]) !== JSON.stringify(cp2.data[k]))
    return { added, removed, changed }
  }

  fork(id: string, newName: string, newData?: Record<string, unknown>): string | null {
    const parent = this.checkpoints.get(id)
    if (!parent) return null
    const data = newData ?? { ...parent.data }
    return this.create(newName, 'manual', data, id, [...parent.tags])
  }

  private evict(): void {
    if (this.checkpoints.size <= this.maxCheckpoints) return
    const sorted = Array.from(this.checkpoints.values()).sort((a, b) => a.createdAt - b.createdAt)
    while (this.checkpoints.size > this.maxCheckpoints && sorted.length > 0) {
      const oldest = sorted.shift()!
      this.checkpoints.delete(oldest.id)
    }
  }

  cleanExpired(): number {
    const now = Date.now()
    let removed = 0
    this.checkpoints.forEach((cp, id) => {
      if (now - cp.createdAt >= this.maxAge) {
        cp.status = 'expired'
        this.checkpoints.delete(id)
        removed++
      }
    })
    return removed
  }

  setMaxCheckpoints(max: number): this { this.maxCheckpoints = max; return this }
  setMaxAge(ms: number): this { this.maxAge = ms; return this }
  setCompression(enabled: boolean): this { this.compressionEnabled = enabled; return this }

  getTotalSize(): number {
    return Array.from(this.checkpoints.values()).reduce((s, c) => s + c.size, 0)
  }

  getStats(): { total: number; totalSize: number; byType: Record<string, number>; oldest: number | null } {
    const byType: Record<string, number> = {}
    let oldest: number | null = null
    this.checkpoints.forEach(cp => {
      byType[cp.type] = (byType[cp.type] ?? 0) + 1
      if (oldest === null || cp.createdAt < oldest) oldest = cp.createdAt
    })
    return { total: this.checkpoints.size, totalSize: this.getTotalSize(), byType, oldest }
  }

  count(): number { return this.checkpoints.size }

  toArray(): Checkpoint2[] { return Array.from(this.checkpoints.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): CheckpointStore2 {
    const cs = new CheckpointStore2()
    this.checkpoints.forEach((cp, id) => cs.checkpoints.set(id, { ...cp, data: { ...cp.data }, metadata: { ...cp.metadata }, tags: [...cp.tags] }))
    cs.maxCheckpoints = this.maxCheckpoints
    cs.maxAge = this.maxAge
    cs.idCounter = this.idCounter
    return cs
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CheckpointStore2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.checkpoints.clear()
    this.idCounter = 0
  }
}
