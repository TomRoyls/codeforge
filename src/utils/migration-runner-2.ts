export interface Migration2 {
  id: string
  version: number
  description: string
  up: () => void | Promise<void>
  down: () => void | Promise<void>
  executedAt: number | null
}

export class MigrationRunner2 {
  private migrations: Map<string, Migration2> = new Map()
  private currentVersion = 0
  private executed: string[] = []
  private failed: string[] = []

  register(migration: Migration2): this {
    this.migrations.set(migration.id, migration)
    return this
  }

  async runUp(targetVersion?: number): Promise<string[]> {
    const sorted = Array.from(this.migrations.values())
      .filter(m => m.executedAt === null)
      .sort((a, b) => a.version - b.version)

    const run: string[] = []
    for (const m of sorted) {
      if (targetVersion !== undefined && m.version > targetVersion) break
      try {
        await m.up()
        m.executedAt = Date.now()
        this.executed.push(m.id)
        this.currentVersion = m.version
        run.push(m.id)
      } catch {
        this.failed.push(m.id)
        break
      }
    }
    return run
  }

  async runDown(targetVersion: number): Promise<string[]> {
    const sorted = this.executed
      .map(id => this.migrations.get(id))
      .filter(Boolean)
      .sort((a, b) => b!.version - a!.version) as Migration2[]

    const run: string[] = []
    for (const m of sorted) {
      if (m.version <= targetVersion) break
      try {
        await m.down()
        m.executedAt = null
        this.executed = this.executed.filter(id => id !== m.id)
        run.push(m.id)
      } catch {
        this.failed.push(m.id)
        break
      }
    }
    const last = this.executed[this.executed.length - 1]
    this.currentVersion = last ? this.migrations.get(last)!.version : 0
    return run
  }

  getCurrentVersion(): number { return this.currentVersion }
  getExecuted(): string[] { return [...this.executed] }
  getFailed(): string[] { return [...this.failed] }
  getPending(): Migration2[] {
    return Array.from(this.migrations.values())
      .filter(m => m.executedAt === null)
      .sort((a, b) => a.version - b.version)
  }

  getMigration(id: string): Migration2 | undefined { return this.migrations.get(id) }
  getAllMigrations(): Migration2[] {
    return Array.from(this.migrations.values()).sort((a, b) => a.version - b.version)
  }

  isExecuted(id: string): boolean { return this.executed.includes(id) }

  count(): number { return this.migrations.size }
  getExecutedCount(): number { return this.executed.length }
  getPendingCount(): number { return this.getPending().length }

  toArray(): string[] { return this.getAllMigrations().map(m => m.id) }
  toString(): string { return JSON.stringify({ total: this.count(), executed: this.getExecutedCount(), pending: this.getPendingCount() }) }
  toJSON(): Record<string, unknown> { return { total: this.count(), executed: this.getExecutedCount(), pending: this.getPendingCount(), currentVersion: this.currentVersion } }
  clone(): MigrationRunner2 {
    const mr = new MigrationRunner2()
    this.migrations.forEach((m, id) => mr.migrations.set(id, { ...m }))
    mr.currentVersion = this.currentVersion
    mr.executed = [...this.executed]
    mr.failed = [...this.failed]
    return mr
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MigrationRunner2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.migrations.clear()
    this.currentVersion = 0
    this.executed = []
    this.failed = []
  }
}
