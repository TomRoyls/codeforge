import { describe, test } from 'vitest'
import { noExtraSemiRule } from '../../../src/rules/patterns/no-extra-semi.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-extra-semi', () => {
  test('flags double semicolon', () => {
    const v = runRule(noExtraSemiRule, 'const x = 1;;')
    expectViolations(v, ['Unnecessary'])
  })

  test('flags empty block with semicolon', () => {
    const v = runRule(noExtraSemiRule, 'function f() {;}')
    expectViolations(v, ['Unnecessary'])
  })

  test('does not flag normal semicolon', () => {
    const v = runRule(noExtraSemiRule, 'const x = 1;')
    expectNoViolations(v)
  })

  test('does not flag for loop semicolons', () => {
    const v = runRule(noExtraSemiRule, 'for (let i = 0; i < 10; i++) { }')
    expectNoViolations(v)
  })
})
