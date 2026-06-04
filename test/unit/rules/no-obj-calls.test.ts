import { describe, test } from 'vitest'
import { noObjCallsRule } from '../../../src/rules/patterns/no-obj-calls.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-obj-calls', () => {
  test('flags calling Math()', () => {
    const v = runRule(noObjCallsRule, 'Math();')
    expectViolations(v, ['Math'])
  })

  test('flags calling JSON()', () => {
    const v = runRule(noObjCallsRule, 'JSON();')
    expectViolations(v, ['JSON'])
  })

  test('flags calling Reflect()', () => {
    const v = runRule(noObjCallsRule, 'Reflect();')
    expectViolations(v, ['Reflect'])
  })

  test('does not flag Math.max()', () => {
    const v = runRule(noObjCallsRule, 'Math.max(1, 2);')
    expectNoViolations(v)
  })

  test('does not flag JSON.parse()', () => {
    const v = runRule(noObjCallsRule, 'JSON.parse("{}");')
    expectNoViolations(v)
  })

  test('does not flag regular function call', () => {
    const v = runRule(noObjCallsRule, 'myFunc();')
    expectNoViolations(v)
  })
})
