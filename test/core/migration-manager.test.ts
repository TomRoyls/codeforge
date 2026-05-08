import { describe, it, expect } from 'vitest'
import { MigrationStore } from '../../src/core/migration-manager/migration-store.js'
import { MigrationRunner } from '../../src/core/migration-manager/migration-runner.js'
import { MigrationManager } from '../../src/core/migration-manager/migration-manager.js'
import type { Migration, MigrationStep } from '../../src/core/migration-manager/types.js'
import { DEFAULT_MIGRATION_MANAGER_CONFIG } from '../../src/core/migration-manager/types.js'

function createStep(overrides: Partial<MigrationStep> = {}): MigrationStep {
  return {
    type: 'create',
    target: 'default_target',
    params: { name: 'default' },
    ...overrides,
  }
}

function createMigration(overrides: Partial<Migration> = {}): Migration {
  const version = overrides.version ?? 1
  const target = overrides.id ? `table_${overrides.id}` : 'table_default'
  return {
    id: 'm_default',
    name: 'default migration',
    version,
    up: [createStep({ target })],
    down: [createStep({ type: 'drop', target })],
    checksum: 'abc123',
    createdAt: Date.now(),
    tags: [],
    ...overrides,
  }
}

describe('MigrationStore', () => {
  describe('add', () => {
    it('should add a migration to the store', () => {
      const store = new MigrationStore()
      const migration = createMigration()
      store.add(migration)
      expect(store.size()).toBe(1)
    })

    it('should replace existing migration with same id', () => {
      const store = new MigrationStore()
      const m1 = createMigration({ checksum: 'aaa' })
      const m2 = createMigration({ checksum: 'bbb' })
      store.add(m1)
      store.add(m2)
      expect(store.size()).toBe(1)
      expect(store.get('m_default')!.checksum).toBe('bbb')
    })

    it('should handle multiple migrations with different versions', () => {
      const store = new MigrationStore()
      store.add(createMigration({ id: 'm1', version: 1 }))
      store.add(createMigration({ id: 'm2', version: 2 }))
      store.add(createMigration({ id: 'm3', version: 3 }))
      expect(store.size()).toBe(3)
    })

    it('should clean up version index when replacing migration', () => {
      const store = new MigrationStore()
      store.add(createMigration({ id: 'm1', version: 1 }))
      store.add(createMigration({ id: 'm1', version: 5 }))
      expect(store.getByVersion(1)).toBeNull()
      expect(store.getByVersion(5)).not.toBeNull()
    })
  })

  describe('get', () => {
    it('should return a migration by id', () => {
      const store = new MigrationStore()
      const migration = createMigration()
      store.add(migration)
      expect(store.get('m_default')).toEqual(migration)
    })

    it('should return null for non-existent id', () => {
      const store = new MigrationStore()
      expect(store.get('nonexistent')).toBeNull()
    })
  })

  describe('getByVersion', () => {
    it('should return a migration by version', () => {
      const store = new MigrationStore()
      store.add(createMigration({ version: 3 }))
      expect(store.getByVersion(3)).not.toBeNull()
      expect(store.getByVersion(3)!.version).toBe(3)
    })

    it('should return null for non-existent version', () => {
      const store = new MigrationStore()
      expect(store.getByVersion(999)).toBeNull()
    })
  })

  describe('getAll', () => {
    it('should return all migrations sorted by version', () => {
      const store = new MigrationStore()
      store.add(createMigration({ id: 'm3', version: 3 }))
      store.add(createMigration({ id: 'm1', version: 1 }))
      store.add(createMigration({ id: 'm2', version: 2 }))
      const all = store.getAll()
      expect(all.map((m) => m.version)).toEqual([1, 2, 3])
    })

    it('should return empty array for empty store', () => {
      const store = new MigrationStore()
      expect(store.getAll()).toEqual([])
    })
  })

  describe('getPending', () => {
    it('should return migrations not in applied set', () => {
      const store = new MigrationStore()
      store.add(createMigration({ id: 'm1', version: 1 }))
      store.add(createMigration({ id: 'm2', version: 2 }))
      store.add(createMigration({ id: 'm3', version: 3 }))
      const pending = store.getPending(new Set(['m1']))
      expect(pending).toHaveLength(2)
      expect(pending.map((m) => m.id)).toEqual(['m2', 'm3'])
    })

    it('should return all when nothing applied', () => {
      const store = new MigrationStore()
      store.add(createMigration({ id: 'm1', version: 1 }))
      const pending = store.getPending(new Set())
      expect(pending).toHaveLength(1)
    })

    it('should return empty when all applied', () => {
      const store = new MigrationStore()
      store.add(createMigration({ id: 'm1', version: 1 }))
      const pending = store.getPending(new Set(['m1']))
      expect(pending).toHaveLength(0)
    })
  })

  describe('getLatest', () => {
    it('should return the migration with highest version', () => {
      const store = new MigrationStore()
      store.add(createMigration({ id: 'm1', version: 1 }))
      store.add(createMigration({ id: 'm2', version: 5 }))
      store.add(createMigration({ id: 'm3', version: 3 }))
      expect(store.getLatest()!.version).toBe(5)
    })

    it('should return null for empty store', () => {
      const store = new MigrationStore()
      expect(store.getLatest()).toBeNull()
    })
  })

  describe('remove', () => {
    it('should remove a migration by id', () => {
      const store = new MigrationStore()
      store.add(createMigration())
      expect(store.remove('m_default')).toBe(true)
      expect(store.size()).toBe(0)
    })

    it('should return false for non-existent id', () => {
      const store = new MigrationStore()
      expect(store.remove('nonexistent')).toBe(false)
    })

    it('should clean up version index on remove', () => {
      const store = new MigrationStore()
      store.add(createMigration({ version: 1 }))
      store.remove('m_default')
      expect(store.getByVersion(1)).toBeNull()
    })
  })

  describe('size', () => {
    it('should return correct count', () => {
      const store = new MigrationStore()
      expect(store.size()).toBe(0)
      store.add(createMigration({ id: 'm1', version: 1 }))
      expect(store.size()).toBe(1)
      store.add(createMigration({ id: 'm2', version: 2 }))
      expect(store.size()).toBe(2)
    })
  })

  describe('validate', () => {
    it('should pass valid migration', () => {
      const store = new MigrationStore()
      const migration = createMigration()
      expect(store.validate(migration)).toEqual([])
    })

    it('should detect missing id', () => {
      const store = new MigrationStore()
      const migration = createMigration({ id: '' })
      const errors = store.validate(migration)
      expect(errors).toContain('Migration id is required')
    })

    it('should detect missing name', () => {
      const store = new MigrationStore()
      const migration = createMigration({ name: '' })
      const errors = store.validate(migration)
      expect(errors).toContain('Migration name is required')
    })

    it('should detect negative version', () => {
      const store = new MigrationStore()
      const migration = createMigration({ version: -1 })
      const errors = store.validate(migration)
      expect(errors.some((e) => e.includes('version'))).toBe(true)
    })

    it('should detect missing checksum', () => {
      const store = new MigrationStore()
      const migration = createMigration({ checksum: '' })
      const errors = store.validate(migration)
      expect(errors).toContain('Migration checksum is required')
    })

    it('should detect invalid createdAt', () => {
      const store = new MigrationStore()
      const migration = createMigration({ createdAt: 0 })
      const errors = store.validate(migration)
      expect(errors.some((e) => e.includes('createdAt'))).toBe(true)
    })

    it('should detect version conflict with different id', () => {
      const store = new MigrationStore()
      store.add(createMigration({ id: 'm1', version: 1 }))
      const migration = createMigration({ id: 'm2', version: 1 })
      const errors = store.validate(migration)
      expect(errors.some((e) => e.includes('already used'))).toBe(true)
    })

    it('should allow same id with same version', () => {
      const store = new MigrationStore()
      store.add(createMigration({ id: 'm1', version: 1 }))
      const migration = createMigration({ id: 'm1', version: 1 })
      const errors = store.validate(migration)
      expect(errors.some((e) => e.includes('already used'))).toBe(false)
    })

    it('should detect same id with different version', () => {
      const store = new MigrationStore()
      store.add(createMigration({ id: 'm1', version: 1 }))
      const migration = createMigration({ id: 'm1', version: 2 })
      const errors = store.validate(migration)
      expect(errors.some((e) => e.includes('different version'))).toBe(true)
    })

    it('should detect invalid up steps type', () => {
      const store = new MigrationStore()
      const migration = createMigration({ up: 'not-array' as unknown as MigrationStep[] })
      const errors = store.validate(migration)
      expect(errors.some((e) => e.includes('up steps must be an array'))).toBe(true)
    })

    it('should detect invalid down steps type', () => {
      const store = new MigrationStore()
      const migration = createMigration({ down: null as unknown as MigrationStep[] })
      const errors = store.validate(migration)
      expect(errors.some((e) => e.includes('down steps must be an array'))).toBe(true)
    })

    it('should detect invalid step type in up', () => {
      const store = new MigrationStore()
      const migration = createMigration({
        up: [{ type: 'invalid', target: 'x', params: {} }],
      })
      const errors = store.validate(migration)
      expect(errors.some((e) => e.includes('up:') && e.includes('invalid type'))).toBe(true)
    })

    it('should detect missing target in step', () => {
      const store = new MigrationStore()
      const migration = createMigration({
        up: [{ type: 'create', target: '', params: {} }],
      })
      const errors = store.validate(migration)
      expect(errors.some((e) => e.includes('target is required'))).toBe(true)
    })

    it('should detect null params in step', () => {
      const store = new MigrationStore()
      const migration = createMigration({
        up: [{ type: 'create', target: 'x', params: null as unknown as Record<string, unknown> }],
      })
      const errors = store.validate(migration)
      expect(errors.some((e) => e.includes('params must be an object'))).toBe(true)
    })
  })

  describe('calculateChecksum', () => {
    it('should produce consistent checksums', () => {
      const store = new MigrationStore()
      const migration = createMigration()
      const cs1 = store.calculateChecksum(migration)
      const cs2 = store.calculateChecksum(migration)
      expect(cs1).toBe(cs2)
    })

    it('should produce different checksums for different migrations', () => {
      const store = new MigrationStore()
      const m1 = createMigration({ name: 'users', version: 1 })
      const m2 = createMigration({ name: 'posts', version: 2 })
      expect(store.calculateChecksum(m1)).not.toBe(store.calculateChecksum(m2))
    })

    it('should change when steps change', () => {
      const store = new MigrationStore()
      const m1 = createMigration({ up: [createStep()] })
      const m2 = createMigration({ up: [createStep(), createStep({ type: 'alter' })] })
      expect(store.calculateChecksum(m1)).not.toBe(store.calculateChecksum(m2))
    })
  })
})

