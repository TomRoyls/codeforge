import { SymbolIndexer } from '../src/core/intelligence/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('SymbolIndexer', () => {
  describe('constructor', () => {
    it('creates an empty indexer', () => {
      const indexer = new SymbolIndexer()
      expect(indexer.getTable().symbols.size).toBe(0)
    })
  })

  // ─── indexFile ──────────────────────────────────────────────────────────

  describe('indexFile', () => {
    it('extracts exported functions', () => {
      const indexer = new SymbolIndexer()
      const symbols = indexer.indexFile('test.ts', 'export function hello() {}')
      expect(symbols.length).toBeGreaterThan(0)
      const fn = symbols.find((s) => s.name === 'hello')
      expect(fn).toBeDefined()
      expect(fn!.kind).toBe('function')
      expect(fn!.isExported).toBe(true)
    })

    it('extracts exported classes', () => {
      const indexer = new SymbolIndexer()
      const symbols = indexer.indexFile('test.ts', 'export class Foo {}')
      const cls = symbols.find((s) => s.name === 'Foo')
      expect(cls).toBeDefined()
      expect(cls!.kind).toBe('class')
      expect(cls!.isExported).toBe(true)
    })

    it('extracts interfaces', () => {
      const indexer = new SymbolIndexer()
      const symbols = indexer.indexFile('test.ts', 'export interface Bar { x: number }')
      const iface = symbols.find((s) => s.name === 'Bar')
      expect(iface).toBeDefined()
      expect(iface!.kind).toBe('interface')
    })

    it('extracts type aliases', () => {
      const indexer = new SymbolIndexer()
      const symbols = indexer.indexFile('test.ts', 'export type MyType = string | number')
      const ta = symbols.find((s) => s.name === 'MyType')
      expect(ta).toBeDefined()
      expect(ta!.kind).toBe('type')
    })

    it('extracts const declarations', () => {
      const indexer = new SymbolIndexer()
      const symbols = indexer.indexFile('test.ts', 'export const MAX = 100')
      const c = symbols.find((s) => s.name === 'MAX')
      expect(c).toBeDefined()
      expect(c!.kind).toBe('const')
    })

    it('returns empty for empty source', () => {
      const indexer = new SymbolIndexer()
      expect(indexer.indexFile('empty.ts', '')).toEqual([])
    })

    it('re-indexing replaces old symbols', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('a.ts', 'export function foo() {}')
      indexer.indexFile('a.ts', 'export function bar() {}')
      const syms = indexer.findSymbol('foo')
      expect(syms.length).toBe(0)
      expect(indexer.findSymbol('bar').length).toBe(1)
    })
  })

  // ─── findSymbol / getSymbol ─────────────────────────────────────────────

  describe('findSymbol and getSymbol', () => {
    it('finds symbols by name', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'function myFunc() {}')
      const found = indexer.findSymbol('myFunc')
      expect(found.length).toBe(1)
      expect(found[0]!.name).toBe('myFunc')
    })

    it('returns empty for unknown name', () => {
      const indexer = new SymbolIndexer()
      expect(indexer.findSymbol('nonexistent')).toEqual([])
    })

    it('getSymbol returns symbol by id', () => {
      const indexer = new SymbolIndexer()
      const syms = indexer.indexFile('f.ts', 'function abc() {}')
      const id = syms[0]!.id
      expect(indexer.getSymbol(id)?.name).toBe('abc')
    })

    it('getSymbol returns null for unknown id', () => {
      const indexer = new SymbolIndexer()
      expect(indexer.getSymbol('nope')).toBeNull()
    })
  })

  // ─── findDefinition / findReferences ────────────────────────────────────

  describe('findDefinition and findReferences', () => {
    it('finds definition with references', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'function greet() {}\ngreet()')
      const def = indexer.findDefinition('greet')
      expect(def).not.toBeNull()
      expect(def!.symbol.name).toBe('greet')
    })

    it('finds references for a symbol', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'function greet() {}\ngreet()')
      const refs = indexer.findReferences('greet')
      expect(refs.length).toBeGreaterThan(0)
    })

    it('returns null when no definition found', () => {
      const indexer = new SymbolIndexer()
      expect(indexer.findDefinition('missing')).toBeNull()
    })
  })

  // ─── search ─────────────────────────────────────────────────────────────

  describe('search', () => {
    it('searches symbols case-insensitively', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'export function MyFunction() {}')
      const results = indexer.search('myfunction')
      expect(results.length).toBe(1)
    })

    it('prioritizes startsWith matches', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'export function abcHandler() {}\nexport function handler() {}')
      const results = indexer.search('handler')
      expect(results[0]!.name).toBe('handler')
    })
  })

  // ─── getFileSymbols / getExportedSymbols ────────────────────────────────

  describe('getFileSymbols and getExportedSymbols', () => {
    it('gets symbols for specific file', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('a.ts', 'function a1() {}')
      indexer.indexFile('b.ts', 'function b1() {}')
      expect(indexer.getFileSymbols('a.ts').length).toBe(1)
      expect(indexer.getFileSymbols('a.ts')[0]!.name).toBe('a1')
    })

    it('gets only exported symbols', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'export function pub() {}\nfunction priv() {}')
      const exported = indexer.getExportedSymbols()
      expect(exported.length).toBe(1)
      expect(exported[0]!.name).toBe('pub')
    })
  })

  // ─── removeFile / reset ─────────────────────────────────────────────────

  describe('removeFile and reset', () => {
    it('removes symbols for a file', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'function x() {}')
      const count = indexer.removeFile('f.ts')
      expect(count).toBe(1)
      expect(indexer.findSymbol('x').length).toBe(0)
    })

    it('returns 0 for unknown file', () => {
      const indexer = new SymbolIndexer()
      expect(indexer.removeFile('missing.ts')).toBe(0)
    })

    it('reset clears all data', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'function x() {}')
      indexer.reset()
      expect(indexer.getTable().symbols.size).toBe(0)
    })
  })

  // ─── checkRename ────────────────────────────────────────────────────────

  describe('checkRename', () => {
    it('reports conflicts for existing name', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'function foo() {}\nfunction bar() {}')
      const result = indexer.checkRename('foo', 'bar')
      expect(result.success).toBe(false)
    })

    it('reports invalid identifier', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'function foo() {}')
      const result = indexer.checkRename('foo', '123bad')
      expect(result.success).toBe(false)
    })

    it('succeeds for valid rename', () => {
      const indexer = new SymbolIndexer()
      indexer.indexFile('f.ts', 'function foo() {}')
      const result = indexer.checkRename('foo', 'baz')
      expect(result.success).toBe(true)
    })
  })

  // ─── indexFiles ─────────────────────────────────────────────────────────

  describe('indexFiles', () => {
    it('indexes multiple files', () => {
      const indexer = new SymbolIndexer()
      const count = indexer.indexFiles(new Map([
        ['a.ts', 'function fa() {}'],
        ['b.ts', 'function fb() {}'],
      ]))
      expect(count).toBe(2)
    })
  })
})
