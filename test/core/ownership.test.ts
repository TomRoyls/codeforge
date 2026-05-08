import { describe, it, expect } from 'vitest'
import { BlameParser } from '../../src/core/ownership/blame-parser.js'
import { OwnershipCalculator } from '../../src/core/ownership/ownership-calculator.js'
import { ReviewerSuggester } from '../../src/core/ownership/reviewer-suggester.js'
import { DEFAULT_OWNERSHIP_CONFIG } from '../../src/core/ownership/types.js'
import type { BlameLine, OwnershipReport, FileOwnership, OwnerShare } from '../../src/core/ownership/types.js'

describe('BlameParser', () => {
  const parser = new BlameParser()

  describe('parseBlameOutput', () => {
    it('should parse basic porcelain output', () => {
      const output = parser.createMockBlameOutput([
        { author: 'Alice', email: 'alice@example.com', lines: ['const x = 1', 'const y = 2'] },
      ])
      const result = parser.parseBlameOutput(output)

      expect(result).toHaveLength(2)
      expect(result[0]!.author).toBe('Alice')
      expect(result[0]!.authorMail).toBe('alice@example.com')
      expect(result[0]!.content).toBe('const x = 1')
      expect(result[0]!.lineNumber).toBe(1)
      expect(result[1]!.content).toBe('const y = 2')
      expect(result[1]!.lineNumber).toBe(2)
    })

    it('should parse multi-author blame output', () => {
      const output = parser.createMockBlameOutput([
        { author: 'Alice', email: 'alice@example.com', lines: ['line1'] },
        { author: 'Bob', email: 'bob@example.com', lines: ['line2', 'line3'] },
      ])
      const result = parser.parseBlameOutput(output)

      expect(result).toHaveLength(3)
      expect(result[0]!.author).toBe('Alice')
      expect(result[1]!.author).toBe('Bob')
      expect(result[2]!.author).toBe('Bob')
    })

    it('should parse commit hashes correctly', () => {
      const output = parser.createMockBlameOutput([
        { author: 'Alice', email: 'alice@example.com', lines: ['code'] },
      ])
      const result = parser.parseBlameOutput(output)

      expect(result[0]!.commit).toMatch(/^[0-9a-f]{40}$/)
    })

    it('should parse timestamps from blame output', () => {
      const output = parser.createMockBlameOutput([
        { author: 'Alice', email: 'alice@example.com', lines: ['code'] },
      ])
      const result = parser.parseBlameOutput(output)

      expect(result[0]!.timestamp).toBe(1700000000 * 1000)
    })

    it('should handle empty output', () => {
      expect(parser.parseBlameOutput('')).toEqual([])
      expect(parser.parseBlameOutput('   ')).toEqual([])
    })

    it('should handle output with only whitespace lines', () => {
      const output = parser.createMockBlameOutput([
        { author: 'Alice', email: 'alice@example.com', lines: ['  ', '\t'] },
      ])
      const result = parser.parseBlameOutput(output)
      expect(result).toHaveLength(2)
    })

    it('should parse real porcelain format manually', () => {
      const output = [
        'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2 1 2 1',
        'author John Doe',
        'author-mail <john@example.com>',
        'author-time 1699000000',
        'author-tz +0100',
        'summary initial commit',
        'filename src/test.ts',
        '\tconst hello = "world"',
        'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2 2 2',
        'author Jane Smith',
        'author-mail <jane@example.com>',
        'author-time 1699100000',
        'author-tz -0500',
        'summary fix typo',
        'filename src/test.ts',
        '\tconst goodbye = "world"',
      ].join('\n')

      const result = parser.parseBlameOutput(output)

      expect(result).toHaveLength(2)
      expect(result[0]!.author).toBe('John Doe')
      expect(result[0]!.authorMail).toBe('john@example.com')
      expect(result[0]!.lineNumber).toBe(1)
      expect(result[1]!.author).toBe('Jane Smith')
      expect(result[1]!.lineNumber).toBe(2)
    })
  })

  describe('parseAuthorLine', () => {
    it('should extract author name', () => {
      const result = parser.parseAuthorLine('author Alice Smith')
      expect(result.author).toBe('Alice Smith')
    })

    it('should handle author with special characters', () => {
      const result = parser.parseAuthorLine('author José García')
      expect(result.author).toBe('José García')
    })

    it('should return empty string for malformed line', () => {
      const result = parser.parseAuthorLine('notauthor Alice')
      expect(result.author).toBe('')
    })
  })

  describe('parseTimestampLine', () => {
    it('should parse valid timestamp to milliseconds', () => {
      const result = parser.parseTimestampLine('author-time 1700000000')
      expect(result).toBe(1700000000 * 1000)
    })

    it('should return 0 for invalid timestamp', () => {
      expect(parser.parseTimestampLine('author-time abc')).toBe(0)
      expect(parser.parseTimestampLine('not-a-timestamp 123')).toBe(0)
    })
  })

  describe('parseCommitLine', () => {
    it('should extract 40-char commit hash', () => {
      const hash = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
      const result = parser.parseCommitLine(`${hash} 1 1`)
      expect(result).toBe(hash)
    })

    it('should return empty string for non-hash', () => {
      expect(parser.parseCommitLine('not-a-hash')).toBe('')
    })
  })

  describe('createMockBlameOutput', () => {
    it('should create output with multiple entries', () => {
      const output = parser.createMockBlameOutput([
        { author: 'A', email: 'a@test.com', lines: ['x', 'y'] },
        { author: 'B', email: 'b@test.com', lines: ['z'] },
      ])
      const lines = output.split('\n')
      expect(lines.filter((l) => l.startsWith('\t'))).toHaveLength(3)
    })

    it('should create output with unique commits per entry', () => {
      const output = parser.createMockBlameOutput([
        { author: 'A', email: 'a@test.com', lines: ['x'] },
        { author: 'B', email: 'b@test.com', lines: ['y'] },
      ])
      const commits = output.split('\n').filter((l) => l.match(/^[0-9a-f]{40}/))
      expect(commits[0]).not.toBe(commits[1])
    })

    it('should produce parseable output', () => {
      const output = parser.createMockBlameOutput([
        { author: 'Test', email: 'test@test.com', lines: ['line1', 'line2'] },
      ])
      const parsed = parser.parseBlameOutput(output)
      expect(parsed).toHaveLength(2)
      expect(parsed[0]!.author).toBe('Test')
    })

    it('should handle single line entries', () => {
      const output = parser.createMockBlameOutput([
        { author: 'Solo', email: 'solo@test.com', lines: ['only line'] },
      ])
      const parsed = parser.parseBlameOutput(output)
      expect(parsed).toHaveLength(1)
      expect(parsed[0]!.content).toBe('only line')
    })
  })
})

