import { describe, expect, it, vi } from 'vitest'

// ─── Top-level mocks ───

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:path', () => ({
  resolve: vi.fn((p: string) => `/resolved${p.startsWith('/') ? '' : '/'}${p.replace(/^\.\//, '')}`),
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/utils/command-helpers.js', () => ({
  setupRuleRegistryLazy: vi.fn().mockResolvedValue({
    runRulesBatched: vi.fn().mockReturnValue([]),
  }),
}))

vi.mock('../../src/core/parser.js', () => {
  function Parser(this: unknown) {}
  Parser.prototype.initialize = vi.fn().mockResolvedValue(undefined)
  Parser.prototype.dispose = vi.fn()
  Parser.prototype.parseFile = vi.fn().mockResolvedValue({
    parseTime: 10,
    sourceFile: {},
  })
  Parser.prototype.releaseFile = vi.fn()
  return { Parser }
})

vi.mock('ora', () => {
  return {
    default: () => ({
      start: () => ({ succeed: vi.fn(), text: '' }),
    }),
  }
})

vi.mock('p-limit', () => {
  return {
    default: () => (fn: () => Promise<unknown>) => fn(),
  }
})

vi.mock('../../src/utils/constants.js', () => ({
  DEFAULT_FILE_PATTERNS: ['**/*.ts'],
}))

vi.mock('../../src/utils/errors.js', () => ({
  CLIError: {
    invalidInput: (msg: string) => new Error(msg),
  },
}))

// ─── runAnalysisPipeline: path validation ───

describe('runAnalysisPipeline: path validation', () => {
  it('throws when path does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    await expect(runAnalysisPipeline('/nonexistent/path', 4)).rejects.toThrow(
      'Path not found',
    )

    vi.mocked(existsSync).mockReturnValue(true)
  })

  it('resolves path using node:path resolve', async () => {
    const { resolve } = await import('node:path')
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    await expect(runAnalysisPipeline('./src', 4)).rejects.toThrow()
    expect(resolve).toHaveBeenCalledWith('./src')

    vi.mocked(existsSync).mockReturnValue(true)
  })
})

// ─── runAnalysisPipeline: file processing ───

describe('runAnalysisPipeline: file processing', () => {
  beforeEach(async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
  })

  it('calls log callback with analyzing message', async () => {
    const logMessages: string[] = []
    const logFn = (msg: string) => logMessages.push(msg)

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    await runAnalysisPipeline('/some/path', 4, { log: logFn })
    expect(logMessages.length).toBeGreaterThan(0)
    expect(logMessages[0]).toContain('Analyzing')
  })

  it('returns empty results when no files discovered', async () => {
    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(result.files).toEqual([])
    expect(result.summary.totalFiles).toBe(0)
    expect(result.summary.errorCount).toBe(0)
    expect(result.summary.warningCount).toBe(0)
    expect(result.summary.infoCount).toBe(0)
  })

  it('returns default version "unknown" when version not provided', async () => {
    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(result.version).toBe('unknown')
  })

  it('uses provided version string', async () => {
    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4, { version: '2.0.0' })
    expect(result.version).toBe('2.0.0')
  })

  it('sets timestamp as ISO string', async () => {
    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(typeof result.timestamp).toBe('string')
    expect(() => new Date(result.timestamp)).not.toThrow()
  })

  it('passes correct ignore patterns to discoverFiles', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    await runAnalysisPipeline('/some/path', 4)
    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
      }),
    )
  })

  it('passes cwd as absolute path to discoverFiles', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    await runAnalysisPipeline('/my/project', 4)
    expect(discoverFiles).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cwd: '/resolved/my/project',
      }),
    )
  })

  it('computes totalTime as positive duration', async () => {
    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(result.summary.totalTime).toBeGreaterThanOrEqual(0)
  })
})

// ─── runAnalysisPipeline: with discovered files ───

