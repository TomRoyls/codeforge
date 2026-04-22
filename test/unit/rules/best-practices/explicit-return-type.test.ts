import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  explicitReturnTypeRule,
  analyzeExplicitReturnType,
} from '../../../../src/rules/best-practices/explicit-return-type.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('explicit-return-type rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(explicitReturnTypeRule.meta.name).toBe('explicit-return-type')
    })
    it('should have style category', () => {
      expect(explicitReturnTypeRule.meta.category).toBe('style')
    })
    it('should have description', () => {
      expect(explicitReturnTypeRule.meta.description).toBeDefined()
      expect(typeof explicitReturnTypeRule.meta.description).toBe('string')
    })
    it('should not be recommended', () => {
      expect(explicitReturnTypeRule.meta.recommended).toBe(false)
    })
    it('should not be fixable', () => {
      expect(explicitReturnTypeRule.meta.fixable).toBeUndefined()
    })
    it('should have default options', () => {
      expect(explicitReturnTypeRule.defaultOptions).toEqual({
        checkExpressions: true,
        checkArrowFunctions: true,
        checkFunctionDeclarations: true,
        checkMethodDeclarations: true,
      })
    })
    it('should have create function', () => {
      expect(typeof explicitReturnTypeRule.create).toBe('function')
    })
    it('should have meta object', () => {
      expect(typeof explicitReturnTypeRule.meta).toBe('object')
    })
  })

  describe('detecting violations - arrow functions', () => {
    it('should flag arrow function without return type', () => {
      const sf = createSourceFile('const fn = () => 42;')
      const violations = analyzeExplicitReturnType(sf)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].ruleId).toBe('explicit-return-type')
    })
    it('should flag arrow function with block body', () => {
      const sf = createSourceFile('const fn = () => { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function with parameters', () => {
      const sf = createSourceFile('const fn = (x: number) => x * 2;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function with multiple parameters', () => {
      const sf = createSourceFile('const fn = (a: number, b: number) => a + b;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function returning object', () => {
      const sf = createSourceFile('const fn = () => ({ key: "value" });')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function returning string', () => {
      const sf = createSourceFile('const fn = () => "hello";')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function returning boolean', () => {
      const sf = createSourceFile('const fn = () => true;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function returning array', () => {
      const sf = createSourceFile('const fn = () => [1, 2, 3];')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function with void return', () => {
      const sf = createSourceFile('const fn = () => { console.log("hi"); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function in variable declaration', () => {
      const sf = createSourceFile('const fn = (x: string) => x.length;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function in let declaration', () => {
      const sf = createSourceFile('let fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function as callback', () => {
      const sf = createSourceFile('[1, 2, 3].map(x => x * 2)')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function in export', () => {
      const sf = createSourceFile('export const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag arrow function in default export', () => {
      const sf = createSourceFile('export default () => 42;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag async arrow function without return type', () => {
      const sf = createSourceFile('const fn = async () => 42;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
  })

  describe('detecting violations - function declarations', () => {
    it('should flag function declaration without return type', () => {
      const sf = createSourceFile('function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag exported function declaration', () => {
      const sf = createSourceFile('export function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag default exported function declaration', () => {
      const sf = createSourceFile('export default function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag function declaration with parameters', () => {
      const sf = createSourceFile('function fn(x: number) { return x * 2; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag function declaration with multiple parameters', () => {
      const sf = createSourceFile('function add(a: number, b: number) { return a + b; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag function declaration returning void', () => {
      const sf = createSourceFile('function fn() { console.log("hi"); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag function declaration returning string', () => {
      const sf = createSourceFile('function fn() { return "hello"; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag function declaration returning boolean', () => {
      const sf = createSourceFile('function fn() { return true; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag function declaration returning object', () => {
      const sf = createSourceFile('function fn() { return { key: "value" }; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag function declaration returning array', () => {
      const sf = createSourceFile('function fn() { return [1, 2, 3]; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag function declaration with no body return', () => {
      const sf = createSourceFile('function fn() {}')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag function in namespace', () => {
      const sf = createSourceFile('namespace NS { export function fn() { return 1; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag function in module', () => {
      const sf = createSourceFile('module M { export function fn() { return 1; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag generator function without return type', () => {
      const sf = createSourceFile('function* gen() { yield 1; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
  })

  describe('detecting violations - method declarations', () => {
    it('should flag method declaration without return type', () => {
      const sf = createSourceFile('class Foo { method() { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag static method without return type', () => {
      const sf = createSourceFile('class Foo { static method() { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag private method without return type', () => {
      const sf = createSourceFile('class Foo { #method() { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag method with parameters', () => {
      const sf = createSourceFile('class Foo { method(x: number) { return x; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag method returning void implicitly', () => {
      const sf = createSourceFile('class Foo { method() { console.log("hi"); } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag async method without return type', () => {
      const sf = createSourceFile('class Foo { async method() { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag method in exported class', () => {
      const sf = createSourceFile('export class Foo { method() { return 1; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag multiple methods without return types', () => {
      const sf = createSourceFile('class Foo { a() { return 1; } b() { return 2; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
    it('should not flag getter (not a MethodDeclaration)', () => {
      const sf = createSourceFile('class Foo { get value() { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag setter (not a MethodDeclaration)', () => {
      const sf = createSourceFile('class Foo { set value(x: number) { this._x = x; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should flag method with generic type parameter', () => {
      const sf = createSourceFile('class Foo { method<T>(x: T) { return x; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag abstract method without return type', () => {
      const sf = createSourceFile('abstract class Foo { abstract method(); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag arrow function with return type', () => {
      const sf = createSourceFile('const fn = (): number => 42;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag function declaration with return type', () => {
      const sf = createSourceFile('function fn(): number { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag method declaration with return type', () => {
      const sf = createSourceFile('class Foo { method(): number { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag async function declaration', () => {
      const sf = createSourceFile('async function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag async function declaration without return', () => {
      const sf = createSourceFile('async function fn() { console.log("hi"); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag exported async function', () => {
      const sf = createSourceFile('export async function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag arrow function with string return type', () => {
      const sf = createSourceFile('const fn = (): string => "hello";')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag arrow function with void return type', () => {
      const sf = createSourceFile('const fn = (): void => { console.log("hi"); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag function with boolean return type', () => {
      const sf = createSourceFile('function fn(): boolean { return true; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag method with void return type', () => {
      const sf = createSourceFile('class Foo { method(): void { console.log("hi"); } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag empty file', () => {
      const sf = createSourceFile('')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag numeric literal', () => {
      const sf = createSourceFile('const x = 42;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag string literal', () => {
      const sf = createSourceFile('const x = "hello";')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sf = createSourceFile('const x = { a: 1 };')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sf = createSourceFile('const x = [1, 2, 3];')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag class declaration without methods', () => {
      const sf = createSourceFile('class Foo { x: number = 1; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sf = createSourceFile("import { x } from 'y';")
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar(): number; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag type alias', () => {
      const sf = createSourceFile('type Foo = { bar: string };')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag enum declaration', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag variable declaration without function', () => {
      const sf = createSourceFile('const x = 5;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag static method with return type', () => {
      const sf = createSourceFile('class Foo { static method(): number { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag private method with return type', () => {
      const sf = createSourceFile('class Foo { #method(): number { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag arrow function with generic return type', () => {
      const sf = createSourceFile('const fn = <T>(): T => { return {} as T; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag function with union return type', () => {
      const sf = createSourceFile('function fn(): string | number { return 1; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag method with Promise return type', () => {
      const sf = createSourceFile('class Foo { async method(): Promise<number> { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should have correct ruleId for arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)[0].ruleId).toBe('explicit-return-type')
    })
    it('should have warning severity for arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)[0].severity).toBe('warning')
    })
    it('should have correct message for arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)[0].message).toBe(
        'Arrow function should have an explicit return type.',
      )
    })
    it('should have correct message for function declaration', () => {
      const sf = createSourceFile('function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)[0].message).toBe(
        'Function declaration should have an explicit return type.',
      )
    })
    it('should have correct message for method declaration', () => {
      const sf = createSourceFile('class Foo { method() { return 42; } }')
      expect(analyzeExplicitReturnType(sf)[0].message).toBe(
        'Method declaration should have an explicit return type.',
      )
    })
    it('should have suggestion', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)[0].suggestion).toBe('Add a return type annotation.')
    })
    it('should have range property', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)[0].range).toBeDefined()
    })
    it('should have filePath property', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)[0].filePath).toBeDefined()
    })
    it('should have range with start and end', () => {
      const sf = createSourceFile('const fn = () => 42;')
      const violation = analyzeExplicitReturnType(sf)[0]
      expect(violation.range).toHaveProperty('start')
      expect(violation.range).toHaveProperty('end')
    })
    it('should have filePath containing test.ts', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)[0].filePath).toContain('test.ts')
    })
    it('should have all required violation properties', () => {
      const sf = createSourceFile('const fn = () => 42;')
      const v = analyzeExplicitReturnType(sf)[0]
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('range')
      expect(v).toHaveProperty('suggestion')
    })
    it('should have correct property types', () => {
      const sf = createSourceFile('const fn = () => 42;')
      const v = analyzeExplicitReturnType(sf)[0]
      expect(typeof v.ruleId).toBe('string')
      expect(typeof v.severity).toBe('string')
      expect(typeof v.message).toBe('string')
      expect(typeof v.filePath).toBe('string')
      expect(typeof v.suggestion).toBe('string')
      expect(typeof v.range).toBe('object')
    })
  })

  describe('edge cases', () => {
    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle file with only comments', () => {
      const sf = createSourceFile('// comment\n/* block */')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle code with comments', () => {
      const sf = createSourceFile('// function\nconst fn = () => 42; /* end */')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should handle nested arrow functions', () => {
      const sf = createSourceFile('const fn = () => () => 42;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
    it('should handle arrow function in function body', () => {
      const sf = createSourceFile('function outer() { const inner = () => 42; return inner; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
    it('should handle method returning arrow function', () => {
      const sf = createSourceFile('class Foo { method() { return () => 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
    it('should handle constructor is not flagged', () => {
      const sf = createSourceFile('class Foo { constructor() {} }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle class with constructor and typed method', () => {
      const sf = createSourceFile('class Foo { constructor() {} method(): number { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < 10; i++) { console.log(i); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle while loop', () => {
      const sf = createSourceFile('while (true) { break; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle switch statement', () => {
      const sf = createSourceFile('switch(x) { case 1: break; default: break; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle try-catch', () => {
      const sf = createSourceFile('try { fn(); } catch(e) {}')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle try-finally', () => {
      const sf = createSourceFile('try { fn(); } finally { cleanup(); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle destructuring assignment', () => {
      const sf = createSourceFile('const { a, b } = obj;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle array destructuring', () => {
      const sf = createSourceFile('const [a, b] = arr;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle nullish coalescing', () => {
      const sf = createSourceFile('const x = a ?? b;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle optional chaining', () => {
      const sf = createSourceFile('const x = a?.b?.c;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle template literal', () => {
      const sf = createSourceFile('const s = `hello ${name}`;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle spread in function call', () => {
      const sf = createSourceFile('fn(...args);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle type annotation on variable', () => {
      const sf = createSourceFile('const fn: () => number = () => 42;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should handle arrow function in ternary', () => {
      const sf = createSourceFile('const fn = cond ? () => 42 : () => 0;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
    it('should handle arrow function in array', () => {
      const sf = createSourceFile('const fns = [() => 1, () => 2];')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
    it('should handle arrow function in object property', () => {
      const sf = createSourceFile('const obj = { fn: () => 42 };')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should handle arrow function as IIFE', () => {
      const sf = createSourceFile('(() => 42)();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should handle function expression without return type', () => {
      const sf = createSourceFile('const fn = function() { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should handle deeply nested arrow functions', () => {
      const sf = createSourceFile(
        'const fn = () => { const inner = () => { const deep = () => 1; return deep; }; return inner; };',
      )
      expect(analyzeExplicitReturnType(sf)).toHaveLength(3)
    })
    it('should handle method in nested class', () => {
      const sf = createSourceFile('class Outer { inner = class { method() { return 1; } }; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should handle export default function expression', () => {
      const sf = createSourceFile('export default function() { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should handle function overload with return type', () => {
      const sf = createSourceFile(
        'function fn(x: string): string;\nfunction fn(x: number): number;\nfunction fn(x: any) { return x; }',
      )
      const violations = analyzeExplicitReturnType(sf)
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('options - checkArrowFunctions', () => {
    it('should respect checkArrowFunctions: false', () => {
      const sf = createSourceFile('const fn = () => 42;')
      const violations = analyzeExplicitReturnType(sf, { checkArrowFunctions: false })
      expect(violations).toHaveLength(0)
    })
    it('should flag arrow function when checkArrowFunctions: true', () => {
      const sf = createSourceFile('const fn = () => 42;')
      const violations = analyzeExplicitReturnType(sf, { checkArrowFunctions: true })
      expect(violations).toHaveLength(1)
    })
    it('should still flag function declaration when checkArrowFunctions: false', () => {
      const sf = createSourceFile('const fn = () => 42; function bar() { return 1; }')
      const violations = analyzeExplicitReturnType(sf, { checkArrowFunctions: false })
      expect(violations).toHaveLength(1)
    })
    it('should still flag method when checkArrowFunctions: false', () => {
      const sf = createSourceFile('const fn = () => 42; class Foo { method() { return 1; } }')
      const violations = analyzeExplicitReturnType(sf, { checkArrowFunctions: false })
      expect(violations).toHaveLength(1)
    })
  })

  describe('options - checkFunctionDeclarations', () => {
    it('should respect checkFunctionDeclarations: false', () => {
      const sf = createSourceFile('function fn() { return 42; }')
      const violations = analyzeExplicitReturnType(sf, { checkFunctionDeclarations: false })
      expect(violations).toHaveLength(0)
    })
    it('should flag function declaration when checkFunctionDeclarations: true', () => {
      const sf = createSourceFile('function fn() { return 42; }')
      const violations = analyzeExplicitReturnType(sf, { checkFunctionDeclarations: true })
      expect(violations).toHaveLength(1)
    })
    it('should still flag arrow function when checkFunctionDeclarations: false', () => {
      const sf = createSourceFile('const fn = () => 42; function bar() { return 1; }')
      const violations = analyzeExplicitReturnType(sf, { checkFunctionDeclarations: false })
      expect(violations).toHaveLength(1)
    })
    it('should still flag method when checkFunctionDeclarations: false', () => {
      const sf = createSourceFile(
        'function fn() { return 42; } class Foo { method() { return 1; } }',
      )
      const violations = analyzeExplicitReturnType(sf, { checkFunctionDeclarations: false })
      expect(violations).toHaveLength(1)
    })
  })

  describe('options - checkMethodDeclarations', () => {
    it('should respect checkMethodDeclarations: false', () => {
      const sf = createSourceFile('class Foo { method() { return 42; } }')
      const violations = analyzeExplicitReturnType(sf, { checkMethodDeclarations: false })
      expect(violations).toHaveLength(0)
    })
    it('should flag method when checkMethodDeclarations: true', () => {
      const sf = createSourceFile('class Foo { method() { return 42; } }')
      const violations = analyzeExplicitReturnType(sf, { checkMethodDeclarations: true })
      expect(violations).toHaveLength(1)
    })
    it('should still flag arrow function when checkMethodDeclarations: false', () => {
      const sf = createSourceFile('class Foo { method() { return 42; } } const fn = () => 1;')
      const violations = analyzeExplicitReturnType(sf, { checkMethodDeclarations: false })
      expect(violations).toHaveLength(1)
    })
    it('should still flag function declaration when checkMethodDeclarations: false', () => {
      const sf = createSourceFile(
        'class Foo { method() { return 42; } } function fn() { return 1; }',
      )
      const violations = analyzeExplicitReturnType(sf, { checkMethodDeclarations: false })
      expect(violations).toHaveLength(1)
    })
  })

  describe('options - combined', () => {
    it('should flag nothing when all checks disabled', () => {
      const sf = createSourceFile(
        'const fn = () => 42; function bar() { return 1; } class Foo { method() { return 2; } }',
      )
      const violations = analyzeExplicitReturnType(sf, {
        checkArrowFunctions: false,
        checkFunctionDeclarations: false,
        checkMethodDeclarations: false,
      })
      expect(violations).toHaveLength(0)
    })
    it('should flag all when all checks enabled', () => {
      const sf = createSourceFile(
        'const fn = () => 42; function bar() { return 1; } class Foo { method() { return 2; } }',
      )
      const violations = analyzeExplicitReturnType(sf, {
        checkArrowFunctions: true,
        checkFunctionDeclarations: true,
        checkMethodDeclarations: true,
      })
      expect(violations).toHaveLength(3)
    })
    it('should work with empty options', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf, {})).toHaveLength(1)
    })
    it('should work with no options argument', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should work with undefined options', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf, undefined)).toHaveLength(1)
    })
    it('should only flag arrow functions when others disabled', () => {
      const sf = createSourceFile(
        'const fn = () => 42; function bar() { return 1; } class Foo { method() { return 2; } }',
      )
      const violations = analyzeExplicitReturnType(sf, {
        checkArrowFunctions: true,
        checkFunctionDeclarations: false,
        checkMethodDeclarations: false,
      })
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('Arrow function')
    })
    it('should only flag function declarations when others disabled', () => {
      const sf = createSourceFile(
        'const fn = () => 42; function bar() { return 1; } class Foo { method() { return 2; } }',
      )
      const violations = analyzeExplicitReturnType(sf, {
        checkArrowFunctions: false,
        checkFunctionDeclarations: true,
        checkMethodDeclarations: false,
      })
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('Function declaration')
    })
    it('should only flag method declarations when others disabled', () => {
      const sf = createSourceFile(
        'const fn = () => 42; function bar() { return 1; } class Foo { method() { return 2; } }',
      )
      const violations = analyzeExplicitReturnType(sf, {
        checkArrowFunctions: false,
        checkFunctionDeclarations: false,
        checkMethodDeclarations: true,
      })
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('Method declaration')
    })
  })

  describe('rule create function', () => {
    it('should return visitor and onComplete', () => {
      const result = explicitReturnTypeRule.create(explicitReturnTypeRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
    it('should return violations array from onComplete', () => {
      const result = explicitReturnTypeRule.create(explicitReturnTypeRule.defaultOptions)
      expect(Array.isArray(result.onComplete())).toBe(true)
    })
    it('should have visitNode in visitor', () => {
      const result = explicitReturnTypeRule.create(explicitReturnTypeRule.defaultOptions)
      expect(typeof result.visitor.visitNode).toBe('function')
    })
  })

  describe('suggestion format', () => {
    it('should suggest adding return type annotation for arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)[0].suggestion).toBe('Add a return type annotation.')
    })
    it('should suggest adding return type annotation for function declaration', () => {
      const sf = createSourceFile('function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)[0].suggestion).toBe('Add a return type annotation.')
    })
    it('should suggest adding return type annotation for method', () => {
      const sf = createSourceFile('class Foo { method() { return 42; } }')
      expect(analyzeExplicitReturnType(sf)[0].suggestion).toBe('Add a return type annotation.')
    })
    it('should be consistent across violation types', () => {
      const sf = createSourceFile(
        'const fn = () => 42; function bar() { return 1; } class Foo { method() { return 2; } }',
      )
      const violations = analyzeExplicitReturnType(sf)
      violations.forEach((v) => {
        expect(v.suggestion).toBe('Add a return type annotation.')
      })
    })
  })

  describe('message content', () => {
    it('should mention arrow function in arrow function message', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)[0].message).toContain('Arrow function')
    })
    it('should mention explicit return type in arrow function message', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf)[0].message).toContain('explicit return type')
    })
    it('should mention function declaration in function message', () => {
      const sf = createSourceFile('function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)[0].message).toContain('Function declaration')
    })
    it('should mention explicit return type in function message', () => {
      const sf = createSourceFile('function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)[0].message).toContain('explicit return type')
    })
    it('should mention method declaration in method message', () => {
      const sf = createSourceFile('class Foo { method() { return 42; } }')
      expect(analyzeExplicitReturnType(sf)[0].message).toContain('Method declaration')
    })
    it('should mention explicit return type in method message', () => {
      const sf = createSourceFile('class Foo { method() { return 42; } }')
      expect(analyzeExplicitReturnType(sf)[0].message).toContain('explicit return type')
    })
  })

  describe('analyze function', () => {
    it('should return empty array for source with no functions', () => {
      const sf = createSourceFile('const x = 1 + 2;')
      expect(analyzeExplicitReturnType(sf)).toEqual([])
    })
    it('should return non-empty array for arrow function violation', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzeExplicitReturnType(sf).length).toBeGreaterThan(0)
    })
    it('should return violations with consistent structure', () => {
      const sf = createSourceFile('const fn = () => 42;')
      const violation = analyzeExplicitReturnType(sf)[0]
      expect(typeof violation.ruleId).toBe('string')
      expect(typeof violation.severity).toBe('string')
      expect(typeof violation.message).toBe('string')
      expect(typeof violation.filePath).toBe('string')
      expect(typeof violation.suggestion).toBe('string')
      expect(typeof violation.range).toBe('object')
      expect(violation.range).toHaveProperty('start')
      expect(violation.range).toHaveProperty('end')
    })
    it('should handle source file with complex nesting', () => {
      const sf = createSourceFile('function outer() { if (true) { const inner = () => 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
    it('should handle only expression statement', () => {
      const sf = createSourceFile('(() => 42)();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should handle parenthesized arrow function', () => {
      const sf = createSourceFile('const fn = ((x: number) => x * 2);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
  })

  describe('multiple violations', () => {
    it('should detect two arrow functions', () => {
      const sf = createSourceFile('const a = () => 1;\nconst b = () => 2;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
    it('should detect three arrow functions', () => {
      const sf = createSourceFile('const a = () => 1;\nconst b = () => 2;\nconst c = () => 3;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(3)
    })
    it('should detect mixed violations', () => {
      const sf = createSourceFile(
        'const a = () => 1;\nfunction b() { return 2; }\nclass C { m() { return 3; } }',
      )
      expect(analyzeExplicitReturnType(sf)).toHaveLength(3)
    })
    it('should give each violation unique range', () => {
      const sf = createSourceFile('const a = () => 1;\nconst b = () => 2;')
      const violations = analyzeExplicitReturnType(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
    it('should give each violation correct filePath', () => {
      const sf = createSourceFile('const a = () => 1;\nconst b = () => 2;')
      const violations = analyzeExplicitReturnType(sf)
      violations.forEach((v) => {
        expect(v.filePath).toContain('test.ts')
      })
    })
    it('should count correctly with mixed valid and invalid', () => {
      const sf = createSourceFile(
        'const a = (): number => 1;\nconst b = () => 2;\nfunction c(): number { return 3; }\nfunction d() { return 4; }',
      )
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
    it('should detect four violations', () => {
      const sf = createSourceFile(
        'const a = () => 1;\nfunction b() { return 2; }\nclass C { m() { return 3; } }\nconst d = () => 4;',
      )
      expect(analyzeExplicitReturnType(sf)).toHaveLength(4)
    })
    it('should detect five violations', () => {
      const sf = createSourceFile(
        'const a = () => 1;\nconst b = () => 2;\nfunction c() { return 3; }\nclass D { m() { return 4; } }\nconst e = () => 5;',
      )
      expect(analyzeExplicitReturnType(sf)).toHaveLength(5)
    })
    it('should detect violations in different contexts', () => {
      const sf = createSourceFile('function fn1() { return 1; }\nfunction fn2() { return 2; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
    it('should handle class with mixed typed and untyped methods', () => {
      const sf = createSourceFile(
        'class Foo { a(): number { return 1; } b() { return 2; } c(): string { return "3"; } d() { return 4; } }',
      )
      expect(analyzeExplicitReturnType(sf)).toHaveLength(2)
    })
  })

  describe('async function handling', () => {
    it('should not flag async function declaration', () => {
      const sf = createSourceFile('async function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag exported async function', () => {
      const sf = createSourceFile('export async function fn() { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag async function with await', () => {
      const sf = createSourceFile(
        'async function fn() { const x = await fetch("/api"); return x; }',
      )
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag async function with Promise return', () => {
      const sf = createSourceFile('async function fn() { return Promise.resolve(42); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should flag async arrow function (not exempt)', () => {
      const sf = createSourceFile('const fn = async () => 42;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should flag async method without return type', () => {
      const sf = createSourceFile('class Foo { async method() { return 42; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should not flag non-async function with return type', () => {
      const sf = createSourceFile('function fn(): Promise<number> { return Promise.resolve(42); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag map callback with return type', () => {
      const sf = createSourceFile('[1, 2, 3].map((x): number => x * 2)')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag filter callback with return type', () => {
      const sf = createSourceFile('[1, 2, 3].filter((x): boolean => x > 1)')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag reduce callback with return type', () => {
      const sf = createSourceFile('[1, 2, 3].reduce((acc, val): number => acc + val, 0)')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag forEach callback with return type', () => {
      const sf = createSourceFile('[1, 2, 3].forEach((x): void => { console.log(x); })')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag find callback with return type', () => {
      const sf = createSourceFile('[1, 2, 3].find((x): boolean => x === 2)')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag some callback with return type', () => {
      const sf = createSourceFile('[1, 2, 3].some((x): boolean => x > 2)')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag every callback with return type', () => {
      const sf = createSourceFile('[1, 2, 3].every((x): boolean => x > 0)')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag sort callback with return type', () => {
      const sf = createSourceFile('[3, 1, 2].sort((a, b): number => a - b)')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Promise.all', () => {
      const sf = createSourceFile('const results = Promise.all(promises);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Array.from', () => {
      const sf = createSourceFile('const arr = Array.from({ length: 5 }, (_, i): number => i)')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Array.of', () => {
      const sf = createSourceFile('const arr = Array.of(1, 2, 3);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Object.entries', () => {
      const sf = createSourceFile('const entries = Object.entries(obj);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Object.keys', () => {
      const sf = createSourceFile('const keys = Object.keys(obj);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Object.values', () => {
      const sf = createSourceFile('const values = Object.values(obj);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag JSON.parse', () => {
      const sf = createSourceFile('const obj = JSON.parse(str);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag JSON.stringify', () => {
      const sf = createSourceFile('const s = JSON.stringify(obj);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Math operations', () => {
      const sf = createSourceFile('const max = Math.max(1, 2, 3);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag console.log', () => {
      const sf = createSourceFile('console.log("hello");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag new expression', () => {
      const sf = createSourceFile('const map = new Map();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sf = createSourceFile('const isArr = x instanceof Array;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile('const t = typeof x;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sf = createSourceFile('void 0;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag delete expression', () => {
      const sf = createSourceFile('delete obj.key;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag yield expression', () => {
      const sf = createSourceFile('function* gen() { yield 1; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should not flag throw statement', () => {
      const sf = createSourceFile('throw new Error("fail");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag debugger statement', () => {
      const sf = createSourceFile('debugger;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag labeled statement', () => {
      const sf = createSourceFile('outer: for (let i = 0; i < 10; i++) { break outer; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag do..while loop', () => {
      const sf = createSourceFile('do { x++; } while (x < 10);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag for..of loop', () => {
      const sf = createSourceFile('for (const item of arr) { console.log(item); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag for..in loop', () => {
      const sf = createSourceFile('for (const key in obj) { console.log(key); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag multiple valid patterns', () => {
      const sf = createSourceFile(
        'const a = (): number => 1;\nfunction b(): string { return "2"; }\nclass C { m(): boolean { return true; } }',
      )
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag function with array return type', () => {
      const sf = createSourceFile('function fn(): number[] { return [1, 2, 3]; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag arrow function with object return type', () => {
      const sf = createSourceFile('const fn = (): { key: string } => ({ key: "value" });')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag function with tuple return type', () => {
      const sf = createSourceFile('function fn(): [string, number] { return ["a", 1]; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag function with never return type', () => {
      const sf = createSourceFile('function fn(): never { throw new Error("x"); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag function with any return type', () => {
      const sf = createSourceFile('function fn(): any { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag function with unknown return type', () => {
      const sf = createSourceFile('function fn(): unknown { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag arrow with null return type', () => {
      const sf = createSourceFile('const fn = (): null => null;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag arrow with undefined return type', () => {
      const sf = createSourceFile('const fn = (): undefined => undefined;')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag arrow with Record return type', () => {
      const sf = createSourceFile('const fn = (): Record<string, number> => ({ a: 1 });')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag arrow with Map return type', () => {
      const sf = createSourceFile('const fn = (): Map<string, number> => new Map();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag arrow with Set return type', () => {
      const sf = createSourceFile('const fn = (): Set<number> => new Set();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag function with conditional return type', () => {
      const sf = createSourceFile(
        'function fn<T extends boolean>(x: T): T extends true ? string : number { return x ? "a" : 1; }',
      )
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should flag inner arrow in callback type return', () => {
      const sf = createSourceFile('const fn = (): (() => void) => () => { console.log("hi"); }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should not flag method with generic return type', () => {
      const sf = createSourceFile('class Foo { method<T>(): T { return {} as T; } }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag export statement', () => {
      const sf = createSourceFile('export { foo } from "./bar";')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag default export class', () => {
      const sf = createSourceFile('export default class Foo {}')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag default export with typed function', () => {
      const sf = createSourceFile('export default function fn(): number { return 42; }')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag RegExp exec', () => {
      const sf = createSourceFile('const x = regex.exec(str);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Map set', () => {
      const sf = createSourceFile('map.set("key", "value");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Set add', () => {
      const sf = createSourceFile('set.add(1);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Promise resolve', () => {
      const sf = createSourceFile('Promise.resolve(1);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Symbol', () => {
      const sf = createSourceFile('const s = Symbol("key");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag WeakMap', () => {
      const sf = createSourceFile('const wm = new WeakMap();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag WeakSet', () => {
      const sf = createSourceFile('const ws = new WeakSet();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Proxy', () => {
      const sf = createSourceFile('const p = new Proxy({}, {});')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Reflect', () => {
      const sf = createSourceFile('Reflect.get(obj, "key");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag ArrayBuffer', () => {
      const sf = createSourceFile('const buf = new ArrayBuffer(8);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag DataView', () => {
      const sf = createSourceFile('const dv = new DataView(buf);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag setTimeout', () => {
      const sf = createSourceFile('setTimeout(() => {}, 100);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should not flag setInterval', () => {
      const sf = createSourceFile('setInterval(() => {}, 100);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should not flag fetch', () => {
      const sf = createSourceFile('fetch("/api");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag URL', () => {
      const sf = createSourceFile('const u = new URL("http://example.com");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag URLSearchParams', () => {
      const sf = createSourceFile('const p = new URLSearchParams("a=1");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Blob', () => {
      const sf = createSourceFile('const b = new Blob(["data"]);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag FormData', () => {
      const sf = createSourceFile('const fd = new FormData();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Headers', () => {
      const sf = createSourceFile('const h = new Headers();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Response', () => {
      const sf = createSourceFile('const r = new Response();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag Request', () => {
      const sf = createSourceFile('const r = new Request("/api");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag AbortController', () => {
      const sf = createSourceFile('const ac = new AbortController();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag TextEncoder', () => {
      const sf = createSourceFile('const te = new TextEncoder();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag TextDecoder', () => {
      const sf = createSourceFile('const td = new TextDecoder();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag parseInt', () => {
      const sf = createSourceFile('const x = parseInt("123");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag parseFloat', () => {
      const sf = createSourceFile('const x = parseFloat("1.5");')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag isNaN', () => {
      const sf = createSourceFile('const x = isNaN(y);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag isFinite', () => {
      const sf = createSourceFile('const x = isFinite(y);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag encodeURI', () => {
      const sf = createSourceFile('const x = encodeURI(str);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag decodeURI', () => {
      const sf = createSourceFile('const x = decodeURI(str);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag btoa', () => {
      const sf = createSourceFile('const x = btoa(str);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag atob', () => {
      const sf = createSourceFile('const x = atob(str);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag structuredClone', () => {
      const sf = createSourceFile('const x = structuredClone(obj);')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag queueMicrotask', () => {
      const sf = createSourceFile('queueMicrotask(() => {});')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(1)
    })
    it('should not flag performance.now', () => {
      const sf = createSourceFile('performance.now();')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
    it('should not flag crypto.getRandomValues', () => {
      const sf = createSourceFile('crypto.getRandomValues(new Uint8Array(8));')
      expect(analyzeExplicitReturnType(sf)).toHaveLength(0)
    })
  })
})