describe('OwnershipCalculator', () => {
  describe('calculateFileOwnership', () => {
    it('should calculate ownership for single author file', () => {
      const calc = new OwnershipCalculator()
      const blameLines: BlameLine[] = [
        { lineNumber: 1, commit: 'a1', author: 'Alice', authorMail: 'a@t.com', timestamp: 1000, content: 'x' },
        { lineNumber: 2, commit: 'a1', author: 'Alice', authorMail: 'a@t.com', timestamp: 1000, content: 'y' },
        { lineNumber: 3, commit: 'a1', author: 'Alice', authorMail: 'a@t.com', timestamp: 1000, content: 'z' },
      ]

      const result = calc.calculateFileOwnership(blameLines, 'test.ts')

      expect(result.filePath).toBe('test.ts')
      expect(result.totalLines).toBe(3)
      expect(result.dominantOwner).toBe('Alice')
      expect(result.owners).toHaveLength(1)
      expect(result.owners[0]!.percentage).toBe(1)
    })

    it('should calculate ownership for multi-author file', () => {
      const calc = new OwnershipCalculator()
      const blameLines: BlameLine[] = [
        { lineNumber: 1, commit: 'a1', author: 'Alice', authorMail: 'a@t.com', timestamp: 1000, content: 'x' },
        { lineNumber: 2, commit: 'a1', author: 'Alice', authorMail: 'a@t.com', timestamp: 1000, content: 'y' },
        { lineNumber: 3, commit: 'b1', author: 'Bob', authorMail: 'b@t.com', timestamp: 2000, content: 'z' },
      ]

      const result = calc.calculateFileOwnership(blameLines, 'test.ts')

      expect(result.owners).toHaveLength(2)
      expect(result.dominantOwner).toBe('Alice')
      expect(result.owners[0]!.percentage).toBeCloseTo(2 / 3)
      expect(result.owners[1]!.percentage).toBeCloseTo(1 / 3)
    })

    it('should handle empty blame data', () => {
      const calc = new OwnershipCalculator()
      const result = calc.calculateFileOwnership([], 'empty.ts')

      expect(result.totalLines).toBe(0)
      expect(result.owners).toEqual([])
      expect(result.dominantOwner).toBe('')
      expect(result.ownershipConcentration).toBe(0)
    })

    it('should track last commit date per author', () => {
      const calc = new OwnershipCalculator()
      const blameLines: BlameLine[] = [
        { lineNumber: 1, commit: 'a1', author: 'Alice', authorMail: 'a@t.com', timestamp: 1000, content: 'x' },
        { lineNumber: 2, commit: 'a2', author: 'Alice', authorMail: 'a@t.com', timestamp: 3000, content: 'y' },
      ]

      const result = calc.calculateFileOwnership(blameLines, 'test.ts')
      expect(result.owners[0]!.lastCommitDate).toBe(3000)
    })
  })

  describe('calculateReport', () => {
    it('should generate full report across files', () => {
      const calc = new OwnershipCalculator()
      const fileBlames = new Map<string, BlameLine[]>([
        ['file1.ts', [
          { lineNumber: 1, commit: 'a', author: 'Alice', authorMail: 'a@t', timestamp: 1000, content: 'x' },
        ]],
        ['file2.ts', [
          { lineNumber: 1, commit: 'b', author: 'Bob', authorMail: 'b@t', timestamp: 2000, content: 'y' },
        ]],
      ])

      const report = calc.calculateReport(fileBlames)

      expect(report.files).toHaveLength(2)
      expect(report.authors).toHaveLength(2)
    })

    it('should respect exclude patterns', () => {
      const calc = new OwnershipCalculator({ excludePatterns: ['vendor'] })
      const fileBlames = new Map<string, BlameLine[]>([
        ['src/main.ts', [
          { lineNumber: 1, commit: 'a', author: 'Alice', authorMail: 'a@t', timestamp: 1000, content: 'x' },
        ]],
        ['vendor/lib.ts', [
          { lineNumber: 1, commit: 'b', author: 'Bob', authorMail: 'b@t', timestamp: 2000, content: 'y' },
        ]],
      ])

      const report = calc.calculateReport(fileBlames)
      expect(report.files).toHaveLength(1)
      expect(report.files[0]!.filePath).toBe('src/main.ts')
    })

    it('should identify knowledge silos in report', () => {
      const calc = new OwnershipCalculator()
      const fileBlames = new Map<string, BlameLine[]>()

      const lines: BlameLine[] = []
      for (let i = 0; i < 10; i++) {
        lines.push({
          lineNumber: i + 1,
          commit: 'a',
          author: 'Alice',
          authorMail: 'a@t',
          timestamp: 1000,
          content: `line${i}`,
        })
      }
      fileBlames.set('solo-file.ts', lines)

      const report = calc.calculateReport(fileBlames)
      expect(report.knowledgeSilos.length).toBeGreaterThanOrEqual(1)
      expect(report.knowledgeSilos[0]!.owner).toBe('Alice')
    })

    it('should handle empty file blames map', () => {
      const calc = new OwnershipCalculator()
      const report = calc.calculateReport(new Map())

      expect(report.files).toEqual([])
      expect(report.authors).toEqual([])
      expect(report.busFactor).toBe(0)
    })
  })

  describe('calculateBusFactor', () => {
    it('should return 1 for single author codebase', () => {
      const calc = new OwnershipCalculator()
      const report: OwnershipReport = {
        files: [{
          filePath: 'test.ts',
          totalLines: 10,
          owners: [{ author: 'Alice', lines: 10, percentage: 1, files: ['test.ts'], lastCommitDate: 1000 }],
          dominantOwner: 'Alice',
          ownershipConcentration: 1,
        }],
        authors: [],
        busFactor: 0,
        knowledgeSilos: [],
        reviewSuggestions: [],
      }

      expect(calc.calculateBusFactor(report)).toBe(1)
    })

    it('should return correct bus factor for two equal authors', () => {
      const calc = new OwnershipCalculator()
      const report: OwnershipReport = {
        files: [{
          filePath: 'test.ts',
          totalLines: 10,
          owners: [
            { author: 'Alice', lines: 5, percentage: 0.5, files: ['test.ts'], lastCommitDate: 1000 },
            { author: 'Bob', lines: 5, percentage: 0.5, files: ['test.ts'], lastCommitDate: 1000 },
          ],
          dominantOwner: 'Alice',
          ownershipConcentration: 0.5,
        }],
        authors: [],
        busFactor: 0,
        knowledgeSilos: [],
        reviewSuggestions: [],
      }

      expect(calc.calculateBusFactor(report)).toBe(2)
    })

    it('should return higher bus factor for distributed ownership', () => {
      const calc = new OwnershipCalculator()
      const fileBlames = new Map<string, BlameLine[]>()

      const authors = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve']
      for (let i = 0; i < 5; i++) {
        const lines: BlameLine[] = []
        for (let j = 0; j < 20; j++) {
          lines.push({
            lineNumber: j + 1,
            commit: `c${i}`,
            author: authors[i]!,
            authorMail: `${authors[i]!.toLowerCase()}@t`,
            timestamp: 1000,
            content: `line${j}`,
          })
        }
        fileBlames.set(`file${i}.ts`, lines)
      }

      const report = calc.calculateReport(fileBlames)
      expect(report.busFactor).toBeGreaterThanOrEqual(2)
    })

    it('should handle many small contributors', () => {
      const calc = new OwnershipCalculator()
      const fileBlames = new Map<string, BlameLine[]>()

      const lines: BlameLine[] = []
      for (let i = 0; i < 10; i++) {
        lines.push({
          lineNumber: i + 1,
          commit: `c${i}`,
          author: `Author${i}`,
          authorMail: `a${i}@t`,
          timestamp: 1000,
          content: `line${i}`,
        })
      }
      fileBlames.set('shared.ts', lines)

      const report = calc.calculateReport(fileBlames)
      expect(report.busFactor).toBeGreaterThanOrEqual(3)
    })
  })

  describe('identifyKnowledgeSilos', () => {
    it('should identify files above silo threshold', () => {
      const calc = new OwnershipCalculator({ siloThreshold: 0.8 })
      const files: FileOwnership[] = [{
        filePath: 'critical.ts',
        totalLines: 10,
        owners: [{ author: 'Alice', lines: 9, percentage: 0.9, files: ['critical.ts'], lastCommitDate: 1000 }],
        dominantOwner: 'Alice',
        ownershipConcentration: 0.81,
      }]

      const silos = calc.identifyKnowledgeSilos(files)
      expect(silos).toHaveLength(1)
      expect(silos[0]!.filePath).toBe('critical.ts')
      expect(silos[0]!.owner).toBe('Alice')
    })

    it('should not flag files below silo threshold', () => {
      const calc = new OwnershipCalculator({ siloThreshold: 0.8 })
      const files: FileOwnership[] = [{
        filePath: 'shared.ts',
        totalLines: 10,
        owners: [
          { author: 'Alice', lines: 5, percentage: 0.5, files: ['shared.ts'], lastCommitDate: 1000 },
          { author: 'Bob', lines: 5, percentage: 0.5, files: ['shared.ts'], lastCommitDate: 1000 },
        ],
        dominantOwner: 'Alice',
        ownershipConcentration: 0.5,
      }]

      const silos = calc.identifyKnowledgeSilos(files)
      expect(silos).toHaveLength(0)
    })

    it('should assign correct risk levels', () => {
      const calc = new OwnershipCalculator({ siloThreshold: 0.8 })

      const files: FileOwnership[] = [
        {
          filePath: 'low.ts', totalLines: 10,
          owners: [{ author: 'A', lines: 9, percentage: 0.85, files: ['low.ts'], lastCommitDate: 1000 }],
          dominantOwner: 'A', ownershipConcentration: 0.85,
        },
        {
          filePath: 'high.ts', totalLines: 10,
          owners: [{ author: 'B', lines: 10, percentage: 0.92, files: ['high.ts'], lastCommitDate: 1000 }],
          dominantOwner: 'B', ownershipConcentration: 0.92,
        },
        {
          filePath: 'critical.ts', totalLines: 10,
          owners: [{ author: 'C', lines: 10, percentage: 0.96, files: ['critical.ts'], lastCommitDate: 1000 }],
          dominantOwner: 'C', ownershipConcentration: 0.96,
        },
      ]

      const silos = calc.identifyKnowledgeSilos(files)
      expect(silos).toHaveLength(3)

      const lowSilo = silos.find((s) => s.filePath === 'low.ts')
      expect(lowSilo!.risk).toBe('medium')

      const highSilo = silos.find((s) => s.filePath === 'high.ts')
      expect(highSilo!.risk).toBe('high')

      const criticalSilo = silos.find((s) => s.filePath === 'critical.ts')
      expect(criticalSilo!.risk).toBe('critical')
    })

    it('should skip empty files', () => {
      const calc = new OwnershipCalculator()
      const files: FileOwnership[] = [{
        filePath: 'empty.ts',
        totalLines: 0,
        owners: [],
        dominantOwner: '',
        ownershipConcentration: 0,
      }]

      expect(calc.identifyKnowledgeSilos(files)).toHaveLength(0)
    })
  })

  describe('calculateOwnershipConcentration', () => {
    it('should return 1 for single owner', () => {
      const calc = new OwnershipCalculator()
      const owners: OwnerShare[] = [
        { author: 'Alice', lines: 10, percentage: 1, files: ['f.ts'], lastCommitDate: 0 },
      ]
      expect(calc.calculateOwnershipConcentration(owners)).toBe(1)
    })

    it('should return correct HHI for equal split', () => {
      const calc = new OwnershipCalculator()
      const owners: OwnerShare[] = [
        { author: 'A', lines: 5, percentage: 0.5, files: ['f.ts'], lastCommitDate: 0 },
        { author: 'B', lines: 5, percentage: 0.5, files: ['f.ts'], lastCommitDate: 0 },
      ]
      const hhi = calc.calculateOwnershipConcentration(owners)
      expect(hhi).toBeCloseTo(0.5)
    })

    it('should return 0 for empty owners', () => {
      const calc = new OwnershipCalculator()
      expect(calc.calculateOwnershipConcentration([])).toBe(0)
    })
  })

  describe('getDomainsForAuthor', () => {
    it('should identify directories an author works in', () => {
      const calc = new OwnershipCalculator()
      const files: FileOwnership[] = [
        {
          filePath: 'src/main.ts', totalLines: 10,
          owners: [{ author: 'Alice', lines: 10, percentage: 1, files: ['src/main.ts'], lastCommitDate: 0 }],
          dominantOwner: 'Alice', ownershipConcentration: 1,
        },
        {
          filePath: 'lib/utils.ts', totalLines: 5,
          owners: [{ author: 'Alice', lines: 5, percentage: 1, files: ['lib/utils.ts'], lastCommitDate: 0 }],
          dominantOwner: 'Alice', ownershipConcentration: 1,
        },
      ]

      const domains = calc.getDomainsForAuthor('Alice', files)
      expect(domains).toContain('src')
      expect(domains).toContain('lib')
    })

    it('should return root for files without directory', () => {
      const calc = new OwnershipCalculator()
      const files: FileOwnership[] = [{
        filePath: 'readme.md', totalLines: 5,
        owners: [{ author: 'Alice', lines: 5, percentage: 1, files: ['readme.md'], lastCommitDate: 0 }],
        dominantOwner: 'Alice', ownershipConcentration: 1,
      }]

      const domains = calc.getDomainsForAuthor('Alice', files)
      expect(domains).toContain('root')
    })

    it('should return empty for author with no files', () => {
      const calc = new OwnershipCalculator()
      const files: FileOwnership[] = [{
        filePath: 'src/main.ts', totalLines: 10,
        owners: [{ author: 'Alice', lines: 10, percentage: 1, files: ['src/main.ts'], lastCommitDate: 0 }],
        dominantOwner: 'Alice', ownershipConcentration: 1,
      }]

      expect(calc.getDomainsForAuthor('Bob', files)).toEqual([])
    })
  })

  describe('isAuthorActive', () => {
    it('should return true for recent commits', () => {
      const calc = new OwnershipCalculator()
      const recentDate = Date.now() - 30 * 24 * 60 * 60 * 1000
      expect(calc.isAuthorActive(recentDate)).toBe(true)
    })

    it('should return false for old commits', () => {
      const calc = new OwnershipCalculator()
      const oldDate = Date.now() - 200 * 24 * 60 * 60 * 1000
      expect(calc.isAuthorActive(oldDate)).toBe(false)
    })

    it('should respect custom recentCommitDays config', () => {
      const calc = new OwnershipCalculator({ recentCommitDays: 10 })
      const date30DaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      expect(calc.isAuthorActive(date30DaysAgo)).toBe(false)
    })
  })

  describe('groupAuthorsByEmail', () => {
    it('should merge authors with same name', () => {
      const calc = new OwnershipCalculator()
      const authors: OwnerShare[] = [
        { author: 'Alice', lines: 5, percentage: 0.5, files: ['a.ts'], lastCommitDate: 1000 },
        { author: 'Alice', lines: 3, percentage: 0.3, files: ['b.ts'], lastCommitDate: 2000 },
      ]

      const grouped = calc.groupAuthorsByEmail(authors)
      expect(grouped.size).toBe(1)
      expect(grouped.get('Alice')!.lines).toBe(8)
      expect(grouped.get('Alice')!.lastCommitDate).toBe(2000)
    })

    it('should keep different authors separate', () => {
      const calc = new OwnershipCalculator()
      const authors: OwnerShare[] = [
        { author: 'Alice', lines: 5, percentage: 0.5, files: ['a.ts'], lastCommitDate: 1000 },
        { author: 'Bob', lines: 3, percentage: 0.3, files: ['b.ts'], lastCommitDate: 2000 },
      ]

      const grouped = calc.groupAuthorsByEmail(authors)
      expect(grouped.size).toBe(2)
    })

    it('should deduplicate files when merging', () => {
      const calc = new OwnershipCalculator()
      const authors: OwnerShare[] = [
        { author: 'Alice', lines: 5, percentage: 0.5, files: ['a.ts', 'b.ts'], lastCommitDate: 1000 },
        { author: 'Alice', lines: 3, percentage: 0.3, files: ['b.ts', 'c.ts'], lastCommitDate: 2000 },
      ]

      const grouped = calc.groupAuthorsByEmail(authors)
      const merged = grouped.get('Alice')!
      expect(merged.files.sort()).toEqual(['a.ts', 'b.ts', 'c.ts'])
    })
  })
})