describe('MigrationRunner', () => {
  describe('runUp', () => {
    it('should execute up steps successfully', () => {
      const runner = new MigrationRunner()
      const migration = createMigration()
      const result = runner.runUp(migration)
      expect(result.status).toBe('success')
      expect(result.stepsExecuted).toBe(1)
    })

    it('should track execution time', () => {
      const runner = new MigrationRunner()
      const migration = createMigration()
      const result = runner.runUp(migration)
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })

    it('should return correct migrationId', () => {
      const runner = new MigrationRunner()
      const migration = createMigration()
      const result = runner.runUp(migration)
      expect(result.migrationId).toBe('m_default')
    })

    it('should handle dry run mode', () => {
      const runner = new MigrationRunner()
      const migration = createMigration()
      const result = runner.runUp(migration, true)
      expect(result.status).toBe('success')
      expect(result.stepsExecuted).toBe(1)
      expect(runner.getExecutedSteps()).toHaveLength(0)
    })

    it('should execute multiple up steps', () => {
      const runner = new MigrationRunner()
      const migration = createMigration({
        up: [
          createStep({ target: 'table1' }),
          createStep({ type: 'alter', target: 'table1' }),
          createStep({ type: 'insert', target: 'data1' }),
        ],
      })
      const result = runner.runUp(migration)
      expect(result.status).toBe('success')
      expect(result.stepsExecuted).toBe(3)
    })

    it('should fail when create step targets existing entity', () => {
      const runner = new MigrationRunner()
      runner.runStep(createStep({ target: 'x' }))
      const migration = createMigration({
        up: [createStep({ target: 'x' })],
      })
      const result = runner.runUp(migration)
      expect(result.status).toBe('failed')
    })

    it('should fail when alter targets non-existent entity', () => {
      const runner = new MigrationRunner()
      const migration = createMigration({
        up: [createStep({ type: 'alter', target: 'nonexistent' })],
      })
      const result = runner.runUp(migration)
      expect(result.status).toBe('failed')
    })

    it('should return partial stepsExecuted on failure', () => {
      const runner = new MigrationRunner()
      const migration = createMigration({
        up: [
          createStep({ target: 'good' }),
          createStep({ type: 'alter', target: 'bad_missing' }),
          createStep({ target: 'never_reached' }),
        ],
      })
      const result = runner.runUp(migration)
      expect(result.status).toBe('failed')
      expect(result.stepsExecuted).toBe(1)
    })

    it('should handle empty up steps', () => {
      const runner = new MigrationRunner()
      const migration = createMigration({ up: [] })
      const result = runner.runUp(migration)
      expect(result.status).toBe('success')
      expect(result.stepsExecuted).toBe(0)
    })
  })

  describe('runDown', () => {
    it('should execute down steps successfully', () => {
      const runner = new MigrationRunner()
      runner.runStep(createStep({ target: 'users_table' }))
      const migration = createMigration({
        down: [createStep({ type: 'drop', target: 'users_table' })],
      })
      const result = runner.runDown(migration)
      expect(result.status).toBe('success')
      expect(result.stepsExecuted).toBe(1)
    })

    it('should handle dry run mode', () => {
      const runner = new MigrationRunner()
      const migration = createMigration()
      const result = runner.runDown(migration, true)
      expect(result.status).toBe('success')
    })

    it('should fail when drop targets non-existent entity', () => {
      const runner = new MigrationRunner()
      const migration = createMigration({
        down: [createStep({ type: 'drop', target: 'nonexistent' })],
      })
      const result = runner.runDown(migration)
      expect(result.status).toBe('failed')
    })

    it('should handle empty down steps', () => {
      const runner = new MigrationRunner()
      const migration = createMigration({ down: [] })
      const result = runner.runDown(migration)
      expect(result.status).toBe('success')
      expect(result.stepsExecuted).toBe(0)
    })
  })

  describe('runStep', () => {
    it('should handle create step', () => {
      const runner = new MigrationRunner()
      expect(runner.runStep(createStep({ type: 'create', target: 't1' }))).toBe(true)
    })

    it('should reject duplicate create', () => {
      const runner = new MigrationRunner()
      runner.runStep(createStep({ type: 'create', target: 't1' }))
      expect(runner.runStep(createStep({ type: 'create', target: 't1' }))).toBe(false)
    })

    it('should handle alter step on existing entity', () => {
      const runner = new MigrationRunner()
      runner.runStep(createStep({ target: 't1' }))
      expect(runner.runStep(createStep({ type: 'alter', target: 't1' }))).toBe(true)
    })

    it('should reject alter on non-existent entity', () => {
      const runner = new MigrationRunner()
      expect(runner.runStep(createStep({ type: 'alter', target: 'missing' }))).toBe(false)
    })

    it('should handle drop step on existing entity', () => {
      const runner = new MigrationRunner()
      runner.runStep(createStep({ target: 't1' }))
      expect(runner.runStep(createStep({ type: 'drop', target: 't1' }))).toBe(true)
    })

    it('should reject drop on non-existent entity', () => {
      const runner = new MigrationRunner()
      expect(runner.runStep(createStep({ type: 'drop', target: 'missing' }))).toBe(false)
    })

    it('should handle insert step always succeeding', () => {
      const runner = new MigrationRunner()
      expect(runner.runStep(createStep({ type: 'insert', target: 'd1' }))).toBe(true)
    })

    it('should handle update step on existing entity', () => {
      const runner = new MigrationRunner()
      runner.runStep(createStep({ target: 't1' }))
      expect(runner.runStep(createStep({ type: 'update', target: 't1' }))).toBe(true)
    })

    it('should reject update on non-existent entity', () => {
      const runner = new MigrationRunner()
      expect(runner.runStep(createStep({ type: 'update', target: 'missing' }))).toBe(false)
    })

    it('should handle delete step always succeeding', () => {
      const runner = new MigrationRunner()
      expect(runner.runStep(createStep({ type: 'delete', target: 'anything' }))).toBe(true)
    })

    it('should handle custom step always succeeding', () => {
      const runner = new MigrationRunner()
      expect(runner.runStep(createStep({ type: 'custom', target: 'x' }))).toBe(true)
    })
  })

  describe('validateSteps', () => {
    it('should return empty array for valid steps', () => {
      const runner = new MigrationRunner()
      const steps = [createStep(), createStep({ type: 'alter', target: 'x' })]
      expect(runner.validateSteps(steps)).toEqual([])
    })

    it('should detect invalid step type', () => {
      const runner = new MigrationRunner()
      const steps = [{ type: 'bad', target: 'x', params: {} }]
      const errors = runner.validateSteps(steps as MigrationStep[])
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('invalid type')
    })

    it('should detect missing target', () => {
      const runner = new MigrationRunner()
      const steps = [{ type: 'create', target: '', params: {} }]
      const errors = runner.validateSteps(steps as MigrationStep[])
      expect(errors.some((e) => e.includes('target is required'))).toBe(true)
    })

    it('should detect null params', () => {
      const runner = new MigrationRunner()
      const steps = [{ type: 'create', target: 'x', params: null }]
      const errors = runner.validateSteps(steps as MigrationStep[])
      expect(errors.some((e) => e.includes('params must be an object'))).toBe(true)
    })
  })

  describe('dryRun', () => {
    it('should return plan for up direction', () => {
      const runner = new MigrationRunner()
      const migration = createMigration({
        up: [
          createStep({ target: 't1' }),
          createStep({ type: 'alter', target: 't2' }),
        ],
      })
      const plan = runner.dryRun(migration, 'up')
      expect(plan).toEqual([
        'UP: create t1',
        'UP: alter t2',
      ])
    })

    it('should return plan for down direction', () => {
      const runner = new MigrationRunner()
      const migration = createMigration({
        down: [createStep({ type: 'drop', target: 't1' })],
      })
      const plan = runner.dryRun(migration, 'down')
      expect(plan).toEqual(['DOWN: drop t1'])
    })

    it('should return empty for empty steps', () => {
      const runner = new MigrationRunner()
      const migration = createMigration({ up: [] })
      const plan = runner.dryRun(migration, 'up')
      expect(plan).toEqual([])
    })
  })

  describe('getExecutedSteps', () => {
    it('should return all executed steps', () => {
      const runner = new MigrationRunner()
      const s1 = createStep({ target: 'a' })
      const s2 = createStep({ target: 'b' })
      runner.runStep(s1)
      runner.runStep(s2)
      expect(runner.getExecutedSteps()).toHaveLength(2)
    })
  })

  describe('getState', () => {
    it('should return current state', () => {
      const runner = new MigrationRunner()
      runner.runStep(createStep({ target: 't1', params: { x: 1 } }))
      const state = runner.getState()
      expect(state.has('t1')).toBe(true)
    })
  })

  describe('reset', () => {
    it('should clear all state and executed steps', () => {
      const runner = new MigrationRunner()
      runner.runStep(createStep({ target: 't1' }))
      runner.reset()
      expect(runner.getExecutedSteps()).toHaveLength(0)
      expect(runner.getState().size).toBe(0)
    })
  })
})

