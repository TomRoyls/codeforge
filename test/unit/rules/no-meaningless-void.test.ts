import { describe, test } from 'vitest'
import { noMeaninglessVoidRule } from '../../../src/rules/patterns/no-meaningless-void.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-meaningless-void', () => {
  test('flags void in variable declaration', () => {
    const v = runRule(noMeaninglessVoidRule, 'const x = void 0;')
    expectViolations(v, ['void'])
  })

  test('does not flag standalone void expression', () => {
    const v = runRule(noMeaninglessVoidRule, 'void 0;')
    expectNoViolations(v)
  })
})
