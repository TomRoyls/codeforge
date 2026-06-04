import { describe, it, expect } from 'vitest'
import { RuleRegistryV2 } from '../../src/core/rule-engine-v2/rule-registry-v2.js'
import { RuleComposer } from '../../src/core/rule-engine-v2/rule-composer.js'
import { RuleEngineV2 } from '../../src/core/rule-engine-v2/rule-engine-v2.js'
import type {
  RuleV2,
  RuleSet,
  RuleOverride,
  RuleGroup,
  RuleViolation,
  EngineResult,
  Severity,
} from '../../src/core/rule-engine-v2/types.js'

function createRule(overrides: Partial<RuleV2> = {}): RuleV2 {
  return {
    id: 'test-rule',
    name: 'Test Rule',
    description: 'A test rule',
    category: 'correctness',
    severity: 'error',
    enabled: true,
    tags: ['test'],
    dependencies: [],
    conflicts: [],
    fixable: false,
    deprecated: false,
    options: {},
    ...overrides,
  }
}

describe('RuleRegistryV2', () => {
  const registry = new RuleRegistryV2()

  describe('register', () => {
    it('should register a rule', () => {
      const rule = createRule({ id: 'reg-1' })
      registry.register(rule)
      expect(registry.isRegistered('reg-1')).toBe(true)
    })

    it('should register multiple rules', () => {
      registry.register(createRule({ id: 'reg-2' }))
      registry.register(createRule({ id: 'reg-3' }))
      expect(registry.isRegistered('reg-2')).toBe(true)
      expect(registry.isRegistered('reg-3')).toBe(true)
    })

    it('should overwrite existing rule with same id', () => {
      registry.register(createRule({ id: 'reg-overwrite', name: 'First' }))
      registry.register(createRule({ id: 'reg-overwrite', name: 'Second' }))
      const rule = registry.get('reg-overwrite')
      expect(rule?.name).toBe('Second')
    })
  })

  describe('unregister', () => {
    it('should unregister a rule and return true', () => {
      registry.register(createRule({ id: 'unreg-1' }))
      expect(registry.unregister('unreg-1')).toBe(true)
      expect(registry.isRegistered('unreg-1')).toBe(false)
    })

    it('should return false for non-existent rule', () => {
      expect(registry.unregister('non-existent')).toBe(false)
    })
  })

  describe('get', () => {
    it('should return rule by id', () => {
      registry.register(createRule({ id: 'get-1', name: 'Gettable' }))
      const rule = registry.get('get-1')
      expect(rule).not.toBeNull()
      expect(rule?.name).toBe('Gettable')
    })

    it('should return null for unknown id', () => {
      expect(registry.get('unknown-id')).toBeNull()
    })
  })

  describe('getAll', () => {
    it('should return all registered rules', () => {
      const fresh = new RuleRegistryV2()
      fresh.register(createRule({ id: 'all-1' }))
      fresh.register(createRule({ id: 'all-2' }))
      expect(fresh.getAll()).toHaveLength(2)
    })

    it('should return empty array for empty registry', () => {
      const fresh = new RuleRegistryV2()
      expect(fresh.getAll()).toEqual([])
    })
  })

  describe('getByCategory', () => {
    it('should filter rules by category', () => {
      const fresh = new RuleRegistryV2()
      fresh.register(createRule({ id: 'cat-1', category: 'security' }))
      fresh.register(createRule({ id: 'cat-2', category: 'style' }))
      fresh.register(createRule({ id: 'cat-3', category: 'security' }))
      const securityRules = fresh.getByCategory('security')
      expect(securityRules).toHaveLength(2)
    })

    it('should return empty array for unmatched category', () => {
      const fresh = new RuleRegistryV2()
      fresh.register(createRule({ id: 'cat-4', category: 'correctness' }))
      expect(fresh.getByCategory('performance')).toEqual([])
    })
  })

  describe('getByTag', () => {
    it('should filter rules by tag', () => {
      const fresh = new RuleRegistryV2()
      fresh.register(createRule({ id: 'tag-1', tags: ['security', 'injection'] }))
      fresh.register(createRule({ id: 'tag-2', tags: ['style'] }))
      fresh.register(createRule({ id: 'tag-3', tags: ['security'] }))
      expect(fresh.getByTag('security')).toHaveLength(2)
    })

    it('should return empty array for unmatched tag', () => {
      const fresh = new RuleRegistryV2()
      expect(fresh.getByTag('nonexistent')).toEqual([])
    })
  })

  describe('getEnabled', () => {
    it('should return only enabled rules', () => {
      const fresh = new RuleRegistryV2()
      fresh.register(createRule({ id: 'en-1', enabled: true }))
      fresh.register(createRule({ id: 'en-2', enabled: false }))
      fresh.register(createRule({ id: 'en-3', enabled: true }))
      expect(fresh.getEnabled()).toHaveLength(2)
    })
  })

  describe('getFixable', () => {
    it('should return only fixable rules', () => {
      const fresh = new RuleRegistryV2()
      fresh.register(createRule({ id: 'fix-1', fixable: true }))
      fresh.register(createRule({ id: 'fix-2', fixable: false }))
      expect(fresh.getFixable()).toHaveLength(1)
    })
  })

  describe('validate', () => {
    it('should return empty array for valid rule', () => {
      const errors = registry.validate(createRule({ id: 'valid' }))
      expect(errors).toEqual([])
    })

    it('should detect missing id', () => {
      const errors = registry.validate(createRule({ id: '' }))
      expect(errors).toContain('Rule id is required')
    })

    it('should detect missing name', () => {
      const errors = registry.validate(createRule({ name: '' }))
      expect(errors).toContain('Rule name is required')
    })

    it('should detect missing description', () => {
      const errors = registry.validate(createRule({ description: '' }))
      expect(errors).toContain('Rule description is required')
    })

    it('should detect invalid category', () => {
      const errors = registry.validate(createRule({ category: 'invalid' as Severity }))
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should detect invalid severity', () => {
      const errors = registry.validate(createRule({ severity: 'critical' as Severity }))
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should detect multiple errors at once', () => {
      const errors = registry.validate(createRule({ id: '', name: '' }))
      expect(errors.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('resolveDependencies', () => {
    it('should resolve empty dependencies', () => {
      const fresh = new RuleRegistryV2()
      fresh.register(createRule({ id: 'dep-1', dependencies: [] }))
      expect(fresh.resolveDependencies(['dep-1'])).toEqual(['dep-1'])
    })

    it('should resolve chain of dependencies', () => {
      const fresh = new RuleRegistryV2()
      fresh.register(createRule({ id: 'dep-a', dependencies: ['dep-b'] }))
      fresh.register(createRule({ id: 'dep-b', dependencies: ['dep-c'] }))
      fresh.register(createRule({ id: 'dep-c', dependencies: [] }))
      const resolved = fresh.resolveDependencies(['dep-a'])
      expect(resolved).toContain('dep-c')
      expect(resolved).toContain('dep-b')
      expect(resolved).toContain('dep-a')
    })

    it('should handle unknown dependency gracefully', () => {
      const fresh = new RuleRegistryV2()
      fresh.register(createRule({ id: 'dep-x', dependencies: ['unknown-dep'] }))
      const resolved = fresh.resolveDependencies(['dep-x'])
      expect(resolved).toContain('dep-x')
      expect(resolved).toContain('unknown-dep')
    })

    it('should not duplicate rules in resolution', () => {
      const fresh = new RuleRegistryV2()
      fresh.register(createRule({ id: 'shared', dependencies: [] }))
      fresh.register(createRule({ id: 'dep-y', dependencies: ['shared'] }))
      fresh.register(createRule({ id: 'dep-z', dependencies: ['shared'] }))
      const resolved = fresh.resolveDependencies(['dep-y', 'dep-z'])
      const sharedCount = resolved.filter((r) => r === 'shared').length
      expect(sharedCount).toBe(1)
    })
  })
})

describe('RuleComposer', () => {
  const composer = new RuleComposer()

  describe('createGroup', () => {
    it('should create a rule group', () => {
      const group = composer.createGroup('security', ['no-eval', 'no-with'], 'Security rules')
      expect(group.name).toBe('security')
      expect(group.rules).toEqual(['no-eval', 'no-with'])
      expect(group.description).toBe('Security rules')
      expect(group.enabled).toBe(true)
    })

    it('should create group with empty rules', () => {
      const group = composer.createGroup('empty', [], 'No rules')
      expect(group.rules).toEqual([])
    })
  })

  describe('mergeRuleSets', () => {
    it('should merge two rule sets', () => {
      const set1: RuleSet = {
        name: 'set1',
        description: 'First',
        rules: new Map([['rule-a', { severity: 'error' }]]),
      }
      const set2: RuleSet = {
        name: 'set2',
        description: 'Second',
        rules: new Map([['rule-b', { severity: 'warn' }]]),
      }
      const merged = composer.mergeRuleSets([set1, set2])
      expect(merged.rules.has('rule-a')).toBe(true)
      expect(merged.rules.has('rule-b')).toBe(true)
    })

    it('should override with later set winning', () => {
      const set1: RuleSet = {
        name: 'set1',
        description: 'First',
        rules: new Map([['rule-x', { severity: 'error' }]]),
      }
      const set2: RuleSet = {
        name: 'set2',
        description: 'Second',
        rules: new Map([['rule-x', { severity: 'warn' }]]),
      }
      const merged = composer.mergeRuleSets([set1, set2])
      expect(merged.rules.get('rule-x')?.severity).toBe('warn')
    })

    it('should merge extends arrays', () => {
      const set1: RuleSet = {
        name: 'set1',
        description: '',
        rules: new Map(),
        extends: ['base-a'],
      }
      const set2: RuleSet = {
        name: 'set2',
        description: '',
        rules: new Map(),
        extends: ['base-b'],
      }
      const merged = composer.mergeRuleSets([set1, set2])
      expect(merged.extends).toEqual(['base-a', 'base-b'])
    })

    it('should deduplicate extends', () => {
      const set1: RuleSet = {
        name: 'set1',
        description: '',
        rules: new Map(),
        extends: ['base-shared'],
      }
      const set2: RuleSet = {
        name: 'set2',
        description: '',
        rules: new Map(),
        extends: ['base-shared'],
      }
      const merged = composer.mergeRuleSets([set1, set2])
      const sharedCount = merged.extends!.filter((e) => e === 'base-shared').length
      expect(sharedCount).toBe(1)
    })

    it('should handle empty array', () => {
      const merged = composer.mergeRuleSets([])
      expect(merged.rules.size).toBe(0)
    })
  })

  describe('applyOverrides', () => {
    it('should apply severity override', () => {
      const rules = new Map<string, RuleV2>()
      rules.set('ov-1', createRule({ id: 'ov-1', severity: 'error' }))
      const overrides: RuleOverride[] = [{ ruleId: 'ov-1', severity: 'warn' }]
      const result = composer.applyOverrides(rules, overrides)
      expect(result.get('ov-1')?.severity).toBe('warn')
    })

    it('should apply enabled override', () => {
      const rules = new Map<string, RuleV2>()
      rules.set('ov-2', createRule({ id: 'ov-2', enabled: true }))
      const overrides: RuleOverride[] = [{ ruleId: 'ov-2', enabled: false }]
      const result = composer.applyOverrides(rules, overrides)
      expect(result.get('ov-2')?.enabled).toBe(false)
    })

    it('should apply options override with merge', () => {
      const rules = new Map<string, RuleV2>()
      rules.set('ov-3', createRule({ id: 'ov-3', options: { max: 10 } }))
      const overrides: RuleOverride[] = [{ ruleId: 'ov-3', options: { min: 5 } }]
      const result = composer.applyOverrides(rules, overrides)
      expect(result.get('ov-3')?.options).toEqual({ max: 10, min: 5 })
    })

    it('should ignore overrides for non-existent rules', () => {
      const rules = new Map<string, RuleV2>()
      rules.set('ov-4', createRule({ id: 'ov-4' }))
      const overrides: RuleOverride[] = [{ ruleId: 'missing', severity: 'warn' }]
      const result = composer.applyOverrides(rules, overrides)
      expect(result.get('ov-4')?.severity).toBe('error')
    })

    it('should apply multiple overrides', () => {
      const rules = new Map<string, RuleV2>()
      rules.set('multi-1', createRule({ id: 'multi-1', severity: 'error', enabled: true }))
      const overrides: RuleOverride[] = [
        { ruleId: 'multi-1', severity: 'info', enabled: false },
      ]
      const result = composer.applyOverrides(rules, overrides)
      expect(result.get('multi-1')?.severity).toBe('info')
      expect(result.get('multi-1')?.enabled).toBe(false)
    })

    it('should not mutate original rules', () => {
      const rules = new Map<string, RuleV2>()
      const original = createRule({ id: 'orig-1', severity: 'error' })
      rules.set('orig-1', original)
      const overrides: RuleOverride[] = [{ ruleId: 'orig-1', severity: 'warn' }]
      composer.applyOverrides(rules, overrides)
      expect(original.severity).toBe('error')
    })
  })

  describe('resolveConflicts', () => {
    it('should detect conflicting rules', () => {
      const rules = [
        createRule({ id: 'conflict-a', conflicts: ['conflict-b'] }),
        createRule({ id: 'conflict-b', conflicts: ['conflict-a'] }),
      ]
      const conflicts = composer.resolveConflicts(rules)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]).toBe('conflict-a:conflict-b')
    })

    it('should return empty for non-conflicting rules', () => {
      const rules = [
        createRule({ id: 'no-conflict-a', conflicts: [] }),
        createRule({ id: 'no-conflict-b', conflicts: [] }),
      ]
      expect(composer.resolveConflicts(rules)).toEqual([])
    })

    it('should not duplicate conflict pairs', () => {
      const rules = [
        createRule({ id: 'z-a', conflicts: ['z-b'] }),
        createRule({ id: 'z-b', conflicts: ['z-a'] }),
      ]
      const conflicts = composer.resolveConflicts(rules)
      expect(conflicts).toHaveLength(1)
    })

    it('should handle missing conflict target', () => {
      const rules = [createRule({ id: 'ghost', conflicts: ['nonexistent'] })]
      expect(composer.resolveConflicts(rules)).toEqual([])
    })
  })

  describe('filterByFiles', () => {
    it('should return all rules when no file filter', () => {
      const rules = new Map<string, RuleV2>()
      rules.set('filter-1', createRule({ id: 'filter-1' }))
      rules.set('filter-2', createRule({ id: 'filter-2' }))
      const result = composer.filterByFiles(rules, 'src/test.ts')
      expect(result.size).toBe(2)
    })
  })

  describe('flattenRuleSet', () => {
    it('should flatten rule set with registry rules', () => {
      const reg = new RuleRegistryV2()
      reg.register(createRule({ id: 'flat-1', severity: 'error' }))
      const ruleSet: RuleSet = {
        name: 'flat-test',
        description: 'Test',
        rules: new Map([['flat-1', { severity: 'warn' }]]),
      }
      const result = composer.flattenRuleSet(ruleSet, reg)
      expect(result.get('flat-1')?.severity).toBe('warn')
    })

    it('should handle rule not in registry', () => {
      const reg = new RuleRegistryV2()
      const ruleSet: RuleSet = {
        name: 'flat-missing',
        description: 'Test',
        rules: new Map([['missing-rule', { severity: 'warn' }]]),
      }
      const result = composer.flattenRuleSet(ruleSet, reg)
      expect(result.has('missing-rule')).toBe(false)
    })

    it('should merge options when flattening', () => {
      const reg = new RuleRegistryV2()
      reg.register(createRule({ id: 'flat-opt', options: { max: 10 } }))
      const ruleSet: RuleSet = {
        name: 'flat-opt-test',
        description: 'Test',
        rules: new Map([['flat-opt', { options: { min: 5 } }]]),
      }
      const result = composer.flattenRuleSet(ruleSet, reg)
      expect(result.get('flat-opt')?.options).toEqual({ max: 10, min: 5 })
    })

    it('should process extends', () => {
      const reg = new RuleRegistryV2()
      reg.register(createRule({ id: 'ext-base', severity: 'error' }))
      const ruleSet: RuleSet = {
        name: 'ext-test',
        description: 'Test',
        rules: new Map(),
        extends: ['ext-base'],
      }
      const result = composer.flattenRuleSet(ruleSet, reg)
      expect(result.has('ext-base')).toBe(true)
    })
  })
})

describe('RuleEngineV2', () => {
  describe('constructor', () => {
    it('should create engine with builtin rules registered', () => {
      const engine = new RuleEngineV2()
      const registry = engine.getRegistry()
      expect(registry.isRegistered('no-console')).toBe(true)
      expect(registry.isRegistered('no-eval')).toBe(true)
      expect(registry.isRegistered('no-debugger')).toBe(true)
      expect(registry.isRegistered('no-var')).toBe(true)
      expect(registry.isRegistered('no-with')).toBe(true)
    })
  })

  describe('registerRule', () => {
    it('should register custom rule', () => {
      const engine = new RuleEngineV2()
      engine.registerRule(createRule({ id: 'custom-1' }))
      expect(engine.getRegistry().isRegistered('custom-1')).toBe(true)
    })
  })

  describe('configure', () => {
    it('should configure with a rule set', () => {
      const engine = new RuleEngineV2()
      const ruleSet: RuleSet = {
        name: 'test-config',
        description: 'Test',
        rules: new Map([['no-console', { enabled: true }]]),
      }
      engine.configure(ruleSet)
      expect(engine.getAppliedRules()).toContain('no-console')
    })

    it('should configure with overrides', () => {
      const engine = new RuleEngineV2()
      const ruleSet: RuleSet = {
        name: 'test-override',
        description: 'Test',
        rules: new Map([
          ['no-console', { enabled: true }],
          ['no-eval', { enabled: true }],
        ]),
      }
      engine.configure(ruleSet, [{ ruleId: 'no-console', severity: 'info' }])
      expect(engine.getAppliedRules()).toContain('no-console')
    })

    it('should clear previous configuration on reconfigure', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'first',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      expect(engine.getAppliedRules()).toContain('no-console')
      engine.configure({
        name: 'second',
        description: '',
        rules: new Map([['no-eval', { enabled: true }]]),
      })
      expect(engine.getAppliedRules()).not.toContain('no-console')
      expect(engine.getAppliedRules()).toContain('no-eval')
    })
  })

  describe('analyze', () => {
    it('should detect console.log violations', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      const result = engine.analyze('console.log("hello")', 'test.ts')
      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations[0]!.ruleId).toBe('no-console')
    })

    it('should detect multiple violations on the same line', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      const result = engine.analyze(
        'console.log("a"); console.log("b"); console.log("c")',
        'test.ts',
      )
      expect(result.violations).toHaveLength(3)
      expect(result.violations[0]!.ruleId).toBe('no-console')
      expect(result.violations[1]!.ruleId).toBe('no-console')
      expect(result.violations[2]!.ruleId).toBe('no-console')
    })

    it('should detect eval() violations', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-eval', { enabled: true }]]),
      })
      const result = engine.analyze('eval("1+1")', 'test.ts')
      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations[0]!.ruleId).toBe('no-eval')
    })

    it('should detect debugger violations', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-debugger', { enabled: true }]]),
      })
      const result = engine.analyze('debugger', 'test.ts')
      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations[0]!.ruleId).toBe('no-debugger')
    })

    it('should detect var violations', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-var', { enabled: true }]]),
      })
      const result = engine.analyze('var x = 1', 'test.ts')
      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations[0]!.ruleId).toBe('no-var')
    })

    it('should detect with statement violations', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-with', { enabled: true }]]),
      })
      const result = engine.analyze('with (obj) { }', 'test.ts')
      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations[0]!.ruleId).toBe('no-with')
    })

    it('should skip disabled rules', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: false }]]),
      })
      const result = engine.analyze('console.log("hello")', 'test.ts')
      expect(result.violations).toHaveLength(0)
      expect(result.rulesSkipped).toContain('no-console')
    })

    it('should skip off severity rules', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true, severity: 'off' }]]),
      })
      const result = engine.analyze('console.log("hello")', 'test.ts')
      expect(result.violations).toHaveLength(0)
    })

    it('should report correct line numbers', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      const source = 'const a = 1\nconsole.log("hi")\nconst b = 2'
      const result = engine.analyze(source, 'test.ts')
      expect(result.violations[0]!.line).toBe(2)
    })

    it('should report multiple violations', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([
          ['no-console', { enabled: true }],
          ['no-eval', { enabled: true }],
        ]),
      })
      const result = engine.analyze('console.log("x")\neval("1")', 'test.ts')
      expect(result.violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should compute stats correctly', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([
          ['no-console', { enabled: true, severity: 'warn' }],
          ['no-eval', { enabled: true, severity: 'error' }],
        ]),
      })
      const result = engine.analyze('console.log()\neval("x")', 'test.ts')
      expect(result.stats.errors).toBe(1)
      expect(result.stats.warnings).toBe(1)
    })

    it('should track duration', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      const result = engine.analyze('console.log()', 'test.ts')
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should provide fix for fixable rules', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      const result = engine.analyze('console.log()', 'test.ts')
      expect(result.violations[0]!.fix).toBeDefined()
    })

    it('should return empty violations for clean code', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      const result = engine.analyze('const x = 1', 'test.ts')
      expect(result.violations).toHaveLength(0)
    })
  })

  describe('analyze with custom rule pattern', () => {
    it('should detect custom pattern violations', () => {
      const engine = new RuleEngineV2()
      engine.registerRule(
        createRule({
          id: 'no-todo',
          name: 'No TODO',
          description: 'Disallow TODO comments',
          category: 'style',
          severity: 'warn',
          options: { pattern: 'TODO' },
        }),
      )
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-todo', { enabled: true }]]),
      })
      const result = engine.analyze('// TODO: fix this', 'test.ts')
      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations[0]!.ruleId).toBe('no-todo')
    })

    it('should skip invalid regex pattern gracefully', () => {
      const engine = new RuleEngineV2()
      engine.registerRule(
        createRule({
          id: 'bad-pattern',
          name: 'Bad Pattern',
          description: 'Bad regex',
          options: { pattern: '[' },
        }),
      )
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['bad-pattern', { enabled: true }]]),
      })
      const result = engine.analyze('some code', 'test.ts')
      expect(result.violations).toHaveLength(0)
    })
  })

  describe('analyzeMany', () => {
    it('should analyze multiple files', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      const files = new Map<string, string>([
        ['a.ts', 'console.log("a")'],
        ['b.ts', 'const x = 1'],
      ])
      const results = engine.analyzeMany(files)
      expect(results).toHaveLength(2)
      expect(results[0]!.violations.length).toBeGreaterThan(0)
      expect(results[1]!.violations).toHaveLength(0)
    })

    it('should handle empty file map', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      expect(engine.analyzeMany(new Map())).toEqual([])
    })
  })

  describe('isRuleApplicable', () => {
    it('should return false for disabled rule', () => {
      const engine = new RuleEngineV2()
      const rule = createRule({ enabled: false })
      expect(engine.isRuleApplicable(rule, 'test.ts')).toBe(false)
    })

    it('should return false for deprecated rule with replacement', () => {
      const engine = new RuleEngineV2()
      const rule = createRule({ deprecated: true, replacedBy: 'new-rule' })
      expect(engine.isRuleApplicable(rule, 'test.ts')).toBe(false)
    })

    it('should return true for enabled rule', () => {
      const engine = new RuleEngineV2()
      const rule = createRule({ enabled: true })
      expect(engine.isRuleApplicable(rule, 'test.ts')).toBe(true)
    })

    it('should exclude files matching exclude pattern', () => {
      const engine = new RuleEngineV2()
      const rule = createRule({ options: { exclude: ['test'] } })
      expect(engine.isRuleApplicable(rule, 'src/test/file.ts')).toBe(false)
    })

    it('should include only files matching include pattern', () => {
      const engine = new RuleEngineV2()
      const rule = createRule({ options: { include: ['src'] } })
      expect(engine.isRuleApplicable(rule, 'src/file.ts')).toBe(true)
      expect(engine.isRuleApplicable(rule, 'lib/file.ts')).toBe(false)
    })
  })

  describe('getAppliedRules', () => {
    it('should return empty before configure', () => {
      const engine = new RuleEngineV2()
      expect(engine.getAppliedRules()).toEqual([])
    })

    it('should return configured rules', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([
          ['no-console', { enabled: true }],
          ['no-eval', { enabled: true }],
        ]),
      })
      expect(engine.getAppliedRules()).toContain('no-console')
      expect(engine.getAppliedRules()).toContain('no-eval')
    })
  })

  describe('getStatistics', () => {
    it('should return zero stats initially', () => {
      const engine = new RuleEngineV2()
      const stats = engine.getStatistics()
      expect(stats.totalRuns).toBe(0)
      expect(stats.totalViolations).toBe(0)
      expect(stats.avgDuration).toBe(0)
    })

    it('should accumulate stats across runs', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      engine.analyze('console.log()', 'test.ts')
      engine.analyze('console.log()', 'test.ts')
      const stats = engine.getStatistics()
      expect(stats.totalRuns).toBe(2)
      expect(stats.totalViolations).toBeGreaterThanOrEqual(2)
      expect(stats.avgDuration).toBeGreaterThan(0)
    })
  })

  describe('reset', () => {
    it('should clear all state', () => {
      const engine = new RuleEngineV2()
      engine.configure({
        name: 'test',
        description: '',
        rules: new Map([['no-console', { enabled: true }]]),
      })
      engine.analyze('console.log()', 'test.ts')
      engine.reset()
      expect(engine.getAppliedRules()).toEqual([])
      expect(engine.getStatistics().totalRuns).toBe(0)
      expect(engine.getStatistics().totalViolations).toBe(0)
    })
  })
})

