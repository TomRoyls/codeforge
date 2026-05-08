import { describe, it, expect, beforeEach } from 'vitest'
import { PatternDetector } from '../../src/core/patterns/pattern-detector.js'
import type {
  CodePattern,
  PatternCategory,
  PatternMatch,
  PatternSeverity,
} from '../../src/core/patterns/types.js'

describe('PatternDetector', () => {
  let detector: PatternDetector

  beforeEach(() => {
    detector = new PatternDetector()
  })

  describe('constructor and defaults', () => {
    it('initializes with 20 default patterns', () => {
      expect(detector.getPatterns()).toHaveLength(20)
    })

    it('returns a copy of patterns array', () => {
      const patterns = detector.getPatterns()
      patterns.push(patterns[0]!)
      expect(detector.getPatterns()).toHaveLength(20)
    })

    it('has 5 design patterns', () => {
      expect(detector.getByCategory('design-pattern')).toHaveLength(5)
    })

    it('has 5 anti-patterns', () => {
      expect(detector.getByCategory('anti-pattern')).toHaveLength(5)
    })

    it('has 5 architectural patterns', () => {
      expect(detector.getByCategory('architectural')).toHaveLength(5)
    })

    it('has 5 code smells', () => {
      expect(detector.getByCategory('code-smell')).toHaveLength(5)
    })

    it('has 0 idioms', () => {
      expect(detector.getByCategory('idiom')).toHaveLength(0)
    })

    it('filters by severity info', () => {
      const info = detector.getBySeverity('info')
      expect(info.length).toBeGreaterThan(0)
      expect(info.every((p) => p.severity === 'info')).toBe(true)
    })

    it('filters by severity warning', () => {
      const warning = detector.getBySeverity('warning')
      expect(warning.length).toBeGreaterThan(0)
      expect(warning.every((p) => p.severity === 'warning')).toBe(true)
    })

    it('filters by severity error', () => {
      const error = detector.getBySeverity('error')
      expect(error.length).toBeGreaterThan(0)
      expect(error.every((p) => p.severity === 'error')).toBe(true)
    })
  })

  describe('singleton detection', () => {
    it('detects getInstance pattern', () => {
      const source = `
        class Database {
          private static instance: Database
          static getInstance() { return this.instance }
        }
      `
      const matches = detector.detect(source, 'db.ts')
      const singleton = matches.find((m) => m.pattern.id === 'singleton')
      expect(singleton).toBeDefined()
      expect(singleton!.matchedText).toContain('getInstance')
    })

    it('provides context around match', () => {
      const source = 'class Db { static getInstance() {} }'
      const matches = detector.detect(source, 'db.ts')
      const singleton = matches.find((m) => m.pattern.id === 'singleton')
      expect(singleton).toBeDefined()
      expect(singleton!.context.length).toBeGreaterThan(0)
    })
  })

  describe('observer detection', () => {
    it('detects subscribe calls', () => {
      const source = `
        class EventBus {
          subscribe(event: string, handler: Function) {}
          on(event: string, handler: Function) {}
          addEventListener(type: string, listener: Function) {}
        }
      `
      const matches = detector.detect(source, 'events.ts')
      const observers = matches.filter((m) => m.pattern.id === 'observer')
      expect(observers.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('god object detection', () => {
    it('detects files with too many lines and functions', () => {
      const lines = Array(600).fill('function fn() { return 1 }')
      const source = lines.join('\n')
      const matches = detector.detect(source, 'mega.ts')
      const god = matches.find((m) => m.pattern.id === 'god-object')
      expect(god).toBeDefined()
      expect(god!.confidence).toBeGreaterThan(0)
    })

    it('does not flag small files', () => {
      const source = 'function hello() { return 1 }'
      const matches = detector.detect(source, 'small.ts')
      const god = matches.find((m) => m.pattern.id === 'god-object')
      expect(god).toBeUndefined()
    })
  })

  describe('magic numbers detection', () => {
    it('detects hard-coded numbers', () => {
      const source = `
        const timeout = 30000
        const maxRetries = 42
        const factor = 3.14
      `
      const matches = detector.detect(source, 'config.ts')
      const magic = matches.filter((m) => m.pattern.id === 'magic-numbers')
      expect(magic.length).toBeGreaterThanOrEqual(1)
    })

    it('ignores 0 and 1', () => {
      const source = 'const x = 0; const y = 1;'
      const matches = detector.detect(source, 'nums.ts')
      const magic = matches.filter((m) => m.pattern.id === 'magic-numbers')
      expect(magic).toHaveLength(0)
    })
  })

  describe('barrel file detection', () => {
    it('detects barrel files', () => {
      const source = `
export { Foo } from './foo.js'
export { Bar } from './bar.js'
export { Baz } from './baz.js'
      `.trim()
      const matches = detector.detect(source, 'index.ts')
      const barrel = matches.find((m) => m.pattern.id === 'barrel-file')
      expect(barrel).toBeDefined()
      expect(barrel!.matchedText).toContain('3 re-exports')
    })

    it('does not flag files with logic', () => {
      const source = `
export { Foo } from './foo.js'
function helper() { return 42 }
      `.trim()
      const matches = detector.detect(source, 'index.ts')
      const barrel = matches.find((m) => m.pattern.id === 'barrel-file')
      expect(barrel).toBeUndefined()
    })
  })

  describe('dead code detection', () => {
    it('detects commented-out code', () => {
      const source = `
// function oldCode() {
//   return something
// }
const active = true
      `.trim()
      const matches = detector.detect(source, 'legacy.ts')
      const dead = matches.filter((m) => m.pattern.id === 'dead-code')
      expect(dead.length).toBeGreaterThan(0)
    })

    it('detects block comments with code-like content', () => {
      const source = `/* function oldHelper() { return 42 } */`
      const matches = detector.detect(source, 'old.ts')
      const dead = matches.find((m) => m.pattern.id === 'dead-code')
      expect(dead).toBeDefined()
    })
  })

  describe('callback hell detection', () => {
    it('detects deeply nested callbacks', () => {
      const source = `a(() => {
    b(() => {
        c(() => {
            d(() => {
                e(() => {
                    f()
                })
            })
        })
    })
})`
      const matches = detector.detect(source, 'callbacks.ts')
      const hell = matches.filter((m) => m.pattern.id === 'callback-hell')
      expect(hell.length).toBeGreaterThan(0)
    })
  })

  describe('long method detection', () => {
    it('detects functions with more than 50 lines', () => {
      const body = Array(55).fill('  const x = 1').join('\n')
      const source = `function longFunc() {\n${body}\n}`
      const matches = detector.detect(source, 'long.ts')
      const longMethod = matches.find((m) => m.pattern.id === 'long-method')
      expect(longMethod).toBeDefined()
      expect(longMethod!.confidence).toBeGreaterThan(0)
    })

    it('does not flag short functions', () => {
      const source = 'function short() { return 1 }'
      const matches = detector.detect(source, 'short.ts')
      const longMethod = matches.find((m) => m.pattern.id === 'long-method')
      expect(longMethod).toBeUndefined()
    })
  })

  describe('deep nesting detection', () => {
    it('detects deeply nested code', () => {
      const source = `function deep() {\n    if (a) {\n        if (b) {\n            if (c) {\n                if (d) {\n                    deeplyNested()\n                }\n            }\n        }\n    }\n}`
      const matches = detector.detect(source, 'deep.ts')
      const nested = matches.find((m) => m.pattern.id === 'deep-nesting')
      expect(nested).toBeDefined()
    })
  })

  describe('feature envy detection', () => {
    it('detects excessive external method calls', () => {
      const source = `
        class Order {
          customer: any
          process() {
            this.customer.getAddress()
            this.customer.getName()
            this.customer.getEmail()
          }
        }
      `
      const matches = detector.detect(source, 'order.ts')
      const envy = matches.find((m) => m.pattern.id === 'feature-envy')
      expect(envy).toBeDefined()
    })
  })

  describe('detect', () => {
    it('returns empty array for clean source', () => {
      const matches = detector.detect('', 'empty.ts')
      expect(matches).toEqual([])
    })

    it('returns matches with correct file path', () => {
      const source = 'const x = getInstance()'
      const matches = detector.detect(source, 'test/path.ts')
      expect(matches.every((m) => m.filePath === 'test/path.ts')).toBe(true)
    })

    it('returns matches with valid line numbers', () => {
      const source = 'const x = getInstance()'
      const matches = detector.detect(source, 'test.ts')
      for (const match of matches) {
        expect(match.line).toBeGreaterThanOrEqual(1)
      }
    })

    it('returns matches with valid column numbers', () => {
      const source = 'const x = getInstance()'
      const matches = detector.detect(source, 'test.ts')
      for (const match of matches) {
        expect(match.column).toBeGreaterThanOrEqual(1)
      }
    })

    it('returns matches with confidence between 0 and 1', () => {
      const source = 'const x = 42; subscribe("click", handler)'
      const matches = detector.detect(source, 'mixed.ts')
      for (const match of matches) {
        expect(match.confidence).toBeGreaterThan(0)
        expect(match.confidence).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('detectBatch', () => {
    it('detects patterns across multiple files', () => {
      const sources = new Map<string, string>()
      sources.set('a.ts', 'const x = getInstance()')
      sources.set('b.ts', 'subscribe("event", () => {})')

      const report = detector.detectBatch(sources)
      expect(report.matches.length).toBeGreaterThan(0)
    })

    it('generates a complete report', () => {
      const sources = new Map<string, string>()
      sources.set('a.ts', 'const x = 42')

      const report = detector.detectBatch(sources)
      expect(report.summary).toBeDefined()
      expect(report.suggestions).toBeDefined()
      expect(report.matches).toBeDefined()
    })

    it('handles empty source map', () => {
      const sources = new Map<string, string>()
      const report = detector.detectBatch(sources)
      expect(report.matches).toEqual([])
      expect(report.summary.totalMatches).toBe(0)
      expect(report.summary.healthScore).toBe(100)
    })

    it('aggregates matches from all files', () => {
      const sources = new Map<string, string>()
      sources.set('singleton.ts', 'getInstance()')
      sources.set('observer.ts', 'subscribe("x", fn)')
      sources.set('mixed.ts', 'getInstance(); subscribe("y", fn)')

      const report = detector.detectBatch(sources)
      expect(report.summary.totalMatches).toBeGreaterThan(2)
    })
  })

  describe('calculateHealthScore', () => {
    it('returns 100 for no matches', () => {
      expect(detector.calculateHealthScore([])).toBe(100)
    })

    it('deducts 5 for each error', () => {
      const matches = createMockMatches('anti-pattern', 'error', 2)
      expect(detector.calculateHealthScore(matches)).toBe(90)
    })

    it('deducts 2 for each warning', () => {
      const matches = createMockMatches('code-smell', 'warning', 3)
      expect(detector.calculateHealthScore(matches)).toBe(94)
    })

    it('deducts 0.5 for each info (rounded)', () => {
      const matches = createMockMatches('design-pattern', 'info', 4)
      expect(detector.calculateHealthScore(matches)).toBe(98)
    })

    it('clamps to 0 minimum', () => {
      const matches = createMockMatches('anti-pattern', 'error', 30)
      expect(detector.calculateHealthScore(matches)).toBe(0)
    })

    it('calculates mixed severities correctly', () => {
      const matches = [
        ...createMockMatches('anti-pattern', 'error', 1),
        ...createMockMatches('code-smell', 'warning', 2),
        ...createMockMatches('design-pattern', 'info', 2),
      ]
      const expected = 100 - 5 - 4 - 1
      expect(detector.calculateHealthScore(matches)).toBe(expected)
    })
  })

  describe('generateReport', () => {
    it('counts by category correctly', () => {
      const matches = [
        ...createMockMatches('design-pattern', 'info', 3),
        ...createMockMatches('anti-pattern', 'error', 2),
      ]
      const report = detector.generateReport(matches)
      expect(report.summary.byCategory['design-pattern']).toBe(3)
      expect(report.summary.byCategory['anti-pattern']).toBe(2)
    })

    it('counts by severity correctly', () => {
      const matches = [
        ...createMockMatches('anti-pattern', 'error', 2),
        ...createMockMatches('code-smell', 'warning', 3),
      ]
      const report = detector.generateReport(matches)
      expect(report.summary.bySeverity['error']).toBe(2)
      expect(report.summary.bySeverity['warning']).toBe(3)
    })

    it('counts unique patterns', () => {
      const matches = createMockMatches('design-pattern', 'info', 5)
      const report = detector.generateReport(matches)
      expect(report.summary.uniquePatterns).toBe(1)
    })
  })

  describe('generateSuggestions', () => {
    it('suggests refactor for anti-patterns', () => {
      const matches = createMockMatches('anti-pattern', 'error', 1)
      const suggestions = detector.generateSuggestions(matches)
      expect(suggestions[0]!.action).toBe('refactor')
    })

    it('suggests keep for design patterns', () => {
      const matches = createMockMatches('design-pattern', 'info', 1)
      const suggestions = detector.generateSuggestions(matches)
      expect(suggestions[0]!.action).toBe('keep')
    })

    it('suggests review for code smells', () => {
      const matches = createMockMatches('code-smell', 'warning', 1)
      const suggestions = detector.generateSuggestions(matches)
      expect(suggestions[0]!.action).toBe('review')
    })

    it('suggests consider for architectural warnings', () => {
      const matches = createMockMatches('architectural', 'warning', 1)
      const suggestions = detector.generateSuggestions(matches)
      expect(suggestions[0]!.action).toBe('consider')
    })

    it('deduplicates suggestions by pattern id', () => {
      const matches = createMockMatches('anti-pattern', 'error', 5)
      const suggestions = detector.generateSuggestions(matches)
      expect(suggestions).toHaveLength(1)
    })

    it('keeps highest confidence match for duplicate patterns', () => {
      const pattern = createMockPattern('anti-pattern', 'error')
      const matches: PatternMatch[] = [
        { pattern, filePath: 'a.ts', line: 1, column: 1, matchedText: 'a', confidence: 0.3, context: '' },
        { pattern, filePath: 'b.ts', line: 1, column: 1, matchedText: 'b', confidence: 0.9, context: '' },
      ]
      const suggestions = detector.generateSuggestions(matches)
      expect(suggestions).toHaveLength(1)
      expect(suggestions[0]!.reason).toBeDefined()
    })

    it('assigns correct effort levels', () => {
      const godMatch = createMockMatchesWithId('god-object', 'anti-pattern', 'error')
      const spaghettiMatch = createMockMatchesWithId('spaghetti', 'anti-pattern', 'error')
      const suggestions = detector.generateSuggestions([...godMatch, ...spaghettiMatch])
      const efforts = suggestions.map((s) => s.effort)
      expect(efforts.every((e) => e === 'high')).toBe(true)
    })

    it('includes reason strings', () => {
      const matches = createMockMatchesWithId('magic-numbers', 'anti-pattern', 'warning')
      const suggestions = detector.generateSuggestions(matches)
      expect(suggestions[0]!.reason).toContain('Magic number')
    })
  })

  describe('addPattern', () => {
    it('adds a custom pattern', () => {
      const custom: CodePattern = {
        id: 'custom-test',
        name: 'Custom Test',
        category: 'idiom',
        severity: 'info',
        description: 'Custom test pattern',
        detectionRegex: /customPattern\d+/g,
        indicators: ['custom'],
      }
      detector.addPattern(custom)
      expect(detector.getPatterns()).toHaveLength(21)
    })

    it('detects matches from custom pattern', () => {
      const custom: CodePattern = {
        id: 'custom-regex',
        name: 'Custom Regex',
        category: 'idiom',
        severity: 'info',
        description: 'Custom regex test',
        detectionRegex: /customPattern\d+/g,
        indicators: ['custom'],
      }
      detector.addPattern(custom)
      const source = 'const x = customPattern42'
      const matches = detector.detect(source, 'test.ts')
      const customMatch = matches.find((m) => m.pattern.id === 'custom-regex')
      expect(customMatch).toBeDefined()
      expect(customMatch!.matchedText).toContain('customPattern')
    })
  })

  describe('removePattern', () => {
    it('removes an existing pattern', () => {
      const result = detector.removePattern('singleton')
      expect(result).toBe(true)
      expect(detector.getPatterns()).toHaveLength(19)
    })

    it('returns false for non-existent pattern', () => {
      const result = detector.removePattern('nonexistent')
      expect(result).toBe(false)
      expect(detector.getPatterns()).toHaveLength(20)
    })

    it('removed pattern is no longer detected', () => {
      detector.removePattern('singleton')
      const source = 'class Db { static getInstance() {} }'
      const matches = detector.detect(source, 'test.ts')
      expect(matches.find((m) => m.pattern.id === 'singleton')).toBeUndefined()
    })
  })

  describe('formatReport', () => {
    it('formats empty report', () => {
      const report = detector.generateReport([])
      const formatted = detector.formatReport(report)
      expect(formatted).toContain('Pattern Detection Report')
      expect(formatted).toContain('Health Score: 100/100')
      expect(formatted).toContain('Total Matches: 0')
    })

    it('formats report with matches', () => {
      const sources = new Map<string, string>()
      sources.set('a.ts', 'getInstance()')
      const report = detector.detectBatch(sources)
      const formatted = detector.formatReport(report)
      expect(formatted).toContain('Matches')
      expect(formatted).toContain('Singleton')
    })

    it('includes suggestions in formatted output', () => {
      const sources = new Map<string, string>()
      sources.set('a.ts', 'getInstance()')
      const report = detector.detectBatch(sources)
      const formatted = detector.formatReport(report)
      expect(formatted).toContain('Suggestions')
    })

    it('includes category breakdown', () => {
      const matches = createMockMatches('design-pattern', 'info', 3)
      const report = detector.generateReport(matches)
      const formatted = detector.formatReport(report)
      expect(formatted).toContain('design-pattern: 3')
    })

    it('includes severity breakdown', () => {
      const matches = createMockMatches('anti-pattern', 'error', 2)
      const report = detector.generateReport(matches)
      const formatted = detector.formatReport(report)
      expect(formatted).toContain('error: 2')
    })
  })

  describe('pattern completeness', () => {
    it('all patterns have unique ids', () => {
      const patterns = detector.getPatterns()
      const ids = patterns.map((p) => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('all patterns have required fields', () => {
      const patterns = detector.getPatterns()
      for (const p of patterns) {
        expect(p.id).toBeTruthy()
        expect(p.name).toBeTruthy()
        expect(p.category).toBeTruthy()
        expect(p.severity).toBeTruthy()
        expect(p.description).toBeTruthy()
        expect(p.detectionRegex).toBeInstanceOf(RegExp)
        expect(p.indicators.length).toBeGreaterThan(0)
      }
    })

    it('all patterns have valid categories', () => {
      const validCategories: PatternCategory[] = ['design-pattern', 'anti-pattern', 'architectural', 'idiom', 'code-smell']
      const patterns = detector.getPatterns()
      for (const p of patterns) {
        expect(validCategories).toContain(p.category)
      }
    })

    it('all patterns have valid severities', () => {
      const validSeverities: PatternSeverity[] = ['info', 'warning', 'error']
      const patterns = detector.getPatterns()
      for (const p of patterns) {
        expect(validSeverities).toContain(p.severity)
      }
    })
  })

  describe('integration', () => {
    it('detects multiple patterns in realistic code', () => {
      const source = `
import { Foo } from './foo.js'
import { Bar } from './bar.js'

const TIMEOUT = 30000
const MAX = 42

class EventBus {
  subscribe(event: string, handler: Function) {}
  on(event: string, handler: Function) {}
  addEventListener(type: string, fn: Function) {}
}

function createWidget(config: any) {
  return new Widget(config)
}

// function oldCode() {
//   return 42
// }
      `.trim()

      const matches = detector.detect(source, 'app.ts')
      expect(matches.length).toBeGreaterThan(0)

      const ids = new Set(matches.map((m) => m.pattern.id))
      expect(ids.size).toBeGreaterThan(1)
    })

    it('full batch pipeline works end to end', () => {
      const sources = new Map<string, string>()
      sources.set('singleton.ts', 'class Db { static getInstance() { return null } }')
      sources.set('observer.ts', 'subscribe("event", () => {})')
      sources.set('magic.ts', 'const x = 42')

      const report = detector.detectBatch(sources)

      expect(report.summary.totalMatches).toBeGreaterThan(0)
      expect(report.summary.healthScore).toBeLessThan(100)
      expect(report.suggestions.length).toBeGreaterThan(0)
      expect(report.matches.length).toBeGreaterThan(0)

      const formatted = detector.formatReport(report)
      expect(formatted).toContain('Pattern Detection Report')
      expect(formatted.length).toBeGreaterThan(100)
    })
  })
})

function createMockPattern(category: PatternCategory, severity: PatternSeverity): CodePattern {
  return {
    id: 'test-pattern',
    name: 'Test Pattern',
    category,
    severity,
    description: 'Test',
    detectionRegex: /test/g,
    indicators: ['test'],
  }
}

function createMockMatches(
  category: PatternCategory,
  severity: PatternSeverity,
  count: number,
): PatternMatch[] {
  const pattern = createMockPattern(category, severity)
  return Array.from({ length: count }, () => ({
    pattern,
    filePath: 'test.ts',
    line: 1,
    column: 1,
    matchedText: 'test',
    confidence: 0.8,
    context: '',
  }))
}

function createMockMatchesWithId(
  id: string,
  category: PatternCategory,
  severity: PatternSeverity,
): PatternMatch[] {
  const pattern: CodePattern = {
    id,
    name: `Test ${id}`,
    category,
    severity,
    description: `Test pattern ${id}`,
    detectionRegex: /test/g,
    indicators: ['test'],
  }
  return [{
    pattern,
    filePath: 'test.ts',
    line: 1,
    column: 1,
    matchedText: 'test',
    confidence: 0.8,
    context: '',
  }]
}
