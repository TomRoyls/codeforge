import { describe, it, expect } from 'vitest'
import { BEST_PRACTICES } from '../src/commands/why-data-best-practices.js'

// ─── Structure ──────────────────────────────────────────
describe('BEST_PRACTICES', () => {
  it('is a non-empty object', () => {
    expect(typeof BEST_PRACTICES).toBe('object')
    expect(Object.keys(BEST_PRACTICES).length).toBeGreaterThan(0)
  })

  it('maps every key to a non-empty string array', () => {
    for (const [ruleId, practices] of Object.entries(BEST_PRACTICES)) {
      expect(Array.isArray(practices), `${ruleId} should be an array`).toBe(true)
      expect(practices.length, `${ruleId} should have at least 1 practice`).toBeGreaterThan(0)
      for (const p of practices) {
        expect(typeof p, `${ruleId} practice should be a string`).toBe('string')
        expect(p.length, `${ruleId} practice should be non-empty`).toBeGreaterThan(0)
      }
    }
  })
})

// ─── Known Rule Coverage ────────────────────────────────
describe('BEST_PRACTICES known rules', () => {
  const knownRules = [
    'no-eval',
    'max-params',
    'prefer-const',
    'no-circular-deps',
    'curly',
    'eq-eq-eq',
  ]

  it('contains entries for all known rules', () => {
    for (const rule of knownRules) {
      expect(BEST_PRACTICES[rule], `${rule} should exist`).toBeDefined()
    }
  })

  it('has at least 2 practices per known rule', () => {
    for (const rule of knownRules) {
      expect(BEST_PRACTICES[rule].length, `${rule} should have >= 2 practices`).toBeGreaterThanOrEqual(2)
    }
  })
})

// ─── Entry Quality ──────────────────────────────────────
describe('BEST_PRACTICES entry quality', () => {
  it('no practice string exceeds 200 characters', () => {
    for (const [ruleId, practices] of Object.entries(BEST_PRACTICES)) {
      for (const p of practices) {
        expect(p.length, `${ruleId} practice too long`).toBeLessThanOrEqual(200)
      }
    }
  })

  it('has no duplicate practices within a single rule', () => {
    for (const [ruleId, practices] of Object.entries(BEST_PRACTICES)) {
      const unique = new Set(practices)
      expect(unique.size, `${ruleId} has duplicate practices`).toBe(practices.length)
    }
  })
})
