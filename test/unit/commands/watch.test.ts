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

      const resolvePatterns = (
        cmd as unknown as { resolvePatterns: typeof Watch.prototype.resolvePatterns }
      ).resolvePatterns

      expect(resolvePatterns(['a.ts', 'b.ts'], ['default.ts'])).toEqual(['a.ts', 'b.ts'])
    })

    test('resolvePatterns should handle string args', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      const resolvePatterns = (
        cmd as unknown as { resolvePatterns: typeof Watch.prototype.resolvePatterns }
      ).resolvePatterns

      expect(resolvePatterns('single.ts', ['default.ts'])).toEqual(['single.ts'])
    })

    test('resolvePatterns should fall back to config files', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      const resolvePatterns = (
        cmd as unknown as { resolvePatterns: typeof Watch.prototype.resolvePatterns }
      ).resolvePatterns

      expect(resolvePatterns(undefined, ['config.ts'])).toEqual(['config.ts'])
    })

    test('resolvePatterns should return empty array when no patterns', async () => {
      const cmd = createCommandWithMockedParse(WatchCommand, {}, {})

      const resolvePatterns = (
        cmd as unknown as { resolvePatterns: typeof Watch.prototype.resolvePatterns }
      ).resolvePatterns

      expect(resolvePatterns(undefined, undefined)).toEqual([])
    })
  })
})
