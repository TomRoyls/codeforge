import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AnalysisResult } from '../../src/reporters/types.js'

import Report from '../../src/commands/report.js'

// ─── Top-level mocks ───

const { mockReadAnalysisFile, mockParseFile, mockRunRules, mockExecAsync } = vi.hoisted(() => ({
  mockReadAnalysisFile: vi.fn(),
  mockParseFile: vi.fn().mockResolvedValue({ parseTime: 0, sourceFile: {} }),
  mockRunRules: vi.fn().mockReturnValue([]),
  mockExecAsync: vi.fn().mockResolvedValue({ stdout: '', stderr: '' }),
}))

vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:os', () => ({
  default: {
    cpus: () => [{ length: 4 }],
  },
}))

vi.mock('node:util', () => ({
  promisify: () => mockExecAsync,
}))

vi.mock('ora', () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    text: '',
  }),
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: class {
    initialize = vi.fn().mockResolvedValue(undefined)
    parseFile = mockParseFile
    dispose = vi.fn()
  },
}))

vi.mock('../../src/core/rule-registry.js', () => ({
  RuleRegistry: class {
    register = vi.fn()
    runRules = mockRunRules
  },
}))

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    loadAllRules: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../../src/rules/categories.js', () => ({
  getRuleCategory: vi.fn().mockReturnValue('patterns'),
}))

vi.mock('../../src/commands/report-helpers.js', () => ({
  createReporter: vi.fn(),
  CUSTOM_REPORTER_PREFIX: 'custom:',
  readAnalysisFile: mockReadAnalysisFile,
  getPlatformOpenCommand: vi.fn().mockReturnValue('xdg-open "/tmp/report.html"'),
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
  },
}))

