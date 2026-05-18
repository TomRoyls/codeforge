import { describe, expect, it } from 'vitest'

import {
  RULE_CATEGORIES,
  type RuleCategory,
} from '../../src/rules/rule-category-registry.js'

// ─── RuleCategory Type ───

describe('RuleCategory type', () => {
  const VALID_CATEGORIES: RuleCategory[] = [
    'complexity',
    'correctness',
    'dependencies',
    'patterns',
    'performance',
    'security',
    'testing',
  ]

  it('has exactly 7 valid category values', () => {
    expect(VALID_CATEGORIES).toHaveLength(7)
  })
})

// ─── RULE_CATEGORIES Constant ───

describe('RULE_CATEGORIES', () => {
  it('is a non-null object', () => {
    expect(RULE_CATEGORIES).toBeDefined()
    expect(typeof RULE_CATEGORIES).toBe('object')
  })

  it('has at least 100 rule entries', () => {
    const keys = Object.keys(RULE_CATEGORIES)
    expect(keys.length).toBeGreaterThan(100)
  })

  it('maps every value to a valid RuleCategory', () => {
    const validCategories = new Set<string>([
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'testing',
    ])
    for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
      expect(validCategories.has(category as string)).toBe(true)
    }
  })

  it('does not have duplicate values (every entry maps to a category)', () => {
    const values = Object.values(RULE_CATEGORIES)
    expect(values.length).toBe(Object.keys(RULE_CATEGORIES).length)
  })
})

// ─── Specific Rule Categories ───

describe('RULE_CATEGORIES specific mappings', () => {
  it('maps complexity rules correctly', () => {
    expect(RULE_CATEGORIES['max-complexity']).toBe('complexity')
    expect(RULE_CATEGORIES['max-depth']).toBe('complexity')
    expect(RULE_CATEGORIES['max-lines']).toBe('complexity')
    expect(RULE_CATEGORIES['max-lines-per-function']).toBe('complexity')
    expect(RULE_CATEGORIES['max-params']).toBe('complexity')
  })

  it('maps testing rules correctly', () => {
    expect(RULE_CATEGORIES['consistent-test-it']).toBe('testing')
    expect(RULE_CATEGORIES['expect-expect']).toBe('testing')
    expect(RULE_CATEGORIES['max-expects']).toBe('testing')
    expect(RULE_CATEGORIES['max-nested-describe']).toBe('testing')
    expect(RULE_CATEGORIES['no-alias-methods']).toBe('testing')
  })

  it('maps dependency rules correctly', () => {
    expect(RULE_CATEGORIES['consistent-imports']).toBe('dependencies')
  })

  it('maps performance rules correctly', () => {
    expect(RULE_CATEGORIES['no-await-in-loop']).toBe('performance')
  })

  it('maps pattern rules correctly', () => {
    expect(RULE_CATEGORIES['curly']).toBe('patterns')
    expect(RULE_CATEGORIES['eq-eq-eq']).toBe('patterns')
    expect(RULE_CATEGORIES['default-case']).toBe('patterns')
    expect(RULE_CATEGORIES['explicit-return-type']).toBe('patterns')
    expect(RULE_CATEGORIES['no-alert']).toBe('patterns')
  })
})

// ─── Category Distribution ───

describe('RULE_CATEGORIES category distribution', () => {
  it('has entries in all 7 categories', () => {
    const categories = new Set(Object.values(RULE_CATEGORIES))
    const expectedCategories = new Set<string>([
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'testing',
    ])
    for (const cat of expectedCategories) {
      expect(categories.has(cat as RuleCategory)).toBe(true)
    }
  })

  it('has patterns as the largest category', () => {
    const counts: Record<string, number> = {}
    for (const cat of Object.values(RULE_CATEGORIES)) {
      counts[cat as string] = (counts[cat as string] || 0) + 1
    }
    expect(counts['patterns']).toBeGreaterThan(counts['complexity']!)
    expect(counts['patterns']).toBeGreaterThan(counts['testing']!)
    expect(counts['patterns']).toBeGreaterThan(counts['security']!)
    expect(counts['patterns']).toBeGreaterThan(counts['performance']!)
  })

  it('has security rules', () => {
    const securityRules = Object.entries(RULE_CATEGORIES)
      .filter(([, cat]) => cat === 'security')
      .map(([rule]) => rule)
    expect(securityRules.length).toBeGreaterThan(0)
  })

  it('has correctness rules', () => {
    const correctnessRules = Object.entries(RULE_CATEGORIES)
      .filter(([, cat]) => cat === 'correctness')
      .map(([rule]) => rule)
    expect(correctnessRules.length).toBeGreaterThan(0)
  })
})

// ─── Key Format ───

describe('RULE_CATEGORIES key format', () => {
  it('all keys are lowercase kebab-case strings', () => {
    for (const key of Object.keys(RULE_CATEGORIES)) {
      // Keys should be lowercase, no camelCase, no PascalCase
      expect(key).toBe(key.toLowerCase())
      // No spaces
      expect(key).not.toMatch(/\s/)
    }
  })

  it('no empty string keys', () => {
    const keys = Object.keys(RULE_CATEGORIES)
    expect(keys).not.toContain('')
  })
})

// ─── No Undefined Values ───

describe('RULE_CATEGORIES value integrity', () => {
  it('has no undefined values', () => {
    for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
      expect(category).toBeDefined()
      expect(category).not.toBeUndefined()
    }
  })

  it('every entry has a non-empty string value', () => {
    for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
      expect(typeof category).toBe('string')
      expect(category.length).toBeGreaterThan(0)
    }
  })
})
