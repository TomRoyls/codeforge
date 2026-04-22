import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  LazyRuleLoader,
  lazyRuleLoader,
  getRuleCategory,
  ALL_RULE_IDS,
  type RuleCategory,
} from '../../../src/rules/lazy-loader.js'
import type { RuleDefinition } from '../../../src/rules/types.js'

describe('LazyRuleLoader', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    // Create fresh instance per test to avoid cache pollution
    loader = new LazyRuleLoader()
  })

  describe('constructor', () => {
    test('creates instance with default options', () => {
      const defaultLoader = new LazyRuleLoader()
      expect(defaultLoader.isEagerLoadingEnabled()).toBe(false)
    })

    test('creates instance with eagerLoading enabled', () => {
      const eagerLoader = new LazyRuleLoader({ eagerLoading: true })
      expect(eagerLoader.isEagerLoadingEnabled()).toBe(true)
    })

    test('creates instance with eagerLoading disabled explicitly', () => {
      const lazyLoader = new LazyRuleLoader({ eagerLoading: false })
      expect(lazyLoader.isEagerLoadingEnabled()).toBe(false)
    })

    test('initializes with empty cache', () => {
      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(0)
    })
  })

  describe('hasRule', () => {
    test('returns true for known rule - no-magic-numbers', () => {
      expect(loader.hasRule('no-magic-numbers')).toBe(true)
    })

    test('returns true for known rule - max-complexity', () => {
      expect(loader.hasRule('max-complexity')).toBe(true)
    })

    test('returns true for known rule - no-await-in-loop', () => {
      expect(loader.hasRule('no-await-in-loop')).toBe(true)
    })

    test('returns true for known rule - no-circular-deps', () => {
      expect(loader.hasRule('no-circular-deps')).toBe(true)
    })

    test('returns true for known rule - no-deprecated-api', () => {
      expect(loader.hasRule('no-deprecated-api')).toBe(true)
    })

    test('returns true for known rule - no-skipped-tests', () => {
      expect(loader.hasRule('no-skipped-tests')).toBe(true)
    })

    test('returns true for known rule - no-empty-catch', () => {
      expect(loader.hasRule('no-empty-catch')).toBe(true)
    })

    test('returns true for pattern rule - consistent-type-exports', () => {
      expect(loader.hasRule('consistent-type-exports')).toBe(true)
    })

    test('returns false for unknown rule', () => {
      expect(loader.hasRule('non-existent-rule')).toBe(false)
    })

    test('returns false for empty string', () => {
      expect(loader.hasRule('')).toBe(false)
    })

    test('returns false for rule with typo', () => {
      expect(loader.hasRule('no-magic-number')).toBe(false)
    })
  })

  describe('getRuleIds', () => {
    test('returns array of all rule IDs', () => {
      const ruleIds = loader.getRuleIds()
      expect(Array.isArray(ruleIds)).toBe(true)
      expect(ruleIds.length).toBeGreaterThan(100)
    })

    test('returns same reference as ALL_RULE_IDS', () => {
      const ruleIds = loader.getRuleIds()
      expect(ruleIds).toBe(ALL_RULE_IDS)
    })

    test('includes known rules', () => {
      const ruleIds = loader.getRuleIds()
      expect(ruleIds).toContain('no-magic-numbers')
      expect(ruleIds).toContain('max-complexity')
      expect(ruleIds).toContain('no-await-in-loop')
      expect(ruleIds).toContain('no-circular-deps')
    })

    test('includes pattern rules', () => {
      const ruleIds = loader.getRuleIds()
      expect(ruleIds).toContain('consistent-type-exports')
      expect(ruleIds).toContain('curly')
      expect(ruleIds).toContain('eq-eq-eq')
    })

    test('has consistent length with ALL_RULE_IDS', () => {
      const ruleIds = loader.getRuleIds()
      expect(ruleIds.length).toBe(ALL_RULE_IDS.length)
    })
  })

  describe('getRuleCategory', () => {
    test('returns complexity for max-complexity', () => {
      expect(loader.getRuleCategory('max-complexity')).toBe('complexity')
    })

    test('returns complexity for max-depth', () => {
      expect(loader.getRuleCategory('max-depth')).toBe('complexity')
    })

    test('returns complexity for max-lines', () => {
      expect(loader.getRuleCategory('max-lines')).toBe('complexity')
    })

    test('returns complexity for max-lines-per-function', () => {
      expect(loader.getRuleCategory('max-lines-per-function')).toBe('complexity')
    })

    test('returns complexity for max-params', () => {
      expect(loader.getRuleCategory('max-params')).toBe('complexity')
    })

    test('returns performance for no-await-in-loop', () => {
      expect(loader.getRuleCategory('no-await-in-loop')).toBe('performance')
    })

    test('returns performance for no-sync-in-async', () => {
      expect(loader.getRuleCategory('no-sync-in-async')).toBe('performance')
    })

    test('returns performance for prefer-object-spread', () => {
      expect(loader.getRuleCategory('prefer-object-spread')).toBe('performance')
    })

    test('returns dependencies for no-circular-deps', () => {
      expect(loader.getRuleCategory('no-circular-deps')).toBe('dependencies')
    })

    test('returns dependencies for no-unused-exports', () => {
      expect(loader.getRuleCategory('no-unused-exports')).toBe('dependencies')
    })

    test('returns dependencies for consistent-imports', () => {
      expect(loader.getRuleCategory('consistent-imports')).toBe('dependencies')
    })

    test('returns dependencies for no-barrel-imports', () => {
      expect(loader.getRuleCategory('no-barrel-imports')).toBe('dependencies')
    })

    test('returns security for no-deprecated-api', () => {
      expect(loader.getRuleCategory('no-deprecated-api')).toBe('security')
    })

    test('returns security for no-dynamic-delete', () => {
      expect(loader.getRuleCategory('no-dynamic-delete')).toBe('security')
    })

    test('returns security for no-eval', () => {
      expect(loader.getRuleCategory('no-eval')).toBe('security')
    })

    test('returns security for no-unsafe-return', () => {
      expect(loader.getRuleCategory('no-unsafe-return')).toBe('security')
    })

    test('returns testing for no-skipped-tests', () => {
      expect(loader.getRuleCategory('no-skipped-tests')).toBe('testing')
    })

    test('returns testing for no-focused-tests', () => {
      expect(loader.getRuleCategory('no-focused-tests')).toBe('testing')
    })

    test('returns correctness for no-empty-catch', () => {
      expect(loader.getRuleCategory('no-empty-catch')).toBe('correctness')
    })

    test('returns correctness for no-useless-catch', () => {
      expect(loader.getRuleCategory('no-useless-catch')).toBe('correctness')
    })

    test('returns patterns for consistent-type-exports', () => {
      expect(loader.getRuleCategory('consistent-type-exports')).toBe('patterns')
    })

    test('returns patterns for curly', () => {
      expect(loader.getRuleCategory('curly')).toBe('patterns')
    })

    test('returns patterns for eq-eq-eq', () => {
      expect(loader.getRuleCategory('eq-eq-eq')).toBe('patterns')
    })

    test('returns complexity as default for unknown rule', () => {
      expect(loader.getRuleCategory('unknown-rule')).toBe('complexity')
    })

    test('returns complexity as default for empty string', () => {
      expect(loader.getRuleCategory('')).toBe('complexity')
    })
  })

  describe('loadRule', () => {
    test('loads a known rule and returns RuleDefinition', async () => {
      const rule = await loader.loadRule('max-complexity')
      expect(rule).toBeDefined()
      expect(rule!.meta.name).toBe('max-complexity')
      expect(rule!.create).toBeDefined()
      expect(rule!.defaultOptions).toBeDefined()
    })

    test('returns undefined for unknown rule', async () => {
      const rule = await loader.loadRule('non-existent-rule')
      expect(rule).toBeUndefined()
    })

    test('caches loaded rule - second call returns cached', async () => {
      // First load
      const rule1 = await loader.loadRule('max-depth')

      // Check cache stats
      const stats1 = loader.getCacheStats()
      expect(stats1.cached).toBe(1)

      // Second load - should return cached
      const rule2 = await loader.loadRule('max-depth')

      expect(rule2).toBe(rule1)
      const stats2 = loader.getCacheStats()
      expect(stats2.cached).toBe(1) // Still 1, not 2
    })

    test('loads different rules independently', async () => {
      const rule1 = await loader.loadRule('max-lines')
      const rule2 = await loader.loadRule('max-params')

      expect(rule1).toBeDefined()
      expect(rule2).toBeDefined()
      expect(rule1).not.toBe(rule2)
      expect(rule1!.meta.name).toBe('max-lines')
      expect(rule2!.meta.name).toBe('max-params')

      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(2)
    })

    test('handles concurrent loads of same rule - promise deduplication', async () => {
      // Start multiple concurrent loads of the same rule
      const [rule1, rule2, rule3] = await Promise.all([
        loader.loadRule('max-lines-per-function'),
        loader.loadRule('max-lines-per-function'),
        loader.loadRule('max-lines-per-function'),
      ])

      // All should return the same rule instance
      expect(rule1).toBe(rule2)
      expect(rule2).toBe(rule3)
      expect(rule1).toBeDefined()

      // Cache should only have one entry
      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(1)
    })

    test('loads best-practices rule', async () => {
      const rule = await loader.loadRule('no-magic-numbers')
      expect(rule).toBeDefined()
      expect(rule!.meta.name).toBe('no-magic-numbers')
    })

    test('loads performance rule', async () => {
      const rule = await loader.loadRule('no-await-in-loop')
      expect(rule).toBeDefined()
      expect(rule!.meta.name).toBe('no-await-in-loop')
    })

    test('loads dependencies rule', async () => {
      const rule = await loader.loadRule('no-circular-deps')
      expect(rule).toBeDefined()
      expect(rule!.meta.name).toBe('no-circular-deps')
    })

    test('loads security rule', async () => {
      const rule = await loader.loadRule('no-eval')
      expect(rule).toBeDefined()
      expect(rule!.meta.name).toBe('no-eval')
    })

    test('loads testing rule', async () => {
      const rule = await loader.loadRule('no-skipped-tests')
      expect(rule).toBeDefined()
      expect(rule!.meta.name).toBe('no-skipped-tests')
    })

    test('loads pattern rule from createPatternRuleLoaders', async () => {
      const rule = await loader.loadRule('consistent-type-exports')
      expect(rule).toBeDefined()
      expect(rule!.meta.name).toBe('consistent-type-exports')
    })

    test('loads adapted plugin rule - no-console', async () => {
      const rule = await loader.loadRule('no-console')
      expect(rule).toBeDefined()
      expect(rule!.meta.name).toBe('no-console')
    })

    test('loads adapted plugin rule - no-throw-literal', async () => {
      const rule = await loader.loadRule('no-throw-literal')
      expect(rule).toBeDefined()
      expect(rule!.meta.name).toBe('no-throw-literal')
    })
  })

  describe('loadRules', () => {
    test('loads multiple rules in parallel', async () => {
      const rules = await loader.loadRules(['max-complexity', 'max-depth', 'max-lines'])

      expect(Object.keys(rules)).toHaveLength(3)
      expect(rules['max-complexity']).toBeDefined()
      expect(rules['max-depth']).toBeDefined()
      expect(rules['max-lines']).toBeDefined()
    })

    test('returns empty object for empty array', async () => {
      const rules = await loader.loadRules([])
      expect(rules).toEqual({})
    })

    test('omits unknown rules from result', async () => {
      const rules = await loader.loadRules(['max-params', 'unknown-rule', 'max-lines'])

      expect(Object.keys(rules)).toHaveLength(2)
      expect(rules['max-params']).toBeDefined()
      expect(rules['max-lines']).toBeDefined()
      expect(rules['unknown-rule']).toBeUndefined()
    })

    test('caches all loaded rules', async () => {
      await loader.loadRules(['max-complexity', 'max-depth', 'max-lines', 'max-params'])

      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(4)
    })

    test('handles mix of cached and uncached rules', async () => {
      // Pre-load one rule
      await loader.loadRule('max-complexity')

      // Load multiple including the cached one
      const rules = await loader.loadRules(['max-complexity', 'max-depth', 'max-lines'])

      expect(Object.keys(rules)).toHaveLength(3)
      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(3)
    })

    test('loads rules from different categories', async () => {
      const rules = await loader.loadRules([
        'max-complexity', // complexity
        'no-await-in-loop', // performance
        'no-circular-deps', // dependencies
        'no-eval', // security
        'no-skipped-tests', // testing
      ])

      expect(Object.keys(rules)).toHaveLength(5)
    })
  })

  describe('loadRulesByCategory', () => {
    test('loads all complexity rules', async () => {
      const rules = await loader.loadRulesByCategory('complexity')

      expect(Object.keys(rules).length).toBeGreaterThan(0)
      // Verify all returned rules are complexity rules
      for (const ruleId of Object.keys(rules)) {
        expect(loader.getRuleCategory(ruleId)).toBe('complexity')
      }
    })

    test('loads all performance rules', async () => {
      const rules = await loader.loadRulesByCategory('performance')

      expect(Object.keys(rules).length).toBeGreaterThan(0)
      for (const ruleId of Object.keys(rules)) {
        expect(loader.getRuleCategory(ruleId)).toBe('performance')
      }
    })

    test('loads all dependencies rules', async () => {
      const rules = await loader.loadRulesByCategory('dependencies')

      expect(Object.keys(rules).length).toBeGreaterThan(0)
      for (const ruleId of Object.keys(rules)) {
        expect(loader.getRuleCategory(ruleId)).toBe('dependencies')
      }
    })

    test('loads all security rules', async () => {
      const rules = await loader.loadRulesByCategory('security')

      expect(Object.keys(rules).length).toBeGreaterThan(0)
      for (const ruleId of Object.keys(rules)) {
        expect(loader.getRuleCategory(ruleId)).toBe('security')
      }
    })

    test('loads all testing rules', async () => {
      const rules = await loader.loadRulesByCategory('testing')

      expect(Object.keys(rules).length).toBeGreaterThan(0)
      for (const ruleId of Object.keys(rules)) {
        expect(loader.getRuleCategory(ruleId)).toBe('testing')
      }
    })

    test('loads all correctness rules', async () => {
      const rules = await loader.loadRulesByCategory('correctness')

      expect(Object.keys(rules).length).toBeGreaterThan(0)
      for (const ruleId of Object.keys(rules)) {
        expect(loader.getRuleCategory(ruleId)).toBe('correctness')
      }
    })

    test('loads all patterns rules', async () => {
      const rules = await loader.loadRulesByCategory('patterns')

      // Patterns is the largest category
      expect(Object.keys(rules).length).toBeGreaterThan(50)
      for (const ruleId of Object.keys(rules)) {
        expect(loader.getRuleCategory(ruleId)).toBe('patterns')
      }
    })

    test('returns empty object for category with no rules', async () => {
      // This tests the edge case, though all categories should have rules
      const rules = await loader.loadRulesByCategory('nonexistent' as RuleCategory)
      expect(Object.keys(rules)).toHaveLength(0)
    })
  })

  describe('preload', () => {
    test('preloads rules into cache', async () => {
      await loader.preload(['max-complexity', 'max-depth', 'max-lines'])

      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(3)
    })

    test('preloading allows instant retrieval', async () => {
      await loader.preload(['max-params'])

      // After preload, loadRule should return cached immediately
      const rule = await loader.loadRule('max-params')
      expect(rule).toBeDefined()
      expect(loader.getCacheStats().cached).toBe(1)
    })

    test('handles empty array', async () => {
      await loader.preload([])
      expect(loader.getCacheStats().cached).toBe(0)
    })

    test('ignores unknown rules', async () => {
      await loader.preload(['max-lines', 'unknown-rule', 'max-params'])

      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(2)
    })

    test('can be called multiple times', async () => {
      await loader.preload(['max-complexity'])
      await loader.preload(['max-depth'])
      await loader.preload(['max-lines'])

      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(3)
    })
  })

  describe('loadAllRules', () => {
    test('loads all available rules', async () => {
      const rules = await loader.loadAllRules()

      // Should load all rules from ALL_RULE_IDS
      expect(Object.keys(rules).length).toBe(ALL_RULE_IDS.length)
    })

    test('caches all loaded rules', async () => {
      await loader.loadAllRules()

      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(ALL_RULE_IDS.length)
    })

    test('all loaded rules have valid RuleDefinition structure', async () => {
      const rules = await loader.loadAllRules()

      for (const [ruleId, rule] of Object.entries(rules)) {
        expect(rule.meta).toBeDefined()
        expect(rule.meta.name).toBe(ruleId)
        expect(rule.create).toBeDefined()
        expect(rule.defaultOptions).toBeDefined()
      }
    })

    test('subsequent call returns same cached rules', async () => {
      const rules1 = await loader.loadAllRules()
      const rules2 = await loader.loadAllRules()

      // Should be the same object references for individual rules
      for (const ruleId of Object.keys(rules1)) {
        expect(rules1[ruleId]).toBe(rules2[ruleId])
      }
    })
  })

  describe('clearCache', () => {
    test('clears cache after loading rules', async () => {
      await loader.loadRule('max-complexity')
      expect(loader.getCacheStats().cached).toBe(1)

      loader.clearCache()
      expect(loader.getCacheStats().cached).toBe(0)
    })

    test('clears cache for multiple rules', async () => {
      await loader.loadRules(['max-complexity', 'max-depth', 'max-lines'])
      expect(loader.getCacheStats().cached).toBe(3)

      loader.clearCache()
      expect(loader.getCacheStats().cached).toBe(0)
    })

    test('allows reloading after clear', async () => {
      const rule1 = await loader.loadRule('max-params')
      loader.clearCache()

      const rule2 = await loader.loadRule('max-params')

      // Both should be valid rules with the same meta.name
      expect(rule1).toBeDefined()
      expect(rule2).toBeDefined()
      expect(rule1!.meta.name).toBe('max-params')
      expect(rule2!.meta.name).toBe('max-params')
    })

    test('clears load promises as well', async () => {
      // Start loading a rule
      const loadPromise = loader.loadRule('max-lines')

      // Clear cache before load completes
      loader.clearCache()

      // Wait for original load to complete — it will re-cache the result
      await loadPromise

      // The load completes and caches the result, so cache has 1 entry
      expect(loader.getCacheStats().cached).toBe(1)
    })
  })

  describe('getCacheStats', () => {
    test('returns zero stats for empty cache', () => {
      const stats = loader.getCacheStats()

      expect(stats.cached).toBe(0)
      expect(stats.total).toBe(ALL_RULE_IDS.length)
      expect(stats.hitRate).toBeUndefined()
    })

    test('returns correct cached count', async () => {
      await loader.loadRule('max-complexity')

      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(1)
    })

    test('returns correct total count', () => {
      const stats = loader.getCacheStats()
      expect(stats.total).toBeGreaterThan(100)
    })

    test('updates as rules are loaded', async () => {
      expect(loader.getCacheStats().cached).toBe(0)

      await loader.loadRule('max-complexity')
      expect(loader.getCacheStats().cached).toBe(1)

      await loader.loadRule('max-depth')
      expect(loader.getCacheStats().cached).toBe(2)

      await loader.loadRule('max-lines')
      expect(loader.getCacheStats().cached).toBe(3)
    })
  })

  describe('searchRules', () => {
    test('finds rules matching query - max', () => {
      const results = loader.searchRules('max')

      expect(results.length).toBeGreaterThan(0)
      expect(results).toContain('max-complexity')
      expect(results).toContain('max-depth')
      expect(results).toContain('max-lines')
      expect(results).toContain('max-params')
    })

    test('finds rules matching query - no-', () => {
      const results = loader.searchRules('no-')

      expect(results.length).toBeGreaterThan(20)
      expect(results).toContain('no-magic-numbers')
      expect(results).toContain('no-await-in-loop')
    })

    test('is case-insensitive', () => {
      const results1 = loader.searchRules('COMPLEXITY')
      const results2 = loader.searchRules('complexity')
      const results3 = loader.searchRules('CoMpLeXiTy')

      expect(results1).toEqual(results2)
      expect(results2).toEqual(results3)
    })

    test('returns empty array for no matches', () => {
      const results = loader.searchRules('xyznonexistent123')
      expect(results).toEqual([])
    })

    test('handles empty query - returns all rules', () => {
      const results = loader.searchRules('')
      expect(results.length).toBe(ALL_RULE_IDS.length)
    })

    test('finds rules with partial match', () => {
      const results = loader.searchRules('circ')

      expect(results).toContain('no-circular-deps')
    })

    test('finds single rule by exact ID', () => {
      const results = loader.searchRules('max-complexity')

      expect(results).toContain('max-complexity')
    })

    test('finds rules with hyphenated names', () => {
      const results = loader.searchRules('prefer-')

      expect(results.length).toBeGreaterThan(10)
      expect(results.some((r) => r.startsWith('prefer-'))).toBe(true)
    })
  })

  describe('isEagerLoadingEnabled', () => {
    test('returns false by default', () => {
      expect(loader.isEagerLoadingEnabled()).toBe(false)
    })

    test('returns true when enabled via constructor', () => {
      const eagerLoader = new LazyRuleLoader({ eagerLoading: true })
      expect(eagerLoader.isEagerLoadingEnabled()).toBe(true)
    })
  })

  describe('setEagerLoading', () => {
    test('can enable eager loading', () => {
      loader.setEagerLoading(true)
      expect(loader.isEagerLoadingEnabled()).toBe(true)
    })

    test('can disable eager loading', () => {
      const eagerLoader = new LazyRuleLoader({ eagerLoading: true })
      eagerLoader.setEagerLoading(false)
      expect(eagerLoader.isEagerLoadingEnabled()).toBe(false)
    })

    test('can toggle eager loading multiple times', () => {
      expect(loader.isEagerLoadingEnabled()).toBe(false)

      loader.setEagerLoading(true)
      expect(loader.isEagerLoadingEnabled()).toBe(true)

      loader.setEagerLoading(false)
      expect(loader.isEagerLoadingEnabled()).toBe(false)

      loader.setEagerLoading(true)
      expect(loader.isEagerLoadingEnabled()).toBe(true)
    })
  })
})

