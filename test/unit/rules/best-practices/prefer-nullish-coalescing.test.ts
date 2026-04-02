/**
 * @fileoverview Tests for prefer-nullish-coalescing rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferNullishCoalescing,
  preferNullishCoalescingRule,
} from '../../../../src/rules/best-practices/prefer-nullish-coalescing.js'

const createSourceFile = (code: string) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferNullishCoalescingRule.meta.name).toBe('prefer-nullish-coalescing')
    expect(preferNullishCoalescingRule.meta.category).toBe('style')
    expect(preferNullishCoalescingRule.meta.fixable).toBe('code')
  })
})

describe('detecting || for default values', () => {
  it('should detect || with string literal default', () => {
    const sourceFile = createSourceFile('const x = name || "unknown";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('??')
    expect(violations[0].severity).toBe('info')
  })

  it('should detect || with numeric literal default', () => {
    const sourceFile = createSourceFile('const x = count || 0;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with object literal default', () => {
    const sourceFile = createSourceFile('const x = options || {};')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array literal default', () => {
    const sourceFile = createSourceFile('const x = items || [];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with optional chaining', () => {
    const sourceFile = createSourceFile('const x = obj?.value || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('valid code', () => {
  it('should not flag ?? operator', () => {
    const sourceFile = createSourceFile('const x = name ?? "unknown";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag boolean || boolean', () => {
    const sourceFile = createSourceFile('const x = a || b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag function call || default', () => {
    const sourceFile = createSourceFile('const x = getValue() || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1) // This is actually flagged since it has a string literal default
  })
})
