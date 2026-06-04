import { describe, test, expect } from 'vitest'
import { eqEqEqRule } from '../../../src/rules/patterns/eq-eq-eq.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('eq-eq-eq', () => {
  test('flags == comparison', () => {
    const v = runRule(eqEqEqRule, 'if (x == 1) { }')
    expectViolations(v, ["Expected '==='"])
  })

  test('flags != comparison', () => {
    const v = runRule(eqEqEqRule, 'if (x != 1) { }')
    expectViolations(v, ["Expected '!=='"])
  })

  test('does not flag === comparison', () => {
    const v = runRule(eqEqEqRule, 'if (x === 1) { }')
    expectNoViolations(v)
  })

  test('does not flag !== comparison', () => {
    const v = runRule(eqEqEqRule, 'if (x !== 1) { }')
    expectNoViolations(v)
  })

  test('does not flag == null (common pattern)', () => {
    const v = runRule(eqEqEqRule, 'if (x == null) { }')
    expectNoViolations(v)
  })

  test('does not flag != null', () => {
    const v = runRule(eqEqEqRule, 'if (x != null) { }')
    expectNoViolations(v)
  })

  test('does not flag null == null', () => {
    const v = runRule(eqEqEqRule, 'if (null == null) { }')
    expectNoViolations(v)
  })

  test('does not flag < comparison', () => {
    const v = runRule(eqEqEqRule, 'if (x < 1) { }')
    expectNoViolations(v)
  })

  test('does not flag + operator', () => {
    const v = runRule(eqEqEqRule, 'const x = 1 + 2;')
    expectNoViolations(v)
  })

  test('flags nested == in expression', () => {
    const v = runRule(eqEqEqRule, 'const result = (a == b) ? "yes" : "no";')
    expectViolations(v, ["Expected '==='"])
  })
})