describe('ReviewerSuggester', () => {
  const suggester = new ReviewerSuggester()

  function makeReport(files: FileOwnership[]): OwnershipReport {
    return {
      files,
      authors: [],
      busFactor: 1,
      knowledgeSilos: [],
      reviewSuggestions: [],
    }
  }

  describe('suggestReviewers', () => {
    it('should suggest dominant owner as primary reviewer', () => {
      const report = makeReport([{
        filePath: 'test.ts', totalLines: 10,
        owners: [
          { author: 'Alice', lines: 8, percentage: 0.8, files: ['test.ts'], lastCommitDate: 1000 },
          { author: 'Bob', lines: 2, percentage: 0.2, files: ['test.ts'], lastCommitDate: 1000 },
        ],
        dominantOwner: 'Alice', ownershipConcentration: 0.68,
      }])

      const result = suggester.suggestReviewers('test.ts', report)
      expect(result.primaryReviewer).toBe('Alice')
    })

    it('should suggest secondary reviewers', () => {
      const report = makeReport([{
        filePath: 'test.ts', totalLines: 10,
        owners: [
          { author: 'Alice', lines: 7, percentage: 0.7, files: ['test.ts'], lastCommitDate: 1000 },
          { author: 'Bob', lines: 2, percentage: 0.2, files: ['test.ts'], lastCommitDate: 1000 },
          { author: 'Charlie', lines: 1, percentage: 0.1, files: ['test.ts'], lastCommitDate: 1000 },
        ],
        dominantOwner: 'Alice', ownershipConcentration: 0.54,
      }])

      const result = suggester.suggestReviewers('test.ts', report)
      expect(result.secondaryReviewers).toContain('Bob')
    })

    it('should handle unknown file', () => {
      const report = makeReport([])
      const result = suggester.suggestReviewers('unknown.ts', report)
      expect(result.primaryReviewer).toBe('')
      expect(result.reason).toContain('No ownership data')
    })

    it('should note when no secondary experts available', () => {
      const report = makeReport([{
        filePath: 'test.ts', totalLines: 10,
        owners: [{ author: 'Alice', lines: 10, percentage: 1, files: ['test.ts'], lastCommitDate: 1000 }],
        dominantOwner: 'Alice', ownershipConcentration: 1,
      }])

      const result = suggester.suggestReviewers('test.ts', report)
      expect(result.reason).toContain('knowledge silo')
    })
  })

  describe('findCodeOwner', () => {
    it('should find dominant owner', () => {
      const report = makeReport([{
        filePath: 'test.ts', totalLines: 10,
        owners: [{ author: 'Alice', lines: 10, percentage: 1, files: ['test.ts'], lastCommitDate: 1000 }],
        dominantOwner: 'Alice', ownershipConcentration: 1,
      }])

      expect(suggester.findCodeOwner('test.ts', report)).toBe('Alice')
    })

    it('should return empty for unknown file', () => {
      expect(suggester.findCodeOwner('missing.ts', makeReport([]))).toBe('')
    })
  })

  describe('findSecondaryExperts', () => {
    it('should find experts with >= 10% ownership', () => {
      const report = makeReport([{
        filePath: 'test.ts', totalLines: 10,
        owners: [
          { author: 'Alice', lines: 6, percentage: 0.6, files: ['test.ts'], lastCommitDate: 1000 },
          { author: 'Bob', lines: 3, percentage: 0.3, files: ['test.ts'], lastCommitDate: 1000 },
          { author: 'Charlie', lines: 1, percentage: 0.1, files: ['test.ts'], lastCommitDate: 1000 },
        ],
        dominantOwner: 'Alice', ownershipConcentration: 0.46,
      }])

      const experts = suggester.findSecondaryExperts('test.ts', report)
      expect(experts).toContain('Bob')
      expect(experts).toContain('Charlie')
    })

    it('should exclude experts below threshold', () => {
      const report = makeReport([{
        filePath: 'test.ts', totalLines: 10,
        owners: [
          { author: 'Alice', lines: 9, percentage: 0.9, files: ['test.ts'], lastCommitDate: 1000 },
          { author: 'Bob', lines: 1, percentage: 0.1, files: ['test.ts'], lastCommitDate: 1000 },
        ],
        dominantOwner: 'Alice', ownershipConcentration: 0.82,
      }])

      const experts = suggester.findSecondaryExperts('test.ts', report)
      expect(experts).toEqual(['Bob'])
    })

    it('should return empty for unknown file', () => {
      expect(suggester.findSecondaryExperts('missing.ts', makeReport([]))).toEqual([])
    })
  })

  describe('suggestForChange', () => {
    it('should suggest reviewers for multiple files', () => {
      const report = makeReport([
        {
          filePath: 'a.ts', totalLines: 10,
          owners: [{ author: 'Alice', lines: 10, percentage: 1, files: ['a.ts'], lastCommitDate: 1000 }],
          dominantOwner: 'Alice', ownershipConcentration: 1,
        },
        {
          filePath: 'b.ts', totalLines: 10,
          owners: [{ author: 'Bob', lines: 10, percentage: 1, files: ['b.ts'], lastCommitDate: 1000 }],
          dominantOwner: 'Bob', ownershipConcentration: 1,
        },
      ])

      const results = suggester.suggestForChange(['a.ts', 'b.ts'], report)
      expect(results).toHaveLength(2)
      expect(results[0]!.primaryReviewer).toBe('Alice')
      expect(results[1]!.primaryReviewer).toBe('Bob')
    })

    it('should enhance reason for cross-file reviewers', () => {
      const report = makeReport([
        {
          filePath: 'a.ts', totalLines: 10,
          owners: [{ author: 'Alice', lines: 10, percentage: 1, files: ['a.ts', 'b.ts'], lastCommitDate: 1000 }],
          dominantOwner: 'Alice', ownershipConcentration: 1,
        },
        {
          filePath: 'b.ts', totalLines: 10,
          owners: [{ author: 'Alice', lines: 10, percentage: 1, files: ['a.ts', 'b.ts'], lastCommitDate: 1000 }],
          dominantOwner: 'Alice', ownershipConcentration: 1,
        },
      ])

      const results = suggester.suggestForChange(['a.ts', 'b.ts'], report)
      expect(results[0]!.reason).toContain('overall reviewer')
    })

    it('should handle empty file list', () => {
      const results = suggester.suggestForChange([], makeReport([]))
      expect(results).toEqual([])
    })
  })

  describe('checkBusFactorRisk', () => {
    it('should flag single-owner files', () => {
      const report = makeReport([{
        filePath: 'risky.ts', totalLines: 10,
        owners: [{ author: 'Alice', lines: 10, percentage: 1, files: ['risky.ts'], lastCommitDate: 1000 }],
        dominantOwner: 'Alice', ownershipConcentration: 1,
      }])

      const risky = suggester.checkBusFactorRisk(report)
      expect(risky).toContain('risky.ts')
    })

    it('should flag files with highly dominant owner', () => {
      const report = makeReport([{
        filePath: 'almost.ts', totalLines: 10,
        owners: [
          { author: 'Alice', lines: 9, percentage: 0.9, files: ['almost.ts'], lastCommitDate: 1000 },
          { author: 'Bob', lines: 1, percentage: 0.1, files: ['almost.ts'], lastCommitDate: 1000 },
        ],
        dominantOwner: 'Alice', ownershipConcentration: 0.82,
      }])

      const risky = suggester.checkBusFactorRisk(report)
      expect(risky).toContain('almost.ts')
    })

    it('should not flag well-distributed files', () => {
      const report = makeReport([{
        filePath: 'safe.ts', totalLines: 10,
        owners: [
          { author: 'Alice', lines: 5, percentage: 0.5, files: ['safe.ts'], lastCommitDate: 1000 },
          { author: 'Bob', lines: 5, percentage: 0.5, files: ['safe.ts'], lastCommitDate: 1000 },
        ],
        dominantOwner: 'Alice', ownershipConcentration: 0.5,
      }])

      const risky = suggester.checkBusFactorRisk(report)
      expect(risky).not.toContain('safe.ts')
    })
  })
})

