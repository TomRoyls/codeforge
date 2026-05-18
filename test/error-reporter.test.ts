import { describe, it, expect, beforeEach } from 'vitest'
import { ErrorCollector, ErrorFormatter, ErrorAggregator } from '../src/core/error-reporter/index.js'
import type { ErrorEntry, ErrorReport } from '../src/core/error-reporter/index.js'

const makeEntry = (overrides: Partial<ErrorEntry> = {}): ErrorEntry => ({
  id: `err_${Math.random().toString(36).slice(2)}`,
  ruleId: 'test-rule',
  message: 'Test error',
  severity: 'error',
  filePath: 'test.ts',
  line: 1,
  column: 1,
  tags: [],
  timestamp: Date.now(),
  ...overrides,
})

// ─── ErrorCollector ───

describe('ErrorCollector', () => {
  let collector: ErrorCollector

  beforeEach(() => {
    collector = new ErrorCollector()
  })

  describe('add and getAll', () => {
    it('should add and retrieve entries', () => {
      const entry = makeEntry()
      collector.add(entry)
      expect(collector.getAll()).toEqual([entry])
    })
  })

  describe('addMany', () => {
    it('should add multiple entries', () => {
      const entries = [makeEntry(), makeEntry()]
      collector.addMany(entries)
      expect(collector.count()).toBe(2)
    })
  })

  describe('remove', () => {
    it('should remove an entry by id', () => {
      const entry = makeEntry()
      collector.add(entry)
      expect(collector.remove(entry.id)).toBe(true)
      expect(collector.count()).toBe(0)
    })

    it('should return false for non-existent id', () => {
      expect(collector.remove('nonexistent')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      collector.add(makeEntry())
      collector.add(makeEntry())
      collector.clear()
      expect(collector.count()).toBe(0)
    })
  })

  describe('getById', () => {
    it('should get entry by id', () => {
      const entry = makeEntry()
      collector.add(entry)
      expect(collector.getById(entry.id)).toEqual(entry)
    })

    it('should return null for missing id', () => {
      expect(collector.getById('missing')).toBeNull()
    })
  })

  describe('getByFile', () => {
    it('should filter by file path', () => {
      collector.add(makeEntry({ filePath: 'a.ts' }))
      collector.add(makeEntry({ filePath: 'b.ts' }))
      collector.add(makeEntry({ filePath: 'a.ts' }))
      expect(collector.getByFile('a.ts').length).toBe(2)
    })
  })

  describe('getByRule', () => {
    it('should filter by rule id', () => {
      collector.add(makeEntry({ ruleId: 'r1' }))
      collector.add(makeEntry({ ruleId: 'r2' }))
      expect(collector.getByRule('r1').length).toBe(1)
    })
  })

  describe('getBySeverity', () => {
    it('should filter by severity', () => {
      collector.add(makeEntry({ severity: 'error' }))
      collector.add(makeEntry({ severity: 'warning' }))
      collector.add(makeEntry({ severity: 'error' }))
      expect(collector.getBySeverity('error').length).toBe(2)
    })
  })

  describe('getFixable', () => {
    it('should return only entries with fixes', () => {
      collector.add(makeEntry({ fix: { range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 5 }, replacement: 'x', description: 'fix', isSafe: true } }))
      collector.add(makeEntry())
      expect(collector.getFixable().length).toBe(1)
    })
  })

  describe('count', () => {
    it('should return entry count', () => {
      expect(collector.count()).toBe(0)
      collector.add(makeEntry())
      expect(collector.count()).toBe(1)
    })
  })
})

// ─── ErrorFormatter ───

