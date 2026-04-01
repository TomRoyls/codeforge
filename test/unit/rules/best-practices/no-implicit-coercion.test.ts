import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoImplicitCoercion,
  noImplicitCoercionRule,
} from '../../../../src/rules/best-practices/no-implicit-coercion.js'

describe('no-implicit-coercion rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzeNoImplicitCoercion', () => {
    describe('double bang (!!) detection', () => {
      it('should flag double bang for boolean conversion', () => {
        const code = 'const isValid = !!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('double bang')
        expect(violations[0].suggestion).toContain('Boolean')
      })

      it('should not flag single bang', () => {
        const code = 'const isNotValid = !value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag double bang when allowDoubleBang is true', () => {
        const code = 'const isValid = !!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowDoubleBang: true })
        expect(violations).toHaveLength(0)
      })
    })

    describe('unary plus (+) detection', () => {
      it('should flag unary plus for number conversion', () => {
        const code = 'const num = +stringValue;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('unary plus')
        expect(violations[0].suggestion).toContain('Number')
      })

      it('should not flag unary plus on numeric literal', () => {
        const code = 'const num = +42;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag unary plus when allowUnaryPlus is true', () => {
        const code = 'const num = +stringValue;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowUnaryPlus: true })
        expect(violations).toHaveLength(0)
      })
    })

    describe('string concatenation detection', () => {
      it('should flag value + "" for string conversion', () => {
        const code = 'const str = value + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('string concatenation')
        expect(violations[0].suggestion).toContain('String')
      })

      it('should flag "" + value for string conversion', () => {
        const code = 'const str = "" + value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag regular string concatenation', () => {
        const code = 'const str = "hello" + " world";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag when allowStringConcat is true', () => {
        const code = 'const str = value + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowStringConcat: true })
        expect(violations).toHaveLength(0)
      })
    })

    describe('numeric coercion detection', () => {
      it('should flag value * 1 for number conversion', () => {
        const code = 'const num = value * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('multiplication')
        expect(violations[0].suggestion).toContain('Number')
      })

      it('should flag 1 * value for number conversion', () => {
        const code = 'const num = 1 * value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag regular multiplication', () => {
        const code = 'const result = value * 2;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag when allowNumericConcat is true', () => {
        const code = 'const num = value * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowNumericConcat: true })
        expect(violations).toHaveLength(0)
      })
    })

    describe('edge cases', () => {
      it('should handle multiple violations in same file', () => {
        const code = `
          const bool = !!value;
          const num = +str;
          const str2 = val + "";
        `
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(3)
      })

      it('should handle empty file', () => {
        const sourceFile = createSourceFile('')
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle file with no violations', () => {
        const code = `
          const bool = Boolean(value);
          const num = Number(str);
          const str = String(val);
        `
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })
  })

  describe('noImplicitCoercionRule', () => {
    it('should have correct meta', () => {
      expect(noImplicitCoercionRule.meta.name).toBe('no-implicit-coercion')
      expect(noImplicitCoercionRule.meta.category).toBe('style')
      expect(noImplicitCoercionRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(noImplicitCoercionRule.defaultOptions).toEqual({
        allowDoubleBang: false,
        allowUnaryPlus: false,
        allowStringConcat: false,
        allowNumericConcat: false,
      })
    })

    it('should create visitor with visitNode method', () => {
      const result = noImplicitCoercionRule.create(noImplicitCoercionRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })
})
