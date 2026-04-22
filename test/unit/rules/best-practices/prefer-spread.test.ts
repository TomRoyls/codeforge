/**
 * @fileoverview Tests for prefer-spread rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferSpread,
  preferSpreadRule,
} from '../../../../src/rules/best-practices/prefer-spread.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-spread rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferSpreadRule.meta.name).toBe('prefer-spread')
    })
    it('should have style category', () => {
      expect(preferSpreadRule.meta.category).toBe('style')
    })
    it('should be fixable', () => {
      expect(preferSpreadRule.meta.fixable).toBe('code')
    })
    it('should have description', () => {
      expect(preferSpreadRule.meta.description).toBeDefined()
      expect(typeof preferSpreadRule.meta.description).toBe('string')
    })
    it('should mention spread in description', () => {
      expect(preferSpreadRule.meta.description).toContain('spread')
    })
    it('should be recommended', () => {
      expect(preferSpreadRule.meta.recommended).toBe(true)
    })
    it('should have info severity', () => {
      expect(preferSpreadRule.meta.severity).toBe('info')
    })
    it('should have defaultOptions as empty object', () => {
      expect(preferSpreadRule.defaultOptions).toEqual({})
    })
    it('should have create function', () => {
      expect(typeof preferSpreadRule.create).toBe('function')
    })
  })

  describe('detecting .concat()', () => {
    it('should detect arr.concat(other)', () => {
      const sf = createSourceFile('const result = arr.concat(other);')
      const violations = analyzePreferSpread(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('spread')
    })
    it('should detect arr.concat(a, b)', () => {
      const sf = createSourceFile('const result = arr.concat(a, b);')
      const violations = analyzePreferSpread(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].suggestion).toContain('...a')
      expect(violations[0].suggestion).toContain('...b')
    })
    it('should provide correct suggestion', () => {
      const sf = createSourceFile('const result = [1, 2].concat([3, 4]);')
      const violations = analyzePreferSpread(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].suggestion).toBe('Replace with: [[1, 2], ...[3, 4]]')
    })
    it('should handle chained concat', () => {
      const sf = createSourceFile('const result = arr.concat(a).concat(b);')
      const violations = analyzePreferSpread(sf)
      expect(violations).toHaveLength(2)
    })
    it('should report correct ruleId', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf)[0].ruleId).toBe('prefer-spread')
    })
    it('should report info severity', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf)[0].severity).toBe('info')
    })
    it('should have range property', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf)[0].range).toBeDefined()
    })
    it('should have filePath property', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf)[0].filePath).toBeDefined()
    })
    it('should detect in variable declaration', () => {
      const sf = createSourceFile('const merged = list1.concat(list2);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in return statement', () => {
      const sf = createSourceFile('function merge(a, b) { return a.concat(b); }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in assignment', () => {
      const sf = createSourceFile('let result; result = a.concat(b);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in if condition', () => {
      const sf = createSourceFile('if (arr.concat(other).length > 0) { }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in ternary', () => {
      const sf = createSourceFile('const x = flag ? a.concat(b) : [];')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in function argument', () => {
      const sf = createSourceFile('process(items.concat(more));')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in array element', () => {
      const sf = createSourceFile('const arr = [a.concat(b)];')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in object property', () => {
      const sf = createSourceFile('const obj = { items: a.concat(b) };')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in template expression', () => {
      const sf = createSourceFile('const s = `${a.concat(b)}`;')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect with property access receiver', () => {
      const sf = createSourceFile('const x = obj.data.concat(other);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect with computed property receiver', () => {
      const sf = createSourceFile('const x = obj[key].concat(other);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect with three arguments', () => {
      const sf = createSourceFile('const x = arr.concat(a, b, c);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect multiple in same file', () => {
      const sf = createSourceFile('const a = x.concat(y);\nconst b = p.concat(q);')
      expect(analyzePreferSpread(sf)).toHaveLength(2)
    })
    it('should detect three in same file', () => {
      const sf = createSourceFile(
        'const a = x.concat(y);\nconst b = p.concat(q);\nconst c = m.concat(n);',
      )
      expect(analyzePreferSpread(sf)).toHaveLength(3)
    })
    it('should detect in arrow function', () => {
      const sf = createSourceFile('const merge = (a, b) => a.concat(b);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in class method', () => {
      const sf = createSourceFile('class C { merge(b) { return this.data.concat(b); } }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in async function', () => {
      const sf = createSourceFile('async function fn() { return a.concat(b); }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in generator', () => {
      const sf = createSourceFile('function* gen() { yield arr.concat(other); }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in try-catch', () => {
      const sf = createSourceFile('try { const x = a.concat(b); } catch(e) {}')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in namespace', () => {
      const sf = createSourceFile('namespace NS { export const x = a.concat(b); }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in exported function', () => {
      const sf = createSourceFile('export function merge(a, b) { return a.concat(b); }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in default export', () => {
      const sf = createSourceFile('export default function() { return a.concat(b); }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect with string concat', () => {
      const sf = createSourceFile('const x = str.concat(other);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect with array literal receiver', () => {
      const sf = createSourceFile('const x = [1, 2].concat([3, 4]);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in logical AND', () => {
      const sf = createSourceFile('const x = flag && a.concat(b);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in logical OR', () => {
      const sf = createSourceFile('const x = a.concat(b) || [];')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should detect in nullish coalescing', () => {
      const sf = createSourceFile('const x = a.concat(b) ?? [];')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
  })

  describe('suggestion format', () => {
    it('should start with Replace with:', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf)[0].suggestion).toContain('Replace with:')
    })
    it('should include spread operator', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf)[0].suggestion).toContain('...other')
    })
    it('should wrap in array brackets', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      const suggestion = analyzePreferSpread(sf)[0].suggestion
      expect(suggestion).toContain('[arr')
      expect(suggestion).toContain(']')
    })
    it('should handle multiple args with spreads', () => {
      const sf = createSourceFile('const x = arr.concat(a, b);')
      const suggestion = analyzePreferSpread(sf)[0].suggestion
      expect(suggestion).toContain('...a')
      expect(suggestion).toContain('...b')
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag arr.concat() with no arguments', () => {
      const sf = createSourceFile('const copy = arr.concat();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag spread operator usage', () => {
      const sf = createSourceFile('const result = [...arr, ...other];')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag non-concat methods', () => {
      const sf = createSourceFile('const result = arr.map(x => x * 2);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag numeric literal', () => {
      const sf = createSourceFile('const x = 42;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag string literal', () => {
      const sf = createSourceFile('const x = "hello";')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sf = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sf = createSourceFile('const x = [1, 2, 3];')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag class declaration', () => {
      const sf = createSourceFile('class Foo {}')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sf = createSourceFile("import { x } from 'y';")
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar: string }')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag map operation', () => {
      const sf = createSourceFile('const x = arr.map(x => x * 2);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag filter operation', () => {
      const sf = createSourceFile('const x = arr.filter(x => x > 1);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag reduce operation', () => {
      const sf = createSourceFile('const x = arr.reduce((a, b) => a + b, 0);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag find operation', () => {
      const sf = createSourceFile('const x = arr.find(x => x === 2);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag some operation', () => {
      const sf = createSourceFile('const x = arr.some(x => x > 0);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag every operation', () => {
      const sf = createSourceFile('const x = arr.every(x => x > 0);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag forEach operation', () => {
      const sf = createSourceFile('arr.forEach(x => console.log(x));')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag includes operation', () => {
      const sf = createSourceFile('const x = arr.includes(1);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag indexOf operation', () => {
      const sf = createSourceFile('const x = arr.indexOf(1);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag join operation', () => {
      const sf = createSourceFile('const x = arr.join(",");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag sort operation', () => {
      const sf = createSourceFile('const x = arr.sort();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag slice operation', () => {
      const sf = createSourceFile('const x = arr.slice(0, 5);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag flat operation', () => {
      const sf = createSourceFile('const x = arr.flat();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag flatMap operation', () => {
      const sf = createSourceFile('const x = arr.flatMap(x => [x]);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag push method', () => {
      const sf = createSourceFile('arr.push(1);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag pop method', () => {
      const sf = createSourceFile('arr.pop();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < arr.length; i++) { }')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag while loop', () => {
      const sf = createSourceFile('while (true) { break; }')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag switch statement', () => {
      const sf = createSourceFile('switch(x) { case 1: break; }')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag ternary without concat', () => {
      const sf = createSourceFile('const x = a ? b : c;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const x = a ?? b;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const x = a?.b?.c;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag template literal', () => {
      const sf = createSourceFile('const s = `hello ${name}`;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag type alias', () => {
      const sf = createSourceFile('type Foo = { bar: string };')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag enum', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag destructuring', () => {
      const sf = createSourceFile('const { a, b } = obj;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag spread without concat', () => {
      const sf = createSourceFile('const x = { ...obj, a: 1 };')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile('const t = typeof x;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sf = createSourceFile('const x = a instanceof Array;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag new expression', () => {
      const sf = createSourceFile('const map = new Map();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag delete operator', () => {
      const sf = createSourceFile('delete obj.key;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sf = createSourceFile('void 0;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag yield expression', () => {
      const sf = createSourceFile('function* gen() { yield 1; }')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag await expression', () => {
      const sf = createSourceFile('async function fn() { await promise; }')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag throw statement', () => {
      const sf = createSourceFile('throw new Error("fail");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag debugger statement', () => {
      const sf = createSourceFile('debugger;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag try-finally', () => {
      const sf = createSourceFile('try { fn(); } finally { cleanup(); }')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag JSON methods', () => {
      const sf = createSourceFile('const x = JSON.parse(str);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Math methods', () => {
      const sf = createSourceFile('const x = Math.max(1, 2);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Object methods', () => {
      const sf = createSourceFile('const keys = Object.keys(obj);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Array.from', () => {
      const sf = createSourceFile('const arr = Array.from({ length: 5 });')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Promise.all', () => {
      const sf = createSourceFile('const results = Promise.all(promises);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Set.has', () => {
      const sf = createSourceFile('const x = set.has(1);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Map.get', () => {
      const sf = createSourceFile('const x = map.get("key");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag for..of loop', () => {
      const sf = createSourceFile('for (const item of arr) { console.log(item); }')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag do..while loop', () => {
      const sf = createSourceFile('do { x++; } while (x < 10);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag multiple valid patterns', () => {
      const sf = createSourceFile('const a = [...arr, ...other];\nconst b = arr.map(x => x);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should have all required properties', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      const v = analyzePreferSpread(sf)[0]
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('range')
      expect(v).toHaveProperty('suggestion')
    })
    it('should have correct property types', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      const v = analyzePreferSpread(sf)[0]
      expect(typeof v.ruleId).toBe('string')
      expect(typeof v.severity).toBe('string')
      expect(typeof v.message).toBe('string')
      expect(typeof v.filePath).toBe('string')
      expect(typeof v.suggestion).toBe('string')
      expect(typeof v.range).toBe('object')
    })
    it('should have filePath containing test.ts', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf)[0].filePath).toContain('test.ts')
    })
    it('should have unique ranges for multiple violations', () => {
      const sf = createSourceFile('const a = x.concat(y);\nconst b = p.concat(q);')
      const violations = analyzePreferSpread(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
  })

  describe('edge cases', () => {
    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should handle file with only comments', () => {
      const sf = createSourceFile('// comment\n/* block */')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should handle code with comments', () => {
      const sf = createSourceFile('// merge\nconst x = arr.concat(other); /* end */')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should handle type annotations', () => {
      const sf = createSourceFile('const x: number[] = arr.concat(other);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should handle nested concat', () => {
      const sf = createSourceFile('const x = a.concat(b.concat(c));')
      expect(analyzePreferSpread(sf)).toHaveLength(2)
    })
    it('should handle private method', () => {
      const sf = createSourceFile('class C { #merge(b) { return this.data.concat(b); } }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should handle class getter', () => {
      const sf = createSourceFile('class C { get items() { return this.a.concat(this.b); } }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should handle class static method', () => {
      const sf = createSourceFile('class C { static merge(a, b) { return a.concat(b); } }')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should handle callback', () => {
      const sf = createSourceFile('promise.then(() => a.concat(b));')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should handle conditional expression', () => {
      const sf = createSourceFile('const x = flag ? a.concat(b) : [];')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should handle mixed valid and invalid', () => {
      const sf = createSourceFile('const valid = [...arr, ...other];\nconst invalid = a.concat(b);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return visitor and onComplete', () => {
      const result = preferSpreadRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
    it('should return violations array from onComplete', () => {
      const result = preferSpreadRule.create({})
      expect(Array.isArray(result.onComplete())).toBe(true)
    })
    it('should have visitNode in visitor', () => {
      const result = preferSpreadRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })
  })

  describe('with options parameter', () => {
    it('should work with empty options', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf, {})).toHaveLength(1)
    })
    it('should work with no options argument', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
    it('should work with undefined options', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf, undefined)).toHaveLength(1)
    })
  })

  describe('message content', () => {
    it('should mention spread in message', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf)[0].message).toContain('spread')
    })
    it('should mention concat in message', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf)[0].message).toContain('.concat()')
    })
  })

  describe('analyzePreferSpread function', () => {
    it('should return empty array for no violations', () => {
      const sf = createSourceFile('const x = 1 + 2;')
      expect(analyzePreferSpread(sf)).toEqual([])
    })
    it('should return non-empty array for matching pattern', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferSpread(sf).length).toBeGreaterThan(0)
    })
    it('should handle only the pattern as expression', () => {
      const sf = createSourceFile('arr.concat(other)')
      expect(analyzePreferSpread(sf)).toHaveLength(1)
    })
  })

  describe('multiple violations', () => {
    it('should detect four violations', () => {
      const sf = createSourceFile(
        'const a = w.concat(x);\nconst b = y.concat(z);\nconst c = p.concat(q);\nconst d = m.concat(n);',
      )
      expect(analyzePreferSpread(sf)).toHaveLength(4)
    })
    it('should detect five violations', () => {
      const sf = createSourceFile(
        'const a = v.concat(w);\nconst b = x.concat(y);\nconst c = p.concat(q);\nconst d = r.concat(s);\nconst e = m.concat(n);',
      )
      expect(analyzePreferSpread(sf)).toHaveLength(5)
    })
    it('should count correctly with mixed code', () => {
      const sf = createSourceFile(
        'const valid = [...arr];\nconst a = x.concat(y);\nconst valid2 = arr.map(x => x);\nconst b = p.concat(q);',
      )
      expect(analyzePreferSpread(sf)).toHaveLength(2)
    })
    it('should give each violation correct filePath', () => {
      const sf = createSourceFile('const a = x.concat(y);\nconst b = p.concat(q);')
      analyzePreferSpread(sf).forEach((v) => expect(v.filePath).toContain('test.ts'))
    })
  })

  describe('valid code - additional patterns', () => {
    it('should not flag Array.isArray', () => {
      const sf = createSourceFile('const x = Array.isArray(arr);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Object.assign', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Object.freeze', () => {
      const sf = createSourceFile('Object.freeze(obj);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag console methods', () => {
      const sf = createSourceFile('console.warn("msg");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag String methods', () => {
      const sf = createSourceFile('const x = str.toUpperCase();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Number methods', () => {
      const sf = createSourceFile('const x = num.toFixed(2);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Date methods', () => {
      const sf = createSourceFile('const x = date.getTime();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag RegExp exec', () => {
      const sf = createSourceFile('const x = regex.exec(str);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Map set', () => {
      const sf = createSourceFile('map.set("key", "value");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Set add', () => {
      const sf = createSourceFile('set.add(1);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Promise resolve', () => {
      const sf = createSourceFile('Promise.resolve(1);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Symbol', () => {
      const sf = createSourceFile('const s = Symbol("key");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag WeakMap', () => {
      const sf = createSourceFile('const wm = new WeakMap();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag WeakSet', () => {
      const sf = createSourceFile('const ws = new WeakSet();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Proxy', () => {
      const sf = createSourceFile('const p = new Proxy({}, {});')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Reflect', () => {
      const sf = createSourceFile('Reflect.get(obj, "key");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag ArrayBuffer', () => {
      const sf = createSourceFile('const buf = new ArrayBuffer(8);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag DataView', () => {
      const sf = createSourceFile('const dv = new DataView(buf);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Int8Array', () => {
      const sf = createSourceFile('const arr = new Int8Array(8);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Float64Array', () => {
      const sf = createSourceFile('const arr = new Float64Array(8);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Intl methods', () => {
      const sf = createSourceFile('const x = new Intl.NumberFormat().format(123);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag globalThis', () => {
      const sf = createSourceFile('const x = globalThis;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag NaN check', () => {
      const sf = createSourceFile('const x = isNaN(y);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag isFinite check', () => {
      const sf = createSourceFile('const x = isFinite(y);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag parseInt', () => {
      const sf = createSourceFile('const x = parseInt("123");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag parseFloat', () => {
      const sf = createSourceFile('const x = parseFloat("1.5");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag encodeURI', () => {
      const sf = createSourceFile('const x = encodeURI(str);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag decodeURI', () => {
      const sf = createSourceFile('const x = decodeURI(str);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag btoa', () => {
      const sf = createSourceFile('const x = btoa(str);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag atob', () => {
      const sf = createSourceFile('const x = atob(str);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag setTimeout', () => {
      const sf = createSourceFile('setTimeout(() => {}, 100);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag setInterval', () => {
      const sf = createSourceFile('setInterval(() => {}, 100);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag requestAnimationFrame', () => {
      const sf = createSourceFile('requestAnimationFrame(() => {});')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag addEventListener', () => {
      const sf = createSourceFile('document.addEventListener("click", () => {});')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag fetch', () => {
      const sf = createSourceFile('fetch("/api");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag XMLHttpRequest', () => {
      const sf = createSourceFile('const xhr = new XMLHttpRequest();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag WebSocket', () => {
      const sf = createSourceFile('const ws = new WebSocket("ws://localhost");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag localStorage', () => {
      const sf = createSourceFile('localStorage.setItem("key", "value");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag sessionStorage', () => {
      const sf = createSourceFile('sessionStorage.getItem("key");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag indexedDB', () => {
      const sf = createSourceFile('indexedDB.open("db");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag navigator', () => {
      const sf = createSourceFile('const x = navigator.userAgent;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag location', () => {
      const sf = createSourceFile('const x = location.href;')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag history', () => {
      const sf = createSourceFile('history.pushState({}, "");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag crypto', () => {
      const sf = createSourceFile('crypto.getRandomValues(new Uint8Array(8));')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag performance', () => {
      const sf = createSourceFile('performance.now();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag queueMicrotask', () => {
      const sf = createSourceFile('queueMicrotask(() => {});')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag structuredClone', () => {
      const sf = createSourceFile('const x = structuredClone(obj);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag AbortController', () => {
      const sf = createSourceFile('const ac = new AbortController();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag TextEncoder', () => {
      const sf = createSourceFile('const te = new TextEncoder();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag TextDecoder', () => {
      const sf = createSourceFile('const td = new TextDecoder();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag URL', () => {
      const sf = createSourceFile('const u = new URL("http://example.com");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag URLSearchParams', () => {
      const sf = createSourceFile('const p = new URLSearchParams("a=1");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Blob', () => {
      const sf = createSourceFile('const b = new Blob(["data"]);')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag File', () => {
      const sf = createSourceFile('const f = new File(["data"], "file.txt");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag FormData', () => {
      const sf = createSourceFile('const fd = new FormData();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Headers', () => {
      const sf = createSourceFile('const h = new Headers();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Response', () => {
      const sf = createSourceFile('const r = new Response();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Request', () => {
      const sf = createSourceFile('const r = new Request("/api");')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag ReadableStream', () => {
      const sf = createSourceFile('const rs = new ReadableStream();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag WritableStream', () => {
      const sf = createSourceFile('const ws = new WritableStream();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag TransformStream', () => {
      const sf = createSourceFile('const ts = new TransformStream();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag Intl.DateTimeFormat', () => {
      const sf = createSourceFile('const dtf = new Intl.DateTimeFormat();')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
    it('should not flag FinalizationRegistry', () => {
      const sf = createSourceFile('const fr = new FinalizationRegistry(() => {});')
      expect(analyzePreferSpread(sf)).toHaveLength(0)
    })
  })
})
