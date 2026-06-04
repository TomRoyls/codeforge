import { describe, test } from 'vitest'
import { noUnnecessaryTypeAssertionRule } from '../../../src/rules/best-practices/no-unnecessary-type-assertion.js'
import { noUnnecessaryConditionRule } from '../../../src/rules/best-practices/no-unnecessary-condition.js'
import { preferConstAssertionsRule } from '../../../src/rules/best-practices/prefer-const-assertions.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-unnecessary-type-assertion', () => {
  test('does not flag valid type assertion', () => {
    const v = runRule(noUnnecessaryTypeAssertionRule, 'const x = value as string;')
    expectNoViolations(v)
  })

  test('does not flag regular code', () => {
    const v = runRule(noUnnecessaryTypeAssertionRule, 'const x = 1;')
    expectNoViolations(v)
  })
})

describe('no-unnecessary-condition', () => {
  test('flags always-true comparison', () => {
    const v = runRule(noUnnecessaryConditionRule, 'if ("hello" === "hello") {}')
    expectViolations(v, ['always'])
  })

  test('does not flag condition on variable', () => {
    const v = runRule(noUnnecessaryConditionRule, 'if (x) {}')
    expectNoViolations(v)
  })
})

describe('prefer-const-assertions', () => {
  test('does not flag regular code', () => {
    const v = runRule(preferConstAssertionsRule, 'const x = 1;')
    expectNoViolations(v)
  })
})
