import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  explicitReturnTypeRule,
  analyzeExplicitReturnType,
} from '../../../../src/rules/best-practices/explicit-return-type.js'

describe('explicit-return-type rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzeExplicitReturnType', () => {
    it('should flag arrow function without return type', () => {
      const code = 'const fn = () => 42;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeExplicitReturnType(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].ruleId).toBe('explicit-return-type')
    })

    it('should not flag arrow function with return type', () => {
      const code = 'const fn = (): number => 42;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeExplicitReturnType(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag function declaration without return type', () => {
      const code = 'function fn() { return 42; }'
      const sourceFile = createSourceFile(code)
      const violations = analyzeExplicitReturnType(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag function declaration with return type', () => {
      const code = 'function fn(): number { return 42; }'
      const sourceFile = createSourceFile(code)
      const violations = analyzeExplicitReturnType(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag method declaration without return type', () => {
      const code = 'class Foo { method() { return 42; } }'
      const sourceFile = createSourceFile(code)
      const violations = analyzeExplicitReturnType(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag method declaration with return type', () => {
      const code = 'class Foo { method(): number { return 42; } }'
      const sourceFile = createSourceFile(code)
      const violations = analyzeExplicitReturnType(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should respect checkArrowFunctions: false option', () => {
      const code = 'const fn = () => 42;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeExplicitReturnType(sourceFile, { checkArrowFunctions: false })
      expect(violations).toHaveLength(0)
    })

    it('should respect checkFunctionDeclarations: false option', () => {
      const code = 'function fn() { return 42; }'
      const sourceFile = createSourceFile(code)
      const violations = analyzeExplicitReturnType(sourceFile, { checkFunctionDeclarations: false })
      expect(violations).toHaveLength(0)
    })

    it('should respect checkMethodDeclarations: false option', () => {
      const code = 'class Foo { method() { return 42; } }'
      const sourceFile = createSourceFile(code)
      const violations = analyzeExplicitReturnType(sourceFile, { checkMethodDeclarations: false })
      expect(violations).toHaveLength(0)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(explicitReturnTypeRule.meta.name).toBe('explicit-return-type')
      expect(explicitReturnTypeRule.meta.category).toBe('style')
      expect(explicitReturnTypeRule.meta.recommended).toBe(false)
    })

    it('should have default options', () => {
      expect(explicitReturnTypeRule.defaultOptions).toEqual({
        checkExpressions: true,
        checkArrowFunctions: true,
        checkFunctionDeclarations: true,
        checkMethodDeclarations: true,
      })
    })

    it('should create visitor with visitNode method', () => {
      const result = explicitReturnTypeRule.create(explicitReturnTypeRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })
})
