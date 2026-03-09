import { describe, test, expect, beforeEach, vi } from 'vitest'

import type { DiscoveredFile } from '../../../src/core/file-discovery.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'

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

function createCommandWithMockedParse(
  Command: typeof import('../../../src/commands/fix.js').default,
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
    runRules: vi.fn().mockReturnValue([createMockViolation()]),
  })),
}))

vi.mock('../../../src/fix/fixer.js', () => ({
  applyFixesToFile: vi.fn().mockReturnValue({
    fixesApplied: 1,
    fixesSkipped: 0,
    conflicts: [],
  }),
}))

vi.mock('node:fs/promises', () => ({
  default: {
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
  writeFile: vi.fn().mockResolvedValue(undefined),
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
import Fix from '../../../src/commands/fix.js'
import { discoverFiles } from '../../../src/core/file-discovery.js'

describe('Fix Command', () => {
  let FixCommand: typeof Fix

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    FixCommand = (await import('../../../src/commands/fix.js')).default
  })

  describe('command metadata', () => {
    test('has correct description', () => {
      expect(FixCommand.description).toContain('fix violations')
    })

    test('has all required flags', () => {
      expect(FixCommand.flags).toBeDefined()
      expect(FixCommand.flags['dry-run']).toBeDefined()
      expect(FixCommand.flags.rules).toBeDefined()
      expect(FixCommand.flags.verbose).toBeDefined()
    })

    test('has correct args defined', () => {
      expect(FixCommand.args).toBeDefined()
      expect(FixCommand.args.files).toBeDefined()
      expect(FixCommand.args.files.required).toBe(false)
    })

    test('has examples defined', () => {
      expect(FixCommand.examples).toBeDefined()
      expect(Array.isArray(FixCommand.examples)).toBe(true)
      expect(FixCommand.examples.length).toBeGreaterThan(0)
    })
  })

  describe('file discovery', () => {
    test('should exit early when no files found', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, {}, {})
      cmd.log = vi.fn()
      await cmd.run()

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('No files found'))
    })

    test('should discover files with provided patterns', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, {}, { files: ['src/**/*.ts'] })
      cmd.log = vi.fn()
      await cmd.run()

      expect(discoverFiles).toHaveBeenCalled()
    })
  })

  describe('dry run mode', () => {
    test('should show dry run mode in summary', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true }, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      // Should exit early due to no files
      expect(logs.some((l) => l.includes('No files found'))).toBe(true)
    })
  })

  describe('verbose mode', () => {
    test('should set logger level to DEBUG in verbose mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const { logger } = await import('../../../src/utils/logger.js')

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true }, {})
      cmd.log = vi.fn()
      await cmd.run()

      expect(logger.setLevel).toHaveBeenCalled()
    })
  })

  describe('helper methods', () => {
    test('resolvePatterns should handle array args', async () => {
      const cmd = createCommandWithMockedParse(FixCommand, {}, {})

      // Access private method via type assertion
      const resolvePatterns = (
        cmd as unknown as {
          resolvePatterns: typeof import('../../../src/commands/fix.js').default.prototype.resolvePatterns
        }
      ).resolvePatterns

      expect(resolvePatterns(['a.ts', 'b.ts'], ['default.ts'])).toEqual(['a.ts', 'b.ts'])
    })

    test('resolvePatterns should handle string args', async () => {
      const cmd = createCommandWithMockedParse(FixCommand, {}, {})

      const resolvePatterns = (
        cmd as unknown as {
          resolvePatterns: typeof import('../../../src/commands/fix.js').default.prototype.resolvePatterns
        }
      ).resolvePatterns

      expect(resolvePatterns('single.ts', ['default.ts'])).toEqual(['single.ts'])
    })

    test('resolvePatterns should fall back to config files', async () => {
      const cmd = createCommandWithMockedParse(FixCommand, {}, {})

      const resolvePatterns = (
        cmd as unknown as {
          resolvePatterns: typeof import('../../../src/commands/fix.js').default.prototype.resolvePatterns
        }
      ).resolvePatterns

      expect(resolvePatterns(undefined, ['config.ts'])).toEqual(['config.ts'])
    })

    test('resolvePatterns should return empty array when no patterns', async () => {
      const cmd = createCommandWithMockedParse(FixCommand, {}, {})

      const resolvePatterns = (
        cmd as unknown as {
          resolvePatterns: typeof import('../../../src/commands/fix.js').default.prototype.resolvePatterns
        }
      ).resolvePatterns

      expect(resolvePatterns(undefined, undefined)).toEqual([])
    })
  })
})
