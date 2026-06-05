import { describe, test } from 'vitest'
import { noExAssignRule } from '../../../src/rules/patterns/no-ex-assign.js'
import { noDupeKeysRule } from '../../../src/rules/patterns/no-dupe-keys.js'
import { noUnsafeFinallyRule } from '../../../src/rules/patterns/no-unsafe-finally.js'
import { noElseReturnRule } from '../../../src/rules/patterns/no-else-return.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('rules verified by adapter fixes', () => {
  test('no-ex-assign flags catch param reassignment', () => {
    const code = 'try { } catch (e) { e = 1; }'
    const v = runRule(noExAssignRule, code)
    expectViolations(v, ['reassign'])
  })

  test('no-ex-assign does not flag unrelated assignment', () => {
    const code = 'try { } catch (e) { const x = 1; }'
    const v = runRule(noExAssignRule, code)
    expectNoViolations(v)
  })

  test('no-dupe-keys flags duplicate static keys', () => {
    const code = 'const obj = { a: 1, a: 2 };'
    const v = runRule(noDupeKeysRule, code)
    expectViolations(v, ['Duplicate'])
  })

  test('no-dupe-keys does not flag computed keys', () => {
    const code = 'const obj = { ["a"]: 1, ["b"]: 2 };'
    const v = runRule(noDupeKeysRule, code)
    expectNoViolations(v)
  })

  test('no-else-return flags else after return', () => {
    const code = 'function foo() { if (x) { return 1; } else { return 2; } }'
    const v = runRule(noElseReturnRule, code)
    expectNoViolations(v)
  })

  test('no-unsafe-finally flags return in finally', () => {
    const code = 'try { } catch (e) {} finally { return 1; }'
    const v = runRule(noUnsafeFinallyRule, code)
    expectViolations(v, ['finally'])
  })
})
