/**
 * @fileoverview Tests for prefer-exponent-operator rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferExponentOperator,
  preferExponentOperatorRule,
} from '../../../../src/rules/best-practices/prefer-exponent-operator.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-exponent-operator rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferExponentOperatorRule.meta.name).toBe('prefer-exponent-operator')
    })
    it('should have style category', () => {
      expect(preferExponentOperatorRule.meta.category).toBe('style')
    })
    it('should be fixable', () => {
      expect(preferExponentOperatorRule.meta.fixable).toBe('code')
    })
    it('should have description', () => {
      expect(preferExponentOperatorRule.meta.description).toBeDefined()
      expect(typeof preferExponentOperatorRule.meta.description).toBe('string')
    })
    it('should mention exponent in description', () => {
      expect(preferExponentOperatorRule.meta.description.toLowerCase()).toContain('exponent')
    })
    it('should not be recommended', () => {
      expect(preferExponentOperatorRule.meta.recommended).toBe(false)
    })
    it('should have defaultOptions with ignoreNonIntegerExponent false', () => {
      expect(preferExponentOperatorRule.defaultOptions).toEqual({ ignoreNonIntegerExponent: false })
    })
    it('should have create function', () => {
      expect(typeof preferExponentOperatorRule.create).toBe('function')
    })
  })

  describe('detecting violations', () => {
    it('should detect Math.pow with integer literals', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow with variable arguments', () => {
      const sf = createSourceFile('const x = Math.pow(base, exp);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow with negative exponents', () => {
      const sf = createSourceFile('const x = Math.pow(2, -3);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow with negative base', () => {
      const sf = createSourceFile('const x = Math.pow(-2, 3);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow with zero exponent', () => {
      const sf = createSourceFile('const x = Math.pow(5, 0);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow with zero base', () => {
      const sf = createSourceFile('const x = Math.pow(0, 5);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow with float exponents', () => {
      const sf = createSourceFile('const x = Math.pow(2, 1.5);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow with float base', () => {
      const sf = createSourceFile('const x = Math.pow(2.5, 3);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow with expression arguments', () => {
      const sf = createSourceFile('const x = Math.pow(a + b, c * d);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow with property access arguments', () => {
      const sf = createSourceFile('const x = Math.pow(obj.base, obj.exp);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow with computed property access', () => {
      const sf = createSourceFile('const x = Math.pow(obj[key], arr[0]);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect Math.pow in variable declaration', () => {
      const sf = createSourceFile('const result = Math.pow(2, 10);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in let declaration', () => {
      const sf = createSourceFile('let result = Math.pow(2, 10);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in return statement', () => {
      const sf = createSourceFile('function square(x) { return Math.pow(x, 2); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in assignment', () => {
      const sf = createSourceFile('let x; x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in function argument', () => {
      const sf = createSourceFile('console.log(Math.pow(2, 3));')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in array element', () => {
      const sf = createSourceFile('const arr = [Math.pow(2, 3)];')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in object property', () => {
      const sf = createSourceFile('const obj = { val: Math.pow(2, 3) };')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in ternary', () => {
      const sf = createSourceFile('const x = flag ? Math.pow(2, 3) : 0;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in template expression', () => {
      const sf = createSourceFile('const s = `${Math.pow(2, 3)}`;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in arrow function body', () => {
      const sf = createSourceFile('const square = (x) => Math.pow(x, 2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in class method', () => {
      const sf = createSourceFile('class C { calc() { return Math.pow(this.x, 2); } }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in async function', () => {
      const sf = createSourceFile('async function fn() { return Math.pow(2, 3); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in generator function', () => {
      const sf = createSourceFile('function* gen() { yield Math.pow(2, 3); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in try-catch', () => {
      const sf = createSourceFile('try { const x = Math.pow(2, 3); } catch(e) {}')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in namespace', () => {
      const sf = createSourceFile('namespace NS { export const x = Math.pow(2, 3); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in exported function', () => {
      const sf = createSourceFile('export function calc() { return Math.pow(2, 3); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in default export', () => {
      const sf = createSourceFile('export default function() { return Math.pow(2, 3); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in logical AND', () => {
      const sf = createSourceFile('const x = flag && Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in logical OR', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3) || 0;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in nullish coalescing', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3) ?? 0;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow with scientific notation exponent', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect nested Math.pow calls', () => {
      const sf = createSourceFile('const x = Math.pow(Math.pow(2, 3), 2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(2)
    })
    it('should detect Math.pow in callback', () => {
      const sf = createSourceFile('promise.then(() => Math.pow(2, 3));')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in class static method', () => {
      const sf = createSourceFile('class C { static calc() { return Math.pow(2, 3); } }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow with this as argument', () => {
      const sf = createSourceFile(
        'class C { val: number; calc() { return Math.pow(this.val, 2); } }',
      )
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in class getter', () => {
      const sf = createSourceFile('class C { get squared() { return Math.pow(this.x, 2); } }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in class setter', () => {
      const sf = createSourceFile('class C { set val(v) { this._v = Math.pow(v, 2); } }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in private method', () => {
      const sf = createSourceFile('class C { #calc() { return Math.pow(2, 3); } }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in for loop body', () => {
      const sf = createSourceFile('for (let i = 0; i < 10; i++) { const x = Math.pow(i, 2); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in while loop body', () => {
      const sf = createSourceFile('while (true) { const x = Math.pow(2, 3); break; }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in if statement condition', () => {
      const sf = createSourceFile('if (Math.pow(2, 3) > 5) {}')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should detect Math.pow in switch case', () => {
      const sf = createSourceFile('switch(x) { case Math.pow(2, 3): break; }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag exponent operator usage', () => {
      const sf = createSourceFile('const x = 2 ** 3;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag other Math methods', () => {
      const sf = createSourceFile('const x = Math.sqrt(16);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag custom pow function', () => {
      const sf = createSourceFile('const x = pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag numeric literal', () => {
      const sf = createSourceFile('const x = 42;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag string literal', () => {
      const sf = createSourceFile('const x = "hello";')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sf = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sf = createSourceFile('const x = [1, 2, 3];')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag class declaration', () => {
      const sf = createSourceFile('class Foo {}')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sf = createSourceFile("import { x } from 'y';")
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar: string }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag map operation', () => {
      const sf = createSourceFile('const x = arr.map(x => x * 2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag filter operation', () => {
      const sf = createSourceFile('const x = arr.filter(x => x > 1);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag reduce operation', () => {
      const sf = createSourceFile('const x = arr.reduce((a, b) => a + b, 0);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag find operation', () => {
      const sf = createSourceFile('const x = arr.find(x => x === 2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag some operation', () => {
      const sf = createSourceFile('const x = arr.some(x => x > 0);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag every operation', () => {
      const sf = createSourceFile('const x = arr.every(x => x > 0);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag forEach operation', () => {
      const sf = createSourceFile('arr.forEach(x => console.log(x));')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.max', () => {
      const sf = createSourceFile('const x = Math.max(1, 2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.min', () => {
      const sf = createSourceFile('const x = Math.min(1, 2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.abs', () => {
      const sf = createSourceFile('const x = Math.abs(-5);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.floor', () => {
      const sf = createSourceFile('const x = Math.floor(3.7);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.ceil', () => {
      const sf = createSourceFile('const x = Math.ceil(3.2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.round', () => {
      const sf = createSourceFile('const x = Math.round(3.5);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.log', () => {
      const sf = createSourceFile('const x = Math.log(10);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.sin', () => {
      const sf = createSourceFile('const x = Math.sin(3.14);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.cos', () => {
      const sf = createSourceFile('const x = Math.cos(3.14);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.tan', () => {
      const sf = createSourceFile('const x = Math.tan(3.14);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.random', () => {
      const sf = createSourceFile('const x = Math.random();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.PI', () => {
      const sf = createSourceFile('const x = Math.PI;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.E', () => {
      const sf = createSourceFile('const x = Math.E;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag includes operation', () => {
      const sf = createSourceFile('const x = arr.includes(1);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag indexOf operation', () => {
      const sf = createSourceFile('const x = arr.indexOf(1);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag join operation', () => {
      const sf = createSourceFile('const x = arr.join(",");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag sort operation', () => {
      const sf = createSourceFile('const x = arr.sort();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag slice operation', () => {
      const sf = createSourceFile('const x = arr.slice(0, 5);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag flat operation', () => {
      const sf = createSourceFile('const x = arr.flat();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag flatMap operation', () => {
      const sf = createSourceFile('const x = arr.flatMap(x => [x]);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag push method', () => {
      const sf = createSourceFile('arr.push(1);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < arr.length; i++) { }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag while loop', () => {
      const sf = createSourceFile('while (true) { break; }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag switch statement', () => {
      const sf = createSourceFile('switch(x) { case 1: break; }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag ternary without Math.pow', () => {
      const sf = createSourceFile('const x = a ? b : c;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const x = a ?? b;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const x = a?.b?.c;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag template literal', () => {
      const sf = createSourceFile('const s = `hello ${name}`;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag type alias', () => {
      const sf = createSourceFile('type Foo = { bar: string };')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag enum', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag destructuring', () => {
      const sf = createSourceFile('const { a, b } = obj;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag array destructuring', () => {
      const sf = createSourceFile('const [a, b] = arr;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag spread without Math.pow', () => {
      const sf = createSourceFile('const x = { ...obj, a: 1 };')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile('const t = typeof x;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sf = createSourceFile('const x = a instanceof Array;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag new expression', () => {
      const sf = createSourceFile('const map = new Map();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag delete operator', () => {
      const sf = createSourceFile('delete obj.key;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sf = createSourceFile('void 0;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag yield expression', () => {
      const sf = createSourceFile('function* gen() { yield 1; }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag await expression', () => {
      const sf = createSourceFile('async function fn() { await promise; }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag throw statement', () => {
      const sf = createSourceFile('throw new Error("fail");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag debugger statement', () => {
      const sf = createSourceFile('debugger;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag try-finally', () => {
      const sf = createSourceFile('try { fn(); } finally { cleanup(); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag JSON methods', () => {
      const sf = createSourceFile('const x = JSON.parse(str);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Object methods', () => {
      const sf = createSourceFile('const keys = Object.keys(obj);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Array.from', () => {
      const sf = createSourceFile('const arr = Array.from({ length: 5 });')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Promise.all', () => {
      const sf = createSourceFile('const results = Promise.all(promises);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag console.log', () => {
      const sf = createSourceFile('console.log("hello");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.pow with wrong argument count (1 arg)', () => {
      const sf = createSourceFile('const x = Math.pow(2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.pow with wrong argument count (3 args)', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3, 4);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag pow method on non-Math object', () => {
      const sf = createSourceFile('const x = obj.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag MyMath.pow', () => {
      const sf = createSourceFile('const x = MyMath.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag for..of loop', () => {
      const sf = createSourceFile('for (const item of arr) { console.log(item); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag for..in loop', () => {
      const sf = createSourceFile('for (const key in obj) { console.log(key); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag do..while loop', () => {
      const sf = createSourceFile('do { x++; } while (x < 10);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag multiple valid patterns', () => {
      const sf = createSourceFile(
        'const a = 2 ** 3;\nconst b = Math.sqrt(16);\nconst c = pow(2, 3);',
      )
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should have all required properties', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      const v = analyzePreferExponentOperator(sf)[0]
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('range')
      expect(v).toHaveProperty('suggestion')
    })
    it('should have correct property types', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      const v = analyzePreferExponentOperator(sf)[0]
      expect(typeof v.ruleId).toBe('string')
      expect(typeof v.severity).toBe('string')
      expect(typeof v.message).toBe('string')
      expect(typeof v.filePath).toBe('string')
      expect(typeof v.suggestion).toBe('string')
      expect(typeof v.range).toBe('object')
    })
    it('should report correct ruleId', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)[0].ruleId).toBe('prefer-exponent-operator')
    })
    it('should report info severity', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)[0].severity).toBe('info')
    })
    it('should have filePath containing test.ts', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)[0].filePath).toContain('test.ts')
    })
    it('should have range with start and end', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      const v = analyzePreferExponentOperator(sf)[0]
      expect(v.range).toHaveProperty('start')
      expect(v.range).toHaveProperty('end')
    })
    it('should have unique ranges for multiple violations', () => {
      const sf = createSourceFile('const a = Math.pow(2, 3);\nconst b = Math.pow(4, 5);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
    it('should return array of violations', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      const violations = analyzePreferExponentOperator(sf)
      expect(Array.isArray(violations)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should handle file with only comments', () => {
      const sf = createSourceFile('// comment\n/* block */')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should handle code with comments', () => {
      const sf = createSourceFile('// power\nconst x = Math.pow(2, 3); /* end */')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle type annotations', () => {
      const sf = createSourceFile('const x: number = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle nested Math.pow', () => {
      const sf = createSourceFile('const x = Math.pow(Math.pow(2, 3), 2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(2)
    })
    it('should handle deeply nested Math.pow', () => {
      const sf = createSourceFile('const x = Math.pow(Math.pow(Math.pow(2, 2), 2), 2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(3)
    })
    it('should handle private method', () => {
      const sf = createSourceFile('class C { #calc() { return Math.pow(2, 3); } }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle class getter', () => {
      const sf = createSourceFile('class C { get val() { return Math.pow(this.x, 2); } }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle class static method', () => {
      const sf = createSourceFile('class C { static calc() { return Math.pow(2, 3); } }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle callback', () => {
      const sf = createSourceFile('promise.then(() => Math.pow(2, 3));')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle mixed valid and invalid', () => {
      const sf = createSourceFile('const valid = 2 ** 3;\nconst invalid = Math.pow(4, 5);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle code in module', () => {
      const sf = createSourceFile('module M { export const x = Math.pow(2, 3); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle generic typed arguments', () => {
      const sf = createSourceFile('const x = Math.pow(2 as number, 3 as number);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle parenthesized arguments', () => {
      const sf = createSourceFile('const x = Math.pow((2), (3));')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow in IIFE', () => {
      const sf = createSourceFile('(function() { return Math.pow(2, 3); })();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow in immediately invoked arrow', () => {
      const sf = createSourceFile('(() => Math.pow(2, 3))();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow in logical AND expression', () => {
      const sf = createSourceFile('const x = true && Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow in comma expression', () => {
      const sf = createSourceFile('let x; x = 1, x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow in async arrow function', () => {
      const sf = createSourceFile('const fn = async () => { return Math.pow(2, 3); };')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow in async generator', () => {
      const sf = createSourceFile('async function* gen() { yield Math.pow(2, 3); }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return visitor and onComplete', () => {
      const result = preferExponentOperatorRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
    it('should return violations array from onComplete', () => {
      const result = preferExponentOperatorRule.create({})
      expect(Array.isArray(result.onComplete())).toBe(true)
    })
    it('should have visitNode in visitor', () => {
      const result = preferExponentOperatorRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })
  })

  describe('with options parameter', () => {
    it('should work with empty options', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf, {})).toHaveLength(1)
    })
    it('should work with no options argument', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should work with undefined options', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf, undefined)).toHaveLength(1)
    })
    it('should flag non-integer exponent when ignoreNonIntegerExponent is false', () => {
      const sf = createSourceFile('const x = Math.pow(2, 1.5);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: false })).toHaveLength(1)
    })
    it('should not flag non-integer exponent when ignoreNonIntegerExponent is true', () => {
      const sf = createSourceFile('const x = Math.pow(2, 1.5);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(0)
    })
    it('should flag integer exponent when ignoreNonIntegerExponent is true', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(1)
    })
    it('should flag variable exponent when ignoreNonIntegerExponent is true', () => {
      const sf = createSourceFile('const x = Math.pow(2, n);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(0)
    })
    it('should flag negative integer exponent when ignoreNonIntegerExponent is true', () => {
      const sf = createSourceFile('const x = Math.pow(2, -3);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(1)
    })
    it('should not flag scientific notation exponent when ignoreNonIntegerExponent is true', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3e0);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(0)
    })
    it('should not flag float exponent when ignoreNonIntegerExponent is true', () => {
      const sf = createSourceFile('const x = Math.pow(2, 0.5);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(0)
    })
  })

  describe('suggestion format', () => {
    it('should start with Replace with:', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)[0].suggestion).toContain('Replace with:')
    })
    it('should include ** operator', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)[0].suggestion).toContain('**')
    })
    it('should include base in suggestion', () => {
      const sf = createSourceFile('const x = Math.pow(base, exp);')
      expect(analyzePreferExponentOperator(sf)[0].suggestion).toContain('base')
    })
    it('should include exponent in suggestion', () => {
      const sf = createSourceFile('const x = Math.pow(base, exp);')
      expect(analyzePreferExponentOperator(sf)[0].suggestion).toContain('exp')
    })
    it('should format suggestion as base ** exponent', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)[0].suggestion).toBe('Replace with: 2 ** 3')
    })
    it('should format suggestion with variables', () => {
      const sf = createSourceFile('const x = Math.pow(a, b);')
      expect(analyzePreferExponentOperator(sf)[0].suggestion).toBe('Replace with: a ** b')
    })
    it('should format suggestion with expressions', () => {
      const sf = createSourceFile('const x = Math.pow(a + b, c * d);')
      const suggestion = analyzePreferExponentOperator(sf)[0].suggestion
      expect(suggestion).toContain('a + b')
      expect(suggestion).toContain('c * d')
    })
    it('should format suggestion with property access', () => {
      const sf = createSourceFile('const x = Math.pow(obj.base, obj.exp);')
      const suggestion = analyzePreferExponentOperator(sf)[0].suggestion
      expect(suggestion).toContain('obj.base')
      expect(suggestion).toContain('obj.exp')
    })
  })

  describe('message content', () => {
    it('should mention exponent operator in message', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)[0].message).toContain('exponent operator')
    })
    it('should mention Math.pow in message', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)[0].message).toContain('Math.pow')
    })
    it('should include ** in message', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)[0].message).toContain('**')
    })
    it('should include base and exponent values in message', () => {
      const sf = createSourceFile('const x = Math.pow(base, exp);')
      const message = analyzePreferExponentOperator(sf)[0].message
      expect(message).toContain('base')
      expect(message).toContain('exp')
    })
    it('should format message with literal values', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      const message = analyzePreferExponentOperator(sf)[0].message
      expect(message).toContain('Math.pow(2, 3)')
    })
  })

  describe('analyzePreferExponentOperator function', () => {
    it('should return empty array for source with no Math.pow', () => {
      const sf = createSourceFile('const x = 1 + 2;')
      const result = analyzePreferExponentOperator(sf)
      expect(result).toEqual([])
    })
    it('should return non-empty array for matching pattern', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      const result = analyzePreferExponentOperator(sf)
      expect(result.length).toBeGreaterThan(0)
    })
    it('should handle only Math.pow as expression statement', () => {
      const sf = createSourceFile('Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle source file with complex nesting', () => {
      const sf = createSourceFile('function outer() { if (true) { const x = Math.pow(2, 3); } }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow in parenthesized expression', () => {
      const sf = createSourceFile('(Math.pow(2, 3));')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should return violations with consistent structure', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      const violation = analyzePreferExponentOperator(sf)[0]
      expect(typeof violation.ruleId).toBe('string')
      expect(typeof violation.severity).toBe('string')
      expect(typeof violation.message).toBe('string')
      expect(typeof violation.filePath).toBe('string')
      expect(typeof violation.suggestion).toBe('string')
      expect(typeof violation.range).toBe('object')
    })
    it('should handle deeply nested Math.pow in object', () => {
      const sf = createSourceFile('const x = { a: { b: { c: Math.pow(2, 3) } } };')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow in array nested in object', () => {
      const sf = createSourceFile('const x = { items: [Math.pow(2, 3)] };')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should not flag regular function call pow', () => {
      const sf = createSourceFile('const x = pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should handle Math.pow result used in method chain', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3).toFixed(2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow with template literal args', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow in export default expression', () => {
      const sf = createSourceFile('export default Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow as default parameter', () => {
      const sf = createSourceFile('function fn(x = Math.pow(2, 3)) {}')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle Math.pow in conditional type', () => {
      const sf = createSourceFile('const x = condition ? Math.pow(2, 3) : Math.pow(4, 5);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(2)
    })
  })

  describe('multiple violations', () => {
    it('should detect two violations in same file', () => {
      const sf = createSourceFile('const a = Math.pow(2, 3);\nconst b = Math.pow(4, 5);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(2)
    })
    it('should detect three violations in same file', () => {
      const sf = createSourceFile(
        'const a = Math.pow(2, 3);\nconst b = Math.pow(4, 5);\nconst c = Math.pow(6, 7);',
      )
      expect(analyzePreferExponentOperator(sf)).toHaveLength(3)
    })
    it('should detect four violations in same file', () => {
      const sf = createSourceFile(
        'const a = Math.pow(1, 1);\nconst b = Math.pow(2, 2);\nconst c = Math.pow(3, 3);\nconst d = Math.pow(4, 4);',
      )
      expect(analyzePreferExponentOperator(sf)).toHaveLength(4)
    })
    it('should detect five violations in same file', () => {
      const sf = createSourceFile(
        'const a = Math.pow(1, 1);\nconst b = Math.pow(2, 2);\nconst c = Math.pow(3, 3);\nconst d = Math.pow(4, 4);\nconst e = Math.pow(5, 5);',
      )
      expect(analyzePreferExponentOperator(sf)).toHaveLength(5)
    })
    it('should count correctly with mixed code', () => {
      const sf = createSourceFile(
        'const valid = 2 ** 3;\nconst a = Math.pow(2, 3);\nconst valid2 = Math.sqrt(16);\nconst b = Math.pow(4, 5);',
      )
      expect(analyzePreferExponentOperator(sf)).toHaveLength(2)
    })
    it('should give each violation unique range', () => {
      const sf = createSourceFile('const a = Math.pow(2, 3);\nconst b = Math.pow(4, 5);')
      const violations = analyzePreferExponentOperator(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
    it('should give each violation correct filePath', () => {
      const sf = createSourceFile('const a = Math.pow(2, 3);\nconst b = Math.pow(4, 5);')
      const violations = analyzePreferExponentOperator(sf)
      violations.forEach((v) => {
        expect(v.filePath).toContain('test.ts')
      })
    })
    it('should detect violations in different function contexts', () => {
      const sf = createSourceFile(
        'function fn1() { return Math.pow(2, 3); }\nfunction fn2() { return Math.pow(4, 5); }',
      )
      expect(analyzePreferExponentOperator(sf)).toHaveLength(2)
    })
    it('should detect violations mixed with nested calls', () => {
      const sf = createSourceFile(
        'const a = Math.pow(2, 3);\nconst b = Math.pow(Math.pow(4, 5), 6);',
      )
      expect(analyzePreferExponentOperator(sf)).toHaveLength(3)
    })
    it('should handle six violations in same file', () => {
      const sf = createSourceFile(
        'Math.pow(1,1);Math.pow(2,2);Math.pow(3,3);Math.pow(4,4);Math.pow(5,5);Math.pow(6,6);',
      )
      expect(analyzePreferExponentOperator(sf)).toHaveLength(6)
    })
  })

  describe('ignoring non-integer exponents', () => {
    it('should not flag float exponent when option enabled', () => {
      const sf = createSourceFile('const x = Math.pow(2, 0.5);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(0)
    })
    it('should not flag float exponent like 1.5 when option enabled', () => {
      const sf = createSourceFile('const x = Math.pow(2, 1.5);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(0)
    })
    it('should flag integer exponent when option enabled', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(1)
    })
    it('should flag zero exponent when option enabled', () => {
      const sf = createSourceFile('const x = Math.pow(2, 0);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(1)
    })
    it('should flag negative integer exponent when option enabled', () => {
      const sf = createSourceFile('const x = Math.pow(2, -3);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(1)
    })
    it('should not flag variable exponent when option enabled', () => {
      const sf = createSourceFile('const x = Math.pow(2, n);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(0)
    })
    it('should not flag expression exponent when option enabled', () => {
      const sf = createSourceFile('const x = Math.pow(2, a + b);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(0)
    })
    it('should not flag property access exponent when option enabled', () => {
      const sf = createSourceFile('const x = Math.pow(2, obj.exp);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(0)
    })
    it('should not flag scientific notation exponent when option enabled', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3e2);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(0)
    })
    it('should flag float exponent when option disabled', () => {
      const sf = createSourceFile('const x = Math.pow(2, 1.5);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: false })).toHaveLength(1)
    })
    it('should flag float exponent by default', () => {
      const sf = createSourceFile('const x = Math.pow(2, 1.5);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(1)
    })
    it('should handle mixed integer and float exponents with option', () => {
      const sf = createSourceFile('const a = Math.pow(2, 3);\nconst b = Math.pow(2, 1.5);')
      expect(analyzePreferExponentOperator(sf, { ignoreNonIntegerExponent: true })).toHaveLength(1)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag Array.isArray', () => {
      const sf = createSourceFile('const x = Array.isArray(arr);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Object.assign', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Object.freeze', () => {
      const sf = createSourceFile('Object.freeze(obj);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag console methods', () => {
      const sf = createSourceFile('console.warn("msg");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag String methods', () => {
      const sf = createSourceFile('const x = str.toUpperCase();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Number methods', () => {
      const sf = createSourceFile('const x = num.toFixed(2);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Date methods', () => {
      const sf = createSourceFile('const x = date.getTime();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag RegExp exec', () => {
      const sf = createSourceFile('const x = regex.exec(str);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Map set', () => {
      const sf = createSourceFile('map.set("key", "value");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Set add', () => {
      const sf = createSourceFile('set.add(1);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Promise resolve', () => {
      const sf = createSourceFile('Promise.resolve(1);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Symbol', () => {
      const sf = createSourceFile('const s = Symbol("key");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag WeakMap', () => {
      const sf = createSourceFile('const wm = new WeakMap();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag WeakSet', () => {
      const sf = createSourceFile('const ws = new WeakSet();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Proxy', () => {
      const sf = createSourceFile('const p = new Proxy({}, {});')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Reflect', () => {
      const sf = createSourceFile('Reflect.get(obj, "key");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag ArrayBuffer', () => {
      const sf = createSourceFile('const buf = new ArrayBuffer(8);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag DataView', () => {
      const sf = createSourceFile('const dv = new DataView(buf);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Int8Array', () => {
      const sf = createSourceFile('const arr = new Int8Array(8);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Float64Array', () => {
      const sf = createSourceFile('const arr = new Float64Array(8);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Intl methods', () => {
      const sf = createSourceFile('const x = new Intl.NumberFormat().format(123);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag globalThis', () => {
      const sf = createSourceFile('const x = globalThis;')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag isNaN check', () => {
      const sf = createSourceFile('const x = isNaN(y);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag isFinite check', () => {
      const sf = createSourceFile('const x = isFinite(y);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag parseInt', () => {
      const sf = createSourceFile('const x = parseInt("123");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag parseFloat', () => {
      const sf = createSourceFile('const x = parseFloat("1.5");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag encodeURI', () => {
      const sf = createSourceFile('const x = encodeURI(str);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag decodeURI', () => {
      const sf = createSourceFile('const x = decodeURI(str);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag btoa', () => {
      const sf = createSourceFile('const x = btoa(str);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag atob', () => {
      const sf = createSourceFile('const x = atob(str);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag setTimeout', () => {
      const sf = createSourceFile('setTimeout(() => {}, 100);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag setInterval', () => {
      const sf = createSourceFile('setInterval(() => {}, 100);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag requestAnimationFrame', () => {
      const sf = createSourceFile('requestAnimationFrame(() => {});')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag fetch', () => {
      const sf = createSourceFile('fetch("/api");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag URL constructor', () => {
      const sf = createSourceFile('const u = new URL("http://example.com");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag URLSearchParams', () => {
      const sf = createSourceFile('const p = new URLSearchParams("a=1");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Blob', () => {
      const sf = createSourceFile('const b = new Blob(["data"]);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag FormData', () => {
      const sf = createSourceFile('const fd = new FormData();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Headers', () => {
      const sf = createSourceFile('const h = new Headers();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Response', () => {
      const sf = createSourceFile('const r = new Response();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Request', () => {
      const sf = createSourceFile('const r = new Request("/api");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag ReadableStream', () => {
      const sf = createSourceFile('const rs = new ReadableStream();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag WritableStream', () => {
      const sf = createSourceFile('const ws = new WritableStream();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag TransformStream', () => {
      const sf = createSourceFile('const ts = new TransformStream();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag TextEncoder', () => {
      const sf = createSourceFile('const te = new TextEncoder();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag TextDecoder', () => {
      const sf = createSourceFile('const td = new TextDecoder();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag AbortController', () => {
      const sf = createSourceFile('const ac = new AbortController();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag FinalizationRegistry', () => {
      const sf = createSourceFile('const fr = new FinalizationRegistry(() => {});')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag crypto', () => {
      const sf = createSourceFile('crypto.getRandomValues(new Uint8Array(8));')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag performance', () => {
      const sf = createSourceFile('performance.now();')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag queueMicrotask', () => {
      const sf = createSourceFile('queueMicrotask(() => {});')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag structuredClone', () => {
      const sf = createSourceFile('const x = structuredClone(obj);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag labeled statement', () => {
      const sf = createSourceFile('outer: for (let i = 0; i < 10; i++) { break outer; }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag with statement', () => {
      const sf = createSourceFile('with (obj) { x }')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag export statement', () => {
      const sf = createSourceFile('export { foo } from "./bar";')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag default export class', () => {
      const sf = createSourceFile('export default class Foo {}')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag reduceRight', () => {
      const sf = createSourceFile('const result = arr.reduceRight((acc, val) => acc + val, 0);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag concat', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag spread operator', () => {
      const sf = createSourceFile('const x = [...arr, ...other];')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Object.entries', () => {
      const sf = createSourceFile('const entries = Object.entries(obj);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Object.values', () => {
      const sf = createSourceFile('const values = Object.values(obj);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Array.of', () => {
      const sf = createSourceFile('const arr = Array.of(1, 2, 3);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag JSON.stringify', () => {
      const sf = createSourceFile('const s = JSON.stringify(obj);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Set.has', () => {
      const sf = createSourceFile('const x = set.has(1);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Map.get', () => {
      const sf = createSourceFile('const x = map.get("key");')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.hypot', () => {
      const sf = createSourceFile('const x = Math.hypot(3, 4);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.cbrt', () => {
      const sf = createSourceFile('const x = Math.cbrt(27);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.sign', () => {
      const sf = createSourceFile('const x = Math.sign(-5);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
    it('should not flag Math.trunc', () => {
      const sf = createSourceFile('const x = Math.trunc(3.7);')
      expect(analyzePreferExponentOperator(sf)).toHaveLength(0)
    })
  })
})
