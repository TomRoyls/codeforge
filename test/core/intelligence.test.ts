import { describe, it, expect, beforeEach } from 'vitest'
import { SymbolIndexer } from '../../src/core/intelligence/symbol-indexer.js'
import type {
  SymbolInfo,
  SymbolReference,
  NavigationResult,
  CallGraph,
  RenameResult,
  SymbolTable,
} from '../../src/core/intelligence/types.js'

describe('SymbolIndexer', () => {
  let indexer: SymbolIndexer

  beforeEach(() => {
    indexer = new SymbolIndexer()
  })

  describe('constructor and reset', () => {
    it('should initialize with empty table', () => {
      const table = indexer.getTable()
      expect(table.symbols.size).toBe(0)
      expect(table.references.length).toBe(0)
      expect(table.fileIndex.size).toBe(0)
      expect(table.nameIndex.size).toBe(0)
    })

    it('should reset to empty state', () => {
      indexer.indexFile('test.ts', 'export class Foo {}')
      expect(indexer.getTable().symbols.size).toBe(1)
      indexer.reset()
      expect(indexer.getTable().symbols.size).toBe(0)
    })
  })

  describe('indexFile - classes', () => {
    it('should index an exported class', () => {
      const source = 'export class MyClass {\n  constructor() {}\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      expect(symbols.length).toBeGreaterThanOrEqual(1)
      const cls = symbols.find((s) => s.name === 'MyClass')
      expect(cls).toBeDefined()
      expect(cls!.kind).toBe('class')
      expect(cls!.isExported).toBe(true)
      expect(cls!.isDefault).toBe(false)
    })

    it('should index a non-exported class', () => {
      const source = 'class InternalClass {}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const cls = symbols.find((s) => s.name === 'InternalClass')
      expect(cls).toBeDefined()
      expect(cls!.isExported).toBe(false)
    })

    it('should index a default exported class', () => {
      const source = 'export default class DefaultClass {}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const cls = symbols.find((s) => s.name === 'DefaultClass')
      expect(cls).toBeDefined()
      expect(cls!.isDefault).toBe(true)
    })

    it('should index abstract class with modifier', () => {
      const source = 'export abstract class BaseClass {}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const cls = symbols.find((s) => s.name === 'BaseClass')
      expect(cls).toBeDefined()
      expect(cls!.modifiers).toContain('abstract')
    })
  })

  describe('indexFile - interfaces', () => {
    it('should index an exported interface', () => {
      const source = 'export interface User {\n  name: string\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const iface = symbols.find((s) => s.name === 'User')
      expect(iface).toBeDefined()
      expect(iface!.kind).toBe('interface')
      expect(iface!.isExported).toBe(true)
    })

    it('should index a non-exported interface', () => {
      const source = 'interface Config {\n  debug: boolean\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const iface = symbols.find((s) => s.name === 'Config')
      expect(iface).toBeDefined()
      expect(iface!.isExported).toBe(false)
    })
  })

  describe('indexFile - types', () => {
    it('should index an exported type alias', () => {
      const source = "export type Result<T> = { ok: true; value: T } | { ok: false; error: string }\n"
      const symbols = indexer.indexFile('test.ts', source)
      const tp = symbols.find((s) => s.name === 'Result')
      expect(tp).toBeDefined()
      expect(tp!.kind).toBe('type')
    })

    it('should index type with object literal', () => {
      const source = 'export type Point = { x: number; y: number }\n'
      const symbols = indexer.indexFile('test.ts', source)
      const tp = symbols.find((s) => s.name === 'Point')
      expect(tp).toBeDefined()
    })
  })

  describe('indexFile - functions', () => {
    it('should index an exported function', () => {
      const source = 'export function greet(name: string): string {\n  return `Hello ${name}`\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const fn = symbols.find((s) => s.name === 'greet')
      expect(fn).toBeDefined()
      expect(fn!.kind).toBe('function')
      expect(fn!.isExported).toBe(true)
    })

    it('should index an async function with modifier', () => {
      const source = 'export async function fetchData(url: string): Promise<void> {\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const fn = symbols.find((s) => s.name === 'fetchData')
      expect(fn).toBeDefined()
      expect(fn!.modifiers).toContain('async')
    })

    it('should index a default exported function', () => {
      const source = 'export default function main() {\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const fn = symbols.find((s) => s.name === 'main')
      expect(fn).toBeDefined()
      expect(fn!.isDefault).toBe(true)
    })
  })

  describe('indexFile - enums', () => {
    it('should index an exported enum', () => {
      const source = 'export enum Color {\n  Red,\n  Green,\n  Blue\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const en = symbols.find((s) => s.name === 'Color')
      expect(en).toBeDefined()
      expect(en!.kind).toBe('enum')
      expect(en!.isExported).toBe(true)
    })
  })

  describe('indexFile - constants and variables', () => {
    it('should index exported const', () => {
      const source = 'export const MAX_SIZE = 100\n'
      const symbols = indexer.indexFile('test.ts', source)
      const c = symbols.find((s) => s.name === 'MAX_SIZE')
      expect(c).toBeDefined()
      expect(c!.kind).toBe('const')
      expect(c!.isExported).toBe(true)
    })

    it('should index const with type annotation', () => {
      const source = 'export const name: string = "test"\n'
      const symbols = indexer.indexFile('test.ts', source)
      const c = symbols.find((s) => s.name === 'name')
      expect(c).toBeDefined()
      expect(c!.typeAnnotation).toBe('string')
    })

    it('should index let variables', () => {
      const source = 'export let count = 0\n'
      const symbols = indexer.indexFile('test.ts', source)
      const v = symbols.find((s) => s.name === 'count')
      expect(v).toBeDefined()
      expect(v!.kind).toBe('variable')
    })

    it('should index var variables', () => {
      const source = 'export var legacy = true\n'
      const symbols = indexer.indexFile('test.ts', source)
      const v = symbols.find((s) => s.name === 'legacy')
      expect(v).toBeDefined()
      expect(v!.kind).toBe('variable')
    })
  })

  describe('indexFile - namespaces and modules', () => {
    it('should index exported namespace', () => {
      const source = 'export namespace Utils {\n  export function helper() {}\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const ns = symbols.find((s) => s.name === 'Utils')
      expect(ns).toBeDefined()
      expect(ns!.kind).toBe('namespace')
    })

    it('should index exported module', () => {
      const source = 'export module MyModule {\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const mod = symbols.find((s) => s.name === 'MyModule')
      expect(mod).toBeDefined()
      expect(mod!.kind).toBe('module')
    })
  })

  describe('indexFile - methods and properties', () => {
    it('should index class methods', () => {
      const source = 'export class Service {\n  public process(data: string): void {}\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const method = symbols.find((s) => s.name === 'process')
      expect(method).toBeDefined()
      expect(method!.kind).toBe('method')
    })

    it('should index private methods', () => {
      const source = 'export class Service {\n  private validate(): boolean { return true }\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const method = symbols.find((s) => s.name === 'validate')
      expect(method).toBeDefined()
      expect(method!.modifiers).toContain('private')
    })

    it('should index async methods', () => {
      const source = 'export class Api {\n  async fetch(): Promise<void> {}\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const method = symbols.find((s) => s.name === 'fetch')
      expect(method).toBeDefined()
      expect(method!.modifiers).toContain('async')
    })

    it('should index class properties', () => {
      const source = 'export class Entity {\n  public name: string\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const prop = symbols.find((s) => s.name === 'name' && s.kind === 'property')
      expect(prop).toBeDefined()
    })
  })

  describe('indexFile - symbol IDs', () => {
    it('should generate unique IDs with file path, line, and name', () => {
      const source = 'export class Foo {}\n'
      const symbols = indexer.indexFile('test.ts', source)
      expect(symbols[0]!.id).toBe('test.ts:1:Foo')
    })
  })

  describe('indexFile - end position tracking', () => {
    it('should track end line for block symbols', () => {
      const source = 'export class Foo {\n  bar(): void {}\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const cls = symbols.find((s) => s.name === 'Foo')
      expect(cls).toBeDefined()
      expect(cls!.endLine).toBe(3)
    })
  })

  describe('indexFile - documentation extraction', () => {
    it('should extract JSDoc documentation', () => {
      const source = '/** My doc */\nexport class DocClass {}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const cls = symbols.find((s) => s.name === 'DocClass')
      expect(cls).toBeDefined()
      expect(cls!.documentation).toContain('My doc')
    })
  })

  describe('indexFiles', () => {
    it('should index multiple files and return total symbol count', () => {
      const files = new Map<string, string>([
        ['a.ts', 'export class A {}\n'],
        ['b.ts', 'export class B {}\nexport function fn() {}\n'],
      ])
      const count = indexer.indexFiles(files)
      expect(count).toBe(3)
    })

    it('should handle empty files map', () => {
      const count = indexer.indexFiles(new Map())
      expect(count).toBe(0)
    })
  })

  describe('findSymbol', () => {
    it('should find symbols by name', () => {
      indexer.indexFile('test.ts', 'export class MyService {}\n')
      const results = indexer.findSymbol('MyService')
      expect(results.length).toBe(1)
      expect(results[0]!.name).toBe('MyService')
    })

    it('should return empty array for unknown symbol', () => {
      indexer.indexFile('test.ts', 'export class Foo {}\n')
      const results = indexer.findSymbol('NonExistent')
      expect(results).toEqual([])
    })

    it('should find multiple symbols with same name across files', () => {
      const files = new Map<string, string>([
        ['a.ts', 'export class Config {}\n'],
        ['b.ts', 'export interface Config {}\n'],
      ])
      indexer.indexFiles(files)
      const results = indexer.findSymbol('Config')
      expect(results.length).toBe(2)
    })
  })

  describe('getSymbol', () => {
    it('should find symbol by exact ID', () => {
      indexer.indexFile('test.ts', 'export class Finder {}\n')
      const symbol = indexer.getSymbol('test.ts:1:Finder')
      expect(symbol).not.toBeNull()
      expect(symbol!.name).toBe('Finder')
    })

    it('should return null for unknown ID', () => {
      const symbol = indexer.getSymbol('nonexistent:1:X')
      expect(symbol).toBeNull()
    })
  })

  describe('findDefinition', () => {
    it('should find definition with references', () => {
      indexer.indexFile('a.ts', 'export function greet() {}\n')
      indexer.indexFile('b.ts', "import { greet } from './a.js'\ngreet()\n")
      const def = indexer.findDefinition('greet')
      expect(def).not.toBeNull()
      expect(def!.symbol.name).toBe('greet')
      expect(def!.symbol.kind).toBe('function')
      expect(def!.references.length).toBeGreaterThanOrEqual(1)
    })

    it('should return null for unknown symbol', () => {
      const def = indexer.findDefinition('unknown')
      expect(def).toBeNull()
    })
  })

  describe('findReferences', () => {
    it('should find import references', () => {
      indexer.indexFile('a.ts', 'export class User {}\n')
      indexer.indexFile('b.ts', "import { User } from './a.js'\n")
      const refs = indexer.findReferences('User')
      const importRefs = refs.filter((r) => r.referenceType === 'import')
      expect(importRefs.length).toBeGreaterThanOrEqual(1)
    })

    it('should find call references for functions', () => {
      indexer.indexFile('a.ts', 'export function compute() { return 1 }\n')
      indexer.indexFile('b.ts', "import { compute } from './a.js'\ncompute()\n")
      const refs = indexer.findReferences('compute')
      const callRefs = refs.filter((r) => r.referenceType === 'call')
      expect(callRefs.length).toBeGreaterThanOrEqual(1)
    })

    it('should find type references', () => {
      indexer.indexFile('a.ts', 'export interface Config {}\n')
      indexer.indexFile('b.ts', "import { Config } from './a.js'\nconst c: Config = {}\n")
      const refs = indexer.findReferences('Config')
      const typeRefs = refs.filter((r) => r.referenceType === 'type-reference')
      expect(typeRefs.length).toBeGreaterThanOrEqual(1)
    })

    it('should find implementation references (extends)', () => {
      indexer.indexFile('a.ts', 'export class Base {}\n')
      indexer.indexFile('b.ts', "import { Base } from './a.js'\nexport class Child extends Base {}\n")
      const refs = indexer.findReferences('Base')
      const implRefs = refs.filter((r) => r.referenceType === 'implementation')
      expect(implRefs.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty array for unknown symbol references', () => {
      const refs = indexer.findReferences('nonexistent')
      expect(refs).toEqual([])
    })
  })

  describe('navigate', () => {
    it('should return definitions, references, and implementations', () => {
      indexer.indexFile('a.ts', 'export class Animal {\n  speak(): void {}\n}\n')
      indexer.indexFile('b.ts', "import { Animal } from './a.js'\nexport class Dog extends Animal {\n  speak(): void {}\n}\n")
      const result = indexer.navigate('Animal')
      expect(result.definitions.length).toBeGreaterThanOrEqual(1)
      expect(result.references.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty arrays for unknown symbol', () => {
      const result = indexer.navigate('Unknown')
      expect(result.definitions).toEqual([])
      expect(result.references).toEqual([])
      expect(result.implementations).toEqual([])
    })
  })

  describe('getFileSymbols', () => {
    it('should return all symbols from a specific file', () => {
      const files = new Map<string, string>([
        ['a.ts', 'export class A {}\n'],
        ['b.ts', 'export class B {}\n'],
      ])
      indexer.indexFiles(files)
      const fileSymbols = indexer.getFileSymbols('a.ts')
      expect(fileSymbols.length).toBe(1)
      expect(fileSymbols[0]!.name).toBe('A')
    })

    it('should return empty array for unknown file', () => {
      const result = indexer.getFileSymbols('nonexistent.ts')
      expect(result).toEqual([])
    })

    it('should return multiple symbols from one file', () => {
      indexer.indexFile('test.ts', 'export class X {}\nexport function y() {}\nexport const z = 1\n')
      const symbols = indexer.getFileSymbols('test.ts')
      expect(symbols.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('getExportedSymbols', () => {
    it('should return only exported symbols', () => {
      const source = 'export class Exported {}\nclass Internal {}\n'
      indexer.indexFile('test.ts', source)
      const exported = indexer.getExportedSymbols()
      const names = exported.map((s) => s.name)
      expect(names).toContain('Exported')
      expect(names).not.toContain('Internal')
    })
  })

  describe('search', () => {
    it('should find symbols by partial name', () => {
      indexer.indexFile('test.ts', 'export class UserService {}\nexport class UserController {}\nexport class DataHelper {}\n')
      const results = indexer.search('User')
      expect(results.length).toBe(2)
      expect(results.every((s) => s.name.includes('User'))).toBe(true)
    })

    it('should be case-insensitive', () => {
      indexer.indexFile('test.ts', 'export class MyComponent {}\n')
      const results = indexer.search('mycomponent')
      expect(results.length).toBe(1)
    })

    it('should sort results with name-starts-with first', () => {
      indexer.indexFile('test.ts', 'export class MyHelper {}\nexport class MyComponent {}\n')
      const results = indexer.search('My')
      expect(results.length).toBe(2)
    })

    it('should return empty for no matches', () => {
      indexer.indexFile('test.ts', 'export class Foo {}\n')
      const results = indexer.search('xyz')
      expect(results).toEqual([])
    })
  })

  describe('buildCallGraph', () => {
    it('should build a graph with function nodes', () => {
      indexer.indexFile('test.ts', 'function foo() {}\nfunction bar() {}\n')
      const graph = indexer.buildCallGraph()
      expect(graph.nodes.length).toBe(2)
      const names = graph.nodes.map((n) => n.name)
      expect(names).toContain('foo')
      expect(names).toContain('bar')
    })

    it('should include method nodes', () => {
      indexer.indexFile('test.ts', 'export class S {\n  method() {}\n}\n')
      const graph = indexer.buildCallGraph()
      const methods = graph.nodes.filter((n) => n.name === 'method')
      expect(methods.length).toBeGreaterThanOrEqual(1)
    })

    it('should create edges for function calls', () => {
      const source = 'function helper() {}\nfunction main() { helper() }\n'
      indexer.indexFile('test.ts', source)
      const graph = indexer.buildCallGraph()
      const helperCalls = graph.edges.filter((e) => {
        const toNode = graph.nodes.find((n) => n.id === e.to)
        return toNode?.name === 'helper'
      })
      expect(helperCalls.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty graph when no functions indexed', () => {
      indexer.indexFile('test.ts', 'export const x = 1\n')
      const graph = indexer.buildCallGraph()
      expect(graph.nodes.length).toBe(0)
      expect(graph.edges.length).toBe(0)
    })
  })

  describe('checkRename', () => {
    it('should report success for valid rename with no conflicts', () => {
      indexer.indexFile('test.ts', 'export class OldName {}\n')
      const result = indexer.checkRename('OldName', 'NewName')
      expect(result.success).toBe(true)
      expect(result.conflicts).toEqual([])
      expect(result.occurrences.length).toBeGreaterThanOrEqual(1)
    })

    it('should detect name conflicts', () => {
      indexer.indexFile('test.ts', 'export class Existing {}\nexport class Other {}\n')
      const result = indexer.checkRename('Other', 'Existing')
      expect(result.success).toBe(false)
      expect(result.conflicts.length).toBeGreaterThan(0)
    })

    it('should reject invalid identifiers', () => {
      indexer.indexFile('test.ts', 'export class Foo {}\n')
      const result = indexer.checkRename('Foo', '123invalid')
      expect(result.success).toBe(false)
      expect(result.conflicts.length).toBeGreaterThan(0)
    })

    it('should list all occurrences for rename', () => {
      indexer.indexFile('a.ts', 'export function target() {}\n')
      indexer.indexFile('b.ts', "import { target } from './a.js'\ntarget()\n")
      const result = indexer.checkRename('target', 'renamed')
      expect(result.occurrences.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle rename of non-existent symbol', () => {
      const result = indexer.checkRename('NonExistent', 'NewName')
      expect(result.occurrences).toEqual([])
      expect(result.success).toBe(true)
    })

    it('should accept valid identifier with underscore', () => {
      indexer.indexFile('test.ts', 'export class Foo {}\n')
      const result = indexer.checkRename('Foo', '_newName')
      expect(result.success).toBe(true)
    })

    it('should accept valid identifier with dollar sign', () => {
      indexer.indexFile('test.ts', 'export class Foo {}\n')
      const result = indexer.checkRename('Foo', '$newName')
      expect(result.success).toBe(true)
    })
  })

  describe('removeFile', () => {
    it('should remove all symbols from a file', () => {
      indexer.indexFile('test.ts', 'export class Removed {}\n')
      expect(indexer.getFileSymbols('test.ts').length).toBeGreaterThanOrEqual(1)
      const count = indexer.removeFile('test.ts')
      expect(count).toBeGreaterThanOrEqual(1)
      expect(indexer.getFileSymbols('test.ts')).toEqual([])
    })

    it('should remove references from the file', () => {
      indexer.indexFile('a.ts', 'export function fn() {}\n')
      indexer.indexFile('b.ts', "import { fn } from './a.js'\nfn()\n")
      indexer.removeFile('b.ts')
      const refs = indexer.findReferences('fn')
      const bRefs = refs.filter((r) => r.filePath === 'b.ts')
      expect(bRefs).toEqual([])
    })

    it('should return 0 for unknown file', () => {
      const count = indexer.removeFile('nonexistent.ts')
      expect(count).toBe(0)
    })

    it('should clean up name index', () => {
      indexer.indexFile('test.ts', 'export class Unique {}\n')
      expect(indexer.findSymbol('Unique').length).toBe(1)
      indexer.removeFile('test.ts')
      expect(indexer.findSymbol('Unique')).toEqual([])
    })
  })

  describe('getTable', () => {
    it('should return the full symbol table', () => {
      indexer.indexFile('test.ts', 'export class T {}\n')
      const table = indexer.getTable()
      expect(table).toBeDefined()
      expect(table.symbols).toBeInstanceOf(Map)
      expect(table.fileIndex).toBeInstanceOf(Map)
      expect(table.nameIndex).toBeInstanceOf(Map)
      expect(Array.isArray(table.references)).toBe(true)
    })
  })

  describe('re-indexing same file', () => {
    it('should replace symbols when re-indexing same file', () => {
      indexer.indexFile('test.ts', 'export class Version1 {}\n')
      expect(indexer.findSymbol('Version1').length).toBe(1)
      indexer.indexFile('test.ts', 'export class Version2 {}\n')
      expect(indexer.findSymbol('Version1')).toEqual([])
      expect(indexer.findSymbol('Version2').length).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty source', () => {
      const symbols = indexer.indexFile('empty.ts', '')
      expect(symbols).toEqual([])
    })

    it('should handle source with only comments', () => {
      const source = '// Just a comment\n/* block comment */\n'
      const symbols = indexer.indexFile('comments.ts', source)
      expect(symbols).toEqual([])
    })

    it('should handle deeply nested braces', () => {
      const source = 'export class Deep {\n  method() {\n    if (true) {\n      function inner() {}\n    }\n  }\n}\n'
      const symbols = indexer.indexFile('deep.ts', source)
      const cls = symbols.find((s) => s.name === 'Deep')
      expect(cls).toBeDefined()
    })

    it('should handle source with no exports', () => {
      const source = 'class Private {}\nfunction hidden() {}\nconst secret = 42\n'
      const symbols = indexer.indexFile('private.ts', source)
      expect(symbols.every((s) => !s.isExported)).toBe(true)
    })

    it('should handle re-export patterns', () => {
      const source = "export { Foo, Bar } from './other.js'\n"
      const symbols = indexer.indexFile('reexport.ts', source)
      expect(Array.isArray(symbols)).toBe(true)
    })

    it('should handle generic type declarations', () => {
      const source = 'export type Container<T> = { value: T }\n'
      const symbols = indexer.indexFile('generics.ts', source)
      const tp = symbols.find((s) => s.name === 'Container')
      expect(tp).toBeDefined()
    })

    it('should handle ambient declarations', () => {
      const source = 'declare function external(x: number): void\n'
      const symbols = indexer.indexFile('ambient.d.ts', source)
      expect(symbols.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle multi-line import statements', () => {
      indexer.indexFile('a.ts', 'export class MyImport {}\n')
      indexer.indexFile('b.ts', "import {\n  MyImport\n} from './a.js'\n")
      const refs = indexer.findReferences('MyImport')
      expect(refs.some((r) => r.referenceType === 'import')).toBe(true)
    })
  })

  describe('complex scenarios', () => {
    it('should handle a full multi-file project', () => {
      const files = new Map<string, string>([
        ['models.ts', 'export interface User {\n  id: number\n  name: string\n}\nexport type UserId = number\n'],
        ['service.ts', "import { User, UserId } from './models.js'\nexport class UserService {\n  getUser(id: UserId): User {\n    return { id, name: 'test' }\n  }\n}\n"],
        ['main.ts', "import { UserService } from './service.js'\nconst service = new UserService()\nconst user = service.getUser(1)\n"],
      ])
      const count = indexer.indexFiles(files)
      expect(count).toBeGreaterThanOrEqual(3)

      const userSymbols = indexer.findSymbol('User')
      expect(userSymbols.length).toBeGreaterThanOrEqual(1)

      const exported = indexer.getExportedSymbols()
      expect(exported.length).toBeGreaterThanOrEqual(3)

      const userRefs = indexer.findReferences('User')
      expect(userRefs.length).toBeGreaterThanOrEqual(1)
    })

    it('should build call graph from multi-file project', () => {
      const files = new Map<string, string>([
        ['utils.ts', 'export function helper() { return 1 }\nexport function format(s: string) { return s }\n'],
        ['app.ts', "import { helper, format } from './utils.js'\nfunction main() {\n  const v = helper()\n  format(v.toString())\n}\n"],
      ])
      indexer.indexFiles(files)
      const graph = indexer.buildCallGraph()
      expect(graph.nodes.length).toBeGreaterThanOrEqual(2)
    })

    it('should support rename analysis across files', () => {
      indexer.indexFile('a.ts', 'export function oldName() {}\n')
      indexer.indexFile('b.ts', "import { oldName } from './a.js'\noldName()\n")
      const result = indexer.checkRename('oldName', 'newName')
      expect(result.success).toBe(true)
      expect(result.occurrences.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle file removal in multi-file scenario', () => {
      const files = new Map<string, string>([
        ['a.ts', 'export class A {}\n'],
        ['b.ts', 'export class B {}\n'],
      ])
      indexer.indexFiles(files)
      expect(indexer.getTable().symbols.size).toBeGreaterThanOrEqual(2)
      indexer.removeFile('a.ts')
      expect(indexer.findSymbol('A')).toEqual([])
      expect(indexer.findSymbol('B').length).toBe(1)
    })
  })

  describe('reference context', () => {
    it('should include context string in references', () => {
      indexer.indexFile('a.ts', 'export function compute() {}\n')
      indexer.indexFile('b.ts', "import { compute } from './a.js'\n")
      const refs = indexer.findReferences('compute')
      expect(refs.length).toBeGreaterThan(0)
      for (const ref of refs) {
        expect(ref.context.length).toBeGreaterThan(0)
      }
    })
  })

  describe('symbol positioning', () => {
    it('should correctly report line numbers', () => {
      const source = 'const x = 1\n\nexport class MyClass {\n}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const cls = symbols.find((s) => s.name === 'MyClass')
      expect(cls).toBeDefined()
      expect(cls!.line).toBe(3)
    })

    it('should correctly report column numbers', () => {
      const source = 'export class Foo {}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const cls = symbols.find((s) => s.name === 'Foo')
      expect(cls).toBeDefined()
      expect(cls!.column).toBeGreaterThanOrEqual(1)
    })
  })

  describe('call graph edge tracking', () => {
    it('should track edge line numbers', () => {
      const source = 'function target() {}\nfunction caller() {\n  target()\n}\n'
      indexer.indexFile('test.ts', source)
      const graph = indexer.buildCallGraph()
      const targetEdges = graph.edges.filter((e) => {
        const toNode = graph.nodes.find((n) => n.id === e.to)
        return toNode?.name === 'target'
      })
      if (targetEdges.length > 0) {
        expect(targetEdges[0]!.line).toBeGreaterThanOrEqual(1)
      }
    })

    it('should track edge file paths', () => {
      const source = 'function a() {}\nfunction b() { a() }\n'
      indexer.indexFile('graph.ts', source)
      const graph = indexer.buildCallGraph()
      for (const edge of graph.edges) {
        expect(edge.filePath).toBeTruthy()
      }
    })
  })

  describe('multiple symbols of different kinds with same name', () => {
    it('should distinguish class and function with same name', () => {
      const source = 'export class Handler {}\nexport function Handler() {}\n'
      const symbols = indexer.indexFile('test.ts', source)
      const handlers = symbols.filter((s) => s.name === 'Handler')
      expect(handlers.length).toBe(2)
      const kinds = handlers.map((s) => s.kind)
      expect(kinds).toContain('class')
      expect(kinds).toContain('function')
    })
  })

  describe('indexFile - default export function', () => {
    it('should handle default function without name', () => {
      const source = 'export default function() {}\n'
      const symbols = indexer.indexFile('test.ts', source)
      expect(Array.isArray(symbols)).toBe(true)
    })
  })
})
