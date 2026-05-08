import { describe, it, expect } from 'vitest';
import { MigrationRegistry } from '../../src/core/config-migration/migration-registry.js';
import { ConfigMigrator } from '../../src/core/config-migration/config-migrator.js';
import { MigrationValidator } from '../../src/core/config-migration/migration-validator.js';
import type { ConfigData } from '../../src/core/config-migration/types.js';

describe('MigrationRegistry', () => {
  describe('register', () => {
    it('registers a migration', () => {
      const registry = new MigrationRegistry();
      registry.register({
        fromVersion: '2.0.0',
        toVersion: '3.0.0',
        description: 'test migration',
        breaking: false,
        transform: (c) => c,
        rollback: (c) => c,
      });
      const m = registry.getMigration('2.0.0', '3.0.0');
      expect(m).not.toBeNull();
      expect(m!.description).toBe('test migration');
    });

    it('overwrites duplicate registration', () => {
      const registry = new MigrationRegistry();
      registry.register({
        fromVersion: '2.0.0',
        toVersion: '3.0.0',
        description: 'first',
        breaking: false,
        transform: (c) => c,
        rollback: (c) => c,
      });
      registry.register({
        fromVersion: '2.0.0',
        toVersion: '3.0.0',
        description: 'second',
        breaking: false,
        transform: (c) => c,
        rollback: (c) => c,
      });
      expect(registry.getMigration('2.0.0', '3.0.0')!.description).toBe('second');
    });
  });

  describe('getMigration', () => {
    it('returns null for non-existent migration', () => {
      const registry = new MigrationRegistry();
      expect(registry.getMigration('99.0.0', '100.0.0')).toBeNull();
    });

    it('returns built-in migration 0.1.0 to 0.2.0', () => {
      const registry = new MigrationRegistry();
      const m = registry.getMigration('0.1.0', '0.2.0');
      expect(m).not.toBeNull();
      expect(m!.breaking).toBe(true);
    });
  });

  describe('getAllMigrations', () => {
    it('returns all built-in migrations', () => {
      const registry = new MigrationRegistry();
      const all = registry.getAllMigrations();
      expect(all.length).toBe(4);
    });
  });

  describe('getPath', () => {
    it('returns empty array for same version', () => {
      const registry = new MigrationRegistry();
      expect(registry.getPath('0.1.0', '0.1.0')).toEqual([]);
    });

    it('finds single-step path', () => {
      const registry = new MigrationRegistry();
      const path = registry.getPath('0.1.0', '0.2.0');
      expect(path.length).toBe(1);
      expect(path[0]!.fromVersion).toBe('0.1.0');
      expect(path[0]!.toVersion).toBe('0.2.0');
    });

    it('finds multi-step path 0.1.0 to 0.3.0', () => {
      const registry = new MigrationRegistry();
      const path = registry.getPath('0.1.0', '0.3.0');
      expect(path.length).toBe(2);
      expect(path[0]!.fromVersion).toBe('0.1.0');
      expect(path[0]!.toVersion).toBe('0.2.0');
      expect(path[1]!.fromVersion).toBe('0.2.0');
      expect(path[1]!.toVersion).toBe('0.3.0');
    });

    it('finds full path 0.1.0 to 1.0.0', () => {
      const registry = new MigrationRegistry();
      const path = registry.getPath('0.1.0', '1.0.0');
      expect(path.length).toBe(4);
    });

    it('returns empty for unreachable version', () => {
      const registry = new MigrationRegistry();
      expect(registry.getPath('0.1.0', '99.0.0')).toEqual([]);
    });

    it('finds backward path', () => {
      const registry = new MigrationRegistry();
      const path = registry.getPath('0.3.0', '0.1.0');
      expect(path.length).toBe(2);
    });
  });

  describe('getAvailableVersions', () => {
    it('returns all versions', () => {
      const registry = new MigrationRegistry();
      const versions = registry.getAvailableVersions();
      expect(versions).toContain('0.1.0');
      expect(versions).toContain('0.2.0');
      expect(versions).toContain('0.3.0');
      expect(versions).toContain('0.4.0');
      expect(versions).toContain('1.0.0');
    });

    it('returns versions sorted', () => {
      const registry = new MigrationRegistry();
      const versions = registry.getAvailableVersions();
      for (let i = 1; i < versions.length; i++) {
        const prev = versions[i - 1]!.split('.').map(Number);
        const curr = versions[i]!.split('.').map(Number);
        expect(curr[0]! > prev[0]! || (curr[0] === prev[0] && curr[1]! > prev[1]!) || (curr[0] === prev[0] && curr[1] === prev[1] && curr[2]! >= prev[2]!)).toBe(true);
      }
    });

    it('includes versions from custom migrations', () => {
      const registry = new MigrationRegistry();
      registry.register({
        fromVersion: '1.0.0',
        toVersion: '2.0.0',
        description: 'custom',
        breaking: false,
        transform: (c) => c,
        rollback: (c) => c,
      });
      const versions = registry.getAvailableVersions();
      expect(versions).toContain('2.0.0');
    });
  });

  describe('getLatestVersion', () => {
    it('returns 1.0.0 as latest with builtins', () => {
      const registry = new MigrationRegistry();
      expect(registry.getLatestVersion()).toBe('1.0.0');
    });

    it('returns updated latest after registering newer', () => {
      const registry = new MigrationRegistry();
      registry.register({
        fromVersion: '1.0.0',
        toVersion: '2.0.0',
        description: 'new',
        breaking: false,
        transform: (c) => c,
        rollback: (c) => c,
      });
      expect(registry.getLatestVersion()).toBe('2.0.0');
    });
  });

  describe('built-in migrations', () => {
    it('0.1.0->0.2.0 renames rules to ruleConfig', () => {
      const registry = new MigrationRegistry();
      const m = registry.getMigration('0.1.0', '0.2.0')!;
      const result = m.transform({ rules: { a: true }, exclude: ['node_modules'] });
      expect(result.ruleConfig).toEqual({ a: true });
      expect(result.ignore).toEqual(['node_modules']);
      expect(result.plugins).toEqual([]);
      expect('rules' in result).toBe(false);
      expect('exclude' in result).toBe(false);
    });

    it('0.1.0->0.2.0 rollback renames ruleConfig to rules', () => {
      const registry = new MigrationRegistry();
      const m = registry.getMigration('0.1.0', '0.2.0')!;
      const result = m.rollback({ ruleConfig: { a: true }, ignore: ['node_modules'], plugins: [] });
      expect(result.rules).toEqual({ a: true });
      expect(result.exclude).toEqual(['node_modules']);
      expect('plugins' in result).toBe(false);
    });

    it('0.2.0->0.3.0 adds analysis.typeAware and renames maxWarnings', () => {
      const registry = new MigrationRegistry();
      const m = registry.getMigration('0.2.0', '0.3.0')!;
      const result = m.transform({ ruleConfig: {}, maxWarnings: 10 });
      expect((result.analysis as Record<string, unknown>).typeAware).toBe(false);
      expect((result.maxViolations as Record<string, unknown>).warning).toBe(10);
      expect('maxWarnings' in result).toBe(false);
    });

    it('0.3.0->0.4.0 converts severity and adds enterprise', () => {
      const registry = new MigrationRegistry();
      const m = registry.getMigration('0.3.0', '0.4.0')!;
      const result = m.transform({ ruleConfig: {}, severity: 'error' });
      expect(result.severity).toEqual({ level: 'error', icon: '⚠️', color: 'yellow' });
      expect(result.enterprise).toEqual({});
    });

    it('0.4.0->1.0.0 renames analysis to engine and adds stability', () => {
      const registry = new MigrationRegistry();
      const m = registry.getMigration('0.4.0', '1.0.0')!;
      const result = m.transform({ ruleConfig: {}, analysis: { typeAware: true } });
      expect(result.engine).toEqual({ typeAware: true });
      expect(result.stability).toEqual({ level: 'stable', pinned: false });
      expect('analysis' in result).toBe(false);
    });
  });
});