describe('lazyRuleLoader singleton', () => {
  test('is an instance of LazyRuleLoader', () => {
    expect(lazyRuleLoader).toBeInstanceOf(LazyRuleLoader)
  })

  test('has all expected methods', () => {
    expect(typeof lazyRuleLoader.hasRule).toBe('function')
    expect(typeof lazyRuleLoader.getRuleIds).toBe('function')
    expect(typeof lazyRuleLoader.getRuleCategory).toBe('function')
    expect(typeof lazyRuleLoader.loadRule).toBe('function')
    expect(typeof lazyRuleLoader.loadRules).toBe('function')
    expect(typeof lazyRuleLoader.loadRulesByCategory).toBe('function')
    expect(typeof lazyRuleLoader.preload).toBe('function')
    expect(typeof lazyRuleLoader.loadAllRules).toBe('function')
    expect(typeof lazyRuleLoader.clearCache).toBe('function')
    expect(typeof lazyRuleLoader.getCacheStats).toBe('function')
    expect(typeof lazyRuleLoader.searchRules).toBe('function')
    expect(typeof lazyRuleLoader.isEagerLoadingEnabled).toBe('function')
    expect(typeof lazyRuleLoader.setEagerLoading).toBe('function')
  })

  test('can use hasRule', () => {
    expect(lazyRuleLoader.hasRule('max-complexity')).toBe(true)
    expect(lazyRuleLoader.hasRule('nonexistent')).toBe(false)
  })

  test('can use getRuleIds', () => {
    const ruleIds = lazyRuleLoader.getRuleIds()
    expect(Array.isArray(ruleIds)).toBe(true)
    expect(ruleIds.length).toBeGreaterThan(100)
  })

  test('can use getRuleCategory', () => {
    expect(lazyRuleLoader.getRuleCategory('max-complexity')).toBe('complexity')
    expect(lazyRuleLoader.getRuleCategory('no-await-in-loop')).toBe('performance')
  })

  test('can use searchRules', () => {
    const results = lazyRuleLoader.searchRules('max')
    expect(results.length).toBeGreaterThan(0)
  })

  test('can use isEagerLoadingEnabled', () => {
    const enabled = lazyRuleLoader.isEagerLoadingEnabled()
    expect(typeof enabled).toBe('boolean')
  })
})

