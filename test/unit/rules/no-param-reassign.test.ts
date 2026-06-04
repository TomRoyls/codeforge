import { describe, test, expect } from 'vitest'
import { noParamReassignRule } from '../../../src/rules/patterns/no-param-reassign.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-param-reassign', () => {
  test('flags reassignment of param', () => {
    const v = runRule(noParamReassignRule, 'function f(x) { x = 1; }')
    expectViolations(v, ['Reassignment'])
  })

  test('flags mutation of param property', () => {
    const v = runRule(noParamReassignRule, 'function f(obj) { obj.x = 1; }')
    expectViolations(v, ['Reassignment'])
  })

  test('does not flag reading param', () => {
    const v = runRule(noParamReassignRule, 'function f(x) { console.log(x); }')
    expectNoViolations(v)
  })

  test('does not flag reassignment of non-param', () => {
    const v = runRule(noParamReassignRule, 'function f() { let x = 1; x = 2; }')
    expectNoViolations(v)
  })

  test('does not flag arrow function param read', () => {
    const v = runRule(noParamReassignRule, 'const fn = (x) => x + 1;')
    expectNoViolations(v)
  })
})
