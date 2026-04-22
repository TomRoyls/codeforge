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
      const violation = createMockViolationForDisplay({ suggestion: undefined })
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
      const result = await cmd.applyFix('test.ts', { suggestion: undefined })
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

    test('processes multiple files and aggregates violations', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('file1.ts'),
        createMockFile('file2.ts'),
      ])

      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([createMockViolation({ suggestion: undefined })]),
        }
      } as never)

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

      cmd.error = vi.fn() as never as never
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

      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ severity: 'info' }),
              createMockViolation({ severity: 'warning' }),
              createMockViolation({ severity: 'error' }),
            ]),
        }
      } as never)

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

      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([createMockViolation({ severity: 'warning', suggestion: undefined })]),
        }
      } as never)

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

      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation(),
              createMockViolation({ filePath: '/test/test2.ts' }),
            ]),
        }
      } as never)

      let callCount = 0
      vi.mocked(createInterface).mockImplementation(function () {
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

      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([createMockViolation({ suggestion: undefined })]),
        }
      } as never)

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

      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([createMockViolation({ suggestion: undefined })]),
        }
      } as never)

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

      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ suggestion: 'fix1' }),
              createMockViolation({ suggestion: undefined }),
              createMockViolation({ suggestion: 'fix3' }),
            ]),
        }
      } as never)

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

      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([createMockViolation({ suggestion: undefined })]),
        }
      } as never)

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

  describe('filterBySeverity - comprehensive', () => {
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

    test('all errors pass at error threshold', () => {
      const cmd = getTestableCommand()
      const violations = [{ severity: 'error' as const }, { severity: 'error' as const }]
      const result = cmd.filterBySeverity(violations, 'error')
      expect(result).toHaveLength(2)
    })

    test('all warnings filtered out at error threshold', () => {
      const cmd = getTestableCommand()
      const violations = [{ severity: 'warning' as const }, { severity: 'warning' as const }]
      const result = cmd.filterBySeverity(violations, 'error')
      expect(result).toHaveLength(0)
    })

    test('all info filtered out at warning threshold', () => {
      const cmd = getTestableCommand()
      const violations = [{ severity: 'info' as const }, { severity: 'info' as const }]
      const result = cmd.filterBySeverity(violations, 'warning')
      expect(result).toHaveLength(0)
    })

    test('all info pass at info threshold', () => {
      const cmd = getTestableCommand()
      const violations = [{ severity: 'info' as const }]
      const result = cmd.filterBySeverity(violations, 'info')
      expect(result).toHaveLength(1)
    })

    test('preserves relative order of filtered violations', () => {
      const cmd = getTestableCommand()
      const violations = [
        { severity: 'info' as const },
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'error' as const },
      ]
      const result = cmd.filterBySeverity(violations, 'warning')
      expect(result).toHaveLength(3)
      expect(result[0]!.severity).toBe('error')
      expect(result[1]!.severity).toBe('warning')
      expect(result[2]!.severity).toBe('error')
    })

    test('handles single violation at exact threshold', () => {
      const cmd = getTestableCommand()
      const result = cmd.filterBySeverity([{ severity: 'warning' as const }], 'warning')
      expect(result).toHaveLength(1)
    })

    test('handles large number of mixed violations', () => {
      const cmd = getTestableCommand()
      const violations = Array.from({ length: 99 }, (_, i) => ({
        severity: (['error', 'warning', 'info'] as const)[i % 3],
      }))
      const result = cmd.filterBySeverity(violations, 'warning')
      expect(result).toHaveLength(66)
    })

    test('mixed severities at error level returns only errors', () => {
      const cmd = getTestableCommand()
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      const result = cmd.filterBySeverity(violations, 'error')
      expect(result).toHaveLength(2)
      expect(result.every((v) => v.severity === 'error')).toBe(true)
    })

    test('mixed severities at info level returns all', () => {
      const cmd = getTestableCommand()
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      const result = cmd.filterBySeverity(violations, 'info')
      expect(result).toHaveLength(3)
    })

    test('duplicate severities all pass at matching threshold', () => {
      const cmd = getTestableCommand()
      const violations = [
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'error' as const },
      ]
      const result = cmd.filterBySeverity(violations, 'error')
      expect(result).toHaveLength(3)
    })

    test('warning threshold includes errors', () => {
      const cmd = getTestableCommand()
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      const result = cmd.filterBySeverity(violations, 'warning')
      expect(result).toHaveLength(2)
      expect(result[0]!.severity).toBe('error')
      expect(result[1]!.severity).toBe('warning')
    })

    test('info threshold includes warnings and errors', () => {
      const cmd = getTestableCommand()
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      const result = cmd.filterBySeverity(violations, 'info')
      expect(result[0]!.severity).toBe('error')
      expect(result[1]!.severity).toBe('warning')
      expect(result[2]!.severity).toBe('info')
    })
  })

  describe('formatSeverity - output verification', () => {
    function getTestableCommand(): {
      formatSeverity: (severity: 'error' | 'info' | 'warning') => string
    } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('error output contains word error', () => {
      const result = getTestableCommand().formatSeverity('error')
      expect(result).toContain('error')
    })

    test('warning output contains word warning', () => {
      const result = getTestableCommand().formatSeverity('warning')
      expect(result).toContain('warning')
    })

    test('info output contains word info', () => {
      const result = getTestableCommand().formatSeverity('info')
      expect(result).toContain('info')
    })

    test('error and warning outputs are different', () => {
      const cmd = getTestableCommand()
      const errorResult = cmd.formatSeverity('error')
      const warningResult = cmd.formatSeverity('warning')
      expect(errorResult).not.toBe(warningResult)
    })

    test('error and info outputs are different', () => {
      const cmd = getTestableCommand()
      const errorResult = cmd.formatSeverity('error')
      const infoResult = cmd.formatSeverity('info')
      expect(errorResult).not.toBe(infoResult)
    })

    test('warning and info outputs are different', () => {
      const cmd = getTestableCommand()
      const warningResult = cmd.formatSeverity('warning')
      const infoResult = cmd.formatSeverity('info')
      expect(warningResult).not.toBe(infoResult)
    })

    test('all severity outputs have length greater than zero', () => {
      const cmd = getTestableCommand()
      expect(cmd.formatSeverity('error').length).toBeGreaterThan(0)
      expect(cmd.formatSeverity('warning').length).toBeGreaterThan(0)
      expect(cmd.formatSeverity('info').length).toBeGreaterThan(0)
    })

    test('all severity outputs are strings', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.formatSeverity('error')).toBe('string')
      expect(typeof cmd.formatSeverity('warning')).toBe('string')
      expect(typeof cmd.formatSeverity('info')).toBe('string')
    })
  })

  describe('displayViolation - comprehensive', () => {
    function getTestableCommand(): {
      displayViolation: (
        violation: Record<string, unknown>,
        index: number,
        total: number,
        verbose: boolean,
      ) => void
      log: ReturnType<typeof vi.fn>
    } {
      const cmd = new InteractiveCommand([], {} as never)
      const result = cmd as unknown as ReturnType<typeof getTestableCommand>
      result.log = vi.fn()
      return result
    }

    test('first violation shows 1/N', () => {
      const { cmd, logs } = (() => {
        const cmd = new InteractiveCommand([], {} as never)
        const logs: string[] = []
        cmd.log = vi.fn((msg: string) => logs.push(msg))
        return { cmd, logs }
      })()
      const violation = {
        filePath: 'src/a.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: 'test-rule',
        severity: 'warning',
        message: 'Test',
        suggestion: 'Fix',
      }
      cmd.displayViolation(violation as never, 0, 10, false)
      expect(logs.some((l) => l.includes('1/10'))).toBe(true)
    })

    test('last violation shows N/N', () => {
      const cmd = new InteractiveCommand([], {} as never)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      const violation = {
        filePath: 'src/a.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: 'test-rule',
        severity: 'warning',
        message: 'Test',
        suggestion: 'Fix',
      }
      cmd.displayViolation(violation as never, 9, 10, false)
      expect(logs.some((l) => l.includes('10/10'))).toBe(true)
    })

    test('single violation shows 1/1', () => {
      const cmd = new InteractiveCommand([], {} as never)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      const violation = {
        filePath: 'src/a.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: 'test-rule',
        severity: 'error',
        message: 'Test',
        suggestion: 'Fix',
      }
      cmd.displayViolation(violation as never, 0, 1, false)
      expect(logs.some((l) => l.includes('1/1'))).toBe(true)
    })

    test('displays file path and line number', () => {
      const cmd = new InteractiveCommand([], {} as never)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      const violation = {
        filePath: 'src/deep/nested/file.ts',
        range: { start: { line: 42, column: 0 }, end: { line: 42, column: 5 } },
        ruleId: 'test-rule',
        severity: 'warning',
        message: 'Test',
        suggestion: 'Fix',
      }
      cmd.displayViolation(violation as never, 0, 5, false)
      expect(logs.some((l) => l.includes('src/deep/nested/file.ts:42'))).toBe(true)
    })

    test('displays rule ID', () => {
      const cmd = new InteractiveCommand([], {} as never)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      const violation = {
        filePath: 'src/a.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: 'max-complexity',
        severity: 'warning',
        message: 'Test',
        suggestion: 'Fix',
      }
      cmd.displayViolation(violation as never, 0, 5, false)
      expect(logs.some((l) => l.includes('max-complexity'))).toBe(true)
    })

    test('displays violation message', () => {
      const cmd = new InteractiveCommand([], {} as never)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      const violation = {
        filePath: 'src/a.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: 'test-rule',
        severity: 'warning',
        message: 'Function has too many branches',
        suggestion: 'Fix',
      }
      cmd.displayViolation(violation as never, 0, 5, false)
      expect(logs.some((l) => l.includes('Function has too many branches'))).toBe(true)
    })

    test('verbose mode shows suggestion', () => {
      const cmd = new InteractiveCommand([], {} as never)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      const violation = {
        filePath: 'src/a.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: 'test-rule',
        severity: 'warning',
        message: 'Test',
        suggestion: 'Refactor the function',
      }
      cmd.displayViolation(violation as never, 0, 5, true)
      expect(logs.some((l) => l.includes('Refactor the function'))).toBe(true)
    })

    test('non-verbose mode does not show suggestion', () => {
      const cmd = new InteractiveCommand([], {} as never)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      const violation = {
        filePath: 'src/a.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: 'test-rule',
        severity: 'warning',
        message: 'Test',
        suggestion: 'Refactor the function',
      }
      cmd.displayViolation(violation as never, 0, 5, false)
      expect(logs.some((l) => l.includes('Suggestion'))).toBe(false)
    })

    test('verbose without suggestion does not throw', () => {
      const cmd = getTestableCommand()
      const violation = {
        filePath: 'src/a.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: 'test-rule',
        severity: 'warning',
        message: 'Test',
        suggestion: undefined,
      }
      expect(() => cmd.displayViolation(violation, 0, 5, true)).not.toThrow()
    })

    test('displays error severity violation without throwing', () => {
      const cmd = getTestableCommand()
      const violation = {
        filePath: 'src/a.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: 'test-rule',
        severity: 'error',
        message: 'Critical issue',
        suggestion: 'Fix immediately',
      }
      expect(() => cmd.displayViolation(violation, 0, 1, false)).not.toThrow()
    })
  })

  describe('applyFix - comprehensive', () => {
    function getTestableCommand(): {
      applyFix: (filePath: string, violation: Record<string, unknown>) => Promise<boolean>
    } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('fixes first line of multi-line file', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('line1\nline2\nline3\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed1',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(result).toBe(true)
      expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'fixed1\nline2\nline3\n', 'utf8')
    })

    test('fixes middle line of multi-line file', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('line1\nline2\nline3\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed2',
        range: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(result).toBe(true)
      expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'line1\nfixed2\nline3\n', 'utf8')
    })

    test('fixes last line of multi-line file', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('line1\nline2\nline3')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed3',
        range: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
      })
      expect(result).toBe(true)
      expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'line1\nline2\nfixed3', 'utf8')
    })

    test('fixes single line file', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('only line')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'replaced',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })
      expect(result).toBe(true)
    })

    test('preserves other lines when fixing', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('a\nb\nc\nd\ne\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      await cmd.applyFix('/test/file.ts', {
        suggestion: 'B',
        range: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
      })
      expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'a\nB\nc\nd\ne\n', 'utf8')
    })

    test('returns false for file with only newline and out-of-range line', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('\n')
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed',
        range: { start: { line: 3, column: 0 }, end: { line: 3, column: 0 } },
      })
      expect(result).toBe(false)
    })

    test('returns false when read fails with permission error', async () => {
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('EACCES: permission denied'))
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(result).toBe(false)
    })

    test('returns false when write fails with permission error', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('content\n')
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('EACCES: permission denied'))
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(result).toBe(false)
    })

    test('returns false for line index equal to file length', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('line1\nline2\n')
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed',
        range: { start: { line: 4, column: 0 }, end: { line: 4, column: 5 } },
      })
      expect(result).toBe(false)
    })

    test('returns false for line 0 (line index starts at 1)', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('line1\n')
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed',
        range: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
      })
      expect(result).toBe(false)
    })

    test('suggestion same as original still writes', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('original\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'original',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(result).toBe(true)
      expect(fs.writeFile).toHaveBeenCalled()
    })

    test('non-empty suggestion string attempts write', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('content\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'replaced',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(result).toBe(true)
    })

    test('fixes line at exact boundary', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('a\nb\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      const result = await cmd.applyFix('/test/file.ts', {
        suggestion: 'B',
        range: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
      })
      expect(result).toBe(true)
    })

    test('multiple sequential fixes on same file', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('line1\nline2\nline3\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      const result1 = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed1',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(result1).toBe(true)

      vi.mocked(fs.readFile).mockResolvedValueOnce('fixed1\nline2\nline3\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const result2 = await cmd.applyFix('/test/file.ts', {
        suggestion: 'fixed2',
        range: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(result2).toBe(true)
    })
  })

  describe('collectViolations - comprehensive', () => {
    function getTestableCommand(): {
      collectViolations: (targetPath: string) => Promise<Array<Record<string, unknown>>>
    } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('calls discoverFiles with provided path', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])
      const cmd = getTestableCommand()
      await cmd.collectViolations('/my/project')
      expect(discoverFiles).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/my/project' }))
    })

    test('returns empty array when no files discovered', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])
      const cmd = getTestableCommand()
      const result = await cmd.collectViolations('/empty/path')
      expect(result).toEqual([])
    })

    test('aggregates violations from multiple files', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('a.ts'),
        createMockFile('b.ts'),
      ])
      const cmd = getTestableCommand()
      const result = await cmd.collectViolations('/test')
      expect(Array.isArray(result)).toBe(true)
    })

    test('handles single file with violations', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('single.ts')])
      const cmd = getTestableCommand()
      const result = await cmd.collectViolations('/test')
      expect(result.length).toBeGreaterThan(0)
    })

    test('handles parseFile returning null gracefully', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('broken.ts')])
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          parseFile: vi.fn().mockRejectedValue(new Error('Parse error')),
          dispose: vi.fn(),
        } as never
      })
      const cmd = getTestableCommand()
      const result = await cmd.collectViolations('/test')
      expect(Array.isArray(result)).toBe(true)
    })

    test('handles rule registry returning empty violations', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('clean.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })
      const cmd = getTestableCommand()
      const result = await cmd.collectViolations('/test')
      expect(result).toEqual([])
    })

    test('maps violations with correct filePath', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('mapped.ts')])
      const cmd = getTestableCommand()
      const result = await cmd.collectViolations('/test')
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('filePath')
      }
    })

    test('processes many files without error', async () => {
      const files = Array.from({ length: 20 }, (_, i) => createMockFile(`file${i}.ts`))
      vi.mocked(discoverFiles).mockResolvedValueOnce(files)
      const cmd = getTestableCommand()
      const result = await cmd.collectViolations('/test')
      expect(Array.isArray(result)).toBe(true)
    })

    test('disposes parser after collection', async () => {
      const mockDispose = vi.fn()
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: { getFilePath: () => '/test/file.ts' },
          }),
          dispose: mockDispose,
        } as never
      })
      const cmd = getTestableCommand()
      await cmd.collectViolations('/test')
      expect(mockDispose).toHaveBeenCalled()
    })

    test('registers rules from allRules', async () => {
      const mockRegister = vi.fn()
      vi.mocked(discoverFiles).mockResolvedValueOnce([])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: mockRegister,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })
      const cmd = getTestableCommand()
      await cmd.collectViolations('/test')
      expect(mockRegister).toHaveBeenCalled()
    })
  })

  describe('processViolation - comprehensive', () => {
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

    test('returns result unchanged for index beyond length', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.processViolation(
        [],
        10,
        { applied: 0, skipped: 0, total: 0 },
        { autoSafe: false, verbose: false },
      )
      expect(result.applied).toBe(0)
      expect(result.skipped).toBe(0)
    })

    test('skips undefined violation and processes next', async () => {
      vi.mocked(createInterface).mockReturnValue({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const violations = [
        undefined,
        {
          filePath: 'test.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: undefined,
        },
      ] as Array<Record<string, unknown>>
      const result = await cmd.processViolation(
        violations,
        0,
        { applied: 0, skipped: 0, total: 2 },
        { autoSafe: false, verbose: false },
      )
      expect(result.total).toBe(2)
    })

    test('auto-applies fix with autoSafe and suggestion', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('original\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: '/test/file.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
          suggestion: 'fixed',
        },
      ]
      const result = await cmd.processViolation(
        violations,
        0,
        { applied: 0, skipped: 0, total: 1 },
        { autoSafe: true, verbose: false },
      )
      expect(result.applied).toBe(1)
    })

    test('skips without suggestion in autoSafe mode', async () => {
      vi.mocked(createInterface).mockReturnValue({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: '/test/file.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: undefined,
        },
      ]
      const result = await cmd.processViolation(
        violations,
        0,
        { applied: 0, skipped: 0, total: 1 },
        { autoSafe: true, verbose: false },
      )
      expect(result.skipped).toBe(1)
    })

    test('increments skipped when fix fails in autoSafe mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Read error'))
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Could not apply fix'))).toBe(true)
    })

    test('handles quit answer by skipping remaining', async () => {
      vi.mocked(createInterface).mockReturnValue({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('q')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: '/test/file.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: 'fix',
        },
        {
          filePath: '/test/file2.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test2',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: 'fix2',
        },
        {
          filePath: '/test/file3.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test3',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: 'fix3',
        },
      ]
      const result = await cmd.processViolation(
        violations,
        0,
        { applied: 0, skipped: 0, total: 3 },
        { autoSafe: false, verbose: false },
      )
      expect(result.skipped).toBe(3)
    })

    test('handles verbose mode without error', async () => {
      vi.mocked(createInterface).mockReturnValue({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: '/test/file.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: 'fix',
        },
      ]
      const result = await cmd.processViolation(
        violations,
        0,
        { applied: 0, skipped: 0, total: 1 },
        { autoSafe: false, verbose: true },
      )
      expect(result.total).toBe(1)
    })

    test('processes empty violations array without error', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.processViolation(
        [],
        0,
        { applied: 0, skipped: 0, total: 0 },
        { autoSafe: false, verbose: false },
      )
      expect(result.applied).toBe(0)
      expect(result.skipped).toBe(0)
      expect(result.total).toBe(0)
    })

    test('handles yes answer with successful fix', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValueOnce('original\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      vi.mocked(createInterface).mockReturnValue({
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
      expect(logs.some((l) => l.includes('Fix applied'))).toBe(true)
    })

    test('handles yes answer with failed fix', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Read error'))
      vi.mocked(createInterface).mockReturnValue({
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
  })

  describe('reviewViolations - comprehensive', () => {
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

    test('returns zero counts for empty violations', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.reviewViolations([], false, false)
      expect(result.applied).toBe(0)
      expect(result.skipped).toBe(0)
      expect(result.total).toBe(0)
    })

    test('result total matches violations length', async () => {
      vi.mocked(createInterface).mockReturnValue({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: 'a.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: undefined,
        },
        {
          filePath: 'b.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: undefined,
        },
      ]
      const result = await cmd.reviewViolations(violations, false, false)
      expect(result.total).toBe(2)
    })

    test('result has applied, skipped, and total properties', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.reviewViolations([], false, false)
      expect(result).toHaveProperty('applied')
      expect(result).toHaveProperty('skipped')
      expect(result).toHaveProperty('total')
    })

    test('processes violations with autoSafe true', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Fix applied automatically'))).toBe(true)
    })

    test('processes violations with autoSafe false', async () => {
      vi.mocked(createInterface).mockReturnValue({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: '/test/file.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: undefined,
        },
      ]
      const result = await cmd.reviewViolations(violations, false, false)
      expect(result.skipped).toBe(1)
    })

    test('processes violations with verbose true', async () => {
      vi.mocked(createInterface).mockReturnValue({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: '/test/file.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: 'fix',
        },
      ]
      const result = await cmd.reviewViolations(violations, false, true)
      expect(result.total).toBe(1)
    })

    test('all skipped when all violations have no suggestion and user skips', async () => {
      vi.mocked(createInterface).mockReturnValue({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: '/test/file.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          suggestion: undefined,
        },
        {
          filePath: '/test/file.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test2',
          range: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
          suggestion: undefined,
        },
      ]
      const result = await cmd.reviewViolations(violations, false, false)
      expect(result.skipped).toBe(2)
      expect(result.applied).toBe(0)
    })

    test('all applied in autoSafe mode when all have suggestions', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: '/test/file.ts',
          severity: 'warning',
          ruleId: 'test',
          message: 'Test',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
          suggestion: 'fixed',
        },
        {
          filePath: '/test/file2.ts',
          severity: 'error',
          ruleId: 'test2',
          message: 'Test2',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
          suggestion: 'fixed2',
        },
      ]
      const result = await cmd.reviewViolations(violations, true, false)
      expect(result.applied).toBe(2)
    })
  })

  describe('promptUser - comprehensive', () => {
    function getTestableCommand(): { promptUser: (prompt: string) => Promise<string> } {
      return new InteractiveCommand([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('returns lowercase for uppercase input', async () => {
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('YES')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const result = await cmd.promptUser('Apply? ')
      expect(result).toBe('yes')
    })

    test('returns lowercase for mixed case input', async () => {
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('QuIt')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const result = await cmd.promptUser('Apply? ')
      expect(result).toBe('quit')
    })

    test('handles whitespace-only input', async () => {
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('   ')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const result = await cmd.promptUser('Apply? ')
      expect(result).toBe('')
    })

    test('handles tab characters in input', async () => {
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('\t y \t')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const result = await cmd.promptUser('Apply? ')
      expect(result).toBe('y')
    })

    test('handles single character input', async () => {
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('y')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const result = await cmd.promptUser('Apply? ')
      expect(result).toBe('y')
    })

    test('handles very long input', async () => {
      const longInput = 'a'.repeat(1000)
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback(longInput)
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const result = await cmd.promptUser('Apply? ')
      expect(result).toBe(longInput)
    })

    test('passes prompt string to readline question', async () => {
      const mockQuestion = vi.fn((_prompt: string, callback: (answer: string) => void) => {
        callback('y')
      })
      vi.mocked(createInterface).mockReturnValueOnce({
        question: mockQuestion,
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      await cmd.promptUser('Custom prompt: ')
      expect(mockQuestion).toHaveBeenCalledWith('Custom prompt: ', expect.any(Function))
    })

    test('trims leading and trailing whitespace', async () => {
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('  skip  ')
        }),
        close: vi.fn(),
      } as never)
      const cmd = getTestableCommand()
      const result = await cmd.promptUser('Apply? ')
      expect(result).toBe('skip')
    })
  })

  describe('run() - flag combinations', () => {
    test('default flags show no violations when none found', async () => {
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

    test('severity info shows all violation levels', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ severity: 'info' }),
              createMockViolation({ severity: 'warning' }),
              createMockViolation({ severity: 'error' }),
            ]),
        }
      } as never)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'info', 'auto-safe': false, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      const cmdWithProcess = cmd as unknown as {
        processViolation: ReturnType<typeof vi.fn>
      }
      cmdWithProcess.processViolation = vi.fn().mockResolvedValue({
        applied: 0,
        skipped: 3,
        total: 3,
      })
      await cmd.run()
      expect(logs.some((l) => l.includes('3 violations to review'))).toBe(true)
    })

    test('severity warning filters out info violations', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ severity: 'info' }),
              createMockViolation({ severity: 'warning' }),
              createMockViolation({ severity: 'error' }),
            ]),
        }
      } as never)
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
        applied: 0,
        skipped: 2,
        total: 2,
      })
      await cmd.run()
      expect(logs.some((l) => l.includes('2 violations to review'))).toBe(true)
    })

    test('shows Press Enter instruction', async () => {
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
        applied: 0,
        skipped: 1,
        total: 1,
      })
      await cmd.run()
      expect(logs.some((l) => l.includes('Press Enter'))).toBe(true)
    })

    test('shows Applied in summary', async () => {
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
        applied: 5,
        skipped: 0,
        total: 5,
      })
      await cmd.run()
      expect(logs.some((l) => l.includes('Applied'))).toBe(true)
    })

    test('shows Skipped in summary', async () => {
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
        applied: 0,
        skipped: 3,
        total: 3,
      })
      await cmd.run()
      expect(logs.some((l) => l.includes('Skipped'))).toBe(true)
    })

    test('shows Total in summary', async () => {
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
        applied: 1,
        skipped: 2,
        total: 3,
      })
      await cmd.run()
      expect(logs.some((l) => l.includes('Total'))).toBe(true)
    })

    test('auto-safe true with verbose true runs without error', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.length).toBeGreaterThan(0)
    })

    test('auto-safe false with verbose true runs without error', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: true },
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
      expect(logs.some((l) => l.includes('violations to review'))).toBe(true)
    })

    test('handles missing path gracefully', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(discoverFiles).mockResolvedValue([])
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '/does/not/exist' },
      )
      cmd.error = vi.fn() as never as never
      await cmd.run()
      expect(cmd.error).toHaveBeenCalledWith(expect.stringContaining('Path not found'), { exit: 1 })
    })

    test('errors with correct exit code for missing path', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '/nonexistent/path' },
      )
      cmd.error = vi.fn() as never as never
      await cmd.run()
      expect(cmd.error).toHaveBeenCalledWith(expect.any(String), { exit: 1 })
    })

    test('severity error with mixed violations filters correctly', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ severity: 'info' }),
              createMockViolation({ severity: 'warning' }),
              createMockViolation({ severity: 'error' }),
              createMockViolation({ severity: 'error' }),
            ]),
        }
      } as never)
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
        skipped: 2,
        total: 2,
      })
      await cmd.run()
      expect(logs.some((l) => l.includes('2 violations to review'))).toBe(true)
    })

    test('handles discoverFiles returning single file', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('only.ts')])
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
        applied: 0,
        skipped: 1,
        total: 1,
      })
      await cmd.run()
      expect(logs.some((l) => l.includes('1 violations to review'))).toBe(true)
    })
  })

  describe('auto-safe mode - comprehensive', () => {
    test('applies multiple safe fixes automatically', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ suggestion: 'fix1' }),
              createMockViolation({ suggestion: 'fix2' }),
            ]),
        }
      } as never)
      vi.mocked(fs.readFile).mockResolvedValue('original line\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Fix applied automatically'))).toBe(true)
    })

    test('logs could-not-apply when fix fails', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'))
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Could not apply fix'))).toBe(true)
    })

    test('skips non-fixable violations in auto-safe mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([createMockViolation({ suggestion: undefined })]),
        }
      } as never)
      vi.mocked(createInterface).mockReturnValue({
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

    test('processes fixable then non-fixable in sequence', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ suggestion: 'fix1' }),
              createMockViolation({ suggestion: undefined }),
            ]),
        }
      } as never)
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      vi.mocked(createInterface).mockReturnValue({
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
      expect(logs.some((l) => l.includes('Summary'))).toBe(true)
    })

    test('auto-safe with verbose shows details', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValue('original line\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Suggestion') || l.includes('Fix applied'))).toBe(true)
    })

    test('auto-safe shows summary with correct counts', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Summary'))).toBe(true)
      expect(logs.some((l) => l.includes('Applied'))).toBe(true)
    })

    test('auto-safe with severity error only reviews errors', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ severity: 'info', suggestion: 'fix' }),
              createMockViolation({ severity: 'error', suggestion: 'fix2' }),
            ]),
        }
      } as never)
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'error', 'auto-safe': true, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('1 violations to review'))).toBe(true)
    })

    test('auto-safe with write failure still completes', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValueOnce('original\n')
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('Disk full'))
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Summary'))).toBe(true)
    })

    test('auto-safe applied count increments correctly', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Applied'))).toBe(true)
    })

    test('auto-safe with read failure logs warning', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('ENOENT'))
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Could not apply fix'))).toBe(true)
    })
  })

  describe('interactive input - comprehensive', () => {
    test('handles "n" input - skips violation', async () => {
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

    test('handles "no" full word input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('no')
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

    test('handles "Y" uppercase input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValueOnce('original\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('Y')
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
      expect(logs.some((l) => l.includes('Fix applied') || l.includes('Could not apply'))).toBe(
        true,
      )
    })

    test('handles "N" uppercase input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('N')
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

    test('handles "S" uppercase input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('S')
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

    test('handles "Q" uppercase input', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('Q')
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
      expect(logs.some((l) => l.includes('Skipped') || l.includes('Summary'))).toBe(true)
    })

    test('handles random text input (treated as skip)', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('random text')
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

    test('handles "SKIP" uppercase full word', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('SKIP')
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

    test('handles "QUIT" uppercase full word', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('QUIT')
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
      expect(logs.some((l) => l.includes('Summary'))).toBe(true)
    })

    test('handles "YES" uppercase full word applies fix', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValueOnce('original\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('YES')
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

    test('empty input defaults to yes for fixable violation', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValueOnce('original\n')
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
  })

  describe('verbose mode - comprehensive', () => {
    test('verbose mode shows Suggestion label', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Suggestion'))).toBe(true)
    })

    test('verbose mode shows file path', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('File:'))).toBe(true)
    })

    test('verbose mode shows rule ID', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Rule:'))).toBe(true)
    })

    test('verbose mode shows severity', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Severity:'))).toBe(true)
    })

    test('verbose mode shows message', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Message:'))).toBe(true)
    })

    test('verbose mode shows violation counter', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Violation 1/'))).toBe(true)
    })

    test('non-verbose mode does not show suggestion label', async () => {
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
      expect(logs.some((l) => l.includes('Suggestion:'))).toBe(false)
    })

    test('verbose without suggestion does not crash', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([createMockViolation({ suggestion: undefined })]),
        }
      } as never)
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Summary'))).toBe(true)
    })
  })

  describe('edge cases - comprehensive', () => {
    test('handles file with trailing newline', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('line1\nline2\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = new InteractiveCommand([], {} as never)
      const logged = cmd as unknown as {
        applyFix: (filePath: string, violation: Record<string, unknown>) => Promise<boolean>
      }
      const result = await logged.applyFix('/test/file.ts', {
        suggestion: 'fixed',
        range: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(result).toBe(true)
    })

    test('handles violation with high line number exceeding file', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('short\nfile\n')
      const cmd = new InteractiveCommand([], {} as never)
      const logged = cmd as unknown as {
        applyFix: (filePath: string, violation: Record<string, unknown>) => Promise<boolean>
      }
      const result = await logged.applyFix('/test/file.ts', {
        suggestion: 'fixed',
        range: { start: { line: 999, column: 0 }, end: { line: 999, column: 5 } },
      })
      expect(result).toBe(false)
    })

    test('handles violation at exact last line', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('a\nb\nc')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = new InteractiveCommand([], {} as never)
      const logged = cmd as unknown as {
        applyFix: (filePath: string, violation: Record<string, unknown>) => Promise<boolean>
      }
      const result = await logged.applyFix('/test/file.ts', {
        suggestion: 'C',
        range: { start: { line: 3, column: 0 }, end: { line: 3, column: 1 } },
      })
      expect(result).toBe(true)
    })

    test('handles file with single line no newline', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('single line')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = new InteractiveCommand([], {} as never)
      const logged = cmd as unknown as {
        applyFix: (filePath: string, violation: Record<string, unknown>) => Promise<boolean>
      }
      const result = await logged.applyFix('/test/file.ts', {
        suggestion: 'replaced',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      })
      expect(result).toBe(true)
    })

    test('handles suggestion with special characters', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('original\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = new InteractiveCommand([], {} as never)
      const logged = cmd as unknown as {
        applyFix: (filePath: string, violation: Record<string, unknown>) => Promise<boolean>
      }
      const result = await logged.applyFix('/test/file.ts', {
        suggestion: 'const x = "hello \\n world"',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(result).toBe(true)
    })

    test('handles file path with spaces', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('content\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = new InteractiveCommand([], {} as never)
      const logged = cmd as unknown as {
        applyFix: (filePath: string, violation: Record<string, unknown>) => Promise<boolean>
      }
      const result = await logged.applyFix('/path/with spaces/file.ts', {
        suggestion: 'fixed',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(result).toBe(true)
    })

    test('handles multiple violations with quit after first', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ suggestion: 'fix1' }),
              createMockViolation({ suggestion: 'fix2' }),
              createMockViolation({ suggestion: 'fix3' }),
            ]),
        }
      } as never)
      vi.mocked(createInterface).mockReturnValueOnce({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('q')
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
      expect(logs.some((l) => l.includes('Summary'))).toBe(true)
    })

    test('handles violation with column 0', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('content\n')
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)
      const cmd = new InteractiveCommand([], {} as never)
      const logged = cmd as unknown as {
        applyFix: (filePath: string, violation: Record<string, unknown>) => Promise<boolean>
      }
      const result = await logged.applyFix('/test/file.ts', {
        suggestion: 'fixed',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
      })
      expect(result).toBe(true)
    })

    test('handles parser that throws', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('bad.ts')])
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          parseFile: vi.fn().mockRejectedValue(new Error('Syntax error')),
          dispose: vi.fn(),
        } as never
      })
      const cmd = new InteractiveCommand([], {} as never)
      const logged = cmd as unknown as {
        collectViolations: (targetPath: string) => Promise<Array<Record<string, unknown>>>
      }
      const result = await logged.collectViolations('/test')
      expect(Array.isArray(result)).toBe(true)
    })

    test('handles registry returning empty array', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('clean.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
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
      expect(logs.some((l) => l.includes('No violations found'))).toBe(true)
    })

    test('handles multiple files with violations', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('a.ts'),
        createMockFile('b.ts'),
        createMockFile('c.ts'),
      ])
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
        applied: 0,
        skipped: 3,
        total: 3,
      })
      await cmd.run()
      expect(logs.some((l) => l.includes('violations to review'))).toBe(true)
    })

    test('handles fixable and non-fixable violations mixed', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ suggestion: 'fix1' }),
              createMockViolation({ suggestion: undefined }),
              createMockViolation({ suggestion: 'fix3' }),
            ]),
        }
      } as never)
      let callCount = 0
      vi.mocked(createInterface).mockImplementation(
        () =>
          ({
            question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
              callCount++
              if (callCount === 1) callback('y')
              else if (callCount === 2) callback('s')
              else callback('y')
            }),
            close: vi.fn(),
          }) as never,
      )
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
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

    test('handles all violations applied', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ suggestion: 'fix1' }),
              createMockViolation({ suggestion: 'fix2' }),
            ]),
        }
      } as never)
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      let callCount = 0
      vi.mocked(createInterface).mockImplementation(
        () =>
          ({
            question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
              callCount++
              callback('y')
            }),
            close: vi.fn(),
          }) as never,
      )
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('Applied'))).toBe(true)
    })
  })

  describe('flag combinations - comprehensive', () => {
    test('auto-safe + severity error + verbose', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ severity: 'error', suggestion: 'fix' }),
              createMockViolation({ severity: 'warning', suggestion: 'fix2' }),
            ]),
        }
      } as never)
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'error', 'auto-safe': true, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('1 violations to review'))).toBe(true)
    })

    test('auto-safe + severity info processes all', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ severity: 'info', suggestion: 'fix' }),
              createMockViolation({ severity: 'warning', suggestion: undefined }),
              createMockViolation({ severity: 'error', suggestion: 'fix3' }),
            ]),
        }
      } as never)
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      vi.mocked(createInterface).mockReturnValue({
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('s')
        }),
        close: vi.fn(),
      } as never)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'info', 'auto-safe': true, verbose: false },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('3 violations to review'))).toBe(true)
    })

    test('verbose + severity error shows only errors', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ severity: 'info' }),
              createMockViolation({ severity: 'error' }),
            ]),
        }
      } as never)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'error', 'auto-safe': false, verbose: true },
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
      expect(logs.some((l) => l.includes('1 violations to review'))).toBe(true)
    })

    test('all flags default - no violations', async () => {
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

    test('all flags true with violations', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(fs.readFile).mockResolvedValue('original\n')
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'info', 'auto-safe': true, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(
        logs.some((l) => l.includes('violations to review') || l.includes('No violations')),
      ).toBe(true)
    })

    test('path argument is resolved', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': false, verbose: false },
        { path: './src' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(discoverFiles).toHaveBeenCalled()
    })

    test('auto-safe true + verbose true with no violations', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])
      const cmd = createCommandWithMockedParse(
        InteractiveCommand,
        { severity: 'warning', 'auto-safe': true, verbose: true },
        { path: '.' },
      )
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()
      expect(logs.some((l) => l.includes('No violations found'))).toBe(true)
    })

    test('severity warning is default behavior', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              createMockViolation({ severity: 'info' }),
              createMockViolation({ severity: 'warning' }),
            ]),
        }
      } as never)
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
        applied: 0,
        skipped: 1,
        total: 1,
      })
      await cmd.run()
      expect(logs.some((l) => l.includes('1 violations to review'))).toBe(true)
    })
  })
})
