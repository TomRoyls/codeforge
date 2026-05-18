import { afterEach, describe, expect, it, vi } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

// Mock all external dependencies before importing the module under test
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  statSync: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

vi.mock('node:os', () => ({
  default: { cpus: () => [{}, {}, {}, {}] },
  cpus: () => [{}, {}, {}, {}],
}))

vi.mock('node:path', () => ({
  default: {
    resolve: (...args: string[]) => args.join('/'),
    relative: (from: string, to: string) => {
      if (to.startsWith(from)) return to.slice(from.length + 1)
      return to
    },
  },
}))

vi.mock('ora', () => ({
  default: () => ({
    fail: function (this: { text: string }) { return this },
    start: function (this: { text: string }) { return this },
    stop: function (this: { text: string }) { return this },
    stopAndPersist: function (this: { text: string }) { return this },
    succeed: function (this: { text: string }) { return this },
    text: '',
    warn: function (this: { text: string }) { return this },
  }),
}))

vi.mock('p-limit', () => ({
  default: () => (fn: () => Promise<unknown>) => fn(),
}))

vi.mock('../../src/ast/visitor.js', () => ({
  traverseASTMultiple: vi.fn(),
}))

vi.mock('../../src/cache/index.js', () => ({
  ResultCache: class MockResultCache {
    get = vi.fn()
    hashConfig = vi.fn().mockReturnValue('config-hash')
    set = vi.fn()
  },
  hashFile: vi.fn(),
}))

vi.mock('../../src/config/cache.js', () => ({
  ConfigCache: class MockConfigCache {
    getConfig = vi.fn()
  },
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: class MockParser {
    dispose = vi.fn()
    initialize = vi.fn()
    parseFile = vi.fn()
  },
}))

vi.mock('../../src/core/reporter.js', () => ({
  Reporter: class MockReporter {
    writeReport = vi.fn()
  },
}))

vi.mock('../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(() => ({
    getEnabledRules: vi.fn().mockReturnValue([]),
    runRules: vi.fn().mockReturnValue([]),
  })),
}))

vi.mock('../../src/core/suppression-parser.js', () => ({
  filterSuppressedViolations: vi.fn((violations) => violations),
  parseSuppressionsFromSourceFile: vi.fn().mockReturnValue({ suppressions: [] }),
}))

vi.mock('../../src/fix/fixer.js', () => ({
  applyFixesToFile: vi.fn().mockReturnValue({
    changes: [],
    conflicts: [],
    fixesApplied: 0,
    fixesSkipped: 0,
  }),
}))

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    getRuleIds: vi.fn().mockReturnValue([]),
    loadAllRules: vi.fn().mockResolvedValue({}),
    loadRules: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../../src/utils/command-helpers.js', () => ({
  applyFixesToFiles: vi.fn(),
  filterFilesByExtension: vi.fn((files) => files),
  getProfileSeverityOverrides: vi.fn().mockReturnValue({}),
  loadCommandConfig: vi.fn().mockResolvedValue({}),
  normalizeFlags: vi.fn().mockReturnValue({
    cacheResults: true,
    changedMode: undefined,
    ciMode: false,
    concurrency: 4,
    dryRun: false,
    failOnWarnings: false,
    format: 'console',
    maxWarnings: -1,
    output: undefined,
    quiet: true,
    shouldFix: false,
    stagedMode: false,
    verbose: false,
  }),
  setupRuleRegistryLazy: vi.fn().mockResolvedValue({
    getEnabledRules: vi.fn().mockReturnValue([]),
    runRules: vi.fn().mockReturnValue([]),
  }),
}))

vi.mock('../../src/utils/errors.js', () => ({
  CLIError: class CLIError extends Error {
    suggestions?: string[]
    constructor(message: string, suggestions?: string[]) {
      super(message)
      this.suggestions = suggestions
    }
  },
}))

vi.mock('../../src/utils/logger.js', () => ({
  LogLevel: { DEBUG: 0, ERROR: 3, INFO: 1, SILENT: -1, WARN: 2 },
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    setLevel: vi.fn(),
    warn: vi.fn(),
  },
}))

vi.mock('../../src/commands/analyze-baseline-helpers.js', () => ({
  compareWithBaselineReport: vi.fn(),
  saveBaselineReport: vi.fn(),
}))

vi.mock('../../src/commands/analyze-git-helpers.js', () => ({
  resolveTargetFiles: vi.fn(),
}))

import { existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

import { hashFile, ResultCache } from '../../src/cache/index.js'
import { ConfigCache } from '../../src/config/cache.js'
import { Parser } from '../../src/core/parser.js'
import { Reporter } from '../../src/core/reporter.js'
import { filterSuppressedViolations, parseSuppressionsFromSourceFile } from '../../src/core/suppression-parser.js'
import { applyFixesToFile } from '../../src/fix/fixer.js'
import { lazyRuleLoader } from '../../src/rules/lazy-loader.js'
import {
  applyFixesToFiles,
  filterFilesByExtension,
  getProfileSeverityOverrides,
  loadCommandConfig,
  normalizeFlags,
  setupRuleRegistryLazy,
} from '../../src/utils/command-helpers.js'
import { CLIError } from '../../src/utils/errors.js'
import { logger, LogLevel } from '../../src/utils/logger.js'
import {
  compareWithBaselineReport,
  saveBaselineReport,
} from '../../src/commands/analyze-baseline-helpers.js'
import { resolveTargetFiles } from '../../src/commands/analyze-git-helpers.js'

import Analyze from '../../src/commands/analyze.js'

// ─── Helpers ───

const makeViolation = (
  overrides: Partial<RuleViolation> = {},
): RuleViolation => ({
  filePath: 'src/test.ts',
  message: 'test violation',
  range: {
    end: { column: 10, line: 1 },
    start: { column: 0, line: 1 },
  },
  ruleId: 'test-rule',
  severity: 'error',
  ...overrides,
})

const makeDiscoveredFile = (path = 'src/test.ts', absolutePath?: string) => ({
  absolutePath: absolutePath ?? `/project/${path}`,
  path,
})

/**
 * Create an Analyze instance with access to private methods for testing.
 * Uses bracket notation to access private methods without `any`.
 */
function createInstance(): InstanceType<typeof Analyze> {
  return new Analyze([], {} as never)
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

// ─── generateSummary ───

describe('generateSummary', () => {
  it('returns zero counts for empty violations array', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      generateSummary(v: RuleViolation[], f: number, d: number): {
        duration: number; errors: number; info: number
        totalFiles: number; totalViolations: number; warnings: number
      }
    }).generateSummary([], 0, 0)

    expect(result).toEqual({
      duration: 0,
      errors: 0,
      info: 0,
      totalFiles: 0,
      totalViolations: 0,
      warnings: 0,
    })
  })

  it('counts error violations correctly', () => {
    const instance = createInstance()
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'error' }),
    ]
    const result = (instance as unknown as {
      generateSummary(v: RuleViolation[], f: number, d: number): {
        errors: number; warnings: number; info: number; totalViolations: number
      }
    }).generateSummary(violations, 1, 100)

    expect(result.errors).toBe(2)
    expect(result.warnings).toBe(0)
    expect(result.info).toBe(0)
    expect(result.totalViolations).toBe(2)
  })

  it('counts warning violations correctly', () => {
    const instance = createInstance()
    const violations = [
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'warning' }),
    ]
    const result = (instance as unknown as {
      generateSummary(v: RuleViolation[], f: number, d: number): {
        errors: number; warnings: number; info: number
      }
    }).generateSummary(violations, 2, 50)

    expect(result.warnings).toBe(3)
    expect(result.errors).toBe(0)
    expect(result.info).toBe(0)
  })

  it('counts info violations correctly', () => {
    const instance = createInstance()
    const violations = [makeViolation({ severity: 'info' })]
    const result = (instance as unknown as {
      generateSummary(v: RuleViolation[], f: number, d: number): {
        errors: number; warnings: number; info: number
      }
    }).generateSummary(violations, 1, 25)

    expect(result.info).toBe(1)
    expect(result.errors).toBe(0)
    expect(result.warnings).toBe(0)
  })

  it('counts mixed severity violations', () => {
    const instance = createInstance()
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
      makeViolation({ severity: 'error' }),
    ]
    const result = (instance as unknown as {
      generateSummary(v: RuleViolation[], f: number, d: number): {
        duration: number; errors: number; info: number
        totalFiles: number; totalViolations: number; warnings: number
      }
    }).generateSummary(violations, 5, 200)

    expect(result).toEqual({
      duration: 200,
      errors: 2,
      info: 1,
      totalFiles: 5,
      totalViolations: 4,
      warnings: 1,
    })
  })

  it('passes through fileCount and duration unchanged', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      generateSummary(v: RuleViolation[], f: number, d: number): {
        duration: number; totalFiles: number
      }
    }).generateSummary([], 42, 9999)

    expect(result.totalFiles).toBe(42)
    expect(result.duration).toBe(9999)
  })
})

