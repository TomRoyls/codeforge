/**
 * @fileoverview Tests for prefer-string-template rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferStringTemplate,
  preferStringTemplateRule,
} from '../../../../src/rules/best-practices/prefer-string-template.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-string-template rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferStringTemplateRule.meta.name).toBe('prefer-string-template')
    })
    it('should have style category', () => {
      expect(preferStringTemplateRule.meta.category).toBe('style')
    })
    it('should not be fixable', () => {
      expect(preferStringTemplateRule.meta.fixable).toBeUndefined()
    })
    it('should have description', () => {
      expect(preferStringTemplateRule.meta.description).toBeDefined()
      expect(typeof preferStringTemplateRule.meta.description).toBe('string')
    })
    it('should mention template in description', () => {
      expect(preferStringTemplateRule.meta.description).toContain('template')
    })
    it('should not be recommended', () => {
      expect(preferStringTemplateRule.meta.recommended).toBe(false)
    })
    it('should have defaultOptions with checkConcat true', () => {
      expect(preferStringTemplateRule.defaultOptions).toBeDefined()
      expect(preferStringTemplateRule.defaultOptions.checkConcat).toBe(true)
    })
    it('should have create function', () => {
      expect(typeof preferStringTemplateRule.create).toBe('function')
    })
    it('should mention concatenation in description', () => {
      expect(preferStringTemplateRule.meta.description).toContain('concatenation')
    })
  })

  describe('detecting violations', () => {
    it('should detect "hello" + name', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect name + "hello"', () => {
      const sf = createSourceFile('const msg = name + "hello";')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect "a" + "b"', () => {
      const sf = createSourceFile('const msg = "a" + "b";')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect "prefix" + middle + "suffix"', () => {
      const sf = createSourceFile('const msg = "prefix" + middle + "suffix";')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })
    it('should detect concatenation with template literal on right', () => {
      const sf = createSourceFile('const msg = "prefix" + `template`;')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect concatenation with template literal on left', () => {
      const sf = createSourceFile('const msg = `template` + "suffix";')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect "Error: " + message in console.log', () => {
      const sf = createSourceFile('console.log("Error: " + message);')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect string concat in variable declaration', () => {
      const sf = createSourceFile('const result = "Hello " + user;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in return statement', () => {
      const sf = createSourceFile('function greet(name) { return "Hello " + name; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in assignment', () => {
      const sf = createSourceFile('let msg; msg = "Hello " + name;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in function argument', () => {
      const sf = createSourceFile('process("data: " + value);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in array element', () => {
      const sf = createSourceFile('const arr = ["item: " + x];')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in object property', () => {
      const sf = createSourceFile('const obj = { label: "Name: " + name };')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in ternary', () => {
      const sf = createSourceFile('const x = flag ? "a" + y : "";')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in template expression', () => {
      const sf = createSourceFile('const s = `${"a" + b}`;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in if condition', () => {
      const sf = createSourceFile('if ("prefix" + suffix) {}')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in while condition', () => {
      const sf = createSourceFile('while ("a" + b) {}')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in arrow function body', () => {
      const sf = createSourceFile('const fn = (x) => "result: " + x;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in class method', () => {
      const sf = createSourceFile('class C { getLabel(x) { return "label: " + x; } }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in async function', () => {
      const sf = createSourceFile('async function fn() { return "data: " + await promise; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in generator function', () => {
      const sf = createSourceFile('function* gen() { yield "item: " + x; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in try block', () => {
      const sf = createSourceFile('try { const x = "err: " + e; } catch(e) {}')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in namespace', () => {
      const sf = createSourceFile('namespace NS { export const msg = "hello " + name; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in exported function', () => {
      const sf = createSourceFile('export function greet(name) { return "Hello " + name; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in default export', () => {
      const sf = createSourceFile('export default function() { return "Hello " + name; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in const arrow export', () => {
      const sf = createSourceFile('export const greet = (name) => "Hello " + name;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in class static method', () => {
      const sf = createSourceFile('class C { static greet(n) { return "Hello " + n; } }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in class getter', () => {
      const sf = createSourceFile('class C { get label() { return "item: " + this.name; } }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in class setter', () => {
      const sf = createSourceFile('class C { set label(v) { this._label = "set: " + v; } }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in private method', () => {
      const sf = createSourceFile('class C { #greet(n) { return "Hello " + n; } }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in callback', () => {
      const sf = createSourceFile('promise.then(data => "result: " + data);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in logical AND', () => {
      const sf = createSourceFile('const x = flag && "active: " + name;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in logical OR', () => {
      const sf = createSourceFile('const x = null || "fallback: " + name;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in nullish coalescing', () => {
      const sf = createSourceFile('const x = undefined ?? "default: " + name;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in comma expression', () => {
      const sf = createSourceFile('let a; a = 1, a = "msg: " + x;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat in parenthesized expression', () => {
      const sf = createSourceFile('const x = ("hello" + name);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat with property access', () => {
      const sf = createSourceFile('const msg = "Hello " + user.name;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat with computed property', () => {
      const sf = createSourceFile('const msg = "Hello " + obj[key];')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat with call expression', () => {
      const sf = createSourceFile('const msg = "Hello " + getName();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat with typeof expression', () => {
      const sf = createSourceFile('const msg = "type: " + typeof x;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should detect string concat with method call right side', () => {
      const sf = createSourceFile('const msg = "items: " + items.join(", ");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag template literals', () => {
      const sf = createSourceFile('const msg = `Hello ${name}`;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag number addition', () => {
      const sf = createSourceFile('const sum = 1 + 2;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag variable addition', () => {
      const sf = createSourceFile('const sum = a + b;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag boolean expressions', () => {
      const sf = createSourceFile('const result = true && false;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string literal alone', () => {
      const sf = createSourceFile('const x = "hello";')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag numeric literal', () => {
      const sf = createSourceFile('const x = 42;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sf = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sf = createSourceFile('const x = [1, 2, 3];')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag class declaration', () => {
      const sf = createSourceFile('class Foo {}')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag arrow function without concat', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sf = createSourceFile("import { x } from 'y';")
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar: string }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag map operation', () => {
      const sf = createSourceFile('const x = arr.map(x => x * 2);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag filter operation', () => {
      const sf = createSourceFile('const x = arr.filter(x => x > 1);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag reduce operation', () => {
      const sf = createSourceFile('const x = arr.reduce((a, b) => a + b, 0);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag find operation', () => {
      const sf = createSourceFile('const x = arr.find(x => x === 2);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag some operation', () => {
      const sf = createSourceFile('const x = arr.some(x => x > 0);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag every operation', () => {
      const sf = createSourceFile('const x = arr.every(x => x > 0);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag forEach operation', () => {
      const sf = createSourceFile('arr.forEach(x => console.log(x));')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag includes operation', () => {
      const sf = createSourceFile('const x = arr.includes(1);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag indexOf operation', () => {
      const sf = createSourceFile('const x = arr.indexOf(1);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag join operation', () => {
      const sf = createSourceFile('const x = arr.join(",");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag sort operation', () => {
      const sf = createSourceFile('const x = arr.sort();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag slice operation', () => {
      const sf = createSourceFile('const x = arr.slice(0, 5);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag flat operation', () => {
      const sf = createSourceFile('const x = arr.flat();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag flatMap operation', () => {
      const sf = createSourceFile('const x = arr.flatMap(x => [x]);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag concat method', () => {
      const sf = createSourceFile('const x = arr.concat(other);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag push method', () => {
      const sf = createSourceFile('arr.push(1);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < arr.length; i++) { }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag while loop', () => {
      const sf = createSourceFile('while (true) { break; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag switch statement', () => {
      const sf = createSourceFile('switch(x) { case 1: break; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag ternary without concat', () => {
      const sf = createSourceFile('const x = a ? b : c;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const x = a ?? b;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const x = a?.b?.c;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag type alias', () => {
      const sf = createSourceFile('type Foo = { bar: string };')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag enum', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag destructuring', () => {
      const sf = createSourceFile('const { a, b } = obj;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array destructuring', () => {
      const sf = createSourceFile('const [a, b] = arr;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag spread in array', () => {
      const sf = createSourceFile('const x = [...arr, ...other];')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag spread in object', () => {
      const sf = createSourceFile('const x = { ...obj, a: 1 };')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile('const t = typeof x;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sf = createSourceFile('const x = a instanceof Array;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag new expression', () => {
      const sf = createSourceFile('const map = new Map();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag delete operator', () => {
      const sf = createSourceFile('delete obj.key;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sf = createSourceFile('void 0;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag yield expression', () => {
      const sf = createSourceFile('function* gen() { yield 1; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag await expression', () => {
      const sf = createSourceFile('async function fn() { await promise; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag throw statement', () => {
      const sf = createSourceFile('throw new Error("fail");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag debugger statement', () => {
      const sf = createSourceFile('debugger;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag try-finally', () => {
      const sf = createSourceFile('try { fn(); } finally { cleanup(); }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag JSON methods', () => {
      const sf = createSourceFile('const x = JSON.parse(str);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Math methods', () => {
      const sf = createSourceFile('const x = Math.max(1, 2);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object methods', () => {
      const sf = createSourceFile('const keys = Object.keys(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Array.from', () => {
      const sf = createSourceFile('const arr = Array.from({ length: 5 });')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Promise.all', () => {
      const sf = createSourceFile('const results = Promise.all(promises);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Set.has', () => {
      const sf = createSourceFile('const x = set.has(1);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Map.get', () => {
      const sf = createSourceFile('const x = map.get("key");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag for..of loop', () => {
      const sf = createSourceFile('for (const item of arr) { console.log(item); }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag for..in loop', () => {
      const sf = createSourceFile('for (const key in obj) { console.log(key); }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag do..while loop', () => {
      const sf = createSourceFile('do { x++; } while (x < 10);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag export statement', () => {
      const sf = createSourceFile('export { foo } from "./bar";')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag default export class', () => {
      const sf = createSourceFile('export default class Foo {}')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Array.isArray', () => {
      const sf = createSourceFile('const x = Array.isArray(arr);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.assign', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.freeze', () => {
      const sf = createSourceFile('Object.freeze(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag console methods', () => {
      const sf = createSourceFile('console.warn("msg");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag String methods', () => {
      const sf = createSourceFile('const x = str.toUpperCase();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Number methods', () => {
      const sf = createSourceFile('const x = num.toFixed(2);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Date methods', () => {
      const sf = createSourceFile('const x = date.getTime();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag RegExp exec', () => {
      const sf = createSourceFile('const x = regex.exec(str);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Map set', () => {
      const sf = createSourceFile('map.set("key", "value");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Set add', () => {
      const sf = createSourceFile('set.add(1);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Promise resolve', () => {
      const sf = createSourceFile('Promise.resolve(1);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Symbol', () => {
      const sf = createSourceFile('const s = Symbol("key");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag WeakMap', () => {
      const sf = createSourceFile('const wm = new WeakMap();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag WeakSet', () => {
      const sf = createSourceFile('const ws = new WeakSet();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Proxy', () => {
      const sf = createSourceFile('const p = new Proxy({}, {});')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Reflect', () => {
      const sf = createSourceFile('Reflect.get(obj, "key");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag ArrayBuffer', () => {
      const sf = createSourceFile('const buf = new ArrayBuffer(8);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag DataView', () => {
      const sf = createSourceFile('const dv = new DataView(buf);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Int8Array', () => {
      const sf = createSourceFile('const arr = new Int8Array(8);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Float64Array', () => {
      const sf = createSourceFile('const arr = new Float64Array(8);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Intl methods', () => {
      const sf = createSourceFile('const x = new Intl.NumberFormat().format(123);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag globalThis', () => {
      const sf = createSourceFile('const x = globalThis;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag isNaN', () => {
      const sf = createSourceFile('const x = isNaN(y);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag isFinite', () => {
      const sf = createSourceFile('const x = isFinite(y);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag parseInt', () => {
      const sf = createSourceFile('const x = parseInt("123");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag parseFloat', () => {
      const sf = createSourceFile('const x = parseFloat("1.5");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag encodeURI', () => {
      const sf = createSourceFile('const x = encodeURI(str);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag decodeURI', () => {
      const sf = createSourceFile('const x = decodeURI(str);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag btoa', () => {
      const sf = createSourceFile('const x = btoa(str);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag atob', () => {
      const sf = createSourceFile('const x = atob(str);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag setTimeout', () => {
      const sf = createSourceFile('setTimeout(() => {}, 100);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag setInterval', () => {
      const sf = createSourceFile('setInterval(() => {}, 100);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag fetch', () => {
      const sf = createSourceFile('fetch("/api");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag labeled statement', () => {
      const sf = createSourceFile('outer: for (let i = 0; i < 10; i++) { break outer; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag with statement', () => {
      const sf = createSourceFile('with (obj) { x }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag multiple valid patterns', () => {
      const sf = createSourceFile('const a = `hello ${name}`;\nconst b = 1 + 2;\nconst c = x + y;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag template literal with nested expression', () => {
      const sf = createSourceFile('const msg = `Result: ${a + b} items`;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag no-substitution template literal', () => {
      const sf = createSourceFile('const msg = `hello world`;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag binary expression with minus', () => {
      const sf = createSourceFile('const x = "hello" - 1;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag binary expression with multiply', () => {
      const sf = createSourceFile('const x = "hello" * 2;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag binary expression with division', () => {
      const sf = createSourceFile('const x = "hello" / 2;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag binary expression with modulo', () => {
      const sf = createSourceFile('const x = 10 % 3;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag binary expression with less than', () => {
      const sf = createSourceFile('const x = a < b;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag binary expression with equality', () => {
      const sf = createSourceFile('const x = a === b;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag variable + variable concatenation', () => {
      const sf = createSourceFile('const msg = firstName + lastName;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should report correct ruleId', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)[0].ruleId).toBe('prefer-string-template')
    })
    it('should report info severity', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)[0].severity).toBe('info')
    })
    it('should have range property', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)[0].range).toBeDefined()
    })
    it('should have filePath property', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)[0].filePath).toBeDefined()
    })
    it('should have filePath containing test.ts', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)[0].filePath).toContain('test.ts')
    })
    it('should have suggestion property', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)[0].suggestion).toBeDefined()
    })
    it('should have all required violation properties', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const v = analyzePreferStringTemplate(sf)[0]
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('range')
      expect(v).toHaveProperty('suggestion')
    })
    it('should have correct property types', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const v = analyzePreferStringTemplate(sf)[0]
      expect(typeof v.ruleId).toBe('string')
      expect(typeof v.severity).toBe('string')
      expect(typeof v.message).toBe('string')
      expect(typeof v.filePath).toBe('string')
      expect(typeof v.suggestion).toBe('string')
      expect(typeof v.range).toBe('object')
    })
    it('should have range with start and end', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const v = analyzePreferStringTemplate(sf)[0]
      expect(v.range).toHaveProperty('start')
      expect(v.range).toHaveProperty('end')
    })
    it('should return array of violations', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const violations = analyzePreferStringTemplate(sf)
      expect(Array.isArray(violations)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should handle file with only comments', () => {
      const sf = createSourceFile('// comment\n/* block */')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should handle code with comments', () => {
      const sf = createSourceFile('// concat\nconst msg = "hello" + name; /* end */')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle multiple concatenations', () => {
      const sf = createSourceFile('const a = "hello" + x;\nconst b = "world" + y;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(2)
    })
    it('should handle nested concatenations', () => {
      const sf = createSourceFile('const msg = "a" + ("b" + c);')
      expect(analyzePreferStringTemplate(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should handle concatenation in function call', () => {
      const sf = createSourceFile('console.log("Error: " + message);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle type annotations', () => {
      const sf = createSourceFile('const msg: string = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle deeply nested concat', () => {
      const sf = createSourceFile('const x = { a: { b: { c: "prefix" + val } } };')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle mixed valid and invalid patterns', () => {
      const sf = createSourceFile('const valid = `hello ${name}`;\nconst invalid = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle concat in IIFE', () => {
      const sf = createSourceFile('(function() { return "hello" + name; })();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle concat in async arrow function', () => {
      const sf = createSourceFile('const fn = async () => { return "data: " + await promise; };')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle concat in async generator', () => {
      const sf = createSourceFile('async function* gen() { yield "item: " + x; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle concat in module', () => {
      const sf = createSourceFile('module M { export const msg = "hello" + name; }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle concat with const assertion', () => {
      const sf = createSourceFile('const msg = "hello" + name as const;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle concat in immediately invoked arrow', () => {
      const sf = createSourceFile('const result = ((x) => "value: " + x)(42);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle method chain with concat', () => {
      const sf = createSourceFile('const x = ("hello" + name).toUpperCase();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle concat in nested function', () => {
      const sf = createSourceFile('function outer() { function inner() { return "msg: " + x; } }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle triple concatenation', () => {
      const sf = createSourceFile('const msg = "a" + b + "c" + d;')
      expect(analyzePreferStringTemplate(sf).length).toBeGreaterThanOrEqual(2)
    })
    it('should handle concatenation in throw', () => {
      const sf = createSourceFile('throw "Error: " + message;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return visitor and onComplete', () => {
      const result = preferStringTemplateRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
    it('should return violations array from onComplete', () => {
      const result = preferStringTemplateRule.create({})
      expect(Array.isArray(result.onComplete())).toBe(true)
    })
    it('should have visitNode in visitor', () => {
      const result = preferStringTemplateRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })
    it('should return empty violations when no matching nodes', () => {
      const result = preferStringTemplateRule.create({})
      expect(result.onComplete()).toEqual([])
    })
    it('should have visitor object', () => {
      const result = preferStringTemplateRule.create({})
      expect(typeof result.visitor).toBe('object')
    })
  })

  describe('suggestion format', () => {
    it('should contain template literal suggestion', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const suggestion = analyzePreferStringTemplate(sf)[0].suggestion
      expect(suggestion).toContain('template literal')
    })
    it('should contain ${variable} in suggestion', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const suggestion = analyzePreferStringTemplate(sf)[0].suggestion
      expect(suggestion).toContain('${variable}')
    })
    it('should mention Convert in suggestion', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const suggestion = analyzePreferStringTemplate(sf)[0].suggestion
      expect(suggestion).toContain('Convert')
    })
    it('should have consistent suggestion for all violations', () => {
      const sf = createSourceFile('const a = "x" + y;\nconst b = "z" + w;')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations[0].suggestion).toBe(violations[1].suggestion)
    })
  })

  describe('message content', () => {
    it('should mention template in message', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)[0].message).toContain('template')
    })
    it('should mention concatenation in message', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)[0].message).toContain('concatenation')
    })
    it('should mention readability in message', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf)[0].message).toContain('readability')
    })
    it('should have consistent message for all violations', () => {
      const sf = createSourceFile('const a = "x" + y;\nconst b = "z" + w;')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations[0].message).toBe(violations[1].message)
    })
  })

  describe('analyze function', () => {
    it('should return empty array for source with no violations', () => {
      const sf = createSourceFile('const x = 1 + 2;')
      expect(analyzePreferStringTemplate(sf)).toEqual([])
    })
    it('should return non-empty array for matching pattern', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf).length).toBeGreaterThan(0)
    })
    it('should accept options parameter', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const result = analyzePreferStringTemplate(sf, {})
      expect(result.length).toBeGreaterThan(0)
    })
    it('should accept undefined options', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf, undefined)).toHaveLength(1)
    })
    it('should handle only the pattern as expression', () => {
      const sf = createSourceFile('"hello" + name')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should handle source file with complex nesting', () => {
      const sf = createSourceFile('function outer() { if (true) { const msg = "hello" + name; } }')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(1)
    })
    it('should return violations with consistent structure', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const violation = analyzePreferStringTemplate(sf)[0]
      expect(typeof violation.ruleId).toBe('string')
      expect(typeof violation.severity).toBe('string')
      expect(typeof violation.message).toBe('string')
      expect(typeof violation.filePath).toBe('string')
      expect(typeof violation.suggestion).toBe('string')
      expect(typeof violation.range).toBe('object')
    })
    it('should work with empty options object', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringTemplate(sf, {})).toHaveLength(1)
    })
  })

  describe('multiple violations', () => {
    it('should detect two violations in same file', () => {
      const sf = createSourceFile('const a = "hello" + x;\nconst b = "world" + y;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(2)
    })
    it('should detect three violations in same file', () => {
      const sf = createSourceFile('const a = "a" + x;\nconst b = "b" + y;\nconst c = "c" + z;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(3)
    })
    it('should detect four violations in same file', () => {
      const sf = createSourceFile(
        'const a = "a" + w;\nconst b = "b" + x;\nconst c = "c" + y;\nconst d = "d" + z;',
      )
      expect(analyzePreferStringTemplate(sf)).toHaveLength(4)
    })
    it('should detect five violations in same file', () => {
      const sf = createSourceFile(
        'const a = "a" + v;\nconst b = "b" + w;\nconst c = "c" + x;\nconst d = "d" + y;\nconst e = "e" + z;',
      )
      expect(analyzePreferStringTemplate(sf)).toHaveLength(5)
    })
    it('should count violations correctly with mixed code', () => {
      const sf = createSourceFile(
        'const valid = `hello ${name}`;\nconst a = "x" + y;\nconst valid2 = 1 + 2;\nconst b = "z" + w;',
      )
      expect(analyzePreferStringTemplate(sf)).toHaveLength(2)
    })
    it('should give each violation unique range', () => {
      const sf = createSourceFile('const a = "x" + y;\nconst b = "z" + w;')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
    it('should give each violation correct filePath', () => {
      const sf = createSourceFile('const a = "x" + y;\nconst b = "z" + w;')
      const violations = analyzePreferStringTemplate(sf)
      violations.forEach((v) => expect(v.filePath).toContain('test.ts'))
    })
    it('should detect violations in different contexts', () => {
      const sf = createSourceFile(
        'function fn1() { return "Hello " + x; }\nfunction fn2() { return "World " + y; }',
      )
      expect(analyzePreferStringTemplate(sf)).toHaveLength(2)
    })
    it('should detect violations in different statement types', () => {
      const sf = createSourceFile(
        'const a = "x" + y;\nconsole.log("msg: " + z);\nthrow "err: " + e;',
      )
      expect(analyzePreferStringTemplate(sf)).toHaveLength(3)
    })
  })

  describe('options', () => {
    it('should respect checkConcat: false', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const violations = analyzePreferStringTemplate(sf, { checkConcat: false })
      expect(violations).toHaveLength(0)
    })
    it('should detect with checkConcat: true', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const violations = analyzePreferStringTemplate(sf, { checkConcat: true })
      expect(violations).toHaveLength(1)
    })
    it('should detect with default options (no options passed)', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const violations = analyzePreferStringTemplate(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect with empty options object', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      const violations = analyzePreferStringTemplate(sf, {})
      expect(violations).toHaveLength(1)
    })
    it('should not detect any violation with checkConcat false and multiple concats', () => {
      const sf = createSourceFile('const a = "x" + y;\nconst b = "z" + w;')
      const violations = analyzePreferStringTemplate(sf, { checkConcat: false })
      expect(violations).toHaveLength(0)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag requestAnimationFrame', () => {
      const sf = createSourceFile('requestAnimationFrame(() => {});')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag addEventListener', () => {
      const sf = createSourceFile('document.addEventListener("click", () => {});')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag XMLHttpRequest', () => {
      const sf = createSourceFile('const xhr = new XMLHttpRequest();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag WebSocket', () => {
      const sf = createSourceFile('const ws = new WebSocket("ws://localhost");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag localStorage', () => {
      const sf = createSourceFile('localStorage.setItem("key", "value");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag sessionStorage', () => {
      const sf = createSourceFile('sessionStorage.getItem("key");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag indexedDB', () => {
      const sf = createSourceFile('indexedDB.open("db");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag navigator', () => {
      const sf = createSourceFile('const x = navigator.userAgent;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag location', () => {
      const sf = createSourceFile('const x = location.href;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag history', () => {
      const sf = createSourceFile('history.pushState({}, "");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag crypto', () => {
      const sf = createSourceFile('crypto.getRandomValues(new Uint8Array(8));')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag performance', () => {
      const sf = createSourceFile('performance.now();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag queueMicrotask', () => {
      const sf = createSourceFile('queueMicrotask(() => {});')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag structuredClone', () => {
      const sf = createSourceFile('const x = structuredClone(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag AbortController', () => {
      const sf = createSourceFile('const ac = new AbortController();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag TextEncoder', () => {
      const sf = createSourceFile('const te = new TextEncoder();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag TextDecoder', () => {
      const sf = createSourceFile('const td = new TextDecoder();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag URL', () => {
      const sf = createSourceFile('const u = new URL("http://example.com");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag URLSearchParams', () => {
      const sf = createSourceFile('const p = new URLSearchParams("a=1");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Blob', () => {
      const sf = createSourceFile('const b = new Blob(["data"]);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag File', () => {
      const sf = createSourceFile('const f = new File(["data"], "file.txt");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag FormData', () => {
      const sf = createSourceFile('const fd = new FormData();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Headers', () => {
      const sf = createSourceFile('const h = new Headers();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Response', () => {
      const sf = createSourceFile('const r = new Response();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Request', () => {
      const sf = createSourceFile('const r = new Request("/api");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag ReadableStream', () => {
      const sf = createSourceFile('const rs = new ReadableStream();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag WritableStream', () => {
      const sf = createSourceFile('const ws = new WritableStream();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag TransformStream', () => {
      const sf = createSourceFile('const ts = new TransformStream();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Intl.DateTimeFormat', () => {
      const sf = createSourceFile('const dtf = new Intl.DateTimeFormat();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag FinalizationRegistry', () => {
      const sf = createSourceFile('const fr = new FinalizationRegistry(() => {});')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.entries', () => {
      const sf = createSourceFile('const entries = Object.entries(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.values', () => {
      const sf = createSourceFile('const values = Object.values(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.keys', () => {
      const sf = createSourceFile('const keys = Object.keys(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag JSON.stringify', () => {
      const sf = createSourceFile('const s = JSON.stringify(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Array.of', () => {
      const sf = createSourceFile('const arr = Array.of(1, 2, 3);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.create', () => {
      const sf = createSourceFile('const x = Object.create(null);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.defineProperty', () => {
      const sf = createSourceFile('Object.defineProperty(obj, "key", { value: 1 });')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.getOwnPropertyDescriptor', () => {
      const sf = createSourceFile('const desc = Object.getOwnPropertyDescriptor(obj, "key");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.getPrototypeOf', () => {
      const sf = createSourceFile('const proto = Object.getPrototypeOf(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.setPrototypeOf', () => {
      const sf = createSourceFile('Object.setPrototypeOf(obj, proto);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.is', () => {
      const sf = createSourceFile('const same = Object.is(a, b);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.isFrozen', () => {
      const sf = createSourceFile('const frozen = Object.isFrozen(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.isSealed', () => {
      const sf = createSourceFile('const sealed = Object.isSealed(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.isExtensible', () => {
      const sf = createSourceFile('const ext = Object.isExtensible(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.preventExtensions', () => {
      const sf = createSourceFile('Object.preventExtensions(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Object.seal', () => {
      const sf = createSourceFile('Object.seal(obj);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag String.raw', () => {
      const sf = createSourceFile('const s = String.raw`hello ${name}`;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag String.fromCharCode', () => {
      const sf = createSourceFile('const s = String.fromCharCode(65);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Number.isFinite', () => {
      const sf = createSourceFile('const x = Number.isFinite(42);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Number.isInteger', () => {
      const sf = createSourceFile('const x = Number.isInteger(42);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Number.isNaN', () => {
      const sf = createSourceFile('const x = Number.isNaN(NaN);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Number.isSafeInteger', () => {
      const sf = createSourceFile('const x = Number.isSafeInteger(42);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Number.parseFloat', () => {
      const sf = createSourceFile('const x = Number.parseFloat("1.5");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Number.parseInt', () => {
      const sf = createSourceFile('const x = Number.parseInt("123");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Boolean constructor', () => {
      const sf = createSourceFile('const b = Boolean(1);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Symbol.for', () => {
      const sf = createSourceFile('const s = Symbol.for("key");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Symbol.keyFor', () => {
      const sf = createSourceFile('const k = Symbol.keyFor(s);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Math.abs', () => {
      const sf = createSourceFile('const x = Math.abs(-5);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Math.ceil', () => {
      const sf = createSourceFile('const x = Math.ceil(1.5);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Math.floor', () => {
      const sf = createSourceFile('const x = Math.floor(1.5);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Math.round', () => {
      const sf = createSourceFile('const x = Math.round(1.5);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Math.sqrt', () => {
      const sf = createSourceFile('const x = Math.sqrt(16);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Math.pow', () => {
      const sf = createSourceFile('const x = Math.pow(2, 3);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Math.min', () => {
      const sf = createSourceFile('const x = Math.min(1, 2);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Math.random', () => {
      const sf = createSourceFile('const x = Math.random();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Math.PI', () => {
      const sf = createSourceFile('const x = Math.PI;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Date.now', () => {
      const sf = createSourceFile('const x = Date.now();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Date constructor', () => {
      const sf = createSourceFile('const d = new Date();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Promise.reject', () => {
      const sf = createSourceFile('const p = Promise.reject(new Error("fail"));')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Promise.race', () => {
      const sf = createSourceFile('const p = Promise.race(promises);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Promise.allSettled', () => {
      const sf = createSourceFile('const p = Promise.allSettled(promises);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Promise.any', () => {
      const sf = createSourceFile('const p = Promise.any(promises);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag console.error', () => {
      const sf = createSourceFile('console.error("msg");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag console.info', () => {
      const sf = createSourceFile('console.info("msg");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag console.debug', () => {
      const sf = createSourceFile('console.debug("msg");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag console.table', () => {
      const sf = createSourceFile('console.table([1, 2, 3]);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag console.trace', () => {
      const sf = createSourceFile('console.trace("msg");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag console.assert', () => {
      const sf = createSourceFile('console.assert(true, "msg");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag console.count', () => {
      const sf = createSourceFile('console.count("label");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag console.time', () => {
      const sf = createSourceFile('console.time("label");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag console.timeEnd', () => {
      const sf = createSourceFile('console.timeEnd("label");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Map constructor', () => {
      const sf = createSourceFile('const m = new Map();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Set constructor', () => {
      const sf = createSourceFile('const s = new Set();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Map delete', () => {
      const sf = createSourceFile('m.delete("key");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Set delete', () => {
      const sf = createSourceFile('s.delete(1);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Map has', () => {
      const sf = createSourceFile('const x = m.has("key");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Map size', () => {
      const sf = createSourceFile('const x = m.size;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Set size', () => {
      const sf = createSourceFile('const x = s.size;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Map clear', () => {
      const sf = createSourceFile('m.clear();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Set clear', () => {
      const sf = createSourceFile('s.clear();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Map entries', () => {
      const sf = createSourceFile('const e = m.entries();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Set entries', () => {
      const sf = createSourceFile('const e = s.entries();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag Map forEach', () => {
      const sf = createSourceFile('m.forEach((v, k) => {});')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array at method', () => {
      const sf = createSourceFile('const x = arr.at(0);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array findIndex', () => {
      const sf = createSourceFile('const x = arr.findIndex(x => x > 0);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array fill', () => {
      const sf = createSourceFile('arr.fill(0);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array copyWithin', () => {
      const sf = createSourceFile('arr.copyWithin(0, 3);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array reverse', () => {
      const sf = createSourceFile('arr.reverse();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array splice', () => {
      const sf = createSourceFile('arr.splice(0, 1);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array toString', () => {
      const sf = createSourceFile('const x = arr.toString();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array values', () => {
      const sf = createSourceFile('const it = arr.values();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array keys', () => {
      const sf = createSourceFile('const it = arr.keys();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag array reduceRight', () => {
      const sf = createSourceFile('const x = arr.reduceRight((a, b) => a + b, 0);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string charAt', () => {
      const sf = createSourceFile('const x = str.charAt(0);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string charCodeAt', () => {
      const sf = createSourceFile('const x = str.charCodeAt(0);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string concat method', () => {
      const sf = createSourceFile('const x = str.concat(" world");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string indexOf', () => {
      const sf = createSourceFile('const x = str.indexOf("a");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string lastIndexOf', () => {
      const sf = createSourceFile('const x = str.lastIndexOf("a");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string match', () => {
      const sf = createSourceFile('const x = str.match(/pattern/);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string matchAll', () => {
      const sf = createSourceFile('const x = str.matchAll(/pattern/g);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string padStart', () => {
      const sf = createSourceFile('const x = str.padStart(10, " ");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string padEnd', () => {
      const sf = createSourceFile('const x = str.padEnd(10, " ");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string repeat', () => {
      const sf = createSourceFile('const x = str.repeat(3);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string replace', () => {
      const sf = createSourceFile('const x = str.replace("a", "b");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string replaceAll', () => {
      const sf = createSourceFile('const x = str.replaceAll("a", "b");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string search', () => {
      const sf = createSourceFile('const x = str.search(/pattern/);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string slice', () => {
      const sf = createSourceFile('const x = str.slice(0, 5);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string split', () => {
      const sf = createSourceFile('const x = str.split(",");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string startsWith', () => {
      const sf = createSourceFile('const x = str.startsWith("prefix");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string endsWith', () => {
      const sf = createSourceFile('const x = str.endsWith("suffix");')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string substring', () => {
      const sf = createSourceFile('const x = str.substring(0, 5);')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string toLowerCase', () => {
      const sf = createSourceFile('const x = str.toLowerCase();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string toUpperCase', () => {
      const sf = createSourceFile('const x = str.toUpperCase();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string trim', () => {
      const sf = createSourceFile('const x = str.trim();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string trimStart', () => {
      const sf = createSourceFile('const x = str.trimStart();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string trimEnd', () => {
      const sf = createSourceFile('const x = str.trimEnd();')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
    it('should not flag string length', () => {
      const sf = createSourceFile('const x = str.length;')
      expect(analyzePreferStringTemplate(sf)).toHaveLength(0)
    })
  })
})
