/**
 * @fileoverview Tests for prefer-array-find rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferArrayFind,
  preferArrayFindRule,
} from '../../../../src/rules/best-practices/prefer-array-find.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-array-find rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferArrayFindRule.meta.name).toBe('prefer-array-find')
    })
    it('should have performance category', () => {
      expect(preferArrayFindRule.meta.category).toBe('performance')
    })
    it('should have warning severity', () => {
      expect(preferArrayFindRule.meta.severity).toBe('warning')
    })
    it('should be recommended', () => {
      expect(preferArrayFindRule.meta.recommended).toBe(true)
    })
    it('should have description', () => {
      expect(preferArrayFindRule.meta.description).toBeDefined()
      expect(typeof preferArrayFindRule.meta.description).toBe('string')
    })
    it('should mention find in description', () => {
      expect(preferArrayFindRule.meta.description).toContain('find()')
    })
    it('should mention filter in description', () => {
      expect(preferArrayFindRule.meta.description).toContain('filter()')
    })
    it('should have defaultOptions as empty object', () => {
      expect(preferArrayFindRule.defaultOptions).toEqual({})
    })
    it('should have create function', () => {
      expect(typeof preferArrayFindRule.create).toBe('function')
    })
  })

  describe('detecting .filter()[0] violations', () => {
    it('should detect simple .filter()[0]', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      const violations = analyzePreferArrayFind(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('.find()')
    })
    it('should detect .filter()[0] with arrow callback', () => {
      const sf = createSourceFile('const item = items.filter(x => x.active)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with complex callback', () => {
      const sf = createSourceFile('const result = users.filter(u => u.age > 18 && u.active)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with Boolean', () => {
      const sf = createSourceFile('const item = arr.filter(Boolean)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in variable declaration', () => {
      const sf = createSourceFile('const first = data.filter(x => x.valid)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in let declaration', () => {
      const sf = createSourceFile('let match = list.filter(isValid)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in return statement', () => {
      const sf = createSourceFile('function getFirst(arr) { return arr.filter(x => x > 0)[0]; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in assignment', () => {
      const sf = createSourceFile('let result; result = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in function argument', () => {
      const sf = createSourceFile('process(items.filter(x => x.active)[0]);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in array element', () => {
      const sf = createSourceFile('const arr = [data.filter(x => x.valid)[0]];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in object property', () => {
      const sf = createSourceFile('const obj = { first: items.filter(x => x.active)[0] };')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in ternary', () => {
      const sf = createSourceFile('const x = flag ? arr.filter(n => n > 0)[0] : null;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in template expression', () => {
      const sf = createSourceFile('const s = `${arr.filter(n => n > 0)[0]}`;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with property access receiver', () => {
      const sf = createSourceFile('const x = obj.items.filter(i => i.active)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with computed property receiver', () => {
      const sf = createSourceFile('const x = obj[key].filter(i => i.active)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with this receiver', () => {
      const sf = createSourceFile(
        'class C { fn() { return this.items.filter(x => x.active)[0]; } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with function expression callback', () => {
      const sf = createSourceFile('const x = arr.filter(function(n) { return n > 0; })[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] without callback', () => {
      const sf = createSourceFile('const x = arr.filter()[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in arrow function body', () => {
      const sf = createSourceFile('const getFirst = (arr) => arr.filter(x => x > 0)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in async function', () => {
      const sf = createSourceFile('async function fn() { return arr.filter(x => x > 0)[0]; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in generator function', () => {
      const sf = createSourceFile('function* gen() { yield arr.filter(x => x > 0)[0]; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in try-catch', () => {
      const sf = createSourceFile('try { const x = arr.filter(n => n > 0)[0]; } catch(e) {}')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in if statement', () => {
      const sf = createSourceFile('if (true) { const x = arr.filter(n => n > 0)[0]; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in namespace', () => {
      const sf = createSourceFile('namespace NS { export const x = arr.filter(n => n > 0)[0]; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in exported function', () => {
      const sf = createSourceFile(
        'export function find(arr) { return arr.filter(x => x.valid)[0]; }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in default export', () => {
      const sf = createSourceFile(
        'export default function() { return arr.filter(x => x.valid)[0]; }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with type annotation', () => {
      const sf = createSourceFile('const x: Item = items.filter(i => i.active)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with logical AND', () => {
      const sf = createSourceFile('const x = flag && arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with logical OR', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0] || null;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with nullish coalescing', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0] ?? null;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in callback', () => {
      const sf = createSourceFile('promise.then(() => arr.filter(x => x.valid)[0]);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in class method', () => {
      const sf = createSourceFile('class C { find(arr) { return arr.filter(x => x.active)[0]; } }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in class static method', () => {
      const sf = createSourceFile(
        'class C { static find(arr) { return arr.filter(x => x.active)[0]; } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in class getter', () => {
      const sf = createSourceFile(
        'class C { get first() { return this.items.filter(x => x.active)[0]; } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in class setter', () => {
      const sf = createSourceFile(
        'class C { set first(val) { this._first = val.filter(x => x.active)[0]; } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] in private method', () => {
      const sf = createSourceFile('class C { #find(arr) { return arr.filter(x => x.active)[0]; } }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter()[0] with chained methods before filter', () => {
      const sf = createSourceFile('const x = arr.map(x => x).filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should not flag .filter()[0] wrapped in parentheses (parenthesized expression)', () => {
      const sf = createSourceFile('const x = (arr.filter(n => n > 0))[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should detect .filter()[0] with deeply nested callback', () => {
      const sf = createSourceFile('const x = arr.filter(item => item.nested.deep.prop > 0)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
  })

  describe('detecting .filter().shift() violations', () => {
    it('should detect simple .filter().shift()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).shift();')
      const violations = analyzePreferArrayFind(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('.find()')
    })
    it('should detect .filter().shift() with arrow callback', () => {
      const sf = createSourceFile('const item = items.filter(x => x.active).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with complex callback', () => {
      const sf = createSourceFile(
        'const result = users.filter(u => u.age > 18 && u.active).shift();',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with Boolean', () => {
      const sf = createSourceFile('const item = arr.filter(Boolean).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in variable declaration', () => {
      const sf = createSourceFile('const first = data.filter(x => x.valid).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in let declaration', () => {
      const sf = createSourceFile('let match = list.filter(isValid).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in return statement', () => {
      const sf = createSourceFile(
        'function getFirst(arr) { return arr.filter(x => x > 0).shift(); }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in assignment', () => {
      const sf = createSourceFile('let result; result = arr.filter(n => n > 0).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in function argument', () => {
      const sf = createSourceFile('process(items.filter(x => x.active).shift());')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in array element', () => {
      const sf = createSourceFile('const arr = [data.filter(x => x.valid).shift()];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in object property', () => {
      const sf = createSourceFile('const obj = { first: items.filter(x => x.active).shift() };')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in ternary', () => {
      const sf = createSourceFile('const x = flag ? arr.filter(n => n > 0).shift() : null;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in template expression', () => {
      const sf = createSourceFile('const s = `${arr.filter(n => n > 0).shift()}`;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with property access receiver', () => {
      const sf = createSourceFile('const x = obj.items.filter(i => i.active).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with computed property receiver', () => {
      const sf = createSourceFile('const x = obj[key].filter(i => i.active).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with this receiver', () => {
      const sf = createSourceFile(
        'class C { fn() { return this.items.filter(x => x.active).shift(); } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with function expression callback', () => {
      const sf = createSourceFile('const x = arr.filter(function(n) { return n > 0; }).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() without callback', () => {
      const sf = createSourceFile('const x = arr.filter().shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in arrow function body', () => {
      const sf = createSourceFile('const getFirst = (arr) => arr.filter(x => x > 0).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in async function', () => {
      const sf = createSourceFile('async function fn() { return arr.filter(x => x > 0).shift(); }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in generator function', () => {
      const sf = createSourceFile('function* gen() { yield arr.filter(x => x > 0).shift(); }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in try-catch', () => {
      const sf = createSourceFile('try { const x = arr.filter(n => n > 0).shift(); } catch(e) {}')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in namespace', () => {
      const sf = createSourceFile(
        'namespace NS { export const x = arr.filter(n => n > 0).shift(); }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in exported function', () => {
      const sf = createSourceFile(
        'export function find(arr) { return arr.filter(x => x.valid).shift(); }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in default export', () => {
      const sf = createSourceFile(
        'export default function() { return arr.filter(x => x.valid).shift(); }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with type annotation', () => {
      const sf = createSourceFile('const x: Item = items.filter(i => i.active).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with logical AND', () => {
      const sf = createSourceFile('const x = flag && arr.filter(n => n > 0).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with logical OR', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).shift() || null;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with nullish coalescing', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).shift() ?? null;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in callback', () => {
      const sf = createSourceFile('promise.then(() => arr.filter(x => x.valid).shift());')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in class method', () => {
      const sf = createSourceFile(
        'class C { find(arr) { return arr.filter(x => x.active).shift(); } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with chained methods before filter', () => {
      const sf = createSourceFile('const x = arr.map(x => x).filter(n => n > 0).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() with deeply nested callback', () => {
      const sf = createSourceFile(
        'const x = arr.filter(item => item.nested.deep.prop > 0).shift();',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in class static method', () => {
      const sf = createSourceFile(
        'class C { static find(arr) { return arr.filter(x => x.active).shift(); } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in class getter', () => {
      const sf = createSourceFile(
        'class C { get first() { return this.items.filter(x => x.active).shift(); } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in private method', () => {
      const sf = createSourceFile(
        'class C { #find(arr) { return arr.filter(x => x.active).shift(); } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in module', () => {
      const sf = createSourceFile('module M { export const x = arr.filter(n => n > 0).shift(); }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in async arrow', () => {
      const sf = createSourceFile(
        'const fn = async () => { return arr.filter(x => x > 0).shift(); }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect .filter().shift() in async generator', () => {
      const sf = createSourceFile('async function* gen() { yield arr.filter(x => x > 0).shift(); }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag .find()', () => {
      const sf = createSourceFile('const x = arr.find(n => n > 0);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter() without index', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter()[1]', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[1];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter() with variable index', () => {
      const sf = createSourceFile('const idx = 0; const x = arr.filter(n => n > 0)[idx];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter() with expression index', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[idx + 1];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .map()', () => {
      const sf = createSourceFile('const x = arr.map(n => n * 2);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .reduce()', () => {
      const sf = createSourceFile('const x = arr.reduce((a, b) => a + b, 0);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .some()', () => {
      const sf = createSourceFile('const x = arr.some(n => n > 0);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .every()', () => {
      const sf = createSourceFile('const x = arr.every(n => n > 0);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .forEach()', () => {
      const sf = createSourceFile('arr.forEach(n => console.log(n));')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .includes()', () => {
      const sf = createSourceFile('const x = arr.includes(1);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .indexOf()', () => {
      const sf = createSourceFile('const x = arr.indexOf(1);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .join()', () => {
      const sf = createSourceFile('const x = arr.join(",");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .sort()', () => {
      const sf = createSourceFile('const x = arr.sort();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .slice()', () => {
      const sf = createSourceFile('const x = arr.slice(0, 5);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .flat()', () => {
      const sf = createSourceFile('const x = arr.flat();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .flatMap()', () => {
      const sf = createSourceFile('const x = arr.flatMap(x => [x]);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .push()', () => {
      const sf = createSourceFile('arr.push(1);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .pop()', () => {
      const sf = createSourceFile('arr.pop();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .concat()', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter()[2]', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[2];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter()[10]', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[10];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter().pop()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).pop();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter().length', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).length;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter().map()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).map(n => n * 2);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag numeric literal', () => {
      const sf = createSourceFile('const x = 42;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag string literal', () => {
      const sf = createSourceFile('const x = "hello";')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sf = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sf = createSourceFile('const x = [1, 2, 3];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag class declaration', () => {
      const sf = createSourceFile('class Foo {}')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sf = createSourceFile("import { x } from 'y';")
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar: string }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag type alias', () => {
      const sf = createSourceFile('type Foo = { bar: string };')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag enum', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < 10; i++) { }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag while loop', () => {
      const sf = createSourceFile('while (true) { break; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag switch statement', () => {
      const sf = createSourceFile('switch(x) { case 1: break; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag destructuring', () => {
      const sf = createSourceFile('const { a, b } = obj;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag array destructuring', () => {
      const sf = createSourceFile('const [a, b] = arr;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const x = a ?? b;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const x = a?.b?.c;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag template literal', () => {
      const sf = createSourceFile('const s = `hello ${name}`;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile('const t = typeof x;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sf = createSourceFile('const x = a instanceof Array;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag new expression', () => {
      const sf = createSourceFile('const map = new Map();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag delete operator', () => {
      const sf = createSourceFile('delete obj.key;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sf = createSourceFile('void 0;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag yield expression', () => {
      const sf = createSourceFile('function* gen() { yield 1; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag await expression', () => {
      const sf = createSourceFile('async function fn() { await promise; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag throw statement', () => {
      const sf = createSourceFile('throw new Error("fail");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag debugger statement', () => {
      const sf = createSourceFile('debugger;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag try-finally', () => {
      const sf = createSourceFile('try { fn(); } finally { cleanup(); }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag JSON methods', () => {
      const sf = createSourceFile('const x = JSON.parse(str);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Math methods', () => {
      const sf = createSourceFile('const x = Math.max(1, 2);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Object methods', () => {
      const sf = createSourceFile('const keys = Object.keys(obj);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Array.from', () => {
      const sf = createSourceFile('const arr = Array.from({ length: 5 });')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Promise.all', () => {
      const sf = createSourceFile('const results = Promise.all(promises);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag for..of loop', () => {
      const sf = createSourceFile('for (const item of arr) { console.log(item); }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag for..in loop', () => {
      const sf = createSourceFile('for (const key in obj) { console.log(key); }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag do..while loop', () => {
      const sf = createSourceFile('do { x++; } while (x < 10);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag export statement', () => {
      const sf = createSourceFile('export { foo } from "./bar";')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag default export', () => {
      const sf = createSourceFile('export default class Foo {}')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag spread in function call', () => {
      const sf = createSourceFile('fn(...args);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter()[0] with non-zero number (negative)', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[-1];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter().find()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).find(n => n < 5);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter().reduce()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).reduce((a, b) => a + b, 0);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter().some()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).some(n => n > 10);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag .filter().forEach()', () => {
      const sf = createSourceFile('arr.filter(n => n > 0).forEach(n => console.log(n));')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag arr[0] without filter', () => {
      const sf = createSourceFile('const x = arr[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag arr.shift() without filter', () => {
      const sf = createSourceFile('const x = arr.shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should have all required properties for filter[0]', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      const v = analyzePreferArrayFind(sf)[0]
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('range')
      expect(v).toHaveProperty('suggestion')
    })
    it('should have all required properties for filter().shift()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).shift();')
      const v = analyzePreferArrayFind(sf)[0]
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('range')
      expect(v).toHaveProperty('suggestion')
    })
    it('should have correct property types', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      const v = analyzePreferArrayFind(sf)[0]
      expect(typeof v.ruleId).toBe('string')
      expect(typeof v.severity).toBe('string')
      expect(typeof v.message).toBe('string')
      expect(typeof v.filePath).toBe('string')
      expect(typeof v.suggestion).toBe('string')
      expect(typeof v.range).toBe('object')
    })
    it('should have correct ruleId for filter[0]', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)[0].ruleId).toBe('prefer-array-find')
    })
    it('should have correct ruleId for filter().shift()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).shift();')
      expect(analyzePreferArrayFind(sf)[0].ruleId).toBe('prefer-array-find')
    })
    it('should have warning severity for filter[0]', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)[0].severity).toBe('warning')
    })
    it('should have warning severity for filter().shift()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).shift();')
      expect(analyzePreferArrayFind(sf)[0].severity).toBe('warning')
    })
    it('should have filePath containing test.ts', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)[0].filePath).toContain('test.ts')
    })
    it('should have range with start and end', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      const v = analyzePreferArrayFind(sf)[0]
      expect(v.range).toHaveProperty('start')
      expect(v.range).toHaveProperty('end')
    })
    it('should have unique ranges for multiple violations', () => {
      const sf = createSourceFile(
        'const a = x.filter(n => n > 0)[0];\nconst b = y.filter(n => n > 0)[0];',
      )
      const violations = analyzePreferArrayFind(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
    it('should return array of violations', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      const violations = analyzePreferArrayFind(sf)
      expect(Array.isArray(violations)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should handle file with only comments', () => {
      const sf = createSourceFile('// comment\n/* block */')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should handle code with comments', () => {
      const sf = createSourceFile('// find first\nconst x = arr.filter(n => n > 0)[0]; /* end */')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle type annotations', () => {
      const sf = createSourceFile('const x: Item = items.filter(i => i.active)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle mixed valid and invalid patterns', () => {
      const sf = createSourceFile(
        'const valid = arr.find(n => n > 0);\nconst invalid = arr.filter(n => n > 0)[0];',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle nested filter[0]', () => {
      const sf = createSourceFile('const x = outer.filter(o => o.items.filter(i => i.active)[0]);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle deeply nested filter[0]', () => {
      const sf = createSourceFile('const x = { a: { b: { c: arr.filter(n => n > 0)[0] } } };')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter[0] as expression statement', () => {
      const sf = createSourceFile('arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter().shift() as expression statement', () => {
      const sf = createSourceFile('arr.filter(n => n > 0).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter[0] in conditional expression', () => {
      const sf = createSourceFile('const x = flag ? arr.filter(n => n > 0)[0] : null;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter().shift() in conditional expression', () => {
      const sf = createSourceFile('const x = flag ? arr.filter(n => n > 0).shift() : null;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter[0] in comma expression', () => {
      const sf = createSourceFile('let x; x = 1, x = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter[0] in IIFE', () => {
      const sf = createSourceFile('(function() { return arr.filter(n => n > 0)[0]; })();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter[0] in nested function', () => {
      const sf = createSourceFile(
        'function outer() { function inner() { return arr.filter(n => n > 0)[0]; } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter[0] with const assertion', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0] as const;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter[0] with as type assertion', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0] as Item;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter().shift() with non-null assertion', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).shift()!;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter[0] in map callback', () => {
      const sf = createSourceFile('const x = arrays.map(arr => arr.filter(n => n > 0)[0]);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter().shift() in map callback', () => {
      const sf = createSourceFile('const x = arrays.map(arr => arr.filter(n => n > 0).shift());')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter[0] in logical AND', () => {
      const sf = createSourceFile('const x = cond && arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter().shift() in logical OR', () => {
      const sf = createSourceFile('const x = null || arr.filter(n => n > 0).shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle filter[0] in nullish coalescing', () => {
      const sf = createSourceFile('const x = undefined ?? arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return visitor and onComplete', () => {
      const result = preferArrayFindRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
    it('should return violations array from onComplete', () => {
      const result = preferArrayFindRule.create({})
      expect(Array.isArray(result.onComplete())).toBe(true)
    })
    it('should have visitNode in visitor', () => {
      const result = preferArrayFindRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })
    it('should return empty violations when no matching nodes', () => {
      const result = preferArrayFindRule.create({})
      expect(result.onComplete()).toEqual([])
    })
    it('should have visitor object', () => {
      const result = preferArrayFindRule.create({})
      expect(typeof result.visitor).toBe('object')
    })
    it('should accept empty options object', () => {
      const result = preferArrayFindRule.create({})
      expect(result).toBeDefined()
    })
  })

  describe('suggestion format', () => {
    it('should start with "Replace with:" for filter[0]', () => {
      const sf = createSourceFile('const item = items.filter(x => x.active)[0];')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('Replace with:')
    })
    it('should start with "Replace with:" for filter().shift()', () => {
      const sf = createSourceFile('const item = items.filter(x => x.active).shift();')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('Replace with:')
    })
    it('should include .find() in suggestion for filter[0]', () => {
      const sf = createSourceFile('const item = items.filter(x => x.active)[0];')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('.find(')
    })
    it('should include .find() in suggestion for filter().shift()', () => {
      const sf = createSourceFile('const item = items.filter(x => x.active).shift();')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('.find(')
    })
    it('should include callback text in suggestion', () => {
      const sf = createSourceFile('const item = items.filter(x => x.active)[0];')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('.find(x => x.active)')
    })
    it('should use "x => x" for filter without callback', () => {
      const sf = createSourceFile('const x = arr.filter()[0];')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('.find(x => x)')
    })
    it('should use "x => x" for filter().shift() without callback', () => {
      const sf = createSourceFile('const x = arr.filter().shift();')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('.find(x => x)')
    })
    it('should include receiver name in suggestion', () => {
      const sf = createSourceFile('const item = items.filter(x => x.active)[0];')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('items.find')
    })
    it('should include property access receiver in suggestion', () => {
      const sf = createSourceFile('const item = obj.items.filter(x => x.active)[0];')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('obj.items.find')
    })
    it('should include this receiver in suggestion', () => {
      const sf = createSourceFile('class C { fn() { return this.data.filter(x => x > 0)[0]; } }')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('this.data.find')
    })
    it('should include complex callback in suggestion', () => {
      const sf = createSourceFile('const result = users.filter(u => u.age > 18 && u.active)[0];')
      const suggestion = analyzePreferArrayFind(sf)[0].suggestion
      expect(suggestion).toContain('users.find')
      expect(suggestion).toContain('u => u.age > 18 && u.active')
    })
    it('should include Boolean callback in suggestion', () => {
      const sf = createSourceFile('const item = arr.filter(Boolean)[0];')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain('.find(Boolean)')
    })
    it('should include function expression callback text in suggestion', () => {
      const sf = createSourceFile('const x = arr.filter(function(n) { return n > 0; })[0];')
      expect(analyzePreferArrayFind(sf)[0].suggestion).toContain(
        '.find(function(n) { return n > 0; })',
      )
    })
  })

  describe('message content', () => {
    it('should contain filter()[0] message for filter[0]', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)[0].message).toContain('.filter()[0]')
    })
    it('should contain filter().shift() message for filter().shift()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).shift();')
      expect(analyzePreferArrayFind(sf)[0].message).toContain('.filter().shift()')
    })
    it('should mention .find() in filter[0] message', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)[0].message).toContain('.find()')
    })
    it('should mention .find() in filter().shift() message', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).shift();')
      expect(analyzePreferArrayFind(sf)[0].message).toContain('.find()')
    })
    it('should say "Use .find() instead" for filter[0]', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf)[0].message).toMatch(/Use .find\(\) instead/)
    })
    it('should say "Use .find() instead" for filter().shift()', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0).shift();')
      expect(analyzePreferArrayFind(sf)[0].message).toMatch(/Use .find\(\) instead/)
    })
  })

  describe('analyze function', () => {
    it('should return empty array for source with no violations', () => {
      const sf = createSourceFile('const x = 1 + 2;')
      expect(analyzePreferArrayFind(sf)).toEqual([])
    })
    it('should return non-empty array for matching pattern', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf).length).toBeGreaterThan(0)
    })
    it('should work with empty options', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf, {})).toHaveLength(1)
    })
    it('should work with undefined options', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      expect(analyzePreferArrayFind(sf, undefined)).toHaveLength(1)
    })
    it('should return violations with consistent structure', () => {
      const sf = createSourceFile('const x = arr.filter(n => n > 0)[0];')
      const violation = analyzePreferArrayFind(sf)[0]
      expect(typeof violation.ruleId).toBe('string')
      expect(typeof violation.severity).toBe('string')
      expect(typeof violation.message).toBe('string')
      expect(typeof violation.filePath).toBe('string')
      expect(typeof violation.suggestion).toBe('string')
      expect(typeof violation.range).toBe('object')
    })
    it('should handle source file with only the pattern', () => {
      const sf = createSourceFile('arr.filter(n => n > 0)[0]')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle deeply nested pattern', () => {
      const sf = createSourceFile(
        'function outer() { if (true) { const x = arr.filter(n => n > 0)[0]; } }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should handle pattern in parenthesized expression', () => {
      const sf = createSourceFile('(arr.filter(n => n > 0)[0])')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should not flag regular array access', () => {
      const sf = createSourceFile('const x = arr[0];')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag regular shift', () => {
      const sf = createSourceFile('const x = arr.shift();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should detect both patterns in same file', () => {
      const sf = createSourceFile(
        'const a = arr.filter(n => n > 0)[0];\nconst b = arr.filter(n => n > 0).shift();',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(2)
    })
    it('should detect in async arrow function', () => {
      const sf = createSourceFile('const fn = async () => { return arr.filter(x => x > 0)[0]; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect in generator function', () => {
      const sf = createSourceFile('function* gen() { yield arr.filter(x => x > 0)[0]; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
    it('should detect in async generator', () => {
      const sf = createSourceFile('async function* gen() { yield arr.filter(x => x > 0)[0]; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(1)
    })
  })

  describe('multiple violations', () => {
    it('should detect two filter[0] in same file', () => {
      const sf = createSourceFile(
        'const a = x.filter(n => n > 0)[0];\nconst b = y.filter(n => n > 0)[0];',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(2)
    })
    it('should detect two filter().shift() in same file', () => {
      const sf = createSourceFile(
        'const a = x.filter(n => n > 0).shift();\nconst b = y.filter(n => n > 0).shift();',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(2)
    })
    it('should detect three violations in same file', () => {
      const sf = createSourceFile(
        'const a = w.filter(n => n > 0)[0];\nconst b = x.filter(n => n > 0)[0];\nconst c = y.filter(n => n > 0)[0];',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(3)
    })
    it('should detect four violations in same file', () => {
      const sf = createSourceFile(
        'const a = w.filter(n => n > 0)[0];\nconst b = x.filter(n => n > 0).shift();\nconst c = y.filter(n => n > 0)[0];\nconst d = z.filter(n => n > 0).shift();',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(4)
    })
    it('should detect five violations in same file', () => {
      const sf = createSourceFile(
        'const a = v.filter(n => n > 0)[0];\nconst b = w.filter(n => n > 0)[0];\nconst c = x.filter(n => n > 0)[0];\nconst d = y.filter(n => n > 0)[0];\nconst e = z.filter(n => n > 0)[0];',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(5)
    })
    it('should count correctly with mixed code', () => {
      const sf = createSourceFile(
        'const valid = arr.find(n => n > 0);\nconst a = x.filter(n => n > 0)[0];\nconst valid2 = arr.map(n => n);\nconst b = y.filter(n => n > 0).shift();',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(2)
    })
    it('should give each violation correct filePath', () => {
      const sf = createSourceFile(
        'const a = x.filter(n => n > 0)[0];\nconst b = y.filter(n => n > 0).shift();',
      )
      analyzePreferArrayFind(sf).forEach((v) => expect(v.filePath).toContain('test.ts'))
    })
    it('should detect violations in different contexts', () => {
      const sf = createSourceFile(
        'function fn1() { return x.filter(n => n > 0)[0]; }\nfunction fn2() { return y.filter(n => n > 0).shift(); }',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(2)
    })
    it('should give each violation unique range', () => {
      const sf = createSourceFile(
        'const a = x.filter(n => n > 0)[0];\nconst b = y.filter(n => n > 0).shift();',
      )
      const violations = analyzePreferArrayFind(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag Set.has', () => {
      const sf = createSourceFile('const x = set.has(1);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Map.get', () => {
      const sf = createSourceFile('const x = map.get("key");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Promise resolve', () => {
      const sf = createSourceFile('Promise.resolve(1);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Symbol', () => {
      const sf = createSourceFile('const s = Symbol("key");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag WeakMap', () => {
      const sf = createSourceFile('const wm = new WeakMap();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag WeakSet', () => {
      const sf = createSourceFile('const ws = new WeakSet();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Proxy', () => {
      const sf = createSourceFile('const p = new Proxy({}, {});')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Reflect', () => {
      const sf = createSourceFile('Reflect.get(obj, "key");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag ArrayBuffer', () => {
      const sf = createSourceFile('const buf = new ArrayBuffer(8);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag DataView', () => {
      const sf = createSourceFile('const dv = new DataView(buf);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Int8Array', () => {
      const sf = createSourceFile('const arr = new Int8Array(8);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Float64Array', () => {
      const sf = createSourceFile('const arr = new Float64Array(8);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag setTimeout', () => {
      const sf = createSourceFile('setTimeout(() => {}, 100);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag setInterval', () => {
      const sf = createSourceFile('setInterval(() => {}, 100);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag fetch', () => {
      const sf = createSourceFile('fetch("/api");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag console methods', () => {
      const sf = createSourceFile('console.log("msg");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag String methods', () => {
      const sf = createSourceFile('const x = str.toUpperCase();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Number methods', () => {
      const sf = createSourceFile('const x = num.toFixed(2);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Date methods', () => {
      const sf = createSourceFile('const x = date.getTime();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag RegExp exec', () => {
      const sf = createSourceFile('const x = regex.exec(str);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Map set', () => {
      const sf = createSourceFile('map.set("key", "value");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Set add', () => {
      const sf = createSourceFile('set.add(1);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Array.isArray', () => {
      const sf = createSourceFile('const x = Array.isArray(arr);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Object.assign', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Object.freeze', () => {
      const sf = createSourceFile('Object.freeze(obj);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Object.entries', () => {
      const sf = createSourceFile('const entries = Object.entries(obj);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Object.values', () => {
      const sf = createSourceFile('const values = Object.values(obj);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag isNaN', () => {
      const sf = createSourceFile('const x = isNaN(y);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag parseInt', () => {
      const sf = createSourceFile('const x = parseInt("123");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag parseFloat', () => {
      const sf = createSourceFile('const x = parseFloat("1.5");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag encodeURI', () => {
      const sf = createSourceFile('const x = encodeURI(str);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag decodeURI', () => {
      const sf = createSourceFile('const x = decodeURI(str);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag btoa', () => {
      const sf = createSourceFile('const x = btoa(str);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag atob', () => {
      const sf = createSourceFile('const x = atob(str);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag globalThis', () => {
      const sf = createSourceFile('const x = globalThis;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag URL constructor', () => {
      const sf = createSourceFile('const u = new URL("http://example.com");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag URLSearchParams', () => {
      const sf = createSourceFile('const p = new URLSearchParams("a=1");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Blob', () => {
      const sf = createSourceFile('const b = new Blob(["data"]);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag FormData', () => {
      const sf = createSourceFile('const fd = new FormData();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Headers', () => {
      const sf = createSourceFile('const h = new Headers();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Response', () => {
      const sf = createSourceFile('const r = new Response();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Request', () => {
      const sf = createSourceFile('const r = new Request("/api");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag ReadableStream', () => {
      const sf = createSourceFile('const rs = new ReadableStream();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag WritableStream', () => {
      const sf = createSourceFile('const ws = new WritableStream();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag TransformStream', () => {
      const sf = createSourceFile('const ts = new TransformStream();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag TextEncoder', () => {
      const sf = createSourceFile('const te = new TextEncoder();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag TextDecoder', () => {
      const sf = createSourceFile('const td = new TextDecoder();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag AbortController', () => {
      const sf = createSourceFile('const ac = new AbortController();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag queueMicrotask', () => {
      const sf = createSourceFile('queueMicrotask(() => {});')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag structuredClone', () => {
      const sf = createSourceFile('const x = structuredClone(obj);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag Intl.NumberFormat', () => {
      const sf = createSourceFile('const x = new Intl.NumberFormat().format(123);')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag FinalizationRegistry', () => {
      const sf = createSourceFile('const fr = new FinalizationRegistry(() => {});')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag multiple valid patterns', () => {
      const sf = createSourceFile(
        'const a = arr.find(n => n > 0);\nconst b = arr.map(n => n * 2);\nconst c = arr.filter(n => n > 0);',
      )
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag labeled statement', () => {
      const sf = createSourceFile('outer: for (let i = 0; i < 10; i++) { break outer; }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag with statement', () => {
      const sf = createSourceFile('with (obj) { x }')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag crypto.getRandomValues', () => {
      const sf = createSourceFile('crypto.getRandomValues(new Uint8Array(8));')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag performance.now', () => {
      const sf = createSourceFile('performance.now();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag localStorage', () => {
      const sf = createSourceFile('localStorage.setItem("key", "value");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag sessionStorage', () => {
      const sf = createSourceFile('sessionStorage.getItem("key");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag navigator', () => {
      const sf = createSourceFile('const x = navigator.userAgent;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag location', () => {
      const sf = createSourceFile('const x = location.href;')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag history', () => {
      const sf = createSourceFile('history.pushState({}, "");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag addEventListener', () => {
      const sf = createSourceFile('document.addEventListener("click", () => {});')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag requestAnimationFrame', () => {
      const sf = createSourceFile('requestAnimationFrame(() => {});')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag XMLHttpRequest', () => {
      const sf = createSourceFile('const xhr = new XMLHttpRequest();')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag WebSocket', () => {
      const sf = createSourceFile('const ws = new WebSocket("ws://localhost");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag File', () => {
      const sf = createSourceFile('const f = new File(["data"], "file.txt");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
    it('should not flag indexedDB', () => {
      const sf = createSourceFile('indexedDB.open("db");')
      expect(analyzePreferArrayFind(sf)).toHaveLength(0)
    })
  })
})
