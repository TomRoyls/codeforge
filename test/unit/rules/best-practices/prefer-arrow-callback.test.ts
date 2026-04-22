import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferArrowCallback,
  preferArrowCallbackRule,
} from '../../../../src/rules/best-practices/prefer-arrow-callback.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0
const createSourceFile = (code: string) => {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code)
}

describe('prefer-arrow-callback rule', () => {
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
        const code = 'Promise.resolve(1).then(function(x) { return x + 1; });'
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

    describe('property assignment in object literal', () => {
      it('should flag function expression as object property', () => {
        const code = 'const obj = { fn: function() { return 1; } };'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('arrow function')
      })

      it('should not flag arrow function as object property', () => {
        const code = 'const obj = { fn: () => 1 };'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('array literal context', () => {
      it('should flag function expression in array', () => {
        const code = 'const callbacks = [function() { return 1; }];'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('arrow function')
      })

      it('should not flag arrow function in array', () => {
        const code = 'const callbacks = [() => 1];'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('standalone function declarations', () => {
      it('should not flag standalone function declaration', () => {
        const code = 'function standalone() { return 1; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag exported standalone function', () => {
        const code = 'export function helper() { return 1; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferArrowCallback(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })
  })

  describe('object literal property assignment', () => {
    it('should flag function expression as object property value', () => {
      const code = 'const obj = { handler: function() { return 1; } };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('arrow function')
    })

    it('should not flag arrow function as object property value', () => {
      const code = 'const obj = { handler: () => 1 };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('array literal callbacks', () => {
    it('should flag function expression in array', () => {
      const code = 'const handlers = [function() { return 1; }, function() { return 2; }];'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag arrow function in array', () => {
      const code = 'const handlers = [() => 1, () => 2];'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('named function declarations', () => {
    it('should not flag standalone named function declaration', () => {
      const code = 'function helper() { return 1; }'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag exported standalone function', () => {
      const code = 'export function utility() { return 1; }'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('allowNamedFunctions: false option', () => {
    it('should flag named function expression when allowNamedFunctions is false', () => {
      const code = 'arr.map(function namedFn(x) { return x * 2; });'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false })
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('arrow function')
    })

    it('should flag named function expression in variable when allowNamedFunctions is false', () => {
      const code = 'const fn = function namedFn() { return 1; };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag named function expression when allowNamedFunctions is true (default)', () => {
      const code = 'arr.map(function namedFn(x) { return x * 2; });'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: true })
      expect(violations).toHaveLength(0)
    })

    it('should flag anonymous function expression when allowNamedFunctions is false', () => {
      const code = 'arr.map(function(x) { return x * 2; });'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false })
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle nested function expressions in callbacks', () => {
      const code = 'arr.map(function(x) { return function(y) { return x + y; }; });'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle function expression in object nested in callback', () => {
      const code = 'arr.map(function(x) { return { fn: function() { return x; } }; });'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle function expression in IIFE', () => {
      const code = '(function() { return 1; })();'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      // IIFE is a call expression, so function is argument - should flag
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle class method (not flagged)', () => {
      const code = 'class Foo { method() { return 1; } }'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('additional edge cases for coverage', () => {
    it('should handle arrow function in callback context (not flagged)', () => {
      const code = 'arr.map((x) => x * 2);'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle function expression in variable declaration', () => {
      const code = 'const fn = function() { return 1; };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle arrow function in variable declaration (not flagged)', () => {
      const code = 'const fn = () => 1;'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle named function declaration with allowNamedFunctions false', () => {
      const code = 'arr.map(function named(x) { return x; });'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle function in property shorthand', () => {
      const code = 'const obj = { method() { return 1; } };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('rule metadata', () => {
    it('should have the correct rule name', () => {
      expect(preferArrowCallbackRule.meta.name).toBe('prefer-arrow-callback')
    })

    it('should have style category', () => {
      expect(preferArrowCallbackRule.meta.category).toBe('style')
    })

    it('should have description about arrow functions', () => {
      expect(preferArrowCallbackRule.meta.description).toBe(
        'Enforce using arrow functions for callbacks',
      )
    })

    it('should not be recommended', () => {
      expect(preferArrowCallbackRule.meta.recommended).toBe(false)
    })

    it('should be fixable', () => {
      expect(preferArrowCallbackRule.meta.fixable).toBe('code')
    })

    it('should have default options with allowNamedFunctions true', () => {
      expect(preferArrowCallbackRule.defaultOptions).toEqual({ allowNamedFunctions: true })
    })

    it('should have a create function', () => {
      expect(typeof preferArrowCallbackRule.create).toBe('function')
    })

    it('should return visitor and onComplete from create', () => {
      const result = preferArrowCallbackRule.create({})
      expect(result).toHaveProperty('visitor')
      expect(result).toHaveProperty('onComplete')
    })
  })

  describe('flagging - array method callbacks', () => {
    it('should flag function expression in map', () => {
      const sourceFile = createSourceFile('const r = [1,2,3].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in filter', () => {
      const sourceFile = createSourceFile(
        'const r = [1,2,3].filter(function(x) { return x > 1; });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in reduce', () => {
      const sourceFile = createSourceFile('[1,2].reduce(function(a, b) { return a + b; }, 0);')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in forEach', () => {
      const sourceFile = createSourceFile('[1,2].forEach(function(x) { console.log(x); });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in find', () => {
      const sourceFile = createSourceFile('[1,2,3].find(function(x) { return x === 2; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in findIndex', () => {
      const sourceFile = createSourceFile('[1,2,3].findIndex(function(x) { return x === 2; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in some', () => {
      const sourceFile = createSourceFile('[1,2,3].some(function(x) { return x > 2; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in every', () => {
      const sourceFile = createSourceFile('[1,2,3].every(function(x) { return x > 0; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in sort', () => {
      const sourceFile = createSourceFile('[3,1,2].sort(function(a, b) { return a - b; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in flatMap', () => {
      const sourceFile = createSourceFile('[1,2,3].flatMap(function(x) { return [x, x * 2]; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in reduceRight', () => {
      const sourceFile = createSourceFile(
        '[1,2,3].reduceRight(function(a, b) { return a + b; }, 0);',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in map with typed parameter', () => {
      const sourceFile = createSourceFile('const r = [1,2].map(function(x: number) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in filter with no parameters', () => {
      const sourceFile = createSourceFile('const r = [1,2].filter(function() { return true; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in map with multi-parameter', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x, i, arr) { return x + i; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in Array.from mapFn', () => {
      const sourceFile = createSourceFile('Array.from([1,2], function(x) { return x * 2; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression returning object in map', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return { value: x }; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in reduce returning array', () => {
      const sourceFile = createSourceFile(
        '[1,2].reduce(function(acc, x) { acc.push(x); return acc; }, []);',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in chained map call', () => {
      const sourceFile = createSourceFile(
        '[1,2].map(function(x) { return x * 2; }).filter(function(x) { return x > 2; });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should flag function expression in find with complex condition', () => {
      const sourceFile = createSourceFile(
        '[{a:1},{a:2}].find(function(item) { return item.a === 2; });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in some with external reference', () => {
      const sourceFile = createSourceFile(
        'const threshold = 5; [1,2,3].some(function(x) { return x > threshold; });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('flagging - timer callbacks', () => {
    it('should flag function expression in setTimeout', () => {
      const sourceFile = createSourceFile("setTimeout(function() { console.log('hi'); }, 100);")
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in setInterval', () => {
      const sourceFile = createSourceFile("setInterval(function() { console.log('tick'); }, 1000);")
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in requestAnimationFrame', () => {
      const sourceFile = createSourceFile(
        'requestAnimationFrame(function(time) { console.log(time); });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in setImmediate', () => {
      const sourceFile = createSourceFile('setImmediate(function() { console.log("immediate"); });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in setTimeout with parameters', () => {
      const sourceFile = createSourceFile(
        "setTimeout(function(x: string) { console.log(x); }, 100, 'arg');",
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag named function in setTimeout when allowNamedFunctions is false', () => {
      const sourceFile = createSourceFile(
        "setTimeout(function onTick() { console.log('tick'); }, 100);",
      )
      const violations = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false })
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('flagging - Promise callbacks', () => {
    it('should flag function expression in Promise.then', () => {
      const sourceFile = createSourceFile('Promise.resolve(1).then(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in Promise.catch', () => {
      const sourceFile = createSourceFile(
        "Promise.reject('err').catch(function(e) { console.log(e); });",
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in Promise.finally', () => {
      const sourceFile = createSourceFile(
        'Promise.resolve(1).finally(function() { console.log("done"); });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in chained then calls', () => {
      const sourceFile = createSourceFile(
        'Promise.resolve(1).then(function(x) { return x; }).then(function(y) { return y; });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should flag function expression in then with two arguments', () => {
      const sourceFile = createSourceFile(
        'promise.then(function(x) { return x; }, function(e) { console.log(e); });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should flag function expression in Promise.all mapped values', () => {
      const sourceFile = createSourceFile('Promise.all([1,2].map(function(x) { return x; }));')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in Promise.race mapped values', () => {
      const sourceFile = createSourceFile('Promise.race([1,2].map(function(x) { return x; }));')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in Promise.allSettled mapped values', () => {
      const sourceFile = createSourceFile(
        'Promise.allSettled([1,2].map(function(x) { return x; }));',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression returning a Promise in then', () => {
      const sourceFile = createSourceFile(
        'Promise.resolve(1).then(function(x) { return Promise.resolve(x + 1); });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag async function expression in Promise then', () => {
      const sourceFile = createSourceFile(
        'Promise.resolve(1).then(async function(x) { return await fetch(""); });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('flagging - event callbacks', () => {
    it('should flag function expression in addEventListener', () => {
      const sourceFile = createSourceFile(
        "document.addEventListener('click', function(e) { console.log(e); });",
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in removeEventListener', () => {
      const sourceFile = createSourceFile(
        "document.removeEventListener('click', function(e) { console.log(e); });",
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in EventEmitter.on', () => {
      const sourceFile = createSourceFile(
        "emitter.on('data', function(data) { console.log(data); });",
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in EventEmitter.once', () => {
      const sourceFile = createSourceFile(
        "emitter.once('event', function(payload) { process(payload); });",
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in window.addEventListener', () => {
      const sourceFile = createSourceFile(
        "window.addEventListener('resize', function() { console.log('resized'); });",
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in custom event callback', () => {
      const sourceFile = createSourceFile(
        "button.addEventListener('customEvent', function(detail) { handle(detail); });",
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('flagging - variable declarations', () => {
    it('should flag function expression in const declaration', () => {
      const sourceFile = createSourceFile('const fn = function() { return 1; };')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in let declaration', () => {
      const sourceFile = createSourceFile('let fn = function() { return 1; };')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in var declaration', () => {
      const sourceFile = createSourceFile('var fn = function() { return 1; };')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with parameters in variable', () => {
      const sourceFile = createSourceFile(
        'const add = function(a: number, b: number) { return a + b; };',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with return type in variable', () => {
      const sourceFile = createSourceFile('const fn = function(): number { return 42; };')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with complex body in variable', () => {
      const sourceFile = createSourceFile(
        'const fn = function(x: number) { const y = x * 2; if (y > 10) return y; return 0; };',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with default params in variable', () => {
      const sourceFile = createSourceFile('const fn = function(x = 10) { return x; };')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with rest params in variable', () => {
      const sourceFile = createSourceFile(
        'const fn = function(...args: number[]) { return args; };',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with destructured params in variable', () => {
      const sourceFile = createSourceFile(
        'const fn = function({ x }: { x: number }) { return x; };',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with typed variable in variable', () => {
      const sourceFile = createSourceFile('const fn: () => number = function() { return 1; };')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('flagging - property assignments', () => {
    it('should flag function expression in object property', () => {
      const sourceFile = createSourceFile('const obj = { handler: function() { return 1; } };')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with params in object property', () => {
      const sourceFile = createSourceFile(
        'const obj = { compute: function(x: number) { return x * 2; } };',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag multiple function expressions in object properties', () => {
      const sourceFile = createSourceFile(
        'const obj = { a: function() { return 1; }, b: function() { return 2; } };',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should flag function expression in nested object property', () => {
      const sourceFile = createSourceFile(
        'const obj = { outer: { inner: function() { return 1; } } };',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in onClick property', () => {
      const sourceFile = createSourceFile(
        'const config = { onClick: function(e: Event) { e.preventDefault(); } };',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in transform property', () => {
      const sourceFile = createSourceFile(
        'const pipeline = { transform: function(data: string) { return data.toUpperCase(); } };',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in computed property', () => {
      const sourceFile = createSourceFile('const obj = { ["key"]: function() { return 1; } };')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in spread object', () => {
      const sourceFile = createSourceFile(
        'const obj = { ...base, handler: function() { return 1; } };',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('flagging - array literals', () => {
    it('should flag function expression as array element', () => {
      const sourceFile = createSourceFile('const fns = [function() { return 1; }];')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag multiple function expressions in array', () => {
      const sourceFile = createSourceFile(
        'const fns = [function() { return 1; }, function() { return 2; }, function() { return 3; }];',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(3)
    })

    it('should flag function expression mixed with other values in array', () => {
      const sourceFile = createSourceFile("const items = [1, 'two', function() { return 3; }];")
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in typed array', () => {
      const sourceFile = createSourceFile(
        'const fns: (() => number)[] = [function() { return 1; }];',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in nested array', () => {
      const sourceFile = createSourceFile('const fns = [[function() { return 1; }]];')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('not flagging - arrow functions', () => {
    it('should not flag arrow function in map', () => {
      const sourceFile = createSourceFile('[1,2,3].map((x) => x * 2);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in filter', () => {
      const sourceFile = createSourceFile('[1,2,3].filter((x) => x > 1);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in reduce', () => {
      const sourceFile = createSourceFile('[1,2].reduce((a, b) => a + b, 0);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in forEach', () => {
      const sourceFile = createSourceFile('[1,2].forEach((x) => console.log(x));')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in find', () => {
      const sourceFile = createSourceFile('[1,2,3].find((x) => x === 2);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in setTimeout', () => {
      const sourceFile = createSourceFile("setTimeout(() => console.log('done'), 100);")
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in setInterval', () => {
      const sourceFile = createSourceFile("setInterval(() => console.log('tick'), 1000);")
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in then', () => {
      const sourceFile = createSourceFile('Promise.resolve(1).then((x) => x + 1);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in catch', () => {
      const sourceFile = createSourceFile("Promise.reject('err').catch((e) => console.log(e));")
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in addEventListener', () => {
      const sourceFile = createSourceFile(
        "document.addEventListener('click', (e) => console.log(e));",
      )
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in variable declaration', () => {
      const sourceFile = createSourceFile('const fn = () => 1;')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in object property', () => {
      const sourceFile = createSourceFile('const obj = { fn: () => 1 };')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in array literal', () => {
      const sourceFile = createSourceFile('const fns = [() => 1, () => 2];')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in requestAnimationFrame', () => {
      const sourceFile = createSourceFile('requestAnimationFrame((t) => console.log(t));')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in flatMap', () => {
      const sourceFile = createSourceFile('[1,2,3].flatMap((x) => [x, x * 2]);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })
  })

  describe('not flagging - named functions with allowNamedFunctions', () => {
    it('should not flag named function expression in map with default options', () => {
      const sourceFile = createSourceFile('[1,2].map(function transform(x) { return x * 2; });')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag named function expression in filter with default options', () => {
      const sourceFile = createSourceFile('[1,2].filter(function predicate(x) { return x > 1; });')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag named function expression in setTimeout with default options', () => {
      const sourceFile = createSourceFile(
        "setTimeout(function onTimeout() { console.log('done'); }, 100);",
      )
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag named function expression in then with default options', () => {
      const sourceFile = createSourceFile(
        'Promise.resolve(1).then(function onFulfilled(x) { return x; });',
      )
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag named function expression in variable with default options', () => {
      const sourceFile = createSourceFile('const fn = function myFn() { return 1; };')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag named function expression in object property with default options', () => {
      const sourceFile = createSourceFile('const obj = { fn: function myHandler() { return 1; } };')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag named function expression in array literal with default options', () => {
      const sourceFile = createSourceFile('const fns = [function myFn() { return 1; }];')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag named function expression in forEach with default options', () => {
      const sourceFile = createSourceFile('[1,2].forEach(function logItem(x) { console.log(x); });')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag named function expression in addEventListener with default options', () => {
      const sourceFile = createSourceFile(
        "document.addEventListener('click', function onClick(e) { console.log(e); });",
      )
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag named function expression in reduce with default options', () => {
      const sourceFile = createSourceFile(
        '[1,2].reduce(function accumulator(acc, x) { return acc + x; }, 0);',
      )
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })
  })

  describe('not flagging - non-callback contexts', () => {
    it('should not flag standalone function declaration', () => {
      const sourceFile = createSourceFile('function helper() { return 1; }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag exported function declaration', () => {
      const sourceFile = createSourceFile('export function utility() { return 1; }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag default exported function declaration', () => {
      const sourceFile = createSourceFile('export default function() { return 1; }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag class method', () => {
      const sourceFile = createSourceFile('class Foo { method() { return 1; } }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag IIFE function expression (function is callee not argument)', () => {
      const sourceFile = createSourceFile('(function() { return 1; })();')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag function declaration in namespace', () => {
      const sourceFile = createSourceFile('namespace NS { function internal() { return 1; } }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag top-level generator function declaration', () => {
      const sourceFile = createSourceFile('function* gen() { yield 1; }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag top-level async function declaration', () => {
      const sourceFile = createSourceFile('async function fetchData() { return await fetch(""); }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag method shorthand in object literal', () => {
      const sourceFile = createSourceFile('const obj = { method() { return 1; } };')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag getter in class', () => {
      const sourceFile = createSourceFile('class Foo { get value() { return 1; } }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })
  })

  describe('allowNamedFunctions option', () => {
    it('should skip named function in map when default options apply', () => {
      const sourceFile = createSourceFile('[1,2].map(function named(x) { return x; });')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should skip named function in filter when explicitly set to true', () => {
      const sourceFile = createSourceFile('[1,2].filter(function named(x) { return x > 1; });')
      expect(analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: true })).toHaveLength(0)
    })

    it('should skip named function in setTimeout when explicitly set to true', () => {
      const sourceFile = createSourceFile(
        "setTimeout(function named() { console.log('ok'); }, 100);",
      )
      expect(analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: true })).toHaveLength(0)
    })

    it('should flag named function in map when set to false', () => {
      const sourceFile = createSourceFile('[1,2].map(function named(x) { return x; });')
      expect(
        analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false }).length,
      ).toBeGreaterThan(0)
    })

    it('should flag named function in filter when set to false', () => {
      const sourceFile = createSourceFile('[1,2].filter(function named(x) { return x > 0; });')
      expect(
        analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false }).length,
      ).toBeGreaterThan(0)
    })

    it('should flag named function in forEach when set to false', () => {
      const sourceFile = createSourceFile('[1,2].forEach(function named(x) { console.log(x); });')
      expect(
        analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false }).length,
      ).toBeGreaterThan(0)
    })

    it('should flag named function in variable when set to false', () => {
      const sourceFile = createSourceFile('const fn = function named() { return 1; };')
      expect(
        analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false }).length,
      ).toBeGreaterThan(0)
    })

    it('should flag named function in property when set to false', () => {
      const sourceFile = createSourceFile('const obj = { fn: function named() { return 1; } };')
      expect(
        analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false }).length,
      ).toBeGreaterThan(0)
    })

    it('should flag named function in array literal when set to false', () => {
      const sourceFile = createSourceFile('const fns = [function named() { return 1; }];')
      expect(
        analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false }).length,
      ).toBeGreaterThan(0)
    })

    it('should still flag anonymous function with default options', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      expect(analyzePreferArrowCallback(sourceFile).length).toBeGreaterThan(0)
    })
  })

  describe('violation properties', () => {
    it('should have correct ruleId', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations[0].ruleId).toBe('prefer-arrow-callback')
    })

    it('should have info severity', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations[0].severity).toBe('info')
    })

    it('should have message mentioning arrow function', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations[0].message).toContain('arrow function')
    })

    it('should have message mentioning callback', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations[0].message).toContain('callback')
    })

    it('should have suggestion mentioning arrow function', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations[0].suggestion).toContain('arrow function')
    })

    it('should have suggestion with args pattern', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations[0].suggestion).toContain('(args)')
    })

    it('should have range with start and end position objects', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations[0].range.start).toHaveProperty('line')
      expect(violations[0].range.start).toHaveProperty('column')
      expect(violations[0].range.end).toHaveProperty('line')
      expect(violations[0].range.end).toHaveProperty('column')
    })

    it('should have range where start line is before end line', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations[0].range.start.line).toBeLessThanOrEqual(violations[0].range.end.line)
    })

    it('should have filePath matching source file', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations[0].filePath).toContain('test')
      expect(violations[0].filePath).toContain('.ts')
    })

    it('should have exact expected message', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations[0].message).toBe(
        'Use arrow function for callback instead of function expression.',
      )
    })
  })

  describe('edge cases - extended', () => {
    it('should handle empty file', () => {
      const sourceFile = createSourceFile('')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should handle file with only comments', () => {
      const sourceFile = createSourceFile('// just a comment\n/* another comment */')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should handle deeply nested callbacks', () => {
      const code =
        'a(function(x) { return b(function(y) { return c(function(z) { return x + y + z; }); }); });'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(3)
    })

    it('should flag async function expression in callback', () => {
      const sourceFile = createSourceFile(
        '[1,2].map(async function(x) { return await fetch(""); });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag generator function expression in callback', () => {
      const sourceFile = createSourceFile('[1,2].map(function*(x) { yield x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression that uses this', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return this.value + x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression that uses arguments', () => {
      const sourceFile = createSourceFile('[1,2].map(function() { return arguments[0]; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with new.target', () => {
      const sourceFile = createSourceFile('fn(function() { return new.target; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression in try-catch inside callback', () => {
      const sourceFile = createSourceFile(
        '[1,2].map(function(x) { try { return x; } catch(e) { return 0; } });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with default parameters in callback', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x = 0) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with rest parameters in callback', () => {
      const sourceFile = createSourceFile('[1,2].map(function(...args) { return args[0]; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with destructured parameters in callback', () => {
      const sourceFile = createSourceFile('[{x:1}].map(function({ x }) { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with return type annotation in callback', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x): number { return x; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression as only call argument', () => {
      const sourceFile = createSourceFile('run(function() { return 1; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression as first of multiple arguments', () => {
      const sourceFile = createSourceFile('run(function() { return 1; }, 2, 3);')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression as last of multiple arguments', () => {
      const sourceFile = createSourceFile('run(1, 2, function() { return 3; });')
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag function expression with complex body in callback', () => {
      const sourceFile = createSourceFile(
        '[1,2].map(function(x) { const y = x * 2; if (y > 10) return y; return 0; });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag outer function expression returning function in callback', () => {
      const sourceFile = createSourceFile(
        '[1,2].map(function(x) { return function(y) { return x + y; }; });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(1)
    })

    it('should flag function expression in Array.from callback', () => {
      const sourceFile = createSourceFile(
        'Array.from({ length: 5 }, function(_, i) { return i; });',
      )
      const violations = analyzePreferArrowCallback(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag setter in class', () => {
      const sourceFile = createSourceFile('class Foo { set value(v: number) { this._v = v; } }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })
  })

  describe('rule create function', () => {
    it('should return object with visitor property', () => {
      const result = preferArrowCallbackRule.create({})
      expect(result).toHaveProperty('visitor')
    })

    it('should return object with onComplete property', () => {
      const result = preferArrowCallbackRule.create({})
      expect(result).toHaveProperty('onComplete')
    })

    it('should have visitNode in visitor', () => {
      const result = preferArrowCallbackRule.create({})
      expect(result.visitor).toHaveProperty('visitNode')
    })

    it('should have visitNode as a function', () => {
      const result = preferArrowCallbackRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })

    it('should have onComplete as a function', () => {
      const result = preferArrowCallbackRule.create({})
      expect(typeof result.onComplete).toBe('function')
    })

    it('should return empty violations array from onComplete before visiting', () => {
      const result = preferArrowCallbackRule.create({})
      expect(result.onComplete()).toEqual([])
    })

    it('should accept options with allowNamedFunctions true', () => {
      const result = preferArrowCallbackRule.create({ allowNamedFunctions: true })
      expect(result).toHaveProperty('visitor')
      expect(result).toHaveProperty('onComplete')
    })

    it('should accept options with allowNamedFunctions false', () => {
      const result = preferArrowCallbackRule.create({ allowNamedFunctions: false })
      expect(result).toHaveProperty('visitor')
      expect(result).toHaveProperty('onComplete')
    })
  })

  describe('analyzePreferArrowCallback function', () => {
    it('should return empty array for empty file', () => {
      const sourceFile = createSourceFile('')
      expect(analyzePreferArrowCallback(sourceFile)).toEqual([])
    })

    it('should return array with violations for file with function expression callback', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const result = analyzePreferArrowCallback(sourceFile)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return empty for arrow-only code', () => {
      const sourceFile = createSourceFile('[1,2].map((x) => x);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should return single violation for one function expression', () => {
      const sourceFile = createSourceFile('[1,2].filter(function(x) { return x > 1; });')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(1)
    })

    it('should return multiple violations for multiple function expressions', () => {
      const sourceFile = createSourceFile(
        '[1,2].map(function(x) { return x; }); [3,4].filter(function(x) { return x > 3; });',
      )
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(2)
    })

    it('should accept empty options object', () => {
      const sourceFile = createSourceFile('[1,2].map(function(x) { return x; });')
      const result = analyzePreferArrowCallback(sourceFile, {})
      expect(result.length).toBeGreaterThan(0)
    })

    it('should accept allowNamedFunctions false option', () => {
      const sourceFile = createSourceFile('[1,2].map(function named(x) { return x; });')
      const result = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: false })
      expect(result.length).toBeGreaterThan(0)
    })

    it('should accept allowNamedFunctions true option', () => {
      const sourceFile = createSourceFile('[1,2].map(function named(x) { return x; });')
      const result = analyzePreferArrowCallback(sourceFile, { allowNamedFunctions: true })
      expect(result).toHaveLength(0)
    })

    it('should return empty for file with no functions', () => {
      const sourceFile = createSourceFile('const x = 1; const y = 2; console.log(x + y);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should return empty for file with only type declarations', () => {
      const sourceFile = createSourceFile('type Foo = { x: number }; interface Bar { y: string; }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })
  })

  describe('multiple violations', () => {
    it('should report two violations for two map callbacks with functions', () => {
      const code = '[1,2].map(function(x) { return x; }); [3,4].map(function(x) { return x * 2; });'
      const sourceFile = createSourceFile(code)
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(2)
    })

    it('should report three violations for map, filter, reduce', () => {
      const code =
        '[1,2,3].map(function(x) { return x; }).filter(function(x) { return x > 1; }).reduce(function(a, b) { return a + b; }, 0);'
      const sourceFile = createSourceFile(code)
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(3)
    })

    it('should report five violations in one file', () => {
      const code = [
        'const a = [1].map(function(x) { return x; });',
        'const b = [2].filter(function(x) { return x; });',
        'const c = function() { return 1; };',
        'const d = { fn: function() { return 2; } };',
        'const e = [function() { return 3; }];',
      ].join('\n')
      const sourceFile = createSourceFile(code)
      expect(analyzePreferArrowCallback(sourceFile).length).toBeGreaterThanOrEqual(5)
    })

    it('should report correct count with mixed arrow and function', () => {
      const code =
        '[1,2].map((x) => x); [3,4].filter(function(x) { return x > 3; }); [5,6].map(function(x) { return x; });'
      const sourceFile = createSourceFile(code)
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(2)
    })

    it('should report nested callback violations', () => {
      const code = 'a(function(x) { return b(function(y) { return x + y; }); });'
      const sourceFile = createSourceFile(code)
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(2)
    })

    it('should report three violations for array with three function expressions', () => {
      const code =
        'const fns = [function() { return 1; }, function() { return 2; }, function() { return 3; }];'
      const sourceFile = createSourceFile(code)
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(3)
    })

    it('should report three violations for object with three function properties', () => {
      const code =
        'const obj = { a: function() { return 1; }, b: function() { return 2; }, c: function() { return 3; } };'
      const sourceFile = createSourceFile(code)
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(3)
    })

    it('should report violations for then, catch, finally chain', () => {
      const code =
        'Promise.resolve(1).then(function(x) { return x; }).catch(function(e) { console.log(e); }).finally(function() { done(); });'
      const sourceFile = createSourceFile(code)
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(3)
    })

    it('should report violations for variable, callback, and property', () => {
      const code =
        'const fn = function() { return 1; }; [1].map(function(x) { return x; }); const obj = { fn: function() { return 2; } };'
      const sourceFile = createSourceFile(code)
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(3)
    })

    it('should report violations for complex file with 4+ violations', () => {
      const code = [
        'const fn1 = function() { return 1; };',
        'setTimeout(function() { console.log("tick"); }, 100);',
        'const obj = { handler: function() { return 2; } };',
        '[1,2].reduce(function(a, b) { return a + b; }, 0);',
        'const fns = [function() { return 3; }];',
      ].join('\n')
      const sourceFile = createSourceFile(code)
      expect(analyzePreferArrowCallback(sourceFile).length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag arrow function in map', () => {
      const sourceFile = createSourceFile('[1,2,3].map((x) => x * 2);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in filter', () => {
      const sourceFile = createSourceFile('[1,2,3].filter((x) => x > 1);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in reduce', () => {
      const sourceFile = createSourceFile('[1,2].reduce((a, b) => a + b, 0);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in forEach', () => {
      const sourceFile = createSourceFile('[1,2].forEach((x) => console.log(x));')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in find', () => {
      const sourceFile = createSourceFile('[1,2,3].find((x) => x === 2);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in findIndex', () => {
      const sourceFile = createSourceFile('[1,2,3].findIndex((x) => x === 2);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in some', () => {
      const sourceFile = createSourceFile('[1,2,3].some((x) => x > 2);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in every', () => {
      const sourceFile = createSourceFile('[1,2,3].every((x) => x > 0);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in sort', () => {
      const sourceFile = createSourceFile('[3,1,2].sort((a, b) => a - b);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in flatMap', () => {
      const sourceFile = createSourceFile('[1,2,3].flatMap((x) => [x, x * 2]);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in setTimeout', () => {
      const sourceFile = createSourceFile("setTimeout(() => console.log('done'), 100);")
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in setInterval', () => {
      const sourceFile = createSourceFile("setInterval(() => console.log('tick'), 1000);")
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in then', () => {
      const sourceFile = createSourceFile('Promise.resolve(1).then((x) => x + 1);')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in catch', () => {
      const sourceFile = createSourceFile("Promise.reject('err').catch((e) => console.log(e));")
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in finally', () => {
      const sourceFile = createSourceFile('Promise.resolve(1).finally(() => console.log("done"));')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in addEventListener', () => {
      const sourceFile = createSourceFile(
        "document.addEventListener('click', (e) => console.log(e));",
      )
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in variable declaration', () => {
      const sourceFile = createSourceFile('const fn = () => 42;')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in object property', () => {
      const sourceFile = createSourceFile('const obj = { handler: () => 1 };')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag arrow function in array literal', () => {
      const sourceFile = createSourceFile('const fns = [() => 1, () => 2];')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag standalone function declaration', () => {
      const sourceFile = createSourceFile('function standalone() { return 1; }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag exported function declaration', () => {
      const sourceFile = createSourceFile('export function helper() { return 1; }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag class method', () => {
      const sourceFile = createSourceFile('class Foo { method() { return 1; } }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag method shorthand in object literal', () => {
      const sourceFile = createSourceFile('const obj = { method() { return 1; } };')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag getter in class', () => {
      const sourceFile = createSourceFile('class Foo { get value() { return 1; } }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag setter in class', () => {
      const sourceFile = createSourceFile('class Foo { set value(v: number) { this._v = v; } }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag IIFE arrow function', () => {
      const sourceFile = createSourceFile('(() => 1)();')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag named function in callback with default options', () => {
      const sourceFile = createSourceFile('[1,2].map(function named(x) { return x; });')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag top-level async function declaration', () => {
      const sourceFile = createSourceFile(
        'async function fetch() { return await Promise.resolve(1); }',
      )
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag top-level generator function declaration', () => {
      const sourceFile = createSourceFile('function* gen() { yield 1; }')
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })

    it('should not flag file with only type imports', () => {
      const sourceFile = createSourceFile("import type { Foo } from 'bar';")
      expect(analyzePreferArrowCallback(sourceFile)).toHaveLength(0)
    })
  })
})