describe('getRuleCategory helper function', () => {
  test('returns complexity for max-complexity', () => {
    expect(getRuleCategory('max-complexity')).toBe('complexity')
  })

  test('returns performance for no-await-in-loop', () => {
    expect(getRuleCategory('no-await-in-loop')).toBe('performance')
  })

  test('returns dependencies for no-circular-deps', () => {
    expect(getRuleCategory('no-circular-deps')).toBe('dependencies')
  })

  test('returns security for no-eval', () => {
    expect(getRuleCategory('no-eval')).toBe('security')
  })

  test('returns testing for no-skipped-tests', () => {
    expect(getRuleCategory('no-skipped-tests')).toBe('testing')
  })

  test('returns correctness for no-empty-catch', () => {
    expect(getRuleCategory('no-empty-catch')).toBe('correctness')
  })

  test('returns patterns for curly', () => {
    expect(getRuleCategory('curly')).toBe('patterns')
  })

  test('returns complexity as default for unknown rule', () => {
    expect(getRuleCategory('unknown-rule-xyz')).toBe('complexity')
  })

  test('returns complexity as default for empty string', () => {
    expect(getRuleCategory('')).toBe('complexity')
  })

  test('matches instance method behavior', () => {
    const loader = new LazyRuleLoader()

    // Compare helper function with instance method
    const testRuleIds = [
      'max-complexity',
      'no-await-in-loop',
      'no-circular-deps',
      'no-eval',
      'no-skipped-tests',
      'no-empty-catch',
      'curly',
      'unknown-rule',
      '',
    ]

    for (const ruleId of testRuleIds) {
      expect(getRuleCategory(ruleId)).toBe(loader.getRuleCategory(ruleId))
    }
  })
})