describe('ConfigMigrator', () => {
  function createMigrator(): ConfigMigrator {
    return new ConfigMigrator(new MigrationRegistry());
  }

  describe('forward migration', () => {
    it('migrates from 0.1.0 to 0.2.0', () => {
      const migrator = createMigrator();
      const result = migrator.migrate(
        { rules: { a: true }, exclude: ['dist'] },
        '0.1.0',
        '0.2.0'
      );
      expect(result.success).toBe(true);
      expect(result.config.ruleConfig).toEqual({ a: true });
      expect(result.config.ignore).toEqual(['dist']);
      expect(result.config.plugins).toEqual([]);
      expect(result.appliedMigrations).toEqual(['0.1.0->0.2.0']);
    });

    it('migrates from 0.2.0 to 0.3.0', () => {
      const migrator = createMigrator();
      const result = migrator.migrate(
        { ruleConfig: {}, maxWarnings: 5 },
        '0.2.0',
        '0.3.0'
      );
      expect(result.success).toBe(true);
      expect((result.config.maxViolations as Record<string, unknown>).warning).toBe(5);
      expect((result.config.analysis as Record<string, unknown>).typeAware).toBe(false);
    });

    it('migrates from 0.3.0 to 0.4.0', () => {
      const migrator = createMigrator();
      const result = migrator.migrate(
        { ruleConfig: {}, severity: 'warning' },
        '0.3.0',
        '0.4.0'
      );
      expect(result.success).toBe(true);
      expect(result.config.severity).toEqual({ level: 'warning', icon: '⚠️', color: 'yellow' });
      expect(result.config.enterprise).toEqual({});
    });

    it('migrates from 0.4.0 to 1.0.0', () => {
      const migrator = createMigrator();
      const result = migrator.migrate(
        { ruleConfig: {}, analysis: { typeAware: true } },
        '0.4.0',
        '1.0.0'
      );
      expect(result.success).toBe(true);
      expect(result.config.engine).toEqual({ typeAware: true });
      expect(result.config.stability).toEqual({ level: 'stable', pinned: false });
    });

    it('migrates full path 0.1.0 to 1.0.0', () => {
      const migrator = createMigrator();
      const result = migrator.migrate(
        { rules: { a: true }, exclude: ['dist'], maxWarnings: 5, severity: 'error' },
        '0.1.0',
        '1.0.0'
      );
      expect(result.success).toBe(true);
      expect(result.appliedMigrations.length).toBe(4);
      expect(result.config.ruleConfig).toEqual({ a: true });
      expect(result.config.engine).toBeDefined();
      expect(result.config.stability).toBeDefined();
      expect(result.config.enterprise).toBeDefined();
    });
  });

  describe('backward migration (rollback)', () => {
    it('rolls back from 1.0.0 to 0.4.0', () => {
      const migrator = createMigrator();
      const result = migrator.rollback(
        { ruleConfig: {}, engine: { typeAware: true }, stability: { level: 'stable', pinned: false } },
        '0.4.0',
        '1.0.0'
      );
      expect(result.success).toBe(true);
      expect(result.config.analysis).toEqual({ typeAware: true });
      expect('stability' in result.config).toBe(false);
    });

    it('rolls back full path from 1.0.0 to 0.1.0', () => {
      const migrator = createMigrator();
      const config = migrator.migrate(
        { rules: { a: true }, exclude: ['dist'] },
        '0.1.0',
        '1.0.0'
      );
      const result = migrator.rollback(config.config, '0.1.0', '1.0.0');
      expect(result.success).toBe(true);
      expect(result.config.rules).toEqual({ a: true });
      expect(result.config.exclude).toEqual(['dist']);
    });

    it('rolls back and preserves data through round-trip', () => {
      const migrator = createMigrator();
      const original = { rules: { foo: 'bar' }, exclude: ['a', 'b'] };
      const forward = migrator.migrate(original, '0.1.0', '0.2.0');
      const backward = migrator.rollback(forward.config, '0.1.0', '0.2.0');
      expect(backward.config.rules).toEqual({ foo: 'bar' });
      expect(backward.config.exclude).toEqual(['a', 'b']);
    });
  });

  describe('planMigration', () => {
    it('returns plan with correct steps', () => {
      const migrator = createMigrator();
      const plan = migrator.planMigration({}, '0.1.0', '0.3.0');
      expect(plan.totalSteps).toBe(2);
      expect(plan.steps[0]!.migrationId).toBe('0.1.0->0.2.0');
      expect(plan.steps[1]!.migrationId).toBe('0.2.0->0.3.0');
    });

    it('detects breaking changes in plan', () => {
      const migrator = createMigrator();
      const plan = migrator.planMigration({}, '0.1.0', '0.2.0');
      expect(plan.hasBreakingChanges).toBe(true);
    });

    it('estimates risk as high for long breaking path', () => {
      const migrator = createMigrator();
      const plan = migrator.planMigration({}, '0.1.0', '1.0.0');
      expect(plan.estimatedRisk).toBe('high');
    });

    it('estimates risk as low for short non-breaking path', () => {
      const migrator = createMigrator();
      const plan = migrator.planMigration({}, '0.2.0', '0.3.0');
      expect(plan.estimatedRisk).toBe('low');
    });

    it('returns empty plan for same version', () => {
      const migrator = createMigrator();
      const plan = migrator.planMigration({}, '0.1.0', '0.1.0');
      expect(plan.totalSteps).toBe(0);
      expect(plan.hasBreakingChanges).toBe(false);
    });
  });

  describe('autoDetectVersion', () => {
    it('detects 0.1.0 from rules field', () => {
      const migrator = createMigrator();
      expect(migrator.autoDetectVersion({ rules: {} })).toBe('0.1.0');
    });

    it('detects 0.2.0 from ruleConfig field', () => {
      const migrator = createMigrator();
      expect(migrator.autoDetectVersion({ ruleConfig: {} })).toBe('0.2.0');
    });

    it('detects 0.3.0 from analysis with typeAware', () => {
      const migrator = createMigrator();
      expect(migrator.autoDetectVersion({ ruleConfig: {}, analysis: { typeAware: true } })).toBe('0.3.0');
    });

    it('detects 0.4.0 from enterprise field', () => {
      const migrator = createMigrator();
      expect(migrator.autoDetectVersion({ ruleConfig: {}, enterprise: {} })).toBe('0.4.0');
    });

    it('detects 1.0.0 from engine field', () => {
      const migrator = createMigrator();
      expect(migrator.autoDetectVersion({ engine: {} })).toBe('1.0.0');
    });

    it('defaults to 0.1.0 for empty config', () => {
      const migrator = createMigrator();
      expect(migrator.autoDetectVersion({})).toBe('0.1.0');
    });
  });

  describe('multi-step migrations', () => {
    it('applies all migrations in order', () => {
      const migrator = createMigrator();
      const result = migrator.migrate(
        { rules: { test: true }, exclude: ['x'], maxWarnings: 3, severity: 'warn' },
        '0.1.0',
        '1.0.0'
      );
      expect(result.success).toBe(true);
      expect(result.appliedMigrations).toEqual([
        '0.1.0->0.2.0',
        '0.2.0->0.3.0',
        '0.3.0->0.4.0',
        '0.4.0->1.0.0',
      ]);
    });

    it('preserves non-migrated fields', () => {
      const migrator = createMigrator();
      const result = migrator.migrate(
        { rules: { a: 1 }, customField: 'preserved' },
        '0.1.0',
        '0.2.0'
      );
      expect(result.config.customField).toBe('preserved');
    });

    it('reports warnings for breaking changes', () => {
      const migrator = createMigrator();
      const result = migrator.migrate({ rules: {} }, '0.1.0', '0.2.0');
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('isMigrationNeeded', () => {
    it('returns true for different versions', () => {
      const migrator = createMigrator();
      expect(migrator.isMigrationNeeded('0.1.0', '1.0.0')).toBe(true);
    });

    it('returns false for same versions', () => {
      const migrator = createMigrator();
      expect(migrator.isMigrationNeeded('1.0.0', '1.0.0')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles no migration needed (same version)', () => {
      const migrator = createMigrator();
      const config: ConfigData = { rules: {} };
      const result = migrator.migrate(config, '0.1.0', '0.1.0');
      expect(result.success).toBe(true);
      expect(result.appliedMigrations).toEqual([]);
    });

    it('handles no migration path found', () => {
      const migrator = createMigrator();
      const result = migrator.migrate({ rules: {} }, '0.1.0', '99.0.0');
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('handles empty config', () => {
      const migrator = createMigrator();
      const result = migrator.migrate({}, '0.1.0', '0.2.0');
      expect(result.success).toBe(true);
    });

    it('returns error for invalid version', () => {
      const migrator = createMigrator();
      const result = migrator.migrate({}, '0.5.0', '0.6.0');
      expect(result.success).toBe(false);
    });

    it('does not mutate original config', () => {
      const migrator = createMigrator();
      const original = { rules: { a: true }, exclude: ['x'] };
      const copy = { ...original, rules: { ...original.rules }, exclude: [...original.exclude] };
      migrator.migrate(original, '0.1.0', '0.2.0');
      expect(original).toEqual(copy);
    });
  });
});

describe('MigrationValidator', () => {
  const validator = new MigrationValidator();

  describe('validateConfig', () => {
    it('validates valid 0.1.0 config', () => {
      const result = validator.validateConfig({ rules: {} }, '0.1.0');
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('reports missing required field for 0.1.0', () => {
      const result = validator.validateConfig({}, '0.1.0');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'rules')).toBe(true);
    });

    it('reports wrong type for field', () => {
      const result = validator.validateConfig({ rules: 'not-an-object' }, '0.1.0');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'rules' && e.message.includes('expected type'))).toBe(true);
    });

    it('reports deprecated fields as warnings', () => {
      const result = validator.validateConfig({ ruleConfig: {}, rules: {} }, '0.2.0');
      expect(result.warnings.some((w) => w.path === 'rules')).toBe(true);
    });

    it('returns valid for unknown version', () => {
      const result = validator.validateConfig({}, '99.0.0');
      expect(result.valid).toBe(true);
    });

    it('validates 1.0.0 config with deprecated analysis', () => {
      const result = validator.validateConfig({ ruleConfig: {}, analysis: {} }, '1.0.0');
      expect(result.warnings.some((w) => w.path === 'analysis')).toBe(true);
    });
  });

  describe('checkRequiredFields', () => {
    it('returns empty for all present fields', () => {
      const errors = validator.checkRequiredFields({ a: 1, b: 2 }, ['a', 'b']);
      expect(errors).toEqual([]);
    });

    it('reports missing fields', () => {
      const errors = validator.checkRequiredFields({ a: 1 }, ['a', 'b', 'c']);
      expect(errors.length).toBe(2);
      expect(errors[0]!.path).toBe('b');
      expect(errors[1]!.path).toBe('c');
    });

    it('handles empty config', () => {
      const errors = validator.checkRequiredFields({}, ['field']);
      expect(errors.length).toBe(1);
    });
  });

  describe('checkFieldTypes', () => {
    it('returns empty for correct types', () => {
      const errors = validator.checkFieldTypes({ name: 'hello', count: 42 }, { name: 'string', count: 'number' });
      expect(errors).toEqual([]);
    });

    it('reports wrong types', () => {
      const errors = validator.checkFieldTypes({ name: 42 }, { name: 'string' });
      expect(errors.length).toBe(1);
      expect(errors[0]!.path).toBe('name');
    });

    it('skips fields not in config', () => {
      const errors = validator.checkFieldTypes({}, { name: 'string' });
      expect(errors).toEqual([]);
    });

    it('accepts arrays for object type', () => {
      const errors = validator.checkFieldTypes({ items: [1, 2, 3] }, { items: 'object' });
      expect(errors).toEqual([]);
    });
  });

  describe('checkDeprecatedFields', () => {
    it('returns empty for no deprecated fields present', () => {
      const warnings = validator.checkDeprecatedFields({ a: 1 }, ['b']);
      expect(warnings).toEqual([]);
    });

    it('warns about deprecated fields', () => {
      const warnings = validator.checkDeprecatedFields({ old: true, new: true }, ['old']);
      expect(warnings.length).toBe(1);
      expect(warnings[0]!.path).toBe('old');
      expect(warnings[0]!.suggestion).toBeDefined();
    });
  });

  describe('suggestFixes', () => {
    it('suggests adding missing fields', () => {
      const fixes = validator.suggestFixes([{ path: 'rules', message: 'Required field "rules" is missing' }]);
      expect(fixes.length).toBe(1);
      expect(fixes[0]).toContain('Add');
    });

    it('suggests type changes', () => {
      const fixes = validator.suggestFixes([{ path: 'name', message: 'Field "name" expected type "string" but got "number"' }]);
      expect(fixes.length).toBe(1);
      expect(fixes[0]).toContain('Change the type');
    });

    it('handles generic errors', () => {
      const fixes = validator.suggestFixes([{ path: 'x', message: 'Something went wrong' }]);
      expect(fixes.length).toBe(1);
      expect(fixes[0]).toContain('Fix the issue');
    });
  });

  describe('validateMigration', () => {
    it('validates successful migration result', () => {
      const result = validator.validateMigration({ success: true, rules: {} });
      expect(result.valid).toBe(true);
    });

    it('reports errors from failed migration', () => {
      const result = validator.validateMigration({ success: false, errors: ['Migration failed'] });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message === 'Migration failed')).toBe(true);
    });
  });
});