// ─── filterBySeverity ───

describe('filterBySeverity', () => {
  it('returns all violations when minLevel is "info"', () => {
    const instance = createInstance()
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = (instance as unknown as {
      filterBySeverity(v: RuleViolation[], m: string): RuleViolation[]
    }).filterBySeverity(violations, 'info')

    expect(result).toHaveLength(3)
  })

  it('filters out info violations when minLevel is "warning"', () => {
    const instance = createInstance()
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = (instance as unknown as {
      filterBySeverity(v: RuleViolation[], m: string): RuleViolation[]
    }).filterBySeverity(violations, 'warning')

    expect(result).toHaveLength(2)
    expect(result.every((v) => v.severity !== 'info')).toBe(true)
  })

  it('filters out info and warning when minLevel is "error"', () => {
    const instance = createInstance()
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = (instance as unknown as {
      filterBySeverity(v: RuleViolation[], m: string): RuleViolation[]
    }).filterBySeverity(violations, 'error')

    expect(result).toHaveLength(1)
    expect(result[0]!.severity).toBe('error')
  })

  it('returns empty array when all violations are below threshold', () => {
    const instance = createInstance()
    const violations = [
      makeViolation({ severity: 'info' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = (instance as unknown as {
      filterBySeverity(v: RuleViolation[], m: string): RuleViolation[]
    }).filterBySeverity(violations, 'error')

    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      filterBySeverity(v: RuleViolation[], m: string): RuleViolation[]
    }).filterBySeverity([], 'info')

    expect(result).toHaveLength(0)
  })

  it('handles unknown severity gracefully (filters it out)', () => {
    const instance = createInstance()
    const violations = [
      makeViolation({ severity: 'error' }),
      { ...makeViolation(), severity: 'unknown' as RuleViolation['severity'] },
    ]
    const result = (instance as unknown as {
      filterBySeverity(v: RuleViolation[], m: string): RuleViolation[]
    }).filterBySeverity(violations, 'info')

    // 'unknown' has severityOrder 0, which is < info's 1, so it gets filtered
    expect(result).toHaveLength(1)
    expect(result[0]!.severity).toBe('error')
  })
})

// ─── filterFileReports ───

describe('filterFileReports', () => {
  it('filters violations within each file report by severity', () => {
    const instance = createInstance()
    const reports = [
      {
        filePath: 'a.ts',
        violations: [
          makeViolation({ severity: 'error' }),
          makeViolation({ severity: 'info' }),
        ],
      },
      {
        filePath: 'b.ts',
        violations: [
          makeViolation({ severity: 'warning' }),
        ],
      },
    ]
    const result = (instance as unknown as {
      filterFileReports(
        r: { filePath: string; violations: RuleViolation[] }[],
        m: string,
      ): { filePath: string; violations: RuleViolation[] }[]
    }).filterFileReports(reports, 'warning')

    // a.ts keeps only error, b.ts keeps warning — both have ≥1 remaining
    expect(result).toHaveLength(2)
    expect(result[0]!.violations).toHaveLength(1)
    expect(result[1]!.violations).toHaveLength(1)
  })

  it('removes file reports with no remaining violations', () => {
    const instance = createInstance()
    const reports = [
      {
        filePath: 'a.ts',
        violations: [makeViolation({ severity: 'error' })],
      },
      {
        filePath: 'b.ts',
        violations: [makeViolation({ severity: 'info' })],
      },
    ]
    const result = (instance as unknown as {
      filterFileReports(
        r: { filePath: string; violations: RuleViolation[] }[],
        m: string,
      ): { filePath: string; violations: RuleViolation[] }[]
    }).filterFileReports(reports, 'error')

    expect(result).toHaveLength(1)
    expect(result[0]!.filePath).toBe('a.ts')
  })

  it('returns empty array when all reports are filtered out', () => {
    const instance = createInstance()
    const reports = [
      {
        filePath: 'a.ts',
        violations: [makeViolation({ severity: 'info' })],
      },
    ]
    const result = (instance as unknown as {
      filterFileReports(
        r: { filePath: string; violations: RuleViolation[] }[],
        m: string,
      ): { filePath: string; violations: RuleViolation[] }[]
    }).filterFileReports(reports, 'error')

    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      filterFileReports(
        r: { filePath: string; violations: RuleViolation[] }[],
        m: string,
      ): { filePath: string; violations: RuleViolation[] }[]
    }).filterFileReports([], 'info')

    expect(result).toHaveLength(0)
  })

  it('preserves file path in filtered reports', () => {
    const instance = createInstance()
    const reports = [
      {
        filePath: 'deeply/nested/file.ts',
        violations: [makeViolation({ severity: 'warning' })],
      },
    ]
    const result = (instance as unknown as {
      filterFileReports(
        r: { filePath: string; violations: RuleViolation[] }[],
        m: string,
      ): { filePath: string; violations: RuleViolation[] }[]
    }).filterFileReports(reports, 'warning')

    expect(result[0]!.filePath).toBe('deeply/nested/file.ts')
  })
})

// ─── determineExitCode ───

describe('determineExitCode', () => {
  it('returns 0 when no errors or warnings', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      determineExitCode(s: { errors: number; warnings: number }, f: boolean, m: number): number
    }).determineExitCode({ errors: 0, warnings: 0 }, false, -1)

    expect(result).toBe(0)
  })

  it('returns 1 when errors > 0', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      determineExitCode(s: { errors: number; warnings: number }, f: boolean, m: number): number
    }).determineExitCode({ errors: 1, warnings: 0 }, false, -1)

    expect(result).toBe(1)
  })

  it('returns 1 for multiple errors', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      determineExitCode(s: { errors: number; warnings: number }, f: boolean, m: number): number
    }).determineExitCode({ errors: 5, warnings: 0 }, false, -1)

    expect(result).toBe(1)
  })

  it('returns 2 when failOnWarnings is true and warnings > 0', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      determineExitCode(s: { errors: number; warnings: number }, f: boolean, m: number): number
    }).determineExitCode({ errors: 0, warnings: 3 }, true, -1)

    expect(result).toBe(2)
  })

  it('returns 0 when failOnWarnings is true but no warnings', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      determineExitCode(s: { errors: number; warnings: number }, f: boolean, m: number): number
    }).determineExitCode({ errors: 0, warnings: 0 }, true, -1)

    expect(result).toBe(0)
  })

  it('returns 1 when maxWarnings >= 0 and warnings exceed it', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      determineExitCode(s: { errors: number; warnings: number }, f: boolean, m: number): number
    }).determineExitCode({ errors: 0, warnings: 11 }, false, 10)

    expect(result).toBe(1)
  })

  it('returns 0 when maxWarnings >= 0 and warnings do not exceed it', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      determineExitCode(s: { errors: number; warnings: number }, f: boolean, m: number): number
    }).determineExitCode({ errors: 0, warnings: 5 }, false, 10)

    expect(result).toBe(0)
  })

  it('returns 0 when maxWarnings exactly equals warning count', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      determineExitCode(s: { errors: number; warnings: number }, f: boolean, m: number): number
    }).determineExitCode({ errors: 0, warnings: 10 }, false, 10)

    expect(result).toBe(0)
  })

  it('prioritizes errors over warnings (errors checked first)', () => {
    const instance = createInstance()
    // errors=1 should return 1 even if failOnWarnings would give 2
    const result = (instance as unknown as {
      determineExitCode(s: { errors: number; warnings: number }, f: boolean, m: number): number
    }).determineExitCode({ errors: 1, warnings: 5 }, true, 10)

    expect(result).toBe(1)
  })

  it('ignores maxWarnings when set to -1', () => {
    const instance = createInstance()
    const result = (instance as unknown as {
      determineExitCode(s: { errors: number; warnings: number }, f: boolean, m: number): number
    }).determineExitCode({ errors: 0, warnings: 999 }, false, -1)

    expect(result).toBe(0)
  })
})

