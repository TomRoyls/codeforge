import { describe, test } from 'vitest'
import { noDynamicDeleteRule } from '../../../src/rules/security/no-dynamic-delete.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-dynamic-delete', () => {
  test('flags delete with dynamic key', () => {
    const v = runRule(noDynamicDeleteRule, 'delete obj[key];')
    expectViolations(v, ['delete'])
  })

  test('does not flag delete with static key', () => {
    const v = runRule(noDynamicDeleteRule, 'delete obj.prop;')
    expectNoViolations(v)
  })

  test('does not flag delete variable', () => {
    const v = runRule(noDynamicDeleteRule, 'delete x;')
    expectNoViolations(v)
  })
})
