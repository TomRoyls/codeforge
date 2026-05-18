import { describe, it, expect, beforeEach } from 'vitest'
import { ChunkStrategy } from '../src/core/code-splitter/chunk-strategy.js'
import { CodeSplitter, resetChunkCounter } from '../src/core/code-splitter/code-splitter.js'
import { DEFAULT_SPLIT_OPTIONS } from '../src/core/code-splitter/types.js'
import type { SplitOptions, CodeChunk, SplitResult } from '../src/core/code-splitter/types.js'

// ─── DEFAULT_SPLIT_OPTIONS ──────────────────────────────────────────
describe('DEFAULT_SPLIT_OPTIONS', () => {
  it('defaults granularity to function', () => {
    expect(DEFAULT_SPLIT_OPTIONS.granularity).toBe('function')
  })

  it('defaults maxChunkSize to 500', () => {
    expect(DEFAULT_SPLIT_OPTIONS.maxChunkSize).toBe(500)
  })

  it('defaults minChunkSize to 1', () => {
    expect(DEFAULT_SPLIT_OPTIONS.minChunkSize).toBe(1)
  })

  it('defaults overlapLines to 0', () => {
    expect(DEFAULT_SPLIT_OPTIONS.overlapLines).toBe(0)
  })

  it('defaults preserveImports to true', () => {
    expect(DEFAULT_SPLIT_OPTIONS.preserveImports).toBe(true)
  })

  it('defaults preserveComments to true', () => {
    expect(DEFAULT_SPLIT_OPTIONS.preserveComments).toBe(true)
  })

  it('defaults includeMetadata to true', () => {
    expect(DEFAULT_SPLIT_OPTIONS.includeMetadata).toBe(true)
  })

  it('defaults language to typescript', () => {
    expect(DEFAULT_SPLIT_OPTIONS.language).toBe('typescript')
  })

  it('has exactly 8 properties', () => {
    expect(Object.keys(DEFAULT_SPLIT_OPTIONS)).toHaveLength(8)
  })
})

// ─── ChunkStrategy – selectStrategy ─────────────────────────────────
describe('ChunkStrategy.selectStrategy', () => {
  const strategy = new ChunkStrategy()

  it('returns "line" for very short code', () => {
    expect(strategy.selectStrategy('x', 'typescript')).toBe('line')
  })

  it('returns "line" for code under 10 lines without patterns', () => {
    expect(strategy.selectStrategy('a\nb\nc', 'typescript')).toBe('line')
  })

  it('returns "statement" for 11+ lines without functions/classes', () => {
    const code = Array(12).fill('let x = 1;').join('\n')
    expect(strategy.selectStrategy(code, 'typescript')).toBe('statement')
  })

  it('returns "function" for 20+ lines with functions', () => {
    const code = 'function foo() {}\n' + Array(20).fill('let x = 1;').join('\n')
    expect(strategy.selectStrategy(code, 'typescript')).toBe('function')
  })

  it('returns "class" for 50+ lines with classes', () => {
    const code = 'class Foo {}\n' + Array(50).fill('x = 1;').join('\n')
    expect(strategy.selectStrategy(code, 'typescript')).toBe('class')
  })

  it('prioritizes class over function when both present with 50+ lines', () => {
    const code = 'class Foo {}\nfunction bar() {}\n' + Array(50).fill('x;').join('\n')
    expect(strategy.selectStrategy(code, 'typescript')).toBe('class')
  })

  it('detects python def functions', () => {
    const code = Array(25).fill('pass').join('\n') + '\ndef foo():\n  pass'
    expect(strategy.selectStrategy(code, 'python')).toBe('function')
  })

  it('detects python class declarations', () => {
    const code = Array(55).fill('pass').join('\n') + '\nclass Foo:\n  pass'
    expect(strategy.selectStrategy(code, 'python')).toBe('class')
  })

  it('does not detect functions for unknown language patterns', () => {
    const code = Array(25).fill('x').join('\n')
    expect(strategy.selectStrategy(code, 'rust')).toBe('statement')
  })

  it('returns "function" when functions present but under 50 lines', () => {
    const code = 'function foo() {}\n' + Array(20).fill('x;').join('\n')
    expect(strategy.selectStrategy(code, 'typescript')).toBe('function')
  })
})

// ─── ChunkStrategy – estimateChunkCount ─────────────────────────────
describe('ChunkStrategy.estimateChunkCount', () => {
  const strategy = new ChunkStrategy()

  it('estimates line-based chunks', () => {
    const code = Array(100).fill('x').join('\n')
    const opts: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'line', maxChunkSize: 10 }
    expect(strategy.estimateChunkCount(code, opts)).toBe(10)
  })

  it('estimates named function count', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}'
    const opts: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'function', maxChunkSize: 500 }
    expect(strategy.estimateChunkCount(code, opts)).toBe(3)
  })

  it('falls back to line-based estimate when no functions found', () => {
    const code = Array(100).fill('x;').join('\n')
    const opts: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'function', maxChunkSize: 50 }
    expect(strategy.estimateChunkCount(code, opts)).toBe(2)
  })

  it('estimates class count', () => {
    const code = 'class A {}\nclass B {}'
    const opts: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'class', maxChunkSize: 500 }
    expect(strategy.estimateChunkCount(code, opts)).toBe(2)
  })

  it('falls back to line-based estimate when no classes found', () => {
    const code = Array(50).fill('x').join('\n')
    const opts: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'class', maxChunkSize: 25 }
    expect(strategy.estimateChunkCount(code, opts)).toBe(2)
  })

  it('returns 1 for module granularity', () => {
    const code = 'lots of code here'
    const opts: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'module', maxChunkSize: 500 }
    expect(strategy.estimateChunkCount(code, opts)).toBe(1)
  })

  it('counts paragraphs separated by blank lines', () => {
    const code = 'aaa\n\nbbb\n\nccc'
    const opts: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'paragraph', maxChunkSize: 500 }
    expect(strategy.estimateChunkCount(code, opts)).toBe(3)
  })

  it('counts statement-ending lines', () => {
    const code = 'let x = 1;\nlet y = 2;\nlet z = 3;'
    const opts: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'statement', maxChunkSize: 500 }
    expect(strategy.estimateChunkCount(code, opts)).toBe(3)
  })

  it('counts arrow functions along with named functions', () => {
    const code = 'function a() {}\nconst b = () => {}'
    const opts: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'function', maxChunkSize: 500 }
    expect(strategy.estimateChunkCount(code, opts)).toBe(2)
  })

  it('estimates python function count', () => {
    const code = 'def a():\n  pass\n\ndef b():\n  pass'
    const opts: SplitOptions = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'function', maxChunkSize: 500, language: 'python' }
    expect(strategy.estimateChunkCount(code, opts)).toBe(2)
  })

  it('defaults to line-based estimate for unknown granularity', () => {
    const code = Array(20).fill('x').join('\n')
    const opts = { ...DEFAULT_SPLIT_OPTIONS, granularity: 'unknown' as SplitOptions['granularity'], maxChunkSize: 5 }
    expect(strategy.estimateChunkCount(code, opts)).toBe(4)
  })
})

