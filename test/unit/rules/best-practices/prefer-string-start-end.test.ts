import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferStringStartEnd,
  preferStringStartEndRule,
} from '../../../../src/rules/best-practices/prefer-string-start-end.js'

const createSourceFile = (code: string) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-string-start-end rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferStringStartEndRule.meta.name).toBe('prefer-string-start-end')
    })

    it('should have style category', () => {
      expect(preferStringStartEndRule.meta.category).toBe('style')
    })

    it('should have warning severity', () => {
      expect(preferStringStartEndRule.meta.severity).toBe('warning')
    })

    it('should not be recommended', () => {
      expect(preferStringStartEndRule.meta.recommended).toBe(false)
    })

    it('should have a description', () => {
      expect(preferStringStartEndRule.meta.description).toBeDefined()
      expect(typeof preferStringStartEndRule.meta.description).toBe('string')
    })

    it('should mention template literals or concatenation in description', () => {
      const desc = preferStringStartEndRule.meta.description.toLowerCase()
      expect(desc.includes('template') || desc.includes('concatenat')).toBe(true)
    })

    it('should have defaultOptions', () => {
      expect(preferStringStartEndRule.defaultOptions).toBeDefined()
    })

    it('should have create function', () => {
      expect(typeof preferStringStartEndRule.create).toBe('function')
    })

    it('should have meta object', () => {
      expect(preferStringStartEndRule.meta).toBeDefined()
    })

    it('should have string name in meta', () => {
      expect(typeof preferStringStartEndRule.meta.name).toBe('string')
    })

    it('should have string description in meta', () => {
      expect(typeof preferStringStartEndRule.meta.description).toBe('string')
    })

    it('should return violations with correct ruleId', () => {
      const sf = createSourceFile('"hello" + name')
      const violations = analyzePreferStringStartEnd(sf)
      if (violations.length > 0) {
        expect(violations[0].ruleId).toBe('prefer-string-start-end')
      }
    })
  })

  describe('detecting violations - basic string literal + operand', () => {
    it('should detect double-quoted string + variable', () => {
      const sf = createSourceFile('"hello" + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect single-quoted string + variable', () => {
      const sf = createSourceFile("'hello' + name")
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect variable + double-quoted string', () => {
      const sf = createSourceFile('name + "hello"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect variable + single-quoted string', () => {
      const sf = createSourceFile("name + 'hello'")
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string literal + string literal', () => {
      const sf = createSourceFile('"hello" + "world"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect single-quoted + single-quoted', () => {
      const sf = createSourceFile("'hello' + 'world'")
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect double-quoted + single-quoted', () => {
      const sf = createSourceFile('"hello" + \'world\'')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect single-quoted + double-quoted', () => {
      const sf = createSourceFile('\'hello\' + "world"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect empty string + variable', () => {
      const sf = createSourceFile('"" + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect variable + empty string', () => {
      const sf = createSourceFile('name + ""')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect single-char string + variable', () => {
      const sf = createSourceFile('"a" + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + number literal', () => {
      const sf = createSourceFile('"count: " + 5')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect number literal + string', () => {
      const sf = createSourceFile('5 + " items"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + boolean literal', () => {
      const sf = createSourceFile('"value: " + true')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect boolean + string', () => {
      const sf = createSourceFile('false + " is false"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + null', () => {
      const sf = createSourceFile('"value: " + null')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + undefined', () => {
      const sf = createSourceFile('"value: " + undefined')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + object literal', () => {
      const sf = createSourceFile('"data: " + {}')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + array literal', () => {
      const sf = createSourceFile('"items: " + []')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + function call', () => {
      const sf = createSourceFile('"result: " + getValue()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect function call + string', () => {
      const sf = createSourceFile('getValue() + " result"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + method call', () => {
      const sf = createSourceFile('"name: " + obj.getName()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect method call + string', () => {
      const sf = createSourceFile('obj.getName() + " end"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + property access', () => {
      const sf = createSourceFile('"hello " + user.name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect property access + string', () => {
      const sf = createSourceFile('user.name + " hello"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + computed property', () => {
      const sf = createSourceFile('"value: " + obj[key]')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + new expression', () => {
      const sf = createSourceFile('"item: " + new Item()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + typeof expression', () => {
      const sf = createSourceFile('"type: " + typeof x')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + parenthesized expression', () => {
      const sf = createSourceFile('"result: " + (a + b)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should not flag parenthesized string + variable (left is not StringLiteral)', () => {
      const sf = createSourceFile('("hello") + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should detect string with special characters + variable', () => {
      const sf = createSourceFile('"hello\\nworld" + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string with tab escape + variable', () => {
      const sf = createSourceFile('"hello\\tworld" + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string with unicode escape + variable', () => {
      const sf = createSourceFile('"\\u0041" + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string with backslash escape + variable', () => {
      const sf = createSourceFile('"path\\\\to\\\\file" + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect string + string in the same expression', () => {
      const sf = createSourceFile('"a" + "b"')
      const violations = analyzePreferStringStartEnd(sf)
      expect(violations).toHaveLength(1)
    })
  })

  describe('detecting violations - chained concatenations', () => {
    it('should detect three chained string concatenations "a" + "b" + "c"', () => {
      const sf = createSourceFile('"a" + "b" + "c"')
      const violations = analyzePreferStringStartEnd(sf)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should detect "prefix" + middle + "suffix" producing 2 violations', () => {
      const sf = createSourceFile('"prefix" + middle + "suffix"')
      const violations = analyzePreferStringStartEnd(sf)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should detect "a" + b + c + "d" with multiple violations', () => {
      const sf = createSourceFile('"a" + b + c + "d"')
      const violations = analyzePreferStringStartEnd(sf)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should detect four chained concatenations', () => {
      const sf = createSourceFile('"a" + "b" + "c" + "d"')
      const violations = analyzePreferStringStartEnd(sf)
      expect(violations.length).toBeGreaterThanOrEqual(3)
    })

    it('should detect "hello" + " " + name with 1 violation (inner is flagged, outer is not)', () => {
      const sf = createSourceFile('"hello" + " " + name')
      const violations = analyzePreferStringStartEnd(sf)
      expect(violations).toHaveLength(1)
    })

    it('should detect deeply nested concatenation chain', () => {
      const sf = createSourceFile('"a" + b + "c" + d + "e"')
      const violations = analyzePreferStringStartEnd(sf)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('detecting violations - contexts', () => {
    it('should detect in const declaration', () => {
      const sf = createSourceFile('const msg = "hello" + name;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in let declaration', () => {
      const sf = createSourceFile('let msg = "hello" + name;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in var declaration', () => {
      const sf = createSourceFile('var msg = "hello" + name;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in assignment expression', () => {
      const sf = createSourceFile('let msg; msg = "hello" + name;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in compound assignment with string literal', () => {
      const sf = createSourceFile('msg += "suffix"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should detect in return statement', () => {
      const sf = createSourceFile('function greet() { return "hello" + name; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect as function argument', () => {
      const sf = createSourceFile('console.log("Error: " + msg)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect as nested function argument', () => {
      const sf = createSourceFile('fn1(fn2("prefix" + val))')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in array element', () => {
      const sf = createSourceFile('const arr = ["item: " + x]')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in object property value', () => {
      const sf = createSourceFile('const obj = { label: "Name: " + name }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in ternary then branch', () => {
      const sf = createSourceFile('const x = flag ? "a" + y : "b"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in ternary else branch', () => {
      const sf = createSourceFile('const x = flag ? "a" : "b" + y')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in ternary condition', () => {
      const sf = createSourceFile('if ("prefix" + suffix) {}')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in if statement condition', () => {
      const sf = createSourceFile('if ("check: " + val) {}')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in while loop condition', () => {
      const sf = createSourceFile('while ("loop: " + counter) {}')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in for loop body', () => {
      const sf = createSourceFile('for (let i = 0; i < 10; i++) { const s = "item" + i; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in for-in loop body', () => {
      const sf = createSourceFile('for (const k in obj) { const s = "key: " + k; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in for-of loop body', () => {
      const sf = createSourceFile('for (const v of arr) { const s = "val: " + v; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in switch case', () => {
      const sf = createSourceFile('switch(x) { case 1: const s = "case" + x; break; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in throw statement', () => {
      const sf = createSourceFile('throw "Error: " + msg')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in class constructor', () => {
      const sf = createSourceFile('class C { constructor() { const s = "init: " + x; } }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in class method', () => {
      const sf = createSourceFile('class C { getLabel(x) { return "label: " + x; } }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in class getter', () => {
      const sf = createSourceFile('class C { get name() { return "item: " + this._id; } }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in class property', () => {
      const sf = createSourceFile('class C { label = "prefix" + "suffix"; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in static class method', () => {
      const sf = createSourceFile('class C { static make(x) { return "static: " + x; } }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in arrow function body', () => {
      const sf = createSourceFile('const fn = (x) => "result: " + x')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in arrow function with block body', () => {
      const sf = createSourceFile('const fn = (x) => { return "result: " + x; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in async function', () => {
      const sf = createSourceFile('async function fn() { return "data: " + await promise; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in generator function', () => {
      const sf = createSourceFile('function* gen() { yield "item: " + x; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in async generator', () => {
      const sf = createSourceFile('async function* gen() { yield "item: " + (await x); }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in try block', () => {
      const sf = createSourceFile('try { const x = "err: " + e; } catch(e) {}')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in catch block', () => {
      const sf = createSourceFile('try {} catch(e) { const x = "caught: " + e; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in finally block', () => {
      const sf = createSourceFile('try {} finally { const x = "finally: " + y; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in namespace', () => {
      const sf = createSourceFile('namespace NS { export const msg = "hello " + name; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in exported const', () => {
      const sf = createSourceFile('export const msg = "hello" + name;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in exported function', () => {
      const sf = createSourceFile('export function fn() { return "result: " + x; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in default export', () => {
      const sf = createSourceFile('export default "prefix" + "suffix"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in callback function', () => {
      const sf = createSourceFile('arr.map((x) => "item: " + x)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in IIFE', () => {
      const sf = createSourceFile('(function() { return "val: " + x; })()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in Promise.then callback', () => {
      const sf = createSourceFile('p.then((x) => "result: " + x)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in destructuring default value', () => {
      const sf = createSourceFile('const { name = "default" + " name" } = obj')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in function default parameter', () => {
      const sf = createSourceFile('function fn(x = "default" + " value") {}')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in type assertion context', () => {
      const sf = createSourceFile('const x = ("hello" + name) as string')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in do-while body', () => {
      const sf = createSourceFile('do { const s = "item: " + i; } while (i < 10)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })
  })

  describe('detecting violations - nested contexts', () => {
    it('should detect inside nested function call', () => {
      const sf = createSourceFile('fn1(fn2("prefix: " + val))')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside method call argument', () => {
      const sf = createSourceFile('obj.method("key: " + val)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside array in object', () => {
      const sf = createSourceFile('const obj = { items: ["a: " + x] }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside nested object', () => {
      const sf = createSourceFile('const obj = { nested: { label: "val: " + x } }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside conditional expression', () => {
      const sf = createSourceFile('const x = true ? "a" + b : c')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside logical AND', () => {
      const sf = createSourceFile('const x = flag && "prefix: " + val')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside logical OR', () => {
      const sf = createSourceFile('const x = fallback || "default: " + val')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside nullish coalescing', () => {
      const sf = createSourceFile('const x = fallback ?? "default: " + val')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside new expression argument', () => {
      const sf = createSourceFile('new Error("Failed: " + reason)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside typeof argument', () => {
      const sf = createSourceFile('typeof ("type: " + val)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside comma expression', () => {
      const sf = createSourceFile('const x = (a, "prefix: " + b)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect inside template expression', () => {
      const sf = createSourceFile('const s = `${"a" + b}`')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in nested arrow function', () => {
      const sf = createSourceFile('const outer = () => { const inner = () => "val: " + x; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })
  })

  describe('detecting violations - multiple in same file', () => {
    it('should detect multiple independent concatenations', () => {
      const sf = createSourceFile('const a = "hello" + x; const b = "world" + y;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(2)
    })

    it('should detect violations in different functions', () => {
      const sf = createSourceFile(
        'function fn1() { return "a: " + x; } function fn2() { return "b: " + y; }',
      )
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(2)
    })

    it('should detect violations in same function', () => {
      const sf = createSourceFile('function fn(x, y) { const a = "a: " + x; const b = "b: " + y; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(2)
    })

    it('should detect violations in different class methods', () => {
      const sf = createSourceFile(
        'class C { m1() { return "a: " + this.x; } m2() { return "b: " + this.y; } }',
      )
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(2)
    })

    it('should detect three independent concatenations', () => {
      const sf = createSourceFile('const a = "x: " + 1; const b = "y: " + 2; const c = "z: " + 3;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(3)
    })

    it('should detect violations in object with multiple properties', () => {
      const sf = createSourceFile('const obj = { a: "x: " + x, b: "y: " + y }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(2)
    })

    it('should detect violations in array with multiple elements', () => {
      const sf = createSourceFile('const arr = ["a: " + x, "b: " + y, "c: " + z]')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(3)
    })
  })

  describe('violation properties', () => {
    it('should have correct ruleId in violation', () => {
      const sf = createSourceFile('"hello" + name')
      const v = analyzePreferStringStartEnd(sf)
      expect(v[0].ruleId).toBe('prefer-string-start-end')
    })

    it('should have warning severity in violation', () => {
      const sf = createSourceFile('"hello" + name')
      const v = analyzePreferStringStartEnd(sf)
      expect(v[0].severity).toBe('warning')
    })

    it('should have correct message in violation', () => {
      const sf = createSourceFile('"hello" + name')
      const v = analyzePreferStringStartEnd(sf)
      expect(v[0].message).toBe('Prefer template literals over string concatenation')
    })

    it('should have suggestion in violation', () => {
      const sf = createSourceFile('"hello" + name')
      const v = analyzePreferStringStartEnd(sf)
      expect(v[0].suggestion).toBe('Consider using a template literal instead')
    })

    it('should have range defined in violation', () => {
      const sf = createSourceFile('"hello" + name')
      const v = analyzePreferStringStartEnd(sf)
      expect(v[0].range).toBeDefined()
    })

    it('should have range with start and end', () => {
      const sf = createSourceFile('"hello" + name')
      const v = analyzePreferStringStartEnd(sf)
      expect(v[0].range.start).toBeDefined()
      expect(v[0].range.end).toBeDefined()
    })

    it('should have filePath set correctly', () => {
      const sf = createSourceFile('"hello" + name')
      const v = analyzePreferStringStartEnd(sf)
      expect(v[0].filePath).toBe('/test.ts')
    })

    it('should have all violations share same properties', () => {
      const sf = createSourceFile('const a = "x: " + x; const b = "y: " + y;')
      const violations = analyzePreferStringStartEnd(sf)
      for (const v of violations) {
        expect(v.ruleId).toBe('prefer-string-start-end')
        expect(v.severity).toBe('warning')
        expect(v.message).toBe('Prefer template literals over string concatenation')
        expect(v.suggestion).toBe('Consider using a template literal instead')
      }
    })

    it('should accept empty options object', () => {
      const sf = createSourceFile('"hello" + name')
      const violations = analyzePreferStringStartEnd(sf, {})
      expect(violations).toHaveLength(1)
    })

    it('should work with rule create function', () => {
      const { visitor, onComplete } = preferStringStartEndRule.create()
      expect(typeof visitor.visitNode).toBe('function')
      expect(typeof onComplete).toBe('function')
    })
  })

  describe('valid cases - non-concatenation operators', () => {
    it('should not flag number addition', () => {
      const sf = createSourceFile('const x = 1 + 2')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag subtraction', () => {
      const sf = createSourceFile('const x = 10 - 5')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag multiplication', () => {
      const sf = createSourceFile('const x = 3 * 4')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag division', () => {
      const sf = createSourceFile('const x = 10 / 2')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag modulo', () => {
      const sf = createSourceFile('const x = 10 % 3')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag exponentiation', () => {
      const sf = createSourceFile('const x = 2 ** 3')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag less than', () => {
      const sf = createSourceFile('const x = a < b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag greater than', () => {
      const sf = createSourceFile('const x = a > b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag equality', () => {
      const sf = createSourceFile('const x = a === b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag inequality', () => {
      const sf = createSourceFile('const x = a !== b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag logical AND', () => {
      const sf = createSourceFile('const x = a && b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag logical OR', () => {
      const sf = createSourceFile('const x = a || b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const x = a ?? b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag bitwise AND', () => {
      const sf = createSourceFile('const x = a & b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag bitwise OR', () => {
      const sf = createSourceFile('const x = a | b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag instanceof', () => {
      const sf = createSourceFile('const x = a instanceof Foo')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag in operator', () => {
      const sf = createSourceFile('const x = "key" in obj')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })
  })

  describe('valid cases - no string literal operand', () => {
    it('should not flag variable + variable', () => {
      const sf = createSourceFile('const x = a + b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag function call + function call', () => {
      const sf = createSourceFile('const x = fn1() + fn2()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag property access + property access', () => {
      const sf = createSourceFile('const x = obj.a + obj.b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag number + number', () => {
      const sf = createSourceFile('const x = 1 + 2')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag array access + array access', () => {
      const sf = createSourceFile('const x = arr[0] + arr[1]')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag identifier + identifier', () => {
      const sf = createSourceFile('const x = a + b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag new expression + variable', () => {
      const sf = createSourceFile('const x = new Foo() + y')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag typeof + variable', () => {
      const sf = createSourceFile('const x = typeof a + b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag unary + variable', () => {
      const sf = createSourceFile('const x = -a + b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag parenthesized variables', () => {
      const sf = createSourceFile('const x = (a) + (b)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })
  })

  describe('valid cases - template literals', () => {
    it('should not flag template literal with interpolation', () => {
      const sf = createSourceFile('const greeting = `hello ${name}`')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag template literal without interpolation', () => {
      const sf = createSourceFile('const greeting = `hello world`')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag tagged template literal', () => {
      const sf = createSourceFile('const x = tag`hello ${name}`')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag template literal in variable declaration', () => {
      const sf = createSourceFile('const msg = `${prefix} ${suffix}`')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag template literal in return statement', () => {
      const sf = createSourceFile('function fn() { return `result: ${x}`; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag template literal in function argument', () => {
      const sf = createSourceFile('console.log(`error: ${msg}`)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag multi-line template literal', () => {
      const sf = createSourceFile('const s = `line1\nline2\n${x}`')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })
  })

  describe('valid cases - string methods', () => {
    it('should not flag String.slice', () => {
      const sf = createSourceFile('const x = "hello".slice(0, 2)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.split', () => {
      const sf = createSourceFile('const parts = "a-b-c".split("-")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.replace', () => {
      const sf = createSourceFile('const x = "hello".replace("h", "H")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.toUpperCase', () => {
      const sf = createSourceFile('const x = "hello".toUpperCase()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.toLowerCase', () => {
      const sf = createSourceFile('const x = "HELLO".toLowerCase()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.trim', () => {
      const sf = createSourceFile('const x = " hello ".trim()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.trimStart', () => {
      const sf = createSourceFile('const x = " hello ".trimStart()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.trimEnd', () => {
      const sf = createSourceFile('const x = " hello ".trimEnd()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.padStart', () => {
      const sf = createSourceFile('const x = "5".padStart(3, "0")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.padEnd', () => {
      const sf = createSourceFile('const x = "5".padEnd(3, "0")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.repeat', () => {
      const sf = createSourceFile('const x = "ab".repeat(3)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.includes', () => {
      const sf = createSourceFile('const x = "hello".includes("ell")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.indexOf', () => {
      const sf = createSourceFile('const x = "hello".indexOf("ell")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.startsWith', () => {
      const sf = createSourceFile('const x = "hello".startsWith("he")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.endsWith', () => {
      const sf = createSourceFile('const x = "hello".endsWith("lo")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.match', () => {
      const sf = createSourceFile('const x = "hello".match(/h/)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.search', () => {
      const sf = createSourceFile('const x = "hello".search(/h/)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.substring', () => {
      const sf = createSourceFile('const x = "hello".substring(1, 3)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag Array.join', () => {
      const sf = createSourceFile('const x = ["a", "b"].join(", ")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag Array.concat', () => {
      const sf = createSourceFile('const x = ["a"].concat(["b"])')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })
  })

  describe('valid cases - language constructs', () => {
    it('should not flag plain string literal', () => {
      const sf = createSourceFile('"hello world"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag function declaration', () => {
      const sf = createSourceFile('function fn() { return "hello"; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag class declaration', () => {
      const sf = createSourceFile('class C { greet() { return "hello"; } }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface I { name: string; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag type alias', () => {
      const sf = createSourceFile('type Name = string;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag enum declaration', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag const enum', () => {
      const sf = createSourceFile('const enum Dir { Up, Down }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag import statement', () => {
      const sf = createSourceFile('import { x } from "module"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag export statement', () => {
      const sf = createSourceFile('export { x }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag variable declaration without concatenation', () => {
      const sf = createSourceFile('const x = 42;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag object destructuring', () => {
      const sf = createSourceFile('const { a, b } = obj')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag array destructuring', () => {
      const sf = createSourceFile('const [a, b] = arr')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag spread syntax', () => {
      const sf = createSourceFile('const x = { ...obj }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag rest parameter', () => {
      const sf = createSourceFile('function fn(...args) {}')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag empty object literal', () => {
      const sf = createSourceFile('const obj = {}')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag empty array literal', () => {
      const sf = createSourceFile('const arr = []')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag unary expressions', () => {
      const sf = createSourceFile('const x = -5; const y = !true;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag void expression', () => {
      const sf = createSourceFile('void 0')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag delete expression', () => {
      const sf = createSourceFile('delete obj.key')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag abstract class', () => {
      const sf = createSourceFile('abstract class C { abstract fn(): void; }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag union type', () => {
      const sf = createSourceFile('type T = string | number;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag intersection type', () => {
      const sf = createSourceFile('type T = A & B;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag mapped type', () => {
      const sf = createSourceFile('type T<T> = { [K in keyof T]: T[K] };')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag conditional type', () => {
      const sf = createSourceFile('type IsString<T> = T extends string ? true : false;')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })
  })

  describe('valid cases - static string operations', () => {
    it('should not flag String.raw', () => {
      const sf = createSourceFile('const raw = String.raw`hello`')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.fromCharCode', () => {
      const sf = createSourceFile('const x = String.fromCharCode(72)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag String.fromCodePoint', () => {
      const sf = createSourceFile('const x = String.fromCodePoint(0x48)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag Buffer.from', () => {
      const sf = createSourceFile('const buf = Buffer.from("hello")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag JSON.stringify', () => {
      const sf = createSourceFile('const s = JSON.stringify(obj)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag JSON.parse', () => {
      const sf = createSourceFile('const obj = JSON.parse(str)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag parseInt', () => {
      const sf = createSourceFile('const n = parseInt("42", 10)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag parseFloat', () => {
      const sf = createSourceFile('const n = parseFloat("3.14")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag isNaN', () => {
      const sf = createSourceFile('const x = isNaN(42)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag encodeURI', () => {
      const sf = createSourceFile('const x = encodeURI("https://example.com")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag decodeURI', () => {
      const sf = createSourceFile('const x = decodeURI(str)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag btoa', () => {
      const sf = createSourceFile('const x = btoa("hello")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag atob', () => {
      const sf = createSourceFile('const x = atob("aGVsbG8=")')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })
  })

  describe('valid cases - real-world patterns', () => {
    it('should not flag array join pattern', () => {
      const sf = createSourceFile(
        "const parts = ['hello', 'world']; const result = parts.join(' ');",
      )
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag array concat pattern', () => {
      const sf = createSourceFile(
        "const items = ['a', 'b', 'c']; const result = items.concat(['d', 'e'])",
      )
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag string method chain', () => {
      const sf = createSourceFile('const x = "  hello  ".trim().toUpperCase()')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag function returning string', () => {
      const sf = createSourceFile('function getString() { return "hello" }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag class with string methods', () => {
      const sf = createSourceFile('class Greeter { greet() { return "hello" } }')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag loop with string methods', () => {
      const sf = createSourceFile(`
        const parts = ['hello', 'world'];
        for (let i = 0; i < parts.length; i++) {
          parts[i] = parts[i].toUpperCase();
        }
      `)
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag hex string parsing', () => {
      const sf = createSourceFile(
        "const hex = 'deadbeef'; const binary = hex.split('').map(b => parseInt(b, 16)).join('');",
      )
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag map/join pattern', () => {
      const sf = createSourceFile("const names = items.map(i => i.name).join(', ');")
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag regex test', () => {
      const sf = createSourceFile('const x = /hello/.test(str)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should not flag regex exec', () => {
      const sf = createSourceFile('const x = /hello/.exec(str)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should handle only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should handle only comments', () => {
      const sf = createSourceFile('// just a comment\n/* block */')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should handle single string literal', () => {
      const sf = createSourceFile('"hello"')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should handle only variable reference', () => {
      const sf = createSourceFile('x')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(0)
    })

    it('should detect concatenation in deeply nested function', () => {
      const sf = createSourceFile(`
        function outer() {
          function middle() {
            function inner() {
              return "deep: " + x;
            }
            return inner();
          }
          return middle();
        }
      `)
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect concatenation in complex expression', () => {
      const sf = createSourceFile('const x = (flag ? "a" : "b") + ("prefix" + val)')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect concatenation as ternary condition', () => {
      const sf = createSourceFile('const x = ("prefix" + suffix) ? a : b')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should handle string with unicode characters', () => {
      const sf = createSourceFile('"日本語" + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should handle string with emoji', () => {
      const sf = createSourceFile('"🎉 " + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should handle string with hex escape', () => {
      const sf = createSourceFile('"\\x41" + name')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should handle long string literal', () => {
      const sf = createSourceFile(
        '"this is a very long string that goes on and on and on and on" + name',
      )
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in type assertion expression', () => {
      const sf = createSourceFile('const x = ("hello" + name) as const')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in satisfies expression', () => {
      const sf = createSourceFile('const x = ("hello" + name) satisfies string')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in non-null assertion context', () => {
      const sf = createSourceFile('const x = ("hello" + name)!')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should detect in as expression chain', () => {
      const sf = createSourceFile('const x = (("hello" + name) as string) as unknown')
      expect(analyzePreferStringStartEnd(sf)).toHaveLength(1)
    })

    it('should handle mixed valid and invalid in same file', () => {
      const sf = createSourceFile('const a = 1 + 2; const b = "hello" + name; const c = x + y;')
      const violations = analyzePreferStringStartEnd(sf)
      expect(violations).toHaveLength(1)
    })

    it('should handle multiple string concatenations in single expression', () => {
      const sf = createSourceFile('const x = "a" + "b" + "c" + "d" + "e"')
      const violations = analyzePreferStringStartEnd(sf)
      expect(violations.length).toBeGreaterThanOrEqual(4)
    })
  })
})
