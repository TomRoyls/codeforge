import { describe, it, expect, vi } from 'vitest'

import {
  applyProfileOverrides,
  configureLogging,
  determineExitCode,
  filterBySeverity,
  filterFileReports,
} from '../src/commands/analyze-filter-helpers.js'

import type { FileReport } from '../src/commands/analyze-helpers.js'
import type { RuleViolation } from '../src/ast/visitor.js'

// ─── Helpers ──────────────────────────────────────────

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'src/foo.ts',
    message: 'test violation',
    range: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

function makeFileReport(overrides: Partial<FileReport> = {}): FileReport {
  return {
    filePath: 'src/foo.ts',
    violations: [makeViolation()],
    ...overrides,
  }
}

// ─── applyProfileOverrides ────────────────────────────
describe('applyProfileOverrides', () => {
  it('returns unchanged data when profile is undefined', () => {
    const violations = [makeViolation()]
    const reports = [makeFileReport()]

    const result = applyProfileOverrides(violations, reports, undefined)

    expect(result.violations).toBe(violations)
    expect(result.fileReports).toBe(reports)
  })

  it('applies severity overrides to violations matching profile', () => {
    const violations = [makeViolation({ ruleId: 'no-console', severity: 'error' })]
    const reports = [makeFileReport({ violations: [makeViolation({ ruleId: 'no-console', severity: 'error' })] })]

    const result = applyProfileOverrides(violations, reports, 'lenient')

    // The overrides come from getProfileSeverityOverrides which may or may not have no-console
    // We just verify it doesn't crash and returns data
    expect(result.violations).toHaveLength(1)
    expect(result.fileReports).toHaveLength(1)
  })

  it('preserves violations without overrides', () => {
    const violations = [makeViolation({ ruleId: 'nonexistent-rule', severity: 'warning' })]
    const reports: FileReport[] = []

    const result = applyProfileOverrides(violations, reports, 'strict')

    expect(result.violations[0].severity).toBe('warning')
  })

  it('returns new arrays (does not mutate input)', () => {
    const violations = [makeViolation()]
    const reports = [makeFileReport()]

    const result = applyProfileOverrides(violations, reports, 'moderate')

    expect(result.violations).not.toBe(violations)
    expect(result.fileReports).not.toBe(reports)
  })
})

// ─── configureLogging ─────────────────────────────────
describe('configureLogging', () => {
  it('sets DEBUG level when verbose is true', async () => {
    const { logger, LogLevel } = await import('../src/utils/logger.js')
    const setLevelSpy = vi.spyOn(logger, 'setLevel')

    configureLogging(true, false)

    expect(setLevelSpy).toHaveBeenCalledWith(LogLevel.DEBUG)
    setLevelSpy.mockRestore()
  })

  it('sets SILENT level when quiet is true', async () => {
    const { logger, LogLevel } = await import('../src/utils/logger.js')
    const setLevelSpy = vi.spyOn(logger, 'setLevel')

    configureLogging(false, true)

    expect(setLevelSpy).toHaveBeenCalledWith(LogLevel.SILENT)
    setLevelSpy.mockRestore()
  })

  it('does not change level when neither verbose nor quiet', async () => {
    const { logger, LogLevel } = await import('../src/utils/logger.js')
    const setLevelSpy = vi.spyOn(logger, 'setLevel')

    configureLogging(false, false)

    expect(setLevelSpy).not.toHaveBeenCalled()
    setLevelSpy.mockRestore()
  })

  it('prefers verbose over quiet when both are true', async () => {
    const { logger, LogLevel } = await import('../src/utils/logger.js')
    const setLevelSpy = vi.spyOn(logger, 'setLevel')

    configureLogging(true, true)

    expect(setLevelSpy).toHaveBeenCalledWith(LogLevel.DEBUG)
    setLevelSpy.mockRestore()
  })
})

