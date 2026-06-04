import { describe, test, expect } from 'vitest'
import { getterReturnRule } from '../../../src/rules/patterns/getter-return.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('getter-return', () => {
  test('flags getter without return', () => {
    const v = runRule(getterReturnRule, 'class C { get x() { } }')
    expectViolations(v, ['Getter should return'])
  })

  test('does not flag getter with return', () => {
    const v = runRule(getterReturnRule, 'class C { get x() { return 1; } }')
    expectNoViolations(v)
  })

  test('does not flag getter with conditional return', () => {
    const v = runRule(getterReturnRule, 'class C { get x() { if (y) { return 1; } return 2; } }')
    expectNoViolations(v)
  })

  test('does not flag regular method', () => {
    const v = runRule(getterReturnRule, 'class C { foo() { } }')
    expectNoViolations(v)
  })

  test('does not flag setter', () => {
    const v = runRule(getterReturnRule, 'class C { set x(v) { } }')
    expectNoViolations(v)
  })
})
