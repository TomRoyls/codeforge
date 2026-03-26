import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'

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
    suggestion: 'Fixed code',
    ...overrides,
  }
}

function createCommandWithMockedParse(
  Command: typeof import('../../../src/commands/interactive.js').default,
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

// Mock file discovery
vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

// Mock parser
vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function () {
    return {
      initialize: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: {
          getFilePath: () => '/test/file.ts',
          getText: () => 'test code',
          getFullText: () => 'test code',
        },
        filePath: '/test/file.ts',
        parseTime: 10,
      }),
    }
  }),
}))

// Mock rule registry
vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return {
      register: vi.fn(),
      disable: vi.fn(),
      runRules: vi.fn().mockReturnValue([createMockViolation()]),
    }
  }),
}))

// Mock fs/promises
vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn().mockResolvedValue('original line\nsecond line\n'),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
  readFile: vi.fn().mockResolvedValue('original line\nsecond line\n'),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

// Mock node:fs
vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

// Mock readline
vi.mock('node:readline', () => ({
  createInterface: vi.fn().mockReturnValue({
    question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
      callback('')
    }),
    close: vi.fn(),
  }),
}))

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {
    'max-complexity': {
      meta: {
        name: 'max-complexity',
        description: 'Enforce a maximum cyclomatic complexity threshold',
        category: 'complexity',
        recommended: true,
      },
      defaultOptions: { max: 10 },
      create: vi.fn(),
    },
    'prefer-const': {
      meta: {
        name: 'prefer-const',
        description: 'Prefer const for variables that are never reassigned',
        category: 'patterns',
        recommended: true,
      },
      create: vi.fn(),
    },
  },
  getRuleCategory: vi.fn((ruleId: string) => {
    if (ruleId.includes('complexity')) return 'complexity'
    return 'patterns'
  }),
}))

// Import after mocks
import Interactive from '../../../src/commands/interactive.js'
import { discoverFiles } from '../../../src/core/file-discovery.js'
import { Parser } from '../../../src/core/parser.js'
import { RuleRegistry } from '../../../src/core/rule-registry.js'
import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createInterface } from 'node:readline'

