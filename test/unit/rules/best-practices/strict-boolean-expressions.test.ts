import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeStrictBooleanExpressions,
  strictBooleanExpressionsRule,
} from '../../../../src/rules/best-practices/strict-boolean-expressions.js'

describe('strict-boolean-expressions rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzeStrictBooleanExpressions', () => {
    describe('if statements', () => {
      it('should flag implicit truthy check in if', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('explicit boolean')
      })

      it('should not flag explicit comparison in if', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x > 0) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag explicit === check in if', () => {
        const sourceFile = createSourceFile(`
          let x = true;
          if (x === true) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag explicit !== check in if', () => {
        const sourceFile = createSourceFile(`
          let x = null;
          if (x !== null) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('ternary expressions', () => {
      it('should flag implicit truthy check in ternary', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          const result = x ? 'yes' : 'no';
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag explicit comparison in ternary', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          const result = x > 0 ? 'yes' : 'no';
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('while statements', () => {
      it('should flag implicit truthy check in while', () => {
        const sourceFile = createSourceFile(`
          let x = 10;
          while (x) {
            x--;
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag explicit comparison in while', () => {
        const sourceFile = createSourceFile(`
          let x = 10;
          while (x > 0) {
            x--;
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('logical expressions', () => {
      it('should flag implicit truthy check in &&', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x && y) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should flag implicit truthy check in ||', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x || y) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag explicit comparisons in &&', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          let y = 0;
          if (x > 0 && y > 0) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('Boolean() calls', () => {
      it('should not flag Boolean() call', () => {
        const sourceFile = createSourceFile(`
          let x = "hello";
          if (Boolean(x)) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('negation', () => {
      it('should flag implicit falsy check with !', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (!x) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag negation of explicit check', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (!(x > 0)) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('options', () => {
      it('should respect allowNullable option', () => {
        const sourceFile = createSourceFile(`
          let x: string | null = "hello";
          if (x !== null) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(strictBooleanExpressionsRule.meta.name).toBe('strict-boolean-expressions')
      expect(strictBooleanExpressionsRule.meta.category).toBe('style')
      expect(strictBooleanExpressionsRule.meta.recommended).toBe(false)
      expect(strictBooleanExpressionsRule.meta.fixable).toBeUndefined()
    })

    it('should have default options', () => {
      expect(strictBooleanExpressionsRule.defaultOptions).toBeDefined()
      expect(strictBooleanExpressionsRule.defaultOptions.allowNullable).toBe(true)
      expect(strictBooleanExpressionsRule.defaultOptions.allowNumber).toBe(false)
      expect(strictBooleanExpressionsRule.defaultOptions.allowString).toBe(false)
      expect(strictBooleanExpressionsRule.defaultOptions.allowAny).toBe(false)
    })

    it('should create visitor with visitNode method', () => {
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })
})
