import { describe, test } from 'vitest'
import { noDynamicDeleteRule } from '../../../src/rules/security/no-dynamic-delete.js'
import { noRegexConcatRule } from '../../../src/rules/security/no-regex-concat.js'
import { noUnsafeRegexRule } from '../../../src/rules/security/no-unsafe-regex.js'
import { noWeakCryptoRule } from '../../../src/rules/security/no-weak-crypto.js'
import { noRestrictedGlobalsRule } from '../../../src/rules/security/no-restricted-globals.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-dynamic-delete', () => {
  test('flags delete with dynamic key', () => {
    const v = runRule(noDynamicDeleteRule, 'delete obj[key];')
    expectViolations(v, ['delete'])
  })

  test('does not flag delete with static key', () => {
    const v = runRule(noDynamicDeleteRule, 'delete obj.prop;')
    expectNoViolations(v)
  })
})

describe('no-unsafe-regex', () => {
  test('flags regex with nested quantifiers (ReDoS)', () => {
    const v = runRule(noUnsafeRegexRule, 'const r = /(a+)+/;')
    expectViolations(v, ['regex'])
  })

  test('does not flag safe regex', () => {
    const v = runRule(noUnsafeRegexRule, 'const r = /hello/;')
    expectNoViolations(v)
  })
})

describe('no-weak-crypto', () => {
  test('flags md5 usage', () => {
    const v = runRule(noWeakCryptoRule, 'crypto.createHash("md5");')
    expectViolations(v, ['md5'])
  })

  test('does not flag sha256', () => {
    const v = runRule(noWeakCryptoRule, 'crypto.createHash("sha256");')
    expectNoViolations(v)
  })
})

describe('no-restricted-globals', () => {
  test('does not flag regular globals', () => {
    const v = runRule(noRestrictedGlobalsRule, 'const x = 1;')
    expectNoViolations(v)
  })
})
