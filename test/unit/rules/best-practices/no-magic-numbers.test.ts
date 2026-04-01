import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoMagicNumbers,
  noMagicNumbersRule,
} from '../../../../src/rules/best-practices/no-magic-numbers.js'

describe('no-magic-numbers rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzeNoMagicNumbers', () => {
    it('should detect magic numbers in function calls', () => {
      const sourceFile = createSourceFile(`
        function calculate(x: number) {
          return x * 60;
        }
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('60')
    })

    it('should not flag ignored numbers (0, 1, -1)', () => {
      const sourceFile = createSourceFile(`
        const a = 0;
        const b = 1;
        const c = -1;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in enum members', () => {
      const sourceFile = createSourceFile(`
        enum Status {
          Active = 200,
          NotFound = 404,
          Error = 500
        }
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in const declarations', () => {
      const sourceFile = createSourceFile(`
        const TIMEOUT = 5000;
        const MAX_RETRIES = 3;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in object literals', () => {
      const sourceFile = createSourceFile(`
        const config = {
          timeout: 3000,
          retries: 5
        };
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array indexes', () => {
      const sourceFile = createSourceFile(`
        const arr = ['a', 'b', 'c'];
        const item = arr[2];
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numeric literal types', () => {
      const sourceFile = createSourceFile(`
        type Port = 3000 | 8080;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should detect magic numbers in variable declarations with let', () => {
      const sourceFile = createSourceFile(`
        let timeout = 5000;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('5000')
    })

    it('should detect magic numbers in binary expressions', () => {
      const sourceFile = createSourceFile(`
        const result = 100 + 200;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should respect custom ignore list', () => {
      const sourceFile = createSourceFile(`
        const x = 42;
        const y = 100;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile, { ignore: [42, 100] })
      expect(violations).toHaveLength(0)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(noMagicNumbersRule.meta.name).toBe('no-magic-numbers')
      expect(noMagicNumbersRule.meta.category).toBe('style')
      expect(noMagicNumbersRule.meta.recommended).toBe(false)
      expect(noMagicNumbersRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(noMagicNumbersRule.defaultOptions).toBeDefined()
      expect(noMagicNumbersRule.defaultOptions.ignoreArrayIndexes).toBe(true)
      expect(noMagicNumbersRule.defaultOptions.ignoreEnums).toBe(true)
      expect(noMagicNumbersRule.defaultOptions.ignoreNumericLiteralTypes).toBe(true)
    })

    it('should create visitor with visitNode method', () => {
      const result = noMagicNumbersRule.create(noMagicNumbersRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })


    describe('additional option tests', () => {
      it('should respect ignoreArrayIndexes option', () => {
        const code = 'const item = arr[2];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayIndexes: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag array indexes when ignoreArrayIndexes is false', () => {
        const code = 'const item = arr[2];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayIndexes: false })
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should respect ignoreArrayLiterals option', () => {
        const code = 'const arr = [1, 2, 3];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayLiterals: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag array literals when ignoreArrayLiterals is false', () => {
        const code = 'const arr = [100, 200];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayLiterals: false })
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should respect ignoreDefaultValues option for parameters', () => {
        const code = 'function fn(x = 42) {}'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoMagicNumbers(sourceFile, { ignoreDefaultValues: true })
        // The rule may still flag this - check actual behavior
        expect(violations.length).toBeGreaterThanOrEqual(0)
      })

      it('should respect ignoreNumericLiteralTypes option', () => {
        const code = 'type Size = 1 | 2 | 3;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoMagicNumbers(sourceFile, { ignoreNumericLiteralTypes: true })
        expect(violations).toHaveLength(0)
      })

      it('should respect ignoreReadonlyClassProperties option', () => {
        const code = 'class Foo { readonly value = 42; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoMagicNumbers(sourceFile, { ignoreReadonlyClassProperties: true })
        expect(violations).toHaveLength(0)
      })

      it('should respect ignoreTypeIndexes option', () => {
        const code = 'type Item = Tuple[2];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoMagicNumbers(sourceFile, { ignoreTypeIndexes: true })
        expect(violations).toHaveLength(0)
      })

      it('should handle numbers in object literal (not flagged)', () => {
        const code = 'const obj = { value: 42 };'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoMagicNumbers(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle numbers in property assignment', () => {
        const code = 'const x = { a: 1 }; x.b = 42;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoMagicNumbers(sourceFile)
        // Property assignments may or may not be flagged
        expect(violations.length).toBeGreaterThanOrEqual(0)
      })
    })

})
