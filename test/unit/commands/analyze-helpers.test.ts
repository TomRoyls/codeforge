import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  applyProfileOverrides,
  compareWithBaselineReport,
  configureLogging,
  determineExitCode,
  filterBySeverity,
  filterFileReports,
  generateSummary,
  getGitChangedFiles,
  getRulesWithFixes,
  getStagedFilesList,
  loadBaselineReport,
  processFixes,
  readIgnoreFile,
  resolveTargetFiles,
  saveBaselineReport,
  type AnalysisSummary,
  type BaselineCompareResult,
  type BaselineSaveResult,
  type FileReport,
  type FixApplicationResult,
} from '../../../src/commands/analyze-helpers.js'
import { type RuleViolation } from '../../../src/ast/visitor.js'
import { logger, LogLevel } from '../../../src/utils/logger.js'

vi.mock('../../../src/core/baseline.js', () => ({
  saveBaseline: vi.fn().mockResolvedValue('/path/to/.codeforge-baseline.json'),
  loadBaseline: vi.fn().mockResolvedValue(null),
  compareWithBaseline: vi.fn(),
}))

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

const { mockApplyFixesToFiles } = vi.hoisted(() => ({
  mockApplyFixesToFiles: vi.fn().mockResolvedValue({
    fixesApplied: 0,
    fixesSkipped: 0,
  }),
}))

const { mockGetProfileSeverityOverrides } = vi.hoisted(() => ({
  mockGetProfileSeverityOverrides: vi.fn().mockReturnValue({}),
}))

vi.mock('../../../src/utils/command-helpers.js', async () => {
  const actual = await vi.importActual<typeof import('../../../src/utils/command-helpers.js')>(
    '../../../src/utils/command-helpers.js',
  )
  return {
    ...actual,
    applyFixesToFiles: mockApplyFixesToFiles,
    getProfileSeverityOverrides: mockGetProfileSeverityOverrides,
  }
})

vi.mock('../../../src/fix/diff-renderer.js', () => ({
  renderTextChangesAsDiff: vi.fn().mockReturnValue('diff output'),
  formatDiffForConsole: vi.fn().mockReturnValue('formatted diff'),
}))

vi.mock('../../../src/utils/git-helpers.js', () => ({
  isGitRepository: vi.fn().mockReturnValue(true),
  getGitRoot: vi.fn().mockReturnValue('/project'),
  getStagedFiles: vi.fn().mockReturnValue([]),
  getChangedFiles: vi.fn().mockReturnValue([]),
  getDefaultBranch: vi.fn().mockReturnValue('main'),
}))

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  return { ...actual, existsSync: vi.fn().mockReturnValue(true) }
})

const { isGitRepository, getGitRoot, getStagedFiles, getChangedFiles, getDefaultBranch } =
  await import('../../../src/utils/git-helpers.js')
const { saveBaseline, loadBaseline, compareWithBaseline } =
  await import('../../../src/core/baseline.js')
const { discoverFiles } = await import('../../../src/core/file-discovery.js')

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

const makeReport = (violations: RuleViolation[] = []): FileReport => ({
  filePath: '/test.ts',
  violations,
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

  test('filters violations with unknown severity (treated as 0)', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      { ...makeViolation(), severity: 'debug' as 'error' | 'warning' | 'info' },
    ]
    const result = filterBySeverity(violations, 'error')
    expect(result).toHaveLength(1)
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
})

// ============================================================================
// filterFileReports
// ============================================================================

