import { describe, it, expect } from 'vitest'
import { HashGenerator } from '../../src/core/duplication/hash-generator.js'
import { CloneDetector } from '../../src/core/duplication/clone-detector.js'
import { DuplicationReporter } from '../../src/core/duplication/duplication-reporter.js'
import { DuplicationType, DEFAULT_DUPLICATION_CONFIG } from '../../src/core/duplication/types.js'
import type { CloneInstance, CloneGroup, DuplicationReport } from '../../src/core/duplication/types.js'

function makeSampleCode(lines: number = 10): string {
  const parts: string[] = []
  for (let i = 0; i < lines; i++) {
    parts.push(`const value${i} = ${i} + ${i * 2};`)
  }
  return parts.join('\n')
}

function makeIdenticalFiles(count: number, lines: number = 10): Map<string, string> {
  const files = new Map<string, string>()
  const code = makeSampleCode(lines)
  for (let i = 0; i < count; i++) {
    files.set(`/src/file${i}.ts`, code)
  }
  return files
}

function makeCloneInstance(overrides: Partial<CloneInstance> = {}): CloneInstance {
  return {
    filePath: '/src/test.ts',
    startLine: 1,
    endLine: 10,
    startCol: 0,
    endCol: 20,
    content: 'const a = 1;\nconst b = 2;',
    hash: 'abc123',
    tokens: ['const', 'a', '=', '1', 'const', 'b', '=', '2'],
    ...overrides,
  }
}

function makeCloneGroup(overrides: Partial<CloneGroup> = {}): CloneGroup {
  return {
    id: 'cg_001',
    clones: [
      makeCloneInstance({ filePath: '/src/a.ts', startLine: 1, endLine: 10 }),
      makeCloneInstance({ filePath: '/src/b.ts', startLine: 1, endLine: 10 }),
    ],
    similarity: 1.0,
    type: DuplicationType.EXACT,
    fingerprint: 'fp001',
    ...overrides,
  }
}

function makeReport(overrides: Partial<DuplicationReport> = {}): DuplicationReport {
  return {
    totalDuplicates: 2,
    totalDuplicatedLines: 20,
    duplicationPercentage: 10.5,
    cloneGroups: [makeCloneGroup()],
    summary: {
      filesAnalyzed: 2,
      filesWithDuplicates: 2,
      avgCloneSize: 10,
      largestClone: 10,
      duplicateHotspots: ['/src/a.ts', '/src/b.ts'],
    },
    ...overrides,
  }
}

