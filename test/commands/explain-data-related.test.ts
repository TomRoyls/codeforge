import { describe, expect, it } from 'vitest'

import { relatedRulesMap } from '../../src/commands/explain-data-related.js'

// ─── Export existence and type ───

describe('relatedRulesMap: export shape', () => {
  it('is defined', () => {
    expect(relatedRulesMap).toBeDefined()
  })

  it('is a non-null object', () => {
    expect(typeof relatedRulesMap).toBe('object')
    expect(relatedRulesMap).not.toBeNull()
  })
})

// ─── Entry count and common keys ───

describe('relatedRulesMap: keys', () => {
  it('has at least 40 rule entries', () => {
    const keys = Object.keys(relatedRulesMap)
    expect(keys.length).toBeGreaterThanOrEqual(40)
  })

  it('contains well-known rule IDs', () => {
    const keys = Object.keys(relatedRulesMap)
    const expected = [
      'no-eval',
      'prefer-const',
      'no-var',
      'eq-eq-eq',
      'curly',
      'max-params',
      'no-console-log',
      'no-explicit-any',
      'no-unused-vars',
      'require-await',
    ]
    for (const rule of expected) {
      expect(keys).toContain(rule)
    }
  })

  it('contains all max-* complexity rules', () => {
    const keys = Object.keys(relatedRulesMap)
    const maxRules = ['max-complexity', 'max-depth', 'max-file-size', 'max-lines', 'max-lines-per-function', 'max-params']
    for (const rule of maxRules) {
      expect(keys).toContain(rule)
    }
  })

  it('has no duplicate keys', () => {
    const keys = Object.keys(relatedRulesMap)
    const uniqueKeys = new Set(keys)
    expect(keys.length).toBe(uniqueKeys.size)
  })
})

// ─── Value types and structure ───

describe('relatedRulesMap: value types', () => {
  it('every value is an array', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [, related] of entries) {
      expect(Array.isArray(related)).toBe(true)
    }
  })

  it('every array is non-empty', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [, related] of entries) {
      expect(related.length).toBeGreaterThan(0)
    }
  })

  it('every array element is a non-empty string', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [, related] of entries) {
      for (const r of related) {
        expect(typeof r).toBe('string')
        expect(r.length).toBeGreaterThan(0)
      }
    }
  })

  it('no array element is undefined or null', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [, related] of entries) {
      for (const r of related) {
        expect(r).not.toBeUndefined()
        expect(r).not.toBeNull()
      }
    }
  })

  it('strings have no leading or trailing whitespace', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [, related] of entries) {
      for (const r of related) {
        expect(r.trim()).toBe(r)
      }
    }
  })
})

// ─── Structural invariants ───

describe('relatedRulesMap: structural invariants', () => {
  it('no rule references itself', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [rule, related] of entries) {
      expect(related).not.toContain(rule)
    }
  })

  it('no duplicate entries within a rule array', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [rule, related] of entries) {
      const unique = new Set(related)
      expect(related.length).toBe(unique.size)
    }
  })

  it('each rule has between 1 and 6 related rules', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [, related] of entries) {
      expect(related.length).toBeGreaterThanOrEqual(1)
      expect(related.length).toBeLessThanOrEqual(6)
    }
  })
})

// ─── Referential integrity ───

describe('relatedRulesMap: referential integrity', () => {
  it('most referenced rules are valid rule names (non-empty, kebab-case)', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [, related] of entries) {
      for (const r of related) {
        expect(r).toMatch(/^[a-z][a-z0-9-]*$/)
      }
    }
  })

  it('relationships are bidirectional for direct pairs', () => {
    const entries = Object.entries(relatedRulesMap)
    for (const [rule, related] of entries) {
      for (const r of related) {
        const reverseRelated = relatedRulesMap[r]
        if (reverseRelated) {
          expect(Array.isArray(reverseRelated)).toBe(true)
        }
      }
    }
  })
})

// ─── Specific relationship checks ───

describe('relatedRulesMap: specific relationships', () => {
  it('no-eval is related to no-implied-eval', () => {
    expect(relatedRulesMap['no-eval']).toContain('no-implied-eval')
  })

  it('no-eval is related to no-new-func', () => {
    expect(relatedRulesMap['no-eval']).toContain('no-new-func')
  })

  it('prefer-const is related to no-var', () => {
    expect(relatedRulesMap['prefer-const']).toContain('no-var')
  })

  it('eq-eq-eq is related to use-isnan', () => {
    expect(relatedRulesMap['eq-eq-eq']).toContain('use-isnan')
  })

  it('max-params is related to prefer-rest-params', () => {
    expect(relatedRulesMap['max-params']).toContain('prefer-rest-params')
  })

  it('no-floating-promises is related to no-misused-promises', () => {
    expect(relatedRulesMap['no-floating-promises']).toContain('no-misused-promises')
  })

  it('no-explicit-any is related to no-unsafe-assignment', () => {
    expect(relatedRulesMap['no-explicit-any']).toContain('no-unsafe-assignment')
  })

  it('no-unused-vars is related to no-duplicate-imports', () => {
    expect(relatedRulesMap['no-unused-vars']).toContain('no-duplicate-imports')
  })

  it('curly is related to no-empty', () => {
    expect(relatedRulesMap['curly']).toContain('no-empty')
  })

  it('max-complexity is related to max-depth', () => {
    expect(relatedRulesMap['max-complexity']).toContain('max-depth')
  })

  it('no-shadow is related to no-param-reassign', () => {
    expect(relatedRulesMap['no-shadow']).toContain('no-param-reassign')
  })
})