describe('ALL_RULE_IDS constant', () => {
  test('is an array', () => {
    expect(Array.isArray(ALL_RULE_IDS)).toBe(true)
  })

  test('has many rules', () => {
    expect(ALL_RULE_IDS.length).toBeGreaterThan(100)
  })

  test('contains known rules', () => {
    expect(ALL_RULE_IDS).toContain('no-magic-numbers')
    expect(ALL_RULE_IDS).toContain('max-complexity')
    expect(ALL_RULE_IDS).toContain('no-await-in-loop')
    expect(ALL_RULE_IDS).toContain('no-circular-deps')
    expect(ALL_RULE_IDS).toContain('no-eval')
    expect(ALL_RULE_IDS).toContain('no-skipped-tests')
  })

  test('all IDs are strings', () => {
    for (const ruleId of ALL_RULE_IDS) {
      expect(typeof ruleId).toBe('string')
      expect(ruleId.length).toBeGreaterThan(0)
    }
  })

  test('has unique IDs', () => {
    const uniqueIds = new Set(ALL_RULE_IDS)
    expect(uniqueIds.size).toBe(ALL_RULE_IDS.length)
  })
})

describe('RuleCategory type', () => {
  test('supports all expected categories', () => {
    const categories: RuleCategory[] = [
      'complexity',
      'dependencies',
      'performance',
      'security',
      'patterns',
      'correctness',
      'testing',
    ]

    // This test mainly verifies the type compiles correctly
    expect(categories.length).toBe(7)
  })
})

