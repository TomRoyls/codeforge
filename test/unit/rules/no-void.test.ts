import { describe, test } from 'vitest'
import { noVoidRule } from '../../../src/rules/patterns/no-void.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-void', () => {
  test('flags void 0', () => {
    const v = runRule(noVoidRule, 'const x = void 0;')
    expectViolations(v, ['void'])
  })

  test('flags void expression', () => {
    const v = runRule(noVoidRule, 'void someFunction();')
    expectViolations(v, ['void'])
  })

  test('does not flag regular code', () => {
    const v = runRule(noVoidRule, 'const x = 0;')
    expectNoViolations(v)
  })
})
