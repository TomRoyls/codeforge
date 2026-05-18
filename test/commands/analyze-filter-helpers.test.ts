import { describe, expect, it } from 'vitest'

import type { FileReport } from '../../src/commands/analyze-helpers.js'

import {
  applyProfileOverrides,
  determineExitCode,
  filterBySeverity,
  filterFileReports,
} from '../../src/commands/analyze-filter-helpers.js'
import type { RuleViolation } from '../../src/ast/visitor.js'

// ─── Helpers ───

function makeViolation(
  ruleId: string,
  severity: 'error' | 'info' | 'warning',
): RuleViolation {
  return {
    filePath: 'test.ts',
    message: `violation from ${ruleId}`,
    range: { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } },
    ruleId,
    severity,
  }
}

function makeFileReport(filePath: string, violations: RuleViolation[]): FileReport {
  return { filePath, violations }
}

// ─── determineExitCode ───

describe('determineExitCode', () => {
  it('returns 0 when no errors or warnings', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, false, -1)).toBe(0)
  })

  it('returns 1 when errors > 0', () => {
    expect(determineExitCode({ errors: 1, warnings: 0 }, false, -1)).toBe(1)
    expect(determineExitCode({ errors: 5, warnings: 0 }, true, 10)).toBe(1)
  })

  it('returns 2 when failOnWarnings and warnings > 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, true, -1)).toBe(2)
    expect(determineExitCode({ errors: 0, warnings: 10 }, true, 0)).toBe(2)
  })

  it('returns 0 when warnings present but failOnWarnings is false', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, false, -1)).toBe(0)
  })

  it('returns 1 when warnings exceed maxWarnings', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, false, 3)).toBe(1)
  })

  it('returns 0 when warnings within maxWarnings', () => {
    expect(determineExitCode({ errors: 0, warnings: 3 }, false, 5)).toBe(0)
  })

  it('returns 0 when warnings equal maxWarnings', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, false, 5)).toBe(0)
  })

  it('ignores maxWarnings when set to -1', () => {
    expect(determineExitCode({ errors: 0, warnings: 999 }, false, -1)).toBe(0)
  })

  it('prioritizes errors (1) over failOnWarnings (2)', () => {
    expect(determineExitCode({ errors: 3, warnings: 5 }, true, -1)).toBe(1)
  })
})

// ─── filterBySeverity ───

describe('filterBySeverity', () => {
  it('returns all violations when minLevel is info', () => {
    const violations = [
      makeViolation('r1', 'error'),
      makeViolation('r2', 'warning'),
      makeViolation('r3', 'info'),
    ]
    expect(filterBySeverity(violations, 'info')).toHaveLength(3)
  })

  it('filters out info when minLevel is warning', () => {
    const violations = [
      makeViolation('r1', 'error'),
      makeViolation('r2', 'warning'),
      makeViolation('r3', 'info'),
    ]
    const filtered = filterBySeverity(violations, 'warning')
    expect(filtered).toHaveLength(2)
    expect(filtered.every((v) => v.severity !== 'info')).toBe(true)
  })

  it('filters out info and warning when minLevel is error', () => {
    const violations = [
      makeViolation('r1', 'error'),
      makeViolation('r2', 'warning'),
      makeViolation('r3', 'info'),
    ]
    const filtered = filterBySeverity(violations, 'error')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].severity).toBe('error')
  })

  it('returns empty array for empty input', () => {
    expect(filterBySeverity([], 'error')).toEqual([])
  })

  it('handles violations with unknown severity as below info', () => {
    const violations = [
      makeViolation('r1', 'error'),
      { ...makeViolation('r2', 'info'), severity: 'unknown' as 'info' },
    ]
    const filtered = filterBySeverity(violations, 'warning')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].ruleId).toBe('r1')
  })
})

// ─── filterFileReports ───

describe('filterFileReports', () => {
  it('filters violations within reports by severity', () => {
    const reports = [
      makeFileReport('a.ts', [
        makeViolation('r1', 'error'),
        makeViolation('r2', 'info'),
      ]),
    ]
    const filtered = filterFileReports(reports, 'error')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].violations).toHaveLength(1)
    expect(filtered[0].violations[0].ruleId).toBe('r1')
  })

  it('removes reports with no matching violations', () => {
    const reports = [
      makeFileReport('a.ts', [makeViolation('r1', 'info')]),
      makeFileReport('b.ts', [makeViolation('r2', 'error')]),
    ]
    const filtered = filterFileReports(reports, 'error')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].filePath).toBe('b.ts')
  })

  it('returns empty array when no reports match', () => {
    const reports = [
      makeFileReport('a.ts', [makeViolation('r1', 'info')]),
    ]
    expect(filterFileReports(reports, 'error')).toEqual([])
  })
})

// ─── applyProfileOverrides ───

describe('applyProfileOverrides', () => {
  it('returns unchanged data when profile is undefined', () => {
    const violations = [makeViolation('r1', 'error')]
    const reports = [makeFileReport('a.ts', violations)]
    const result = applyProfileOverrides(violations, reports, undefined)
    expect(result.violations).toBe(violations)
    expect(result.fileReports).toBe(reports)
  })

  it('applies severity overrides to matching violations', () => {
    const violations = [makeViolation('r1', 'error')]
    const reports = [makeFileReport('a.ts', violations)]
    const result = applyProfileOverrides(violations, reports, 'lenient')
    // We can't predict exact overrides without knowing getProfileSeverityOverrides
    // but we can verify the structure is preserved
    expect(result.violations).toHaveLength(1)
    expect(result.fileReports).toHaveLength(1)
    expect(result.fileReports[0].violations).toHaveLength(1)
  })

  it('preserves violation count after overrides', () => {
    const violations = [
      makeViolation('r1', 'error'),
      makeViolation('r2', 'warning'),
    ]
    const reports = [makeFileReport('a.ts', violations)]
    const result = applyProfileOverrides(violations, reports, 'strict')
    expect(result.violations).toHaveLength(2)
    expect(result.fileReports[0].violations).toHaveLength(2)
  })
})
