import { describe, test } from 'vitest'
import { noUnnecessaryClassRule } from '../../../src/rules/patterns/no-unnecessary-class.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-unnecessary-class', () => {
  test('flags empty class', () => {
    const code = 'class Foo {}'
    const v = runRule(noUnnecessaryClassRule, code)
    expectViolations(v, ['Unnecessary'])
  })

  test('does not flag class with superclass', () => {
    const code = 'class Foo extends Bar {}'
    const v = runRule(noUnnecessaryClassRule, code)
    expectNoViolations(v)
  })

  test('does not flag class with method', () => {
    const code = 'class Foo { bar() {} }'
    const v = runRule(noUnnecessaryClassRule, code)
    expectNoViolations(v)
  })

  test('does not flag class with property', () => {
    const code = 'class Foo { x = 1; }'
    const v = runRule(noUnnecessaryClassRule, code)
    expectNoViolations(v)
  })

  test('does not flag class with constructor', () => {
    const code = 'class Foo { constructor() {} }'
    const v = runRule(noUnnecessaryClassRule, code)
    expectNoViolations(v)
  })
})
