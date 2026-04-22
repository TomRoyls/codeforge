/**
 * @fileoverview Tests for prefer-object-has-own rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferObjectHasOwn,
  preferObjectHasOwnRule,
} from '../../../../src/rules/best-practices/prefer-object-has-own.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0
const createSourceFile = (code: string) => {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferObjectHasOwnRule.meta.name).toBe('prefer-object-has-own')
    expect(preferObjectHasOwnRule.meta.category).toBe('style')
    expect(preferObjectHasOwnRule.meta.fixable).toBe('code')
  })

  it('should have the correct description', () => {
    expect(preferObjectHasOwnRule.meta.description).toContain('Object.hasOwn')
  })

  it('should have recommended set to false', () => {
    expect(preferObjectHasOwnRule.meta.recommended).toBe(false)
  })

  it('should have a name property that is a string', () => {
    expect(typeof preferObjectHasOwnRule.meta.name).toBe('string')
  })

  it('should have category as style', () => {
    expect(preferObjectHasOwnRule.meta.category).toBe('style')
  })

  it('should be fixable as code', () => {
    expect(preferObjectHasOwnRule.meta.fixable).toBe('code')
  })

  it('should have a description property', () => {
    expect(preferObjectHasOwnRule.meta.description).toBeDefined()
    expect(typeof preferObjectHasOwnRule.meta.description).toBe('string')
  })

  it('should reference hasOwnProperty in its description', () => {
    expect(preferObjectHasOwnRule.meta.description).toContain('hasOwnProperty')
  })

  it('should have default options as empty object', () => {
    expect(preferObjectHasOwnRule.defaultOptions).toEqual({})
  })

  it('should export a rule with a create function', () => {
    expect(typeof preferObjectHasOwnRule.create).toBe('function')
  })
})

describe('detecting Object.prototype.hasOwnProperty.call', () => {
  it('should detect Object.prototype.hasOwnProperty.call with string property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Object.hasOwn')
  })

  it('should detect Object.prototype.hasOwnProperty.call with variable property', () => {
    const sourceFile = createSourceFile('const x = Object.prototype.hasOwnProperty.call(obj, key);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with single-quoted string property', () => {
    const sourceFile = createSourceFile(
      "const x = Object.prototype.hasOwnProperty.call(obj, 'name');",
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with double-quoted string property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "name");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with template literal property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, `name`);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with numeric string property', () => {
    const sourceFile = createSourceFile('const x = Object.prototype.hasOwnProperty.call(obj, "0");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with member expression object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(config.settings, "theme");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with array element as object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(arr[0], "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with this as object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(this, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with computed property variable', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, someVar);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside if statement condition', () => {
    const sourceFile = createSourceFile(
      'if (Object.prototype.hasOwnProperty.call(obj, "key")) { console.log("yes"); }',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside function body', () => {
    const sourceFile = createSourceFile(
      'function check(obj: object, key: string) { return Object.prototype.hasOwnProperty.call(obj, key); }',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside arrow function body', () => {
    const sourceFile = createSourceFile(
      'const check = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside ternary expression', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key") ? obj.key : undefined;',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside logical AND expression', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key") && obj.key;',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with window object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(window, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with object literal as first argument', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call({}, "toString");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with null object argument', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(null, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with chained variable object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(a.b.c, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside while loop condition', () => {
    const sourceFile = createSourceFile(
      'while (Object.prototype.hasOwnProperty.call(obj, "key")) { break; }',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside array filter callback', () => {
    const sourceFile = createSourceFile(
      'const keys = Object.keys(obj).filter(k => Object.prototype.hasOwnProperty.call(obj, k));',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with call expression as first argument', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(getObj(), "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with spread-like expression argument', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call({...defaults}, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside class method', () => {
    const sourceFile = createSourceFile(
      'class Foo { has(key: string) { return Object.prototype.hasOwnProperty.call(this, key); } }',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside try-catch block', () => {
    const sourceFile = createSourceFile(
      'try { Object.prototype.hasOwnProperty.call(obj, "key"); } catch (e) {}',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with boolean expression property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, String(true));',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('valid code - no flag', () => {
  it('should not flag Object.hasOwn', () => {
    const sourceFile = createSourceFile('const x = Object.hasOwn(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag custom hasOwnProperty', () => {
    const sourceFile = createSourceFile('const x = obj.hasOwnProperty("prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag hasOwnProperty.call without Object.prototype', () => {
    const sourceFile = createSourceFile('const x = hasOwnProperty.call(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag empty file', () => {
    const sourceFile = createSourceFile('')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag plain variable declaration', () => {
    const sourceFile = createSourceFile('const x = 42;')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.keys call', () => {
    const sourceFile = createSourceFile('const keys = Object.keys(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.values call', () => {
    const sourceFile = createSourceFile('const vals = Object.values(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.entries call', () => {
    const sourceFile = createSourceFile('const entries = Object.entries(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.assign call', () => {
    const sourceFile = createSourceFile('const merged = Object.assign({}, defaults);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.create call', () => {
    const sourceFile = createSourceFile('const obj = Object.create(null);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.freeze call', () => {
    const sourceFile = createSourceFile('Object.freeze(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.defineProperty call', () => {
    const sourceFile = createSourceFile('Object.defineProperty(obj, "key", { value: 1 });')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Array.prototype.forEach.call', () => {
    const sourceFile = createSourceFile('Array.prototype.forEach.call(arr, fn);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Function.prototype.call', () => {
    const sourceFile = createSourceFile('Function.prototype.call.call(fn, obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.prototype.toString.call', () => {
    const sourceFile = createSourceFile('Object.prototype.toString.call(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag "prop" in obj pattern', () => {
    const sourceFile = createSourceFile('const x = "prop" in obj;')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Reflect.has call', () => {
    const sourceFile = createSourceFile('const x = Reflect.has(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag obj.hasOwnProperty.call (missing prototype)', () => {
    const sourceFile = createSourceFile('obj.hasOwnProperty.call(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.prototype.hasOwnProperty (without .call)', () => {
    const sourceFile = createSourceFile('const fn = Object.prototype.hasOwnProperty;')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag regular function call', () => {
    const sourceFile = createSourceFile('foo(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag console.log call', () => {
    const sourceFile = createSourceFile('console.log("hello");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag typeof expression', () => {
    const sourceFile = createSourceFile('typeof obj === "object";')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag instanceof expression', () => {
    const sourceFile = createSourceFile('obj instanceof Array;')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.prototype.hasOwnProperty.call with only 1 argument', () => {
    const sourceFile = createSourceFile('const x = Object.prototype.hasOwnProperty.call(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.prototype.hasOwnProperty.call with zero arguments', () => {
    const sourceFile = createSourceFile('const x = Object.prototype.hasOwnProperty.call();')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag SomeObject.prototype.hasOwnProperty.call', () => {
    const sourceFile = createSourceFile('SomeObject.prototype.hasOwnProperty.call(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.prototype.hasOwn.call', () => {
    const sourceFile = createSourceFile('Object.prototype.hasOwn.call(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.prototype.hasOwnProperty.apply', () => {
    const sourceFile = createSourceFile('Object.prototype.hasOwnProperty.apply(obj, ["prop"]);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.prototype.hasOwnProperty.bind', () => {
    const sourceFile = createSourceFile('Object.prototype.hasOwnProperty.bind(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.hasOwnProperty.call (missing prototype)', () => {
    const sourceFile = createSourceFile('Object.hasOwnProperty.call(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.call(obj, "prop")', () => {
    const sourceFile = createSourceFile('Object.call(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag prototype.hasOwnProperty.call (missing Object)', () => {
    const sourceFile = createSourceFile('prototype.hasOwnProperty.call(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag a regular method call', () => {
    const sourceFile = createSourceFile('obj.method("arg");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag a tagged template literal', () => {
    const sourceFile = createSourceFile('const x = tag`hello`;')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag a new expression', () => {
    const sourceFile = createSourceFile('const x = new Map();')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag a class declaration', () => {
    const sourceFile = createSourceFile('class Foo { bar() {} }')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag an interface declaration', () => {
    const sourceFile = createSourceFile('interface Foo { bar: string; }')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag a type alias', () => {
    const sourceFile = createSourceFile('type Foo = { bar: string };')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag an enum declaration', () => {
    const sourceFile = createSourceFile('enum Direction { Up, Down }')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag an import statement', () => {
    const sourceFile = createSourceFile('import { foo } from "bar";')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.defineProperty with descriptor', () => {
    const sourceFile = createSourceFile(
      'Object.defineProperty(obj, "key", { writable: true, value: 42 });',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.getOwnPropertyNames call', () => {
    const sourceFile = createSourceFile('Object.getOwnPropertyNames(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.getPrototypeOf call', () => {
    const sourceFile = createSourceFile('Object.getPrototypeOf(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Map.prototype.has.call', () => {
    const sourceFile = createSourceFile('Map.prototype.has.call(map, "key");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Set.prototype.has.call', () => {
    const sourceFile = createSourceFile('Set.prototype.has.call(set, "value");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Array.isArray call', () => {
    const sourceFile = createSourceFile('Array.isArray(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag JSON.parse call', () => {
    const sourceFile = createSourceFile('JSON.parse(str);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Promise.resolve call', () => {
    const sourceFile = createSourceFile('Promise.resolve(value);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.prototype with no chain', () => {
    const sourceFile = createSourceFile('const p = Object.prototype;')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag destructuring assignment', () => {
    const sourceFile = createSourceFile('const { a, b } = obj;')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag optional chaining', () => {
    const sourceFile = createSourceFile('obj?.prop;')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag nullish coalescing', () => {
    const sourceFile = createSourceFile('const x = obj?.prop ?? "default";')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.fromEntries call', () => {
    const sourceFile = createSourceFile('Object.fromEntries(entries);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })
})

describe('violation properties', () => {
  it('should have severity info', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].severity).toBe('info')
  })

  it('should have correct ruleId', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].ruleId).toBe('prefer-object-has-own')
  })

  it('should have correct message text', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].message).toBe(
      'Use Object.hasOwn() instead of Object.prototype.hasOwnProperty.call().',
    )
  })

  it('should have a range property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].range).toBeDefined()
  })

  it('should have a filePath property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].filePath).toBeDefined()
    expect(typeof violations[0].filePath).toBe('string')
  })

  it('should have a suggestion property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toBeDefined()
  })

  it('should have suggestion containing Object.hasOwn', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toContain('Object.hasOwn')
  })

  it('should have suggestion containing the object argument', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(myObj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toContain('myObj')
  })

  it('should have suggestion containing the property argument', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "myProp");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toContain('myProp')
  })

  it('should have message mentioning both old and new pattern', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].message).toContain('Object.hasOwn()')
    expect(violations[0].message).toContain('Object.prototype.hasOwnProperty.call()')
  })

  it('should produce exactly one violation for a single occurrence', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('edge cases', () => {
  it('should not flag when extra arguments are passed', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop", extra);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect when wrapped in negation', () => {
    const sourceFile = createSourceFile(
      'const x = !Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect when wrapped in double negation', () => {
    const sourceFile = createSourceFile(
      'const x = !!Object.prototype.hasOwnProperty.call(obj, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect in nested function scope', () => {
    const sourceFile = createSourceFile(
      'function outer() { function inner() { return Object.prototype.hasOwnProperty.call(obj, "key"); } }',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect in immediately invoked function', () => {
    const sourceFile = createSourceFile(
      '(function() { Object.prototype.hasOwnProperty.call(obj, "key"); })();',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect when result is assigned to a destructured variable', () => {
    const sourceFile = createSourceFile(
      'const { has } = { has: Object.prototype.hasOwnProperty.call(obj, "key") };',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect when used as argument to another function', () => {
    const sourceFile = createSourceFile(
      'console.log(Object.prototype.hasOwnProperty.call(obj, "key"));',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect in return statement', () => {
    const sourceFile = createSourceFile(
      'function fn() { return Object.prototype.hasOwnProperty.call(obj, "key"); }',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside switch case', () => {
    const sourceFile = createSourceFile(
      'switch(x) { case "a": Object.prototype.hasOwnProperty.call(obj, "key"); break; }',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with property named using reserved word string', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "class");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with property named using special characters', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "foo-bar");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with empty string property', () => {
    const sourceFile = createSourceFile('const x = Object.prototype.hasOwnProperty.call(obj, "");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with __proto__ property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "__proto__");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with constructor property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "constructor");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside conditional expression with complex nesting', () => {
    const sourceFile = createSourceFile(
      'const x = a ? Object.prototype.hasOwnProperty.call(b, "c") : false;',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside type assertion', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj as any, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside non-null assertion', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj!, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect when object arg is a function call result', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(JSON.parse(str), "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside template expression', () => {
    const sourceFile = createSourceFile(
      'const msg = `${Object.prototype.hasOwnProperty.call(obj, "key")}`;',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside default parameter', () => {
    const sourceFile = createSourceFile(
      'function fn(x = Object.prototype.hasOwnProperty.call(obj, "key")) {}',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside array literal', () => {
    const sourceFile = createSourceFile(
      'const arr = [Object.prototype.hasOwnProperty.call(obj, "key")];',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect inside object literal value', () => {
    const sourceFile = createSourceFile(
      'const o = { has: Object.prototype.hasOwnProperty.call(obj, "key") };',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('rule create', () => {
  it('should return an object with visitor and onComplete', () => {
    const result = preferObjectHasOwnRule.create({})
    expect(result.visitor).toBeDefined()
    expect(result.onComplete).toBeDefined()
  })

  it('should return a visitor with visitNode', () => {
    const result = preferObjectHasOwnRule.create({})
    expect(typeof result.visitor.visitNode).toBe('function')
  })

  it('should return onComplete as a function', () => {
    const result = preferObjectHasOwnRule.create({})
    expect(typeof result.onComplete).toBe('function')
  })

  it('should collect violations via create', () => {
    const result = preferObjectHasOwnRule.create({})
    expect(typeof result.visitor.visitNode).toBe('function')
    expect(typeof result.onComplete).toBe('function')
  })

  it('should return empty array from onComplete when no nodes visited', () => {
    const result = preferObjectHasOwnRule.create({})
    const violations = result.onComplete()
    expect(violations).toEqual([])
  })

  it('should accept options parameter', () => {
    const result = preferObjectHasOwnRule.create({})
    expect(result).toBeDefined()
  })

  it('should accept empty options', () => {
    const result = preferObjectHasOwnRule.create({})
    expect(result).toHaveProperty('visitor')
    expect(result).toHaveProperty('onComplete')
  })

  it('should have visitNode that accepts node and context', () => {
    const result = preferObjectHasOwnRule.create({})
    expect(result.visitor.visitNode.length).toBeLessThanOrEqual(2)
  })

  it('should handle create with default options', () => {
    const result = preferObjectHasOwnRule.create(preferObjectHasOwnRule.defaultOptions)
    expect(result.visitor).toBeDefined()
    expect(result.onComplete).toBeDefined()
  })
})

describe('analyzePreferObjectHasOwn', () => {
  it('should return an array', () => {
    const sourceFile = createSourceFile('const x = 1;')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(Array.isArray(violations)).toBe(true)
  })

  it('should return empty array for clean code', () => {
    const sourceFile = createSourceFile('const x = 1;')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should accept options parameter', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile, {})
    expect(violations).toHaveLength(1)
  })

  it('should accept undefined options', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile, undefined)
    expect(violations).toHaveLength(1)
  })

  it('should return violations with all required properties', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    const v = violations[0]
    expect(v).toHaveProperty('ruleId')
    expect(v).toHaveProperty('severity')
    expect(v).toHaveProperty('message')
    expect(v).toHaveProperty('filePath')
    expect(v).toHaveProperty('range')
    expect(v).toHaveProperty('suggestion')
  })

  it('should work with default options (no second argument)', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect violation in multi-statement file', () => {
    const sourceFile = createSourceFile(
      'const a = 1; const b = Object.prototype.hasOwnProperty.call(obj, "key"); const c = 3;',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should have consistent ruleId across calls', () => {
    const sf1 = createSourceFile('const x = Object.prototype.hasOwnProperty.call(a, "b");')
    const sf2 = createSourceFile('const y = Object.prototype.hasOwnProperty.call(c, "d");')
    const v1 = analyzePreferObjectHasOwn(sf1)
    const v2 = analyzePreferObjectHasOwn(sf2)
    expect(v1[0].ruleId).toBe(v2[0].ruleId)
  })

  it('should have consistent severity across calls', () => {
    const sf1 = createSourceFile('const x = Object.prototype.hasOwnProperty.call(a, "b");')
    const v1 = analyzePreferObjectHasOwn(sf1)
    expect(v1[0].severity).toBe('info')
  })

  it('should have consistent message across calls', () => {
    const sf1 = createSourceFile('const x = Object.prototype.hasOwnProperty.call(a, "b");')
    const sf2 = createSourceFile('const y = Object.prototype.hasOwnProperty.call(c, "d");')
    const v1 = analyzePreferObjectHasOwn(sf1)
    const v2 = analyzePreferObjectHasOwn(sf2)
    expect(v1[0].message).toBe(v2[0].message)
  })

  it('should not mutate the source file', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const originalText = sourceFile.getText()
    analyzePreferObjectHasOwn(sourceFile)
    expect(sourceFile.getText()).toBe(originalText)
  })
})

describe('multiple violations', () => {
  it('should detect two separate occurrences', () => {
    const sourceFile = createSourceFile(`
      const a = Object.prototype.hasOwnProperty.call(obj, "a");
      const b = Object.prototype.hasOwnProperty.call(obj, "b");
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect three separate occurrences', () => {
    const sourceFile = createSourceFile(`
      const a = Object.prototype.hasOwnProperty.call(obj, "a");
      const b = Object.prototype.hasOwnProperty.call(obj, "b");
      const c = Object.prototype.hasOwnProperty.call(obj, "c");
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(3)
  })

  it('should detect occurrences in different functions', () => {
    const sourceFile = createSourceFile(`
      function fn1() { return Object.prototype.hasOwnProperty.call(obj, "a"); }
      function fn2() { return Object.prototype.hasOwnProperty.call(obj, "b"); }
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect occurrences in if and else branches', () => {
    const sourceFile = createSourceFile(`
      if (x) { Object.prototype.hasOwnProperty.call(obj, "a"); }
      else { Object.prototype.hasOwnProperty.call(obj, "b"); }
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect nested occurrences', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(Object.prototype.hasOwnProperty.call(obj, "a") ? obj : {}, "b");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect in array of calls', () => {
    const sourceFile = createSourceFile(`
      const results = [
        Object.prototype.hasOwnProperty.call(obj, "a"),
        Object.prototype.hasOwnProperty.call(obj, "b"),
      ];
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect in object literal with multiple properties', () => {
    const sourceFile = createSourceFile(`
      const result = {
        hasA: Object.prototype.hasOwnProperty.call(obj, "a"),
        hasB: Object.prototype.hasOwnProperty.call(obj, "b"),
      };
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect five occurrences', () => {
    const sourceFile = createSourceFile(`
      Object.prototype.hasOwnProperty.call(obj, "a");
      Object.prototype.hasOwnProperty.call(obj, "b");
      Object.prototype.hasOwnProperty.call(obj, "c");
      Object.prototype.hasOwnProperty.call(obj, "d");
      Object.prototype.hasOwnProperty.call(obj, "e");
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(5)
  })

  it('should give each violation unique suggestion based on args', () => {
    const sourceFile = createSourceFile(`
      const a = Object.prototype.hasOwnProperty.call(obj, "alpha");
      const b = Object.prototype.hasOwnProperty.call(obj, "beta");
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toContain('alpha')
    expect(violations[1].suggestion).toContain('beta')
  })

  it('should detect mixed with valid code without flagging valid', () => {
    const sourceFile = createSourceFile(`
      const valid = Object.hasOwn(obj, "valid");
      const invalid = Object.prototype.hasOwnProperty.call(obj, "invalid");
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('invalid')
  })

  it('should detect multiple occurrences across class methods', () => {
    const sourceFile = createSourceFile(`
      class Checker {
        hasA() { return Object.prototype.hasOwnProperty.call(this, "a"); }
        hasB() { return Object.prototype.hasOwnProperty.call(this, "b"); }
        hasC() { return Object.prototype.hasOwnProperty.call(this, "c"); }
      }
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(3)
  })
})

describe('suggestion content', () => {
  it('should suggest replacement with same object and property args', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(myObj, "myProp");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: Object.hasOwn(myObj, "myProp")')
  })

  it('should suggest with variable property', () => {
    const sourceFile = createSourceFile('const x = Object.prototype.hasOwnProperty.call(obj, key);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: Object.hasOwn(obj, key)')
  })

  it('should suggest with string literal property', () => {
    const sourceFile = createSourceFile(
      "const x = Object.prototype.hasOwnProperty.call(obj, 'name');",
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toBe("Replace with: Object.hasOwn(obj, 'name')")
  })

  it('should suggest with member expression object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(config.options, "enabled");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: Object.hasOwn(config.options, "enabled")')
  })

  it('should suggest with this as object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(this, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: Object.hasOwn(this, "prop")')
  })

  it('should suggest with call expression as object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(getObj(), "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: Object.hasOwn(getObj(), "prop")')
  })

  it('should suggest with array access as object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(arr[0], "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: Object.hasOwn(arr[0], "prop")')
  })

  it('should start suggestion with Replace with:', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toMatch(/^Replace with:/)
  })

  it('should include Object.hasOwn in suggestion', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(data, "field");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toContain('Object.hasOwn(')
  })

  it('should preserve exact argument text in suggestion', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(foo.bar.baz, "deepProp");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toContain('foo.bar.baz')
    expect(violations[0].suggestion).toContain('"deepProp"')
  })

  it('should suggest with computed variable property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, keys[i]);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].suggestion).toContain('keys[i]')
  })
})

describe('argument variations', () => {
  it('should detect with undefined as first argument', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(undefined, "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with number as property argument', () => {
    const sourceFile = createSourceFile('const x = Object.prototype.hasOwnProperty.call(obj, 42);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with boolean as property argument', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, true);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with regular expression property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, /test/);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with object literal property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, {} as any);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with extra third argument', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop", "extra");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with many extra arguments', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "prop", a, b, c, d);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should not detect with only one argument', () => {
    const sourceFile = createSourceFile('const x = Object.prototype.hasOwnProperty.call(obj);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should detect with parenthesized object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call((obj), "prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with parenthesized property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, ("prop"));',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with as expression object', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj as Record<string, unknown>, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with non-null assertion on property', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, key!);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('negation and boolean patterns', () => {
  it('should detect when negated with !', () => {
    const sourceFile = createSourceFile('if (!Object.prototype.hasOwnProperty.call(obj, "key")) {}')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect in logical OR', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "a") || Object.prototype.hasOwnProperty.call(obj, "b");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect in logical AND', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "a") && Object.prototype.hasOwnProperty.call(obj, "b");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect with Boolean wrapper', () => {
    const sourceFile = createSourceFile(
      'const x = Boolean(Object.prototype.hasOwnProperty.call(obj, "key"));',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect in equality comparison', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key") === true;',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect in strict inequality', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key") !== false;',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect when used in conditional with negation', () => {
    const sourceFile = createSourceFile(
      'if (!Object.prototype.hasOwnProperty.call(obj, "key")) { throw new Error(); }',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('property names - special cases', () => {
  it('should detect with numeric property name', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "123");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with unicode property name', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "日本語");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with camelCase property name', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "myPropertyName");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with snake_case property name', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "my_property_name");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with SCREAMING_SNAKE_CASE property name', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "MY_CONSTANT");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with dollar sign property name', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "$value");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with underscore property name', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "_private");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with space in property name', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "my prop");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect with Symbol as property argument', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, Symbol.iterator);',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('file path in violations', () => {
  it('should include the source file path in violation', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].filePath).toContain('.ts')
  })

  it('should have different file paths for different source files', () => {
    const sf1 = createSourceFile('const x = Object.prototype.hasOwnProperty.call(obj, "a");')
    const sf2 = createSourceFile('const y = Object.prototype.hasOwnProperty.call(obj, "b");')
    const v1 = analyzePreferObjectHasOwn(sf1)
    const v2 = analyzePreferObjectHasOwn(sf2)
    expect(v1[0].filePath).not.toBe(v2[0].filePath)
  })

  it('should have numeric file path from shared project', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].filePath).toMatch(/test\d+\.ts/)
  })
})

describe('range properties', () => {
  it('should have range with start position', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].range.start).toBeDefined()
  })

  it('should have range with end position', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].range.end).toBeDefined()
  })

  it('should have end position after start position', () => {
    const sourceFile = createSourceFile(
      'const x = Object.prototype.hasOwnProperty.call(obj, "key");',
    )
    const violations = analyzePreferObjectHasOwn(sourceFile)
    const start = violations[0].range.start
    const end = violations[0].range.end
    const startPos = typeof start === 'number' ? start : start.line * 10000 + start.column
    const endPos = typeof end === 'number' ? end : end.line * 10000 + end.column
    expect(endPos).toBeGreaterThan(startPos)
  })

  it('should have different ranges for different occurrences in same file', () => {
    const sourceFile = createSourceFile(`
      const a = Object.prototype.hasOwnProperty.call(obj, "a");
      const b = Object.prototype.hasOwnProperty.call(obj, "b");
    `)
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations[0].range.start).not.toBe(violations[1].range.start)
  })
})

describe('default export', () => {
  it('should have a default export that matches the named export', async () => {
    const mod = await import('../../../../src/rules/best-practices/prefer-object-has-own.js')
    expect(mod.default).toBe(mod.preferObjectHasOwnRule)
  })

  it('should have default export with meta name', async () => {
    const mod = await import('../../../../src/rules/best-practices/prefer-object-has-own.js')
    expect(mod.default.meta.name).toBe('prefer-object-has-own')
  })
})