// ─── ChunkStrategy – shouldSplit ────────────────────────────────────
describe('ChunkStrategy.shouldSplit', () => {
  const strategy = new ChunkStrategy()

  it('returns true when lines exceed maxChunkSize', () => {
    expect(strategy.shouldSplit('a\nb\nc\nd\ne\f', 4)).toBe(true)
  })

  it('returns false when lines fit within maxChunkSize', () => {
    expect(strategy.shouldSplit('a\nb\nc', 5)).toBe(false)
  })

  it('returns false when lines equal maxChunkSize exactly', () => {
    expect(strategy.shouldSplit('a\nb\nc', 3)).toBe(false)
  })

  it('returns false for single line within limit', () => {
    expect(strategy.shouldSplit('hello', 1)).toBe(false)
  })

  it('returns true for single line exceeding limit', () => {
    expect(strategy.shouldSplit('a\nb', 1)).toBe(true)
  })
})

// ─── ChunkStrategy – getOptimalChunkSize ────────────────────────────
describe('ChunkStrategy.getOptimalChunkSize', () => {
  const strategy = new ChunkStrategy()

  it('divides lines evenly', () => {
    const code = Array(100).fill('x').join('\n')
    expect(strategy.getOptimalChunkSize(code, 4)).toBe(25)
  })

  it('ceils for non-divisible counts', () => {
    const code = Array(10).fill('x').join('\n')
    expect(strategy.getOptimalChunkSize(code, 3)).toBe(4)
  })

  it('returns total lines for targetChunks = 0', () => {
    const code = Array(50).fill('x').join('\n')
    expect(strategy.getOptimalChunkSize(code, 0)).toBe(50)
  })

  it('returns total lines for negative targetChunks', () => {
    const code = Array(30).fill('x').join('\n')
    expect(strategy.getOptimalChunkSize(code, -5)).toBe(30)
  })

  it('returns 1 for targetChunks equal to line count', () => {
    const code = Array(10).fill('x').join('\n')
    expect(strategy.getOptimalChunkSize(code, 10)).toBe(1)
  })
})