// ─── configureLogging ───

describe('configureLogging', () => {
  it('sets DEBUG level when verbose is true', () => {
    const instance = createInstance()
    ;(instance as unknown as {
      configureLogging(v: boolean, q: boolean): void
    }).configureLogging(true, false)

    expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
  })

  it('sets SILENT level when quiet is true', () => {
    const instance = createInstance()
    ;(instance as unknown as {
      configureLogging(v: boolean, q: boolean): void
    }).configureLogging(false, true)

    expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.SILENT)
  })

  it('prioritizes verbose over quiet when both are true', () => {
    const instance = createInstance()
    ;(instance as unknown as {
      configureLogging(v: boolean, q: boolean): void
    }).configureLogging(true, true)

    expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
  })

  it('does not call setLevel when both are false', () => {
    const instance = createInstance()
    ;(instance as unknown as {
      configureLogging(v: boolean, q: boolean): void
    }).configureLogging(false, false)

    expect(logger.setLevel).not.toHaveBeenCalled()
  })
})

// ─── applyProfileOverrides ───

describe('applyProfileOverrides', () => {
  it('returns violations unchanged when profile has no overrides', () => {
    vi.mocked(getProfileSeverityOverrides).mockReturnValue({})
    const instance = createInstance()
    const violations = [makeViolation({ ruleId: 'some-rule', severity: 'warning' })]

    const result = (instance as unknown as {
      applyProfileOverrides(v: RuleViolation[], p: string): RuleViolation[]
    }).applyProfileOverrides(violations, 'strict')

    expect(result[0]!.severity).toBe('warning')
  })

  it('overrides severity for matching rule IDs', () => {
    vi.mocked(getProfileSeverityOverrides).mockReturnValue({
      'test-rule': 'error',
    })
    const instance = createInstance()
    const violations = [
      makeViolation({ ruleId: 'test-rule', severity: 'warning' }),
      makeViolation({ ruleId: 'other-rule', severity: 'info' }),
    ]

    const result = (instance as unknown as {
      applyProfileOverrides(v: RuleViolation[], p: string): RuleViolation[]
    }).applyProfileOverrides(violations, 'strict')

    expect(result[0]!.severity).toBe('error')
    expect(result[1]!.severity).toBe('info')
  })

  it('does not mutate original violation objects', () => {
    vi.mocked(getProfileSeverityOverrides).mockReturnValue({
      'test-rule': 'error',
    })
    const instance = createInstance()
    const original = makeViolation({ ruleId: 'test-rule', severity: 'warning' })

    const result = (instance as unknown as {
      applyProfileOverrides(v: RuleViolation[], p: string): RuleViolation[]
    }).applyProfileOverrides([original], 'strict')

    expect(original.severity).toBe('warning')
    expect(result[0]!.severity).toBe('error')
  })

  it('handles empty violations array', () => {
    vi.mocked(getProfileSeverityOverrides).mockReturnValue({
      'test-rule': 'error',
    })
    const instance = createInstance()
    const result = (instance as unknown as {
      applyProfileOverrides(v: RuleViolation[], p: string): RuleViolation[]
    }).applyProfileOverrides([], 'strict')

    expect(result).toHaveLength(0)
  })
})

// ─── applyProfileOverridesToFileReports ───

describe('applyProfileOverridesToFileReports', () => {
  it('returns reports unchanged when profile has no overrides', () => {
    vi.mocked(getProfileSeverityOverrides).mockReturnValue({})
    const instance = createInstance()
    const reports = [{
      filePath: 'a.ts',
      violations: [makeViolation({ ruleId: 'test-rule', severity: 'warning' })],
    }]

    const result = (instance as unknown as {
      applyProfileOverridesToFileReports(
        r: { filePath: string; violations: RuleViolation[] }[],
        p: string,
      ): { filePath: string; violations: RuleViolation[] }[]
    }).applyProfileOverridesToFileReports(reports, 'lenient')

    expect(result[0]!.violations[0]!.severity).toBe('warning')
  })

  it('overrides severity within file reports', () => {
    vi.mocked(getProfileSeverityOverrides).mockReturnValue({
      'no-console': 'error',
    })
    const instance = createInstance()
    const reports = [{
      filePath: 'a.ts',
      violations: [
        makeViolation({ ruleId: 'no-console', severity: 'warning' }),
        makeViolation({ ruleId: 'other', severity: 'info' }),
      ],
    }]

    const result = (instance as unknown as {
      applyProfileOverridesToFileReports(
        r: { filePath: string; violations: RuleViolation[] }[],
        p: string,
      ): { filePath: string; violations: RuleViolation[] }[]
    }).applyProfileOverridesToFileReports(reports, 'strict')

    expect(result[0]!.violations[0]!.severity).toBe('error')
    expect(result[0]!.violations[1]!.severity).toBe('info')
  })

  it('does not mutate original report objects', () => {
    vi.mocked(getProfileSeverityOverrides).mockReturnValue({
      'test-rule': 'info',
    })
    const instance = createInstance()
    const original = makeViolation({ ruleId: 'test-rule', severity: 'error' })
    const reports = [{ filePath: 'a.ts', violations: [original] }]

    const result = (instance as unknown as {
      applyProfileOverridesToFileReports(
        r: { filePath: string; violations: RuleViolation[] }[],
        p: string,
      ): { filePath: string; violations: RuleViolation[] }[]
    }).applyProfileOverridesToFileReports(reports, 'lenient')

    expect(original.severity).toBe('error')
    expect(result[0]!.violations[0]!.severity).toBe('info')
  })
})

// ─── readIgnoreFile ───

