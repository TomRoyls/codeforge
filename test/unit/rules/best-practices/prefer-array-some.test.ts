import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferArraySome,
  preferArraySomeRule,
} from '../../../../src/rules/best-practices/prefer-array-some.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-array-some rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferArraySomeRule.meta.name).toBe('prefer-array-some')
    })
    it('should have style category', () => {
      expect(preferArraySomeRule.meta.category).toBe('style')
    })
    it('should not be fixable', () => {
      expect(preferArraySomeRule.meta.fixable).toBeUndefined()
    })
    it('should have a description', () => {
      expect(preferArraySomeRule.meta.description).toBeDefined()
      expect(preferArraySomeRule.meta.description.length).toBeGreaterThan(0)
    })
    it('should have default options', () => {
      expect(preferArraySomeRule.defaultOptions).toBeDefined()
    })
    it('should have checkIndexOf defaulting to true', () => {
      expect(preferArraySomeRule.defaultOptions.checkIndexOf).toBe(true)
    })
    it('should have a create function', () => {
      expect(preferArraySomeRule.create).toBeTypeOf('function')
    })
    it('should have meta property', () => {
      expect(preferArraySomeRule).toHaveProperty('meta')
    })
    it('should not be recommended', () => {
      expect(preferArraySomeRule.meta.recommended).toBe(false)
    })
  })

  describe('indexOf existence checks (detected)', () => {
    it('should detect arr.indexOf(x) !== -1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      const violations = analyzePreferArraySome(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('some()')
    })
    it('should detect arr.indexOf(x) != -1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) != -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect arr.indexOf(x) >= 0', () => {
      const sf = createSourceFile('if (arr.indexOf(x) >= 0) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect arr.indexOf(x) > -1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) > -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect with different variable names', () => {
      const sf = createSourceFile('if (items.indexOf(target) !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect with method call argument', () => {
      const sf = createSourceFile('if (list.indexOf(getValue()) !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect with property access argument', () => {
      const sf = createSourceFile('if (arr.indexOf(obj.prop) !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect with string literal argument', () => {
      const sf = createSourceFile('if (arr.indexOf("target") !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect with numeric literal argument', () => {
      const sf = createSourceFile('if (arr.indexOf(42) !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect with property access receiver', () => {
      const sf = createSourceFile('if (this.items.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect with nested property receiver', () => {
      const sf = createSourceFile('if (data.items.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect in ternary condition', () => {
      const sf = createSourceFile('const has = arr.indexOf(x) !== -1 ? true : false;')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect in variable assignment', () => {
      const sf = createSourceFile('const found = arr.indexOf(x) !== -1;')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect in function return', () => {
      const sf = createSourceFile('function has(x) { return arr.indexOf(x) !== -1; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect in arrow function', () => {
      const sf = createSourceFile('const has = (x) => arr.indexOf(x) !== -1;')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect in while condition', () => {
      const sf = createSourceFile('while (arr.indexOf(x) !== -1) { break; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect in logical expression', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1 && cond) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect in negated expression', () => {
      const sf = createSourceFile('if (!(arr.indexOf(x) !== -1)) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect >= 0 with string argument', () => {
      const sf = createSourceFile('if (arr.indexOf("hello") >= 0) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect > -1 with expression argument', () => {
      const sf = createSourceFile('if (arr.indexOf(a + b) > -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
  })

  describe('indexOf absence checks (detected)', () => {
    it('should detect arr.indexOf(x) === -1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) === -1) { }')
      const violations = analyzePreferArraySome(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('every()')
    })
    it('should detect arr.indexOf(x) == -1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) == -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect arr.indexOf(x) < 0', () => {
      const sf = createSourceFile('if (arr.indexOf(x) < 0) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect absence with variable', () => {
      const sf = createSourceFile('if (items.indexOf(target) === -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect absence in variable assignment', () => {
      const sf = createSourceFile('const missing = arr.indexOf(x) === -1;')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect absence in function return', () => {
      const sf = createSourceFile('function missing(x) { return arr.indexOf(x) === -1; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect < 0 with property access', () => {
      const sf = createSourceFile('if (this.data.indexOf(x) < 0) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect absence in ternary', () => {
      const sf = createSourceFile('const missing = arr.indexOf(x) === -1 ? "yes" : "no";')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect absence in while loop', () => {
      const sf = createSourceFile('while (arr.indexOf(x) === -1) { break; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should detect absence in logical OR', () => {
      const sf = createSourceFile('if (arr.indexOf(x) === -1 || !cond) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
  })

  describe('violation properties', () => {
    it('should have correct ruleId', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].ruleId).toBe('prefer-array-some')
    })
    it('should have info severity', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].severity).toBe('info')
    })
    it('should have a message', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].message.length).toBeGreaterThan(0)
    })
    it('should have a suggestion', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].suggestion).toBeDefined()
    })
    it('should have a range', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].range).toBeDefined()
    })
    it('should have a filePath', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].filePath).toBeDefined()
    })
    it('should have existence suggestion for !== -1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].suggestion).toContain('.some(')
    })
    it('should have absence suggestion for === -1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) === -1) { }')
      const suggestion = analyzePreferArraySome(sf)[0].suggestion
      expect(suggestion!.includes('.some(') || suggestion!.includes('.every(')).toBe(true)
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag arr.some()', () => {
      const sf = createSourceFile('if (arr.some(x => x === 1)) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag arr.includes()', () => {
      const sf = createSourceFile('if (arr.includes(x)) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf without comparison', () => {
      const sf = createSourceFile('const index = arr.indexOf(x);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf === 0', () => {
      const sf = createSourceFile('if (arr.indexOf(x) === 0) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag arr.find()', () => {
      const sf = createSourceFile('if (arr.find(x => x === 1)) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag arr.filter()', () => {
      const sf = createSourceFile('const filtered = arr.filter(x => x > 0);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf === 5', () => {
      const sf = createSourceFile('if (arr.indexOf(x) === 5) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf > 0', () => {
      const sf = createSourceFile('if (arr.indexOf(x) > 0) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf >= 1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) >= 1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf !== 0', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== 0) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf < -1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) < -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag non-indexOf method', () => {
      const sf = createSourceFile('if (arr.includes(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag regular comparison', () => {
      const sf = createSourceFile('if (x !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag function declaration', () => {
      const sf = createSourceFile('function foo() { return 1; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag class declaration', () => {
      const sf = createSourceFile('class Foo { bar() {} }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag variable declaration', () => {
      const sf = createSourceFile('const x = 5;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag for-of loop', () => {
      const sf = createSourceFile('for (const item of arr) { console.log(item); }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sf = createSourceFile('import { foo } from "bar";')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag export statement', () => {
      const sf = createSourceFile('export const foo = 42;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag type declaration', () => {
      const sf = createSourceFile('type Foo = { bar: string };')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar: string; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag enum declaration', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle multiple indexOf checks', () => {
      const sf = createSourceFile(`
        if (arr1.indexOf(x) !== -1) { }
        if (arr2.indexOf(y) === -1) { }
      `)
      expect(analyzePreferArraySome(sf)).toHaveLength(2)
    })
    it('should handle nested indexOf checks', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1 && other.indexOf(y) !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(2)
    })
    it('should handle indexOf in class method', () => {
      const sf = createSourceFile(`
        class Finder {
          has(item) {
            return this.items.indexOf(item) !== -1;
          }
        }
      `)
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should handle indexOf in callback', () => {
      const sf = createSourceFile('items.filter(item => list.indexOf(item) !== -1);')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should handle indexOf in switch case', () => {
      const sf = createSourceFile(`
        switch (true) {
          case arr.indexOf(x) !== -1: break;
          default: break;
        }
      `)
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should handle three checks in same expression', () => {
      const sf = createSourceFile(
        'if (a.indexOf(x) !== -1 && b.indexOf(y) !== -1 && c.indexOf(z) !== -1) { }',
      )
      expect(analyzePreferArraySome(sf)).toHaveLength(3)
    })
    it('should handle mixed check types', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1 || arr.indexOf(y) === -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(2)
    })
    it('should handle >= 0 in nested expression', () => {
      const sf = createSourceFile('const valid = items.indexOf(x) >= 0 && items.indexOf(y) >= 0;')
      expect(analyzePreferArraySome(sf)).toHaveLength(2)
    })
    it('should handle > -1 in complex condition', () => {
      const sf = createSourceFile('if ((arr.indexOf(x) > -1) === true) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should handle < 0 with negation', () => {
      const sf = createSourceFile('if (!(arr.indexOf(x) < 0)) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should handle deeply nested indexOf', () => {
      const sf = createSourceFile('const result = fn(arr.indexOf(x) !== -1 ? a : b);')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should handle indexOf in array literal', () => {
      const sf = createSourceFile('const flags = [arr.indexOf(x) !== -1, arr.indexOf(y) !== -1];')
      expect(analyzePreferArraySome(sf)).toHaveLength(2)
    })
    it('should handle indexOf in object literal value', () => {
      const sf = createSourceFile('const obj = { found: arr.indexOf(x) !== -1 };')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should handle indexOf in template expression', () => {
      const sf = createSourceFile('const msg = `Found: ${arr.indexOf(x) !== -1}`;')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return visitor object', () => {
      const result = preferArraySomeRule.create({})
      expect(result).toHaveProperty('visitor')
    })
    it('should return onComplete function', () => {
      const result = preferArraySomeRule.create({})
      expect(result).toHaveProperty('onComplete')
      expect(result.onComplete).toBeTypeOf('function')
    })
    it('should have visitNode in visitor', () => {
      const result = preferArraySomeRule.create({})
      expect(result.visitor).toHaveProperty('visitNode')
    })
  })

  describe('suggestion format', () => {
    it('should suggest .some() for existence check', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].suggestion).toContain('.some(')
    })
    it('should suggest .some() for >= 0 check', () => {
      const sf = createSourceFile('if (arr.indexOf(x) >= 0) { }')
      expect(analyzePreferArraySome(sf)[0].suggestion).toContain('.some(')
    })
    it('should suggest .some() for > -1 check', () => {
      const sf = createSourceFile('if (arr.indexOf(x) > -1) { }')
      expect(analyzePreferArraySome(sf)[0].suggestion).toContain('.some(')
    })
    it('should mention every() or !some() for absence check', () => {
      const sf = createSourceFile('if (arr.indexOf(x) === -1) { }')
      const suggestion = analyzePreferArraySome(sf)[0].suggestion
      expect(suggestion).toContain('every')
    })
    it('should mention readability in suggestion', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].suggestion).toContain('readability')
    })
  })

  describe('message content', () => {
    it('should mention some() for existence', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].message).toContain('some()')
    })
    it('should mention indexOf for existence', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].message).toContain('indexOf')
    })
    it('should mention existence for existence check', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)[0].message).toContain('existence')
    })
    it('should mention every() for absence', () => {
      const sf = createSourceFile('if (arr.indexOf(x) === -1) { }')
      expect(analyzePreferArraySome(sf)[0].message).toContain('every()')
    })
    it('should mention absence for absence check', () => {
      const sf = createSourceFile('if (arr.indexOf(x) === -1) { }')
      expect(analyzePreferArraySome(sf)[0].message).toContain('absence')
    })
  })

  describe('options', () => {
    it('should respect checkIndexOf: false', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf, { checkIndexOf: false })).toHaveLength(0)
    })
    it('should respect checkIndexOf: true', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf, { checkIndexOf: true })).toHaveLength(1)
    })
    it('should default to checkIndexOf: true', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(1)
    })
    it('should work with empty options', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf, {})).toHaveLength(1)
    })
    it('should not flag absence with checkIndexOf: false', () => {
      const sf = createSourceFile('if (arr.indexOf(x) === -1) { }')
      expect(analyzePreferArraySome(sf, { checkIndexOf: false })).toHaveLength(0)
    })
  })

  describe('analyzePreferArraySome function', () => {
    it('should return empty array for empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferArraySome(sf)).toEqual([])
    })
    it('should return array', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(Array.isArray(analyzePreferArraySome(sf))).toBe(true)
    })
    it('should accept options parameter', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== -1) { }')
      expect(analyzePreferArraySome(sf, { checkIndexOf: true })).toHaveLength(1)
    })
  })

  describe('multiple violations', () => {
    it('should detect four separate checks', () => {
      const sf = createSourceFile(`
        if (a.indexOf(x) !== -1) { }
        if (b.indexOf(y) !== -1) { }
        if (c.indexOf(z) === -1) { }
        if (d.indexOf(w) >= 0) { }
      `)
      expect(analyzePreferArraySome(sf)).toHaveLength(4)
    })
    it('should detect in different scopes', () => {
      const sf = createSourceFile(`
        function fn1() { return arr.indexOf(x) !== -1; }
        function fn2() { return arr.indexOf(y) === -1; }
      `)
      expect(analyzePreferArraySome(sf)).toHaveLength(2)
    })
    it('should detect mixed with non-matching code', () => {
      const sf = createSourceFile(`
        const a = 1;
        if (arr.indexOf(x) !== -1) { }
        const b = 2;
        if (arr.indexOf(y) === -1) { }
        const c = 3;
      `)
      expect(analyzePreferArraySome(sf)).toHaveLength(2)
    })
    it('should detect five in single expression', () => {
      const sf = createSourceFile(`
        if (a.indexOf(1)!==-1 && b.indexOf(2)!==-1 && c.indexOf(3)!==-1 && d.indexOf(4)!==-1 && e.indexOf(5)!==-1) {}
      `)
      expect(analyzePreferArraySome(sf)).toHaveLength(5)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag spread operator', () => {
      const sf = createSourceFile('const arr = [...other];')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag destructuring', () => {
      const sf = createSourceFile('const [a, b] = arr;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag object spread', () => {
      const sf = createSourceFile('const obj = { ...defaults };')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag template literal', () => {
      const sf = createSourceFile('const msg = `Hello ${name}`;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const val = obj?.prop;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const val = input ?? "default";')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag Promise', () => {
      const sf = createSourceFile('const r = await Promise.all(promises);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag async function', () => {
      const sf = createSourceFile('async function fn() { return await fetch(url); }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag generator', () => {
      const sf = createSourceFile('function* gen() { yield 1; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag Symbol', () => {
      const sf = createSourceFile('const sym = Symbol("key");')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag Map', () => {
      const sf = createSourceFile('const m = new Map();')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag Set', () => {
      const sf = createSourceFile('const s = new Set();')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag Proxy', () => {
      const sf = createSourceFile('const p = new Proxy(t, h);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag Reflect', () => {
      const sf = createSourceFile('Reflect.set(obj, "k", "v");')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag namespace import', () => {
      const sf = createSourceFile('import * as fs from "fs";')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag type import', () => {
      const sf = createSourceFile('import type { Foo } from "bar";')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile('if (typeof x === "string") { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sf = createSourceFile('if (x instanceof Error) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag ternary operator', () => {
      const sf = createSourceFile('const val = cond ? a : b;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag delete operator', () => {
      const sf = createSourceFile('delete obj.prop;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sf = createSourceFile('void fn();')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag regex literal', () => {
      const sf = createSourceFile('const re = /pattern/g;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag BigInt literal', () => {
      const sf = createSourceFile('const big = 9007199254740991n;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag as const', () => {
      const sf = createSourceFile('const arr = [1, 2, 3] as const;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag type assertion', () => {
      const sf = createSourceFile('const val = x as string;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag satisfies', () => {
      const sf = createSourceFile('const obj = { a: 1 } satisfies Record<string, number>;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag abstract class', () => {
      const sf = createSourceFile('abstract class Base { abstract method(): void; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag keyof', () => {
      const sf = createSourceFile('type Keys = keyof Obj;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag conditional type', () => {
      const sf = createSourceFile('type T = X extends string ? true : false;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag mapped type', () => {
      const sf = createSourceFile('type R<T> = { readonly [K in keyof T]: T[K] };')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag generic function', () => {
      const sf = createSourceFile('function id<T>(x: T): T { return x; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag union type', () => {
      const sf = createSourceFile('type V = string | number;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag intersection type', () => {
      const sf = createSourceFile('type C = A & B;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag tuple type', () => {
      const sf = createSourceFile('const t: [string, number] = ["a", 1];')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag enum member access', () => {
      const sf = createSourceFile('const v = Color.Red;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag namespace', () => {
      const sf = createSourceFile('namespace NS { export const v = 42; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag constructor', () => {
      const sf = createSourceFile('class F { constructor(public x: number) {} }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag get accessor', () => {
      const sf = createSourceFile('class F { get bar() { return 1; } }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag set accessor', () => {
      const sf = createSourceFile('class F { set bar(v: number) { this._v = v; } }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag static method', () => {
      const sf = createSourceFile('class F { static create() { return new F(); } }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag index signature', () => {
      const sf = createSourceFile('interface D { [key: string]: number; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag rest parameter', () => {
      const sf = createSourceFile('function fn(...args: number[]) {}')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag call signature', () => {
      const sf = createSourceFile('interface Fn { (x: number): string; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag construct signature', () => {
      const sf = createSourceFile('interface C { new (x: number): Foo; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag dynamic import', () => {
      const sf = createSourceFile('const m = import("mod");')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag never type', () => {
      const sf = createSourceFile('function fail(): never { throw new Error(); }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag unknown type', () => {
      const sf = createSourceFile('const x: unknown = getValue();')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag unique symbol', () => {
      const sf = createSourceFile('const sym: unique symbol = Symbol();')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag template literal type', () => {
      const sf = createSourceFile('type Route = `/api/${string}`;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag for-await-of', () => {
      const sf = createSourceFile('for await (const item of iter) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag debugger', () => {
      const sf = createSourceFile('debugger;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag empty statement', () => {
      const sf = createSourceFile(';')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag computed property', () => {
      const sf = createSourceFile('const obj = { [key]: value };')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag tagged template', () => {
      const sf = createSourceFile('const s = tag`hello`;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag implements clause', () => {
      const sf = createSourceFile('class F implements I { method() {} }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag infer keyword', () => {
      const sf = createSourceFile('type R = T extends infer U ? U : never;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag declare module', () => {
      const sf = createSourceFile('declare module "foo" { export const bar: string; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag assert function', () => {
      const sf = createSourceFile(
        'function assert(c: boolean): asserts c { if (!c) throw new Error(); }',
      )
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf === -2', () => {
      const sf = createSourceFile('if (arr.indexOf(x) === -2) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf !== 1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) !== 1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf <= -1', () => {
      const sf = createSourceFile('if (arr.indexOf(x) <= -1) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag indexOf == 0', () => {
      const sf = createSourceFile('if (arr.indexOf(x) == 0) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag try-catch', () => {
      const sf = createSourceFile('try { fn(); } catch(e) { console.log(e); }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag switch statement', () => {
      const sf = createSourceFile('switch(x) { case 1: break; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag do-while', () => {
      const sf = createSourceFile('do { x++; } while(x < 10);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < 10; i++) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag for-in', () => {
      const sf = createSourceFile('for (const k in obj) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag throw', () => {
      const sf = createSourceFile('throw new Error("fail");')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag new expression', () => {
      const sf = createSourceFile('const d = new Date();')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag typeof', () => {
      const sf = createSourceFile('const t = typeof x;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag instanceof', () => {
      const sf = createSourceFile('if (x instanceof Array) { }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag logical AND', () => {
      const sf = createSourceFile('const v = x && y;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag logical OR', () => {
      const sf = createSourceFile('const v = x || y;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const v = x ?? y;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag comma expression', () => {
      const sf = createSourceFile('let v = (1, 2, 3);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag labeled statement', () => {
      const sf = createSourceFile('label: for (;;) { break label; }')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag multiple variable declarations', () => {
      const sf = createSourceFile('const a = 1, b = 2, c = 3;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag array destructuring', () => {
      const sf = createSourceFile('const [a, ...rest] = arr;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag object destructuring', () => {
      const sf = createSourceFile('const { a, b } = obj;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag default export', () => {
      const sf = createSourceFile('export default function() {}')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag re-export', () => {
      const sf = createSourceFile('export { foo } from "bar";')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag WeakRef', () => {
      const sf = createSourceFile('const ref = new WeakRef(obj);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag FinalizationRegistry', () => {
      const sf = createSourceFile('const reg = new FinalizationRegistry(() => {});')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag ArrayBuffer', () => {
      const sf = createSourceFile('const buf = new ArrayBuffer(8);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag SharedArrayBuffer', () => {
      const sf = createSourceFile('const buf = new SharedArrayBuffer(8);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag DataView', () => {
      const sf = createSourceFile('const view = new DataView(buf);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag Float32Array', () => {
      const sf = createSourceFile('const arr = new Float32Array(8);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag Int32Array', () => {
      const sf = createSourceFile('const arr = new Int32Array(8);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag Uint8Array', () => {
      const sf = createSourceFile('const arr = new Uint8Array(8);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag BigInt64Array', () => {
      const sf = createSourceFile('const arr = new BigInt64Array(8);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag globalThis', () => {
      const sf = createSourceFile('const g = globalThis;')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag queueMicrotask', () => {
      const sf = createSourceFile('queueMicrotask(() => {});')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
    it('should not flag structuredClone', () => {
      const sf = createSourceFile('const clone = structuredClone(obj);')
      expect(analyzePreferArraySome(sf)).toHaveLength(0)
    })
  })
})