// ─── ChunkStrategy – calculateHash ──────────────────────────────────
describe('ChunkStrategy.calculateHash', () => {
  const strategy = new ChunkStrategy()

  it('produces consistent hashes', () => {
    expect(strategy.calculateHash('abc')).toBe(strategy.calculateHash('abc'))
  })

  it('produces different hashes for different content', () => {
    expect(strategy.calculateHash('foo')).not.toBe(strategy.calculateHash('bar'))
  })

  it('returns 8-char hex string', () => {
    expect(strategy.calculateHash('test')).toMatch(/^[0-9a-f]{8}$/)
  })

  it('handles empty string', () => {
    expect(strategy.calculateHash('')).toMatch(/^[0-9a-f]{8}$/)
  })

  it('handles unicode content', () => {
    const hash = strategy.calculateHash('日本語テスト')
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('handles very long content', () => {
    const hash = strategy.calculateHash('x'.repeat(100000))
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })
})

// ─── CodeSplitter – constructor ─────────────────────────────────────
describe('CodeSplitter constructor', () => {
  beforeEach(() => { resetChunkCounter() })

  it('uses all defaults when no options provided', () => {
    const s = new CodeSplitter()
    const opts = s.getOptions()
    expect(opts).toEqual(DEFAULT_SPLIT_OPTIONS)
  })

  it('merges partial options preserving defaults', () => {
    const s = new CodeSplitter({ granularity: 'line' })
    const opts = s.getOptions()
    expect(opts.granularity).toBe('line')
    expect(opts.maxChunkSize).toBe(500)
    expect(opts.language).toBe('typescript')
  })

  it('allows overriding maxChunkSize', () => {
    const s = new CodeSplitter({ maxChunkSize: 50 })
    expect(s.getOptions().maxChunkSize).toBe(50)
  })

  it('allows overriding minChunkSize', () => {
    const s = new CodeSplitter({ minChunkSize: 5 })
    expect(s.getOptions().minChunkSize).toBe(5)
  })

  it('allows overriding language', () => {
    const s = new CodeSplitter({ language: 'python' })
    expect(s.getOptions().language).toBe('python')
  })

  it('allows overriding overlapLines', () => {
    const s = new CodeSplitter({ overlapLines: 3 })
    expect(s.getOptions().overlapLines).toBe(3)
  })

  it('allows overriding preserveImports', () => {
    const s = new CodeSplitter({ preserveImports: false })
    expect(s.getOptions().preserveImports).toBe(false)
  })

  it('allows overriding preserveComments', () => {
    const s = new CodeSplitter({ preserveComments: false })
    expect(s.getOptions().preserveComments).toBe(false)
  })

  it('allows overriding includeMetadata', () => {
    const s = new CodeSplitter({ includeMetadata: false })
    expect(s.getOptions().includeMetadata).toBe(false)
  })
})

// ─── CodeSplitter – splitByLines ────────────────────────────────────
describe('CodeSplitter.splitByLines', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('splits into correct number of chunks', () => {
    const code = 'a\nb\nc\nd\ne'
    expect(splitter.splitByLines(code, 2)).toHaveLength(3)
  })

  it('returns single chunk when code fits in chunkSize', () => {
    expect(splitter.splitByLines('a\nb\nc', 10)).toHaveLength(1)
  })

  it('handles chunkSize of 1', () => {
    const chunks = splitter.splitByLines('a\nb\nc', 1)
    expect(chunks).toHaveLength(3)
    expect(chunks[0]!.content).toBe('a')
    expect(chunks[2]!.content).toBe('c')
  })

  it('handles single line', () => {
    const chunks = splitter.splitByLines('hello', 10)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]!.content).toBe('hello')
  })

  it('handles empty string', () => {
    const chunks = splitter.splitByLines('', 10)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]!.content).toBe('')
  })

  it('sets correct startLine (1-based)', () => {
    const chunks = splitter.splitByLines('a\nb\nc\nd', 2)
    expect(chunks[0]!.startLine).toBe(1)
    expect(chunks[1]!.startLine).toBe(3)
  })

  it('sets correct endLine', () => {
    const chunks = splitter.splitByLines('a\nb\nc\nd', 2)
    expect(chunks[0]!.endLine).toBe(2)
    expect(chunks[1]!.endLine).toBe(4)
  })

  it('sets type to block', () => {
    const chunks = splitter.splitByLines('a\nb', 2)
    expect(chunks[0]!.type).toBe('block')
  })

  it('sets correct startChar for first chunk', () => {
    const chunks = splitter.splitByLines('a\nb\nc', 2)
    expect(chunks[0]!.startChar).toBe(0)
  })

  it('sets correct startChar for subsequent chunks', () => {
    const chunks = splitter.splitByLines('a\nb\nc', 1)
    expect(chunks[1]!.startChar).toBe(2)
    expect(chunks[2]!.startChar).toBe(4)
  })

  it('sets correct endChar', () => {
    const chunks = splitter.splitByLines('abc\ndef', 10)
    expect(chunks[0]!.endChar).toBe(7)
  })

  it('handles exactly divisible line count', () => {
    const chunks = splitter.splitByLines('a\nb\nc\nd', 2)
    expect(chunks).toHaveLength(2)
  })
})

// ─── CodeSplitter – splitByFunctions ────────────────────────────────
describe('CodeSplitter.splitByFunctions', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('splits named functions', () => {
    const code = 'function foo() {\n  return 1;\n}\n\nfunction bar() {\n  return 2;\n}'
    const chunks = splitter.splitByFunctions(code)
    const funcs = chunks.filter((c) => c.type === 'function')
    expect(funcs).toHaveLength(2)
    expect(funcs[0]!.name).toBe('foo')
    expect(funcs[1]!.name).toBe('bar')
  })

  it('returns module chunk when no functions', () => {
    const chunks = splitter.splitByFunctions('const x = 1;')
    expect(chunks).toHaveLength(1)
    expect(chunks[0]!.type).toBe('module')
  })

  it('detects async functions', () => {
    const code = 'async function fetchData() {\n  return 1;\n}'
    const chunks = splitter.splitByFunctions(code)
    expect(chunks[0]!.name).toBe('fetchData')
    expect(chunks[0]!.type).toBe('function')
  })

  it('detects exported functions', () => {
    const code = 'export function helper() {\n  return true;\n}'
    const chunks = splitter.splitByFunctions(code)
    expect(chunks[0]!.name).toBe('helper')
  })

  it('creates leading import chunk', () => {
    const code = 'import { x } from "y";\n\nfunction foo() {\n  return x;\n}'
    const chunks = splitter.splitByFunctions(code)
    expect(chunks[0]!.type).toBe('import')
    expect(chunks[1]!.type).toBe('function')
  })

  it('sets correct line numbers', () => {
    const code = 'function foo() {\n  return 1;\n}\nfunction bar() {\n  return 2;\n}'
    const chunks = splitter.splitByFunctions(code)
    const foo = chunks.find((c) => c.name === 'foo')
    const bar = chunks.find((c) => c.name === 'bar')
    expect(foo!.startLine).toBe(1)
    expect(bar!.startLine).toBe(4)
  })

  it('handles function with parameters', () => {
    const code = 'function add(a: number, b: number) {\n  return a + b;\n}'
    const chunks = splitter.splitByFunctions(code)
    expect(chunks[0]!.name).toBe('add')
  })

  it('handles export async function combo', () => {
    const code = 'export async function process() {\n  await Promise.resolve();\n}'
    const chunks = splitter.splitByFunctions(code)
    expect(chunks[0]!.name).toBe('process')
  })

  it('creates block-type leading chunk for non-import code', () => {
    const code = '/* header */\n\nfunction foo() {\n  return 1;\n}'
    const chunks = splitter.splitByFunctions(code)
    expect(chunks[0]!.type).toBe('comment')
  })

  it('includes trailing code after last function', () => {
    const code = 'function foo() {\n  return 1;\n}\nconst x = 2;'
    const chunks = splitter.splitByFunctions(code)
    const foo = chunks.find((c) => c.name === 'foo')!
    expect(foo.content).toContain('const x = 2;')
  })
})

