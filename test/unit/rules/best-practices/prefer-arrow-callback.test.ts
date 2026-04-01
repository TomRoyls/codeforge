import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferArrowCallback,
  preferArrowCallbackRule,
} from '../../../../src/rules/best-practices/prefer-arrow-callback.js'

describe('prefer-arrow-callback rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzePreferArrowCallback', () => {
    describe('callback contexts', () => {
      it('should flag function expression as array method callback', () => {
        const code = 'const arr = [1, 2, 3]; arr.map(function(x) { return x * 2; });'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('arrow function')
      })

      it('should flag function expression as forEach callback', () => {
        const code = 'const arr = [1, 2, 3]; arr.forEach(function(item) { console.log(item); });'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should flag function expression as filter callback', () => {
        const code = 'const arr = [1, 2, 3]; arr.filter(function(x) { return x > 1; });'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should flag function expression as reduce callback', () => {
        const code = 'const arr = [1, 2, 3]; arr.reduce(function(acc, x) { return acc + x; }, 0);'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should flag function expression as setTimeout callback', () => {
        const code = "setTimeout(function() { console.log('done'); }, 1000);"
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should flag function expression as setInterval callback', () => {
        const code = "setInterval(function() { console.log('tick'); }, 1000);"
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should flag function expression as Promise.then callback', () => {
        const code = "Promise.resolve(1).then(function(x) { return x + 1; });"
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should flag function expression as Promise.catch callback', () => {
        const code = "Promise.reject('error').catch(function(e) { console.error(e); });"
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should flag function expression as event listener callback', () => {
        const code = "document.addEventListener('click', function(e) { console.log(e); });"
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })
    })

    describe('arrow functions (should not flag)', () => {
      it('should not flag arrow function as callback', () => {
        const code = 'const arr = [1, 2, 3]; arr.map((x) => x * 2);'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag arrow function in forEach', () => {
        const code = 'const arr = [1, 2, 3]; arr.forEach((item) => console.log(item));'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag arrow function in setTimeout', () => {
        const code = "setTimeout(() => console.log('done'), 1000);"
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('variable declarations (should flag)', () => {
      it('should flag function expression assigned to variable', () => {
        const code = 'const add = function(a: number, b: number) { return a + b; };'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })
    })

    describe('allowNamedFunctions option', () => {
      it('should not flag named function expression when allowNamedFunctions is true', () => {
        const code = 'arr.forEach(function helper(x) { console.log(x); });'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag named function expression when allowNamedFunctions is false', () => {
        const code = 'arr.forEach(function helper(x) { console.log(x); });'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false })
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should flag anonymous function even when allowNamedFunctions is true', () => {
        const code = 'arr.forEach(function(x) { console.log(x); });'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: true })
        expect(violations.length).toBeGreaterThan(0)
      })
    })

    describe('edge cases', () => {
      it('should handle nested callbacks', () => {
        const code = 'arr.map(function(x) { return arr2.filter(function(y) { return y > x; }); });'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(2)
      })

      it('should handle mixed arrow and function expression callbacks', () => {
        const code = 'arr.map((x) => x * 2); arr.filter(function(x) { return x > 1; });'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBe(1)
      })

      it('should handle empty file', () => {
        const sourceFile = createSourceFile('')
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })
  })

  describe('preferArrowCallbackRule', () => {
    it('should have correct meta', () => {
      expect(preferArrowCallbackRule.meta.name).toBe('prefer-arrow-callback')
      expect(preferArrowCallbackRule.meta.category).toBe('style')
      expect(preferArrowCallbackRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(preferArrowCallbackRule.defaultOptions).toEqual({
        allowNamedFunctions: true,
      })
    })
  })
})
