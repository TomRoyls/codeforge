import { describe, test } from 'vitest'
import { noSelfCompareRule } from '../../../src/rules/patterns/no-self-compare.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-self-compare', () => {
  test('flags x === x', () => {
    const v = runRule(noSelfCompareRule, 'if (x === x) { }')
    expectViolations(v, ['self'])
  })

  test('flags x !== x', () => {
    const v = runRule(noSelfCompareRule, 'if (x !== x) { }')
    expectViolations(v, ['self'])
  })

  test('flags x == x', () => {
    const v = runRule(noSelfCompareRule, 'if (x == x) { }')
    expectViolations(v, ['self'])
  })

  test('does not flag x === y', () => {
    const v = runRule(noSelfCompareRule, 'if (x === y) { }')
    expectNoViolations(v)
  })

  test('does not flag a.x === a.x (different objects)', () => {
    const v = runRule(noSelfCompareRule, 'if (a.x === a.x) { }')
    expectNoViolations(v)
  })
})
