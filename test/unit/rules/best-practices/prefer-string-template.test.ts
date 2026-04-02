/**
 * @fileoverview Tests for prefer-string-template rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferStringTemplate,
  preferStringTemplateRule,
} from '../../../../src/rules/best-practices/prefer-string-template.js'

describe('prefer-string-template rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('rule metadata', () => {
    it('should have correct meta properties', () => {
      expect(preferStringTemplateRule.meta.name).toBe('prefer-string-template')
      expect(preferStringTemplateRule.meta.category).toBe('style')
      expect(preferStringTemplateRule.meta.fixable).toBeUndefined()
    })

    it('should have default options', () => {
      expect(preferStringTemplateRule.defaultOptions).toBeDefined()
      expect(preferStringTemplateRule.defaultOptions.checkConcat).toBe(true)
    })
  })

  describe('string concatenation detection', () => {
    it('should detect "hello" + name', () => {
      const sourceFile = createSourceFile('const msg = "hello" + name;')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('template')
    })

    it('should detect name + "hello"', () => {
      const sourceFile = createSourceFile('const msg = name + "hello";')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect "prefix" + middle + "suffix"', () => {
      const sourceFile = createSourceFile('const msg = "prefix" + middle + "suffix";')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect concatenation with template literal', () => {
      const sourceFile = createSourceFile('const msg = "prefix" + `template`;')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('valid patterns', () => {
    it('should not flag template literals', () => {
      const sourceFile = createSourceFile('const msg = `Hello ${name}`;')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag number addition', () => {
      const sourceFile = createSourceFile('const sum = 1 + 2;')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag variable addition', () => {
      const sourceFile = createSourceFile('const sum = a + b;')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag boolean expressions', () => {
      const sourceFile = createSourceFile('const result = true && false;')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle multiple concatenations', () => {
      const sourceFile = createSourceFile(`
        const a = "hello" + x;
        const b = "world" + y;
      `)
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations.length).toBe(2)
    })

    it('should handle nested concatenations', () => {
      const sourceFile = createSourceFile('const msg = "a" + ("b" + c);')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle concatenation in function call', () => {
      const sourceFile = createSourceFile('console.log("Error: " + message);')
      const violations = analyzePreferStringTemplate(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('options', () => {
    it('should respect checkConcat: false', () => {
      const sourceFile = createSourceFile('const msg = "hello" + name;')
      const violations = analyzePreferStringTemplate(sourceFile, { checkConcat: false })
      expect(violations).toHaveLength(0)
    })
  })
})
