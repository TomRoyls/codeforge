import { describe, test, expect } from 'vitest'
import { noDupeKeysRule } from '../../../src/rules/patterns/no-dupe-keys.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-dupe-keys', () => {
  test('flags duplicate string keys', () => {
    const v = runRule(noDupeKeysRule, 'const obj = { a: 1, a: 2 };')
    expectViolations(v, ["Duplicate key 'a'"])
  })

  test('flags duplicate numeric keys', () => {
    const v = runRule(noDupeKeysRule, 'const obj = { 1: "a", 1: "b" };')
    expectViolations(v, ["Duplicate key '1'"])
  })

  test('does not flag unique keys', () => {
    const v = runRule(noDupeKeysRule, 'const obj = { a: 1, b: 2, c: 3 };')
    expectNoViolations(v)
  })

  test('does not flag computed keys', () => {
    const v = runRule(noDupeKeysRule, 'const key = "a"; const obj = { [key]: 1, [key]: 2 };')
    expectNoViolations(v)
  })

  test('flags duplicate mixed string/identifier keys', () => {
    const v = runRule(noDupeKeysRule, 'const obj = { a: 1, "a": 2 };')
    expectViolations(v, ["Duplicate key 'a'"])
  })

  test('flags multiple duplicates', () => {
    const v = runRule(noDupeKeysRule, 'const obj = { a: 1, a: 2, b: 1, b: 2 };')
    expect(v.length).toBeGreaterThanOrEqual(2)
  })

  test('does not flag nested object duplicates separately', () => {
    const v = runRule(noDupeKeysRule, 'const obj = { a: { x: 1 }, b: { x: 2 } };')
    expectNoViolations(v)
  })
})
