import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import type { DiscoveredFile } from '../../../src/core/file-discovery.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'

class ExitCodeError extends Error {
  code: number
  constructor(code: number) {
    super(`Exit code: ${code}`)
    this.code = code
    this.name = 'ExitCodeError'
  }
}

function createMockFile(path: string): DiscoveredFile {
  return { path, absolutePath: `/absolute/${path}` }
}

function createMockViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    ruleId: 'test-rule',
    severity: 'warning',
    message: 'Test violation',
    filePath: '/test/file.ts',
    range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
    ...overrides,
  }
}

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: '',
  })),
}))

vi.mock('path', async () => {
  const actual = await vi.importActual<typeof import('path')>('path')
  return { ...actual, resolve: vi.fn((p: string) => `/resolved/${p}`) }
})

vi.mock('../../../src/core/file-discovery.js', () => ({ discoverFiles: vi.fn() }))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn(),
    parseFile: vi.fn().mockResolvedValue({
      sourceFile: { getFilePath: () => '/test/file.ts', getText: () => 'test code' },
      filePath: '/test/file.ts',
      parseTime: 10,
    }),
  })),
}))

vi.mock('../../../src/core/reporter.js', () => ({
  Reporter: vi
    .fn()
    .mockImplementation(() => ({ writeReport: vi.fn().mockResolvedValue(undefined) })),
}))

vi.mock('../../../src/ast/visitor.js', () => ({ traverseAST: vi.fn() }))

vi.mock('../../../src/utils/errors.js', () => ({
  CLIError: class CLIError extends Error {
    suggestions: string[]
    constructor(message: string, options: { suggestions?: string[] } = {}) {
      super(message)
      this.suggestions = options.suggestions ?? []
      this.name = 'CLIError'
    }
  },
}))

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { setLevel: vi.fn(), warn: vi.fn(), debug: vi.fn(), info: vi.fn() },
  LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 },
}))

vi.mock('../../../src/config/discovery.js', () => ({
  findConfigPath: vi.fn().mockResolvedValue(null),
}))

vi.mock('../../../src/config/cache.js', () => ({
  ConfigCache: vi.fn().mockImplementation(() => ({ getConfig: vi.fn().mockResolvedValue(null) })),
}))

vi.mock('../../../src/config/validator.js', () => ({ validateConfig: vi.fn((c) => c) }))

vi.mock('../../../src/config/merger.js', () => ({
  mergeConfigs: vi.fn((base, cli) => ({ ...base, ...cli })),
}))

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {},
  getRule: vi.fn(),
  getRuleIds: vi.fn().mockReturnValue([]),
  getRuleCategory: vi.fn().mockReturnValue('best-practices'),
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(() => ({
    register: vi.fn(),
    runRules: vi.fn().mockImplementation((_sourceFile, _filePath) => {
      const violations: RuleViolation[] = []
      return violations
    }),
    getEnabledRules: vi.fn().mockReturnValue([]),
    getRule: vi.fn(),
    disable: vi.fn(),
  })),
}))

interface TestableCommand {
  determineExitCode(summary: { errors: number; warnings: number }, failOnWarnings: boolean): number
}

