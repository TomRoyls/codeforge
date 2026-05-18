import { BlameParser, OwnershipCalculator, ReviewerSuggester } from '../src/core/ownership/index.js'

// ─── BlameParser ────────────────────────────────────────────────────────

describe('Ownership', () => {
  describe('BlameParser', () => {
    it('parses empty output', () => {
      const parser = new BlameParser()
      expect(parser.parseBlameOutput('')).toEqual([])
      expect(parser.parseBlameOutput('  ')).toEqual([])
    })

    it('parses blame output', () => {
      const parser = new BlameParser()
      const mock = parser.createMockBlameOutput([
        { author: 'Alice', email: 'alice@test.com', lines: ['line1', 'line2'] },
        { author: 'Bob', email: 'bob@test.com', lines: ['line3'] },
      ])
      const result = parser.parseBlameOutput(mock)
      expect(result.length).toBe(3)
      expect(result[0]!.author).toBe('Alice')
      expect(result[2]!.author).toBe('Bob')
    })

    it('parseAuthorLine extracts author', () => {
      const parser = new BlameParser()
      const { author } = parser.parseAuthorLine('author John Doe')
      expect(author).toBe('John Doe')
    })

    it('parseTimestampLine extracts timestamp', () => {
      const parser = new BlameParser()
      expect(parser.parseTimestampLine('author-time 1700000000')).toBe(1700000000000)
      expect(parser.parseTimestampLine('invalid')).toBe(0)
    })

    it('parseCommitLine extracts hash', () => {
      const parser = new BlameParser()
      const hash = 'a'.repeat(40)
      expect(parser.parseCommitLine(`${hash} 1 1`)).toBe(hash)
    })

    it('createMockBlameOutput generates valid format', () => {
      const parser = new BlameParser()
      const output = parser.createMockBlameOutput([
        { author: 'Dev', email: 'dev@test.com', lines: ['code'] },
      ])
      expect(output).toContain('author Dev')
      expect(output).toContain('\tcode')
    })
  })

  // ─── OwnershipCalculator ─────────────────────────────────────────────────

  describe('OwnershipCalculator', () => {
    it('calculates file ownership', () => {
      const calc = new OwnershipCalculator()
      const result = calc.calculateFileOwnership(
        [
          { lineNumber: 1, commit: 'a', author: 'Alice', authorMail: 'a@t.com', timestamp: 100, content: 'x' },
          { lineNumber: 2, commit: 'b', author: 'Bob', authorMail: 'b@t.com', timestamp: 200, content: 'y' },
          { lineNumber: 3, commit: 'a', author: 'Alice', authorMail: 'a@t.com', timestamp: 300, content: 'z' },
        ],
        'test.ts',
      )
      expect(result.filePath).toBe('test.ts')
      expect(result.totalLines).toBe(3)
      expect(result.dominantOwner).toBe('Alice')
      expect(result.owners.length).toBe(2)
    })

    it('handles empty blame lines', () => {
      const calc = new OwnershipCalculator()
      const result = calc.calculateFileOwnership([], 'empty.ts')
      expect(result.totalLines).toBe(0)
      expect(result.dominantOwner).toBe('')
    })

    it('calculates report from multiple files', () => {
      const calc = new OwnershipCalculator()
      const blames = new Map<string, Array<{ lineNumber: number; commit: string; author: string; authorMail: string; timestamp: number; content: string }>>()
      blames.set('a.ts', [
        { lineNumber: 1, commit: 'a', author: 'Alice', authorMail: '', timestamp: 100, content: 'x' },
      ])
      blames.set('b.ts', [
        { lineNumber: 1, commit: 'b', author: 'Bob', authorMail: '', timestamp: 200, content: 'y' },
      ])
      const report = calc.calculateReport(blames)
      expect(report.files.length).toBe(2)
      expect(report.authors.length).toBe(2)
      expect(report.busFactor).toBeGreaterThan(0)
    })

    it('identifies knowledge silos', () => {
      const calc = new OwnershipCalculator()
      const result = calc.calculateFileOwnership(
        Array.from({ length: 10 }, (_, i) => ({
          lineNumber: i + 1, commit: 'a', author: 'Alice', authorMail: '', timestamp: 100, content: 'x',
        })),
        'silo.ts',
      )
      const silos = calc.identifyKnowledgeSilos([result])
      expect(silos.length).toBe(1)
      expect(silos[0]!.owner).toBe('Alice')
    })

    it('calculates ownership concentration', () => {
      const calc = new OwnershipCalculator()
      const owners = [
        { author: 'A', lines: 80, percentage: 0.8, files: ['f.ts'], lastCommitDate: 0 },
        { author: 'B', lines: 20, percentage: 0.2, files: ['f.ts'], lastCommitDate: 0 },
      ]
      const concentration = calc.calculateOwnershipConcentration(owners)
      expect(concentration).toBeGreaterThan(0)
      expect(concentration).toBeLessThanOrEqual(1)
    })

    it('getDomainsForAuthor returns domains', () => {
      const calc = new OwnershipCalculator()
      const files = [
        { filePath: 'src/a.ts', totalLines: 10, owners: [{ author: 'Alice', lines: 10, percentage: 1, files: ['src/a.ts'], lastCommitDate: 0 }], dominantOwner: 'Alice', ownershipConcentration: 1 },
        { filePath: 'lib/b.ts', totalLines: 5, owners: [{ author: 'Alice', lines: 5, percentage: 1, files: ['lib/b.ts'], lastCommitDate: 0 }], dominantOwner: 'Alice', ownershipConcentration: 1 },
      ]
      const domains = calc.getDomainsForAuthor('Alice', files)
      expect(domains).toContain('src')
      expect(domains).toContain('lib')
    })

    it('isAuthorActive checks recency', () => {
      const calc = new OwnershipCalculator({ recentCommitDays: 30 })
      expect(calc.isAuthorActive(Date.now())).toBe(true)
      expect(calc.isAuthorActive(0)).toBe(false)
    })

    it('groupAuthorsByEmail merges authors', () => {
      const calc = new OwnershipCalculator()
      const owners = [
        { author: 'Alice', lines: 10, percentage: 0.5, files: ['a.ts'], lastCommitDate: 100 },
        { author: 'Alice', lines: 20, percentage: 0.5, files: ['b.ts'], lastCommitDate: 200 },
      ]
      const grouped = calc.groupAuthorsByEmail(owners)
      expect(grouped.get('Alice')!.lines).toBe(30)
    })
  })

  // ─── ReviewerSuggester ───────────────────────────────────────────────────

  describe('ReviewerSuggester', () => {
    function makeReport() {
      const calc = new OwnershipCalculator()
      const blames = new Map<string, Array<{ lineNumber: number; commit: string; author: string; authorMail: string; timestamp: number; content: string }>>()
      blames.set('a.ts', [
        { lineNumber: 1, commit: 'c1', author: 'Alice', authorMail: '', timestamp: Date.now(), content: 'x' },
        { lineNumber: 2, commit: 'c2', author: 'Bob', authorMail: '', timestamp: Date.now(), content: 'y' },
      ])
      return calc.calculateReport(blames)
    }

    it('suggests reviewers for a file', () => {
      const suggester = new ReviewerSuggester()
      const report = makeReport()
      const suggestion = suggester.suggestReviewers('a.ts', report)
      expect(suggestion.filePath).toBe('a.ts')
      expect(suggestion.primaryReviewer).toBeTruthy()
    })

    it('handles missing file', () => {
      const suggester = new ReviewerSuggester()
      const report = makeReport()
      const suggestion = suggester.suggestReviewers('missing.ts', report)
      expect(suggestion.primaryReviewer).toBe('')
    })

    it('suggestForChange suggests for multiple files', () => {
      const suggester = new ReviewerSuggester()
      const report = makeReport()
      const suggestions = suggester.suggestForChange(['a.ts'], report)
      expect(suggestions.length).toBe(1)
    })

    it('findCodeOwner returns dominant owner', () => {
      const suggester = new ReviewerSuggester()
      const report = makeReport()
      expect(suggester.findCodeOwner('a.ts', report)).toBeTruthy()
    })

    it('findSecondaryExperts returns other owners', () => {
      const suggester = new ReviewerSuggester()
      const report = makeReport()
      const experts = suggester.findSecondaryExperts('a.ts', report)
      expect(Array.isArray(experts)).toBe(true)
    })

    it('checkBusFactorRisk identifies risky files', () => {
      const suggester = new ReviewerSuggester()
      const report = makeReport()
      const risky = suggester.checkBusFactorRisk(report)
      expect(Array.isArray(risky)).toBe(true)
    })
  })
})
