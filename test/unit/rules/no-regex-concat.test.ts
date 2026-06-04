import { describe, test } from 'vitest'
import { noRegexConcatRule } from '../../../src/rules/security/no-regex-concat.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-regex-concat', () => {
  test('flags regex concatenation', () => {
    const v = runRule(noRegexConcatRule, 'const r = new RegExp("foo" + bar);')
    expectViolations(v, ['egex'])
  })

  test('does not flag static regex', () => {
    const v = runRule(noRegexConcatRule, 'const r = new RegExp("foo");')
    expectNoViolations(v)
  })

  test('does not flag regex literal', () => {
    const v = runRule(noRegexConcatRule, 'const r = /foo/;')
    expectNoViolations(v)
  })
})
