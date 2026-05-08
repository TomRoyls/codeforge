import type { Migration, MigrationStep } from './types.js'

export class MigrationStore {
  private migrations: Map<string, Migration> = new Map()
  private versionIndex: Map<number, string> = new Map()

  add(migration: Migration): void {
    const existing = this.migrations.get(migration.id)
    if (existing) {
      this.versionIndex.delete(existing.version)
    }
    this.migrations.set(migration.id, migration)
    this.versionIndex.set(migration.version, migration.id)
  }

  get(id: string): Migration | null {
    return this.migrations.get(id) ?? null
  }

  getByVersion(version: number): Migration | null {
    const id = this.versionIndex.get(version)
    if (!id) return null
    return this.migrations.get(id) ?? null
  }

  getAll(): Migration[] {
    return Array.from(this.migrations.values()).sort((a, b) => a.version - b.version)
  }

  getPending(applied: Set<string>): Migration[] {
    return this.getAll().filter((m) => !applied.has(m.id))
  }

  getLatest(): Migration | null {
    const all = this.getAll()
    return all.length > 0 ? all[all.length - 1]! : null
  }

  remove(id: string): boolean {
    const migration = this.migrations.get(id)
    if (!migration) return false
    this.versionIndex.delete(migration.version)
    this.migrations.delete(id)
    return true
  }

  size(): number {
    return this.migrations.size
  }

  validate(migration: Migration): string[] {
    const errors: string[] = []

    if (!migration.id || migration.id.trim() === '') {
      errors.push('Migration id is required')
    }

    if (!migration.name || migration.name.trim() === '') {
      errors.push('Migration name is required')
    }

    if (typeof migration.version !== 'number' || migration.version < 0) {
      errors.push('Migration version must be a non-negative number')
    }

    if (!Array.isArray(migration.up)) {
      errors.push('Migration up steps must be an array')
    } else {
      const upErrors = this.validateSteps(migration.up)
      for (const e of upErrors) errors.push(`up: ${e}`)
    }

    if (!Array.isArray(migration.down)) {
      errors.push('Migration down steps must be an array')
    } else {
      const downErrors = this.validateSteps(migration.down)
      for (const e of downErrors) errors.push(`down: ${e}`)
    }

    if (!migration.checksum || migration.checksum.trim() === '') {
      errors.push('Migration checksum is required')
    }

    if (typeof migration.createdAt !== 'number' || migration.createdAt <= 0) {
      errors.push('Migration createdAt must be a positive timestamp')
    }

    const duplicate = this.getByVersion(migration.version)
    if (duplicate && duplicate.id !== migration.id) {
      errors.push(`Migration version ${migration.version} is already used by migration "${duplicate.id}"`)
    }

    const existingById = this.get(migration.id)
    if (existingById && existingById.version !== migration.version) {
      errors.push(`Migration id "${migration.id}" already exists with a different version`)
    }

    return errors
  }

  calculateChecksum(migration: Migration): string {
    const upStr = JSON.stringify(migration.up)
    const downStr = JSON.stringify(migration.down)
    const data = `${migration.name}:${migration.version}:${upStr}:${downStr}`
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  private validateSteps(steps: MigrationStep[]): string[] {
    const errors: string[] = []
    const validTypes = new Set(['create', 'alter', 'drop', 'insert', 'update', 'delete', 'custom'])

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!
      if (!validTypes.has(step.type)) {
        errors.push(`Step ${i}: invalid type "${step.type}"`)
      }
      if (!step.target || step.target.trim() === '') {
        errors.push(`Step ${i}: target is required`)
      }
      if (typeof step.params !== 'object' || step.params === null) {
        errors.push(`Step ${i}: params must be an object`)
      }
    }

    return errors
  }
}
