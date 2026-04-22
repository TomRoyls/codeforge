import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { type RuleViolation } from '../../../src/ast/visitor.js'
import { logger, LogLevel } from '../../../src/utils/logger.js'

vi.mock('../../../src/utils/command-helpers.js', () => ({
  getProfileSeverityOverrides: vi.fn().mockReturnValue({
    'test-rule': 'warning',
    'another-rule': 'error',
  }),
}))

// ============================================================================
// Helpers
// ============================================================================

const makeViolation = (overrides: Partial<RuleViolation> = {}): RuleViolation => ({
  ruleId: 'test-rule',
  severity: 'error',
  message: 'test message',
  filePath: '/test.ts',
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
  ...overrides,
})

// ============================================================================
// Import after mocks
// ============================================================================

const {
  applyProfileOverrides,
  configureLogging,
  determineExitCode,
  filterBySeverity,
  filterFileReports,
} = await import('../../../src/commands/analyze-filter-helpers.js')

// ============================================================================
// applyProfileOverrides
// ============================================================================

describe('applyProfileOverrides', () => {
  test('returns input unchanged when profile is undefined', () => {
    const violations = [makeViolation()]
    const fileReports = [{ filePath: '/test.ts', violations: [makeViolation()] }]

    const result = applyProfileOverrides(violations, fileReports, undefined)

    expect(result.violations).toBe(violations)
    expect(result.fileReports).toBe(fileReports)
  })

  test('applies severity overrides from profile to violations', () => {
    const violations = [
      makeViolation({ ruleId: 'test-rule', severity: 'error' }),
      makeViolation({ ruleId: 'unmatched-rule', severity: 'info' }),
    ]
    const fileReports = [{ filePath: '/test.ts', violations: [makeViolation()] }]

    const result = applyProfileOverrides(violations, fileReports, 'lenient')

    expect(result.violations[0].severity).toBe('warning')
    expect(result.violations[1].severity).toBe('info')
  })

  test('applies severity overrides from profile to file reports', () => {
    const violations = [makeViolation()]
    const fileReports = [
      {
        filePath: '/test.ts',
        violations: [
          makeViolation({ ruleId: 'test-rule', severity: 'info' }),
          makeViolation({ ruleId: 'unmatched-rule', severity: 'error' }),
        ],
      },
    ]

    const result = applyProfileOverrides(violations, fileReports, 'moderate')

    expect(result.fileReports[0].violations[0].severity).toBe('warning')
    expect(result.fileReports[0].violations[1].severity).toBe('error')
  })

  test('does not modify violations without matching override', () => {
    const violations = [makeViolation({ ruleId: 'no-override-rule', severity: 'info' })]
    const fileReports = [{ filePath: '/test.ts', violations: [] }]

    const result = applyProfileOverrides(violations, fileReports, 'strict')

    expect(result.violations[0].severity).toBe('info')
  })

  test('handles empty violations and file reports', () => {
    const result = applyProfileOverrides([], [], 'lenient')

    expect(result.violations).toEqual([])
    expect(result.fileReports).toEqual([])
  })

  test('returns new arrays when profile is provided (does not mutate)', () => {
    const violations = [makeViolation()]
    const fileReports = [{ filePath: '/test.ts', violations: [makeViolation()] }]

    const result = applyProfileOverrides(violations, fileReports, 'lenient')

    expect(result.violations).not.toBe(violations)
    expect(result.fileReports).not.toBe(fileReports)
  })

  test('creates new violation objects when override is applied', () => {
    const v = makeViolation({ ruleId: 'test-rule', severity: 'error' })
    const result = applyProfileOverrides([v], [], 'lenient')

    expect(result.violations[0]).not.toBe(v)
    expect(result.violations[0].severity).toBe('warning')
  })

  test('reuses same violation object when no override matches', () => {
    const v = makeViolation({ ruleId: 'no-match', severity: 'info' })
    const result = applyProfileOverrides([v], [], 'lenient')

    expect(result.violations[0]).toBe(v)
  })

  test('applies overrides to multiple violations with different rules', () => {
    const violations = [
      makeViolation({ ruleId: 'test-rule', severity: 'error' }),
      makeViolation({ ruleId: 'another-rule', severity: 'info' }),
      makeViolation({ ruleId: 'unmatched-rule', severity: 'warning' }),
    ]

    const result = applyProfileOverrides(violations, [], 'lenient')

    expect(result.violations[0].severity).toBe('warning')
    expect(result.violations[1].severity).toBe('error')
    expect(result.violations[2].severity).toBe('warning')
  })

  test('applies overrides in file reports for multiple rules', () => {
    const fileReports = [
      {
        filePath: '/test.ts',
        violations: [
          makeViolation({ ruleId: 'test-rule', severity: 'error' }),
          makeViolation({ ruleId: 'another-rule', severity: 'info' }),
        ],
      },
    ]

    const result = applyProfileOverrides([], fileReports, 'lenient')

    expect(result.fileReports[0].violations[0].severity).toBe('warning')
    expect(result.fileReports[0].violations[1].severity).toBe('error')
  })

  test('handles file reports with empty violations array', () => {
    const fileReports = [{ filePath: '/empty.ts', violations: [] }]

    const result = applyProfileOverrides([], fileReports, 'lenient')

    expect(result.fileReports[0].violations).toEqual([])
  })

  test('handles multiple file reports simultaneously', () => {
    const fileReports = [
      {
        filePath: '/a.ts',
        violations: [makeViolation({ ruleId: 'test-rule', severity: 'error' })],
      },
      { filePath: '/b.ts', violations: [makeViolation({ ruleId: 'test-rule', severity: 'info' })] },
    ]

    const result = applyProfileOverrides([], fileReports, 'lenient')

    expect(result.fileReports[0].violations[0].severity).toBe('warning')
    expect(result.fileReports[1].violations[0].severity).toBe('warning')
  })

  test('preserves non-severity properties on overridden violations', () => {
    const v = makeViolation({
      ruleId: 'test-rule',
      severity: 'error',
      message: 'important msg',
      filePath: '/src/deep/file.ts',
    })

    const result = applyProfileOverrides([v], [], 'lenient')

    expect(result.violations[0].message).toBe('important msg')
    expect(result.violations[0].filePath).toBe('/src/deep/file.ts')
    expect(result.violations[0].ruleId).toBe('test-rule')
  })

  test('handles empty string profile as falsy and returns original', () => {
    const violations = [makeViolation()]
    const fileReports = [{ filePath: '/test.ts', violations: [makeViolation()] }]

    const result = applyProfileOverrides(violations, fileReports, '')

    expect(result.violations).toBe(violations)
    expect(result.fileReports).toBe(fileReports)
  })

  test('handles violations and file reports together with profile', () => {
    const violations = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]
    const fileReports = [
      {
        filePath: '/test.ts',
        violations: [makeViolation({ ruleId: 'another-rule', severity: 'info' })],
      },
    ]

    const result = applyProfileOverrides(violations, fileReports, 'lenient')

    expect(result.violations[0].severity).toBe('warning')
    expect(result.fileReports[0].violations[0].severity).toBe('error')
  })

  test('file report violation objects are new when override matches', () => {
    const v = makeViolation({ ruleId: 'test-rule', severity: 'error' })
    const fileReports = [{ filePath: '/test.ts', violations: [v] }]

    const result = applyProfileOverrides([], fileReports, 'lenient')

    expect(result.fileReports[0].violations[0]).not.toBe(v)
    expect(result.fileReports[0].violations[0].severity).toBe('warning')
  })

  test('file report violation objects are same reference when no override matches', () => {
    const v = makeViolation({ ruleId: 'no-match', severity: 'info' })
    const fileReports = [{ filePath: '/test.ts', violations: [v] }]

    const result = applyProfileOverrides([], fileReports, 'lenient')

    expect(result.fileReports[0].violations[0]).toBe(v)
  })

  test('preserves non-severity properties on overridden file report violations', () => {
    const v = makeViolation({
      ruleId: 'test-rule',
      severity: 'error',
      message: 'file report msg',
      filePath: '/deep/path.ts',
    })
    const fileReports = [{ filePath: '/deep/path.ts', violations: [v] }]

    const result = applyProfileOverrides([], fileReports, 'lenient')

    expect(result.fileReports[0].violations[0].message).toBe('file report msg')
    expect(result.fileReports[0].violations[0].filePath).toBe('/deep/path.ts')
    expect(result.fileReports[0].violations[0].ruleId).toBe('test-rule')
  })

  test('applies another-rule override to violations', () => {
    const violations = [
      makeViolation({ ruleId: 'another-rule', severity: 'info' }),
      makeViolation({ ruleId: 'test-rule', severity: 'warning' }),
    ]

    const result = applyProfileOverrides(violations, [], 'lenient')

    expect(result.violations[0].severity).toBe('error')
    expect(result.violations[1].severity).toBe('warning')
  })

  test('applies both overrides to file report violations', () => {
    const fileReports = [
      {
        filePath: '/multi.ts',
        violations: [
          makeViolation({ ruleId: 'test-rule', severity: 'info' }),
          makeViolation({ ruleId: 'another-rule', severity: 'warning' }),
          makeViolation({ ruleId: 'no-match', severity: 'error' }),
        ],
      },
    ]

    const result = applyProfileOverrides([], fileReports, 'lenient')

    expect(result.fileReports[0].violations[0].severity).toBe('warning')
    expect(result.fileReports[0].violations[1].severity).toBe('error')
    expect(result.fileReports[0].violations[2].severity).toBe('error')
  })

  test('handles violations array with many items', () => {
    const violations = Array.from({ length: 50 }, (_, i) =>
      makeViolation({ ruleId: i % 2 === 0 ? 'test-rule' : 'no-match', severity: 'error' }),
    )

    const result = applyProfileOverrides(violations, [], 'lenient')

    expect(result.violations).toHaveLength(50)
    expect(result.violations.filter((v) => v.severity === 'warning')).toHaveLength(25)
    expect(result.violations.filter((v) => v.severity === 'error')).toHaveLength(25)
  })

  test('preserves range property on overridden violations', () => {
    const v = makeViolation({
      ruleId: 'test-rule',
      severity: 'error',
      range: { start: { line: 10, column: 5 }, end: { line: 15, column: 20 } },
    })

    const result = applyProfileOverrides([v], [], 'lenient')

    expect(result.violations[0].range).toEqual({
      start: { line: 10, column: 5 },
      end: { line: 15, column: 20 },
    })
    expect(result.violations[0].severity).toBe('warning')
  })

  test('preserves message property on overridden violations', () => {
    const v = makeViolation({
      ruleId: 'test-rule',
      severity: 'error',
      message: 'Specific error msg',
    })

    const result = applyProfileOverrides([v], [], 'lenient')

    expect(result.violations[0].message).toBe('Specific error msg')
    expect(result.violations[0].severity).toBe('warning')
  })

  test('does not change violations array reference when profile is undefined', () => {
    const violations = [makeViolation()]
    const fileReports = [{ filePath: '/test.ts', violations: [makeViolation()] }]

    const result = applyProfileOverrides(violations, fileReports, undefined)

    expect(result.violations).toBe(violations)
    expect(result.fileReports).toBe(fileReports)
  })

  test('handles single violation with matching override in both violations and fileReports', () => {
    const violations = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]
    const fileReports = [
      {
        filePath: '/test.ts',
        violations: [makeViolation({ ruleId: 'test-rule', severity: 'info' })],
      },
    ]

    const result = applyProfileOverrides(violations, fileReports, 'lenient')

    expect(result.violations[0].severity).toBe('warning')
    expect(result.fileReports[0].violations[0].severity).toBe('warning')
  })

  test('file reports array is new but filePath is preserved', () => {
    const fileReports = [
      {
        filePath: '/a.ts',
        violations: [makeViolation({ ruleId: 'test-rule', severity: 'error' })],
      },
    ]

    const result = applyProfileOverrides([], fileReports, 'lenient')

    expect(result.fileReports).not.toBe(fileReports)
    expect(result.fileReports[0].filePath).toBe('/a.ts')
  })

  test('handles violations with ruleId that matches no override key', () => {
    const violations = [
      makeViolation({ ruleId: 'completely-unknown-rule', severity: 'warning' }),
      makeViolation({ ruleId: 'also-unknown', severity: 'info' }),
    ]

    const result = applyProfileOverrides(violations, [], 'lenient')

    expect(result.violations[0].severity).toBe('warning')
    expect(result.violations[1].severity).toBe('info')
  })

  test('file report with multiple violations some overridden some not', () => {
    const v1 = makeViolation({ ruleId: 'test-rule', severity: 'error' })
    const v2 = makeViolation({ ruleId: 'no-override', severity: 'warning' })
    const v3 = makeViolation({ ruleId: 'another-rule', severity: 'info' })
    const fileReports = [{ filePath: '/mixed.ts', violations: [v1, v2, v3] }]

    const result = applyProfileOverrides([], fileReports, 'lenient')

    expect(result.fileReports[0].violations[0]).not.toBe(v1)
    expect(result.fileReports[0].violations[0].severity).toBe('warning')
    expect(result.fileReports[0].violations[1]).toBe(v2)
    expect(result.fileReports[0].violations[2]).not.toBe(v3)
    expect(result.fileReports[0].violations[2].severity).toBe('error')
  })

  test('profile with only whitespace is truthy and triggers overrides', () => {
    const violations = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]

    const result = applyProfileOverrides(violations, [], '  ')

    expect(result.violations[0].severity).toBe('warning')
  })
})

