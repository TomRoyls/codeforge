import { describe, test, expect } from 'vitest'
import { noDebuggerRule } from '../../../src/rules/patterns/no-debugger.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-debugger', () => {
  test('flags debugger statement', () => {
    const v = runRule(noDebuggerRule, 'function f() { debugger; }')
    expectViolations(v, ["debugger"])
  })

  test('flags multiple debugger statements', () => {
    const v = runRule(noDebuggerRule, 'debugger; debugger;')
    expect(v.length).toBeGreaterThanOrEqual(2)
  })

  test('does not flag regular code', () => {
    const v = runRule(noDebuggerRule, 'const x = 1; console.log(x);')
    expectNoViolations(v)
  })

  test('does not flag function calls', () => {
    const v = runRule(noDebuggerRule, 'console.log("debug")')
    expectNoViolations(v)
  })
})
