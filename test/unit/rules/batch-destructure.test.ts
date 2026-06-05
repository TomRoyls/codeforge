import { describe, expect, it } from 'vitest'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper'
import noEmptyPattern from '../../../src/rules/patterns/no-empty-pattern'

describe('no-empty-pattern', () => {
  it('flags empty array pattern [] = arr', () => {
    const violations = runRule(noEmptyPattern, 'const [] = arr')
    expectViolations(violations, ['empty'])
  })

  it('flags empty object pattern {} = obj', () => {
    const violations = runRule(noEmptyPattern, 'const {} = obj')
    expectViolations(violations, ['empty'])
  })

  it('does not flag non-empty array pattern', () => {
    const violations = runRule(noEmptyPattern, 'const [a] = arr')
    expectNoViolations(violations)
  })

  it('does not flag non-empty object pattern', () => {
    const violations = runRule(noEmptyPattern, 'const { a } = obj')
    expectNoViolations(violations)
  })

  it('flags nested empty array pattern', () => {
    const violations = runRule(noEmptyPattern, 'const [[]] = arr')
    expect(violations.length).toBeGreaterThan(0)
  })
})
