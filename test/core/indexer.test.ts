import { describe, it, expect } from 'vitest'
import { SymbolIndex } from '../../src/core/indexer/symbol-index.js'
import { FileIndex } from '../../src/core/indexer/file-index.js'
import { SearchEngine } from '../../src/core/indexer/search-engine.js'
import type { SymbolEntry, SearchOptions } from '../../src/core/indexer/types.js'

function makeSymbol(overrides: Partial<SymbolEntry> = {}): SymbolEntry {
  return {
    name: 'testFunc',
    kind: 'function',
    filePath: 'src/test.ts',
    line: 1,
    column: 0,
    exported: true,
    children: [],
    ...overrides,
  }
}

describe('SymbolIndex', () => {
  describe('addSymbol', () => {
    it('should add a symbol to the index', () => {
      const idx = new SymbolIndex()
      const sym = makeSymbol({ name: 'hello' })
      idx.addSymbol(sym)
      expect(idx.lookup('hello')).toHaveLength(1)
      expect(idx.lookup('hello')[0]).toEqual(sym)
    })

    it('should add multiple symbols with the same name', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'foo', filePath: 'a.ts' }))
      idx.addSymbol(makeSymbol({ name: 'foo', filePath: 'b.ts' }))
      expect(idx.lookup('foo')).toHaveLength(2)
    })

    it('should recursively add child symbols', () => {
      const idx = new SymbolIndex()
      const child: SymbolEntry = {
        name: 'childMethod',
        kind: 'function',
        filePath: 'src/test.ts',
        line: 5,
        column: 2,
        exported: false,
        children: [],
      }
      idx.addSymbol(makeSymbol({ name: 'MyClass', kind: 'class', children: [child] }))
      expect(idx.lookup('childMethod')).toHaveLength(1)
      expect(idx.lookup('MyClass')).toHaveLength(1)
    })

    it('should track symbols by file path', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'a', filePath: 'x.ts' }))
      idx.addSymbol(makeSymbol({ name: 'b', filePath: 'y.ts' }))
      idx.addSymbol(makeSymbol({ name: 'c', filePath: 'x.ts' }))
      const stats = idx.getStats()
      expect(stats.totalFiles).toBe(2)
    })
  })

  describe('removeSymbolsForFile', () => {
    it('should remove all symbols for a given file', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'a', filePath: 'x.ts' }))
      idx.addSymbol(makeSymbol({ name: 'b', filePath: 'y.ts' }))
      idx.addSymbol(makeSymbol({ name: 'c', filePath: 'x.ts' }))
      idx.removeSymbolsForFile('x.ts')
      expect(idx.lookup('a')).toHaveLength(0)
      expect(idx.lookup('c')).toHaveLength(0)
      expect(idx.lookup('b')).toHaveLength(1)
    })

    it('should handle removing non-existent file', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'a', filePath: 'x.ts' }))
      idx.removeSymbolsForFile('z.ts')
      expect(idx.lookup('a')).toHaveLength(1)
    })

    it('should handle removing symbols that exist in multiple files', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'shared', filePath: 'a.ts' }))
      idx.addSymbol(makeSymbol({ name: 'shared', filePath: 'b.ts' }))
      idx.removeSymbolsForFile('a.ts')
      const results = idx.lookup('shared')
      expect(results).toHaveLength(1)
      expect(results[0]!.filePath).toBe('b.ts')
    })

    it('should clean up empty name entries', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'only', filePath: 'unique.ts' }))
      idx.removeSymbolsForFile('unique.ts')
      expect(idx.getAll()).toHaveLength(0)
    })
  })

  describe('lookup', () => {
    it('should return empty array for non-existent name', () => {
      const idx = new SymbolIndex()
      expect(idx.lookup('nope')).toEqual([])
    })

    it('should return matching symbols', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'findMe' }))
      idx.addSymbol(makeSymbol({ name: 'other' }))
      expect(idx.lookup('findMe')).toHaveLength(1)
    })

    it('should be case-sensitive', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'MyFunc' }))
      expect(idx.lookup('myfunc')).toHaveLength(0)
      expect(idx.lookup('MyFunc')).toHaveLength(1)
    })
  })

  describe('lookupByKind', () => {
    it('should return symbols of a specific kind', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'fn1', kind: 'function' }))
      idx.addSymbol(makeSymbol({ name: 'cls1', kind: 'class' }))
      idx.addSymbol(makeSymbol({ name: 'fn2', kind: 'function' }))
      expect(idx.lookupByKind('function')).toHaveLength(2)
      expect(idx.lookupByKind('class')).toHaveLength(1)
    })

    it('should return empty array for kind with no symbols', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ kind: 'function' }))
      expect(idx.lookupByKind('enum')).toEqual([])
    })

    it('should return all kinds when requested', () => {
      const idx = new SymbolIndex()
      const kinds: SymbolEntry['kind'][] = ['function', 'class', 'interface', 'type', 'variable', 'const', 'enum']
      for (const kind of kinds) {
        idx.addSymbol(makeSymbol({ name: `sym_${kind}`, kind }))
      }
      for (const kind of kinds) {
        expect(idx.lookupByKind(kind)).toHaveLength(1)
      }
    })
  })

  describe('getAll', () => {
    it('should return all symbols', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'a' }))
      idx.addSymbol(makeSymbol({ name: 'b' }))
      idx.addSymbol(makeSymbol({ name: 'c' }))
      expect(idx.getAll()).toHaveLength(3)
    })

    it('should return empty array when index is empty', () => {
      const idx = new SymbolIndex()
      expect(idx.getAll()).toEqual([])
    })

    it('should include duplicate names from different files', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'dup', filePath: 'a.ts' }))
      idx.addSymbol(makeSymbol({ name: 'dup', filePath: 'b.ts' }))
      expect(idx.getAll()).toHaveLength(2)
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty index', () => {
      const idx = new SymbolIndex()
      const stats = idx.getStats()
      expect(stats.totalFiles).toBe(0)
      expect(stats.totalSymbols).toBe(0)
      expect(stats.indexSize).toBe(0)
      expect(stats.lastUpdated).toBe(0)
    })

    it('should count total files and symbols', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'a', filePath: 'f1.ts', kind: 'function' }))
      idx.addSymbol(makeSymbol({ name: 'b', filePath: 'f2.ts', kind: 'class' }))
      idx.addSymbol(makeSymbol({ name: 'c', filePath: 'f1.ts', kind: 'function' }))
      const stats = idx.getStats()
      expect(stats.totalFiles).toBe(2)
      expect(stats.totalSymbols).toBe(3)
      expect(stats.indexSize).toBe(3)
    })

    it('should track symbols by kind', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'a', kind: 'function' }))
      idx.addSymbol(makeSymbol({ name: 'b', kind: 'function' }))
      idx.addSymbol(makeSymbol({ name: 'c', kind: 'class' }))
      const stats = idx.getStats()
      expect(stats.byKind.get('function')).toBe(2)
      expect(stats.byKind.get('class')).toBe(1)
    })

    it('should update lastUpdated timestamp', () => {
      const idx = new SymbolIndex()
      const before = Date.now()
      idx.addSymbol(makeSymbol())
      const after = Date.now()
      const stats = idx.getStats()
      expect(stats.lastUpdated).toBeGreaterThanOrEqual(before)
      expect(stats.lastUpdated).toBeLessThanOrEqual(after)
    })
  })

  describe('clear', () => {
    it('should remove all symbols', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'a' }))
      idx.addSymbol(makeSymbol({ name: 'b' }))
      idx.clear()
      expect(idx.getAll()).toHaveLength(0)
      expect(idx.getStats().totalFiles).toBe(0)
    })

    it('should reset lastUpdated', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol())
      idx.clear()
      expect(idx.getStats().lastUpdated).toBe(0)
    })

    it('should allow adding symbols after clear', () => {
      const idx = new SymbolIndex()
      idx.addSymbol(makeSymbol({ name: 'before' }))
      idx.clear()
      idx.addSymbol(makeSymbol({ name: 'after' }))
      expect(idx.lookup('after')).toHaveLength(1)
      expect(idx.lookup('before')).toHaveLength(0)
    })
  })
})

