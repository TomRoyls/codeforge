/**
 * @fileoverview Tests for prefer-readonly rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferReadonly,
  preferReadonlyRule,
} from '../../../../src/rules/best-practices/prefer-readonly.js'

describe('prefer-readonly rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('rule metadata', () => {
    it('should have correct meta properties', () => {
      expect(preferReadonlyRule.meta.name).toBe('prefer-readonly')
      expect(preferReadonlyRule.meta.category).toBe('best-practices')
      expect(preferReadonlyRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(preferReadonlyRule.defaultOptions).toBeDefined()
      expect(preferReadonlyRule.defaultOptions.ignoreLocal).toBe(false)
      expect(preferReadonlyRule.defaultOptions.ignorePattern).toBe('')
    })
  })

  describe('valid cases', () => {
    it('should allow const declarations', () => {
      const sourceFile = createSourceFile('const x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow const arrays', () => {
      const sourceFile = createSourceFile('const arr = [1, 2, 3];')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow const objects', () => {
      const sourceFile = createSourceFile('const obj = { a: 1 };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with reassignment', () => {
      const sourceFile = createSourceFile('let x = 5; x = 10;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with push method', () => {
      const sourceFile = createSourceFile('let arr = [1, 2]; arr.push(3);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with property assignment', () => {
      const sourceFile = createSourceFile('let obj = { a: 1 }; obj.b = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with update expression', () => {
      const sourceFile = createSourceFile('let count = 0; count++;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with pop method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.pop();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with shift method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.shift();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with splice method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.splice(0, 1);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with sort method', () => {
      const sourceFile = createSourceFile('let items = [2, 1]; items.sort();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with reverse method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.reverse();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should respect ignorePattern option', () => {
      const sourceFile = createSourceFile('let mutableData = [1, 2];')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '^mutable' })
      expect(violations).toHaveLength(0)
    })
  })

  describe('invalid cases', () => {
    it('should flag let without modification', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('x')
      expect(violations[0].message).toContain('const')
    })

    it('should flag let array without modification', () => {
      const sourceFile = createSourceFile('let arr = [1, 2, 3];')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('arr')
    })

    it('should flag let object without modification', () => {
      const sourceFile = createSourceFile('let obj = { a: 1 };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('obj')
    })

    it('should flag let with type annotation', () => {
      const sourceFile = createSourceFile('let value: string = "hello";')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('value')
    })

    it('should flag variable used only for reading', () => {
      const sourceFile = createSourceFile(`
        let items = [1, 2, 3];
        const first = items[0];
      `)
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('items')
    })

    it('should flag multiple let declarations', () => {
      const sourceFile = createSourceFile('let a = 1; let b = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle var declarations', () => {
      const sourceFile = createSourceFile('var x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      // var is not let, so should not flag
      expect(violations).toHaveLength(0)
    })

    it('should handle function parameters', () => {
      const sourceFile = createSourceFile('function test(arr: number[]) { return arr[0]; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle nested functions', () => {
      const sourceFile = createSourceFile(`
        function outer() {
          let x = 5;
          return function inner() {
            return x;
          };
        }
      `)
      const violations = analyzePreferReadonly(sourceFile)
      // x is not modified, should be flagged
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle destructuring', () => {
      const sourceFile = createSourceFile('let { a, b } = obj;')
      const violations = analyzePreferReadonly(sourceFile)
      // destructuring with let
      expect(violations).toHaveLength(0) // Complex case, skip for now
    })
  })
})
