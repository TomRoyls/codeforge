import { describe, test } from 'vitest'
import { noNewSymbolRule } from '../../../src/rules/patterns/no-new-symbol.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-new-symbol', () => {
  test('flags new Symbol()', () => {
    const v = runRule(noNewSymbolRule, 'const s = new Symbol("foo");')
    expectViolations(v, ['Symbol'])
  })

  test('does not flag Symbol() without new', () => {
    const v = runRule(noNewSymbolRule, 'const s = Symbol("foo");')
    expectNoViolations(v)
  })

  test('does not flag new MyClass()', () => {
    const v = runRule(noNewSymbolRule, 'const x = new MyClass();')
    expectNoViolations(v)
  })
})