describe('Integration: full pipeline', () => {
  it('should process blame data through full pipeline', () => {
    const parser = new BlameParser()
    const calc = new OwnershipCalculator()
    const suggester = new ReviewerSuggester()

    const blameOutput = parser.createMockBlameOutput([
      { author: 'Alice', email: 'alice@test.com', lines: ['line1', 'line2', 'line3'] },
      { author: 'Bob', email: 'bob@test.com', lines: ['line4'] },
    ])

    const blameLines = parser.parseBlameOutput(blameOutput)
    const fileBlames = new Map<string, BlameLine[]>([['main.ts', blameLines]])
    const report = calc.calculateReport(fileBlames)

    expect(report.files).toHaveLength(1)
    expect(report.files[0]!.dominantOwner).toBe('Alice')
    expect(report.authors).toHaveLength(2)

    const suggestion = suggester.suggestReviewers('main.ts', report)
    expect(suggestion.primaryReviewer).toBe('Alice')
    expect(suggestion.secondaryReviewers).toContain('Bob')
  })

  it('should handle multi-file analysis with reviewer suggestions', () => {
    const parser = new BlameParser()
    const calc = new OwnershipCalculator()
    const suggester = new ReviewerSuggester()

    const fileBlames = new Map<string, BlameLine[]>()

    const blame1 = parser.createMockBlameOutput([
      { author: 'Alice', email: 'a@t', lines: ['a1', 'a2'] },
      { author: 'Bob', email: 'b@t', lines: ['b1'] },
    ])
    const blame2 = parser.createMockBlameOutput([
      { author: 'Bob', email: 'b@t', lines: ['b1', 'b2', 'b3'] },
    ])

    fileBlames.set('core/engine.ts', parser.parseBlameOutput(blame1))
    fileBlames.set('core/utils.ts', parser.parseBlameOutput(blame2))

    const report = calc.calculateReport(fileBlames)
    const suggestions = suggester.suggestForChange(
      ['core/engine.ts', 'core/utils.ts'],
      report,
    )

    expect(suggestions).toHaveLength(2)
    expect(suggestions[0]!.primaryReviewer).toBe('Alice')
    expect(suggestions[1]!.primaryReviewer).toBe('Bob')
  })

  it('should detect knowledge silos across codebase', () => {
    const parser = new BlameParser()
    const calc = new OwnershipCalculator({ siloThreshold: 0.7 })

    const fileBlames = new Map<string, BlameLine[]>()

    const soloBlame = parser.createMockBlameOutput([
      { author: 'Alice', email: 'a@t', lines: ['l1', 'l2', 'l3', 'l4', 'l5'] },
    ])
    const sharedBlame = parser.createMockBlameOutput([
      { author: 'Alice', email: 'a@t', lines: ['l1', 'l2'] },
      { author: 'Bob', email: 'b@t', lines: ['l3', 'l4', 'l5'] },
    ])

    fileBlames.set('solo.ts', parser.parseBlameOutput(soloBlame))
    fileBlames.set('shared.ts', parser.parseBlameOutput(sharedBlame))

    const report = calc.calculateReport(fileBlames)

    expect(report.knowledgeSilos).toHaveLength(1)
    expect(report.knowledgeSilos[0]!.filePath).toBe('solo.ts')
    expect(report.knowledgeSilos[0]!.risk).toBe('critical')
  })
})

