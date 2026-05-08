import { describe, it, expect } from 'vitest'
import { ErrorCollector } from '../../src/core/error-reporter/error-collector.js'
import { ErrorFormatter } from '../../src/core/error-reporter/error-formatter.js'
import { ErrorAggregator } from '../../src/core/error-reporter/error-aggregator.js'
import type { ErrorEntry, ErrorSummary, ErrorReport } from '../../src/core/error-reporter/types.js'

function makeEntry(overrides: Partial<ErrorEntry> = {}): ErrorEntry {
  return {
    id: `err-${Math.random().toString(36).slice(2, 9)}`,
    ruleId: 'test-rule',
    message: 'test message',
    severity: 'error',
    filePath: 'src/test.ts',
    line: 1,
    column: 1,
    tags: [],
    timestamp: Date.now(),
    ...overrides,
  }
}

function makeFix() {
  return {
    range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 5 },
    replacement: 'fix',
    description: 'Replace with fix',
    isSafe: true,
  }
}

const sampleEntries: ErrorEntry[] = [
  makeEntry({ id: 'e1', ruleId: 'no-console', severity: 'warning', filePath: 'src/a.ts', line: 10, column: 1 }),
  makeEntry({ id: 'e2', ruleId: 'no-console', severity: 'warning', filePath: 'src/b.ts', line: 20, column: 5 }),
  makeEntry({ id: 'e3', ruleId: 'no-eval', severity: 'error', filePath: 'src/a.ts', line: 30, column: 10, fix: makeFix() }),
  makeEntry({ id: 'e4', ruleId: 'prefer-const', severity: 'suggestion', filePath: 'src/c.ts', line: 5, column: 3 }),
  makeEntry({ id: 'e5', ruleId: 'max-params', severity: 'info', filePath: 'src/d.ts', line: 15, column: 8 }),
]

describe('ErrorCollector', () => {
  describe('add', () => {
    it('should add a single entry', () => {
      const collector = new ErrorCollector()
      const entry = makeEntry()
      collector.add(entry)
      expect(collector.count()).toBe(1)
    })

    it('should overwrite entry with same id', () => {
      const collector = new ErrorCollector()
      const entry1 = makeEntry({ id: 'same', message: 'first' })
      const entry2 = makeEntry({ id: 'same', message: 'second' })
      collector.add(entry1)
      collector.add(entry2)
      expect(collector.count()).toBe(1)
      expect(collector.getById('same')!.message).toBe('second')
    })
  })

  describe('addMany', () => {
    it('should add multiple entries', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      expect(collector.count()).toBe(5)
    })

    it('should handle empty array', () => {
      const collector = new ErrorCollector()
      collector.addMany([])
      expect(collector.count()).toBe(0)
    })
  })

  describe('remove', () => {
    it('should remove an entry by id', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      expect(collector.remove('e3')).toBe(true)
      expect(collector.count()).toBe(4)
      expect(collector.getById('e3')).toBeNull()
    })

    it('should return false for non-existent id', () => {
      const collector = new ErrorCollector()
      expect(collector.remove('nonexistent')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      collector.clear()
      expect(collector.count()).toBe(0)
      expect(collector.getAll()).toEqual([])
    })
  })

  describe('getAll', () => {
    it('should return all entries', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      const all = collector.getAll()
      expect(all).toHaveLength(5)
    })

    it('should return empty array when empty', () => {
      const collector = new ErrorCollector()
      expect(collector.getAll()).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return entry by id', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      const entry = collector.getById('e1')
      expect(entry).not.toBeNull()
      expect(entry!.ruleId).toBe('no-console')
    })

    it('should return null for non-existent id', () => {
      const collector = new ErrorCollector()
      expect(collector.getById('nonexistent')).toBeNull()
    })
  })

  describe('getByFile', () => {
    it('should return entries for a specific file', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      const entries = collector.getByFile('src/a.ts')
      expect(entries).toHaveLength(2)
      expect(entries.every((e) => e.filePath === 'src/a.ts')).toBe(true)
    })

    it('should return empty array for unknown file', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      expect(collector.getByFile('nonexistent.ts')).toEqual([])
    })
  })

  describe('getByRule', () => {
    it('should return entries for a specific rule', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      const entries = collector.getByRule('no-console')
      expect(entries).toHaveLength(2)
      expect(entries.every((e) => e.ruleId === 'no-console')).toBe(true)
    })

    it('should return empty array for unknown rule', () => {
      const collector = new ErrorCollector()
      expect(collector.getByRule('nonexistent')).toEqual([])
    })
  })

  describe('getBySeverity', () => {
    it('should return error entries', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      const errors = collector.getBySeverity('error')
      expect(errors).toHaveLength(1)
      expect(errors[0]!.severity).toBe('error')
    })

    it('should return warning entries', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      expect(collector.getBySeverity('warning')).toHaveLength(2)
    })

    it('should return info entries', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      expect(collector.getBySeverity('info')).toHaveLength(1)
    })

    it('should return suggestion entries', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      expect(collector.getBySeverity('suggestion')).toHaveLength(1)
    })
  })

  describe('getFixable', () => {
    it('should return only entries with fixes', () => {
      const collector = new ErrorCollector()
      collector.addMany(sampleEntries)
      const fixable = collector.getFixable()
      expect(fixable).toHaveLength(1)
      expect(fixable[0]!.id).toBe('e3')
      expect(fixable[0]!.fix).toBeDefined()
    })

    it('should return empty array when no fixes', () => {
      const collector = new ErrorCollector()
      collector.add(makeEntry())
      expect(collector.getFixable()).toEqual([])
    })
  })

  describe('count', () => {
    it('should return 0 for empty collector', () => {
      const collector = new ErrorCollector()
      expect(collector.count()).toBe(0)
    })

    it('should return correct count after operations', () => {
      const collector = new ErrorCollector()
      collector.add(makeEntry())
      collector.add(makeEntry())
      collector.add(makeEntry())
      expect(collector.count()).toBe(3)
      collector.remove(collector.getAll()[0]!.id)
      expect(collector.count()).toBe(2)
    })
  })
})

