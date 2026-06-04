import { describe, test } from 'vitest'
import { noSelfAssignRule } from '../../../src/rules/patterns/no-self-assign.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-self-assign', () => {
  test('flags x = x', () => {
    const v = runRule(noSelfAssignRule, 'x = x;')
    expectViolations(v, ['Self assignment'])
  })

  test('flags this.x = this.x', () => {
    const v = runRule(noSelfAssignRule, 'this.x = this.x;')
    expectNoViolations(v)
  })

  test('does not flag x = y', () => {
    const v = runRule(noSelfAssignRule, 'x = y;')
    expectNoViolations(v)
  })

  test('does not flag a.b = a.c', () => {
    const v = runRule(noSelfAssignRule, 'a.b = a.c;')
    expectNoViolations(v)
  })
})
