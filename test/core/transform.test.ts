import { describe, it, expect } from 'vitest'
import { TransformEngine } from '../../src/core/transform/transform-engine.js'
import { TransformParser } from '../../src/core/transform/transform-parser.js'
import type { Transform, TransformResult, TransformRecipe, TextChange } from '../../src/core/transform/types.js'
import { DEFAULT_TRANSFORM_CONFIG } from '../../src/core/transform/types.js'

function makeTransform(overrides: Partial<Transform> = {}): Transform {
  return {
    id: 'test-transform',
    name: 'Test Transform',
    description: 'A test transform',
    category: 'refactor',
    apply: (source: string, _filePath: string): TransformResult => ({
      source,
      changes: [],
      applied: false,
      errors: [],
    }),
    ...overrides,
  }
}

function makeResult(overrides: Partial<TransformResult> = {}): TransformResult {
  return {
    source: '',
    changes: [],
    applied: false,
    errors: [],
    ...overrides,
  }
}

describe('TransformEngine', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const engine = new TransformEngine()
      const source = 'x'.repeat(DEFAULT_TRANSFORM_CONFIG.maxFileSize)
      const transform = makeTransform()
      const result = engine.applyTransform(source, 'test.ts', transform)
      expect(result.errors).toHaveLength(0)
    })

    it('should merge partial config with defaults', () => {
      const engine = new TransformEngine({ dryRun: true })
      const transform = makeTransform({
        apply: (source) => ({
          source: source + '\n// modified',
          changes: [{ startLine: 1, endLine: 1, original: '', replacement: '', description: 'add comment' }],
          applied: true,
          errors: [],
        }),
      })
      const result = engine.applyTransform('const x = 1', 'test.ts', transform)
      expect(result.source).toBe('const x = 1')
    })

    it('should allow overriding maxFileSize', () => {
      const engine = new TransformEngine({ maxFileSize: 10 })
      const transform = makeTransform()
      const result = engine.applyTransform('x'.repeat(20), 'test.ts', transform)
      expect(result.applied).toBe(false)
      expect(result.errors[0]).toContain('max size')
    })

    it('should allow overriding filePatterns', () => {
      const engine = new TransformEngine({ filePatterns: ['**/*.tsx'] })
      const transform = makeTransform()
      const result = engine.applyTransform('const x = 1', 'test.ts', transform)
      expect(result).toBeDefined()
    })
  })

  describe('applyTransform', () => {
    it('should apply a successful transform', () => {
      const engine = new TransformEngine()
      const transform = makeTransform({
        apply: (source) => ({
          source: source.replace('var', 'let'),
          changes: [{ startLine: 1, endLine: 1, original: 'var x', replacement: 'let x', description: 'var to let' }],
          applied: true,
          errors: [],
        }),
      })
      const result = engine.applyTransform('var x = 1', 'test.ts', transform)
      expect(result.applied).toBe(true)
      expect(result.source).toBe('let x = 1')
      expect(result.changes).toHaveLength(1)
    })

    it('should return error when file exceeds maxFileSize', () => {
      const engine = new TransformEngine({ maxFileSize: 5 })
      const transform = makeTransform()
      const result = engine.applyTransform('abcdefghij', 'test.ts', transform)
      expect(result.applied).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('exceeds max size')
      expect(result.source).toBe('abcdefghij')
    })

    it('should catch errors thrown by transform', () => {
      const engine = new TransformEngine()
      const transform = makeTransform({
        apply: () => {
          throw new Error('Transform failed')
        },
      })
      const result = engine.applyTransform('const x = 1', 'test.ts', transform)
      expect(result.applied).toBe(false)
      expect(result.errors).toContain('Transform failed')
      expect(result.source).toBe('const x = 1')
    })

    it('should catch non-Error throws', () => {
      const engine = new TransformEngine()
      const transform = makeTransform({
        apply: () => {
          throw 'string error'
        },
      })
      const result = engine.applyTransform('const x = 1', 'test.ts', transform)
      expect(result.applied).toBe(false)
      expect(result.errors).toContain('string error')
    })

    it('should not modify source in dryRun mode even when applied is true', () => {
      const engine = new TransformEngine({ dryRun: true })
      const original = 'var x = 1'
      const transform = makeTransform({
        apply: (source) => ({
          source: source.replace('var', 'let'),
          changes: [{ startLine: 1, endLine: 1, original: 'var x', replacement: 'let x', description: 'swap' }],
          applied: true,
          errors: [],
        }),
      })
      const result = engine.applyTransform(original, 'test.ts', transform)
      expect(result.source).toBe(original)
      expect(result.applied).toBe(true)
    })

    it('should return empty changes and errors for non-applied transform', () => {
      const engine = new TransformEngine()
      const transform = makeTransform({
        apply: (source) => ({
          source,
          changes: [],
          applied: false,
          errors: [],
        }),
      })
      const result = engine.applyTransform('const x = 1', 'test.ts', transform)
      expect(result.applied).toBe(false)
      expect(result.changes).toHaveLength(0)
    })

    it('should pass filePath to transform apply function', () => {
      const engine = new TransformEngine()
      let receivedPath = ''
      const transform = makeTransform({
        apply: (_source, filePath) => {
          receivedPath = filePath
          return { source: _source, changes: [], applied: false, errors: [] }
        },
      })
      engine.applyTransform('x', 'src/utils/helpers.ts', transform)
      expect(receivedPath).toBe('src/utils/helpers.ts')
    })
  })

  describe('applyTransforms', () => {
    it('should apply sequential transforms', () => {
      const engine = new TransformEngine()
      const t1 = makeTransform({
        id: 't1',
        apply: (source) => ({
          source: source.replace('var', 'let'),
          changes: [{ startLine: 1, endLine: 1, original: 'var', replacement: 'let', description: 'd1' }],
          applied: true,
          errors: [],
        }),
      })
      const t2 = makeTransform({
        id: 't2',
        apply: (source) => ({
          source: source.replace('let', 'const'),
          changes: [{ startLine: 1, endLine: 1, original: 'let', replacement: 'const', description: 'd2' }],
          applied: true,
          errors: [],
        }),
      })
      const results = engine.applyTransforms('var x = 1', 'test.ts', [t1, t2])
      expect(results).toHaveLength(2)
      expect(results[0]!.source).toBe('let x = 1')
      expect(results[1]!.source).toBe('const x = 1')
    })

    it('should chain output into next transform', () => {
      const engine = new TransformEngine()
      const t1 = makeTransform({
        id: 't1',
        apply: (source) => ({
          source: source + '\nconsole.log("added")',
          changes: [{ startLine: 2, endLine: 2, original: '', replacement: 'console.log("added")', description: 'add log' }],
          applied: true,
          errors: [],
        }),
      })
      const t2 = makeTransform({
        id: 't2',
        apply: (source) => ({
          source: source.replace('added', 'modified'),
          changes: [{ startLine: 2, endLine: 2, original: 'added', replacement: 'modified', description: 'change log' }],
          applied: true,
          errors: [],
        }),
      })
      const results = engine.applyTransforms('const x = 1', 'test.ts', [t1, t2])
      expect(results[1]!.source).toContain('modified')
      expect(results[1]!.source).not.toContain('added')
    })

    it('should not chain source when dryRun is enabled', () => {
      const engine = new TransformEngine({ dryRun: true })
      const t1 = makeTransform({
        id: 't1',
        apply: (source) => ({
          source: source.replace('a', 'b'),
          changes: [],
          applied: true,
          errors: [],
        }),
      })
      const t2 = makeTransform({
        id: 't2',
        apply: (source) => ({
          source: source.replace('b', 'c'),
          changes: [],
          applied: true,
          errors: [],
        }),
      })
      const results = engine.applyTransforms('abc', 'test.ts', [t1, t2])
      expect(results[1]!.source).toBe('abc')
    })

    it('should return empty array for empty transforms list', () => {
      const engine = new TransformEngine()
      const results = engine.applyTransforms('const x = 1', 'test.ts', [])
      expect(results).toHaveLength(0)
    })

    it('should continue applying transforms after one fails', () => {
      const engine = new TransformEngine()
      const t1 = makeTransform({
        id: 't1',
        apply: () => {
          throw new Error('fail')
        },
      })
      const t2 = makeTransform({
        id: 't2',
        apply: (source) => ({
          source: source + '\n// ok',
          changes: [],
          applied: true,
          errors: [],
        }),
      })
      const results = engine.applyTransforms('const x = 1', 'test.ts', [t1, t2])
      expect(results).toHaveLength(2)
      expect(results[0]!.applied).toBe(false)
      expect(results[1]!.applied).toBe(true)
    })
  })

  describe('applyRecipe', () => {
    it('should apply recipe transforms from registry', () => {
      const engine = new TransformEngine()
      const t1 = makeTransform({ id: 'r1', apply: (s) => makeResult({ source: s, applied: true }) })
      const t2 = makeTransform({ id: 'r2', apply: (s) => makeResult({ source: s, applied: true }) })
      const registry = new Map<string, Transform>([['r1', t1], ['r2', t2]])
      const recipe: TransformRecipe = {
        id: 'recipe-1',
        name: 'Test Recipe',
        description: 'A recipe',
        transforms: ['r1', 'r2'],
        filePatterns: ['**/*.ts'],
      }
      const results = engine.applyRecipe('const x = 1', 'test.ts', recipe, registry)
      expect(results).toHaveLength(2)
    })

    it('should skip transforms not in registry', () => {
      const engine = new TransformEngine()
      const t1 = makeTransform({ id: 'r1', apply: (s) => makeResult({ source: s }) })
      const registry = new Map<string, Transform>([['r1', t1]])
      const recipe: TransformRecipe = {
        id: 'recipe-1',
        name: 'Test Recipe',
        description: 'A recipe',
        transforms: ['r1', 'r2', 'r3'],
        filePatterns: ['**/*.ts'],
      }
      const results = engine.applyRecipe('const x = 1', 'test.ts', recipe, registry)
      expect(results).toHaveLength(1)
    })

    it('should return empty results when recipe has no matching transforms', () => {
      const engine = new TransformEngine()
      const registry = new Map<string, Transform>()
      const recipe: TransformRecipe = {
        id: 'recipe-1',
        name: 'Test Recipe',
        description: 'A recipe',
        transforms: ['missing1', 'missing2'],
        filePatterns: ['**/*.ts'],
      }
      const results = engine.applyRecipe('const x = 1', 'test.ts', recipe, registry)
      expect(results).toHaveLength(0)
    })

    it('should handle empty recipe transforms', () => {
      const engine = new TransformEngine()
      const registry = new Map<string, Transform>()
      const recipe: TransformRecipe = {
        id: 'recipe-1',
        name: 'Empty Recipe',
        description: 'No transforms',
        transforms: [],
        filePatterns: ['**/*.ts'],
      }
      const results = engine.applyRecipe('const x = 1', 'test.ts', recipe, registry)
      expect(results).toHaveLength(0)
    })
  })

  describe('createDiff', () => {
    it('should return empty string for identical inputs', () => {
      const engine = new TransformEngine()
      const diff = engine.createDiff('const x = 1\nconst y = 2', 'const x = 1\nconst y = 2')
      expect(diff).toBe('')
    })

    it('should produce diff for added lines', () => {
      const engine = new TransformEngine()
      const original = 'line1\nline2'
      const modified = 'line1\nline2\nline3'
      const diff = engine.createDiff(original, modified)
      expect(diff).toContain('--- original')
      expect(diff).toContain('+++ modified')
      expect(diff).toContain('+line3')
    })

    it('should produce diff for removed lines', () => {
      const engine = new TransformEngine()
      const original = 'line1\nline2\nline3'
      const modified = 'line1\nline2'
      const diff = engine.createDiff(original, modified)
      expect(diff).toContain('-line3')
    })

    it('should produce diff for modified lines', () => {
      const engine = new TransformEngine()
      const original = 'const x = 1'
      const modified = 'const x = 2'
      const diff = engine.createDiff(original, modified)
      expect(diff).toContain('-const x = 1')
      expect(diff).toContain('+const x = 2')
    })

    it('should include @@ hunks in diff output', () => {
      const engine = new TransformEngine()
      const original = 'a\nb\nc'
      const modified = 'a\nx\nc'
      const diff = engine.createDiff(original, modified)
      expect(diff).toContain('@@')
    })

    it('should handle empty original string', () => {
      const engine = new TransformEngine()
      const diff = engine.createDiff('', 'new content')
      expect(diff).toContain('+new content')
    })

    it('should handle empty modified string', () => {
      const engine = new TransformEngine()
      const diff = engine.createDiff('old content', '')
      expect(diff).toContain('-old content')
    })

    it('should handle both empty strings', () => {
      const engine = new TransformEngine()
      const diff = engine.createDiff('', '')
      expect(diff).toBe('')
    })
  })

  describe('applyTextChanges', () => {
    it('should apply a single text change', () => {
      const engine = new TransformEngine()
      const source = 'line1\nline2\nline3'
      const changes: TextChange[] = [
        { startLine: 2, endLine: 2, original: 'line2', replacement: 'replaced', description: 'replace line2' },
      ]
      const result = engine.applyTextChanges(source, changes)
      expect(result).toBe('line1\nreplaced\nline3')
    })

    it('should apply multiple non-overlapping changes', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc\nd\ne'
      const changes: TextChange[] = [
        { startLine: 1, endLine: 1, original: 'a', replacement: 'A', description: 'd1' },
        { startLine: 3, endLine: 3, original: 'c', replacement: 'C', description: 'd3' },
        { startLine: 5, endLine: 5, original: 'e', replacement: 'E', description: 'd5' },
      ]
      const result = engine.applyTextChanges(source, changes)
      expect(result).toBe('A\nb\nC\nd\nE')
    })

    it('should sort changes by endLine descending before applying', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc\nd\ne'
      const changes: TextChange[] = [
        { startLine: 4, endLine: 5, original: 'd\ne', replacement: 'D\nE', description: 'late' },
        { startLine: 1, endLine: 2, original: 'a\nb', replacement: 'A\nB', description: 'early' },
      ]
      const result = engine.applyTextChanges(source, changes)
      expect(result).toBe('A\nB\nc\nD\nE')
    })

    it('should handle multi-line replacement', () => {
      const engine = new TransformEngine()
      const source = 'line1\nline2\nline3'
      const changes: TextChange[] = [
        { startLine: 1, endLine: 2, original: 'line1\nline2', replacement: 'new1\nnew2\nnew3', description: 'expand' },
      ]
      const result = engine.applyTextChanges(source, changes)
      expect(result).toBe('new1\nnew2\nnew3\nline3')
    })

    it('should handle replacement that removes lines', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc\nd'
      const changes: TextChange[] = [
        { startLine: 2, endLine: 3, original: 'b\nc', replacement: 'X', description: 'collapse' },
      ]
      const result = engine.applyTextChanges(source, changes)
      expect(result).toBe('a\nX\nd')
    })

    it('should handle empty replacement', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc'
      const changes: TextChange[] = [
        { startLine: 2, endLine: 2, original: 'b', replacement: '', description: 'delete' },
      ]
      const result = engine.applyTextChanges(source, changes)
      expect(result).toBe('a\n\nc')
    })
  })

  describe('validateChanges', () => {
    it('should return true for valid non-overlapping changes', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc\nd\ne'
      const changes: TextChange[] = [
        { startLine: 1, endLine: 1, original: 'a', replacement: 'A', description: 'd1' },
        { startLine: 3, endLine: 4, original: 'c\nd', replacement: 'C\nD', description: 'd2' },
      ]
      expect(engine.validateChanges(source, changes)).toBe(true)
    })

    it('should return false for overlapping changes', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc\nd'
      const changes: TextChange[] = [
        { startLine: 1, endLine: 2, original: 'a\nb', replacement: 'X', description: 'd1' },
        { startLine: 2, endLine: 3, original: 'b\nc', replacement: 'Y', description: 'd2' },
      ]
      expect(engine.validateChanges(source, changes)).toBe(false)
    })

    it('should return false when startLine is less than 1', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc'
      const changes: TextChange[] = [
        { startLine: 0, endLine: 1, original: 'a', replacement: 'X', description: 'd1' },
      ]
      expect(engine.validateChanges(source, changes)).toBe(false)
    })

    it('should return false when endLine is less than startLine', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc'
      const changes: TextChange[] = [
        { startLine: 3, endLine: 1, original: '', replacement: '', description: 'd1' },
      ]
      expect(engine.validateChanges(source, changes)).toBe(false)
    })

    it('should return false when startLine exceeds file length', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc'
      const changes: TextChange[] = [
        { startLine: 100, endLine: 100, original: '', replacement: '', description: 'd1' },
      ]
      expect(engine.validateChanges(source, changes)).toBe(false)
    })

    it('should return true for empty changes array', () => {
      const engine = new TransformEngine()
      expect(engine.validateChanges('a\nb\nc', [])).toBe(true)
    })

    it('should return true for single valid change', () => {
      const engine = new TransformEngine()
      const changes: TextChange[] = [
        { startLine: 1, endLine: 3, original: 'a\nb\nc', replacement: 'x', description: 'd1' },
      ]
      expect(engine.validateChanges('a\nb\nc', changes)).toBe(true)
    })

    it('should return true for change at exact end of file', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc'
      const changes: TextChange[] = [
        { startLine: 3, endLine: 3, original: 'c', replacement: 'C', description: 'd1' },
      ]
      expect(engine.validateChanges(source, changes)).toBe(true)
    })

    it('should allow change at lines.length + 1 (append)', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc'
      const changes: TextChange[] = [
        { startLine: 4, endLine: 4, original: '', replacement: 'd', description: 'append' },
      ]
      expect(engine.validateChanges(source, changes)).toBe(true)
    })
  })

  describe('generateReport', () => {
    it('should generate report for empty results', () => {
      const engine = new TransformEngine()
      const results = new Map<string, TransformResult[]>()
      const report = engine.generateReport(results)
      expect(report.transformsApplied).toBe(0)
      expect(report.filesModified).toBe(0)
      expect(report.totalChanges).toBe(0)
    })

    it('should count applied transforms and modified files', () => {
      const engine = new TransformEngine()
      const results = new Map<string, TransformResult[]>([
        ['file1.ts', [
          makeResult({ applied: true, changes: [makeTextChange(1, 1)] }),
          makeResult({ applied: true, changes: [makeTextChange(2, 2)] }),
        ]],
        ['file2.ts', [
          makeResult({ applied: false, changes: [] }),
        ]],
      ])
      const report = engine.generateReport(results)
      expect(report.transformsApplied).toBe(2)
      expect(report.filesModified).toBe(1)
      expect(report.totalChanges).toBe(2)
    })

    it('should count files modified correctly', () => {
      const engine = new TransformEngine()
      const results = new Map<string, TransformResult[]>([
        ['a.ts', [makeResult({ applied: true, changes: [] })]],
        ['b.ts', [makeResult({ applied: true, changes: [] })]],
        ['c.ts', [makeResult({ applied: false, changes: [] })]],
      ])
      const report = engine.generateReport(results)
      expect(report.filesModified).toBe(2)
    })

    it('should include results map in report', () => {
      const engine = new TransformEngine()
      const results = new Map<string, TransformResult[]>([
        ['test.ts', [makeResult({ applied: true })]],
      ])
      const report = engine.generateReport(results)
      expect(report.results).toBe(results)
    })

    it('should count total changes across all files', () => {
      const engine = new TransformEngine()
      const results = new Map<string, TransformResult[]>([
        ['a.ts', [makeResult({ applied: true, changes: [makeTextChange(1, 1), makeTextChange(2, 2)] })]],
        ['b.ts', [makeResult({ applied: true, changes: [makeTextChange(1, 1)] })]],
      ])
      const report = engine.generateReport(results)
      expect(report.totalChanges).toBe(3)
    })
  })
})

