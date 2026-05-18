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
})
