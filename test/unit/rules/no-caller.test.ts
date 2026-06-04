import { describe, test } from 'vitest'
import { noCallerRule } from '../../../src/rules/patterns/no-caller.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-caller', () => {
  test('flags arguments.callee', () => {
    const v = runRule(noCallerRule, 'function f() { return arguments.callee; }')
    expectViolations(v, ['caller'])
  })

  test('flags arguments.caller', () => {
    const v = runRule(noCallerRule, 'function f() { return arguments.caller; }')
    expectViolations(v, ['caller'])
  })

  test('does not flag normal arguments usage', () => {
    const v = runRule(noCallerRule, 'function f() { return arguments[0]; }')
    expectNoViolations(v)
  })

  test('does not flag regular property', () => {
    const v = runRule(noCallerRule, 'const x = obj.caller;')
    expectNoViolations(v)
  })
})
