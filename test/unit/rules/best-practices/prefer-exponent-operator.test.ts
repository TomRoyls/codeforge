/**
 * @fileoverview Tests for prefer-exponent-operator rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferExponentOperator,
  preferExponentOperatorRule,
} from '../../../../src/rules/best-practices/prefer-exponent-operator.js'

const createSourceFile = (code: string) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferExponentOperatorRule.meta.name).toBe('prefer-exponent-operator')
    expect(preferExponentOperatorRule.meta.category).toBe('style')
    expect(preferExponentOperatorRule.meta.fixable).toBe('code')
  })
})

describe('detecting Math.pow calls', () => {
  it('should detect Math.pow with integer exponents', () => {
    const sourceFile = createSourceFile('const x = Math.pow(2, 3);')
    const violations = analyzePreferExponentOperator(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Math.pow')
    expect(violations[0].severity).toBe('info')
  })

  it('should detect Math.pow with variable arguments', () => {
    const sourceFile = createSourceFile('const x = Math.pow(base, exp);')
    const violations = analyzePreferExponentOperator(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect Math.pow with negative exponents', () => {
    const sourceFile = createSourceFile('const x = Math.pow(2, -3);')
    const violations = analyzePreferExponentOperator(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('ignoring non-integer exponents', () => {
  it('should not flag non-integer exponents when option is enabled', () => {
    const sourceFile = createSourceFile('const x = Math.pow(2, 1.5);')
    const violations = analyzePreferExponentOperator(sourceFile, { ignoreNonIntegerExponent: true })
    expect(violations).toHaveLength(0)
  })

  it('should flag integer exponents when option is enabled', () => {
    const sourceFile = createSourceFile('const x = Math.pow(2, 3);')
    const violations = analyzePreferExponentOperator(sourceFile, { ignoreNonIntegerExponent: true })
    expect(violations).toHaveLength(1)
  })
})

describe('valid code', () => {
  it('should not flag code without Math.pow', () => {
    const sourceFile = createSourceFile('const x = 2 ** 3;')
    const violations = analyzePreferExponentOperator(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag other Math methods', () => {
    const sourceFile = createSourceFile('const x = Math.sqrt(16);')
    const violations = analyzePreferExponentOperator(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag custom pow function', () => {
    const sourceFile = createSourceFile('const x = pow(2, 3);')
    const violations = analyzePreferExponentOperator(sourceFile)
    expect(violations).toHaveLength(0)
  })
})