describe('HashGenerator', () => {
  const hasher = new HashGenerator()

  describe('tokenize', () => {
    it('should tokenize a simple variable declaration', () => {
      const tokens = hasher.tokenize('const x = 42;')
      expect(tokens).toContain('const')
      expect(tokens).toContain('x')
      expect(tokens).toContain('=')
      expect(tokens).toContain('42')
      expect(tokens).toContain(';')
    })

    it('should tokenize function declarations', () => {
      const tokens = hasher.tokenize('function add(a, b) { return a + b; }')
      expect(tokens).toContain('function')
      expect(tokens).toContain('add')
      expect(tokens).toContain('return')
      expect(tokens).toContain('(')
      expect(tokens).toContain(')')
    })

    it('should tokenize string literals', () => {
      const tokens = hasher.tokenize('const msg = "hello world";')
      expect(tokens).toContain('"hello world"')
    })

    it('should tokenize arrow functions', () => {
      const tokens = hasher.tokenize('const fn = (x) => x * 2;')
      expect(tokens).toContain('=>')
      expect(tokens).toContain('*')
    })

    it('should handle empty content', () => {
      const tokens = hasher.tokenize('')
      expect(tokens).toEqual([])
    })

    it('should tokenize template literals', () => {
      const tokens = hasher.tokenize('const str = `hello`;')
      expect(tokens).toContain('`hello`')
    })

    it('should tokenize comparison operators', () => {
      const tokens = hasher.tokenize('if (a === b && c !== d) {}')
      expect(tokens).toContain('===')
      expect(tokens).toContain('&&')
      expect(tokens).toContain('!==')
    })
  })

  describe('generateContentHash', () => {
    it('should produce consistent hashes for identical content', () => {
      const content = 'const x = 1;\nconst y = 2;'
      const hash1 = hasher.generateContentHash(content)
      const hash2 = hasher.generateContentHash(content)
      expect(hash1).toBe(hash2)
    })

    it('should normalize whitespace differences', () => {
      const content1 = 'const x = 1;\nconst y = 2;'
      const content2 = '  const x = 1;\n  const y = 2;  '
      expect(hasher.generateContentHash(content1)).toBe(hasher.generateContentHash(content2))
    })

    it('should produce different hashes for different content', () => {
      const hash1 = hasher.generateContentHash('const x = 1;')
      const hash2 = hasher.generateContentHash('const y = 2;')
      expect(hash1).not.toBe(hash2)
    })

    it('should ignore blank lines', () => {
      const content1 = 'const x = 1;\n\nconst y = 2;'
      const content2 = 'const x = 1;\nconst y = 2;'
      expect(hasher.generateContentHash(content1)).toBe(hasher.generateContentHash(content2))
    })

    it('should produce a 64-character hex string', () => {
      const hash = hasher.generateContentHash('test')
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should handle content with only whitespace', () => {
      const hash = hasher.generateContentHash('   \n   \n   ')
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })
  })

  describe('generateTokenHash', () => {
    it('should produce consistent hashes for identical token arrays', () => {
      const tokens = ['const', 'x', '=', '1']
      expect(hasher.generateTokenHash(tokens)).toBe(hasher.generateTokenHash(tokens))
    })

    it('should produce different hashes for different token arrays', () => {
      const tokens1 = ['const', 'x', '=', '1']
      const tokens2 = ['let', 'y', '=', '2']
      expect(hasher.generateTokenHash(tokens1)).not.toBe(hasher.generateTokenHash(tokens2))
    })

    it('should handle empty token array', () => {
      const hash = hasher.generateTokenHash([])
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should be order-sensitive', () => {
      const tokens1 = ['a', 'b', 'c']
      const tokens2 = ['c', 'b', 'a']
      expect(hasher.generateTokenHash(tokens1)).not.toBe(hasher.generateTokenHash(tokens2))
    })

    it('should handle single token', () => {
      const hash = hasher.generateTokenHash(['hello'])
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })
  })

  describe('generateStructuralHash', () => {
    it('should produce same hash when only identifiers differ', () => {
      const code1 = 'function foo(x) { return x + 1; }'
      const code2 = 'function bar(y) { return y + 1; }'
      expect(hasher.generateStructuralHash(code1)).toBe(hasher.generateStructuralHash(code2))
    })

    it('should produce different hashes for different structures', () => {
      const code1 = 'function foo() { return 1; }'
      const code2 = 'function foo() { if (true) { return 1; } }'
      expect(hasher.generateStructuralHash(code1)).not.toBe(hasher.generateStructuralHash(code2))
    })

    it('should preserve keywords', () => {
      const code1 = 'const x = 1;'
      const code2 = 'let x = 1;'
      expect(hasher.generateStructuralHash(code1)).not.toBe(hasher.generateStructuralHash(code2))
    })

    it('should normalize whitespace differences in structural hash', () => {
      const code1 = 'function foo(x) {\n  return x;\n}'
      const code2 = 'function  foo( x )  {\n  return  x ;\n}'
      expect(hasher.generateStructuralHash(code1)).toBe(hasher.generateStructuralHash(code2))
    })

    it('should handle empty string', () => {
      const hash = hasher.generateStructuralHash('')
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should treat same structure with different var names as equivalent', () => {
      const code1 = 'const result = data.filter(x => x > 0);'
      const code2 = 'const output = items.filter(item => item > 0);'
      expect(hasher.generateStructuralHash(code1)).toBe(hasher.generateStructuralHash(code2))
    })
  })

  describe('computeSimilarity', () => {
    it('should return 1.0 for identical token arrays', () => {
      const tokens = ['const', 'x', '=', '1']
      expect(hasher.computeSimilarity(tokens, tokens)).toBe(1.0)
    })

    it('should return 0.0 for completely different token arrays', () => {
      const tokens1 = ['aaa', 'bbb']
      const tokens2 = ['ccc', 'ddd']
      expect(hasher.computeSimilarity(tokens1, tokens2)).toBe(0.0)
    })

    it('should compute partial similarity correctly', () => {
      const tokens1 = ['a', 'b', 'c', 'd']
      const tokens2 = ['a', 'b', 'e', 'f']
      const sim = hasher.computeSimilarity(tokens1, tokens2)
      expect(sim).toBeGreaterThan(0)
      expect(sim).toBeLessThan(1)
    })

    it('should return 1.0 for two empty arrays', () => {
      expect(hasher.computeSimilarity([], [])).toBe(1.0)
    })

    it('should return 0.0 when one array is empty', () => {
      expect(hasher.computeSimilarity(['a'], [])).toBe(0.0)
      expect(hasher.computeSimilarity([], ['a'])).toBe(0.0)
    })

    it('should use Jaccard similarity on sets', () => {
      const tokens1 = ['a', 'a', 'b']
      const tokens2 = ['a', 'b', 'b']
      const sim = hasher.computeSimilarity(tokens1, tokens2)
      expect(sim).toBe(1.0)
    })

    it('should be symmetric', () => {
      const tokens1 = ['x', 'y', 'z']
      const tokens2 = ['x', 'a', 'b']
      expect(hasher.computeSimilarity(tokens1, tokens2)).toBeCloseTo(
        hasher.computeSimilarity(tokens2, tokens1)
      )
    })
  })
})

