import { describe, it, expect } from 'vitest'

import { RULE_CATEGORIES, type RuleCategory } from '../src/rules/rule-category-registry.js'
import { RULE_MODULES } from '../src/rules/rule-module-registry.js'

// ─── RULE_CATEGORIES structure ─────────────────────────
describe('RULE_CATEGORIES', () => {
  it('is a non-empty record', () => {
    expect(Object.keys(RULE_CATEGORIES).length).toBeGreaterThan(100)
  })

  it('maps every rule to a valid category', () => {
    const validCategories: RuleCategory[] = ['complexity', 'correctness', 'dependencies', 'patterns', 'performance', 'security', 'testing']
    for (const category of Object.values(RULE_CATEGORIES)) {
      expect(validCategories).toContain(category)
    }
  })

  it('has security rules mapped to security', () => {
    expect(RULE_CATEGORIES['no-eval']).toBe('security')
    expect(RULE_CATEGORIES['no-hardcoded-credentials']).toBe('security')
    expect(RULE_CATEGORIES['no-sql-injection']).toBe('security')
    expect(RULE_CATEGORIES['no-dynamic-delete']).toBe('security')
  })

  it('has testing rules mapped to testing', () => {
    expect(RULE_CATEGORIES['no-focused-tests']).toBe('testing')
    expect(RULE_CATEGORIES['no-skipped-tests']).toBe('testing')
    expect(RULE_CATEGORIES['expect-expect']).toBe('testing')
    expect(RULE_CATEGORIES['consistent-test-it']).toBe('testing')
    expect(RULE_CATEGORIES['max-nested-describe']).toBe('testing')
  })

  it('has complexity rules mapped to complexity', () => {
    expect(RULE_CATEGORIES['max-params']).toBe('complexity')
    expect(RULE_CATEGORIES['max-lines']).toBe('complexity')
    expect(RULE_CATEGORIES['max-lines-per-function']).toBe('complexity')
    expect(RULE_CATEGORIES['max-complexity']).toBe('complexity')
    expect(RULE_CATEGORIES['max-depth']).toBe('complexity')
  })

  it('has performance rules mapped to performance', () => {
    expect(RULE_CATEGORIES['no-await-in-loop']).toBe('performance')
    expect(RULE_CATEGORIES['no-array-reduce']).toBe('performance')
    expect(RULE_CATEGORIES['no-sync-in-async']).toBe('performance')
  })

  it('has dependency rules mapped to dependencies', () => {
    expect(RULE_CATEGORIES['no-circular-deps']).toBe('dependencies')
    expect(RULE_CATEGORIES['no-barrel-imports']).toBe('dependencies')
    expect(RULE_CATEGORIES['consistent-imports']).toBe('dependencies')
  })

  it('has correctness rules mapped to correctness', () => {
    expect(RULE_CATEGORIES['no-constant-binary-expression']).toBe('correctness')
    expect(RULE_CATEGORIES['no-empty-catch']).toBe('correctness')
    expect(RULE_CATEGORIES['no-empty-function']).toBe('correctness')
    expect(RULE_CATEGORIES['no-throw-literal']).toBe('correctness')
  })

  it('has no undefined or empty string categories', () => {
    for (const [ruleId, category] of Object.entries(RULE_CATEGORIES)) {
      expect(category).toBeTruthy()
      expect(typeof category).toBe('string')
    }
  })
})

// ─── RULE_MODULES structure ────────────────────────────
describe('RULE_MODULES', () => {
  it('is a non-empty record', () => {
    expect(Object.keys(RULE_MODULES).length).toBeGreaterThan(50)
  })

  it('maps every rule to a function', () => {
    for (const [ruleId, loader] of Object.entries(RULE_MODULES)) {
      expect(typeof loader).toBe('function')
    }
  })

  it('has entries for key rules', () => {
    const keyRules = [
      'no-eval',
      'no-console',
      'prefer-const',
      'max-params',
      'no-circular-deps',
      'no-focused-tests',
      'no-await-in-loop',
      'no-hardcoded-credentials',
      'max-complexity',
      'explicit-return-type',
    ]
    for (const rule of keyRules) {
      expect(RULE_MODULES[rule]).toBeDefined()
      expect(typeof RULE_MODULES[rule]).toBe('function')
    }
  })

  it('covers all category representatives', () => {
    expect(RULE_MODULES['max-params']).toBeDefined()
    expect(RULE_MODULES['no-empty-function']).toBeDefined()
    expect(RULE_MODULES['consistent-imports']).toBeDefined()
    expect(RULE_MODULES['no-console']).toBeDefined()
    expect(RULE_MODULES['no-array-reduce']).toBeDefined()
    expect(RULE_MODULES['no-eval']).toBeDefined()
    expect(RULE_MODULES['expect-expect']).toBeDefined()
  })
})

// ─── Consistency between registries ────────────────────
describe('Registry consistency', () => {
  it('RULE_CATEGORIES keys are a superset of RULE_MODULES non-pattern keys', () => {
    const categoryKeys = new Set(Object.keys(RULE_CATEGORIES))
    const moduleKeys = Object.keys(RULE_MODULES)
    const nonPatternModules = moduleKeys.filter(k => {
      const cat = RULE_CATEGORIES[k]
      return cat && cat !== 'patterns'
    })
    for (const key of nonPatternModules) {
      expect(categoryKeys.has(key)).toBe(true)
    }
  })
})