describe('filterFileReports', () => {
  test('returns all reports for minLevel=info', () => {
    const reports = [
      makeReport([makeViolation({ severity: 'error' })]),
      makeReport([makeViolation({ severity: 'warning' })]),
    ]
    const result = filterFileReports(reports, 'info')
    expect(result).toHaveLength(2)
  })

  test('filters out info-level violations when minLevel=warning', () => {
    const reports = [
      makeReport([makeViolation({ severity: 'error' }), makeViolation({ severity: 'info' })]),
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(1)
    expect(result[0].violations[0].severity).toBe('error')
  })

  test('removes reports with 0 violations after filtering', () => {
    const reports = [
      makeReport([makeViolation({ severity: 'info' })]),
      makeReport([makeViolation({ severity: 'error' })]),
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations[0].severity).toBe('error')
  })

  test('returns empty array when all reports are filtered out', () => {
    const reports = [
      makeReport([makeViolation({ severity: 'info' })]),
      makeReport([makeViolation({ severity: 'warning' })]),
    ]
    expect(filterFileReports(reports, 'error')).toHaveLength(0)
  })

  test('returns empty array for empty input', () => {
    expect(filterFileReports([], 'error')).toHaveLength(0)
  })

  test('preserves filePath after filtering', () => {
    const reports = [makeReport([makeViolation({ severity: 'error' })])]
    reports[0].filePath = '/src/foo.ts'
    const result = filterFileReports(reports, 'error')
    expect(result[0].filePath).toBe('/src/foo.ts')
  })

  test('handles mixed severities in single report', () => {
    const reports = [
      makeReport([
        makeViolation({ severity: 'error' }),
        makeViolation({ severity: 'warning' }),
        makeViolation({ severity: 'info' }),
      ]),
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(2)
  })

  test('handles report with all info filtered to empty', () => {
    const reports = [
      makeReport([makeViolation({ severity: 'info' }), makeViolation({ severity: 'info' })]),
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(0)
  })

  test('only errors with minLevel=error', () => {
    const reports = [
      makeReport([
        makeViolation({ severity: 'error' }),
        makeViolation({ severity: 'warning' }),
        makeViolation({ severity: 'info' }),
      ]),
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(1)
    expect(result[0].violations[0].severity).toBe('error')
  })

  test('multiple reports some filtered out', () => {
    const reports = [
      makeReport([makeViolation({ severity: 'info' })]),
      makeReport([makeViolation({ severity: 'error' })]),
      makeReport([makeViolation({ severity: 'warning' })]),
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations[0].severity).toBe('error')
  })

  test('report with empty violations array removed', () => {
    const reports = [
      { filePath: '/empty.ts', violations: [] },
      makeReport([makeViolation({ severity: 'error' })]),
    ]
    const result = filterFileReports(reports as FileReport[], 'info')
    expect(result).toHaveLength(1)
  })
})

// ============================================================================
// generateSummary
// ============================================================================

describe('generateSummary', () => {
  test('returns zeroed summary for empty violations', () => {
    const result = generateSummary([], 0, 100)
    expect(result.errors).toBe(0)
    expect(result.warnings).toBe(0)
    expect(result.info).toBe(0)
    expect(result.totalViolations).toBe(0)
    expect(result.totalFiles).toBe(0)
    expect(result.duration).toBe(100)
  })

  test('counts errors correctly', () => {
    const violations = [makeViolation({ severity: 'error' }), makeViolation({ severity: 'error' })]
    const result = generateSummary(violations, 5, 200)
    expect(result.errors).toBe(2)
    expect(result.warnings).toBe(0)
    expect(result.info).toBe(0)
  })

  test('counts warnings correctly', () => {
    const violations = [
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'warning' }),
    ]
    const result = generateSummary(violations, 3, 50)
    expect(result.warnings).toBe(3)
    expect(result.errors).toBe(0)
  })

  test('counts info correctly', () => {
    const violations = [makeViolation({ severity: 'info' })]
    const result = generateSummary(violations, 1, 10)
    expect(result.info).toBe(1)
  })

  test('counts mixed severities', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
      makeViolation({ severity: 'error' }),
    ]
    const result = generateSummary(violations, 10, 500)
    expect(result.errors).toBe(2)
    expect(result.warnings).toBe(1)
    expect(result.info).toBe(1)
    expect(result.totalViolations).toBe(4)
    expect(result.totalFiles).toBe(10)
    expect(result.duration).toBe(500)
  })

  test('totalViolations equals sum of all severity counts', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = generateSummary(violations, 1, 0)
    expect(result.totalViolations).toBe(result.errors + result.warnings + result.info)
  })

  test('returns correct fileCount', () => {
    const result = generateSummary([], 42, 0)
    expect(result.totalFiles).toBe(42)
  })

  test('returns correct duration', () => {
    const result = generateSummary([], 0, 1234)
    expect(result.duration).toBe(1234)
  })

  test('handles single violation', () => {
    const violations = [makeViolation({ severity: 'error' })]
    const result = generateSummary(violations, 1, 10)
    expect(result).toEqual({
      duration: 10,
      errors: 1,
      info: 0,
      totalFiles: 1,
      totalViolations: 1,
      warnings: 0,
    } satisfies AnalysisSummary)
  })

  test('handles zero duration', () => {
    const result = generateSummary([], 0, 0)
    expect(result.duration).toBe(0)
  })

  test('handles large numbers', () => {
    const violations = Array.from({ length: 1000 }, () => makeViolation({ severity: 'warning' }))
    const result = generateSummary(violations, 500, 9999)
    expect(result.warnings).toBe(1000)
    expect(result.totalViolations).toBe(1000)
    expect(result.totalFiles).toBe(500)
  })

  test('treats unknown severity as info', () => {
    const violations = [{ ...makeViolation(), severity: 'debug' as 'error' | 'warning' | 'info' }]
    const result = generateSummary(violations, 1, 10)
    expect(result.errors).toBe(0)
    expect(result.warnings).toBe(0)
    expect(result.info).toBe(1)
  })
})

// ============================================================================
// getRulesWithFixes
// ============================================================================

