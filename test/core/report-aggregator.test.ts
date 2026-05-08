import { describe, it, expect } from 'vitest'
import { FindingDeduplicator } from '../../src/core/report-aggregator/finding-dedup.js'
import { ReportAggregator } from '../../src/core/report-aggregator/report-aggregator.js'
import type { AnalysisFinding, AnalysisReport } from '../../src/core/report-aggregator/types.js'

function makeFinding(overrides: Partial<AnalysisFinding> = {}): AnalysisFinding {
  return {
    id: 'f1',
    ruleId: 'no-console',
    severity: 'warning',
    message: 'Unexpected console statement',
    file: 'src/index.ts',
    line: 10,
    column: 1,
    ...overrides,
  }
}

function makeReport(overrides: Partial<AnalysisReport> = {}): AnalysisReport {
  return {
    source: 'linter',
    timestamp: Date.now(),
    findings: [],
    metrics: {},
    ...overrides,
  }
}

describe('FindingDeduplicator', () => {
  describe('deduplicate', () => {
    it('should return empty findings for empty array', () => {
      const dedup = new FindingDeduplicator()
      const result = dedup.deduplicate([])
      expect(result.findings).toEqual([])
    })

    it('should return zero removed for empty array', () => {
      const dedup = new FindingDeduplicator()
      const result = dedup.deduplicate([])
      expect(result.duplicatesRemoved).toBe(0)
    })

    it('should return single finding unchanged', () => {
      const dedup = new FindingDeduplicator()
      const finding = makeFinding()
      const result = dedup.deduplicate([finding])
      expect(result.findings).toHaveLength(1)
    })

    it('should return zero removed for single finding', () => {
      const dedup = new FindingDeduplicator()
      const result = dedup.deduplicate([makeFinding()])
      expect(result.duplicatesRemoved).toBe(0)
    })

    it('should return all findings when no duplicates', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '2', ruleId: 'no-debugger', file: 'b.ts', line: 2 }),
        makeFinding({ id: '3', ruleId: 'no-eval', file: 'c.ts', line: 3 }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(3)
    })

    it('should return zero removed when no duplicates', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '2', ruleId: 'no-debugger', file: 'b.ts', line: 2 }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.duplicatesRemoved).toBe(0)
    })

    it('should remove one duplicate from a pair', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 5 }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 5 }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(1)
    })

    it('should count one removed for a pair', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 5 }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 5 }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.duplicatesRemoved).toBe(1)
    })

    it('should handle multiple duplicate pairs', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '3', ruleId: 'no-debugger', file: 'b.ts', line: 2 }),
        makeFinding({ id: '4', ruleId: 'no-debugger', file: 'b.ts', line: 2 }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(2)
      expect(result.duplicatesRemoved).toBe(2)
    })

    it('should collapse all identical findings to one', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '3', ruleId: 'no-console', file: 'a.ts', line: 1 }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(1)
      expect(result.duplicatesRemoved).toBe(2)
    })

    it('should keep error over warning when merging', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1, severity: 'warning' }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1, severity: 'error' }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.findings[0]?.severity).toBe('error')
    })

    it('should keep error over info when merging', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1, severity: 'info' }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1, severity: 'error' }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.findings[0]?.severity).toBe('error')
    })

    it('should keep warning over info when merging', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1, severity: 'info' }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1, severity: 'warning' }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.findings[0]?.severity).toBe('warning')
    })

    it('should use custom key function when provided', () => {
      const customKey = (f: AnalysisFinding): string => f.id
      const dedup = new FindingDeduplicator(customKey)
      const findings = [
        makeFinding({ id: 'same-id', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: 'same-id', ruleId: 'no-debugger', file: 'b.ts', line: 2 }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(1)
      expect(result.duplicatesRemoved).toBe(1)
    })

    it('should not deduplicate when custom key produces unique keys', () => {
      const customKey = (f: AnalysisFinding): string => f.message
      const dedup = new FindingDeduplicator(customKey)
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1, message: 'msg1' }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1, message: 'msg2' }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(2)
    })

    it('should handle mixed duplicates and unique findings', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '3', ruleId: 'no-debugger', file: 'b.ts', line: 5 }),
      ]
      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(2)
      expect(result.duplicatesRemoved).toBe(1)
    })
  })

  describe('createKey', () => {
    it('should return ruleId:file:line format by default', () => {
      const dedup = new FindingDeduplicator()
      const finding = makeFinding({ ruleId: 'no-console', file: 'src/app.ts', line: 42 })
      expect(dedup.createKey(finding)).toBe('no-console:src/app.ts:42')
    })

    it('should include ruleId in key', () => {
      const dedup = new FindingDeduplicator()
      const finding = makeFinding({ ruleId: 'max-params', file: 'a.ts', line: 1 })
      expect(dedup.createKey(finding)).toContain('max-params')
    })

    it('should include file in key', () => {
      const dedup = new FindingDeduplicator()
      const finding = makeFinding({ ruleId: 'no-console', file: 'utils/helpers.ts', line: 1 })
      expect(dedup.createKey(finding)).toContain('utils/helpers.ts')
    })

    it('should include line in key', () => {
      const dedup = new FindingDeduplicator()
      const finding = makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 99 })
      expect(dedup.createKey(finding)).toContain(':99')
    })

    it('should use custom key function when provided', () => {
      const customKey = (f: AnalysisFinding): string => f.file
      const dedup = new FindingDeduplicator(customKey)
      const finding = makeFinding({ file: 'custom.ts' })
      expect(dedup.createKey(finding)).toBe('custom.ts')
    })
  })

  describe('findDuplicates', () => {
    it('should return empty map for empty array', () => {
      const dedup = new FindingDeduplicator()
      const result = dedup.findDuplicates([])
      expect(result.size).toBe(0)
    })

    it('should return empty map when no duplicates', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '2', ruleId: 'no-debugger', file: 'b.ts', line: 2 }),
      ]
      const result = dedup.findDuplicates(findings)
      expect(result.size).toBe(0)
    })

    it('should return one group for one pair of duplicates', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1 }),
      ]
      const result = dedup.findDuplicates(findings)
      expect(result.size).toBe(1)
    })

    it('should include all duplicates in group', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '3', ruleId: 'no-console', file: 'a.ts', line: 1 }),
      ]
      const result = dedup.findDuplicates(findings)
      const group = result.get('no-console:a.ts:1')
      expect(group).toHaveLength(3)
    })

    it('should return multiple groups for multiple duplicate sets', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '3', ruleId: 'no-debugger', file: 'b.ts', line: 2 }),
        makeFinding({ id: '4', ruleId: 'no-debugger', file: 'b.ts', line: 2 }),
      ]
      const result = dedup.findDuplicates(findings)
      expect(result.size).toBe(2)
    })

    it('should use correct key for groups', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 5 }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 5 }),
      ]
      const result = dedup.findDuplicates(findings)
      expect(result.has('no-console:a.ts:5')).toBe(true)
    })

    it('should not include unique findings in groups', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '2', ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ id: '3', ruleId: 'no-debugger', file: 'b.ts', line: 2 }),
      ]
      const result = dedup.findDuplicates(findings)
      expect(result.size).toBe(1)
      expect(result.has('no-debugger:b.ts:2')).toBe(false)
    })
  })

  describe('mergeFindings', () => {
    it('should return error when comparing error vs warning', () => {
      const dedup = new FindingDeduplicator()
      const a = makeFinding({ severity: 'error' })
      const b = makeFinding({ severity: 'warning' })
      expect(dedup.mergeFindings(a, b).severity).toBe('error')
    })

    it('should return error when comparing error vs info', () => {
      const dedup = new FindingDeduplicator()
      const a = makeFinding({ severity: 'error' })
      const b = makeFinding({ severity: 'info' })
      expect(dedup.mergeFindings(a, b).severity).toBe('error')
    })

    it('should return warning when comparing warning vs info', () => {
      const dedup = new FindingDeduplicator()
      const a = makeFinding({ severity: 'warning' })
      const b = makeFinding({ severity: 'info' })
      expect(dedup.mergeFindings(a, b).severity).toBe('warning')
    })

    it('should return first finding when severities are equal', () => {
      const dedup = new FindingDeduplicator()
      const a = makeFinding({ id: 'first', severity: 'error' })
      const b = makeFinding({ id: 'second', severity: 'error' })
      expect(dedup.mergeFindings(a, b).id).toBe('first')
    })

    it('should return second finding when second has higher severity', () => {
      const dedup = new FindingDeduplicator()
      const a = makeFinding({ id: 'first', severity: 'info' })
      const b = makeFinding({ id: 'second', severity: 'error' })
      expect(dedup.mergeFindings(a, b).id).toBe('second')
    })
  })
})