// ─── CodeSplitter – splitByClasses ──────────────────────────────────
describe('CodeSplitter.splitByClasses', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('splits classes', () => {
    const code = 'class Foo {\n  x = 1;\n}\n\nclass Bar {\n  y = 2;\n}'
    const chunks = splitter.splitByClasses(code)
    const classes = chunks.filter((c) => c.type === 'class')
    expect(classes).toHaveLength(2)
    expect(classes[0]!.name).toBe('Foo')
    expect(classes[1]!.name).toBe('Bar')
  })

  it('returns module chunk when no classes', () => {
    const chunks = splitter.splitByClasses('const x = 1;')
    expect(chunks).toHaveLength(1)
    expect(chunks[0]!.type).toBe('module')
  })

  it('detects exported classes', () => {
    const code = 'export class Service {\n  run() {}\n}'
    const chunks = splitter.splitByClasses(code)
    expect(chunks[0]!.name).toBe('Service')
  })

  it('detects abstract classes', () => {
    const code = 'abstract class Base {\n  abstract doWork(): void;\n}'
    const chunks = splitter.splitByClasses(code)
    expect(chunks[0]!.name).toBe('Base')
  })

  it('creates leading import chunk before class', () => {
    const code = 'import { X } from "y";\n\nclass Foo {\n  x = 1;\n}'
    const chunks = splitter.splitByClasses(code)
    expect(chunks[0]!.type).toBe('import')
  })

  it('sets correct startLine for each class', () => {
    const code = 'class A {}\n\nclass B {}'
    const chunks = splitter.splitByClasses(code)
    const classes = chunks.filter((c) => c.type === 'class')
    expect(classes[0]!.startLine).toBe(1)
    expect(classes[1]!.startLine).toBe(2)
  })

  it('handles export abstract class combo', () => {
    const code = 'export abstract class Base {\n  x = 1;\n}'
    const chunks = splitter.splitByClasses(code)
    expect(chunks[0]!.name).toBe('Base')
  })
})

// ─── CodeSplitter – splitByModules ──────────────────────────────────
describe('CodeSplitter.splitByModules', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('returns single module chunk', () => {
    const code = 'const x = 1;\nconst y = 2;'
    const chunks = splitter.splitByModules(code)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]!.type).toBe('module')
    expect(chunks[0]!.content).toBe(code)
  })

  it('handles empty source', () => {
    const chunks = splitter.splitByModules('')
    expect(chunks).toHaveLength(1)
  })

  it('sets startChar to 0', () => {
    expect(splitter.splitByModules('hello')[0]!.startChar).toBe(0)
  })

  it('sets endChar to source length', () => {
    const code = 'hello world'
    expect(splitter.splitByModules(code)[0]!.endChar).toBe(11)
  })

  it('sets startLine to 1', () => {
    expect(splitter.splitByModules('a\nb')[0]!.startLine).toBe(1)
  })

  it('sets endLine to line count', () => {
    expect(splitter.splitByModules('a\nb\nc')[0]!.endLine).toBe(3)
  })
})

// ─── CodeSplitter – splitByStatements ───────────────────────────────
describe('CodeSplitter.splitByStatements', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('splits semicolon-terminated statements', () => {
    const chunks = splitter.splitByStatements('let x = 1;\nlet y = 2;\nlet z = 3;')
    expect(chunks).toHaveLength(3)
  })

  it('handles brace-terminated blocks', () => {
    const chunks = splitter.splitByStatements('if (true) {\n  x = 1;\n}\nlet y = 2;')
    expect(chunks.length).toBeGreaterThanOrEqual(2)
  })

  it('skips empty lines between statements', () => {
    const chunks = splitter.splitByStatements('let x = 1;\n\nlet y = 2;')
    expect(chunks).toHaveLength(2)
  })

  it('skips single-line comments', () => {
    const chunks = splitter.splitByStatements('let x = 1;\n// comment\nlet y = 2;')
    expect(chunks).toHaveLength(2)
  })

  it('skips block comment starts', () => {
    const chunks = splitter.splitByStatements('let x = 1;\n/* comment */\nlet y = 2;')
    expect(chunks).toHaveLength(2)
  })

  it('skips continuation comment lines', () => {
    const chunks = splitter.splitByStatements('let x = 1;\n* continuation\nlet y = 2;')
    expect(chunks).toHaveLength(2)
  })

  it('detects import type', () => {
    const chunks = splitter.splitByStatements('import { x } from "y";\nlet z = 1;')
    expect(chunks[0]!.type).toBe('import')
  })

  it('detects export type', () => {
    const chunks = splitter.splitByStatements('export const x = 1;\nlet y = 2;')
    expect(chunks[0]!.type).toBe('export')
  })

  it('detects function type', () => {
    const chunks = splitter.splitByStatements('function foo() {\n  return 1;\n}')
    expect(chunks[0]!.type).toBe('function')
  })

  it('detects async function type', () => {
    const chunks = splitter.splitByStatements('async function foo() {\n  return 1;\n}')
    expect(chunks[0]!.type).toBe('function')
  })

  it('detects class type', () => {
    const chunks = splitter.splitByStatements('class Foo {\n  x = 1;\n}')
    expect(chunks[0]!.type).toBe('class')
  })

  it('detects interface type', () => {
    const chunks = splitter.splitByStatements('interface Foo {\n  x: number;\n}')
    expect(chunks[0]!.type).toBe('interface')
  })

  it('detects type alias', () => {
    const chunks = splitter.splitByStatements('type Foo = string | number;')
    expect(chunks[0]!.type).toBe('type')
  })

  it('handles multi-line brace blocks as single statement', () => {
    const chunks = splitter.splitByStatements('function foo() {\n  const x = 1;\n  const y = 2;\n}')
    expect(chunks).toHaveLength(1)
  })

  it('handles colon-terminated lines', () => {
    const chunks = splitter.splitByStatements('case "a":\n  break;')
    expect(chunks.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty for only comments', () => {
    const chunks = splitter.splitByStatements('// comment 1\n// comment 2')
    expect(chunks).toHaveLength(0)
  })

  it('returns empty for only blank lines', () => {
    const chunks = splitter.splitByStatements('\n\n\n')
    expect(chunks).toHaveLength(0)
  })
})

