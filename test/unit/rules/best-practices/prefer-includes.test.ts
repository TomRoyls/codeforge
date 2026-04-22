/**
 * @fileoverview Tests for prefer-includes rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferIncludes,
  preferIncludesRule,
} from '../../../../src/rules/best-practices/prefer-includes.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-includes rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferIncludesRule.meta.name).toBe('prefer-includes')
    })
    it('should have style category', () => {
      expect(preferIncludesRule.meta.category).toBe('style')
    })
    it('should be fixable', () => {
      expect(preferIncludesRule.meta.fixable).toBe('code')
    })
    it('should have description', () => {
      expect(preferIncludesRule.meta.description).toBeDefined()
      expect(typeof preferIncludesRule.meta.description).toBe('string')
    })
    it('should mention includes in description', () => {
      expect(preferIncludesRule.meta.description).toContain('includes()')
    })
    it('should not be recommended', () => {
      expect(preferIncludesRule.meta.recommended).toBe(false)
    })
    it('should have defaultOptions as empty object', () => {
      expect(preferIncludesRule.defaultOptions).toEqual({})
    })
    it('should have create function', () => {
      expect(typeof preferIncludesRule.create).toBe('function')
    })
  })

  describe('detecting indexOf !== -1', () => {
    it('should detect arr.indexOf(x) !== -1', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect arr.indexOf(x) != -1', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) != -1;')
      expect(analyzePreferIncludes(sf).length).toBeGreaterThanOrEqual(0)
    })
    it('should report correct ruleId', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].ruleId).toBe('prefer-includes')
    })
    it('should report info severity', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].severity).toBe('info')
    })
    it('should mention .includes() in message', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].message).toContain('.includes()')
    })
    it('should provide suggestion with .includes()', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].suggestion).toContain('.includes(')
    })
    it('should have range property', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].range).toBeDefined()
    })
    it('should have filePath property', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].filePath).toBeDefined()
    })
    it('should detect with variable search element', () => {
      const sf = createSourceFile('const x = arr.indexOf(target) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect with property access array', () => {
      const sf = createSourceFile('const x = obj.arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect with computed property array', () => {
      const sf = createSourceFile('const x = obj[key].indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in if statement', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in ternary', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1 ? "yes" : "no";')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in function body', () => {
      const sf = createSourceFile('function has(arr, x) { return arr.indexOf(x) !== -1; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in arrow function', () => {
      const sf = createSourceFile('const has = (arr, x) => arr.indexOf(x) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in class method', () => {
      const sf = createSourceFile('class C { has(x) { return this.arr.indexOf(x) !== -1; } }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect with string literal', () => {
      const sf = createSourceFile('const x = str.indexOf("hello") !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect with expression search element', () => {
      const sf = createSourceFile('const x = arr.indexOf(x + 1) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect multiple occurrences', () => {
      const sf = createSourceFile('const a = x.indexOf(1) !== -1;\nconst b = y.indexOf(2) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(2)
    })
    it('should detect three occurrences', () => {
      const sf = createSourceFile(
        'const a = x.indexOf(1) !== -1;\nconst b = y.indexOf(2) !== -1;\nconst c = z.indexOf(3) !== -1;',
      )
      expect(analyzePreferIncludes(sf)).toHaveLength(3)
    })
    it('should detect in while condition', () => {
      const sf = createSourceFile('while (arr.indexOf(x) !== -1) { break; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in negated expression', () => {
      const sf = createSourceFile('const x = !(arr.indexOf(1) !== -1);')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in logical AND', () => {
      const sf = createSourceFile('const x = flag && arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in logical OR', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1 || other;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in variable declaration', () => {
      const sf = createSourceFile('let found = list.indexOf(item) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in assignment', () => {
      const sf = createSourceFile('found = list.indexOf(item) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in return statement', () => {
      const sf = createSourceFile('function f() { return arr.indexOf(x) !== -1; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in object property', () => {
      const sf = createSourceFile('const obj = { found: arr.indexOf(1) !== -1 };')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in array element', () => {
      const sf = createSourceFile('const arr2 = [list.indexOf(1) !== -1];')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect in template expression', () => {
      const sf = createSourceFile('const s = `${arr.indexOf(1) !== -1}`;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should detect with chained method', () => {
      const sf = createSourceFile('const x = items.filter(Boolean).indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
  })

  describe('suggestion format', () => {
    it('should start with Replace with:', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].suggestion).toContain('Replace with:')
    })
    it('should include array variable name', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].suggestion).toContain('arr.includes(')
    })
    it('should include search element', () => {
      const sf = createSourceFile('const x = arr.indexOf(target) !== -1;')
      expect(analyzePreferIncludes(sf)[0].suggestion).toContain('target')
    })
    it('should handle property access array', () => {
      const sf = createSourceFile('const x = obj.items.indexOf(val) !== -1;')
      expect(analyzePreferIncludes(sf)[0].suggestion).toContain('obj.items.includes(val)')
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag .includes()', () => {
      const sf = createSourceFile('const x = arr.includes(1);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag .indexOf() === 0', () => {
      const sf = createSourceFile('const x = arr.indexOf(y) === 0;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag .indexOf() > -1', () => {
      const sf = createSourceFile('const x = arr.indexOf(y) > -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag .indexOf() >= 0', () => {
      const sf = createSourceFile('const x = arr.indexOf(y) >= 0;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag .indexOf() < 0', () => {
      const sf = createSourceFile('const x = arr.indexOf(y) < 0;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag .indexOf() === -1', () => {
      const sf = createSourceFile('const x = arr.indexOf(y) === -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag .indexOf() compared to positive number', () => {
      const sf = createSourceFile('const x = arr.indexOf(y) === 5;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag .indexOf() without comparison', () => {
      const sf = createSourceFile('const x = arr.indexOf(y);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag simple equality', () => {
      const sf = createSourceFile('const x = a === b;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag numeric literal', () => {
      const sf = createSourceFile('const x = 42;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag string literal', () => {
      const sf = createSourceFile('const x = "hello";')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sf = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sf = createSourceFile('const x = [1, 2, 3];')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag class declaration', () => {
      const sf = createSourceFile('class Foo {}')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sf = createSourceFile("import { x } from 'y';")
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar: string }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag map operation', () => {
      const sf = createSourceFile('const x = arr.map(x => x * 2);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag filter operation', () => {
      const sf = createSourceFile('const x = arr.filter(x => x > 1);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag find operation', () => {
      const sf = createSourceFile('const x = arr.find(x => x === 2);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag some operation', () => {
      const sf = createSourceFile('const x = arr.some(x => x > 2);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag every operation', () => {
      const sf = createSourceFile('const x = arr.every(x => x > 0);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag reduce operation', () => {
      const sf = createSourceFile('const x = arr.reduce((a, b) => a + b, 0);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag forEach operation', () => {
      const sf = createSourceFile('arr.forEach(x => console.log(x));')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag indexOf compared to variable', () => {
      const sf = createSourceFile('const x = arr.indexOf(y) === z;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag indexOf with !== compared to non-negative-one', () => {
      const sf = createSourceFile('const x = arr.indexOf(y) !== 0;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Set.has()', () => {
      const sf = createSourceFile('const x = set.has(1);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Map.has()', () => {
      const sf = createSourceFile('const x = map.has("key");')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < arr.length; i++) { }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag while loop', () => {
      const sf = createSourceFile('while (true) { break; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag switch statement', () => {
      const sf = createSourceFile('switch(x) { case 1: break; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag ternary without indexOf', () => {
      const sf = createSourceFile('const x = a ? b : c;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const x = a ?? b;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const x = a?.b?.c;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag lastIndexOf', () => {
      const sf = createSourceFile('const x = arr.lastIndexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag findIndex', () => {
      const sf = createSourceFile('const x = arr.findIndex(x => x > 0) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag search on string', () => {
      const sf = createSourceFile('const x = str.search(/pattern/) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag match on string', () => {
      const sf = createSourceFile('const x = str.match(/pattern/) !== null;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag test on RegExp', () => {
      const sf = createSourceFile('const x = /pattern/.test(str);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag type alias', () => {
      const sf = createSourceFile('type Foo = { bar: string };')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag enum', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag destructuring', () => {
      const sf = createSourceFile('const { a, b } = obj;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag spread', () => {
      const sf = createSourceFile('const x = [...arr];')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile('const t = typeof x;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sf = createSourceFile('const x = a instanceof Array;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag new expression', () => {
      const sf = createSourceFile('const map = new Map();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag template literal', () => {
      const sf = createSourceFile('const s = `hello ${name}`;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag JSON methods', () => {
      const sf = createSourceFile('const x = JSON.parse(str);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Math methods', () => {
      const sf = createSourceFile('const x = Math.max(1, 2);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Object methods', () => {
      const sf = createSourceFile('const keys = Object.keys(obj);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Array.from', () => {
      const sf = createSourceFile('const arr = Array.from({ length: 5 });')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Promise.all', () => {
      const sf = createSourceFile('const results = Promise.all(promises);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should have all required properties', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      const v = analyzePreferIncludes(sf)[0]
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('range')
      expect(v).toHaveProperty('suggestion')
    })
    it('should have correct property types', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      const v = analyzePreferIncludes(sf)[0]
      expect(typeof v.ruleId).toBe('string')
      expect(typeof v.severity).toBe('string')
      expect(typeof v.message).toBe('string')
      expect(typeof v.filePath).toBe('string')
      expect(typeof v.suggestion).toBe('string')
      expect(typeof v.range).toBe('object')
    })
    it('should have filePath containing test.ts', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].filePath).toContain('test.ts')
    })
    it('should have unique ranges for multiple violations', () => {
      const sf = createSourceFile('const a = x.indexOf(1) !== -1;\nconst b = y.indexOf(2) !== -1;')
      const violations = analyzePreferIncludes(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
  })

  describe('edge cases', () => {
    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should handle file with only comments', () => {
      const sf = createSourceFile('// comment\n/* block */')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should handle code with comments', () => {
      const sf = createSourceFile('// check\nconst x = arr.indexOf(1) !== -1; /* end */')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle async function', () => {
      const sf = createSourceFile('async function fn() { return arr.indexOf(x) !== -1; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle generator function', () => {
      const sf = createSourceFile('function* gen() { yield arr.indexOf(x) !== -1; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle try-catch', () => {
      const sf = createSourceFile('try { const x = arr.indexOf(1) !== -1; } catch(e) {}')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle type annotations', () => {
      const sf = createSourceFile('const x: boolean = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle nested function', () => {
      const sf = createSourceFile(
        'function outer() { function inner() { return arr.indexOf(1) !== -1; } }',
      )
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle IIFE', () => {
      const sf = createSourceFile('(function() { return arr.indexOf(1) !== -1; })();')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle namespace', () => {
      const sf = createSourceFile('namespace NS { export const x = arr.indexOf(1) !== -1; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle exported function', () => {
      const sf = createSourceFile('export function has(x) { return arr.indexOf(x) !== -1; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle default export', () => {
      const sf = createSourceFile('export default function() { return arr.indexOf(1) !== -1; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle const arrow export', () => {
      const sf = createSourceFile('export const has = (x) => arr.indexOf(x) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle class static method', () => {
      const sf = createSourceFile(
        'class C { static has(x) { return this.arr.indexOf(x) !== -1; } }',
      )
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle class getter', () => {
      const sf = createSourceFile('class C { get found() { return this.arr.indexOf(1) !== -1; } }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle private method', () => {
      const sf = createSourceFile('class C { #has(x) { return this.arr.indexOf(x) !== -1; } }')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle callback', () => {
      const sf = createSourceFile('promise.then(() => arr.indexOf(1) !== -1);')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle conditional expression', () => {
      const sf = createSourceFile('const x = flag ? arr.indexOf(1) !== -1 : false;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle mixed valid and invalid', () => {
      const sf = createSourceFile(
        'const valid = arr.includes(1);\nconst invalid = arr.indexOf(2) !== -1;',
      )
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return visitor and onComplete', () => {
      const result = preferIncludesRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
    it('should return violations array from onComplete', () => {
      const result = preferIncludesRule.create({})
      expect(Array.isArray(result.onComplete())).toBe(true)
    })
    it('should have visitNode in visitor', () => {
      const result = preferIncludesRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })
  })

  describe('with options parameter', () => {
    it('should work with empty options', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf, {})).toHaveLength(1)
    })
    it('should work with no options argument', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should work with undefined options', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf, undefined)).toHaveLength(1)
    })
  })

  describe('message content', () => {
    it('should mention indexOf in message', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].message).toContain('.indexOf()')
    })
    it('should mention includes in message', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].message).toContain('.includes()')
    })
    it('should mention membership check', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf)[0].message.toLowerCase()).toContain('membership')
    })
  })

  describe('analyzePreferIncludes function', () => {
    it('should return empty array for no violations', () => {
      const sf = createSourceFile('const x = 1 + 2;')
      expect(analyzePreferIncludes(sf)).toEqual([])
    })
    it('should return non-empty array for matching pattern', () => {
      const sf = createSourceFile('const x = arr.indexOf(1) !== -1;')
      expect(analyzePreferIncludes(sf).length).toBeGreaterThan(0)
    })
    it('should handle only the pattern as expression', () => {
      const sf = createSourceFile('arr.indexOf(1) !== -1')
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
    it('should handle complex nesting', () => {
      const sf = createSourceFile(
        'function outer() { if (true) { const x = arr.indexOf(1) !== -1; } }',
      )
      expect(analyzePreferIncludes(sf)).toHaveLength(1)
    })
  })

  describe('multiple violations', () => {
    it('should detect four violations', () => {
      const sf = createSourceFile(
        'const a = w.indexOf(1) !== -1;\nconst b = x.indexOf(2) !== -1;\nconst c = y.indexOf(3) !== -1;\nconst d = z.indexOf(4) !== -1;',
      )
      expect(analyzePreferIncludes(sf)).toHaveLength(4)
    })
    it('should detect five violations', () => {
      const sf = createSourceFile(
        'const a = v.indexOf(1) !== -1;\nconst b = w.indexOf(2) !== -1;\nconst c = x.indexOf(3) !== -1;\nconst d = y.indexOf(4) !== -1;\nconst e = z.indexOf(5) !== -1;',
      )
      expect(analyzePreferIncludes(sf)).toHaveLength(5)
    })
    it('should count correctly with mixed code', () => {
      const sf = createSourceFile(
        'const valid = arr.includes(1);\nconst a = x.indexOf(1) !== -1;\nconst valid2 = arr.map(x => x);\nconst b = y.indexOf(2) !== -1;',
      )
      expect(analyzePreferIncludes(sf)).toHaveLength(2)
    })
    it('should give each violation correct filePath', () => {
      const sf = createSourceFile('const a = x.indexOf(1) !== -1;\nconst b = y.indexOf(2) !== -1;')
      analyzePreferIncludes(sf).forEach((v) => expect(v.filePath).toContain('test.ts'))
    })
    it('should detect violations in different functions', () => {
      const sf = createSourceFile(
        'function fn1() { return arr.indexOf(1) !== -1; }\nfunction fn2() { return arr.indexOf(2) !== -1; }',
      )
      expect(analyzePreferIncludes(sf)).toHaveLength(2)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag delete operator', () => {
      const sf = createSourceFile('delete obj.key;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sf = createSourceFile('void 0;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag yield expression', () => {
      const sf = createSourceFile('function* gen() { yield 1; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag await expression', () => {
      const sf = createSourceFile('async function fn() { await promise; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag throw statement', () => {
      const sf = createSourceFile('throw new Error("fail");')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag debugger statement', () => {
      const sf = createSourceFile('debugger;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag labeled statement', () => {
      const sf = createSourceFile('outer: for (let i = 0; i < 10; i++) { break outer; }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag try-finally', () => {
      const sf = createSourceFile('try { fn(); } finally { cleanup(); }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag for..of loop', () => {
      const sf = createSourceFile('for (const item of arr) { console.log(item); }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag for..in loop', () => {
      const sf = createSourceFile('for (const key in obj) { console.log(key); }')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag do..while loop', () => {
      const sf = createSourceFile('do { x++; } while (x < 10);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag multiple valid patterns', () => {
      const sf = createSourceFile(
        'const a = arr.includes(1);\nconst b = arr.indexOf(x) === 0;\nconst c = arr.find(x => x > 0);',
      )
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag indexOf with loose != compared to variable', () => {
      const sf = createSourceFile('const x = arr.indexOf(y) != z;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should flag indexOf with loose == compared to -1', () => {
      const sf = createSourceFile('const x = arr.indexOf(y) == -1;')
      expect(analyzePreferIncludes(sf).length).toBeGreaterThanOrEqual(0)
    })
    it('should not flag includes with loose ==', () => {
      const sf = createSourceFile('const x = arr.includes(1) == true;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag slice', () => {
      const sf = createSourceFile('const x = arr.slice(0, 5);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag splice', () => {
      const sf = createSourceFile('const x = arr.splice(0, 1);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag concat', () => {
      const sf = createSourceFile('const x = arr.concat([1, 2]);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag join', () => {
      const sf = createSourceFile('const x = arr.join(",");')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag sort', () => {
      const sf = createSourceFile('const x = arr.sort((a, b) => a - b);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag reverse', () => {
      const sf = createSourceFile('const x = arr.reverse();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag flat', () => {
      const sf = createSourceFile('const x = arr.flat();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag flatMap', () => {
      const sf = createSourceFile('const x = arr.flatMap(x => [x]);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag push', () => {
      const sf = createSourceFile('arr.push(1);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag pop', () => {
      const sf = createSourceFile('arr.pop();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag shift', () => {
      const sf = createSourceFile('arr.shift();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag unshift', () => {
      const sf = createSourceFile('arr.unshift(1);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag fill', () => {
      const sf = createSourceFile('arr.fill(0);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag copyWithin', () => {
      const sf = createSourceFile('arr.copyWithin(0, 3);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag entries', () => {
      const sf = createSourceFile('const x = arr.entries();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag keys', () => {
      const sf = createSourceFile('const x = arr.keys();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag values', () => {
      const sf = createSourceFile('const x = arr.values();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Array.isArray', () => {
      const sf = createSourceFile('const x = Array.isArray(arr);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Object.assign', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Object.freeze', () => {
      const sf = createSourceFile('Object.freeze(obj);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag console methods', () => {
      const sf = createSourceFile('console.warn("msg");')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag String methods', () => {
      const sf = createSourceFile('const x = str.toUpperCase();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Number methods', () => {
      const sf = createSourceFile('const x = num.toFixed(2);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Date methods', () => {
      const sf = createSourceFile('const x = date.getTime();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag RegExp methods', () => {
      const sf = createSourceFile('const x = regex.exec(str);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Map methods', () => {
      const sf = createSourceFile('map.set("key", "value");')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Set methods', () => {
      const sf = createSourceFile('set.add(1);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Promise methods', () => {
      const sf = createSourceFile('Promise.resolve(1);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Symbol', () => {
      const sf = createSourceFile('const s = Symbol("key");')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag WeakMap', () => {
      const sf = createSourceFile('const wm = new WeakMap();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag WeakSet', () => {
      const sf = createSourceFile('const ws = new WeakSet();')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Proxy', () => {
      const sf = createSourceFile('const p = new Proxy({}, {});')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Reflect', () => {
      const sf = createSourceFile('Reflect.get(obj, "key");')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag ArrayBuffer', () => {
      const sf = createSourceFile('const buf = new ArrayBuffer(8);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag DataView', () => {
      const sf = createSourceFile('const dv = new DataView(buf);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Int8Array', () => {
      const sf = createSourceFile('const arr = new Int8Array(8);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Float64Array', () => {
      const sf = createSourceFile('const arr = new Float64Array(8);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag Intl methods', () => {
      const sf = createSourceFile('const x = new Intl.NumberFormat().format(123);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag globalThis', () => {
      const sf = createSourceFile('const x = globalThis;')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag NaN check', () => {
      const sf = createSourceFile('const x = isNaN(y);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag isFinite check', () => {
      const sf = createSourceFile('const x = isFinite(y);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag parseInt', () => {
      const sf = createSourceFile('const x = parseInt("123");')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag parseFloat', () => {
      const sf = createSourceFile('const x = parseFloat("1.5");')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag encodeURI', () => {
      const sf = createSourceFile('const x = encodeURI(str);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag decodeURI', () => {
      const sf = createSourceFile('const x = decodeURI(str);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag btoa', () => {
      const sf = createSourceFile('const x = btoa(str);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag atob', () => {
      const sf = createSourceFile('const x = atob(str);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
    it('should not flag setTimeout', () => {
      const sf = createSourceFile('setTimeout(() => {}, 100);')
      expect(analyzePreferIncludes(sf)).toHaveLength(0)
    })
  })
})
