export type SnapshotType2 = 'full' | 'incremental' | 'differential'

export interface StateSnapshot2 {
  id: string
  version: number
  type: SnapshotType2
  parentId: string | null
  data: Record<string, unknown>
  createdAt: number
  size: number
  hash: string
  compressed: boolean
}

export class SnapshotManager2 {
  private snapshots: Map<string, StateSnapshot2> = new Map()
  private versionIndex: Map<number, string> = new Map()
  private current: Record<string, unknown> = {}
  private version: number = 0
  private maxSnapshots: number = 100
  private idCounter = 0
  private listeners: Array<(event: string, snapshot: StateSnapshot2) => void> = []

  setMaxSnapshots(n: number): this { this.maxSnapshots = n; return this }

  private hash(data: Record<string, unknown>): string {
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    return `h_${Math.abs(hash)}`
  }

  setState(key: string, value: unknown): void {
    this.current[key] = value
    this.version++
  }

  getState(key: string): unknown {
    return this.current[key]
  }

  deleteState(key: string): boolean {
    if (!(key in this.current)) return false
    delete this.current[key]
    this.version++
    return true
  }

  takeSnapshot(type: SnapshotType2 = 'full', parentId: string | null = null): string {
    while (this.snapshots.size >= this.maxSnapshots) {
      const oldest = Array.from(this.snapshots.values())[0]
      if (oldest) this.snapshots.delete(oldest.id)
    }

    const id = `snap_${++this.idCounter}`
    const data = type === 'incremental' && parentId
      ? this.diffFromParent(parentId)
      : { ...this.current }

    const snapshot: StateSnapshot2 = {
      id, version: this.version, type, parentId,
      data,
      createdAt: Date.now(),
      size: JSON.stringify(data).length,
      hash: this.hash(data),
      compressed: false,
    }
    this.snapshots.set(id, snapshot)
    this.versionIndex.set(snapshot.version, id)
    this.notify('snapshot-taken', snapshot)
    return id
  }

  private diffFromParent(parentId: string): Record<string, unknown> {
    const parent = this.snapshots.get(parentId)
    if (!parent) return { ...this.current }
    const diff: Record<string, unknown> = {}
    for (const key of Object.keys(this.current)) {
      if (JSON.stringify(parent.data[key]) !== JSON.stringify(this.current[key])) {
        diff[key] = this.current[key]
      }
    }
    return diff
  }

  restore(snapshotId: string): boolean {
    const snapshot = this.snapshots.get(snapshotId)
    if (!snapshot) return false
    this.current = { ...snapshot.data }
    this.version = snapshot.version
    this.notify('restored', snapshot)
    return true
  }

  get(id: string): StateSnapshot2 | undefined { return this.snapshots.get(id) }
  getByVersion(version: number): StateSnapshot2 | undefined {
    const id = this.versionIndex.get(version)
    return id ? this.snapshots.get(id) : undefined
  }

  getLatest(): StateSnapshot2 | null {
    const snaps = Array.from(this.snapshots.values())
    if (snaps.length === 0) return null
    return snaps.reduce((latest, s) => s.version > latest.version ? s : latest)
  }

  getByType(type: SnapshotType2): StateSnapshot2[] {
    return Array.from(this.snapshots.values()).filter(s => s.type === type)
  }

  delete(id: string): boolean {
    const snap = this.snapshots.get(id)
    if (!snap) return false
    this.snapshots.delete(id)
    this.versionIndex.delete(snap.version)
    this.notify('snapshot-deleted', snap)
    return true
  }

  compact(): number {
    const snaps = Array.from(this.snapshots.values()).sort((a, b) => a.version - b.version)
    let deleted = 0
    for (let i = 0; i < snaps.length - this.maxSnapshots; i++) {
      this.delete(snaps[i].id)
      deleted++
    }
    return deleted
  }

  getVersion(): number { return this.version }
  getSnapshotCount(): number { return this.snapshots.size }

  listen(fn: (event: string, snapshot: StateSnapshot2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, snapshot: StateSnapshot2): void {
    this.listeners.forEach(fn => fn(event, snapshot))
  }

  getStats(): { snapshots: number; version: number; latestSize: number; types: { full: number; incremental: number; differential: number } } {
    return {
      snapshots: this.snapshots.size,
      version: this.version,
      latestSize: this.getLatest()?.size || 0,
      types: {
        full: this.getByType('full').length,
        incremental: this.getByType('incremental').length,
        differential: this.getByType('differential').length,
      },
    }
  }

  count(): number { return this.snapshots.size }

  toArray(): StateSnapshot2[] { return Array.from(this.snapshots.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): SnapshotManager2 {
    const sm = new SnapshotManager2()
    sm.current = { ...this.current }
    sm.version = this.version
    sm.maxSnapshots = this.maxSnapshots
    sm.idCounter = this.idCounter
    this.snapshots.forEach((s, id) => sm.snapshots.set(id, { ...s, data: { ...s.data } }))
    this.versionIndex.forEach((id, ver) => sm.versionIndex.set(ver, id))
    return sm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SnapshotManager2)) return false
    return this.version === other.version
  }
  clear(): void {
    this.snapshots.clear()
    this.versionIndex.clear()
    this.current = {}
    this.version = 0
    this.idCounter = 0
    this.listeners = []
  }
}