describe('readIgnoreFile', () => {
  it('reads and parses ignore patterns from file', async () => {
    const content = 'node_modules/**\ndist/**\n# comment\n\n*.log\n  build/**  '
    vi.mocked(readFile).mockResolvedValue(content)
    const instance = createInstance()

    const result = await (instance as unknown as {
      readIgnoreFile(p: string): Promise<string[]>
    }).readIgnoreFile('/project/.codeforgeignore')

    expect(result).toEqual(['node_modules/**', 'dist/**', '*.log', 'build/**'])
  })

  it('returns empty array when file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'))
    const instance = createInstance()

    const result = await (instance as unknown as {
      readIgnoreFile(p: string): Promise<string[]>
    }).readIgnoreFile('/project/.codeforgeignore')

    expect(result).toEqual([])
  })

  it('filters out comment lines', async () => {
    vi.mocked(readFile).mockResolvedValue('# comment 1\npattern/**\n# comment 2')
    const instance = createInstance()

    const result = await (instance as unknown as {
      readIgnoreFile(p: string): Promise<string[]>
    }).readIgnoreFile('/project/.ignore')

    expect(result).toEqual(['pattern/**'])
  })

  it('filters out empty lines', async () => {
    vi.mocked(readFile).mockResolvedValue('\n\npattern/**\n\n\nother/**\n')
    const instance = createInstance()

    const result = await (instance as unknown as {
      readIgnoreFile(p: string): Promise<string[]>
    }).readIgnoreFile('/project/.ignore')

    expect(result).toEqual(['pattern/**', 'other/**'])
  })

  it('handles file with only comments and whitespace', async () => {
    vi.mocked(readFile).mockResolvedValue('# comment\n  \n\n# another')
    const instance = createInstance()

    const result = await (instance as unknown as {
      readIgnoreFile(p: string): Promise<string[]>
    }).readIgnoreFile('/project/.ignore')

    expect(result).toEqual([])
  })
})

// ─── resolveIgnorePatterns ───

describe('resolveIgnorePatterns', () => {
  it('returns base patterns when no ignore path provided', async () => {
    const instance = createInstance()
    const base = ['node_modules/**', 'dist/**']

    const result = await (instance as unknown as {
      resolveIgnorePatterns(b: string[], p: string | undefined): Promise<string[]>
    }).resolveIgnorePatterns(base, undefined)

    expect(result).toEqual(base)
  })

  it('merges base patterns with file patterns', async () => {
    vi.mocked(readFile).mockResolvedValue('coverage/**\n*.log')
    const instance = createInstance()
    const base = ['node_modules/**']

    const result = await (instance as unknown as {
      resolveIgnorePatterns(b: string[], p: string | undefined): Promise<string[]>
    }).resolveIgnorePatterns(base, '/project/.codeforgeignore')

    expect(result).toEqual(['node_modules/**', 'coverage/**', '*.log'])
  })

  it('returns base patterns when ignore file is empty', async () => {
    vi.mocked(readFile).mockResolvedValue('')
    const instance = createInstance()
    const base = ['dist/**']

    const result = await (instance as unknown as {
      resolveIgnorePatterns(b: string[], p: string | undefined): Promise<string[]>
    }).resolveIgnorePatterns(base, '/project/.codeforgeignore')

    expect(result).toEqual(['dist/**'])
  })

  it('handles missing ignore file gracefully', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'))
    const instance = createInstance()
    const base = ['node_modules/**']

    const result = await (instance as unknown as {
      resolveIgnorePatterns(b: string[], p: string | undefined): Promise<string[]>
    }).resolveIgnorePatterns(base, '/project/.missing')

    expect(result).toEqual(['node_modules/**'])
  })
})

// ─── catch ───

describe('catch', () => {
  it('re-throws non-CLIError errors', async () => {
    const instance = createInstance()
    const error = new Error('generic error')

    await expect(
      (instance as unknown as { catch(e: Error): Promise<void> }).catch(error),
    ).rejects.toThrow('generic error')
  })

  it('handles CLIError by calling this.error', async () => {
    const instance = createInstance()
    const cliError = new CLIError('config not found', ['run codeforge init'])
    vi.spyOn(instance, 'error').mockImplementation(() => {
      throw new Error('oclif-exit')
    })

    await expect(
      (instance as unknown as { catch(e: Error): Promise<void> }).catch(cliError),
    ).rejects.toThrow('oclif-exit')

    expect(instance.error).toHaveBeenCalledWith('config not found', {
      exit: 1,
      suggestions: ['run codeforge init'],
    })
  })

  it('handles CLIError without suggestions', async () => {
    const instance = createInstance()
    const cliError = new CLIError('something wrong')
    vi.spyOn(instance, 'error').mockImplementation(() => {
      throw new Error('oclif-exit')
    })

    await expect(
      (instance as unknown as { catch(e: Error): Promise<void> }).catch(cliError),
    ).rejects.toThrow('oclif-exit')

    expect(instance.error).toHaveBeenCalledWith('something wrong', {
      exit: 1,
      suggestions: undefined,
    })
  })
})

// ─── analyzeFiles ───