describe('cache behavior edge cases', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('loading same rule multiple times returns same cached instance', async () => {
    const rule1 = await loader.loadRule('max-complexity')
    const rule2 = await loader.loadRule('max-complexity')
    const rule3 = await loader.loadRule('max-complexity')

    expect(rule1).toBe(rule2)
    expect(rule2).toBe(rule3)
    expect(loader.getCacheStats().cached).toBe(1)
  })

  test('clearCache during load does not corrupt state', async () => {
    const loadPromise = loader.loadRule('max-depth')

    loader.clearCache()

    const rule = await loadPromise

    expect(rule).toBeDefined()
    // Load completes and caches the result even after clearCache was called
    expect(loader.getCacheStats().cached).toBe(1)
  })

  test('can load rule after clearCache', async () => {
    await loader.loadRule('max-lines')
    loader.clearCache()

    const rule = await loader.loadRule('max-lines')
    expect(rule).toBeDefined()
    expect(loader.getCacheStats().cached).toBe(1)
  })

  test('loadRules with duplicates handles correctly', async () => {
    const rules = await loader.loadRules(['max-complexity', 'max-complexity', 'max-complexity'])

    expect(Object.keys(rules)).toHaveLength(1)
    expect(rules['max-complexity']).toBeDefined()
    expect(loader.getCacheStats().cached).toBe(1)
  })
})

