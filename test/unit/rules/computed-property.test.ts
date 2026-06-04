import { describe, test } from 'vitest'
import { noDupeKeysRule } from '../../../src/rules/patterns/no-dupe-keys.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('computed property name unwrapping', () => {
  test('does not flag computed properties as duplicates of static keys', () => {
    const v = runRule(noDupeKeysRule, 'const obj = { a: 1, ["a"]: 2 };')
    expectNoViolations(v)
  })

  test('does not flag different computed properties as duplicates', () => {
    const v = runRule(noDupeKeysRule, 'const obj = { ["a"]: 1, ["b"]: 2 };')
    expectNoViolations(v)
  })

  test('flags duplicate static keys', () => {
    const v = runRule(noDupeKeysRule, 'const obj = { a: 1, a: 2 };')
    expectViolations(v, ['Duplicate'])
  })

  test('computed property with Symbol.iterator', () => {
    const v = runRule(noDupeKeysRule, 'const obj = { [Symbol.iterator]() {} };')
    expectNoViolations(v)
  })

  test('class with computed property', () => {
    const code = `class X {
  [Symbol.iterator]() {}
}`
    const v = runRule(noDupeKeysRule, code)
    expectNoViolations(v)
  })
})
