import { describe, expect, it } from 'vitest'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper'
import preferFunctionType from '../../../src/rules/patterns/prefer-function-type'
import noConstEnum from '../../../src/rules/patterns/no-const-enum'
import noMixedEnums from '../../../src/rules/patterns/no-mixed-enums'

describe('prefer-function-type', () => {
  it('flags interface with only call signature', () => {
    const code = 'interface Foo { (x: number): string }'
    const violations = runRule(preferFunctionType, code)
    expectViolations(violations, ['function type'])
  })

  it('does not flag interface with properties', () => {
    const code = 'interface Foo { x: number; y: string }'
    const violations = runRule(preferFunctionType, code)
    expectNoViolations(violations)
  })

  it('does not flag interface with methods', () => {
    const code = 'interface Foo { bar(): void }'
    const violations = runRule(preferFunctionType, code)
    expectNoViolations(violations)
  })
})

describe('no-const-enum', () => {
  it('flags const enum', () => {
    const code = 'const enum Color { Red, Green, Blue }'
    const violations = runRule(noConstEnum, code)
    expectViolations(violations, ['const enum'])
  })

  it('does not flag regular enum', () => {
    const code = 'enum Color { Red, Green, Blue }'
    const violations = runRule(noConstEnum, code)
    expectNoViolations(violations)
  })
})

describe('no-mixed-enums', () => {
  it('flags mixed implicit/explicit enum', () => {
    const code = 'enum Mixed { A = 1, B, C = 3 }'
    const violations = runRule(noMixedEnums, code)
    expect(violations.length).toBeGreaterThan(0)
  })

  it('does not flag all-explicit enum', () => {
    const code = 'enum All { A = 1, B = 2, C = 3 }'
    const violations = runRule(noMixedEnums, code)
    expectNoViolations(violations)
  })

  it('does not flag all-implicit enum', () => {
    const code = 'enum All { A, B, C }'
    const violations = runRule(noMixedEnums, code)
    expectNoViolations(violations)
  })
})
