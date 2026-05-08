import { describe, it, expect } from 'vitest'
import { MigrationRunner } from '../../src/core/migration/migration-runner.js'
import type { VersionMigration, MigrationResult } from '../../src/core/migration/types.js'

describe('MigrationRunner', () => {
  describe('constructor', () => {
    it('should initialize with default migrations', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrations()
      expect(migrations.length).toBe(4)
    })

    it('should have migration from 0.1.0 to 0.2.0', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrations()
      const m = migrations.find((m) => m.fromVersion === '0.1.0')
      expect(m).toBeDefined()
      expect(m!.toVersion).toBe('0.2.0')
      expect(m!.breaking).toBe(false)
    })

    it('should have migration from 0.2.0 to 0.3.0', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrations()
      const m = migrations.find((m) => m.fromVersion === '0.2.0')
      expect(m).toBeDefined()
      expect(m!.toVersion).toBe('0.3.0')
    })

    it('should have migration from 0.3.0 to 0.4.0', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrations()
      const m = migrations.find((m) => m.fromVersion === '0.3.0')
      expect(m).toBeDefined()
      expect(m!.toVersion).toBe('0.4.0')
    })

    it('should have migration from 0.4.0 to 1.0.0', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrations()
      const m = migrations.find((m) => m.fromVersion === '0.4.0')
      expect(m).toBeDefined()
      expect(m!.toVersion).toBe('1.0.0')
      expect(m!.breaking).toBe(true)
    })
  })

  describe('registerMigration', () => {
    it('should register a custom migration', () => {
      const runner = new MigrationRunner()
      const custom: VersionMigration = {
        fromVersion: '1.0.0',
        toVersion: '1.1.0',
        description: 'Custom migration',
        breaking: false,
        migrate: (config) => ({
          success: true,
          config: { ...config, custom: true },
          changes: [{ path: 'custom', oldValue: undefined, newValue: true, type: 'added', description: 'Added custom' }],
          warnings: [],
          errors: [],
        }),
      }
      const before = runner.getMigrations().length
      runner.registerMigration(custom)
      expect(runner.getMigrations().length).toBe(before + 1)
    })

    it('should not mutate the original migrations array when returning copies', () => {
      const runner = new MigrationRunner()
      const m1 = runner.getMigrations()
      const m2 = runner.getMigrations()
      expect(m1).not.toBe(m2)
      expect(m1).toEqual(m2)
    })
  })

  describe('compareVersions', () => {
    it('should return 0 for equal versions', () => {
      const runner = new MigrationRunner()
      expect(runner.compareVersions('1.0.0', '1.0.0')).toBe(0)
    })

    it('should return positive when first version is greater (major)', () => {
      const runner = new MigrationRunner()
      expect(runner.compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0)
    })

    it('should return negative when first version is lesser (major)', () => {
      const runner = new MigrationRunner()
      expect(runner.compareVersions('0.9.0', '1.0.0')).toBeLessThan(0)
    })

    it('should compare minor versions correctly', () => {
      const runner = new MigrationRunner()
      expect(runner.compareVersions('1.2.0', '1.3.0')).toBeLessThan(0)
      expect(runner.compareVersions('1.3.0', '1.2.0')).toBeGreaterThan(0)
    })

    it('should compare patch versions correctly', () => {
      const runner = new MigrationRunner()
      expect(runner.compareVersions('1.0.1', '1.0.2')).toBeLessThan(0)
      expect(runner.compareVersions('1.0.2', '1.0.1')).toBeGreaterThan(0)
    })

    it('should handle versions with missing patch', () => {
      const runner = new MigrationRunner()
      expect(runner.compareVersions('1.0', '1.0.0')).toBe(0)
    })

    it('should handle versions with missing minor and patch', () => {
      const runner = new MigrationRunner()
      expect(runner.compareVersions('1', '1.0.0')).toBe(0)
    })

    it('should handle different major.minor.patch combinations', () => {
      const runner = new MigrationRunner()
      expect(runner.compareVersions('2.1.3', '1.9.9')).toBeGreaterThan(0)
    })
  })

  describe('getMigrationPath', () => {
    it('should return empty path for same version', () => {
      const runner = new MigrationRunner()
      expect(runner.getMigrationPath('0.3.0', '0.3.0')).toEqual([])
    })

    it('should return empty path when target is older', () => {
      const runner = new MigrationRunner()
      expect(runner.getMigrationPath('0.4.0', '0.1.0')).toEqual([])
    })

    it('should return single step for adjacent versions', () => {
      const runner = new MigrationRunner()
      const path = runner.getMigrationPath('0.1.0', '0.2.0')
      expect(path.length).toBe(1)
      expect(path[0]!.fromVersion).toBe('0.1.0')
      expect(path[0]!.toVersion).toBe('0.2.0')
    })

    it('should return multiple steps for multi-version migration', () => {
      const runner = new MigrationRunner()
      const path = runner.getMigrationPath('0.1.0', '0.4.0')
      expect(path.length).toBe(3)
      expect(path[0]!.fromVersion).toBe('0.1.0')
      expect(path[1]!.fromVersion).toBe('0.2.0')
      expect(path[2]!.fromVersion).toBe('0.3.0')
    })

    it('should return full path from 0.1.0 to 1.0.0', () => {
      const runner = new MigrationRunner()
      const path = runner.getMigrationPath('0.1.0', '1.0.0')
      expect(path.length).toBe(4)
    })

    it('should return empty path when no migration is registered for from version', () => {
      const runner = new MigrationRunner()
      const path = runner.getMigrationPath('0.0.1', '1.0.0')
      expect(path).toEqual([])
    })
  })

  describe('createPlan', () => {
    it('should create plan with correct from and to versions', () => {
      const runner = new MigrationRunner()
      const plan = runner.createPlan('0.1.0', '1.0.0')
      expect(plan.fromVersion).toBe('0.1.0')
      expect(plan.toVersion).toBe('1.0.0')
    })

    it('should calculate correct number of steps', () => {
      const runner = new MigrationRunner()
      const plan = runner.createPlan('0.1.0', '1.0.0')
      expect(plan.totalChanges).toBe(4)
    })

    it('should count breaking changes correctly', () => {
      const runner = new MigrationRunner()
      const plan = runner.createPlan('0.1.0', '1.0.0')
      expect(plan.breakingChanges).toBe(1)
    })

    it('should estimate low risk for single non-breaking step', () => {
      const runner = new MigrationRunner()
      const plan = runner.createPlan('0.1.0', '0.2.0')
      expect(plan.estimatedRisk).toBe('low')
    })

    it('should estimate high risk for many steps with breaking changes', () => {
      const runner = new MigrationRunner()
      const plan = runner.createPlan('0.1.0', '1.0.0')
      expect(plan.estimatedRisk).toBe('high')
    })

    it('should estimate medium risk for moderate steps', () => {
      const runner = new MigrationRunner()
      const plan = runner.createPlan('0.1.0', '0.4.0')
      expect(plan.estimatedRisk).toBe('medium')
    })

    it('should return empty steps for same version', () => {
      const runner = new MigrationRunner()
      const plan = runner.createPlan('0.3.0', '0.3.0')
      expect(plan.steps).toEqual([])
      expect(plan.totalChanges).toBe(0)
      expect(plan.breakingChanges).toBe(0)
      expect(plan.estimatedRisk).toBe('low')
    })
  })

  describe('preview', () => {
    it('should return preview with plan', () => {
      const runner = new MigrationRunner()
      const preview = runner.preview({}, '0.1.0', '0.2.0')
      expect(preview.plan).toBeDefined()
      expect(preview.changes.length).toBeGreaterThan(0)
    })

    it('should indicate canAutoMigrate for non-breaking migrations', () => {
      const runner = new MigrationRunner()
      const preview = runner.preview({}, '0.1.0', '0.2.0')
      expect(preview.canAutoMigrate).toBe(true)
    })

    it('should return empty changes for same version', () => {
      const runner = new MigrationRunner()
      const preview = runner.preview({}, '0.3.0', '0.3.0')
      expect(preview.changes).toEqual([])
      expect(preview.canAutoMigrate).toBe(true)
    })

    it('should show all changes across multiple steps', () => {
      const runner = new MigrationRunner()
      const preview = runner.preview({}, '0.1.0', '1.0.0')
      expect(preview.changes.length).toBeGreaterThan(4)
    })

    it('should not modify the original config', () => {
      const runner = new MigrationRunner()
      const original = { rules: { test: 'value' } }
      const originalCopy = JSON.parse(JSON.stringify(original))
      runner.preview(original, '0.1.0', '0.2.0')
      expect(original).toEqual(originalCopy)
    })
  })

  describe('migrate', () => {
    it('should migrate from 0.1.0 to 0.2.0 adding plugins field', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.1.0', '0.2.0')
      expect(result.success).toBe(true)
      expect(result.config['plugins']).toEqual({})
    })

    it('should rename rules to ruleConfig in 0.1.0 to 0.2.0 migration', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({ rules: { 'no-console': 'error' } }, '0.1.0', '0.2.0')
      expect(result.success).toBe(true)
      expect(result.config['ruleConfig']).toEqual({ 'no-console': 'error' })
      expect(result.config['rules']).toBeUndefined()
    })

    it('should add extends field in 0.1.0 to 0.2.0 migration', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.1.0', '0.2.0')
      expect(result.config['extends']).toEqual([])
    })

    it('should add reporting section in 0.2.0 to 0.3.0 migration', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.2.0', '0.3.0')
      expect(result.success).toBe(true)
      expect(result.config['reporting']).toEqual({})
    })

    it('should move format to reporting.format in 0.2.0 to 0.3.0 migration', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({ format: 'json' }, '0.2.0', '0.3.0')
      expect(result.success).toBe(true)
      const reporting = result.config['reporting'] as Record<string, unknown>
      expect(reporting.format).toBe('json')
      expect(result.config['format']).toBeUndefined()
    })

    it('should add ci section in 0.2.0 to 0.3.0 migration', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.2.0', '0.3.0')
      expect(result.config['ci']).toEqual({ enabled: false })
    })

    it('should add enterprise section in 0.3.0 to 0.4.0 migration', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.3.0', '0.4.0')
      expect(result.success).toBe(true)
      expect(result.config['enterprise']).toEqual({ enabled: false })
    })

    it('should add profiles array in 0.3.0 to 0.4.0 migration', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.3.0', '0.4.0')
      expect(result.config['profiles']).toEqual([])
    })

    it('should add audit config in 0.3.0 to 0.4.0 migration', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.3.0', '0.4.0')
      const audit = result.config['audit'] as Record<string, unknown>
      expect(audit.enabled).toBe(false)
    })

    it('should add stability field in 0.4.0 to 1.0.0 migration', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.4.0', '1.0.0')
      expect(result.config['stability']).toBe('stable')
    })

    it('should add version field in 0.4.0 to 1.0.0 migration', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.4.0', '1.0.0')
      expect(result.config['version']).toBe('1.0.0')
    })

    it('should normalize severity values in 0.4.0 to 1.0.0 migration', () => {
      const runner = new MigrationRunner()
      const config = { ruleConfig: { 'no-console': 'err', 'max-params': 'warn' } }
      const result = runner.migrate(config, '0.4.0', '1.0.0')
      const rules = result.config['ruleConfig'] as Record<string, unknown>
      expect(rules['no-console']).toBe('error')
      expect(rules['max-params']).toBe('warning')
    })

    it('should normalize array-style severity values', () => {
      const runner = new MigrationRunner()
      const config = { ruleConfig: { 'no-console': ['err', { max: 1 }] } }
      const result = runner.migrate(config, '0.4.0', '1.0.0')
      const rules = result.config['ruleConfig'] as Record<string, unknown>
      const ruleVal = rules['no-console'] as unknown[]
      expect(ruleVal[0]).toBe('error')
    })

    it('should not modify already correct severity values', () => {
      const runner = new MigrationRunner()
      const config = { ruleConfig: { 'no-console': 'error', 'max-params': 'info' } }
      const result = runner.migrate(config, '0.4.0', '1.0.0')
      const rules = result.config['ruleConfig'] as Record<string, unknown>
      expect(rules['no-console']).toBe('error')
      expect(rules['max-params']).toBe('info')
    })

    it('should perform full migration from 0.1.0 to 1.0.0', () => {
      const runner = new MigrationRunner()
      const config = {
        rules: { 'no-console': 'err', 'max-params': 'warn' },
      }
      const result = runner.migrate(config, '0.1.0', '1.0.0')
      expect(result.success).toBe(true)
      expect(result.config['plugins']).toEqual({})
      expect(result.config['ruleConfig']).toBeDefined()
      expect(result.config['extends']).toEqual([])
      expect(result.config['reporting']).toBeDefined()
      expect(result.config['ci']).toBeDefined()
      expect(result.config['enterprise']).toBeDefined()
      expect(result.config['profiles']).toEqual([])
      expect(result.config['audit']).toBeDefined()
      expect(result.config['stability']).toBe('stable')
      expect(result.config['version']).toBe('1.0.0')
    })

    it('should not modify the original config', () => {
      const runner = new MigrationRunner()
      const original = { rules: { test: 'value' } }
      const originalCopy = JSON.parse(JSON.stringify(original))
      runner.migrate(original, '0.1.0', '0.2.0')
      expect(original).toEqual(originalCopy)
    })

    it('should return success with warnings when no migration is needed', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({ key: 'value' }, '0.3.0', '0.3.0')
      expect(result.success).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.config['key']).toBe('value')
    })

    it('should return error when no migration path exists', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.0.1', '1.0.0')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should accumulate warnings across all steps', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({ rules: { test: 'err' } }, '0.1.0', '1.0.0')
      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('migrateStep', () => {
    it('should execute a single migration step', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrations()
      const step = migrations.find((m) => m.fromVersion === '0.1.0')!
      const result = runner.migrateStep({ rules: { a: 1 } }, step)
      expect(result.success).toBe(true)
      expect(result.config['ruleConfig']).toEqual({ a: 1 })
    })

    it('should not modify the original config in a step', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrations()
      const step = migrations.find((m) => m.fromVersion === '0.1.0')!
      const original = { rules: { a: 1 } }
      const originalCopy = JSON.parse(JSON.stringify(original))
      runner.migrateStep(original, step)
      expect(original).toEqual(originalCopy)
    })
  })

  describe('getMigrationsForVersion', () => {
    it('should return migrations that involve a specific version', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrationsForVersion('0.2.0')
      expect(migrations.length).toBe(2)
      const froms = migrations.map((m) => m.fromVersion)
      expect(froms).toContain('0.1.0')
      expect(froms).toContain('0.2.0')
    })

    it('should return empty array for unknown version', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrationsForVersion('99.0.0')
      expect(migrations).toEqual([])
    })

    it('should return migrations for toVersion match', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrationsForVersion('1.0.0')
      expect(migrations.length).toBe(1)
      expect(migrations[0]!.toVersion).toBe('1.0.0')
    })
  })

  describe('isMigrationNeeded', () => {
    it('should return true when from is older than to', () => {
      const runner = new MigrationRunner()
      expect(runner.isMigrationNeeded('0.1.0', '0.2.0')).toBe(true)
    })

    it('should return false when versions are equal', () => {
      const runner = new MigrationRunner()
      expect(runner.isMigrationNeeded('0.3.0', '0.3.0')).toBe(false)
    })

    it('should return false when from is newer than to', () => {
      const runner = new MigrationRunner()
      expect(runner.isMigrationNeeded('0.4.0', '0.1.0')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty config object', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.1.0', '0.2.0')
      expect(result.success).toBe(true)
      expect(result.config['plugins']).toEqual({})
      expect(result.config['extends']).toEqual([])
    })

    it('should handle config with existing target fields', () => {
      const runner = new MigrationRunner()
      const config = { plugins: { existing: true } }
      const result = runner.migrate(config, '0.1.0', '0.2.0')
      expect(result.config['plugins']).toEqual({ existing: true })
      const addedChanges = result.changes.filter((c) => c.type === 'added' && c.path === 'plugins')
      expect(addedChanges.length).toBe(0)
    })

    it('should handle config that already has ruleConfig (no rename needed)', () => {
      const runner = new MigrationRunner()
      const config = { ruleConfig: { test: 'error' } }
      const result = runner.migrate(config, '0.1.0', '0.2.0')
      expect(result.config['ruleConfig']).toEqual({ test: 'error' })
      const renameChanges = result.changes.filter((c) => c.type === 'renamed')
      expect(renameChanges.length).toBe(0)
    })

    it('should handle config where format is already in reporting', () => {
      const runner = new MigrationRunner()
      const config = { reporting: { format: 'json' }, format: 'json' }
      const result = runner.migrate(config, '0.2.0', '0.3.0')
      expect(result.success).toBe(true)
    })

    it('should produce changes with correct types', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({ rules: {} }, '0.1.0', '0.2.0')
      const types = result.changes.map((c) => c.type)
      expect(types).toContain('added')
      expect(types).toContain('renamed')
    })

    it('should handle migration where reporting section already exists', () => {
      const runner = new MigrationRunner()
      const config = { reporting: { format: 'html' } }
      const result = runner.migrate(config, '0.2.0', '0.3.0')
      expect(result.success).toBe(true)
      const reporting = result.config['reporting'] as Record<string, unknown>
      expect(reporting.format).toBe('html')
    })

    it('should handle 0.4.0 to 1.0.0 with no ruleConfig', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.4.0', '1.0.0')
      expect(result.success).toBe(true)
      expect(result.config['stability']).toBe('stable')
      expect(result.config['version']).toBe('1.0.0')
    })

    it('should handle severity normalization with numeric severity values', () => {
      const runner = new MigrationRunner()
      const config = { ruleConfig: { 'no-console': 2 } }
      const result = runner.migrate(config, '0.4.0', '1.0.0')
      expect(result.success).toBe(true)
      const rules = result.config['ruleConfig'] as Record<string, unknown>
      expect(rules['no-console']).toBe(2)
    })

    it('should produce migration result with description on each change', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.1.0', '0.2.0')
      for (const change of result.changes) {
        expect(change.description).toBeTruthy()
        expect(typeof change.description).toBe('string')
      }
    })

    it('should handle migration from 0.2.0 to 0.4.0 via two steps', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.2.0', '0.4.0')
      expect(result.success).toBe(true)
      expect(result.config['reporting']).toBeDefined()
      expect(result.config['ci']).toBeDefined()
      expect(result.config['enterprise']).toBeDefined()
      expect(result.config['profiles']).toEqual([])
      expect(result.config['audit']).toBeDefined()
    })

    it('should preserve unrelated config fields during migration', () => {
      const runner = new MigrationRunner()
      const config = { customField: 'preserved', rules: { a: 1 } }
      const result = runner.migrate(config, '0.1.0', '0.2.0')
      expect(result.config['customField']).toBe('preserved')
    })

    it('should generate warnings for rules rename in 0.1.0 to 0.2.0', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({ rules: { x: 1 } }, '0.1.0', '0.2.0')
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('ruleConfig')
    })

    it('should generate warning about breaking changes in 0.4.0 to 1.0.0', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '0.4.0', '1.0.0')
      expect(result.warnings.some((w) => w.includes('breaking'))).toBe(true)
    })
  })
})
