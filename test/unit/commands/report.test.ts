import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import type { AnalysisResult, Reporter, Violation } from '../../../src/reporters/types.js'

function createMockAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [
      {
        filePath: '/test/file.ts',
        violations: [],
        stats: { parseTime: 10, analysisTime: 20, totalTime: 30 },
      },
    ],
    summary: {
      totalFiles: 1,
      filesWithViolations: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      totalTime: 30,
    },
    timestamp: '2024-01-01T00:00:00.000Z',
    version: '1.0.0',
    ...overrides,
  }
}

function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    ruleId: 'test-rule',
    severity: 'error',
    message: 'Test violation',
    filePath: '/test/file.ts',
    line: 1,
    column: 1,
    ...overrides,
  }
}

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  statSync: vi.fn(),
  readdirSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}))

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('path', async () => {
  const actual = await vi.importActual<typeof import('path')>('path')
  return {
    ...actual,
    resolve: vi.fn((p: string) => `/resolved/${p}`),
    join: vi.fn((...args: string[]) => args.join('/')),
    dirname: vi.fn((p: string) => p.split('/').slice(0, -1).join('/')),
  }
})

vi.mock('child_process', () => ({
  exec: vi.fn(),
}))

vi.mock('util', () => ({
  promisify: vi.fn(() => vi.fn().mockResolvedValue({ stdout: '', stderr: '' })),
}))

vi.mock('../../../src/reporters/console-reporter.js', () => ({
  ConsoleReporter: vi.fn().mockImplementation(function () {
    return {
      name: 'console',
      report: vi.fn(),
      format: vi.fn().mockReturnValue('formatted'),
    }
  }),
}))

vi.mock('../../../src/reporters/json-reporter.js', () => ({
  JSONReporter: vi.fn().mockImplementation(function () {
    return {
      name: 'json',
      report: vi.fn(),
      format: vi.fn().mockReturnValue('{}'),
    }
  }),
}))

vi.mock('../../../src/reporters/html-reporter.js', () => ({
  HTMLReporter: vi.fn().mockImplementation(function () {
    return {
      name: 'html',
      report: vi.fn(),
      format: vi.fn().mockReturnValue('<html></html>'),
    }
  }),
}))

vi.mock('../../../src/reporters/gitlab-reporter.js', () => ({
  GitLabReporter: vi.fn().mockImplementation(function () {
    return {
      name: 'gitlab',
      report: vi.fn(),
      format: vi.fn().mockReturnValue('[]'),
    }
  }),
}))

vi.mock('../../../src/reporters/junit-reporter.js', () => ({
  JUnitReporter: vi.fn().mockImplementation(function () {
    return {
      name: 'junit',
      report: vi.fn(),
      format: vi.fn().mockReturnValue('<?xml version="1.0"?>'),
    }
  }),
}))

vi.mock('../../../src/reporters/markdown-reporter.js', () => ({
  MarkdownReporter: vi.fn().mockImplementation(function () {
    return {
      name: 'markdown',
      report: vi.fn(),
      format: vi.fn().mockReturnValue('# Report'),
    }
  }),
}))

vi.mock('../../../src/reporters/sarif-reporter.js', () => ({
  SARIFReporter: vi.fn().mockImplementation(function () {
    return {
      name: 'sarif',
      report: vi.fn(),
      format: vi.fn().mockReturnValue('{}'),
    }
  }),
}))

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function () {
    return {
      initialize: vi.fn().mockResolvedValue(undefined),
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: { getFilePath: () => '/test.ts', saveSync: vi.fn() },
        parseTime: 10,
      }),
      dispose: vi.fn(),
    }
  }),
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return {
      register: vi.fn(),
      runRules: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {},
}))

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    text: '',
  })),
}))

vi.mock('p-limit', () => ({
  default: vi.fn(() => (fn: () => unknown) => fn()),
}))