describe('error handling', () => {
  test('loadRule handles unknown rule gracefully', async () => {
    const loader = new LazyRuleLoader()
    const rule = await loader.loadRule('completely-unknown-rule')

    expect(rule).toBeUndefined()
    expect(loader.getCacheStats().cached).toBe(0)
  })

  test('loadRules handles mix of valid and invalid rules', async () => {
    const loader = new LazyRuleLoader()
    const rules = await loader.loadRules([
      'max-complexity',
      'invalid-rule-1',
      'max-depth',
      'invalid-rule-2',
      'max-lines',
    ])

    expect(Object.keys(rules)).toHaveLength(3)
    expect(rules['max-complexity']).toBeDefined()
    expect(rules['max-depth']).toBeDefined()
    expect(rules['max-lines']).toBeDefined()
  })

  test('loadRulesByCategory handles empty category gracefully', async () => {
    const loader = new LazyRuleLoader()
    const rules = await loader.loadRulesByCategory('nonexistent' as RuleCategory)

    expect(rules).toEqual({})
  })

  test('loadRule for unknown rule does not increase cache count', async () => {
    const loader = new LazyRuleLoader()
    await loader.loadRule('fake-rule-xyz')
    expect(loader.getCacheStats().cached).toBe(0)
  })

  test('loadRules returns only valid rules skipping all invalid', async () => {
    const loader = new LazyRuleLoader()
    const rules = await loader.loadRules(['fake1', 'fake2', 'fake3'])
    expect(Object.keys(rules)).toHaveLength(0)
  })
})

describe('hasRule additional coverage', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('returns true for prefer-const', () => {
    expect(loader.hasRule('prefer-const')).toBe(true)
  })

  test('returns true for no-explicit-any', () => {
    expect(loader.hasRule('no-explicit-any')).toBe(true)
  })

  test('returns true for no-unused-vars', () => {
    expect(loader.hasRule('no-unused-vars')).toBe(true)
  })

  test('returns true for require-await', () => {
    expect(loader.hasRule('require-await')).toBe(true)
  })

  test('returns true for no-debugger', () => {
    expect(loader.hasRule('no-debugger')).toBe(true)
  })

  test('returns true for prefer-template', () => {
    expect(loader.hasRule('prefer-template')).toBe(true)
  })

  test('returns true for no-var', () => {
    expect(loader.hasRule('no-var')).toBe(true)
  })

  test('returns true for object-shorthand', () => {
    expect(loader.hasRule('object-shorthand')).toBe(true)
  })

  test('returns true for explicit-return-type', () => {
    expect(loader.hasRule('explicit-return-type')).toBe(true)
  })

  test('returns true for prefer-readonly', () => {
    expect(loader.hasRule('prefer-readonly')).toBe(true)
  })

  test('returns true for constructor-super', () => {
    expect(loader.hasRule('constructor-super')).toBe(true)
  })

  test('returns true for valid-typeof', () => {
    expect(loader.hasRule('valid-typeof')).toBe(true)
  })

  test('returns true for no-unreachable', () => {
    expect(loader.hasRule('no-unreachable')).toBe(true)
  })

  test('returns true for use-isnan', () => {
    expect(loader.hasRule('use-isnan')).toBe(true)
  })

  test('returns false for rule with extra dash', () => {
    expect(loader.hasRule('no--magic-numbers')).toBe(false)
  })
})

describe('getRuleCategory additional coverage', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('returns performance for prefer-optional-chain', () => {
    expect(loader.getRuleCategory('prefer-optional-chain')).toBe('performance')
  })

  test('returns performance for prefer-math-trunc', () => {
    expect(loader.getRuleCategory('prefer-math-trunc')).toBe('performance')
  })

  test('returns security for no-unsafe-type-assertion', () => {
    expect(loader.getRuleCategory('no-unsafe-type-assertion')).toBe('security')
  })

  test('returns security for no-unsafe-call', () => {
    expect(loader.getRuleCategory('no-unsafe-call')).toBe('security')
  })

  test('returns security for no-unsafe-member-access', () => {
    expect(loader.getRuleCategory('no-unsafe-member-access')).toBe('security')
  })

  test('returns security for no-unsafe-regex', () => {
    expect(loader.getRuleCategory('no-unsafe-regex')).toBe('security')
  })

  test('returns correctness for no-empty-function', () => {
    expect(loader.getRuleCategory('no-empty-function')).toBe('correctness')
  })

  test('returns correctness for no-constant-binary-expression', () => {
    expect(loader.getRuleCategory('no-constant-binary-expression')).toBe('correctness')
  })

  test('returns correctness for no-empty-character-class', () => {
    expect(loader.getRuleCategory('no-empty-character-class')).toBe('correctness')
  })

  test('returns patterns for prefer-const', () => {
    expect(loader.getRuleCategory('prefer-const')).toBe('patterns')
  })

  test('returns patterns for no-explicit-any', () => {
    expect(loader.getRuleCategory('no-explicit-any')).toBe('patterns')
  })

  test('returns patterns for require-await', () => {
    expect(loader.getRuleCategory('require-await')).toBe('patterns')
  })

  test('returns patterns for no-unused-vars', () => {
    expect(loader.getRuleCategory('no-unused-vars')).toBe('patterns')
  })

  test('returns patterns for no-debugger', () => {
    expect(loader.getRuleCategory('no-debugger')).toBe('patterns')
  })

  test('returns patterns for no-console', () => {
    expect(loader.getRuleCategory('no-console')).toBe('patterns')
  })

  test('returns patterns for no-magic-numbers', () => {
    expect(loader.getRuleCategory('no-magic-numbers')).toBe('patterns')
  })

  test('returns patterns for object-shorthand', () => {
    expect(loader.getRuleCategory('object-shorthand')).toBe('patterns')
  })

  test('returns patterns for constructor-super', () => {
    expect(loader.getRuleCategory('constructor-super')).toBe('patterns')
  })

  test('returns patterns for valid-typeof', () => {
    expect(loader.getRuleCategory('valid-typeof')).toBe('patterns')
  })

  test('returns patterns for prefer-nullish-coalescing', () => {
    expect(loader.getRuleCategory('prefer-nullish-coalescing')).toBe('patterns')
  })
})

