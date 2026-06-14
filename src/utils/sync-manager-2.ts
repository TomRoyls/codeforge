export type SyncState2 = 'idle' | 'syncing' | 'error' | 'paused'

export interface SyncConflict2 {
  id: string
  key: string
  localValue: unknown
  remoteValue: unknown
  timestamp: number
  resolved: boolean
  resolution: 'local' | 'remote' | 'merged' | null
}

export interface SyncRecord2 {
  key: string
  localVersion: number
  remoteVersion: number
  dirty: boolean
  lastSynced: number
}

export class SyncManager2 {
  private records: Map<string, SyncRecord2> = new Map()
  private conflicts: Map<string, SyncConflict2> = new Map()
  private state: SyncState2 = 'idle'
  private lastSyncTime = 0
  private syncCount = 0
  private errorCount = 0
  private conflictIdCounter = 0
  private autoResolve: boolean

  constructor(autoResolve = false) {
    this.autoResolve = autoResolve
  }

  register(key: string): this {
    if (!this.records.has(key)) {
      this.records.set(key, {
        key, localVersion: 0, remoteVersion: 0,
        dirty: false, lastSynced: 0,
      })
    }
    return this
  }

  markDirty(key: string): boolean {
    const record = this.records.get(key)
    if (!record) return false
    record.dirty = true
    record.localVersion++
    return true
  }

  markClean(key: string): boolean {
    const record = this.records.get(key)
    if (!record) return false
    record.dirty = false
    record.lastSynced = Date.now()
    return true
  }

  getDirty(): string[] {
    return Array.from(this.records.values()).filter(r => r.dirty).map(r => r.key)
  }

  getDirtyCount(): number {
    return Array.from(this.records.values()).filter(r => r.dirty).length
  }

  detectConflict(key: string, localVersion: number, remoteVersion: number): SyncConflict2 | null {
    const record = this.records.get(key)
    if (!record) return null
    if (record.localVersion > localVersion && record.remoteVersion > remoteVersion) return null

    if (record.dirty && remoteVersion > record.remoteVersion) {
      const id = `conflict_${++this.conflictIdCounter}`
      const conflict: SyncConflict2 = {
        id, key,
        localValue: record.localVersion,
        remoteValue: remoteVersion,
        timestamp: Date.now(),
        resolved: false,
        resolution: null,
      }
      if (this.autoResolve) {
        conflict.resolved = true
        conflict.resolution = remoteVersion >= record.localVersion ? 'remote' : 'local'
      } else {
        this.conflicts.set(id, conflict)
      }
      return conflict
    }
    return null
  }

  resolveConflict(id: string, resolution: SyncConflict2['resolution']): boolean {
    const conflict = this.conflicts.get(id)
    if (!conflict || conflict.resolved) return false
    conflict.resolved = true
    conflict.resolution = resolution
    return true
  }

  getConflict(id: string): SyncConflict2 | undefined { return this.conflicts.get(id) }
  getConflicts(): SyncConflict2[] { return Array.from(this.conflicts.values()) }
  getUnresolvedConflicts(): SyncConflict2[] { return Array.from(this.conflicts.values()).filter(c => !c.resolved) }
  getResolvedConflicts(): SyncConflict2[] { return Array.from(this.conflicts.values()).filter(c => c.resolved) }

  startSync(): boolean {
    if (this.state === 'syncing') return false
    this.state = 'syncing'
    return true
  }

  completeSync(): void {
    this.state = 'idle'
    this.lastSyncTime = Date.now()
    this.syncCount++
    this.records.forEach(r => {
      if (r.dirty) {
        r.dirty = false
        r.lastSynced = Date.now()
      }
    })
  }

  failSync(): void {
    this.state = 'error'
    this.errorCount++
  }

  pauseSync(): void { this.state = 'paused' }
  resumeSync(): void { if (this.state === 'paused') this.state = 'idle' }

  getState(): SyncState2 { return this.state }
  getLastSyncTime(): number { return this.lastSyncTime }
  getSyncCount(): number { return this.syncCount }
  getErrorCount(): number { return this.errorCount }

  getRecord(key: string): SyncRecord2 | undefined { return this.records.get(key) }
  getAllRecords(): SyncRecord2[] { return Array.from(this.records.values()) }

  count(): number { return this.records.size }
  getConflictCount(): number { return this.conflicts.size }

  toArray(): string[] { return Array.from(this.records.keys()) }
  toString(): string { return JSON.stringify({ records: this.count(), dirty: this.getDirtyCount(), conflicts: this.getConflictCount() }) }
  toJSON(): Record<string, unknown> { return { records: this.count(), dirty: this.getDirtyCount(), conflicts: this.getConflictCount(), state: this.state, syncs: this.syncCount } }
  clone(): SyncManager2 {
    const sm = new SyncManager2(this.autoResolve)
    this.records.forEach((r, k) => sm.records.set(k, { ...r }))
    this.conflicts.forEach((c, id) => sm.conflicts.set(id, { ...c }))
    sm.state = this.state
    sm.lastSyncTime = this.lastSyncTime
    sm.syncCount = this.syncCount
    sm.errorCount = this.errorCount
    sm.conflictIdCounter = this.conflictIdCounter
    return sm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SyncManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.records.clear()
    this.conflicts.clear()
    this.state = 'idle'
    this.lastSyncTime = 0
    this.syncCount = 0
    this.errorCount = 0
    this.conflictIdCounter = 0
  }
}
