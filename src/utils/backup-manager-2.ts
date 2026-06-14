export type BackupStatus2 = 'pending' | 'in-progress' | 'completed' | 'failed' | 'verified' | 'corrupted'
export type BackupType2 = 'full' | 'incremental' | 'differential'
export type StorageLocation2 = 'local' | 's3' | 'gcs' | 'azure' | 'sftp'

export interface Backup2 {
  id: string
  name: string
  type: BackupType2
  status: BackupStatus2
  location: StorageLocation2
  path: string
  size: number
  createdAt: number
  completedAt: number | null
  checksum: string | null
  parentId: string | null
  metadata: Record<string, string>
  retentionDays: number
}

export class BackupManager2 {
  private backups: Map<string, Backup2> = new Map()
  private idCounter = 0
  private defaultLocation: StorageLocation2 = 'local'
  private defaultRetention: number = 30
  private schedule: Map<string, { interval: number; type: BackupType2; lastRun: number }> = new Map()

  create(name: string, type: BackupType2, path: string, location?: StorageLocation2, parentId: string | null = null): string {
    const id = `backup_${++this.idCounter}`
    this.backups.set(id, {
      id, name, type, status: 'pending',
      location: location ?? this.defaultLocation,
      path, size: 0,
      createdAt: Date.now(), completedAt: null,
      checksum: null, parentId,
      metadata: {}, retentionDays: this.defaultRetention,
    })
    return id
  }

  start(id: string): boolean {
    const backup = this.backups.get(id)
    if (!backup || backup.status !== 'pending') return false
    backup.status = 'in-progress'
    return true
  }

  complete(id: string, size: number, checksum: string): boolean {
    const backup = this.backups.get(id)
    if (!backup) return false
    backup.status = 'completed'
    backup.size = size
    backup.checksum = checksum
    backup.completedAt = Date.now()
    return true
  }

  fail(id: string, reason: string): boolean {
    const backup = this.backups.get(id)
    if (!backup) return false
    backup.status = 'failed'
    backup.metadata['failureReason'] = reason
    return true
  }

  verify(id: string): boolean {
    const backup = this.backups.get(id)
    if (!backup || backup.status !== 'completed') return false
    backup.status = backup.checksum ? 'verified' : 'completed'
    return true
  }

  markCorrupted(id: string): boolean {
    const backup = this.backups.get(id)
    if (!backup) return false
    backup.status = 'corrupted'
    return true
  }

  get(id: string): Backup2 | undefined { return this.backups.get(id) }

  getByType(type: BackupType2): Backup2[] {
    return Array.from(this.backups.values()).filter(b => b.type === type)
  }

  getByStatus(status: BackupStatus2): Backup2[] {
    return Array.from(this.backups.values()).filter(b => b.status === status)
  }

  getByLocation(location: StorageLocation2): Backup2[] {
    return Array.from(this.backups.values()).filter(b => b.location === location)
  }

  getCompleted(): Backup2[] { return this.getByStatus('completed').concat(this.getByStatus('verified')) }
  getFailed(): Backup2[] { return this.getByStatus('failed') }
  getCorrupted(): Backup2[] { return this.getByStatus('corrupted') }

  getFullBackups(): Backup2[] { return this.getByType('full') }
  getIncrementalBackups(): Backup2[] { return this.getByType('incremental') }
  getDifferentialBackups(): Backup2[] { return this.getByType('differential') }

  getIncrementalChain(fullBackupId: string): Backup2[] {
    const chain: Backup2[] = []
    const full = this.backups.get(fullBackupId)
    if (!full) return chain
    chain.push(full)
    let children = this.getChildren(fullBackupId)
    while (children.length > 0) {
      chain.push(...children)
      const nextChildren: Backup2[] = []
      children.forEach(c => nextChildren.push(...this.getChildren(c.id)))
      children = nextChildren
    }
    return chain.sort((a, b) => a.createdAt - b.createdAt)
  }

  private getChildren(parentId: string): Backup2[] {
    return Array.from(this.backups.values()).filter(b => b.parentId === parentId)
  }

  setRetention(id: string, days: number): boolean {
    const backup = this.backups.get(id)
    if (!backup) return false
    backup.retentionDays = days
    return true
  }

  addMetadata(id: string, key: string, value: string): boolean {
    const backup = this.backups.get(id)
    if (!backup) return false
    backup.metadata[key] = value
    return true
  }

  addSchedule(name: string, interval: number, type: BackupType2): this {
    this.schedule.set(name, { interval, type, lastRun: 0 })
    return this
  }

  removeSchedule(name: string): boolean { return this.schedule.delete(name) }

  getDueSchedules(): string[] {
    const now = Date.now()
    return Array.from(this.schedule.entries())
      .filter(([_, s]) => now - s.lastRun >= s.interval)
      .map(([name]) => name)
  }

  markScheduleRun(name: string): boolean {
    const s = this.schedule.get(name)
    if (!s) return false
    s.lastRun = Date.now()
    return true
  }

  cleanExpired(): string[] {
    const now = Date.now()
    const expired: string[] = []
    this.backups.forEach((backup, id) => {
      if (now - backup.createdAt >= backup.retentionDays * 24 * 60 * 60 * 1000) {
        this.backups.delete(id)
        expired.push(id)
      }
    })
    return expired
  }

  setDefaultLocation(location: StorageLocation2): this { this.defaultLocation = location; return this }
  setDefaultRetention(days: number): this { this.defaultRetention = days; return this }

  getTotalSize(): number {
    return Array.from(this.backups.values()).reduce((s, b) => s + b.size, 0)
  }

  getStats(): { total: number; completed: number; failed: number; totalSize: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {}
    this.backups.forEach(b => { byType[b.type] = (byType[b.type] ?? 0) + 1 })
    return {
      total: this.backups.size,
      completed: this.getCompleted().length,
      failed: this.getFailed().length,
      totalSize: this.getTotalSize(),
      byType,
    }
  }

  count(): number { return this.backups.size }

  toArray(): Backup2[] { return Array.from(this.backups.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): BackupManager2 {
    const bm = new BackupManager2()
    this.backups.forEach((b, id) => bm.backups.set(id, { ...b, metadata: { ...b.metadata } }))
    bm.idCounter = this.idCounter
    bm.defaultLocation = this.defaultLocation
    bm.defaultRetention = this.defaultRetention
    this.schedule.forEach((s, name) => bm.schedule.set(name, { ...s }))
    return bm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof BackupManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.backups.clear()
    this.schedule.clear()
    this.idCounter = 0
  }
}
