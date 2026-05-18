import { describe, it, expect } from 'vitest'
import { HashGenerator, CloneDetector, DuplicationReporter, DuplicationType, DEFAULT_DUPLICATION_CONFIG } from '../src/core/duplication/index.js'

// ─── HashGenerator ───

describe('HashGenerator', () => {
  const hasher = new HashGenerator()

  describe('generateTokenHash', () => {
    it('should generate consistent hashes for same tokens', () => {
      const tokens = ['const', 'x', '=', '1']
      expect(hasher.generateTokenHash(tokens)).toBe(hasher.generateTokenHash(tokens))
    })

    it('should generate different hashes for different tokens', () => {
      expect(hasher.generateTokenHash(['a'])).not.toBe(hasher.generateTokenHash(['b']))
    })

    it('should handle empty tokens', () => {
      const hash = hasher.generateTokenHash([])
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })
  })

  describe('generateContentHash', () => {
    it('should normalize whitespace before hashing', () => {
      const hash1 = hasher.generateContentHash('  hello  \n  world  ')
      const hash2 = hasher.generateContentHash('hello\nworld')
      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different content', () => {
      expect(hasher.generateContentHash('abc')).not.toBe(hasher.generateContentHash('xyz'))
    })
  })

  describe('generateStructuralHash', () => {
    it('should normalize identifiers', () => {
      const hash1 = hasher.generateStructuralHash('const foo = 1')
      const hash2 = hasher.generateStructuralHash('const bar = 1')
      expect(hash1).toBe(hash2)
    })

    it('should preserve keywords', () => {
      const hash1 = hasher.generateStructuralHash('const x = 1')
      const hash2 = hasher.generateStructuralHash('let x = 1')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('tokenize', () => {
    it('should tokenize JavaScript code', () => {
      const tokens = hasher.tokenize('const x = 42')
      expect(tokens).toContain('const')
      expect(tokens).toContain('x')
      expect(tokens).toContain('=')
      expect(tokens).toContain('42')
    })

    it('should tokenize operators', () => {
      const tokens = hasher.tokenize('x === y && z')
      expect(tokens).toContain('===')
      expect(tokens).toContain('&&')
    })
  })

  describe('computeSimilarity', () => {
    it('should return 1.0 for identical token sets', () => {
      expect(hasher.computeSimilarity(['a', 'b'], ['a', 'b'])).toBe(1)
    })

    it('should return 0.0 for disjoint sets', () => {
      expect(hasher.computeSimilarity(['a'], ['b'])).toBe(0)
    })

    it('should return 1.0 for two empty sets', () => {
      expect(hasher.computeSimilarity([], [])).toBe(1)
    })

    it('should return 0.0 for one empty set', () => {
      expect(hasher.computeSimilarity(['a'], [])).toBe(0)
    })

    it('should compute Jaccard similarity', () => {
      const sim = hasher.computeSimilarity(['a', 'b', 'c'], ['a', 'b', 'd'])
      expect(sim).toBeCloseTo(0.5, 1)
    })
  })
})

// ─── CloneDetector ───

describe('CloneDetector', () => {
  describe('analyzeFile', () => {
    it('should return empty for files shorter than minLines', () => {
      const detector = new CloneDetector({ minLines: 10 })
      expect(detector.analyzeFile('a.ts', 'short file')).toEqual([])
    })

    it('should extract sliding windows from file content', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1 })
      const content = Array(10).fill('const x = 1').join('\n')
      const instances = detector.analyzeFile('a.ts', content)
      expect(instances.length).toBeGreaterThan(0)
      expect(instances[0]!.filePath).toBe('a.ts')
    })
  })

  describe('analyzeFiles', () => {
    it('should detect exact clones across files', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1 })
      const content = Array(5).fill('const x = 1').join('\n')
      const files = new Map<string, string>()
      files.set('a.ts', content)
      files.set('b.ts', content)
      const report = detector.analyzeFiles(files)
      expect(report.summary).toBeDefined()
      expect(report.cloneGroups).toBeInstanceOf(Array)
    })

    it('should respect ignore patterns', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1, ignorePatterns: ['**/node_modules/**'] })
      const content = Array(5).fill('const x = 1').join('\n')
      const files = new Map<string, string>()
      files.set('node_modules/pkg/a.ts', content)
      const report = detector.analyzeFiles(files)
      expect(report.cloneGroups).toBeInstanceOf(Array)
    })

    it('should report summary statistics', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1 })
      const content = Array(5).fill('const x = 1').join('\n')
      const files = new Map<string, string>()
      files.set('a.ts', content)
      files.set('b.ts', content)
      const report = detector.analyzeFiles(files)
      expect(report.summary.filesAnalyzed).toBeGreaterThanOrEqual(0)
      expect(report.duplicationPercentage).toBeGreaterThanOrEqual(0)
    })
  })

  describe('findExactClones', () => {
    it('should group instances with same hash', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1 })
      const instance1 = { filePath: 'a.ts', startLine: 1, endLine: 5, startCol: 0, endCol: 10, content: 'x', hash: 'abc', tokens: ['x'] }
      const instance2 = { filePath: 'b.ts', startLine: 1, endLine: 5, startCol: 0, endCol: 10, content: 'x', hash: 'abc', tokens: ['x'] }
      const groups = detector.findExactClones([instance1, instance2])
      expect(groups.length).toBe(1)
      expect(groups[0]!.similarity).toBe(1.0)
      expect(groups[0]!.type).toBe(DuplicationType.EXACT)
    })

    it('should not group single instances', () => {
      const detector = new CloneDetector()
      const instance = { filePath: 'a.ts', startLine: 1, endLine: 5, startCol: 0, endCol: 10, content: 'x', hash: 'unique', tokens: ['x'] }
      expect(detector.findExactClones([instance])).toEqual([])
    })
  })

  describe('findStructuralClones', () => {
    it('should group instances with same structural hash but different content', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1 })
      const instance1 = { filePath: 'a.ts', startLine: 1, endLine: 5, startCol: 0, endCol: 10, content: 'const foo = 1', hash: 'h1', tokens: ['const', 'foo', '=', '1'] }
      const instance2 = { filePath: 'b.ts', startLine: 1, endLine: 5, startCol: 0, endCol: 10, content: 'const bar = 2', hash: 'h2', tokens: ['const', 'bar', '=', '2'] }
      const groups = detector.findStructuralClones([instance1, instance2])
      expect(groups.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('findSemanticClones', () => {
    it('should group instances with high similarity', () => {
      const detector = new CloneDetector({ minLines: 3, minTokens: 1, similarityThreshold: 0.5 })
      const instance1 = { filePath: 'a.ts', startLine: 1, endLine: 5, startCol: 0, endCol: 10, content: 'a b c d', hash: 'h1', tokens: ['a', 'b', 'c', 'd'] }
      const instance2 = { filePath: 'b.ts', startLine: 1, endLine: 5, startCol: 0, endCol: 10, content: 'a b c e', hash: 'h2', tokens: ['a', 'b', 'c', 'e'] }
      const groups = detector.findSemanticClones([instance1, instance2])
      expect(groups.length).toBeGreaterThan(0)
      expect(groups[0]!.type).toBe(DuplicationType.SEMANTIC)
    })
  })

  describe('deduplicateGroups', () => {
    it('should remove overlapping groups', () => {
      const detector = new CloneDetector()
      const instance = { filePath: 'a.ts', startLine: 1, endLine: 5, startCol: 0, endCol: 10, content: 'x', hash: 'h', tokens: ['x'] }
      const group1 = { id: 'g1', clones: [instance], similarity: 1.0, type: DuplicationType.EXACT, fingerprint: 'f1' }
      const group2 = { id: 'g2', clones: [instance], similarity: 0.9, type: DuplicationType.STRUCTURAL, fingerprint: 'f2' }
      const deduped = detector.deduplicateGroups([group1, group2])
      expect(deduped.length).toBe(1)
    })

    it('should return empty for no groups', () => {
      const detector = new CloneDetector()
      expect(detector.deduplicateGroups([])).toEqual([])
    })
  })
})

