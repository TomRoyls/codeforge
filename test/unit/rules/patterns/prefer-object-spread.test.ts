import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferObjectSpread,
  preferObjectSpreadRule,
} from '../../../../src/rules/patterns/prefer-object-spread.js'

describe('prefer-object-spread rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzePreferObjectSpread', () => {
    it('should detect Object.assign() calls', () => {
      const sourceFile = createSourceFile(`
        const merged = Object.assign({}, defaults, options);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect Object.assign() with single argument', () => {
      const sourceFile = createSourceFile(`
        const copy = Object.assign(source);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag other Object methods', () => {
      const sourceFile = createSourceFile(`
        const keys = Object.keys(obj);
        const values = Object.values(obj);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.assign() with no arguments', () => {
      const sourceFile = createSourceFile(`
        const empty = Object.assign();
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(preferObjectSpreadRule.meta.name).toBe('prefer-object-spread')
      expect(preferObjectSpreadRule.meta.category).toBe('style')
      expect(preferObjectSpreadRule.meta.recommended).toBe(false)
    })

    it('should create visitor with visitNode method', () => {
      const result = preferObjectSpreadRule.create(preferObjectSpreadRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })
})