describe('ReportAggregator', () => {
  describe('aggregate single report', () => {
    it('should include source from single report', () => {
      const aggregator = new ReportAggregator()
      const report = makeReport({ source: 'eslint' })
      const result = aggregator.aggregate([report])
      expect(result.sources).toEqual(['eslint'])
    })

    it('should count total findings from single report', () => {
      const aggregator = new ReportAggregator()
      const report = makeReport({
        findings: [
          makeFinding({ id: '1', ruleId: 'r1', line: 1 }),
          makeFinding({ id: '2', ruleId: 'r2', line: 2 }),
          makeFinding({ id: '3', ruleId: 'r3', line: 3 }),
        ],
      })
      const result = aggregator.aggregate([report])
      expect(result.totalFindings).toBe(3)
    })

    it('should compute bySeverity from single report', () => {
      const aggregator = new ReportAggregator()
      const report = makeReport({
        findings: [
          makeFinding({ severity: 'error', line: 1 }),
          makeFinding({ severity: 'error', line: 2 }),
          makeFinding({ severity: 'warning', line: 3 }),
        ],
      })
      const result = aggregator.aggregate([report])
      expect(result.bySeverity['error']).toBe(2)
      expect(result.bySeverity['warning']).toBe(1)
    })

    it('should compute byRule from single report', () => {
      const aggregator = new ReportAggregator()
      const report = makeReport({
        findings: [
          makeFinding({ ruleId: 'no-console', line: 1 }),
          makeFinding({ ruleId: 'no-console', line: 2 }),
          makeFinding({ ruleId: 'no-debugger', line: 3 }),
        ],
      })
      const result = aggregator.aggregate([report])
      expect(result.byRule['no-console']).toBe(2)
      expect(result.byRule['no-debugger']).toBe(1)
    })

    it('should compute byFile from single report', () => {
      const aggregator = new ReportAggregator()
      const report = makeReport({
        findings: [
          makeFinding({ file: 'a.ts', line: 1 }),
          makeFinding({ file: 'a.ts', line: 2 }),
          makeFinding({ file: 'b.ts', line: 1 }),
        ],
      })
      const result = aggregator.aggregate([report])
      expect(result.byFile['a.ts']).toBe(2)
      expect(result.byFile['b.ts']).toBe(1)
    })

    it('should merge metrics from single report', () => {
      const aggregator = new ReportAggregator()
      const report = makeReport({ metrics: { files: 10, errors: 3 } })
      const result = aggregator.aggregate([report])
      expect(result.mergedMetrics['files']).toBe(10)
      expect(result.mergedMetrics['errors']).toBe(3)
    })

    it('should set duplicatesRemoved to zero for unique findings', () => {
      const aggregator = new ReportAggregator()
      const report = makeReport({
        findings: [
          makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 }),
          makeFinding({ ruleId: 'no-debugger', file: 'b.ts', line: 2 }),
        ],
      })
      const result = aggregator.aggregate([report])
      expect(result.duplicatesRemoved).toBe(0)
    })
  })

  describe('aggregate multiple reports', () => {
    it('should include all sources', () => {
      const aggregator = new ReportAggregator()
      const reports = [
        makeReport({ source: 'eslint' }),
        makeReport({ source: 'tsc' }),
        makeReport({ source: 'custom' }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.sources).toEqual(['eslint', 'tsc', 'custom'])
    })

    it('should merge all findings', () => {
      const aggregator = new ReportAggregator()
      const reports = [
        makeReport({ findings: [makeFinding({ id: '1', line: 1 })] }),
        makeReport({ findings: [makeFinding({ id: '2', line: 2 })] }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.findings).toHaveLength(2)
    })

    it('should sum metrics across reports', () => {
      const aggregator = new ReportAggregator()
      const reports = [
        makeReport({ metrics: { errors: 3, warnings: 5 } }),
        makeReport({ metrics: { errors: 2, warnings: 1 } }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.mergedMetrics['errors']).toBe(5)
      expect(result.mergedMetrics['warnings']).toBe(6)
    })

    it('should compute combined bySeverity', () => {
      const aggregator = new ReportAggregator()
      const reports = [
        makeReport({ findings: [makeFinding({ severity: 'error', line: 1 })] }),
        makeReport({ findings: [makeFinding({ severity: 'error', line: 2 }), makeFinding({ severity: 'warning', line: 3 })] }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.bySeverity['error']).toBe(2)
      expect(result.bySeverity['warning']).toBe(1)
    })

    it('should compute total findings after dedup', () => {
      const aggregator = new ReportAggregator()
      const reports = [
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.totalFindings).toBe(1)
      expect(result.duplicatesRemoved).toBe(1)
    })
  })

  describe('aggregate with dedup', () => {
    it('should remove duplicates when dedup is enabled', () => {
      const aggregator = new ReportAggregator({ deduplicate: true })
      const reports = [
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.findings).toHaveLength(1)
    })

    it('should count duplicatesRemoved when dedup is enabled', () => {
      const aggregator = new ReportAggregator({ deduplicate: true })
      const reports = [
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.duplicatesRemoved).toBe(1)
    })

    it('should keep duplicates when dedup is disabled', () => {
      const aggregator = new ReportAggregator({ deduplicate: false })
      const reports = [
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.findings).toHaveLength(2)
    })

    it('should set duplicatesRemoved to zero when dedup is disabled', () => {
      const aggregator = new ReportAggregator({ deduplicate: false })
      const reports = [
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.duplicatesRemoved).toBe(0)
    })
  })

  describe('aggregate sortBy', () => {
    it('should sort by severity by default', () => {
      const aggregator = new ReportAggregator()
      const reports = [
        makeReport({
          findings: [
            makeFinding({ id: 'info', severity: 'info', line: 3 }),
            makeFinding({ id: 'error', severity: 'error', line: 1 }),
            makeFinding({ id: 'warning', severity: 'warning', line: 2 }),
          ],
        }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.findings[0]?.id).toBe('error')
      expect(result.findings[1]?.id).toBe('warning')
      expect(result.findings[2]?.id).toBe('info')
    })

    it('should sort by file when configured', () => {
      const aggregator = new ReportAggregator({ sortBy: ['file'] })
      const reports = [
        makeReport({
          findings: [
            makeFinding({ id: 'c', file: 'c.ts', line: 1 }),
            makeFinding({ id: 'a', file: 'a.ts', line: 1 }),
            makeFinding({ id: 'b', file: 'b.ts', line: 1 }),
          ],
        }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.findings[0]?.id).toBe('a')
      expect(result.findings[1]?.id).toBe('b')
      expect(result.findings[2]?.id).toBe('c')
    })

    it('should sort by line when configured', () => {
      const aggregator = new ReportAggregator({ sortBy: ['line'] })
      const reports = [
        makeReport({
          findings: [
            makeFinding({ id: '30', line: 30 }),
            makeFinding({ id: '10', line: 10 }),
            makeFinding({ id: '20', line: 20 }),
          ],
        }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.findings[0]?.id).toBe('10')
      expect(result.findings[1]?.id).toBe('20')
      expect(result.findings[2]?.id).toBe('30')
    })

    it('should sort by multiple fields', () => {
      const aggregator = new ReportAggregator({ sortBy: ['severity', 'line'] })
      const reports = [
        makeReport({
          findings: [
            makeFinding({ id: 'e2', severity: 'error', line: 20 }),
            makeFinding({ id: 'e1', severity: 'error', line: 10 }),
            makeFinding({ id: 'w2', severity: 'warning', line: 5 }),
            makeFinding({ id: 'w1', severity: 'warning', line: 1 }),
          ],
        }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.findings[0]?.id).toBe('e1')
      expect(result.findings[1]?.id).toBe('e2')
      expect(result.findings[2]?.id).toBe('w1')
      expect(result.findings[3]?.id).toBe('w2')
    })

    it('should sort by file then line when configured', () => {
      const aggregator = new ReportAggregator({ sortBy: ['file', 'line'] })
      const reports = [
        makeReport({
          findings: [
            makeFinding({ id: 'b5', file: 'b.ts', line: 5 }),
            makeFinding({ id: 'a10', file: 'a.ts', line: 10 }),
            makeFinding({ id: 'a5', file: 'a.ts', line: 5 }),
          ],
        }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.findings[0]?.id).toBe('a5')
      expect(result.findings[1]?.id).toBe('a10')
      expect(result.findings[2]?.id).toBe('b5')
    })
  })

  describe('aggregate edge cases', () => {
    it('should return empty sources for empty reports array', () => {
      const aggregator = new ReportAggregator()
      const result = aggregator.aggregate([])
      expect(result.sources).toEqual([])
    })

    it('should return zero findings for empty reports array', () => {
      const aggregator = new ReportAggregator()
      const result = aggregator.aggregate([])
      expect(result.totalFindings).toBe(0)
      expect(result.findings).toEqual([])
    })

    it('should return zero duplicatesRemoved for empty reports array', () => {
      const aggregator = new ReportAggregator()
      const result = aggregator.aggregate([])
      expect(result.duplicatesRemoved).toBe(0)
    })

    it('should handle report with no findings', () => {
      const aggregator = new ReportAggregator()
      const report = makeReport({ findings: [] })
      const result = aggregator.aggregate([report])
      expect(result.totalFindings).toBe(0)
    })

    it('should return empty counts for report with no findings', () => {
      const aggregator = new ReportAggregator()
      const report = makeReport({ findings: [] })
      const result = aggregator.aggregate([report])
      expect(result.bySeverity).toEqual({})
      expect(result.byRule).toEqual({})
      expect(result.byFile).toEqual({})
    })

    it('should handle report with empty metrics', () => {
      const aggregator = new ReportAggregator()
      const report = makeReport({ metrics: {} })
      const result = aggregator.aggregate([report])
      expect(result.mergedMetrics).toEqual({})
    })

    it('should handle all duplicate findings across reports', () => {
      const aggregator = new ReportAggregator()
      const reports = [
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
        makeReport({ findings: [makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 })] }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.findings).toHaveLength(1)
      expect(result.duplicatesRemoved).toBe(2)
    })

    it('should handle mixed severities in aggregation', () => {
      const aggregator = new ReportAggregator()
      const reports = [
        makeReport({
          findings: [
            makeFinding({ severity: 'error', ruleId: 'r1', file: 'a.ts' }),
            makeFinding({ severity: 'warning', ruleId: 'r2', file: 'b.ts' }),
            makeFinding({ severity: 'info', ruleId: 'r3', file: 'c.ts' }),
          ],
        }),
      ]
      const result = aggregator.aggregate(reports)
      expect(result.bySeverity['error']).toBe(1)
      expect(result.bySeverity['warning']).toBe(1)
      expect(result.bySeverity['info']).toBe(1)
    })
  })

  describe('mergeMetrics', () => {
    it('should sum overlapping keys', () => {
      const aggregator = new ReportAggregator()
      const result = aggregator.mergeMetrics([
        { loc: 100, files: 5 },
        { loc: 200, files: 3 },
      ])
      expect(result['loc']).toBe(300)
      expect(result['files']).toBe(8)
    })

    it('should include unique keys from all sets', () => {
      const aggregator = new ReportAggregator()
      const result = aggregator.mergeMetrics([
        { loc: 100 },
        { complexity: 50 },
      ])
      expect(result['loc']).toBe(100)
      expect(result['complexity']).toBe(50)
    })

    it('should return empty object for empty array', () => {
      const aggregator = new ReportAggregator()
      const result = aggregator.mergeMetrics([])
      expect(result).toEqual({})
    })

    it('should return copy of single set', () => {
      const aggregator = new ReportAggregator()
      const result = aggregator.mergeMetrics([{ loc: 100 }])
      expect(result['loc']).toBe(100)
    })

    it('should sum values across three sets', () => {
      const aggregator = new ReportAggregator()
      const result = aggregator.mergeMetrics([
        { errors: 1 },
        { errors: 2 },
        { errors: 3 },
      ])
      expect(result['errors']).toBe(6)
    })

    it('should handle zero values', () => {
      const aggregator = new ReportAggregator()
      const result = aggregator.mergeMetrics([{ count: 0 }, { count: 5 }])
      expect(result['count']).toBe(5)
    })
  })

  describe('sortBySeverity', () => {
    it('should place errors first', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ id: 'info', severity: 'info' }),
        makeFinding({ id: 'error', severity: 'error' }),
      ]
      const sorted = aggregator.sortBySeverity(findings)
      expect(sorted[0]?.severity).toBe('error')
    })

    it('should place warnings before info', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ id: 'info', severity: 'info' }),
        makeFinding({ id: 'warning', severity: 'warning' }),
      ]
      const sorted = aggregator.sortBySeverity(findings)
      expect(sorted[0]?.severity).toBe('warning')
      expect(sorted[1]?.severity).toBe('info')
    })

    it('should sort error, warning, info in correct order', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ id: '3', severity: 'info' }),
        makeFinding({ id: '1', severity: 'error' }),
        makeFinding({ id: '2', severity: 'warning' }),
        makeFinding({ id: '4', severity: 'error' }),
      ]
      const sorted = aggregator.sortBySeverity(findings)
      expect(sorted[0]?.severity).toBe('error')
      expect(sorted[1]?.severity).toBe('error')
      expect(sorted[2]?.severity).toBe('warning')
      expect(sorted[3]?.severity).toBe('info')
    })

    it('should return empty array for empty input', () => {
      const aggregator = new ReportAggregator()
      const sorted = aggregator.sortBySeverity([])
      expect(sorted).toEqual([])
    })

    it('should not mutate original array', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ id: 'info', severity: 'info' }),
        makeFinding({ id: 'error', severity: 'error' }),
      ]
      aggregator.sortBySeverity(findings)
      expect(findings[0]?.id).toBe('info')
    })
  })

  describe('sortByFile', () => {
    it('should sort by file path alphabetically', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ id: 'c', file: 'c.ts' }),
        makeFinding({ id: 'a', file: 'a.ts' }),
        makeFinding({ id: 'b', file: 'b.ts' }),
      ]
      const sorted = aggregator.sortByFile(findings)
      expect(sorted[0]?.id).toBe('a')
      expect(sorted[1]?.id).toBe('b')
      expect(sorted[2]?.id).toBe('c')
    })

    it('should sort by line number within same file', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ id: '30', file: 'a.ts', line: 30 }),
        makeFinding({ id: '10', file: 'a.ts', line: 10 }),
        makeFinding({ id: '20', file: 'a.ts', line: 20 }),
      ]
      const sorted = aggregator.sortByFile(findings)
      expect(sorted[0]?.id).toBe('10')
      expect(sorted[1]?.id).toBe('20')
      expect(sorted[2]?.id).toBe('30')
    })

    it('should return empty array for empty input', () => {
      const aggregator = new ReportAggregator()
      const sorted = aggregator.sortByFile([])
      expect(sorted).toEqual([])
    })

    it('should return single finding unchanged', () => {
      const aggregator = new ReportAggregator()
      const findings = [makeFinding({ id: 'only' })]
      const sorted = aggregator.sortByFile(findings)
      expect(sorted).toHaveLength(1)
      expect(sorted[0]?.id).toBe('only')
    })

    it('should not mutate original array', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ id: 'b', file: 'b.ts' }),
        makeFinding({ id: 'a', file: 'a.ts' }),
      ]
      aggregator.sortByFile(findings)
      expect(findings[0]?.id).toBe('b')
    })
  })

  describe('getSeverityCounts', () => {
    it('should count errors', () => {
      const aggregator = new ReportAggregator()
      const findings = [makeFinding({ severity: 'error' })]
      const counts = aggregator.getSeverityCounts(findings)
      expect(counts['error']).toBe(1)
    })

    it('should count warnings', () => {
      const aggregator = new ReportAggregator()
      const findings = [makeFinding({ severity: 'warning' })]
      const counts = aggregator.getSeverityCounts(findings)
      expect(counts['warning']).toBe(1)
    })

    it('should count info', () => {
      const aggregator = new ReportAggregator()
      const findings = [makeFinding({ severity: 'info' })]
      const counts = aggregator.getSeverityCounts(findings)
      expect(counts['info']).toBe(1)
    })

    it('should count mixed severities', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ severity: 'error' }),
        makeFinding({ severity: 'error' }),
        makeFinding({ severity: 'warning' }),
        makeFinding({ severity: 'info' }),
        makeFinding({ severity: 'info' }),
        makeFinding({ severity: 'info' }),
      ]
      const counts = aggregator.getSeverityCounts(findings)
      expect(counts['error']).toBe(2)
      expect(counts['warning']).toBe(1)
      expect(counts['info']).toBe(3)
    })

    it('should return empty object for empty array', () => {
      const aggregator = new ReportAggregator()
      const counts = aggregator.getSeverityCounts([])
      expect(counts).toEqual({})
    })
  })

  describe('getRuleCounts', () => {
    it('should count single rule', () => {
      const aggregator = new ReportAggregator()
      const findings = [makeFinding({ ruleId: 'no-console' })]
      const counts = aggregator.getRuleCounts(findings)
      expect(counts['no-console']).toBe(1)
    })

    it('should count multiple rules', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ ruleId: 'no-console' }),
        makeFinding({ ruleId: 'no-debugger' }),
      ]
      const counts = aggregator.getRuleCounts(findings)
      expect(counts['no-console']).toBe(1)
      expect(counts['no-debugger']).toBe(1)
    })

    it('should count same rule multiple times', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 1 }),
        makeFinding({ ruleId: 'no-console', file: 'b.ts', line: 2 }),
        makeFinding({ ruleId: 'no-console', file: 'c.ts', line: 3 }),
      ]
      const counts = aggregator.getRuleCounts(findings)
      expect(counts['no-console']).toBe(3)
    })

    it('should return empty object for empty array', () => {
      const aggregator = new ReportAggregator()
      const counts = aggregator.getRuleCounts([])
      expect(counts).toEqual({})
    })
  })

  describe('getFileCounts', () => {
    it('should count single file', () => {
      const aggregator = new ReportAggregator()
      const findings = [makeFinding({ file: 'app.ts' })]
      const counts = aggregator.getFileCounts(findings)
      expect(counts['app.ts']).toBe(1)
    })

    it('should count multiple files', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ file: 'a.ts' }),
        makeFinding({ file: 'b.ts' }),
      ]
      const counts = aggregator.getFileCounts(findings)
      expect(counts['a.ts']).toBe(1)
      expect(counts['b.ts']).toBe(1)
    })

    it('should count same file multiple times', () => {
      const aggregator = new ReportAggregator()
      const findings = [
        makeFinding({ file: 'app.ts', line: 1 }),
        makeFinding({ file: 'app.ts', line: 5 }),
        makeFinding({ file: 'app.ts', line: 10 }),
      ]
      const counts = aggregator.getFileCounts(findings)
      expect(counts['app.ts']).toBe(3)
    })

    it('should return empty object for empty array', () => {
      const aggregator = new ReportAggregator()
      const counts = aggregator.getFileCounts([])
      expect(counts).toEqual({})
    })
  })

  describe('getConfig', () => {
    it('should return default config when none provided', () => {
      const aggregator = new ReportAggregator()
      const config = aggregator.getConfig()
      expect(config.deduplicate).toBe(true)
      expect(config.sortBy).toEqual(['severity', 'file', 'line'])
    })

    it('should return custom deduplicate setting', () => {
      const aggregator = new ReportAggregator({ deduplicate: false })
      const config = aggregator.getConfig()
      expect(config.deduplicate).toBe(false)
    })

    it('should return custom sortBy setting', () => {
      const aggregator = new ReportAggregator({ sortBy: ['file'] })
      const config = aggregator.getConfig()
      expect(config.sortBy).toEqual(['file'])
    })

    it('should return custom dedupKey function', () => {
      const customKey = (f: AnalysisFinding): string => f.id
      const aggregator = new ReportAggregator({ dedupKey: customKey })
      const config = aggregator.getConfig()
      expect(config.dedupKey).toBe(customKey)
    })

    it('should return default dedupKey when not provided', () => {
      const aggregator = new ReportAggregator()
      const config = aggregator.getConfig()
      const finding = makeFinding({ ruleId: 'no-console', file: 'a.ts', line: 5 })
      expect(config.dedupKey(finding)).toBe('no-console:a.ts:5')
    })
  })
})