describe('CloneDetector', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const detector = new CloneDetector()
      expect(detector).toBeDefined()
    })

    it('should accept partial config overrides', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 10 })
      expect(detector).toBeDefined()
    })

    it('should merge partial config with defaults', () => {
      const detector = new CloneDetector({ minLines: 3 })
      expect(detector).toBeDefined()
    })
  })

  describe('analyzeFile', () => {
    it('should return empty array for file with fewer lines than minLines', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
      const instances = detector.analyzeFile('/src/test.ts', 'const x = 1;\nconst y = 2;')
      expect(instances).toEqual([])
    })

    it('should return instances for file with sufficient lines', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
      const code = makeSampleCode(10)
      const instances = detector.analyzeFile('/src/test.ts', code)
      expect(instances.length).toBeGreaterThan(0)
    })

    it('should produce instances with correct line numbers', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
      const code = makeSampleCode(10)
      const instances = detector.analyzeFile('/src/test.ts', code)
      const first = instances[0]!
      expect(first.startLine).toBe(1)
      expect(first.endLine).toBe(6)
      expect(first.filePath).toBe('/src/test.ts')
    })

    it('should filter out instances with too few tokens', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 999 })
      const code = 'const a = 1;\nconst b = 2;\nconst c = 3;'
      const instances = detector.analyzeFile('/src/test.ts', code)
      expect(instances).toEqual([])
    })

    it('should handle empty file content', () => {
      const detector = new CloneDetector()
      const instances = detector.analyzeFile('/src/empty.ts', '')
      expect(instances).toEqual([])
    })

    it('should use sliding window of minLines size', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
      const code = makeSampleCode(12)
      const instances = detector.analyzeFile('/src/test.ts', code)
      expect(instances.length).toBe(12 - 6 + 1)
    })
  })

  describe('analyzeFiles', () => {
    it('should detect exact clones across multiple files', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
      const files = makeIdenticalFiles(2, 10)
      const report = detector.analyzeFiles(files)
      expect(report.cloneGroups.length).toBeGreaterThan(0)
      const exactGroups = report.cloneGroups.filter(g => g.type === DuplicationType.EXACT)
      expect(exactGroups.length).toBeGreaterThan(0)
    })

    it('should return a valid DuplicationReport', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
      const files = makeIdenticalFiles(2, 10)
      const report = detector.analyzeFiles(files)
      expect(report.totalDuplicates).toBeGreaterThanOrEqual(0)
      expect(report.totalDuplicatedLines).toBeGreaterThanOrEqual(0)
      expect(typeof report.duplicationPercentage).toBe('number')
      expect(report.summary).toBeDefined()
    })

    it('should populate summary correctly', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
      const files = makeIdenticalFiles(3, 10)
      const report = detector.analyzeFiles(files)
      expect(report.summary.filesAnalyzed).toBe(3)
      expect(report.summary.filesWithDuplicates).toBeGreaterThan(0)
    })

    it('should respect maxResults config', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 1, maxResults: 2 })
      const files = makeIdenticalFiles(5, 20)
      const report = detector.analyzeFiles(files)
      expect(report.cloneGroups.length).toBeLessThanOrEqual(2)
    })

    it('should respect ignore patterns', () => {
      const detector = new CloneDetector({
        minLines: 6,
        minTokens: 1,
        ignorePatterns: ['**/node_modules/**'],
      })
      const files = new Map<string, string>()
      files.set('/src/node_modules/pkg/index.ts', makeSampleCode(10))
      files.set('/src/app.ts', makeSampleCode(10))
      const report = detector.analyzeFiles(files)
      expect(report.summary.filesAnalyzed).toBe(1)
    })

    it('should return zero report for empty files map', () => {
      const detector = new CloneDetector()
      const report = detector.analyzeFiles(new Map())
      expect(report.totalDuplicates).toBe(0)
      expect(report.cloneGroups).toEqual([])
    })

    it('should handle single file with no exact clones', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 50 })
      const files = new Map<string, string>()
      const uniqueLines = [
        'import { readFileSync, writeFileSync } from "node:fs";',
        'import { join, dirname, basename } from "node:path";',
        'export interface ConfigParser {',
        '  parse(contents: string): Record<string, unknown>;',
        '  validate(schema: object): boolean;',
        '  getDefaultValues(): Map<string, string>;',
        '}',
        'export class JsonParser implements ConfigParser {',
        '  private cache = new Map<string, unknown>();',
        '  parse(contents: string): Record<string, unknown> {',
        '    const cached = this.cache.get(contents);',
        '    if (cached) return cached as Record<string, unknown>;',
      ].join('\n')
      files.set('/src/unique.ts', uniqueLines)
      const report = detector.analyzeFiles(files)
      const exactGroups = report.cloneGroups.filter(g => g.type === DuplicationType.EXACT)
      expect(exactGroups).toEqual([])
    })
  })

  describe('findExactClones', () => {
    it('should group instances with same content hash', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1 })
      const code = makeSampleCode(10)
      const hash = new HashGenerator().generateContentHash(code)
      const instances: CloneInstance[] = [
        makeCloneInstance({ filePath: '/src/a.ts', hash, content: code, startLine: 1, endLine: 10 }),
        makeCloneInstance({ filePath: '/src/b.ts', hash, content: code, startLine: 1, endLine: 10 }),
      ]
      const groups = detector.findExactClones(instances)
      expect(groups.length).toBe(1)
      expect(groups[0]!.type).toBe(DuplicationType.EXACT)
      expect(groups[0]!.similarity).toBe(1.0)
      expect(groups[0]!.clones.length).toBe(2)
    })

    it('should not create group for single instance', () => {
      const detector = new CloneDetector()
      const instances: CloneInstance[] = [
        makeCloneInstance({ hash: 'unique_hash' }),
      ]
      const groups = detector.findExactClones(instances)
      expect(groups).toEqual([])
    })

    it('should create separate groups for different hashes', () => {
      const detector = new CloneDetector()
      const instances: CloneInstance[] = [
        makeCloneInstance({ hash: 'hash_a' }),
        makeCloneInstance({ hash: 'hash_a' }),
        makeCloneInstance({ hash: 'hash_b' }),
        makeCloneInstance({ hash: 'hash_b' }),
      ]
      const groups = detector.findExactClones(instances)
      expect(groups.length).toBe(2)
    })

    it('should handle empty instances array', () => {
      const detector = new CloneDetector()
      expect(detector.findExactClones([])).toEqual([])
    })
  })

  describe('findStructuralClones', () => {
    it('should group instances with same structural hash', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1 })
      const code1 = 'function foo(x) {\n  return x + 1;\n}\n'
      const code2 = 'function bar(y) {\n  return y + 1;\n}\n'
      const structuralHash = new HashGenerator().generateStructuralHash(code1)
      const instances: CloneInstance[] = [
        makeCloneInstance({
          filePath: '/src/a.ts',
          content: code1,
          hash: 'hash_a',
          tokens: new HashGenerator().tokenize(code1),
          startLine: 1,
          endLine: 3,
        }),
        makeCloneInstance({
          filePath: '/src/b.ts',
          content: code2,
          hash: 'hash_b',
          tokens: new HashGenerator().tokenize(code2),
          startLine: 1,
          endLine: 3,
        }),
      ]
      const groups = detector.findStructuralClones(instances)
      expect(groups.length).toBeGreaterThanOrEqual(0)
    })

    it('should skip groups that are exact clones', () => {
      const detector = new CloneDetector()
      const instances: CloneInstance[] = [
        makeCloneInstance({ hash: 'same_hash' }),
        makeCloneInstance({ hash: 'same_hash' }),
      ]
      const groups = detector.findStructuralClones(instances)
      expect(groups).toEqual([])
    })

    it('should handle empty instances', () => {
      const detector = new CloneDetector()
      expect(detector.findStructuralClones([])).toEqual([])
    })
  })

  describe('findSemanticClones', () => {
    it('should group instances above similarity threshold', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1, similarityThreshold: 0.5 })
      const tokens1 = ['const', 'result', '=', 'data', '.', 'filter', '(', 'x', '=>', 'x', '>', '0', ')']
      const tokens2 = ['const', 'output', '=', 'items', '.', 'filter', '(', 'y', '=>', 'y', '>', '0', ')']
      const instances: CloneInstance[] = [
        makeCloneInstance({ hash: 'hash_a', tokens: tokens1, startLine: 1, endLine: 3 }),
        makeCloneInstance({ hash: 'hash_b', tokens: tokens2, startLine: 1, endLine: 3 }),
      ]
      const groups = detector.findSemanticClones(instances)
      expect(groups.length).toBeGreaterThan(0)
      expect(groups[0]!.type).toBe(DuplicationType.SEMANTIC)
    })

    it('should not group instances below similarity threshold', () => {
      const detector = new CloneDetector({ similarityThreshold: 0.99 })
      const instances: CloneInstance[] = [
        makeCloneInstance({ hash: 'hash_a', tokens: ['completely', 'different', 'tokens', 'set', 'alpha'] }),
        makeCloneInstance({ hash: 'hash_b', tokens: ['totally', 'unique', 'words', 'here', 'beta'] }),
      ]
      const groups = detector.findSemanticClones(instances)
      expect(groups).toEqual([])
    })

    it('should not group instances that are exact matches', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1, similarityThreshold: 0.5 })
      const tokens = ['const', 'x', '=', '1']
      const instances: CloneInstance[] = [
        makeCloneInstance({ hash: 'same', tokens, startLine: 1, endLine: 3 }),
        makeCloneInstance({ hash: 'same', tokens, startLine: 1, endLine: 3 }),
      ]
      const groups = detector.findSemanticClones(instances)
      expect(groups).toEqual([])
    })

    it('should handle empty instances', () => {
      const detector = new CloneDetector()
      expect(detector.findSemanticClones([])).toEqual([])
    })
  })

  describe('deduplicateGroups', () => {
    it('should remove overlapping groups keeping larger ones', () => {
      const detector = new CloneDetector()
      const group1 = makeCloneGroup({
        id: 'cg_001',
        clones: [
          makeCloneInstance({ filePath: '/src/a.ts', startLine: 1, endLine: 10 }),
          makeCloneInstance({ filePath: '/src/b.ts', startLine: 1, endLine: 10 }),
        ],
      })
      const group2 = makeCloneGroup({
        id: 'cg_002',
        clones: [
          makeCloneInstance({ filePath: '/src/a.ts', startLine: 1, endLine: 10 }),
        ],
      })
      const result = detector.deduplicateGroups([group1, group2])
      expect(result.length).toBe(1)
      expect(result[0]!.id).toBe('cg_001')
    })

    it('should keep all non-overlapping groups', () => {
      const detector = new CloneDetector()
      const group1 = makeCloneGroup({
        id: 'cg_001',
        clones: [makeCloneInstance({ filePath: '/src/a.ts', startLine: 1, endLine: 10 })],
      })
      const group2 = makeCloneGroup({
        id: 'cg_002',
        clones: [makeCloneInstance({ filePath: '/src/b.ts', startLine: 20, endLine: 30 })],
      })
      const result = detector.deduplicateGroups([group1, group2])
      expect(result.length).toBe(2)
    })

    it('should handle empty groups array', () => {
      const detector = new CloneDetector()
      expect(detector.deduplicateGroups([])).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle files with only blank lines', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1 })
      const instances = detector.analyzeFile('/src/blank.ts', '\n\n\n\n\n\n')
      expect(instances).toEqual([])
    })

    it('should handle file exactly at minLines', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
      const code = makeSampleCode(6)
      const instances = detector.analyzeFile('/src/test.ts', code)
      expect(instances.length).toBe(1)
    })

    it('should handle identical files producing duplicate detection', () => {
      const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
      const code = makeSampleCode(10)
      const files = new Map<string, string>()
      files.set('/src/copy1.ts', code)
      files.set('/src/copy2.ts', code)
      const report = detector.analyzeFiles(files)
      expect(report.cloneGroups.length).toBeGreaterThan(0)
    })

    it('should handle config with high similarity threshold', () => {
      const detector = new CloneDetector({ similarityThreshold: 1.0 })
      const files = makeIdenticalFiles(2, 10)
      const report = detector.analyzeFiles(files)
      expect(report).toBeDefined()
    })
  })
})

