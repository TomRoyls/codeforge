import { describe, it, expect } from 'vitest'
import { relatedRulesMap } from '../src/commands/explain-data-related.js'

// ─── relatedRulesMap structure ────────────────────────
describe('relatedRulesMap', () => {
  it('is a non-empty object', () => {
    expect(Object.keys(relatedRulesMap).length).toBeGreaterThan(0)
  })

  it('maps each rule to an array of strings', () => {
    for (const [rule, related] of Object.entries(relatedRulesMap)) {
      expect(typeof rule).toBe('string')
      expect(Array.isArray(related)).toBe(true)
      for (const r of related) {
        expect(typeof r).toBe('string')
      }
    }
  })

  it('has at least one related rule per entry', () => {
    for (const related of Object.values(relatedRulesMap)) {
      expect(related.length).toBeGreaterThan(0)
    }
  })
})

// ─── known rule entries ───────────────────────────────
describe('relatedRulesMap known entries', () => {
  it('contains eq-eq-eq with expected related rules', () => {
    expect(relatedRulesMap['eq-eq-eq']).toBeDefined()
    expect(relatedRulesMap['eq-eq-eq']).toContain('no-implicit-coercion')
    expect(relatedRulesMap['eq-eq-eq']).toContain('use-isnan')
    expect(relatedRulesMap['eq-eq-eq']).toContain('no-compare-neg-zero')
  })

  it('contains no-eval with expected related rules', () => {
    expect(relatedRulesMap['no-eval']).toBeDefined()
    expect(relatedRulesMap['no-eval']).toContain('no-implied-eval')
    expect(relatedRulesMap['no-eval']).toContain('no-new-func')
    expect(relatedRulesMap['no-eval']).toContain('no-script-url')
  })

  it('contains max-complexity with expected related rules', () => {
    expect(relatedRulesMap['max-complexity']).toBeDefined()
    expect(relatedRulesMap['max-complexity']).toContain('max-depth')
    expect(relatedRulesMap['max-complexity']).toContain('max-lines-per-function')
    expect(relatedRulesMap['max-complexity']).toContain('max-params')
  })

  it('contains prefer-const with expected related rules', () => {
    expect(relatedRulesMap['prefer-const']).toBeDefined()
    expect(relatedRulesMap['prefer-const']).toContain('no-var')
    expect(relatedRulesMap['prefer-const']).toContain('no-const-assign')
  })

  it('contains no-console-log with expected related rules', () => {
    expect(relatedRulesMap['no-console-log']).toBeDefined()
    expect(relatedRulesMap['no-console-log']).toContain('no-debugger')
    expect(relatedRulesMap['no-console-log']).toContain('no-alert')
  })

  it('contains no-explicit-any with expected related rules', () => {
    expect(relatedRulesMap['no-explicit-any']).toBeDefined()
    expect(relatedRulesMap['no-explicit-any']).toContain('no-unsafe-assignment')
    expect(relatedRulesMap['no-explicit-any']).toContain('no-unsafe-call')
  })
})

// ─── symmetry and consistency ─────────────────────────
describe('relatedRulesMap symmetry', () => {
  it('most entries have 3 related rules', () => {
    const counts = Object.values(relatedRulesMap).map((r) => r.length)
    const withThree = counts.filter((c) => c === 3).length
    expect(withThree).toBeGreaterThan(counts.length * 0.5)
  })

  it('does not have a rule reference itself', () => {
    for (const [rule, related] of Object.entries(relatedRulesMap)) {
      expect(related).not.toContain(rule)
    }
  })

  it('referenced rules mostly exist as keys', () => {
    const allKeys = new Set(Object.keys(relatedRulesMap))
    const allReferenced = new Set(Object.values(relatedRulesMap).flat())
    const missing = [...allReferenced].filter((r) => !allKeys.has(r))
    expect(missing.length).toBeLessThan(allReferenced.size * 0.7)
  })
})
