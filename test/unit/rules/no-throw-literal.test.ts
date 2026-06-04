import { describe, test } from 'vitest'
import { noThrowLiteralRule } from '../../../src/rules/patterns/no-throw-literal.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-throw-literal', () => {
  test('flags throw string', () => {
    const v = runRule(noThrowLiteralRule, 'throw "error";')
    expectViolations(v, ['error object'])
  })

  test('flags throw number', () => {
    const v = runRule(noThrowLiteralRule, 'throw 42;')
    expectViolations(v, ['error object'])
  })

  test('flags throw boolean', () => {
    const v = runRule(noThrowLiteralRule, 'throw true;')
    expectViolations(v, ['error object'])
  })

  test('does not flag throw Error', () => {
    const v = runRule(noThrowLiteralRule, 'throw new Error("fail");')
    expectNoViolations(v)
  })

  test('does not flag throw TypeError', () => {
    const v = runRule(noThrowLiteralRule, 'throw new TypeError("fail");')
    expectNoViolations(v)
  })

  test('does not flag throw variable', () => {
    const v = runRule(noThrowLiteralRule, 'const e = new Error("x"); throw e;')
    expectNoViolations(v)
  })

  test('does not flag throw null', () => {
    const v = runRule(noThrowLiteralRule, 'throw null;')
    expectNoViolations(v)
  })

  test('does not flag throw undefined', () => {
    const v = runRule(noThrowLiteralRule, 'throw undefined;')
    expectNoViolations(v)
  })
})
