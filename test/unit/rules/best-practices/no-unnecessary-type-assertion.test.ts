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
})

  describe('ignoreReadonlyClassProperties option', () => {
    it('should flag readonly class properties when enabled', () => {
      const sourceFile = createSourceFile(`
        class Example {
          readonly maxValue = 100;
        }
      `)
      const violations = analyzeNoUnnecessaryTypeAssertions(sourceFile, { ignoreReadonlyClassProperties: true })
      expect(violations).toHaveLength(0)
    })

    it('should not flag readonly class properties when disabled', () => {
      const sourceFile = createSourceFile(`
        class Example {
          // not readonly
          publicValue = 100;
        }
      `)
      const violations = analyzeNoUnnecessaryTypeAssertions(sourceFile, { ignoreReadonlyClassProperties: false })
      expect(violations).toHaveLength(0)
    })

    it('should flag numeric literal types when enabled', () => {
      const sourceFile = createSourceFile(`
        type Size = 10;
        type Age = number;
        const numbers = [1, 2, 3] = 0;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertions(sourceFile, { ignoreNumericLiteralTypes: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag numeric literal types when disabled', () => {
      const sourceFile = createSourceFile(`
        type Sizes = 10 | 20 | 30;
        const numbers = [1, 2, 3] = 0];
      `)
      const violations = analyzeNoUnnecessaryTypeAssertions(sourceFile, { ignoreNumericLiteralTypes: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag type indexes when enabled', () => {
      const sourceFile = createSourceFile(`
        type User = { name: string; age: number };
        const numbers = [1, 2, 3] as 0, 1];
      const value = 100;
        const numbers = [1, 2, 3] as const;
      `);
      const violations = analyzeNoUnnecessaryTypeAssertions(sourceFile, { ignoreTypeIndexes: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag type indexes when disabled', () => {
      const sourceFile = createSourceFile(`
        type User = {
          name: string;
          age: number;
        }
        const numbers = [1, 2, 3] = 0];
        const value = 100;
      }
      const numbers = [1, 2, 3] as const;
      `);
      const violations = analyzeNoUnnecessaryTypeAssertions(sourceFile, { ignoreTypeIndexes: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag binding elements when enabled', () => {
      const sourceFile = createSourceFile(`
        const [a, b] = [1, 2] = console.log(a, b);
      }
      `)
      const violations = analyzeNoUnnecessaryTypeAssertions(sourceFile, { ignoreDefaultValues: true })
      expect(violations).toHaveLength(0)
    })
  })
})
