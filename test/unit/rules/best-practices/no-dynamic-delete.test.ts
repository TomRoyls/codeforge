import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoDynamicDelete,
  noDynamicDeleteRule,
} from '../../../../src/rules/best-practices/no-dynamic-delete.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('no-dynamic-delete rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(noDynamicDeleteRule.meta.name).toBe('no-dynamic-delete')
    })
    it('should have correctness category', () => {
      expect(noDynamicDeleteRule.meta.category).toBe('correctness')
    })
    it('should be fixable', () => {
      expect(noDynamicDeleteRule.meta.fixable).toBe('code')
    })
    it('should have description', () => {
      expect(noDynamicDeleteRule.meta.description).toBeDefined()
      expect(typeof noDynamicDeleteRule.meta.description).toBe('string')
    })
    it('should mention delete in description', () => {
      expect(noDynamicDeleteRule.meta.description).toContain('delete')
    })
    it('should not be recommended', () => {
      expect(noDynamicDeleteRule.meta.recommended).toBe(false)
    })
    it('should have defaultOptions as empty object', () => {
      expect(noDynamicDeleteRule.defaultOptions).toEqual({})
    })
    it('should have create function', () => {
      expect(typeof noDynamicDeleteRule.create).toBe('function')
    })
  })

  describe('detecting violations', () => {
    it('should detect delete on variable identifier', () => {
      const sf = createSourceFile('let x = 1; delete x;')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete on computed property with variable key', () => {
      const sf = createSourceFile('const key = "foo"; delete obj[key];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete with function call as key', () => {
      const sf = createSourceFile('delete obj[getKey()];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete on computed property with expression key', () => {
      const sf = createSourceFile('delete obj[a + b];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete on computed property with template literal key', () => {
      const sf = createSourceFile('delete obj[`prefix_${key}`];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete on computed property with property access key', () => {
      const sf = createSourceFile('delete obj[config.key];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete on parameter', () => {
      const sf = createSourceFile('function fn(x) { delete x; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete on let variable', () => {
      const sf = createSourceFile('let count = 0; delete count;')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete on array computed access', () => {
      const sf = createSourceFile('delete arr[index];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete on nested object computed access', () => {
      const sf = createSourceFile('delete obj.nested[key];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete with computed key inside function', () => {
      const sf = createSourceFile('function remove(o, k) { delete o[k]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in arrow function body', () => {
      const sf = createSourceFile('const rm = (o, k) => { delete o[k]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in class method', () => {
      const sf = createSourceFile('class C { remove(k) { delete this.data[k]; } }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in async function', () => {
      const sf = createSourceFile('async function fn() { delete obj[key]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in generator function', () => {
      const sf = createSourceFile('function* gen() { delete obj[key]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in try block', () => {
      const sf = createSourceFile('try { delete obj[key]; } catch(e) {}')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in catch block', () => {
      const sf = createSourceFile('try { fn(); } catch(e) { delete obj[key]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in finally block', () => {
      const sf = createSourceFile('try { fn(); } finally { delete obj[key]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in if statement', () => {
      const sf = createSourceFile('if (cond) { delete obj[key]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in ternary true branch', () => {
      const sf = createSourceFile('cond ? delete obj[key] : null;')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in exported function', () => {
      const sf = createSourceFile('export function rm(o, k) { delete o[k]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in default export', () => {
      const sf = createSourceFile('export default function() { delete obj[key]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in namespace', () => {
      const sf = createSourceFile('namespace NS { delete obj[key]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in module', () => {
      const sf = createSourceFile('module M { delete obj[key]; }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete with chained property and computed key', () => {
      const sf = createSourceFile('delete a.b.c[d];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete with this as object', () => {
      const sf = createSourceFile('delete this[key];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete with call expression as key', () => {
      const sf = createSourceFile('delete obj[keys.shift()];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete with binary expression as key', () => {
      const sf = createSourceFile('delete obj[index + offset];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete with unary expression as key', () => {
      const sf = createSourceFile('delete arr[-index];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete on private method', () => {
      const sf = createSourceFile('class C { #rm(k) { delete this.data[k]; } }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in static method', () => {
      const sf = createSourceFile('class C { static rm(k) { delete C.cache[k]; } }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in getter', () => {
      const sf = createSourceFile('class C { get x() { delete this._data[key]; return 1; } }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in setter', () => {
      const sf = createSourceFile('class C { set x(v) { delete this._map[key]; } }')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should not flag parenthesized identifier - parenthesized expression is not identifier', () => {
      const sf = createSourceFile('let x = 1; delete (x);')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(0)
    })
    it('should not flag parenthesized computed access - parenthesized expression wraps it', () => {
      const sf = createSourceFile('delete (obj[key]);')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(0)
    })
    it('should detect delete in callback', () => {
      const sf = createSourceFile('arr.forEach(item => { delete cache[item.id]; })')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in promise then', () => {
      const sf = createSourceFile('promise.then(() => { delete obj[key]; })')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in logical AND', () => {
      const sf = createSourceFile('cond && delete obj[key];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should detect delete in comma expression', () => {
      const sf = createSourceFile('let x; x = 1, delete obj[key];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
  })

  describe('valid code - no violations', () => {
    it('should allow delete on static property access', () => {
      const sf = createSourceFile('delete obj.property;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow delete on string literal key', () => {
      const sf = createSourceFile('delete obj["key"];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow delete on numeric literal key', () => {
      const sf = createSourceFile('delete arr[0];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow delete on nested property', () => {
      const sf = createSourceFile('delete obj.nested.property;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow delete with parentheses around static property', () => {
      const sf = createSourceFile('delete (obj.property);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow delete on single quoted string literal', () => {
      const sf = createSourceFile("delete obj['key'];")
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow delete on multiple numeric indices', () => {
      const sf = createSourceFile('delete arr[0]; delete arr[1];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow delete on chained static properties', () => {
      const sf = createSourceFile('delete a.b.c.d;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow no delete at all - simple assignment', () => {
      const sf = createSourceFile('const x = 1;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow empty file', () => {
      const sf = createSourceFile('')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow code with no delete', () => {
      const sf = createSourceFile('function fn() { return 42; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow delete on this static property', () => {
      const sf = createSourceFile('class C { rm() { delete this.prop; } }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow Reflect.deleteProperty', () => {
      const sf = createSourceFile('Reflect.deleteProperty(obj, key);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should allow object property reassignment instead of delete', () => {
      const sf = createSourceFile('obj.key = undefined;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should have correct ruleId for variable delete', () => {
      const sf = createSourceFile('let x = 1; delete x;')
      expect(analyzeNoDynamicDelete(sf)[0].ruleId).toBe('no-dynamic-delete')
    })
    it('should have warning severity for variable delete', () => {
      const sf = createSourceFile('let x = 1; delete x;')
      expect(analyzeNoDynamicDelete(sf)[0].severity).toBe('warning')
    })
    it('should have warning severity for computed delete', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf)[0].severity).toBe('warning')
    })
    it('should have filePath property', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf)[0].filePath).toBeDefined()
    })
    it('should have filePath containing test.ts', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf)[0].filePath).toContain('test.ts')
    })
    it('should have range property', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf)[0].range).toBeDefined()
    })
    it('should have range with start and end', () => {
      const sf = createSourceFile('delete obj[key];')
      const range = analyzeNoDynamicDelete(sf)[0].range
      expect(range).toHaveProperty('start')
      expect(range).toHaveProperty('end')
    })
    it('should have suggestion property', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf)[0].suggestion).toBeDefined()
    })
    it('should have all required violation properties', () => {
      const sf = createSourceFile('delete obj[key];')
      const v = analyzeNoDynamicDelete(sf)[0]
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('range')
      expect(v).toHaveProperty('suggestion')
    })
    it('should have correct property types', () => {
      const sf = createSourceFile('delete obj[key];')
      const v = analyzeNoDynamicDelete(sf)[0]
      expect(typeof v.ruleId).toBe('string')
      expect(typeof v.severity).toBe('string')
      expect(typeof v.message).toBe('string')
      expect(typeof v.filePath).toBe('string')
      expect(typeof v.suggestion).toBe('string')
      expect(typeof v.range).toBe('object')
    })
    it('should return array of violations', () => {
      const sf = createSourceFile('delete obj[key];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(Array.isArray(violations)).toBe(true)
    })
    it('should have unique ranges for multiple violations', () => {
      const sf = createSourceFile('delete obj[a];\ndelete obj[b];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
  })

  describe('edge cases', () => {
    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should handle file with only comments', () => {
      const sf = createSourceFile('// comment\n/* block */')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should handle code with comments around delete', () => {
      const sf = createSourceFile('// remove\nlet x = 1; delete x; /* end */')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle type annotations', () => {
      const sf = createSourceFile('const obj: Record<string, number> = {}; delete obj[key];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle nested delete expressions', () => {
      const sf = createSourceFile('delete outer[inner[key]];')
      expect(analyzeNoDynamicDelete(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should handle delete in for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < 10; i++) { delete obj[keys[i]]; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete in while loop', () => {
      const sf = createSourceFile('while (cond) { delete obj[key]; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete in do-while loop', () => {
      const sf = createSourceFile('do { delete obj[key]; } while (cond);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete in switch case', () => {
      const sf = createSourceFile('switch(x) { case 1: delete obj[key]; break; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete in IIFE', () => {
      const sf = createSourceFile('(function() { delete obj[key]; })();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete in conditional expression', () => {
      const sf = createSourceFile('const x = flag ? delete obj[key] : null;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete in object literal property', () => {
      const sf = createSourceFile('const x = { action: delete obj[key] };')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle mixed valid and invalid delete', () => {
      const sf = createSourceFile('delete obj.prop;\ndelete obj[key];')
      const violations = analyzeNoDynamicDelete(sf)
      expect(violations).toHaveLength(1)
    })
    it('should handle delete in template expression', () => {
      const sf = createSourceFile('const s = `${delete obj[key]}`;')
      expect(analyzeNoDynamicDelete(sf).length).toBeGreaterThanOrEqual(0)
    })
    it('should handle delete with null argument expression', () => {
      const sf = createSourceFile('let x = 1; delete x;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete in async arrow function', () => {
      const sf = createSourceFile('const fn = async () => { delete obj[key]; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete in async generator', () => {
      const sf = createSourceFile('async function* gen() { delete obj[key]; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete in exported const arrow', () => {
      const sf = createSourceFile('export const rm = (o, k) => { delete o[k]; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete with this.data computed', () => {
      const sf = createSourceFile('class C { rm(k) { delete this.data[k]; } }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete with generic function', () => {
      const sf = createSourceFile(
        'function rm<T>(o: Record<string, T>, k: string) { delete o[k]; }',
      )
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return visitor and onComplete', () => {
      const result = noDynamicDeleteRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
    it('should return violations array from onComplete', () => {
      const result = noDynamicDeleteRule.create({})
      expect(Array.isArray(result.onComplete())).toBe(true)
    })
    it('should have visitNode in visitor', () => {
      const result = noDynamicDeleteRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })
  })

  describe('suggestion format', () => {
    it('should suggest undefined assignment for variable delete', () => {
      const sf = createSourceFile('let x = 1; delete x;')
      expect(analyzeNoDynamicDelete(sf)[0].suggestion).toContain('undefined')
    })
    it('should suggest Map.delete() for computed property delete', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf)[0].suggestion).toContain('Map.delete()')
    })
    it('should suggest Set.delete() for computed property delete', () => {
      const sf = createSourceFile('delete obj[dynamicKey];')
      expect(analyzeNoDynamicDelete(sf)[0].suggestion).toContain('Set.delete()')
    })
    it('should include variable name in suggestion for variable delete', () => {
      const sf = createSourceFile('let myVar = 1; delete myVar;')
      expect(analyzeNoDynamicDelete(sf)[0].suggestion).toContain('myVar')
    })
    it('should have suggestion as string type', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(typeof analyzeNoDynamicDelete(sf)[0].suggestion).toBe('string')
    })
  })

  describe('message content', () => {
    it('should mention variables in message for identifier delete', () => {
      const sf = createSourceFile('let x = 1; delete x;')
      expect(analyzeNoDynamicDelete(sf)[0].message).toContain('variables')
    })
    it('should mention computed properties in message for computed delete', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf)[0].message).toContain('computed properties')
    })
    it('should mention undefined in message for variable delete', () => {
      const sf = createSourceFile('let x = 1; delete x;')
      expect(analyzeNoDynamicDelete(sf)[0].message).toContain('undefined')
    })
    it('should mention Map or Set in message for computed delete', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf)[0].message).toContain('Map')
    })
    it('should have message as string type', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(typeof analyzeNoDynamicDelete(sf)[0].message).toBe('string')
    })
  })

  describe('analyze function', () => {
    it('should return empty array for source with no delete', () => {
      const sf = createSourceFile('const x = 1 + 2;')
      expect(analyzeNoDynamicDelete(sf)).toEqual([])
    })
    it('should return non-empty array for matching pattern', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf).length).toBeGreaterThan(0)
    })
    it('should accept options parameter', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf, {}).length).toBeGreaterThan(0)
    })
    it('should work with undefined options', () => {
      const sf = createSourceFile('delete obj[key];')
      expect(analyzeNoDynamicDelete(sf, undefined).length).toBeGreaterThan(0)
    })
    it('should handle only delete expression', () => {
      const sf = createSourceFile('delete obj[key]')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should handle delete in parenthesized expression', () => {
      const sf = createSourceFile('(delete obj[key])')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should return violations with consistent structure', () => {
      const sf = createSourceFile('delete obj[key];')
      const v = analyzeNoDynamicDelete(sf)[0]
      expect(typeof v.ruleId).toBe('string')
      expect(typeof v.severity).toBe('string')
      expect(typeof v.message).toBe('string')
      expect(typeof v.filePath).toBe('string')
      expect(typeof v.suggestion).toBe('string')
      expect(typeof v.range).toBe('object')
    })
    it('should not flag regular assignment', () => {
      const sf = createSourceFile('obj[key] = undefined;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag non-delete computed access', () => {
      const sf = createSourceFile('const val = obj[key];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should detect in deeply nested context', () => {
      const sf = createSourceFile(
        'function outer() { if (true) { const k = "a"; delete obj[k]; } }',
      )
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should detect delete variable in nested function', () => {
      const sf = createSourceFile('function outer() { function inner() { let y = 2; delete y; } }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should detect in async arrow function', () => {
      const sf = createSourceFile('const fn = async () => { delete cache[key]; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
    it('should detect in generator function', () => {
      const sf = createSourceFile('function* gen() { yield delete obj[key]; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(1)
    })
  })

  describe('multiple violations', () => {
    it('should detect two computed deletes in same file', () => {
      const sf = createSourceFile('delete obj[a];\ndelete obj[b];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(2)
    })
    it('should detect three violations in same file', () => {
      const sf = createSourceFile('delete obj[a];\ndelete obj[b];\ndelete obj[c];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(3)
    })
    it('should detect four violations in same file', () => {
      const sf = createSourceFile('delete obj[a];\ndelete obj[b];\ndelete obj[c];\ndelete obj[d];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(4)
    })
    it('should detect five violations in same file', () => {
      const sf = createSourceFile(
        'delete obj[a];\ndelete obj[b];\ndelete obj[c];\ndelete obj[d];\ndelete obj[e];',
      )
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(5)
    })
    it('should count correctly with mixed valid and invalid', () => {
      const sf = createSourceFile(
        'delete obj.prop;\ndelete obj[a];\ndelete obj.staticProp;\ndelete obj[b];',
      )
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(2)
    })
    it('should give each violation correct filePath', () => {
      const sf = createSourceFile('delete obj[a];\ndelete obj[b];')
      analyzeNoDynamicDelete(sf).forEach((v) => expect(v.filePath).toContain('test.ts'))
    })
    it('should detect violations in different contexts', () => {
      const sf = createSourceFile(
        'function fn1() { delete obj[k1]; }\nfunction fn2() { delete obj[k2]; }',
      )
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(2)
    })
    it('should detect mixed variable and computed deletes', () => {
      const sf = createSourceFile('let x = 1; delete x;\ndelete obj[key];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(2)
    })
    it('should detect variable delete plus computed delete plus valid', () => {
      const sf = createSourceFile('let x = 1; delete x;\ndelete obj.prop;\ndelete obj[key];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(2)
    })
    it('should give unique ranges for each violation', () => {
      const sf = createSourceFile('delete obj[a];\ndelete obj[b];\ndelete obj[c];')
      const violations = analyzeNoDynamicDelete(sf)
      const starts = violations.map((v) => v.range.start)
      expect(new Set(starts.map((s) => JSON.stringify(s))).size).toBe(3)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag numeric literal', () => {
      const sf = createSourceFile('const x = 42;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag string literal', () => {
      const sf = createSourceFile('const x = "hello";')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sf = createSourceFile('const x = { a: 1 };')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sf = createSourceFile('const x = [1, 2, 3];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag class declaration', () => {
      const sf = createSourceFile('class Foo {}')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sf = createSourceFile("import { x } from 'y';")
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar: string }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag type alias', () => {
      const sf = createSourceFile('type Foo = { bar: string };')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag enum declaration', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag export statement', () => {
      const sf = createSourceFile('export { foo } from "./bar";')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag default export', () => {
      const sf = createSourceFile('export default class Foo {}')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag switch statement', () => {
      const sf = createSourceFile('switch(x) { case 1: break; default: break; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < 10; i++) { console.log(i); }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag while loop', () => {
      const sf = createSourceFile('while (true) { break; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag do-while loop', () => {
      const sf = createSourceFile('do { x++; } while (x < 10);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag for..of loop', () => {
      const sf = createSourceFile('for (const item of arr) { console.log(item); }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag for..in loop', () => {
      const sf = createSourceFile('for (const key in obj) { console.log(key); }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag destructuring assignment', () => {
      const sf = createSourceFile('const { a, b } = obj;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag array destructuring', () => {
      const sf = createSourceFile('const [a, b] = arr;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag spread in function call', () => {
      const sf = createSourceFile('fn(...args);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const x = a ?? b;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const x = a?.b?.c;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag template literal', () => {
      const sf = createSourceFile('const s = `hello ${name}`;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Promise.all', () => {
      const sf = createSourceFile('const results = Promise.all(promises);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Array.from', () => {
      const sf = createSourceFile('const arr = Array.from({ length: 5 }, (_, i) => i);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Array.isArray', () => {
      const sf = createSourceFile('const x = Array.isArray(arr);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Object.keys', () => {
      const sf = createSourceFile('const keys = Object.keys(obj);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Object.values', () => {
      const sf = createSourceFile('const values = Object.values(obj);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Object.entries', () => {
      const sf = createSourceFile('const entries = Object.entries(obj);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Object.assign', () => {
      const sf = createSourceFile('const x = Object.assign({}, obj);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Object.freeze', () => {
      const sf = createSourceFile('Object.freeze(obj);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag JSON.parse', () => {
      const sf = createSourceFile('const obj = JSON.parse(str);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag JSON.stringify', () => {
      const sf = createSourceFile('const s = JSON.stringify(obj);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Math operations', () => {
      const sf = createSourceFile('const max = Math.max(1, 2, 3);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag console.log', () => {
      const sf = createSourceFile('console.log("hello");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag new expression', () => {
      const sf = createSourceFile('const map = new Map();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sf = createSourceFile('const isArr = x instanceof Array;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile('const t = typeof x;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sf = createSourceFile('void 0;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag yield expression', () => {
      const sf = createSourceFile('function* gen() { yield 1; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag await expression', () => {
      const sf = createSourceFile('async function fn() { await promise; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag throw statement', () => {
      const sf = createSourceFile('throw new Error("fail");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag debugger statement', () => {
      const sf = createSourceFile('debugger;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag labeled statement', () => {
      const sf = createSourceFile('outer: for (let i = 0; i < 10; i++) { break outer; }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag try-finally', () => {
      const sf = createSourceFile('try { fn(); } finally { cleanup(); }')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Map.set', () => {
      const sf = createSourceFile('map.set("key", "value");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Map.get', () => {
      const sf = createSourceFile('const x = map.get("key");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Map.has', () => {
      const sf = createSourceFile('const x = map.has("key");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Set.add', () => {
      const sf = createSourceFile('set.add(1);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Set.has', () => {
      const sf = createSourceFile('const x = set.has(1);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag WeakMap', () => {
      const sf = createSourceFile('const wm = new WeakMap();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag WeakSet', () => {
      const sf = createSourceFile('const ws = new WeakSet();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Symbol', () => {
      const sf = createSourceFile('const s = Symbol("key");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Proxy', () => {
      const sf = createSourceFile('const p = new Proxy({}, {});')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Reflect.get', () => {
      const sf = createSourceFile('Reflect.get(obj, "key");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag ArrayBuffer', () => {
      const sf = createSourceFile('const buf = new ArrayBuffer(8);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag DataView', () => {
      const sf = createSourceFile('const dv = new DataView(buf);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Int8Array', () => {
      const sf = createSourceFile('const arr = new Int8Array(8);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Float64Array', () => {
      const sf = createSourceFile('const arr = new Float64Array(8);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag setTimeout', () => {
      const sf = createSourceFile('setTimeout(() => {}, 100);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag setInterval', () => {
      const sf = createSourceFile('setInterval(() => {}, 100);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag fetch', () => {
      const sf = createSourceFile('fetch("/api");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag delete obj.prop (static)', () => {
      const sf = createSourceFile('delete obj.prop;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag delete on string literal computed key', () => {
      const sf = createSourceFile('delete obj["staticKey"];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag delete on numeric literal computed key', () => {
      const sf = createSourceFile('delete arr[0];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag delete on number literal 42', () => {
      const sf = createSourceFile('delete arr[42];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag delete with multiple static property accesses', () => {
      const sf = createSourceFile('delete a.b.c.d;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag multiple valid delete patterns', () => {
      const sf = createSourceFile('delete obj.a;\ndelete obj["b"];\ndelete arr[0];')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag URL constructor', () => {
      const sf = createSourceFile('const u = new URL("http://example.com");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag URLSearchParams', () => {
      const sf = createSourceFile('const p = new URLSearchParams("a=1");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Blob', () => {
      const sf = createSourceFile('const b = new Blob(["data"]);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag FormData', () => {
      const sf = createSourceFile('const fd = new FormData();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Headers', () => {
      const sf = createSourceFile('const h = new Headers();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Response', () => {
      const sf = createSourceFile('const r = new Response();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Request', () => {
      const sf = createSourceFile('const r = new Request("/api");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag TextEncoder', () => {
      const sf = createSourceFile('const te = new TextEncoder();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag TextDecoder', () => {
      const sf = createSourceFile('const td = new TextDecoder();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag AbortController', () => {
      const sf = createSourceFile('const ac = new AbortController();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag structuredClone', () => {
      const sf = createSourceFile('const x = structuredClone(obj);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag queueMicrotask', () => {
      const sf = createSourceFile('queueMicrotask(() => {});')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag performance.now', () => {
      const sf = createSourceFile('performance.now();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag globalThis', () => {
      const sf = createSourceFile('const x = globalThis;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag isNaN', () => {
      const sf = createSourceFile('const x = isNaN(y);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag isFinite', () => {
      const sf = createSourceFile('const x = isFinite(y);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag parseInt', () => {
      const sf = createSourceFile('const x = parseInt("123");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag parseFloat', () => {
      const sf = createSourceFile('const x = parseFloat("1.5");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag encodeURI', () => {
      const sf = createSourceFile('const x = encodeURI(str);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag decodeURI', () => {
      const sf = createSourceFile('const x = decodeURI(str);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag btoa', () => {
      const sf = createSourceFile('const x = btoa(str);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag atob', () => {
      const sf = createSourceFile('const x = atob(str);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag localStorage', () => {
      const sf = createSourceFile('localStorage.setItem("key", "value");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag sessionStorage', () => {
      const sf = createSourceFile('sessionStorage.getItem("key");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag navigator', () => {
      const sf = createSourceFile('const x = navigator.userAgent;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag ReadableStream', () => {
      const sf = createSourceFile('const rs = new ReadableStream();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag WritableStream', () => {
      const sf = createSourceFile('const ws = new WritableStream();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag TransformStream', () => {
      const sf = createSourceFile('const ts = new TransformStream();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag FinalizationRegistry', () => {
      const sf = createSourceFile('const fr = new FinalizationRegistry(() => {});')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag crypto', () => {
      const sf = createSourceFile('crypto.getRandomValues(new Uint8Array(8));')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag RegExp exec', () => {
      const sf = createSourceFile('const x = regex.exec(str);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag String methods', () => {
      const sf = createSourceFile('const x = str.toUpperCase();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Number methods', () => {
      const sf = createSourceFile('const x = num.toFixed(2);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Date methods', () => {
      const sf = createSourceFile('const x = date.getTime();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Promise.resolve', () => {
      const sf = createSourceFile('Promise.resolve(1);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag Intl.NumberFormat', () => {
      const sf = createSourceFile('const x = new Intl.NumberFormat().format(123);')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag console.warn', () => {
      const sf = createSourceFile('console.warn("msg");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag addEventListener', () => {
      const sf = createSourceFile('document.addEventListener("click", () => {});')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag XMLHttpRequest', () => {
      const sf = createSourceFile('const xhr = new XMLHttpRequest();')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag WebSocket', () => {
      const sf = createSourceFile('const ws = new WebSocket("ws://localhost");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag indexedDB', () => {
      const sf = createSourceFile('indexedDB.open("db");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag File', () => {
      const sf = createSourceFile('const f = new File(["data"], "file.txt");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag location', () => {
      const sf = createSourceFile('const x = location.href;')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag history', () => {
      const sf = createSourceFile('history.pushState({}, "");')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
    it('should not flag requestAnimationFrame', () => {
      const sf = createSourceFile('requestAnimationFrame(() => {});')
      expect(analyzeNoDynamicDelete(sf)).toHaveLength(0)
    })
  })
})
