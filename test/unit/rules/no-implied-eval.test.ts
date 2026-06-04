import { describe, test } from 'vitest'
import { noImpliedEvalRule } from '../../../src/rules/patterns/no-implied-eval.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-implied-eval', () => {
  test('flags setTimeout with string', () => {
    const v = runRule(noImpliedEvalRule, 'setTimeout("doStuff()", 100);')
    expectViolations(v, ['Implied eval'])
  })

  test('flags setInterval with string', () => {
    const v = runRule(noImpliedEvalRule, 'setInterval("doStuff()", 100);')
    expectViolations(v, ['Implied eval'])
  })

  test('does not flag setTimeout with function', () => {
    const v = runRule(noImpliedEvalRule, 'setTimeout(() => doStuff(), 100);')
    expectNoViolations(v)
  })

  test('does not flag setTimeout with function reference', () => {
    const v = runRule(noImpliedEvalRule, 'setTimeout(doStuff, 100);')
    expectNoViolations(v)
  })

  test('does not flag normal function call', () => {
    const v = runRule(noImpliedEvalRule, 'console.log("hello");')
    expectNoViolations(v)
  })
})