describe('MigrationManager', () => {
  describe('constructor', () => {
    it('should use default config', () => {
      const manager = new MigrationManager()
      const config = manager.getConfig()
      expect(config.autoChecksum).toBe(true)
      expect(config.validateOnLoad).toBe(true)
      expect(config.stopOnError).toBe(true)
      expect(config.dryRun).toBe(false)
      expect(config.maxRetries).toBe(0)
    })

    it('should accept partial config overrides', () => {
      const manager = new MigrationManager({ dryRun: true, maxRetries: 3 })
      const config = manager.getConfig()
      expect(config.dryRun).toBe(true)
      expect(config.maxRetries).toBe(3)
      expect(config.autoChecksum).toBe(true)
    })

    it('should return a copy of config', () => {
      const manager = new MigrationManager()
      const config1 = manager.getConfig()
      config1.dryRun = true
      const config2 = manager.getConfig()
      expect(config2.dryRun).toBe(false)
    })
  })

  describe('register', () => {
    it('should register a valid migration', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      const migration = createMigration()
      const id = manager.register(migration)
      expect(id).toBe('m_default')
    })

    it('should auto-calculate checksum when autoChecksum is true', () => {
      const manager = new MigrationManager({ autoChecksum: true, validateOnLoad: false })
      const migration = createMigration({ checksum: '' })
      manager.register(migration)
      const pending = manager.getPending()
      expect(pending[0]!.checksum).not.toBe('')
    })

    it('should throw on invalid migration when validateOnLoad is true', () => {
      const manager = new MigrationManager({ validateOnLoad: true })
      const migration = createMigration({ id: '' })
      expect(() => manager.register(migration)).toThrow('Invalid migration')
    })

    it('should not throw on invalid migration when validateOnLoad is false', () => {
      const manager = new MigrationManager({ validateOnLoad: false, autoChecksum: true })
      const migration = createMigration({ id: '' })
      expect(() => manager.register(migration)).not.toThrow()
    })

    it('should throw on checksum mismatch for already applied migration', () => {
      const manager = new MigrationManager({ validateOnLoad: false, autoChecksum: false })
      const m1 = createMigration({ checksum: 'abc' })
      manager.register(m1)
      manager.migrate()
      const m2 = createMigration({ checksum: 'xyz' })
      expect(() => manager.register(m2)).toThrow('Checksum mismatch')
    })
  })

  describe('migrate', () => {
    it('should apply pending migrations', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.register(createMigration({ id: 'm2', version: 2 }))
      const results = manager.migrate()
      expect(results).toHaveLength(2)
      expect(results.every((r) => r.status === 'success')).toBe(true)
    })

    it('should track applied migrations', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      expect(manager.getPending()).toHaveLength(0)
    })

    it('should migrate to target version', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.register(createMigration({ id: 'm2', version: 2 }))
      manager.register(createMigration({ id: 'm3', version: 3 }))
      const results = manager.migrate(2)
      expect(results).toHaveLength(2)
    })

    it('should not apply already applied migrations', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      const results = manager.migrate()
      expect(results).toHaveLength(0)
    })

    it('should run in dry run mode', () => {
      const manager = new MigrationManager({ validateOnLoad: false, dryRun: true })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      expect(manager.getPending()).toHaveLength(1)
    })

    it('should stop on error when stopOnError is true', () => {
      const manager = new MigrationManager({ validateOnLoad: false, stopOnError: true })
      manager.register(createMigration({
        id: 'm1',
        version: 1,
        up: [createStep({ type: 'create', target: 't1' })],
      }))
      manager.register(createMigration({
        id: 'm2',
        version: 2,
        up: [createStep({ type: 'alter', target: 'nonexistent' })],
      }))
      manager.register(createMigration({ id: 'm3', version: 3 }))
      const results = manager.migrate()
      expect(results).toHaveLength(2)
      expect(results[1]!.status).toBe('failed')
    })

    it('should continue on error when stopOnError is false', () => {
      const manager = new MigrationManager({ validateOnLoad: false, stopOnError: false })
      manager.register(createMigration({
        id: 'm1',
        version: 1,
        up: [createStep({ type: 'create', target: 't1' })],
      }))
      manager.register(createMigration({
        id: 'm2',
        version: 2,
        up: [createStep({ type: 'alter', target: 'nonexistent' })],
      }))
      manager.register(createMigration({
        id: 'm3',
        version: 3,
        up: [createStep({ type: 'create', target: 't3' })],
      }))
      const results = manager.migrate()
      expect(results).toHaveLength(3)
      expect(results[1]!.status).toBe('failed')
      expect(results[2]!.status).toBe('success')
    })

    it('should return empty results when no pending migrations', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      const results = manager.migrate()
      expect(results).toEqual([])
    })
  })

  describe('rollback', () => {
    it('should rollback specified number of steps', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.register(createMigration({ id: 'm2', version: 2 }))
      manager.register(createMigration({ id: 'm3', version: 3 }))
      manager.migrate()
      const results = manager.rollback(2)
      expect(results).toHaveLength(2)
      expect(results.every((r) => r.status === 'success')).toBe(true)
    })

    it('should default to rolling back 1 step', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.register(createMigration({ id: 'm2', version: 2 }))
      manager.migrate()
      const results = manager.rollback()
      expect(results).toHaveLength(1)
    })

    it('should update pending after rollback', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      manager.rollback(1)
      expect(manager.getPending()).toHaveLength(1)
    })

    it('should return empty when nothing to rollback', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      const results = manager.rollback()
      expect(results).toEqual([])
    })

    it('should skip migration not found in store', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      manager['store'].remove('m1')
      const results = manager.rollback(1)
      expect(results).toHaveLength(1)
      expect(results[0]!.status).toBe('skipped')
    })
  })

  describe('rollbackTo', () => {
    it('should rollback to specific version', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.register(createMigration({ id: 'm2', version: 2 }))
      manager.register(createMigration({ id: 'm3', version: 3 }))
      manager.migrate()
      const results = manager.rollbackTo(1)
      expect(results).toHaveLength(2)
    })

    it('should not rollback migrations at or below target version', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.register(createMigration({ id: 'm2', version: 2 }))
      manager.migrate()
      const results = manager.rollbackTo(2)
      expect(results).toHaveLength(0)
    })
  })

  describe('status', () => {
    it('should return correct plan', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.register(createMigration({ id: 'm2', version: 2 }))
      manager.migrate()
      manager.register(createMigration({ id: 'm3', version: 3 }))
      const plan = manager.status()
      expect(plan.currentVersion).toBe(2)
      expect(plan.targetVersion).toBe(3)
      expect(plan.direction).toBe('up')
      expect(plan.pending).toHaveLength(1)
      expect(plan.applied).toHaveLength(2)
    })

    it('should show down direction when at latest', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      const plan = manager.status()
      expect(plan.currentVersion).toBe(1)
      expect(plan.targetVersion).toBe(1)
      expect(plan.direction).toBe('down')
    })

    it('should show version 0 when nothing applied', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      const plan = manager.status()
      expect(plan.currentVersion).toBe(0)
      expect(plan.targetVersion).toBe(1)
      expect(plan.direction).toBe('up')
    })
  })

  describe('getHistory', () => {
    it('should return migration history', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      const history = manager.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0]!.status).toBe('applied')
      expect(history[0]!.version).toBe(1)
    })

    it('should include rollback history', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      manager.rollback(1)
      const history = manager.getHistory()
      expect(history).toHaveLength(2)
      expect(history[1]!.status).toBe('rolled_back')
    })

    it('should return copy of history', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      const history1 = manager.getHistory()
      history1.push({} as MigrationRecord)
      const history2 = manager.getHistory()
      expect(history2).toHaveLength(1)
    })
  })

  describe('validate', () => {
    it('should return empty for valid store', () => {
      const manager = new MigrationManager({ validateOnLoad: false, autoChecksum: true })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      expect(manager.validate()).toEqual([])
    })

    it('should detect store-wide validation issues', () => {
      const manager = new MigrationManager({ validateOnLoad: false, autoChecksum: false })
      manager.register(createMigration({ id: 'm1', version: 1, checksum: '' }))
      const errors = manager.validate()
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('createMigration', () => {
    it('should create migration with auto version', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      const m = manager.createMigration('add posts')
      expect(m.version).toBe(2)
      expect(m.name).toBe('add posts')
    })

    it('should create migration starting at version 1 for empty store', () => {
      const manager = new MigrationManager()
      const m = manager.createMigration('initial')
      expect(m.version).toBe(1)
    })

    it('should create migration with provided steps', () => {
      const manager = new MigrationManager()
      const steps = {
        up: [createStep({ target: 'posts' })],
        down: [createStep({ type: 'drop', target: 'posts' })],
      }
      const m = manager.createMigration('add posts', steps)
      expect(m.up).toHaveLength(1)
      expect(m.down).toHaveLength(1)
    })

    it('should generate id from version and name', () => {
      const manager = new MigrationManager()
      const m = manager.createMigration('Create Users Table')
      expect(m.id).toBe('1_create_users_table')
    })

    it('should generate checksum', () => {
      const manager = new MigrationManager()
      const m = manager.createMigration('test')
      expect(m.checksum).not.toBe('')
    })
  })

  describe('getConfig', () => {
    it('should return default config values', () => {
      const manager = new MigrationManager()
      const config = manager.getConfig()
      expect(config).toEqual(DEFAULT_MIGRATION_MANAGER_CONFIG)
    })
  })

  describe('full lifecycle', () => {
    it('should handle complete migrate and rollback cycle', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.register(createMigration({ id: 'm2', version: 2 }))
      manager.register(createMigration({ id: 'm3', version: 3 }))

      const upResults = manager.migrate()
      expect(upResults).toHaveLength(3)
      expect(manager.status().currentVersion).toBe(3)

      const rbResults = manager.rollback(2)
      expect(rbResults).toHaveLength(2)
      expect(manager.status().currentVersion).toBe(1)

      const reResults = manager.migrate()
      expect(reResults).toHaveLength(2)
      expect(manager.status().currentVersion).toBe(3)
    })

    it('should handle register after partial migrate', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()

      manager.register(createMigration({ id: 'm2', version: 2 }))
      const pending = manager.getPending()
      expect(pending).toHaveLength(1)
      expect(pending[0]!.version).toBe(2)
    })
  })

  describe('retry behavior', () => {
    it('should retry failed migrations up to maxRetries', () => {
      const manager = new MigrationManager({ validateOnLoad: false, maxRetries: 2 })
      manager.register(createMigration({
        id: 'm1',
        version: 1,
        up: [createStep({ type: 'alter', target: 'nonexistent' })],
      }))
      const results = manager.migrate()
      expect(results).toHaveLength(1)
      expect(results[0]!.status).toBe('failed')
    })
  })

  describe('edge cases', () => {
    it('should handle migration with no up steps', () => {
      const manager = new MigrationManager({ validateOnLoad: false, autoChecksum: true })
      manager.register(createMigration({ id: 'm1', version: 1, up: [], down: [] }))
      const results = manager.migrate()
      expect(results).toHaveLength(1)
      expect(results[0]!.status).toBe('success')
      expect(results[0]!.stepsExecuted).toBe(0)
    })

    it('should handle rollback of never-migrated migration gracefully', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      const results = manager.rollback(5)
      expect(results).toEqual([])
    })

    it('should handle rollbackTo with higher version than current', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      const results = manager.rollbackTo(10)
      expect(results).toEqual([])
    })

    it('should track execution time in history', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.migrate()
      const history = manager.getHistory()
      expect(history[0]!.executionTime).toBeGreaterThanOrEqual(0)
      expect(history[0]!.appliedAt).toBeGreaterThan(0)
    })

    it('should handle multiple rollback rounds', () => {
      const manager = new MigrationManager({ validateOnLoad: false })
      manager.register(createMigration({ id: 'm1', version: 1 }))
      manager.register(createMigration({ id: 'm2', version: 2 }))
      manager.migrate()
      manager.rollback(1)
      manager.rollback(1)
      const history = manager.getHistory()
      expect(history.filter((h) => h.status === 'applied')).toHaveLength(2)
      expect(history.filter((h) => h.status === 'rolled_back')).toHaveLength(2)
      expect(manager.status().currentVersion).toBe(0)
    })
  })
})

describe('Default config', () => {
  it('should have correct defaults', () => {
    expect(DEFAULT_MIGRATION_MANAGER_CONFIG.autoChecksum).toBe(true)
    expect(DEFAULT_MIGRATION_MANAGER_CONFIG.validateOnLoad).toBe(true)
    expect(DEFAULT_MIGRATION_MANAGER_CONFIG.stopOnError).toBe(true)
    expect(DEFAULT_MIGRATION_MANAGER_CONFIG.dryRun).toBe(false)
    expect(DEFAULT_MIGRATION_MANAGER_CONFIG.maxRetries).toBe(0)
  })
})