vi.mock('../../src/utils/errors.js', () => ({
  CLIError: class CLIError extends Error {
    public readonly code = 'E001'
    public readonly suggestions: string[] = []
    constructor(message: string) {
      super(message)
      this.name = 'CLIError'
    }
  },
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

const sampleAnalysisResult: AnalysisResult = {
  files: [
    {
      filePath: 'src/index.ts',
      stats: { analysisTime: 5, parseTime: 2, totalTime: 7 },
      violations: [
        {
          column: 1,
          endColumn: 10,
          endLine: 5,
          filePath: 'src/index.ts',
          line: 5,
          message: 'Unexpected console statement',
          ruleId: 'no-console',
          severity: 'warning',
          suggestion: 'Remove console statement',
        },
      ],
    },
  ],
  summary: {
    errorCount: 0,
    filesWithViolations: 1,
    infoCount: 0,
    totalFiles: 1,
    totalTime: 42,
    warningCount: 1,
  },
  timestamp: '2025-01-01T00:00:00.000Z',
  version: '0.1.0',
}

/**
 * Access private methods on Report for testing.
 * Private methods are accessed via a typed facade for testability.
 */
interface ReportPrivate {
  config: { version: string }
  error: (message: string, options: { exit: number }) => never
  loadFromInput: (inputPath: string) => Promise<AnalysisResult>
  log: (...args: unknown[]) => void
  openInBrowser: (filePath: string) => Promise<void>
  parse: () => Promise<{
    args: { path: string }
    flags: Record<string, unknown>
  }>
  run: () => Promise<void>
  runAnalysis: (targetPath: string, concurrency: number) => Promise<AnalysisResult>
  warn: (message: string) => void
}

function createReportInstance(): { command: Report; p: ReportPrivate; logs: string[]; warns: string[] } {
  const logs: string[] = []
  const warns: string[] = []
  const command = new Report([], {} as never)
  const p = command as unknown as ReportPrivate

  // Stub oclif's log/warn to capture output
  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }
  p.warn = (message: string) => {
    warns.push(message)
  }

  // Provide a config.version
  p.config = { version: '0.1.0' }

  return { command, p, logs, warns }
}

// ─── Static properties ───

describe('Report command static properties', () => {
  it('has correct description', () => {
    expect(Report.description).toBe('Generate analysis reports in various formats')
  })

  it('has examples defined', () => {
    expect(Report.examples).toBeDefined()
    expect(Report.examples!.length).toBeGreaterThan(0)
  })

  it('defines path arg with default "."', () => {
    const pathArg = Report.args!.path as Record<string, unknown>
    expect(pathArg).toBeDefined()
    expect(pathArg.default).toBe('.')
    expect(pathArg.required).toBe(false)
  })

  it('has format flag with char f and default console', () => {
    const formatFlag = Report.flags!.format as Record<string, unknown>
    expect(formatFlag).toBeDefined()
    expect(formatFlag.char).toBe('f')
    expect(formatFlag.default).toBe('console')
  })

  it('has input flag with char i', () => {
    const inputFlag = Report.flags!.input as Record<string, unknown>
    expect(inputFlag).toBeDefined()
    expect(inputFlag.char).toBe('i')
  })

  it('has output flag with char o', () => {
    const outputFlag = Report.flags!.output as Record<string, unknown>
    expect(outputFlag).toBeDefined()
    expect(outputFlag.char).toBe('o')
  })

  it('has open flag defaulting to false', () => {
    const openFlag = Report.flags!.open as Record<string, unknown>
    expect(openFlag).toBeDefined()
    expect(openFlag.default).toBe(false)
  })

  it('has pretty flag defaulting to false', () => {
    const prettyFlag = Report.flags!.pretty as Record<string, unknown>
    expect(prettyFlag).toBeDefined()
    expect(prettyFlag.default).toBe(false)
  })

  it('has verbose flag defaulting to false', () => {
    const verboseFlag = Report.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.default).toBe(false)
  })

  it('has concurrency flag', () => {
    const concurrencyFlag = Report.flags!.concurrency as Record<string, unknown>
    expect(concurrencyFlag).toBeDefined()
  })

  it('defines at least 5 examples', () => {
    expect(Report.examples!.length).toBeGreaterThanOrEqual(5)
  })
})

// ─── Example structures ───

describe('Report examples structure', () => {
  it('each example has command and description', () => {
    for (const example of Report.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── loadFromInput ───

describe('loadFromInput', () => {
  let reportInstance: ReturnType<typeof createReportInstance>

  beforeEach(async () => {
    reportInstance = createReportInstance()
    mockReadAnalysisFile.mockReset()
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns analysis result from readAnalysisFile', async () => {
    mockReadAnalysisFile.mockResolvedValue(sampleAnalysisResult)

    const result = await reportInstance.p.loadFromInput('analysis.json')

    expect(result).toEqual(sampleAnalysisResult)
    expect(mockReadAnalysisFile).toHaveBeenCalledWith('analysis.json')
  })

  it('calls this.error when readAnalysisFile throws CLIError', async () => {
    const { CLIError } = await import('../../src/utils/errors.js')
    const cliError = new CLIError('Input file not found: missing.json')
    mockReadAnalysisFile.mockRejectedValue(cliError)

    let caught = false
    try {
      await reportInstance.p.loadFromInput('missing.json')
    } catch {
      caught = true
    }

    expect(caught).toBe(true)
  })

  it('re-throws non-CLIError errors directly', async () => {
    const genericError = new Error('Something unexpected')
    mockReadAnalysisFile.mockRejectedValue(genericError)

    await expect(reportInstance.p.loadFromInput('bad.json')).rejects.toThrow('Something unexpected')
  })

  it('re-throws non-Error values', async () => {
    mockReadAnalysisFile.mockRejectedValue('string error')

    await expect(reportInstance.p.loadFromInput('bad.json')).rejects.toBe('string error')
  })
})

// ─── openInBrowser ───

describe('openInBrowser', () => {
  let reportInstance: ReturnType<typeof createReportInstance>

  beforeEach(async () => {
    reportInstance = createReportInstance()
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
  })

  it('logs opening message with absolute path', async () => {
    const { getPlatformOpenCommand } = await import('../../src/commands/report-helpers.js')
    vi.mocked(getPlatformOpenCommand).mockReturnValue('open "/abs/report.html"')

    await reportInstance.p.openInBrowser('/abs/report.html')

    const output = stripAnsi(reportInstance.logs.join('\n'))
    expect(output).toContain('Opening report in browser')
    expect(output).toContain('/abs/report.html')
  })

  it('errors when file does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)

    let caught = false
    try {
      await reportInstance.p.openInBrowser('/nonexistent.html')
    } catch {
      caught = true
    }

    expect(caught).toBe(true)
  })

  it('warns and logs manual URL when exec fails', async () => {
    mockExecAsync.mockRejectedValueOnce(new Error('no display'))

    await reportInstance.p.openInBrowser('/abs/report.html')

    const warnOutput = reportInstance.warns.join('\n')
    expect(warnOutput).toContain('Failed to open browser')

    const logOutput = stripAnsi(reportInstance.logs.join('\n'))
    expect(logOutput).toContain('Please open the report manually')
  })

  it('handles non-Error exec rejection', async () => {
    mockExecAsync.mockRejectedValueOnce('unknown failure')

    await reportInstance.p.openInBrowser('/abs/report.html')

    const warnOutput = reportInstance.warns.join('\n')
    expect(warnOutput).toContain('Failed to open browser')
    expect(warnOutput).toContain('Unknown error')
  })

  it('calls getPlatformOpenCommand with correct arguments', async () => {
    const { getPlatformOpenCommand } = await import('../../src/commands/report-helpers.js')
    vi.mocked(getPlatformOpenCommand).mockReturnValue('xdg-open "/abs/report.html"')

    // Override process.platform for this test
    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', { value: 'linux' })

    await reportInstance.p.openInBrowser('/abs/report.html')

    expect(getPlatformOpenCommand).toHaveBeenCalledWith('/abs/report.html', 'linux')

    Object.defineProperty(process, 'platform', { value: originalPlatform })
  })
})

// ─── runAnalysis ───

describe('runAnalysis', () => {
  let reportInstance: ReturnType<typeof createReportInstance>

  beforeEach(async () => {
    reportInstance = createReportInstance()
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({})
    mockParseFile.mockReset().mockResolvedValue({ parseTime: 0, sourceFile: {} })
    mockRunRules.mockReset().mockReturnValue([])
  })

  it('errors when path does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)

    let caught = false
    try {
      await reportInstance.p.runAnalysis('/nonexistent', 4)
    } catch {
      caught = true
    }

    expect(caught).toBe(true)
  })

  it('logs analyzing message with resolved path', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    await reportInstance.p.runAnalysis('.', 4)

    const output = stripAnsi(reportInstance.logs.join('\n'))
    expect(output).toContain('Analyzing:')
  })

  it('returns result with empty files when no files discovered', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    const result = await reportInstance.p.runAnalysis('.', 4)

    expect(result.files).toEqual([])
    expect(result.summary.totalFiles).toBe(0)
    expect(result.summary.errorCount).toBe(0)
    expect(result.summary.warningCount).toBe(0)
    expect(result.summary.infoCount).toBe(0)
    expect(result.summary.filesWithViolations).toBe(0)
  })

  it('returns result with correct summary for files with violations', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
    ])

    mockParseFile.mockResolvedValue({ parseTime: 10, sourceFile: {} })
    mockRunRules.mockReturnValue([
      {
        message: 'Error violation',
        range: { start: { column: 0, line: 1 }, end: { column: 5, line: 1 } },
        ruleId: 'test-rule',
        severity: 'error',
        suggestion: 'Fix it',
      },
      {
        message: 'Warning violation',
        range: { start: { column: 2, line: 3 }, end: { column: 8, line: 3 } },
        ruleId: 'warn-rule',
        severity: 'warning',
      },
    ])

    const result = await reportInstance.p.runAnalysis('.', 4)

    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filePath).toBe('test.ts')
    expect(result.files[0]!.violations).toHaveLength(2)
    expect(result.summary.errorCount).toBe(1)
    expect(result.summary.warningCount).toBe(1)
    expect(result.summary.filesWithViolations).toBe(1)
  })

  it('computes infoCount for info severity violations', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
    ])

    mockParseFile.mockResolvedValue({ parseTime: 5, sourceFile: {} })
    mockRunRules.mockReturnValue([
      {
        message: 'Info message',
        range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
        ruleId: 'info-rule',
        severity: 'info',
      },
    ])

    const result = await reportInstance.p.runAnalysis('.', 4)

    expect(result.summary.infoCount).toBe(1)
  })

  it('maps violation fields correctly', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/foo.ts', path: 'foo.ts' },
    ])

    mockParseFile.mockResolvedValue({ parseTime: 3, sourceFile: {} })
    mockRunRules.mockReturnValue([
      {
        message: 'Use const',
        range: { start: { column: 4, line: 10 }, end: { column: 7, line: 12 } },
        ruleId: 'prefer-const',
        severity: 'warning',
        suggestion: 'Replace let with const',
      },
    ])

    const result = await reportInstance.p.runAnalysis('.', 4)
    const violation = result.files[0]!.violations[0]!

    expect(violation.column).toBe(4)
    expect(violation.line).toBe(10)
    expect(violation.endColumn).toBe(7)
    expect(violation.endLine).toBe(12)
    expect(violation.filePath).toBe('foo.ts')
    expect(violation.message).toBe('Use const')
    expect(violation.ruleId).toBe('prefer-const')
    expect(violation.severity).toBe('warning')
    expect(violation.suggestion).toBe('Replace let with const')
  })

  it('filters out null results from failed parses', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/good.ts', path: 'good.ts' },
      { absolutePath: '/abs/bad.ts', path: 'bad.ts' },
    ])

    mockParseFile
      .mockResolvedValueOnce({ parseTime: 5, sourceFile: {} })
      .mockRejectedValueOnce(new Error('Parse failure'))

    const result = await reportInstance.p.runAnalysis('.', 4)

    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filePath).toBe('good.ts')
  })

  it('handles null file entries in discovered files', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')

    // Include a null entry as the source code guards against it
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
      null as unknown as { absolutePath: string; path: string },
    ])

    const result = await reportInstance.p.runAnalysis('.', 4)

    // Only the non-null file should produce a result (if parsed successfully)
    // or the null should be filtered by the `if (!file)` guard
    expect(result.files.length).toBeLessThanOrEqual(1)
  })

  it('registers all loaded rules into the registry', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    const { getRuleCategory } = await import('../../src/rules/categories.js')

    vi.mocked(discoverFiles).mockResolvedValue([])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'rule-a': { meta: { name: 'rule-a' } },
      'rule-b': { meta: { name: 'rule-b' } },
    })

    await reportInstance.p.runAnalysis('.', 4)

    expect(getRuleCategory).toHaveBeenCalledWith('rule-a')
    expect(getRuleCategory).toHaveBeenCalledWith('rule-b')
  })

  it('includes version from config in result', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    reportInstance.p.config = { version: '2.0.0' }
    const result = await reportInstance.p.runAnalysis('.', 4)

    expect(result.version).toBe('2.0.0')
  })

  it('includes ISO timestamp in result', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    const before = new Date().toISOString()
    const result = await reportInstance.p.runAnalysis('.', 4)
    const after = new Date().toISOString()

    expect(result.timestamp >= before).toBe(true)
    expect(result.timestamp <= after).toBe(true)
  })

  it('sets stats parseTime from parse result', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/timed.ts', path: 'timed.ts' },
    ])

    mockParseFile.mockResolvedValue({ parseTime: 42, sourceFile: {} })
    mockRunRules.mockReturnValue([])

    const result = await reportInstance.p.runAnalysis('.', 4)

    expect(result.files[0]!.stats.parseTime).toBe(42)
    expect(result.files[0]!.stats.analysisTime).toBe(0)
    expect(result.files[0]!.stats.totalTime).toBe(42)
  })
})