describe('analyzeFiles', () => {
  it('returns violations for analyzed files', async () => {
    const mockViolations = [makeViolation()]
    const mockRegistry = {
      getEnabledRules: vi.fn().mockReturnValue([]),
      runRules: vi.fn().mockReturnValue(mockViolations),
    }
    const mockParser = {
      initialize: vi.fn(),
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: { getFilePath: vi.fn().mockReturnValue('/project/src/test.ts') },
      }),
    }
    vi.mocked(parseSuppressionsFromSourceFile).mockReturnValue({ suppressions: [] })
    vi.mocked(filterSuppressedViolations).mockImplementation((v) => v)

    const instance = createInstance()
    const result = await (instance as unknown as {
      analyzeFiles(o: {
        concurrency: number; configHash: null | string
        discoveredFiles: { absolutePath: string; path: string }[]
        parseCache: Map<string, unknown>
        parser: { parseFile: typeof mockParser.parseFile }
        registry: { runRules: typeof mockRegistry.runRules }
        resultCache: null; spinner: null; verbose: boolean
      }): Promise<{
        allViolations: RuleViolation[]; failedFiles: { error: string; filePath: string }[]
        fileReports: { filePath: string; violations: RuleViolation[] }[]
      }>
    }).analyzeFiles({
      concurrency: 2,
      configHash: null,
      discoveredFiles: [makeDiscoveredFile()],
      parseCache: new Map(),
      parser: mockParser,
      registry: mockRegistry,
      resultCache: null,
      spinner: null,
      verbose: false,
    })

    expect(result.allViolations).toHaveLength(1)
    expect(result.fileReports).toHaveLength(1)
    expect(result.failedFiles).toHaveLength(0)
  })

  it('captures failed files on parse error', async () => {
    const mockRegistry = {
      runRules: vi.fn().mockReturnValue([]),
    }
    const mockParser = {
      parseFile: vi.fn().mockRejectedValue(new Error('parse failure')),
    }

    const instance = createInstance()
    const result = await (instance as unknown as {
      analyzeFiles(o: {
        concurrency: number; configHash: null | string
        discoveredFiles: { absolutePath: string; path: string }[]
        parseCache: Map<string, unknown>
        parser: { parseFile: typeof mockParser.parseFile }
        registry: { runRules: typeof mockRegistry.runRules }
        resultCache: null; spinner: null; verbose: boolean
      }): Promise<{
        allViolations: RuleViolation[]; failedFiles: { error: string; filePath: string }[]
        fileReports: { filePath: string; violations: RuleViolation[] }[]
      }>
    }).analyzeFiles({
      concurrency: 1,
      configHash: null,
      discoveredFiles: [makeDiscoveredFile('broken.ts')],
      parseCache: new Map(),
      parser: mockParser,
      registry: mockRegistry,
      resultCache: null,
      spinner: null,
      verbose: false,
    })

    expect(result.failedFiles).toHaveLength(1)
    expect(result.failedFiles[0]!.filePath).toBe('broken.ts')
    expect(result.failedFiles[0]!.error).toBe('parse failure')
    expect(result.allViolations).toHaveLength(0)
  })

  it('skips null entries in results', async () => {
    const mockRegistry = { runRules: vi.fn().mockReturnValue([]) }
    const mockParser = {
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: { getFilePath: vi.fn() },
      }),
    }

    const instance = createInstance()
    // DiscoveredFiles with null path should produce null from the limit callback
    const discoveredFiles = [
      { absolutePath: '/project/src/a.ts', path: 'src/a.ts' },
    ]

    const result = await (instance as unknown as {
      analyzeFiles(o: {
        concurrency: number; configHash: null | string
        discoveredFiles: { absolutePath: string; path: string }[]
        parseCache: Map<string, unknown>
        parser: { parseFile: typeof mockParser.parseFile }
        registry: { runRules: typeof mockRegistry.runRules }
        resultCache: null; spinner: null; verbose: boolean
      }): Promise<{
        allViolations: RuleViolation[]; failedFiles: { error: string; filePath: string }[]
        fileReports: { filePath: string; violations: RuleViolation[] }[]
      }>
    }).analyzeFiles({
      concurrency: 1,
      configHash: null,
      discoveredFiles,
      parseCache: new Map(),
      parser: mockParser,
      registry: mockRegistry,
      resultCache: null,
      spinner: null,
      verbose: false,
    })

    expect(result.fileReports).toHaveLength(1)
  })

  it('uses result cache when available and configHash is set', async () => {
    const cachedViolations = [makeViolation({ ruleId: 'cached-rule' })]
    const mockResultCache = {
      get: vi.fn().mockResolvedValue(cachedViolations),
      set: vi.fn(),
    }
    vi.mocked(hashFile).mockResolvedValue('file-hash-123')

    const mockRegistry = { runRules: vi.fn() }
    const mockParser = { parseFile: vi.fn() }

    const instance = createInstance()
    const result = await (instance as unknown as {
      analyzeFiles(o: {
        concurrency: number; configHash: string
        discoveredFiles: { absolutePath: string; path: string }[]
        parseCache: Map<string, unknown>
        parser: { parseFile: () => Promise<unknown> }
        registry: { runRules: () => RuleViolation[] }
        resultCache: { get: typeof mockResultCache.get; set: typeof mockResultCache.set }
        spinner: null; verbose: boolean
      }): Promise<{
        allViolations: RuleViolation[]; failedFiles: { error: string; filePath: string }[]
        fileReports: { filePath: string; violations: RuleViolation[] }[]
      }>
    }).analyzeFiles({
      concurrency: 1,
      configHash: 'config-hash',
      discoveredFiles: [makeDiscoveredFile()],
      parseCache: new Map(),
      parser: mockParser,
      registry: mockRegistry,
      resultCache: mockResultCache,
      spinner: null,
      verbose: false,
    })

    // Should use cached violations, not run rules
    expect(mockRegistry.runRules).not.toHaveBeenCalled()
    expect(mockParser.parseFile).not.toHaveBeenCalled()
    expect(result.allViolations).toHaveLength(1)
    expect(result.allViolations[0]!.ruleId).toBe('cached-rule')
  })

  it('caches new results after analysis', async () => {
    const freshViolations = [makeViolation({ ruleId: 'fresh-rule' })]
    const mockResultCache = {
      get: vi.fn().mockResolvedValue(null), // cache miss
      set: vi.fn(),
    }
    vi.mocked(hashFile).mockResolvedValue('file-hash-456')
    const mockRegistry = { runRules: vi.fn().mockReturnValue(freshViolations) }
    const mockParser = {
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: { getFilePath: vi.fn() },
      }),
    }
    vi.mocked(parseSuppressionsFromSourceFile).mockReturnValue({ suppressions: [] })
    vi.mocked(filterSuppressedViolations).mockImplementation((v) => v)

    const instance = createInstance()
    await (instance as unknown as {
      analyzeFiles(o: {
        concurrency: number; configHash: string
        discoveredFiles: { absolutePath: string; path: string }[]
        parseCache: Map<string, unknown>
        parser: { parseFile: typeof mockParser.parseFile }
        registry: { runRules: typeof mockRegistry.runRules }
        resultCache: { get: typeof mockResultCache.get; set: typeof mockResultCache.set }
        spinner: null; verbose: boolean
      }): Promise<unknown>
    }).analyzeFiles({
      concurrency: 1,
      configHash: 'config-hash',
      discoveredFiles: [makeDiscoveredFile()],
      parseCache: new Map(),
      parser: mockParser,
      registry: mockRegistry,
      resultCache: mockResultCache,
      spinner: null,
      verbose: false,
    })

    expect(mockResultCache.set).toHaveBeenCalledWith(
      '/project/src/test.ts',
      'file-hash-456',
      'config-hash',
      freshViolations,
    )
  })
})

// ─── collectFiles ───

describe('collectFiles', () => {
  it('returns single file when target is a file', async () => {
    vi.mocked(statSync).mockReturnValue({ isFile: () => true } as ReturnType<typeof statSync>)
    vi.mocked(filterFilesByExtension).mockImplementation((files) => files)
    const instance = createInstance()

    const result = await (instance as unknown as {
      collectFiles(o: {
        changedMode: string | undefined; cwd: string; ext: string
        files: string[]; ignore: string[]; quiet: boolean; stagedMode: boolean
      }): Promise<{ absolutePath: string; path: string }[]>
    }).collectFiles({
      changedMode: undefined,
      cwd: '/project/src/single.ts',
      ext: '',
      files: [],
      ignore: [],
      quiet: true,
      stagedMode: false,
    })

    expect(result).toHaveLength(1)
    expect(result[0]!.absolutePath).toBe('/project/src/single.ts')
  })

  it('discovers files when target is a directory', async () => {
    vi.mocked(statSync).mockReturnValue({ isFile: () => false } as ReturnType<typeof statSync>)
    const discovered = [makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')]
    vi.mocked(resolveTargetFiles).mockResolvedValue({ files: discovered })
    vi.mocked(filterFilesByExtension).mockImplementation((files) => files)
    const instance = createInstance()

    const result = await (instance as unknown as {
      collectFiles(o: {
        changedMode: string | undefined; cwd: string; ext: string
        files: string[]; ignore: string[]; quiet: boolean; stagedMode: boolean
      }): Promise<{ absolutePath: string; path: string }[]>
    }).collectFiles({
      changedMode: undefined,
      cwd: '/project/src',
      ext: '',
      files: [],
      ignore: [],
      quiet: true,
      stagedMode: false,
    })

    expect(result).toHaveLength(2)
  })

  it('filters files by extension', async () => {
    vi.mocked(statSync).mockReturnValue({ isFile: () => false } as ReturnType<typeof statSync>)
    const allFiles = [makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.js')]
    vi.mocked(resolveTargetFiles).mockResolvedValue({ files: allFiles })
    vi.mocked(filterFilesByExtension).mockImplementation((files) =>
      files.filter((f: { path: string }) => f.path.endsWith('.ts')),
    )
    const instance = createInstance()

    const result = await (instance as unknown as {
      collectFiles(o: {
        changedMode: string | undefined; cwd: string; ext: string
        files: string[]; ignore: string[]; quiet: boolean; stagedMode: boolean
      }): Promise<{ absolutePath: string; path: string }[]>
    }).collectFiles({
      changedMode: undefined,
      cwd: '/project/src',
      ext: '.ts',
      files: [],
      ignore: [],
      quiet: true,
      stagedMode: false,
    })

    expect(result).toHaveLength(1)
    expect(result[0]!.path).toBe('a.ts')
  })

  it('returns empty array when no files found', async () => {
    vi.mocked(statSync).mockReturnValue({ isFile: () => false } as ReturnType<typeof statSync>)
    vi.mocked(resolveTargetFiles).mockResolvedValue({ files: [] })
    vi.mocked(filterFilesByExtension).mockImplementation((files) => files)
    const instance = createInstance()

    const result = await (instance as unknown as {
      collectFiles(o: {
        changedMode: string | undefined; cwd: string; ext: string
        files: string[]; ignore: string[]; quiet: boolean; stagedMode: boolean
      }): Promise<{ absolutePath: string; path: string }[]>
    }).collectFiles({
      changedMode: undefined,
      cwd: '/project/empty',
      ext: '',
      files: [],
      ignore: [],
      quiet: true,
      stagedMode: false,
    })

    expect(result).toHaveLength(0)
  })
})

// ─── discoverFiles ───

describe('discoverFiles', () => {
  it('returns files from resolveTargetFiles', async () => {
    const files = [makeDiscoveredFile('a.ts')]
    vi.mocked(resolveTargetFiles).mockResolvedValue({ files })
    const instance = createInstance()

    const result = await (instance as unknown as {
      discoverFiles(o: {
        changedMode: string | undefined; cwd: string; files: string[]
        ignore: string[]; spinner: null; stagedMode: boolean
      }): Promise<{ absolutePath: string; path: string }[]>
    }).discoverFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })

    expect(result).toEqual(files)
  })

  it('calls this.error when resolveTargetFiles returns an error', async () => {
    vi.mocked(resolveTargetFiles).mockResolvedValue({
      error: 'Not a git repository',
      files: [],
    })
    vi.spyOn(
      createInstance() as unknown as { error(m: string, o: { exit: number }): never },
      'error',
    ).mockImplementation(() => {
      throw new Error('oclif-error')
    })

    const instance = createInstance()
    vi.spyOn(instance as unknown as { error(m: string, o: { exit: number }): never }, 'error')
      .mockImplementation(() => {
        throw new Error('oclif-error')
      })

    await expect(
      (instance as unknown as {
        discoverFiles(o: {
          changedMode: string | undefined; cwd: string; files: string[]
          ignore: string[]; spinner: null; stagedMode: boolean
        }): Promise<{ absolutePath: string; path: string }[]>
      }).discoverFiles({
        changedMode: undefined,
        cwd: '/project',
        files: [],
        ignore: [],
        spinner: null,
        stagedMode: true,
      }),
    ).rejects.toThrow('oclif-error')
  })
})

