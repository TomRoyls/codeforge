import { describe, test, expect } from 'vitest'
import { forDirectionRule } from '../../../src/rules/patterns/for-direction.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('for-direction', () => {
  test('flags i++ with i > limit', () => {
    const v = runRule(forDirectionRule, 'for (let i = 0; i > 10; i++) { }')
    expectViolations(v, ['wrong direction'])
  })

  test('flags i-- with i < limit', () => {
    const v = runRule(forDirectionRule, 'for (let i = 10; i < 0; i--) { }')
    expectViolations(v, ['wrong direction'])
  })

  test('does not flag i++ with i < limit', () => {
    const v = runRule(forDirectionRule, 'for (let i = 0; i < 10; i++) { }')
    expectNoViolations(v)
  })

  test('does not flag i-- with i > limit', () => {
    const v = runRule(forDirectionRule, 'for (let i = 10; i > 0; i--) { }')
    expectNoViolations(v)
  })

  test('does not flag for without test', () => {
    const v = runRule(forDirectionRule, 'for (let i = 0; ; i++) { break; }')
    expectNoViolations(v)
  })

  test('does not flag for without update', () => {
    const v = runRule(forDirectionRule, 'for (let i = 0; i < 10;) { break; }')
    expectNoViolations(v)
  })
})
