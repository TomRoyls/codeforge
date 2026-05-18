import { describe, it, expect } from 'vitest'
import { FIXES } from '../src/commands/why-data-fixes.js'

// ─── Structure ──────────────────────────────────────────
describe('FIXES', () => {
  it('is a non-empty object', () => {
    expect(typeof FIXES).toBe('object')
    expect(Object.keys(FIXES).length).toBeGreaterThan(0)
  })

  it('maps every key to a non-empty string array', () => {
    for (const [ruleId, fixes] of Object.entries(FIXES)) {
      expect(Array.isArray(fixes), `${ruleId} should be an array`).toBe(true)
      expect(fixes.length, `${ruleId} should have at least 1 fix`).toBeGreaterThan(0)
      for (const fix of fixes) {
        expect(typeof fix, `${ruleId} fix should be a string`).toBe('string')
        expect(fix.length, `${ruleId} fix should be non-empty`).toBeGreaterThan(0)
      }
    }
  })
})

// ─── Known Rule Coverage ────────────────────────────────
describe('FIXES known rules', () => {
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
      expect(FIXES[rule], `${rule} should exist`).toBeDefined()
    }
  })

  it('has at least 3 fixes per known rule', () => {
    for (const rule of knownRules) {
      expect(FIXES[rule].length, `${rule} should have >= 3 fixes`).toBeGreaterThanOrEqual(3)
    }
  })
})

// ─── Entry Quality ──────────────────────────────────────
describe('FIXES entry quality', () => {
  it('no fix string exceeds 200 characters', () => {
    for (const [ruleId, fixes] of Object.entries(FIXES)) {
      for (const fix of fixes) {
        expect(fix.length, `${ruleId} fix too long`).toBeLessThanOrEqual(200)
      }
    }
  })

  it('has no duplicate fixes within a single rule', () => {
    for (const [ruleId, fixes] of Object.entries(FIXES)) {
      const unique = new Set(fixes)
      expect(unique.size, `${ruleId} has duplicate fixes`).toBe(fixes.length)
    }
  })
})