describe('getRulesWithFixes', () => {
  test('returns empty map for registry with no rules', () => {
    const registry = { getAllRules: vi.fn().mockReturnValue([]) } as any
    const result = getRulesWithFixes(registry)
    expect(result.size).toBe(0)
  })

  test('filters out rules without fix function', () => {
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'no-fix-rule' } } },
          { definition: { meta: { name: 'fix-is-string' }, fix: 'not-a-function' } },
        ]),
    } as any
    const result = getRulesWithFixes(registry)
    expect(result.size).toBe(0)
  })

  test('includes rules with fix function', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'fixable-rule' }, fix: fixFn } }]),
    } as any
    const result = getRulesWithFixes(registry)
    expect(result.size).toBe(1)
    expect(result.has('fixable-rule')).toBe(true)
  })

  test('returns rule with correct id', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'my-rule' }, fix: fixFn } }]),
    } as any
    const result = getRulesWithFixes(registry)
    const entry = result.get('my-rule')!
    expect(entry.id).toBe('my-rule')
  })

  test('returns rule with priority 10', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'rule' }, fix: fixFn } }]),
    } as any
    const result = getRulesWithFixes(registry)
    const entry = result.get('rule')!
    expect(entry.priority).toBe(10)
  })

  test('returns rule with fix wrapper function', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'rule' }, fix: fixFn } }]),
    } as any
    const result = getRulesWithFixes(registry)
    const entry = result.get('rule')!
    expect(typeof entry.fix).toBe('function')
  })

  test('fix wrapper calls original fix with sourceFile and violation', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'rule' }, fix: fixFn } }]),
    } as any
    const result = getRulesWithFixes(registry)
    const entry = result.get('rule')!
    const mockSourceFile = {} as any
    const mockViolation = makeViolation()
    entry.fix({
      getNodeByRange: vi.fn(),
      sourceFile: mockSourceFile,
      violation: mockViolation,
    })
    expect(fixFn).toHaveBeenCalledWith(mockSourceFile, mockViolation)
  })

  test('handles multiple rules with mixed fix presence', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'rule-with-fix' }, fix: fixFn } },
          { definition: { meta: { name: 'rule-no-fix' } } },
          { definition: { meta: { name: 'another-fixable' }, fix: vi.fn() } },
        ]),
    } as any
    const result = getRulesWithFixes(registry)
    expect(result.size).toBe(2)
    expect(result.has('rule-with-fix')).toBe(true)
    expect(result.has('another-fixable')).toBe(true)
    expect(result.has('rule-no-fix')).toBe(false)
  })

  test('fix is null is excluded', () => {
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'null-fix' }, fix: null } }]),
    } as any
    const result = getRulesWithFixes(registry)
    expect(result.size).toBe(0)
  })

  test('fix is undefined is excluded', () => {
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'undef-fix' }, fix: undefined } }]),
    } as any
    const result = getRulesWithFixes(registry)
    expect(result.size).toBe(0)
  })

  test('rule with numeric fix is excluded (not a function)', () => {
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'num-fix' }, fix: 42 } }]),
    } as any
    const result = getRulesWithFixes(registry)
    expect(result.size).toBe(0)
  })

  test('rule with boolean fix is excluded', () => {
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'bool-fix' }, fix: true } }]),
    } as any
    const result = getRulesWithFixes(registry)
    expect(result.size).toBe(0)
  })

  test('calls getAllRules once', () => {
    const getAllRules = vi.fn().mockReturnValue([])
    const registry = { getAllRules } as any
    getRulesWithFixes(registry)
    expect(getAllRules).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// readIgnoreFile
// ============================================================================

describe('readIgnoreFile', () => {
  const tempDir = join('/tmp', `codeforge-test-ignore-${Date.now()}`)

  beforeEach(() => {
    mkdirSync(tempDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  test('returns empty array for non-existent file', async () => {
    const result = await readIgnoreFile('/nonexistent/file.txt')
    expect(result).toEqual([])
  })

  test('reads and splits lines', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, 'node_modules\ndist\n*.log\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['node_modules', 'dist', '*.log'])
  })

  test('trims whitespace from lines', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '  node_modules  \n  dist  \n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['node_modules', 'dist'])
  })

  test('filters out empty lines', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, 'line1\n\n\nline2\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['line1', 'line2'])
  })

  test('filters out comment lines starting with #', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '# this is a comment\nline1\n# another comment\nline2\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['line1', 'line2'])
  })

  test('handles file with only comments', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '# comment1\n# comment2\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual([])
  })

  test('handles empty file', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual([])
  })

  test('handles file with only whitespace lines', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '   \n   \n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual([])
  })

  test('handles mixed content correctly', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '# ignore patterns\n\n  dist/  \nnode_modules\n\n# build\n*.log\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['dist/', 'node_modules', '*.log'])
  })

  test('handles lines with # in the middle (not filtered)', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, 'path/#comment\n')
    const result = await readIgnoreFile(filePath)
    // Only lines starting with # are filtered
    expect(result).toEqual(['path/#comment'])
  })

  test('handles file with trailing newline only', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '\n\n\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual([])
  })

  test('handles file with single line no newline', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, 'node_modules')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['node_modules'])
  })

  test('handles Windows CRLF line endings', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, 'node_modules\r\ndist\r\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['node_modules', 'dist'])
  })

  test('trims then checks # prefix (whitespace before # still filtered)', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '  #comment\ndist\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['dist'])
  })

  test('returns multiple non-empty non-comment lines in order', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, 'alpha\nbeta\ngamma\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['alpha', 'beta', 'gamma'])
  })
})

// ============================================================================
// saveBaselineReport
// ============================================================================

describe('saveBaselineReport', () => {
  test('returns save result with path and messages', async () => {
    const violations = [makeViolation(), makeViolation()]
    const result = await saveBaselineReport(violations, undefined)
    expect(result.path).toBe('/path/to/.codeforge-baseline.json')
    expect(result.messages).toEqual([
      'Baseline saved to /path/to/.codeforge-baseline.json',
      '  Total violations: 2',
    ])
  })

  test('passes output path to saveBaseline', async () => {
    const violations = [makeViolation()]
    await saveBaselineReport(violations, '/custom/output.json')
    expect(saveBaseline).toHaveBeenCalledWith(violations, '/custom/output.json')
  })

  test('reports zero violations correctly', async () => {
    const result = await saveBaselineReport([], undefined)
    expect(result.messages[1]).toBe('  Total violations: 0')
  })

  test('reports single violation correctly', async () => {
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.messages[1]).toBe('  Total violations: 1')
  })
})

// ============================================================================
// loadBaselineReport
// ============================================================================

describe('loadBaselineReport', () => {
  test('returns found=false when no baseline exists', async () => {
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(false)
    expect(result.violations).toBeUndefined()
  })

  test('returns found=true with violations when baseline exists', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation({ ruleId: 'baseline-rule' })],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(result.violations).toHaveLength(1)
  })

  test('passes output path to loadBaseline', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    await loadBaselineReport('/custom/path.json')
    expect(loadBaseline).toHaveBeenCalledWith('/custom/path.json')
  })
})

// ============================================================================
// compareWithBaselineReport
// ============================================================================

