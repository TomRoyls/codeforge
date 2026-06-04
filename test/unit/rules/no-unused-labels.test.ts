import { describe, test } from 'vitest'
import { noUnusedLabelsRule } from '../../../src/rules/patterns/no-unused-labels.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-unused-labels', () => {
  test('flags unused label', () => {
    const v = runRule(noUnusedLabelsRule, 'A: while (true) { break; }')
    expectViolations(v, ['label'])
  })

  test('does not flag used label with break', () => {
    const v = runRule(noUnusedLabelsRule, 'A: while (true) { break A; }')
    expectNoViolations(v)
  })

  test('does not flag used label with continue', () => {
    const v = runRule(noUnusedLabelsRule, 'A: for (let i = 0; i < 10; i++) { continue A; }')
    expectNoViolations(v)
  })

  test('does not flag no label', () => {
    const v = runRule(noUnusedLabelsRule, 'while (true) { break; }')
    expectNoViolations(v)
  })
})