describe('loadRule additional coverage', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('loads prefer-const rule', async () => {
    const rule = await loader.loadRule('prefer-const')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('prefer-const')
  })

  test('loads no-explicit-any rule', async () => {
    const rule = await loader.loadRule('no-explicit-any')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('no-explicit-any')
  })

  test('loads no-unused-vars rule', async () => {
    const rule = await loader.loadRule('no-unused-vars')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('no-unused-vars')
  })

  test('loads require-await rule', async () => {
    const rule = await loader.loadRule('require-await')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('require-await')
  })

  test('loads no-debugger rule', async () => {
    const rule = await loader.loadRule('no-debugger')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('no-debugger')
  })

  test('loads prefer-template rule', async () => {
    const rule = await loader.loadRule('prefer-template')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('prefer-template')
  })

  test('loads object-shorthand rule', async () => {
    const rule = await loader.loadRule('object-shorthand')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('object-shorthand')
  })

  test('loads no-var rule', async () => {
    const rule = await loader.loadRule('no-var')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('no-var')
  })

  test('loads no-empty rule', async () => {
    const rule = await loader.loadRule('no-empty')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('no-empty')
  })

  test('loads eq-eq-eq rule', async () => {
    const rule = await loader.loadRule('eq-eq-eq')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('eq-eq-eq')
  })

  test('loads curly rule', async () => {
    const rule = await loader.loadRule('curly')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('curly')
  })

  test('loads no-unsafe-return rule', async () => {
    const rule = await loader.loadRule('no-unsafe-return')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('no-unsafe-return')
  })

  test('loads no-empty-function rule', async () => {
    const rule = await loader.loadRule('no-empty-function')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('no-empty-function')
  })

  test('loads no-constant-binary-expression rule', async () => {
    const rule = await loader.loadRule('no-constant-binary-expression')
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe('no-constant-binary-expression')
  })
})

describe('loadRules additional coverage', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('loads single rule via loadRules', async () => {
    const rules = await loader.loadRules(['max-complexity'])
    expect(Object.keys(rules)).toHaveLength(1)
    expect(rules['max-complexity'].meta.name).toBe('max-complexity')
  })

  test('loadRules with all unknown rules returns empty', async () => {
    const rules = await loader.loadRules(['a', 'b', 'c'])
    expect(rules).toEqual({})
  })

  test('loadRules deduplicates rule IDs', async () => {
    const rules = await loader.loadRules(['max-depth', 'max-depth'])
    expect(Object.keys(rules)).toHaveLength(1)
    expect(loader.getCacheStats().cached).toBe(1)
  })

  test('loadRules large batch loads successfully', async () => {
    const ruleIds = ALL_RULE_IDS.slice(0, 20)
    const rules = await loader.loadRules(ruleIds)
    expect(Object.keys(rules).length).toBe(20)
  })
})

describe('loadRulesByCategory additional coverage', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('complexity category includes max-complexity', async () => {
    const rules = await loader.loadRulesByCategory('complexity')
    expect(rules['max-complexity']).toBeDefined()
    expect(rules['max-depth']).toBeDefined()
    expect(rules['max-lines']).toBeDefined()
    expect(rules['max-params']).toBeDefined()
  })

  test('performance category includes no-await-in-loop', async () => {
    const rules = await loader.loadRulesByCategory('performance')
    expect(rules['no-await-in-loop']).toBeDefined()
    expect(rules['no-sync-in-async']).toBeDefined()
  })

  test('security category includes no-eval', async () => {
    const rules = await loader.loadRulesByCategory('security')
    expect(rules['no-eval']).toBeDefined()
    expect(rules['no-deprecated-api']).toBeDefined()
  })

  test('testing category includes no-skipped-tests', async () => {
    const rules = await loader.loadRulesByCategory('testing')
    expect(rules['no-skipped-tests']).toBeDefined()
    expect(rules['no-focused-tests']).toBeDefined()
  })

  test('correctness category includes no-empty-catch', async () => {
    const rules = await loader.loadRulesByCategory('correctness')
    expect(rules['no-empty-catch']).toBeDefined()
    expect(rules['no-useless-catch']).toBeDefined()
  })
})

describe('searchRules additional coverage', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('searches for "prefer-const" exact match', () => {
    const results = loader.searchRules('prefer-const')
    expect(results).toContain('prefer-const')
  })

  test('searches for "var" finds relevant rules', () => {
    const results = loader.searchRules('var')
    expect(results).toContain('no-var')
    expect(results).toContain('no-var-requires')
    expect(results).toContain('no-unused-vars')
  })

  test('searches for "async" finds multiple rules', () => {
    const results = loader.searchRules('async')
    expect(results.length).toBeGreaterThan(2)
    expect(results).toContain('no-async-promise-executor')
    expect(results).toContain('no-sync-in-async')
  })

  test('searches for "unused" finds relevant rules', () => {
    const results = loader.searchRules('unused')
    expect(results.length).toBeGreaterThan(0)
    expect(results).toContain('no-unused-vars')
    expect(results).toContain('no-unused-exports')
  })

  test('searches for single character "a"', () => {
    const results = loader.searchRules('a')
    expect(results.length).toBeGreaterThan(0)
  })

  test('searches for "z" with unlikely match returns empty or few', () => {
    const results = loader.searchRules('zzzzzzz')
    expect(results).toEqual([])
  })

  test('returns results in a consistent order', () => {
    const results1 = loader.searchRules('no-')
    const results2 = loader.searchRules('no-')
    expect(results1).toEqual(results2)
  })
})

describe('getCacheStats additional coverage', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('total matches ALL_RULE_IDS length after loading', async () => {
    await loader.loadRule('max-complexity')
    const stats = loader.getCacheStats()
    expect(stats.total).toBe(ALL_RULE_IDS.length)
    expect(stats.cached).toBe(1)
  })

  test('stats reflect multiple loads correctly', async () => {
    await loader.loadRule('max-complexity')
    await loader.loadRule('max-depth')
    await loader.loadRule('max-lines')
    const stats = loader.getCacheStats()
    expect(stats.cached).toBe(3)
  })

  test('stats reset after clearCache', async () => {
    await loader.loadRule('max-complexity')
    loader.clearCache()
    const stats = loader.getCacheStats()
    expect(stats.cached).toBe(0)
    expect(stats.total).toBe(ALL_RULE_IDS.length)
  })
})

