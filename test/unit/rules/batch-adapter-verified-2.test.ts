import { describe, test } from 'vitest'
import { getterReturnRule } from '../../../src/rules/patterns/getter-return.js'
import { noCaseDeclarationsRule } from '../../../src/rules/patterns/no-case-declarations.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('more rules verified by adapter fixes', () => {
  test('getter-return flags getter without return', () => {
    const code = 'class Foo { get bar() {} }'
    const v = runRule(getterReturnRule, code)
    expectViolations(v, ['return'])
  })

  test('getter-return does not flag getter with return', () => {
    const code = 'class Foo { get bar() { return 1; } }'
    const v = runRule(getterReturnRule, code)
    expectNoViolations(v)
  })

  test('no-case-declarations flags lexical declaration in case', () => {
    const code = 'switch (x) { case 1: let y = 2; break; }'
    const v = runRule(noCaseDeclarationsRule, code)
    expectViolations(v, ['lexical'])
  })

  test('no-case-declarations does not flag block-scoped declaration', () => {
    const code = 'switch (x) { case 1: { let y = 2; break; } }'
    const v = runRule(noCaseDeclarationsRule, code)
    expectNoViolations(v)
  })
})