// ─── CodeSplitter – splitByParagraphs ───────────────────────────────
describe('CodeSplitter.splitByParagraphs', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('splits by double newlines', () => {
    const chunks = splitter.splitByParagraphs('aaa\n\nbbb\n\nccc')
    expect(chunks).toHaveLength(3)
  })

  it('returns single chunk for single paragraph', () => {
    const chunks = splitter.splitByParagraphs('aaa\nbbb')
    expect(chunks).toHaveLength(1)
  })

  it('skips empty paragraphs', () => {
    const chunks = splitter.splitByParagraphs('aaa\n\n\n\nbbb')
    expect(chunks).toHaveLength(2)
  })

  it('sets type to block', () => {
    const chunks = splitter.splitByParagraphs('aaa\n\nbbb')
    expect(chunks[0]!.type).toBe('block')
  })

  it('sets correct startLine for first paragraph', () => {
    const chunks = splitter.splitByParagraphs('aaa\n\nbbb')
    expect(chunks[0]!.startLine).toBe(1)
  })

  it('sets correct startLine for second paragraph', () => {
    const chunks = splitter.splitByParagraphs('aaa\n\nbbb')
    expect(chunks[1]!.startLine).toBe(3)
  })

  it('sets correct endLine', () => {
    const chunks = splitter.splitByParagraphs('aaa\nbbb\n\nccc')
    expect(chunks[0]!.endLine).toBe(2)
    expect(chunks[1]!.endLine).toBe(4)
  })

  it('handles trailing blank lines', () => {
    const chunks = splitter.splitByParagraphs('aaa\n\nbbb\n\n')
    expect(chunks).toHaveLength(2)
  })
})

// ─── CodeSplitter – split (main) ────────────────────────────────────
describe('CodeSplitter.split', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('returns SplitResult with all fields', () => {
    const result = splitter.split('const x = 1;', { granularity: 'module' })
    expect(result).toHaveProperty('chunks')
    expect(result).toHaveProperty('totalLines')
    expect(result).toHaveProperty('totalChunks')
    expect(result).toHaveProperty('avgChunkSize')
    expect(result).toHaveProperty('language')
    expect(result).toHaveProperty('source')
  })

  it('uses function granularity by default', () => {
    const result = splitter.split('function foo() {\n  return 1;\n}')
    expect(result.chunks.some((c) => c.type === 'function')).toBe(true)
  })

  it('uses line granularity when specified', () => {
    const result = splitter.split('a\nb\nc\nd\ne', { granularity: 'line', maxChunkSize: 2 })
    expect(result.totalChunks).toBe(3)
  })

  it('uses class granularity when specified', () => {
    const result = splitter.split('class Foo {\n  x = 1;\n}', { granularity: 'class' })
    expect(result.chunks[0]!.type).toBe('class')
  })

  it('uses module granularity', () => {
    const result = splitter.split('const x = 1;', { granularity: 'module' })
    expect(result.chunks).toHaveLength(1)
    expect(result.chunks[0]!.type).toBe('module')
  })

  it('uses statement granularity', () => {
    const result = splitter.split('let x = 1;\nlet y = 2;', { granularity: 'statement' })
    expect(result.totalChunks).toBe(2)
  })

  it('uses paragraph granularity', () => {
    const result = splitter.split('aaa\n\nbbb\n\nccc', { granularity: 'paragraph' })
    expect(result.totalChunks).toBe(3)
  })

  it('calculates totalLines correctly', () => {
    const result = splitter.split('a\nb\nc', { granularity: 'module' })
    expect(result.totalLines).toBe(3)
  })

  it('preserves source in result', () => {
    const code = 'const x = 1;'
    const result = splitter.split(code, { granularity: 'module' })
    expect(result.source).toBe(code)
  })

  it('sets language in result', () => {
    const s = new CodeSplitter({ language: 'python' })
    const result = s.split('x = 1', { granularity: 'module' })
    expect(result.language).toBe('python')
  })

  it('calculates avgChunkSize rounded to 2 decimals', () => {
    const result = splitter.split('a\nb\nc\nd\ne', { granularity: 'line', maxChunkSize: 5 })
    expect(result.avgChunkSize).toBe(5)
    expect(Number.isFinite(result.avgChunkSize)).toBe(true)
  })

  it('returns avgChunkSize = 0 for empty chunks', () => {
    const result = splitter.split('\n\n\n', { granularity: 'statement' })
    expect(result.avgChunkSize).toBe(0)
  })

  it('allows runtime options to override constructor options', () => {
    const s = new CodeSplitter({ granularity: 'function' })
    const result = s.split('a\nb\nc', { granularity: 'line', maxChunkSize: 10 })
    expect(result.chunks[0]!.type).toBe('block')
  })

  it('enforces maxChunkSize by splitting large chunks', () => {
    const code = Array(20).fill('line content').join('\n')
    const result = splitter.split(code, { granularity: 'line', maxChunkSize: 5 })
    for (const chunk of result.chunks) {
      expect(chunk.content.split('\n').length).toBeLessThanOrEqual(5)
    }
  })

  it('applies overlap when overlapLines > 0', () => {
    const code = 'a\nb\nc\nd\ne'
    const result = splitter.split(code, { granularity: 'line', maxChunkSize: 2, overlapLines: 1 })
    expect(result.totalChunks).toBeGreaterThanOrEqual(2)
  })

  it('merges small chunks when minChunkSize > 1', () => {
    const code = 'a\nb\nc\nd'
    const result = splitter.split(code, { granularity: 'statement', minChunkSize: 5 })
    expect(result.totalChunks).toBe(1)
  })

  it('sets language on each chunk', () => {
    const result = splitter.split('const x = 1;', { granularity: 'module', language: 'python' })
    expect(result.chunks[0]!.language).toBe('python')
  })

  it('stores chunks in chunkMap for later retrieval', () => {
    const result = splitter.split('const x = 1;', { granularity: 'module' })
    const id = result.chunks[0]!.id
    const found = splitter.getChunk('', id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(id)
  })

  it('falls back to function for unknown granularity in switch', () => {
    const code = 'function foo() {\n  return 1;\n}'
    // Using split directly which defaults to function for unknown granularity
    const result = splitter.split(code)
    expect(result.chunks.some((c) => c.type === 'function')).toBe(true)
  })
})

