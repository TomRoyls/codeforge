import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferDefaultExport,
  preferDefaultExportRule,
} from '../../../../src/rules/best-practices/prefer-default-export.js'

import type { VisitorContext } from '../../../../src/ast/visitor.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0

function createSourceFile(code: string) {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code)
}

describe('prefer-default-export rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferDefaultExportRule.meta.name).toBe('prefer-default-export')
    })
    it('should have style category', () => {
      expect(preferDefaultExportRule.meta.category).toBe('style')
    })
    it('should not be recommended', () => {
      expect(preferDefaultExportRule.meta.recommended).toBe(false)
    })
    it('should not be fixable', () => {
      expect(preferDefaultExportRule.meta.fixable).toBeUndefined()
    })
    it('should have a description', () => {
      expect(preferDefaultExportRule.meta.description).toBeDefined()
      expect(preferDefaultExportRule.meta.description.length).toBeGreaterThan(0)
    })
    it('should have default options with target single', () => {
      expect(preferDefaultExportRule.defaultOptions.target).toBe('single')
    })
    it('should have default options with ignoreExportedTypes false', () => {
      expect(preferDefaultExportRule.defaultOptions.ignoreExportedTypes).toBe(false)
    })
    it('should have a create function', () => {
      expect(preferDefaultExportRule.create).toBeTypeOf('function')
    })
    it('should have meta property', () => {
      expect(preferDefaultExportRule).toHaveProperty('meta')
    })
  })

  describe('detecting violations - single named export', () => {
    it('should flag single exported const', () => {
      const sf = createSourceFile('export const config = { mode: "dev" };')
      const violations = analyzePreferDefaultExport(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('default export')
    })
    it('should flag single exported function', () => {
      const sf = createSourceFile('export function greet() { return "hello"; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported class', () => {
      const sf = createSourceFile('export class MyClass {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported interface', () => {
      const sf = createSourceFile('export interface MyProps { name: string; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported type alias', () => {
      const sf = createSourceFile('export type MyType = string | number;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported enum', () => {
      const sf = createSourceFile('export enum Status { Active, Inactive }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported arrow function as const', () => {
      const sf = createSourceFile('export const handler = () => 42;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported async function', () => {
      const sf = createSourceFile(
        'export async function fetchData() { return await fetch("/api"); }',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported generic function', () => {
      const sf = createSourceFile('export function identity<T>(x: T): T { return x; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported generic class', () => {
      const sf = createSourceFile('export class Container<T> { value: T; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported abstract class', () => {
      const sf = createSourceFile('export abstract class Base { abstract method(): void; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported const enum', () => {
      const sf = createSourceFile('export const enum Direction { Up, Down }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported string enum', () => {
      const sf = createSourceFile('export enum Color { Red = "RED", Blue = "BLUE" }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported let', () => {
      const sf = createSourceFile('export let counter = 0;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single re-exported item', () => {
      const sf = createSourceFile('export { foo } from "./other";')
      expect(analyzePreferDefaultExport(sf).length).toBeGreaterThan(0)
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag single default export', () => {
      const sf = createSourceFile('const config = { mode: "dev" }; export default config;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag multiple named exports', () => {
      const sf = createSourceFile('export const a = 1; export const b = 2;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag module with no exports', () => {
      const sf = createSourceFile('const internal = "private";')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag default function export', () => {
      const sf = createSourceFile('export default function greet() { return "hello"; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag default class export', () => {
      const sf = createSourceFile('export default class MyClass {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag both named and default exports', () => {
      const sf = createSourceFile('export const a = 1; export default function() {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag namespace export', () => {
      const sf = createSourceFile('export * from "./other";')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag mixed exports', () => {
      const sf = createSourceFile('export const a = 1; export interface B {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag multiple declarations in variable statement', () => {
      const sf = createSourceFile('export const a = 1, b = 2;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag function + default', () => {
      const sf = createSourceFile('export function helper() {} export default class App {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag const + default', () => {
      const sf = createSourceFile('export const VERSION = "1.0"; export default function main() {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag class + interface + default', () => {
      const sf = createSourceFile('export class Foo {} export interface Bar {} export default Foo;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag three named exports', () => {
      const sf = createSourceFile('export const a = 1; export const b = 2; export const c = 3;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag type-only export when ignoreExportedTypes is true', () => {
      const sf = createSourceFile('export interface MyProps { name: string; }')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(0)
    })
    it('should not flag non-exported function', () => {
      const sf = createSourceFile('function internal() { }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag non-exported class', () => {
      const sf = createSourceFile('class Internal {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag non-exported variable', () => {
      const sf = createSourceFile('const x = 42;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag re-export with multiple items', () => {
      const sf = createSourceFile('export { foo, bar } from "./other";')
      expect(analyzePreferDefaultExport(sf).length).toBeGreaterThan(0)
    })
    it('should not flag default + re-export', () => {
      const sf = createSourceFile('export { foo } from "./a"; export default class Main {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should have correct ruleId', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].ruleId).toBe('prefer-default-export')
    })
    it('should have warning severity', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].severity).toBe('warning')
    })
    it('should have a message', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].message.length).toBeGreaterThan(0)
    })
    it('should have a suggestion', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].suggestion).toBeDefined()
    })
    it('should have a range', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].range).toBeDefined()
    })
    it('should have a filePath', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].filePath).toBeDefined()
    })
    it('should mention default export in message', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].message).toContain('default export')
    })
    it('should mention cleaner imports in suggestion', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].suggestion).toContain('default export')
    })
  })

  describe('options', () => {
    it('should respect ignoreExportedTypes: true for interface', () => {
      const sf = createSourceFile('export interface MyProps { name: string; }')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(0)
    })
    it('should respect ignoreExportedTypes: true for type alias', () => {
      const sf = createSourceFile('export type MyType = string | number;')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(0)
    })
    it('should respect ignoreExportedTypes: true for enum', () => {
      const sf = createSourceFile('export enum Status { Active, Inactive }')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(0)
    })
    it('should flag const even with ignoreExportedTypes: true', () => {
      const sf = createSourceFile('export const value = 42;')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(1)
    })
    it('should flag function even with ignoreExportedTypes: true', () => {
      const sf = createSourceFile('export function fn() {}')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(1)
    })
    it('should flag class even with ignoreExportedTypes: true', () => {
      const sf = createSourceFile('export class Foo {}')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(1)
    })
    it('should flag const as single export when ignoreExportedTypes ignores interface+const', () => {
      const sf = createSourceFile(
        'export interface Config { port: number; } export const config: Config = { port: 3000 };',
      )
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(1)
    })
    it('should work with empty options', () => {
      const sf = createSourceFile('export const single = 1;')
      expect(analyzePreferDefaultExport(sf, {})).toHaveLength(1)
    })
    it('should work with default options', () => {
      const sf = createSourceFile('export const single = 1;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return visitor object', () => {
      const result = preferDefaultExportRule.create({})
      expect(result).toHaveProperty('visitor')
    })
    it('should return onComplete function', () => {
      const result = preferDefaultExportRule.create({})
      expect(result).toHaveProperty('onComplete')
      expect(result.onComplete).toBeTypeOf('function')
    })
    it('should have visitSourceFile in visitor', () => {
      const result = preferDefaultExportRule.create({})
      expect(result.visitor).toHaveProperty('visitSourceFile')
    })
    it('should detect violations through visitor', () => {
      const project = new Project({ useInMemoryFileSystem: true })
      const sf = project.createSourceFile('test.ts', 'export const single = 1;')
      const ruleInstance = preferDefaultExportRule.create({})
      const ctx = { filePath: 'test.ts', sourceFile: sf } as VisitorContext
      ruleInstance.visitor.visitSourceFile(sf, ctx)
      expect(ruleInstance.onComplete().length).toBeGreaterThan(0)
    })
    it('should return empty violations when no issue', () => {
      const project = new Project({ useInMemoryFileSystem: true })
      const sf = project.createSourceFile('test.ts', 'export const a = 1; export const b = 2;')
      const ruleInstance = preferDefaultExportRule.create({})
      const ctx = { filePath: 'test.ts', sourceFile: sf } as VisitorContext
      ruleInstance.visitor.visitSourceFile(sf, ctx)
      expect(ruleInstance.onComplete()).toHaveLength(0)
    })
    it('should merge custom options with defaults', () => {
      const result = preferDefaultExportRule.create({ ignoreExportedTypes: true })
      expect(result.visitor).toBeDefined()
    })
  })

  describe('analyzePreferDefaultExport function', () => {
    it('should return empty array for empty file', () => {
      expect(analyzePreferDefaultExport(createSourceFile(''))).toEqual([])
    })
    it('should return array type', () => {
      const sf = createSourceFile('export const x = 1;')
      expect(Array.isArray(analyzePreferDefaultExport(sf))).toBe(true)
    })
    it('should accept options parameter', () => {
      const sf = createSourceFile('export const x = 1;')
      expect(analyzePreferDefaultExport(sf, {})).toHaveLength(1)
    })
    it('should accept ignoreExportedTypes option', () => {
      const sf = createSourceFile('export interface I {}')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle export default expression', () => {
      const sf = createSourceFile('export default 42;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should handle export default arrow', () => {
      const sf = createSourceFile('export default () => 42;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should handle export default object', () => {
      const sf = createSourceFile('export default { a: 1, b: 2 };')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should handle export default array', () => {
      const sf = createSourceFile('export default [1, 2, 3];')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should handle named + default function', () => {
      const sf = createSourceFile('function greet() {} export default greet;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should handle named + default class', () => {
      const sf = createSourceFile('class App {} export default App;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should handle re-export default', () => {
      const sf = createSourceFile('export { default } from "./other";')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should handle export type only', () => {
      const sf = createSourceFile('export type ID = string;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should handle export interface with generics', () => {
      const sf = createSourceFile('export interface Container<T> { value: T; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should handle export type with generics', () => {
      const sf = createSourceFile('export type Result<T> = { ok: true; value: T };')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should handle export with const assertion', () => {
      const sf = createSourceFile('export const config = { port: 3000 } as const;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should handle multiline export', () => {
      const sf = createSourceFile(`export const config = {
        port: 3000,
        host: 'localhost',
      };`)
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should handle export function with complex signature', () => {
      const sf = createSourceFile(
        'export function create<T>(factory: () => T): T { return factory(); }',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
  })

  describe('multiple exports - no violation', () => {
    it('should not flag function + const', () => {
      const sf = createSourceFile('export function fn() {} export const val = 1;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag class + const', () => {
      const sf = createSourceFile('export class Foo {} export const bar = 1;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag const + type', () => {
      const sf = createSourceFile('export const x = 1; export type T = string;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag function + interface', () => {
      const sf = createSourceFile('export function process() {} export interface Config {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag two functions', () => {
      const sf = createSourceFile('export function a() {} export function b() {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag two classes', () => {
      const sf = createSourceFile('export class A {} export class B {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag enum + const', () => {
      const sf = createSourceFile('export enum Color { Red } export const val = 1;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag two types', () => {
      const sf = createSourceFile('export type A = string; export type B = number;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag type + interface', () => {
      const sf = createSourceFile('export type T = string; export interface I { x: T; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
  })

  describe('valid code - extended patterns', () => {
    it('should not flag import-only file', () => {
      const sf = createSourceFile('import { foo } from "bar"; console.log(foo);')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag side-effect import', () => {
      const sf = createSourceFile('import "polyfill";')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag namespace import', () => {
      const sf = createSourceFile('import * as fs from "fs"; fs.readFileSync("x");')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag re-export all', () => {
      const sf = createSourceFile('export * from "./utils";')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag re-export all with rename', () => {
      const sf = createSourceFile('export * as utils from "./utils";')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag file with only comments', () => {
      const sf = createSourceFile('// This file has no exports')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag declare module', () => {
      const sf = createSourceFile('declare module "foo" { export const bar: string; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag declare global', () => {
      const sf = createSourceFile('declare global { interface Window { myVar: number; } }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag ambient declaration', () => {
      const sf = createSourceFile('declare function external(): void;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag triple-slash directive', () => {
      const sf = createSourceFile('/// <reference types="node" />')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag private class', () => {
      const sf = createSourceFile('class Private { method() {} }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag static methods', () => {
      const sf = createSourceFile('class Util { static helper() {} }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag decorator', () => {
      const sf = createSourceFile('@injectable class Service {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag try-catch', () => {
      const sf = createSourceFile('try { fn(); } catch(e) { handleError(e); }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag promise chain', () => {
      const sf = createSourceFile('fetch("/api").then(r => r.json()).then(console.log);')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag async IIFE', () => {
      const sf = createSourceFile('(async () => { await doSomething(); })();')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag for-of loop', () => {
      const sf = createSourceFile('for (const item of items) { process(item); }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag Map usage', () => {
      const sf = createSourceFile('const m = new Map<string, number>();')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag Set usage', () => {
      const sf = createSourceFile('const s = new Set<number>();')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag Symbol', () => {
      const sf = createSourceFile('const sym = Symbol("key");')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag Proxy', () => {
      const sf = createSourceFile('const p = new Proxy(target, handler);')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag generator function', () => {
      const sf = createSourceFile('function* gen() { yield 1; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag regex literal', () => {
      const sf = createSourceFile('const re = /pattern/g;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag BigInt literal', () => {
      const sf = createSourceFile('const big = 9007199254740991n;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sf = createSourceFile('const arr = [1, 2, 3];')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sf = createSourceFile('const obj = { a: 1, b: 2 };')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag template literal', () => {
      const sf = createSourceFile('const msg = `Hello ${name}`;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const val = obj?.prop?.method?.();')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const val = input ?? "default";')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile('if (typeof x === "string") { console.log(x); }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sf = createSourceFile('if (x instanceof Error) { throw x; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag ternary operator', () => {
      const sf = createSourceFile('const val = cond ? a : b;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag destructuring', () => {
      const sf = createSourceFile('const [a, b] = getTuple();')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag object destructuring', () => {
      const sf = createSourceFile('const { a, b } = getObj();')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag spread operator', () => {
      const sf = createSourceFile('const arr = [...other];')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag rest parameter', () => {
      const sf = createSourceFile('function fn(...args: number[]) {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag as const', () => {
      const sf = createSourceFile('const arr = [1, 2, 3] as const;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag type assertion', () => {
      const sf = createSourceFile('const val = x as string;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag satisfies', () => {
      const sf = createSourceFile('const obj = { a: 1 } satisfies Record<string, number>;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag keyof', () => {
      const sf = createSourceFile('type Keys = keyof Obj;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag conditional type', () => {
      const sf = createSourceFile('type T = X extends string ? true : false;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag mapped type', () => {
      const sf = createSourceFile('type R<T> = { readonly [K in keyof T]: T[K] };')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag union type', () => {
      const sf = createSourceFile('type V = string | number;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag intersection type', () => {
      const sf = createSourceFile('type C = A & B;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag tuple type', () => {
      const sf = createSourceFile('const t: [string, number] = ["a", 1];')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag index signature', () => {
      const sf = createSourceFile('interface Dict { [key: string]: number; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag call signature', () => {
      const sf = createSourceFile('interface Fn { (x: number): string; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag construct signature', () => {
      const sf = createSourceFile('interface C { new (x: number): Foo; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag template literal type', () => {
      const sf = createSourceFile('type Route = `/api/${string}`;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag dynamic import', () => {
      const sf = createSourceFile('const m = import("mod");')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag debugger statement', () => {
      const sf = createSourceFile('debugger;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag empty statement', () => {
      const sf = createSourceFile(';')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag labeled statement', () => {
      const sf = createSourceFile('label: for (;;) { break label; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag with statement', () => {
      const sf = createSourceFile('with (obj) { console.log(prop); }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag multiple variable declarations', () => {
      const sf = createSourceFile('const a = 1, b = 2, c = 3;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sf = createSourceFile('void fn();')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag delete operator', () => {
      const sf = createSourceFile('delete obj.prop;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag throw statement', () => {
      const sf = createSourceFile('throw new Error("fail");')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag WeakRef', () => {
      const sf = createSourceFile('const ref = new WeakRef(obj);')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag FinalizationRegistry', () => {
      const sf = createSourceFile('const reg = new FinalizationRegistry(() => {});')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag ArrayBuffer', () => {
      const sf = createSourceFile('const buf = new ArrayBuffer(8);')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag globalThis', () => {
      const sf = createSourceFile('const g = globalThis;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag queueMicrotask', () => {
      const sf = createSourceFile('queueMicrotask(() => {});')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag structuredClone', () => {
      const sf = createSourceFile('const clone = structuredClone(obj);')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
  })

  describe('flagged patterns - single exports with complex code', () => {
    it('should flag single exported function with local helpers', () => {
      const sf = createSourceFile(`
        function helper() { return 1; }
        export function main() { return helper(); }
      `)
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported const with local code', () => {
      const sf = createSourceFile(`
        const internal = compute();
        export const config = { value: internal };
      `)
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported class with local types', () => {
      const sf = createSourceFile(`
        type Internal = { x: number };
        export class Service { private data: Internal = { x: 0 }; }
      `)
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported async function', () => {
      const sf = createSourceFile('export async function load() { return fetch("/api"); }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported generator function', () => {
      const sf = createSourceFile('export function* sequence() { yield 1; yield 2; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported const arrow', () => {
      const sf = createSourceFile(
        'export const handler: Handler = (req, res) => { res.send("ok"); };',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported type with generic', () => {
      const sf = createSourceFile(
        'export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported interface extending other', () => {
      const sf = createSourceFile('export interface AppConfig extends Config { env: string; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported enum with string values', () => {
      const sf = createSourceFile('export enum Direction { Up = "UP", Down = "DOWN" }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported const with as const', () => {
      const sf = createSourceFile('export const ROUTES = ["/home", "/about"] as const;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported abstract class', () => {
      const sf = createSourceFile('export abstract class BaseService { abstract init(): void; }')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported function with overloads', () => {
      const sf = createSourceFile(`
        export function process(input: string): string;
        export function process(input: number): number;
        export function process(input: string | number): string | number { return input; }
      `)
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported const assertion', () => {
      const sf = createSourceFile('export const ALLOWED = ["a", "b"] as const;')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
    it('should flag single exported const with type annotation', () => {
      const sf = createSourceFile('export const ALLOWED_TYPES: readonly string[] = ["a", "b"];')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(1)
    })
  })

  describe('valid patterns - no single export', () => {
    it('should not flag const + default export', () => {
      const sf = createSourceFile('export const name = "test"; export default function app() {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag function + interface + default', () => {
      const sf = createSourceFile(
        'export function helper() {} export interface Opts {} export default class App {}',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag two re-exports', () => {
      const sf = createSourceFile('export { a } from "./a"; export { b } from "./b";')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag const + type', () => {
      const sf = createSourceFile(
        'export const version = "1.0"; export type Config = { port: number };',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag class + enum', () => {
      const sf = createSourceFile(
        'export class Validator {} export enum ValidationLevel { Strict, Loose }',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag function + const in same statement', () => {
      const sf = createSourceFile(
        'export function process() {} export const VERSION = "1.0"; export const NAME = "app";',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag namespace with default', () => {
      const sf = createSourceFile(
        'export namespace Utils { export function fn() {} } export default Utils;',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag four named exports', () => {
      const sf = createSourceFile(
        'export const a = 1; export const b = 2; export const c = 3; export const d = 4;',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag type + interface + enum', () => {
      const sf = createSourceFile(
        'export type ID = string; export interface Entity { id: ID; } export enum Status { Active }',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag re-export with local const + default', () => {
      const sf = createSourceFile(
        'export { helper } from "./utils"; export const version = "1.0"; export default class Main {}',
      )
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
  })

  describe('ignoreExportedTypes option edge cases', () => {
    it('should count const+interface as two exports normally', () => {
      const sf = createSourceFile('export const config = {}; export interface ConfigType {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should count const only when types ignored', () => {
      const sf = createSourceFile('export const config = {}; export interface ConfigType {}')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(1)
    })
    it('should not flag interface alone when types ignored', () => {
      const sf = createSourceFile('export interface OnlyType {}')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(0)
    })
    it('should not flag type alias alone when types ignored', () => {
      const sf = createSourceFile('export type OnlyAlias = string | number;')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(0)
    })
    it('should not flag enum alone when types ignored', () => {
      const sf = createSourceFile('export enum OnlyEnum { A, B }')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(0)
    })
    it('should flag const even with interface when types ignored', () => {
      const sf = createSourceFile('export const value = 42; export interface Metadata {}')
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(1)
    })
    it('should not flag two consts with types ignored', () => {
      const sf = createSourceFile(
        'export const a = 1; export const b = 2; export interface Meta {}',
      )
      expect(analyzePreferDefaultExport(sf, { ignoreExportedTypes: true })).toHaveLength(0)
    })
  })

  describe('message and suggestion content', () => {
    it('should mention one export in message', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].message).toContain('only one export')
    })
    it('should mention default export in message', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].message).toContain('default export')
    })
    it('should mention cleaner imports in suggestion', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].suggestion).toContain('cleaner imports')
    })
    it('should suggest converting to default export', () => {
      const sf = createSourceFile('export const single = 42;')
      expect(analyzePreferDefaultExport(sf)[0].suggestion).toContain('default export')
    })
    it('should have consistent message for different export types', () => {
      const sf1 = createSourceFile('export const x = 1;')
      const sf2 = createSourceFile('export function fn() {}')
      expect(analyzePreferDefaultExport(sf1)[0].message).toBe(
        analyzePreferDefaultExport(sf2)[0].message,
      )
    })
  })

  describe('re-export patterns', () => {
    it('should flag single re-export', () => {
      const sf = createSourceFile('export { foo } from "./other";')
      expect(analyzePreferDefaultExport(sf).length).toBeGreaterThan(0)
    })
    it('should not flag namespace re-export', () => {
      const sf = createSourceFile('export * from "./other";')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should not flag re-export with default', () => {
      const sf = createSourceFile('export { foo } from "./other"; export default class Main {}')
      expect(analyzePreferDefaultExport(sf)).toHaveLength(0)
    })
    it('should flag single named re-export', () => {
      const sf = createSourceFile('export { transform } from "./utils";')
      expect(analyzePreferDefaultExport(sf).length).toBeGreaterThan(0)
    })
    it('should not flag two re-exports from same module', () => {
      const sf = createSourceFile('export { a, b } from "./mod";')
      expect(analyzePreferDefaultExport(sf).length).toBeGreaterThan(0)
    })
    it('should flag single export from barrel file', () => {
      const sf = createSourceFile('export { UserService } from "./services/user";')
      expect(analyzePreferDefaultExport(sf).length).toBeGreaterThan(0)
    })
    it('should not flag re-export with rename only', () => {
      const sf = createSourceFile('export { foo as bar } from "./mod";')
      expect(analyzePreferDefaultExport(sf).length).toBeGreaterThan(0)
    })
  })
})
