export type MigrationState2 = 'pending' | 'running' | 'completed' | 'failed' | 'rolled-back'
export type MigrationType2 = 'schema' | 'data' | 'seed' | 'index' | 'constraint'

export interface MigrationStep2 {
  id: string
  order: number
  type: MigrationType2
  description: string
  upSql: string
  downSql: string
  state: MigrationState2
  duration: number | null
  error: string | null
  affectedRows: number
}

export interface Migration2 {
  id: string
  version: string
  name: string
  steps: MigrationStep2[]
  state: MigrationState2
  createdAt: number
  executedAt: number | null
  completedAt: number | null
  rolledBackAt: number | null
  checksum: string
  author: string
  dependencies: string[]
  dryRun: boolean
  savepoint: string | null
}

export class MigrationCoordinator2 {
  private migrations: Map<string, Migration2> = new Map()
  private appliedVersions: string[] = []
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private stepCounter = 0
  private dryRunMode: boolean = false

  setDryRun(enabled: boolean): this { this.dryRunMode = enabled; return this }

  register(version: string, name: string, author: string = 'system'): string {
    const id = `mig_${++this.idCounter}`
    const migration: Migration2 = {
      id, version, name,
      steps: [],
      state: 'pending',
      createdAt: Date.now(),
      executedAt: null,
      completedAt: null,
      rolledBackAt: null,
      checksum: this.checksum(version + name),
      author,
      dependencies: [],
      dryRun: this.dryRunMode,
      savepoint: null,
    }
    this.migrations.set(id, migration)
    this.notify('migration-registered', { id, version })
    return id
  }

  addStep(migrationId: string, type: MigrationType2, description: string, upSql: string, downSql: string = ''): string {
    const mig = this.migrations.get(migrationId)
    if (!mig) return ''
    const stepId = `step_${++this.stepCounter}`
    const step: MigrationStep2 = {
      id: stepId,
      order: mig.steps.length + 1,
      type, description, upSql, downSql,
      state: 'pending',
      duration: null,
      error: null,
      affectedRows: 0,
    }
    mig.steps.push(step)
    return stepId
  }

  addDependency(migrationId: string, depVersion: string): boolean {
    const mig = this.migrations.get(migrationId)
    if (!mig) return false
    if (!mig.dependencies.includes(depVersion)) mig.dependencies.push(depVersion)
    return true
  }

  execute(migrationId: string): boolean {
    const mig = this.migrations.get(migrationId)
    if (!mig || mig.state !== 'pending') return false
    for (const dep of mig.dependencies) {
      if (!this.appliedVersions.includes(dep)) return false
    }
    mig.state = 'running'
    mig.executedAt = Date.now()
    mig.savepoint = `sp_${migrationId}`
    this.notify('migration-started', { migrationId })

    let allPassed = true
    for (const step of mig.steps) {
      step.state = 'running'
      const start = Date.now()
      try {
        step.affectedRows = Math.floor(Math.random() * 100)
        step.state = 'completed'
        step.duration = Date.now() - start
        this.notify('step-completed', { migrationId, stepId: step.id })
      } catch (e) {
        step.state = 'failed'
        step.error = String(e)
        step.duration = Date.now() - start
        allPassed = false
        this.notify('step-failed', { migrationId, stepId: step.id })
        break
      }
    }

    if (allPassed) {
      mig.state = 'completed'
      mig.completedAt = Date.now()
      if (!this.appliedVersions.includes(mig.version)) this.appliedVersions.push(mig.version)
      this.notify('migration-completed', { migrationId })
    } else {
      mig.state = 'failed'
      this.notify('migration-failed', { migrationId })
    }
    return allPassed
  }

  rollback(migrationId: string): boolean {
    const mig = this.migrations.get(migrationId)
    if (!mig || mig.state !== 'completed') return false
    const reversedSteps = [...mig.steps].reverse()
    for (const step of reversedSteps) {
      step.state = 'rolled-back'
    }
    mig.state = 'rolled-back'
    mig.rolledBackAt = Date.now()
    this.appliedVersions = this.appliedVersions.filter(v => v !== mig.version)
    this.notify('migration-rolled-back', { migrationId })
    return true
  }

  getPending(): Migration2[] { return Array.from(this.migrations.values()).filter(m => m.state === 'pending') }
  getApplied(): string[] { return [...this.appliedVersions] }
  getByVersion(version: string): Migration2 | undefined { return Array.from(this.migrations.values()).find(m => m.version === version) }
  getByState(state: MigrationState2): Migration2[] { return Array.from(this.migrations.values()).filter(m => m.state === state) }

  getStep(migrationId: string, stepId: string): MigrationStep2 | undefined {
    const mig = this.migrations.get(migrationId)
    if (!mig) return undefined
    return mig.steps.find(s => s.id === stepId)
  }

  verifyChecksum(migrationId: string): boolean {
    const mig = this.migrations.get(migrationId)
    if (!mig) return false
    return mig.checksum === this.checksum(mig.version + mig.name)
  }

  getExecutionOrder(): Migration2[] {
    return Array.from(this.migrations.values())
      .filter(m => m.state === 'pending')
      .sort((a, b) => a.version.localeCompare(b.version))
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  private checksum(data: string): string {
    let h = 0
    for (let i = 0; i < data.length; i++) h = ((h << 5) - h + data.charCodeAt(i)) | 0
    return `cs_${Math.abs(h).toString(16)}`
  }

  getStats(): { total: number; pending: number; completed: number; failed: number; rolledBack: number; applied: number } {
    return {
      total: this.migrations.size,
      pending: this.getByState('pending').length,
      completed: this.getByState('completed').length,
      failed: this.getByState('failed').length,
      rolledBack: this.getByState('rolled-back').length,
      applied: this.appliedVersions.length,
    }
  }

  count(): number { return this.migrations.size }

  toArray(): Migration2[] { return Array.from(this.migrations.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): MigrationCoordinator2 {
    const mc = new MigrationCoordinator2()
    mc.idCounter = this.idCounter
    mc.stepCounter = this.stepCounter
    mc.dryRunMode = this.dryRunMode
    mc.appliedVersions = [...this.appliedVersions]
    return mc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MigrationCoordinator2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.migrations.clear()
    this.appliedVersions = []
    this.listeners = []
    this.idCounter = 0
    this.stepCounter = 0
  }
}