// ============================================================================
// configureLogging
// ============================================================================

describe('configureLogging', () => {
  let originalLevel: LogLevel

  beforeEach(() => {
    originalLevel = logger.getLevel()
  })

  afterEach(() => {
    logger.setLevel(originalLevel)
  })

  test('sets logger to DEBUG when verbose=true', () => {
    configureLogging(true, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('sets logger to SILENT when quiet=true and verbose=false', () => {
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
  })

  test('verbose takes priority over quiet when both are true', () => {
    configureLogging(true, true)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('does not change level when both flags are false', () => {
    logger.setLevel(LogLevel.WARN)
    configureLogging(false, false)
    expect(logger.getLevel()).toBe(LogLevel.WARN)
  })

  test('preserves level when already at DEBUG and flags are false', () => {
    logger.setLevel(LogLevel.DEBUG)
    configureLogging(false, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('sets to DEBUG from SILENT when verbose=true', () => {
    logger.setLevel(LogLevel.SILENT)
    configureLogging(true, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('sets to SILENT from DEBUG when quiet=true and verbose=false', () => {
    logger.setLevel(LogLevel.DEBUG)
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
  })

  test('preserves INFO level when both flags are false', () => {
    logger.setLevel(LogLevel.INFO)
    configureLogging(false, false)
    expect(logger.getLevel()).toBe(LogLevel.INFO)
  })

  test('verbose=true overrides ERROR level', () => {
    logger.setLevel(LogLevel.ERROR)
    configureLogging(true, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('quiet=true overrides ERROR level', () => {
    logger.setLevel(LogLevel.ERROR)
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
  })

  test('consecutive calls: verbose then quiet', () => {
    configureLogging(true, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
  })

  test('consecutive calls: quiet then verbose', () => {
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
    configureLogging(true, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('consecutive calls: verbose then no-op', () => {
    configureLogging(true, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
    configureLogging(false, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('consecutive calls: quiet then no-op', () => {
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
    configureLogging(false, false)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
  })

  test('repeated verbose=true calls keep DEBUG level', () => {
    configureLogging(true, false)
    const level1 = logger.getLevel()
    configureLogging(true, false)
    const level2 = logger.getLevel()
    expect(level1).toBe(LogLevel.DEBUG)
    expect(level2).toBe(LogLevel.DEBUG)
  })

  test('repeated quiet=true calls keep SILENT level', () => {
    configureLogging(false, true)
    const level1 = logger.getLevel()
    configureLogging(false, true)
    const level2 = logger.getLevel()
    expect(level1).toBe(LogLevel.SILENT)
    expect(level2).toBe(LogLevel.SILENT)
  })

  test('WARN level preserved when both flags false', () => {
    logger.setLevel(LogLevel.WARN)
    configureLogging(false, false)
    expect(logger.getLevel()).toBe(LogLevel.WARN)
  })

  test('ERROR level preserved when both flags false', () => {
    logger.setLevel(LogLevel.ERROR)
    configureLogging(false, false)
    expect(logger.getLevel()).toBe(LogLevel.ERROR)
  })

  test('verbose=true then both true still DEBUG', () => {
    configureLogging(true, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
    configureLogging(true, true)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('quiet=true then both true switches to DEBUG', () => {
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
    configureLogging(true, true)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('setting INFO then verbose=true sets DEBUG', () => {
    logger.setLevel(LogLevel.INFO)
    configureLogging(true, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('setting INFO then quiet=true sets SILENT', () => {
    logger.setLevel(LogLevel.INFO)
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
  })
})

// ============================================================================
// determineExitCode
// ============================================================================

describe('determineExitCode', () => {
  test('returns 1 when errors > 0', () => {
    expect(determineExitCode({ errors: 1, warnings: 0 }, false, -1)).toBe(1)
  })

  test('returns 1 when errors > 0 regardless of failOnWarnings', () => {
    expect(determineExitCode({ errors: 5, warnings: 0 }, true, -1)).toBe(1)
  })

  test('returns 1 when errors > 0 regardless of maxWarnings', () => {
    expect(determineExitCode({ errors: 1, warnings: 100 }, false, 0)).toBe(1)
  })

  test('returns 2 when failOnWarnings=true and warnings > 0 and errors=0', () => {
    expect(determineExitCode({ errors: 0, warnings: 3 }, true, -1)).toBe(2)
  })

  test('returns 0 when failOnWarnings=false and warnings > 0 and errors=0', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, false, -1)).toBe(0)
  })

  test('returns 1 when maxWarnings >= 0 and warnings > maxWarnings and errors=0', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, false, 3)).toBe(1)
  })

  test('returns 0 when maxWarnings >= 0 and warnings <= maxWarnings and errors=0', () => {
    expect(determineExitCode({ errors: 0, warnings: 3 }, false, 5)).toBe(0)
  })

  test('returns 0 when maxWarnings >= 0 and warnings === maxWarnings and errors=0', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, false, 5)).toBe(0)
  })

  test('returns 0 when maxWarnings=-1 (disabled) and warnings > 0 and errors=0', () => {
    expect(determineExitCode({ errors: 0, warnings: 100 }, false, -1)).toBe(0)
  })

  test('returns 0 when all counts are 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, false, -1)).toBe(0)
  })

  test('returns 0 when all counts are 0 with failOnWarnings=true', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, true, -1)).toBe(0)
  })

  test('errors take priority over failOnWarnings (returns 1 not 2)', () => {
    expect(determineExitCode({ errors: 1, warnings: 5 }, true, -1)).toBe(1)
  })

  test('errors take priority over maxWarnings (returns 1)', () => {
    expect(determineExitCode({ errors: 1, warnings: 100 }, false, 0)).toBe(1)
  })

  test('maxWarnings=0 with 1 warning returns 1', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, false, 0)).toBe(1)
  })

  test('maxWarnings=0 with 0 warnings returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, false, 0)).toBe(0)
  })

  test('failOnWarnings takes priority over maxWarnings when errors=0', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, true, 100)).toBe(2)
  })

  test('maxWarnings=10 with 10 warnings returns 0 (boundary)', () => {
    expect(determineExitCode({ errors: 0, warnings: 10 }, false, 10)).toBe(0)
  })

  test('maxWarnings=10 with 11 warnings returns 1', () => {
    expect(determineExitCode({ errors: 0, warnings: 11 }, false, 10)).toBe(1)
  })

  test('returns 1 with large error count', () => {
    expect(determineExitCode({ errors: 1000, warnings: 0 }, false, -1)).toBe(1)
  })

  test('returns 2 with large warning count and failOnWarnings', () => {
    expect(determineExitCode({ errors: 0, warnings: 500 }, true, -1)).toBe(2)
  })

  test('returns 1 when warnings exceed maxWarnings by 1', () => {
    expect(determineExitCode({ errors: 0, warnings: 2 }, false, 1)).toBe(1)
  })

  test('returns 0 when warnings equal maxWarnings exactly', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, false, 1)).toBe(0)
  })

  test('returns 1 with both errors and failOnWarnings=true', () => {
    expect(determineExitCode({ errors: 2, warnings: 10 }, true, -1)).toBe(1)
  })

  test('returns 1 with errors and maxWarnings=0 and warnings=0', () => {
    expect(determineExitCode({ errors: 1, warnings: 0 }, false, 0)).toBe(1)
  })

  test('returns 0 with maxWarnings=1 and warnings=0', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, false, 1)).toBe(0)
  })

  test('returns 2 when failOnWarnings=true with single warning', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, true, -1)).toBe(2)
  })

  test('errors override failOnWarnings even with many warnings', () => {
    expect(determineExitCode({ errors: 1, warnings: 999 }, true, -1)).toBe(1)
  })

  test('returns 1 when errors > 0 regardless of maxWarnings value', () => {
    expect(determineExitCode({ errors: 3, warnings: 2 }, false, 50)).toBe(1)
  })

  test('returns 1 when errors > 0 even with failOnWarnings and maxWarnings both set', () => {
    expect(determineExitCode({ errors: 1, warnings: 5 }, true, 10)).toBe(1)
  })

  test('maxWarnings=0 with 0 errors and 0 warnings returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, false, 0)).toBe(0)
  })

  test('returns 2 when failOnWarnings=true and warnings > 0 with maxWarnings also exceeded', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, true, 3)).toBe(2)
  })

  test('returns 1 when warnings far exceed maxWarnings', () => {
    expect(determineExitCode({ errors: 0, warnings: 100 }, false, 10)).toBe(1)
  })

  test('returns 1 with single error and zero warnings', () => {
    expect(determineExitCode({ errors: 1, warnings: 0 }, false, -1)).toBe(1)
  })

  test('returns 1 with single error and non-zero warnings', () => {
    expect(determineExitCode({ errors: 1, warnings: 5 }, false, -1)).toBe(1)
  })

  test('returns 0 with zero errors and zero warnings and maxWarnings=5', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, false, 5)).toBe(0)
  })

  test('returns 2 with single warning and failOnWarnings=true and maxWarnings=10', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, true, 10)).toBe(2)
  })

  test('returns 1 with maxWarnings=2 and warnings=3', () => {
    expect(determineExitCode({ errors: 0, warnings: 3 }, false, 2)).toBe(1)
  })

  test('returns 0 with maxWarnings=3 and warnings=2', () => {
    expect(determineExitCode({ errors: 0, warnings: 2 }, false, 3)).toBe(0)
  })

  test('returns 2 when failOnWarnings=true and maxWarnings is negative and warnings > 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, true, -10)).toBe(2)
  })

  test('returns 1 with errors=2 and failOnWarnings=true and maxWarnings=0', () => {
    expect(determineExitCode({ errors: 2, warnings: 3 }, true, 0)).toBe(1)
  })

  test('returns 1 when warnings just barely exceed maxWarnings', () => {
    expect(determineExitCode({ errors: 0, warnings: 6 }, false, 5)).toBe(1)
  })

  test('returns 0 when warnings exactly at maxWarnings boundary', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, false, 5)).toBe(0)
  })
})