describe('ErrorFormatter', () => {
  const formatter = new ErrorFormatter()

  describe('formatSingle', () => {
    it('should format a single error entry', () => {
      const entry = makeEntry({ severity: 'error', message: 'Unexpected token', ruleId: 'no-syntax-err', filePath: 'app.ts', line: 10, column: 5 })
      const output = formatter.formatSingle(entry)
      expect(output).toContain('Error')
      expect(output).toContain('Unexpected token')
      expect(output).toContain('app.ts:10:5')
    })

    it('should include fix info when present', () => {
      const entry = makeEntry({ fix: { range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 5 }, replacement: 'const', description: 'Replace with const', isSafe: true } })
      const output = formatter.formatSingle(entry)
      expect(output).toContain('Fix:')
      expect(output).toContain('[safe]')
    })

    it('should include source line when present', () => {
      const entry = makeEntry({ source: 'const x = 1', column: 7 })
      const output = formatter.formatSingle(entry)
      expect(output).toContain('const x = 1')
    })
  })

  describe('formatText', () => {
    it('should return no issues message for empty entries', () => {
      const summary = { total: 0, errors: 0, warnings: 0, info: 0, suggestions: 0, fixableCount: 0, filesAffected: 0, byRule: new Map(), byFile: new Map(), bySeverity: new Map() }
      expect(formatter.formatText([], summary as any)).toBe('No issues found.')
    })
  })

  describe('formatSummary', () => {
    it('should format summary with counts', () => {
      const summary = { total: 10, errors: 3, warnings: 5, info: 2, suggestions: 0, fixableCount: 1, filesAffected: 4, byRule: new Map(), byFile: new Map(), bySeverity: new Map() }
      const output = formatter.formatSummary(summary as any)
      expect(output).toContain('Total: 10')
      expect(output).toContain('Errors: 3')
      expect(output).toContain('Warnings: 5')
    })
  })

  describe('formatJSON', () => {
    it('should serialize report as JSON', () => {
      const report: ErrorReport = {
        summary: { total: 1, errors: 1, warnings: 0, info: 0, suggestions: 0, fixableCount: 0, filesAffected: 1, byRule: new Map(), byFile: new Map(), bySeverity: new Map() },
        groups: [], entries: [makeEntry()], generatedAt: Date.now(), format: 'json',
      }
      const output = formatter.formatJSON(report)
      const parsed = JSON.parse(output)
      expect(parsed.summary.total).toBe(1)
    })
  })

  describe('formatMarkdown', () => {
    it('should format report as markdown', () => {
      const report: ErrorReport = {
        summary: { total: 1, errors: 1, warnings: 0, info: 0, suggestions: 0, fixableCount: 0, filesAffected: 1, byRule: new Map(), byFile: new Map(), bySeverity: new Map() },
        groups: [], entries: [makeEntry()], generatedAt: Date.now(), format: 'markdown',
      }
      const output = formatter.formatMarkdown(report)
      expect(output).toContain('# Error Report')
    })
  })

  describe('formatSARIF', () => {
    it('should format as SARIF', () => {
      const entries = [makeEntry()]
      const sarif = formatter.formatSARIF(entries) as any
      expect(sarif.version).toBe('2.1.0')
      expect(sarif.runs[0].results.length).toBe(1)
    })
  })

  describe('formatJUnit', () => {
    it('should format as JUnit XML', () => {
      const entries = [makeEntry({ severity: 'error' }), makeEntry({ severity: 'warning', filePath: 'other.ts' })]
      const output = formatter.formatJUnit(entries)
      expect(output).toContain('<?xml')
      expect(output).toContain('testsuites')
    })
  })
})

// ─── ErrorAggregator ───

