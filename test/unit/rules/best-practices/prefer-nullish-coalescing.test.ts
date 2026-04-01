import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  preferNullishCoalescingRule,
  analyzePreferNullishCoalescing,
} from '../../../../src/rules/best-practices/prefer-nullish-coalescing.js'

describe('prefer-nullish-coalescing rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzePreferNullishCoalescing', () => {
    it('should detect || operator for default values', () => {
      const code = 'const x = a || b;'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferNullishCoalescing(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].ruleId).toBe('prefer-nullish-coalescing')
    })

    it('should not flag ?? operator', () => {
      const code = 'const x = a ?? b;'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferNullishCoalescing(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag && operator', () => {
      const code = 'const x = a && b;'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferNullishCoalescing(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle multiple || operators', () => {
      const code = 'const x = a || b || c;'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferNullishCoalescing(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should respect ignoreConditionalTests option', () => {
      const code = 'if (a || b) {}'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferNullishCoalescing(sourceFile, { ignoreConditionalTests: true })
      expect(violations).toHaveLength(0)
    })

    it('should flag || in condition when ignoreConditionalTests is false', () => {
      const code = 'if (a || b) {}'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferNullishCoalescing(sourceFile, { ignoreConditionalTests: false })
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(preferNullishCoalescingRule.meta.name).toBe('prefer-nullish-coalescing')
      expect(preferNullishCoalescingRule.meta.category).toBe('style')
      expect(preferNullishCoalescingRule.meta.recommended).toBe(false)
      expect(preferNullishCoalescingRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(preferNullishCoalescingRule.defaultOptions).toEqual({
        ignoreConditionalTests: true,
      })
    })

    it('should create visitor with visitNode method', () => {
      const result = preferNullishCoalescingRule.create(preferNullishCoalescingRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })
})