// ─── getRulesWithFixes ───

describe('getRulesWithFixes', () => {
  it('returns empty map when no rules have fixes', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'no-console': { meta: { name: 'no-console' } },
    })
    const instance = createInstance()

    const result = await (instance as unknown as {
      getRulesWithFixes(): Promise<Map<string, unknown>>
    }).getRulesWithFixes()

    expect(result.size).toBe(0)
  })

  it('includes rules that have a fix function', async () => {
    const fixFn = vi.fn()
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'prefer-const': { meta: { name: 'prefer-const' }, fix: fixFn },
      'no-console': { meta: { name: 'no-console' } },
    })
    const instance = createInstance()

    const result = await (instance as unknown as {
      getRulesWithFixes(): Promise<Map<string, { fix: typeof fixFn; id: string; priority: number }>>
    }).getRulesWithFixes()

    expect(result.size).toBe(1)
    expect(result.has('prefer-const')).toBe(true)
    const entry = result.get('prefer-const')!
    expect(entry.id).toBe('prefer-const')
    expect(entry.priority).toBe(10)
  })

  it('ignores rules where fix is not a function', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'bad-rule': { meta: { name: 'bad-rule' }, fix: 'not-a-function' },
    })
    const instance = createInstance()

    const result = await (instance as unknown as {
      getRulesWithFixes(): Promise<Map<string, unknown>>
    }).getRulesWithFixes()

    expect(result.size).toBe(0)
  })
})

// ─── applyFixes ───

describe('applyFixes', () => {
  it('groups violations by file and applies fixes', async () => {
    const mockReport = {
      changes: [{ start: 0, end: 5, newText: 'const' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    }
    vi.mocked(applyFixesToFile).mockReturnValue(mockReport)
    const mockParser = {
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: { getFilePath: vi.fn(), saveSync: vi.fn() },
      }),
    }

    const instance = createInstance()
    const violations = [makeViolation({ filePath: 'src/test.ts' })]
    const rulesWithFixes = new Map()
    const parseCache = new Map()
    parseCache.set('/project/src/test.ts', {
      sourceFile: { getFilePath: vi.fn(), saveSync: vi.fn() },
    })

    const result = await (instance as unknown as {
      applyFixes(o: {
        allViolations: RuleViolation[]; concurrency: number
        discoveredFiles: { absolutePath: string; path: string }[]
        dryRun: boolean
        parseCache: Map<string, unknown>
        parser: { parseFile: typeof mockParser.parseFile }
        rulesWithFixes: Map<string, unknown>
        verbose: boolean
      }): Promise<{ fixesApplied: number; fixesSkipped: number }>
    }).applyFixes({
      allViolations: violations,
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile()],
      dryRun: false,
      parseCache,
      parser: mockParser,
      rulesWithFixes,
      verbose: false,
    })

    expect(result.fixesApplied).toBe(1)
    expect(result.fixesSkipped).toBe(0)
  })

  it('skips files with no violations', async () => {
    const instance = createInstance()
    const result = await (instance as unknown as {
      applyFixes(o: {
        allViolations: RuleViolation[]; concurrency: number
        discoveredFiles: { absolutePath: string; path: string }[]
        dryRun: boolean
        parseCache: Map<string, unknown>
        parser: unknown
        rulesWithFixes: Map<string, unknown>
        verbose: boolean
      }): Promise<{ fixesApplied: number; fixesSkipped: number }>
    }).applyFixes({
      allViolations: [makeViolation({ filePath: 'other.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('clean.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: { parseFile: vi.fn() },
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  it('returns zeros when fix throws an error', async () => {
    vi.mocked(applyFixesToFile).mockImplementation(() => {
      throw new Error('fix failure')
    })
    const mockSourceFile = { getFilePath: vi.fn(), saveSync: vi.fn() }
    const parseCache = new Map()
    parseCache.set('/project/src/test.ts', { sourceFile: mockSourceFile })

    const instance = createInstance()
    const result = await (instance as unknown as {
      applyFixes(o: {
        allViolations: RuleViolation[]; concurrency: number
        discoveredFiles: { absolutePath: string; path: string }[]
        dryRun: boolean
        parseCache: Map<string, unknown>
        parser: unknown
        rulesWithFixes: Map<string, unknown>
        verbose: boolean
      }): Promise<{ fixesApplied: number; fixesSkipped: number }>
    }).applyFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile()],
      dryRun: false,
      parseCache,
      parser: { parseFile: vi.fn() },
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  it('parses file when not in cache', async () => {
    const mockSourceFile = { getFilePath: vi.fn(), saveSync: vi.fn() }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 0,
      fixesSkipped: 0,
    })
    const mockParser = {
      parseFile: vi.fn().mockResolvedValue({ sourceFile: mockSourceFile }),
    }

    const instance = createInstance()
    await (instance as unknown as {
      applyFixes(o: {
        allViolations: RuleViolation[]; concurrency: number
        discoveredFiles: { absolutePath: string; path: string }[]
        dryRun: boolean
        parseCache: Map<string, unknown>
        parser: { parseFile: typeof mockParser.parseFile }
        rulesWithFixes: Map<string, unknown>
        verbose: boolean
      }): Promise<{ fixesApplied: number; fixesSkipped: number }>
    }).applyFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile()],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).toHaveBeenCalledWith('/project/src/test.ts')
  })

  it('does not call saveSync in dry-run mode', async () => {
    const saveSync = vi.fn()
    const mockSourceFile = { getFilePath: vi.fn(), saveSync }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ start: 0, end: 5, newText: 'const' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })
    const parseCache = new Map()
    parseCache.set('/project/src/test.ts', { sourceFile: mockSourceFile })

    const instance = createInstance()
    await (instance as unknown as {
      applyFixes(o: {
        allViolations: RuleViolation[]; concurrency: number
        discoveredFiles: { absolutePath: string; path: string }[]
        dryRun: boolean
        parseCache: Map<string, unknown>
        parser: unknown
        rulesWithFixes: Map<string, unknown>
        verbose: boolean
      }): Promise<{ fixesApplied: number; fixesSkipped: number }>
    }).applyFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile()],
      dryRun: true,
      parseCache,
      parser: { parseFile: vi.fn() },
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(saveSync).not.toHaveBeenCalled()
  })

  it('calls saveSync when not dry-run and there are changes', async () => {
    const saveSync = vi.fn()
    const mockSourceFile = { getFilePath: vi.fn(), saveSync }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ start: 0, end: 5, newText: 'const' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })
    const parseCache = new Map()
    parseCache.set('/project/src/test.ts', { sourceFile: mockSourceFile })

    const instance = createInstance()
    await (instance as unknown as {
      applyFixes(o: {
        allViolations: RuleViolation[]; concurrency: number
        discoveredFiles: { absolutePath: string; path: string }[]
        dryRun: boolean
        parseCache: Map<string, unknown>
        parser: unknown
        rulesWithFixes: Map<string, unknown>
        verbose: boolean
      }): Promise<{ fixesApplied: number; fixesSkipped: number }>
    }).applyFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile()],
      dryRun: false,
      parseCache,
      parser: { parseFile: vi.fn() },
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(saveSync).toHaveBeenCalled()
  })
})

