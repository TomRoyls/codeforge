import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferConstAssertions,
  preferConstAssertionsRule,
} from '../../../../src/rules/best-practices/prefer-const-assertions.js'
import { traverseAST } from '../../../../src/ast/visitor.js'

import { Node, SyntaxKind } from 'ts-morph'

describe('prefer-const-assertions extended coverage', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  })

  describe('primitive literals', () => {
    it('should flag string literals', () => {
      const sourceFile = createSourceFile('const str = "hello"')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag numeric literals', () => {
      const sourceFile = createSourceFile('const num = 42')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag boolean true', () => {
      const sourceFile = createSourceFile('const flag = true')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
    it('should flag boolean false', () => {
      const sourceFile = createSourceFile('const flag = false')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag null', () => {
      const sourceFile = createSourceFile('const value = null')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag negative numbers', () => {
      const sourceFile = createSourceFile('const neg = -5')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('object literals', () => {
    it('should flag simple objects', () => {
      const sourceFile = createSourceFile('const obj = { a: 1 }')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag nested objects', () => {
      const sourceFile = createSourceFile('const config = { nested: { a: 1 } } }')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('array literals', () => {
    it('should flag simple arrays', () => {
      const sourceFile = createSourceFile('const arr = [1, 2, 3]')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag nested arrays', () => {
      const sourceFile = createSourceFile('const arr = [[1, 2], [3, 4]]')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('type annotations', () => {
    it('should not flag when type annotation exists', () => {
      const sourceFile = createSourceFile('const config: { a: 1 } = { mode: "dev" }')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('satisfies expressions', () => {
    it('should not flag satisfies expressions', () => {
      const sourceFile = createSourceFile('const config = { a: 1 } satisfies { a: number }')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('as const expressions', () => {
    it('should not flag as const expressions', () => {
      const sourceFile = createSourceFile('const config = { a: 1 } as const')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('options', () => {
    it('should respect checkArrays: false', () => {
      const sourceFile = createSourceFile('const arr = [1, 2, 3]')
      const violations = analyzePreferConstAssertions(sourceFile, { checkArrays: false })
      expect(violations).toHaveLength(0)
    })

    it('should respect checkObjects: false', () => {
      const sourceFile = createSourceFile('const obj = { a: 1 }')
      const violations = analyzePreferConstAssertions(sourceFile, { checkObjects: false })
      expect(violations).toHaveLength(0)
    })
    it('should respect minimumProperties', () => {
      const sourceFile = createSourceFile('const obj = { a: 1 }')
      const violations = analyzePreferConstAssertions(sourceFile, { minimumProperties: 3 })
      expect(violations).toHaveLength(0)
    })

    it('should respect skipEmpty for arrays', () => {
      const sourceFile = createSourceFile('const arr = []')
      const violations = analyzePreferConstAssertions(sourceFile, { skipEmpty: true })
      expect(violations).toHaveLength(0)
    })
  })

  describe('visitor-based execution', () => {
    it('should detect violations using visitor pattern', () => {
      const sourceFile = createSourceFile('const config = { a: 1 }')
      const result = preferConstAssertionsRule.create(
        preferConstAssertionsRule.defaultOptions,
      )
      
      traverseAST(sourceFile, result.visitor, [])
      
      const violations = result.onComplete()
      expect(violations.length).toBeGreaterThan(0)
    })
  })
})
