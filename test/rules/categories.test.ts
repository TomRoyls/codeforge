import { describe, expect, it } from 'vitest'

import { getRuleCategory } from '../../src/rules/categories.js'

// ─── Known rule categories ───

describe('getRuleCategory', () => {
  it('returns patterns for no-console', () => {
    expect(getRuleCategory('no-console')).toBe('patterns')
  })

  it('returns complexity for max-complexity', () => {
    expect(getRuleCategory('max-complexity')).toBe('complexity')
  })

  it('returns security for no-eval', () => {
    expect(getRuleCategory('no-eval')).toBe('security')
  })

  it('returns performance for no-await-in-loop', () => {
    expect(getRuleCategory('no-await-in-loop')).toBe('performance')
  })

  it('returns dependencies for no-circular-deps', () => {
    expect(getRuleCategory('no-circular-deps')).toBe('dependencies')
  })

  it('returns testing for no-skipped-tests', () => {
    expect(getRuleCategory('no-skipped-tests')).toBe('testing')
  })

  it('returns correctness for no-empty-catch', () => {
    expect(getRuleCategory('no-empty-catch')).toBe('correctness')
  })

  // ─── Default fallback ───

  it('returns complexity default for unknown rule', () => {
    expect(getRuleCategory('totally-made-up-rule')).toBe('complexity')
  })

  it('returns complexity default for empty string', () => {
    expect(getRuleCategory('')).toBe('complexity')
  })

  // ─── Pattern rules ───

  it('returns patterns for curly', () => {
    expect(getRuleCategory('curly')).toBe('patterns')
  })

  it('returns patterns for eq-eq-eq', () => {
    expect(getRuleCategory('eq-eq-eq')).toBe('patterns')
  })

  it('returns patterns for no-empty', () => {
    expect(getRuleCategory('no-empty')).toBe('patterns')
  })

  // ─── Security rules ───

  it('returns security for no-hardcoded-credentials', () => {
    expect(getRuleCategory('no-hardcoded-credentials')).toBe('security')
  })

  it('returns security for no-sql-injection', () => {
    expect(getRuleCategory('no-sql-injection')).toBe('security')
  })

  it('returns security for no-dynamic-delete', () => {
    expect(getRuleCategory('no-dynamic-delete')).toBe('security')
  })

  // ─── Testing rules ───

  it('returns testing for no-focused-tests', () => {
    expect(getRuleCategory('no-focused-tests')).toBe('testing')
  })

  it('returns testing for expect-expect', () => {
    expect(getRuleCategory('expect-expect')).toBe('testing')
  })

  it('returns testing for valid-expect', () => {
    expect(getRuleCategory('valid-expect')).toBe('testing')
  })
})
