import { describe, it, expect } from 'vitest'
import { bestPracticesMap } from '../src/commands/explain-data-best-practices.js'

// ─── Structure ──────────────────────────────────────────
describe('bestPracticesMap', () => {
  it('is a non-empty object', () => {
    expect(typeof bestPracticesMap).toBe('object')
    expect(Object.keys(bestPracticesMap).length).toBeGreaterThan(0)
  })

  it('maps every key to a non-empty string array', () => {
    for (const [ruleId, practices] of Object.entries(bestPracticesMap)) {
      expect(Array.isArray(practices), `${ruleId} should be an array`).toBe(true)
      expect(practices.length, `${ruleId} should have at least 1 practice`).toBeGreaterThan(0)
      for (const practice of practices) {
        expect(typeof practice, `${ruleId} practice should be a string`).toBe('string')
        expect(practice.length, `${ruleId} practice should be non-empty`).toBeGreaterThan(0)
      }
    }
  })
})

// ─── Known Rule Coverage ────────────────────────────────
describe('bestPracticesMap known rules', () => {
  const knownRules = [
    'consistent-imports',
    'curly',
    'eq-eq-eq',
    'max-complexity',
    'max-params',
    'no-eval',
    'no-explicit-any',
    'prefer-const',
    'require-await',
    'sort-keys',
  ]

  it('contains entries for all known rules', () => {
    for (const rule of knownRules) {
      expect(bestPracticesMap[rule], `${rule} should exist`).toBeDefined()
      expect(bestPracticesMap[rule].length, `${rule} should have practices`).toBeGreaterThan(0)
    }
  })

  it('has at least 3 practices per known rule', () => {
    for (const rule of knownRules) {
      expect(bestPracticesMap[rule].length, `${rule} should have >= 3 practices`).toBeGreaterThanOrEqual(3)
    }
  })
})

// ─── Entry Quality ──────────────────────────────────────
describe('bestPracticesMap entry quality', () => {
  it('no practice string exceeds 200 characters', () => {
    for (const [ruleId, practices] of Object.entries(bestPracticesMap)) {
      for (const practice of practices) {
        expect(practice.length, `${ruleId} practice too long`).toBeLessThanOrEqual(200)
      }
    }
  })

  it('has no duplicate practices within a single rule', () => {
    for (const [ruleId, practices] of Object.entries(bestPracticesMap)) {
      const unique = new Set(practices)
      expect(unique.size, `${ruleId} has duplicate practices`).toBe(practices.length)
    }
  })
})
