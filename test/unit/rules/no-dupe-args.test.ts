import { describe, test, expect } from 'vitest'
import { noDupeArgsRule } from '../../../src/rules/patterns/no-dupe-args.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-dupe-args', () => {
  test('flags duplicate function params', () => {
    const v = runRule(noDupeArgsRule, 'function f(a, a) { }')
    expectViolations(v, ["Duplicate argument 'a'"])
  })

  test('does not flag unique function params', () => {
    const v = runRule(noDupeArgsRule, 'function f(a, b, c) { }')
    expectNoViolations(v)
  })

  test('flags duplicate arrow function params', () => {
    const v = runRule(noDupeArgsRule, 'const f = (a, a) => { };')
    expectViolations(v, ["Duplicate argument 'a'"])
  })

  test('flags duplicate function expression params', () => {
    const v = runRule(noDupeArgsRule, 'const f = function(a, a) { };')
    expectViolations(v, ["Duplicate argument 'a'"])
  })

  test('does not flag params with default values', () => {
    const v = runRule(noDupeArgsRule, 'function f(a = 1, b = 2) { }')
    expectNoViolations(v)
  })

  test('flags duplicate with default value', () => {
    const v = runRule(noDupeArgsRule, 'function f(a, a = 1) { }')
    expectViolations(v, ["Duplicate argument 'a'"])
  })

  test('does not flag rest params', () => {
    const v = runRule(noDupeArgsRule, 'function f(a, ...rest) { }')
    expectNoViolations(v)
  })

  test('does not flag function with no params', () => {
    const v = runRule(noDupeArgsRule, 'function f() { }')
    expectNoViolations(v)
  })
})
