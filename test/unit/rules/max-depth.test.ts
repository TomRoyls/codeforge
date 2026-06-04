import { describe, test } from 'vitest'
import { maxDepthRule } from '../../../src/rules/complexity/max-depth.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('max-depth', () => {
  test('flags deeply nested blocks (default max 4)', () => {
    const code = `function f() {
      if (a) {
        if (b) {
          if (c) {
            if (d) {
              if (e) { }
            }
          }
        }
      }
    }`
    const v = runRule(maxDepthRule, code)
    expectViolations(v, ['depth'])
  })

  test('does not flag shallow nesting', () => {
    const code = `function f() {
      if (a) { if (b) { if (c) { } } }
    }`
    const v = runRule(maxDepthRule, code)
    expectNoViolations(v)
  })

  test('does not flag flat code', () => {
    const v = runRule(maxDepthRule, 'function f() { const x = 1; }')
    expectNoViolations(v)
  })
})
