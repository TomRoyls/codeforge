import { describe, test } from 'vitest'
import { noLabelsRule } from '../../../src/rules/patterns/no-labels.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-labels', () => {
  test('flags labeled statement', () => {
    const v = runRule(noLabelsRule, 'A: while (true) { break A; }')
    expectViolations(v, ['label'])
  })

  test('does not flag unlabeled loop', () => {
    const v = runRule(noLabelsRule, 'while (true) { break; }')
    expectNoViolations(v)
  })

  test('does not flag regular code', () => {
    const v = runRule(noLabelsRule, 'const x = 1;')
    expectNoViolations(v)
  })
})
