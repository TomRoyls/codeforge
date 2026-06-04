import { describe, test, expect } from 'vitest'
import { noDuplicateCaseRule } from '../../../src/rules/patterns/no-duplicate-case.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-duplicate-case', () => {
  test('flags duplicate string cases', () => {
    const v = runRule(noDuplicateCaseRule, 'switch (x) { case "a": break; case "a": break; }')
    expectViolations(v, ['Duplicate case'])
  })

  test('flags duplicate numeric cases', () => {
    const v = runRule(noDuplicateCaseRule, 'switch (x) { case 1: break; case 1: break; }')
    expectViolations(v, ['Duplicate case'])
  })

  test('does not flag unique cases', () => {
    const v = runRule(noDuplicateCaseRule, 'switch (x) { case 1: break; case 2: break; case 3: break; }')
    expectNoViolations(v)
  })

  test('does not flag default case', () => {
    const v = runRule(noDuplicateCaseRule, 'switch (x) { case 1: break; default: break; }')
    expectNoViolations(v)
  })

  test('does not flag empty switch', () => {
    const v = runRule(noDuplicateCaseRule, 'switch (x) { }')
    expectNoViolations(v)
  })
})