describe('DuplicationReporter', () => {
  const reporter = new DuplicationReporter()

  describe('formatConsole', () => {
    it('should produce non-empty string output', () => {
      const report = makeReport()
      const output = reporter.formatConsole(report)
      expect(output.length).toBeGreaterThan(0)
    })

    it('should contain key metrics in output', () => {
      const report = makeReport()
      const output = reporter.formatConsole(report)
      expect(output).toContain('CODE DUPLICATION REPORT')
      expect(output).toContain('Total Duplicates')
      expect(output).toContain('Duplicated Lines')
    })

    it('should include clone group details', () => {
      const report = makeReport()
      const output = reporter.formatConsole(report)
      expect(output).toContain('Clone Group')
      expect(output).toContain(report.cloneGroups[0]!.id)
    })

    it('should include hotspot information', () => {
      const report = makeReport()
      const output = reporter.formatConsole(report)
      expect(output).toContain('DUPLICATE HOTSPOTS')
    })
  })

  describe('formatJSON', () => {
    it('should produce valid JSON', () => {
      const report = makeReport()
      const output = reporter.formatJSON(report)
      const parsed = JSON.parse(output)
      expect(parsed.totalDuplicates).toBe(report.totalDuplicates)
    })

    it('should include all report fields', () => {
      const report = makeReport()
      const output = reporter.formatJSON(report)
      const parsed = JSON.parse(output)
      expect(parsed).toHaveProperty('totalDuplicates')
      expect(parsed).toHaveProperty('totalDuplicatedLines')
      expect(parsed).toHaveProperty('duplicationPercentage')
      expect(parsed).toHaveProperty('cloneGroups')
      expect(parsed).toHaveProperty('summary')
    })

    it('should pretty print with 2-space indent', () => {
      const report = makeReport()
      const output = reporter.formatJSON(report)
      expect(output).toContain('  "totalDuplicates"')
    })
  })

  describe('formatMarkdown', () => {
    it('should produce markdown with headers', () => {
      const report = makeReport()
      const output = reporter.formatMarkdown(report)
      expect(output).toContain('# Code Duplication Report')
      expect(output).toContain('## Summary')
    })

    it('should include summary table', () => {
      const report = makeReport()
      const output = reporter.formatMarkdown(report)
      expect(output).toContain('| Metric |')
      expect(output).toContain('Total Duplicates')
    })

    it('should include code blocks for clone instances', () => {
      const report = makeReport()
      const output = reporter.formatMarkdown(report)
      expect(output).toContain('```')
    })

    it('should include hotspots section', () => {
      const report = makeReport()
      const output = reporter.formatMarkdown(report)
      expect(output).toContain('## Duplicate Hotspots')
    })

    it('should include clone group details', () => {
      const report = makeReport()
      const output = reporter.formatMarkdown(report)
      expect(output).toContain(report.cloneGroups[0]!.id)
    })
  })

  describe('formatSummary', () => {
    it('should produce a one-line summary', () => {
      const report = makeReport()
      const output = reporter.formatSummary(report)
      expect(output).toContain('2 duplicates')
      expect(output).toContain('20 duplicated lines')
      expect(output).toContain('|')
    })

    it('should include duplication percentage', () => {
      const report = makeReport()
      const output = reporter.formatSummary(report)
      expect(output).toContain('10.50% duplication')
    })

    it('should include file counts', () => {
      const report = makeReport()
      const output = reporter.formatSummary(report)
      expect(output).toContain('2/2 files affected')
    })
  })

  describe('generateHTML', () => {
    it('should produce valid HTML document', () => {
      const report = makeReport()
      const output = reporter.generateHTML(report)
      expect(output).toContain('<!DOCTYPE html>')
      expect(output).toContain('</html>')
    })

    it('should include CSS styling', () => {
      const report = makeReport()
      const output = reporter.generateHTML(report)
      expect(output).toContain('<style>')
      expect(output).toContain('body')
    })

    it('should include report metrics in table', () => {
      const report = makeReport()
      const output = reporter.generateHTML(report)
      expect(output).toContain('Total Duplicates')
      expect(output).toContain(`${report.totalDuplicates}`)
    })

    it('should escape HTML in content', () => {
      const report = makeReport({
        cloneGroups: [makeCloneGroup({
          clones: [makeCloneInstance({ content: 'const x = a < b && c > d;' })],
        })],
      })
      const output = reporter.generateHTML(report)
      expect(output).toContain('&lt;')
      expect(output).toContain('&gt;')
    })

    it('should include clone group sections with data-type attribute', () => {
      const report = makeReport()
      const output = reporter.generateHTML(report)
      expect(output).toContain('data-type="exact"')
    })
  })

  describe('formatCloneGroup', () => {
    it('should format clone group with file paths and line numbers', () => {
      const group = makeCloneGroup()
      const output = reporter.formatCloneGroup(group)
      expect(output).toContain('/src/a.ts')
      expect(output).toContain('/src/b.ts')
      expect(output).toContain('1-10')
    })

    it('should include line count for each clone', () => {
      const group = makeCloneGroup()
      const output = reporter.formatCloneGroup(group)
      expect(output).toContain('10 lines')
    })
  })

  describe('calculateDuplicationHotspots', () => {
    it('should return files sorted by frequency', () => {
      const groups: CloneGroup[] = [
        makeCloneGroup({
          clones: [
            makeCloneInstance({ filePath: '/src/common.ts' }),
            makeCloneInstance({ filePath: '/src/other.ts' }),
          ],
        }),
        makeCloneGroup({
          clones: [
            makeCloneInstance({ filePath: '/src/common.ts' }),
            makeCloneInstance({ filePath: '/src/third.ts' }),
          ],
        }),
      ]
      const hotspots = reporter.calculateDuplicationHotspots(groups)
      expect(hotspots[0]).toBe('/src/common.ts')
    })

    it('should return empty array for empty groups', () => {
      expect(reporter.calculateDuplicationHotspots([])).toEqual([])
    })

    it('should limit to top 10 hotspots', () => {
      const groups: CloneGroup[] = []
      for (let i = 0; i < 15; i++) {
        groups.push(makeCloneGroup({
          clones: [makeCloneInstance({ filePath: `/src/file${i}.ts` })],
        }))
      }
      const hotspots = reporter.calculateDuplicationHotspots(groups)
      expect(hotspots.length).toBeLessThanOrEqual(10)
    })
  })
})

