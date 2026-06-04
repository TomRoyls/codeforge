import { describe, test } from 'vitest'
import { preferObjectSpreadRule } from '../../../src/rules/performance/prefer-object-spread.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('prefer-object-spread', () => {
  test('does not crash on Object.assign with {} target', () => {
    const v = runRule(preferObjectSpreadRule, 'const x = Object.assign({}, obj);')
    expect(v).toBeDefined()
  })

  test('does not flag Object.assign to existing object', () => {
    const v = runRule(preferObjectSpreadRule, 'Object.assign(target, obj);')
    expectNoViolations(v)
  })

  test('does not flag spread syntax', () => {
    const v = runRule(preferObjectSpreadRule, 'const x = { ...obj };')
    expectNoViolations(v)
  })
})