// ============================================================================
// filterBySeverity
// ============================================================================

describe('filterBySeverity', () => {
  test('returns all violations for minLevel=info', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = filterBySeverity(violations, 'info')
    expect(result).toHaveLength(3)
  })

  test('returns errors and warnings for minLevel=warning', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(2)
    expect(result.every((v) => v.severity !== 'info')).toBe(true)
  })

  test('returns only errors for minLevel=error', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = filterBySeverity(violations, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('error')
  })

  test('returns empty array for empty input', () => {
    expect(filterBySeverity([], 'error')).toHaveLength(0)
  })

  test('returns empty array when no violations match severity level', () => {
    const violations = [makeViolation({ severity: 'info' }), makeViolation({ severity: 'info' })]
    expect(filterBySeverity(violations, 'error')).toHaveLength(0)
  })

  test('handles all errors with minLevel=info', () => {
    const violations = [makeViolation({ severity: 'error' }), makeViolation({ severity: 'error' })]
    expect(filterBySeverity(violations, 'info')).toHaveLength(2)
  })

  test('handles all info with minLevel=error (returns empty)', () => {
    const violations = [makeViolation({ severity: 'info' }), makeViolation({ severity: 'info' })]
    expect(filterBySeverity(violations, 'error')).toHaveLength(0)
  })

  test('preserves violation properties', () => {
    const v = makeViolation({ severity: 'error', ruleId: 'my-rule', message: 'hello' })
    const result = filterBySeverity([v], 'error')
    expect(result[0]).toEqual(v)
  })

  test('all warnings with minLevel=info passes through', () => {
    const violations = [
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'warning' }),
    ]
    expect(filterBySeverity(violations, 'info')).toHaveLength(2)
  })

  test('all errors with minLevel=warning passes through', () => {
    const violations = [makeViolation({ severity: 'error' }), makeViolation({ severity: 'error' })]
    expect(filterBySeverity(violations, 'warning')).toHaveLength(2)
  })

  test('single violation matching filter', () => {
    const violations = [makeViolation({ severity: 'warning' })]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('warning')
  })

  test('filters out warnings when minLevel=error', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
    ]
    const result = filterBySeverity(violations, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('error')
  })

  test('filters out info when minLevel=warning', () => {
    const violations = [makeViolation({ severity: 'warning' }), makeViolation({ severity: 'info' })]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('warning')
  })

  test('handles large number of violations efficiently', () => {
    const violations = Array.from({ length: 100 }, (_, i) =>
      makeViolation({ severity: i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'info' }),
    )
    const result = filterBySeverity(violations, 'warning')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((v) => v.severity !== 'info')).toBe(true)
  })

  test('returns violations in original order', () => {
    const violations = [
      makeViolation({ severity: 'warning', ruleId: 'c' }),
      makeViolation({ severity: 'error', ruleId: 'a' }),
      makeViolation({ severity: 'info', ruleId: 'b' }),
    ]
    const result = filterBySeverity(violations, 'info')
    expect(result.map((v) => v.ruleId)).toEqual(['c', 'a', 'b'])
  })

  test('handles duplicate severity entries', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'r1' }),
      makeViolation({ severity: 'error', ruleId: 'r2' }),
      makeViolation({ severity: 'error', ruleId: 'r3' }),
    ]
    const result = filterBySeverity(violations, 'error')
    expect(result).toHaveLength(3)
    expect(result.map((v) => v.ruleId)).toEqual(['r1', 'r2', 'r3'])
  })

  test('preserves range property after filtering', () => {
    const v = makeViolation({
      severity: 'error',
      range: { start: { line: 5, column: 10 }, end: { line: 5, column: 20 } },
    })
    const result = filterBySeverity([v], 'error')
    expect(result[0].range).toEqual({
      start: { line: 5, column: 10 },
      end: { line: 5, column: 20 },
    })
  })

  test('single info violation with minLevel=error returns empty', () => {
    const violations = [makeViolation({ severity: 'info' })]
    expect(filterBySeverity(violations, 'error')).toHaveLength(0)
  })

  test('single error violation with minLevel=info passes', () => {
    const violations = [makeViolation({ severity: 'error' })]
    const result = filterBySeverity(violations, 'info')
    expect(result).toHaveLength(1)
  })

  test('all three severities with minLevel=warning returns two', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'e' }),
      makeViolation({ severity: 'warning', ruleId: 'w' }),
      makeViolation({ severity: 'info', ruleId: 'i' }),
    ]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(2)
    expect(result.map((v) => v.ruleId)).toEqual(['e', 'w'])
  })

  test('single warning with minLevel=warning returns one', () => {
    const violations = [makeViolation({ severity: 'warning', ruleId: 'only-warn' })]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('only-warn')
  })

  test('handles violations with mixed rule IDs correctly for minLevel=error', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'r1' }),
      makeViolation({ severity: 'warning', ruleId: 'r2' }),
      makeViolation({ severity: 'error', ruleId: 'r3' }),
      makeViolation({ severity: 'info', ruleId: 'r4' }),
    ]
    const result = filterBySeverity(violations, 'error')
    expect(result).toHaveLength(2)
    expect(result.map((v) => v.ruleId)).toEqual(['r1', 'r3'])
  })

  test('does not mutate the original array', () => {
    const v1 = makeViolation({ severity: 'info' })
    const v2 = makeViolation({ severity: 'error' })
    const violations = [v1, v2]
    filterBySeverity(violations, 'error')
    expect(violations).toHaveLength(2)
    expect(violations[0]).toBe(v1)
    expect(violations[1]).toBe(v2)
  })

  test('all info with minLevel=info passes through', () => {
    const violations = [makeViolation({ severity: 'info' }), makeViolation({ severity: 'info' })]
    expect(filterBySeverity(violations, 'info')).toHaveLength(2)
  })

  test('all warning with minLevel=warning passes through', () => {
    const violations = [
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'warning' }),
    ]
    expect(filterBySeverity(violations, 'warning')).toHaveLength(2)
  })

  test('all error with minLevel=error passes through', () => {
    const violations = [makeViolation({ severity: 'error' }), makeViolation({ severity: 'error' })]
    expect(filterBySeverity(violations, 'error')).toHaveLength(2)
  })

  test('error and info with minLevel=warning returns only error', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'e' }),
      makeViolation({ severity: 'info', ruleId: 'i' }),
    ]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('e')
  })

  test('warning and info with minLevel=error returns empty', () => {
    const violations = [makeViolation({ severity: 'warning' }), makeViolation({ severity: 'info' })]
    expect(filterBySeverity(violations, 'error')).toHaveLength(0)
  })

  test('returns new array reference', () => {
    const violations = [makeViolation({ severity: 'error' })]
    const result = filterBySeverity(violations, 'error')
    expect(result).not.toBe(violations)
  })

  test('preserves ruleId after filtering', () => {
    const violations = [makeViolation({ severity: 'error', ruleId: 'my-custom-rule' })]
    const result = filterBySeverity(violations, 'error')
    expect(result[0].ruleId).toBe('my-custom-rule')
  })

  test('preserves filePath after filtering', () => {
    const violations = [makeViolation({ severity: 'error', filePath: '/src/utils/helpers.ts' })]
    const result = filterBySeverity(violations, 'error')
    expect(result[0].filePath).toBe('/src/utils/helpers.ts')
  })

  test('preserves message after filtering', () => {
    const violations = [makeViolation({ severity: 'error', message: 'Custom violation message' })]
    const result = filterBySeverity(violations, 'error')
    expect(result[0].message).toBe('Custom violation message')
  })

  test('handles alternating severity pattern with minLevel=warning', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: '0' }),
      makeViolation({ severity: 'warning', ruleId: '1' }),
      makeViolation({ severity: 'info', ruleId: '2' }),
      makeViolation({ severity: 'error', ruleId: '3' }),
      makeViolation({ severity: 'warning', ruleId: '4' }),
      makeViolation({ severity: 'info', ruleId: '5' }),
    ]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(4)
    expect(result.map((v) => v.ruleId)).toEqual(['0', '1', '3', '4'])
  })

  test('single error with minLevel=warning passes', () => {
    const violations = [makeViolation({ severity: 'error' })]
    expect(filterBySeverity(violations, 'warning')).toHaveLength(1)
  })

  test('single warning with minLevel=info passes', () => {
    const violations = [makeViolation({ severity: 'warning' })]
    expect(filterBySeverity(violations, 'info')).toHaveLength(1)
  })

  test('many info violations with minLevel=warning returns empty', () => {
    const violations = Array.from({ length: 20 }, () => makeViolation({ severity: 'info' }))
    expect(filterBySeverity(violations, 'warning')).toHaveLength(0)
  })
})

