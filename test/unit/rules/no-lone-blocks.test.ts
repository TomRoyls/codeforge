import { describe, test } from 'vitest'
import { noLoneBlocksRule } from '../../../src/rules/patterns/no-lone-blocks.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-lone-blocks', () => {
  test('flags empty lone block', () => {
    const v = runRule(noLoneBlocksRule, '{ }')
    expectViolations(v, ['Empty'])
  })

  test('does not flag block with statement', () => {
    const v = runRule(noLoneBlocksRule, '{ const x = 1; }')
    expectNoViolations(v)
  })

  test('does not flag function body', () => {
    const v = runRule(noLoneBlocksRule, 'function f() { const x = 1; }')
    expectNoViolations(v)
  })

  test('does not flag if block', () => {
    const v = runRule(noLoneBlocksRule, 'if (x) { const y = 1; }')
    expectNoViolations(v)
  })
})
