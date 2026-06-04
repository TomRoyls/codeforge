import { describe, test } from 'vitest'
import { noFallthroughRule } from '../../../src/rules/patterns/no-fallthrough.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-fallthrough', () => {
  test('flags fallthrough without break', () => {
    const v = runRule(noFallthroughRule, 'switch (x) { case 1: doA(); case 2: doB(); break; }')
    expectViolations(v, ['fallthrough'])
  })

  test('does not flag with break', () => {
    const v = runRule(noFallthroughRule, 'switch (x) { case 1: doA(); break; case 2: doB(); break; }')
    expectNoViolations(v)
  })

  test('does not flag with return', () => {
    const v = runRule(noFallthroughRule, 'function f(x) { switch (x) { case 1: return 1; case 2: return 2; } }')
    expectNoViolations(v)
  })

  test('does not flag empty case (intentional fallthrough)', () => {
    const v = runRule(noFallthroughRule, 'switch (x) { case 1: case 2: doB(); break; }')
    expectNoViolations(v)
  })

  test('does not flag with throw', () => {
    const v = runRule(noFallthroughRule, 'switch (x) { case 1: throw new Error(); case 2: break; }')
    expectNoViolations(v)
  })

  test('does not flag last case', () => {
    const v = runRule(noFallthroughRule, 'switch (x) { case 1: doA(); }')
    expectNoViolations(v)
  })
})
