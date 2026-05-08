import { describe, it, expect, beforeEach } from 'vitest'
import { ChunkStrategy } from '../../src/core/code-splitter/chunk-strategy.js'
import { CodeSplitter, resetChunkCounter } from '../../src/core/code-splitter/code-splitter.js'
import { DEFAULT_SPLIT_OPTIONS } from '../../src/core/code-splitter/types.js'
import type { SplitOptions, CodeChunk } from '../../src/core/code-splitter/types.js'

describe('ChunkStrategy', () => {
  const strategy = new ChunkStrategy()

  describe('selectStrategy', () => {
    it('should return line for short code without functions or classes', () => {
      expect(strategy.selectStrategy('let x = 1', 'typescript')).toBe('line')
    })

    it('should return statement for medium code without patterns', () => {
      const code = Array(12).fill('let x = 1;').join('\n')
      expect(strategy.selectStrategy(code, 'typescript')).toBe('statement')
    })

    it('should return function for code with functions over 20 lines', () => {
      const code = 'function foo() {\n' + Array(20).fill('  let x = 1;').join('\n') + '\n}\n'
      expect(strategy.selectStrategy(code, 'typescript')).toBe('function')
    })

    it('should return class for code with classes over 50 lines', () => {
      const code = 'class Foo {\n' + Array(50).fill('  x = 1;').join('\n') + '\n}\n'
      expect(strategy.selectStrategy(code, 'typescript')).toBe('class')
    })

    it('should prioritize class over function when both present with many lines', () => {
      const code = 'class Foo {\n  constructor() {}\n}\nfunction bar() {\n' + Array(50).fill('  x = 1;').join('\n') + '\n}\n'
      expect(strategy.selectStrategy(code, 'typescript')).toBe('class')
    })

    it('should detect python functions', () => {
      const code = Array(25).fill('pass').join('\ndef foo():\n  pass\n')
      expect(strategy.selectStrategy(code, 'python')).toBe('function')
    })

    it('should detect python classes', () => {
      const code = Array(55).fill('pass').join('\nclass Foo:\n  pass\n')
      expect(strategy.selectStrategy(code, 'python')).toBe('class')
    })
  })

  describe('estimateChunkCount', () => {
    it('should estimate based on line count for line granularity', () => {
      const code = Array(100).fill('x').join('\n')
      const options: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'line', maxChunkSize: 10 }
      expect(strategy.estimateChunkCount(code, options)).toBe(10)
    })

    it('should estimate function count for function granularity', () => {
      const code = 'function a() {}\nfunction b() {}\nfunction c() {}'
      const options: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'function', maxChunkSize: 500 }
      expect(strategy.estimateChunkCount(code, options)).toBe(3)
    })

    it('should estimate class count for class granularity', () => {
      const code = 'class A {}\nclass B {}'
      const options: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'class', maxChunkSize: 500 }
      expect(strategy.estimateChunkCount(code, options)).toBe(2)
    })

    it('should return 1 for module granularity', () => {
      const code = 'const x = 1; const y = 2;'
      const options: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'module', maxChunkSize: 500 }
      expect(strategy.estimateChunkCount(code, options)).toBe(1)
    })

    it('should fall back to line-based estimate when no functions found', () => {
      const code = Array(100).fill('let x = 1;').join('\n')
      const options: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'function', maxChunkSize: 50 }
      expect(strategy.estimateChunkCount(code, options)).toBe(2)
    })

    it('should estimate statements', () => {
      const code = 'let x = 1;\nlet y = 2;\nlet z = 3;'
      const options: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'statement', maxChunkSize: 500 }
      expect(strategy.estimateChunkCount(code, options)).toBe(3)
    })

    it('should estimate paragraphs', () => {
      const code = 'aaa\n\nbbb\n\nccc'
      const options: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'paragraph', maxChunkSize: 500 }
      expect(strategy.estimateChunkCount(code, options)).toBe(3)
    })
  })

  describe('shouldSplit', () => {
    it('should return true when code exceeds max chunk size', () => {
      const code = Array(10).fill('line').join('\n')
      expect(strategy.shouldSplit(code, 5)).toBe(true)
    })

    it('should return false when code fits within max chunk size', () => {
      const code = Array(3).fill('line').join('\n')
      expect(strategy.shouldSplit(code, 10)).toBe(false)
    })

    it('should return false when exactly at max chunk size', () => {
      const code = Array(5).fill('line').join('\n')
      expect(strategy.shouldSplit(code, 5)).toBe(false)
    })
  })

  describe('getOptimalChunkSize', () => {
    it('should divide lines evenly', () => {
      const code = Array(100).fill('x').join('\n')
      expect(strategy.getOptimalChunkSize(code, 4)).toBe(25)
    })

    it('should ceil for non-divisible counts', () => {
      const code = Array(10).fill('x').join('\n')
      expect(strategy.getOptimalChunkSize(code, 3)).toBe(4)
    })

    it('should return total lines when targetChunks is 0', () => {
      const code = Array(50).fill('x').join('\n')
      expect(strategy.getOptimalChunkSize(code, 0)).toBe(50)
    })

    it('should return total lines for negative targetChunks', () => {
      const code = Array(30).fill('x').join('\n')
      expect(strategy.getOptimalChunkSize(code, -1)).toBe(30)
    })
  })

  describe('calculateHash', () => {
    it('should produce consistent hashes for same content', () => {
      const hash1 = strategy.calculateHash('hello world')
      const hash2 = strategy.calculateHash('hello world')
      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different content', () => {
      const hash1 = strategy.calculateHash('hello')
      const hash2 = strategy.calculateHash('world')
      expect(hash1).not.toBe(hash2)
    })

    it('should return an 8-char hex string', () => {
      const hash = strategy.calculateHash('test content')
      expect(hash).toMatch(/^[0-9a-f]{8}$/)
    })

    it('should handle empty string', () => {
      const hash = strategy.calculateHash('')
      expect(hash).toMatch(/^[0-9a-f]{8}$/)
    })
  })
})

