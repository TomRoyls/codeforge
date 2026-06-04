import { describe, test, expect } from 'vitest'
import { noEmptyRule } from '../../../src/rules/patterns/no-empty.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-empty', () => {
  test('flags empty function body', () => {
    const v = runRule(noEmptyRule, 'function f() { }')
    expectViolations(v, ['Unexpected empty block'])
  })

  test('flags empty if block', () => {
    const v = runRule(noEmptyRule, 'if (x) { }')
    expectViolations(v, ['Unexpected empty block'])
  })

  test('does not flag non-empty block', () => {
    const v = runRule(noEmptyRule, 'function f() { console.log("x"); }')
    expectNoViolations(v)
  })

  test('does not flag block with variable declaration', () => {
    const v = runRule(noEmptyRule, 'function f() { const x = 1; }')
    expectNoViolations(v)
  })

  test('does not flag block with return', () => {
    const v = runRule(noEmptyRule, 'function f() { return 1; }')
    expectNoViolations(v)
  })
})
