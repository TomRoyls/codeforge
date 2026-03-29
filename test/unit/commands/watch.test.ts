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

  describe('setupRuleRegistry', () => {
    test('should register all rules when no requestedRules provided', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')

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

      const registry = setupRuleRegistry(undefined)

      expect(mockRegister).toHaveBeenCalled()
      expect(mockDisable).not.toHaveBeenCalled()
      expect(registry).toBeDefined()
    })

    test('should disable rules not in requestedRules', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { allRules } = await import('../../../src/rules/index.js')
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')

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
        const registry = setupRuleRegistry([requestedRuleId])

        expect(mockRegister).toHaveBeenCalled()
        expect(mockDisable).toHaveBeenCalled()

        const disableCalls = mockDisable.mock.calls.length
        expect(disableCalls).toBe(ruleIds.length - 1)

        const disabledRuleIds = mockDisable.mock.calls.flat()
        expect(disabledRuleIds).not.toContain(requestedRuleId)

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

      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const ruleIds = Object.keys(allRules)

      if (ruleIds.length >= 2) {
        const requestedRuleIds = [ruleIds[0], ruleIds[1]]
        const registry = setupRuleRegistry(requestedRuleIds)

        expect(mockRegister).toHaveBeenCalled()
        expect(mockDisable).toHaveBeenCalled()

        const disabledRuleIds = mockDisable.mock.calls.flat()
        expect(disabledRuleIds).not.toContain(requestedRuleIds[0])
        expect(disabledRuleIds).not.toContain(requestedRuleIds[1])

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

      // Run will hang due to infinite promise, so we catch the rejection
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
})
