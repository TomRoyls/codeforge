import { describe, test } from 'vitest'
import { noEvalRule } from '../../../src/rules/patterns/no-eval.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-eval', () => {
  test('flags direct eval call', () => {
    const v = runRule(noEvalRule, 'eval("1 + 1");')
    expectViolations(v, ['eval'])
  })

  test('flags indirect eval via window', () => {
    const v = runRule(noEvalRule, 'window.eval("1 + 1");')
    expectViolations(v, ['eval'])
  })

  test('flags indirect eval via globalThis', () => {
    const v = runRule(noEvalRule, 'globalThis.eval("1 + 1");')
    expectViolations(v, ['eval'])
  })

  test('does not flag eval used as property name', () => {
    const v = runRule(noEvalRule, 'const x = obj.eval;')
    expectNoViolations(v)
  })

  test('does not flag eval-like method call on object', () => {
    const v = runRule(noEvalRule, 'obj.notEval("safe");')
    expectNoViolations(v)
  })
})