// ─── run (integration flow) ───

describe('run', () => {
  let reportInstance: ReturnType<typeof createReportInstance>

  beforeEach(async () => {
    reportInstance = createReportInstance()
    mockReadAnalysisFile.mockReset()
    mockReadAnalysisFile.mockResolvedValue(sampleAnalysisResult)
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])
    const { createReporter } = await import('../../src/commands/report-helpers.js')
    vi.mocked(createReporter).mockResolvedValue({
      name: 'console',
      report: vi.fn(),
      format: vi.fn(),
    })
  })

  it('errors when html format without --output', async () => {
    reportInstance.p.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: {
        concurrency: 4,
        format: 'html',
        input: undefined,
        open: false,
        output: undefined,
        pretty: false,
        verbose: false,
      },
    })

    let caught = false
    try {
      await reportInstance.p.run()
    } catch {
      caught = true
    }

    expect(caught).toBe(true)
  })

  it('warns when custom format without --output', async () => {
    const { createReporter } = await import('../../src/commands/report-helpers.js')
    vi.mocked(createReporter).mockResolvedValue({
      name: 'custom',
      report: vi.fn(),
      format: vi.fn(),
    })

    mockReadAnalysisFile.mockResolvedValue(sampleAnalysisResult)

    reportInstance.p.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: {
        concurrency: 4,
        format: 'custom:./reporter.js',
        input: 'analysis.json',
        open: false,
        output: undefined,
        pretty: false,
        verbose: false,
      },
    })

    await reportInstance.p.run()

    expect(reportInstance.warns.length).toBeGreaterThan(0)
    expect(reportInstance.warns[0]).toContain('Custom reporters typically need --output')
  })

  it('calls loadFromInput when --input flag is provided', async () => {
    const { createReporter } = await import('../../src/commands/report-helpers.js')
    vi.mocked(createReporter).mockResolvedValue({
      name: 'json',
      report: vi.fn(),
      format: vi.fn(),
    })

    mockReadAnalysisFile.mockResolvedValue(sampleAnalysisResult)

    reportInstance.p.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: {
        concurrency: 4,
        format: 'json',
        input: 'cached.json',
        open: false,
        output: 'out.json',
        pretty: true,
        verbose: false,
      },
    })

    await reportInstance.p.run()

    expect(mockReadAnalysisFile).toHaveBeenCalledWith('cached.json')
  })

  it('calls createReporter with correct options', async () => {
    const { createReporter } = await import('../../src/commands/report-helpers.js')
    vi.mocked(createReporter).mockResolvedValue({
      name: 'json',
      report: vi.fn(),
      format: vi.fn(),
    })

    mockReadAnalysisFile.mockResolvedValue(sampleAnalysisResult)

    reportInstance.p.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: {
        concurrency: 4,
        format: 'json',
        input: 'cached.json',
        open: false,
        output: 'report.json',
        pretty: true,
        verbose: true,
      },
    })

    await reportInstance.p.run()

    expect(createReporter).toHaveBeenCalledWith('json', {
      outputPath: 'report.json',
      pretty: true,
      verbose: true,
    })
  })

  it('calls reporter.report with analysis results', async () => {
    const { createReporter } = await import('../../src/commands/report-helpers.js')
    const mockReport = vi.fn()
    vi.mocked(createReporter).mockResolvedValue({
      name: 'json',
      report: mockReport,
      format: vi.fn(),
    })

    mockReadAnalysisFile.mockResolvedValue(sampleAnalysisResult)

    reportInstance.p.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: {
        concurrency: 4,
        format: 'json',
        input: 'cached.json',
        open: false,
        output: 'report.json',
        pretty: false,
        verbose: false,
      },
    })

    await reportInstance.p.run()

    expect(mockReport).toHaveBeenCalledWith(sampleAnalysisResult)
  })

  it('opens browser when --open flag with html format and output', async () => {
    const { createReporter } = await import('../../src/commands/report-helpers.js')
    vi.mocked(createReporter).mockResolvedValue({
      name: 'html',
      report: vi.fn(),
      format: vi.fn(),
    })

    mockReadAnalysisFile.mockResolvedValue(sampleAnalysisResult)

    // Track that openInBrowser was called by spying on logs
    reportInstance.p.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: {
        concurrency: 4,
        format: 'html',
        input: 'cached.json',
        open: true,
        output: 'report.html',
        pretty: false,
        verbose: false,
      },
    })

    await reportInstance.p.run()

    const output = stripAnsi(reportInstance.logs.join('\n'))
    expect(output).toContain('Opening report in browser')
  })

  it('does not open browser when --open flag with non-html format', async () => {
    const { createReporter } = await import('../../src/commands/report-helpers.js')
    vi.mocked(createReporter).mockResolvedValue({
      name: 'json',
      report: vi.fn(),
      format: vi.fn(),
    })

    mockReadAnalysisFile.mockResolvedValue(sampleAnalysisResult)

    reportInstance.p.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: {
        concurrency: 4,
        format: 'json',
        input: 'cached.json',
        open: true,
        output: 'report.json',
        pretty: false,
        verbose: false,
      },
    })

    await reportInstance.p.run()

    const output = stripAnsi(reportInstance.logs.join('\n'))
    expect(output).not.toContain('Opening report in browser')
  })

  it('does not open browser when --open without --output', async () => {
    const { createReporter } = await import('../../src/commands/report-helpers.js')
    vi.mocked(createReporter).mockResolvedValue({
      name: 'console',
      report: vi.fn(),
      format: vi.fn(),
    })

    mockReadAnalysisFile.mockResolvedValue(sampleAnalysisResult)

    reportInstance.p.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: {
        concurrency: 4,
        format: 'console',
        input: 'cached.json',
        open: true,
        output: undefined,
        pretty: false,
        verbose: false,
      },
    })

    await reportInstance.p.run()

    const output = stripAnsi(reportInstance.logs.join('\n'))
    expect(output).not.toContain('Opening report in browser')
  })

  it('runs fresh analysis when no --input flag', async () => {
    const { createReporter } = await import('../../src/commands/report-helpers.js')
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(createReporter).mockResolvedValue({
      name: 'console',
      report: vi.fn(),
      format: vi.fn(),
    })
    vi.mocked(discoverFiles).mockResolvedValue([])

    reportInstance.p.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: {
        concurrency: 4,
        format: 'console',
        input: undefined,
        open: false,
        output: undefined,
        pretty: false,
        verbose: false,
      },
    })

    await reportInstance.p.run()

    expect(discoverFiles).toHaveBeenCalled()
    expect(mockReadAnalysisFile).not.toHaveBeenCalled()
  })
})