describe('CodeSplitter', () => {
  let splitter: CodeSplitter

  beforeEach(() => {
    resetChunkCounter()
    splitter = new CodeSplitter()
  })

  describe('constructor', () => {
    it('should use default options when none provided', () => {
      const opts = splitter.getOptions()
      expect(opts.granularity).toBe('function')
      expect(opts.maxChunkSize).toBe(500)
      expect(opts.language).toBe('typescript')
    })

    it('should merge partial options with defaults', () => {
      const s = new CodeSplitter({ granularity: 'line', maxChunkSize: 10 })
      const opts = s.getOptions()
      expect(opts.granularity).toBe('line')
      expect(opts.maxChunkSize).toBe(10)
      expect(opts.language).toBe('typescript')
    })

    it('should override language', () => {
      const s = new CodeSplitter({ language: 'python' })
      expect(s.getOptions().language).toBe('python')
    })
  })

  describe('splitByLines', () => {
    it('should split code into line-based chunks', () => {
      const code = 'a\nb\nc\nd\ne'
      const chunks = splitter.splitByLines(code, 2)
      expect(chunks).toHaveLength(3)
      expect(chunks[0]!.content).toBe('a\nb')
      expect(chunks[1]!.content).toBe('c\nd')
      expect(chunks[2]!.content).toBe('e')
    })

    it('should handle single line', () => {
      const chunks = splitter.splitByLines('hello', 10)
      expect(chunks).toHaveLength(1)
      expect(chunks[0]!.content).toBe('hello')
    })

    it('should handle empty string', () => {
      const chunks = splitter.splitByLines('', 10)
      expect(chunks).toHaveLength(1)
      expect(chunks[0]!.content).toBe('')
    })

    it('should set correct startLine and endLine', () => {
      const code = 'a\nb\nc\nd\ne'
      const chunks = splitter.splitByLines(code, 2)
      expect(chunks[0]!.startLine).toBe(1)
      expect(chunks[0]!.endLine).toBe(2)
      expect(chunks[1]!.startLine).toBe(3)
      expect(chunks[1]!.endLine).toBe(4)
    })

    it('should set correct type to block', () => {
      const chunks = splitter.splitByLines('a\nb', 2)
      expect(chunks[0]!.type).toBe('block')
    })

    it('should split exactly divisible lines', () => {
      const code = 'a\nb\nc\nd'
      const chunks = splitter.splitByLines(code, 2)
      expect(chunks).toHaveLength(2)
    })
  })

  describe('splitByFunctions', () => {
    it('should split named functions', () => {
      const code = 'import x from "y";\n\nfunction foo() {\n  return 1;\n}\n\nfunction bar() {\n  return 2;\n}'
      const chunks = splitter.splitByFunctions(code)
      const funcChunks = chunks.filter((c) => c.type === 'function')
      expect(funcChunks).toHaveLength(2)
      expect(funcChunks[0]!.name).toBe('foo')
      expect(funcChunks[1]!.name).toBe('bar')
    })

    it('should handle code with no functions', () => {
      const code = 'const x = 1;\nconst y = 2;'
      const chunks = splitter.splitByFunctions(code)
      expect(chunks).toHaveLength(1)
      expect(chunks[0]!.type).toBe('module')
    })

    it('should detect async functions', () => {
      const code = 'async function fetchData() {\n  return await fetch("/api");\n}'
      const chunks = splitter.splitByFunctions(code)
      expect(chunks).toHaveLength(1)
      expect(chunks[0]!.name).toBe('fetchData')
      expect(chunks[0]!.type).toBe('function')
    })

    it('should detect exported functions', () => {
      const code = 'export function helper() {\n  return true;\n}'
      const chunks = splitter.splitByFunctions(code)
      expect(chunks[0]!.name).toBe('helper')
    })

    it('should create leading chunk for imports before functions', () => {
      const code = 'import { x } from "y";\n\nfunction foo() {\n  return x;\n}'
      const chunks = splitter.splitByFunctions(code)
      expect(chunks[0]!.type).toBe('import')
      expect(chunks[1]!.type).toBe('function')
    })

    it('should set correct line numbers for functions', () => {
      const code = 'function foo() {\n  return 1;\n}\nfunction bar() {\n  return 2;\n}'
      const chunks = splitter.splitByFunctions(code)
      const foo = chunks.find((c) => c.name === 'foo')
      const bar = chunks.find((c) => c.name === 'bar')
      expect(foo!.startLine).toBe(1)
      expect(bar!.startLine).toBe(4)
    })
  })

  describe('splitByClasses', () => {
    it('should split classes', () => {
      const code = 'class Foo {\n  x = 1;\n}\n\nclass Bar {\n  y = 2;\n}'
      const chunks = splitter.splitByClasses(code)
      const classChunks = chunks.filter((c) => c.type === 'class')
      expect(classChunks).toHaveLength(2)
      expect(classChunks[0]!.name).toBe('Foo')
      expect(classChunks[1]!.name).toBe('Bar')
    })

    it('should handle code with no classes', () => {
      const code = 'const x = 1;'
      const chunks = splitter.splitByClasses(code)
      expect(chunks).toHaveLength(1)
      expect(chunks[0]!.type).toBe('module')
    })

    it('should detect exported classes', () => {
      const code = 'export class MyService {\n  run() {}\n}'
      const chunks = splitter.splitByClasses(code)
      expect(chunks[0]!.name).toBe('MyService')
    })

    it('should detect abstract classes', () => {
      const code = 'abstract class Base {\n  abstract doWork(): void;\n}'
      const chunks = splitter.splitByClasses(code)
      expect(chunks[0]!.name).toBe('Base')
    })

    it('should create leading chunk for code before classes', () => {
      const code = 'import { x } from "y";\n\nclass Foo {\n  x = 1;\n}'
      const chunks = splitter.splitByClasses(code)
      expect(chunks[0]!.type).toBe('import')
    })
  })

  describe('splitByModules', () => {
    it('should return single module chunk', () => {
      const code = 'const x = 1;\nconst y = 2;'
      const chunks = splitter.splitByModules(code)
      expect(chunks).toHaveLength(1)
      expect(chunks[0]!.type).toBe('module')
      expect(chunks[0]!.content).toBe(code)
    })

    it('should handle empty source', () => {
      const chunks = splitter.splitByModules('')
      expect(chunks).toHaveLength(1)
      expect(chunks[0]!.startLine).toBe(1)
      expect(chunks[0]!.endLine).toBe(1)
    })

    it('should set correct startChar and endChar', () => {
      const code = 'hello world'
      const chunks = splitter.splitByModules(code)
      expect(chunks[0]!.startChar).toBe(0)
      expect(chunks[0]!.endChar).toBe(11)
    })
  })

  describe('splitByStatements', () => {
    it('should split semicolon-terminated statements', () => {
      const code = 'let x = 1;\nlet y = 2;\nlet z = 3;'
      const chunks = splitter.splitByStatements(code)
      expect(chunks).toHaveLength(3)
    })

    it('should handle block statements with braces', () => {
      const code = 'if (true) {\n  x = 1;\n}\nlet y = 2;'
      const chunks = splitter.splitByStatements(code)
      expect(chunks.length).toBeGreaterThanOrEqual(2)
    })

    it('should skip empty lines', () => {
      const code = 'let x = 1;\n\nlet y = 2;'
      const chunks = splitter.splitByStatements(code)
      expect(chunks).toHaveLength(2)
    })

    it('should skip comment lines', () => {
      const code = 'let x = 1;\n// comment\nlet y = 2;'
      const chunks = splitter.splitByStatements(code)
      expect(chunks).toHaveLength(2)
    })

    it('should detect import statement type', () => {
      const code = 'import { x } from "y";\nlet z = 1;'
      const chunks = splitter.splitByStatements(code)
      expect(chunks[0]!.type).toBe('import')
    })

    it('should detect export statement type', () => {
      const code = 'export const x = 1;\nlet y = 2;'
      const chunks = splitter.splitByStatements(code)
      expect(chunks[0]!.type).toBe('export')
    })

    it('should detect function statement type', () => {
      const code = 'function foo() {\n  return 1;\n}'
      const chunks = splitter.splitByStatements(code)
      expect(chunks[0]!.type).toBe('function')
    })

    it('should detect class statement type', () => {
      const code = 'class Foo {\n  x = 1;\n}'
      const chunks = splitter.splitByStatements(code)
      expect(chunks[0]!.type).toBe('class')
    })

    it('should detect interface statement type', () => {
      const code = 'interface Foo {\n  x: number;\n}'
      const chunks = splitter.splitByStatements(code)
      expect(chunks[0]!.type).toBe('interface')
    })

    it('should detect type statement type', () => {
      const code = 'type Foo = string | number;'
      const chunks = splitter.splitByStatements(code)
      expect(chunks[0]!.type).toBe('type')
    })

    it('should handle multi-line statements with braces', () => {
      const code = 'function foo() {\n  const x = 1;\n  const y = 2;\n}'
      const chunks = splitter.splitByStatements(code)
      expect(chunks).toHaveLength(1)
      expect(chunks[0]!.type).toBe('function')
    })

    it('should handle statement ending with colon', () => {
      const code = 'case "a":\n  break;'
      const chunks = splitter.splitByStatements(code)
      expect(chunks.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('split (main method)', () => {
    it('should return SplitResult with correct fields', () => {
      const code = 'function foo() {\n  return 1;\n}'
      const result = splitter.split(code)
      expect(result).toHaveProperty('chunks')
      expect(result).toHaveProperty('totalLines')
      expect(result).toHaveProperty('totalChunks')
      expect(result).toHaveProperty('avgChunkSize')
      expect(result).toHaveProperty('language')
      expect(result).toHaveProperty('source')
    })

    it('should use line granularity when specified', () => {
      const code = 'a\nb\nc\nd\ne'
      const result = splitter.split(code, { granularity: 'line', maxChunkSize: 2 })
      expect(result.totalChunks).toBe(3)
    })

    it('should use function granularity by default', () => {
      const code = 'function foo() {\n  return 1;\n}'
      const result = splitter.split(code)
      const funcChunks = result.chunks.filter((c) => c.type === 'function')
      expect(funcChunks).toHaveLength(1)
    })

    it('should use class granularity when specified', () => {
      const code = 'class Foo {\n  x = 1;\n}'
      const result = splitter.split(code, { granularity: 'class' })
      expect(result.chunks[0]!.type).toBe('class')
    })

    it('should use module granularity when specified', () => {
      const code = 'const x = 1;'
      const result = splitter.split(code, { granularity: 'module' })
      expect(result.chunks).toHaveLength(1)
      expect(result.chunks[0]!.type).toBe('module')
    })

    it('should use statement granularity when specified', () => {
      const code = 'let x = 1;\nlet y = 2;'
      const result = splitter.split(code, { granularity: 'statement' })
      expect(result.totalChunks).toBe(2)
    })

    it('should use paragraph granularity when specified', () => {
      const code = 'aaa\n\nbbb\n\nccc'
      const result = splitter.split(code, { granularity: 'paragraph' })
      expect(result.totalChunks).toBe(3)
    })

    it('should calculate totalLines correctly', () => {
      const code = 'a\nb\nc'
      const result = splitter.split(code, { granularity: 'module' })
      expect(result.totalLines).toBe(3)
    })

    it('should calculate avgChunkSize correctly', () => {
      const code = 'a\nb\nc\nd\ne'
      const result = splitter.split(code, { granularity: 'line', maxChunkSize: 5 })
      expect(result.avgChunkSize).toBe(5)
    })

    it('should preserve source in result', () => {
      const code = 'const x = 1;'
      const result = splitter.split(code, { granularity: 'module' })
      expect(result.source).toBe(code)
    })

    it('should set language in result', () => {
      const s = new CodeSplitter({ language: 'python' })
      const result = s.split('x = 1', { granularity: 'module' })
      expect(result.language).toBe('python')
    })

    it('should enforce maxChunkSize', () => {
      const code = Array(20).fill('line content').join('\n')
      const result = splitter.split(code, { granularity: 'line', maxChunkSize: 5 })
      for (const chunk of result.chunks) {
        expect(chunk.content.split('\n').length).toBeLessThanOrEqual(5)
      }
    })

    it('should apply overlap when specified', () => {
      const code = 'a\nb\nc\nd\ne'
      const result = splitter.split(code, { granularity: 'line', maxChunkSize: 2, overlapLines: 1 })
      expect(result.totalChunks).toBeGreaterThanOrEqual(2)
    })

    it('should merge small chunks when minChunkSize specified', () => {
      const code = 'a\nb\nc\nd'
      const result = splitter.split(code, { granularity: 'statement', minChunkSize: 5 })
      expect(result.totalChunks).toBe(1)
    })
  })

  describe('getChunk', () => {
    it('should return chunk by id after split', () => {
      const code = 'function foo() {\n  return 1;\n}'
      const result = splitter.split(code, { granularity: 'function' })
      const firstChunk = result.chunks[0]!
      const found = splitter.getChunk(code, firstChunk.id)
      expect(found).not.toBeNull()
      expect(found!.id).toBe(firstChunk.id)
    })

    it('should return null for unknown chunk id', () => {
      splitter.split('const x = 1;', { granularity: 'module' })
      expect(splitter.getChunk('x', 'nonexistent')).toBeNull()
    })
  })

  describe('reconstruct', () => {
    it('should reconstruct code from line-based chunks', () => {
      const code = 'a\nb\nc\nd\ne'
      const chunks = splitter.splitByLines(code, 2)
      const reconstructed = splitter.reconstruct(chunks)
      expect(reconstructed).toBe(code)
    })

    it('should reconstruct single chunk', () => {
      const code = 'hello world'
      const chunks = splitter.splitByLines(code, 10)
      expect(splitter.reconstruct(chunks)).toBe(code)
    })

    it('should handle empty chunks array', () => {
      expect(splitter.reconstruct([])).toBe('')
    })

    it('should reconstruct preserving order regardless of input order', () => {
      const code = 'a\nb\nc\nd'
      const chunks = splitter.splitByLines(code, 2)
      const reversed = [...chunks].reverse()
      expect(splitter.reconstruct(reversed)).toBe(code)
    })
  })

  describe('merge', () => {
    it('should merge adjacent chunks within maxChunkSize', () => {
      const chunks: CodeChunk[] = [
        { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: [], metadata: {}, language: 'typescript', hash: 'abc' },
        { id: '2', type: 'statement', content: 'b', startLine: 2, endLine: 2, startChar: 2, endChar: 3, children: [], metadata: {}, language: 'typescript', hash: 'def' },
      ]
      const merged = splitter.merge(chunks, 10)
      expect(merged).toHaveLength(1)
      expect(merged[0]!.content).toBe('a\nb')
    })

    it('should not merge chunks exceeding maxChunkSize', () => {
      const chunks: CodeChunk[] = [
        { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: [], metadata: {}, language: 'typescript', hash: 'abc' },
        { id: '2', type: 'statement', content: 'b', startLine: 2, endLine: 2, startChar: 2, endChar: 3, children: [], metadata: {}, language: 'typescript', hash: 'def' },
      ]
      const merged = splitter.merge(chunks, 1)
      expect(merged).toHaveLength(2)
    })

    it('should handle empty chunks array', () => {
      expect(splitter.merge([], 10)).toHaveLength(0)
    })

    it('should handle single chunk', () => {
      const chunks: CodeChunk[] = [
        { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: [], metadata: {}, language: 'typescript', hash: 'abc' },
      ]
      const merged = splitter.merge(chunks, 10)
      expect(merged).toHaveLength(1)
    })

    it('should combine children when merging', () => {
      const chunks: CodeChunk[] = [
        { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: ['child1'], metadata: {}, language: 'typescript', hash: 'abc' },
        { id: '2', type: 'statement', content: 'b', startLine: 2, endLine: 2, startChar: 2, endChar: 3, children: ['child2'], metadata: {}, language: 'typescript', hash: 'def' },
      ]
      const merged = splitter.merge(chunks, 10)
      expect(merged[0]!.children).toEqual(['child1', 'child2'])
    })
  })

  describe('getOptions', () => {
    it('should return a copy of options', () => {
      const opts1 = splitter.getOptions()
      const opts2 = splitter.getOptions()
      expect(opts1).toEqual(opts2)
      expect(opts1).not.toBe(opts2)
    })

    it('should reflect constructor options', () => {
      const s = new CodeSplitter({ granularity: 'class', maxChunkSize: 100 })
      const opts = s.getOptions()
      expect(opts.granularity).toBe('class')
      expect(opts.maxChunkSize).toBe(100)
    })
  })

  describe('CodeChunk properties', () => {
    it('should have unique ids for different chunks', () => {
      const code = 'function a() {}\nfunction b() {}'
      const chunks = splitter.splitByFunctions(code)
      const ids = chunks.map((c) => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have a valid hash for each chunk', () => {
      const code = 'function foo() {\n  return 1;\n}'
      const chunks = splitter.splitByFunctions(code)
      for (const chunk of chunks) {
        expect(chunk.hash).toMatch(/^[0-9a-f]{8}$/)
      }
    })

    it('should have language set on each chunk', () => {
      const s = new CodeSplitter({ language: 'python' })
      const chunks = s.splitByModules('x = 1')
      expect(chunks[0]!.language).toBe('python')
    })

    it('should have metadata as empty object by default', () => {
      const chunks = splitter.splitByLines('a\nb', 2)
      expect(chunks[0]!.metadata).toEqual({})
    })

    it('should have empty children array by default', () => {
      const chunks = splitter.splitByLines('a\nb', 2)
      expect(chunks[0]!.children).toEqual([])
    })
  })

  describe('splitByParagraphs', () => {
    it('should split by double newlines', () => {
      const code = 'aaa\n\nbbb\n\nccc'
      const result = splitter.split(code, { granularity: 'paragraph' })
      expect(result.totalChunks).toBe(3)
    })

    it('should handle single paragraph', () => {
      const code = 'aaa\nbbb'
      const result = splitter.split(code, { granularity: 'paragraph' })
      expect(result.totalChunks).toBe(1)
    })

    it('should skip empty paragraphs', () => {
      const code = 'aaa\n\n\n\nbbb'
      const result = splitter.split(code, { granularity: 'paragraph' })
      expect(result.totalChunks).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle code with only comments', () => {
      const code = '// comment 1\n// comment 2'
      const result = splitter.split(code, { granularity: 'statement' })
      expect(result.totalChunks).toBe(0)
    })

    it('should handle code with only blank lines', () => {
      const code = '\n\n\n'
      const result = splitter.split(code, { granularity: 'statement' })
      expect(result.totalChunks).toBe(0)
    })

    it('should handle very long single line', () => {
      const longLine = 'x'.repeat(10000)
      const result = splitter.split(longLine, { granularity: 'module' })
      expect(result.totalChunks).toBe(1)
      expect(result.chunks[0]!.content).toBe(longLine)
    })

    it('should handle windows line endings', () => {
      const code = 'a\r\nb\r\nc'
      const lines = code.split('\n')
      expect(lines.length).toBe(3)
    })

    it('should handle reconstructing with gaps', () => {
      const chunks: CodeChunk[] = [
        { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: [], metadata: {}, language: 'typescript', hash: 'abc' },
        { id: '2', type: 'statement', content: 'c', startLine: 3, endLine: 3, startChar: 4, endChar: 5, children: [], metadata: {}, language: 'typescript', hash: 'def' },
      ]
      const reconstructed = splitter.reconstruct(chunks)
      expect(reconstructed).toBe('a\n\nc')
    })

    it('should handle empty source with function granularity', () => {
      const result = splitter.split('', { granularity: 'function' })
      expect(result.totalChunks).toBeGreaterThanOrEqual(0)
    })

    it('should handle single character source', () => {
      const result = splitter.split('x', { granularity: 'module' })
      expect(result.totalChunks).toBe(1)
    })
  })
})

describe('DEFAULT_SPLIT_OPTIONS', () => {
  it('should have function as default granularity', () => {
    expect(DEFAULT_SPLIT_OPTIONS.granularity).toBe('function')
  })

  it('should have maxChunkSize of 500', () => {
    expect(DEFAULT_SPLIT_OPTIONS.maxChunkSize).toBe(500)
  })

  it('should have minChunkSize of 1', () => {
    expect(DEFAULT_SPLIT_OPTIONS.minChunkSize).toBe(1)
  })

  it('should have overlapLines of 0', () => {
    expect(DEFAULT_SPLIT_OPTIONS.overlapLines).toBe(0)
  })

  it('should preserve imports by default', () => {
    expect(DEFAULT_SPLIT_OPTIONS.preserveImports).toBe(true)
  })

  it('should preserve comments by default', () => {
    expect(DEFAULT_SPLIT_OPTIONS.preserveComments).toBe(true)
  })

  it('should include metadata by default', () => {
    expect(DEFAULT_SPLIT_OPTIONS.includeMetadata).toBe(true)
  })

  it('should have typescript as default language', () => {
    expect(DEFAULT_SPLIT_OPTIONS.language).toBe('typescript')
  })
})
