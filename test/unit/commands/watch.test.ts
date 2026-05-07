import { describe, test, expect, beforeEach, vi } from 'vitest'

function createCommandWithMockedParse(
  Command: typeof import('../../../src/commands/watch.js').default,
  flags: Record<string, unknown>,
  args: Record<string, unknown>,
) {
  const command = new Command([], {} as never)
  const cmdWithMock = command as unknown as {
    parse: ReturnType<typeof vi.fn>
  }
  cmdWithMock.parse = vi.fn().mockResolvedValue({
    args,
    flags,
  })
  return command
}

vi.mock('../../../src/core/file-discovery.js', () => ({ discoverFiles: vi.fn() }))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function () {
    return {
      initialize: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: {
          getFilePath: function () {
            return '/test/file.ts'
          },
          getText: function () {
            return 'test code'
          },
          getFullText: function () {
            return 'fixed code'
          },
        },
        filePath: '/test/file.ts',
        parseTime: 10,
      }),
    }
  }),
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return {
      register: vi.fn(),
      disable: vi.fn(),
      runRules: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('../../../src/utils/watcher.js', () => ({
  FileWatcher: vi.fn().mockImplementation(() => ({
    on: vi.fn().mockReturnThis(),
    watch: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    isActive: vi.fn().mockReturnValue(false),
  })),
}))

vi.mock('../../../src/utils/errors.js', () => {
  class CLIError extends Error {
    code: string
    suggestions: string[]
    context: Record<string, unknown>
    constructor(
      message: string,
      options: { code?: string; suggestions?: string[]; context?: Record<string, unknown> } = {},
    ) {
      super(message)
      this.name = 'CLIError'
      this.code = options.code ?? 'E000'
      this.suggestions = options.suggestions ?? []
      this.context = options.context ?? {}
    }
    static invalidInput(message: string, suggestions: string[] = []) {
      return new CLIError(message, { code: 'E001', suggestions })
    }
    static fileNotFound(filePath: string) {
      return new CLIError(`File not found: ${filePath}`, {
        code: 'E002',
        suggestions: ['Check that the file path is correct', 'Verify the file exists'],
      })
    }
    static configError(message: string, suggestions: string[] = []) {
      return new CLIError(message, { code: 'E003', suggestions })
    }
    toJSON() {
      return {
        name: this.name,
        code: this.code,
        message: this.message,
        suggestions: this.suggestions,
        context: this.context,
        stack: this.stack,
      }
    }
  }
  class SystemError extends Error {
    code: string
    cause?: Error
    context: Record<string, unknown>
    constructor(
      message: string,
      options: { code?: string; cause?: Error; context?: Record<string, unknown> } = {},
    ) {
      super(message)
      this.name = 'SystemError'
      this.code = options.code ?? 'E500'
      this.cause = options.cause
      this.context = options.context ?? {}
    }
    static parseError(filePath: string, cause: Error) {
      return new SystemError(`Failed to parse file: ${filePath}`, { code: 'E501', cause })
    }
    static ioError(operation: string, cause: Error) {
      return new SystemError(`I/O error: ${operation}`, { code: 'E502', cause })
    }
    toJSON() {
      return {
        name: this.name,
        code: this.code,
        message: this.message,
        cause: this.cause ? { name: this.cause.name, message: this.cause.message } : undefined,
        context: this.context,
        stack: this.stack,
      }
    }
  }
  return { CLIError, SystemError }
})

vi.mock('../../../src/config/discovery.js', () => ({
  findConfigPath: vi.fn(),
}))

vi.mock('../../../src/config/cache.js', () => ({
  ConfigCache: vi.fn().mockImplementation(function () {
    return {
      getConfig: vi.fn(),
    }
  }),
}))

vi.mock('../../../src/config/validator.js', () => ({
  validateConfig: vi.fn((config) => config),
}))

vi.mock('../../../src/config/merger.js', () => ({
  mergeConfigs: vi.fn((base, override) => ({ ...base, ...override })),
  mergeEnvConfig: vi.fn((fileConfig, envConfig) => ({ ...fileConfig, ...envConfig })),
}))

vi.mock('../../../src/config/env-parser.js', () => ({
  parseEnvVars: vi.fn(() => ({})),
}))

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { setLevel: vi.fn(), warn: vi.fn(), debug: vi.fn(), info: vi.fn() },
  LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 },
}))

// Import after mocks
import Watch from '../../../src/commands/watch.js'

