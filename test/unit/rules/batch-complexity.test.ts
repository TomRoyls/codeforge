import { describe, test } from 'vitest'
import { maxParamsRule } from '../../../src/rules/complexity/max-params.js'
import { maxLinesRule } from '../../../src/rules/complexity/max-lines.js'
import { maxNestedCallbacksRule } from '../../../src/rules/complexity/max-nested-callbacks.js'
import { maxDepthRule } from '../../../src/rules/complexity/max-depth.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('max-params', () => {
  test('flags too many params', () => {
    const v = runRule(maxParamsRule, 'function f(a, b, c, d, e) {}')
    expectViolations(v, ['param'])
  })

  test('does not flag few params', () => {
    const v = runRule(maxParamsRule, 'function f(a, b) {}')
    expectNoViolations(v)
  })

  test('does not flag zero params', () => {
    const v = runRule(maxParamsRule, 'function f() {}')
    expectNoViolations(v)
  })
})

describe('max-nested-callbacks', () => {
  test('flags deep nesting (>4 levels)', () => {
    const code = `setTimeout(() => {
      setTimeout(() => {
        setTimeout(() => {
          setTimeout(() => {
            setTimeout(() => {
              setTimeout(() => {
                x();
              });
            });
          });
        });
      });
    });`
    const v = runRule(maxNestedCallbacksRule, code)
    expectViolations(v, ['callback'])
  })

  test('does not flag shallow nesting', () => {
    const v = runRule(maxNestedCallbacksRule, 'setTimeout(() => { x(); });')
    expectNoViolations(v)
  })
})

describe('max-depth', () => {
  test('flags deep nesting (>4 levels)', () => {
    const code = `function f() {
      if (a) {
        if (b) {
          if (c) {
            if (d) {
              if (e) {
                x();
              }
            }
          }
        }
      }
    }`
    const v = runRule(maxDepthRule, code)
    expectViolations(v, ['depth'])
  })

  test('does not flag shallow code', () => {
    const v = runRule(maxDepthRule, 'function f() { if (a) { x(); } }')
    expectNoViolations(v)
  })
})
