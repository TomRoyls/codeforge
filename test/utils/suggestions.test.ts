import { describe, expect, it } from 'vitest'
import { RULE_SUGGESTIONS } from '../../src/utils/suggestions.js'

// ─── Structure ───

describe('RULE_SUGGESTIONS structure', () => {
  it('is a non-empty object', () => {
    expect(Object.keys(RULE_SUGGESTIONS).length).toBeGreaterThan(50)
  })

  it('all values are non-empty strings', () => {
    for (const [rule, suggestion] of Object.entries(RULE_SUGGESTIONS)) {
      expect(typeof suggestion).toBe('string')
      expect(suggestion.length).toBeGreaterThan(0)
      expect(rule.length).toBeGreaterThan(0)
    }
  })
})

// ─── Known Rules ───

describe('RULE_SUGGESTIONS known rules', () => {
  it('has noConsoleLog suggestion', () => {
    expect(RULE_SUGGESTIONS.noConsoleLog).toBeDefined()
    expect(RULE_SUGGESTIONS.noConsoleLog).toContain('logging')
  })

  it('has noEval suggestion', () => {
    expect(RULE_SUGGESTIONS.noEval).toBeDefined()
    expect(RULE_SUGGESTIONS.noEval).toContain('eval')
  })

  it('has preferConst suggestion', () => {
    expect(RULE_SUGGESTIONS.preferConst).toBeDefined()
    expect(RULE_SUGGESTIONS.preferConst).toContain('const')
  })

  it('has eqEqEq suggestion', () => {
    expect(RULE_SUGGESTIONS.eqEqEq).toBeDefined()
    expect(RULE_SUGGESTIONS.eqEqEq).toContain('===')
  })

  it('has noExplicitAny suggestion', () => {
    expect(RULE_SUGGESTIONS.noExplicitAny).toBeDefined()
    expect(RULE_SUGGESTIONS.noExplicitAny).toContain('any')
  })

  it('has noDuplicateCode suggestion', () => {
    expect(RULE_SUGGESTIONS.noDuplicateCode).toBeDefined()
    expect(RULE_SUGGESTIONS.noDuplicateCode).toContain('duplicated')
  })

  it('has noVar suggestion', () => {
    expect(RULE_SUGGESTIONS.noVar).toBeDefined()
    expect(RULE_SUGGESTIONS.noVar).toContain('let')
  })

  it('has noFallthrough suggestion', () => {
    expect(RULE_SUGGESTIONS.noFallthrough).toBeDefined()
    expect(RULE_SUGGESTIONS.noFallthrough).toContain('break')
  })

  it('has preferTemplate suggestion', () => {
    expect(RULE_SUGGESTIONS.preferTemplate).toBeDefined()
    expect(RULE_SUGGESTIONS.preferTemplate).toContain('template')
  })

  it('has noUnsafeRegex suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnsafeRegex).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnsafeRegex).toContain('backtracking')
  })

  it('has consistent return type for all entries', () => {
    for (const [rule, suggestion] of Object.entries(RULE_SUGGESTIONS)) {
      expect(typeof rule).toBe('string')
      expect(typeof suggestion).toBe('string')
      expect(suggestion.length).toBeGreaterThan(10)
    }
  })

  it('has maxFileSize suggestion', () => {
    expect(RULE_SUGGESTIONS.maxFileSize).toBeDefined()
    expect(RULE_SUGGESTIONS.maxFileSize).toContain('Split')
  })

  it('has noExplicitAny suggestion', () => {
    expect(RULE_SUGGESTIONS.noExplicitAny).toBeDefined()
    expect(typeof RULE_SUGGESTIONS.noExplicitAny).toBe('string')
  })

  it('suggestions do not contain empty strings', () => {
    for (const [key, val] of Object.entries(RULE_SUGGESTIONS)) {
      expect(val.trim().length).toBeGreaterThan(0)
    }
  })

  it('all rule IDs are non-empty strings', () => {
    for (const key of Object.keys(RULE_SUGGESTIONS)) {
      expect(key.length).toBeGreaterThan(0)
    }
  })

  it('RULE_SUGGESTIONS has at least 1 entry', () => {
    expect(Object.keys(RULE_SUGGESTIONS).length).toBeGreaterThan(0)
  })

  it('RULE_SUGGESTIONS entries are strings', () => {
    const values = Object.values(RULE_SUGGESTIONS)
    for (const v of values) {
      expect(typeof v).toBe('string')
    }
  })

  it('has valid rule keys', () => {
    for (const key of Object.keys(RULE_SUGGESTIONS)) {
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    }
  })

  it('RULE_SUGGESTIONS keys are unique', () => {
    const keys = Object.keys(RULE_SUGGESTIONS)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
