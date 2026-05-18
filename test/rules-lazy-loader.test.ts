import { describe, it, expect } from 'vitest'
import {
  LazyRuleLoader,
  ALL_RULE_IDS,
  getRuleCategory,
  lazyRuleLoader,
} from '../src/rules/lazy-loader.js'
import type { RuleCategory } from '../src/rules/lazy-loader.js'

// ─── ALL_RULE_IDS ────────────────────────────────────────
describe('ALL_RULE_IDS', () => {
  it('is an array', () => {
    expect(Array.isArray(ALL_RULE_IDS)).toBe(true)
  })

  it('contains at least 100 rule IDs', () => {
    expect(ALL_RULE_IDS.length).toBeGreaterThan(100)
  })

  it('contains all string values', () => {
    for (const id of ALL_RULE_IDS) {
      expect(typeof id).toBe('string')
    }
  })

  it('contains known rules', () => {
    expect(ALL_RULE_IDS).toContain('max-complexity')
    expect(ALL_RULE_IDS).toContain('max-depth')
    expect(ALL_RULE_IDS).toContain('no-console')
  })

  it('has unique entries', () => {
    const set = new Set(ALL_RULE_IDS)
    expect(set.size).toBe(ALL_RULE_IDS.length)
  })

  it('contains no empty strings', () => {
    for (const id of ALL_RULE_IDS) {
      expect(id.length).toBeGreaterThan(0)
    }
  })
})

// ─── getRuleCategory (module-level) ──────────────────────
describe('getRuleCategory', () => {
  it('is a function', () => {
    expect(typeof getRuleCategory).toBe('function')
  })

  it('returns correct category for known rules', () => {
    expect(getRuleCategory('max-complexity')).toBe('complexity')
    expect(getRuleCategory('curly')).toBe('patterns')
    expect(getRuleCategory('no-eval')).toBe('security')
  })

  it('returns default "complexity" for unknown rule ID', () => {
    expect(getRuleCategory('nonexistent-rule-xyz')).toBe('complexity')
  })

  it('returns default "complexity" for empty string', () => {
    expect(getRuleCategory('')).toBe('complexity')
  })

  it('returns a valid RuleCategory string', () => {
    const validCategories: RuleCategory[] = [
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'testing',
    ]
    for (const id of ALL_RULE_IDS.slice(0, 20)) {
      expect(validCategories).toContain(getRuleCategory(id))
    }
  })
})