describe('ErrorAggregator', () => {
  const aggregator = new ErrorAggregator()

  describe('aggregate', () => {
    it('should group entries by rule id', () => {
      const entries = [
        makeEntry({ ruleId: 'r1', filePath: 'a.ts' }),
        makeEntry({ ruleId: 'r1', filePath: 'b.ts' }),
        makeEntry({ ruleId: 'r2', filePath: 'a.ts' }),
      ]
      const groups = aggregator.aggregate(entries)
      expect(groups.length).toBe(2)
      const r1Group = groups.find((g) => g.ruleId === 'r1')!
      expect(r1Group.count).toBe(2)
      expect(r1Group.files.length).toBe(2)
    })

    it('should sort groups by count descending', () => {
      const entries = [makeEntry({ ruleId: 'r1' }), makeEntry({ ruleId: 'r2' }), makeEntry({ ruleId: 'r2' })]
      const groups = aggregator.aggregate(entries)
      expect(groups[0]!.ruleId).toBe('r2')
    })
  })

  describe('summarize', () => {
    it('should compute summary statistics', () => {
      const entries = [
        makeEntry({ severity: 'error', ruleId: 'r1', filePath: 'a.ts' }),
        makeEntry({ severity: 'warning', ruleId: 'r2', filePath: 'a.ts' }),
        makeEntry({ severity: 'info', ruleId: 'r3', filePath: 'b.ts' }),
      ]
      const summary = aggregator.summarize(entries)
      expect(summary.total).toBe(3)
      expect(summary.errors).toBe(1)
      expect(summary.warnings).toBe(1)
      expect(summary.info).toBe(1)
      expect(summary.filesAffected).toBe(2)
    })

    it('should count fixable entries', () => {
      const entries = [
        makeEntry({ fix: { range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 5 }, replacement: 'x', description: 'fix', isSafe: true } }),
        makeEntry(),
      ]
      const summary = aggregator.summarize(entries)
      expect(summary.fixableCount).toBe(1)
    })
  })

  describe('generateReport', () => {
    it('should generate a complete error report', () => {
      const entries = [makeEntry()]
      const report = aggregator.generateReport(entries, 'json')
      expect(report.format).toBe('json')
      expect(report.entries.length).toBe(1)
      expect(report.generatedAt).toBeGreaterThan(0)
    })
  })

  describe('getTopRules', () => {
    it('should return top N rules by count', () => {
      const entries = [
        makeEntry({ ruleId: 'r1' }), makeEntry({ ruleId: 'r1' }), makeEntry({ ruleId: 'r1' }),
        makeEntry({ ruleId: 'r2' }), makeEntry({ ruleId: 'r2' }),
        makeEntry({ ruleId: 'r3' }),
      ]
      const top = aggregator.getTopRules(entries, 2)
      expect(top.length).toBe(2)
      expect(top[0]!.ruleId).toBe('r1')
    })
  })

  describe('getTopFiles', () => {
    it('should return top N files by error count', () => {
      const entries = [
        makeEntry({ filePath: 'a.ts' }), makeEntry({ filePath: 'a.ts' }),
        makeEntry({ filePath: 'b.ts' }),
      ]
      const top = aggregator.getTopFiles(entries, 1)
      expect(top).toEqual(['a.ts'])
    })
  })

  describe('getHeatmap', () => {
    it('should return error count per file', () => {
      const entries = [makeEntry({ filePath: 'a.ts' }), makeEntry({ filePath: 'a.ts' }), makeEntry({ filePath: 'b.ts' })]
      const heatmap = aggregator.getHeatmap(entries)
      expect(heatmap.get('a.ts')).toBe(2)
      expect(heatmap.get('b.ts')).toBe(1)
    })
  })

  describe('getTrend', () => {
    it('should compute improvement and regression', () => {
      const current = { total: 5, errors: 1, warnings: 0, info: 0, suggestions: 0, fixableCount: 0, filesAffected: 0, byRule: new Map(), byFile: new Map(), bySeverity: new Map() }
      const previous = { total: 10, errors: 3, warnings: 0, info: 0, suggestions: 0, fixableCount: 0, filesAffected: 0, byRule: new Map(), byFile: new Map(), bySeverity: new Map() }
      const trend = aggregator.getTrend(current as any, previous as any)
      expect(trend.improved).toBe(5)
      expect(trend.regressed).toBe(0)
      expect(trend.fixed).toBe(2)
    })
  })
})
