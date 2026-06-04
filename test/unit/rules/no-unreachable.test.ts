import { describe, test, expect } from 'vitest'
import { noUnreachableRule } from '../../../src/rules/patterns/no-unreachable.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-unreachable', () => {
  test('flags code after return', () => {
    const v = runRule(noUnreachableRule, 'function f() { return 1; console.log("x"); }')
    expectViolations(v, ['Unreachable code'])
  })

  test('flags code after throw', () => {
    const v = runRule(noUnreachableRule, 'function f() { throw new Error(); console.log("x"); }')
    expectViolations(v, ['Unreachable code'])
  })

  test('does not flag code before return', () => {
    const v = runRule(noUnreachableRule, 'function f() { console.log("x"); return 1; }')
    expectNoViolations(v)
  })

  test('does not flag single return', () => {
    const v = runRule(noUnreachableRule, 'function f() { return 1; }')
    expectNoViolations(v)
  })

  test('does not flag empty function', () => {
    const v = runRule(noUnreachableRule, 'function f() { }')
    expectNoViolations(v)
  })

  test('flags code after break', () => {
    const v = runRule(noUnreachableRule, 'while (true) { break; console.log("x"); }')
    expectViolations(v, ['Unreachable code'])
  })

  test('flags code after continue', () => {
    const v = runRule(noUnreachableRule, 'while (true) { continue; console.log("x"); }')
    expectViolations(v, ['Unreachable code'])
  })
})