describe('compareWithBaselineReport', () => {
  test('returns noBaseline when no baseline file exists', async () => {
    const result = await compareWithBaselineReport([], undefined)
    expect(result.noBaseline).toBe(true)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toEqual(['No baseline file found. Run with --baseline save first.'])
  })

  test('returns exitCode 0 when no regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 1,
    })
    const result = await compareWithBaselineReport([makeViolation()], undefined)
    expect(result.noBaseline).toBe(false)
    expect(result.exitCode).toBe(0)
    expect(result.messages).toContain('')
    expect(result.messages).toContain('Baseline Comparison Results:')
    expect(result.messages).toContain('  Regressions (new violations): 0')
    expect(result.messages).toContain('  Improvements (fixed violations): 0')
    expect(result.messages).toContain('  Unchanged: 1')
  })

  test('returns exitCode 1 when regressions exist', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'src/foo.ts',
      ruleId: 'new-rule',
      message: 'new issue',
      range: { start: { line: 5, column: 3 }, end: { line: 5, column: 10 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('  Regressions (new violations): 1')
    expect(result.messages).toContain('Regressions:')
    expect(result.messages).toContain('  src/foo.ts:5:3 - new-rule: new issue')
  })

  test('includes improvements in messages', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [makeViolation()],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.exitCode).toBe(0)
    expect(result.messages).toContain('  Improvements (fixed violations): 1')
  })

  test('does not include regressions section when no regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).not.toContain('Regressions:')
  })

  test('passes output path through to loadBaseline', async () => {
    await compareWithBaselineReport([], '/output.json')
    expect(loadBaseline).toHaveBeenCalledWith('/output.json')
  })
})

// ============================================================================
// processFixes

vi.mock('../../../src/fix/diff-renderer.js', () => ({
  renderTextChangesAsDiff: vi.fn().mockReturnValue('diff output'),
  formatDiffForConsole: vi.fn().mockReturnValue('formatted diff'),
}))

describe('processFixes', () => {
  test('returns empty result when no violations', async () => {
    const result = await processFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as any,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
    expect(result.dryRunDiffs).toEqual([])
    expect(result.spinnerMessage).toBe('')
  })

  test('returns spinner message for applied fixes', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 3,
      fixesSkipped: 1,
      fileFixReports: undefined,
    })
    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as any,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.fixesApplied).toBe(3)
    expect(result.fixesSkipped).toBe(1)
    expect(result.spinnerMessage).toBe('Applied 3 fixes, skipped 1')
  })

  test('returns dry-run spinner message when dryRun=true', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 2,
      fixesSkipped: 0,
      fileFixReports: [],
    })
    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: {} as any,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.spinnerMessage).toBe('Would apply 2 fixes, skip 0 (dry run)')
  })

  test('collects dry-run diffs when fileFixReports have changes', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 5, newText: 'fixed', oldText: 'old' }], filePath: 'a.ts' },
        { changes: [], filePath: 'b.ts' },
      ],
    })
    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: {} as any,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.dryRunDiffs).toEqual(['formatted diff'])
  })

  test('no dry-run diffs when not dry run mode', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 5, newText: 'fixed', oldText: 'old' }], filePath: 'a.ts' },
      ],
    })
    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as any,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.dryRunDiffs).toEqual([])
  })
})

// ============================================================================
// getStagedFilesList
// ============================================================================

describe('getStagedFilesList', () => {
  test('returns error when not a git repository', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getStagedFilesList('/not/git')
    expect(result.error).toBe('Not a git repository. --staged requires a git repository.')
    expect(result.files).toEqual([])
  })

  test('returns error when git root cannot be determined', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = getStagedFilesList('/project')
    expect(result.error).toBe('Could not determine git repository root.')
    expect(result.files).toEqual([])
  })

  test('returns empty files when no staged files', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = getStagedFilesList('/project')
    expect(result.files).toEqual([])
    expect(result.error).toBeUndefined()
  })

  test('returns discovered files for staged paths', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['src/a.ts', 'src/b.ts'])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(2)
    expect(result.files[0]).toEqual({ absolutePath: '/project/src/a.ts', path: 'src/a.ts' })
    expect(result.files[1]).toEqual({ absolutePath: '/project/src/b.ts', path: 'src/b.ts' })
  })

  test('filters out non-existent files', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'src/exists.ts',
      'src/missing.ts',
    ])
    const fsSync = await import('node:fs')
    const origExists = fsSync.existsSync
    fsSync.existsSync = (p: unknown) => String(p).endsWith('exists.ts')
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('src/exists.ts')
    fsSync.existsSync = origExists
  })
})

// ============================================================================
// getGitChangedFiles
// ============================================================================

describe('getGitChangedFiles', () => {
  test('returns error when not a git repository', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getGitChangedFiles('/not/git', undefined)
    expect(result.error).toBe('Not a git repository. --changed requires a git repository.')
    expect(result.files).toEqual([])
  })

  test('returns error when git root cannot be determined', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = getGitChangedFiles('/project', undefined)
    expect(result.error).toBe('Could not determine git repository root.')
    expect(result.files).toEqual([])
  })

  test('uses provided baseRef', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/project', 'develop')
    expect(getChangedFiles).toHaveBeenCalledWith('develop', '/project')
  })

  test('uses default branch when no baseRef provided', () => {
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValueOnce('main')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/project', undefined)
    expect(getChangedFiles).toHaveBeenCalledWith('main', '/project')
  })

  test('returns empty files when no changed files', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toEqual([])
    expect(result.error).toBeUndefined()
  })

  test('returns discovered files for changed paths', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'src/changed1.ts',
      'src/changed2.ts',
    ])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toHaveLength(2)
    expect(result.files[0].path).toBe('src/changed1.ts')
    expect(result.files[1].path).toBe('src/changed2.ts')
  })
})

// ============================================================================
// resolveTargetFiles
// ============================================================================

