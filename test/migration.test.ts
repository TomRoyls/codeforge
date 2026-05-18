import { MigrationRunner } from '../src/core/migration/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('MigrationRunner', () => {
  describe('constructor', () => {
    it('creates runner with built-in migrations', () => {
      const runner = new MigrationRunner()
      expect(runner.getMigrations().length).toBeGreaterThan(0)
    })
  })

  // ─── compareVersions ─────────────────────────────────────────────────────

  describe('compareVersions', () => {
    it('compares versions correctly', () => {
      const runner = new MigrationRunner()
      expect(runner.compareVersions('0.1.0', '0.2.0')).toBeLessThan(0)
      expect(runner.compareVersions('0.2.0', '0.1.0')).toBeGreaterThan(0)
      expect(runner.compareVersions('1.0.0', '1.0.0')).toBe(0)
    })

    it('handles different major versions', () => {
      const runner = new MigrationRunner()
      expect(runner.compareVersions('0.9.0', '1.0.0')).toBeLessThan(0)
    })
  })

  // ─── isMigrationNeeded ───────────────────────────────────────────────────

  describe('isMigrationNeeded', () => {
    it('returns true when target is newer', () => {
      const runner = new MigrationRunner()
      expect(runner.isMigrationNeeded('0.1.0', '1.0.0')).toBe(true)
    })

    it('returns false when versions are equal', () => {
      const runner = new MigrationRunner()
      expect(runner.isMigrationNeeded('1.0.0', '1.0.0')).toBe(false)
    })

    it('returns false when target is older', () => {
      const runner = new MigrationRunner()
      expect(runner.isMigrationNeeded('1.0.0', '0.1.0')).toBe(false)
    })
  })

  // ─── getMigrationPath ────────────────────────────────────────────────────

  describe('getMigrationPath', () => {
    it('returns migration steps', () => {
      const runner = new MigrationRunner()
      const path = runner.getMigrationPath('0.1.0', '0.3.0')
      expect(path.length).toBe(2)
      expect(path[0]!.fromVersion).toBe('0.1.0')
      expect(path[1]!.fromVersion).toBe('0.2.0')
    })

    it('returns empty for same version', () => {
      const runner = new MigrationRunner()
      expect(runner.getMigrationPath('1.0.0', '1.0.0')).toEqual([])
    })

    it('returns empty when target is older', () => {
      const runner = new MigrationRunner()
      expect(runner.getMigrationPath('1.0.0', '0.1.0')).toEqual([])
    })
  })

  // ─── createPlan ──────────────────────────────────────────────────────────

  describe('createPlan', () => {
    it('creates migration plan', () => {
      const runner = new MigrationRunner()
      const plan = runner.createPlan('0.1.0', '1.0.0')
      expect(plan.fromVersion).toBe('0.1.0')
      expect(plan.toVersion).toBe('1.0.0')
      expect(plan.totalChanges).toBeGreaterThan(0)
      expect(plan.breakingChanges).toBeGreaterThan(0)
      expect(plan.estimatedRisk).toBe('high')
    })

    it('estimates low risk for short paths', () => {
      const runner = new MigrationRunner()
      const plan = runner.createPlan('0.1.0', '0.2.0')
      expect(plan.estimatedRisk).toBe('low')
    })
  })

  // ─── preview ─────────────────────────────────────────────────────────────

  describe('preview', () => {
    it('previews migration changes', () => {
      const runner = new MigrationRunner()
      const config = { rules: { 'no-eval': 'err' } }
      const preview = runner.preview(config, '0.1.0', '1.0.0')
      expect(preview.changes.length).toBeGreaterThan(0)
      expect(preview.warnings.length).toBeGreaterThan(0)
      expect(preview.canAutoMigrate).toBe(true)
    })

    it('returns empty for same version', () => {
      const runner = new MigrationRunner()
      const preview = runner.preview({}, '1.0.0', '1.0.0')
      expect(preview.changes).toEqual([])
    })
  })

  // ─── migrate ─────────────────────────────────────────────────────────────

  describe('migrate', () => {
    it('migrates config from 0.1.0 to 0.2.0', () => {
      const runner = new MigrationRunner()
      const config = { rules: { 'no-eval': 'err' } }
      const result = runner.migrate(config, '0.1.0', '0.2.0')
      expect(result.success).toBe(true)
      expect(result.config).toHaveProperty('plugins')
      expect(result.config).toHaveProperty('ruleConfig')
      expect(result.config).not.toHaveProperty('rules')
    })

    it('migrates config through all versions', () => {
      const runner = new MigrationRunner()
      const config = { rules: { 'no-eval': 'err' } }
      const result = runner.migrate(config, '0.1.0', '1.0.0')
      expect(result.success).toBe(true)
      expect(result.config).toHaveProperty('plugins')
      expect(result.config).toHaveProperty('version')
      expect(result.config).toHaveProperty('stability')
    })

    it('normalizes severity values in 1.0.0 migration', () => {
      const runner = new MigrationRunner()
      const config = { ruleConfig: { 'no-eval': 'err' } }
      const result = runner.migrate(config, '0.4.0', '1.0.0')
      expect(result.success).toBe(true)
      const rc = result.config.ruleConfig as Record<string, unknown>
      expect(rc['no-eval']).toBe('error')
    })

    it('returns warning when no migration needed', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '1.0.0', '1.0.0')
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('returns error for unknown migration path', () => {
      const runner = new MigrationRunner()
      const result = runner.migrate({}, '5.0.0', '6.0.0')
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  // ─── registerMigration ───────────────────────────────────────────────────

  describe('registerMigration', () => {
    it('registers custom migration', () => {
      const runner = new MigrationRunner()
      const count = runner.getMigrations().length
      runner.registerMigration({
        fromVersion: '9.0.0',
        toVersion: '10.0.0',
        description: 'Custom migration',
        breaking: false,
        migrate: (config) => ({
          success: true,
          config,
          changes: [],
          warnings: [],
          errors: [],
        }),
      })
      expect(runner.getMigrations().length).toBe(count + 1)
    })
  })

  // ─── getMigrationsForVersion ─────────────────────────────────────────────

  describe('getMigrationsForVersion', () => {
    it('filters migrations by version', () => {
      const runner = new MigrationRunner()
      const migrations = runner.getMigrationsForVersion('0.1.0')
      expect(migrations.length).toBeGreaterThan(0)
      const hasFrom = migrations.some((m) => m.fromVersion === '0.1.0')
      const hasTo = migrations.some((m) => m.toVersion === '0.1.0')
      expect(hasFrom || hasTo).toBe(true)
    })
  })
})
