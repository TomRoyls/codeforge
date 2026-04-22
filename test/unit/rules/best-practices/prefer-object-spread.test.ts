/**
 * @fileoverview Tests for prefer-object-spread rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferObjectSpread,
  preferObjectSpreadRule,
} from '../../../../src/rules/best-practices/prefer-object-spread.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-object-spread rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferObjectSpreadRule.meta.name).toBe('prefer-object-spread')
    })
    it('should have style category', () => {
      expect(preferObjectSpreadRule.meta.category).toBe('style')
    })
    it('should be fixable as code', () => {
      expect(preferObjectSpreadRule.meta.fixable).toBe('code')
    })
    it('should have a description', () => {
      expect(preferObjectSpreadRule.meta.description).toBeDefined()
      expect(typeof preferObjectSpreadRule.meta.description).toBe('string')
    })
    it('should mention spread in description', () => {
      expect(preferObjectSpreadRule.meta.description).toContain('spread')
    })
    it('should mention Object.assign in description', () => {
      expect(preferObjectSpreadRule.meta.description).toContain('Object.assign')
    })
    it('should not be recommended', () => {
      expect(preferObjectSpreadRule.meta.recommended).toBe(false)
    })
    it('should have defaultOptions as empty object', () => {
      expect(preferObjectSpreadRule.defaultOptions).toEqual({})
    })
    it('should have create function', () => {
      expect(typeof preferObjectSpreadRule.create).toBe('function')
    })
  })

  describe('detecting violations', () => {
    it('should detect Object.assign({}, obj)', () => {
      const sf = createSourceFile('const copy = Object.assign({}, obj)')
      const violations = analyzePreferObjectSpread(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].ruleId).toBe('prefer-object-spread')
    })

    it('should detect Object.assign({}, a, b)', () => {
      const sf = createSourceFile('const result = Object.assign({}, a, b)')
      const violations = analyzePreferObjectSpread(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('object spread')
    })

    it('should detect Object.assign({}, a, b, c) with multiple sources', () => {
      const sf = createSourceFile('const merged = Object.assign({}, defaults, options, overrides)')
      const violations = analyzePreferObjectSpread(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('defaults, options, overrides')
    })

    it('should detect Object.assign({}, config) in variable declaration', () => {
      const sf = createSourceFile('const config2 = Object.assign({}, config)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect Object.assign({}, src) in assignment', () => {
      const sf = createSourceFile('let result; result = Object.assign({}, src)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect Object.assign({}, data) in return statement', () => {
      const sf = createSourceFile('function clone(d) { return Object.assign({}, d) }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in arrow function body', () => {
      const sf = createSourceFile('const clone = (obj) => Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in function argument', () => {
      const sf = createSourceFile('process(Object.assign({}, config))')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in array element', () => {
      const sf = createSourceFile('const arr = [Object.assign({}, defaults)]')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in object property value', () => {
      const sf = createSourceFile('const obj = { merged: Object.assign({}, a, b) }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in ternary expression', () => {
      const sf = createSourceFile('const x = flag ? Object.assign({}, a) : a')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in if condition', () => {
      const sf = createSourceFile('if (Object.assign({}, opts).enabled) { }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in class method', () => {
      const sf = createSourceFile('class C { merge(b) { return Object.assign({}, this.data, b) } }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in static method', () => {
      const sf = createSourceFile('class C { static create(d) { return Object.assign({}, d) } }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in async function', () => {
      const sf = createSourceFile('async function fn() { return Object.assign({}, data) }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in generator function', () => {
      const sf = createSourceFile('function* gen() { yield Object.assign({}, state) }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in try block', () => {
      const sf = createSourceFile('try { const x = Object.assign({}, defaults) } catch(e) {}')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in catch block', () => {
      const sf = createSourceFile(
        'try { fail() } catch(e) { const x = Object.assign({}, fallback) }',
      )
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in namespace', () => {
      const sf = createSourceFile('namespace NS { export const x = Object.assign({}, base) }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in exported function', () => {
      const sf = createSourceFile('export function merge(a, b) { return Object.assign({}, a, b) }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in default export', () => {
      const sf = createSourceFile('export default function() { return Object.assign({}, data) }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect with property access source', () => {
      const sf = createSourceFile('const x = Object.assign({}, config.options)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect with computed property source', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj[key])')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect with call expression source', () => {
      const sf = createSourceFile('const x = Object.assign({}, getDefaults())')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in logical AND', () => {
      const sf = createSourceFile('const x = flag && Object.assign({}, opts)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in logical OR', () => {
      const sf = createSourceFile('const x = Object.assign({}, opts) || {}')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in nullish coalescing', () => {
      const sf = createSourceFile('const x = Object.assign({}, opts) ?? {}')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect with template expression', () => {
      const sf = createSourceFile('const s = `${Object.assign({}, a)}`')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect in callback', () => {
      const sf = createSourceFile('promise.then(() => Object.assign({}, data))')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect with await', () => {
      const sf = createSourceFile(
        'async function fn() { const x = Object.assign({}, await getData()) }',
      )
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect with type assertion source', () => {
      const sf = createSourceFile('const x = Object.assign({}, data as Record<string, unknown>)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect with as const source', () => {
      const sf = createSourceFile('const x = Object.assign({}, { a: 1 } as const)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should detect with many sources', () => {
      const sf = createSourceFile('const x = Object.assign({}, a, b, c, d, e)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should report correct ruleId', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)[0].ruleId).toBe('prefer-object-spread')
    })

    it('should report info severity', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)[0].severity).toBe('info')
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag object spread syntax', () => {
      const sf = createSourceFile('const result = { ...a, ...b }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with non-empty target', () => {
      const sf = createSourceFile('Object.assign({ foo: 1 }, obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign that mutates first argument', () => {
      const sf = createSourceFile('Object.assign(target, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with single argument', () => {
      const sf = createSourceFile('Object.assign(obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with identifier target', () => {
      const sf = createSourceFile('const result = Object.assign(target, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag other Object methods', () => {
      const sf = createSourceFile('Object.keys(obj); Object.values(obj); Object.entries(obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with no arguments', () => {
      const sf = createSourceFile('Object.assign()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with target having properties', () => {
      const sf = createSourceFile('const x = Object.assign({ key: "value" }, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with target having method', () => {
      const sf = createSourceFile('const x = Object.assign({ greet() { return 1 } }, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with target having getter', () => {
      const sf = createSourceFile('const x = Object.assign({ get val() { return 1 } }, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag plain object literal', () => {
      const sf = createSourceFile('const x = { a: 1, b: 2 }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag numeric literal', () => {
      const sf = createSourceFile('const x = 42')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag string literal', () => {
      const sf = createSourceFile('const x = "hello"')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag array literal', () => {
      const sf = createSourceFile('const x = [1, 2, 3]')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag class declaration', () => {
      const sf = createSourceFile('class Foo {}')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arrow function', () => {
      const sf = createSourceFile('const fn = () => 42')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag import statement', () => {
      const sf = createSourceFile("import { x } from 'y'")
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar: string }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag type alias', () => {
      const sf = createSourceFile('type Foo = { bar: string }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag enum', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag destructuring assignment', () => {
      const sf = createSourceFile('const { a, b } = obj')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag array destructuring', () => {
      const sf = createSourceFile('const [a, b] = arr')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag typeof check', () => {
      const sf = createSourceFile('const t = typeof x')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag instanceof check', () => {
      const sf = createSourceFile('const x = a instanceof Object')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag new expression', () => {
      const sf = createSourceFile('const map = new Map()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < arr.length; i++) { }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag while loop', () => {
      const sf = createSourceFile('while (true) { break }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag for..of loop', () => {
      const sf = createSourceFile('for (const item of arr) { console.log(item) }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag for..in loop', () => {
      const sf = createSourceFile('for (const key in obj) { console.log(key) }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag do..while loop', () => {
      const sf = createSourceFile('do { x++ } while (x < 10)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag switch statement', () => {
      const sf = createSourceFile('switch(x) { case 1: break }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag ternary without Object.assign', () => {
      const sf = createSourceFile('const x = a ? b : c')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const x = a ?? b')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const x = a?.b?.c')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag template literal', () => {
      const sf = createSourceFile('const s = `hello ${name}`')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag delete operator', () => {
      const sf = createSourceFile('delete obj.key')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag void expression', () => {
      const sf = createSourceFile('void 0')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag throw statement', () => {
      const sf = createSourceFile('throw new Error("fail")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag debugger statement', () => {
      const sf = createSourceFile('debugger')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag try-finally', () => {
      const sf = createSourceFile('try { fn() } finally { cleanup() }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag JSON methods', () => {
      const sf = createSourceFile('const x = JSON.parse(str)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Math methods', () => {
      const sf = createSourceFile('const x = Math.max(1, 2)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Array.from', () => {
      const sf = createSourceFile('const arr = Array.from({ length: 5 })')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Promise.all', () => {
      const sf = createSourceFile('const results = Promise.all(promises)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Set.has', () => {
      const sf = createSourceFile('const x = set.has(1)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Map.get', () => {
      const sf = createSourceFile('const x = map.get("key")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag yield expression', () => {
      const sf = createSourceFile('function* gen() { yield 1 }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag await expression', () => {
      const sf = createSourceFile('async function fn() { await promise }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.freeze', () => {
      const sf = createSourceFile('Object.freeze(obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.create', () => {
      const sf = createSourceFile('const x = Object.create(null)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.defineProperty', () => {
      const sf = createSourceFile('Object.defineProperty(obj, "key", { value: 1 })')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.getOwnPropertyDescriptor', () => {
      const sf = createSourceFile('Object.getOwnPropertyDescriptor(obj, "key")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.getOwnPropertyNames', () => {
      const sf = createSourceFile('Object.getOwnPropertyNames(obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.getPrototypeOf', () => {
      const sf = createSourceFile('Object.getPrototypeOf(obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.is', () => {
      const sf = createSourceFile('Object.is(a, b)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.preventExtensions', () => {
      const sf = createSourceFile('Object.preventExtensions(obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.seal', () => {
      const sf = createSourceFile('Object.seal(obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should have all required properties', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      const v = analyzePreferObjectSpread(sf)[0]
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('range')
      expect(v).toHaveProperty('suggestion')
    })

    it('should have correct property types', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      const v = analyzePreferObjectSpread(sf)[0]
      expect(typeof v.ruleId).toBe('string')
      expect(typeof v.severity).toBe('string')
      expect(typeof v.message).toBe('string')
      expect(typeof v.filePath).toBe('string')
      expect(typeof v.suggestion).toBe('string')
      expect(typeof v.range).toBe('object')
    })

    it('should have filePath containing test.ts', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)[0].filePath).toContain('test.ts')
    })

    it('should have correct ruleId', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)[0].ruleId).toBe('prefer-object-spread')
    })

    it('should have info severity', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)[0].severity).toBe('info')
    })

    it('should have range with start and end', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      const v = analyzePreferObjectSpread(sf)[0]
      expect(v.range).toHaveProperty('start')
      expect(v.range).toHaveProperty('end')
    })

    it('should have unique ranges for multiple violations', () => {
      const sf = createSourceFile('const a = Object.assign({}, x);\nconst b = Object.assign({}, y)')
      const violations = analyzePreferObjectSpread(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
  })

  describe('edge cases', () => {
    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should handle file with only comments', () => {
      const sf = createSourceFile('// comment\n/* block */')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should handle code with comments', () => {
      const sf = createSourceFile('// clone\nconst x = Object.assign({}, obj) /* end */')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should handle type annotations', () => {
      const sf = createSourceFile('const x: Record<string, unknown> = Object.assign({}, data)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should handle nested Object.assign calls', () => {
      const sf = createSourceFile('const x = Object.assign({}, Object.assign({}, a))')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(2)
    })

    it('should handle private class method', () => {
      const sf = createSourceFile('class C { #clone() { return Object.assign({}, this.data) } }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should handle class getter', () => {
      const sf = createSourceFile('class C { get clone() { return Object.assign({}, this.data) } }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should handle class setter', () => {
      const sf = createSourceFile(
        'class C { set data(val) { this._data = Object.assign({}, val) } }',
      )
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should handle conditional expression', () => {
      const sf = createSourceFile('const x = flag ? Object.assign({}, a) : a')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should handle mixed valid and invalid', () => {
      const sf = createSourceFile('const valid = { ...obj };\nconst invalid = Object.assign({}, a)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should handle shorthand property in non-empty target', () => {
      const sf = createSourceFile('const x = Object.assign({ a: 1, b }, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should handle spread in non-empty target', () => {
      const sf = createSourceFile('const x = Object.assign({ ...defaults, a: 1 }, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should handle computed property in non-empty target', () => {
      const sf = createSourceFile('const x = Object.assign({ [key]: 1 }, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should handle Object.assign with this as target', () => {
      const sf = createSourceFile('Object.assign(this, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should handle Object.assign with null as target', () => {
      const sf = createSourceFile('const x = Object.assign(null, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should handle Object.assign with undefined as target', () => {
      const sf = createSourceFile('const x = Object.assign(undefined, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should handle Object.assign with function call as target', () => {
      const sf = createSourceFile('const x = Object.assign(createTarget(), source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should handle Array.prototype.assign (not Object.assign)', () => {
      const sf = createSourceFile('const x = Array.prototype.assign({}, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should handle local variable named Object', () => {
      const sf = createSourceFile('const Object = { assign: () => {} }; Object.assign({}, x)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should handle Object.assign as bare expression', () => {
      const sf = createSourceFile('Object.assign({}, config)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should handle Object.assign in parentheses', () => {
      const sf = createSourceFile('const x = (Object.assign({}, a))')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return visitor and onComplete', () => {
      const result = preferObjectSpreadRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })

    it('should return violations array from onComplete', () => {
      const result = preferObjectSpreadRule.create({})
      expect(Array.isArray(result.onComplete())).toBe(true)
    })

    it('should have visitNode in visitor', () => {
      const result = preferObjectSpreadRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })
  })

  describe('suggestion format', () => {
    it('should provide fix suggestion', () => {
      const sf = createSourceFile('const result = Object.assign({}, a, b)')
      const violations = analyzePreferObjectSpread(sf)
      expect(violations[0].suggestion).toBeDefined()
      expect(violations[0].suggestion).toContain('...a, ...b')
    })

    it('should start with Replace with:', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)[0].suggestion).toContain('Replace with:')
    })

    it('should include spread operator for single source', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)[0].suggestion).toContain('...obj')
    })

    it('should wrap in braces', () => {
      const sf = createSourceFile('const x = Object.assign({}, a)')
      const suggestion = analyzePreferObjectSpread(sf)[0].suggestion
      expect(suggestion).toContain('{ ')
      expect(suggestion).toContain(' }')
    })

    it('should handle multiple sources in suggestion', () => {
      const sf = createSourceFile('const x = Object.assign({}, a, b, c)')
      const suggestion = analyzePreferObjectSpread(sf)[0].suggestion
      expect(suggestion).toContain('...a')
      expect(suggestion).toContain('...b')
      expect(suggestion).toContain('...c')
    })

    it('should handle property access source in suggestion', () => {
      const sf = createSourceFile('const x = Object.assign({}, config.defaults)')
      const suggestion = analyzePreferObjectSpread(sf)[0].suggestion
      expect(suggestion).toContain('...config.defaults')
    })

    it('should handle call expression source in suggestion', () => {
      const sf = createSourceFile('const x = Object.assign({}, getDefaults())')
      const suggestion = analyzePreferObjectSpread(sf)[0].suggestion
      expect(suggestion).toContain('...getDefaults()')
    })
  })

  describe('message content', () => {
    it('should mention object spread in message', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)[0].message).toContain('object spread')
    })

    it('should mention Object.assign in message', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)[0].message).toContain('Object.assign')
    })

    it('should include source names in message', () => {
      const sf = createSourceFile('const x = Object.assign({}, defaults, config)')
      expect(analyzePreferObjectSpread(sf)[0].message).toContain('defaults, config')
    })

    it('should include single source name in message', () => {
      const sf = createSourceFile('const x = Object.assign({}, myObj)')
      expect(analyzePreferObjectSpread(sf)[0].message).toContain('myObj')
    })

    it('should contain empty object literal in message', () => {
      const sf = createSourceFile('const x = Object.assign({}, data)')
      const msg = analyzePreferObjectSpread(sf)[0].message
      expect(msg).toContain('{}')
      expect(msg).toContain('data')
    })
  })

  describe('analyze function', () => {
    it('should return empty array for no violations', () => {
      const sf = createSourceFile('const x = 1 + 2')
      expect(analyzePreferObjectSpread(sf)).toEqual([])
    })

    it('should return non-empty array for matching pattern', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf).length).toBeGreaterThan(0)
    })

    it('should handle only the pattern as expression', () => {
      const sf = createSourceFile('Object.assign({}, config)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should work with empty options', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf, {})).toHaveLength(1)
    })

    it('should work with no options argument', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(1)
    })

    it('should work with undefined options', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj)')
      expect(analyzePreferObjectSpread(sf, undefined)).toHaveLength(1)
    })
  })

  describe('multiple violations', () => {
    it('should detect two Object.assign calls', () => {
      const sf = createSourceFile('const a = Object.assign({}, x);\nconst b = Object.assign({}, y)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(2)
    })

    it('should detect three Object.assign calls', () => {
      const sf = createSourceFile(
        'const a = Object.assign({}, x);\nconst b = Object.assign({}, y);\nconst c = Object.assign({}, z)',
      )
      expect(analyzePreferObjectSpread(sf)).toHaveLength(3)
    })

    it('should detect four violations', () => {
      const sf = createSourceFile(
        'const a = Object.assign({}, w);\nconst b = Object.assign({}, x);\nconst c = Object.assign({}, y);\nconst d = Object.assign({}, z)',
      )
      expect(analyzePreferObjectSpread(sf)).toHaveLength(4)
    })

    it('should detect five violations', () => {
      const sf = createSourceFile(
        'const a = Object.assign({}, v);\nconst b = Object.assign({}, w);\nconst c = Object.assign({}, x);\nconst d = Object.assign({}, y);\nconst e = Object.assign({}, z)',
      )
      expect(analyzePreferObjectSpread(sf)).toHaveLength(5)
    })

    it('should count correctly with mixed code', () => {
      const sf = createSourceFile(
        'const valid = { ...obj };\nconst a = Object.assign({}, x);\nconst valid2 = Object.keys(y);\nconst b = Object.assign({}, z)',
      )
      expect(analyzePreferObjectSpread(sf)).toHaveLength(2)
    })

    it('should give each violation correct filePath', () => {
      const sf = createSourceFile('const a = Object.assign({}, x);\nconst b = Object.assign({}, y)')
      analyzePreferObjectSpread(sf).forEach((v) => expect(v.filePath).toContain('test.ts'))
    })

    it('should give each violation correct ruleId', () => {
      const sf = createSourceFile('const a = Object.assign({}, x);\nconst b = Object.assign({}, y)')
      analyzePreferObjectSpread(sf).forEach((v) => expect(v.ruleId).toBe('prefer-object-spread'))
    })

    it('should give each violation info severity', () => {
      const sf = createSourceFile('const a = Object.assign({}, x);\nconst b = Object.assign({}, y)')
      analyzePreferObjectSpread(sf).forEach((v) => expect(v.severity).toBe('info'))
    })
  })

  describe('valid code - extended', () => {
    it('should not flag console methods', () => {
      const sf = createSourceFile('console.warn("msg")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag String methods', () => {
      const sf = createSourceFile('const x = str.toUpperCase()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Number methods', () => {
      const sf = createSourceFile('const x = num.toFixed(2)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Date methods', () => {
      const sf = createSourceFile('const x = date.getTime()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag RegExp exec', () => {
      const sf = createSourceFile('const x = regex.exec(str)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Map set', () => {
      const sf = createSourceFile('map.set("key", "value")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Set add', () => {
      const sf = createSourceFile('set.add(1)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Promise resolve', () => {
      const sf = createSourceFile('Promise.resolve(1)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Promise reject', () => {
      const sf = createSourceFile('Promise.reject(new Error())')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Symbol', () => {
      const sf = createSourceFile('const s = Symbol("key")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag WeakMap', () => {
      const sf = createSourceFile('const wm = new WeakMap()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag WeakSet', () => {
      const sf = createSourceFile('const ws = new WeakSet()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Proxy', () => {
      const sf = createSourceFile('const p = new Proxy({}, {})')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Reflect', () => {
      const sf = createSourceFile('Reflect.get(obj, "key")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag ArrayBuffer', () => {
      const sf = createSourceFile('const buf = new ArrayBuffer(8)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag DataView', () => {
      const sf = createSourceFile('const dv = new DataView(buf)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Int8Array', () => {
      const sf = createSourceFile('const arr = new Int8Array(8)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Float64Array', () => {
      const sf = createSourceFile('const arr = new Float64Array(8)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Intl methods', () => {
      const sf = createSourceFile('const x = new Intl.NumberFormat().format(123)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag globalThis', () => {
      const sf = createSourceFile('const x = globalThis')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag isNaN check', () => {
      const sf = createSourceFile('const x = isNaN(y)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag isFinite check', () => {
      const sf = createSourceFile('const x = isFinite(y)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag parseInt', () => {
      const sf = createSourceFile('const x = parseInt("123")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag parseFloat', () => {
      const sf = createSourceFile('const x = parseFloat("1.5")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag encodeURI', () => {
      const sf = createSourceFile('const x = encodeURI(str)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag decodeURI', () => {
      const sf = createSourceFile('const x = decodeURI(str)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag btoa', () => {
      const sf = createSourceFile('const x = btoa(str)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag atob', () => {
      const sf = createSourceFile('const x = atob(str)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag setTimeout', () => {
      const sf = createSourceFile('setTimeout(() => {}, 100)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag setInterval', () => {
      const sf = createSourceFile('setInterval(() => {}, 100)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag requestAnimationFrame', () => {
      const sf = createSourceFile('requestAnimationFrame(() => {})')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag fetch', () => {
      const sf = createSourceFile('fetch("/api")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag addEventListener', () => {
      const sf = createSourceFile('document.addEventListener("click", () => {})')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag queueMicrotask', () => {
      const sf = createSourceFile('queueMicrotask(() => {})')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag structuredClone', () => {
      const sf = createSourceFile('const x = structuredClone(obj)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag AbortController', () => {
      const sf = createSourceFile('const ac = new AbortController()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag TextEncoder', () => {
      const sf = createSourceFile('const te = new TextEncoder()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag TextDecoder', () => {
      const sf = createSourceFile('const td = new TextDecoder()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag URL constructor', () => {
      const sf = createSourceFile('const u = new URL("http://example.com")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag URLSearchParams', () => {
      const sf = createSourceFile('const p = new URLSearchParams("a=1")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Blob', () => {
      const sf = createSourceFile('const b = new Blob(["data"])')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag File', () => {
      const sf = createSourceFile('const f = new File(["data"], "file.txt")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag FormData', () => {
      const sf = createSourceFile('const fd = new FormData()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Headers', () => {
      const sf = createSourceFile('const h = new Headers()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Response', () => {
      const sf = createSourceFile('const r = new Response()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Request', () => {
      const sf = createSourceFile('const r = new Request("/api")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag ReadableStream', () => {
      const sf = createSourceFile('const rs = new ReadableStream()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag WritableStream', () => {
      const sf = createSourceFile('const ws = new WritableStream()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag TransformStream', () => {
      const sf = createSourceFile('const ts = new TransformStream()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Intl.DateTimeFormat', () => {
      const sf = createSourceFile('const dtf = new Intl.DateTimeFormat()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag FinalizationRegistry', () => {
      const sf = createSourceFile('const fr = new FinalizationRegistry(() => {})')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag crypto', () => {
      const sf = createSourceFile('crypto.getRandomValues(new Uint8Array(8))')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag performance', () => {
      const sf = createSourceFile('performance.now()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag localStorage', () => {
      const sf = createSourceFile('localStorage.setItem("key", "value")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag sessionStorage', () => {
      const sf = createSourceFile('sessionStorage.getItem("key")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag navigator', () => {
      const sf = createSourceFile('const x = navigator.userAgent')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag location', () => {
      const sf = createSourceFile('const x = location.href')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag history', () => {
      const sf = createSourceFile('history.pushState({}, "")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag XMLHttpRequest', () => {
      const sf = createSourceFile('const xhr = new XMLHttpRequest()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag WebSocket', () => {
      const sf = createSourceFile('const ws = new WebSocket("ws://localhost")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag indexedDB', () => {
      const sf = createSourceFile('indexedDB.open("db")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Array.isArray', () => {
      const sf = createSourceFile('const x = Array.isArray(arr)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign(target, source) with identifier target', () => {
      const sf = createSourceFile('Object.assign(existing, newData)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.concat usage', () => {
      const sf = createSourceFile('const x = arr.concat(other)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.map usage', () => {
      const sf = createSourceFile('const x = arr.map(x => x * 2)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.filter usage', () => {
      const sf = createSourceFile('const x = arr.filter(x => x > 1)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.reduce usage', () => {
      const sf = createSourceFile('const x = arr.reduce((a, b) => a + b, 0)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.find usage', () => {
      const sf = createSourceFile('const x = arr.find(x => x === 2)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.some usage', () => {
      const sf = createSourceFile('const x = arr.some(x => x > 0)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.every usage', () => {
      const sf = createSourceFile('const x = arr.every(x => x > 0)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.forEach usage', () => {
      const sf = createSourceFile('arr.forEach(x => console.log(x))')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.includes usage', () => {
      const sf = createSourceFile('const x = arr.includes(1)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.indexOf usage', () => {
      const sf = createSourceFile('const x = arr.indexOf(1)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.join usage', () => {
      const sf = createSourceFile('const x = arr.join(",")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.sort usage', () => {
      const sf = createSourceFile('const x = arr.sort()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.slice usage', () => {
      const sf = createSourceFile('const x = arr.slice(0, 5)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.flat usage', () => {
      const sf = createSourceFile('const x = arr.flat()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.flatMap usage', () => {
      const sf = createSourceFile('const x = arr.flatMap(x => [x])')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.push usage', () => {
      const sf = createSourceFile('arr.push(1)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag arr.pop usage', () => {
      const sf = createSourceFile('arr.pop()')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag multiple valid patterns', () => {
      const sf = createSourceFile(
        'const a = { ...obj };\nconst b = Object.keys(x);\nconst c = [1, 2]',
      )
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag spread in object literal', () => {
      const sf = createSourceFile('const x = { ...obj, a: 1 }')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with numeric target', () => {
      const sf = createSourceFile('Object.assign(1, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with string target', () => {
      const sf = createSourceFile('Object.assign("str", source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with boolean target', () => {
      const sf = createSourceFile('Object.assign(true, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with array target', () => {
      const sf = createSourceFile('const x = Object.assign([], source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.assign with object spread result', () => {
      const sf = createSourceFile('const x = { a: 1 }; const y = Object.assign(x, b)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.hasOwn', () => {
      const sf = createSourceFile('Object.hasOwn(obj, "key")')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag Object.groupBy', () => {
      const sf = createSourceFile('Object.groupBy(arr, x => x.type)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag generic function call', () => {
      const sf = createSourceFile('merge({}, a, b)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })

    it('should not flag assign method on non-Object', () => {
      const sf = createSourceFile('myObj.assign({}, source)')
      expect(analyzePreferObjectSpread(sf)).toHaveLength(0)
    })
  })
})