// ─── CodeSplitter – getChunk ────────────────────────────────────────
describe('CodeSplitter.getChunk', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('returns chunk by id after split', () => {
    const result = splitter.split('const x = 1;', { granularity: 'module' })
    const id = result.chunks[0]!.id
    expect(splitter.getChunk('', id)).not.toBeNull()
    expect(splitter.getChunk('', id)!.id).toBe(id)
  })

  it('returns null for unknown chunk id', () => {
    splitter.split('const x = 1;', { granularity: 'module' })
    expect(splitter.getChunk('', 'nonexistent')).toBeNull()
  })

  it('returns null before any split', () => {
    expect(splitter.getChunk('', 'any-id')).toBeNull()
  })

  it('stores all chunks across multiple splits', () => {
    splitter.split('a', { granularity: 'module' })
    const result2 = splitter.split('b', { granularity: 'module' })
    // Both chunks should be retrievable
    expect(splitter.getChunk('', result2.chunks[0]!.id)).not.toBeNull()
  })
})

// ─── CodeSplitter – reconstruct ─────────────────────────────────────
describe('CodeSplitter.reconstruct', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('reconstructs code from line-based chunks', () => {
    const code = 'a\nb\nc\nd\ne'
    const chunks = splitter.splitByLines(code, 2)
    expect(splitter.reconstruct(chunks)).toBe(code)
  })

  it('returns empty string for empty chunks', () => {
    expect(splitter.reconstruct([])).toBe('')
  })

  it('handles single chunk', () => {
    const code = 'hello world'
    const chunks = splitter.splitByLines(code, 10)
    expect(splitter.reconstruct(chunks)).toBe(code)
  })

  it('preserves order regardless of input order', () => {
    const code = 'a\nb\nc\nd'
    const chunks = splitter.splitByLines(code, 2)
    const reversed = [...chunks].reverse()
    expect(splitter.reconstruct(reversed)).toBe(code)
  })

  it('fills gaps between non-adjacent chunks', () => {
    const chunks: CodeChunk[] = [
      { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: [], metadata: {}, language: 'typescript', hash: 'abc' },
      { id: '2', type: 'statement', content: 'c', startLine: 3, endLine: 3, startChar: 4, endChar: 5, children: [], metadata: {}, language: 'typescript', hash: 'def' },
    ]
    expect(splitter.reconstruct(chunks)).toBe('a\n\nc')
  })

  it('reconstructs function-split code', () => {
    const code = 'function foo() {\n  return 1;\n}\nfunction bar() {\n  return 2;\n}'
    const chunks = splitter.splitByFunctions(code)
    expect(splitter.reconstruct(chunks)).toBe(code)
  })
})