describe('ErrorFormatter', () => {
  const formatter = new ErrorFormatter()

  describe('formatSingle', () => {
    it('should format a basic error entry', () => {
      const entry = makeEntry({ severity: 'error', message: 'Unexpected eval', filePath: 'src/app.ts', line: 42, column: 7 })
      const result = formatter.formatSingle(entry)
      expect(result).toContain('Error: Unexpected eval')
      expect(result).toContain('src/app.ts:42:7')
    })

    it('should format warning severity', () => {
      const entry = makeEntry({ severity: 'warning', message: 'no-console' })
      expect(formatter.formatSingle(entry)).toContain('Warning: no-console')
    })

    it('should format info severity', () => {
      const entry = makeEntry({ severity: 'info', message: 'info msg' })
      expect(formatter.formatSingle(entry)).toContain('Info: info msg')
    })

    it('should format suggestion severity', () => {
      const entry = makeEntry({ severity: 'suggestion', message: 'use const' })
      expect(formatter.formatSingle(entry)).toContain('Suggestion: use const')
    })

    it('should include source code when present', () => {
      const entry = makeEntry({ source: 'const x = eval(y)', column: 12 })
      const result = formatter.formatSingle(entry)
      expect(result).toContain('const x = eval(y)')
      expect(result).toContain('^')
    })

    it('should include fix info when present', () => {
      const entry = makeEntry({ fix: makeFix() })
      const result = formatter.formatSingle(entry)
      expect(result).toContain('Fix: Replace with fix')
      expect(result).toContain('[safe]')
    })

    it('should show unsafe marker for unsafe fix', () => {
      const entry = makeEntry({ fix: { ...makeFix(), isSafe: false } })
      const result = formatter.formatSingle(entry)
      expect(result).toContain('[unsafe]')
    })

    it('should include rule id', () => {
      const entry = makeEntry({ ruleId: 'my-rule' })
      expect(formatter.formatSingle(entry)).toContain('(my-rule)')
    })
  })

  describe('formatText', () => {
    it('should return no issues message for empty entries', () => {
      const summary: ErrorSummary = {
        total: 0, errors: 0, warnings: 0, info: 0, suggestions: 0,
        fixableCount: 0, filesAffected: 0,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      expect(formatter.formatText([], summary)).toBe('No issues found.')
    })

    it('should format entries with summary header', () => {
      const entries = [makeEntry(), makeEntry({ severity: 'warning' })]
      const summary: ErrorSummary = {
        total: 2, errors: 1, warnings: 1, info: 0, suggestions: 0,
        fixableCount: 0, filesAffected: 1,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const result = formatter.formatText(entries, summary)
      expect(result).toContain('Total: 2')
      expect(result).toContain('Errors: 1')
      expect(result).toContain('Warnings: 1')
    })
  })

  describe('formatSummary', () => {
    it('should format a complete summary', () => {
      const summary: ErrorSummary = {
        total: 10, errors: 3, warnings: 5, info: 1, suggestions: 1,
        fixableCount: 4, filesAffected: 7,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const result = formatter.formatSummary(summary)
      expect(result).toContain('Total: 10')
      expect(result).toContain('Errors: 3')
      expect(result).toContain('Warnings: 5')
      expect(result).toContain('Info: 1')
      expect(result).toContain('Suggestions: 1')
      expect(result).toContain('Fixable: 4')
      expect(result).toContain('Files affected: 7')
    })

    it('should omit zero-count categories', () => {
      const summary: ErrorSummary = {
        total: 2, errors: 2, warnings: 0, info: 0, suggestions: 0,
        fixableCount: 0, filesAffected: 1,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const result = formatter.formatSummary(summary)
      expect(result).toContain('Errors: 2')
      expect(result).not.toContain('Warnings:')
      expect(result).not.toContain('Info:')
      expect(result).not.toContain('Suggestions:')
      expect(result).not.toContain('Fixable:')
    })
  })

  describe('formatJSON', () => {
    it('should produce valid JSON', () => {
      const report: ErrorReport = {
        summary: {
          total: 1, errors: 1, warnings: 0, info: 0, suggestions: 0,
          fixableCount: 0, filesAffected: 1,
          byRule: new Map([['rule-a', 1]]),
          byFile: new Map([['file.ts', 1]]),
          bySeverity: new Map([['error', 1]]),
        },
        groups: [],
        entries: [makeEntry()],
        generatedAt: 1000000,
        format: 'json',
      }
      const json = formatter.formatJSON(report)
      const parsed = JSON.parse(json)
      expect(parsed.generatedAt).toBe(1000000)
      expect(parsed.summary.total).toBe(1)
      expect(parsed.summary.byRule).toEqual({ 'rule-a': 1 })
      expect(parsed.summary.byFile).toEqual({ 'file.ts': 1 })
      expect(parsed.summary.bySeverity).toEqual({ error: 1 })
    })
  })

  describe('formatMarkdown', () => {
    it('should generate markdown report', () => {
      const report: ErrorReport = {
        summary: {
          total: 2, errors: 1, warnings: 1, info: 0, suggestions: 0,
          fixableCount: 0, filesAffected: 2,
          byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
        },
        groups: [{ ruleId: 'no-eval', count: 1, severity: 'error', files: ['a.ts'], representative: makeEntry() }],
        entries: [
          makeEntry({ id: 'm1', ruleId: 'no-eval', severity: 'error', message: 'eval found' }),
          makeEntry({ id: 'm2', ruleId: 'no-console', severity: 'warning', message: 'console found', tags: ['style'] }),
        ],
        generatedAt: Date.now(),
        format: 'markdown',
      }
      const md = formatter.formatMarkdown(report)
      expect(md).toContain('# Error Report')
      expect(md).toContain('## Summary')
      expect(md).toContain('**Total:** 2')
      expect(md).toContain('## Issues by Rule')
      expect(md).toContain('no-eval')
      expect(md).toContain('## All Issues')
      expect(md).toContain('eval found')
      expect(md).toContain('console found')
      expect(md).toContain('style')
    })

    it('should not include groups section when empty', () => {
      const report: ErrorReport = {
        summary: {
          total: 0, errors: 0, warnings: 0, info: 0, suggestions: 0,
          fixableCount: 0, filesAffected: 0,
          byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
        },
        groups: [],
        entries: [],
        generatedAt: Date.now(),
        format: 'markdown',
      }
      const md = formatter.formatMarkdown(report)
      expect(md).not.toContain('## Issues by Rule')
      expect(md).not.toContain('## All Issues')
    })
  })

  describe('formatHTML', () => {
    it('should generate valid HTML', () => {
      const report: ErrorReport = {
        summary: {
          total: 1, errors: 1, warnings: 0, info: 0, suggestions: 0,
          fixableCount: 0, filesAffected: 1,
          byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
        },
        groups: [],
        entries: [makeEntry({ message: 'test <script>alert(1)</script>' })],
        generatedAt: Date.now(),
        format: 'html',
      }
      const html = formatter.formatHTML(report)
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<h1>Error Report</h1>')
      expect(html).toContain('&lt;script&gt;')
      expect(html).not.toContain('<script>alert(1)</script>')
    })

    it('should include groups table', () => {
      const report: ErrorReport = {
        summary: {
          total: 1, errors: 1, warnings: 0, info: 0, suggestions: 0,
          fixableCount: 0, filesAffected: 1,
          byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
        },
        groups: [{ ruleId: 'no-eval', count: 3, severity: 'error', files: ['a.ts', 'b.ts'], representative: makeEntry() }],
        entries: [],
        generatedAt: Date.now(),
        format: 'html',
      }
      const html = formatter.formatHTML(report)
      expect(html).toContain('Issues by Rule')
      expect(html).toContain('no-eval')
      expect(html).toContain('<td>3</td>')
    })

    it('should include fix info in entry', () => {
      const entry = makeEntry({ fix: makeFix(), message: 'fixable error' })
      const report: ErrorReport = {
        summary: {
          total: 1, errors: 1, warnings: 0, info: 0, suggestions: 0,
          fixableCount: 1, filesAffected: 1,
          byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
        },
        groups: [],
        entries: [entry],
        generatedAt: Date.now(),
        format: 'html',
      }
      const html = formatter.formatHTML(report)
      expect(html).toContain('Replace with fix')
      expect(html).toContain('(safe)')
    })
  })

  describe('formatSARIF', () => {
    it('should produce valid SARIF structure', () => {
      const entries = [
        makeEntry({ ruleId: 'no-eval', severity: 'error', message: 'eval used', filePath: 'src/a.ts', line: 1, column: 1, endLine: 1, endColumn: 5, fix: makeFix() }),
        makeEntry({ ruleId: 'no-console', severity: 'warning', message: 'console.log', filePath: 'src/b.ts', line: 2, column: 3 }),
      ]
      const sarif = formatter.formatSARIF(entries)
      const sarifObj = sarif as Record<string, unknown>
      expect(sarifObj.$schema).toContain('sarif')
      expect(sarifObj.version).toBe('2.1.0')
      const runs = sarifObj.runs as Array<Record<string, unknown>>
      expect(runs).toHaveLength(1)
      const results = runs[0]!.results as Array<Record<string, unknown>>
      expect(results).toHaveLength(2)
      expect(results[0]!.ruleId).toBe('no-eval')
      expect(results[0]!.level).toBe('error')
      expect(results[1]!.level).toBe('warning')
    })

    it('should include fixes in SARIF', () => {
      const entry = makeEntry({ fix: makeFix() })
      const sarif = formatter.formatSARIF([entry])
      const sarifObj = sarif as Record<string, unknown>
      const runs = sarifObj.runs as Array<Record<string, unknown>>
      const results = runs[0]!.results as Array<Record<string, unknown>>
      expect(results[0]!.fixes).toBeDefined()
    })

    it('should map severity to SARIF levels', () => {
      const entries = [
        makeEntry({ severity: 'error' }),
        makeEntry({ severity: 'warning' }),
        makeEntry({ severity: 'info' }),
        makeEntry({ severity: 'suggestion' }),
      ]
      const sarif = formatter.formatSARIF(entries)
      const sarifObj = sarif as Record<string, unknown>
      const runs = sarifObj.runs as Array<Record<string, unknown>>
      const results = runs[0]!.results as Array<Record<string, unknown>>
      expect(results[0]!.level).toBe('error')
      expect(results[1]!.level).toBe('warning')
      expect(results[2]!.level).toBe('note')
      expect(results[3]!.level).toBe('none')
    })

    it('should include rules in driver', () => {
      const entries = [
        makeEntry({ ruleId: 'rule-a' }),
        makeEntry({ ruleId: 'rule-b' }),
        makeEntry({ ruleId: 'rule-a' }),
      ]
      const sarif = formatter.formatSARIF(entries)
      const sarifObj = sarif as Record<string, unknown>
      const runs = sarifObj.runs as Array<Record<string, unknown>>
      const driver = runs[0]!.tool as Record<string, unknown>
      const driverObj = driver.driver as Record<string, unknown>
      const rules = driverObj.rules as Array<Record<string, unknown>>
      expect(rules).toHaveLength(2)
      expect(rules.map((r) => r.id)).toContain('rule-a')
      expect(rules.map((r) => r.id)).toContain('rule-b')
    })
  })

  describe('formatJUnit', () => {
    it('should produce valid JUnit XML', () => {
      const entries = [
        makeEntry({ id: 'j1', ruleId: 'no-eval', severity: 'error', filePath: 'src/a.ts', line: 1, column: 1, message: 'eval found' }),
        makeEntry({ id: 'j2', ruleId: 'no-console', severity: 'warning', filePath: 'src/a.ts', line: 2, column: 1, message: 'console found' }),
        makeEntry({ id: 'j3', ruleId: 'prefer-const', severity: 'info', filePath: 'src/b.ts', line: 3, column: 1, message: 'use const' }),
      ]
      const xml = formatter.formatJUnit(entries)
      expect(xml).toContain('<?xml version="1.0"')
      expect(xml).toContain('<testsuites')
      expect(xml).toContain('tests="3"')
      expect(xml).toContain('failures="1"')
      expect(xml).toContain('<testsuite name="src/a.ts"')
      expect(xml).toContain('<failure message="eval found"')
      expect(xml).toContain('<failure message="console found"')
    })

    it('should escape special XML characters', () => {
      const entry = makeEntry({ message: 'use "quotes" & <brackets>', ruleId: 'rule<>&"' })
      const xml = formatter.formatJUnit([entry])
      expect(xml).toContain('&quot;')
      expect(xml).toContain('&amp;')
      expect(xml).toContain('&lt;')
      expect(xml).toContain('&gt;')
      expect(xml).not.toContain('use "quotes" & <brackets>')
    })

    it('should group entries by file', () => {
      const entries = [
        makeEntry({ filePath: 'a.ts' }),
        makeEntry({ filePath: 'b.ts' }),
        makeEntry({ filePath: 'a.ts' }),
      ]
      const xml = formatter.formatJUnit(entries)
      const aSuite = xml.match(/<testsuite name="a\.ts"/g)
      const bSuite = xml.match(/<testsuite name="b\.ts"/g)
      expect(aSuite).toHaveLength(1)
      expect(bSuite).toHaveLength(1)
    })
  })
})

describe('ErrorAggregator', () => {
  const aggregator = new ErrorAggregator()

  describe('aggregate', () => {
    it('should group entries by ruleId', () => {
      const groups = aggregator.aggregate(sampleEntries)
      const consoleGroup = groups.find((g) => g.ruleId === 'no-console')
      expect(consoleGroup).toBeDefined()
      expect(consoleGroup!.count).toBe(2)
      expect(consoleGroup!.files).toContain('src/a.ts')
      expect(consoleGroup!.files).toContain('src/b.ts')
    })

    it('should sort groups by count descending', () => {
      const groups = aggregator.aggregate(sampleEntries)
      for (let i = 1; i < groups.length; i++) {
        expect(groups[i - 1]!.count).toBeGreaterThanOrEqual(groups[i]!.count)
      }
    })

    it('should return empty array for empty input', () => {
      expect(aggregator.aggregate([])).toEqual([])
    })

    it('should set representative to first entry', () => {
      const groups = aggregator.aggregate(sampleEntries)
      const evalGroup = groups.find((g) => g.ruleId === 'no-eval')
      expect(evalGroup).toBeDefined()
      expect(evalGroup!.representative.id).toBe('e3')
    })

    it('should set severity from first entry', () => {
      const groups = aggregator.aggregate(sampleEntries)
      const consoleGroup = groups.find((g) => g.ruleId === 'no-console')
      expect(consoleGroup!.severity).toBe('warning')
    })

    it('should collect unique files per group', () => {
      const groups = aggregator.aggregate(sampleEntries)
      const consoleGroup = groups.find((g) => g.ruleId === 'no-console')
      expect(consoleGroup!.files).toHaveLength(2)
    })
  })

  describe('summarize', () => {
    it('should compute correct totals', () => {
      const summary = aggregator.summarize(sampleEntries)
      expect(summary.total).toBe(5)
      expect(summary.errors).toBe(1)
      expect(summary.warnings).toBe(2)
      expect(summary.info).toBe(1)
      expect(summary.suggestions).toBe(1)
    })

    it('should count fixable entries', () => {
      const summary = aggregator.summarize(sampleEntries)
      expect(summary.fixableCount).toBe(1)
    })

    it('should count files affected', () => {
      const summary = aggregator.summarize(sampleEntries)
      expect(summary.filesAffected).toBe(4)
    })

    it('should build byRule map', () => {
      const summary = aggregator.summarize(sampleEntries)
      expect(summary.byRule.get('no-console')).toBe(2)
      expect(summary.byRule.get('no-eval')).toBe(1)
      expect(summary.byRule.get('prefer-const')).toBe(1)
      expect(summary.byRule.get('max-params')).toBe(1)
    })

    it('should build byFile map', () => {
      const summary = aggregator.summarize(sampleEntries)
      expect(summary.byFile.get('src/a.ts')).toBe(2)
      expect(summary.byFile.get('src/b.ts')).toBe(1)
    })

    it('should build bySeverity map', () => {
      const summary = aggregator.summarize(sampleEntries)
      expect(summary.bySeverity.get('error')).toBe(1)
      expect(summary.bySeverity.get('warning')).toBe(2)
      expect(summary.bySeverity.get('info')).toBe(1)
      expect(summary.bySeverity.get('suggestion')).toBe(1)
    })

    it('should handle empty entries', () => {
      const summary = aggregator.summarize([])
      expect(summary.total).toBe(0)
      expect(summary.errors).toBe(0)
      expect(summary.filesAffected).toBe(0)
      expect(summary.fixableCount).toBe(0)
    })
  })

  describe('generateReport', () => {
    it('should create a complete report', () => {
      const report = aggregator.generateReport(sampleEntries, 'text')
      expect(report.format).toBe('text')
      expect(report.summary.total).toBe(5)
      expect(report.groups).toHaveLength(4)
      expect(report.entries).toHaveLength(5)
      expect(report.generatedAt).toBeGreaterThan(0)
    })

    it('should snapshot entries', () => {
      const report = aggregator.generateReport(sampleEntries, 'json')
      expect(report.entries).not.toBe(sampleEntries)
      expect(report.entries).toEqual(sampleEntries)
    })

    it('should handle empty entries', () => {
      const report = aggregator.generateReport([], 'json')
      expect(report.summary.total).toBe(0)
      expect(report.groups).toEqual([])
      expect(report.entries).toEqual([])
    })
  })

  describe('getTopRules', () => {
    it('should return top N rules by count', () => {
      const top = aggregator.getTopRules(sampleEntries, 2)
      expect(top).toHaveLength(2)
      expect(top[0]!.count).toBeGreaterThanOrEqual(top[1]!.count)
    })

    it('should return all rules if count exceeds total', () => {
      const top = aggregator.getTopRules(sampleEntries, 100)
      expect(top).toHaveLength(4)
    })

    it('should return empty for empty entries', () => {
      expect(aggregator.getTopRules([], 5)).toEqual([])
    })

    it('should return zero rules when count is 0', () => {
      expect(aggregator.getTopRules(sampleEntries, 0)).toEqual([])
    })
  })

  describe('getTopFiles', () => {
    it('should return top N files by error count', () => {
      const top = aggregator.getTopFiles(sampleEntries, 2)
      expect(top).toHaveLength(2)
      expect(top[0]).toBe('src/a.ts')
    })

    it('should return all files if count exceeds total', () => {
      const top = aggregator.getTopFiles(sampleEntries, 100)
      expect(top).toHaveLength(4)
    })

    it('should return empty for empty entries', () => {
      expect(aggregator.getTopFiles([], 5)).toEqual([])
    })
  })

  describe('getHeatmap', () => {
    it('should return file to error count map', () => {
      const heatmap = aggregator.getHeatmap(sampleEntries)
      expect(heatmap.get('src/a.ts')).toBe(2)
      expect(heatmap.get('src/b.ts')).toBe(1)
      expect(heatmap.get('src/c.ts')).toBe(1)
      expect(heatmap.get('src/d.ts')).toBe(1)
    })

    it('should return empty map for empty entries', () => {
      expect(aggregator.getHeatmap([]).size).toBe(0)
    })
  })

  describe('getTrend', () => {
    it('should detect improvement', () => {
      const current: ErrorSummary = {
        total: 5, errors: 1, warnings: 2, info: 1, suggestions: 1,
        fixableCount: 0, filesAffected: 3,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const previous: ErrorSummary = {
        total: 10, errors: 4, warnings: 3, info: 2, suggestions: 1,
        fixableCount: 0, filesAffected: 5,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const trend = aggregator.getTrend(current, previous)
      expect(trend.improved).toBe(5)
      expect(trend.regressed).toBe(0)
      expect(trend.fixed).toBe(3)
    })

    it('should detect regression', () => {
      const current: ErrorSummary = {
        total: 10, errors: 5, warnings: 3, info: 1, suggestions: 1,
        fixableCount: 0, filesAffected: 5,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const previous: ErrorSummary = {
        total: 5, errors: 2, warnings: 1, info: 1, suggestions: 1,
        fixableCount: 0, filesAffected: 3,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const trend = aggregator.getTrend(current, previous)
      expect(trend.regressed).toBe(5)
      expect(trend.improved).toBe(0)
      expect(trend.new).toBe(3)
    })

    it('should detect no change', () => {
      const summary: ErrorSummary = {
        total: 5, errors: 2, warnings: 1, info: 1, suggestions: 1,
        fixableCount: 0, filesAffected: 3,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const trend = aggregator.getTrend(summary, summary)
      expect(trend.improved).toBe(0)
      expect(trend.regressed).toBe(0)
      expect(trend.new).toBe(0)
      expect(trend.fixed).toBe(0)
    })

    it('should compute new errors correctly', () => {
      const current: ErrorSummary = {
        total: 8, errors: 6, warnings: 1, info: 1, suggestions: 0,
        fixableCount: 0, filesAffected: 5,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const previous: ErrorSummary = {
        total: 5, errors: 3, warnings: 1, info: 1, suggestions: 0,
        fixableCount: 0, filesAffected: 3,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const trend = aggregator.getTrend(current, previous)
      expect(trend.new).toBe(3)
      expect(trend.regressed).toBe(3)
    })

    it('should compute fixed errors correctly', () => {
      const current: ErrorSummary = {
        total: 3, errors: 1, warnings: 1, info: 1, suggestions: 0,
        fixableCount: 0, filesAffected: 3,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const previous: ErrorSummary = {
        total: 6, errors: 4, warnings: 1, info: 1, suggestions: 0,
        fixableCount: 0, filesAffected: 4,
        byRule: new Map(), byFile: new Map(), bySeverity: new Map(),
      }
      const trend = aggregator.getTrend(current, previous)
      expect(trend.fixed).toBe(3)
      expect(trend.improved).toBe(3)
    })
  })
})

describe('Integration', () => {
  it('should work end to end: collect, aggregate, format', () => {
    const collector = new ErrorCollector()
    const aggregator = new ErrorAggregator()
    const formatter = new ErrorFormatter()

    collector.addMany(sampleEntries)
    expect(collector.count()).toBe(5)

    const entries = collector.getAll()
    const report = aggregator.generateReport(entries, 'text')

    expect(report.summary.total).toBe(5)
    expect(report.groups.length).toBeGreaterThan(0)

    const text = formatter.formatText(report.entries, report.summary)
    expect(text).toContain('Total: 5')

    const json = formatter.formatJSON(report)
    const parsed = JSON.parse(json)
    expect(parsed.summary.total).toBe(5)

    const md = formatter.formatMarkdown(report)
    expect(md).toContain('# Error Report')

    const html = formatter.formatHTML(report)
    expect(html).toContain('<!DOCTYPE html>')

    const sarif = formatter.formatSARIF(entries)
    const sarifObj = sarif as Record<string, unknown>
    expect(sarifObj.version).toBe('2.1.0')

    const junit = formatter.formatJUnit(entries)
    expect(junit).toContain('<testsuites')
  })

  it('should filter then format', () => {
    const collector = new ErrorCollector()
    const formatter = new ErrorFormatter()

    collector.addMany(sampleEntries)
    const errors = collector.getBySeverity('error')
    const single = formatter.formatSingle(errors[0]!)
    expect(single).toContain('Error:')
  })

  it('should remove entries and regenerate report', () => {
    const collector = new ErrorCollector()
    const aggregator = new ErrorAggregator()

    collector.addMany(sampleEntries)
    collector.remove('e3')
    const entries = collector.getAll()
    const summary = aggregator.summarize(entries)
    expect(summary.total).toBe(4)
    expect(summary.errors).toBe(0)
    expect(summary.fixableCount).toBe(0)
  })

  it('should clear and verify empty state', () => {
    const collector = new ErrorCollector()
    collector.addMany(sampleEntries)
    collector.clear()
    expect(collector.count()).toBe(0)
    expect(collector.getAll()).toEqual([])
    expect(collector.getById('e1')).toBeNull()
    expect(collector.getByFile('src/a.ts')).toEqual([])
    expect(collector.getByRule('no-console')).toEqual([])
    expect(collector.getBySeverity('error')).toEqual([])
    expect(collector.getFixable()).toEqual([])
  })

  it('should handle large dataset', () => {
    const collector = new ErrorCollector()
    const aggregator = new ErrorAggregator()
    const formatter = new ErrorFormatter()

    const largeEntries: ErrorEntry[] = []
    for (let i = 0; i < 500; i++) {
      largeEntries.push(
        makeEntry({
          id: `large-${i}`,
          ruleId: `rule-${i % 10}`,
          severity: (['error', 'warning', 'info', 'suggestion'] as const)[i % 4],
          filePath: `src/file-${i % 50}.ts`,
          line: i + 1,
          column: (i % 80) + 1,
          fix: i % 5 === 0 ? makeFix() : undefined,
        })
      )
    }

    collector.addMany(largeEntries)
    expect(collector.count()).toBe(500)

    const summary = aggregator.summarize(collector.getAll())
    expect(summary.total).toBe(500)
    expect(summary.filesAffected).toBe(50)

    const report = aggregator.generateReport(collector.getAll(), 'json')
    expect(report.groups).toHaveLength(10)

    const text = formatter.formatText(report.entries, report.summary)
    expect(text).toContain('Total: 500')

    const sarif = formatter.formatSARIF(collector.getAll())
    const sarifObj = sarif as Record<string, unknown>
    const runs = sarifObj.runs as Array<Record<string, unknown>>
    const results = runs[0]!.results as unknown[]
    expect(results).toHaveLength(500)
  })
})