describe('Analyze Command', () => {
  let Analyze: typeof import('../../../src/commands/analyze.js').default
  let mockDiscoverFiles: ReturnType<typeof vi.fn>
  let mockTraverseAST: ReturnType<typeof vi.fn>
  let mockConsoleLog: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockDiscoverFiles = (await import('../../../src/core/file-discovery.js'))
      .discoverFiles as ReturnType<typeof vi.fn>
    mockTraverseAST = (await import('../../../src/ast/visitor.js')).traverseAST as ReturnType<
      typeof vi.fn
    >

    mockDiscoverFiles.mockResolvedValue([createMockFile('test.ts')])
    mockTraverseAST.mockImplementation(() => {})
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    Analyze = (await import('../../../src/commands/analyze.js')).default
  })

  afterEach(() => {
    mockConsoleLog.mockRestore()
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Analyze.description).toBe('Analyze code for violations and issues')
    })

    test('has args defined with path', () => {
      expect(Analyze.args).toBeDefined()
      expect(Analyze.args.path).toBeDefined()
    })

    test('has all required flags', () => {
      expect(Analyze.flags).toBeDefined()
      expect(Analyze.flags.format).toBeDefined()
      expect(Analyze.flags.output).toBeDefined()
      expect(Analyze.flags.quiet).toBeDefined()
      expect(Analyze.flags.verbose).toBeDefined()
      expect(Analyze.flags.files).toBeDefined()
      expect(Analyze.flags.ignore).toBeDefined()
      expect(Analyze.flags.rules).toBeDefined()
    })

    test('has fail-on-warnings flag', () => {
      expect(Analyze.flags['fail-on-warnings']).toBeDefined()
    })

    test('has examples defined', () => {
      expect(Analyze.examples).toBeDefined()
      expect(Analyze.examples.length).toBeGreaterThan(0)
    })

    test('format flag has correct options', () => {
      expect(Analyze.flags.format.options).toEqual([
        'console',
        'html',
        'json',
        'junit',
        'markdown',
        'sarif',
        'gitlab',
      ])
    })

    test('format flag has default value console', () => {
      expect(Analyze.flags.format.default).toBe('console')
    })

    test('quiet flag has default false', () => {
      expect(Analyze.flags.quiet.default).toBe(false)
    })

    test('verbose flag has default false', () => {
      expect(Analyze.flags.verbose.default).toBe(false)
    })
  })

  describe('Flag characters', () => {
    test('files flag has char f', () => {
      expect(Analyze.flags.files.char).toBe('f')
    })
    test('ignore flag has char i', () => {
      expect(Analyze.flags.ignore.char).toBe('i')
    })
    test('rules flag has char r', () => {
      expect(Analyze.flags.rules.char).toBe('r')
    })
    test('config flag has char c', () => {
      expect(Analyze.flags.config.char).toBe('c')
    })
    test('output flag has char o', () => {
      expect(Analyze.flags.output.char).toBe('o')
    })
    test('quiet flag has char q', () => {
      expect(Analyze.flags.quiet.char).toBe('q')
    })
    test('verbose flag has char v', () => {
      expect(Analyze.flags.verbose.char).toBe('v')
    })
  })

  describe('Multiple value flags', () => {
    test('files flag supports multiple', () => {
      expect(Analyze.flags.files.multiple).toBe(true)
    })
    test('ignore flag supports multiple', () => {
      expect(Analyze.flags.ignore.multiple).toBe(true)
    })
    test('rules flag supports multiple', () => {
      expect(Analyze.flags.rules.multiple).toBe(true)
    })
  })

  describe('Args configuration', () => {
    test('path arg has description', () => {
      expect(Analyze.args.path.description).toBe('Path to analyze (file or directory)')
    })
    test('path arg is not required', () => {
      expect(Analyze.args.path.required).toBe(false)
    })
    test('path arg defaults to dot', () => {
      expect(Analyze.args.path.default).toBe('.')
    })
  })

  describe('determineExitCode', () => {
    function getTestableCommand(): TestableCommand {
      return new Analyze([], {} as never) as unknown as TestableCommand
    }

    test('returns 0 for no errors or warnings', () => {
      expect(getTestableCommand().determineExitCode({ errors: 0, warnings: 0 }, false)).toBe(0)
    })

    test('returns 1 for errors', () => {
      expect(getTestableCommand().determineExitCode({ errors: 1, warnings: 0 }, false)).toBe(1)
    })

    test('returns 0 for warnings without fail-on-warnings', () => {
      expect(getTestableCommand().determineExitCode({ errors: 0, warnings: 5 }, false)).toBe(0)
    })

    test('returns 2 for warnings with fail-on-warnings', () => {
      expect(getTestableCommand().determineExitCode({ errors: 0, warnings: 1 }, true)).toBe(2)
    })

    test('returns 1 for errors even with fail-on-warnings', () => {
      expect(getTestableCommand().determineExitCode({ errors: 1, warnings: 5 }, true)).toBe(1)
    })

    test('returns 1 for multiple errors', () => {
      expect(getTestableCommand().determineExitCode({ errors: 10, warnings: 0 }, false)).toBe(1)
    })

    test('returns 2 for multiple warnings with fail-on-warnings', () => {
      expect(getTestableCommand().determineExitCode({ errors: 0, warnings: 10 }, true)).toBe(2)
    })
  })

  describe('catch error handling', () => {
    test('handles CLIError with suggestions', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const command = new Analyze([], {} as never)
      const cmdWithMock = command as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithMock.error = vi.fn(() => {
        throw new Error('cmd')
      })
      await expect(command.catch(new CLIError('Test', { suggestions: ['s1'] }))).rejects.toThrow()
    })

    test('re-throws non-CLIError', async () => {
      const command = new Analyze([], {} as never)
      await expect(command.catch(new Error('Regular'))).rejects.toThrow('Regular')
    })

    test('handles CLIError without suggestions', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const command = new Analyze([], {} as never)
      const cmdWithMock = command as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithMock.error = vi.fn(() => {
        throw new Error('cmd')
      })
      await expect(command.catch(new CLIError('Test'))).rejects.toThrow()
    })
  })

  describe('run integration', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Analyze([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags,
      })
      return command
    }

    test('calls discoverFiles', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({
        files: [],
        ignore: [],
        format: 'console',
        quiet: true,
        verbose: false,
        'fail-on-warnings': false,
      })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }
      try {
        await cmd.run()
      } catch {
        /* empty */
      }
      expect(mockDiscoverFiles).toHaveBeenCalled()
    })

    test('calls Reporter with json format', async () => {
      const { Reporter } = await import('../../../src/core/reporter.js')
      mockDiscoverFiles.mockResolvedValue([createMockFile('test.ts')])
      const cmd = createCommandWithMockedParse({
        files: [],
        ignore: [],
        format: 'json',
        output: '/out.json',
        quiet: true,
        verbose: false,
        'fail-on-warnings': false,
      })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }
      try {
        await cmd.run()
      } catch {
        /* empty */
      }
      expect(Reporter).toHaveBeenCalledWith(
        expect.objectContaining({ format: 'json', outputPath: '/out.json' }),
      )
    })

    test('sets DEBUG log level when verbose', async () => {
      const { logger, LogLevel } = await import('../../../src/utils/logger.js')
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({
        files: [],
        ignore: [],
        format: 'console',
        quiet: false,
        verbose: true,
        'fail-on-warnings': false,
      })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }
      try {
        await cmd.run()
      } catch {
        /* empty */
      }
      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
    })

    test('sets SILENT log level when quiet', async () => {
      const { logger, LogLevel } = await import('../../../src/utils/logger.js')
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({
        files: [],
        ignore: [],
        format: 'console',
        quiet: true,
        verbose: false,
        'fail-on-warnings': false,
      })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }
      try {
        await cmd.run()
      } catch {
        /* empty */
      }
      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.SILENT)
    })

    test('exits with 0 when no files found', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({
        files: [],
        ignore: [],
        format: 'console',
        quiet: false,
        verbose: false,
        'fail-on-warnings': false,
      })
      let exitCode = 0
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }
      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('handles multiple files', async () => {
      mockDiscoverFiles.mockResolvedValue([
        createMockFile('a.ts'),
        createMockFile('b.ts'),
        createMockFile('c.ts'),
      ])
      const cmd = createCommandWithMockedParse({
        files: [],
        ignore: [],
        format: 'console',
        quiet: true,
        verbose: false,
        'fail-on-warnings': false,
      })
      let exitCode = 0
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }
      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('continues on parse error', async () => {
      mockDiscoverFiles.mockResolvedValue([createMockFile('good.ts'), createMockFile('bad.ts')])
      const { Parser } = await import('../../../src/core/parser.js')
      ;(Parser as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        parseFile: vi.fn().mockImplementation(async (fp: string) => {
          if (fp.includes('bad')) throw new Error('Parse error')
          return { sourceFile: { getFilePath: () => fp }, filePath: fp, parseTime: 10 }
        }),
      }))
      const cmd = createCommandWithMockedParse({
        files: [],
        ignore: [],
        format: 'console',
        quiet: true,
        verbose: false,
        'fail-on-warnings': false,
      })
      let exitCode = 0
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }
      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('counts violations by severity', async () => {
      const { Reporter } = await import('../../../src/core/reporter.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      mockDiscoverFiles.mockResolvedValue([createMockFile('m.ts')])
      ;(RuleRegistry as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        register: vi.fn(),
        runRules: vi
          .fn()
          .mockReturnValue([
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'info' }),
            createMockViolation({ severity: 'info' }),
            createMockViolation({ severity: 'info' }),
          ]),
        getEnabledRules: vi.fn().mockReturnValue([]),
        getRule: vi.fn(),
      }))

      let data: { summary: { errors: number; warnings: number; info: number } } | undefined
      ;(Reporter as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        writeReport: vi.fn().mockImplementation((d: typeof data) => {
          data = d
          return Promise.resolve()
        }),
      }))
      const cmd = createCommandWithMockedParse({
        files: [],
        ignore: [],
        format: 'json',
        quiet: true,
        verbose: false,
        'fail-on-warnings': false,
      })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }
      try {
        await cmd.run()
      } catch {
        /* empty */
      }
      expect(data?.summary.errors).toBe(2)
      expect(data?.summary.warnings).toBe(1)
      expect(data?.summary.info).toBe(3)
    })
  })

  describe('loadConfig fallback', () => {
    test('falls back to defaults when configPath found but getConfig returns null', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { ConfigCache } = await import('../../../src/config/cache.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')

      ;(findConfigPath as ReturnType<typeof vi.fn>).mockResolvedValueOnce('/path/to/config.json')
      ;(ConfigCache as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        getConfig: vi.fn().mockResolvedValue(null),
      }))

      mockDiscoverFiles.mockResolvedValue([])
      const command = new Analyze([], {} as never)
      ;(command as unknown as { parse: ReturnType<typeof vi.fn> }).parse = vi
        .fn()
        .mockResolvedValue({
          args: { path: '.' },
          flags: {
            files: ['*.ts'],
            ignore: ['node_modules'],
            format: 'console',
            quiet: true,
            verbose: false,
            'fail-on-warnings': false,
          },
        })
      ;(command as unknown as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      try {
        await command.run()
      } catch {
        /* empty */
      }

      expect(mergeConfigs).toHaveBeenCalledWith({}, { files: ['*.ts'], ignore: ['node_modules'] })
    })
  })

  describe('setupRuleRegistry with requested rules', () => {
    test('disables rules not in requested list', async () => {
      vi.resetModules()

      const mockDisable = vi.fn()
      const mockRegister = vi.fn()

      vi.doMock('../../../src/rules/index.js', () => ({
        allRules: {
          'rule-one': { meta: { id: 'rule-one' } },
          'rule-two': { meta: { id: 'rule-two' } },
        },
        getRule: vi.fn(),
        getRuleIds: vi.fn().mockReturnValue(['rule-one', 'rule-two']),
        getRuleCategory: vi.fn().mockReturnValue('style'),
      }))

      vi.doMock('../../../src/core/rule-registry.js', () => ({
        RuleRegistry: vi.fn().mockImplementation(() => ({
          register: mockRegister,
          runRules: vi.fn().mockReturnValue([]),
          getEnabledRules: vi.fn().mockReturnValue([]),
          getRule: vi.fn(),
          disable: mockDisable,
        })),
      }))

      const { default: AnalyzeCmd } = await import('../../../src/commands/analyze.js')
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValue([createMockFile('test.ts')])

      const command = new AnalyzeCmd([], {} as never)
      ;(command as unknown as { parse: ReturnType<typeof vi.fn> }).parse = vi
        .fn()
        .mockResolvedValue({
          args: { path: '.' },
          flags: {
            files: [],
            ignore: [],
            format: 'console',
            quiet: true,
            verbose: false,
            'fail-on-warnings': false,
            rules: ['rule-one'],
          },
        })
      ;(command as unknown as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      try {
        await command.run()
      } catch {
        /* empty */
      }

      expect(mockDisable).toHaveBeenCalledWith('rule-two')
      expect(mockDisable).not.toHaveBeenCalledWith('rule-one')
    })
  })
})