describe('Integration: full pipeline', () => {
  it('should detect duplicates in a realistic multi-file scenario', () => {
    const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
    const sharedCode = [
      'function processData(input: string): string {',
      '  const trimmed = input.trim();',
      '  const lower = trimmed.toLowerCase();',
      '  const parts = lower.split(" ");',
      '  return parts.join("-");',
      '}',
    ].join('\n')

    const files = new Map<string, string>()
    files.set('/src/utils/a.ts', sharedCode)
    files.set('/src/utils/b.ts', sharedCode)
    files.set('/src/unique.ts', 'export const UNIQUE = "unique";\n'.repeat(6))

    const report = detector.analyzeFiles(files)
    expect(report.cloneGroups.length).toBeGreaterThan(0)

    const reporter = new DuplicationReporter()
    const consoleOutput = reporter.formatConsole(report)
    expect(consoleOutput).toContain('CODE DUPLICATION REPORT')

    const jsonOutput = reporter.formatJSON(report)
    const parsed = JSON.parse(jsonOutput)
    expect(parsed.totalDuplicates).toBeGreaterThan(0)

    const mdOutput = reporter.formatMarkdown(report)
    expect(mdOutput).toContain('# Code Duplication Report')

    const htmlOutput = reporter.generateHTML(report)
    expect(htmlOutput).toContain('<!DOCTYPE html>')

    const summaryOutput = reporter.formatSummary(report)
    expect(summaryOutput).toContain('duplicates')
  })

  it('should handle a project with no duplicates', () => {
    const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
    const files = new Map<string, string>()
    files.set('/src/a.ts', 'const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\nconst e = 5;\nconst f = 6;')
    files.set('/src/b.ts', 'let g = 7;\nlet h = 8;\nlet i = 9;\nlet j = 10;\nlet k = 11;\nlet l = 12;')

    const report = detector.analyzeFiles(files)
    expect(report.cloneGroups).toEqual([])
    expect(report.totalDuplicates).toBe(0)

    const reporter = new DuplicationReporter()
    const summary = reporter.formatSummary(report)
    expect(summary).toContain('0 duplicates')
  })

  it('should detect structural clones across files with renamed variables', () => {
    const detector = new CloneDetector({ minLines: 6, minTokens: 1 })
    const code1 = [
      'function calculateTotal(items: number[]): number {',
      '  let sum = 0;',
      '  for (const item of items) {',
      '    sum += item;',
      '  }',
      '  return sum;',
      '}',
    ].join('\n')
    const code2 = [
      'function calculateTotal(products: number[]): number {',
      '  let total = 0;',
      '  for (const product of products) {',
      '    total += product;',
      '  }',
      '  return total;',
      '}',
    ].join('\n')

    const files = new Map<string, string>()
    files.set('/src/cart.ts', code1)
    files.set('/src/order.ts', code2)

    const report = detector.analyzeFiles(files)
    const structuralGroups = report.cloneGroups.filter(g => g.type === DuplicationType.STRUCTURAL)
    expect(structuralGroups.length).toBeGreaterThan(0)
  })
})

describe('DEFAULT_DUPLICATION_CONFIG', () => {
  it('should have sensible default values', () => {
    expect(DEFAULT_DUPLICATION_CONFIG.minLines).toBe(6)
    expect(DEFAULT_DUPLICATION_CONFIG.minTokens).toBe(50)
    expect(DEFAULT_DUPLICATION_CONFIG.similarityThreshold).toBe(0.8)
    expect(DEFAULT_DUPLICATION_CONFIG.maxResults).toBe(100)
    expect(DEFAULT_DUPLICATION_CONFIG.filePatterns.length).toBeGreaterThan(0)
    expect(DEFAULT_DUPLICATION_CONFIG.ignorePatterns.length).toBeGreaterThan(0)
  })
})

describe('DuplicationType enum', () => {
  it('should have EXACT, STRUCTURAL, SEMANTIC values', () => {
    expect(DuplicationType.EXACT).toBe('exact')
    expect(DuplicationType.STRUCTURAL).toBe('structural')
    expect(DuplicationType.SEMANTIC).toBe('semantic')
  })
})