describe('Integration', () => {
  it('should run full pipeline: register, configure, analyze', () => {
    const engine = new RuleEngineV2()
    engine.registerRule(
      createRule({
        id: 'custom-security',
        name: 'No InnerHTML',
        description: 'Disallow innerHTML assignment',
        category: 'security',
        severity: 'error',
        options: { pattern: 'innerHTML' },
      }),
    )
    engine.configure({
      name: 'full-pipeline',
      description: 'Integration test',
      rules: new Map([
        ['no-console', { enabled: true }],
        ['custom-security', { enabled: true }],
      ]),
    })
    const result = engine.analyze(
      'element.innerHTML = "bad"\nconsole.log("oops")',
      'app.ts',
    )
    expect(result.violations.length).toBeGreaterThanOrEqual(2)
    expect(result.stats.errors).toBeGreaterThanOrEqual(1)
    expect(result.stats.warnings).toBeGreaterThanOrEqual(1)
  })

  it('should handle configure with extends and overrides', () => {
    const engine = new RuleEngineV2()
    const ruleSet: RuleSet = {
      name: 'extended',
      description: 'Test extends',
      rules: new Map([
        ['no-console', { enabled: true, severity: 'warn' }],
      ]),
      extends: ['no-eval'],
    }
    const overrides: RuleOverride[] = [
      { ruleId: 'no-console', severity: 'error' },
    ]
    engine.configure(ruleSet, overrides)
    const result = engine.analyze('console.log("x")', 'test.ts')
    expect(result.stats.errors).toBe(1)
    expect(result.stats.warnings).toBe(0)
  })

  it('should handle rule with dependencies', () => {
    const engine = new RuleEngineV2()
    engine.registerRule(
      createRule({ id: 'parent-rule', dependencies: ['no-console'] }),
    )
    engine.configure({
      name: 'deps',
      description: '',
      rules: new Map([
        ['parent-rule', { enabled: true }],
        ['no-console', { enabled: true }],
      ]),
    })
    const result = engine.analyze('console.log()', 'test.ts')
    expect(result.violations.length).toBeGreaterThan(0)
  })

  it('should correctly count violations across multiple analyses', () => {
    const engine = new RuleEngineV2()
    engine.configure({
      name: 'multi',
      description: '',
      rules: new Map([['no-console', { enabled: true }]]),
    })
    engine.analyze('console.log()', 'a.ts')
    engine.analyze('console.log()', 'b.ts')
    engine.analyze('const x = 1', 'c.ts')
    const stats = engine.getStatistics()
    expect(stats.totalRuns).toBe(3)
    expect(stats.totalViolations).toBe(2)
  })
})
