import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferArrowCallback,
  preferArrowCallbackRule,
} from '../../../../src/rules/best-practices/prefer-arrow-callback.js'

describe('prefer-arrow-callback rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzePreferArrowCallback', () => {
    it('should detect function expression used as callback', () => {
      const sourceFile = createSourceFile(\`
        [1, 2, 3].map(function(x) { return x * 2 });
      \`)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag arrow function in variable assignment', () => {
      const sourceFile = createSourceFile(\`
        const callback = (x) => x * 2;
        const result = callback(5);
      \`)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(preferArrowCallbackRule.meta.name).toBe('prefer-arrow-callback')
      expect(preferArrowCallbackRule.meta.category).toBe('style')
      expect(preferArrowCallbackRule.meta.recommended).toBe(false)
      expect(preferArrowCallbackRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(preferArrowCallbackRule.defaultOptions).toBeDefined()
      expect(preferArrowCallbackRule.defaultOptions.allowNamedFunctions).toBe(true)
    })

    it('should create visitor with visitNode method', () => {
      const result = preferArrowCallbackRule.create(
        preferArrowCallbackRule.defaultOptions,
      )
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })
})