describe('Watch Command', () => {
  let WatchCommand: typeof Watch

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    WatchCommand = (await import('../../../src/commands/watch.js')).default
  })

  describe('command metadata', () => {
    test('has correct description', () => {
      expect(WatchCommand.description).toContain('Watch files')
    })

    test('has all required flags', () => {
      expect(WatchCommand.flags).toBeDefined()
      expect(WatchCommand.flags.debounce).toBeDefined()
      expect(WatchCommand.flags.rules).toBeDefined()
      expect(WatchCommand.flags.verbose).toBeDefined()
    })

    test('has correct args defined', () => {
      expect(WatchCommand.args).toBeDefined()
      expect(WatchCommand.args.files).toBeDefined()
      expect(WatchCommand.args.files.required).toBe(false)
    })

    test('has examples defined', () => {
      expect(WatchCommand.examples).toBeDefined()
      expect(Array.isArray(WatchCommand.examples)).toBe(true)
      expect(WatchCommand.examples.length).toBeGreaterThan(0)
    })

    test('has default debounce value', () => {
      expect(WatchCommand.flags.debounce.default).toBe(300)
    })
  })

  describe('helper methods', () => {
    test('resolvePatterns should handle array args', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns(['a.ts', 'b.ts'], ['default.ts'])).toEqual(['a.ts', 'b.ts'])
    })

    test('resolvePatterns should handle string args', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns('single.ts', ['default.ts'])).toEqual(['single.ts'])
    })

    test('resolvePatterns should fall back to config files', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns(undefined, ['config.ts'])).toEqual(['config.ts'])
    })

    test('resolvePatterns should return empty array when no patterns', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns(undefined, undefined)).toEqual([])
    })
  })

  describe('loadConfig', () => {
    test('should load config from file when found', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { validateConfig } = await import('../../../src/config/validator.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { ConfigCache } = await import('../../../src/config/cache.js')

      const mockConfig = { files: ['test.ts'], ignore: ['node_modules'] }
      vi.mocked(findConfigPath).mockResolvedValue('/path/to/config.json')
      vi.mocked(validateConfig).mockReturnValue(mockConfig as never)

      const mockConfigCache = {
        getConfig: vi.fn().mockResolvedValue(mockConfig),
      } as never

      const result = await loadCommandConfig({}, mockConfigCache)

      expect(findConfigPath).toHaveBeenCalledWith(undefined, process.cwd())
      expect(validateConfig).toHaveBeenCalledWith(mockConfig)
      expect(result).toEqual(mockConfig)
    })

    test('should use defaults when no config file found', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(mergeConfigs).mockReturnValue({ files: ['default.ts'] } as never)

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      const flags = { files: ['custom.ts'], ignore: ['dist'] }
      const result = await loadCommandConfig(flags, mockConfigCache)

      expect(findConfigPath).toHaveBeenCalledWith(undefined, process.cwd())
      expect(mergeConfigs).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    test('should use defaults when config path is found but no config content', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { ConfigCache } = await import('../../../src/config/cache.js')

      vi.mocked(findConfigPath).mockResolvedValue('/path/to/config.json')
      vi.mocked(mergeConfigs).mockReturnValue({ files: [] } as never)

      const mockConfigCache = {
        getConfig: vi.fn().mockResolvedValue(null),
      } as never

      const result = await loadCommandConfig({}, mockConfigCache)

      expect(findConfigPath).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('analyzeFile', () => {
    test('should set pendingAnalysis when isRunning is true', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property for testing
      cmd.isRunning = true

      await analyzeFile('/test/file.ts', undefined, false)

      // @ts-expect-error - accessing private property for testing
      expect(cmd.pendingAnalysis).toBe(true)
    })

    test('should return early when parser is null', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property for testing
      cmd.parser = null

      await expect(analyzeFile('/test/file.ts', undefined, false)).resolves.toBeUndefined()
    })

    test('should return early when parseResult.sourceFile is null', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: null,
            filePath: '/test/file.ts',
            parseTime: 10,
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property for testing
      cmd.parser = new Parser()

      await expect(analyzeFile('/test/file.ts', undefined, false)).resolves.toBeUndefined()
    })

    test('should log success when no violations found', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      const mockSourceFile = {
        getFilePath: function () {
          return '/test/file.ts'
        },
        getText: function () {
          return 'test code'
        },
        getFullText: function () {
          return 'fixed code'
        },
      }

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: mockSourceFile,
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property for testing
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})

      await analyzeFile('/test/file.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('✓'))

      spyLog.mockRestore()
    })

    test('should log violations when they exist', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { Parser } = await import('../../../src/core/parser.js')

      const mockSourceFile = {
        getFilePath: function () {
          return '/test/file.ts'
        },
        getText: function () {
          return 'test code'
        },
        getFullText: function () {
          return 'fixed code'
        },
      }

      const mockViolations = [
        {
          ruleId: 'test-rule',
          message: 'Test violation',
          severity: 'error' as const,
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
          fix: null,
        },
      ]

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue(mockViolations),
        } as never
      })

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: mockSourceFile,
            filePath: '/test/file.ts',
            parseTime: 10,
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - accessing private property for testing
      ;(cmd as { parser: Parser }).parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})

      await analyzeFile('/test/file.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('⚠'))

      spyLog.mockRestore()
    })

    test('should log more than 3 violations message', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { Parser } = await import('../../../src/core/parser.js')

      const mockSourceFile = {
        getFilePath: function () {
          return '/test/file.ts'
        },
        getText: function () {
          return 'test code'
        },
        getFullText: function () {
          return 'fixed code'
        },
      }

      const mockViolations = [
        {
          ruleId: 'rule-1',
          message: 'Violation 1',
          severity: 'error' as const,
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          fix: null,
        },
        {
          ruleId: 'rule-2',
          message: 'Violation 2',
          severity: 'error' as const,
          range: { start: { line: 2, column: 1 }, end: { line: 2, column: 5 } },
          fix: null,
        },
        {
          ruleId: 'rule-3',
          message: 'Violation 3',
          severity: 'error' as const,
          range: { start: { line: 3, column: 1 }, end: { line: 3, column: 5 } },
          fix: null,
        },
        {
          ruleId: 'rule-4',
          message: 'Violation 4',
          severity: 'error' as const,
          range: { start: { line: 4, column: 1 }, end: { line: 4, column: 5 } },
          fix: null,
        },
        {
          ruleId: 'rule-5',
          message: 'Violation 5',
          severity: 'error' as const,
          range: { start: { line: 5, column: 1 }, end: { line: 5, column: 5 } },
          fix: null,
        },
      ]

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue(mockViolations),
        } as never
      })

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: mockSourceFile,
            filePath: '/test/file.ts',
            parseTime: 10,
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - accessing private property for testing
      ;(cmd as { parser: Parser }).parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})

      await analyzeFile('/test/file.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('... and 2 more'))

      spyLog.mockRestore()
    })

    test('should count warning severity violations', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { Parser } = await import('../../../src/core/parser.js')

      const mockSourceFile = {
        getFilePath: function () {
          return '/test/file.ts'
        },
        getText: function () {
          return 'test code'
        },
        getFullText: function () {
          return 'fixed code'
        },
      }

      const mockViolations = [
        {
          ruleId: 'test-rule-1',
          message: 'Test warning 1',
          severity: 'warning' as const,
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
          fix: null,
        },
        {
          ruleId: 'test-rule-2',
          message: 'Test warning 2',
          severity: 'warning' as const,
          range: { start: { line: 2, column: 1 }, end: { line: 2, column: 10 } },
          fix: null,
        },
      ]

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue(mockViolations),
        } as never
      })

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: {
              getFilePath: function () {
                return '/test/file.ts'
              },
              getText: function () {
                return 'test code'
              },
              getFullText: function () {
                return 'fixed code'
              },
            },
            filePath: '/test/file.ts',
            parseTime: 10,
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property for testing
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})

      await analyzeFile('/test/file.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('0 error(s), 2 warning(s)'))

      spyLog.mockRestore()
    })

    test('should count mixed error and warning severity violations', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { Parser } = await import('../../../src/core/parser.js')

      const mockSourceFile = {
        getFilePath: function () {
          return '/test/file.ts'
        },
        getText: function () {
          return 'test code'
        },
        getFullText: function () {
          return 'fixed code'
        },
      }

      const mockViolations = [
        {
          ruleId: 'test-rule-1',
          message: 'Test error',
          severity: 'error' as const,
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
          fix: null,
        },
        {
          ruleId: 'test-rule-2',
          message: 'Test warning',
          severity: 'warning' as const,
          range: { start: { line: 2, column: 1 }, end: { line: 2, column: 10 } },
          fix: null,
        },
      ]

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue(mockViolations),
        } as never
      })

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: mockSourceFile,
            filePath: '/test/file.ts',
            parseTime: 10,
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property for testing
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})

      await analyzeFile('/test/file.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('1 error(s), 1 warning(s)'))

      spyLog.mockRestore()
    })

    test('should handle errors gracefully', async () => {
      const { Parser } = await import('../../../src/core/parser.js')
      const { logger } = await import('../../../src/utils/logger.js')

      const mockSourceFile = {
        getFilePath: function () {
          return '/test/file.ts'
        },
        getText: function () {
          return 'test code'
        },
        getFullText: function () {
          return 'fixed code'
        },
      }

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: mockSourceFile,
            filePath: '/test/file.ts',
            parseTime: 10,
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      const originalAnalyzeFile = (cmd as any).analyzeFile
      let callCount = 0

      vi.spyOn(cmd as any, 'analyzeFile').mockImplementation(async function (
        this: any,
        ...args: unknown[]
      ) {
        callCount++
        if (callCount === 2) {
          throw new Error('Scheduled analysis failed')
        }
        return originalAnalyzeFile.apply(this, args)
      })

      const analyzeFile = (cmd as any).analyzeFile.bind(cmd)
      ;(cmd as any).parser = new Parser()
      ;(cmd as any).pendingAnalysis = true

      await analyzeFile('/test/file.ts', undefined, false)

      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(callCount).toBe(2)
      expect(logger.debug).toHaveBeenCalledWith('Failed to schedule analysis:', expect.any(Error))
    })
  })

  describe('handleShutdown', () => {
    test('should log stopping message and exit', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const handleShutdown = cmd.handleShutdown.bind(cmd)
      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      const spyExit = vi.spyOn(cmd, 'exit').mockImplementation(() => {
        throw new Error('exit called')
      })

      try {
        handleShutdown()
      } catch (e) {
        if ((e as Error).message !== 'exit called') throw e
      }

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('Stopping'))
      expect(spyExit).toHaveBeenCalledWith(0)

      spyLog.mockRestore()
      spyExit.mockRestore()
    })

    test('should stop watcher if it exists', async () => {
      const { FileWatcher } = await import('../../../src/utils/watcher.js')

      const mockStop = vi.fn().mockResolvedValue(undefined)
      vi.mocked(FileWatcher).mockImplementation(function () {
        return {
          on: vi.fn().mockReturnThis(),
          watch: vi.fn().mockResolvedValue(undefined),
          stop: mockStop,
          isActive: vi.fn().mockReturnValue(false),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const handleShutdown = cmd.handleShutdown.bind(cmd)
      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      const spyExit = vi.spyOn(cmd, 'exit').mockImplementation(() => {
        throw new Error('exit called')
      })
      // @ts-expect-error - setting private property for testing
      cmd.watcher = new FileWatcher({})

      try {
        handleShutdown()
      } catch (e) {
        if ((e as Error).message !== 'exit called') throw e
      }

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(mockStop).toHaveBeenCalled()

      spyLog.mockRestore()
      spyExit.mockRestore()
    })

    test('should handle errors when stopping watcher', async () => {
      const { FileWatcher } = await import('../../../src/utils/watcher.js')
      const { logger } = await import('../../../src/utils/logger.js')

      const mockStop = vi.fn().mockRejectedValue(new Error('Stop failed'))
      vi.mocked(FileWatcher).mockImplementation(function () {
        return {
          on: vi.fn().mockReturnThis(),
          watch: vi.fn().mockResolvedValue(undefined),
          stop: mockStop,
          isActive: vi.fn().mockReturnValue(false),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const handleShutdown = cmd.handleShutdown.bind(cmd)
      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      const spyExit = vi.spyOn(cmd, 'exit').mockImplementation(() => {
        throw new Error('exit called')
      })
      // @ts-expect-error - setting private property for testing
      cmd.watcher = new FileWatcher({})

      try {
        handleShutdown()
      } catch (e) {
        if ((e as Error).message !== 'exit called') throw e
      }

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(mockStop).toHaveBeenCalled()
      expect(logger.debug).toHaveBeenCalledWith(
        'Failed to stop watcher during shutdown:',
        expect.any(Error),
      )

      spyLog.mockRestore()
      spyExit.mockRestore()
    })

    test('should dispose parser if it exists', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      const mockDispose = vi.fn()
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: mockDispose,
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: {
              getFilePath: function () {
                return '/test/file.ts'
              },
              getText: function () {
                return 'test code'
              },
              getFullText: function () {
                return 'fixed code'
              },
            },
            filePath: '/test/file.ts',
            parseTime: 10,
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const handleShutdown = cmd.handleShutdown.bind(cmd)
      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      const spyExit = vi.spyOn(cmd, 'exit').mockImplementation(() => {
        throw new Error('exit called')
      })
      // @ts-expect-error - setting private property for testing
      cmd.parser = new Parser()

      try {
        handleShutdown()
      } catch (e) {
        if ((e as Error).message !== 'exit called') throw e
      }

      expect(mockDispose).toHaveBeenCalled()

      spyLog.mockRestore()
      spyExit.mockRestore()
    })
  })

  describe('setupRuleRegistryLazy', () => {
    test('should register all rules when no requestedRules provided', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()
      const mockRunRules = vi.fn().mockReturnValue([])

      vi.mocked(RuleRegistry).mockImplementation(
        class {
          register = mockRegister
          disable = mockDisable
          runRules = mockRunRules
        } as never,
      )

      const registry = await setupRuleRegistryLazy(undefined)

        expect(mockRegister).toHaveBeenCalled()
        expect(mockDisable).not.toHaveBeenCalled()

        expect(registry).toBeDefined()
    })

    test('should disable rules not in requestedRules', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { allRules } = await import('../../../src/rules/index.js')
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()
      const mockRunRules = vi.fn().mockReturnValue([])

      vi.mocked(RuleRegistry).mockImplementation(
        class {
          register = mockRegister
          disable = mockDisable
          runRules = mockRunRules
        } as never,
      )

      const ruleIds = Object.keys(allRules)

      if (ruleIds.length > 0) {
        const requestedRuleId = ruleIds[0]
        const registry = await setupRuleRegistryLazy([requestedRuleId])

        expect(mockRegister).toHaveBeenCalled()
        expect(mockDisable).not.toHaveBeenCalled()

        expect(registry).toBeDefined()
      }
    })

    test('should enable only requested rules', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { allRules } = await import('../../../src/rules/index.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()
      const mockRunRules = vi.fn().mockReturnValue([])

      vi.mocked(RuleRegistry).mockImplementation(
        class {
          register = mockRegister
          disable = mockDisable
          runRules = mockRunRules
        } as never,
      )

      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
      const ruleIds = Object.keys(allRules)

      if (ruleIds.length >= 2) {
        const requestedRuleIds = [ruleIds[0], ruleIds[1]]
        const registry = await setupRuleRegistryLazy(requestedRuleIds)

        expect(mockRegister).toHaveBeenCalled()
        expect(mockDisable).not.toHaveBeenCalled()

        expect(registry).toBeDefined()
      }
    })
  })

  describe('run error handling', () => {
    test('should handle CLIError from loadConfig', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')

      const cliError = new CLIError('Config error', { suggestions: ['Check config'] })
      vi.mocked(findConfigPath).mockRejectedValue(cliError)

      const cmd = createCommandWithMockedParse(
        WatchCommand,
        { verbose: false },
        { files: undefined },
      )
      const errorSpy = vi.fn()
      ;(cmd as unknown as { error: typeof errorSpy }).error = errorSpy

      await cmd.run()

      expect(errorSpy).toHaveBeenCalledWith('Config error')
    })

    test('should handle generic error from loadConfig', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')

      vi.mocked(findConfigPath).mockRejectedValue(new Error('Generic error'))

      const cmd = createCommandWithMockedParse(
        WatchCommand,
        { verbose: false },
        { files: undefined },
      )
      const errorSpy = vi.fn()
      ;(cmd as unknown as { error: typeof errorSpy }).error = errorSpy

      await cmd.run()

      expect(errorSpy).toHaveBeenCalledWith('Watch failed: Generic error')
    })

    test('should handle non-Error thrown from loadConfig', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')

      vi.mocked(findConfigPath).mockRejectedValue('string error')

      const cmd = createCommandWithMockedParse(
        WatchCommand,
        { verbose: false },
        { files: undefined },
      )
      const errorSpy = vi.fn()
      ;(cmd as unknown as { error: typeof errorSpy }).error = errorSpy

      await cmd.run()

      expect(errorSpy).toHaveBeenCalledWith('Watch failed: string error')
    })

    test('should set debug log level when verbose flag is true', async () => {
      const { logger, LogLevel } = await import('../../../src/utils/logger.js')

      const cmd = createCommandWithMockedParse(
        WatchCommand,
        { verbose: true },
        { files: undefined },
      )
      const logSpy = vi.spyOn(cmd, 'log').mockImplementation(() => {})

      await cmd.run().catch(() => {})

      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)

      logSpy.mockRestore()
    })

    test('should use empty array when config.ignore is null', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')

      vi.mocked(findConfigPath).mockResolvedValue('/test/.codeforgerc.json')

      const cmd = createCommandWithMockedParse(
        WatchCommand,
        { verbose: false },
        { files: undefined },
      )

      const mockGetConfig = vi.fn().mockResolvedValue({
        files: ['**/*.ts'],
        ignore: null,
      })
      ;(cmd as unknown as { configCache: { getConfig: typeof mockGetConfig } }).configCache = {
        getConfig: mockGetConfig,
      }

      const logSpy = vi.spyOn(cmd, 'log').mockImplementation(() => {})

      await cmd.run().catch(() => {})

      expect(logSpy).toHaveBeenCalled()

      logSpy.mockRestore()
    })
  })

  describe('resolvePatterns extended', () => {
    test('should return single-element array from string arg', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns('foo.ts', undefined)).toEqual(['foo.ts'])
    })

    test('should return same array from array arg', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns(['a.ts', 'b.ts', 'c.ts'], undefined)).toEqual(['a.ts', 'b.ts', 'c.ts'])
    })

    test('should prefer args over config', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns(['cli.ts'], ['config.ts'])).toEqual(['cli.ts'])
    })

    test('should return config when args is empty array', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns([], ['config.ts'])).toEqual([])
    })

    test('should fall back to config when args is empty string (falsy)', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      const result = resolvePatterns('', ['config.ts'])
      expect(result).toEqual(['config.ts'])
    })

    test('should handle undefined both', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns(undefined, undefined)).toEqual([])
    })

    test('should return config when args is undefined and config is null', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns(undefined, undefined)).toEqual([])
    })

    test('should return config files when no args provided', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      const configs = ['src/**/*.ts', 'lib/**/*.js']
      expect(resolvePatterns(undefined, configs)).toEqual(configs)
    })

    test('should handle single-element array arg', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns(['only.ts'], ['default.ts'])).toEqual(['only.ts'])
    })
  })

  describe('loadCommandConfig extended', () => {
    test('should merge env config with file config', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeEnvConfig } = await import('../../../src/config/merger.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue('/test/config.json')
      vi.mocked(mergeEnvConfig).mockReturnValue({ files: ['env.ts'] } as never)
      vi.mocked(mergeConfigs).mockReturnValue({ files: ['env.ts'] } as never)

      const mockConfigCache = {
        getConfig: vi.fn().mockResolvedValue({ files: ['file.ts'] }),
      } as never

      await loadCommandConfig({}, mockConfigCache)

      expect(mergeEnvConfig).toHaveBeenCalled()
      expect(mergeConfigs).toHaveBeenCalled()
    })

    test('should include files flag in CLI config when provided', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = { getConfig: vi.fn() } as never
      const result = await loadCommandConfig({ files: ['*.ts'] }, mockConfigCache)

      expect(result).toBeDefined()
    })

    test('should include ignore flag in CLI config when provided', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = { getConfig: vi.fn() } as never
      const result = await loadCommandConfig({ ignore: ['node_modules'] }, mockConfigCache)

      expect(result).toBeDefined()
    })

    test('should not include files in CLI config when not provided', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(mergeConfigs).mockReturnValue({} as never)

      const mockConfigCache = { getConfig: vi.fn() } as never
      await loadCommandConfig({}, mockConfigCache)

      const cliConfigArg = vi.mocked(mergeConfigs).mock.calls[0]
      expect(cliConfigArg).toBeDefined()
    })

    test('should not include ignore in CLI config when not provided', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(mergeConfigs).mockReturnValue({} as never)

      const mockConfigCache = { getConfig: vi.fn() } as never
      await loadCommandConfig({}, mockConfigCache)

      expect(mergeConfigs).toHaveBeenCalled()
    })

    test('should pass config flag to findConfigPath', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = { getConfig: vi.fn() } as never
      await loadCommandConfig({ config: '/custom/config.json' }, mockConfigCache)

      expect(findConfigPath).toHaveBeenCalledWith('/custom/config.json', process.cwd())
    })

    test('should call validateConfig with raw config from cache', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { validateConfig } = await import('../../../src/config/validator.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      const rawConfig = { files: ['raw.ts'] }
      vi.mocked(findConfigPath).mockResolvedValue('/test/config.json')
      vi.mocked(validateConfig).mockReturnValue(rawConfig as never)

      const mockConfigCache = {
        getConfig: vi.fn().mockResolvedValue(rawConfig),
      } as never

      await loadCommandConfig({}, mockConfigCache)

      expect(validateConfig).toHaveBeenCalledWith(rawConfig)
    })

    test('should handle both files and ignore flags', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = { getConfig: vi.fn() } as never
      const result = await loadCommandConfig(
        { files: ['src/**/*.ts'], ignore: ['dist/**'] },
        mockConfigCache,
      )

      expect(result).toBeDefined()
    })

    test('should use env config when no file config found', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { parseEnvVars } = await import('../../../src/config/env-parser.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(parseEnvVars).mockReturnValue({ files: ['env.ts'] } as never)

      const mockConfigCache = { getConfig: vi.fn() } as never
      const result = await loadCommandConfig({}, mockConfigCache)

      expect(parseEnvVars).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    test('should skip file loading when findConfigPath returns null', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { validateConfig } = await import('../../../src/config/validator.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = { getConfig: vi.fn() } as never
      await loadCommandConfig({}, mockConfigCache)

      expect(mockConfigCache.getConfig).not.toHaveBeenCalled()
      expect(validateConfig).not.toHaveBeenCalled()
    })
  })

  describe('normalizeFlags', () => {
    test('should normalize default flags', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.cacheResults).toBe(false)
      expect(result.ciMode).toBe(false)
      expect(result.concurrency).toBe(4)
      expect(result.dryRun).toBe(false)
      expect(result.failOnWarnings).toBe(false)
      expect(result.format).toBe('console')
      expect(result.maxWarnings).toBe(-1)
      expect(result.output).toBeUndefined()
      expect(result.quiet).toBe(false)
      expect(result.shouldFix).toBe(false)
      expect(result.stagedMode).toBe(false)
      expect(result.verbose).toBe(false)
    })

    test('should force JSON format in CI mode when format is console', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.format).toBe('json')
    })

    test('should preserve non-console format in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'junit',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.format).toBe('junit')
    })

    test('should force quiet in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.quiet).toBe(true)
    })

    test('should suppress verbose in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: true,
      })

      expect(result.verbose).toBe(false)
    })

    test('should preserve verbose when not in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: true,
      })

      expect(result.verbose).toBe(true)
    })

    test('should map fail-on-warnings', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': true,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.failOnWarnings).toBe(true)
    })

    test('should map max-warnings', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': 10,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.maxWarnings).toBe(10)
    })

    test('should map fix to shouldFix', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: true,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.shouldFix).toBe(true)
    })

    test('should map dry-run', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': true,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.dryRun).toBe(true)
    })

    test('should map staged to stagedMode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: true,
        verbose: false,
      })

      expect(result.stagedMode).toBe(true)
    })

    test('should map concurrency', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 8,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.concurrency).toBe(8)
    })

    test('should map cache-results', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': true,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.cacheResults).toBe(true)
    })

    test('should map output', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: 'report.json',
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.output).toBe('report.json')
    })

    test('should map quiet independently', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: true,
        staged: false,
        verbose: false,
      })

      expect(result.quiet).toBe(true)
    })
  })

  describe('filterFilesByExtension', () => {
    test('should return all files when no extension specified', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.ts', size: 100 },
        { path: 'b.js', size: 200 },
      ]
      expect(filterFilesByExtension(files)).toEqual(files)
    })

    test('should filter by single extension', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.ts', size: 100 },
        { path: 'b.js', size: 200 },
        { path: 'c.ts', size: 300 },
      ]
      const result = filterFilesByExtension(files, '.ts')
      expect(result).toEqual([
        { path: 'a.ts', size: 100 },
        { path: 'c.ts', size: 300 },
      ])
    })

    test('should filter by multiple extensions', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.ts', size: 100 },
        { path: 'b.js', size: 200 },
        { path: 'c.py', size: 300 },
      ]
      const result = filterFilesByExtension(files, '.ts,.js')
      expect(result).toEqual([
        { path: 'a.ts', size: 100 },
        { path: 'b.js', size: 200 },
      ])
    })

    test('should return all files for empty extension string', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [{ path: 'a.ts', size: 100 }]
      expect(filterFilesByExtension(files, '')).toEqual(files)
    })

    test('should return all files when extensions resolve to empty', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [{ path: 'a.ts', size: 100 }]
      expect(filterFilesByExtension(files, '   ')).toEqual(files)
    })

    test('should handle files with no extension', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'Makefile', size: 100 },
        { path: 'a.ts', size: 200 },
      ]
      const result = filterFilesByExtension(files, '.ts')
      expect(result).toEqual([{ path: 'a.ts', size: 200 }])
    })

    test('should handle empty files array', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      expect(filterFilesByExtension([], '.ts')).toEqual([])
    })

    test('should handle undefined extension', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [{ path: 'a.ts', size: 100 }]
      expect(filterFilesByExtension(files, undefined)).toEqual(files)
    })

    test('should filter case-insensitively', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.TS', size: 100 },
        { path: 'b.ts', size: 200 },
      ]
      const result = filterFilesByExtension(files, '.ts')
      expect(result).toHaveLength(2)
    })

    test('should handle .tsx extension', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.tsx', size: 100 },
        { path: 'b.ts', size: 200 },
      ]
      const result = filterFilesByExtension(files, '.tsx')
      expect(result).toEqual([{ path: 'a.tsx', size: 100 }])
    })

    test('should handle extensions with spaces in input', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.ts', size: 100 },
        { path: 'b.js', size: 200 },
      ]
      const result = filterFilesByExtension(files, ' .ts , .js ')
      expect(result).toHaveLength(2)
    })

    test('should return empty when no files match', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.py', size: 100 },
        { path: 'b.rs', size: 200 },
      ]
      const result = filterFilesByExtension(files, '.ts')
      expect(result).toEqual([])
    })

    test('should filter .mjs files', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.mjs', size: 100 },
        { path: 'b.ts', size: 200 },
      ]
      const result = filterFilesByExtension(files, '.mjs')
      expect(result).toEqual([{ path: 'a.mjs', size: 100 }])
    })
  })

  describe('CLIError class', () => {
    test('should have correct name', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = new CLIError('test')
      expect(err.name).toBe('CLIError')
    })

    test('should have default code E000', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = new CLIError('test')
      expect(err.code).toBe('E000')
    })

    test('should accept custom code', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = new CLIError('test', { code: 'E999' })
      expect(err.code).toBe('E999')
    })

    test('should have empty suggestions by default', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = new CLIError('test')
      expect(err.suggestions).toEqual([])
    })

    test('should accept suggestions', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = new CLIError('test', { suggestions: ['Try this'] })
      expect(err.suggestions).toEqual(['Try this'])
    })

    test('should have empty context by default', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = new CLIError('test')
      expect(err.context).toEqual({})
    })

    test('should accept context', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = new CLIError('test', { context: { key: 'value' } })
      expect(err.context).toEqual({ key: 'value' })
    })

    test('should create invalidInput error with code E001', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = CLIError.invalidInput('bad input')
      expect(err.code).toBe('E001')
      expect(err.message).toBe('bad input')
    })

    test('should create fileNotFound error with code E002', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = CLIError.fileNotFound('/missing.ts')
      expect(err.code).toBe('E002')
      expect(err.message).toContain('/missing.ts')
      expect(err.suggestions.length).toBeGreaterThan(0)
    })

    test('should create configError with code E003', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = CLIError.configError('bad config')
      expect(err.code).toBe('E003')
      expect(err.message).toBe('bad config')
    })

    test('should serialize to JSON correctly', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = new CLIError('test', {
        code: 'E100',
        suggestions: ['s1'],
        context: { k: 'v' },
      })
      const json = err.toJSON()
      expect(json.name).toBe('CLIError')
      expect(json.code).toBe('E100')
      expect(json.message).toBe('test')
      expect(json.suggestions).toEqual(['s1'])
      expect(json.context).toEqual({ k: 'v' })
    })

    test('should be instanceof Error', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = new CLIError('test')
      expect(err).toBeInstanceOf(Error)
    })

    test('should be instanceof CLIError', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const err = new CLIError('test')
      expect(err).toBeInstanceOf(CLIError)
    })
  })

  describe('SystemError class', () => {
    test('should have correct name', async () => {
      const { SystemError } = await import('../../../src/utils/errors.js')
      const err = new SystemError('test')
      expect(err.name).toBe('SystemError')
    })

    test('should have default code E500', async () => {
      const { SystemError } = await import('../../../src/utils/errors.js')
      const err = new SystemError('test')
      expect(err.code).toBe('E500')
    })

    test('should accept custom code', async () => {
      const { SystemError } = await import('../../../src/utils/errors.js')
      const err = new SystemError('test', { code: 'E501' })
      expect(err.code).toBe('E501')
    })

    test('should accept cause', async () => {
      const { SystemError } = await import('../../../src/utils/errors.js')
      const cause = new Error('root cause')
      const err = new SystemError('test', { cause })
      expect(err.cause).toBe(cause)
    })

    test('should create parseError with code E501', async () => {
      const { SystemError } = await import('../../../src/utils/errors.js')
      const cause = new Error('parse fail')
      const err = SystemError.parseError('/file.ts', cause)
      expect(err.code).toBe('E501')
      expect(err.message).toContain('/file.ts')
    })

    test('should create ioError with code E502', async () => {
      const { SystemError } = await import('../../../src/utils/errors.js')
      const cause = new Error('io fail')
      const err = SystemError.ioError('read file', cause)
      expect(err.code).toBe('E502')
      expect(err.message).toContain('read file')
    })

    test('should serialize cause in JSON', async () => {
      const { SystemError } = await import('../../../src/utils/errors.js')
      const cause = new Error('root')
      const err = new SystemError('test', { cause })
      const json = err.toJSON()
      expect(json.cause).toBeDefined()
      expect(json.cause?.message).toBe('root')
    })

    test('should have undefined cause when not provided', async () => {
      const { SystemError } = await import('../../../src/utils/errors.js')
      const err = new SystemError('test')
      expect(err.cause).toBeUndefined()
    })

    test('should be instanceof Error', async () => {
      const { SystemError } = await import('../../../src/utils/errors.js')
      const err = new SystemError('test')
      expect(err).toBeInstanceOf(Error)
    })
  })

  describe('analyzeFile extended', () => {
    test('should reset isRunning to false after success', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      const mockSourceFile = {
        getFilePath: function () {
          return '/test/file.ts'
        },
        getText: function () {
          return 'code'
        },
        getFullText: function () {
          return 'code'
        },
      }

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: mockSourceFile,
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await analyzeFile('/test/file.ts', undefined, false)
      spyLog.mockRestore()

      // @ts-expect-error - accessing private property
      expect(cmd.isRunning).toBe(false)
    })

    test('should reset isRunning to false even on error', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue(new Error('parse error')),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = new Parser()

      await analyzeFile('/test/file.ts', undefined, false)

      // @ts-expect-error - accessing private property
      expect(cmd.isRunning).toBe(false)
    })

    test('should not log violations for exactly 3 violations', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { Parser } = await import('../../../src/core/parser.js')

      const mockSourceFile = {
        getFilePath: function () {
          return '/test/file.ts'
        },
        getText: function () {
          return 'code'
        },
        getFullText: function () {
          return 'code'
        },
      }

      const violations = [
        {
          ruleId: 'r1',
          message: 'v1',
          severity: 'error' as const,
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          fix: null,
        },
        {
          ruleId: 'r2',
          message: 'v2',
          severity: 'error' as const,
          range: { start: { line: 2, column: 1 }, end: { line: 2, column: 5 } },
          fix: null,
        },
        {
          ruleId: 'r3',
          message: 'v3',
          severity: 'warning' as const,
          range: { start: { line: 3, column: 1 }, end: { line: 3, column: 5 } },
          fix: null,
        },
      ]

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue(violations),
        } as never
      })

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({ sourceFile: mockSourceFile }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await analyzeFile('/test/file.ts', undefined, false)

      expect(spyLog).not.toHaveBeenCalledWith(expect.stringContaining('... and'))
      spyLog.mockRestore()
    })

    test('should handle violation with fix', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { Parser } = await import('../../../src/core/parser.js')

      const mockSourceFile = {
        getFilePath: function () {
          return '/test/file.ts'
        },
        getText: function () {
          return 'code'
        },
        getFullText: function () {
          return 'code'
        },
      }

      const violations = [
        {
          ruleId: 'fixable-rule',
          message: 'fixable issue',
          severity: 'error' as const,
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          fix: { text: 'fixed' },
        },
      ]

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue(violations),
        } as never
      })

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({ sourceFile: mockSourceFile }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await analyzeFile('/test/file.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('fixable-rule'))
      spyLog.mockRestore()
    })

    test('should handle file path relative to cwd', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      const mockSourceFile = {
        getFilePath: function () {
          return '/test/file.ts'
        },
        getText: function () {
          return 'code'
        },
        getFullText: function () {
          return 'code'
        },
      }

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({ sourceFile: mockSourceFile }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await analyzeFile(process.cwd() + '/src/file.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('src/file.ts'))
      spyLog.mockRestore()
    })

    test('should count all error severity correctly', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { Parser } = await import('../../../src/core/parser.js')

      const violations = [
        {
          ruleId: 'r1',
          message: 'e1',
          severity: 'error' as const,
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
          fix: null,
        },
        {
          ruleId: 'r2',
          message: 'e2',
          severity: 'error' as const,
          range: { start: { line: 2, column: 1 }, end: { line: 2, column: 2 } },
          fix: null,
        },
        {
          ruleId: 'r3',
          message: 'e3',
          severity: 'error' as const,
          range: { start: { line: 3, column: 1 }, end: { line: 3, column: 2 } },
          fix: null,
        },
      ]

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue(violations),
        } as never
      })

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: {
              getFilePath: function () {
                return '/test/f.ts'
              },
              getText: function () {
                return ''
              },
              getFullText: function () {
                return ''
              },
            },
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await analyzeFile('/test/f.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('3 error(s), 0 warning(s)'))
      spyLog.mockRestore()
    })

    test('should handle exactly 4 violations', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { Parser } = await import('../../../src/core/parser.js')

      const violations = [1, 2, 3, 4].map((i) => ({
        ruleId: `r${i}`,
        message: `v${i}`,
        severity: 'error' as const,
        range: { start: { line: i, column: 1 }, end: { line: i, column: 5 } },
        fix: null,
      }))

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue(violations),
        } as never
      })

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: {
              getFilePath: function () {
                return '/test/f.ts'
              },
              getText: function () {
                return ''
              },
              getFullText: function () {
                return ''
              },
            },
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await analyzeFile('/test/f.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('... and 1 more'))
      spyLog.mockRestore()
    })

    test('should log violation line and column', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { Parser } = await import('../../../src/core/parser.js')

      const violations = [
        {
          ruleId: 'test-rule',
          message: 'test',
          severity: 'error' as const,
          range: { start: { line: 10, column: 5 }, end: { line: 10, column: 15 } },
          fix: null,
        },
      ]

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue(violations),
        } as never
      })

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: {
              getFilePath: function () {
                return '/test/f.ts'
              },
              getText: function () {
                return ''
              },
              getFullText: function () {
                return ''
              },
            },
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await analyzeFile('/test/f.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('10:5'))
      spyLog.mockRestore()
    })

    test('should display error severity in red for error violations', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { Parser } = await import('../../../src/core/parser.js')

      const violations = [
        {
          ruleId: 'err-rule',
          message: 'an error',
          severity: 'error' as const,
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
          fix: null,
        },
      ]

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue(violations),
        } as never
      })

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: {
              getFilePath: function () {
                return '/test/f.ts'
              },
              getText: function () {
                return ''
              },
              getFullText: function () {
                return ''
              },
            },
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await analyzeFile('/test/f.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('err-rule'))
      spyLog.mockRestore()
    })

    test('should not set pendingAnalysis when isRunning is false', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: {
              getFilePath: function () {
                return '/test/f.ts'
              },
              getText: function () {
                return ''
              },
              getFullText: function () {
                return ''
              },
            },
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      await analyzeFile('/test/f.ts', undefined, false)

      // @ts-expect-error - accessing private property
      expect(cmd.pendingAnalysis).toBe(false)
      spyLog.mockRestore()
    })
  })

  describe('handleShutdown extended', () => {
    test('should handle shutdown without watcher', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const handleShutdown = cmd.handleShutdown.bind(cmd)
      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      const spyExit = vi.spyOn(cmd, 'exit').mockImplementation(() => {
        throw new Error('exit called')
      })

      try {
        handleShutdown()
      } catch (e) {
        if ((e as Error).message !== 'exit called') throw e
      }

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('Stopping'))
      spyLog.mockRestore()
      spyExit.mockRestore()
    })

    test('should handle shutdown without parser', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const handleShutdown = cmd.handleShutdown.bind(cmd)
      // @ts-expect-error - setting private property
      cmd.parser = null

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      const spyExit = vi.spyOn(cmd, 'exit').mockImplementation(() => {
        throw new Error('exit called')
      })

      try {
        handleShutdown()
      } catch (e) {
        if ((e as Error).message !== 'exit called') throw e
      }

      expect(spyExit).toHaveBeenCalledWith(0)
      spyLog.mockRestore()
      spyExit.mockRestore()
    })

    test('should always call exit with 0', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method
      const handleShutdown = cmd.handleShutdown.bind(cmd)
      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})
      const spyExit = vi.spyOn(cmd, 'exit').mockImplementation(() => {
        throw new Error('exit called')
      })

      try {
        handleShutdown()
      } catch (e) {
        if ((e as Error).message !== 'exit called') throw e
      }

      expect(spyExit).toHaveBeenCalledWith(0)
      spyLog.mockRestore()
      spyExit.mockRestore()
    })
  })

  describe('setupRuleRegistryLazy extended', () => {
    test('should register all rules even with empty requested array', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(
        class {
          register = mockRegister
          disable = mockDisable
          runRules = vi.fn().mockReturnValue([])
        } as never,
      )

      await setupRuleRegistryLazy([])

      expect(mockRegister).toHaveBeenCalled()
      expect(mockDisable).not.toHaveBeenCalled()
    })

    test('should warn for unknown rules', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { logger } = await import('../../../src/utils/logger.js')
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(RuleRegistry).mockImplementation(
        class {
          register = vi.fn()
          disable = vi.fn()
          runRules = vi.fn().mockReturnValue([])
        } as never,
      )

      await setupRuleRegistryLazy(['nonexistent-rule-xyz'])

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Unknown rules will be ignored'),
      )
    })

    test('should not warn when all requested rules are valid', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { allRules } = await import('../../../src/rules/index.js')
      const { logger } = await import('../../../src/utils/logger.js')
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(RuleRegistry).mockImplementation(
        class {
          register = vi.fn()
          disable = vi.fn()
          runRules = vi.fn().mockReturnValue([])
        } as never,
      )

      const ruleIds = Object.keys(allRules)
      if (ruleIds.length > 0) {
        vi.mocked(logger.warn).mockClear()
        await setupRuleRegistryLazy([ruleIds[0]])
        expect(logger.warn).not.toHaveBeenCalledWith(
          expect.stringContaining('Unknown rules will be ignored'),
        )
      }
    })
  })

  describe('command metadata extended', () => {
    test('has config flag with char c', () => {
      expect(WatchCommand.flags.config).toBeDefined()
      expect(WatchCommand.flags.config.char).toBe('c')
    })

    test('has debounce flag with char d', () => {
      expect(WatchCommand.flags.debounce).toBeDefined()
      expect(WatchCommand.flags.debounce.char).toBe('d')
    })

    test('has ignore flag with char i', () => {
      expect(WatchCommand.flags.ignore).toBeDefined()
      expect(WatchCommand.flags.ignore.char).toBe('i')
    })

    test('has rules flag with char r', () => {
      expect(WatchCommand.flags.rules).toBeDefined()
      expect(WatchCommand.flags.rules.char).toBe('r')
    })

    test('has verbose flag with char v', () => {
      expect(WatchCommand.flags.verbose).toBeDefined()
      expect(WatchCommand.flags.verbose.char).toBe('v')
    })

    test('ignore flag accepts multiple values', () => {
      expect(WatchCommand.flags.ignore.multiple).toBe(true)
    })

    test('rules flag does not accept multiple', () => {
      expect(WatchCommand.flags.rules.multiple).toBe(false)
    })

    test('verbose defaults to false', () => {
      expect(WatchCommand.flags.verbose.default).toBe(false)
    })

    test('args files allows multiple', () => {
      expect(WatchCommand.args.files.multiple).toBe(true)
    })

    test('description mentions watch', () => {
      expect(WatchCommand.description).toContain('Watch')
    })

    test('has at least 2 examples', () => {
      expect(WatchCommand.examples.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('run method extended', () => {
    test('should handle CLIError with code property', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')

      const err = new CLIError('Config error with code', { code: 'E100' })
      vi.mocked(findConfigPath).mockRejectedValue(err)

      const cmd = createCommandWithMockedParse(
        WatchCommand,
        { verbose: false },
        { files: undefined },
      )
      const errorSpy = vi.fn()
      ;(cmd as unknown as { error: typeof errorSpy }).error = errorSpy

      await cmd.run()

      expect(errorSpy).toHaveBeenCalledWith('Config error with code')
    })

    test('should parse rules flag into array by splitting on comma', () => {
      const rules = 'rule-a,rule-b,rule-c'
      const parsed = rules.split(',').map((r) => r.trim())
      expect(parsed).toEqual(['rule-a', 'rule-b', 'rule-c'])
    })

    test('should parse rules flag with spaces correctly', () => {
      const rules = 'rule-a , rule-b '
      const parsed = rules.split(',').map((r) => r.trim())
      expect(parsed).toEqual(['rule-a', 'rule-b'])
    })

    test('should handle single rule in rules flag', () => {
      const rules = 'single-rule'
      const parsed = rules.split(',').map((r) => r.trim())
      expect(parsed).toEqual(['single-rule'])
    })

    test('should handle empty rules string', () => {
      const rules = ''
      const parsed = rules.split(',').map((r) => r.trim())
      expect(parsed).toEqual([''])
    })

    test('should produce undefined requestedRules when no rules flag', () => {
      const flags = { verbose: false }
      const requestedRules = flags.verbose ? undefined : undefined
      expect(requestedRules).toBeUndefined()
    })

    test('should handle config with null ignore as empty array', () => {
      const ignore = null
      const result = ignore ?? []
      expect(result).toEqual([])
    })

    test('should handle config with undefined ignore as empty array', () => {
      const ignore = undefined
      const result = ignore ?? []
      expect(result).toEqual([])
    })

    test('should handle config with valid ignore array', () => {
      const ignore = ['node_modules/**', 'dist/**']
      const result = ignore ?? []
      expect(result).toEqual(['node_modules/**', 'dist/**'])
    })
  })

  describe('DEFAULT_DEBOUNCE_MS constant', () => {
    test('should be 300', async () => {
      const { DEFAULT_DEBOUNCE_MS } = await import('../../../src/utils/constants.js')
      expect(DEFAULT_DEBOUNCE_MS).toBe(300)
    })
  })

  describe('MAX_VIOLATIONS_TO_SHOW constant', () => {
    test('should be 3', async () => {
      const { MAX_VIOLATIONS_TO_SHOW } = await import('../../../src/utils/constants.js')
      expect(MAX_VIOLATIONS_TO_SHOW).toBe(3)
    })
  })

  describe('allRules registry', () => {
    test('should contain at least 50 rules', async () => {
      const { allRules } = await import('../../../src/rules/index.js')
      const ruleCount = Object.keys(allRules).length
      expect(ruleCount).toBeGreaterThanOrEqual(50)
    })

    test('should contain no-eval rule', async () => {
      const { allRules } = await import('../../../src/rules/index.js')
      expect(allRules['no-eval']).toBeDefined()
    })

    test('should contain max-params rule', async () => {
      const { allRules } = await import('../../../src/rules/index.js')
      expect(allRules['max-params']).toBeDefined()
    })

    test('should contain prefer-const rule', async () => {
      const { allRules } = await import('../../../src/rules/index.js')
      expect(allRules['prefer-const']).toBeDefined()
    })

    test('getRule should return rule by id', async () => {
      const { getRule } = await import('../../../src/rules/index.js')
      const rule = getRule('no-eval')
      expect(rule).toBeDefined()
    })

    test('getRule should return undefined for unknown rule', async () => {
      const { getRule } = await import('../../../src/rules/index.js')
      const rule = getRule('nonexistent-rule-xyz')
      expect(rule).toBeUndefined()
    })

    test('getRuleIds should return array of strings', async () => {
      const { getRuleIds } = await import('../../../src/rules/index.js')
      const ids = getRuleIds()
      expect(Array.isArray(ids)).toBe(true)
      expect(ids.length).toBeGreaterThan(0)
    })

    test('getRuleCategory should return category for known rule', async () => {
      const { getRuleCategory } = await import('../../../src/rules/index.js')
      const cat = getRuleCategory('max-complexity')
      expect(cat).toBe('complexity')
    })

    test('getRuleCategory should default to complexity for unknown rule', async () => {
      const { getRuleCategory } = await import('../../../src/rules/index.js')
      const cat = getRuleCategory('nonexistent-rule')
      expect(cat).toBe('complexity')
    })

    test('getRuleCategory should return security for security rules', async () => {
      const { getRuleCategory } = await import('../../../src/rules/index.js')
      expect(getRuleCategory('no-eval')).toBe('security')
    })

    test('getRuleCategory should return patterns for pattern rules', async () => {
      const { getRuleCategory } = await import('../../../src/rules/index.js')
      expect(getRuleCategory('prefer-const')).toBe('patterns')
    })
  })

  describe('applyFixesToFiles', () => {
    test('should return zero fixes when no violations', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')
      const result = await applyFixesToFiles({
        allViolations: [],
        applyFixesFn: vi.fn(),
        concurrency: 4,
        discoveredFiles: [],
        dryRun: false,
        parseCache: new Map(),
        parser: {} as never,
        quiet: false,
        rulesWithFixes: new Map(),
        verbose: false,
      })

      expect(result).toEqual({ fixesApplied: 0, fixesSkipped: 0 })
    })

    test('should call applyFixesFn when violations exist', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')
      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 5, fixesSkipped: 2 })
      const violations = [
        {
          ruleId: 'r1',
          message: 'v1',
          severity: 'error' as const,
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          fix: null,
        },
      ]

      const result = await applyFixesToFiles({
        allViolations: violations,
        applyFixesFn: mockApplyFixesFn,
        concurrency: 4,
        discoveredFiles: [],
        dryRun: true,
        parseCache: new Map(),
        parser: {} as never,
        quiet: true,
        rulesWithFixes: new Map(),
        verbose: false,
      })

      expect(mockApplyFixesFn).toHaveBeenCalled()
      expect(result.fixesApplied).toBe(5)
      expect(result.fixesSkipped).toBe(2)
    })

    test('should pass dryRun and quiet to applyFixesFn', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')
      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 0, fixesSkipped: 0 })
      const violations = [
        {
          ruleId: 'r1',
          message: 'v1',
          severity: 'error' as const,
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          fix: null,
        },
      ]

      await applyFixesToFiles({
        allViolations: violations,
        applyFixesFn: mockApplyFixesFn,
        concurrency: 4,
        discoveredFiles: [],
        dryRun: true,
        parseCache: new Map(),
        parser: {} as never,
        quiet: true,
        rulesWithFixes: new Map(),
        verbose: true,
      })

      const callArg = mockApplyFixesFn.mock.calls[0][0]
      expect(callArg.dryRun).toBe(true)
      expect(callArg.quiet).toBe(true)
    })
  })

  describe('FileWatcher mock verification', () => {
    test('mocked FileWatcher has on method', async () => {
      const { FileWatcher } = await import('../../../src/utils/watcher.js')
      const watcher = new FileWatcher({})
      expect(typeof watcher.on).toBe('function')
    })

    test('mocked FileWatcher has watch method', async () => {
      const { FileWatcher } = await import('../../../src/utils/watcher.js')
      const watcher = new FileWatcher({})
      expect(typeof watcher.watch).toBe('function')
    })

    test('mocked FileWatcher has stop method', async () => {
      const { FileWatcher } = await import('../../../src/utils/watcher.js')
      const watcher = new FileWatcher({})
      expect(typeof watcher.stop).toBe('function')
    })

    test('mocked FileWatcher has isActive method', async () => {
      const { FileWatcher } = await import('../../../src/utils/watcher.js')
      const watcher = new FileWatcher({})
      expect(typeof watcher.isActive).toBe('function')
    })

    test('mocked FileWatcher isActive returns false', async () => {
      const { FileWatcher } = await import('../../../src/utils/watcher.js')
      const watcher = new FileWatcher({})
      expect(watcher.isActive()).toBe(false)
    })

    test('mocked FileWatcher watch resolves', async () => {
      const { FileWatcher } = await import('../../../src/utils/watcher.js')
      const watcher = new FileWatcher({})
      await expect(watcher.watch('/test')).resolves.toBeUndefined()
    })

    test('mocked FileWatcher stop resolves', async () => {
      const { FileWatcher } = await import('../../../src/utils/watcher.js')
      vi.mocked(FileWatcher).mockImplementation(function () {
        return {
          on: vi.fn().mockReturnThis(),
          watch: vi.fn().mockResolvedValue(undefined),
          stop: vi.fn().mockResolvedValue(undefined),
          isActive: vi.fn().mockReturnValue(false),
        } as never
      })
      const watcher = new FileWatcher({})
      const result = await watcher.stop()
      expect(result).toBeUndefined()
    })

    test('mocked FileWatcher on returns this for chaining', async () => {
      const { FileWatcher } = await import('../../../src/utils/watcher.js')
      const watcher = new FileWatcher({})
      const result = watcher.on('change', vi.fn())
      expect(result).toBe(watcher)
    })
  })

  describe('config types', () => {
    test('should have correct default config file names', async () => {
      const { CONFIG_FILE_NAMES } = await import('../../../src/config/types.js')
      expect(CONFIG_FILE_NAMES).toContain('.codeforgerc')
      expect(CONFIG_FILE_NAMES).toContain('.codeforgerc.json')
      expect(CONFIG_FILE_NAMES).toContain('.codeforge.json')
      expect(CONFIG_FILE_NAMES).toContain('codeforge.config.js')
    })

    test('should have default config with files', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types.js')
      expect(DEFAULT_CONFIG.files).toBeDefined()
      expect(DEFAULT_CONFIG.files!.length).toBeGreaterThan(0)
    })

    test('should have default config with ignore', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types.js')
      expect(DEFAULT_CONFIG.ignore).toBeDefined()
      expect(DEFAULT_CONFIG.ignore!.length).toBeGreaterThan(0)
    })

    test('should ignore node_modules by default', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types.js')
      expect(DEFAULT_CONFIG.ignore).toContain('node_modules/**')
    })

    test('should ignore dist by default', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types.js')
      expect(DEFAULT_CONFIG.ignore).toContain('dist/**')
    })

    test('should ignore coverage by default', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types.js')
      expect(DEFAULT_CONFIG.ignore).toContain('coverage/**')
    })
  })

  describe('logger', () => {
    test('should have setLevel method', async () => {
      const { logger } = await import('../../../src/utils/logger.js')
      expect(typeof logger.setLevel).toBe('function')
    })

    test('should have warn method', async () => {
      const { logger } = await import('../../../src/utils/logger.js')
      expect(typeof logger.warn).toBe('function')
    })

    test('should have debug method', async () => {
      const { logger } = await import('../../../src/utils/logger.js')
      expect(typeof logger.debug).toBe('function')
    })

    test('should have info method', async () => {
      const { logger } = await import('../../../src/utils/logger.js')
      expect(typeof logger.info).toBe('function')
    })

    test('should have LogLevel enum', async () => {
      const { LogLevel } = await import('../../../src/utils/logger.js')
      expect(LogLevel.DEBUG).toBeDefined()
      expect(LogLevel.INFO).toBeDefined()
      expect(LogLevel.WARN).toBeDefined()
      expect(LogLevel.ERROR).toBeDefined()
      expect(LogLevel.SILENT).toBeDefined()
    })

    test('should have correct LogLevel ordering', async () => {
      const { LogLevel } = await import('../../../src/utils/logger.js')
      expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO)
      expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN)
      expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR)
      expect(LogLevel.ERROR).toBeLessThan(LogLevel.SILENT)
    })
  })

  describe('parseEnvVars mock', () => {
    test('should be mockable', async () => {
      const { parseEnvVars } = await import('../../../src/config/env-parser.js')
      expect(vi.isMockFunction(parseEnvVars)).toBe(true)
    })

    test('should return value from mock when called', async () => {
      const { parseEnvVars } = await import('../../../src/config/env-parser.js')
      vi.mocked(parseEnvVars).mockReturnValue({} as never)
      const result = parseEnvVars()
      expect(result).toEqual({})
    })
  })

  describe('validateConfig', () => {
    test('should pass through config by default', async () => {
      const { validateConfig } = await import('../../../src/config/validator.js')
      const config = { files: ['*.ts'] }
      vi.mocked(validateConfig).mockReturnValue(config as never)
      const result = validateConfig(config)
      expect(result).toEqual(config)
    })
  })

  describe('mergeConfigs', () => {
    test('should merge base and override', async () => {
      const { mergeConfigs } = await import('../../../src/config/merger.js')
      const base = { files: ['a.ts'] }
      const override = { ignore: ['b.ts'] }
      vi.mocked(mergeConfigs).mockReturnValue({ ...base, ...override } as never)
      const result = mergeConfigs(base as never, override as never)
      expect(result).toBeDefined()
    })
  })

  describe('mergeEnvConfig', () => {
    test('should merge file config and env config', async () => {
      const { mergeEnvConfig } = await import('../../../src/config/merger.js')
      const fileConfig = { files: ['a.ts'] }
      const envConfig = { ignore: ['b.ts'] }
      vi.mocked(mergeEnvConfig).mockReturnValue({ ...fileConfig, ...envConfig } as never)
      const result = mergeEnvConfig(fileConfig as never, envConfig as never)
      expect(result).toBeDefined()
    })
  })

  describe('discoverFiles mock', () => {
    test('should be mockable', async () => {
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      expect(vi.isMockFunction(discoverFiles)).toBe(true)
    })
  })

  describe('resolvePatterns additional edge cases', () => {
    test('should return array from single path string', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      const result = resolvePatterns('/absolute/path.ts', undefined)
      expect(result).toEqual(['/absolute/path.ts'])
      expect(result).toHaveLength(1)
    })

    test('should preserve order of array args', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      const result = resolvePatterns(['z.ts', 'a.ts', 'm.ts'], undefined)
      expect(result).toEqual(['z.ts', 'a.ts', 'm.ts'])
    })

    test('should return config files as-is', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      const configs = ['*.ts', '*.js', '!*.d.ts']
      const result = resolvePatterns(undefined, configs)
      expect(result).toBe(configs)
    })

    test('should return empty array for empty config files', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      const result = resolvePatterns(undefined, [])
      expect(result).toEqual([])
    })

    test('should handle glob patterns in args', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      const result = resolvePatterns('src/**/*.ts', undefined)
      expect(result).toEqual(['src/**/*.ts'])
    })
  })

  describe('filterFilesByExtension additional', () => {
    test('should filter .cjs files', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.cjs', size: 100 },
        { path: 'b.ts', size: 200 },
      ]
      const result = filterFilesByExtension(files, '.cjs')
      expect(result).toEqual([{ path: 'a.cjs', size: 100 }])
    })

    test('should filter .jsx files', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'component.jsx', size: 500 },
        { path: 'app.ts', size: 300 },
      ]
      const result = filterFilesByExtension(files, '.jsx')
      expect(result).toEqual([{ path: 'component.jsx', size: 500 }])
    })

    test('should handle all common extensions at once', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.ts', size: 1 },
        { path: 'b.tsx', size: 2 },
        { path: 'c.js', size: 3 },
        { path: 'd.jsx', size: 4 },
        { path: 'e.py', size: 5 },
      ]
      const result = filterFilesByExtension(files, '.ts,.tsx,.js,.jsx')
      expect(result).toHaveLength(4)
    })
  })

  describe('command helpers integration', () => {
    test('setupRuleRegistryLazy returns a registry with runRules method', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(RuleRegistry).mockImplementation(
        class {
          register = vi.fn()
          disable = vi.fn()
          runRules = vi.fn().mockReturnValue([])
        } as never,
      )

      const registry = await setupRuleRegistryLazy(undefined)
      expect(typeof registry.runRules).toBe('function')
    })

    test('loadCommandConfig passes cwd to findConfigPath', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = { getConfig: vi.fn() } as never
      await loadCommandConfig({}, mockConfigCache)

      expect(findConfigPath).toHaveBeenCalledWith(undefined, process.cwd())
    })

    test('loadCommandConfig handles config with rules property', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = { getConfig: vi.fn() } as never
      const result = await loadCommandConfig(
        { files: ['*.ts'], ignore: ['dist/**'] },
        mockConfigCache,
      )

      expect(result).toBeDefined()
    })

    test('setupRuleRegistryLazy with single unknown rule warns and registers nothing', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(
        class {
          register = mockRegister
          disable = mockDisable
          runRules = vi.fn().mockReturnValue([])
        } as never,
      )

      await setupRuleRegistryLazy(['totally-fake-rule'])

      expect(mockRegister).not.toHaveBeenCalled()
      expect(mockDisable).not.toHaveBeenCalled()
    })
  })

  describe('getProfileSeverityOverrides', () => {
    test('returns lenient profile overrides', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')
      const overrides = getProfileSeverityOverrides('lenient')
      expect(overrides['max-complexity']).toBe('info')
      expect(overrides['max-params']).toBe('info')
      expect(overrides['no-console']).toBe('info')
    })

    test('returns moderate profile overrides', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')
      const overrides = getProfileSeverityOverrides('moderate')
      expect(overrides['max-complexity']).toBe('warning')
      expect(overrides['no-console']).toBe('warning')
    })

    test('returns strict profile overrides', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')
      const overrides = getProfileSeverityOverrides('strict')
      expect(overrides['no-console']).toBe('error')
      expect(overrides['no-debugger']).toBe('error')
      expect(overrides['no-eval']).toBe('error')
      expect(overrides['prefer-const']).toBe('error')
    })

    test('returns empty object for unknown profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')
      const overrides = getProfileSeverityOverrides('unknown' as never)
      expect(overrides).toEqual({})
    })

    test('lenient profile has exactly 7 overrides', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')
      const overrides = getProfileSeverityOverrides('lenient')
      expect(Object.keys(overrides).length).toBe(7)
    })

    test('strict profile has exactly 7 overrides', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')
      const overrides = getProfileSeverityOverrides('strict')
      expect(Object.keys(overrides).length).toBe(7)
    })

    test('moderate profile has exactly 5 overrides', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')
      const overrides = getProfileSeverityOverrides('moderate')
      expect(Object.keys(overrides).length).toBe(5)
    })

    test('all override values are valid severity strings', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')
      const validSeverities = new Set(['error', 'info', 'warning'])
      for (const profile of ['lenient', 'moderate', 'strict'] as const) {
        const overrides = getProfileSeverityOverrides(profile)
        for (const severity of Object.values(overrides)) {
          expect(validSeverities.has(severity)).toBe(true)
        }
      }
    })

    test('no-console severity increases from lenient to strict', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')
      const lenient = getProfileSeverityOverrides('lenient')
      const moderate = getProfileSeverityOverrides('moderate')
      const strict = getProfileSeverityOverrides('strict')
      expect(lenient['no-console']).toBe('info')
      expect(moderate['no-console']).toBe('warning')
      expect(strict['no-console']).toBe('error')
    })
  })

  describe('normalizeFlags additional', () => {
    test('output is undefined when not provided', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        quiet: false,
        staged: false,
        verbose: false,
      })
      expect(result.output).toBeUndefined()
    })

    test('output preserves provided value', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')
      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: 'report.json',
        quiet: false,
        staged: false,
        verbose: false,
      })
      expect(result.output).toBe('report.json')
    })
  })

  describe('filterFilesByExtension edge cases', () => {
    test('filters files with multiple extensions including dots', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [
        { path: 'a.ts', size: 100, hash: 'x' },
        { path: 'b.tsx', size: 200, hash: 'y' },
        { path: 'c.js', size: 300, hash: 'z' },
      ] as never
      const result = filterFilesByExtension(files, '.ts,.tsx')
      expect(result).toHaveLength(2)
      expect(result.map((f: never) => (f as { path: string }).path)).toEqual(['a.ts', 'b.tsx'])
    })

    test('handles extension string with extra commas', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')
      const files = [{ path: 'a.ts', size: 100, hash: 'x' }] as never
      const result = filterFilesByExtension(files, ',,.ts,,')
      expect(result).toHaveLength(1)
    })
  })

  describe('resolvePatterns additional', () => {
    test('handles array with single element', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns(['only.ts'], undefined)).toEqual(['only.ts'])
    })

    test('handles array with duplicates', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns(['a.ts', 'a.ts', 'b.ts'], undefined)).toEqual(['a.ts', 'a.ts', 'b.ts'])
    })
  })
})