// ─── Format coverage (reporter delegation) ───

describe('format delegation via createReporter', () => {
  let reportInstance: ReturnType<typeof createReportInstance>

  beforeEach(() => {
    reportInstance = createReportInstance()
  })

  const formatTestCases: Array<{ expectedName: string; format: string }> = [
    { expectedName: 'json', format: 'json' },
    { expectedName: 'html', format: 'html' },
    { expectedName: 'junit', format: 'junit' },
    { expectedName: 'sarif', format: 'sarif' },
    { expectedName: 'markdown', format: 'markdown' },
    { expectedName: 'gitlab', format: 'gitlab' },
    { expectedName: 'console', format: 'console' },
  ]

  for (const { expectedName, format } of formatTestCases) {
    it(`creates ${expectedName} reporter for format "${format}"`, async () => {
      const { createReporter } = await import('../../src/commands/report-helpers.js')
      vi.mocked(createReporter).mockResolvedValue({
        name: expectedName,
        report: vi.fn(),
        format: vi.fn(),
      })

      mockReadAnalysisFile.mockResolvedValue(sampleAnalysisResult)

      const flags: Record<string, unknown> = {
        concurrency: 4,
        format,
        input: 'cached.json',
        open: false,
        output: format === 'html' ? 'report.html' : undefined,
        pretty: false,
        verbose: false,
      }

      reportInstance.p.parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags,
      })

      await reportInstance.p.run()

      expect(createReporter).toHaveBeenCalledWith(format, expect.objectContaining({
        outputPath: flags.output,
      }))
    })
  }
})
