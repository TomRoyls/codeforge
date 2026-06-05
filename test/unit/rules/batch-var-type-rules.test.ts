import { describe, test } from 'vitest'
import { noVarRule } from '../../../src/rules/patterns/no-var.js'
import { noCaseDeclarationsRule } from '../../../src/rules/patterns/no-case-declarations.js'
import { noUnsafeTypeAssertionRule } from '../../../src/rules/security/no-unsafe-type-assertion.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('variable kind and type assertion rules', () => {
  test('no-var flags var declarations', () => {
    const code = 'var x = 1'
    const v = runRule(noVarRule, code)
    expectViolations(v, ['var'])
  })

  test('no-var does not flag let/const', () => {
    const code = 'let x = 1; const y = 2'
    const v = runRule(noVarRule, code)
    expectNoViolations(v)
  })

  test('no-case-declarations flags let in switch', () => {
    const code = 'switch (x) { case 1: let y = 2; break; }'
    const v = runRule(noCaseDeclarationsRule, code)
    expectViolations(v, ['case'])
  })

  test('no-case-declarations does not flag const in switch with block', () => {
    const code = 'switch (x) { case 1: { const y = 2; break; } }'
    const v = runRule(noCaseDeclarationsRule, code)
    expectNoViolations(v)
  })

  test('no-unsafe-type-assertion flags type assertion', () => {
    const code = 'const x = {} as any'
    const v = runRule(noUnsafeTypeAssertionRule, code)
    expect(v).toBeDefined()
  })
})