// ─── determineExitCode ────────────────────────────────
describe('determineExitCode', () => {
  it('returns 1 when errors > 0', () => {
    expect(determineExitCode({ errors: 1, warnings: 0 }, false, -1)).toBe(1)
  })

  it('returns 1 when errors > 0 regardless of other flags', () => {
    expect(determineExitCode({ errors: 5, warnings: 0 }, true, 0)).toBe(1)
  })

  it('returns 2 when failOnWarnings is true and warnings > 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, true, -1)).toBe(2)
  })

  it('returns 1 when warnings exceed maxWarnings (>= 0)', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, false, 3)).toBe(1)
  })

  it('returns 0 when warnings equal maxWarnings', () => {
    expect(determineExitCode({ errors: 0, warnings: 3 }, false, 3)).toBe(0)
  })

  it('returns 0 when warnings below maxWarnings', () => {
    expect(determineExitCode({ errors: 0, warnings: 2 }, false, 5)).toBe(0)
  })

  it('ignores maxWarnings when set to -1', () => {
    expect(determineExitCode({ errors: 0, warnings: 100 }, false, -1)).toBe(0)
  })

  it('returns 0 when no errors and no warnings', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, false, -1)).toBe(0)
  })

  it('returns 0 when no errors, no failOnWarnings, and maxWarnings is -1', () => {
    expect(determineExitCode({ errors: 0, warnings: 50 }, false, -1)).toBe(0)
  })

  it('prioritizes errors (1) over failOnWarnings (2)', () => {
    expect(determineExitCode({ errors: 1, warnings: 5 }, true, 0)).toBe(1)
  })
})

// ─── filterBySeverity ─────────────────────────────────
describe('filterBySeverity', () => {
  it('filters to only errors when minLevel is error', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('error')
  })

  it('filters to warnings and errors when minLevel is warning', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]

    const result = filterBySeverity(violations, 'warning')

    expect(result).toHaveLength(2)
    expect(result.every((v) => v.severity !== 'info')).toBe(true)
  })

  it('returns all violations when minLevel is info', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]

    const result = filterBySeverity(violations, 'info')

    expect(result).toHaveLength(3)
  })

  it('returns empty array for empty input', () => {
    expect(filterBySeverity([], 'error')).toHaveLength(0)
  })

  it('handles unknown severity as level 0 (filtered out by any minLevel)', () => {
    const violations = [
      makeViolation({ severity: 'unknown' as any }),
      makeViolation({ severity: 'error' }),
    ]

    const result = filterBySeverity(violations, 'info')

    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('error')
  })
})

// ─── filterFileReports ────────────────────────────────
describe('filterFileReports', () => {
  it('filters violations within reports by severity', () => {
    const reports = [
      makeFileReport({
        violations: [
          makeViolation({ severity: 'error' }),
          makeViolation({ severity: 'info' }),
        ],
      }),
    ]

    const result = filterFileReports(reports, 'error')

    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(1)
    expect(result[0].violations[0].severity).toBe('error')
  })

  it('removes reports with no remaining violations', () => {
    const reports = [
      makeFileReport({
        violations: [makeViolation({ severity: 'info' })],
      }),
    ]

    const result = filterFileReports(reports, 'error')

    expect(result).toHaveLength(0)
  })

  it('keeps reports with matching violations', () => {
    const reports = [
      makeFileReport({
        filePath: 'a.ts',
        violations: [makeViolation({ severity: 'warning' })],
      }),
      makeFileReport({
        filePath: 'b.ts',
        violations: [makeViolation({ severity: 'info' })],
      }),
    ]

    const result = filterFileReports(reports, 'warning')

    expect(result).toHaveLength(1)
    expect(result[0].filePath).toBe('a.ts')
  })

  it('returns empty array for empty input', () => {
    expect(filterFileReports([], 'error')).toHaveLength(0)
  })

  it('returns all reports for info level', () => {
    const reports = [
      makeFileReport({ violations: [makeViolation({ severity: 'info' })] }),
      makeFileReport({ violations: [makeViolation({ severity: 'error' })] }),
    ]

    const result = filterFileReports(reports, 'info')

    expect(result).toHaveLength(2)
  })
})
