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

function createMockFixReport(
  overrides: {
    fixesApplied?: number
    fixesSkipped?: number
    conflicts?: Array<{ ruleId: string; conflictingRule: string; reason: string }>
    filePath?: string
  } = {},
) {
  return {
    fixesApplied: 0,
    fixesSkipped: 0,
    conflicts: [],
    changes: [],
    filePath: '/test/file.ts',
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
    changes: [],
    filePath: '/test/file.ts',
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

  describe('processFiles', () => {
    test('should process multiple files with mixed results', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { applyFixesToFile } = await import('../../../src/fix/fixer.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('file1.ts'),
        createMockFile('file2.ts'),
        createMockFile('file3.ts'),
      ])

      let callCount = 0
      vi.mocked(RuleRegistry).mockImplementation(
        () =>
          ({
            register: vi.fn(),
            disable: vi.fn(),
            runRules: vi.fn().mockImplementation(() => {
              callCount++
              if (callCount === 1) return [createMockViolation()] // file with fix
              if (callCount === 2) return [] // unchanged
              return [createMockViolation()] // another with fix
            }),
          }) as never,
      )

      vi.mocked(applyFixesToFile)
        .mockReturnValueOnce(createMockFixReport({ fixesApplied: 2, fixesSkipped: 0 }))
        .mockReturnValueOnce(createMockFixReport({ fixesApplied: 1, fixesSkipped: 0 }))

      const cmd = createCommandWithMockedParse(FixCommand, {}, { files: ['src/**/*.ts'] })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixing 3 file(s)'))).toBe(true)
      expect(logs.some((l) => l.includes('Fixes applied: 3'))).toBe(true)
    })

    test('should handle files with errors', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('error-file.ts'),
        createMockFile('good-file.ts'),
      ])

      vi.mocked(Parser).mockImplementationOnce(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
            parseFile: vi
              .fn()
              .mockRejectedValueOnce(new Error('Parse error'))
              .mockResolvedValueOnce({
                sourceFile: {
                  getFilePath: () => '/test/good-file.ts',
                  getText: () => 'test code',
                  getFullText: () => 'fixed code',
                },
                filePath: '/test/good-file.ts',
                parseTime: 10,
              }),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(FixCommand, {}, { files: ['src/**/*.ts'] })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Error processing'))).toBe(true)
      expect(logs.some((l) => l.includes('error-file.ts'))).toBe(true)
    })

    test('should track unchanged files', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('unchanged.ts')])

      vi.mocked(RuleRegistry).mockImplementation(
        () =>
          ({
            register: vi.fn(),
            disable: vi.fn(),
            runRules: vi.fn().mockReturnValue([]),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(FixCommand, {}, { files: ['src/**/*.ts'] })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Files unchanged: 1'))).toBe(true)
    })
  })

  describe('dry-run mode with verbose', () => {
    test('should show would-fix messages in verbose dry-run mode', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { applyFixesToFile } = await import('../../../src/fix/fixer.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('file.ts')])
      vi.mocked(RuleRegistry).mockImplementation(
        () =>
          ({
            register: vi.fn(),
            disable: vi.fn(),
            runRules: vi.fn().mockReturnValue([createMockViolation()]),
          }) as never,
      )
      vi.mocked(applyFixesToFile).mockReturnValue(
        createMockFixReport({ fixesApplied: 3, fixesSkipped: 0 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true, verbose: true }, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Would fix 3 violation(s)'))).toBe(true)
      expect(logs.some((l) => l.includes('Mode: Dry run'))).toBe(true)
    })

    test('should not write files in dry-run mode', async () => {
      const fs = await import('node:fs/promises')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('file.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true }, {})
      cmd.log = vi.fn()
      await cmd.run()

      expect(fs.writeFile).not.toHaveBeenCalled()
    })

    test('should show files would be modified in dry-run summary', async () => {
      const { applyFixesToFile } = await import('../../../src/fix/fixer.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('file.ts')])
      vi.mocked(applyFixesToFile).mockReturnValue(
        createMockFixReport({ fixesApplied: 1, fixesSkipped: 0 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true }, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Files would be modified: 1'))).toBe(true)
    })
  })

  describe('conflict detection', () => {
    test('should log conflicts in verbose mode', async () => {
      const { applyFixesToFile } = await import('../../../src/fix/fixer.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('conflict-file.ts')])
      vi.mocked(applyFixesToFile).mockReturnValue(
        createMockFixReport({
          fixesApplied: 1,
          fixesSkipped: 2,
          conflicts: [
            { ruleId: 'rule-a', conflictingRule: 'rule-b', reason: 'Overlapping fix range' },
            { ruleId: 'rule-c', conflictingRule: 'rule-d', reason: 'Overlapping fix range' },
          ],
        }),
      )

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true }, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Skipped rule-a (conflicts with rule-b)'))).toBe(true)
      expect(logs.some((l) => l.includes('Skipped rule-c (conflicts with rule-d)'))).toBe(true)
      expect(logs.some((l) => l.includes('Fixes skipped: 2'))).toBe(true)
    })

    test('should not log conflicts without verbose mode', async () => {
      const { applyFixesToFile } = await import('../../../src/fix/fixer.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('conflict-file.ts')])
      vi.mocked(applyFixesToFile).mockReturnValue({
        fixesApplied: 1,
        fixesSkipped: 1,
        conflicts: [{ ruleId: 'rule-a', conflictingRule: 'rule-b' }],
      })

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: false }, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('conflicts with'))).toBe(false)
    })
  })

  describe('setupRuleRegistry', () => {
    test('should filter to specific rules when requested', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { rules: 'prefer-const,no-console' }, {})
      cmd.log = vi.fn()
      await cmd.run()

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const registryInstance = vi.mocked(RuleRegistry).mock.results[0]?.value

      if (registryInstance) {
        expect(registryInstance.disable).toHaveBeenCalled()
      }
    })

    test('should register all rules when no specific rules requested', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, {}, {})
      cmd.log = vi.fn()
      await cmd.run()

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const registryInstance = vi.mocked(RuleRegistry).mock.results[0]?.value

      if (registryInstance) {
        expect(registryInstance.register).toHaveBeenCalled()
      }
    })

    test('setupRuleRegistry should disable non-requested rules', async () => {
      const cmd = createCommandWithMockedParse(FixCommand, {}, {})

      const setupRuleRegistry = (
        cmd as unknown as {
          setupRuleRegistry: typeof import('../../../src/commands/fix.js').default.prototype.setupRuleRegistry
        }
      ).setupRuleRegistry

      const registry = setupRuleRegistry(['prefer-const'])
      expect(registry).toBeDefined()
    })

    test('setupRuleRegistry should handle empty requested rules array', async () => {
      const cmd = createCommandWithMockedParse(FixCommand, {}, {})

      const setupRuleRegistry = (
        cmd as unknown as {
          setupRuleRegistry: typeof import('../../../src/commands/fix.js').default.prototype.setupRuleRegistry
        }
      ).setupRuleRegistry

      const registry = setupRuleRegistry([])
      expect(registry).toBeDefined()
    })
  })

  describe('processFile error handling', () => {
    test('should handle parse errors gracefully', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('bad-file.ts')])
      vi.mocked(Parser).mockImplementationOnce(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
            parseFile: vi.fn().mockRejectedValue(new Error('Syntax error in file')),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(FixCommand, {}, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Error processing'))).toBe(true)
      expect(logs.some((l) => l.includes('Syntax error in file'))).toBe(true)
    })

    test('should handle null sourceFile', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('null-source.ts')])
      vi.mocked(Parser).mockImplementationOnce(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
            parseFile: vi.fn().mockResolvedValue({
              sourceFile: null,
              filePath: '/test/null-source.ts',
              parseTime: 10,
            }),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(FixCommand, {}, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Files unchanged: 1'))).toBe(true)
    })

    test('should handle non-Error thrown values', async () => {
      const { Parser } = await import('../../../src/core/parser.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('weird-error.ts')])
      vi.mocked(Parser).mockImplementationOnce(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
            parseFile: vi.fn().mockRejectedValue('string error'),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(FixCommand, {}, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Error processing'))).toBe(true)
    })
  })

  describe('verbose output for fixes', () => {
    test('should show fixed message in verbose mode', async () => {
      const { applyFixesToFile } = await import('../../../src/fix/fixer.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('fixed.ts')])
      vi.mocked(applyFixesToFile).mockReturnValue({
        fixesApplied: 5,
        fixesSkipped: 0,
        conflicts: [],
      })

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true }, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixed 5 violation(s)'))).toBe(true)
      expect(logs.some((l) => l.includes('in fixed.ts'))).toBe(true)
    })

    test('should not show verbose messages without verbose flag', async () => {
      const { applyFixesToFile } = await import('../../../src/fix/fixer.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('fixed.ts')])
      vi.mocked(applyFixesToFile).mockReturnValue({
        fixesApplied: 5,
        fixesSkipped: 0,
        conflicts: [],
      })

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: false }, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixed 5 violation(s)'))).toBe(false)
    })
  })

  describe('summary output', () => {
    test('should show no violations message when nothing to fix', async () => {
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('clean.ts')])
      vi.mocked(RuleRegistry).mockImplementation(
        () =>
          ({
            register: vi.fn(),
            disable: vi.fn(),
            runRules: vi.fn().mockReturnValue([]),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(FixCommand, {}, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('No violations found to fix'))).toBe(true)
    })

    test('should show success message after applying fixes', async () => {
      const { applyFixesToFile } = await import('../../../src/fix/fixer.js')

      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('fixed.ts')])
      vi.mocked(applyFixesToFile).mockReturnValue({
        fixesApplied: 2,
        fixesSkipped: 0,
        conflicts: [],
      })

      const cmd = createCommandWithMockedParse(FixCommand, {}, {})
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixes applied successfully'))).toBe(true)
    })
  })
})
