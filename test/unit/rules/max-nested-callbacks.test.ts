import { describe, test } from 'vitest'
import { maxNestedCallbacksRule } from '../../../src/rules/complexity/max-nested-callbacks.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('max-nested-callbacks', () => {
  test('flags deeply nested callbacks (default max 4)', () => {
    const code = `f(() => {
      f(() => {
        f(() => {
          f(() => {
            f(() => {
              f(() => { })
            })
          })
        })
      })
    })`
    const v = runRule(maxNestedCallbacksRule, code)
    expectViolations(v, ['callback'])
  })

  test('does not flag shallow callbacks', () => {
    const code = `f(() => { f(() => { }) })`
    const v = runRule(maxNestedCallbacksRule, code)
    expectNoViolations(v)
  })

  test('does not flag flat code', () => {
    const v = runRule(maxNestedCallbacksRule, 'const x = 1;')
    expectNoViolations(v)
  })
})