describe('FileIndex', () => {
  describe('indexFile', () => {
    it('should index a TypeScript file with functions', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/test.ts', 'export function hello() {}\nfunction world() {}')
      expect(result.filePath).toBe('src/test.ts')
      expect(result.language).toBe('typescript')
      expect(result.symbols).toHaveLength(2)
      expect(result.symbols[0]!.name).toBe('hello')
      expect(result.symbols[0]!.exported).toBe(true)
      expect(result.symbols[1]!.name).toBe('world')
      expect(result.symbols[1]!.exported).toBe(false)
    })

    it('should index classes', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/cls.ts', 'export class MyClass {\n  doThing() {}\n}')
      const cls = result.symbols.find((s) => s.kind === 'class')
      expect(cls).toBeDefined()
      expect(cls!.name).toBe('MyClass')
      expect(cls!.exported).toBe(true)
    })

    it('should index interfaces', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/types.ts', 'export interface Config {\n  name: string\n}')
      const iface = result.symbols.find((s) => s.kind === 'interface')
      expect(iface).toBeDefined()
      expect(iface!.name).toBe('Config')
    })

    it('should index type aliases', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/types.ts', 'export type Result<T> = { value: T }')
      const typeAlias = result.symbols.find((s) => s.kind === 'type')
      expect(typeAlias).toBeDefined()
      expect(typeAlias!.name).toBe('Result')
    })

    it('should index enums', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/enums.ts', 'export enum Color { Red, Green }')
      const en = result.symbols.find((s) => s.kind === 'enum')
      expect(en).toBeDefined()
      expect(en!.name).toBe('Color')
    })

    it('should index const declarations', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/const.ts', 'export const PI = 3.14\nconst secret = 42')
      expect(result.symbols.filter((s) => s.kind === 'const')).toHaveLength(2)
    })

    it('should detect arrow function consts as function kind', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/arrow.ts', 'const add = (a: number) => a + 1')
      const sym = result.symbols.find((s) => s.name === 'add')
      expect(sym).toBeDefined()
      expect(sym!.kind).toBe('function')
    })

    it('should index let and var declarations', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/vars.ts', 'let count = 0\nvar name = "test"')
      expect(result.symbols.filter((s) => s.kind === 'variable')).toHaveLength(2)
    })

    it('should extract imports', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/imp.ts', "import { foo } from 'bar'\nimport baz from './qux'")
      expect(result.imports).toContain('bar')
      expect(result.imports).toContain('./qux')
    })

    it('should extract dynamic imports', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/dyn.ts', "const mod = import('./module')")
      expect(result.imports).toContain('./module')
    })

    it('should extract named exports', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/exp.ts', 'export function foo() {}\nexport class Bar {}')
      expect(result.exports).toContain('foo')
      expect(result.exports).toContain('Bar')
    })

    it('should extract re-exports', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/reexp.ts', "export { a, b as c } from './other'")
      expect(result.exports).toContain('c')
    })

    it('should extract star exports', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/star.ts', "export * from './utils'")
      expect(result.exports).toContain('*:./utils')
    })

    it('should compute file size', () => {
      const fi = new FileIndex()
      const source = 'const x = 1'
      const result = fi.indexFile('src/size.ts', source)
      expect(result.size).toBe(source.length)
    })

    it('should detect language from file extension', () => {
      const fi = new FileIndex()
      expect(fi.indexFile('a.ts', '').language).toBe('typescript')
      expect(fi.indexFile('a.tsx', '').language).toBe('typescript')
      expect(fi.indexFile('a.js', '').language).toBe('javascript')
      expect(fi.indexFile('a.jsx', '').language).toBe('javascript')
      expect(fi.indexFile('a.mjs', '').language).toBe('javascript')
      expect(fi.indexFile('a.py', '').language).toBe('py')
    })

    it('should set lastModified timestamp', () => {
      const fi = new FileIndex()
      const before = Date.now()
      const result = fi.indexFile('src/time.ts', '')
      const after = Date.now()
      expect(result.lastModified).toBeGreaterThanOrEqual(before)
      expect(result.lastModified).toBeLessThanOrEqual(after)
    })

    it('should handle empty source', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/empty.ts', '')
      expect(result.symbols).toHaveLength(0)
      expect(result.imports).toHaveLength(0)
      expect(result.exports).toHaveLength(0)
    })

    it('should handle async functions', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/async.ts', 'async function fetchData() {}')
      expect(result.symbols[0]!.name).toBe('fetchData')
      expect(result.symbols[0]!.kind).toBe('function')
    })

    it('should index abstract classes', () => {
      const fi = new FileIndex()
      const result = fi.indexFile('src/abstract.ts', 'export abstract class Base {}')
      const cls = result.symbols.find((s) => s.kind === 'class')
      expect(cls).toBeDefined()
      expect(cls!.name).toBe('Base')
    })

    it('should record correct line numbers', () => {
      const fi = new FileIndex()
      const source = '\n\nfunction foo() {}'
      const result = fi.indexFile('src/lines.ts', source)
      expect(result.symbols[0]!.line).toBe(3)
    })
  })

  describe('computeHash', () => {
    it('should produce consistent hashes', () => {
      const fi = new FileIndex()
      const h1 = fi.computeHash('hello world')
      const h2 = fi.computeHash('hello world')
      expect(h1).toBe(h2)
    })

    it('should produce different hashes for different content', () => {
      const fi = new FileIndex()
      const h1 = fi.computeHash('hello')
      const h2 = fi.computeHash('world')
      expect(h1).not.toBe(h2)
    })

    it('should hash empty string', () => {
      const fi = new FileIndex()
      const h = fi.computeHash('')
      expect(h).toBeDefined()
      expect(typeof h).toBe('string')
      expect(h.length).toBe(8)
    })

    it('should produce 8-char hex string', () => {
      const fi = new FileIndex()
      const h = fi.computeHash('test content here')
      expect(h).toMatch(/^[0-9a-f]{8}$/)
    })
  })

  describe('removeFile', () => {
    it('should remove an indexed file', () => {
      const fi = new FileIndex()
      fi.indexFile('src/a.ts', 'function a() {}')
      expect(fi.removeFile('src/a.ts')).toBe(true)
      expect(fi.getFile('src/a.ts')).toBeNull()
    })

    it('should return false for non-existent file', () => {
      const fi = new FileIndex()
      expect(fi.removeFile('nope.ts')).toBe(false)
    })
  })

  describe('getFile', () => {
    it('should return indexed file', () => {
      const fi = new FileIndex()
      fi.indexFile('src/a.ts', 'const x = 1')
      const file = fi.getFile('src/a.ts')
      expect(file).not.toBeNull()
      expect(file!.filePath).toBe('src/a.ts')
    })

    it('should return null for non-existent file', () => {
      const fi = new FileIndex()
      expect(fi.getFile('nope.ts')).toBeNull()
    })

    it('should return updated file after re-indexing', () => {
      const fi = new FileIndex()
      fi.indexFile('src/a.ts', 'const x = 1')
      fi.indexFile('src/a.ts', 'const x = 1\nconst y = 2')
      const file = fi.getFile('src/a.ts')
      expect(file!.size).toBe('const x = 1\nconst y = 2'.length)
    })
  })

  describe('getAllFiles', () => {
    it('should return all indexed files', () => {
      const fi = new FileIndex()
      fi.indexFile('src/a.ts', '')
      fi.indexFile('src/b.ts', '')
      expect(fi.getAllFiles()).toHaveLength(2)
    })

    it('should return empty array when no files indexed', () => {
      const fi = new FileIndex()
      expect(fi.getAllFiles()).toEqual([])
    })
  })

  describe('getModifiedSince', () => {
    it('should return files modified after timestamp', () => {
      const fi = new FileIndex()
      const before = Date.now() - 1000
      fi.indexFile('src/a.ts', '')
      const modified = fi.getModifiedSince(before)
      expect(modified).toHaveLength(1)
    })

    it('should return empty array when nothing modified', () => {
      const fi = new FileIndex()
      fi.indexFile('src/a.ts', '')
      const after = Date.now() + 10000
      expect(fi.getModifiedSince(after)).toHaveLength(0)
    })

    it('should only return files modified after the timestamp', async () => {
      const fi = new FileIndex()
      fi.indexFile('src/old.ts', '')
      await new Promise((r) => setTimeout(r, 10))
      const t2 = Date.now()
      fi.indexFile('src/new.ts', '')
      const recent = fi.getModifiedSince(t2)
      expect(recent).toHaveLength(1)
      expect(recent[0]!.filePath).toBe('src/new.ts')
    })
  })
})

