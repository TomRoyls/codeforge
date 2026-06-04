import { describe, test } from 'vitest'
import { noIteratorRule } from '../../../src/rules/patterns/no-iterator.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-iterator', () => {
  test('flags __iterator__ assignment', () => {
    const v = runRule(noIteratorRule, 'obj.__iterator__ = function() {};')
    expectViolations(v, ['__iterator__'])
  })

  test('flags __iterator__ in member expression', () => {
    const v = runRule(noIteratorRule, 'const x = obj.__iterator__;')
    expectViolations(v, ['__iterator__'])
  })

  test('does not flag normal property', () => {
    const v = runRule(noIteratorRule, 'const x = obj.prop;')
    expectNoViolations(v)
  })

  test('does not flag iterator() method', () => {
    const v = runRule(noIteratorRule, 'const x = obj.iterator();')
    expectNoViolations(v)
  })
})
