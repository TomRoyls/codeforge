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
    it('should detect || operator', () => {
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

    it('should detect || in default assignment', () => {
      const code = 'const value = input || "default";'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferNullishCoalescing(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta', () => {
      expect(preferNullishCoalescingRule.meta.name).toBe('prefer-nullish-coalescing')
      expect(preferNullishCoalescingRule.meta.category).toBe('style')
    })

    it('should have default options', () => {
      expect(preferNullishCoalescingRule.defaultOptions).toEqual({
        ignoreConditionalTests: true,
      })
    })

    it('should create visitor', () => {
      const result = preferNullishCoalescingRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })
})