describe('resolveTargetFiles', () => {
  test('delegates to getStagedFilesList when stagedMode=true', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['staged.ts'])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('staged.ts')
  })

  test('delegates to getGitChangedFiles when changedMode set', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['changed.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('changed.ts')
  })

  test('uses file discovery for normal mode', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { absolutePath: '/project/src/a.ts', path: 'src/a.ts' },
    ])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['src/**/*.ts'],
      ignore: ['node_modules'],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(1)
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: ['node_modules'],
      patterns: ['src/**/*.ts'],
    })
  })

  test('returns error from staged mode', async () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/not/git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.error).toBeDefined()
    expect(result.files).toEqual([])
  })

  test('returns error from changed mode', async () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/not/git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.error).toBeDefined()
    expect(result.files).toEqual([])
  })

  test('staged mode takes priority over changed mode', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['staged-only.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('staged-only.ts')
  })

  test('uses file discovery when neither staged nor changed', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['**/*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toEqual([])
    expect(result.error).toBeUndefined()
  })

  test('passes ignore patterns to discoverFiles', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['src/**/*.ts'],
      ignore: ['dist', 'node_modules'],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: ['dist', 'node_modules'],
      patterns: ['src/**/*.ts'],
    })
  })

  test('returns discovered files from file discovery', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
      { absolutePath: '/project/b.ts', path: 'b.ts' },
    ])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(2)
  })
})

// ============================================================================
// applyProfileOverrides
// ============================================================================

describe('applyProfileOverrides', () => {
  test('returns violations and reports unchanged when profile is undefined', () => {
    const violations = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]
    const reports = [makeReport(violations)]
    const result = applyProfileOverrides(violations, reports, undefined)
    expect(result.violations).toEqual(violations)
    expect(result.fileReports).toEqual(reports)
  })

  test('applies severity overrides from profile to violations', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'test-rule': 'warning' })
    const violations = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]
    const result = applyProfileOverrides(violations, [], 'strict')
    expect(result.violations[0].severity).toBe('warning')
  })

  test('applies severity overrides from profile to file reports', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'test-rule': 'info' })
    const violations = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]
    const reports = [makeReport(violations)]
    const result = applyProfileOverrides(violations, reports, 'lenient')
    expect(result.fileReports[0].violations[0].severity).toBe('info')
  })

  test('leaves violations without matching override unchanged', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'other-rule': 'warning' })
    const violations = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]
    const result = applyProfileOverrides(violations, [], 'strict')
    expect(result.violations[0].severity).toBe('error')
  })

  test('handles empty violations and reports with profile', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'some-rule': 'error' })
    const result = applyProfileOverrides([], [], 'strict')
    expect(result.violations).toEqual([])
    expect(result.fileReports).toEqual([])
  })

  test('overrides multiple violations of the same rule', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'test-rule': 'info' })
    const violations = [
      makeViolation({ ruleId: 'test-rule', severity: 'error' }),
      makeViolation({ ruleId: 'test-rule', severity: 'warning' }),
    ]
    const result = applyProfileOverrides(violations, [], 'lenient')
    expect(result.violations[0].severity).toBe('info')
    expect(result.violations[1].severity).toBe('info')
  })

  test('overrides multiple different rules independently', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({
      'rule-a': 'warning',
      'rule-b': 'error',
    })
    const violations = [
      makeViolation({ ruleId: 'rule-a', severity: 'info' }),
      makeViolation({ ruleId: 'rule-b', severity: 'warning' }),
    ]
    const result = applyProfileOverrides(violations, [], 'strict')
    expect(result.violations[0].severity).toBe('warning')
    expect(result.violations[1].severity).toBe('error')
  })

  test('does not mutate original violations array', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'test-rule': 'info' })
    const original = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]
    const copy = original.map((v) => ({ ...v }))
    applyProfileOverrides(original, [], 'lenient')
    expect(original[0].severity).toBe(copy[0].severity)
  })

  test('does not mutate original file reports', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'test-rule': 'warning' })
    const violations = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]
    const reports = [makeReport(violations)]
    const originalSeverity = reports[0].violations[0].severity
    applyProfileOverrides(violations, reports, 'strict')
    expect(reports[0].violations[0].severity).toBe(originalSeverity)
  })

  test('handles multiple file reports with overrides', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'test-rule': 'warning' })
    const violations = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]
    const reports = [
      makeReport([makeViolation({ ruleId: 'test-rule', severity: 'error' })]),
      makeReport([makeViolation({ ruleId: 'test-rule', severity: 'info' })]),
    ]
    const result = applyProfileOverrides(violations, reports, 'strict')
    expect(result.fileReports[0].violations[0].severity).toBe('warning')
    expect(result.fileReports[1].violations[0].severity).toBe('warning')
  })

  test('preserves non-severity violation properties after override', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'test-rule': 'warning' })
    const violations = [
      makeViolation({ ruleId: 'test-rule', severity: 'error', message: 'original msg' }),
    ]
    const result = applyProfileOverrides(violations, [], 'strict')
    expect(result.violations[0].message).toBe('original msg')
    expect(result.violations[0].ruleId).toBe('test-rule')
  })

  test('passes profile string to getProfileSeverityOverrides', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({})
    applyProfileOverrides([], [], 'moderate')
    expect(mockGetProfileSeverityOverrides).toHaveBeenCalledWith('moderate')
  })
})

// ============================================================================
// Additional determineExitCode edge cases
// ============================================================================

