import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeStrictBooleanExpressions,
  strictBooleanExpressionsRule,
} from '../../../../src/rules/best-practices/strict-boolean-expressions.js'
import { traverseAST } from '../../../../src/ast/visitor.js'

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

    describe('do-while statements', () => {
      it('should flag implicit truthy check in do-while', () => {
        const sourceFile = createSourceFile(`
          let x = 10;
          do {
            x--;
          } while (x);
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('do-while')
      })

      it('should not flag explicit comparison in do-while', () => {
        const sourceFile = createSourceFile(`
          let x = 10;
          do {
            x--;
          } while (x > 0);
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('for statements', () => {
      it('should flag implicit truthy check in for loop condition', () => {
        const sourceFile = createSourceFile(`
          let x = 10;
          for (; x; ) {
            x--;
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('for loop')
      })

      it('should not flag explicit comparison in for loop', () => {
        const sourceFile = createSourceFile(`
          for (let i = 0; i < 10; i++) {
            console.log(i);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle for loop without condition', () => {
        const sourceFile = createSourceFile(`
          for (;;) {
            break;
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

      it('should not flag explicit comparisons in ||', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          let y = 0;
          if (x > 0 || y > 0) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should flag when only one side has explicit check in &&', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          let y = 0;
          if (x > 0 && y) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should flag when only one side has explicit check in ||', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          let y = 0;
          if (x || y > 0) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
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

    describe('isNaN and isFinite calls', () => {
      it('should not flag isNaN() call', () => {
        const sourceFile = createSourceFile(`
          let x = 10;
          if (isNaN(x)) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag isFinite() call', () => {
        const sourceFile = createSourceFile(`
          let x = 10;
          if (isFinite(x)) {
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

    describe('parenthesized expressions', () => {
      it('should flag implicit truthy check in parenthesized expression', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if ((x)) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag explicit comparison in parenthesized expression', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if ((x > 0)) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle nested parenthesized expressions with explicit check', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (((x > 0))) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should flag nested parenthesized expressions with implicit check', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (((x))) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })
    })

    describe('comparison operators', () => {
      it('should not flag == comparison', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x == 0) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag != comparison', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x != 0) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag < comparison', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x < 10) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag > comparison', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x > 10) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag <= comparison', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x <= 10) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag >= comparison', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x >= 10) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag instanceof comparison', () => {
        const sourceFile = createSourceFile(`
          class MyClass {}
          let x = new MyClass();
          if (x instanceof MyClass) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag in operator', () => {
        const sourceFile = createSourceFile(`
          const obj = { a: 1 };
          if ('a' in obj) {
            console.log(obj);
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

      it('should use default options when none provided', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile, {})
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should merge options with defaults', () => {
        const sourceFile = createSourceFile(`
          let x = 0;
          if (x) {
            console.log(x);
          }
        `)
        const violations = analyzeStrictBooleanExpressions(sourceFile, { allowNumber: false })
        expect(violations.length).toBeGreaterThan(0)
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

    it('should return violations through onComplete', () => {
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      const violations = result.onComplete()
      expect(Array.isArray(violations)).toBe(true)
    })
  })

  describe('visitor-based execution', () => {
    it('should detect violations using visitor pattern', () => {
      const sourceFile = createSourceFile(`
        let x = 0;
        if (x) {
          console.log(x);
        }
      `)
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      
      traverseAST(sourceFile, result.visitor, [])
      
      const violations = result.onComplete()
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect violations in while loop using visitor', () => {
      const sourceFile = createSourceFile(`
        let x = 10;
        while (x) {
          x--;
        }
      `)
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      
      traverseAST(sourceFile, result.visitor, [])
      
      const violations = result.onComplete()
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('while loop')
    })

    it('should detect violations in do-while loop using visitor', () => {
      const sourceFile = createSourceFile(`
        let x = 10;
        do {
          x--;
        } while (x);
      `)
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      
      traverseAST(sourceFile, result.visitor, [])
      
      const violations = result.onComplete()
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('do-while')
    })

    it('should detect violations in for loop using visitor', () => {
      const sourceFile = createSourceFile(`
        let x = 10;
        for (; x; ) {
          x--;
        }
      `)
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      
      traverseAST(sourceFile, result.visitor, [])
      
      const violations = result.onComplete()
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('for loop')
    })

    it('should detect violations in conditional expression using visitor', () => {
      const sourceFile = createSourceFile(`
        let x = 0;
        const result = x ? 'yes' : 'no';
      `)
      const result2 = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      
      traverseAST(sourceFile, result2.visitor, [])
      
      const violations = result2.onComplete()
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('conditional expression')
    })
  })
})