// ============================================================================
// filterFileReports
// ============================================================================

describe('filterFileReports', () => {
  test('returns all reports for minLevel=info', () => {
    const reports = [
      { filePath: '/a.ts', violations: [makeViolation({ severity: 'error' })] },
      { filePath: '/b.ts', violations: [makeViolation({ severity: 'warning' })] },
    ]
    const result = filterFileReports(reports, 'info')
    expect(result).toHaveLength(2)
  })

  test('filters out info-level violations when minLevel=warning', () => {
    const reports = [
      {
        filePath: '/a.ts',
        violations: [makeViolation({ severity: 'error' }), makeViolation({ severity: 'info' })],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(1)
    expect(result[0].violations[0].severity).toBe('error')
  })

  test('removes reports with 0 violations after filtering', () => {
    const reports = [
      { filePath: '/a.ts', violations: [makeViolation({ severity: 'info' })] },
      { filePath: '/b.ts', violations: [makeViolation({ severity: 'error' })] },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations[0].severity).toBe('error')
  })

  test('returns empty array when all reports are filtered out', () => {
    const reports = [
      { filePath: '/a.ts', violations: [makeViolation({ severity: 'info' })] },
      { filePath: '/b.ts', violations: [makeViolation({ severity: 'warning' })] },
    ]
    expect(filterFileReports(reports, 'error')).toHaveLength(0)
  })

  test('returns empty array for empty input', () => {
    expect(filterFileReports([], 'error')).toHaveLength(0)
  })

  test('preserves filePath after filtering', () => {
    const reports = [
      { filePath: '/src/foo.ts', violations: [makeViolation({ severity: 'error' })] },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result[0].filePath).toBe('/src/foo.ts')
  })

  test('handles mixed severities in single report', () => {
    const reports = [
      {
        filePath: '/mixed.ts',
        violations: [
          makeViolation({ severity: 'error' }),
          makeViolation({ severity: 'warning' }),
          makeViolation({ severity: 'info' }),
        ],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(2)
  })

  test('handles report with all info filtered to empty', () => {
    const reports = [
      {
        filePath: '/all-info.ts',
        violations: [makeViolation({ severity: 'info' }), makeViolation({ severity: 'info' })],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(0)
  })

  test('only errors with minLevel=error', () => {
    const reports = [
      {
        filePath: '/mixed.ts',
        violations: [
          makeViolation({ severity: 'error' }),
          makeViolation({ severity: 'warning' }),
          makeViolation({ severity: 'info' }),
        ],
      },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(1)
    expect(result[0].violations[0].severity).toBe('error')
  })

  test('multiple reports some filtered out', () => {
    const reports = [
      { filePath: '/a.ts', violations: [makeViolation({ severity: 'info' })] },
      { filePath: '/b.ts', violations: [makeViolation({ severity: 'error' })] },
      { filePath: '/c.ts', violations: [makeViolation({ severity: 'warning' })] },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations[0].severity).toBe('error')
  })

  test('report with empty violations array removed', () => {
    const reports = [
      { filePath: '/empty.ts', violations: [] },
      { filePath: '/nonempty.ts', violations: [makeViolation({ severity: 'error' })] },
    ]
    const result = filterFileReports(reports, 'info')
    expect(result).toHaveLength(1)
  })

  test('preserves violation order within a report after filtering', () => {
    const reports = [
      {
        filePath: '/ordered.ts',
        violations: [
          makeViolation({ severity: 'error', ruleId: 'z-rule' }),
          makeViolation({ severity: 'warning', ruleId: 'a-rule' }),
          makeViolation({ severity: 'info', ruleId: 'm-rule' }),
        ],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result[0].violations.map((v) => v.ruleId)).toEqual(['z-rule', 'a-rule'])
  })

  test('handles single report with single matching violation', () => {
    const reports = [{ filePath: '/single.ts', violations: [makeViolation({ severity: 'error' })] }]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(1)
  })

  test('handles single report with no matching violations', () => {
    const reports = [{ filePath: '/nomatch.ts', violations: [makeViolation({ severity: 'info' })] }]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(0)
  })

  test('handles multiple reports all passing filter', () => {
    const reports = [
      { filePath: '/a.ts', violations: [makeViolation({ severity: 'error' })] },
      { filePath: '/b.ts', violations: [makeViolation({ severity: 'warning' })] },
      { filePath: '/c.ts', violations: [makeViolation({ severity: 'info' })] },
    ]
    const result = filterFileReports(reports, 'info')
    expect(result).toHaveLength(3)
  })

  test('handles multiple reports all filtered out', () => {
    const reports = [
      { filePath: '/a.ts', violations: [makeViolation({ severity: 'info' })] },
      { filePath: '/b.ts', violations: [makeViolation({ severity: 'warning' })] },
      { filePath: '/c.ts', violations: [makeViolation({ severity: 'info' })] },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(0)
  })

  test('preserves violation properties in filtered results', () => {
    const v = makeViolation({
      severity: 'error',
      ruleId: 'custom-rule',
      message: 'custom message',
      filePath: '/src/custom.ts',
    })
    const reports = [{ filePath: '/src/custom.ts', violations: [v] }]
    const result = filterFileReports(reports, 'error')
    expect(result[0].violations[0].ruleId).toBe('custom-rule')
    expect(result[0].violations[0].message).toBe('custom message')
  })

  test('filters report with only warnings when minLevel=error', () => {
    const reports = [
      {
        filePath: '/warn-only.ts',
        violations: [
          makeViolation({ severity: 'warning' }),
          makeViolation({ severity: 'warning' }),
        ],
      },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(0)
  })

  test('report with errors passes minLevel=error filter', () => {
    const reports = [
      {
        filePath: '/err.ts',
        violations: [makeViolation({ severity: 'error' }), makeViolation({ severity: 'warning' })],
      },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(1)
    expect(result[0].violations[0].severity).toBe('error')
  })

  test('multiple violations in single report filtered to warnings only', () => {
    const reports = [
      {
        filePath: '/mixed.ts',
        violations: [
          makeViolation({ severity: 'warning' }),
          makeViolation({ severity: 'info' }),
          makeViolation({ severity: 'warning' }),
        ],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(2)
  })

  test('handles report with single violation filtered out', () => {
    const reports = [{ filePath: '/info.ts', violations: [makeViolation({ severity: 'info' })] }]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(0)
  })

  test('preserves correct filePath for each surviving report', () => {
    const reports = [
      { filePath: '/src/alpha.ts', violations: [makeViolation({ severity: 'info' })] },
      { filePath: '/src/beta.ts', violations: [makeViolation({ severity: 'error' })] },
      { filePath: '/src/gamma.ts', violations: [makeViolation({ severity: 'warning' })] },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].filePath).toBe('/src/beta.ts')
  })

  test('all violations errors with minLevel=warning keeps all reports', () => {
    const reports = [
      { filePath: '/a.ts', violations: [makeViolation({ severity: 'error' })] },
      { filePath: '/b.ts', violations: [makeViolation({ severity: 'error' })] },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(2)
  })

  test('does not mutate the original reports array', () => {
    const v = makeViolation({ severity: 'info' })
    const reports = [{ filePath: '/a.ts', violations: [v] }]
    const originalLength = reports.length
    filterFileReports(reports, 'error')
    expect(reports).toHaveLength(originalLength)
    expect(reports[0].violations).toHaveLength(1)
  })

  test('creates new report objects (does not mutate originals)', () => {
    const reports = [
      {
        filePath: '/a.ts',
        violations: [makeViolation({ severity: 'error' }), makeViolation({ severity: 'info' })],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result[0]).not.toBe(reports[0])
    expect(reports[0].violations).toHaveLength(2)
  })

  test('handles report with many violations of mixed severity for minLevel=error', () => {
    const reports = [
      {
        filePath: '/many.ts',
        violations: [
          makeViolation({ severity: 'error', ruleId: 'e1' }),
          makeViolation({ severity: 'warning', ruleId: 'w1' }),
          makeViolation({ severity: 'info', ruleId: 'i1' }),
          makeViolation({ severity: 'error', ruleId: 'e2' }),
          makeViolation({ severity: 'warning', ruleId: 'w2' }),
        ],
      },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(2)
    expect(result[0].violations.map((v) => v.ruleId)).toEqual(['e1', 'e2'])
  })

  test('filters correctly when multiple reports each have some violations surviving', () => {
    const reports = [
      {
        filePath: '/a.ts',
        violations: [makeViolation({ severity: 'error' }), makeViolation({ severity: 'info' })],
      },
      {
        filePath: '/b.ts',
        violations: [makeViolation({ severity: 'warning' }), makeViolation({ severity: 'info' })],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(2)
    expect(result[0].violations).toHaveLength(1)
    expect(result[1].violations).toHaveLength(1)
  })

  test('handles single report with multiple errors at minLevel=error', () => {
    const reports = [
      {
        filePath: '/errors.ts',
        violations: [
          makeViolation({ severity: 'error', ruleId: 'e1' }),
          makeViolation({ severity: 'error', ruleId: 'e2' }),
          makeViolation({ severity: 'error', ruleId: 'e3' }),
        ],
      },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(3)
  })

  test('returns new array reference', () => {
    const reports = [{ filePath: '/a.ts', violations: [makeViolation({ severity: 'error' })] }]
    const result = filterFileReports(reports, 'error')
    expect(result).not.toBe(reports)
  })

  test('handles report with warnings and errors filtered at minLevel=warning', () => {
    const reports = [
      {
        filePath: '/mixed.ts',
        violations: [
          makeViolation({ severity: 'error', ruleId: 'e' }),
          makeViolation({ severity: 'warning', ruleId: 'w' }),
          makeViolation({ severity: 'info', ruleId: 'i' }),
        ],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result[0].violations).toHaveLength(2)
    expect(result[0].violations.map((v) => v.ruleId)).toEqual(['e', 'w'])
  })

  test('preserves violation range after filtering', () => {
    const v = makeViolation({
      severity: 'error',
      range: { start: { line: 3, column: 5 }, end: { line: 3, column: 15 } },
    })
    const reports = [{ filePath: '/range.ts', violations: [v] }]
    const result = filterFileReports(reports, 'error')
    expect(result[0].violations[0].range).toEqual({
      start: { line: 3, column: 5 },
      end: { line: 3, column: 15 },
    })
  })

  test('handles many reports with only one surviving', () => {
    const reports = Array.from({ length: 10 }, (_, i) => ({
      filePath: `/file${i}.ts`,
      violations: [makeViolation({ severity: i === 5 ? 'error' : 'info' })],
    }))
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].filePath).toBe('/file5.ts')
  })

  test('handles report with all same severity errors', () => {
    const reports = [
      {
        filePath: '/all-error.ts',
        violations: Array.from({ length: 5 }, (_, i) =>
          makeViolation({ severity: 'error', ruleId: `r${i}` }),
        ),
      },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(5)
  })

  test('handles report with all same severity warnings at minLevel=error', () => {
    const reports = [
      {
        filePath: '/all-warn.ts',
        violations: Array.from({ length: 3 }, () => makeViolation({ severity: 'warning' })),
      },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(0)
  })

  test('handles report with all same severity info at minLevel=warning', () => {
    const reports = [
      {
        filePath: '/all-info.ts',
        violations: Array.from({ length: 4 }, () => makeViolation({ severity: 'info' })),
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(0)
  })

  test('empty violations in report removed even at minLevel=info', () => {
    const reports = [
      { filePath: '/empty.ts', violations: [] },
      { filePath: '/nonempty.ts', violations: [makeViolation({ severity: 'info' })] },
    ]
    const result = filterFileReports(reports, 'info')
    expect(result).toHaveLength(1)
    expect(result[0].filePath).toBe('/nonempty.ts')
  })

  test('preserves violation message after filtering', () => {
    const v = makeViolation({
      severity: 'error',
      message: 'Important diagnostic message',
    })
    const reports = [{ filePath: '/msg.ts', violations: [v] }]
    const result = filterFileReports(reports, 'error')
    expect(result[0].violations[0].message).toBe('Important diagnostic message')
  })

  test('preserves violation ruleId after filtering', () => {
    const v = makeViolation({
      severity: 'warning',
      ruleId: 'custom-warning-rule',
    })
    const reports = [{ filePath: '/rule.ts', violations: [v] }]
    const result = filterFileReports(reports, 'warning')
    expect(result[0].violations[0].ruleId).toBe('custom-warning-rule')
  })

  test('handles three reports each with mixed severities at minLevel=warning', () => {
    const reports = [
      {
        filePath: '/a.ts',
        violations: [makeViolation({ severity: 'error' }), makeViolation({ severity: 'info' })],
      },
      {
        filePath: '/b.ts',
        violations: [makeViolation({ severity: 'warning' }), makeViolation({ severity: 'info' })],
      },
      {
        filePath: '/c.ts',
        violations: [makeViolation({ severity: 'info' })],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(2)
    expect(result[0].filePath).toBe('/a.ts')
    expect(result[0].violations).toHaveLength(1)
    expect(result[1].filePath).toBe('/b.ts')
    expect(result[1].violations).toHaveLength(1)
  })

  test('all reports have errors at minLevel=error keeps all', () => {
    const reports = [
      { filePath: '/a.ts', violations: [makeViolation({ severity: 'error' })] },
      { filePath: '/b.ts', violations: [makeViolation({ severity: 'error' })] },
      { filePath: '/c.ts', violations: [makeViolation({ severity: 'error' })] },
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(3)
  })

  test('original report violations array not mutated', () => {
    const original = [makeViolation({ severity: 'error' }), makeViolation({ severity: 'info' })]
    const reports = [{ filePath: '/test.ts', violations: original }]
    filterFileReports(reports, 'error')
    expect(original).toHaveLength(2)
    expect(original[0].severity).toBe('error')
    expect(original[1].severity).toBe('info')
  })
})

// ============================================================================
// filterBySeverity - unknown severity edge cases
// ============================================================================

describe('filterBySeverity - unknown severity fallback', () => {
  test('treats unknown severity string as lowest (filtered out by minLevel=info)', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      { ...makeViolation(), severity: 'unknown' },
    ]
    const result = filterBySeverity(violations, 'info')
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('error')
  })

  test('unknown severity is filtered out by minLevel=warning', () => {
    const violations = [
      makeViolation({ severity: 'warning' }),
      { ...makeViolation(), severity: 'custom-severity' },
    ]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('warning')
  })

  test('unknown severity is filtered out by minLevel=error', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      { ...makeViolation(), severity: 'debug' },
    ]
    const result = filterBySeverity(violations, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('error')
  })

  test('all unknown severities returns empty array', () => {
    const violations = [
      { ...makeViolation(), severity: 'foo' },
      { ...makeViolation(), severity: 'bar' },
    ]
    expect(filterBySeverity(violations, 'info')).toHaveLength(0)
  })

  test('mix of unknown and known severities filters correctly', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      { ...makeViolation(), severity: 'unknown' },
      makeViolation({ severity: 'warning' }),
      { ...makeViolation(), severity: 'other' },
      makeViolation({ severity: 'info' }),
    ]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(2)
    expect(result.map((v) => v.severity)).toEqual(['error', 'warning'])
  })

  test('unknown severity with empty string is filtered out', () => {
    const violations = [{ ...makeViolation(), severity: '' }, makeViolation({ severity: 'error' })]
    const result = filterBySeverity(violations, 'info')
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('error')
  })

  test('only unknown severities filtered at minLevel=info returns empty', () => {
    const violations = [
      { ...makeViolation(), severity: 'critical' },
      { ...makeViolation(), severity: 'notice' },
    ]
    expect(filterBySeverity(violations, 'info')).toHaveLength(0)
  })

  test('unknown severity mixed with all known at minLevel=error', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
      { ...makeViolation(), severity: 'custom' },
    ]
    const result = filterBySeverity(violations, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('error')
  })

  test('unknown severity does not affect known severity ordering', () => {
    const violations = [
      { ...makeViolation(), severity: 'unknown', ruleId: 'u' },
      makeViolation({ severity: 'error', ruleId: 'e' }),
      { ...makeViolation(), severity: 'strange', ruleId: 's' },
      makeViolation({ severity: 'warning', ruleId: 'w' }),
    ]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(2)
    expect(result.map((v) => v.ruleId)).toEqual(['e', 'w'])
  })
})

// ============================================================================
// filterFileReports - unknown severity edge cases
// ============================================================================

describe('filterFileReports - unknown severity fallback', () => {
  test('removes report with only unknown severity violations at minLevel=info', () => {
    const reports = [
      {
        filePath: '/unknown.ts',
        violations: [{ ...makeViolation(), severity: 'unknown' }],
      },
    ]
    const result = filterFileReports(reports, 'info')
    expect(result).toHaveLength(0)
  })

  test('keeps known severities but removes unknown ones within same report', () => {
    const reports = [
      {
        filePath: '/mixed.ts',
        violations: [
          makeViolation({ severity: 'error' }),
          { ...makeViolation(), severity: 'unknown' },
          makeViolation({ severity: 'warning' }),
        ],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(2)
    expect(result[0].violations.map((v) => v.severity)).toEqual(['error', 'warning'])
  })

  test('report with unknown and info severities filtered at minLevel=warning keeps nothing', () => {
    const reports = [
      {
        filePath: '/low.ts',
        violations: [
          makeViolation({ severity: 'info' }),
          { ...makeViolation(), severity: 'mystery' },
        ],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(0)
  })

  test('multiple reports with some unknown severity reports removed', () => {
    const reports = [
      {
        filePath: '/a.ts',
        violations: [{ ...makeViolation(), severity: 'unknown' }],
      },
      {
        filePath: '/b.ts',
        violations: [makeViolation({ severity: 'error' })],
      },
      {
        filePath: '/c.ts',
        violations: [{ ...makeViolation(), severity: 'custom' }],
      },
    ]
    const result = filterFileReports(reports, 'info')
    expect(result).toHaveLength(1)
    expect(result[0].filePath).toBe('/b.ts')
  })

  test('report with only unknown severities at minLevel=error returns empty', () => {
    const reports = [
      {
        filePath: '/unknown.ts',
        violations: [
          { ...makeViolation(), severity: 'mystery' },
          { ...makeViolation(), severity: 'weird' },
        ],
      },
    ]
    expect(filterFileReports(reports, 'error')).toHaveLength(0)
  })

  test('unknown severity preserved in properties when mixed with known', () => {
    const reports = [
      {
        filePath: '/mixed.ts',
        violations: [
          makeViolation({ severity: 'error', ruleId: 'known' }),
          { ...makeViolation(), severity: 'strange', ruleId: 'strange-rule' },
        ],
      },
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(1)
    expect(result[0].violations[0].ruleId).toBe('known')
  })

  test('all reports have unknown severity removed at minLevel=info', () => {
    const reports = [
      {
        filePath: '/a.ts',
        violations: [{ ...makeViolation(), severity: 'alpha' }],
      },
      {
        filePath: '/b.ts',
        violations: [{ ...makeViolation(), severity: 'beta' }],
      },
    ]
    expect(filterFileReports(reports, 'info')).toHaveLength(0)
  })
})

// ============================================================================
// determineExitCode - additional boundary cases
// ============================================================================

describe('determineExitCode - additional edge cases', () => {
  test('maxWarnings=1 with 1 warning and failOnWarnings=false returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, false, 1)).toBe(0)
  })

  test('maxWarnings=1 with 2 warnings returns 1', () => {
    expect(determineExitCode({ errors: 0, warnings: 2 }, false, 1)).toBe(1)
  })

  test('negative maxWarnings with warnings returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, false, -5)).toBe(0)
  })

  test('maxWarnings=0 with failOnWarnings=true and 0 warnings returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, true, 0)).toBe(0)
  })

  test('large maxWarnings with small warnings returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, false, 999999)).toBe(0)
  })

  test('errors=1 with failOnWarnings=true and maxWarnings=0 still returns 1', () => {
    expect(determineExitCode({ errors: 1, warnings: 0 }, true, 0)).toBe(1)
  })

  test('maxWarnings exactly equals warnings with errors=0 and failOnWarnings=true returns 2', () => {
    expect(determineExitCode({ errors: 0, warnings: 5 }, true, 5)).toBe(2)
  })

  test('maxWarnings=0 with 0 warnings and failOnWarnings=true returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, true, 0)).toBe(0)
  })

  test('maxWarnings=100 with 100 warnings and failOnWarnings=false returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 100 }, false, 100)).toBe(0)
  })

  test('maxWarnings=100 with 101 warnings and failOnWarnings=false returns 1', () => {
    expect(determineExitCode({ errors: 0, warnings: 101 }, false, 100)).toBe(1)
  })

  test('errors=1 with large warnings and maxWarnings=0 returns 1', () => {
    expect(determineExitCode({ errors: 1, warnings: 500 }, false, 0)).toBe(1)
  })

  test('errors=0 warnings=0 failOnWarnings=true maxWarnings=-1 returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, true, -1)).toBe(0)
  })

  test('errors=0 warnings=1 failOnWarnings=true maxWarnings=0 returns 2', () => {
    expect(determineExitCode({ errors: 0, warnings: 1 }, true, 0)).toBe(2)
  })

  test('errors=10 warnings=0 failOnWarnings=false maxWarnings=-1 returns 1', () => {
    expect(determineExitCode({ errors: 10, warnings: 0 }, false, -1)).toBe(1)
  })

  test('errors=0 warnings=50 failOnWarnings=false maxWarnings=100 returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 50 }, false, 100)).toBe(0)
  })

  test('errors=3 warnings=10 failOnWarnings=true maxWarnings=5 returns 1', () => {
    expect(determineExitCode({ errors: 3, warnings: 10 }, true, 5)).toBe(1)
  })

  test('errors=0 warnings=3 failOnWarnings=true maxWarnings=2 returns 2', () => {
    expect(determineExitCode({ errors: 0, warnings: 3 }, true, 2)).toBe(2)
  })

  test('maxWarnings=-2 (treated as disabled) with warnings returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 10 }, false, -2)).toBe(0)
  })

  test('errors=0 warnings=0 failOnWarnings=false maxWarnings=0 returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, false, 0)).toBe(0)
  })

  test('errors=0 warnings=0 failOnWarnings=true maxWarnings=0 returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, true, 0)).toBe(0)
  })
})