// ─── runFixes ───

describe('runFixes', () => {
  it('returns early when no violations', async () => {
    const instance = createInstance()
    const result = await (instance as unknown as {
      runFixes(o: {
        allViolations: RuleViolation[]; concurrency: number
        discoveredFiles: { absolutePath: string; path: string }[]
        dryRun: boolean
        parseCache: Map<string, unknown>
        parser: unknown; quiet: boolean; verbose: boolean
      }): Promise<{ fixesApplied: number; fixesSkipped: number }>
    }).runFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {},
      quiet: true,
      verbose: false,
    })

    expect(result).toEqual({ fixesApplied: 0, fixesSkipped: 0 })
  })

  it('delegates to applyFixesToFiles', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({})
    vi.mocked(applyFixesToFiles).mockResolvedValue({
      fixesApplied: 5,
      fixesSkipped: 2,
    })

    const instance = createInstance()
    const violations = [makeViolation()]
    const mockParser = { parseFile: vi.fn() }

    const result = await (instance as unknown as {
      runFixes(o: {
        allViolations: RuleViolation[]; concurrency: number
        discoveredFiles: { absolutePath: string; path: string }[]
        dryRun: boolean
        parseCache: Map<string, unknown>
        parser: { parseFile: () => Promise<unknown> }
        quiet: boolean; verbose: boolean
      }): Promise<{ fixesApplied: number; fixesSkipped: number }>
    }).runFixes({
      allViolations: violations,
      concurrency: 2,
      discoveredFiles: [makeDiscoveredFile()],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      verbose: false,
    })

    expect(applyFixesToFiles).toHaveBeenCalled()
    expect(result.fixesApplied).toBe(5)
    expect(result.fixesSkipped).toBe(2)
  })
})

// ─── run (integration-style with mocked deps) ───

