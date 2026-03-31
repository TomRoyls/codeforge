import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferDefaultExport,
  preferDefaultExportRule,
} from '../../../../src/rules/best-practices/prefer-default-export.js'

describe('prefer-default-export rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzePreferDefaultExport', () => {
    it('should flag single named export without default', () => {
      const sourceFile = createSourceFile("export const config = { mode: 'dev' };")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('default export')
    })

    it('should not flag single default export', () => {
      const sourceFile = createSourceFile("const config = { mode: 'dev' }; export default config;")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag multiple named exports', () => {
      const sourceFile = createSourceFile("export const a = 1; export const b = 2;")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag module with no exports', () => {
      const sourceFile = createSourceFile("const internal = 'private';")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(preferDefaultExportRule.meta.name).toBe('prefer-default-export')
      expect(preferDefaultExportRule.meta.category).toBe('style')
      expect(preferDefaultExportRule.meta.recommended).toBe(false)
    })

    it('should have default options', () => {
      expect(preferDefaultExportRule.defaultOptions).toBeDefined()
      expect(preferDefaultExportRule.defaultOptions.target).toBe('single')
      expect(preferDefaultExportRule.defaultOptions.ignoreExportedTypes).toBe(false)
    })

    it('should create visitor', () => {
      const result = preferDefaultExportRule.create(preferDefaultExportRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })
})
