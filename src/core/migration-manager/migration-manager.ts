import { MigrationStore } from './migration-store.js'
import { MigrationRunner } from './migration-runner.js'
import type {
  Migration,
  MigrationStep,
  MigrationRecord,
  MigrationPlan,
  MigrationResult,
  MigrationManagerConfig,
} from './types.js'
import { DEFAULT_MIGRATION_MANAGER_CONFIG } from './types.js'

export class MigrationManager {
  private store: MigrationStore
  private runner: MigrationRunner
  private history: MigrationRecord[] = []
  private appliedIds: Set<string> = new Set()
  private config: MigrationManagerConfig

  constructor(config?: Partial<MigrationManagerConfig>) {
    this.config = { ...DEFAULT_MIGRATION_MANAGER_CONFIG, ...config }
    this.store = new MigrationStore()
    this.runner = new MigrationRunner()
  }

  register(migration: Migration): string {
    if (this.config.validateOnLoad) {
      const errors = this.store.validate(migration)
      if (errors.length > 0) {
        throw new Error(`Invalid migration: ${errors.join(', ')}`)
      }
    }

    if (this.config.autoChecksum) {
      const checksum = this.store.calculateChecksum(migration)
      migration = { ...migration, checksum }
    }

    const existingRecord = this.history.find((r) => r.migrationId === migration.id && r.status === 'applied')
    if (existingRecord && existingRecord.checksum !== migration.checksum) {
      throw new Error(`Checksum mismatch for applied migration "${migration.id}"`)
    }

    this.store.add(migration)
    return migration.id
  }

  migrate(targetVersion?: number): MigrationResult[] {
    const pending = this.store.getPending(this.appliedIds)
    const results: MigrationResult[] = []

    const toApply = targetVersion !== undefined
      ? pending.filter((m) => m.version <= targetVersion)
      : pending

    for (const migration of toApply) {
      let result = this.runner.runUp(migration, this.config.dryRun)
      let retries = 0

      while (result.status === 'failed' && retries < this.config.maxRetries) {
        retries++
        result = this.runner.runUp(migration, this.config.dryRun)
      }

      if (result.status === 'success' && !this.config.dryRun) {
        this.appliedIds.add(migration.id)
        this.history.push({
          migrationId: migration.id,
          version: migration.version,
          appliedAt: Date.now(),
          checksum: migration.checksum,
          executionTime: result.executionTime,
          status: 'applied',
        })
      }

      results.push(result)

      if (result.status === 'failed' && this.config.stopOnError) {
        break
      }
    }

    return results
  }

  rollback(steps: number = 1): MigrationResult[] {
    const applied = this.history.filter((r) => r.status === 'applied' && this.appliedIds.has(r.migrationId))
    const toRollback = applied.slice(-Math.max(1, steps))
    const results: MigrationResult[] = []

    for (const record of toRollback) {
      const migration = this.store.get(record.migrationId)
      if (!migration) {
        results.push({
          migrationId: record.migrationId,
          status: 'skipped',
          executionTime: 0,
          stepsExecuted: 0,
          error: 'Migration not found',
        })
        continue
      }

      const result = this.runner.runDown(migration, this.config.dryRun)

      if (result.status === 'success' && !this.config.dryRun) {
        this.appliedIds.delete(migration.id)
        this.history.push({
          migrationId: migration.id,
          version: migration.version,
          appliedAt: Date.now(),
          checksum: migration.checksum,
          executionTime: result.executionTime,
          status: 'rolled_back',
        })
      }

      results.push(result)

      if (result.status === 'failed' && this.config.stopOnError) {
        break
      }
    }

    return results
  }

  rollbackTo(version: number): MigrationResult[] {
    const applied = this.history.filter((r) => r.status === 'applied' && this.appliedIds.has(r.migrationId))
    const toRollback = applied.filter((r) => r.version > version)
    const results: MigrationResult[] = []

    for (const record of toRollback.reverse()) {
      const migration = this.store.get(record.migrationId)
      if (!migration) {
        results.push({
          migrationId: record.migrationId,
          status: 'skipped',
          executionTime: 0,
          stepsExecuted: 0,
          error: 'Migration not found',
        })
        continue
      }

      const result = this.runner.runDown(migration, this.config.dryRun)

      if (result.status === 'success' && !this.config.dryRun) {
        this.appliedIds.delete(migration.id)
        this.history.push({
          migrationId: migration.id,
          version: migration.version,
          appliedAt: Date.now(),
          checksum: migration.checksum,
          executionTime: result.executionTime,
          status: 'rolled_back',
        })
      }

      results.push(result)

      if (result.status === 'failed' && this.config.stopOnError) {
        break
      }
    }

    return results
  }

  status(): MigrationPlan {
    const applied = this.history.filter((r) => r.status === 'applied' && this.appliedIds.has(r.migrationId))
    const pending = this.store.getPending(this.appliedIds)
    let currentVersion = 0
    for (let i = 0; i < applied.length; i++) {
      if (applied[i]!.version > currentVersion) currentVersion = applied[i]!.version
    }
    const targetVersion = pending.length > 0 ? pending[pending.length - 1]!.version : currentVersion

    return {
      pending,
      applied,
      currentVersion,
      targetVersion,
      direction: targetVersion > currentVersion ? 'up' : 'down',
    }
  }

  getPending(): Migration[] {
    return this.store.getPending(this.appliedIds)
  }

  getHistory(): MigrationRecord[] {
    return [...this.history]
  }

  validate(): string[] {
    const all = this.store.getAll()
    const errors: string[] = []

    for (const migration of all) {
      const migrationErrors = this.store.validate(migration)
      for (const e of migrationErrors) {
        errors.push(`[${migration.id}]: ${e}`)
      }
    }

    return errors
  }

  createMigration(name: string, steps?: { up: MigrationStep[]; down: MigrationStep[] }): Migration {
    const all = this.store.getAll()
    const version = all.length > 0 ? all[all.length - 1]!.version + 1 : 1

    const up: MigrationStep[] = steps?.up ?? []
    const down: MigrationStep[] = steps?.down ?? []

    const migration: Migration = {
      id: `${version}_${name.replace(/\s+/g, '_').toLowerCase()}`,
      name,
      version,
      up,
      down,
      checksum: '',
      createdAt: Date.now(),
      tags: [],
    }

    migration.checksum = this.store.calculateChecksum(migration)
    return migration
  }

  getConfig(): MigrationManagerConfig {
    return { ...this.config }
  }
}
