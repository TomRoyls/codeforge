import { describe, test } from 'vitest'
import { maxParamsRule } from '../../../src/rules/complexity/max-params.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('max-params', () => {
  test('flags function with 5 params (default max 4)', () => {
    const v = runRule(maxParamsRule, 'function f(a, b, c, d, e) { }')
    expectViolations(v, ['param'])
  })

  test('does not flag function with 4 params', () => {
    const v = runRule(maxParamsRule, 'function f(a, b, c, d) { }')
    expectNoViolations(v)
  })

  test('does not flag function with 0 params', () => {
    const v = runRule(maxParamsRule, 'function f() { }')
    expectNoViolations(v)
  })

  test('flags arrow function with too many params', () => {
    const v = runRule(maxParamsRule, 'const f = (a, b, c, d, e) => { }')
    expectViolations(v, ['param'])
  })

  test('does not flag method with few params', () => {
    const v = runRule(maxParamsRule, 'class C { m(a, b) { } }')
    expectNoViolations(v)
  })
})
