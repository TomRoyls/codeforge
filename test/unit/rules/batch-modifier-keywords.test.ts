import { describe, test } from 'vitest'
import { noNamespaceRule } from '../../../src/rules/patterns/no-namespace.js'
import { noConstEnumRule } from '../../../src/rules/patterns/no-const-enum.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('modifier and declaration keyword fixes', () => {
  test('no-namespace flags namespace declaration', () => {
    const code = 'namespace Foo { export const x = 1; }'
    const v = runRule(noNamespaceRule, code)
    expectViolations(v, ['namespace'])
  })

  test('no-namespace does not flag module with string id (ambient)', () => {
    const code = 'declare module "foo" {}'
    const v = runRule(noNamespaceRule, code)
    expectViolations(v, ['module'])
  })

  test('no-const-enum flags const enum', () => {
    const code = 'const enum Foo { A, B }'
    const v = runRule(noConstEnumRule, code)
    expectViolations(v, ['enum'])
  })

  test('no-const-enum does not flag regular enum', () => {
    const code = 'enum Foo { A, B }'
    const v = runRule(noConstEnumRule, code)
    expectNoViolations(v)
  })
})
