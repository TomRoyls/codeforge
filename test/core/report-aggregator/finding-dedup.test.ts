import { describe, expect, it } from 'vitest'

import type { AnalysisFinding } from '../../../src/core/report-aggregator/types.js'

import { FindingDeduplicator } from '../../../src/core/report-aggregator/finding-dedup.js'

// ─── Helpers ───

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

// ─── Constructor ───

describe('FindingDeduplicator', () => {
  describe('constructor', () => {
    it('uses default key function', () => {
      const dedup = new FindingDeduplicator()
      const finding = makeFinding()
      expect(dedup.createKey(finding)).toBe('no-console:src/index.ts:10')
    })

    it('accepts custom key function', () => {
      const dedup = new FindingDeduplicator((f) => f.ruleId)
      const finding = makeFinding()
      expect(dedup.createKey(finding)).toBe('no-console')
    })
  })

  // ─── deduplicate ───

  describe('deduplicate', () => {
    it('returns all unique findings', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', line: 10 }),
        makeFinding({ id: '2', line: 20 }),
      ]

      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(2)
      expect(result.duplicatesRemoved).toBe(0)
    })

    it('removes exact duplicates', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1' }),
        makeFinding({ id: '2' }),
      ]

      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(1)
      expect(result.duplicatesRemoved).toBe(1)
    })

    it('keeps higher severity on merge', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', severity: 'warning' }),
        makeFinding({ id: '2', severity: 'error' }),
      ]

      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(1)
      expect(result.findings[0]!.severity).toBe('error')
    })

    it('keeps first when severities are equal', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', severity: 'warning', message: 'first' }),
        makeFinding({ id: '2', severity: 'warning', message: 'second' }),
      ]

      const result = dedup.deduplicate(findings)
      expect(result.findings[0]!.message).toBe('first')
    })

    it('handles empty array', () => {
      const dedup = new FindingDeduplicator()
      const result = dedup.deduplicate([])
      expect(result.findings).toHaveLength(0)
      expect(result.duplicatesRemoved).toBe(0)
    })

    it('handles triple duplicates', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', severity: 'info' }),
        makeFinding({ id: '2', severity: 'error' }),
        makeFinding({ id: '3', severity: 'warning' }),
      ]

      const result = dedup.deduplicate(findings)
      expect(result.findings).toHaveLength(1)
      expect(result.duplicatesRemoved).toBe(2)
      expect(result.findings[0]!.severity).toBe('error')
    })
  })

  // ─── findDuplicates ───

  describe('findDuplicates', () => {
    it('returns empty map when no duplicates', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', line: 10 }),
        makeFinding({ id: '2', line: 20 }),
      ]

      const dupes = dedup.findDuplicates(findings)
      expect(dupes.size).toBe(0)
    })

    it('finds duplicate groups', () => {
      const dedup = new FindingDeduplicator()
      const findings = [
        makeFinding({ id: '1', line: 10 }),
        makeFinding({ id: '2', line: 10 }),
        makeFinding({ id: '3', line: 20 }),
      ]

      const dupes = dedup.findDuplicates(findings)
      expect(dupes.size).toBe(1)
      const group = dupes.get('no-console:src/index.ts:10')
      expect(group).toHaveLength(2)
    })
  })

  // ─── mergeFindings ───

  describe('mergeFindings', () => {
    it('keeps error over warning', () => {
      const dedup = new FindingDeduplicator()
      const a = makeFinding({ severity: 'warning' })
      const b = makeFinding({ severity: 'error' })
      expect(dedup.mergeFindings(a, b).severity).toBe('error')
    })

    it('keeps error over info', () => {
      const dedup = new FindingDeduplicator()
      const a = makeFinding({ severity: 'info' })
      const b = makeFinding({ severity: 'error' })
      expect(dedup.mergeFindings(a, b).severity).toBe('error')
    })

    it('keeps warning over info', () => {
      const dedup = new FindingDeduplicator()
      const a = makeFinding({ severity: 'info' })
      const b = makeFinding({ severity: 'warning' })
      expect(dedup.mergeFindings(a, b).severity).toBe('warning')
    })

    it('keeps first when equal severity', () => {
      const dedup = new FindingDeduplicator()
      const a = makeFinding({ severity: 'warning', message: 'a' })
      const b = makeFinding({ severity: 'warning', message: 'b' })
      expect(dedup.mergeFindings(a, b).message).toBe('a')
    })
  })
})
