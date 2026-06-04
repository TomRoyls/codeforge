import { describe, test } from 'vitest'
import { noReturnAwaitRule } from '../../../src/rules/patterns/no-return-await.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-return-await', () => {
  test('flags return await in async function', () => {
    const v = runRule(noReturnAwaitRule, 'async function f() { return await fetch("/"); }')
    expectViolations(v, ['return await'])
  })

  test('flags return await in arrow function', () => {
    const v = runRule(noReturnAwaitRule, 'const f = async () => { return await fetch("/"); }')
    expectViolations(v, ['return await'])
  })

  test('does not flag await without return', () => {
    const v = runRule(noReturnAwaitRule, 'async function f() { await fetch("/"); }')
    expectNoViolations(v)
  })

  test('does not flag return without await', () => {
    const v = runRule(noReturnAwaitRule, 'async function f() { return 42; }')
    expectNoViolations(v)
  })

  test('does not flag non-async function', () => {
    const v = runRule(noReturnAwaitRule, 'function f() { return 42; }')
    expectNoViolations(v)
  })
})