describe('runAnalysisPipeline: with discovered files', () => {
  beforeEach(async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
  })

  it('filters out null results from failed file processing', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { setupRuleRegistryLazy } = await import('../../src/utils/command-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const mockViolation = {
      message: 'error msg',
      range: {
        end: { column: 10, line: 1 },
        start: { column: 1, line: 1 },
      },
      ruleId: 'test-rule',
      severity: 'error' as const,
    }

    let callCount = 0
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/a.ts', path: 'a.ts' },
      { absolutePath: '/b.ts', path: 'b.ts' },
    ])
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      runRulesBatched: vi.fn().mockReturnValue([mockViolation]),
    })
    Parser.prototype.parseFile = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({ parseTime: 10, sourceFile: {} })
      }
      return Promise.reject(new Error('parse error'))
    })

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(result.files.length).toBe(1)
    expect(result.summary.totalFiles).toBe(1)

    vi.mocked(discoverFiles).mockResolvedValue([])
  })

  it('maps violations to reporter Violation format', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { setupRuleRegistryLazy } = await import('../../src/utils/command-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const rawViolation = {
      message: 'something bad',
      range: {
        end: { column: 20, line: 5 },
        start: { column: 3, line: 2 },
      },
      ruleId: 'no-evil',
      severity: 'warning' as const,
      suggestion: 'Fix it',
    }

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/a.ts', path: 'a.ts' },
    ])
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      runRulesBatched: vi.fn().mockReturnValue([rawViolation]),
    })
    Parser.prototype.parseFile = vi.fn().mockResolvedValue({
      parseTime: 10,
      sourceFile: {},
    })

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(result.files[0].violations).toHaveLength(1)
    const v = result.files[0].violations[0]
    expect(v.line).toBe(2)
    expect(v.column).toBe(3)
    expect(v.endLine).toBe(5)
    expect(v.endColumn).toBe(20)
    expect(v.filePath).toBe('a.ts')
    expect(v.message).toBe('something bad')
    expect(v.ruleId).toBe('no-evil')
    expect(v.severity).toBe('warning')
    expect(v.suggestion).toBe('Fix it')

    vi.mocked(discoverFiles).mockResolvedValue([])
  })

  it('counts severity correctly in summary', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { setupRuleRegistryLazy } = await import('../../src/utils/command-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const violations = [
      {
        message: 'e1',
        range: { end: { column: 1, line: 1 }, start: { column: 1, line: 1 } },
        ruleId: 'r1',
        severity: 'error' as const,
      },
      {
        message: 'w1',
        range: { end: { column: 1, line: 1 }, start: { column: 1, line: 1 } },
        ruleId: 'r2',
        severity: 'warning' as const,
      },
      {
        message: 'i1',
        range: { end: { column: 1, line: 1 }, start: { column: 1, line: 1 } },
        ruleId: 'r3',
        severity: 'info' as const,
      },
    ]

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/a.ts', path: 'a.ts' },
    ])
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      runRulesBatched: vi.fn().mockReturnValue(violations),
    })
    Parser.prototype.parseFile = vi.fn().mockResolvedValue({
      parseTime: 10,
      sourceFile: {},
    })

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(result.summary.errorCount).toBe(1)
    expect(result.summary.warningCount).toBe(1)
    expect(result.summary.infoCount).toBe(1)
    expect(result.summary.filesWithViolations).toBe(1)

    vi.mocked(discoverFiles).mockResolvedValue([])
  })

  it('includes parseTime in file stats', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { setupRuleRegistryLazy } = await import('../../src/utils/command-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/a.ts', path: 'a.ts' },
    ])
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      runRulesBatched: vi.fn().mockReturnValue([]),
    })
    Parser.prototype.parseFile = vi.fn().mockResolvedValue({
      parseTime: 42,
      sourceFile: {},
    })

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(result.files[0].stats.parseTime).toBe(42)

    vi.mocked(discoverFiles).mockResolvedValue([])
  })

  it('skips null/undefined file entries', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { setupRuleRegistryLazy } = await import('../../src/utils/command-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    vi.mocked(discoverFiles).mockResolvedValue([
      null,
      { absolutePath: '/b.ts', path: 'b.ts' },
      undefined,
    ])
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      runRulesBatched: vi.fn().mockReturnValue([]),
    })
    Parser.prototype.parseFile = vi.fn().mockResolvedValue({
      parseTime: 5,
      sourceFile: {},
    })

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(result.summary.totalFiles).toBe(1)

    vi.mocked(discoverFiles).mockResolvedValue([])
  })

  it('handles files with zero violations correctly', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { setupRuleRegistryLazy } = await import('../../src/utils/command-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/a.ts', path: 'a.ts' },
    ])
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      runRulesBatched: vi.fn().mockReturnValue([]),
    })
    Parser.prototype.parseFile = vi.fn().mockResolvedValue({
      parseTime: 5,
      sourceFile: {},
    })

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(result.files[0].violations).toEqual([])
    expect(result.summary.filesWithViolations).toBe(0)

    vi.mocked(discoverFiles).mockResolvedValue([])
  })

  it('returns suggestion as undefined when not present in violation', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { setupRuleRegistryLazy } = await import('../../src/utils/command-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const rawViolation = {
      message: 'test',
      range: {
        end: { column: 5, line: 1 },
        start: { column: 1, line: 1 },
      },
      ruleId: 'r1',
      severity: 'info' as const,
    }

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/a.ts', path: 'a.ts' },
    ])
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      runRulesBatched: vi.fn().mockReturnValue([rawViolation]),
    })
    Parser.prototype.parseFile = vi.fn().mockResolvedValue({
      parseTime: 5,
      sourceFile: {},
    })

    const { runAnalysisPipeline } = await import(
      '../../src/commands/report-analysis-helpers.js'
    )

    const result = await runAnalysisPipeline('/some/path', 4)
    expect(result.files[0].violations[0].suggestion).toBeUndefined()

    vi.mocked(discoverFiles).mockResolvedValue([])
  })
})