describe('Report Command', () => {
  let Report: typeof import('../../../src/commands/report.js').default
  let mockFs: {
    existsSync: ReturnType<typeof vi.fn>
    readFileSync: ReturnType<typeof vi.fn>
    statSync: ReturnType<typeof vi.fn>
    readdirSync: ReturnType<typeof vi.fn>
  }
  let mockFsPromises: {
    readFile: ReturnType<typeof vi.fn>
    writeFile: ReturnType<typeof vi.fn>
    mkdir: ReturnType<typeof vi.fn>
  }
  let mockConsoleLog: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    const fs = await import('fs')
    mockFs = fs as unknown as typeof mockFs

    const fsPromises = await import('fs/promises')
    mockFsPromises = fsPromises as unknown as typeof mockFsPromises

    mockFs.existsSync.mockReturnValue(true)
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<typeof fs.statSync>)
    mockFs.readdirSync.mockReturnValue([])

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    Report = (await import('../../../src/commands/report.js')).default
  })

  afterEach(() => {
    mockConsoleLog.mockRestore()
  })

  // ===========================
  // Command metadata (15 tests)
  // ===========================
  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Report.description).toBe('Generate analysis reports in various formats')
    })

    test('has args defined', () => {
      expect(Report.args).toBeDefined()
      expect(Report.args.path).toBeDefined()
    })

    test('has required flags', () => {
      expect(Report.flags).toBeDefined()
      expect(Report.flags.format).toBeDefined()
      expect(Report.flags.output).toBeDefined()
      expect(Report.flags.input).toBeDefined()
      expect(Report.flags.pretty).toBeDefined()
      expect(Report.flags.verbose).toBeDefined()
      expect(Report.flags.open).toBeDefined()
    })

    test('has examples defined', () => {
      expect(Report.examples).toBeDefined()
      expect(Report.examples.length).toBeGreaterThan(0)
    })

    test('format flag has correct options', () => {
      expect(Report.flags.format.options).toEqual([
        'console',
        'gitlab',
        'html',
        'json',
        'junit',
        'markdown',
        'sarif',
      ])
    })

    test('format flag has default console', () => {
      expect(Report.flags.format.default).toBe('console')
    })

    test('pretty flag has default false', () => {
      expect(Report.flags.pretty.default).toBe(false)
    })

    test('verbose flag has default false', () => {
      expect(Report.flags.verbose.default).toBe(false)
    })

    test('open flag has default false', () => {
      expect(Report.flags.open.default).toBe(false)
    })

    test('format flag has char f', () => {
      expect(Report.flags.format.char).toBe('f')
    })

    test('input flag has char i', () => {
      expect(Report.flags.input.char).toBe('i')
    })

    test('output flag has char o', () => {
      expect(Report.flags.output.char).toBe('o')
    })

    test('path arg has description', () => {
      expect(Report.args.path.description).toBe('Path to analyze')
    })

    test('path arg is not required', () => {
      expect(Report.args.path.required).toBe(false)
    })

    test('path arg defaults to dot', () => {
      expect(Report.args.path.default).toBe('.')
    })
  })

  // ============================================
  // Examples structure (10 tests)
  // ============================================
  describe('Examples structure', () => {
    test('examples is an array', () => {
      expect(Array.isArray(Report.examples)).toBe(true)
    })

    test('each example has a command property', () => {
      for (const example of Report.examples) {
        expect(example).toHaveProperty('command')
        expect(typeof example.command).toBe('string')
      }
    })

    test('each example has a description property', () => {
      for (const example of Report.examples) {
        expect(example).toHaveProperty('description')
        expect(typeof example.description).toBe('string')
      }
    })

    test('includes console report example', () => {
      const hasConsole = Report.examples.some(
        (e: { command: string }) =>
          e.command.includes('<%= command.id %>') && !e.command.includes('--format'),
      )
      expect(hasConsole).toBe(true)
    })

    test('includes html format example', () => {
      const hasHtml = Report.examples.some((e: { command: string }) =>
        e.command.includes('--format html'),
      )
      expect(hasHtml).toBe(true)
    })

    test('includes sarif format example', () => {
      const hasSarif = Report.examples.some((e: { command: string }) =>
        e.command.includes('--format sarif'),
      )
      expect(hasSarif).toBe(true)
    })

    test('includes junit format example', () => {
      const hasJunit = Report.examples.some((e: { command: string }) =>
        e.command.includes('--format junit'),
      )
      expect(hasJunit).toBe(true)
    })

    test('includes gitlab format example', () => {
      const hasGitlab = Report.examples.some((e: { command: string }) =>
        e.command.includes('--format gitlab'),
      )
      expect(hasGitlab).toBe(true)
    })

    test('includes markdown format example', () => {
      const hasMd = Report.examples.some((e: { command: string }) =>
        e.command.includes('--format markdown'),
      )
      expect(hasMd).toBe(true)
    })

    test('includes input flag example', () => {
      const hasInput = Report.examples.some((e: { command: string }) =>
        e.command.includes('--input'),
      )
      expect(hasInput).toBe(true)
    })
  })

  // ============================================
  // Flag defaults and configuration (12 tests)
  // ============================================
  describe('Flag defaults and configuration', () => {
    test('format flag description mentions output format', () => {
      expect(Report.flags.format.description).toContain('format')
    })

    test('input flag description mentions previous analysis', () => {
      expect(Report.flags.input.description).toContain('previous')
    })

    test('output flag description mentions required for html', () => {
      expect(Report.flags.output.description).toContain('html')
    })

    test('open flag description mentions html format', () => {
      expect(Report.flags.open.description).toContain('html')
    })

    test('pretty flag description mentions JSON', () => {
      expect(Report.flags.pretty.description).toContain('JSON')
    })

    test('verbose flag description mentions detailed', () => {
      expect(Report.flags.verbose.description).toContain('detailed')
    })

    test('concurrency flag has a default', () => {
      expect(Report.flags.concurrency.default).toBeDefined()
    })

    test('concurrency flag description mentions parallel', () => {
      expect(Report.flags.concurrency.description).toContain('parallel')
    })

    test('concurrency flag is an integer', () => {
      expect(Report.flags.concurrency.type).toBe('option')
    })

    test('open flag is a boolean flag', () => {
      expect(Report.flags.open.type).toBe('boolean')
    })

    test('pretty flag is a boolean flag', () => {
      expect(Report.flags.pretty.type).toBe('boolean')
    })

    test('verbose flag is a boolean flag', () => {
      expect(Report.flags.verbose.type).toBe('boolean')
    })
  })

  // ============================================
  // createReporter - all formats (18 tests)
  // ============================================
  describe('createReporter', () => {
    function getTestableCommand() {
      return new Report([], {} as never) as unknown as {
        createReporter(format: string, options: Record<string, unknown>): Reporter
      }
    }

    test('creates ConsoleReporter for console format', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('console', {})
      expect(ConsoleReporter).toHaveBeenCalled()
    })

    test('creates JSONReporter for json format', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('json', {})
      expect(JSONReporter).toHaveBeenCalled()
    })

    test('creates HTMLReporter for html format', async () => {
      const { HTMLReporter } = await import('../../../src/reporters/html-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('html', { outputPath: '/out.html' })
      expect(HTMLReporter).toHaveBeenCalled()
    })

    test('creates GitLabReporter for gitlab format', async () => {
      const { GitLabReporter } = await import('../../../src/reporters/gitlab-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('gitlab', {})
      expect(GitLabReporter).toHaveBeenCalled()
    })

    test('creates JUnitReporter for junit format', async () => {
      const { JUnitReporter } = await import('../../../src/reporters/junit-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('junit', {})
      expect(JUnitReporter).toHaveBeenCalled()
    })

    test('creates MarkdownReporter for markdown format', async () => {
      const { MarkdownReporter } = await import('../../../src/reporters/markdown-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('markdown', {})
      expect(MarkdownReporter).toHaveBeenCalled()
    })

    test('creates SARIFReporter for sarif format', async () => {
      const { SARIFReporter } = await import('../../../src/reporters/sarif-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('sarif', {})
      expect(SARIFReporter).toHaveBeenCalled()
    })

    test('creates ConsoleReporter for unknown format (default)', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('unknown', {})
      expect(ConsoleReporter).toHaveBeenCalled()
    })

    test('passes options to JSONReporter', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('json', { pretty: true, verbose: true })
      expect(JSONReporter).toHaveBeenCalledWith(
        expect.objectContaining({ pretty: true, verbose: true }),
      )
    })

    test('passes outputPath to HTMLReporter', async () => {
      const { HTMLReporter } = await import('../../../src/reporters/html-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('html', { outputPath: '/report.html' })
      expect(HTMLReporter).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/report.html' }),
      )
    })

    test('returns reporter with report method', () => {
      const cmd = getTestableCommand()
      const reporter = cmd.createReporter('console', {})
      expect(typeof reporter.report).toBe('function')
    })

    test('returns reporter with format method', () => {
      const cmd = getTestableCommand()
      const reporter = cmd.createReporter('console', {})
      expect(typeof reporter.format).toBe('function')
    })

    test('returns reporter with name property', () => {
      const cmd = getTestableCommand()
      const reporter = cmd.createReporter('console', {})
      expect(reporter.name).toBe('console')
    })

    test('json reporter has correct name', () => {
      const cmd = getTestableCommand()
      const reporter = cmd.createReporter('json', {})
      expect(reporter.name).toBe('json')
    })

    test('html reporter has correct name', () => {
      const cmd = getTestableCommand()
      const reporter = cmd.createReporter('html', { outputPath: '/r.html' })
      expect(reporter.name).toBe('html')
    })

    test('gitlab reporter has correct name', () => {
      const cmd = getTestableCommand()
      const reporter = cmd.createReporter('gitlab', {})
      expect(reporter.name).toBe('gitlab')
    })

    test('junit reporter has correct name', () => {
      const cmd = getTestableCommand()
      const reporter = cmd.createReporter('junit', {})
      expect(reporter.name).toBe('junit')
    })

    test('sarif reporter has correct name', () => {
      const cmd = getTestableCommand()
      const reporter = cmd.createReporter('sarif', {})
      expect(reporter.name).toBe('sarif')
    })
  })

  // ============================================
  // loadFromInput - valid cases (10 tests)
  // ============================================
  describe('loadFromInput - valid cases', () => {
    function createCommandWithMocks() {
      const cmd = new Report([], {} as never)
      return cmd as unknown as {
        loadFromInput(inputPath: string): Promise<AnalysisResult>
        error: ReturnType<typeof vi.fn>
      }
    }

    test('loads valid JSON input file', async () => {
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMocks()
      const result = await cmd.loadFromInput('/valid.json')

      expect(result).toEqual(validResult)
    })

    test('loads analysis result with violations', async () => {
      const violation = createMockViolation({ ruleId: 'no-console', severity: 'warning' })
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/src/app.ts',
            violations: [violation],
            stats: { parseTime: 5, analysisTime: 10, totalTime: 15 },
          },
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 1,
          infoCount: 0,
          totalTime: 15,
        },
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/with-violations.json')

      expect(loaded.files[0].violations).toHaveLength(1)
      expect(loaded.files[0].violations[0].ruleId).toBe('no-console')
    })

    test('loads analysis result with multiple files', async () => {
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/src/a.ts',
            violations: [],
            stats: { parseTime: 1, analysisTime: 2, totalTime: 3 },
          },
          {
            filePath: '/src/b.ts',
            violations: [createMockViolation()],
            stats: { parseTime: 4, analysisTime: 5, totalTime: 9 },
          },
          {
            filePath: '/src/c.ts',
            violations: [],
            stats: { parseTime: 6, analysisTime: 7, totalTime: 13 },
          },
        ],
        summary: {
          totalFiles: 3,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 25,
        },
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/multi-file.json')

      expect(loaded.files).toHaveLength(3)
    })

    test('loads analysis result with all severity types', async () => {
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/test.ts',
            violations: [
              createMockViolation({ severity: 'error' }),
              createMockViolation({ severity: 'warning', ruleId: 'warn-rule' }),
              createMockViolation({ severity: 'info', ruleId: 'info-rule' }),
            ],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 1,
          infoCount: 1,
          totalTime: 2,
        },
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/all-severities.json')

      expect(loaded.summary.errorCount).toBe(1)
      expect(loaded.summary.warningCount).toBe(1)
      expect(loaded.summary.infoCount).toBe(1)
    })

    test('loads analysis result with empty files array', async () => {
      const result = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/empty.json')

      expect(loaded.files).toHaveLength(0)
      expect(loaded.summary.totalFiles).toBe(0)
    })

    test('preserves version field from input', async () => {
      const result = createMockAnalysisResult({ version: '2.5.0' })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/versioned.json')

      expect(loaded.version).toBe('2.5.0')
    })

    test('preserves timestamp from input', async () => {
      const result = createMockAnalysisResult({ timestamp: '2024-06-15T12:30:00.000Z' })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/timestamped.json')

      expect(loaded.timestamp).toBe('2024-06-15T12:30:00.000Z')
    })

    test('loads result with violations containing suggestion', async () => {
      const violation = createMockViolation({ suggestion: 'Use const instead of let' })
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/test.ts',
            violations: [violation],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/suggestion.json')

      expect(loaded.files[0].violations[0].suggestion).toBe('Use const instead of let')
    })

    test('loads result with violations containing endLine and endColumn', async () => {
      const violation = createMockViolation({ endLine: 5, endColumn: 10 })
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/test.ts',
            violations: [violation],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/range.json')

      expect(loaded.files[0].violations[0].endLine).toBe(5)
      expect(loaded.files[0].violations[0].endColumn).toBe(10)
    })

    test('calls readFile with correct path and encoding', async () => {
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMocks()
      await cmd.loadFromInput('/path/to/analysis.json')

      expect(mockFsPromises.readFile).toHaveBeenCalledWith('/path/to/analysis.json', 'utf8')
    })
  })

  // ============================================
  // loadFromInput - error cases (10 tests)
  // ============================================
  describe('loadFromInput - error cases', () => {
    function createCommandWithMocks() {
      const cmd = new Report([], {} as never)
      return cmd as unknown as {
        loadFromInput(inputPath: string): Promise<AnalysisResult>
        error: ReturnType<typeof vi.fn>
      }
    }

    test('throws when file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.loadFromInput('/missing.json')).rejects.toThrow()
    })

    test('throws when JSON is invalid', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue('not valid json')

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.loadFromInput('/invalid.json')).rejects.toThrow()
    })

    test('throws when missing required fields - no files', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(
        JSON.stringify({ summary: { totalFiles: 0 }, timestamp: '2024-01-01' }),
      )

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.loadFromInput('/no-files.json')).rejects.toThrow()
    })

    test('throws when missing required fields - no summary', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(
        JSON.stringify({ files: [], timestamp: '2024-01-01' }),
      )

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.loadFromInput('/no-summary.json')).rejects.toThrow()
    })

    test('throws when missing required fields - no timestamp', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(
        JSON.stringify({ files: [], summary: { totalFiles: 0 } }),
      )

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.loadFromInput('/no-timestamp.json')).rejects.toThrow()
    })

    test('throws for empty file content', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue('')

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.loadFromInput('/empty-file.json')).rejects.toThrow()
    })

    test('throws for JSON array instead of object', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue('[]')

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.loadFromInput('/array.json')).rejects.toThrow()
    })

    test('throws for JSON number', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue('42')

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.loadFromInput('/number.json')).rejects.toThrow()
    })

    test('throws for JSON null', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue('null')

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.loadFromInput('/null.json')).rejects.toThrow()
    })

    test('throws when readFile throws', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockRejectedValue(new Error('Permission denied'))

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.loadFromInput('/no-permission.json')).rejects.toThrow()
    })
  })

  // ============================================
  // run integration - html format errors (5 tests)
  // ============================================
  describe('run integration - html format errors', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>, args = { path: '.' }) {
      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({ args, flags })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.config = { version: '1.0.0' }
      return command
    }

    test('errors when html format without output', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
      })
      const cmdWithMock = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithMock.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.run()).rejects.toThrow('--output is required')
    })

    test('error message mentions html format', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
      })
      const cmdWithMock = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithMock.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(cmdWithMock.error).toHaveBeenCalledWith(
        expect.stringContaining('--output is required'),
        expect.objectContaining({ exit: 1 }),
      )
    })

    test('html format with output does not error', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/report.html',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      // Should not throw
      await cmd.run()
    })

    test('html format with output and input file works', async () => {
      mockFs.existsSync.mockReturnValue(true)
      const validResult = createMockAnalysisResult()
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/report.html',
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
    })

    test('html format with output uses HTMLReporter', async () => {
      const { HTMLReporter } = await import('../../../src/reporters/html-reporter.js')
      mockFs.existsSync.mockReturnValue(true)
      const validResult = createMockAnalysisResult()
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/report.html',
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
      expect(HTMLReporter).toHaveBeenCalled()
    })
  })

  // ============================================
  // run integration - input file (10 tests)
  // ============================================
  describe('run integration - input file', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>, args = { path: '.' }) {
      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({ args, flags })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.config = { version: '1.0.0' }
      return command
    }

    test('uses input file when provided', async () => {
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
      expect(mockFsPromises.readFile).toHaveBeenCalledWith('/analysis.json', 'utf8')
    })

    test('does not call discoverFiles when input is provided', async () => {
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
      expect(mockDiscoverFiles).not.toHaveBeenCalled()
    })

    test('calls reporter.report with loaded results', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const mockReport = vi.fn()
      ;(ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          name: 'console',
          report: mockReport,
          format: vi.fn().mockReturnValue('formatted'),
        }
      })

      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          files: expect.any(Array),
          summary: expect.any(Object),
        }),
      )
    })

    test('uses json format with input file', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalled()
    })

    test('uses gitlab format with input file', async () => {
      const { GitLabReporter } = await import('../../../src/reporters/gitlab-reporter.js')
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'gitlab',
        output: '/report.json',
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
      expect(GitLabReporter).toHaveBeenCalled()
    })

    test('uses junit format with input file', async () => {
      const { JUnitReporter } = await import('../../../src/reporters/junit-reporter.js')
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'junit',
        output: '/report.xml',
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
      expect(JUnitReporter).toHaveBeenCalled()
    })

    test('uses sarif format with input file', async () => {
      const { SARIFReporter } = await import('../../../src/reporters/sarif-reporter.js')
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'sarif',
        output: '/report.sarif',
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
      expect(SARIFReporter).toHaveBeenCalled()
    })

    test('uses markdown format with input file', async () => {
      const { MarkdownReporter } = await import('../../../src/reporters/markdown-reporter.js')
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'markdown',
        output: '/report.md',
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
      expect(MarkdownReporter).toHaveBeenCalled()
    })

    test('passes pretty flag to reporter with input', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: '/analysis.json',
        open: false,
        pretty: true,
        verbose: false,
      })

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalledWith(expect.objectContaining({ pretty: true }))
    })

    test('passes verbose flag to reporter with input', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: true,
      })

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalledWith(expect.objectContaining({ verbose: true }))
    })
  })

  // ============================================
  // run integration - analysis mode (12 tests)
  // ============================================
  describe('run integration - analysis mode', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>, args = { path: '.' }) {
      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({ args, flags })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.config = { version: '1.0.0' }
      return command
    }

    test('runs analysis when no input provided', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
    })

    test('calls reporter.report with results', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const mockReport = vi.fn()
      ;(ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          name: 'console',
          report: mockReport,
          format: vi.fn().mockReturnValue('formatted'),
        }
      })

      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockReport).toHaveBeenCalled()
    })

    test('handles directory path', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalled()
    })

    test('runs analysis with discovered files', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>

      mockDiscoverFiles.mockResolvedValueOnce([
        {
          path: '/test/file.ts',
          absolutePath: '/test/file.ts',
        },
      ])

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalled()
    })

    test('registers rules when running analysis', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>

      mockDiscoverFiles.mockResolvedValueOnce([
        {
          path: '/test/file.ts',
          absolutePath: '/test/file.ts',
        },
      ])

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const mockRuleRegistry = RuleRegistry as ReturnType<typeof vi.fn>

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockRuleRegistry).toHaveBeenCalled()
    })

    test('processes files with violations', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>

      mockDiscoverFiles.mockResolvedValueOnce([
        {
          path: '/test/file1.ts',
          absolutePath: '/test/file1.ts',
        },
        {
          path: '/test/file2.ts',
          absolutePath: '/test/file2.ts',
        },
      ])

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const mockRuleRegistry = RuleRegistry as ReturnType<typeof vi.fn>

      const violation = createMockViolation({
        ruleId: 'test-violation',
        severity: 'warning',
        message: 'Test warning',
      })
      mockRuleRegistry.mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([violation]),
        }
      })

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalled()
    })

    test('uses gitlab format reporter in analysis mode', async () => {
      const { GitLabReporter } = await import('../../../src/reporters/gitlab-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'gitlab',
        output: '/report.json',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(GitLabReporter).toHaveBeenCalled()
    })

    test('uses junit format reporter in analysis mode', async () => {
      const { JUnitReporter } = await import('../../../src/reporters/junit-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'junit',
        output: '/report.xml',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(JUnitReporter).toHaveBeenCalled()
    })

    test('uses markdown format reporter in analysis mode', async () => {
      const { MarkdownReporter } = await import('../../../src/reporters/markdown-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'markdown',
        output: '/report.md',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(MarkdownReporter).toHaveBeenCalled()
    })

    test('uses sarif format reporter in analysis mode', async () => {
      const { SARIFReporter } = await import('../../../src/reporters/sarif-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'sarif',
        output: '/report.sarif',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(SARIFReporter).toHaveBeenCalled()
    })

    test('uses html format with output in analysis mode', async () => {
      const { HTMLReporter } = await import('../../../src/reporters/html-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/report.html',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(HTMLReporter).toHaveBeenCalled()
    })

    test('analysis result includes version from config', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const mockReport = vi.fn()
      ;(ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          name: 'console',
          report: mockReport,
          format: vi.fn().mockReturnValue('formatted'),
        }
      })

      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          version: '1.0.0',
        }),
      )
    })
  })

  // ============================================
  // openInBrowser (12 tests)
  // ============================================
  describe('openInBrowser', () => {
    function createCommandWithMocks() {
      const cmd = new Report([], {} as never)
      return cmd as unknown as {
        openInBrowser(filePath: string): Promise<void>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
      }
    }

    test('throws when file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.openInBrowser('/missing.html')).rejects.toThrow()
    })

    test('logs when opening browser', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMocks()
      cmd.log = vi.fn()
      cmd.warn = vi.fn()

      await cmd.openInBrowser('/report.html')

      expect(cmd.log).toHaveBeenCalled()
    })

    test('logs the file path being opened', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMocks()
      cmd.log = vi.fn()
      cmd.warn = vi.fn()

      await cmd.openInBrowser('/report.html')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('Opening report in browser'))
    })

    test('resolves without error when file exists', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMocks()
      cmd.log = vi.fn()
      cmd.warn = vi.fn()

      await expect(cmd.openInBrowser('/report.html')).resolves.toBeUndefined()
    })

    test('calls log at least once on success', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMocks()
      cmd.log = vi.fn()
      cmd.warn = vi.fn()

      await cmd.openInBrowser('/report.html')

      expect(cmd.log.mock.calls.length).toBeGreaterThanOrEqual(1)
    })

    test('calls log with resolved path info', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMocks()
      cmd.log = vi.fn()
      cmd.warn = vi.fn()

      await cmd.openInBrowser('/output/report.html')

      const allLogCalls = cmd.log.mock.calls.map((c: string[]) => c[0]).join(' ')
      expect(allLogCalls).toContain('report')
    })

    test('calls existsSync with resolved path', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMocks()
      cmd.log = vi.fn()
      cmd.warn = vi.fn()

      await cmd.openInBrowser('/my-report.html')

      expect(mockFs.existsSync).toHaveBeenCalled()
    })

    test('error message includes file path for missing file', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const cmd = createCommandWithMocks()
      cmd.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      try {
        await cmd.openInBrowser('/missing-report.html')
      } catch {
        // expected
      }

      expect(cmd.error).toHaveBeenCalledWith(
        expect.stringContaining('Report file not found'),
        expect.objectContaining({ exit: 1 }),
      )
    })

    test('works with various file paths', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMocks()
      cmd.log = vi.fn()
      cmd.warn = vi.fn()

      await cmd.openInBrowser('/deep/nested/path/report.html')

      expect(cmd.log).toHaveBeenCalled()
    })

    test('works with relative path', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMocks()
      cmd.log = vi.fn()
      cmd.warn = vi.fn()

      await cmd.openInBrowser('./report.html')

      expect(cmd.log).toHaveBeenCalled()
    })

    test('works with path containing spaces', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMocks()
      cmd.log = vi.fn()
      cmd.warn = vi.fn()

      await cmd.openInBrowser('/path with spaces/report.html')

      expect(cmd.log).toHaveBeenCalled()
    })

    test('works with absolute path', async () => {
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMocks()
      cmd.log = vi.fn()
      cmd.warn = vi.fn()

      await cmd.openInBrowser('/absolute/path/to/report.html')

      expect(cmd.log).toHaveBeenCalled()
    })
  })

  // ============================================
  // run integration - open browser flag (8 tests)
  // ============================================
  describe('run integration - open browser flag', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>, args = { path: '.' }) {
      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({ args, flags })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.config = { version: '1.0.0' }
      return command
    }

    test('opens browser when format is html and open flag is set', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const validResult = createMockAnalysisResult()
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/report.html',
        input: '/analysis.json',
        open: true,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
    })

    test('does not open browser when open flag is false', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const validResult = createMockAnalysisResult()
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/report.html',
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      })

      await cmd.run()
    })

    test('does not open browser when format is not html even with open flag', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: true,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      // Should not throw - open flag is ignored for non-html formats
      await cmd.run()
      expect(ConsoleReporter).toHaveBeenCalled()
    })

    test('html with open flag and analysis mode', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/report.html',
        input: undefined,
        open: true,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
    })

    test('html without open flag completes normally', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/report.html',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
    })

    test('html with open flag and no output errors correctly', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: undefined,
        input: undefined,
        open: true,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })
      const cmdWithMock = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithMock.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.run()).rejects.toThrow('--output is required')
    })

    test('json format ignores open flag', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: undefined,
        open: true,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalled()
    })

    test('markdown format ignores open flag', async () => {
      const { MarkdownReporter } = await import('../../../src/reporters/markdown-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'markdown',
        output: '/report.md',
        input: undefined,
        open: true,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(MarkdownReporter).toHaveBeenCalled()
    })
  })

  // ============================================
  // Helper function tests (10 tests)
  // ============================================
  describe('Helper functions', () => {
    test('createMockAnalysisResult returns valid structure', () => {
      const result = createMockAnalysisResult()
      expect(result).toHaveProperty('files')
      expect(result).toHaveProperty('summary')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('version')
    })

    test('createMockAnalysisResult applies overrides', () => {
      const result = createMockAnalysisResult({ version: '3.0.0' })
      expect(result.version).toBe('3.0.0')
    })

    test('createMockAnalysisResult has default files array', () => {
      const result = createMockAnalysisResult()
      expect(Array.isArray(result.files)).toBe(true)
      expect(result.files.length).toBeGreaterThan(0)
    })

    test('createMockAnalysisResult has valid summary', () => {
      const result = createMockAnalysisResult()
      expect(result.summary).toHaveProperty('totalFiles')
      expect(result.summary).toHaveProperty('errorCount')
      expect(result.summary).toHaveProperty('warningCount')
      expect(result.summary).toHaveProperty('infoCount')
    })

    test('createMockAnalysisResult can override files', () => {
      const result = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      expect(result.files).toHaveLength(0)
    })

    test('createMockViolation returns valid structure', () => {
      const v = createMockViolation()
      expect(v).toHaveProperty('ruleId')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('message')
      expect(v).toHaveProperty('filePath')
      expect(v).toHaveProperty('line')
      expect(v).toHaveProperty('column')
    })

    test('createMockViolation applies overrides', () => {
      const v = createMockViolation({ ruleId: 'custom-rule', line: 42 })
      expect(v.ruleId).toBe('custom-rule')
      expect(v.line).toBe(42)
    })

    test('createMockViolation has default severity error', () => {
      const v = createMockViolation()
      expect(v.severity).toBe('error')
    })

    test('createMockViolation can set severity to warning', () => {
      const v = createMockViolation({ severity: 'warning' })
      expect(v.severity).toBe('warning')
    })

    test('createMockViolation can set severity to info', () => {
      const v = createMockViolation({ severity: 'info' })
      expect(v.severity).toBe('info')
    })
  })

  // ============================================
  // runAnalysis - file processing (12 tests)
  // ============================================
  describe('runAnalysis - file processing', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>, args = { path: '.' }) {
      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({ args, flags })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.config = { version: '1.0.0' }
      return command
    }

    test('handles empty discovered files', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const mockReport = vi.fn()
      ;(ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          name: 'console',
          report: mockReport,
          format: vi.fn().mockReturnValue('formatted'),
        }
      })

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          files: [],
          summary: expect.objectContaining({ totalFiles: 0 }),
        }),
      )
    })

    test('handles single discovered file', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([
        { path: '/src/main.ts', absolutePath: '/src/main.ts' },
      ])

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
    })

    test('handles multiple discovered files', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([
        { path: '/src/a.ts', absolutePath: '/src/a.ts' },
        { path: '/src/b.ts', absolutePath: '/src/b.ts' },
        { path: '/src/c.ts', absolutePath: '/src/c.ts' },
        { path: '/src/d.ts', absolutePath: '/src/d.ts' },
        { path: '/src/e.ts', absolutePath: '/src/e.ts' },
      ])

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
    })

    test('initializes parser during analysis', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const { Parser } = await import('../../../src/core/parser.js')
      const mockParser = Parser as ReturnType<typeof vi.fn>

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockParser).toHaveBeenCalled()
    })

    test('disposes parser after analysis', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const mockDispose = vi.fn()
      const { Parser } = await import('../../../src/core/parser.js')
      ;(Parser as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: { getFilePath: () => '/test.ts', saveSync: vi.fn() },
            parseTime: 10,
          }),
          dispose: mockDispose,
        }
      })

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockDispose).toHaveBeenCalled()
    })

    test('handles file with error-level violations', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([
        { path: '/src/bad.ts', absolutePath: '/src/bad.ts' },
      ])

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      ;(RuleRegistry as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([
            {
              ruleId: 'no-eval',
              severity: 'error',
              message: 'Do not use eval',
              range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            },
          ]),
        }
      })

      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const mockReport = vi.fn()
      ;(ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          name: 'console',
          report: mockReport,
          format: vi.fn().mockReturnValue('formatted'),
        }
      })

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockReport).toHaveBeenCalled()
    })

    test('handles file with warning-level violations', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([
        { path: '/src/warn.ts', absolutePath: '/src/warn.ts' },
      ])

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      ;(RuleRegistry as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([
            {
              ruleId: 'no-console',
              severity: 'warning',
              message: 'Unexpected console statement',
              range: { start: { line: 5, column: 1 }, end: { line: 5, column: 12 } },
            },
          ]),
        }
      })

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
    })

    test('handles file with info-level violations', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([
        { path: '/src/info.ts', absolutePath: '/src/info.ts' },
      ])

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      ;(RuleRegistry as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([
            {
              ruleId: 'max-lines',
              severity: 'info',
              message: 'File exceeds recommended line count',
              range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
            },
          ]),
        }
      })

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
    })

    test('handles mixed violation severities across files', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([
        { path: '/src/err.ts', absolutePath: '/src/err.ts' },
        { path: '/src/warn.ts', absolutePath: '/src/warn.ts' },
      ])

      let callCount = 0
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      ;(RuleRegistry as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockImplementation(() => {
            callCount++
            if (callCount === 1) {
              return [
                {
                  ruleId: 'no-eval',
                  severity: 'error',
                  message: 'eval detected',
                  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
                },
              ]
            }
            return [
              {
                ruleId: 'no-console',
                severity: 'warning',
                message: 'console detected',
                range: { start: { line: 2, column: 1 }, end: { line: 2, column: 12 } },
              },
            ]
          }),
        }
      })

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
    })

    test('handles file with no violations', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([
        { path: '/src/clean.ts', absolutePath: '/src/clean.ts' },
      ])

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      ;(RuleRegistry as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const mockReport = vi.fn()
      ;(ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          name: 'console',
          report: mockReport,
          format: vi.fn().mockReturnValue('formatted'),
        }
      })

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.objectContaining({ errorCount: 0 }),
        }),
      )
    })

    test('handles violation with suggestion', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([
        { path: '/src/suggest.ts', absolutePath: '/src/suggest.ts' },
      ])

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      ;(RuleRegistry as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([
            {
              ruleId: 'prefer-const',
              severity: 'warning',
              message: 'Use const instead of let',
              suggestion: 'Change let to const',
              range: { start: { line: 3, column: 5 }, end: { line: 3, column: 15 } },
            },
          ]),
        }
      })

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
    })

    test('calls discoverFiles with correct patterns', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        }),
      )
    })
  })

  // ============================================
  // Flag combinations (12 tests)
  // ============================================
  describe('Flag combinations', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>, args = { path: '.' }) {
      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({ args, flags })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.config = { version: '1.0.0' }
      return command
    }

    test('pretty flag with json format', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: undefined,
        open: false,
        pretty: true,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalledWith(expect.objectContaining({ pretty: true }))
    })

    test('verbose flag passed to reporter', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: true,
        concurrency: 4,
      })

      await cmd.run()
      expect(ConsoleReporter).toHaveBeenCalledWith(expect.objectContaining({ verbose: true }))
    })

    test('outputPath passed to html reporter', async () => {
      const { HTMLReporter } = await import('../../../src/reporters/html-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/custom/report.html',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(HTMLReporter).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/custom/report.html' }),
      )
    })

    test('outputPath passed to gitlab reporter', async () => {
      const { GitLabReporter } = await import('../../../src/reporters/gitlab-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'gitlab',
        output: '/custom/gl-report.json',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(GitLabReporter).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/custom/gl-report.json' }),
      )
    })

    test('outputPath passed to junit reporter', async () => {
      const { JUnitReporter } = await import('../../../src/reporters/junit-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'junit',
        output: '/custom/junit.xml',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(JUnitReporter).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/custom/junit.xml' }),
      )
    })

    test('outputPath passed to sarif reporter', async () => {
      const { SARIFReporter } = await import('../../../src/reporters/sarif-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'sarif',
        output: '/custom/results.sarif',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(SARIFReporter).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/custom/results.sarif' }),
      )
    })

    test('outputPath passed to markdown reporter', async () => {
      const { MarkdownReporter } = await import('../../../src/reporters/markdown-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'markdown',
        output: '/custom/REPORT.md',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(MarkdownReporter).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/custom/REPORT.md' }),
      )
    })

    test('pretty and verbose flags together', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: undefined,
        open: false,
        pretty: true,
        verbose: true,
        concurrency: 4,
      })

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalledWith(
        expect.objectContaining({ pretty: true, verbose: true }),
      )
    })

    test('all flags with input file', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: '/out.json',
        input: '/analysis.json',
        open: false,
        pretty: true,
        verbose: true,
      })

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalledWith(
        expect.objectContaining({
          outputPath: '/out.json',
          pretty: true,
          verbose: true,
        }),
      )
    })

    test('console format without output works', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(ConsoleReporter).toHaveBeenCalled()
    })

    test('json format without output works', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalled()
    })

    test('html format with output and open and pretty', async () => {
      const { HTMLReporter } = await import('../../../src/reporters/html-reporter.js')
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/report.html',
        input: '/analysis.json',
        open: true,
        pretty: true,
        verbose: false,
      })

      await cmd.run()
      expect(HTMLReporter).toHaveBeenCalledWith(
        expect.objectContaining({
          outputPath: '/report.html',
          pretty: true,
        }),
      )
    })
  })

  // ============================================
  // Edge cases with special characters (10 tests)
  // ============================================
  describe('Edge cases - special characters', () => {
    function createCommandWithMocks() {
      const cmd = new Report([], {} as never)
      return cmd as unknown as {
        loadFromInput(inputPath: string): Promise<AnalysisResult>
        error: ReturnType<typeof vi.fn>
      }
    }

    test('loads analysis result with unicode in violation message', async () => {
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/src/unicode.ts',
            violations: [createMockViolation({ message: 'Unexpected token: \u00e9\u00e8\u00ea' })],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/unicode.json')

      expect(loaded.files[0].violations[0].message).toContain('\u00e9\u00e8\u00ea')
    })

    test('loads analysis result with emoji in violation message', async () => {
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/src/emoji.ts',
            violations: [createMockViolation({ message: 'Code quality \ud83d\udca9' })],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/emoji.json')

      expect(loaded.files[0].violations[0].message).toContain('\ud83d\udca9')
    })

    test('loads analysis result with file path containing spaces', async () => {
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/src/my project/components/App.tsx',
            violations: [],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/spaces.json')

      expect(loaded.files[0].filePath).toBe('/src/my project/components/App.tsx')
    })

    test('loads analysis result with deep file path', async () => {
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/file.ts',
            violations: [],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/deep.json')

      expect(loaded.files[0].filePath).toBe('/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/file.ts')
    })

    test('loads analysis result with special chars in ruleId', async () => {
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/test.ts',
            violations: [createMockViolation({ ruleId: 'namespace/rule-name.v2' })],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/special-ruleid.json')

      expect(loaded.files[0].violations[0].ruleId).toBe('namespace/rule-name.v2')
    })

    test('loads analysis result with large line numbers', async () => {
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/large.ts',
            violations: [createMockViolation({ line: 99999, column: 999 })],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/large-lines.json')

      expect(loaded.files[0].violations[0].line).toBe(99999)
    })

    test('loads analysis result with many files', async () => {
      const files = Array.from({ length: 100 }, (_, i) => ({
        filePath: `/src/file${i}.ts`,
        violations: [],
        stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
      }))
      const result = createMockAnalysisResult({
        files,
        summary: {
          totalFiles: 100,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 200,
        },
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/many-files.json')

      expect(loaded.files).toHaveLength(100)
    })

    test('loads analysis result with many violations per file', async () => {
      const violations = Array.from({ length: 50 }, (_, i) =>
        createMockViolation({ ruleId: `rule-${i}`, line: i + 1 }),
      )
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/src/many-violations.ts',
            violations,
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/many-violations.json')

      expect(loaded.files[0].violations).toHaveLength(50)
    })

    test('loads analysis result with violation containing source code', async () => {
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/test.ts',
            violations: [createMockViolation({ source: 'eval("malicious code")' })],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/with-source.json')

      expect(loaded.files[0].violations[0].source).toBe('eval("malicious code")')
    })

    test('loads analysis result with violation containing meta', async () => {
      const result = createMockAnalysisResult({
        files: [
          {
            filePath: '/test.ts',
            violations: [createMockViolation({ meta: { fixable: true, category: 'security' } })],
            stats: { parseTime: 1, analysisTime: 1, totalTime: 2 },
          },
        ],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/with-meta.json')

      expect(loaded.files[0].violations[0].meta).toEqual({ fixable: true, category: 'security' })
    })
  })

  // ============================================
  // Custom path arg (6 tests)
  // ============================================
  describe('Custom path argument', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>, args = { path: '.' }) {
      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({ args, flags })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.config = { version: '1.0.0' }
      return command
    }

    test('uses custom path argument', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          output: undefined,
          input: undefined,
          open: false,
          pretty: false,
          verbose: false,
          concurrency: 4,
        },
        { path: './src' },
      )

      await cmd.run()
    })

    test('uses src directory path', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          output: undefined,
          input: undefined,
          open: false,
          pretty: false,
          verbose: false,
          concurrency: 4,
        },
        { path: '/home/user/project/src' },
      )

      await cmd.run()
    })

    test('uses single file path', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          output: undefined,
          input: undefined,
          open: false,
          pretty: false,
          verbose: false,
          concurrency: 4,
        },
        { path: '/home/user/project/src/index.ts' },
      )

      await cmd.run()
    })

    test('uses nested directory path', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          output: undefined,
          input: undefined,
          open: false,
          pretty: false,
          verbose: false,
          concurrency: 4,
        },
        { path: './packages/core/src' },
      )

      await cmd.run()
    })

    test('json output with custom path', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          output: undefined,
          input: undefined,
          open: false,
          pretty: false,
          verbose: false,
          concurrency: 4,
        },
        { path: '/custom/path.ts' },
      )

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalled()
    })

    test('html output with custom path and input', async () => {
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const { HTMLReporter } = await import('../../../src/reporters/html-reporter.js')
      const cmd = createCommandWithMockedParse(
        {
          format: 'html',
          output: '/custom/report.html',
          input: '/analysis.json',
          open: false,
          pretty: false,
          verbose: false,
        },
        { path: '/some/path' },
      )

      await cmd.run()
      expect(HTMLReporter).toHaveBeenCalled()
    })
  })

  describe('runAnalysis - output format reporters in analysis', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>, args = { path: '.' }) {
      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({ args, flags })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.config = { version: '1.0.0' }
      return command
    }

    test('console format with file path (non-directory)', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 1,
      })

      await cmd.run()
      expect(ConsoleReporter).toHaveBeenCalled()
    })

    test('json format with analysis and concurrency 1', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 1,
      })

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalled()
    })

    test('json format with analysis and concurrency 8', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 8,
      })

      await cmd.run()
      expect(JSONReporter).toHaveBeenCalled()
    })

    test('html format with analysis and concurrency 2', async () => {
      const { HTMLReporter } = await import('../../../src/reporters/html-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: '/report.html',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 2,
      })

      await cmd.run()
      expect(HTMLReporter).toHaveBeenCalled()
    })

    test('sarif format with analysis', async () => {
      const { SARIFReporter } = await import('../../../src/reporters/sarif-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'sarif',
        output: '/results.sarif',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(SARIFReporter).toHaveBeenCalled()
    })

    test('markdown format with analysis', async () => {
      const { MarkdownReporter } = await import('../../../src/reporters/markdown-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'markdown',
        output: '/REPORT.md',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(MarkdownReporter).toHaveBeenCalled()
    })

    test('gitlab format with analysis', async () => {
      const { GitLabReporter } = await import('../../../src/reporters/gitlab-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'gitlab',
        output: '/gl-report.json',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(GitLabReporter).toHaveBeenCalled()
    })

    test('junit format with analysis', async () => {
      const { JUnitReporter } = await import('../../../src/reporters/junit-reporter.js')
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'junit',
        output: '/junit.xml',
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(JUnitReporter).toHaveBeenCalled()
    })

    test('console format with directory path and discovered files', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<
        typeof mockFs.statSync
      >)
      mockFs.existsSync.mockReturnValue(true)

      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>
      mockDiscoverFiles.mockResolvedValueOnce([
        { path: '/src/index.ts', absolutePath: '/src/index.ts' },
        { path: '/src/utils.ts', absolutePath: '/src/utils.ts' },
      ])

      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const mockReport = vi.fn()
      ;(ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          name: 'console',
          report: mockReport,
          format: vi.fn().mockReturnValue('formatted'),
        }
      })

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 2,
      })

      await cmd.run()
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.objectContaining({ totalFiles: 2 }),
        }),
      )
    })

    test('analysis result has timestamp', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const mockReport = vi.fn()
      ;(ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
          name: 'console',
          report: mockReport,
          format: vi.fn().mockReturnValue('formatted'),
        }
      })

      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
        concurrency: 4,
      })

      await cmd.run()
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      )
    })
  })

  describe('loadFromInput - path variations', () => {
    function createCommandWithMocks() {
      const cmd = new Report([], {} as never)
      return cmd as unknown as {
        loadFromInput(inputPath: string): Promise<AnalysisResult>
        error: ReturnType<typeof vi.fn>
      }
    }

    test('loads from relative path', async () => {
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMocks()
      const result = await cmd.loadFromInput('./analysis.json')

      expect(result).toEqual(validResult)
    })

    test('loads from nested path', async () => {
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMocks()
      const result = await cmd.loadFromInput('/deep/nested/path/analysis.json')

      expect(result).toEqual(validResult)
    })

    test('loads from path with dashes', async () => {
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMocks()
      const result = await cmd.loadFromInput('/my-project-reports/analysis.json')

      expect(result).toEqual(validResult)
    })

    test('loads from path with underscores', async () => {
      const validResult = createMockAnalysisResult()
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(validResult))

      const cmd = createCommandWithMocks()
      const result = await cmd.loadFromInput('/my_project/analysis_results.json')

      expect(result).toEqual(validResult)
    })

    test('loads result with version undefined', async () => {
      const result = createMockAnalysisResult({ version: undefined })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/no-version.json')

      expect(loaded.version).toBeUndefined()
    })

    test('loads result with zero counts in summary', async () => {
      const result = createMockAnalysisResult({
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
        files: [],
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/zero-counts.json')

      expect(loaded.summary.errorCount).toBe(0)
      expect(loaded.summary.warningCount).toBe(0)
      expect(loaded.summary.infoCount).toBe(0)
    })

    test('loads result with high violation counts', async () => {
      const result = createMockAnalysisResult({
        summary: {
          totalFiles: 500,
          filesWithViolations: 250,
          errorCount: 100,
          warningCount: 300,
          infoCount: 50,
          totalTime: 30000,
        },
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/high-counts.json')

      expect(loaded.summary.totalFiles).toBe(500)
      expect(loaded.summary.filesWithViolations).toBe(250)
    })

    test('loads result with long timestamp', async () => {
      const result = createMockAnalysisResult({
        timestamp: '2024-12-31T23:59:59.999Z',
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(result))

      const cmd = createCommandWithMocks()
      const loaded = await cmd.loadFromInput('/timestamp.json')

      expect(loaded.timestamp).toBe('2024-12-31T23:59:59.999Z')
    })
  })

  describe('createReporter - options propagation', () => {
    function getTestableCommand() {
      return new Report([], {} as never) as unknown as {
        createReporter(format: string, options: Record<string, unknown>): Reporter
      }
    }

    test('passes empty options to ConsoleReporter', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('console', {})
      expect(ConsoleReporter).toHaveBeenCalledWith(expect.objectContaining({}))
    })

    test('passes verbose option to ConsoleReporter', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('console', { verbose: true })
      expect(ConsoleReporter).toHaveBeenCalledWith(expect.objectContaining({ verbose: true }))
    })

    test('passes pretty option to JSONReporter', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('json', { pretty: true })
      expect(JSONReporter).toHaveBeenCalledWith(expect.objectContaining({ pretty: true }))
    })

    test('passes outputPath to GitLabReporter', async () => {
      const { GitLabReporter } = await import('../../../src/reporters/gitlab-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('gitlab', { outputPath: '/gl.json' })
      expect(GitLabReporter).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/gl.json' }),
      )
    })

    test('passes outputPath to JUnitReporter', async () => {
      const { JUnitReporter } = await import('../../../src/reporters/junit-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('junit', { outputPath: '/junit.xml' })
      expect(JUnitReporter).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/junit.xml' }),
      )
    })

    test('passes outputPath to SARIFReporter', async () => {
      const { SARIFReporter } = await import('../../../src/reporters/sarif-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('sarif', { outputPath: '/results.sarif' })
      expect(SARIFReporter).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/results.sarif' }),
      )
    })

    test('passes outputPath to MarkdownReporter', async () => {
      const { MarkdownReporter } = await import('../../../src/reporters/markdown-reporter.js')
      const cmd = getTestableCommand()
      cmd.createReporter('markdown', { outputPath: '/report.md' })
      expect(MarkdownReporter).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/report.md' }),
      )
    })

    test('markdown reporter has correct name', () => {
      const cmd = getTestableCommand()
      const reporter = cmd.createReporter('markdown', {})
      expect(reporter.name).toBe('markdown')
    })
  })

  describe('AnalysisResult structure validation', () => {
    test('result from analysis has files as array', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const mockReport = vi.fn()
      ;(ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return { name: 'console', report: mockReport, format: vi.fn().mockReturnValue('x') }
      })
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags: {
          format: 'console',
          output: undefined,
          input: undefined,
          open: false,
          pretty: false,
          verbose: false,
          concurrency: 4,
        },
      })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.config = { version: '1.0.0' }

      await command.run()
      expect(mockReport).toHaveBeenCalledWith(expect.objectContaining({ files: expect.any(Array) }))
    })

    test('result from analysis has summary with all counts', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js')
      const mockReport = vi.fn()
      ;(ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return { name: 'console', report: mockReport, format: vi.fn().mockReturnValue('x') }
      })
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<
        typeof mockFs.statSync
      >)

      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags: {
          format: 'console',
          output: undefined,
          input: undefined,
          open: false,
          pretty: false,
          verbose: false,
          concurrency: 4,
        },
      })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.config = { version: '1.0.0' }

      await command.run()
      const callArg = mockReport.mock.calls[0][0]
      expect(callArg.summary).toHaveProperty('errorCount')
      expect(callArg.summary).toHaveProperty('warningCount')
      expect(callArg.summary).toHaveProperty('infoCount')
      expect(callArg.summary).toHaveProperty('totalFiles')
      expect(callArg.summary).toHaveProperty('filesWithViolations')
      expect(callArg.summary).toHaveProperty('totalTime')
    })

    test('result from input preserves all original fields', async () => {
      const originalResult = createMockAnalysisResult({
        files: [
          {
            filePath: '/complex.ts',
            violations: [
              createMockViolation({ severity: 'error', ruleId: 'r1', line: 10, column: 5 }),
              createMockViolation({ severity: 'warning', ruleId: 'r2', line: 20, column: 1 }),
            ],
            stats: { parseTime: 100, analysisTime: 200, totalTime: 300 },
          },
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 1,
          infoCount: 0,
          totalTime: 300,
        },
      })
      mockFs.existsSync.mockReturnValue(true)
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(originalResult))

      const command = new Report([], {} as never)
      const cmdWithMock = command as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        config: { version: string }
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags: {
          format: 'json',
          output: undefined,
          input: '/complex.json',
          open: false,
          pretty: false,
          verbose: false,
        },
      })
      cmdWithMock.log = vi.fn()
      cmdWithMock.warn = vi.fn()
      cmdWithMock.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })
      cmdWithMock.config = { version: '1.0.0' }

      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js')
      const mockReport = vi.fn()
      ;(JSONReporter as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return { name: 'json', report: mockReport, format: vi.fn().mockReturnValue('{}') }
      })

      await command.run()
      expect(mockReport).toHaveBeenCalledWith(originalResult)
    })
  })
})
