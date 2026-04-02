/**
 * @fileoverview Tests for prefer-array-some rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferArraySome,
  preferArraySomeRule,
} from '../../../../src/rules/best-practices/prefer-array-some.js'

describe('prefer-array-some rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('rule metadata', () => {
    it('should have correct meta properties', () => {
      expect(preferArraySomeRule.meta.name).toBe('prefer-array-some')
      expect(preferArraySomeRule.meta.category).toBe('best-practices')
      expect(preferArraySomeRule.meta.fixable).toBeUndefined()
    })

    it('should have default options', () => {
      expect(preferArraySomeRule.defaultOptions).toBeDefined()
      expect(preferArraySomeRule.defaultOptions.checkIndexOf).toBe(true)
    })
  })

  describe('indexOf existence checks', () => {
    it('should detect arr.indexOf(x) !== -1', () => {
      const sourceFile = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('some()')
    })

    it('should detect arr.indexOf(x) != -1', () => {
      const sourceFile = createSourceFile('if (arr.indexOf(x) != -1) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect arr.indexOf(x) >= 0', () => {
      const sourceFile = createSourceFile('if (arr.indexOf(x) >= 0) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect arr.indexOf(x) > -1', () => {
      const sourceFile = createSourceFile('if (arr.indexOf(x) > -1) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('indexOf absence checks', () => {
    it('should detect arr.indexOf(x) === -1', () => {
      const sourceFile = createSourceFile('if (arr.indexOf(x) === -1) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('some()') || expect(violations[0].message).toContain('every()')
    })

    it('should detect arr.indexOf(x) == -1', () => {
      const sourceFile = createSourceFile('if (arr.indexOf(x) == -1) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect arr.indexOf(x) < 0', () => {
      const sourceFile = createSourceFile('if (arr.indexOf(x) < 0) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('valid patterns', () => {
    it('should not flag arr.some()', () => {
      const sourceFile = createSourceFile('if (arr.some(x => x === 1)) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag arr.includes()', () => {
      const sourceFile = createSourceFile('if (arr.includes(x)) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag indexOf without comparison', () => {
      const sourceFile = createSourceFile('const index = arr.indexOf(x);')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag indexOf === 0 (checking first element)', () => {
      const sourceFile = createSourceFile('if (arr.indexOf(x) === 0) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag other method calls', () => {
      const sourceFile = createSourceFile('if (arr.find(x => x === 1)) { }')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle multiple indexOf checks', () => {
      const sourceFile = createSourceFile(`
        if (arr1.indexOf(x) !== -1) { }
        if (arr2.indexOf(y) === -1) { }
      `)
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations.length).toBe(2)
    })

    it('should handle nested indexOf checks', () => {
      const sourceFile = createSourceFile(`
        if (arr.indexOf(x) !== -1 && other.indexOf(y) !== -1) { }
      `)
      const violations = analyzePreferArraySome(sourceFile)
      expect(violations.length).toBe(2)
    })
  })

  describe('options', () => {
    it('should respect checkIndexOf: false', () => {
      const sourceFile = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      const violations = analyzePreferArraySome(sourceFile, { checkIndexOf: false })
      expect(violations).toHaveLength(0)
    })
  })
})
