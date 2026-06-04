import { describe, test, expect } from 'vitest'
import { noConstantConditionRule } from '../../../src/rules/patterns/no-constant-condition.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-constant-condition', () => {
  test('flags if(true)', () => {
    const v = runRule(noConstantConditionRule, 'if (true) { console.log("x"); }')
    expectViolations(v, ['always true'])
  })

  test('flags if(false)', () => {
    const v = runRule(noConstantConditionRule, 'if (false) { console.log("x"); }')
    expectViolations(v, ['always false'])
  })

  test('flags if(null)', () => {
    const v = runRule(noConstantConditionRule, 'if (null) { console.log("x"); }')
    expectViolations(v, ['always falsy'])
  })

  test('flags if(1)', () => {
    const v = runRule(noConstantConditionRule, 'if (1) { console.log("x"); }')
    expectViolations(v, ['always truthy'])
  })

  test('flags if(0)', () => {
    const v = runRule(noConstantConditionRule, 'if (0) { console.log("x"); }')
    expectViolations(v, ['always falsy'])
  })

  test('flags if("")', () => {
    const v = runRule(noConstantConditionRule, 'if ("") { console.log("x"); }')
    expectViolations(v, ['always falsy'])
  })

  test('flags if("hello")', () => {
    const v = runRule(noConstantConditionRule, 'if ("hello") { console.log("x"); }')
    expectViolations(v, ['always truthy'])
  })

  test('flags if(/regex/)', () => {
    const v = runRule(noConstantConditionRule, 'if (/abc/) { console.log("x"); }')
    expectViolations(v, ['always truthy'])
  })

  test('flags while(true)', () => {
    const v = runRule(noConstantConditionRule, 'while (true) { break; }')
    expectViolations(v, ['always true'])
  })

  test('flags do-while(false)', () => {
    const v = runRule(noConstantConditionRule, 'do { } while (false);')
    expectViolations(v, ['always false'])
  })

  test('flags for(;true;)', () => {
    const v = runRule(noConstantConditionRule, 'for (;true;) { break; }')
    expectViolations(v, ['always true'])
  })

  test('flags ternary with constant test: true ? 1 : 2', () => {
    const v = runRule(noConstantConditionRule, 'const x = true ? 1 : 2;')
    expectViolations(v, ['always true'])
  })

  test('flags ternary with constant test: false ? 1 : 2', () => {
    const v = runRule(noConstantConditionRule, 'const x = false ? 1 : 2;')
    expectViolations(v, ['always false'])
  })

  test('does not flag if(x)', () => {
    const v = runRule(noConstantConditionRule, 'const x = 1; if (x) { console.log("x"); }')
    expectNoViolations(v)
  })

  test('does not flag if(x === 1)', () => {
    const v = runRule(noConstantConditionRule, 'if (x === 1) { console.log("x"); }')
    expectNoViolations(v)
  })

  test('does not flag if(fn())', () => {
    const v = runRule(noConstantConditionRule, 'if (Math.random() > 0.5) { console.log("x"); }')
    expectNoViolations(v)
  })

  test('does not flag ternary with variable test', () => {
    const v = runRule(noConstantConditionRule, 'const x = condition ? 1 : 2;')
    expectNoViolations(v)
  })
})
