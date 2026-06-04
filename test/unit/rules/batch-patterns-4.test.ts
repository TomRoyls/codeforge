import { describe, test } from 'vitest'
import { noIteratorRule } from '../../../src/rules/patterns/no-iterator.js'
import { noRedeclareRule } from '../../../src/rules/patterns/no-redeclare.js'
import { noUndefinedRule } from '../../../src/rules/patterns/no-undefined.js'
import { preferConstRule } from '../../../src/rules/patterns/prefer-const.js'
import { noUnusedExpressionsRule } from '../../../src/rules/patterns/no-unused-expressions.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-iterator', () => {
  test('flags __iterator__', () => {
    const v = runRule(noIteratorRule, 'obj.__iterator__ = function() {};')
    expectViolations(v, ['iterator'])
  })

  test('does not flag regular property', () => {
    const v = runRule(noIteratorRule, 'obj.value = 1;')
    expectNoViolations(v)
  })
})

describe('no-redeclare', () => {
  test('flags var redeclaration', () => {
    const v = runRule(noRedeclareRule, 'var x = 1; var x = 2;')
    expectViolations(v, ['already'])
  })

  test('does not flag different variables', () => {
    const v = runRule(noRedeclareRule, 'var x = 1; var y = 2;')
    expectNoViolations(v)
  })
})

describe('no-undefined', () => {
  test('flags variable named undefined', () => {
    const v = runRule(noUndefinedRule, 'const undefined = 1;')
    expectViolations(v, ['undefined'])
  })

  test('does not flag regular variable', () => {
    const v = runRule(noUndefinedRule, 'const x = 1;')
    expectNoViolations(v)
  })
})

describe('prefer-const', () => {
  test('flags let that could be const', () => {
    const v = runRule(preferConstRule, 'let x = 1;')
    expectViolations(v, ['const'])
  })

  test('does not flag const', () => {
    const v = runRule(preferConstRule, 'const x = 1;')
    expectNoViolations(v)
  })
})

describe('no-unused-expressions', () => {
  test('flags standalone expression', () => {
    const v = runRule(noUnusedExpressionsRule, 'const a = 1, b = 2; a + b;')
    expectViolations(v, ['Unused'])
  })

  test('does not flag assignment', () => {
    const v = runRule(noUnusedExpressionsRule, 'x = 1;')
    expectNoViolations(v)
  })

  test('does not flag function call', () => {
    const v = runRule(noUnusedExpressionsRule, 'foo();')
    expectNoViolations(v)
  })
})
