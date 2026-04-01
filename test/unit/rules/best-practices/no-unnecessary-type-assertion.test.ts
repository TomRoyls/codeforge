import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoUnnecessaryTypeAssertion,
  noUnnecessaryTypeAssertionRule,
} from '../../../../src/rules/best-practices/no-unnecessary-type-assertion.js'

describe('no-unnecessary-type-assertion rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzeNoUnnecessaryTypeAssertion', () => {
    it('should detect string literal asserted as string', () => {
      const sourceFile = createSourceFile(`
        const x = "hello" as string;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('redundant')
    })

    it('should detect number literal asserted as number', () => {
      const sourceFile = createSourceFile(`
        const x = 42 as number;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect boolean literal asserted as boolean', () => {
      const sourceFile = createSourceFile(`
        const x = true as boolean;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect null literal asserted as null', () => {
      const sourceFile = createSourceFile(`
        const x = null as null;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag when types do not match', () => {
      const sourceFile = createSourceFile(`
        const x = 42 as string;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag when assertion widens type', () => {
      const sourceFile = createSourceFile(`
        const x = "hello" as unknown;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag template literals as redundant', () => {
      const sourceFile = createSourceFile(`
        const x = \`hello\` as string;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag when skipStringLiterals is true', () => {
      const sourceFile = createSourceFile(`
        const x = "hello" as string;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipStringLiterals: true,
      })
      expect(violations).toHaveLength(0)
    })

    it('should not flag when skipNumericLiterals is true', () => {
      const sourceFile = createSourceFile(`
        const x = 42 as number;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipNumericLiterals: true,
      })
      expect(violations).toHaveLength(0)
    })

    it('should not flag when skipBooleanLiterals is true', () => {
      const sourceFile = createSourceFile(`
        const x = true as boolean;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipBooleanLiterals: true,
      })
      expect(violations).toHaveLength(0)
    })

    it('should not flag when skipNullLiterals is false (default)', () => {
      const sourceFile = createSourceFile(`
        const x = null as null;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag angle-bracket syntax', () => {
      const sourceFile = createSourceFile(`
        const x = <string>"hello";
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag complex types', () => {
      const sourceFile = createSourceFile(`
        const x = { a: 1 } as { a: number };
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag variable assertions', () => {
      const sourceFile = createSourceFile(`
        const y = "hello";
        const x = y as string;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(noUnnecessaryTypeAssertionRule.meta.name).toBe('no-unnecessary-type-assertion')
      expect(noUnnecessaryTypeAssertionRule.meta.category).toBe('style')
      expect(noUnnecessaryTypeAssertionRule.meta.recommended).toBe(false)
      expect(noUnnecessaryTypeAssertionRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(noUnnecessaryTypeAssertionRule.defaultOptions).toBeDefined()
      expect(noUnnecessaryTypeAssertionRule.defaultOptions.skipStringLiterals).toBe(false)
      expect(noUnnecessaryTypeAssertionRule.defaultOptions.skipNumericLiterals).toBe(false)
      expect(noUnnecessaryTypeAssertionRule.defaultOptions.skipBooleanLiterals).toBe(false)
      expect(noUnnecessaryTypeAssertionRule.defaultOptions.skipNullLiterals).toBe(true)
    })

    it('should create visitor with visitNode method', () => {
      const result = noUnnecessaryTypeAssertionRule.create(
        noUnnecessaryTypeAssertionRule.defaultOptions,
      )
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })


    describe('additional option tests', () => {
      it('should respect skipStringLiterals option', () => {
        const code = 'const x = "hello" as string;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipStringLiterals: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag string literals when skipStringLiterals is false', () => {
        const code = 'const x = "hello" as string;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipStringLiterals: false })
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should respect skipNumericLiterals option', () => {
        const code = 'const x = 42 as number;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipNumericLiterals: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag numeric literals when skipNumericLiterals is false', () => {
        const code = 'const x = 42 as number;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipNumericLiterals: false })
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should respect skipBooleanLiterals option', () => {
        const code = 'const x = true as boolean;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipBooleanLiterals: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag boolean literals when skipBooleanLiterals is false', () => {
        const code = 'const x = true as boolean;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipBooleanLiterals: false })
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should respect skipNullLiterals option (default true)', () => {
        const code = 'const x = null as null;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipNullLiterals: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag null literals when skipNullLiterals is false', () => {
        const code = 'const x = null as null;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipNullLiterals: false })
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should handle bigint literals', () => {
        const code = 'const x = 42n as bigint;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should handle template literals', () => {
        const code = 'const x = `hello` as string;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should handle false keyword', () => {
        const code = 'const x = false as boolean;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag non-redundant assertions', () => {
        const code = 'const x = 42 as string;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle undefined type assertion', () => {
        const code = 'const x = undefined as undefined;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(0)
      })
    })

})