describe('preload additional coverage', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('preloading same rule twice only caches once', async () => {
    await loader.preload(['max-complexity'])
    await loader.preload(['max-complexity'])
    expect(loader.getCacheStats().cached).toBe(1)
  })

  test('preload then loadRules uses cache', async () => {
    await loader.preload(['max-complexity', 'max-depth'])
    const rules = await loader.loadRules(['max-complexity', 'max-depth'])
    expect(Object.keys(rules)).toHaveLength(2)
    expect(loader.getCacheStats().cached).toBe(2)
  })

  test('preload all rules fills cache completely', async () => {
    await loader.preload(ALL_RULE_IDS)
    expect(loader.getCacheStats().cached).toBe(ALL_RULE_IDS.length)
  })
})

describe('clearCache additional coverage', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('clearCache on empty cache is safe', () => {
    loader.clearCache()
    expect(loader.getCacheStats().cached).toBe(0)
  })

  test('multiple clearCache calls are safe', async () => {
    await loader.loadRule('max-complexity')
    loader.clearCache()
    loader.clearCache()
    loader.clearCache()
    expect(loader.getCacheStats().cached).toBe(0)
  })

  test('can load fresh rule after clearCache', async () => {
    const rule1 = await loader.loadRule('no-eval')
    loader.clearCache()
    const rule2 = await loader.loadRule('no-eval')
    expect(rule1).toBeDefined()
    expect(rule2).toBeDefined()
    expect(rule1!.meta.name).toBe('no-eval')
    expect(rule2!.meta.name).toBe('no-eval')
  })
})

describe('concurrent loading edge cases', () => {
  let loader: LazyRuleLoader

  beforeEach(() => {
    loader = new LazyRuleLoader()
  })

  test('concurrent loadRules with overlapping rules', async () => {
    const [results1, results2] = await Promise.all([
      loader.loadRules(['max-complexity', 'max-depth']),
      loader.loadRules(['max-depth', 'max-lines']),
    ])
    expect(Object.keys(results1)).toHaveLength(2)
    expect(Object.keys(results2)).toHaveLength(2)
    expect(loader.getCacheStats().cached).toBe(3)
  })

  test('concurrent loadRule and clearCache', async () => {
    const loadPromise = loader.loadRule('max-complexity')
    loader.clearCache()
    const rule = await loadPromise
    expect(rule).toBeDefined()
  })

  test('loadAllRules twice returns consistent results', async () => {
    const rules1 = await loader.loadAllRules()
    const rules2 = await loader.loadAllRules()
    const keys1 = Object.keys(rules1).sort()
    const keys2 = Object.keys(rules2).sort()
    expect(keys1).toEqual(keys2)
  })
})

describe('getRuleCategory helper additional coverage', () => {
  test('returns performance for prefer-optional-chain via helper', () => {
    expect(getRuleCategory('prefer-optional-chain')).toBe('performance')
  })

  test('returns correctness for no-throw-literal via helper', () => {
    expect(getRuleCategory('no-throw-literal')).toBe('correctness')
  })

  test('returns patterns for no-debugger via helper', () => {
    expect(getRuleCategory('no-debugger')).toBe('patterns')
  })

  test('returns patterns for prefer-nullish-coalescing via helper', () => {
    expect(getRuleCategory('prefer-nullish-coalescing')).toBe('patterns')
  })

  test('helper matches instance for many rules', () => {
    const loader = new LazyRuleLoader()
    const rules = ['prefer-const', 'no-var', 'object-shorthand', 'no-unreachable', 'use-isnan']
    for (const rule of rules) {
      expect(getRuleCategory(rule)).toBe(loader.getRuleCategory(rule))
    }
  })
})

describe('ALL_RULE_IDS additional coverage', () => {
  test('contains prefer-const', () => {
    expect(ALL_RULE_IDS).toContain('prefer-const')
  })

  test('contains no-explicit-any', () => {
    expect(ALL_RULE_IDS).toContain('no-explicit-any')
  })

  test('contains no-unused-vars', () => {
    expect(ALL_RULE_IDS).toContain('no-unused-vars')
  })

  test('contains no-var', () => {
    expect(ALL_RULE_IDS).toContain('no-var')
  })

  test('contains object-shorthand', () => {
    expect(ALL_RULE_IDS).toContain('object-shorthand')
  })

  test('all IDs are non-empty strings', () => {
    for (const ruleId of ALL_RULE_IDS) {
      expect(ruleId.length).toBeGreaterThan(0)
    }
  })

  test('all IDs are lowercase', () => {
    for (const ruleId of ALL_RULE_IDS) {
      expect(ruleId).toBe(ruleId.toLowerCase())
    }
  })
})

describe('lazyRuleLoader singleton additional coverage', () => {
  test('singleton returns consistent getRuleIds', () => {
    const ids1 = lazyRuleLoader.getRuleIds()
    const ids2 = lazyRuleLoader.getRuleIds()
    expect(ids1).toBe(ids2)
  })

  test('singleton hasRule for all ALL_RULE_IDS entries', () => {
    for (const ruleId of ALL_RULE_IDS.slice(0, 30)) {
      expect(lazyRuleLoader.hasRule(ruleId)).toBe(true)
    }
  })

  test('singleton getRuleCategory returns valid categories', () => {
    const validCategories: RuleCategory[] = [
      'complexity',
      'dependencies',
      'performance',
      'security',
      'patterns',
      'correctness',
      'testing',
    ]
    for (const ruleId of ALL_RULE_IDS.slice(0, 30)) {
      const cat = lazyRuleLoader.getRuleCategory(ruleId)
      expect(validCategories).toContain(cat)
    }
  })
})
