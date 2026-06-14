export type MigrationState2 = 'pending' | 'running' | 'completed' | 'failed' | 'rolled-back'
export type MigrationDirection2 = 'up' | 'down'

export interface Migration2 {
  version: number
  name: string
  description: string
  state: MigrationState2
  direction: MigrationDirection2
  upFn: (() => void) | null
  downFn: (() => void) | null
  executedAt: number | null
  duration: number | null
  error: string | null
  checksum: string
}

export class SchemaMigrator2 {
  private migrations: Map<number, Migration2> = new Map()
  private currentVersion: number = 0
  private listeners: Array<(event: string, migration: Migration2) => void> = []
  private lockHolder: string | null = null

  add(version: number, name: string, description: string, upFn: () => void, downFn: (() => void) | null = null): this {
    const migration: Migration2 = {
      version, name, description,
      state: 'pending',
      direction: 'up',
      upFn, downFn,
      executedAt: null,
      duration: null,
      error: null,
      checksum: `cs_${version}_${name.length}`,
    }
    this.migrations.set(version, migration)
    return this
  }

  getCurrentVersion(): number { return this.currentVersion }

  getPending(): Migration2[] {
    return Array.from(this.migrations.values())
      .filter(m => m.state === 'pending' && m.version > this.currentVersion)
      .sort((a, b) => a.version - b.version)
  }

  getExecuted(): Migration2[] {
    return Array.from(this.migrations.values())
      .filter(m => m.state === 'completed')
      .sort((a, b) => a.version - b.version)
  }

  getFailed(): Migration2[] {
    return Array.from(this.migrations.values()).filter(m => m.state === 'failed')
  }

  migrateUp(targetVersion?: number): { applied: number; failed: number } {
    const pending = this.getPending()
    const target = targetVersion ?? Math.max(...this.migrations.keys(), this.currentVersion)
    let applied = 0, failed = 0

    for (const migration of pending) {
      if (migration.version > target) break
      const start = Date.now()
      migration.state = 'running'
      migration.direction = 'up'
      this.notify('migrating', migration)
      try {
        if (migration.upFn) migration.upFn()
        migration.state = 'completed'
        migration.executedAt = Date.now()
        migration.duration = Date.now() - start
        this.currentVersion = migration.version
        applied++
        this.notify('migrated', migration)
      } catch (e) {
        migration.state = 'failed'
        migration.error = String(e)
        migration.duration = Date.now() - start
        failed++
        this.notify('failed', migration)
        break
      }
    }
    return { applied, failed }
  }

  migrateDown(targetVersion: number): { rolledBack: number; failed: number } {
    const executed = this.getExecuted().reverse()
    let rolledBack = 0, failed = 0

    for (const migration of executed) {
      if (migration.version <= targetVersion) break
      if (!migration.downFn) { failed++; break }
      const start = Date.now()
      migration.state = 'running'
      migration.direction = 'down'
      this.notify('rolling-back', migration)
      try {
        migration.downFn()
        migration.state = 'rolled-back'
        migration.duration = Date.now() - start
        rolledBack++
        this.notify('rolled-back', migration)
      } catch (e) {
        migration.state = 'failed'
        migration.error = String(e)
        failed++
        this.notify('failed', migration)
        break
      }
    }
    const remaining = this.getExecuted()
    this.currentVersion = remaining.length > 0 ? remaining[remaining.length - 1].version : 0
    return { rolledBack, failed }
  }

  rollback(version: number): boolean {
    const migration = this.migrations.get(version)
    if (!migration || migration.state !== 'completed' || !migration.downFn) return false
    migration.state = 'running'
    migration.direction = 'down'
    try {
      migration.downFn()
      migration.state = 'rolled-back'
      this.notify('rolled-back', migration)
      const executed = this.getExecuted()
      this.currentVersion = executed.length > 0 ? executed[executed.length - 1].version : 0
      return true
    } catch (e) {
      migration.state = 'failed'
      migration.error = String(e)
      return false
    }
  }

  reset(): boolean {
    const executed = this.getExecuted().reverse()
    for (const m of executed) {
      if (m.downFn) {
        try { m.downFn() } catch { /* ignore */ }
      }
      m.state = 'pending'
    }
    this.currentVersion = 0
    this.notify('reset', Array.from(this.migrations.values())[0])
    return true
  }

  lock(holder: string): boolean {
    if (this.lockHolder) return false
    this.lockHolder = holder
    return true
  }

  unlock(): boolean {
    if (!this.lockHolder) return false
    this.lockHolder = null
    return true
  }

  getMigration(version: number): Migration2 | undefined { return this.migrations.get(version) }

  listen(fn: (event: string, migration: Migration2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, migration: Migration2): void {
    this.listeners.forEach(fn => fn(event, migration))
  }

  getStats(): { total: number; pending: number; completed: number; failed: number; rolledBack: number; currentVersion: number } {
    return {
      total: this.migrations.size,
      pending: this.getPending().length,
      completed: this.getExecuted().length,
      failed: this.getFailed().length,
      rolledBack: Array.from(this.migrations.values()).filter(m => m.state === 'rolled-back').length,
      currentVersion: this.currentVersion,
    }
  }

  count(): number { return this.migrations.size }

  toArray(): Migration2[] { return Array.from(this.migrations.values()).sort((a, b) => a.version - b.version) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): SchemaMigrator2 {
    const sm = new SchemaMigrator2()
    this.migrations.forEach((m, v) => sm.migrations.set(v, { ...m }))
    sm.currentVersion = this.currentVersion
    return sm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SchemaMigrator2)) return false
    return this.currentVersion === other.currentVersion
  }
  clear(): void {
    this.migrations.clear()
    this.currentVersion = 0
    this.listeners = []
    this.lockHolder = null
  }
}
