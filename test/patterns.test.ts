import { describe, it, expect } from 'vitest'
import { PatternDetector } from '../src/core/patterns/index.js'

describe('PatternDetector', () => {
  // ─── Construction ───
  describe('construction', () => {
    it('creates detector with default patterns', () => {
      const detector = new PatternDetector()
      expect(detector.getPatterns().length).toBeGreaterThan(0)
    })

    it('getByCategory filters patterns', () => {
      const detector = new PatternDetector()
      const anti = detector.getByCategory('anti-pattern')
      expect(anti.length).toBeGreaterThan(0)
      expect(anti.every(p => p.category === 'anti-pattern')).toBe(true)
    })

    it('getBySeverity filters patterns', () => {
      const detector = new PatternDetector()
      const errors = detector.getBySeverity('error')
      expect(errors.every(p => p.severity === 'error')).toBe(true)
    })
  })

  // ─── Detection ───
  describe('detect', () => {
    it('detects singleton pattern', () => {
      const detector = new PatternDetector()
      const matches = detector.detect('class Foo { static getInstance() { return new Foo() } }', 'test.ts')
      const singleton = matches.find(m => m.pattern.id === 'singleton')
      expect(singleton).toBeDefined()
    })

    it('detects observer pattern', () => {
      const detector = new PatternDetector()
      const matches = detector.detect('obj.subscribe(handler)', 'test.ts')
      const observer = matches.find(m => m.pattern.id === 'observer')
      expect(observer).toBeDefined()
    })

    it('detects barrel file pattern', () => {
      const detector = new PatternDetector()
      const source = `export { Foo } from './foo.js'\nexport { Bar } from './bar.js'\n`
      const matches = detector.detect(source, 'index.ts')
      const barrel = matches.find(m => m.pattern.id === 'barrel-file')
      expect(barrel).toBeDefined()
    })

    it('detects magic numbers', () => {
      const detector = new PatternDetector()
      const matches = detector.detect('const x = 42', 'test.ts')
      const magic = matches.find(m => m.pattern.id === 'magic-numbers')
      expect(magic).toBeDefined()
    })

    it('returns matches with correct structure', () => {
      const detector = new PatternDetector()
      const matches = detector.detect('obj.subscribe(fn)', 'test.ts')
      const m = matches.find(x => x.pattern.id === 'observer')
      expect(m!.filePath).toBe('test.ts')
      expect(m!.line).toBeGreaterThan(0)
      expect(m!.confidence).toBeGreaterThan(0)
    })

    it('detects patterns from multiple categories', () => {
      const detector = new PatternDetector()
      const source = 'getInstance()\nconst x = 42\nobj.subscribe(fn)'
      const matches = detector.detect(source, 'test.ts')
      const categories = new Set(matches.map(m => m.pattern.category))
      expect(categories.size).toBeGreaterThanOrEqual(2)
    })
  })

  // ─── Batch Detection ───
  describe('detectBatch', () => {
    it('processes multiple sources', () => {
      const detector = new PatternDetector()
      const sources = new Map<string, string>()
      sources.set('a.ts', 'getInstance()')
      sources.set('b.ts', 'subscribe(fn)')
      const report = detector.detectBatch(sources)
      expect(report.matches.length).toBeGreaterThan(0)
      expect(report.summary.totalMatches).toBeGreaterThan(0)
    })
  })

  // ─── Report Generation ───
  describe('report generation', () => {
    it('generateReport produces summary', () => {
      const detector = new PatternDetector()
      const matches = detector.detect('getInstance()', 'test.ts')
      const report = detector.generateReport(matches)
      expect(report.summary.totalMatches).toBe(matches.length)
      expect(report.summary.healthScore).toBeLessThanOrEqual(100)
    })

    it('calculateHealthScore decreases with errors', () => {
      const detector = new PatternDetector()
      const score1 = detector.calculateHealthScore([])
      const score2 = detector.calculateHealthScore([
        { pattern: { id: 'x', severity: 'error' } as never, filePath: '', line: 0, column: 0, matchedText: '', confidence: 1, context: '' },
      ])
      expect(score2).toBeLessThan(score1)
    })

    it('formatReport produces non-empty string', () => {
      const detector = new PatternDetector()
      const report = detector.generateReport([])
      const formatted = detector.formatReport(report)
      expect(formatted.length).toBeGreaterThan(0)
      expect(formatted).toContain('Pattern Detection Report')
    })

    it('generateSuggestions returns suggestions', () => {
      const detector = new PatternDetector()
      const matches = detector.detect('getInstance()', 'test.ts')
      const suggestions = detector.generateSuggestions(matches)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0]!.action).toBeDefined()
      expect(suggestions[0]!.effort).toBeDefined()
    })
  })

  // ─── Pattern Management ───
  describe('pattern management', () => {
    it('addPattern registers a custom pattern', () => {
      const detector = new PatternDetector()
      const before = detector.getPatterns().length
      detector.addPattern({
        id: 'custom-test',
        name: 'Custom Test',
        category: 'idiom',
        severity: 'info',
        description: 'Test pattern',
        detectionRegex: /CUSTOM_PATTERN_MARKER/g,
        indicators: ['marker'],
      })
      expect(detector.getPatterns().length).toBe(before + 1)
    })

    it('removePattern removes a pattern by id', () => {
      const detector = new PatternDetector()
      const before = detector.getPatterns().length
      expect(detector.removePattern('singleton')).toBe(true)
      expect(detector.getPatterns().length).toBe(before - 1)
    })

    it('removePattern returns false for unknown id', () => {
      const detector = new PatternDetector()
      expect(detector.removePattern('nonexistent')).toBe(false)
    })
  })
})
