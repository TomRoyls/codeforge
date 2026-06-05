import { describe, expect, it } from 'vitest'

import { bestPracticesMap } from '../../src/commands/explain-data-best-practices.js'
import { examplesMap } from '../../src/commands/explain-data-examples.js'
import type { RuleExample } from '../../src/commands/explain-data-examples.js'
import { relatedRulesMap } from '../../src/commands/explain-data-related.js'

// ─── Module 1: bestPracticesMap ───

describe('bestPracticesMap', () => {
  it('is a non-null object', () => {
    expect(bestPracticesMap).toBeDefined()
    expect(typeof bestPracticesMap).toBe('object')
    expect(bestPracticesMap).not.toBeNull()
  })

  it('has at least 30 rule entries', () => {
    const keys = Object.keys(bestPracticesMap)
    expect(keys.length).toBeGreaterThanOrEqual(30)
  })

  it('contains common rule keys', () => {
    const keys = Object.keys(bestPracticesMap)
    const expected = ['no-eval', 'prefer-const', 'max-params', 'no-console', 'no-var']
    for (const rule of expected) {
      expect(keys).toContain(rule)
    }
  })

  it('every value is a non-empty array of strings', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [rule, practices] of entries) {
      expect(Array.isArray(practices)).toBe(true)
      expect(practices.length).toBeGreaterThan(0)
      for (const practice of practices) {
        expect(typeof practice).toBe('string')
        expect(practice.length).toBeGreaterThan(0)
      }
    }
  })

  it('has no undefined or null values in arrays', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      for (const practice of practices) {
        expect(practice).not.toBeUndefined()
        expect(practice).not.toBeNull()
      }
    }
  })

  it('each rule has at least 3 best practices', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [rule, practices] of entries) {
      expect(practices.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('has no duplicate keys', () => {
    const keys = Object.keys(bestPracticesMap)
    const uniqueKeys = new Set(keys)
    expect(keys.length).toBe(uniqueKeys.size)
  })
})

// ─── Module 2: examplesMap ───

describe('examplesMap', () => {
  it('is a non-null object', () => {
    expect(examplesMap).toBeDefined()
    expect(typeof examplesMap).toBe('object')
    expect(examplesMap).not.toBeNull()
  })

  it('has at least 20 rule entries', () => {
    const keys = Object.keys(examplesMap)
    expect(keys.length).toBeGreaterThanOrEqual(20)
  })

  it('contains common rule keys', () => {
    const keys = Object.keys(examplesMap)
    const expected = ['no-eval', 'prefer-const', 'no-var', 'eq-eq-eq', 'curly']
    for (const rule of expected) {
      expect(keys).toContain(rule)
    }
  })

  it('every value is a non-empty array of RuleExample objects', () => {
    const entries = Object.entries(examplesMap)
    for (const [rule, examples] of entries) {
      expect(Array.isArray(examples)).toBe(true)
      expect(examples.length).toBeGreaterThan(0)
      for (const example of examples) {
        expect(example).toBeDefined()
        expect(typeof example).toBe('object')
        expect(typeof example.bad).toBe('string')
        expect(typeof example.description).toBe('string')
        expect(typeof example.good).toBe('string')
      }
    }
  })

  it('each example has non-empty bad, description, and good strings', () => {
    const entries = Object.entries(examplesMap)
    for (const [rule, examples] of entries) {
      for (const example of examples) {
        expect(example.bad.length).toBeGreaterThan(0)
        expect(example.description.length).toBeGreaterThan(0)
        expect(example.good.length).toBeGreaterThan(0)
      }
    }
  })

  it('bad and good are different strings in every example', () => {
    const entries = Object.entries(examplesMap)
    for (const [rule, examples] of entries) {
      for (const example of examples) {
        expect(example.bad).not.toBe(example.good)
      }
    }
  })

  it('exports the RuleExample interface type (structural check)', () => {
    const example: RuleExample = {
      bad: 'var x = 1',
      description: 'test',
      good: 'const x = 1',
    }
    expect(example.bad).toBe('var x = 1')
    expect(example.description).toBe('test')
    expect(example.good).toBe('const x = 1')
  })

  it('no-eval has at least 2 examples', () => {
    const examples = examplesMap['no-eval']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThanOrEqual(2)
  })

  it('prefer-const has at least 2 examples', () => {
    const examples = examplesMap['prefer-const']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThanOrEqual(2)
  })

  it('has no duplicate keys', () => {
    const keys = Object.keys(examplesMap)
    const uniqueKeys = new Set(keys)
    expect(keys.length).toBe(uniqueKeys.size)
  })
})

// ─── Module 3: relatedRulesMap ───

describe('relatedRulesMap', () => {
  it('is a non-null object', () => {
    expect(relatedRulesMap).toBeDefined()
    expect(typeof relatedRulesMap).toBe('object')
    expect(relatedRulesMap).not.toBeNull()
  })

  it('has at least 30 rule entries', () => {
    const keys = Object.keys(relatedRulesMap)
    expect(keys.length).toBeGreaterThanOrEqual(30)
  })

  it('contains common rule keys', () => {
    const keys = Object.keys(relatedRulesMap)
    const expected = ['no-eval', 'prefer-const', 'max-params', 'no-var', 'eq-eq-eq']
    for (const rule of expected) {
      expect(keys).toContain(rule)
    }
  })

  it('every value is a non-empty array of strings', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [rule, related] of entries) {
      expect(Array.isArray(related)).toBe(true)
      expect(related.length).toBeGreaterThan(0)
      for (const r of related) {
        expect(typeof r).toBe('string')
        expect(r.length).toBeGreaterThan(0)
      }
    }
  })

  it('each string is a valid rule name (non-empty, no spaces in most cases)', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [rule, related] of entries) {
      for (const r of related) {
        expect(r.length).toBeGreaterThan(0)
        expect(r.trim()).toBe(r)
      }
    }
  })

  it('no-eval is related to no-implied-eval', () => {
    const related = relatedRulesMap['no-eval']
    expect(related).toBeDefined()
    expect(related).toContain('no-implied-eval')
  })

  it('no-eval is related to no-new-func', () => {
    const related = relatedRulesMap['no-eval']
    expect(related).toContain('no-new-func')
  })

  it('prefer-const is related to no-var', () => {
    const related = relatedRulesMap['prefer-const']
    expect(related).toBeDefined()
    expect(related).toContain('no-var')
  })

  it('no-floating-promises is related to no-misused-promises', () => {
    const related = relatedRulesMap['no-floating-promises']
    expect(related).toBeDefined()
    expect(related).toContain('no-misused-promises')
  })

  it('no-explicit-any is related to no-unsafe-assignment', () => {
    const related = relatedRulesMap['no-explicit-any']
    expect(related).toBeDefined()
    expect(related).toContain('no-unsafe-assignment')
  })

  it('no rule references itself', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [rule, related] of entries) {
      expect(related).not.toContain(rule)
    }
  })

  it('has no duplicate keys', () => {
    const keys = Object.keys(relatedRulesMap)
    const uniqueKeys = new Set(keys)
    expect(keys.length).toBe(uniqueKeys.size)
  })
})