// ─── LazyRuleLoader class ────────────────────────────────
describe('LazyRuleLoader', () => {
  it('can be instantiated with no arguments', () => {
    const loader = new LazyRuleLoader()
    expect(loader).toBeInstanceOf(LazyRuleLoader)
  })

  it('can be instantiated with options', () => {
    const loader = new LazyRuleLoader({ eagerLoading: true })
    expect(loader).toBeInstanceOf(LazyRuleLoader)
  })

  // ─── hasRule ──────────────────────────────────────────
  describe('hasRule', () => {
    it('returns true for known rules', () => {
      const loader = new LazyRuleLoader()
      expect(loader.hasRule('max-complexity')).toBe(true)
      expect(loader.hasRule('max-depth')).toBe(true)
      expect(loader.hasRule('no-console')).toBe(true)
    })

    it('returns false for unknown rules', () => {
      const loader = new LazyRuleLoader()
      expect(loader.hasRule('nonexistent-rule')).toBe(false)
      expect(loader.hasRule('')).toBe(false)
    })

    it('returns false for null-like values', () => {
      const loader = new LazyRuleLoader()
      expect(loader.hasRule('null')).toBe(false)
    })
  })

  // ─── getRuleIds ───────────────────────────────────────
  describe('getRuleIds', () => {
    it('returns an array', () => {
      const loader = new LazyRuleLoader()
      expect(Array.isArray(loader.getRuleIds())).toBe(true)
    })

    it('returns the same reference as ALL_RULE_IDS', () => {
      const loader = new LazyRuleLoader()
      expect(loader.getRuleIds()).toBe(ALL_RULE_IDS)
    })

    it('returns at least 100 rule IDs', () => {
      const loader = new LazyRuleLoader()
      expect(loader.getRuleIds().length).toBeGreaterThan(100)
    })
  })

  // ─── getRuleCategory (instance) ───────────────────────
  describe('getRuleCategory', () => {
    it('returns correct category for known rules', () => {
      const loader = new LazyRuleLoader()
      expect(loader.getRuleCategory('max-complexity')).toBe('complexity')
      expect(loader.getRuleCategory('no-eval')).toBe('security')
      expect(loader.getRuleCategory('curly')).toBe('patterns')
    })

    it('returns default "complexity" for unknown rule', () => {
      const loader = new LazyRuleLoader()
      expect(loader.getRuleCategory('nonexistent')).toBe('complexity')
    })
  })

  // ─── isEagerLoadingEnabled ────────────────────────────
  describe('isEagerLoadingEnabled', () => {
    it('returns false by default', () => {
      const loader = new LazyRuleLoader()
      expect(loader.isEagerLoadingEnabled()).toBe(false)
    })

    it('returns true when constructed with eagerLoading: true', () => {
      const loader = new LazyRuleLoader({ eagerLoading: true })
      expect(loader.isEagerLoadingEnabled()).toBe(true)
    })

    it('returns false when constructed with eagerLoading: false', () => {
      const loader = new LazyRuleLoader({ eagerLoading: false })
      expect(loader.isEagerLoadingEnabled()).toBe(false)
    })
  })

  // ─── setEagerLoading ──────────────────────────────────
  describe('setEagerLoading', () => {
    it('toggles eager loading on', () => {
      const loader = new LazyRuleLoader()
      expect(loader.isEagerLoadingEnabled()).toBe(false)
      loader.setEagerLoading(true)
      expect(loader.isEagerLoadingEnabled()).toBe(true)
    })

    it('toggles eager loading off', () => {
      const loader = new LazyRuleLoader({ eagerLoading: true })
      expect(loader.isEagerLoadingEnabled()).toBe(true)
      loader.setEagerLoading(false)
      expect(loader.isEagerLoadingEnabled()).toBe(false)
    })

    it('can be toggled multiple times', () => {
      const loader = new LazyRuleLoader()
      loader.setEagerLoading(true)
      expect(loader.isEagerLoadingEnabled()).toBe(true)
      loader.setEagerLoading(false)
      expect(loader.isEagerLoadingEnabled()).toBe(false)
      loader.setEagerLoading(true)
      expect(loader.isEagerLoadingEnabled()).toBe(true)
    })
  })

  // ─── clearCache ───────────────────────────────────────
  describe('clearCache', () => {
    it('does not throw', () => {
      const loader = new LazyRuleLoader()
      expect(() => loader.clearCache()).not.toThrow()
    })

    it('resets cache stats to 0 cached', () => {
      const loader = new LazyRuleLoader()
      loader.clearCache()
      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(0)
    })
  })

  // ─── getCacheStats ────────────────────────────────────
  describe('getCacheStats', () => {
    it('returns an object with cached and total', () => {
      const loader = new LazyRuleLoader()
      const stats = loader.getCacheStats()
      expect(stats).toHaveProperty('cached')
      expect(stats).toHaveProperty('total')
    })

    it('returns 0 cached initially', () => {
      const loader = new LazyRuleLoader()
      const stats = loader.getCacheStats()
      expect(stats.cached).toBe(0)
    })

    it('returns total matching ALL_RULE_IDS length', () => {
      const loader = new LazyRuleLoader()
      const stats = loader.getCacheStats()
      expect(stats.total).toBe(ALL_RULE_IDS.length)
    })

    it('returns cached as a number', () => {
      const loader = new LazyRuleLoader()
      const stats = loader.getCacheStats()
      expect(typeof stats.cached).toBe('number')
    })

    it('returns total as a number', () => {
      const loader = new LazyRuleLoader()
      const stats = loader.getCacheStats()
      expect(typeof stats.total).toBe('number')
    })
  })

  // ─── loadRule ─────────────────────────────────────────
  describe('loadRule', () => {
    it('returns undefined for unknown rule', async () => {
      const loader = new LazyRuleLoader()
      const result = await loader.loadRule('nonexistent-rule-xyz')
      expect(result).toBeUndefined()
    })

    it('returns undefined for empty string', async () => {
      const loader = new LazyRuleLoader()
      const result = await loader.loadRule('')
      expect(result).toBeUndefined()
    })
  })

  // ─── loadRules ────────────────────────────────────────
  describe('loadRules', () => {
    it('returns empty object for empty array', async () => {
      const loader = new LazyRuleLoader()
      const result = await loader.loadRules([])
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('returns empty object for unknown rules', async () => {
      const loader = new LazyRuleLoader()
      const result = await loader.loadRules(['nonexistent1', 'nonexistent2'])
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('returns object with results for known rules', async () => {
      const loader = new LazyRuleLoader()
      const result = await loader.loadRules(['max-complexity'])
      expect(result).toHaveProperty('max-complexity')
    })
  })

  // ─── loadAllRules ─────────────────────────────────────
  describe('loadAllRules', () => {
    it('returns an object', async () => {
      const loader = new LazyRuleLoader()
      const result = await loader.loadAllRules()
      expect(typeof result).toBe('object')
    })

    it('returns at least 100 rules', async () => {
      const loader = new LazyRuleLoader()
      const result = await loader.loadAllRules()
      expect(Object.keys(result).length).toBeGreaterThan(100)
    })
  })

  // ─── loadRulesByCategory ──────────────────────────────
  describe('loadRulesByCategory', () => {
    it('returns an object for complexity category', async () => {
      const loader = new LazyRuleLoader()
      const result = await loader.loadRulesByCategory('complexity')
      expect(typeof result).toBe('object')
    })

    it('returns at least one rule for patterns category', async () => {
      const loader = new LazyRuleLoader()
      const result = await loader.loadRulesByCategory('patterns')
      expect(Object.keys(result).length).toBeGreaterThan(0)
    })

    it('returns rules that match the requested category', async () => {
      const loader = new LazyRuleLoader()
      const result = await loader.loadRulesByCategory('complexity')
      for (const ruleId of Object.keys(result)) {
        expect(loader.getRuleCategory(ruleId)).toBe('complexity')
      }
    })
  })

  // ─── preload ──────────────────────────────────────────
  describe('preload', () => {
    it('does not throw for empty array', async () => {
      const loader = new LazyRuleLoader()
      await expect(loader.preload([])).resolves.toBeUndefined()
    })

    it('does not throw for unknown rules', async () => {
      const loader = new LazyRuleLoader()
      await expect(loader.preload(['nonexistent'])).resolves.toBeUndefined()
    })

    it('populates cache after preloading', async () => {
      const loader = new LazyRuleLoader()
      await loader.preload(['max-complexity'])
      const stats = loader.getCacheStats()
      expect(stats.cached).toBeGreaterThan(0)
    })
  })

  // ─── searchRules ──────────────────────────────────────
  describe('searchRules', () => {
    it('returns an array', () => {
      const loader = new LazyRuleLoader()
      const result = loader.searchRules('console')
      expect(Array.isArray(result)).toBe(true)
    })

    it('finds rules matching the query (case-insensitive)', () => {
      const loader = new LazyRuleLoader()
      const result = loader.searchRules('console')
      expect(result.length).toBeGreaterThan(0)
      for (const id of result) {
        expect(id.toLowerCase()).toContain('console')
      }
    })

    it('finds rules with partial match', () => {
      const loader = new LazyRuleLoader()
      const result = loader.searchRules('max-')
      expect(result.length).toBeGreaterThan(0)
      for (const id of result) {
        expect(id.toLowerCase()).toContain('max-')
      }
    })

    it('returns empty array for non-matching query', () => {
      const loader = new LazyRuleLoader()
      const result = loader.searchRules('zzzznonexistentzzzz')
      expect(result).toEqual([])
    })

    it('is case insensitive', () => {
      const loader = new LazyRuleLoader()
      const lower = loader.searchRules('console')
      const upper = loader.searchRules('CONSOLE')
      expect(lower).toEqual(upper)
    })

    it('returns all rules for empty query', () => {
      const loader = new LazyRuleLoader()
      const result = loader.searchRules('')
      expect(result.length).toBe(ALL_RULE_IDS.length)
    })
  })
})

// ─── lazyRuleLoader singleton ────────────────────────────
describe('lazyRuleLoader', () => {
  it('is an instance of LazyRuleLoader', () => {
    expect(lazyRuleLoader).toBeInstanceOf(LazyRuleLoader)
  })

  it('has hasRule method', () => {
    expect(typeof lazyRuleLoader.hasRule).toBe('function')
  })

  it('has getRuleIds method', () => {
    expect(typeof lazyRuleLoader.getRuleIds).toBe('function')
  })

  it('has getRuleCategory method', () => {
    expect(typeof lazyRuleLoader.getRuleCategory).toBe('function')
  })

  it('has loadRule method', () => {
    expect(typeof lazyRuleLoader.loadRule).toBe('function')
  })

  it('has loadRules method', () => {
    expect(typeof lazyRuleLoader.loadRules).toBe('function')
  })

  it('has preload method', () => {
    expect(typeof lazyRuleLoader.preload).toBe('function')
  })

  it('has clearCache method', () => {
    expect(typeof lazyRuleLoader.clearCache).toBe('function')
  })

  it('has getCacheStats method', () => {
    expect(typeof lazyRuleLoader.getCacheStats).toBe('function')
  })

  it('has searchRules method', () => {
    expect(typeof lazyRuleLoader.searchRules).toBe('function')
  })

  it('has loadAllRules method', () => {
    expect(typeof lazyRuleLoader.loadAllRules).toBe('function')
  })

  it('has loadRulesByCategory method', () => {
    expect(typeof lazyRuleLoader.loadRulesByCategory).toBe('function')
  })

  it('has isEagerLoadingEnabled method', () => {
    expect(typeof lazyRuleLoader.isEagerLoadingEnabled).toBe('function')
  })

  it('has setEagerLoading method', () => {
    expect(typeof lazyRuleLoader.setEagerLoading).toBe('function')
  })
})