describe('determineExitCode additional edge cases', () => {
  test('large error count returns 1', () => {
    expect(determineExitCode({ errors: 999, warnings: 0 }, false, -1)).toBe(1)
  })

  test('large warning count with failOnWarnings returns 2', () => {
    expect(determineExitCode({ errors: 0, warnings: 999 }, true, -1)).toBe(2)
  })

  test('maxWarnings=1 with 2 warnings returns 1', () => {
    expect(determineExitCode({ errors: 0, warnings: 2 }, false, 1)).toBe(1)
  })

  test('maxWarnings=1000 with 999 warnings returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 999 }, false, 1000)).toBe(0)
  })

  test('single error with single warning and failOnWarnings returns 1', () => {
    expect(determineExitCode({ errors: 1, warnings: 1 }, true, -1)).toBe(1)
  })

  test('zero errors zero warnings with failOnWarnings and maxWarnings=0 returns 0', () => {
    expect(determineExitCode({ errors: 0, warnings: 0 }, true, 0)).toBe(0)
  })
})

// ============================================================================
// Additional filterBySeverity edge cases
// ============================================================================

describe('filterBySeverity additional edge cases', () => {
  test('handles large array of mixed severities', () => {
    const violations = Array.from({ length: 100 }, (_, i) =>
      makeViolation({ severity: (['error', 'warning', 'info'] as const)[i % 3] }),
    )
    const result = filterBySeverity(violations, 'warning')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((v) => v.severity !== 'info')).toBe(true)
  })

  test('preserves order of violations', () => {
    const violations = [
      makeViolation({ severity: 'info', ruleId: 'first' }),
      makeViolation({ severity: 'error', ruleId: 'second' }),
      makeViolation({ severity: 'warning', ruleId: 'third' }),
    ]
    const result = filterBySeverity(violations, 'info')
    expect(result.map((v) => v.ruleId)).toEqual(['first', 'second', 'third'])
  })

  test('all info-level violations with minLevel=info', () => {
    const violations = [
      makeViolation({ severity: 'info' }),
      makeViolation({ severity: 'info' }),
      makeViolation({ severity: 'info' }),
    ]
    expect(filterBySeverity(violations, 'info')).toHaveLength(3)
  })

  test('mixed violations with minLevel=warning excludes info', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(3)
  })
})

// ============================================================================
// Additional filterFileReports edge cases
// ============================================================================

describe('filterFileReports additional edge cases', () => {
  test('handles reports with multiple files and mixed severities', () => {
    const reports = [
      makeReport([makeViolation({ severity: 'error' }), makeViolation({ severity: 'info' })]),
      makeReport([makeViolation({ severity: 'warning' }), makeViolation({ severity: 'info' })]),
      makeReport([makeViolation({ severity: 'info' })]),
    ]
    const result = filterFileReports(reports, 'warning')
    expect(result).toHaveLength(2)
    expect(result[0].violations).toHaveLength(1)
    expect(result[1].violations).toHaveLength(1)
  })

  test('report with violations of same severity all pass minLevel', () => {
    const reports = [
      makeReport([
        makeViolation({ severity: 'error' }),
        makeViolation({ severity: 'error' }),
        makeViolation({ severity: 'error' }),
      ]),
    ]
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].violations).toHaveLength(3)
  })

  test('preserves all violation properties after filtering', () => {
    const v = makeViolation({
      severity: 'error',
      ruleId: 'preserve-test',
      message: 'preserve this message',
      filePath: '/preserve.ts',
      range: { start: { line: 10, column: 5 }, end: { line: 10, column: 20 } },
    })
    const reports = [makeReport([v])]
    const result = filterFileReports(reports, 'error')
    expect(result[0].violations[0]).toEqual(v)
  })

  test('handles many reports some filtered', () => {
    const reports = Array.from({ length: 50 }, (_, i) =>
      makeReport([
        makeViolation({ severity: i % 2 === 0 ? ('error' as const) : ('info' as const) }),
      ]),
    )
    const result = filterFileReports(reports, 'error')
    expect(result).toHaveLength(25)
  })
})

// ============================================================================
// Additional generateSummary edge cases
// ============================================================================

describe('generateSummary additional edge cases', () => {
  test('handles violations with only unknown severity', () => {
    const violations = [
      { ...makeViolation(), severity: 'debug' as 'error' | 'warning' | 'info' },
      { ...makeViolation(), severity: 'trace' as 'error' | 'warning' | 'info' },
    ]
    const result = generateSummary(violations, 1, 100)
    expect(result.errors).toBe(0)
    expect(result.warnings).toBe(0)
    expect(result.info).toBe(2)
    expect(result.totalViolations).toBe(2)
  })

  test('handles single error violation', () => {
    const result = generateSummary([makeViolation({ severity: 'error' })], 1, 50)
    expect(result.errors).toBe(1)
    expect(result.totalViolations).toBe(1)
  })

  test('handles single warning violation', () => {
    const result = generateSummary([makeViolation({ severity: 'warning' })], 1, 50)
    expect(result.warnings).toBe(1)
    expect(result.totalViolations).toBe(1)
  })

  test('handles single info violation', () => {
    const result = generateSummary([makeViolation({ severity: 'info' })], 1, 50)
    expect(result.info).toBe(1)
    expect(result.totalViolations).toBe(1)
  })

  test('zero fileCount with violations', () => {
    const result = generateSummary([makeViolation()], 0, 10)
    expect(result.totalFiles).toBe(0)
    expect(result.totalViolations).toBe(1)
  })

  test('negative duration handled correctly', () => {
    const result = generateSummary([], 0, -1)
    expect(result.duration).toBe(-1)
  })
})

// ============================================================================
// Additional readIgnoreFile edge cases
// ============================================================================

