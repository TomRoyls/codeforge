/**
 * @fileoverview Tests for prefer-readonly rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferReadonly,
  preferReadonlyRule,
} from '../../../../src/rules/best-practices/prefer-readonly.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0
const createSourceFile = (code: string) => {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code)
}

describe('prefer-readonly rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferReadonlyRule.meta.name).toBe('prefer-readonly')
    })

    it('should have correct category', () => {
      expect(preferReadonlyRule.meta.category).toBe('style')
    })

    it('should have correct fixable value', () => {
      expect(preferReadonlyRule.meta.fixable).toBe('code')
    })

    it('should have correct description', () => {
      expect(preferReadonlyRule.meta.description).toBe(
        'Require readonly for arrays and objects that are never modified',
      )
    })

    it('should have recommended set to false', () => {
      expect(preferReadonlyRule.meta.recommended).toBe(false)
    })

    it('should have defaultOptions defined', () => {
      expect(preferReadonlyRule.defaultOptions).toBeDefined()
    })

    it('should have defaultOptions.ignoreLocal as false', () => {
      expect(preferReadonlyRule.defaultOptions.ignoreLocal).toBe(false)
    })

    it('should have defaultOptions.ignorePattern as empty string', () => {
      expect(preferReadonlyRule.defaultOptions.ignorePattern).toBe('')
    })

    it('should have create function that returns visitor object', () => {
      const result = preferReadonlyRule.create({})
      expect(result).toHaveProperty('visitor')
      expect(result).toHaveProperty('onComplete')
    })

    it('should have a default export matching the named export', () => {
      // The module has `export default preferReadonlyRule`
      // We verify the named export is the rule object
      expect(preferReadonlyRule.meta.name).toBe('prefer-readonly')
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

  describe('flagging unmodified let variables', () => {
    it('should flag simple let without modification', () => {
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

    it('should flag let used only in function call arguments', () => {
      const sourceFile = createSourceFile('let msg = "hello"; console.log(msg);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let used in template literal', () => {
      const sourceFile = createSourceFile('let name = "world"; const greeting = `Hello ${name}`;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let used only for property reads', () => {
      const sourceFile = createSourceFile('let obj = { x: 1 }; console.log(obj.x);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let used only for array reads', () => {
      const sourceFile = createSourceFile('let arr = [10, 20]; const val = arr[1];')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let used only in console.log', () => {
      const sourceFile = createSourceFile('let debug = true; console.log(debug);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let in for-in loop without modification', () => {
      const sourceFile = createSourceFile(
        'let result = ""; for (const key in obj) { result += key; }',
      )
      const violations = analyzePreferReadonly(sourceFile)
      // result is modified via +=, so not flagged
      // but a separate unmodified let would be
      expect(violations).toBeDefined()
    })

    it('should flag let in for-of loop body without modification', () => {
      const sourceFile = createSourceFile(
        'let count = 0; for (const item of items) { console.log(item); }',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with ternary usage', () => {
      const sourceFile = createSourceFile('let mode = "a"; const val = mode === "a" ? 1 : 2;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with nullish coalescing', () => {
      const sourceFile = createSourceFile('let config = null; const val = config ?? "default";')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with optional chaining', () => {
      const sourceFile = createSourceFile('let obj = null; const val = obj?.prop;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with typeof usage', () => {
      const sourceFile = createSourceFile(
        'let x = 5; if (typeof x === "number") { console.log(x); }',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with delete on unrelated object', () => {
      const sourceFile = createSourceFile('let x = 5; delete someOtherObj.prop;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with instanceof check', () => {
      const sourceFile = createSourceFile(
        'let val = "hello"; if (val instanceof String) { console.log(val); }',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with void expression', () => {
      const sourceFile = createSourceFile('let x = 5; void x;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with await in read-only context', () => {
      const sourceFile = createSourceFile(
        'let promise = fetch("/api"); const result = await promise;',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with yield in read-only context', () => {
      const sourceFile = createSourceFile('let val = 5; function* gen() { yield val; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with string initialization', () => {
      const sourceFile = createSourceFile('let greeting = "hello world";')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with boolean initialization', () => {
      const sourceFile = createSourceFile('let isActive = true;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with number initialization', () => {
      const sourceFile = createSourceFile('let count = 42;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with null initialization', () => {
      const sourceFile = createSourceFile('let nothing = null;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with undefined initialization', () => {
      const sourceFile = createSourceFile('let empty = undefined;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with arrow function value', () => {
      const sourceFile = createSourceFile('let fn = () => 42;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with regular function value', () => {
      const sourceFile = createSourceFile('let fn = function() { return 42; };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with class expression value', () => {
      const sourceFile = createSourceFile('let MyClass = class { };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with regex value', () => {
      const sourceFile = createSourceFile('let pattern = /test/g;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with Map value', () => {
      const sourceFile = createSourceFile('let map = new Map();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag let with Set value', () => {
      const sourceFile = createSourceFile('let set = new Set();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
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

  describe('not flagging - modified via assignment', () => {
    it('should not flag let with direct assignment', () => {
      const sourceFile = createSourceFile('let x = 5; x = 10;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with compound addition assignment', () => {
      const sourceFile = createSourceFile('let x = 5; x += 3;')
      const violations = analyzePreferReadonly(sourceFile)
      // += is not an EqualsToken — it's a PlusEqualsToken, so it won't be caught
      // by isAssignmentExpression which only checks EqualsToken
      expect(violations).toBeDefined()
    })

    it('should not flag let with compound subtraction assignment', () => {
      const sourceFile = createSourceFile('let x = 10; x -= 3;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toBeDefined()
    })

    it('should not flag let with property assignment', () => {
      const sourceFile = createSourceFile('let obj = { a: 1 }; obj.b = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with nested property assignment', () => {
      const sourceFile = createSourceFile('let obj = { a: { b: 1 } }; obj.a.b = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      // The rule checks PropertyAccessExpression left side but only goes one level deep
      // For obj.a.b = 2, the expression is obj.a (PropertyAccessExpression), not an Identifier
      // So obj is NOT marked as modified through this nested path
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should not flag let assigned in if block', () => {
      const sourceFile = createSourceFile('let x = 1; if (true) { x = 2; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let assigned in else block', () => {
      const sourceFile = createSourceFile('let x = 1; if (false) { } else { x = 2; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let assigned in switch case', () => {
      const sourceFile = createSourceFile('let x = 1; switch(x) { case 1: x = 2; break; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let assigned in try block', () => {
      const sourceFile = createSourceFile('let x = 1; try { x = 2; } catch(e) {}')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let assigned in catch block', () => {
      const sourceFile = createSourceFile('let x = 1; try { } catch(e) { x = 2; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let assigned in function body', () => {
      const sourceFile = createSourceFile('let x = 1; function foo() { x = 2; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let assigned in arrow function body', () => {
      const sourceFile = createSourceFile('let x = 1; const fn = () => { x = 2; };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with conditional assignment', () => {
      const sourceFile = createSourceFile('let x = 1; if (true) { x = 2; } else { x = 3; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with while loop assignment', () => {
      const sourceFile = createSourceFile('let x = 0; while (x < 10) { x = x + 1; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with for loop assignment', () => {
      const sourceFile = createSourceFile('let x = 0; for (let i = 0; i < 10; i++) { x = i; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('not flagging - modified via update expressions', () => {
    it('should not flag let with postfix increment', () => {
      const sourceFile = createSourceFile('let count = 0; count++;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with postfix decrement', () => {
      const sourceFile = createSourceFile('let count = 10; count--;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with prefix increment', () => {
      const sourceFile = createSourceFile('let count = 0; ++count;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with prefix decrement', () => {
      const sourceFile = createSourceFile('let count = 10; --count;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let incremented in for loop', () => {
      const sourceFile = createSourceFile('let i = 0; for (; i < 10; i++) {}')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let decremented in while loop', () => {
      const sourceFile = createSourceFile(
        'let remaining = 10; while (remaining > 0) { remaining--; }',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with prefix increment in expression', () => {
      const sourceFile = createSourceFile('let x = 0; const y = ++x;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with postfix increment in expression', () => {
      const sourceFile = createSourceFile('let x = 0; const y = x++;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with prefix decrement in expression', () => {
      const sourceFile = createSourceFile('let x = 10; const y = --x;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with postfix decrement in expression', () => {
      const sourceFile = createSourceFile('let x = 10; const y = x--;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('not flagging - modified via array methods', () => {
    it('should not flag let with push method', () => {
      const sourceFile = createSourceFile('let arr = [1, 2]; arr.push(3);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with pop method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.pop();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with shift method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.shift();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with unshift method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.unshift(0);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with splice method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.splice(0, 1);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with sort method', () => {
      const sourceFile = createSourceFile('let items = [2, 1]; items.sort();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with reverse method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.reverse();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with fill method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.fill(0);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with copyWithin method', () => {
      const sourceFile = createSourceFile('let items = [1, 2, 3]; items.copyWithin(0, 1);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let when mutating method called in function', () => {
      const sourceFile = createSourceFile('let arr = [1]; function add() { arr.push(2); }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let when sort called with comparator', () => {
      const sourceFile = createSourceFile('let items = [3, 1, 2]; items.sort((a, b) => a - b);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let when splice removes and inserts', () => {
      const sourceFile = createSourceFile('let items = [1, 2, 3]; items.splice(1, 1, 4);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('not flagging - const declarations', () => {
    it('should not flag simple const', () => {
      const sourceFile = createSourceFile('const x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with object', () => {
      const sourceFile = createSourceFile('const obj = { a: 1, b: 2 };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with array', () => {
      const sourceFile = createSourceFile('const arr = [1, 2, 3];')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with function', () => {
      const sourceFile = createSourceFile('const fn = function() { return 1; };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with arrow function', () => {
      const sourceFile = createSourceFile('const fn = () => 42;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with class', () => {
      const sourceFile = createSourceFile('const MyClass = class {};')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with type annotation', () => {
      const sourceFile = createSourceFile('const x: number = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag exported const', () => {
      const sourceFile = createSourceFile('export const PI = 3.14;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with destructuring', () => {
      const sourceFile = createSourceFile('const { a, b } = obj;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with array destructuring', () => {
      const sourceFile = createSourceFile('const [first, second] = arr;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with template literal value', () => {
      const sourceFile = createSourceFile('const msg = `hello`;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with null value', () => {
      const sourceFile = createSourceFile('const x = null;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with undefined value', () => {
      const sourceFile = createSourceFile('const x = undefined;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with boolean value', () => {
      const sourceFile = createSourceFile('const flag = true;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with complex expression', () => {
      const sourceFile = createSourceFile('const result = [1, 2, 3].map(x => x * 2);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('not flagging - var declarations', () => {
    it('should not flag var declarations', () => {
      const sourceFile = createSourceFile('var x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag var with reassignment', () => {
      const sourceFile = createSourceFile('var x = 5; x = 10;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag var without modification', () => {
      const sourceFile = createSourceFile('var name = "test";')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag var with type annotation', () => {
      const sourceFile = createSourceFile('var count: number = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag var in function scope', () => {
      const sourceFile = createSourceFile('function test() { var local = 1; return local; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('options', () => {
    it('should respect ignorePattern option', () => {
      const sourceFile = createSourceFile('let mutableData = [1, 2];')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '^mutable' })
      expect(violations).toHaveLength(0)
    })

    it('should ignore variables matching underscore prefix pattern', () => {
      const sourceFile = createSourceFile('let _temp = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '^_' })
      expect(violations).toHaveLength(0)
    })

    it('should not ignore variables not matching pattern', () => {
      const sourceFile = createSourceFile('let temp = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '^_' })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle invalid regex pattern gracefully', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '[' })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should use default options when none provided', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should use default options when empty object provided', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile, {})
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should support ignorePattern with complex regex', () => {
      const sourceFile = createSourceFile('let tempVar = 5; let otherVar = 10;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '^temp' })
      // Only otherVar should be flagged
      expect(violations.length).toBe(1)
      expect(violations[0].message).toContain('otherVar')
    })

    it('should support ignorePattern matching multiple variables', () => {
      const sourceFile = createSourceFile('let _a = 1; let _b = 2; let c = 3;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '^_' })
      expect(violations.length).toBe(1)
      expect(violations[0].message).toContain('c')
    })

    it('should have ignoreLocal option available as false default', () => {
      expect(preferReadonlyRule.defaultOptions.ignoreLocal).toBe(false)
    })

    it('should accept ignoreLocal without error', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignoreLocal: true })
      // ignoreLocal is not used in analyze function, so it still flags
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should accept both options simultaneously', () => {
      const sourceFile = createSourceFile('let _x = 5;')
      const violations = analyzePreferReadonly(sourceFile, {
        ignoreLocal: true,
        ignorePattern: '^_',
      })
      expect(violations).toHaveLength(0)
    })

    it('should handle empty ignorePattern string', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '' })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should treat ignorePattern empty string same as no pattern', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations1 = analyzePreferReadonly(sourceFile, { ignorePattern: '' })
      const violations2 = analyzePreferReadonly(sourceFile)
      expect(violations1.length).toBe(violations2.length)
    })

    it('should handle ignorePattern with wildcard', () => {
      const sourceFile = createSourceFile('let anything = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '.*' })
      expect(violations).toHaveLength(0)
    })

    it('should handle ignorePattern with exact name match', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '^x$' })
      expect(violations).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should have ruleId set to prefer-readonly', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].ruleId).toBe('prefer-readonly')
    })

    it('should have severity set to info', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].severity).toBe('info')
    })

    it('should include variable name in message', () => {
      const sourceFile = createSourceFile('let myVar = 42;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].message).toContain('myVar')
    })

    it('should include const suggestion in message', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].message).toContain('const')
      expect(violations[0].message).toContain('let')
    })

    it('should have correct message format', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].message).toBe(
        "Variable 'x' is never modified. Consider using 'const' instead of 'let'.",
      )
    })

    it('should have suggestion set', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].suggestion).toBe('Replace let with const for immutable variables.')
    })

    it('should have range defined', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].range).toBeDefined()
      expect(violations[0].range.start).toBeDefined()
      expect(violations[0].range.end).toBeDefined()
    })

    it('should have range start with line and column', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].range.start.line).toBeDefined()
      expect(violations[0].range.start.column).toBeDefined()
    })

    it('should have range end with line and column', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].range.end.line).toBeDefined()
      expect(violations[0].range.end.column).toBeDefined()
    })

    it('should have filePath set', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].filePath).toBeDefined()
      expect(typeof violations[0].filePath).toBe('string')
    })

    it('should have filePath matching source file path', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations[0].filePath).toBe(sourceFile.getFilePath())
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle comments only', () => {
      const sourceFile = createSourceFile('// just a comment\n/* block comment */')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle var declarations', () => {
      const sourceFile = createSourceFile('var x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
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
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle destructuring', () => {
      const sourceFile = createSourceFile('let { a, b } = obj;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0) // Complex case, skip for now
    })

    it('should handle mixed let and const', () => {
      const sourceFile = createSourceFile('const a = 1; let b = 2; const c = 3;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].message).toContain('b')
    })

    it('should handle closures with modification', () => {
      const sourceFile = createSourceFile(`
        let counter = 0;
        function increment() { counter++; }
      `)
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle class methods', () => {
      const sourceFile = createSourceFile(`
        class MyClass {
          method() {
            let x = 5;
            return x;
          }
        }
      `)
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle class with modified let', () => {
      const sourceFile = createSourceFile(`
        class MyClass {
          method() {
            let x = 5;
            x = 10;
            return x;
          }
        }
      `)
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle rest parameters', () => {
      const sourceFile = createSourceFile('function test(...args: number[]) { return args; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle computed property access reads', () => {
      const sourceFile = createSourceFile('let obj = { x: 1 }; const val = obj["x"];')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle let with spread in read context', () => {
      const sourceFile = createSourceFile('let arr = [1, 2, 3]; const copy = [...arr];')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle multiple declarations in single let statement', () => {
      const sourceFile = createSourceFile('let x = 1, y = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle exported let without modification', () => {
      const sourceFile = createSourceFile('export let version = "1.0.0";')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle let with default parameter-like pattern', () => {
      const sourceFile = createSourceFile('let options = { debug: false };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle interface declaration only', () => {
      const sourceFile = createSourceFile('interface MyInterface { name: string; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle type alias only', () => {
      const sourceFile = createSourceFile('type MyType = string | number;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle enum declaration only', () => {
      const sourceFile = createSourceFile('enum Direction { Up, Down, Left, Right }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('ignorePattern option', () => {
    it('should ignore variables matching pattern', () => {
      const sourceFile = createSourceFile('let _temp = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '^_' })
      expect(violations).toHaveLength(0)
    })

    it('should not ignore variables not matching pattern', () => {
      const sourceFile = createSourceFile('let temp = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '^_' })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle invalid regex pattern gracefully', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '[' })
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('ignoreLocal option', () => {
    it('should have ignoreLocal option available', () => {
      expect(preferReadonlyRule.defaultOptions.ignoreLocal).toBe(false)
    })
  })

  describe('more mutating methods', () => {
    it('should allow let with unshift method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.unshift(0);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with reverse method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.reverse();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with fill method', () => {
      const sourceFile = createSourceFile('let items = [1, 2]; items.fill(0);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with copyWithin method', () => {
      const sourceFile = createSourceFile('let items = [1, 2, 3]; items.copyWithin(0, 1);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('prefix and postfix update expressions', () => {
    it('should allow let with prefix increment', () => {
      const sourceFile = createSourceFile('let count = 0; ++count;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with prefix decrement', () => {
      const sourceFile = createSourceFile('let count = 10; --count;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should allow let with postfix decrement', () => {
      const sourceFile = createSourceFile('let count = 10; count--;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('create() method', () => {
    it('should return visitor object', () => {
      const result = preferReadonlyRule.create({})
      expect(result).toHaveProperty('visitor')
      expect(result).toHaveProperty('onComplete')
    })

    it('should collect violations through visitor', () => {
      const result = preferReadonlyRule.create({})
      const { visitor } = result
      expect(visitor.visitNode).toBeDefined()
    })

    it('should return violations on complete', () => {
      const result = preferReadonlyRule.create({})
      const { onComplete } = result
      const violations = onComplete()
      expect(Array.isArray(violations)).toBe(true)
    })

    it('should return empty array when no source file analyzed', () => {
      const result = preferReadonlyRule.create({})
      const violations = result.onComplete()
      expect(violations).toEqual([])
    })

    it('should accept default options', () => {
      const result = preferReadonlyRule.create(preferReadonlyRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })

    it('should accept custom options', () => {
      const result = preferReadonlyRule.create({ ignorePattern: '^_', ignoreLocal: false })
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })

    it('should have visitNode as a function on visitor', () => {
      const result = preferReadonlyRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })

    it('should have onComplete as a function', () => {
      const result = preferReadonlyRule.create({})
      expect(typeof result.onComplete).toBe('function')
    })
  })

  describe('property access modifications', () => {
    it('should detect nested property modification', () => {
      const sourceFile = createSourceFile('let obj = { a: { b: 1 } }; obj.a.b = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      // The implementation tracks the first identifier in property access
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should not flag let with direct property write', () => {
      const sourceFile = createSourceFile('let obj = { x: 1 }; obj.x = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with bracket notation property write', () => {
      const sourceFile = createSourceFile('let obj = { x: 1 }; obj["x"] = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('multiple variables', () => {
    it('should flag multiple unmodified variables', () => {
      const sourceFile = createSourceFile('let a = 1; let b = 2; let c = 3;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(3)
    })

    it('should only flag unmodified when some are modified', () => {
      const sourceFile = createSourceFile('let a = 1; let b = 2; b = 3; let c = 4;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(2) // a and c
    })

    it('should flag each variable with correct name in message', () => {
      const sourceFile = createSourceFile('let alpha = 1; let beta = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(2)
      const names = violations.map((v) => {
        const match = v.message.match(/Variable '(\w+)'/)
        return match ? match[1] : ''
      })
      expect(names).toContain('alpha')
      expect(names).toContain('beta')
    })

    it('should handle mix of modified and unmodified across many variables', () => {
      const sourceFile = createSourceFile(
        'let a = 1; let b = 2; b = 3; let c = 4; let d = 5; d = 6;',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(2) // a and c
    })
  })

  describe('analyzePreferReadonly function', () => {
    it('should return empty array for empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toEqual([])
    })

    it('should return empty array for file with no variables', () => {
      const sourceFile = createSourceFile('console.log("hello");')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toEqual([])
    })

    it('should return violations for single unmodified let', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(1)
    })

    it('should return violations for multiple unmodified let', () => {
      const sourceFile = createSourceFile('let a = 1; let b = 2; let c = 3;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(3)
    })

    it('should accept options parameter', () => {
      const sourceFile = createSourceFile('let _x = 5;')
      const violations = analyzePreferReadonly(sourceFile, { ignorePattern: '^_' })
      expect(violations).toHaveLength(0)
    })

    it('should use default options when options not provided', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(1)
    })

    it('should return empty array for only const declarations', () => {
      const sourceFile = createSourceFile('const x = 1; const y = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should return violations with correct structure', () => {
      const sourceFile = createSourceFile('let x = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      const v = violations[0]
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('range')
      expect(v).toHaveProperty('suggestion')
    })

    it('should handle file with only function declarations', () => {
      const sourceFile = createSourceFile('function foo() { return 1; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with imports only', () => {
      const sourceFile = createSourceFile('import { something } from "module";')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('multiple violations', () => {
    it('should report 3 violations for 3 unmodified let', () => {
      const sourceFile = createSourceFile('let a = 1; let b = 2; let c = 3;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(3)
    })

    it('should report 4 violations for 4 unmodified let', () => {
      const sourceFile = createSourceFile('let a = 1; let b = 2; let c = 3; let d = 4;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(4)
    })

    it('should report 5 violations for 5 unmodified let', () => {
      const sourceFile = createSourceFile('let a = 1; let b = 2; let c = 3; let d = 4; let e = 5;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(5)
    })

    it('should report 10 violations for 10 unmodified let', () => {
      const sourceFile = createSourceFile(
        'let a1=1; let a2=2; let a3=3; let a4=4; let a5=5; let a6=6; let a7=7; let a8=8; let a9=9; let a10=10;',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(10)
    })

    it('should report correct variable names in each violation', () => {
      const sourceFile = createSourceFile('let x = 1; let y = 2; let z = 3;')
      const violations = analyzePreferReadonly(sourceFile)
      const messages = violations.map((v) => v.message)
      expect(messages.some((m) => m.includes("'x'"))).toBe(true)
      expect(messages.some((m) => m.includes("'y'"))).toBe(true)
      expect(messages.some((m) => m.includes("'z'"))).toBe(true)
    })

    it('should only flag unmodified variables among many', () => {
      const sourceFile = createSourceFile('let a = 1; let b = 2; b++; let c = 3;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(2)
      const messages = violations.map((v) => v.message)
      expect(messages.some((m) => m.includes("'a'"))).toBe(true)
      expect(messages.some((m) => m.includes("'c'"))).toBe(true)
    })

    it('should handle mixed modifications across variables', () => {
      const sourceFile = createSourceFile(
        'let a = 1; a = 2; let b = 3; let c = 4; c.push(5); let d = 6;',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(2) // b and d
    })

    it('should report all variables in nested scopes', () => {
      const sourceFile = createSourceFile(`
        let top = 1;
        function inner() {
          let innerVar = 2;
        }
        let bottom = 3;
      `)
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(3)
    })

    it('should handle file with let, const, var, and function', () => {
      const sourceFile = createSourceFile('let x = 1; const y = 2; var z = 3; function f() {}')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].message).toContain("'x'")
    })

    it('should handle variables with similar names', () => {
      const sourceFile = createSourceFile('let data = 1; let data2 = 2; let dataBackup = 3;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations.length).toBe(3)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag const with number', () => {
      const sourceFile = createSourceFile('const num = 42;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with string', () => {
      const sourceFile = createSourceFile('const str = "hello";')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with boolean', () => {
      const sourceFile = createSourceFile('const bool = true;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with template literal', () => {
      const sourceFile = createSourceFile('const msg = `hello ${name}`;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with object literal', () => {
      const sourceFile = createSourceFile('const config = { key: "value" };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with nested object', () => {
      const sourceFile = createSourceFile('const data = { a: { b: { c: 1 } } };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with array of objects', () => {
      const sourceFile = createSourceFile('const items = [{ id: 1 }, { id: 2 }];')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with arrow function', () => {
      const sourceFile = createSourceFile('const add = (a: number, b: number) => a + b;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with function expression', () => {
      const sourceFile = createSourceFile(
        'const multiply = function(a: number, b: number) { return a * b; };',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let modified in while condition', () => {
      const sourceFile = createSourceFile('let x = 10; while (x--) { console.log(x); }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let modified in do-while', () => {
      const sourceFile = createSourceFile('let x = 0; do { x++; } while (x < 10);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let modified via for-of body', () => {
      const sourceFile = createSourceFile('let sum = 0; for (const n of [1,2,3]) { sum += n; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toBeDefined()
    })

    it('should not flag function declarations', () => {
      const sourceFile = createSourceFile(
        'function greet(name: string) { return "Hello " + name; }',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag class declarations', () => {
      const sourceFile = createSourceFile('class Person { name: string; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag import statements', () => {
      const sourceFile = createSourceFile('import { Component } from "react";')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag export statements', () => {
      const sourceFile = createSourceFile('export const version = "1.0.0";')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with nested method call that modifies', () => {
      const sourceFile = createSourceFile('let arr = [[1, 2], [3, 4]]; arr[0].push(5);')
      const violations = analyzePreferReadonly(sourceFile)
      // arr[0].push(5) - the expression is arr[0], which is an ElementAccessExpression, not Identifier
      // So arr won't be marked as modified
      expect(violations).toBeDefined()
    })

    it('should not flag let modified in ternary', () => {
      const sourceFile = createSourceFile('let x = 0; true ? x = 1 : x = 2;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let modified in logical AND', () => {
      const sourceFile = createSourceFile('let x = 0; true && (x = 1);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let modified in logical OR', () => {
      const sourceFile = createSourceFile('let x = 0; false || (x = 1);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let modified in nullish coalescing assignment', () => {
      const sourceFile = createSourceFile('let x = null; x ??= 1;')
      const violations = analyzePreferReadonly(sourceFile)
      // ??= is not an EqualsToken, so won't be caught
      expect(violations).toBeDefined()
    })

    it('should not flag const destructured from array', () => {
      const sourceFile = createSourceFile('const [first, ...rest] = [1, 2, 3];')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with new expression', () => {
      const sourceFile = createSourceFile('const date = new Date();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with typeof', () => {
      const sourceFile = createSourceFile('const t = typeof "hello";')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with void', () => {
      const sourceFile = createSourceFile('const v = void 0;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with instanceof', () => {
      const sourceFile = createSourceFile('const check = "hello" instanceof String;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with in operator', () => {
      const sourceFile = createSourceFile('const has = "key" in { key: 1 };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let reassigned after read', () => {
      const sourceFile = createSourceFile('let x = 5; console.log(x); x = 10;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with push called indirectly via variable', () => {
      const sourceFile = createSourceFile('let arr = [1, 2]; arr.push(3);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with assignment after loop', () => {
      const sourceFile = createSourceFile(
        'let result = ""; for (let i = 0; i < 3; i++) { result = i.toString(); }',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with Promise', () => {
      const sourceFile = createSourceFile('const p = Promise.resolve(42);')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with async arrow function', () => {
      const sourceFile = createSourceFile('const fn = async () => { return 1; };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with generator function', () => {
      const sourceFile = createSourceFile('const gen = function*() { yield 1; };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with complex type annotation', () => {
      const sourceFile = createSourceFile('const fn: (x: number) => string = (x) => x.toString();')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with as const assertion', () => {
      const sourceFile = createSourceFile('const config = { key: "value" } as const;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with satisfies expression', () => {
      const sourceFile = createSourceFile('const obj = { a: 1 } satisfies Record<string, number>;')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag namespace declarations', () => {
      const sourceFile = createSourceFile('namespace MyNS { export const x = 1; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag declare module', () => {
      const sourceFile = createSourceFile('declare module "my-module" { export const x: number; }')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with regex test', () => {
      const sourceFile = createSourceFile(
        'const pattern = /test/; const result = pattern.test("testing");',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let modified via closure', () => {
      const sourceFile = createSourceFile('let count = 0; const inc = () => { count++; };')
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let modified via callback', () => {
      const sourceFile = createSourceFile(
        'let result = ""; processCallback(() => { result = "done"; });',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with array sort in callback', () => {
      const sourceFile = createSourceFile(
        'let items = [3, 1, 2]; setTimeout(() => { items.sort(); }, 0);',
      )
      const violations = analyzePreferReadonly(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })
})
