import { describe, test } from 'vitest'
import { noInnerDeclarationsRule } from '../../../src/rules/patterns/no-inner-declarations.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-inner-declarations', () => {
  test('flags function declaration in block', () => {
    const v = runRule(noInnerDeclarationsRule, 'if (x) { function foo() {} }')
    expectViolations(v, ['Move function declaration'])
  })

  test('does not flag function at program root', () => {
    const v = runRule(noInnerDeclarationsRule, 'function foo() {}')
    expectNoViolations(v)
  })

  test('flags var in block', () => {
    const v = runRule(noInnerDeclarationsRule, 'if (x) { var y = 1; }')
    expectViolations(v, ['Move'])
  })

  test('does not flag let in block', () => {
    const v = runRule(noInnerDeclarationsRule, 'if (x) { let y = 1; }')
    expectNoViolations(v)
  })
})