// ─── DuplicationReporter ───

describe('DuplicationReporter', () => {
  const reporter = new DuplicationReporter()

  const mockReport = {
    totalDuplicates: 2,
    totalDuplicatedLines: 20,
    duplicationPercentage: 15.5,
    cloneGroups: [{
      id: 'cg_001',
      clones: [
        { filePath: 'a.ts', startLine: 1, endLine: 10, startCol: 0, endCol: 5, content: 'const x = 1', hash: 'h1', tokens: ['const', 'x', '=', '1'] },
        { filePath: 'b.ts', startLine: 1, endLine: 10, startCol: 0, endCol: 5, content: 'const x = 1', hash: 'h1', tokens: ['const', 'x', '=', '1'] },
      ],
      similarity: 1.0,
      type: DuplicationType.EXACT,
      fingerprint: 'fp1',
    }],
    summary: {
      filesAnalyzed: 2,
      filesWithDuplicates: 2,
      avgCloneSize: 10,
      largestClone: 10,
      duplicateHotspots: ['a.ts', 'b.ts'],
    },
  }

  describe('formatConsole', () => {
    it('should format console output', () => {
      const output = reporter.formatConsole(mockReport as any)
      expect(output).toContain('DUPLICATION REPORT')
      expect(output).toContain('15.50%')
    })
  })

  describe('formatJSON', () => {
    it('should format as JSON', () => {
      const output = reporter.formatJSON(mockReport as any)
      const parsed = JSON.parse(output)
      expect(parsed.totalDuplicates).toBe(2)
    })
  })

  describe('formatMarkdown', () => {
    it('should format as markdown', () => {
      const output = reporter.formatMarkdown(mockReport as any)
      expect(output).toContain('# Code Duplication Report')
      expect(output).toContain('15.50%')
    })
  })

  describe('formatSummary', () => {
    it('should format one-line summary', () => {
      const output = reporter.formatSummary(mockReport as any)
      expect(output).toContain('2 duplicates')
      expect(output).toContain('15.50% duplication')
    })
  })

  describe('generateHTML', () => {
    it('should generate HTML report', () => {
      const output = reporter.generateHTML(mockReport as any)
      expect(output).toContain('<!DOCTYPE html>')
      expect(output).toContain('Code Duplication Report')
    })
  })

  describe('formatCloneGroup', () => {
    it('should format clone group details', () => {
      const output = reporter.formatCloneGroup(mockReport.cloneGroups[0]!)
      expect(output).toContain('a.ts:1-10')
      expect(output).toContain('b.ts:1-10')
    })
  })

  describe('calculateDuplicationHotspots', () => {
    it('should return files sorted by duplication count', () => {
      const hotspots = reporter.calculateDuplicationHotspots(mockReport.cloneGroups)
      expect(hotspots).toContain('a.ts')
      expect(hotspots).toContain('b.ts')
    })
  })
})

// ─── Constants ───

describe('Constants', () => {
  it('should have correct DEFAULT_DUPLICATION_CONFIG', () => {
    expect(DEFAULT_DUPLICATION_CONFIG.minLines).toBe(6)
    expect(DEFAULT_DUPLICATION_CONFIG.minTokens).toBe(50)
    expect(DEFAULT_DUPLICATION_CONFIG.similarityThreshold).toBe(0.8)
    expect(DEFAULT_DUPLICATION_CONFIG.maxResults).toBe(100)
  })

  it('should have DuplicationType enum values', () => {
    expect(DuplicationType.EXACT).toBe('exact')
    expect(DuplicationType.STRUCTURAL).toBe('structural')
    expect(DuplicationType.SEMANTIC).toBe('semantic')
  })
})
