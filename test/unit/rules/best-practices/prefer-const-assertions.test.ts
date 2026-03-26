import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferConstAssertions,
  preferConstAssertionsRule,
} from '../../../../src/rules/best-practices/prefer-const-assertions.js'

describe('prefer-const-assertions rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzePreferConstAssertions', () => {
    describe('object literals', () => {
      it('should detect object literals that need const assertion', () => {
        const sourceFile = createSourceFile(`
          const config = { mode: 'dev', port: 3000 };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('as const')
      })

      it('should not flag objects with type annotation', () => {
        const sourceFile = createSourceFile(`
          interface Config { mode: string; port: number }
          const config: Config = { mode: 'dev', port: 3000 };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag objects with existing as const', () => {
        const sourceFile = createSourceFile(`
          const config = { mode: 'dev', port: 3000 } as const;
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag empty objects when skipEmpty is true', () => {
        const sourceFile = createSourceFile(`
          const empty = {};
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { skipEmpty: true })
        expect(violations).toHaveLength(0)
      })

      it('should not flag let declarations', () => {
        const sourceFile = createSourceFile(`
          let config = { mode: 'dev' };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag var declarations', () => {
        const sourceFile = createSourceFile(`
          var config = { mode: 'dev' };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('array literals', () => {
      it('should detect array literals that need const assertion', () => {
        const sourceFile = createSourceFile(`
          const colors = ['red', 'green', 'blue'];
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('as const')
      })

      it('should not flag arrays with existing as const', () => {
        const sourceFile = createSourceFile(`
          const colors = ['red', 'green', 'blue'] as const;
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag empty arrays when skipEmpty is true', () => {
        const sourceFile = createSourceFile(`
          const empty = [];
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { skipEmpty: true })
        expect(violations).toHaveLength(0)
      })

      it('should not flag arrays with spread elements', () => {
        const sourceFile = createSourceFile(`
          const items = ['a', ...otherItems, 'b'];
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('nested literals', () => {
      it('should detect nested object literals', () => {
        const sourceFile = createSourceFile(`
          const config = { server: { port: 3000, host: 'localhost' } };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag objects with non-constable nested values', () => {
        const sourceFile = createSourceFile(`
          const config = { callback: () => true };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag objects with computed property names', () => {
        const sourceFile = createSourceFile(`
          const key = 'dynamic';
          const config = { [key]: 'value' };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('options', () => {
      it('should respect checkObjects: false', () => {
        const sourceFile = createSourceFile(`
          const config = { mode: 'dev' };
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { checkObjects: false })
        expect(violations).toHaveLength(0)
      })

      it('should respect checkArrays: false', () => {
        const sourceFile = createSourceFile(`
          const colors = ['red', 'green', 'blue'];
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { checkArrays: false })
        expect(violations).toHaveLength(0)
      })

      it('should respect minimumProperties', () => {
        const sourceFile = createSourceFile(`
          const small = { a: 1 };
          const large = { a: 1, b: 2, c: 3 };
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { minimumProperties: 3 })
        expect(violations).toHaveLength(1)
        expect(violations[0].message).toContain('object')
      })

      it('should respect skipExported', () => {
        const sourceFile = createSourceFile(`
          export const config = { mode: 'dev' };
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { skipExported: true })
        expect(violations).toHaveLength(0)
      })
    })

    describe('edge cases', () => {
      it('should not flag satisfies expressions', () => {
        const sourceFile = createSourceFile(`
          interface Config { mode: string }
          const config = { mode: 'dev' } satisfies Config;
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle numeric literals', () => {
        const sourceFile = createSourceFile(`
          const ports = [3000, 8080, 8000];
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should handle boolean literals', () => {
        const sourceFile = createSourceFile(`
          const flags = { enabled: true, disabled: false };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should handle null literals', () => {
        const sourceFile = createSourceFile(`
          const options = { value: null };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should handle prefix unary expressions (negative numbers)', () => {
        const sourceFile = createSourceFile(`
          const values = [-1, -2, -3];
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(preferConstAssertionsRule.meta.name).toBe('prefer-const-assertions')
      expect(preferConstAssertionsRule.meta.category).toBe('style')
      expect(preferConstAssertionsRule.meta.recommended).toBe(false)
      expect(preferConstAssertionsRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(preferConstAssertionsRule.defaultOptions).toBeDefined()
      expect(preferConstAssertionsRule.defaultOptions.checkArrays).toBe(true)
      expect(preferConstAssertionsRule.defaultOptions.checkObjects).toBe(true)
      expect(preferConstAssertionsRule.defaultOptions.skipEmpty).toBe(true)
      expect(preferConstAssertionsRule.defaultOptions.skipExported).toBe(false)
      expect(preferConstAssertionsRule.defaultOptions.minimumProperties).toBe(0)
    })

    it('should create visitor with visitNode method', () => {
      const result = preferConstAssertionsRule.create(preferConstAssertionsRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })
})