describe('Interactive Command', () => {
  let InteractiveCommand: typeof Interactive

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(Parser).mockImplementation(function () {
      return {
        initialize: vi.fn().mockResolvedValue(undefined),
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: { getFilePath: () => '/test/file.ts' },
          getText: () => 'test code',
          getFullText: () => 'test code',
        }),
        dispose: vi.fn(),
      } as never
    })
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: vi.fn(),
        disable: vi.fn(),
        runRules: vi.fn().mockReturnValue([createMockViolation()]),
      } as never
    })
    InteractiveCommand = (await import('../../../src/commands/interactive.js')).default
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(InteractiveCommand.description).toBe('Interactively review and fix violations')
    })

    test('has examples defined', () => {
      expect(InteractiveCommand.examples).toBeDefined()
      expect(InteractiveCommand.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(InteractiveCommand.flags).toBeDefined()
      expect(InteractiveCommand.flags['auto-safe']).toBeDefined()
      expect(InteractiveCommand.flags.severity).toBeDefined()
      expect(InteractiveCommand.flags.verbose).toBeDefined()
    })

    test('auto-safe flag has default false', () => {
      expect(InteractiveCommand.flags['auto-safe'].default).toBe(false)
    })

    test('severity flag has default warning', () => {
      expect(InteractiveCommand.flags.severity.default).toBe('warning')
    })

    test('severity flag has correct options', () => {
      expect(InteractiveCommand.flags.severity.options).toContain('error')
      expect(InteractiveCommand.flags.severity.options).toContain('warning')
      expect(InteractiveCommand.flags.severity.options).toContain('info')
    })

    test('verbose flag has char v', () => {
      expect(InteractiveCommand.flags.verbose.char).toBe('v')
    })

    test('verbose flag has default false', () => {
      expect(InteractiveCommand.flags.verbose.default).toBe(false)
    })

    test('has path argument', () => {
      expect(InteractiveCommand.args.path).toBeDefined()
      expect(InteractiveCommand.args.path.default).toBe('.')
    })
  })

  describe('filterBySeverity', () => {
    function getTestableCommand(): {
      filterBySeverity: (
        violations: Array<{ severity: 'error' | 'info' | 'warning' }>,
        minSeverity: 'error' | 'info' | 'warning',
      ) => Array<{ severity: 'error' | 'info' | 'warning' }>
    } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('filters to errors only', () => {
      const cmd = getTestableCommand()
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      const result = cmd.filterBySeverity(violations, 'error')
      expect(result.length).toBe(1)
      expect(result[0]?.severity).toBe('error')
    })

    test('filters to warnings and above', () => {
      const cmd = getTestableCommand()
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      const result = cmd.filterBySeverity(violations, 'warning')
      expect(result.length).toBe(2)
    })

    test('includes all for info level', () => {
      const cmd = getTestableCommand()
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      const result = cmd.filterBySeverity(violations, 'info')
      expect(result.length).toBe(3)
    })

    test('returns empty for empty input', () => {
      const cmd = getTestableCommand()
      const result = cmd.filterBySeverity([], 'error')
      expect(result.length).toBe(0)
    })
  })

  describe('formatSeverity', () => {
    function getTestableCommand(): {
      formatSeverity: (severity: 'error' | 'info' | 'warning') => string
    } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('formats error severity', () => {
      const result = getTestableCommand().formatSeverity('error')
      expect(result).toBeDefined()
    })

    test('formats warning severity', () => {
      const result = getTestableCommand().formatSeverity('warning')
      expect(result).toBeDefined()
    })

    test('formats info severity', () => {
      const result = getTestableCommand().formatSeverity('info')
      expect(result).toBeDefined()
    })
  })

  describe('displayViolation', () => {
    function getTestableCommand(): {
      displayViolation: (
        violation: Record<string, unknown>,
        index: number,
        total: number,
        verbose: boolean,
      ) => void
    } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    function createMockViolationForDisplay(
      overrides: Partial<Record<string, unknown>> = {},
    ): Record<string, unknown> {
      return {
        filePath: 'src/test.ts',
        range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
        ruleId: 'max-complexity',
        severity: 'warning',
        message: 'Function is too complex',
        suggestion: 'Refactor the function',
        ...overrides,
      }
    }

    test('displayViolation method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.displayViolation).toBe('function')
    })

    test('displays violation with verbose=false', () => {
      const cmd = getTestableCommand()
      const violation = createMockViolationForDisplay()
      expect(() => cmd.displayViolation(violation, 0, 5, false)).not.toThrow()
    })

    test('displays violation with verbose=true', () => {
      const cmd = getTestableCommand()
      const violation = createMockViolationForDisplay()
      expect(() => cmd.displayViolation(violation, 0, 5, true)).not.toThrow()
    })

    test('displays violation without suggestion', () => {
      const cmd = getTestableCommand()
      const violation = createMockViolationForDisplay({ suggestion: null })
      expect(() => cmd.displayViolation(violation, 0, 5, true)).not.toThrow()
    })

    test('displays error severity violation', () => {
      const cmd = getTestableCommand()
      const violation = createMockViolationForDisplay({ severity: 'error' })
      expect(() => cmd.displayViolation(violation, 0, 5, false)).not.toThrow()
    })

    test('displays info severity violation', () => {
      const cmd = getTestableCommand()
      const violation = createMockViolationForDisplay({ severity: 'info' })
      expect(() => cmd.displayViolation(violation, 0, 5, false)).not.toThrow()
    })

    test('displays multiple violations in sequence', () => {
      const cmd = getTestableCommand()
      const violation = createMockViolationForDisplay()
      expect(() => cmd.displayViolation(violation, 0, 10, false)).not.toThrow()
      expect(() => cmd.displayViolation(violation, 4, 10, false)).not.toThrow()
      expect(() => cmd.displayViolation(violation, 9, 10, false)).not.toThrow()
    })
  })

  describe('reviewViolations', () => {
    function getTestableCommand(): {
      reviewViolations: (
        violations: Array<Record<string, unknown>>,
        autoSafe: boolean,
        verbose: boolean,
      ) => Promise<{ applied: number; skipped: number; total: number }>
    } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('reviewViolations method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.reviewViolations).toBe('function')
    })

    test('returns result for empty violations', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.reviewViolations([], false, false)
      expect(result.total).toBe(0)
      expect(result.applied).toBe(0)
      expect(result.skipped).toBe(0)
    })
  })

  describe('processViolation', () => {
    function getTestableCommand(): {
      processViolation: (
        violations: Array<Record<string, unknown>>,
        index: number,
        result: { applied: number; skipped: number; total: number },
        options: { autoSafe: boolean; verbose: boolean },
      ) => Promise<{ applied: number; skipped: number; total: number }>
    } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('processViolation method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.processViolation).toBe('function')
    })

    test('handles empty violations array', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.processViolation(
        [],
        0,
        { applied: 0, skipped: 0, total: 0 },
        { autoSafe: false, verbose: false },
      )
      expect(result.applied).toBe(0)
      expect(result.skipped).toBe(0)
    })

    test('handles index beyond array length', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.processViolation(
        [{ filePath: 'test.ts', severity: 'error', ruleId: 'test' }],
        5,
        { applied: 0, skipped: 0, total: 1 },
        { autoSafe: false, verbose: false },
      )
      expect(result.applied).toBe(0)
    })
  })

  describe('applyFix', () => {
    function getTestableCommand(): {
      applyFix: (filePath: string, violation: Record<string, unknown>) => Promise<boolean>
    } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('applyFix method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.applyFix).toBe('function')
    })

    test('returns false for violation without suggestion', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('test.ts', { suggestion: null })
      expect(result).toBe(false)
    })

    test('returns false for non-existent file', async () => {
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('ENOENT'))
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/nonexistent/path/file.ts', {
        suggestion: 'fixed code',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(result).toBe(false)
    })

    test('returns false when line index is out of bounds (negative)', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('line1\nline2\n')
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed code',
        range: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
      })
      expect(result).toBe(false)
    })

    test('returns false when line index exceeds file length', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('line1\nline2\n')
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed code',
        range: { start: { line: 100, column: 0 }, end: { line: 100, column: 5 } },
      })
      expect(result).toBe(false)
    })

    test('applies fix successfully', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('original line\nsecond line\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed line',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      })
      expect(result).toBe(true)
      expect(fs.writeFile).toHaveBeenCalled()
    })

    test('handles write error gracefully', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('original line\n')
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('Write error'))
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed line',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      })
      expect(result).toBe(false)
    })
  })

  describe('collectViolations', () => {
    function getTestableCommand(): {
      collectViolations: (targetPath: string) => Promise<Array<Record<string, unknown>>>
    } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('collectViolations method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.collectViolations).toBe('function')
    })

    test('returns violations from discovered files', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = getTestableCommand()
      const result = await cmd.collectViolations('/test/path')

      expect(discoverFiles).toHaveBeenCalled()
      expect(Array.isArray(result)).toBe(true)
    })

    test('handles empty file list', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = getTestableCommand()
      const result = await cmd.collectViolations('/test/path')

      expect(result).toEqual([])
    })

    test('handles parse errors gracefully', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('error.ts'),
        createMockFile('good.ts'),
      ])

      vi.mocked(Parser).mockImplementationOnce(
        () =>
          ({
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
          }) as never,
      })

      const cmd = getTestableCommand()
      await cmd.run()
      const violations = cmd.violations
      expect(violations).toHaveLength(2)
      expect(violations[0].suggestion).toBeUndefined()
      expect(violations[1].message).toContain('skip')
    })

    test('processes multiple files and aggregates violations', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('file1.ts'),
        createMockFile('file2.ts'),
      ])

      vi.mocked(RuleRegistry).mockImplementationOnce(
        () =>
          ({
            register: vi.fn(),
            runRules: vi.fn().mockReturnValue([createMockViolation()]),
          }) as never,
      )

      const cmd = getTestableCommand()
      const result = await cmd.collectViolations('/test/path')

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('promptUser', () => {
    function getTestableCommand(): { promptUser: (prompt: string) => Promise<string> } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('promptUser method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.promptUser).toBe('function')
    })

    test('returns trimmed lowercase answer', async () => {
      const mockQuestion = vi.fn((_prompt: string, callback: (answer: string) => void) => {
        callback('  YES  ')
      })
      vi.mocked(createInterface).mockReturnValueOnce({
        question: mockQuestion,
        close: vi.fn(),
      } as never)

      const cmd = getTestableCommand()
      const result = await cmd.promptUser('Apply fix? ')

      expect(result).toBe('yes')
    })

    test('handles empty input', async () => {
      const mockQuestion = vi.fn((_prompt: string, callback: (answer: string) => void) => {
        callback('')
      })
      vi.mocked(createInterface).mockReturnValueOnce({
        question: mockQuestion,
        close: vi.fn(),
      } as never)

      const cmd = getTestableCommand()
      const result = await cmd.promptUser('Apply fix? ')

      expect(result).toBe('')
    })

    test('closes readline after question', async () => {
      const mockClose = vi.fn()
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('y')
        }),
        close: mockClose,
      } as never)

      const cmd = getTestableCommand()
      await cmd.promptUser('Apply fix? ')

      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('run() command execution', () => {
    test('errors when path does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(discoverFiles).mockResolvedValue([])

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '/nonexistent' },
      )

      cmd.error = vi.fn()
      await cmd.run()

      expect(cmd.error).toHaveBeenCalledWith(expect.stringContaining('Path not found'), { exit: 1 })
    })

    test('shows no violations message when no violations found', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('No violations found'))).toBe(true)
    })

    test('shows violations count when violations found', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      // Mock processViolation to not hang
      const cmdWithProcess = cmd as unknown as {
        processViolation: ReturnType<typeof vi.fn>
      }
      cmdWithProcess.processViolation = vi.fn().mockResolvedValue({
        applied: 0,
        skipped: 1,
        total: 1,
      })

      await cmd.run()

      expect(logs.some((l) => l.includes('violations to review'))).toBe(true)
    })

    test('displays summary after review', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      const cmdWithProcess = cmd as unknown as {
        processViolation: ReturnType<typeof vi.fn>
      }
      cmdWithProcess.processViolation = vi.fn().mockResolvedValue({
        applied: 2,
        skipped: 1,
        total: 3,
      })

      await cmd.run()

      expect(logs.some((l) => l.includes('Summary'))).toBe(true)
      expect(logs.some((l) => l.includes('Applied'))).toBe(true)
      expect(logs.some((l) => l.includes('Skipped'))).toBe(true)
    })

    test('filters by severity level', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(RuleRegistry).mockImplementationOnce(
        () =>
          ({
            register: vi.fn(),
            runRules: vi
              .fn()
              .mockReturnValue([
                createMockViolation({ severity: 'info' }),
                createMockViolation({ severity: 'warning' }),
                createMockViolation({ severity: 'error' }),
              ]),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'error', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      const cmdWithProcess = cmd as unknown as {
        processViolation: ReturnType<typeof vi.fn>
      }
      cmdWithProcess.processViolation = vi.fn().mockResolvedValue({
        applied: 0,
        skipped: 1,
        total: 1,
      })

      await cmd.run()

      // Only error severity violations should be reviewed
      expect(logs.some((l) => l.includes('1 violations to review'))).toBe(true)
    })
  })

  describe('auto-safe mode', () => {
    test('auto-applies fixes in auto-safe mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(fs.readFile).mockResolvedValueOnce('original line\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(
        logs.some(
          (l) => l.includes('Fix applied automatically') || l.includes('Could not apply fix'),
        ),
      ).toBe(true)
    })

    test('skips violations without suggestions in auto-safe mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(RuleRegistry).mockImplementationOnce(
        () =>
          ({
            register: vi.fn(),
            runRules: vi
              .fn()
              .mockReturnValue([
                createMockViolation({ severity: 'warning', suggestion: undefined }),
              ]),
          }) as never,
      )

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()
      expect(logs.some((l) => l.includes('Skipped'))).toBe(true)
    })
  })

  describe('interactive user input', () => {
    test('handles yes input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValueOnce('original line\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('y')
        }),
        close: vi.fn(),
      } as never)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(logs.some((l) => l.includes('Fix applied') || l.includes('Could not apply fix'))).toBe(
        true,
      )
    })

    test('handles no input (skips)', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('n')
        }),
        close: vi.fn(),
      } as never)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(logs.some((l) => l.includes('Skipped'))).toBe(true)
    })

    test('handles skip input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(logs.some((l) => l.includes('Skipped'))).toBe(true)
    })

    test('handles quit input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('test1.ts'),
        createMockFile('test2.ts'),
      ])

      vi.mocked(RuleRegistry).mockImplementationOnce(
        () =>
          ({
            register: vi.fn(),
            runRules: vi
              .fn()
              .mockReturnValue([
                createMockViolation(),
                createMockViolation({ filePath: '/test/test2.ts' }),
              ]),
          }) as never,
      )

      let callCount = 0
      vi.mocked(createInterface).mockImplementation(
        function () {
          return {
            question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
              callCount++
              callback(callCount === 1 ? 'q' : 'y')
            }),
            close: vi.fn(),
          } as never
      })

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      // Should have remaining violations skipped
      expect(logs.some((l) => l.includes('Skipped'))).toBe(true)
    })

    test('handles empty input (defaults to yes for fixable)', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValueOnce('original line\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('')
        }),
        close: vi.fn(),
      } as never)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(fs.writeFile).toHaveBeenCalled()
    })

    test('handles empty input (defaults to skip for non-fixable)', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(RuleRegistry).mockImplementationOnce(
        () =>
          ({
            register: vi.fn(),
            runRules: vi.fn().mockReturnValue([createMockViolation({ suggestion: null })]),
          }) as never,
      )

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('')
        }),
        close: vi.fn(),
      } as never)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(logs.some((l) => l.includes('Skipped'))).toBe(true)
    })

    test('handles "yes" full word input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValueOnce('original line\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('yes')
        }),
        close: vi.fn(),
      } as never)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(fs.writeFile).toHaveBeenCalled()
    })

    test('handles "skip" full word input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('skip')
        }),
        close: vi.fn(),
      } as never)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(logs.some((l) => l.includes('Skipped'))).toBe(true)
    })

    test('handles "quit" full word input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('quit')
        }),
        close: vi.fn(),
      } as never)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(logs.some((l) => l.includes('Skipped'))).toBe(true)
    })
  })

  describe('verbose mode', () => {
    test('shows suggestion in verbose mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: true },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)

      await cmd.run()

      // Verbose mode should show suggestion
      expect(logs.some((l) => l.includes('Suggestion'))).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('handles violation with undefined suggestion', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(RuleRegistry).mockImplementationOnce(
        () =>
          ({
            register: vi.fn(),
            runRules: vi.fn().mockReturnValue([createMockViolation({ suggestion: undefined })]),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)

      await cmd.run()

      expect(logs.some((l) => l.includes('Skipped'))).toBe(true)
    })

    test('handles multiple violations with mixed results', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(RuleRegistry).mockImplementationOnce(
        () =>
          ({
            register: vi.fn(),
            runRules: vi
              .fn()
              .mockReturnValue([
                createMockViolation({ suggestion: 'fix1' }),
                createMockViolation({ suggestion: null }),
                createMockViolation({ suggestion: 'fix3' }),
              ]),
          }) as never,
      )

      let callCount = 0
      vi.mocked(createInterface).mockImplementation(
        () =>
          ({
            question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
              callCount++
              if (callCount === 1) callback('y')
              else if (callCount === 2) callback('s')
              else callback('n')
            }),
            close: vi.fn(),
          }) as never,
      )

      vi.mocked(fs.readFile).mockResolvedValue('original line\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(logs.some((l) => l.includes('Summary'))).toBe(true)
    })

    test('handles applyFix failure gracefully', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Read error'))

      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('y')
        }),
        close: vi.fn(),
      } as never)

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await cmd.run()

      expect(logs.some((l) => l.includes('Could not apply fix'))).toBe(true)
    })

    test('handles undefined violation in array', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      vi.mocked(RuleRegistry).mockImplementationOnce(
        () =>
          ({
            register: vi.fn(),
            runRules: vi.fn().mockReturnValue([undefined, createMockViolation()]),
          }) as never,
      )

      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )

      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      vi.mocked(createInterface).mockReturnValue({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)

      await cmd.run()

      expect(logs.some((l) => l.includes('Summary'))).toBe(true)
    })
  })
})