describe('SearchEngine', () => {
  const defaultOptions: SearchOptions = {
    fuzzy: false,
    maxResults: 100,
    caseSensitive: false,
  }

  describe('searchInSource', () => {
    it('should find exact matches', () => {
      const se = new SearchEngine()
      const results = se.searchInSource('test.ts', 'function hello() {}', 'hello', defaultOptions)
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.match).toBe('hello')
      expect(results[0]!.line).toBe(1)
    })

    it('should find matches across multiple lines', () => {
      const se = new SearchEngine()
      const source = 'line one\nhello world\nline three'
      const results = se.searchInSource('test.ts', source, 'hello', defaultOptions)
      expect(results).toHaveLength(1)
      expect(results[0]!.line).toBe(2)
    })

    it('should find multiple occurrences on same line', () => {
      const se = new SearchEngine()
      const results = se.searchInSource('test.ts', 'foo foo foo', 'foo', defaultOptions)
      expect(results).toHaveLength(3)
    })

    it('should be case-insensitive by default', () => {
      const se = new SearchEngine()
      const results = se.searchInSource('test.ts', 'Hello HELLO hello', 'hello', defaultOptions)
      expect(results).toHaveLength(3)
    })

    it('should support case-sensitive search', () => {
      const se = new SearchEngine()
      const opts: SearchOptions = { ...defaultOptions, caseSensitive: true }
      const results = se.searchInSource('test.ts', 'Hello hello HELLO', 'hello', opts)
      expect(results).toHaveLength(1)
    })

    it('should respect maxResults', () => {
      const se = new SearchEngine()
      const opts: SearchOptions = { ...defaultOptions, maxResults: 2 }
      const results = se.searchInSource('test.ts', 'a a a a a', 'a', opts)
      expect(results).toHaveLength(2)
    })

    it('should return empty for no matches', () => {
      const se = new SearchEngine()
      const results = se.searchInSource('test.ts', 'hello world', 'xyz', defaultOptions)
      expect(results).toEqual([])
    })
  })

  describe('searchFuzzy', () => {
    it('should find fuzzy matches within distance', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [{ name: 'Helo', kind: 'function', filePath: 'test.ts', line: 1, column: 0, exported: true, children: [] }],
        imports: [],
        exports: [],
        size: 10,
        language: 'typescript',
      }
      se.addFile(file)
      const results = se.searchFuzzy('Hello', 2)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should sort results by score descending', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [
          { name: 'helo', kind: 'function', filePath: 'test.ts', line: 1, column: 0, exported: true, children: [] },
          { name: 'hello', kind: 'function', filePath: 'test.ts', line: 2, column: 0, exported: true, children: [] },
        ],
        imports: [],
        exports: [],
        size: 10,
        language: 'typescript',
      }
      se.addFile(file)
      const results = se.searchFuzzy('hello', 2)
      expect(results[0]!.score).toBeGreaterThanOrEqual(results[1]!.score)
    })

    it('should not match when distance exceeds threshold', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [{ name: 'completelyDifferent', kind: 'function', filePath: 'test.ts', line: 1, column: 0, exported: true, children: [] }],
        imports: [],
        exports: [],
        size: 10,
        language: 'typescript',
      }
      se.addFile(file)
      const results = se.searchFuzzy('hello', 1)
      expect(results).toHaveLength(0)
    })
  })

  describe('searchRegex', () => {
    it('should find regex matches', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [],
        imports: [],
        exports: [],
        size: 0,
        language: 'typescript',
      }
      se.addFile(file)
      const results = se.searchRegexInSource('test.ts', 'const foo = 1\nconst bar = 2', 'const\\s+\\w+')
      expect(results).toHaveLength(2)
    })

    it('should return empty for invalid regex', () => {
      const se = new SearchEngine()
      const results = se.searchRegexInSource('test.ts', 'hello', '[')
      expect(results).toEqual([])
    })

    it('should return empty for no matches', () => {
      const se = new SearchEngine()
      const results = se.searchRegexInSource('test.ts', 'hello world', '\\d+')
      expect(results).toEqual([])
    })

    it('should find regex matches across lines', () => {
      const se = new SearchEngine()
      const source = 'function foo() {}\nfunction bar() {}'
      const results = se.searchRegexInSource('test.ts', source, 'function\\s+\\w+')
      expect(results).toHaveLength(2)
      expect(results[0]!.line).toBe(1)
      expect(results[1]!.line).toBe(2)
    })

    it('should capture correct column', () => {
      const se = new SearchEngine()
      const results = se.searchRegexInSource('test.ts', '  hello', 'hello')
      expect(results[0]!.column).toBe(3)
    })
  })

  describe('suggest', () => {
    it('should suggest symbols matching prefix', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [
          { name: 'getUser', kind: 'function', filePath: 'test.ts', line: 1, column: 0, exported: true, children: [] },
          { name: 'getData', kind: 'function', filePath: 'test.ts', line: 2, column: 0, exported: true, children: [] },
          { name: 'setUser', kind: 'function', filePath: 'test.ts', line: 3, column: 0, exported: true, children: [] },
        ],
        imports: [],
        exports: [],
        size: 0,
        language: 'typescript',
      }
      se.addFile(file)
      const suggestions = se.suggest('get', 10)
      expect(suggestions).toContain('getUser')
      expect(suggestions).toContain('getData')
      expect(suggestions).not.toContain('setUser')
    })

    it('should respect limit', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [
          { name: 'abc1', kind: 'function', filePath: 'test.ts', line: 1, column: 0, exported: true, children: [] },
          { name: 'abc2', kind: 'function', filePath: 'test.ts', line: 2, column: 0, exported: true, children: [] },
          { name: 'abc3', kind: 'function', filePath: 'test.ts', line: 3, column: 0, exported: true, children: [] },
        ],
        imports: [],
        exports: [],
        size: 0,
        language: 'typescript',
      }
      se.addFile(file)
      const suggestions = se.suggest('abc', 2)
      expect(suggestions.length).toBeLessThanOrEqual(2)
    })

    it('should return empty for no matches', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [{ name: 'hello', kind: 'function', filePath: 'test.ts', line: 1, column: 0, exported: true, children: [] }],
        imports: [],
        exports: [],
        size: 0,
        language: 'typescript',
      }
      se.addFile(file)
      expect(se.suggest('xyz', 10)).toEqual([])
    })

    it('should be case-insensitive', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [{ name: 'MyFunction', kind: 'function', filePath: 'test.ts', line: 1, column: 0, exported: true, children: [] }],
        imports: [],
        exports: [],
        size: 0,
        language: 'typescript',
      }
      se.addFile(file)
      expect(se.suggest('myf', 10)).toContain('MyFunction')
    })
  })

  describe('suggestFromSource', () => {
    it('should suggest words from source matching prefix', () => {
      const se = new SearchEngine()
      const suggestions = se.suggestFromSource('function helloFunc() {}\nconst helloVar = 1', 'hello', 10)
      expect(suggestions).toContain('helloFunc')
      expect(suggestions).toContain('helloVar')
    })

    it('should respect limit', () => {
      const se = new SearchEngine()
      const suggestions = se.suggestFromSource('abc1 abc2 abc3', 'abc', 2)
      expect(suggestions.length).toBeLessThanOrEqual(2)
    })

    it('should return empty for no matches', () => {
      const se = new SearchEngine()
      expect(se.suggestFromSource('hello world', 'xyz', 10)).toEqual([])
    })
  })

  describe('addFile / removeFile', () => {
    it('should add and remove files', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [],
        imports: [],
        exports: [],
        size: 0,
        language: 'typescript',
      }
      se.addFile(file)
      se.removeFile('test.ts')
      expect(se.searchExact('anything')).toEqual([])
    })
  })

  describe('search', () => {
    it('should route to fuzzy search when fuzzy option is true', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [{ name: 'Helo', kind: 'function', filePath: 'test.ts', line: 1, column: 0, exported: true, children: [] }],
        imports: [],
        exports: [],
        size: 10,
        language: 'typescript',
      }
      se.addFile(file)
      const opts: SearchOptions = { ...defaultOptions, fuzzy: true }
      const results = se.search('Hello', opts)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should route to exact search when fuzzy is false', () => {
      const se = new SearchEngine()
      const file: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'test.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [{ name: 'hello', kind: 'function', filePath: 'test.ts', line: 1, column: 0, exported: true, children: [] }],
        imports: [],
        exports: [],
        size: 10,
        language: 'typescript',
      }
      se.addFile(file)
      const results = se.search('hello', defaultOptions)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should filter by file pattern', () => {
      const se = new SearchEngine()
      const file1: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'src/a.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [{ name: 'hello', kind: 'function', filePath: 'src/a.ts', line: 1, column: 0, exported: true, children: [] }],
        imports: [],
        exports: [],
        size: 10,
        language: 'typescript',
      }
      const file2: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'lib/b.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [{ name: 'hello', kind: 'function', filePath: 'lib/b.ts', line: 1, column: 0, exported: true, children: [] }],
        imports: [],
        exports: [],
        size: 10,
        language: 'typescript',
      }
      se.addFile(file1)
      se.addFile(file2)
      const opts: SearchOptions = { ...defaultOptions, filePattern: 'src/*' }
      const results = se.search('hello', opts)
      expect(results.every((r) => r.filePath.includes('src'))).toBe(true)
    })
  })

  describe('setFiles', () => {
    it('should replace all files', () => {
      const se = new SearchEngine()
      const file1: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'old.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [{ name: 'old', kind: 'function', filePath: 'old.ts', line: 1, column: 0, exported: true, children: [] }],
        imports: [],
        exports: [],
        size: 0,
        language: 'typescript',
      }
      se.addFile(file1)

      const file2: import('../../src/core/indexer/types.js').FileIndexData = {
        filePath: 'new.ts',
        hash: 'abcd1234',
        lastModified: Date.now(),
        symbols: [{ name: 'new', kind: 'function', filePath: 'new.ts', line: 1, column: 0, exported: true, children: [] }],
        imports: [],
        exports: [],
        size: 0,
        language: 'typescript',
      }
      se.setFiles([file2])
      expect(se.searchExact('old')).toHaveLength(0)
      expect(se.searchExact('new')).toHaveLength(1)
    })
  })
})