describe('Edge cases', () => {
  it('should handle single-author entire codebase', () => {
    const parser = new BlameParser()
    const calc = new OwnershipCalculator()
    const suggester = new ReviewerSuggester()

    const fileBlames = new Map<string, BlameLine[]>()
    for (let i = 0; i < 5; i++) {
      const blame = parser.createMockBlameOutput([
        { author: 'Solo', email: 'solo@t', lines: [`line${i}`] },
      ])
      fileBlames.set(`file${i}.ts`, parser.parseBlameOutput(blame))
    }

    const report = calc.calculateReport(fileBlames)
    expect(report.busFactor).toBe(1)
    expect(report.authors).toHaveLength(1)
    expect(report.authors[0]!.totalFiles).toBe(5)
  })

  it('should handle many small contributions', () => {
    const calc = new OwnershipCalculator()
    const fileBlames = new Map<string, BlameLine[]>()

    const lines: BlameLine[] = []
    for (let i = 0; i < 20; i++) {
      lines.push({
        lineNumber: i + 1,
        commit: `c${i}`,
        author: `Author${i % 5}`,
        authorMail: `a${i}@t`,
        timestamp: 1000 + i * 100,
        content: `line${i}`,
      })
    }
    fileBlames.set('crowd.ts', lines)

    const report = calc.calculateReport(fileBlames)
    expect(report.files[0]!.owners).toHaveLength(5)
    expect(report.busFactor).toBeGreaterThanOrEqual(2)
  })

  it('should handle file with all lines from same commit', () => {
    const calc = new OwnershipCalculator()
    const blameLines: BlameLine[] = Array.from({ length: 5 }, (_, i) => ({
      lineNumber: i + 1,
      commit: 'samecommit',
      author: 'Alice',
      authorMail: 'a@t',
      timestamp: 1000,
      content: `line${i}`,
    }))

    const result = calc.calculateFileOwnership(blameLines, 'single.ts')
    expect(result.owners).toHaveLength(1)
    expect(result.ownershipConcentration).toBe(1)
  })

  it('should handle DEFAULT_OWNERSHIP_CONFIG values', () => {
    expect(DEFAULT_OWNERSHIP_CONFIG.minOwnershipPercent).toBe(0.6)
    expect(DEFAULT_OWNERSHIP_CONFIG.siloThreshold).toBe(0.8)
    expect(DEFAULT_OWNERSHIP_CONFIG.recentCommitDays).toBe(90)
    expect(DEFAULT_OWNERSHIP_CONFIG.excludePatterns).toEqual([])
  })
})
