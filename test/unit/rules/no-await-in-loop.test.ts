import { describe, test } from 'vitest'
import { noAwaitInLoopRule } from '../../../src/rules/performance/no-await-in-loop.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-await-in-loop', () => {
  test('flags await in for loop', () => {
    const v = runRule(noAwaitInLoopRule, 'async function f() { for (let i = 0; i < 10; i++) { await fetch("/"); } }')
    expectViolations(v, ['Await'])
  })

  test('flags await in for-of loop', () => {
    const v = runRule(noAwaitInLoopRule, 'async function f() { for (const x of arr) { await fetch(x); } }')
    expectViolations(v, ['Await'])
  })

  test('does not flag await outside loop', () => {
    const v = runRule(noAwaitInLoopRule, 'async function f() { await fetch("/"); }')
    expectNoViolations(v)
  })

  test('does not flag non-async function', () => {
    const v = runRule(noAwaitInLoopRule, 'function f() { for (let i = 0; i < 10; i++) { console.log(i); } }')
    expectNoViolations(v)
  })
})
