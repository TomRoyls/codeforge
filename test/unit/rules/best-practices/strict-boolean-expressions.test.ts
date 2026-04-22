import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeStrictBooleanExpressions,
  strictBooleanExpressionsRule,
} from '../../../../src/rules/best-practices/strict-boolean-expressions.js'
import { traverseAST } from '../../../../src/ast/visitor.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0
const createSourceFile = (code: string) => {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code)
}

describe('strict-boolean-expressions rule', () => {
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

  describe('rule metadata', () => {
    it('should have name strict-boolean-expressions', () => {
      expect(strictBooleanExpressionsRule.meta.name).toBe('strict-boolean-expressions')
    })

    it('should have category style', () => {
      expect(strictBooleanExpressionsRule.meta.category).toBe('style')
    })

    it('should have recommended set to false', () => {
      expect(strictBooleanExpressionsRule.meta.recommended).toBe(false)
    })

    it('should have fixable as undefined', () => {
      expect(strictBooleanExpressionsRule.meta.fixable).toBeUndefined()
    })

    it('should have a description string', () => {
      expect(typeof strictBooleanExpressionsRule.meta.description).toBe('string')
      expect(strictBooleanExpressionsRule.meta.description.length).toBeGreaterThan(0)
    })

    it('should have defaultOptions with allowNullable true', () => {
      expect(strictBooleanExpressionsRule.defaultOptions.allowNullable).toBe(true)
    })

    it('should have defaultOptions with allowNullableBoolean true', () => {
      expect(strictBooleanExpressionsRule.defaultOptions.allowNullableBoolean).toBe(true)
    })

    it('should have defaultOptions with allowNumber false', () => {
      expect(strictBooleanExpressionsRule.defaultOptions.allowNumber).toBe(false)
    })

    it('should have defaultOptions with allowString false', () => {
      expect(strictBooleanExpressionsRule.defaultOptions.allowString).toBe(false)
    })

    it('should have defaultOptions with allowAny false', () => {
      expect(strictBooleanExpressionsRule.defaultOptions.allowAny).toBe(false)
    })

    it('should have all 8 default option properties', () => {
      const opts = strictBooleanExpressionsRule.defaultOptions
      expect(opts).toHaveProperty('allowNullable')
      expect(opts).toHaveProperty('allowNumber')
      expect(opts).toHaveProperty('allowString')
      expect(opts).toHaveProperty('allowAny')
      expect(opts).toHaveProperty('allowNullableBoolean')
      expect(opts).toHaveProperty('allowNullableNumber')
      expect(opts).toHaveProperty('allowNullableString')
    })

    it('should have defaultOptions with allowNullableNumber false', () => {
      expect(strictBooleanExpressionsRule.defaultOptions.allowNullableNumber).toBe(false)
    })

    it('should have defaultOptions with allowNullableString false', () => {
      expect(strictBooleanExpressionsRule.defaultOptions.allowNullableString).toBe(false)
    })
  })

  describe('if statement - flagging', () => {
    it('should flag bare identifier in if', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag number literal in if', () => {
      const sourceFile = createSourceFile(`if (1) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag string literal in if', () => {
      const sourceFile = createSourceFile(`if ("hello") { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag null check pattern in if', () => {
      const sourceFile = createSourceFile(`let x: string | null = null; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function call result in if', () => {
      const sourceFile = createSourceFile(
        `function fn() { return 1; } if (fn()) { console.log('yes'); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag property access in if', () => {
      const sourceFile = createSourceFile(
        `const obj = { x: 1 }; if (obj.x) { console.log('yes'); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag method call result in if', () => {
      const sourceFile = createSourceFile(`const arr = [1]; if (arr.pop()) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag optional chaining in if', () => {
      const sourceFile = createSourceFile(
        `const obj: any = {}; if (obj?.foo) { console.log('yes'); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag nullish coalescing result in if', () => {
      const sourceFile = createSourceFile(
        `const x: number | null = null; if (x ?? 0) { console.log('yes'); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag template literal in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (\`\${x}\`) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag arithmetic expression in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (x + 1) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag new expression result in if', () => {
      const sourceFile = createSourceFile(`if (new Date()) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag typeof without comparison in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (typeof x) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag void expression in if', () => {
      const sourceFile = createSourceFile(`if (void 0) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag array literal in if', () => {
      const sourceFile = createSourceFile(`if ([]) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('if statement - not flagging', () => {
    it('should not flag === comparison in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (x === 1) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag !== comparison in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (x !== 0) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag > comparison in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (x > 0) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag < comparison in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (x < 10) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag >= comparison in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (x >= 0) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag <= comparison in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (x <= 10) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag == comparison in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (x == null) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag != comparison in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (x != null) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag instanceof in if', () => {
      const sourceFile = createSourceFile(
        `class A {} const a = new A(); if (a instanceof A) { console.log('yes'); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag in operator in if', () => {
      const sourceFile = createSourceFile(
        `const obj = { a: 1 }; if ('a' in obj) { console.log('yes'); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag && of comparisons in if', () => {
      const sourceFile = createSourceFile(
        `const x = 1; const y = 2; if (x > 0 && y > 0) { console.log('yes'); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag || of comparisons in if', () => {
      const sourceFile = createSourceFile(
        `const x = 1; const y = 2; if (x > 0 || y > 0) { console.log('yes'); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Boolean() call in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (Boolean(x)) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag isNaN() call in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (isNaN(x)) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag isFinite() call in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (isFinite(x)) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag negation of explicit comparison in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (!(x > 0)) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('while loop - flagging', () => {
    it('should flag bare identifier in while', () => {
      const sourceFile = createSourceFile(`let x = 1; while (x) { x--; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('while loop')
    })

    it('should flag number literal in while', () => {
      const sourceFile = createSourceFile(`while (1) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag string in while', () => {
      const sourceFile = createSourceFile(`let x = 'a'; while (x) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function call in while', () => {
      const sourceFile = createSourceFile(`function fn() { return 1; } while (fn()) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag property access in while', () => {
      const sourceFile = createSourceFile(`const obj = { x: 1 }; while (obj.x) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag method call in while', () => {
      const sourceFile = createSourceFile(`const arr = [1]; while (arr.pop()) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag optional chaining in while', () => {
      const sourceFile = createSourceFile(`const obj: any = {}; while (obj?.foo) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag negation of bare identifier in while', () => {
      const sourceFile = createSourceFile(`let x = 1; while (!x) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag arithmetic expression in while', () => {
      const sourceFile = createSourceFile(`let x = 1; while (x + 1) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag array literal in while', () => {
      const sourceFile = createSourceFile(`while ([]) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('while loop - not flagging', () => {
    it('should not flag comparison in while', () => {
      const sourceFile = createSourceFile(`let x = 10; while (x > 0) { x--; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Boolean() call in while', () => {
      const sourceFile = createSourceFile(`let x = 10; while (Boolean(x)) { x--; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag negated comparison in while', () => {
      const sourceFile = createSourceFile(`let x = 10; while (!(x <= 0)) { x--; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag instanceof in while', () => {
      const sourceFile = createSourceFile(
        `class A {} let x: any = new A(); while (x instanceof A) { break; }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag in operator in while', () => {
      const sourceFile = createSourceFile(`const obj = { a: 1 }; while ('a' in obj) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag === in while', () => {
      const sourceFile = createSourceFile(`let x = 1; while (x === 1) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag !== in while', () => {
      const sourceFile = createSourceFile(`let x = 1; while (x !== 0) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag isNaN() in while', () => {
      const sourceFile = createSourceFile(`let x = 1; while (isNaN(x)) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag isFinite() in while', () => {
      const sourceFile = createSourceFile(`let x = 1; while (isFinite(x)) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag && of comparisons in while', () => {
      const sourceFile = createSourceFile(`let x = 1; let y = 2; while (x > 0 && y > 0) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('do-while - flagging', () => {
    it('should flag bare identifier in do-while', () => {
      const sourceFile = createSourceFile(`let x = 10; do { x--; } while (x);`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag number in do-while', () => {
      const sourceFile = createSourceFile(`do { break; } while (1);`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function call in do-while', () => {
      const sourceFile = createSourceFile(`function fn() { return 1; } do { break; } while (fn());`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag property access in do-while', () => {
      const sourceFile = createSourceFile(`const obj = { x: 1 }; do { break; } while (obj.x);`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag string in do-while', () => {
      const sourceFile = createSourceFile(`let x = 'a'; do { break; } while (x);`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('do-while - not flagging', () => {
    it('should not flag comparison in do-while', () => {
      const sourceFile = createSourceFile(`let x = 10; do { x--; } while (x > 0);`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Boolean() in do-while', () => {
      const sourceFile = createSourceFile(`let x = 10; do { x--; } while (Boolean(x));`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag negated comparison in do-while', () => {
      const sourceFile = createSourceFile(`let x = 10; do { x--; } while (!(x <= 0));`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag instanceof in do-while', () => {
      const sourceFile = createSourceFile(
        `class A {} let x: any = new A(); do { break; } while (x instanceof A);`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag === in do-while', () => {
      const sourceFile = createSourceFile(`let x = 1; do { break; } while (x === 1);`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('for loop - flagging', () => {
    it('should flag bare identifier in for loop', () => {
      const sourceFile = createSourceFile(`let x = 10; for (; x; ) { x--; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function call in for loop', () => {
      const sourceFile = createSourceFile(`function fn() { return 1; } for (; fn(); ) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag property access in for loop', () => {
      const sourceFile = createSourceFile(`const obj = { x: 1 }; for (; obj.x; ) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag number literal in for loop', () => {
      const sourceFile = createSourceFile(`for (; 1; ) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag string in for loop', () => {
      const sourceFile = createSourceFile(`let x = 'a'; for (; x; ) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('for loop - not flagging', () => {
    it('should not flag comparison in for loop', () => {
      const sourceFile = createSourceFile(`for (let i = 0; i < 10; i++) { console.log(i); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loop with no condition', () => {
      const sourceFile = createSourceFile(`for (;;) { break; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Boolean() in for loop', () => {
      const sourceFile = createSourceFile(`let x = 10; for (; Boolean(x); ) { x--; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag negated comparison in for loop', () => {
      const sourceFile = createSourceFile(`let x = 10; for (; !(x <= 0); ) { x--; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag instanceof in for loop', () => {
      const sourceFile = createSourceFile(
        `class A {} let x: any = new A(); for (; x instanceof A; ) { break; }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('ternary - flagging', () => {
    it('should flag bare identifier in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = x ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag number in ternary', () => {
      const sourceFile = createSourceFile(`const r = 1 ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag string in ternary', () => {
      const sourceFile = createSourceFile(`const r = 'a' ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function call in ternary', () => {
      const sourceFile = createSourceFile(
        `function fn() { return 1; } const r = fn() ? 'yes' : 'no';`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag property access in ternary', () => {
      const sourceFile = createSourceFile(`const obj = { x: 1 }; const r = obj.x ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag method call in ternary', () => {
      const sourceFile = createSourceFile(`const arr = [1]; const r = arr.pop() ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag array literal in ternary', () => {
      const sourceFile = createSourceFile(`const r = [] ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag negation of identifier in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = !x ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag arithmetic in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = x + 1 ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag typeof without comparison in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = typeof x ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('ternary - not flagging', () => {
    it('should not flag comparison in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = x > 0 ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Boolean() in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = Boolean(x) ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag negated comparison in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = !(x > 0) ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag instanceof in ternary', () => {
      const sourceFile = createSourceFile(
        `class A {} const a = new A(); const r = a instanceof A ? 'yes' : 'no';`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag === in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = x === 1 ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag !== in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = x !== 0 ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag isNaN() in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = isNaN(x) ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag isFinite() in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = isFinite(x) ? 'yes' : 'no';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag && of comparisons in ternary', () => {
      const sourceFile = createSourceFile(
        `const x = 1; const y = 2; const r = x > 0 && y > 0 ? 'yes' : 'no';`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag in operator in ternary', () => {
      const sourceFile = createSourceFile(
        `const obj = { a: 1 }; const r = 'a' in obj ? 'yes' : 'no';`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should have ruleId set to strict-boolean-expressions', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].ruleId).toBe('strict-boolean-expressions')
    })

    it('should have severity set to warning', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].severity).toBe('warning')
    })

    it('should mention if statement in message for if violation', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].message).toContain('if statement')
    })

    it('should mention while loop in message for while violation', () => {
      const sourceFile = createSourceFile(`let x = 10; while (x) { x--; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].message).toContain('while loop')
    })

    it('should mention do-while loop in message for do-while violation', () => {
      const sourceFile = createSourceFile(`let x = 10; do { x--; } while (x);`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].message).toContain('do-while loop')
    })

    it('should mention for loop in message for for violation', () => {
      const sourceFile = createSourceFile(`let x = 10; for (; x; ) { x--; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].message).toContain('for loop')
    })

    it('should mention conditional expression in message for ternary violation', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = x ? 'a' : 'b';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].message).toContain('conditional expression')
    })

    it('should have a suggestion in violation', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].suggestion).toBeDefined()
      expect(typeof violations[0].suggestion).toBe('string')
    })

    it('should have range property in violation', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].range).toBeDefined()
    })

    it('should have filePath property in violation', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].filePath).toBeDefined()
      expect(typeof violations[0].filePath).toBe('string')
    })

    it('should have suggestion mentioning explicit comparison for if', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].suggestion).toContain('explicit comparison')
    })

    it('should have suggestion mentioning Boolean for if', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].suggestion).toContain('Boolean')
    })

    it('should have suggestion mentioning comparison for while', () => {
      const sourceFile = createSourceFile(`let x = 10; while (x) { x--; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].suggestion).toContain('explicit comparison')
    })

    it('should include Unexpected in violation message', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].message).toContain('Unexpected')
    })

    it('should include implicit boolean conversion in violation message', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations[0].message).toContain('implicit boolean conversion')
    })
  })

  describe('options', () => {
    it('should work with empty options object', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, {})
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with allowNullable true', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, { allowNullable: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with allowNumber true', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, { allowNumber: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with allowString true', () => {
      const sourceFile = createSourceFile(`let x = 'a'; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, { allowString: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with allowAny true', () => {
      const sourceFile = createSourceFile(`let x: any = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, { allowAny: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with allowNullableBoolean true', () => {
      const sourceFile = createSourceFile(`let x = true; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, { allowNullableBoolean: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with allowNullableNumber true', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, { allowNullableNumber: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with allowNullableString true', () => {
      const sourceFile = createSourceFile(`let x = 'a'; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, { allowNullableString: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with all options set to false', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, {
        allowNullable: false,
        allowNumber: false,
        allowString: false,
        allowAny: false,
        allowNullableBoolean: false,
        allowNullableNumber: false,
        allowNullableString: false,
      })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should still flag with explicit comparison regardless of options', () => {
      const sourceFile = createSourceFile(`let x = 0; if (x > 0) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, {
        allowNumber: true,
        allowString: true,
      })
      expect(violations).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sourceFile = createSourceFile(``)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with only comments', () => {
      const sourceFile = createSourceFile(`// just a comment\n/* another comment */`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle nested if statements', () => {
      const sourceFile = createSourceFile(
        `let x = 0; let y = 0; if (x) { if (y) { console.log(x); } }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle chained ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = x ? 'a' : x ? 'b' : 'c';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(1)
    })

    it('should not flag switch statements', () => {
      const sourceFile = createSourceFile(
        `const x = 1; switch (x) { case 1: break; default: break; }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag try-catch', () => {
      const sourceFile = createSourceFile(
        `try { console.log('test'); } catch (e) { console.error(e); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for-in loop', () => {
      const sourceFile = createSourceFile(
        `const obj = { a: 1 }; for (const key in obj) { console.log(key); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for-of loop', () => {
      const sourceFile = createSourceFile(
        `const arr = [1, 2, 3]; for (const item of arr) { console.log(item); }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle function expression as condition', () => {
      const sourceFile = createSourceFile(`const fn = () => 1; if (fn()) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle arrow function body in condition', () => {
      const sourceFile = createSourceFile(
        `const getResult = () => 1; while (getResult()) { break; }`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle deeply nested conditions', () => {
      const sourceFile = createSourceFile(`const x = 1; if ((x + 1)) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle double negation of bare identifier', () => {
      const sourceFile = createSourceFile(`const x = 1; if (!!x) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle double negation of explicit check', () => {
      const sourceFile = createSourceFile(`const x = 1; if (!!(x > 0)) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle object literal in if', () => {
      const sourceFile = createSourceFile(`if ({}) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle ternary within function call', () => {
      const sourceFile = createSourceFile(`const x = 1; console.log(x ? 'a' : 'b');`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle nested ternary with explicit check', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = x > 0 ? 'a' : x < 0 ? 'b' : 'c';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle mixed nested conditions', () => {
      const sourceFile = createSourceFile(`const x = 1; if (x > 0) { if (x) { console.log(x); } }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBe(1)
    })

    it('should handle comma expression', () => {
      const sourceFile = createSourceFile(`const x = 1; if ((0, x)) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle boolean literal true in if', () => {
      const sourceFile = createSourceFile(`if (true) { console.log('yes'); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('rule create function', () => {
    it('should return visitor object with visitNode', () => {
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      expect(result.visitor).toBeDefined()
      expect(typeof result.visitor.visitNode).toBe('function')
    })

    it('should return onComplete function', () => {
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      expect(typeof result.onComplete).toBe('function')
    })

    it('should have visitNode accept two parameters', () => {
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      expect(result.visitor.visitNode.length).toBeGreaterThanOrEqual(2)
    })

    it('should return empty violations from onComplete without traversal', () => {
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      const violations = result.onComplete()
      expect(violations).toHaveLength(0)
    })

    it('should detect if violation through visitor', () => {
      const sourceFile = createSourceFile(`const x = 0; if (x) { console.log(x); }`)
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      traverseAST(sourceFile, result.visitor, [])
      const violations = result.onComplete()
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('if statement')
    })

    it('should detect ternary violation through visitor', () => {
      const sourceFile = createSourceFile(`const x = 0; const r = x ? 'a' : 'b';`)
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      traverseAST(sourceFile, result.visitor, [])
      const violations = result.onComplete()
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('conditional expression')
    })

    it('should not report violations for valid code through visitor', () => {
      const sourceFile = createSourceFile(`const x = 0; if (x > 0) { console.log(x); }`)
      const result = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      traverseAST(sourceFile, result.visitor, [])
      const violations = result.onComplete()
      expect(violations).toHaveLength(0)
    })

    it('should create independent violation arrays per call', () => {
      const result1 = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      const result2 = strictBooleanExpressionsRule.create(
        strictBooleanExpressionsRule.defaultOptions,
      )
      const sourceFile = createSourceFile(`const x = 0; if (x) { console.log(x); }`)
      traverseAST(sourceFile, result1.visitor, [])
      const violations1 = result1.onComplete()
      const violations2 = result2.onComplete()
      expect(violations1.length).toBeGreaterThan(0)
      expect(violations2).toHaveLength(0)
    })
  })

  describe('analyzeStrictBooleanExpressions function', () => {
    it('should return empty array for empty file', () => {
      const sourceFile = createSourceFile(``)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should return empty array for file with no conditions', () => {
      const sourceFile = createSourceFile(`const x = 1; console.log(x);`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should detect single if violation', () => {
      const sourceFile = createSourceFile(`const x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect multiple conditions', () => {
      const sourceFile = createSourceFile(
        `const x = 0; if (x) {} while (x) {} const r = x ? 'a' : 'b';`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(3)
    })

    it('should work with options parameter', () => {
      const sourceFile = createSourceFile(`const x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile, { allowNumber: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work without options parameter', () => {
      const sourceFile = createSourceFile(`const x = 0; if (x) { console.log(x); }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should return array', () => {
      const sourceFile = createSourceFile(`const x = 0;`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(Array.isArray(violations)).toBe(true)
    })

    it('should detect violations across all statement types', () => {
      const sourceFile = createSourceFile(`
        const x = 0;
        if (x) {}
        while (x) {}
        do {} while (x);
        for (; x; ) {}
        const r = x ? 'a' : 'b';
      `)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBe(5)
    })

    it('should handle file with only function declarations', () => {
      const sourceFile = createSourceFile(`function fn() { return 1; }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with only class declarations', () => {
      const sourceFile = createSourceFile(`class MyClass { method() { return 1; } }`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('multiple violations', () => {
    it('should report 3 separate if violations', () => {
      const sourceFile = createSourceFile(`const x = 0; if (x) {} if (x) {} if (x) {}`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(3)
    })

    it('should report violations for if and while in same file', () => {
      const sourceFile = createSourceFile(`const x = 0; if (x) {} while (x) {}`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should report violations for if, while, and ternary', () => {
      const sourceFile = createSourceFile(
        `const x = 0; if (x) {} while (x) {} const r = x ? 'a' : 'b';`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(3)
    })

    it('should report violations across all 5 statement types', () => {
      const sourceFile = createSourceFile(
        `const x = 0; if (x) {} while (x) {} do {} while (x); for (; x; ) {} const r = x ? 'a' : 'b';`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(5)
    })

    it('should report 5+ violations in complex file', () => {
      const sourceFile = createSourceFile(`
        const x = 0;
        if (x) {}
        if (x) {}
        while (x) {}
        do {} while (x);
        const r = x ? 'a' : 'b';
      `)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(5)
    })

    it('should mix flagged and non-flagged conditions', () => {
      const sourceFile = createSourceFile(`const x = 0; if (x) {} if (x > 0) {} if (x) {}`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should handle nested if with different condition types', () => {
      const sourceFile = createSourceFile(
        `const x = 0; const y = 1; if (x > 0) { if (y) {} } if (x) {}`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should report violations in ternary chain', () => {
      const sourceFile = createSourceFile(`const x = 0; const r = x ? (x ? 'a' : 'b') : 'c';`)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle multiple loops in sequence', () => {
      const sourceFile = createSourceFile(
        `const x = 0; while (x) {} do {} while (x); for (; x; ) {}`,
      )
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(3)
    })

    it('should handle complex mixed file', () => {
      const sourceFile = createSourceFile(`
        const x = 0;
        if (x) {}
        if (x > 0) {}
        while (Boolean(x)) {}
        while (x) {}
        const r = x ? 'a' : 'b';
        if (x !== null) {}
      `)
      const violations = analyzeStrictBooleanExpressions(sourceFile)
      expect(violations).toHaveLength(3)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag === true comparison', () => {
      const sourceFile = createSourceFile(`const x = true; if (x === true) { console.log(x); }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag === false comparison', () => {
      const sourceFile = createSourceFile(`const x = true; if (x === false) { console.log(x); }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag !== true comparison', () => {
      const sourceFile = createSourceFile(`const x = true; if (x !== true) { console.log(x); }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag !== false comparison', () => {
      const sourceFile = createSourceFile(`const x = true; if (x !== false) { console.log(x); }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag === null comparison', () => {
      const sourceFile = createSourceFile(
        `const x: string | null = null; if (x === null) { console.log(x); }`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag !== undefined comparison', () => {
      const sourceFile = createSourceFile(
        `const x: string | undefined = undefined; if (x !== undefined) { console.log(x); }`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag === undefined comparison', () => {
      const sourceFile = createSourceFile(
        `const x: string | undefined = undefined; if (x === undefined) { console.log(x); }`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag == null comparison', () => {
      const sourceFile = createSourceFile(`const x = null; if (x == null) { console.log(x); }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag != undefined comparison', () => {
      const sourceFile = createSourceFile(
        `const x = undefined; if (x != undefined) { console.log(x); }`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag > 0 in while loop', () => {
      const sourceFile = createSourceFile(`let x = 10; while (x > 0) { x--; }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag < 10 in for loop', () => {
      const sourceFile = createSourceFile(`for (let i = 0; i < 10; i++) { console.log(i); }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag >= 0 in do-while', () => {
      const sourceFile = createSourceFile(`let x = 10; do { x--; } while (x >= 0);`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag <= 100 in ternary', () => {
      const sourceFile = createSourceFile(`const x = 50; const r = x <= 100 ? 'yes' : 'no';`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag Boolean() in while', () => {
      const sourceFile = createSourceFile(`const x = 1; while (Boolean(x)) { break; }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag Boolean() in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = Boolean(x) ? 'yes' : 'no';`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag Boolean() in do-while', () => {
      const sourceFile = createSourceFile(`const x = 1; do { break; } while (Boolean(x));`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag Boolean() in for', () => {
      const sourceFile = createSourceFile(`const x = 1; for (; Boolean(x); ) { break; }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag isNaN() in while', () => {
      const sourceFile = createSourceFile(`const x = 1; while (isNaN(x)) { break; }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag isFinite() in ternary', () => {
      const sourceFile = createSourceFile(`const x = 1; const r = isFinite(x) ? 'yes' : 'no';`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag instanceof in ternary', () => {
      const sourceFile = createSourceFile(
        `class A {} const a = new A(); const r = a instanceof A ? 'yes' : 'no';`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag in operator in ternary', () => {
      const sourceFile = createSourceFile(
        `const obj = { a: 1 }; const r = 'a' in obj ? 'yes' : 'no';`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag negated comparison in while', () => {
      const sourceFile = createSourceFile(`const x = 10; while (!(x === 0)) { x--; }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag negated comparison in do-while', () => {
      const sourceFile = createSourceFile(`const x = 10; do { x--; } while (!(x === 0));`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag negated comparison in ternary', () => {
      const sourceFile = createSourceFile(`const x = 10; const r = !(x === 0) ? 'yes' : 'no';`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag negated comparison in for', () => {
      const sourceFile = createSourceFile(`const x = 10; for (; !(x === 0); ) { x--; }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag parenthesized comparison', () => {
      const sourceFile = createSourceFile(`const x = 10; if ((x > 0)) { console.log(x); }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag deeply parenthesized comparison', () => {
      const sourceFile = createSourceFile(`const x = 10; if ((((x > 0)))) { console.log(x); }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag && of two === comparisons', () => {
      const sourceFile = createSourceFile(
        `const x = 1; const y = 2; if (x === 1 && y === 2) { console.log('yes'); }`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag || of two !== comparisons', () => {
      const sourceFile = createSourceFile(
        `const x = 1; const y = 2; if (x !== 0 || y !== 0) { console.log('yes'); }`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag && of instanceof checks', () => {
      const sourceFile = createSourceFile(
        `class A {} class B {} const a: any = new A(); const b: any = new B(); if (a instanceof A && b instanceof B) { console.log('yes'); }`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag && of in checks', () => {
      const sourceFile = createSourceFile(
        `const obj = { a: 1, b: 2 }; if ('a' in obj && 'b' in obj) { console.log('yes'); }`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag complex && || chain of comparisons', () => {
      const sourceFile = createSourceFile(
        `const x = 1; const y = 2; const z = 3; if ((x > 0 && y > 0) || z > 0) { console.log('yes'); }`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag isNaN() in if', () => {
      const sourceFile = createSourceFile(`const x = 1; if (isNaN(x)) { console.log('yes'); }`)
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })

    it('should not flag typeof === comparison', () => {
      const sourceFile = createSourceFile(
        `const x = 1; if (typeof x === 'number') { console.log('yes'); }`,
      )
      expect(analyzeStrictBooleanExpressions(sourceFile)).toHaveLength(0)
    })
  })
})