describe('run', () => {
  it('exits with 0 when path is valid and no violations found', async () => {
    const instance = createInstance()
    vi.spyOn(instance as unknown as { parse(): Promise<unknown> }, 'parse')
      .mockResolvedValue({
        args: { path: '.' },
        flags: {
          'cache-results': true,
          changed: undefined,
          ci: false,
          color: true,
          concurrency: 4,
          config: undefined,
          'dry-run': false,
          ext: '',
          'fail-on-warnings': false,
          files: undefined,
          fix: false,
          format: 'console',
          ignore: undefined,
          'ignore-path': undefined,
          'max-warnings': -1,
          output: undefined,
          profile: undefined,
          quiet: false,
          rules: undefined,
          'severity-level': 'info',
          staged: false,
          verbose: false,
        },
      })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(loadCommandConfig).mockResolvedValue({})
    vi.mocked(normalizeFlags).mockReturnValue({
      cacheResults: true,
      changedMode: undefined,
      ciMode: false,
      concurrency: 4,
      dryRun: false,
      failOnWarnings: false,
      format: 'console',
      maxWarnings: -1,
      output: undefined,
      quiet: true,
      shouldFix: false,
      stagedMode: false,
      verbose: false,
    })
    vi.mocked(statSync).mockReturnValue({ isFile: () => false } as ReturnType<typeof statSync>)
    vi.mocked(resolveTargetFiles).mockResolvedValue({ files: [makeDiscoveredFile()] })
    vi.mocked(filterFilesByExtension).mockImplementation((files) => files)
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      getEnabledRules: vi.fn().mockReturnValue([]),
      runRules: vi.fn().mockReturnValue([]),
    })
    vi.mocked(parseSuppressionsFromSourceFile).mockReturnValue({ suppressions: [] })
    vi.mocked(filterSuppressedViolations).mockImplementation((v) => v)

    vi.spyOn(instance as unknown as { exit(c: number): never }, 'exit')
      .mockImplementation(() => {
        throw new Error(`exit:0`)
      })

    await expect(
      (instance as unknown as { run(): Promise<void> }).run(),
    ).rejects.toThrow('exit:0')
  })

  it('exits with error when path does not exist', async () => {
    const instance = createInstance()
    vi.spyOn(instance as unknown as { parse(): Promise<unknown> }, 'parse')
      .mockResolvedValue({
        args: { path: 'nonexistent' },
        flags: {
          'cache-results': true,
          changed: undefined,
          ci: false,
          color: true,
          concurrency: 4,
          config: undefined,
          'dry-run': false,
          ext: '',
          'fail-on-warnings': false,
          files: undefined,
          fix: false,
          format: 'console',
          ignore: undefined,
          'ignore-path': undefined,
          'max-warnings': -1,
          output: undefined,
          profile: undefined,
          quiet: false,
          rules: undefined,
          'severity-level': 'info',
          staged: false,
          verbose: false,
        },
      })
    vi.mocked(existsSync).mockReturnValue(false)
    vi.mocked(normalizeFlags).mockReturnValue({
      cacheResults: true,
      changedMode: undefined,
      ciMode: false,
      concurrency: 4,
      dryRun: false,
      failOnWarnings: false,
      format: 'console',
      maxWarnings: -1,
      output: undefined,
      quiet: true,
      shouldFix: false,
      stagedMode: false,
      verbose: false,
    })

    vi.spyOn(instance as unknown as { error(m: string, o: { exit: number }): never }, 'error')
      .mockImplementation((_msg: string, opts: { exit: number }) => {
        throw new Error(`error:${opts.exit}`)
      })

    await expect(
      (instance as unknown as { run(): Promise<void> }).run(),
    ).rejects.toThrow('error:1')
  })

  it('exits with 0 when no files discovered', async () => {
    const instance = createInstance()
    vi.spyOn(instance as unknown as { parse(): Promise<unknown> }, 'parse')
      .mockResolvedValue({
        args: { path: '.' },
        flags: {
          'cache-results': true,
          changed: undefined,
          ci: false,
          color: true,
          concurrency: 4,
          config: undefined,
          'dry-run': false,
          ext: '',
          'fail-on-warnings': false,
          files: undefined,
          fix: false,
          format: 'console',
          ignore: undefined,
          'ignore-path': undefined,
          'max-warnings': -1,
          output: undefined,
          profile: undefined,
          quiet: false,
          rules: undefined,
          'severity-level': 'info',
          staged: false,
          verbose: false,
        },
      })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(loadCommandConfig).mockResolvedValue({})
    vi.mocked(normalizeFlags).mockReturnValue({
      cacheResults: true,
      changedMode: undefined,
      ciMode: false,
      concurrency: 4,
      dryRun: false,
      failOnWarnings: false,
      format: 'console',
      maxWarnings: -1,
      output: undefined,
      quiet: true,
      shouldFix: false,
      stagedMode: false,
      verbose: false,
    })
    vi.mocked(statSync).mockReturnValue({ isFile: () => false } as ReturnType<typeof statSync>)
    vi.mocked(resolveTargetFiles).mockResolvedValue({ files: [] })
    vi.mocked(filterFilesByExtension).mockImplementation((files) => files)

    vi.spyOn(instance as unknown as { exit(c: number): never }, 'exit')
      .mockImplementation((code: number) => {
        throw new Error(`exit:${code}`)
      })

    await expect(
      (instance as unknown as { run(): Promise<void> }).run(),
    ).rejects.toThrow('exit:0')
  })

  it('calls saveBaselineReport when baseline is "save"', async () => {
    const instance = createInstance()
    vi.spyOn(instance as unknown as { parse(): Promise<unknown> }, 'parse')
      .mockResolvedValue({
        args: { path: '.' },
        flags: {
          baseline: 'save',
          'cache-results': true,
          changed: undefined,
          ci: false,
          color: true,
          concurrency: 4,
          config: undefined,
          'dry-run': false,
          ext: '',
          'fail-on-warnings': false,
          files: undefined,
          fix: false,
          format: 'console',
          ignore: undefined,
          'ignore-path': undefined,
          'max-warnings': -1,
          output: undefined,
          profile: undefined,
          quiet: false,
          rules: undefined,
          'severity-level': 'info',
          staged: false,
          verbose: false,
        },
      })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(loadCommandConfig).mockResolvedValue({})
    vi.mocked(normalizeFlags).mockReturnValue({
      cacheResults: true,
      changedMode: undefined,
      ciMode: false,
      concurrency: 4,
      dryRun: false,
      failOnWarnings: false,
      format: 'console',
      maxWarnings: -1,
      output: undefined,
      quiet: true,
      shouldFix: false,
      stagedMode: false,
      verbose: false,
    })
    vi.mocked(statSync).mockReturnValue({ isFile: () => false } as ReturnType<typeof statSync>)
    vi.mocked(resolveTargetFiles).mockResolvedValue({ files: [makeDiscoveredFile()] })
    vi.mocked(filterFilesByExtension).mockImplementation((files) => files)
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      getEnabledRules: vi.fn().mockReturnValue([]),
      runRules: vi.fn().mockReturnValue([]),
    })
    vi.mocked(parseSuppressionsFromSourceFile).mockReturnValue({ suppressions: [] })
    vi.mocked(filterSuppressedViolations).mockImplementation((v) => v)
    vi.mocked(saveBaselineReport).mockResolvedValue({
      messages: ['Baseline saved'],
      path: '/tmp/baseline.json',
    })

    const logMessages: string[] = []
    vi.spyOn(instance as unknown as { log(m: string): void }, 'log')
      .mockImplementation((msg: string) => { logMessages.push(msg) })

    vi.spyOn(instance as unknown as { exit(c: number): never }, 'exit')
      .mockImplementation(() => {
        throw new Error('exit:0')
      })

    await expect(
      (instance as unknown as { run(): Promise<void> }).run(),
    ).rejects.toThrow('exit:0')

    expect(saveBaselineReport).toHaveBeenCalled()
    expect(logMessages).toContain('Baseline saved')
  })

  it('exits with code from baseline compare when violations regressed', async () => {
    const instance = createInstance()
    vi.spyOn(instance as unknown as { parse(): Promise<unknown> }, 'parse')
      .mockResolvedValue({
        args: { path: '.' },
        flags: {
          baseline: 'compare',
          'cache-results': true,
          changed: undefined,
          ci: false,
          color: true,
          concurrency: 4,
          config: undefined,
          'dry-run': false,
          ext: '',
          'fail-on-warnings': false,
          files: undefined,
          fix: false,
          format: 'console',
          ignore: undefined,
          'ignore-path': undefined,
          'max-warnings': -1,
          output: undefined,
          profile: undefined,
          quiet: false,
          rules: undefined,
          'severity-level': 'info',
          staged: false,
          verbose: false,
        },
      })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(loadCommandConfig).mockResolvedValue({})
    vi.mocked(normalizeFlags).mockReturnValue({
      cacheResults: true,
      changedMode: undefined,
      ciMode: false,
      concurrency: 4,
      dryRun: false,
      failOnWarnings: false,
      format: 'console',
      maxWarnings: -1,
      output: undefined,
      quiet: true,
      shouldFix: false,
      stagedMode: false,
      verbose: false,
    })
    vi.mocked(statSync).mockReturnValue({ isFile: () => false } as ReturnType<typeof statSync>)
    vi.mocked(resolveTargetFiles).mockResolvedValue({ files: [makeDiscoveredFile()] })
    vi.mocked(filterFilesByExtension).mockImplementation((files) => files)
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      getEnabledRules: vi.fn().mockReturnValue([]),
      runRules: vi.fn().mockReturnValue([]),
    })
    vi.mocked(parseSuppressionsFromSourceFile).mockReturnValue({ suppressions: [] })
    vi.mocked(filterSuppressedViolations).mockImplementation((v) => v)
    vi.mocked(compareWithBaselineReport).mockResolvedValue({
      exitCode: 1,
      messages: ['Regressions found'],
      noBaseline: false,
    })

    vi.spyOn(instance as unknown as { exit(c: number): never }, 'exit')
      .mockImplementation(() => {
        throw new Error('exit:1')
      })

    await expect(
      (instance as unknown as { run(): Promise<void> }).run(),
    ).rejects.toThrow('exit:1')

    expect(compareWithBaselineReport).toHaveBeenCalled()
  })

  it('exits with code 1 when no baseline exists for compare', async () => {
    const instance = createInstance()
    vi.spyOn(instance as unknown as { parse(): Promise<unknown> }, 'parse')
      .mockResolvedValue({
        args: { path: '.' },
        flags: {
          baseline: 'compare',
          'cache-results': true,
          changed: undefined,
          ci: false,
          color: true,
          concurrency: 4,
          config: undefined,
          'dry-run': false,
          ext: '',
          'fail-on-warnings': false,
          files: undefined,
          fix: false,
          format: 'console',
          ignore: undefined,
          'ignore-path': undefined,
          'max-warnings': -1,
          output: undefined,
          profile: undefined,
          quiet: false,
          rules: undefined,
          'severity-level': 'info',
          staged: false,
          verbose: false,
        },
      })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(loadCommandConfig).mockResolvedValue({})
    vi.mocked(normalizeFlags).mockReturnValue({
      cacheResults: true,
      changedMode: undefined,
      ciMode: false,
      concurrency: 4,
      dryRun: false,
      failOnWarnings: false,
      format: 'console',
      maxWarnings: -1,
      output: undefined,
      quiet: true,
      shouldFix: false,
      stagedMode: false,
      verbose: false,
    })
    vi.mocked(statSync).mockReturnValue({ isFile: () => false } as ReturnType<typeof statSync>)
    vi.mocked(resolveTargetFiles).mockResolvedValue({ files: [makeDiscoveredFile()] })
    vi.mocked(filterFilesByExtension).mockImplementation((files) => files)
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      getEnabledRules: vi.fn().mockReturnValue([]),
      runRules: vi.fn().mockReturnValue([]),
    })
    vi.mocked(parseSuppressionsFromSourceFile).mockReturnValue({ suppressions: [] })
    vi.mocked(filterSuppressedViolations).mockImplementation((v) => v)
    vi.mocked(compareWithBaselineReport).mockResolvedValue({
      exitCode: 1,
      messages: ['No baseline file found'],
      noBaseline: true,
    })

    vi.spyOn(instance as unknown as { exit(c: number): never }, 'exit')
      .mockImplementation(() => {
        throw new Error('exit:1')
      })

    await expect(
      (instance as unknown as { run(): Promise<void> }).run(),
    ).rejects.toThrow('exit:1')
  })
})