describe('readIgnoreFile additional edge cases', () => {
  const tempDir = join('/tmp', `codeforge-test-ignore-extra-${Date.now()}`)

  beforeEach(() => {
    mkdirSync(tempDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  test('handles file with only one valid line among comments', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '# comment\n# another\nonly-this\n# yet another\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['only-this'])
  })

  test('handles file with Unicode patterns', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, 'src/文档/**\nsrc/ファイル/**\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['src/文档/**', 'src/ファイル/**'])
  })

  test('handles file with very long lines', async () => {
    const longPattern = 'a'.repeat(500)
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, `${longPattern}\n`)
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual([longPattern])
  })

  test('handles file starting with blank lines', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '\n\n\ndist\nnode_modules\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['dist', 'node_modules'])
  })

  test('handles file ending without newline', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, 'dist\nnode_modules')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['dist', 'node_modules'])
  })

  test('handles file with tab characters', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, '\tdist\t\n\tnode_modules\t\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['dist', 'node_modules'])
  })

  test('handles file with mixed line endings', async () => {
    const filePath = join(tempDir, 'ignore.txt')
    writeFileSync(filePath, 'dist\r\nnode_modules\nbuild\r\n')
    const result = await readIgnoreFile(filePath)
    expect(result).toEqual(['dist', 'node_modules', 'build'])
  })
})

// ============================================================================
// Additional saveBaselineReport edge cases
// ============================================================================

describe('saveBaselineReport additional edge cases', () => {
  test('passes undefined output path to saveBaseline', async () => {
    await saveBaselineReport([makeViolation()], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([expect.any(Object)], undefined)
  })

  test('returns correct path from saveBaseline', async () => {
    const result = await saveBaselineReport([], undefined)
    expect(result.path).toBe('/path/to/.codeforge-baseline.json')
  })

  test('handles large number of violations in message', async () => {
    const violations = Array.from({ length: 100 }, () => makeViolation())
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 100')
  })
})

// ============================================================================
// Additional loadBaselineReport edge cases
// ============================================================================

describe('loadBaselineReport additional edge cases', () => {
  test('returns found=false with undefined output', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(false)
  })

  test('returns found=true with empty violations array', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  test('returns found=true with multiple violations', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [
        makeViolation({ ruleId: 'rule-1' }),
        makeViolation({ ruleId: 'rule-2' }),
        makeViolation({ ruleId: 'rule-3' }),
      ],
      summary: { errors: 3, warnings: 0, info: 0, total: 3 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(result.violations).toHaveLength(3)
  })
})

// ============================================================================
// Additional compareWithBaselineReport edge cases
// ============================================================================

describe('compareWithBaselineReport additional edge cases', () => {
  test('includes improvements count in summary', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [
        makeViolation({
          filePath: 'src/fixed.ts',
          ruleId: 'fixed-rule',
          message: 'fixed issue',
          range: { start: { line: 3, column: 1 }, end: { line: 3, column: 5 } },
        }),
      ],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.exitCode).toBe(0)
    expect(result.messages).toContain('  Improvements (fixed violations): 1')
  })

  test('handles multiple regressions with correct messages', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression1 = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'rule-a',
      message: 'issue a',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    const regression2 = makeViolation({
      filePath: 'src/b.ts',
      ruleId: 'rule-b',
      message: 'issue b',
      range: { start: { line: 2, column: 3 }, end: { line: 2, column: 10 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression1, regression2],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression1, regression2], undefined)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('  Regressions (new violations): 2')
    expect(result.messages).toContain('  src/a.ts:1:1 - rule-a: issue a')
    expect(result.messages).toContain('  src/b.ts:2:3 - rule-b: issue b')
  })

  test('handles zero unchanged violations', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).toContain('  Unchanged: 0')
    expect(result.noBaseline).toBe(false)
  })

  test('noBaseline result has no regressions/improvements details', async () => {
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).toHaveLength(1)
    expect(result.messages[0]).toBe('No baseline file found. Run with --baseline save first.')
  })
})

// ============================================================================
// Additional getStagedFilesList edge cases
// ============================================================================

describe('getStagedFilesList additional edge cases', () => {
  test('returns correct absolute paths for staged files', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/repo')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['src/x.ts'])
    const result = getStagedFilesList('/repo')
    expect(result.files[0].absolutePath).toBe('/repo/src/x.ts')
    expect(result.files[0].path).toBe('src/x.ts')
  })

  test('handles git root being different from cwd', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/actual/root')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['foo.ts'])
    const result = getStagedFilesList('/some/subdir')
    expect(result.files[0].absolutePath).toBe('/actual/root/foo.ts')
  })

  test('returns empty array with error message when not git repo', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getStagedFilesList('/tmp')
    expect(result.error).toContain('git repository')
    expect(result.files).toEqual([])
  })
})

// ============================================================================
// Additional getGitChangedFiles edge cases
// ============================================================================

describe('getGitChangedFiles additional edge cases', () => {
  test('returns correct absolute paths for changed files', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/repo')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['changed.ts'])
    const result = getGitChangedFiles('/repo', 'main')
    expect(result.files[0].absolutePath).toBe('/repo/changed.ts')
    expect(result.files[0].path).toBe('changed.ts')
  })

  test('handles multiple changed files', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/repo')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts', 'b.ts', 'c.ts'])
    const result = getGitChangedFiles('/repo', 'main')
    expect(result.files).toHaveLength(3)
  })

  test('error message mentions --changed flag', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getGitChangedFiles('/not/git', undefined)
    expect(result.error).toContain('--changed')
  })

  test('git root error returns same message as staged', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = getGitChangedFiles('/project', undefined)
    expect(result.error).toBe('Could not determine git repository root.')
  })
})

// ============================================================================
// Additional processFixes edge cases
// ============================================================================

describe('processFixes additional edge cases', () => {
  test('returns empty spinner message when no violations', async () => {
    const result = await processFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as any,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.spinnerMessage).toBe('')
    expect(result.dryRunDiffs).toEqual([])
  })

  test('correct spinner message for applied only (no skipped)', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 5,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })
    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as any,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.spinnerMessage).toBe('Applied 5 fixes, skipped 0')
  })

  test('dry-run with multiple file reports with changes', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 3,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 5, newText: 'a', oldText: 'b' }], filePath: 'a.ts' },
        { changes: [{ start: 0, end: 3, newText: 'c', oldText: 'd' }], filePath: 'b.ts' },
        { changes: [], filePath: 'c.ts' },
      ],
    })
    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: {} as any,
      quiet: false,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.dryRunDiffs).toHaveLength(2)
  })

  test('dry-run with empty changes produces no diffs', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 0,
      fixesSkipped: 0,
      fileFixReports: [{ changes: [], filePath: 'empty.ts' }],
    })
    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: {} as any,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.dryRunDiffs).toEqual([])
  })

  test('dry-run with no fileFixReports produces no diffs', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })
    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: {} as any,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.dryRunDiffs).toEqual([])
  })

  test('non-dry-run ignores fileFixReports changes', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 5, newText: 'a', oldText: 'b' }], filePath: 'a.ts' },
      ],
    })
    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as any,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })
    expect(result.dryRunDiffs).toEqual([])
    expect(result.spinnerMessage).toContain('Applied')
  })
})

// ============================================================================
// Additional configureLogging edge cases
// ============================================================================

describe('configureLogging additional edge cases', () => {
  let originalLevel: LogLevel

  beforeEach(() => {
    originalLevel = logger.getLevel()
  })

  afterEach(() => {
    logger.setLevel(originalLevel)
  })

  test('verbose=true sets DEBUG regardless of current level', () => {
    logger.setLevel(LogLevel.SILENT)
    configureLogging(true, false)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('quiet=true sets SILENT when current is DEBUG', () => {
    logger.setLevel(LogLevel.DEBUG)
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
  })

  test('both false preserves current INFO level', () => {
    logger.setLevel(LogLevel.INFO)
    configureLogging(false, false)
    expect(logger.getLevel()).toBe(LogLevel.INFO)
  })

  test('both false preserves current ERROR level', () => {
    logger.setLevel(LogLevel.ERROR)
    configureLogging(false, false)
    expect(logger.getLevel()).toBe(LogLevel.ERROR)
  })

  test('verbose=true overrides quiet=true (verbose wins)', () => {
    logger.setLevel(LogLevel.WARN)
    configureLogging(true, true)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('repeated calls with same args produce same result', () => {
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
    configureLogging(false, true)
    expect(logger.getLevel()).toBe(LogLevel.SILENT)
  })
})

// ============================================================================
// Additional resolveTargetFiles edge cases
// ============================================================================

describe('resolveTargetFiles additional edge cases', () => {
  test('passes empty files array to discoverFiles', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: [],
      patterns: [],
    })
  })

  test('returns files from changed mode with correct absolute paths', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['x.ts', 'y.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'develop',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(2)
    expect(result.files[0].path).toBe('x.ts')
    expect(result.files[1].path).toBe('y.ts')
  })

  test('returns error when staged mode fails with non-git dir', async () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/tmp/non-git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.error).toContain('git')
    expect(result.files).toEqual([])
  })
})

// ============================================================================
// Additional getRulesWithFixes edge cases
// ============================================================================

describe('getRulesWithFixes additional edge cases', () => {
  test('rule with empty name still included if fix is function', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi.fn().mockReturnValue([{ definition: { meta: { name: '' }, fix: fixFn } }]),
    } as any
    const result = getRulesWithFixes(registry)
    expect(result.size).toBe(1)
    expect(result.has('')).toBe(true)
  })

  test('fix wrapper handles null sourceFile gracefully', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'null-src' }, fix: fixFn } }]),
    } as any
    const result = getRulesWithFixes(registry)
    const entry = result.get('null-src')!
    const mockViolation = makeViolation()
    entry.fix({
      getNodeByRange: vi.fn(),
      sourceFile: null,
      violation: mockViolation,
    })
    expect(fixFn).toHaveBeenCalledWith(null, mockViolation)
  })

  test('handles registry returning single rule without fix field', () => {
    const registry = {
      getAllRules: vi.fn().mockReturnValue([{ definition: { meta: { name: 'no-fix-field' } } }]),
    } as any
    const result = getRulesWithFixes(registry)
    expect(result.size).toBe(0)
  })
})

// ============================================================================
// Additional applyProfileOverrides edge cases
// ============================================================================

describe('applyProfileOverrides additional edge cases', () => {
  test('empty profile overrides map leaves all violations unchanged', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({})
    const violations = [
      makeViolation({ ruleId: 'a', severity: 'error' }),
      makeViolation({ ruleId: 'b', severity: 'warning' }),
    ]
    const result = applyProfileOverrides(violations, [], 'strict')
    expect(result.violations[0].severity).toBe('error')
    expect(result.violations[1].severity).toBe('warning')
  })

  test('override to same severity is idempotent', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'test-rule': 'error' })
    const violations = [makeViolation({ ruleId: 'test-rule', severity: 'error' })]
    const result = applyProfileOverrides(violations, [], 'strict')
    expect(result.violations[0].severity).toBe('error')
  })

  test('handles file reports with multiple violations from different rules', () => {
    mockGetProfileSeverityOverrides.mockReturnValueOnce({ 'rule-a': 'info' })
    const reports = [
      makeReport([
        makeViolation({ ruleId: 'rule-a', severity: 'error' }),
        makeViolation({ ruleId: 'rule-b', severity: 'warning' }),
      ]),
    ]
    const result = applyProfileOverrides([], reports, 'lenient')
    expect(result.fileReports[0].violations[0].severity).toBe('info')
    expect(result.fileReports[0].violations[1].severity).toBe('warning')
  })
})