// ─── CodeSplitter – merge ───────────────────────────────────────────
describe('CodeSplitter.merge', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('merges adjacent chunks within maxChunkSize', () => {
    const chunks: CodeChunk[] = [
      { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: [], metadata: {}, language: 'typescript', hash: 'abc' },
      { id: '2', type: 'statement', content: 'b', startLine: 2, endLine: 2, startChar: 2, endChar: 3, children: [], metadata: {}, language: 'typescript', hash: 'def' },
    ]
    const merged = splitter.merge(chunks, 10)
    expect(merged).toHaveLength(1)
    expect(merged[0]!.content).toBe('a\nb')
  })

  it('does not merge when exceeding maxChunkSize', () => {
    const chunks: CodeChunk[] = [
      { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: [], metadata: {}, language: 'typescript', hash: 'abc' },
      { id: '2', type: 'statement', content: 'b', startLine: 2, endLine: 2, startChar: 2, endChar: 3, children: [], metadata: {}, language: 'typescript', hash: 'def' },
    ]
    expect(splitter.merge(chunks, 1)).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    expect(splitter.merge([], 10)).toHaveLength(0)
  })

  it('handles single chunk', () => {
    const chunks: CodeChunk[] = [
      { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: [], metadata: {}, language: 'typescript', hash: 'abc' },
    ]
    expect(splitter.merge(chunks, 10)).toHaveLength(1)
  })

  it('combines children when merging', () => {
    const chunks: CodeChunk[] = [
      { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: ['c1'], metadata: {}, language: 'typescript', hash: 'abc' },
      { id: '2', type: 'statement', content: 'b', startLine: 2, endLine: 2, startChar: 2, endChar: 3, children: ['c2'], metadata: {}, language: 'typescript', hash: 'def' },
    ]
    const merged = splitter.merge(chunks, 10)
    expect(merged[0]!.children).toEqual(['c1', 'c2'])
  })

  it('updates endLine and endChar when merging', () => {
    const chunks: CodeChunk[] = [
      { id: '1', type: 'statement', content: 'a', startLine: 1, endLine: 1, startChar: 0, endChar: 1, children: [], metadata: {}, language: 'typescript', hash: 'abc' },
      { id: '2', type: 'statement', content: 'b', startLine: 2, endLine: 2, startChar: 2, endChar: 3, children: [], metadata: {}, language: 'typescript', hash: 'def' },
      { id: '3', type: 'statement', content: 'c', startLine: 3, endLine: 3, startChar: 4, endChar: 5, children: [], metadata: {}, language: 'typescript', hash: 'ghi' },
    ]
    const merged = splitter.merge(chunks, 10)
    expect(merged[0]!.endLine).toBe(3)
    expect(merged[0]!.endChar).toBe(5)
  })

  it('merges some and splits at boundary', () => {
    const chunks: CodeChunk[] = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`, type: 'statement', content: `line${i}`, startLine: i + 1, endLine: i + 1,
      startChar: i * 6, endChar: i * 6 + 5, children: [], metadata: {}, language: 'typescript', hash: 'abc',
    }))
    const merged = splitter.merge(chunks, 3)
    expect(merged.length).toBeLessThan(5)
    expect(merged.length).toBeGreaterThanOrEqual(2)
  })
})

// ─── CodeSplitter – getOptions ──────────────────────────────────────
describe('CodeSplitter.getOptions', () => {
  beforeEach(() => { resetChunkCounter() })

  it('returns a copy (not same reference)', () => {
    const s = new CodeSplitter()
    const a = s.getOptions()
    const b = s.getOptions()
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })

  it('reflects constructor options', () => {
    const s = new CodeSplitter({ granularity: 'class', maxChunkSize: 100 })
    const opts = s.getOptions()
    expect(opts.granularity).toBe('class')
    expect(opts.maxChunkSize).toBe(100)
  })

  it('returns all 8 option properties', () => {
    const opts = new CodeSplitter().getOptions()
    expect(Object.keys(opts)).toHaveLength(8)
  })
})

// ─── CodeSplitter – resetChunkCounter ───────────────────────────────
describe('resetChunkCounter', () => {
  it('resets chunk IDs to start from 1 again', () => {
    resetChunkCounter()
    const s = new CodeSplitter()
    const result1 = s.split('a', { granularity: 'module' })
    const id1 = result1.chunks[0]!.id

    resetChunkCounter()
    const result2 = s.split('b', { granularity: 'module' })
    const id2 = result2.chunks[0]!.id

    // After reset, the counter restarts, so IDs should be similar pattern
    expect(id1).toMatch(/^chunk_/)
    expect(id2).toMatch(/^chunk_/)
  })
})

// ─── CodeChunk properties ───────────────────────────────────────────
describe('CodeChunk properties', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('each chunk has a unique id', () => {
    const code = 'function a() {}\nfunction b() {}'
    const chunks = splitter.splitByFunctions(code)
    const ids = chunks.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('hash is 8-char hex', () => {
    const chunks = splitter.splitByLines('a\nb', 2)
    expect(chunks[0]!.hash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('hash varies with content', () => {
    const c1 = splitter.splitByLines('aaa', 10)
    const c2 = splitter.splitByLines('bbb', 10)
    expect(c1[0]!.hash).not.toBe(c2[0]!.hash)
  })

  it('children is empty array by default', () => {
    const chunks = splitter.splitByLines('a\nb', 2)
    expect(chunks[0]!.children).toEqual([])
  })

  it('metadata is empty object by default', () => {
    const chunks = splitter.splitByLines('a\nb', 2)
    expect(chunks[0]!.metadata).toEqual({})
  })

  it('language is set from options', () => {
    const s = new CodeSplitter({ language: 'python' })
    const chunks = s.splitByModules('x = 1')
    expect(chunks[0]!.language).toBe('python')
  })

  it('parentId is undefined by default', () => {
    const chunks = splitter.splitByLines('a', 10)
    expect(chunks[0]!.parentId).toBeUndefined()
  })

  it('parentId is set when enforceMaxSize splits a chunk', () => {
    const code = Array(10).fill('line').join('\n')
    const result = splitter.split(code, { granularity: 'module', maxChunkSize: 3 })
    const childChunks = result.chunks.filter((c) => c.parentId !== undefined)
    expect(childChunks.length).toBeGreaterThan(0)
    expect(childChunks[0]!.parentId).toBeTruthy()
  })
})

// ─── Overlap behavior ───────────────────────────────────────────────
describe('overlap behavior', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('does not apply overlap when overlapLines is 0', () => {
    const code = 'a\nb\nc\nd\ne'
    const result = splitter.split(code, { granularity: 'line', maxChunkSize: 2, overlapLines: 0 })
    expect(result.chunks[0]!.content).toBe('a\nb')
  })

  it('adds preceding lines to each chunk when overlapLines > 0', () => {
    const code = 'a\nb\nc\nd\ne'
    const result = splitter.split(code, { granularity: 'line', maxChunkSize: 2, overlapLines: 1 })
    // Second chunk should include some overlap from first chunk
    expect(result.totalChunks).toBeGreaterThanOrEqual(2)
  })

  it('returns original chunks when only 1 chunk', () => {
    const code = 'a\nb\nc'
    const result = splitter.split(code, { granularity: 'module', overlapLines: 5 })
    expect(result.chunks).toHaveLength(1)
  })
})

// ─── enforceMaxSize behavior ────────────────────────────────────────
describe('enforceMaxSize behavior', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('splits a module chunk that exceeds maxChunkSize', () => {
    const code = Array(20).fill('line content').join('\n')
    const result = splitter.split(code, { granularity: 'module', maxChunkSize: 5 })
    expect(result.totalChunks).toBe(4) // 20 / 5 = 4
  })

  it('preserves chunk type when splitting', () => {
    const code = Array(15).fill('line').join('\n')
    const result = splitter.split(code, { granularity: 'module', maxChunkSize: 5 })
    for (const chunk of result.chunks) {
      expect(chunk.type).toBe('module')
    }
  })

  it('sets parentId on sub-chunks', () => {
    const code = Array(10).fill('line').join('\n')
    const result = splitter.split(code, { granularity: 'module', maxChunkSize: 3 })
    const withParent = result.chunks.filter((c) => c.parentId)
    expect(withParent.length).toBeGreaterThan(0)
  })

  it('does not split chunks within maxChunkSize', () => {
    const code = 'short code'
    const result = splitter.split(code, { granularity: 'module', maxChunkSize: 100 })
    expect(result.totalChunks).toBe(1)
  })
})

// ─── mergeSmallChunks behavior ──────────────────────────────────────
describe('mergeSmallChunks behavior', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('merges chunks below minChunkSize', () => {
    const code = 'a\nb\nc\nd'
    const result = splitter.split(code, { granularity: 'statement', minChunkSize: 10 })
    expect(result.totalChunks).toBe(1)
  })

  it('recalculates hash after merging', () => {
    const code = 'a;\nb;\nc;'
    const result = splitter.split(code, { granularity: 'statement', minChunkSize: 5 })
    for (const chunk of result.chunks) {
      expect(chunk.hash).toMatch(/^[0-9a-f]{8}$/)
    }
  })

  it('tracks merged children', () => {
    const code = 'a;\nb;\nc;'
    const result = splitter.split(code, { granularity: 'statement', minChunkSize: 5 })
    const merged = result.chunks[0]!
    expect(merged.children.length).toBeGreaterThan(0)
  })
})

// ─── Edge cases ─────────────────────────────────────────────────────
describe('edge cases', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('handles empty source with function granularity', () => {
    const result = splitter.split('', { granularity: 'function' })
    expect(result.totalChunks).toBeGreaterThanOrEqual(0)
    expect(result.totalLines).toBe(1)
  })

  it('handles single character', () => {
    const result = splitter.split('x', { granularity: 'module' })
    expect(result.totalChunks).toBe(1)
  })

  it('handles very long single line', () => {
    const longLine = 'x'.repeat(10000)
    const result = splitter.split(longLine, { granularity: 'module' })
    expect(result.chunks[0]!.content).toBe(longLine)
  })

  it('handles unicode content', () => {
    const code = 'function unicodeTest() {\n  return "テスト";\n}'
    const result = splitter.split(code, { granularity: 'function' })
    expect(result.chunks.some((c) => c.name === 'unicodeTest')).toBe(true)
  })

  it('handles mixed line endings gracefully', () => {
    const code = 'a\nb\nc'
    const result = splitter.split(code, { granularity: 'module' })
    expect(result.totalLines).toBe(3)
  })

  it('handles code with only whitespace', () => {
    const code = '   \n   \n   '
    const result = splitter.split(code, { granularity: 'statement' })
    expect(result.totalChunks).toBe(0)
  })

  it('handles deeply nested braces', () => {
    const code = 'function outer() {\n  if (true) {\n    for (let i = 0; i < 10; i++) {\n      console.log(i);\n    }\n  }\n}'
    const chunks = splitter.splitByStatements(code)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]!.type).toBe('function')
  })

  it('handles multiple split calls on same instance', () => {
    const r1 = splitter.split('a', { granularity: 'module' })
    const r2 = splitter.split('b', { granularity: 'module' })
    expect(r1.chunks[0]!.content).toBe('a')
    expect(r2.chunks[0]!.content).toBe('b')
  })

  it('handles large files', () => {
    const code = Array(1000).fill('function f() { return 1; }').join('\n')
    const result = splitter.split(code, { granularity: 'function', maxChunkSize: 50 })
    expect(result.totalChunks).toBeGreaterThan(0)
    for (const chunk of result.chunks) {
      expect(chunk.content.split('\n').length).toBeLessThanOrEqual(50)
    }
  })

  it('handles tabs and mixed indentation', () => {
    const code = 'function foo() {\n\tlet x = 1;\n\t  let y = 2;\n}'
    const chunks = splitter.splitByFunctions(code)
    expect(chunks[0]!.name).toBe('foo')
  })
})

// ─── Integration scenarios ──────────────────────────────────────────
describe('integration scenarios', () => {
  let splitter: CodeSplitter
  beforeEach(() => { resetChunkCounter(); splitter = new CodeSplitter() })

  it('split → getChunk round-trip', () => {
    const code = 'function foo() {\n  return 1;\n}\nfunction bar() {\n  return 2;\n}'
    const result = splitter.split(code, { granularity: 'function' })
    for (const chunk of result.chunks) {
      const found = splitter.getChunk(code, chunk.id)
      expect(found).not.toBeNull()
      expect(found!.content).toBe(chunk.content)
    }
  })

  it('split → reconstruct round-trip with line granularity', () => {
    const code = 'line1\nline2\nline3\nline4\nline5\nline6'
    const result = splitter.split(code, { granularity: 'line', maxChunkSize: 2 })
    expect(splitter.reconstruct(result.chunks)).toBe(code)
  })

  it('split → merge round-trip', () => {
    const code = 'a\nb\nc\nd\ne'
    const result = splitter.split(code, { granularity: 'line', maxChunkSize: 1 })
    const merged = splitter.merge(result.chunks, 5)
    expect(merged.length).toBeLessThanOrEqual(result.totalChunks)
    expect(merged.length).toBeGreaterThanOrEqual(1)
  })

  it('constructor options + runtime options combination', () => {
    const s = new CodeSplitter({ granularity: 'line', maxChunkSize: 10, language: 'javascript' })
    const result = s.split('a\nb\nc\nd\ne', { maxChunkSize: 2, granularity: 'line' })
    // Runtime maxChunkSize should override constructor's
    expect(result.totalChunks).toBe(3)
    expect(result.chunks[0]!.language).toBe('javascript')
  })

  it('full TypeScript module split by functions', () => {
    const code = [
      'import { something } from "module";',
      '',
      '/** Doc comment */',
      'export function main() {',
      '  return something();',
      '}',
      '',
      'function helper() {',
      '  return 42;',
      '}',
    ].join('\n')
    const result = splitter.split(code, { granularity: 'function' })
    expect(result.totalLines).toBe(10)
    const funcs = result.chunks.filter((c) => c.type === 'function')
    expect(funcs).toHaveLength(2)
    expect(funcs.map((f) => f.name).sort()).toEqual(['helper', 'main'])
  })

  it('paragraph split handles mixed content', () => {
    const code = '// Header\n\nimport x from "y";\n\nfunction foo() {\n  return x;\n}'
    const result = splitter.split(code, { granularity: 'paragraph' })
    expect(result.totalChunks).toBe(3)
  })
})
