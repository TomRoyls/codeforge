import { describe, test } from 'vitest'
import { noNewWrappersRule } from '../../../src/rules/patterns/no-new-wrappers.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-new-wrappers', () => {
  test('flags new String()', () => {
    const v = runRule(noNewWrappersRule, 'const s = new String("hello");')
    expectViolations(v, ['String'])
  })

  test('flags new Number()', () => {
    const v = runRule(noNewWrappersRule, 'const n = new Number(42);')
    expectViolations(v, ['Number'])
  })

  test('flags new Boolean()', () => {
    const v = runRule(noNewWrappersRule, 'const b = new Boolean(true);')
    expectViolations(v, ['Boolean'])
  })

  test('does not flag String() without new', () => {
    const v = runRule(noNewWrappersRule, 'const s = String(42);')
    expectNoViolations(v)
  })

  test('does not flag Number() without new', () => {
    const v = runRule(noNewWrappersRule, 'const n = Number("42");')
    expectNoViolations(v)
  })

  test('does not flag custom class', () => {
    const v = runRule(noNewWrappersRule, 'const x = new MyClass();')
    expectNoViolations(v)
  })
})
