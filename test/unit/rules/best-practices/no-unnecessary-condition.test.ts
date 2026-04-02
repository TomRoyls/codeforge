/**
 * @fileoverview Tests for no-unnecessary-condition rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoUnnecessaryCondition,
  noUnnecessaryConditionRule,
} from '../../../../src/rules/best-practices/no-unnecessary-condition.js'

describe('no-unnecessary-condition rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('rule metadata', () => {
    it('should have correct meta properties', () => {
      expect(noUnnecessaryConditionRule.meta.name).toBe('no-unnecessary-condition')
      expect(noUnnecessaryConditionRule.meta.category).toBe('style')
      expect(noUnnecessaryConditionRule.meta.fixable).toBeUndefined()
    })

    it('should have default options', () => {
      expect(noUnnecessaryConditionRule.defaultOptions).toBeDefined()
      expect(noUnnecessaryConditionRule.defaultOptions.checkConstantConditions).toBe(true)
    })
  })

  describe('always true conditions', () => {
    it('should detect true === true', () => {
      const sourceFile = createSourceFile('if (true === true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should detect 1 === 1', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should detect "a" == "a"', () => {
      const sourceFile = createSourceFile('if ("a" == "a") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should detect 1 < 2', () => {
      const sourceFile = createSourceFile('if (1 < 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should detect 2 >= 2', () => {
      const sourceFile = createSourceFile('if (2 >= 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })
  })

  describe('always false conditions', () => {
    it('should detect true === false', () => {
      const sourceFile = createSourceFile('if (true === false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should detect 1 === 2', () => {
      const sourceFile = createSourceFile('if (1 === 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should detect "a" === "b"', () => {
      const sourceFile = createSourceFile('if ("a" === "b") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should detect 2 < 1', () => {
      const sourceFile = createSourceFile('if (2 < 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should detect 1 > 2', () => {
      const sourceFile = createSourceFile('if (1 > 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should detect true !== true', () => {
      const sourceFile = createSourceFile('if (true !== true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })
  })

  describe('valid conditions', () => {
    it('should not flag variable comparisons', () => {
      const sourceFile = createSourceFile('if (x === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag two variables', () => {
      const sourceFile = createSourceFile('if (a === b) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag function calls', () => {
      const sourceFile = createSourceFile('if (getValue() === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag property access', () => {
      const sourceFile = createSourceFile('if (obj.prop === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle null comparisons', () => {
      const sourceFile = createSourceFile('if (null === null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle multiple conditions in same file', () => {
      const sourceFile = createSourceFile(`
        if (1 === 1) { }
        if (2 === 3) { }
        if (x === y) { }
      `)
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBe(2)
    })

    it('should handle empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with no conditions', () => {
      const sourceFile = createSourceFile('const x = 5;')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('options', () => {
    it('should respect checkConstantConditions: false', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile, { checkConstantConditions: false })
      expect(violations).toHaveLength(0)
    })
  })
})
