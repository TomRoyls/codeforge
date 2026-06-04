import { describe, test } from 'vitest'
import { preferConstRule } from '../../../src/rules/patterns/prefer-const.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('VariableStatement flattening (declarations array)', () => {
  test('prefer-const flags let that is never reassigned', () => {
    const v = runRule(preferConstRule, 'let x = 1; console.log(x);')
    expectViolations(v, ['const'])
  })

  test('prefer-const does not flag let that is reassigned', () => {
    const v = runRule(preferConstRule, 'let x = 1; x = 2; console.log(x);')
    expectNoViolations(v)
  })

  test('prefer-const handles multiple declarations', () => {
    const code = 'let x = 1, y = 2; console.log(x, y);'
    const v = runRule(preferConstRule, code)
    expectViolations(v, ['const'])
  })

  test('prefer-const handles const correctly', () => {
    const v = runRule(preferConstRule, 'const x = 1; console.log(x);')
    expectNoViolations(v)
  })

  test('prefer-const handles var', () => {
    const v = runRule(preferConstRule, 'var x = 1; console.log(x);')
    expectViolations(v, ['const'])
  })
})