describe('Integration: FileIndex + SymbolIndex + SearchEngine', () => {
  it('should index source and search for symbols', () => {
    const fi = new FileIndex()
    const si = new SymbolIndex()
    const se = new SearchEngine()

    const source = `export function greet(name: string): string {
  return 'Hello ' + name
}

export class Greeter {
  greet(name: string) {
    return greet(name)
  }
}

export interface Config {
  greeting: string
}
`
    const fileData = fi.indexFile('src/greeter.ts', source)
    se.addFile(fileData)

    for (const sym of fileData.symbols) {
      si.addSymbol(sym)
    }

    expect(si.lookup('greet').length).toBeGreaterThanOrEqual(1)
    expect(si.lookup('Greeter')).toHaveLength(1)
    expect(si.lookup('Config')).toHaveLength(1)
    expect(si.lookupByKind('function').length).toBeGreaterThanOrEqual(1)
    expect(si.lookupByKind('class')).toHaveLength(1)
    expect(si.lookupByKind('interface')).toHaveLength(1)

    const opts: SearchOptions = { fuzzy: false, maxResults: 100, caseSensitive: false }
    const results = se.searchInSource('src/greeter.ts', source, 'greet', opts)
    expect(results.length).toBeGreaterThan(0)
  })

  it('should handle multiple files indexed and searched', () => {
    const fi = new FileIndex()
    const se = new SearchEngine()

    const file1 = fi.indexFile('src/a.ts', 'export const ALPHA = 1')
    const file2 = fi.indexFile('src/b.ts', 'export const BETA = 2')
    se.addFile(file1)
    se.addFile(file2)

    const opts: SearchOptions = { fuzzy: false, maxResults: 100, caseSensitive: false }
    const aResults = se.searchInSource('src/a.ts', 'export const ALPHA = 1', 'ALPHA', opts)
    const bResults = se.searchInSource('src/b.ts', 'export const BETA = 2', 'BETA', opts)
    expect(aResults).toHaveLength(1)
    expect(bResults).toHaveLength(1)
  })

  it('should remove file from index and verify symbols gone', () => {
    const fi = new FileIndex()
    const si = new SymbolIndex()

    const file1 = fi.indexFile('src/keep.ts', 'export function keep() {}')
    const file2 = fi.indexFile('src/remove.ts', 'export function remove() {}')

    for (const sym of file1.symbols) si.addSymbol(sym)
    for (const sym of file2.symbols) si.addSymbol(sym)

    fi.removeFile('src/remove.ts')
    si.removeSymbolsForFile('src/remove.ts')

    expect(fi.getFile('src/remove.ts')).toBeNull()
    expect(si.lookup('remove')).toHaveLength(0)
    expect(si.lookup('keep')).toHaveLength(1)
  })

  it('should track stats across operations', () => {
    const fi = new FileIndex()
    const si = new SymbolIndex()

    fi.indexFile('src/a.ts', 'export function a() {}')
    fi.indexFile('src/b.ts', 'export class B {}')

    const allFiles = fi.getAllFiles()
    for (const f of allFiles) {
      for (const sym of f.symbols) si.addSymbol(sym)
    }

    const stats = si.getStats()
    expect(stats.totalFiles).toBe(2)
    expect(stats.totalSymbols).toBe(2)
    expect(stats.byKind.get('function')).toBe(1)
    expect(stats.byKind.get('class')).toBe(1)
  })

  it('should detect file modifications', async () => {
    const fi = new FileIndex()
    fi.indexFile('src/old.ts', 'const x = 1')
    await new Promise((r) => setTimeout(r, 10))
    const checkpoint = Date.now()
    await new Promise((r) => setTimeout(r, 10))
    fi.indexFile('src/old.ts', 'const x = 1\nconst y = 2')
    const modified = fi.getModifiedSince(checkpoint)
    expect(modified).toHaveLength(1)
    expect(modified[0]!.filePath).toBe('src/old.ts')
  })
})