describe('TransformParser', () => {
  const parser = new TransformParser()

  describe('findFunctionByName', () => {
    it('should find a regular function declaration', () => {
      const source = 'function greet(name) { return name; }'
      const result = parser.findFunctionByName(source, 'greet')
      expect(result).not.toBeNull()
      expect(result!.start).toBe(0)
      expect(result!.content).toContain('function greet')
    })

    it('should find an exported function', () => {
      const source = 'export function hello() { return 1; }'
      const result = parser.findFunctionByName(source, 'hello')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('export function hello')
    })

    it('should find an async function', () => {
      const source = 'async function fetchData() { return await fetch("/api"); }'
      const result = parser.findFunctionByName(source, 'fetchData')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('async function fetchData')
    })

    it('should find an arrow function with braces', () => {
      const source = 'const add = (a, b) => { return a + b; }'
      const result = parser.findFunctionByName(source, 'add')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('add')
    })

    it('should find an arrow function without braces', () => {
      const source = 'const double = (x) => x * 2'
      const result = parser.findFunctionByName(source, 'double')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('double')
      expect(result!.content).toContain('x * 2')
    })

    it('should return null for non-existent function', () => {
      const source = 'function greet() { return "hi"; }'
      const result = parser.findFunctionByName(source, 'missing')
      expect(result).toBeNull()
    })

    it('should find function with return type annotation', () => {
      const source = 'function getValue(): number { return 42; }'
      const result = parser.findFunctionByName(source, 'getValue')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('getValue')
    })

    it('should find exported async function', () => {
      const source = 'export async function processItems() { return []; }'
      const result = parser.findFunctionByName(source, 'processItems')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('export async function processItems')
    })

    it('should handle nested braces correctly', () => {
      const source = 'function complex() { if (true) { return { a: 1 }; } return null; }'
      const result = parser.findFunctionByName(source, 'complex')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('if (true)')
      expect(result!.content).toContain('return null')
    })
  })

  describe('findClassByName', () => {
    it('should find a regular class', () => {
      const source = 'class Foo { constructor() {} }'
      const result = parser.findClassByName(source, 'Foo')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('class Foo')
    })

    it('should find an exported class', () => {
      const source = 'export class Bar { method() {} }'
      const result = parser.findClassByName(source, 'Bar')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('export class Bar')
    })

    it('should find an abstract class', () => {
      const source = 'abstract class Base { abstract doWork(): void; }'
      const result = parser.findClassByName(source, 'Base')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('abstract class Base')
    })

    it('should find class with extends', () => {
      const source = 'class Child extends Parent { constructor() { super(); } }'
      const result = parser.findClassByName(source, 'Child')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('extends Parent')
    })

    it('should find class with implements', () => {
      const source = 'class Service implements IService { run() {} }'
      const result = parser.findClassByName(source, 'Service')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('implements IService')
    })

    it('should return null for non-existent class', () => {
      const source = 'class Foo {}'
      const result = parser.findClassByName(source, 'Bar')
      expect(result).toBeNull()
    })
  })

  describe('findImportStatements', () => {
    it('should find named imports', () => {
      const source = "import { foo, bar } from 'module'"
      const results = parser.findImportStatements(source)
      expect(results).toHaveLength(1)
      expect(results[0]!.module).toBe('module')
      expect(results[0]!.imports).toContain('foo')
      expect(results[0]!.imports).toContain('bar')
    })

    it('should find default import', () => {
      const source = "import React from 'react'"
      const results = parser.findImportStatements(source)
      expect(results).toHaveLength(1)
      expect(results[0]!.imports).toContain('React')
      expect(results[0]!.module).toBe('react')
    })

    it('should find namespace import', () => {
      const source = "import * as utils from './utils'"
      const results = parser.findImportStatements(source)
      expect(results).toHaveLength(1)
      expect(results[0]!.imports).toContain('* as utils')
      expect(results[0]!.module).toBe('./utils')
    })

    it('should find type import', () => {
      const source = "import type { Config } from './types'"
      const results = parser.findImportStatements(source)
      expect(results).toHaveLength(1)
      expect(results[0]!.imports).toContain('Config')
    })

    it('should find multiple import statements', () => {
      const source = "import { a } from 'x'\nimport { b } from 'y'"
      const results = parser.findImportStatements(source)
      expect(results).toHaveLength(2)
      expect(results[0]!.module).toBe('x')
      expect(results[1]!.module).toBe('y')
    })

    it('should record correct startIndex', () => {
      const source = "// comment\nimport { x } from 'mod'"
      const results = parser.findImportStatements(source)
      expect(results).toHaveLength(1)
      expect(results[0]!.startIndex).toBe(11)
    })

    it('should return empty array for no imports', () => {
      const results = parser.findImportStatements('const x = 1')
      expect(results).toHaveLength(0)
    })

    it('should strip alias from named imports', () => {
      const source = "import { Component as Comp } from 'react'"
      const results = parser.findImportStatements(source)
      expect(results).toHaveLength(1)
      expect(results[0]!.imports).toContain('Component')
    })
  })

  describe('findExportStatements', () => {
    it('should find const export', () => {
      const results = parser.findExportStatements('export const x = 1')
      const found = results.find((e) => e.name === 'x')
      expect(found).toBeDefined()
      expect(found!.type).toBe('named')
    })

    it('should find function export', () => {
      const results = parser.findExportStatements('export function hello() {}')
      const found = results.find((e) => e.name === 'hello')
      expect(found).toBeDefined()
      expect(found!.type).toBe('named')
    })

    it('should find class export', () => {
      const results = parser.findExportStatements('export class Foo {}')
      const found = results.find((e) => e.name === 'Foo')
      expect(found).toBeDefined()
      expect(found!.type).toBe('named')
    })

    it('should find interface export', () => {
      const results = parser.findExportStatements('export interface Config {}')
      const found = results.find((e) => e.name === 'Config')
      expect(found).toBeDefined()
      expect(found!.type).toBe('named')
    })

    it('should find type export', () => {
      const results = parser.findExportStatements('export type Result = string | number')
      const found = results.find((e) => e.name === 'Result')
      expect(found).toBeDefined()
      expect(found!.type).toBe('named')
    })

    it('should find enum export', () => {
      const results = parser.findExportStatements('export enum Color { Red, Green }')
      const found = results.find((e) => e.name === 'Color')
      expect(found).toBeDefined()
      expect(found!.type).toBe('named')
    })

    it('should find default export', () => {
      const results = parser.findExportStatements('export default function main() {}')
      const found = results.find((e) => e.type === 'default')
      expect(found).toBeDefined()
      expect(found!.name).toBe('main')
    })

    it('should find re-exports', () => {
      const results = parser.findExportStatements("export { foo, bar } from './module'")
      const reExports = results.filter((e) => e.type === 're-export')
      expect(reExports).toHaveLength(2)
    })

    it('should return empty array for no exports', () => {
      const results = parser.findExportStatements('const x = 1')
      expect(results).toHaveLength(0)
    })
  })

  describe('findStringLiterals', () => {
    it('should find single-quoted strings', () => {
      const results = parser.findStringLiterals("const x = 'hello'")
      expect(results.length).toBeGreaterThanOrEqual(1)
      const hello = results.find((r) => r.value === 'hello')
      expect(hello).toBeDefined()
      expect(hello!.quote).toBe("'")
    })

    it('should find double-quoted strings', () => {
      const results = parser.findStringLiterals('const x = "world"')
      expect(results.length).toBeGreaterThanOrEqual(1)
      const world = results.find((r) => r.value === 'world')
      expect(world).toBeDefined()
      expect(world!.quote).toBe('"')
    })

    it('should find template literals', () => {
      const results = parser.findStringLiterals('const x = `hello`')
      expect(results.length).toBeGreaterThanOrEqual(1)
      const tpl = results.find((r) => r.quote === '`')
      expect(tpl).toBeDefined()
      expect(tpl!.value).toBe('hello')
    })

    it('should handle strings with escape sequences', () => {
      const results = parser.findStringLiterals("const x = 'it\\'s ok'")
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty array for no strings', () => {
      const results = parser.findStringLiterals('const x = 42')
      expect(results).toHaveLength(0)
    })

    it('should find multiple string literals', () => {
      const results = parser.findStringLiterals("const a = 'one'; const b = 'two'")
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should record correct startIndex', () => {
      const results = parser.findStringLiterals("   'hello'")
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results[0]!.startIndex).toBe(3)
    })
  })

  describe('replaceInRange', () => {
    it('should replace text in specified range', () => {
      const result = parser.replaceInRange('hello world', 0, 5, 'goodbye')
      expect(result).toBe('goodbye world')
    })

    it('should replace at end of string', () => {
      const result = parser.replaceInRange('hello world', 6, 11, 'there')
      expect(result).toBe('hello there')
    })

    it('should handle replacement with empty string', () => {
      const result = parser.replaceInRange('abcdef', 2, 4, '')
      expect(result).toBe('abef')
    })

    it('should handle replacement longer than original', () => {
      const result = parser.replaceInRange('ab', 0, 1, 'XYZ')
      expect(result).toBe('XYZb')
    })
  })

  describe('addImport', () => {
    it('should add new module import when no imports exist', () => {
      const source = 'const x = 1'
      const result = parser.addImport(source, 'lodash', ['debounce'])
      expect(result).toContain("import { debounce } from 'lodash'")
    })

    it('should merge with existing import from same module', () => {
      const source = "import { foo } from 'utils'"
      const result = parser.addImport(source, 'utils', ['bar'])
      expect(result).toContain('foo')
      expect(result).toContain('bar')
      expect(result).toContain("import { foo, bar } from 'utils'")
    })

    it('should not duplicate existing imports when merging', () => {
      const source = "import { foo } from 'utils'"
      const result = parser.addImport(source, 'utils', ['foo'])
      expect(result.match(/import/g)).toHaveLength(1)
    })

    it('should add import before existing import from different module', () => {
      const source = "import { a } from 'alpha'"
      const result = parser.addImport(source, 'beta', ['b'])
      expect(result.indexOf('beta')).toBeLessThan(result.indexOf('alpha'))
    })

    it('should add import after leading comments', () => {
      const source = '// file header\nconst x = 1'
      const result = parser.addImport(source, 'mod', ['val'])
      expect(result).toContain("import { val } from 'mod'")
      expect(result.indexOf('import')).toBeGreaterThan(0)
    })

    it('should add import at top when source is empty', () => {
      const result = parser.addImport('', 'mod', ['x'])
      expect(result).toContain("import { x } from 'mod'")
    })

    it('should add multiple named imports', () => {
      const source = 'const x = 1'
      const result = parser.addImport(source, 'mod', ['a', 'b', 'c'])
      expect(result).toContain("import { a, b, c } from 'mod'")
    })
  })

  describe('removeImport', () => {
    it('should remove an existing import', () => {
      const source = "import { foo } from 'utils'\nconst x = 1"
      const result = parser.removeImport(source, 'utils')
      expect(result).not.toContain('import')
      expect(result).toContain('const x = 1')
    })

    it('should return unchanged source for non-existent import', () => {
      const source = "import { foo } from 'utils'\nconst x = 1"
      const result = parser.removeImport(source, 'nonexistent')
      expect(result).toBe(source)
    })

    it('should remove only the target import when multiple exist', () => {
      const source = "import { a } from 'alpha'\nimport { b } from 'beta'\nconst x = 1"
      const result = parser.removeImport(source, 'alpha')
      expect(result).not.toContain("from 'alpha'")
      expect(result).toContain("from 'beta'")
    })

    it('should handle removing the last import', () => {
      const source = "import { x } from 'mod'"
      const result = parser.removeImport(source, 'mod')
      expect(result.trim()).toBe('')
    })
  })

  describe('addExport', () => {
    it('should add named export when no exports exist', () => {
      const source = 'const foo = 1'
      const result = parser.addExport(source, 'foo', 'named')
      expect(result).toContain('export { foo }')
    })

    it('should add default export', () => {
      const source = 'const main = () => {}'
      const result = parser.addExport(source, 'main', 'default')
      expect(result).toContain('export default main')
    })

    it('should add named export when other named exports exist', () => {
      const source = 'export const a = 1\nexport const b = 2'
      const result = parser.addExport(source, 'c', 'named')
      expect(result).toContain('export { c }')
    })

    it('should add default export at end of file', () => {
      const source = 'const app = createApp()'
      const result = parser.addExport(source, 'app', 'default')
      expect(result.endsWith('export default app\n')).toBe(true)
    })
  })
})

describe('DEFAULT_TRANSFORM_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_TRANSFORM_CONFIG.dryRun).toBe(false)
    expect(DEFAULT_TRANSFORM_CONFIG.maxFileSize).toBe(100000)
    expect(DEFAULT_TRANSFORM_CONFIG.filePatterns).toEqual(['**/*.ts', '**/*.js'])
    expect(DEFAULT_TRANSFORM_CONFIG.ignorePatterns).toEqual(['node_modules/**', 'dist/**'])
  })
})

function makeTextChange(startLine: number, endLine: number): TextChange {
  return { startLine, endLine, original: '', replacement: '', description: `change ${startLine}-${endLine}` }
}
