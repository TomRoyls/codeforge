import { describe, it, expect } from 'vitest'
import { COMMON_VIOLATIONS } from '../src/commands/why-data-violations.js'

// ─── Structure ──────────────────────────────────────────
describe('COMMON_VIOLATIONS', () => {
  it('is a non-empty object', () => {
    expect(typeof COMMON_VIOLATIONS).toBe('object')
    expect(Object.keys(COMMON_VIOLATIONS).length).toBeGreaterThan(0)
  })

  it('maps every key to a non-empty string array', () => {
    for (const [ruleId, violations] of Object.entries(COMMON_VIOLATIONS)) {
      expect(Array.isArray(violations), `${ruleId} should be an array`).toBe(true)
      expect(violations.length, `${ruleId} should have at least 1 violation`).toBeGreaterThan(0)
      for (const v of violations) {
        expect(typeof v, `${ruleId} violation should be a string`).toBe('string')
        expect(v.length, `${ruleId} violation should be non-empty`).toBeGreaterThan(0)
      }
    }
  })
})

// ─── Known Rule Coverage ────────────────────────────────
describe('COMMON_VIOLATIONS known rules', () => {
  const knownRules = [
    'no-eval',
    'no-console-log',
    'max-params',
    'no-circular-deps',
    'prefer-const',
    'no-unused-vars',
  ]

  it('contains entries for all known rules', () => {
    for (const rule of knownRules) {
      expect(COMMON_VIOLATIONS[rule], `${rule} should exist`).toBeDefined()
    }
  })

  it('has at least 2 violations per known rule', () => {
    for (const rule of knownRules) {
      expect(COMMON_VIOLATIONS[rule].length, `${rule} should have >= 2 violations`).toBeGreaterThanOrEqual(2)
    }
  })
})

// ─── Entry Quality ──────────────────────────────────────
describe('COMMON_VIOLATIONS entry quality', () => {
  it('no violation string exceeds 200 characters', () => {
    for (const [ruleId, violations] of Object.entries(COMMON_VIOLATIONS)) {
      for (const v of violations) {
        expect(v.length, `${ruleId} violation too long`).toBeLessThanOrEqual(200)
      }
    }
  })

  it('has no duplicate violations within a single rule', () => {
    for (const [ruleId, violations] of Object.entries(COMMON_VIOLATIONS)) {
      const unique = new Set(violations)
      expect(unique.size, `${ruleId} has duplicate violations`).toBe(violations.length)
    }
  })
})
