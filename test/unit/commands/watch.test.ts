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
  Parser: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn(),
    parseFile: vi.fn().mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/test/file.ts',
        getText: () => 'test code',
        getFullText: () => 'fixed code',
      },
      filePath: '/test/file.ts',
      parseTime: 10,
    }),
  })),
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(() => ({
    register: vi.fn(),
    disable: vi.fn(),
    runRules: vi.fn().mockReturnValue([]),
  })),
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
  ConfigCache: vi.fn().mockImplementation(() => ({
    getConfig: vi.fn(),
  })),
}))

vi.mock('../../../src/config/validator.js', () => ({
  validateConfig: vi.fn((config) => config),
}))

vi.mock('../../../src/config/merger.js', () => ({
  mergeConfigs: vi.fn((base, override) => ({ ...base, ...override })),
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
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const resolvePatterns = cmd.resolvePatterns

      expect(resolvePatterns(['a.ts', 'b.ts'], ['default.ts'])).toEqual(['a.ts', 'b.ts'])
    })

    test('resolvePatterns should handle string args', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const resolvePatterns = cmd.resolvePatterns

      expect(resolvePatterns('single.ts', ['default.ts'])).toEqual(['single.ts'])
    })

    test('resolvePatterns should fall back to config files', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const resolvePatterns = cmd.resolvePatterns

      expect(resolvePatterns(undefined, ['config.ts'])).toEqual(['config.ts'])
    })

    test('resolvePatterns should return empty array when no patterns', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const resolvePatterns = cmd.resolvePatterns

      expect(resolvePatterns(undefined, undefined)).toEqual([])
    })
  })

  describe('loadConfig', () => {
    test('should load config from file when found', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { validateConfig } = await import('../../../src/config/validator.js')

      const mockConfig = { files: ['test.ts'], ignore: ['node_modules'] }
      vi.mocked(findConfigPath).mockResolvedValue('/path/to/config.json')
      vi.mocked(validateConfig).mockReturnValue(mockConfig as never)

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})
      // @ts-expect-error - accessing private method for testing
      const loadConfig = cmd.loadConfig.bind(cmd)
      // @ts-expect-error - accessing private property for testing
      cmd.configCache.getConfig.mockResolvedValue(mockConfig as never)

      const result = await loadConfig({})

      expect(findConfigPath).toHaveBeenCalledWith(undefined, process.cwd())
      expect(validateConfig).toHaveBeenCalledWith(mockConfig)
      expect(result).toEqual(mockConfig)
    })

    test('should use defaults when no config file found', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(mergeConfigs).mockReturnValue({ files: ['default.ts'] } as never)

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})
      // @ts-expect-error - accessing private method for testing
      const loadConfig = cmd.loadConfig.bind(cmd)

      const flags = { files: ['custom.ts'], ignore: ['dist'] }
      const result = await loadConfig(flags)

      expect(findConfigPath).toHaveBeenCalledWith(undefined, process.cwd())
      expect(mergeConfigs).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    test('should use defaults when config path is found but no config content', async () => {
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')

      vi.mocked(findConfigPath).mockResolvedValue('/path/to/config.json')
      vi.mocked(mergeConfigs).mockReturnValue({ files: [] } as never)

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})
      // @ts-expect-error - accessing private method for testing
      const loadConfig = cmd.loadConfig.bind(cmd)
      // @ts-expect-error - accessing private property for testing
      cmd.configCache.getConfig.mockResolvedValue(null)

      const result = await loadConfig({})

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

      vi.mocked(Parser).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
            parseFile: vi.fn().mockResolvedValue({
              sourceFile: null,
              filePath: '/test/file.ts',
              parseTime: 10,
            }),
          }) as never,
      )

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
        getFilePath: () => '/test/file.ts',
        getText: () => 'test code',
        getFullText: () => 'fixed code',
      }

      vi.mocked(Parser).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
            parseFile: vi.fn().mockResolvedValue({
              sourceFile: mockSourceFile,
              filePath: '/test/file.ts',
              parseTime: 10,
            }),
          }) as never,
      )

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
        getFilePath: () => '/test/file.ts',
        getText: () => 'test code',
        getFullText: () => 'fixed code',
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

      vi.mocked(RuleRegistry).mockImplementation(
        () =>
          ({
            register: vi.fn(),
            disable: vi.fn(),
            runRules: vi.fn().mockReturnValue(mockViolations),
          }) as never,
      )

      vi.mocked(Parser).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
            parseFile: vi.fn().mockResolvedValue({
              sourceFile: mockSourceFile,
              filePath: '/test/file.ts',
              parseTime: 10,
            }),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property for testing
      cmd.parser = new Parser()

      const spyLog = vi.spyOn(cmd, 'log').mockImplementation(() => {})

      await analyzeFile('/test/file.ts', undefined, false)

      expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('⚠'))
      spyLog.mockRestore()
    })

    test('should handle errors gracefully', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      vi.mocked(Parser).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
            parseFile: vi.fn().mockRejectedValue(new Error('Parse error')),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property for testing
      cmd.parser = new Parser()

      await expect(analyzeFile('/test/file.ts', undefined, false)).resolves.toBeUndefined()
    })

    test('should schedule pending analysis after completion', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      // @ts-expect-error - accessing private method for testing
      const analyzeFile = cmd.analyzeFile.bind(cmd)
      // @ts-expect-error - setting private property for testing
      cmd.pendingAnalysis = true
      const originalSetImmediate = global.setImmediate
      const mockSetImmediate = vi.fn((fn) => {
        return originalSetImmediate(fn)
      })
      global.setImmediate = mockSetImmediate as never

      try {
        await analyzeFile('/test/file.ts', undefined, false)

        await new Promise((resolve) => setTimeout(resolve, 10))
      } finally {
        global.setImmediate = originalSetImmediate
      }
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
      vi.mocked(FileWatcher).mockImplementation(
        () =>
          ({
            on: vi.fn().mockReturnThis(),
            watch: vi.fn().mockResolvedValue(undefined),
            stop: mockStop,
            isActive: vi.fn().mockReturnValue(false),
          }) as never,
      )

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

    test('should dispose parser if it exists', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      const mockDispose = vi.fn()
      vi.mocked(Parser).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            dispose: mockDispose,
            parseFile: vi.fn().mockResolvedValue({
              sourceFile: {
                getFilePath: () => '/test/file.ts',
                getText: () => 'test code',
                getFullText: () => 'fixed code',
              },
              filePath: '/test/file.ts',
              parseTime: 10,
            }),
          }) as never,
      )

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
})
