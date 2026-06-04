import { describe, test } from 'vitest'
import { requireYieldRule } from '../../../src/rules/patterns/require-yield.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('require-yield', () => {
  test('flags generator without yield', () => {
    const v = runRule(requireYieldRule, 'function* f() { return 1; }')
    expectViolations(v, ['yield'])
  })

  test('does not flag generator with yield', () => {
    const v = runRule(requireYieldRule, 'function* f() { yield 1; }')
    expectNoViolations(v)
  })

  test('does not flag generator with delegated yield', () => {
    const v = runRule(requireYieldRule, 'function* f() { yield* [1, 2, 3]; }')
    expectNoViolations(v)
  })

  test('does not flag regular function', () => {
    const v = runRule(requireYieldRule, 'function f() { return 1; }')
    expectNoViolations(v)
  })

  test('does not flag async function', () => {
    const v = runRule(requireYieldRule, 'async function f() { return 1; }')
    expectNoViolations(v)
  })
})
