import { describe, test, expect, beforeEach, vi } from 'vitest'
import { execSync } from 'node:child_process'

import {
  buildDiffReport,
  compareViolations,
  countByRule,
  countBySeverity,
  createViolationKey,
  displayAddedViolations,
  displayDiffReport,
  displayRemovedViolations,
  formatSummary,
  parseGitDiffOutput,
} from '../../../src/commands/diff-helpers.js'

vi.mock('node:child_process', () => ({
  execSync: vi.fn().mockImplementation(() => {
    throw new Error('Command failed')
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
  },
  getRuleCategory: vi.fn((ruleId: string) => {
    if (ruleId.includes('complexity')) return 'complexity'
    return 'patterns'
  }),
}))

interface MockViolation {
  filePath: string
  range: { start: { line: number; column: number }; end: { line: number; column: number } }
  ruleId: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

function makeViolation(overrides: Partial<MockViolation> = {}): MockViolation {
  return {
    filePath: 'src/test.ts',
    range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    ruleId: 'max-complexity',
    message: 'Test violation',
    severity: 'error',
    ...overrides,
  }
}

describe('Diff Command', () => {
  let Diff: typeof import('../../../src/commands/diff.js').default

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.mocked(execSync).mockReset()
    Diff = (await import('../../../src/commands/diff.js')).default
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Diff.description).toBe('Compare violations between git branches or commits')
    })

    test('has examples defined', () => {
      expect(Diff.examples).toBeDefined()
      expect(Diff.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Diff.flags).toBeDefined()
      expect(Diff.flags.json).toBeDefined()
      expect(Diff.flags.verbose).toBeDefined()
      expect(Diff.flags.path).toBeDefined()
    })

    test('json flag has default false', () => {
      expect(Diff.flags.json.default).toBe(false)
    })

    test('verbose flag has char v', () => {
      expect(Diff.flags.verbose.char).toBe('v')
    })

    test('verbose flag has default false', () => {
      expect(Diff.flags.verbose.default).toBe(false)
    })

    test('path flag has default .', () => {
      expect(Diff.flags.path.default).toBe('.')
    })

    test('has base and head arguments', () => {
      expect(Diff.args.base).toBeDefined()
      expect(Diff.args.base.default).toBe('HEAD~1')
      expect(Diff.args.head).toBeDefined()
      expect(Diff.args.head.default).toBe('HEAD')
    })
  })

  describe('createViolationKey', () => {
    function getTestableCommand(): {
      createViolationKey: (v: {
        filePath: string
        range: { start: { line: number; column: number }; end: { line: number; column: number } }
        ruleId: string
      }) => string
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('creates unique key for violation', () => {
      const cmd = getTestableCommand()
      const key = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
        ruleId: 'max-complexity',
      })
      expect(key).toBe('src/test.ts:10:max-complexity')
    })

    test('different files produce different keys', () => {
      const cmd = getTestableCommand()
      const key1 = cmd.createViolationKey({
        filePath: 'src/a.ts',
        range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
        ruleId: 'max-complexity',
      })
      const key2 = cmd.createViolationKey({
        filePath: 'src/b.ts',
        range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
        ruleId: 'max-complexity',
      })
      expect(key1).not.toBe(key2)
    })

    test('different lines produce different keys', () => {
      const cmd = getTestableCommand()
      const key1 = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
        ruleId: 'max-complexity',
      })
      const key2 = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 20, column: 0 }, end: { line: 20, column: 5 } },
        ruleId: 'max-complexity',
      })
      expect(key1).not.toBe(key2)
    })

    test('different rules produce different keys', () => {
      const cmd = getTestableCommand()
      const key1 = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
        ruleId: 'max-complexity',
      })
      const key2 = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
        ruleId: 'no-any',
      })
      expect(key1).not.toBe(key2)
    })
  })

  describe('isGitRepository', () => {
    function getTestableCommand(): { isGitRepository: (path: string) => boolean } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns true for git repository', () => {
      vi.mocked(execSync).mockReturnValueOnce(Buffer.from(''))
      const cmd = getTestableCommand()
      const result = cmd.isGitRepository(process.cwd())
      expect(result).toBe(true)
    })

    test('returns false for non-git directory', () => {
      vi.mocked(execSync).mockImplementationOnce(() => {
        throw new Error('Not a git repository')
      })
      const cmd = getTestableCommand()
      const result = cmd.isGitRepository('/tmp/nonexistent-git-dir')
      expect(result).toBe(false)
    })
  })

  describe('displayReport', () => {
    function getTestableCommand(): {
      displayReport: (report: Record<string, unknown>, verbose: boolean) => void
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    function createMockReport(
      overrides: Partial<Record<string, unknown>> = {},
    ): Record<string, unknown> {
      return {
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 10,
          totalHead: 10,
        },
        ...overrides,
      }
    }

    test('displayReport method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.displayReport).toBe('function')
    })

    test('displays report with no changes', () => {
      const cmd = getTestableCommand()
      const report = createMockReport()
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with positive net change', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        summary: {
          addedCount: 5,
          removedCount: 2,
          improvedCount: 0,
          netChange: 3,
          totalBase: 10,
          totalHead: 13,
        },
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with negative net change (improvement)', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        summary: {
          addedCount: 2,
          removedCount: 5,
          improvedCount: 1,
          netChange: -3,
          totalBase: 15,
          totalHead: 12,
        },
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays verbose report with added violations', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        added: [
          {
            filePath: 'src/test.ts',
            range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
            ruleId: 'max-complexity',
            message: 'Too complex',
          },
        ],
        summary: {
          addedCount: 1,
          removedCount: 0,
          improvedCount: 0,
          netChange: 1,
          totalBase: 10,
          totalHead: 11,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays verbose report with removed violations', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        removed: [
          {
            filePath: 'src/test.ts',
            range: { start: { line: 15, column: 0 }, end: { line: 15, column: 5 } },
            ruleId: 'no-any',
            message: 'Unexpected any',
          },
        ],
        summary: {
          addedCount: 0,
          removedCount: 1,
          improvedCount: 0,
          netChange: -1,
          totalBase: 10,
          totalHead: 9,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays verbose report with many violations', () => {
      const cmd = getTestableCommand()
      const manyAdded = Array.from({ length: 20 }, (_, i) => ({
        filePath: `src/file${i}.ts`,
        range: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 5 } },
        ruleId: 'max-complexity',
        message: 'Violation',
      }))
      const report = createMockReport({
        added: manyAdded,
        summary: {
          addedCount: 20,
          removedCount: 0,
          improvedCount: 0,
          netChange: 20,
          totalBase: 10,
          totalHead: 30,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays verbose report with 21+ added violations (truncation)', () => {
      const cmd = getTestableCommand()
      const manyAdded = Array.from({ length: 25 }, (_, i) => ({
        filePath: `src/file${i}.ts`,
        range: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 5 } },
        ruleId: 'max-complexity',
        message: 'Violation',
      }))
      const report = createMockReport({
        added: manyAdded,
        summary: {
          addedCount: 25,
          removedCount: 0,
          improvedCount: 0,
          netChange: 25,
          totalBase: 10,
          totalHead: 35,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays verbose report with many removed violations', () => {
      const cmd = getTestableCommand()
      const manyRemoved = Array.from({ length: 20 }, (_, i) => ({
        filePath: `src/file${i}.ts`,
        range: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 5 } },
        ruleId: 'max-complexity',
        message: 'Violation',
      }))
      const report = createMockReport({
        removed: manyRemoved,
        summary: {
          addedCount: 0,
          removedCount: 20,
          improvedCount: 0,
          netChange: -20,
          totalBase: 30,
          totalHead: 10,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays verbose report with 21+ removed violations (truncation)', () => {
      const cmd = getTestableCommand()
      const manyRemoved = Array.from({ length: 25 }, (_, i) => ({
        filePath: `src/file${i}.ts`,
        range: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 5 } },
        ruleId: 'max-complexity',
        message: 'Violation',
      }))
      const report = createMockReport({
        removed: manyRemoved,
        summary: {
          addedCount: 0,
          removedCount: 25,
          improvedCount: 0,
          netChange: -25,
          totalBase: 35,
          totalHead: 10,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays report with custom base and head refs', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        base: 'main',
        head: 'feature-branch',
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })
  })

  describe('analyzeDiff', () => {
    function getTestableCommand(): {
      analyzeDiff: (
        targetPath: string,
        baseRef: string,
        headRef: string,
      ) => Promise<Record<string, unknown>>
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('analyzeDiff method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.analyzeDiff).toBe('function')
    })
  })

  describe('analyzeViolations', () => {
    function getTestableCommand(): {
      analyzeViolations: (targetPath: string) => Promise<Array<Record<string, unknown>>>
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('analyzeViolations method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.analyzeViolations).toBe('function')
    })
  })

  describe('getViolationsAtRef', () => {
    function getTestableCommand(): {
      getViolationsAtRef: (
        targetPath: string,
        ref: string,
      ) => Promise<Array<Record<string, unknown>>>
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('getViolationsAtRef method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.getViolationsAtRef).toBe('function')
    })

    test('getViolationsAtRef handles invalid ref gracefully', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.getViolationsAtRef('/tmp/nonexistent-path', 'invalid-ref-xyz')
      expect(Array.isArray(result)).toBe(true)
    })

    test('getViolationsAtRef succeeds with valid worktree', async () => {
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        if (cmd.includes('git worktree') || cmd.includes('git archive')) {
          return Buffer.from('')
        }
        if (cmd.includes('git rev-parse')) {
          throw new Error('Not a git repo')
        }
        return Buffer.from('')
      })
      const cmd = getTestableCommand()
      const result = await cmd.getViolationsAtRef('/tmp/test-path', 'main')
      expect(Array.isArray(result)).toBe(true)
    })

    test('getViolationsAtRef uses git archive fallback when worktree fails', async () => {
      let callCount = 0
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        callCount++
        if (cmd.includes('git worktree add')) {
          throw new Error('worktree failed')
        }
        if (cmd.includes('git archive')) {
          return Buffer.from('')
        }
        if (cmd.includes('git rev-parse')) {
          throw new Error('Not a git repo')
        }
        return Buffer.from('')
      })
      const cmd = getTestableCommand()
      const result = await cmd.getViolationsAtRef('/tmp/test-path', 'main')
      expect(Array.isArray(result)).toBe(true)
      expect(callCount).toBeGreaterThan(1)
    })

    test('getViolationsAtRef handles cleanup failure in finally', async () => {
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        if (cmd.includes('git worktree add')) {
          return Buffer.from('')
        }
        if (cmd.includes('git worktree remove') || cmd.includes('rm -rf')) {
          throw new Error('cleanup failed')
        }
        if (cmd.includes('git rev-parse')) {
          throw new Error('Not a git repo')
        }
        return Buffer.from('')
      })
      const cmd = getTestableCommand()
      const result = await cmd.getViolationsAtRef('/tmp/test-path', 'main')
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('analyzeDiff with violations', () => {
    function getTestableCommand(): {
      analyzeDiff: (
        targetPath: string,
        baseRef: string,
        headRef: string,
      ) => Promise<{
        added: Array<Record<string, unknown>>
        removed: Array<Record<string, unknown>>
        improved: Array<Record<string, unknown>>
        summary: {
          addedCount: number
          removedCount: number
          improvedCount: number
          netChange: number
          totalBase: number
          totalHead: number
        }
      }>
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('analyzeDiff method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.analyzeDiff).toBe('function')
    })
  })

  describe('displayReport edge cases', () => {
    function getTestableCommand(): {
      displayReport: (report: Record<string, unknown>, verbose: boolean) => void
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    function createMockReport(
      overrides: Partial<Record<string, unknown>> = {},
    ): Record<string, unknown> {
      return {
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 10,
          totalHead: 10,
        },
        ...overrides,
      }
    }

    test('displays report with zero violations', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 0,
          totalHead: 0,
        },
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with large net change', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        summary: {
          addedCount: 100,
          removedCount: 10,
          improvedCount: 0,
          netChange: 90,
          totalBase: 50,
          totalHead: 140,
        },
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with large improvement', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        summary: {
          addedCount: 5,
          removedCount: 95,
          improvedCount: 10,
          netChange: -90,
          totalBase: 150,
          totalHead: 60,
        },
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays verbose report with both added and removed', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        added: [
          {
            filePath: 'src/new.ts',
            range: { start: { line: 5, column: 0 }, end: { line: 5, column: 5 } },
            ruleId: 'no-console',
            message: 'No console',
          },
        ],
        removed: [
          {
            filePath: 'src/old.ts',
            range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
            ruleId: 'no-debugger',
            message: 'No debugger',
          },
        ],
        summary: {
          addedCount: 1,
          removedCount: 1,
          improvedCount: 0,
          netChange: 0,
          totalBase: 20,
          totalHead: 20,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays report with many removed violations in verbose', () => {
      const cmd = getTestableCommand()
      const manyRemoved = Array.from({ length: 15 }, (_, i) => ({
        filePath: `src/removed${i}.ts`,
        range: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 5 } },
        ruleId: 'max-complexity',
        message: 'Fixed',
      }))
      const report = createMockReport({
        removed: manyRemoved,
        summary: {
          addedCount: 0,
          removedCount: 15,
          improvedCount: 0,
          netChange: -15,
          totalBase: 30,
          totalHead: 15,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays report with commit hash refs', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        base: 'abc123def456',
        head: 'fed456cba321',
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(
      flags: Record<string, unknown>,
      args = { base: 'HEAD~1', head: 'HEAD' },
    ) {
      const command = new Diff([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args,
        flags,
      })
      return command
    }

    test('errors when path does not exist', async () => {
      const cmd = createCommandWithMockedParse({
        json: false,
        verbose: false,
        path: '/nonexistent',
      })
      const cmdWithMock = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithMock.error = vi.fn()

      await cmd.run()

      expect(cmdWithMock.error).toHaveBeenCalledWith(expect.stringContaining('Path not found'), {
        exit: 1,
      })
    })

    test('errors when not a git repository', async () => {
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        if (cmd.includes('git rev-parse')) {
          throw new Error('Not a git repository')
        }
        return Buffer.from('')
      })
      const cmd = createCommandWithMockedParse({ json: false, verbose: false, path: '.' })
      const cmdWithMock = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithMock.error = vi.fn()

      await cmd.run()

      expect(cmdWithMock.error).toHaveBeenCalledWith('Not a git repository', { exit: 1 })
    })

    test('outputs JSON when --json flag is set', async () => {
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        if (
          cmd.includes('git rev-parse') ||
          cmd.includes('git worktree') ||
          cmd.includes('git archive')
        ) {
          return Buffer.from('')
        }
        throw new Error('Command failed')
      })
      const cmd = createCommandWithMockedParse({ json: true, verbose: false, path: '.' })
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDiff: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDiff = vi.fn().mockResolvedValue({
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 0,
          totalHead: 0,
        },
      })

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('"base"'))
    })

    test('displays report when not using --json flag', async () => {
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        if (
          cmd.includes('git rev-parse') ||
          cmd.includes('git worktree') ||
          cmd.includes('git archive')
        ) {
          return Buffer.from('')
        }
        throw new Error('Command failed')
      })
      const cmd = createCommandWithMockedParse({ json: false, verbose: false, path: '.' })
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDiff: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDiff = vi.fn().mockResolvedValue({
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 0,
          totalHead: 0,
        },
      })

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalled()
    })
  })

  describe('run - additional flag combinations', () => {
    function createCommandWithMockedParse(
      flags: Record<string, unknown>,
      args = { base: 'HEAD~1', head: 'HEAD' },
    ) {
      const command = new Diff([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args,
        flags,
      })
      return command
    }

    test('passes custom base and head args to analyzeDiff', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))
      const cmd = createCommandWithMockedParse(
        { json: true, verbose: false, path: '.' },
        { base: 'main', head: 'feature' },
      )
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDiff: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDiff = vi.fn().mockResolvedValue({
        base: 'main',
        head: 'feature',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 0,
          totalHead: 0,
        },
      })

      await cmd.run()

      expect(cmdWithMock.analyzeDiff).toHaveBeenCalledWith(expect.any(String), 'main', 'feature')
    })

    test('passes resolved path to analyzeDiff', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))
      const cmd = createCommandWithMockedParse({ json: true, verbose: false, path: '.' })
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDiff: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDiff = vi.fn().mockResolvedValue({
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 0,
          totalHead: 0,
        },
      })

      await cmd.run()

      const calledPath = cmdWithMock.analyzeDiff.mock.calls[0][0] as string
      expect(calledPath).toBe(process.cwd())
    })

    test('verbose flag does not affect JSON output', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))
      const cmd = createCommandWithMockedParse({ json: true, verbose: true, path: '.' })
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDiff: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDiff = vi.fn().mockResolvedValue({
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 0,
          totalHead: 0,
        },
      })

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('"base"'))
    })

    test('JSON output includes summary', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))
      const cmd = createCommandWithMockedParse({ json: true, verbose: false, path: '.' })
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDiff: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDiff = vi.fn().mockResolvedValue({
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 5,
          totalHead: 5,
        },
      })

      await cmd.run()

      const logged = cmdWithMock.log.mock.calls[0][0] as string
      const parsed = JSON.parse(logged)
      expect(parsed.summary.totalBase).toBe(5)
      expect(parsed.summary.totalHead).toBe(5)
    })

    test('JSON output is pretty-printed', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))
      const cmd = createCommandWithMockedParse({ json: true, verbose: false, path: '.' })
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDiff: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDiff = vi.fn().mockResolvedValue({
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 0,
          totalHead: 0,
        },
      })

      await cmd.run()

      const logged = cmdWithMock.log.mock.calls[0][0] as string
      expect(logged).toContain('\n')
    })

    test('errors when path is empty string and does not exist', async () => {
      const cmd = createCommandWithMockedParse({
        json: false,
        verbose: false,
        path: '/definitely/not/a/real/path',
      })
      const cmdWithMock = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithMock.error = vi.fn()

      await cmd.run()

      expect(cmdWithMock.error).toHaveBeenCalledWith(expect.stringContaining('Path not found'), {
        exit: 1,
      })
    })

    test('calls displayReport with verbose=true when verbose flag set', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))
      const cmd = createCommandWithMockedParse({ json: false, verbose: true, path: '.' })
      const mockReport = {
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 0,
          totalHead: 0,
        },
      }
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: ReturnType<typeof vi.fn>
        analyzeDiff: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.displayReport = vi.fn()
      cmdWithMock.analyzeDiff = vi.fn().mockResolvedValue(mockReport)

      await cmd.run()

      expect(cmdWithMock.displayReport).toHaveBeenCalledWith(mockReport, true)
    })

    test('calls displayReport with verbose=false when verbose flag not set', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))
      const cmd = createCommandWithMockedParse({ json: false, verbose: false, path: '.' })
      const mockReport = {
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 0,
          totalHead: 0,
        },
      }
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: ReturnType<typeof vi.fn>
        analyzeDiff: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.displayReport = vi.fn()
      cmdWithMock.analyzeDiff = vi.fn().mockResolvedValue(mockReport)

      await cmd.run()

      expect(cmdWithMock.displayReport).toHaveBeenCalledWith(mockReport, false)
    })

    test('errors with exit code 1 when not a git repo', async () => {
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        if (cmd.includes('git rev-parse')) throw new Error('Not a git repository')
        return Buffer.from('')
      })
      const cmd = createCommandWithMockedParse({ json: false, verbose: false, path: '.' })
      const cmdWithMock = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithMock.error = vi.fn()

      await cmd.run()

      expect(cmdWithMock.error).toHaveBeenCalledWith('Not a git repository', { exit: 1 })
    })

    test('checks path existence before git check', async () => {
      const cmd = createCommandWithMockedParse({
        json: false,
        verbose: false,
        path: '/nonexistent-dir-xyz',
      })
      const cmdWithMock = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithMock.error = vi.fn()

      await cmd.run()

      expect(cmdWithMock.error).toHaveBeenCalledWith(expect.stringContaining('Path not found'), {
        exit: 1,
      })
    })
  })

  describe('createViolationKey - additional edge cases', () => {
    function getTestableCommand(): {
      createViolationKey: (v: {
        filePath: string
        range: { start: { line: number; column: number }; end: { line: number; column: number } }
        ruleId: string
      }) => string
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('column does not affect key', () => {
      const cmd = getTestableCommand()
      const key1 = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } },
        ruleId: 'no-any',
      })
      const key2 = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 5, column: 99 }, end: { line: 5, column: 100 } },
        ruleId: 'no-any',
      })
      expect(key1).toBe(key2)
    })

    test('end line does not affect key', () => {
      const cmd = getTestableCommand()
      const key1 = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 5, column: 0 }, end: { line: 10, column: 0 } },
        ruleId: 'no-any',
      })
      const key2 = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 5, column: 0 }, end: { line: 20, column: 0 } },
        ruleId: 'no-any',
      })
      expect(key1).toBe(key2)
    })

    test('line 0 produces valid key', () => {
      const cmd = getTestableCommand()
      const key = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
        ruleId: 'no-any',
      })
      expect(key).toBe('src/test.ts:0:no-any')
    })

    test('handles deep nested file path', () => {
      const cmd = getTestableCommand()
      const key = cmd.createViolationKey({
        filePath: 'src/features/auth/utils/token.ts',
        range: { start: { line: 42, column: 0 }, end: { line: 42, column: 5 } },
        ruleId: 'no-any',
      })
      expect(key).toBe('src/features/auth/utils/token.ts:42:no-any')
    })

    test('handles long ruleId', () => {
      const cmd = getTestableCommand()
      const longRule = 'very-long-rule-name-that-describes-something'
      const key = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: longRule,
      })
      expect(key).toBe(`src/test.ts:1:${longRule}`)
    })

    test('same inputs produce identical keys', () => {
      const cmd = getTestableCommand()
      const v = {
        filePath: 'src/app.ts',
        range: { start: { line: 100, column: 5 }, end: { line: 100, column: 10 } },
        ruleId: 'prefer-const',
      }
      expect(cmd.createViolationKey(v)).toBe(cmd.createViolationKey(v))
    })

    test('handles file path with dots', () => {
      const cmd = getTestableCommand()
      const key = cmd.createViolationKey({
        filePath: 'src/config.local.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        ruleId: 'no-console',
      })
      expect(key).toBe('src/config.local.ts:1:no-console')
    })

    test('handles high line numbers', () => {
      const cmd = getTestableCommand()
      const key = cmd.createViolationKey({
        filePath: 'src/test.ts',
        range: { start: { line: 99999, column: 0 }, end: { line: 99999, column: 5 } },
        ruleId: 'no-any',
      })
      expect(key).toBe('src/test.ts:99999:no-any')
    })
  })

  describe('isGitRepository - additional cases', () => {
    function getTestableCommand(): { isGitRepository: (path: string) => boolean } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns true when git rev-parse succeeds', () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from('.git\n'))
      const cmd = getTestableCommand()
      expect(cmd.isGitRepository(process.cwd())).toBe(true)
    })

    test('returns false on any error', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('fatal: not a git repository')
      })
      const cmd = getTestableCommand()
      expect(cmd.isGitRepository('/tmp')).toBe(false)
    })

    test('calls git rev-parse with correct cwd', () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))
      const cmd = getTestableCommand()
      cmd.isGitRepository('/some/path')
      expect(execSync).toHaveBeenCalledWith(
        'git rev-parse --git-dir',
        expect.objectContaining({ cwd: '/some/path' }),
      )
    })

    test('returns boolean type', () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))
      const cmd = getTestableCommand()
      const result = cmd.isGitRepository('.')
      expect(typeof result).toBe('boolean')
    })

    test('handles empty buffer response', () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))
      const cmd = getTestableCommand()
      expect(cmd.isGitRepository('.')).toBe(true)
    })
  })

  describe('getViolationsAtRef - additional edge cases', () => {
    function getTestableCommand(): {
      getViolationsAtRef: (
        targetPath: string,
        ref: string,
      ) => Promise<Array<Record<string, unknown>>>
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('falls back to analyzeViolations on both worktree and archive failure', async () => {
      let callCount = 0
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        callCount++
        if (cmd.includes('git worktree add') || cmd.includes('git clone')) {
          throw new Error('worktree failed')
        }
        if (cmd.includes('git archive')) {
          throw new Error('archive failed')
        }
        if (cmd.includes('git rev-parse')) {
          throw new Error('Not a git repo')
        }
        return Buffer.from('')
      })
      const cmd = getTestableCommand()
      const result = await cmd.getViolationsAtRef('/tmp/test', 'abc123')
      expect(Array.isArray(result)).toBe(true)
    })

    test('attempts git worktree first', async () => {
      const cmds: string[] = []
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        cmds.push(cmd)
        if (cmd.includes('git rev-parse')) throw new Error('not git')
        return Buffer.from('')
      })
      const cmd = getTestableCommand()
      await cmd.getViolationsAtRef('/tmp/test', 'main')
      const firstCmd = cmds.find((c) => c.includes('git worktree add') || c.includes('git clone'))
      expect(firstCmd).toBeDefined()
    })

    test('handles concurrent calls with different refs', async () => {
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        if (cmd.includes('git rev-parse')) throw new Error('not git')
        return Buffer.from('')
      })
      const cmd = getTestableCommand()
      const [r1, r2] = await Promise.all([
        cmd.getViolationsAtRef('/tmp/test1', 'ref-a'),
        cmd.getViolationsAtRef('/tmp/test2', 'ref-b'),
      ])
      expect(Array.isArray(r1)).toBe(true)
      expect(Array.isArray(r2)).toBe(true)
    })

    test('cleanup executes even on analysis failure', async () => {
      const cleanupCalled: string[] = []
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        if (cmd.includes('git worktree remove') || cmd.includes('rm -rf')) {
          cleanupCalled.push(cmd)
          throw new Error('cleanup error')
        }
        if (cmd.includes('git rev-parse')) throw new Error('not git')
        return Buffer.from('')
      })
      const cmd = getTestableCommand()
      const result = await cmd.getViolationsAtRef('/tmp/test', 'main')
      expect(Array.isArray(result)).toBe(true)
    })

    test('generates unique temp directory names', async () => {
      const dirs: string[] = []
      vi.mocked(execSync).mockImplementation((cmd: string) => {
        const match = cmd.match(/codeforge-diff-(\d+)/g)
        if (match) dirs.push(...match)
        if (cmd.includes('git rev-parse')) throw new Error('not git')
        return Buffer.from('')
      })
      const cmd = getTestableCommand()
      await cmd.getViolationsAtRef('/tmp/test', 'ref1')
      await cmd.getViolationsAtRef('/tmp/test', 'ref2')
      // The timestamps should differ since Date.now() changes
      expect(dirs.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('displayReport - log output verification', () => {
    function getTestableCommand(): {
      displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      log: ReturnType<typeof vi.fn>
    } {
      const cmd = new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
      cmd.log = vi.fn()
      return cmd
    }

    function createMockReport(
      overrides: Partial<Record<string, unknown>> = {},
    ): Record<string, unknown> {
      return {
        base: 'HEAD~1',
        head: 'HEAD',
        added: [],
        removed: [],
        improved: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 10,
          totalHead: 10,
        },
        ...overrides,
      }
    }

    test('logs base and head refs in comparison line', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(createMockReport({ base: 'main', head: 'develop' }), false)
      const logs = cmd.log.mock.calls.map((c: unknown[]) => c[0] as string)
      const comparison = logs.find((l: string) => l.includes('main') && l.includes('develop'))
      expect(comparison).toBeDefined()
    })

    test('logs improvement message when net change is negative', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(
        createMockReport({
          summary: {
            addedCount: 1,
            removedCount: 5,
            improvedCount: 0,
            netChange: -4,
            totalBase: 10,
            totalHead: 6,
          },
        }),
        false,
      )
      const logs = cmd.log.mock.calls.map((c: unknown[]) => c[0] as string)
      const improved = logs.find(
        (l: string) => l.includes('improved') || l.includes('violations removed'),
      )
      expect(improved).toBeDefined()
    })

    test('logs regression message when net change is positive', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(
        createMockReport({
          summary: {
            addedCount: 5,
            removedCount: 1,
            improvedCount: 0,
            netChange: 4,
            totalBase: 10,
            totalHead: 14,
          },
        }),
        false,
      )
      const logs = cmd.log.mock.calls.map((c: unknown[]) => c[0] as string)
      const regressed = logs.find((l: string) => l.includes('regressed'))
      expect(regressed).toBeDefined()
    })

    test('logs no-change message when net change is zero', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(
        createMockReport({
          summary: {
            addedCount: 2,
            removedCount: 2,
            improvedCount: 0,
            netChange: 0,
            totalBase: 10,
            totalHead: 10,
          },
        }),
        false,
      )
      const logs = cmd.log.mock.calls.map((c: unknown[]) => c[0] as string)
      const noChange = logs.find((l: string) => l.includes('No net change'))
      expect(noChange).toBeDefined()
    })

    test('logs added count in summary', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(
        createMockReport({
          summary: {
            addedCount: 7,
            removedCount: 0,
            improvedCount: 0,
            netChange: 7,
            totalBase: 10,
            totalHead: 17,
          },
        }),
        false,
      )
      const logs = cmd.log.mock.calls.map((c: unknown[]) => c[0] as string)
      const added = logs.find((l: string) => l.includes('+7'))
      expect(added).toBeDefined()
    })

    test('logs removed count in summary', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(
        createMockReport({
          summary: {
            addedCount: 0,
            removedCount: 3,
            improvedCount: 0,
            netChange: -3,
            totalBase: 10,
            totalHead: 7,
          },
        }),
        false,
      )
      const logs = cmd.log.mock.calls.map((c: unknown[]) => c[0] as string)
      const removed = logs.find((l: string) => l.includes('-3'))
      expect(removed).toBeDefined()
    })

    test('logs base violations total', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(
        createMockReport({
          summary: {
            addedCount: 0,
            removedCount: 0,
            improvedCount: 0,
            netChange: 0,
            totalBase: 42,
            totalHead: 42,
          },
        }),
        false,
      )
      const logs = cmd.log.mock.calls.map((c: unknown[]) => c[0] as string)
      const baseLine = logs.find((l: string) => l.includes('42'))
      expect(baseLine).toBeDefined()
    })

    test('verbose mode shows individual added violations', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(
        createMockReport({
          added: [
            makeViolation({
              filePath: 'src/a.ts',
              ruleId: 'no-any',
              range: { start: { line: 5, column: 0 }, end: { line: 5, column: 3 } },
            }),
          ],
          summary: {
            addedCount: 1,
            removedCount: 0,
            improvedCount: 0,
            netChange: 1,
            totalBase: 0,
            totalHead: 1,
          },
        }),
        true,
      )
      const logs = cmd.log.mock.calls.map((c: unknown[]) => c[0] as string)
      const violationLine = logs.find((l: string) => l.includes('src/a.ts') && l.includes('no-any'))
      expect(violationLine).toBeDefined()
    })

    test('verbose mode shows individual removed violations', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(
        createMockReport({
          removed: [
            makeViolation({
              filePath: 'src/b.ts',
              ruleId: 'no-debugger',
              range: { start: { line: 10, column: 0 }, end: { line: 10, column: 3 } },
            }),
          ],
          summary: {
            addedCount: 0,
            removedCount: 1,
            improvedCount: 0,
            netChange: -1,
            totalBase: 1,
            totalHead: 0,
          },
        }),
        true,
      )
      const logs = cmd.log.mock.calls.map((c: unknown[]) => c[0] as string)
      const violationLine = logs.find(
        (l: string) => l.includes('src/b.ts') && l.includes('no-debugger'),
      )
      expect(violationLine).toBeDefined()
    })

    test('non-verbose mode does not show individual violations', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(
        createMockReport({
          added: [makeViolation({ filePath: 'src/secret.ts' })],
          summary: {
            addedCount: 1,
            removedCount: 0,
            improvedCount: 0,
            netChange: 1,
            totalBase: 0,
            totalHead: 1,
          },
        }),
        false,
      )
      const logs = cmd.log.mock.calls.map((c: unknown[]) => c[0] as string)
      const individualLine = logs.find((l: string) => l.includes('src/secret.ts:'))
      expect(individualLine).toBeUndefined()
    })

    test('calls log multiple times for full report', () => {
      const cmd = getTestableCommand()
      cmd.displayReport(createMockReport(), false)
      expect(cmd.log.mock.calls.length).toBeGreaterThan(3)
    })
  })

  describe('analyzeDiff - with mocked violations', () => {
    function getTestableCommand(): {
      analyzeDiff: (
        targetPath: string,
        baseRef: string,
        headRef: string,
      ) => Promise<{
        added: Array<Record<string, unknown>>
        removed: Array<Record<string, unknown>>
        improved: Array<Record<string, unknown>>
        summary: {
          addedCount: number
          removedCount: number
          improvedCount: number
          netChange: number
          totalBase: number
          totalHead: number
        }
        base: string
        head: string
      }>
      getViolationsAtRef: (
        targetPath: string,
        ref: string,
      ) => Promise<Array<Record<string, unknown>>>
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns empty report when no violations at either ref', async () => {
      const cmd = getTestableCommand()
      cmd.getViolationsAtRef = vi.fn().mockResolvedValue([])
      const result = await cmd.analyzeDiff('/tmp/test', 'base', 'head')
      expect(result.summary.addedCount).toBe(0)
      expect(result.summary.removedCount).toBe(0)
      expect(result.summary.netChange).toBe(0)
      expect(result.summary.totalBase).toBe(0)
      expect(result.summary.totalHead).toBe(0)
    })

    test('identifies added violations', async () => {
      const cmd = getTestableCommand()
      const headViolation = makeViolation({ filePath: 'src/new.ts', ruleId: 'no-console' })
      cmd.getViolationsAtRef = vi
        .fn()
        .mockResolvedValueOnce([]) // base
        .mockResolvedValueOnce([headViolation]) // head
      const result = await cmd.analyzeDiff('/tmp/test', 'base', 'head')
      expect(result.added).toHaveLength(1)
      expect(result.summary.addedCount).toBe(1)
      expect(result.summary.netChange).toBe(1)
    })

    test('identifies removed violations', async () => {
      const cmd = getTestableCommand()
      const baseViolation = makeViolation({ filePath: 'src/old.ts', ruleId: 'no-console' })
      cmd.getViolationsAtRef = vi
        .fn()
        .mockResolvedValueOnce([baseViolation]) // base
        .mockResolvedValueOnce([]) // head
      const result = await cmd.analyzeDiff('/tmp/test', 'base', 'head')
      expect(result.removed).toHaveLength(1)
      expect(result.summary.removedCount).toBe(1)
      expect(result.summary.netChange).toBe(-1)
    })

    test('identifies both added and removed violations', async () => {
      const cmd = getTestableCommand()
      const baseViolation = makeViolation({
        filePath: 'src/old.ts',
        ruleId: 'no-console',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      const headViolation = makeViolation({
        filePath: 'src/new.ts',
        ruleId: 'no-debugger',
        range: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      cmd.getViolationsAtRef = vi
        .fn()
        .mockResolvedValueOnce([baseViolation])
        .mockResolvedValueOnce([headViolation])
      const result = await cmd.analyzeDiff('/tmp/test', 'base', 'head')
      expect(result.added).toHaveLength(1)
      expect(result.removed).toHaveLength(1)
      expect(result.summary.netChange).toBe(0)
    })

    test('calculates correct totalBase and totalHead', async () => {
      const cmd = getTestableCommand()
      const baseViolations = [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ]
      const headViolations = [makeViolation({ filePath: 'src/c.ts' })]
      cmd.getViolationsAtRef = vi
        .fn()
        .mockResolvedValueOnce(baseViolations)
        .mockResolvedValueOnce(headViolations)
      const result = await cmd.analyzeDiff('/tmp/test', 'base', 'head')
      expect(result.summary.totalBase).toBe(2)
      expect(result.summary.totalHead).toBe(1)
    })

    test('sets base and head in report', async () => {
      const cmd = getTestableCommand()
      cmd.getViolationsAtRef = vi.fn().mockResolvedValue([])
      const result = await cmd.analyzeDiff('/tmp/test', 'main', 'feature')
      expect(result.base).toBe('main')
      expect(result.head).toBe('feature')
    })

    test('handles identical violations as no change', async () => {
      const cmd = getTestableCommand()
      const v = makeViolation({
        filePath: 'src/same.ts',
        ruleId: 'no-any',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      cmd.getViolationsAtRef = vi.fn().mockResolvedValueOnce([v]).mockResolvedValueOnce([v])
      const result = await cmd.analyzeDiff('/tmp/test', 'base', 'head')
      expect(result.added).toHaveLength(0)
      expect(result.removed).toHaveLength(0)
      expect(result.summary.netChange).toBe(0)
    })

    test('calls getViolationsAtRef with correct refs', async () => {
      const cmd = getTestableCommand()
      cmd.getViolationsAtRef = vi.fn().mockResolvedValue([])
      await cmd.analyzeDiff('/tmp/test', 'abc123', 'def456')
      expect(cmd.getViolationsAtRef).toHaveBeenCalledWith('/tmp/test', 'abc123')
      expect(cmd.getViolationsAtRef).toHaveBeenCalledWith('/tmp/test', 'def456')
    })

    test('handles many violations efficiently', async () => {
      const cmd = getTestableCommand()
      const manyBase = Array.from({ length: 50 }, (_, i) =>
        makeViolation({
          filePath: `src/base${i}.ts`,
          range: { start: { line: i, column: 0 }, end: { line: i, column: 5 } },
        }),
      )
      const manyHead = Array.from({ length: 60 }, (_, i) =>
        makeViolation({
          filePath: `src/head${i}.ts`,
          range: { start: { line: i, column: 0 }, end: { line: i, column: 5 } },
        }),
      )
      cmd.getViolationsAtRef = vi
        .fn()
        .mockResolvedValueOnce(manyBase)
        .mockResolvedValueOnce(manyHead)
      const result = await cmd.analyzeDiff('/tmp/test', 'base', 'head')
      expect(result.summary.totalBase).toBe(50)
      expect(result.summary.totalHead).toBe(60)
      expect(result.added).toHaveLength(60)
      expect(result.removed).toHaveLength(50)
    })
  })

  describe('analyzeViolations method', () => {
    function getTestableCommand(): {
      analyzeViolations: (targetPath: string) => Promise<Array<Record<string, unknown>>>
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('analyzeViolations method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.analyzeViolations).toBe('function')
    })

    test('analyzeViolations returns array', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.analyzeViolations('/tmp/nonexistent')
      expect(Array.isArray(result)).toBe(true)
    })

    test('analyzeViolations handles non-existent path', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.analyzeViolations('/definitely/does/not/exist')
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })

    test('analyzeViolations returns empty for empty directory', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.analyzeViolations('/tmp/empty-dir-for-test-xyz')
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Command metadata - additional', () => {
    let DiffClass: typeof import('../../../src/commands/diff.js').default

    beforeEach(async () => {
      vi.clearAllMocks()
      vi.resetModules()
      DiffClass = (await import('../../../src/commands/diff.js')).default
    })

    test('args base has correct description', () => {
      expect(DiffClass.args.base.description).toBe('Base branch or commit to compare from')
    })

    test('args head has correct description', () => {
      expect(DiffClass.args.head.description).toBe('Head branch or commit to compare to')
    })

    test('args base is not required', () => {
      expect(DiffClass.args.base.required).toBeFalsy()
    })

    test('args head is not required', () => {
      expect(DiffClass.args.head.required).toBeFalsy()
    })

    test('path flag has correct description', () => {
      expect(DiffClass.flags.path.description).toBe('Path to analyze')
    })

    test('json flag has correct description', () => {
      expect(DiffClass.flags.json.description).toBe('Output as JSON')
    })

    test('verbose flag has correct description', () => {
      expect(DiffClass.flags.verbose.description).toBe('Show detailed violation changes')
    })

    test('examples contain command id template', () => {
      expect(DiffClass.examples.length).toBeGreaterThan(0)
      const hasCommandId = DiffClass.examples.some((e) => e.command.includes('command.id'))
      expect(hasCommandId).toBe(true)
    })

    test('args base default is HEAD~1', () => {
      expect(DiffClass.args.base.default).toBe('HEAD~1')
    })

    test('args head default is HEAD', () => {
      expect(DiffClass.args.head.default).toBe('HEAD')
    })

    test('json flag has no char alias', () => {
      expect(DiffClass.flags.json.char).toBeUndefined()
    })

    test('path flag has no char alias', () => {
      expect(DiffClass.flags.path.char).toBeUndefined()
    })
  })

  describe('createViolationKey - stability', () => {
    function getTestableCommand(): {
      createViolationKey: (v: {
        filePath: string
        range: { start: { line: number; column: number }; end: { line: number; column: number } }
        ruleId: string
      }) => string
    } {
      return new Diff([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('produces deterministic keys across calls', () => {
      const cmd = getTestableCommand()
      const v = {
        filePath: 'src/stable.ts',
        range: { start: { line: 42, column: 5 }, end: { line: 42, column: 10 } },
        ruleId: 'stable-rule',
      }
      const keys = new Set<string>()
      for (let i = 0; i < 10; i++) {
        keys.add(cmd.createViolationKey(v))
      }
      expect(keys.size).toBe(1)
    })
  })
})

describe('diff-helpers: createViolationKey', () => {
  test('creates key from filePath, line, and ruleId', () => {
    const key = createViolationKey(
      makeViolation({
        filePath: 'src/a.ts',
        ruleId: 'no-console',
        range: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } },
      }),
    )
    expect(key).toBe('src/a.ts:5:no-console')
  })

  test('uses only start line, not end line or column', () => {
    const key = createViolationKey(
      makeViolation({
        filePath: 'src/x.ts',
        ruleId: 'test-rule',
        range: { start: { line: 10, column: 2 }, end: { line: 20, column: 30 } },
      }),
    )
    expect(key).toBe('src/x.ts:10:test-rule')
  })

  test('produces same key for same violation', () => {
    const v = makeViolation({
      filePath: 'foo.ts',
      ruleId: 'bar',
      range: { start: { line: 3, column: 0 }, end: { line: 3, column: 1 } },
    })
    expect(createViolationKey(v)).toBe(createViolationKey(v))
  })

  test('handles empty filePath', () => {
    const key = createViolationKey(makeViolation({ filePath: '' }))
    expect(key).toBe(':1:max-complexity')
  })

  test('handles line 0', () => {
    const key = createViolationKey(
      makeViolation({ range: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } } }),
    )
    expect(key).toBe('src/test.ts:0:max-complexity')
  })

  test('handles hyphenated ruleId', () => {
    const key = createViolationKey(makeViolation({ ruleId: 'prefer-const' }))
    expect(key).toBe('src/test.ts:1:prefer-const')
  })

  test('handles slash in ruleId', () => {
    const key = createViolationKey(makeViolation({ ruleId: 'security/no-eval' }))
    expect(key).toBe('src/test.ts:1:security/no-eval')
  })

  test('formats key correctly with colons', () => {
    const key = createViolationKey(
      makeViolation({
        filePath: 'a.ts',
        range: { start: { line: 99, column: 0 }, end: { line: 99, column: 0 } },
        ruleId: 'z',
      }),
    )
    expect(key.split(':')).toHaveLength(3)
    expect(key).toBe('a.ts:99:z')
  })
})

describe('diff-helpers: compareViolations', () => {
  test('returns empty for two empty arrays', () => {
    const result = compareViolations([], [])
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
    expect(result.improved).toHaveLength(0)
  })

  test('identifies all head violations as added when base is empty', () => {
    const v1 = makeViolation({ filePath: 'a.ts' })
    const v2 = makeViolation({ filePath: 'b.ts' })
    const result = compareViolations([], [v1, v2])
    expect(result.added).toHaveLength(2)
    expect(result.removed).toHaveLength(0)
  })

  test('identifies all base violations as removed when head is empty', () => {
    const v1 = makeViolation({ filePath: 'a.ts' })
    const v2 = makeViolation({ filePath: 'b.ts' })
    const result = compareViolations([v1, v2], [])
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(2)
  })

  test('returns empty when both have identical violations', () => {
    const v = makeViolation()
    const result = compareViolations([v], [v])
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  test('handles partial overlap', () => {
    const shared = makeViolation({
      filePath: 'shared.ts',
      range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    })
    const baseOnly = makeViolation({
      filePath: 'base-only.ts',
      range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    })
    const headOnly = makeViolation({
      filePath: 'head-only.ts',
      range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    })
    const result = compareViolations([shared, baseOnly], [shared, headOnly])
    expect(result.added).toHaveLength(1)
    expect(result.removed).toHaveLength(1)
  })

  test('same file different lines are different violations', () => {
    const v1 = makeViolation({
      range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    })
    const v2 = makeViolation({
      range: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
    })
    const result = compareViolations([v1], [v2])
    expect(result.added).toHaveLength(1)
    expect(result.removed).toHaveLength(1)
  })

  test('same file same line different rules are different violations', () => {
    const v1 = makeViolation({
      ruleId: 'rule-a',
      range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    })
    const v2 = makeViolation({
      ruleId: 'rule-b',
      range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    })
    const result = compareViolations([v1], [v2])
    expect(result.added).toHaveLength(1)
    expect(result.removed).toHaveLength(1)
  })

  test('handles many-to-many comparison', () => {
    const base = Array.from({ length: 100 }, (_, i) =>
      makeViolation({
        filePath: `src/${i}.ts`,
        range: { start: { line: i, column: 0 }, end: { line: i, column: 5 } },
      }),
    )
    const head = Array.from({ length: 100 }, (_, i) =>
      makeViolation({
        filePath: `src/${i + 50}.ts`,
        range: { start: { line: i, column: 0 }, end: { line: i, column: 5 } },
      }),
    )
    const result = compareViolations(base, head)
    expect(result.added.length).toBeGreaterThan(0)
    expect(result.removed.length).toBeGreaterThan(0)
  })

  test('preserves violation data in added', () => {
    const v = makeViolation({
      filePath: 'preserved.ts',
      ruleId: 'test-rule',
      message: 'preserved msg',
    })
    const result = compareViolations([], [v])
    expect(result.added[0].filePath).toBe('preserved.ts')
    expect(result.added[0].ruleId).toBe('test-rule')
    expect(result.added[0].message).toBe('preserved msg')
  })

  test('preserves violation data in removed', () => {
    const v = makeViolation({
      filePath: 'removed.ts',
      ruleId: 'removed-rule',
      message: 'removed msg',
    })
    const result = compareViolations([v], [])
    expect(result.removed[0].filePath).toBe('removed.ts')
    expect(result.removed[0].ruleId).toBe('removed-rule')
  })

  test('improved array is always empty in current implementation', () => {
    const result = compareViolations(
      [makeViolation({ filePath: 'a.ts' })],
      [makeViolation({ filePath: 'b.ts' })],
    )
    expect(result.improved).toHaveLength(0)
  })
})

describe('diff-helpers: countByRule', () => {
  test('returns empty object for empty array', () => {
    expect(countByRule([])).toEqual({})
  })

  test('counts single violation', () => {
    const result = countByRule([makeViolation({ ruleId: 'no-any' })])
    expect(result).toEqual({ 'no-any': 1 })
  })

  test('counts multiple violations of same rule', () => {
    const violations = [
      makeViolation({ ruleId: 'no-any' }),
      makeViolation({ ruleId: 'no-any' }),
      makeViolation({ ruleId: 'no-any' }),
    ]
    expect(countByRule(violations)).toEqual({ 'no-any': 3 })
  })

  test('counts violations of different rules separately', () => {
    const violations = [
      makeViolation({ ruleId: 'no-any' }),
      makeViolation({ ruleId: 'no-console' }),
      makeViolation({ ruleId: 'no-any' }),
    ]
    expect(countByRule(violations)).toEqual({ 'no-any': 2, 'no-console': 1 })
  })

  test('handles many different rules', () => {
    const violations = Array.from({ length: 5 }, (_, i) => makeViolation({ ruleId: `rule-${i}` }))
    const result = countByRule(violations)
    expect(Object.keys(result)).toHaveLength(5)
    for (const key of Object.keys(result)) {
      expect(result[key]).toBe(1)
    }
  })

  test('handles large counts', () => {
    const violations = Array.from({ length: 100 }, () => makeViolation({ ruleId: 'no-any' }))
    expect(countByRule(violations)).toEqual({ 'no-any': 100 })
  })

  test('handles mixed counts correctly', () => {
    const violations = [
      ...Array.from({ length: 10 }, () => makeViolation({ ruleId: 'a' })),
      ...Array.from({ length: 5 }, () => makeViolation({ ruleId: 'b' })),
      ...Array.from({ length: 3 }, () => makeViolation({ ruleId: 'c' })),
    ]
    const result = countByRule(violations)
    expect(result).toEqual({ a: 10, b: 5, c: 3 })
  })
})

describe('diff-helpers: countBySeverity', () => {
  test('returns empty object for empty array', () => {
    expect(countBySeverity([])).toEqual({})
  })

  test('counts single error violation', () => {
    expect(countBySeverity([makeViolation({ severity: 'error' })])).toEqual({ error: 1 })
  })

  test('counts single warning violation', () => {
    expect(countBySeverity([makeViolation({ severity: 'warning' })])).toEqual({ warning: 1 })
  })

  test('counts single info violation', () => {
    expect(countBySeverity([makeViolation({ severity: 'info' })])).toEqual({ info: 1 })
  })

  test('counts mixed severities', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
      makeViolation({ severity: 'info' }),
      makeViolation({ severity: 'info' }),
    ]
    expect(countBySeverity(violations)).toEqual({ error: 2, warning: 1, info: 3 })
  })

  test('counts only one severity type', () => {
    const violations = Array.from({ length: 5 }, () => makeViolation({ severity: 'warning' }))
    expect(countBySeverity(violations)).toEqual({ warning: 5 })
  })

  test('handles large counts', () => {
    const violations = Array.from({ length: 50 }, () => makeViolation({ severity: 'error' }))
    expect(countBySeverity(violations)).toEqual({ error: 50 })
  })
})

describe('diff-helpers: buildDiffReport', () => {
  test('builds report with empty violations', () => {
    const report = buildDiffReport('base', 'head', [], [])
    expect(report.base).toBe('base')
    expect(report.head).toBe('head')
    expect(report.added).toHaveLength(0)
    expect(report.removed).toHaveLength(0)
    expect(report.summary.addedCount).toBe(0)
    expect(report.summary.removedCount).toBe(0)
    expect(report.summary.netChange).toBe(0)
    expect(report.summary.totalBase).toBe(0)
    expect(report.summary.totalHead).toBe(0)
  })

  test('builds report with only base violations', () => {
    const base = [makeViolation({ filePath: 'a.ts' })]
    const report = buildDiffReport('b', 'h', base, [])
    expect(report.summary.totalBase).toBe(1)
    expect(report.summary.totalHead).toBe(0)
    expect(report.summary.removedCount).toBe(1)
    expect(report.summary.netChange).toBe(-1)
  })

  test('builds report with only head violations', () => {
    const head = [makeViolation({ filePath: 'b.ts' })]
    const report = buildDiffReport('b', 'h', [], head)
    expect(report.summary.totalBase).toBe(0)
    expect(report.summary.totalHead).toBe(1)
    expect(report.summary.addedCount).toBe(1)
    expect(report.summary.netChange).toBe(1)
  })

  test('builds report with mixed violations', () => {
    const base = [
      makeViolation({
        filePath: 'shared.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }),
      makeViolation({
        filePath: 'removed.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }),
    ]
    const head = [
      makeViolation({
        filePath: 'shared.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }),
      makeViolation({
        filePath: 'added.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }),
    ]
    const report = buildDiffReport('b', 'h', base, head)
    expect(report.summary.addedCount).toBe(1)
    expect(report.summary.removedCount).toBe(1)
    expect(report.summary.netChange).toBe(0)
    expect(report.summary.totalBase).toBe(2)
    expect(report.summary.totalHead).toBe(2)
  })

  test('calculates correct netChange', () => {
    const base = [
      makeViolation({
        filePath: 'a.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }),
    ]
    const head = [
      makeViolation({
        filePath: 'x.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }),
      makeViolation({
        filePath: 'y.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }),
      makeViolation({
        filePath: 'z.ts',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }),
    ]
    const report = buildDiffReport('b', 'h', base, head)
    expect(report.summary.netChange).toBe(2)
  })

  test('preserves base and head ref strings', () => {
    const report = buildDiffReport('abc123', 'def456', [], [])
    expect(report.base).toBe('abc123')
    expect(report.head).toBe('def456')
  })

  test('sets improvedCount to 0', () => {
    const report = buildDiffReport('b', 'h', [makeViolation()], [makeViolation()])
    expect(report.summary.improvedCount).toBe(0)
  })

  test('returns all added violation objects', () => {
    const head = [makeViolation({ filePath: 'a.ts' }), makeViolation({ filePath: 'b.ts' })]
    const report = buildDiffReport('b', 'h', [], head)
    expect(report.added.map((v) => v.filePath)).toEqual(['a.ts', 'b.ts'])
  })

  test('returns all removed violation objects', () => {
    const base = [makeViolation({ filePath: 'x.ts' }), makeViolation({ filePath: 'y.ts' })]
    const report = buildDiffReport('b', 'h', base, [])
    expect(report.removed.map((v) => v.filePath)).toEqual(['x.ts', 'y.ts'])
  })
})

describe('diff-helpers: parseGitDiffOutput', () => {
  test('returns empty array for empty string', () => {
    expect(parseGitDiffOutput('')).toEqual([])
  })

  test('returns single file for single line', () => {
    expect(parseGitDiffOutput('src/test.ts')).toEqual(['src/test.ts'])
  })

  test('splits on newlines', () => {
    expect(parseGitDiffOutput('a.ts\nb.ts\nc.ts')).toEqual(['a.ts', 'b.ts', 'c.ts'])
  })

  test('trims whitespace from each line', () => {
    expect(parseGitDiffOutput('  a.ts  \n  b.ts  ')).toEqual(['a.ts', 'b.ts'])
  })

  test('filters empty lines', () => {
    expect(parseGitDiffOutput('a.ts\n\nb.ts\n\n')).toEqual(['a.ts', 'b.ts'])
  })

  test('handles trailing newline', () => {
    expect(parseGitDiffOutput('a.ts\n')).toEqual(['a.ts'])
  })

  test('handles leading newline', () => {
    expect(parseGitDiffOutput('\na.ts')).toEqual(['a.ts'])
  })

  test('handles multiple consecutive newlines', () => {
    expect(parseGitDiffOutput('a.ts\n\n\n\nb.ts')).toEqual(['a.ts', 'b.ts'])
  })

  test('handles lines with only whitespace', () => {
    expect(parseGitDiffOutput('a.ts\n   \nb.ts')).toEqual(['a.ts', 'b.ts'])
  })

  test('handles Windows-style line endings', () => {
    expect(parseGitDiffOutput('a.ts\r\nb.ts')).toEqual(['a.ts', 'b.ts'])
  })
})

describe('diff-helpers: formatSummary', () => {
  function makeReport(overrides: Record<string, unknown> = {}) {
    return {
      base: 'HEAD~1',
      head: 'HEAD',
      added: [],
      removed: [],
      improved: [],
      summary: {
        addedCount: 0,
        removedCount: 0,
        improvedCount: 0,
        netChange: 0,
        totalBase: 10,
        totalHead: 10,
      },
      ...overrides,
    }
  }

  test('includes base and head in output', () => {
    const output = formatSummary(makeReport({ base: 'main', head: 'develop' }))
    expect(output).toContain('main')
    expect(output).toContain('develop')
  })

  test('shows improvement message when netChange < 0', () => {
    const output = formatSummary(
      makeReport({
        summary: {
          addedCount: 0,
          removedCount: 5,
          improvedCount: 0,
          netChange: -5,
          totalBase: 10,
          totalHead: 5,
        },
      }),
    )
    expect(output).toContain('improved')
    expect(output).toContain('5')
  })

  test('shows regression message when netChange > 0', () => {
    const output = formatSummary(
      makeReport({
        summary: {
          addedCount: 3,
          removedCount: 0,
          improvedCount: 0,
          netChange: 3,
          totalBase: 10,
          totalHead: 13,
        },
      }),
    )
    expect(output).toContain('regressed')
  })

  test('shows no-change message when netChange === 0', () => {
    const output = formatSummary(
      makeReport({
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 10,
          totalHead: 10,
        },
      }),
    )
    expect(output).toContain('No net change')
  })

  test('includes totalBase count', () => {
    const output = formatSummary(
      makeReport({
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 42,
          totalHead: 42,
        },
      }),
    )
    expect(output).toContain('42')
  })

  test('returns a string', () => {
    const output = formatSummary(makeReport())
    expect(typeof output).toBe('string')
  })

  test('includes "Violation Diff Analysis" header', () => {
    const output = formatSummary(makeReport())
    expect(output).toContain('Violation Diff Analysis')
  })

  test('includes "Summary:" section', () => {
    const output = formatSummary(makeReport())
    expect(output).toContain('Summary')
  })
})

describe('diff-helpers: displayAddedViolations', () => {
  test('does not call logFn for empty array', () => {
    const logFn = vi.fn()
    displayAddedViolations([], logFn)
    expect(logFn).not.toHaveBeenCalled()
  })

  test('calls logFn for single violation', () => {
    const logFn = vi.fn()
    displayAddedViolations([makeViolation()], logFn)
    expect(logFn.mock.calls.length).toBeGreaterThan(0)
  })

  test('shows file path in output', () => {
    const logFn = vi.fn()
    displayAddedViolations([makeViolation({ filePath: 'src/hello.ts' })], logFn)
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(allOutput).toContain('src/hello.ts')
  })

  test('shows ruleId in output', () => {
    const logFn = vi.fn()
    displayAddedViolations([makeViolation({ ruleId: 'my-custom-rule' })], logFn)
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(allOutput).toContain('my-custom-rule')
  })

  test('shows line number in output', () => {
    const logFn = vi.fn()
    displayAddedViolations(
      [makeViolation({ range: { start: { line: 42, column: 0 }, end: { line: 42, column: 5 } } })],
      logFn,
    )
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(allOutput).toContain('42')
  })

  test('shows header "Added Violations"', () => {
    const logFn = vi.fn()
    displayAddedViolations([makeViolation()], logFn)
    const firstCall = logFn.mock.calls[0][0] as string
    expect(firstCall).toContain('Added Violations')
  })

  test('truncates at MAX_DIFF_VIOLATIONS (20)', () => {
    const logFn = vi.fn()
    const violations = Array.from({ length: 25 }, (_, i) =>
      makeViolation({
        filePath: `src/${i}.ts`,
        range: { start: { line: i, column: 0 }, end: { line: i, column: 5 } },
      }),
    )
    displayAddedViolations(violations, logFn)
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(allOutput).toContain('... and 5 more')
  })

  test('does not truncate when violations are at limit', () => {
    const logFn = vi.fn()
    const violations = Array.from({ length: 20 }, (_, i) =>
      makeViolation({
        filePath: `src/${i}.ts`,
        range: { start: { line: i, column: 0 }, end: { line: i, column: 5 } },
      }),
    )
    displayAddedViolations(violations, logFn)
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(allOutput).not.toContain('... and')
  })

  test('displays each violation with + prefix', () => {
    const logFn = vi.fn()
    displayAddedViolations([makeViolation()], logFn)
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
    expect(allOutput).toContain('+')
  })
})

describe('diff-helpers: displayRemovedViolations', () => {
  test('does not call logFn for empty array', () => {
    const logFn = vi.fn()
    displayRemovedViolations([], logFn)
    expect(logFn).not.toHaveBeenCalled()
  })

  test('calls logFn for single violation', () => {
    const logFn = vi.fn()
    displayRemovedViolations([makeViolation()], logFn)
    expect(logFn.mock.calls.length).toBeGreaterThan(0)
  })

  test('shows file path in output', () => {
    const logFn = vi.fn()
    displayRemovedViolations([makeViolation({ filePath: 'src/gone.ts' })], logFn)
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(allOutput).toContain('src/gone.ts')
  })

  test('shows ruleId in output', () => {
    const logFn = vi.fn()
    displayRemovedViolations([makeViolation({ ruleId: 'removed-rule' })], logFn)
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(allOutput).toContain('removed-rule')
  })

  test('shows header "Removed Violations"', () => {
    const logFn = vi.fn()
    displayRemovedViolations([makeViolation()], logFn)
    const firstCall = logFn.mock.calls[0][0] as string
    expect(firstCall).toContain('Removed Violations')
  })

  test('truncates at MAX_DIFF_VIOLATIONS (20)', () => {
    const logFn = vi.fn()
    const violations = Array.from({ length: 30 }, (_, i) =>
      makeViolation({
        filePath: `src/${i}.ts`,
        range: { start: { line: i, column: 0 }, end: { line: i, column: 5 } },
      }),
    )
    displayRemovedViolations(violations, logFn)
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(allOutput).toContain('... and 10 more')
  })

  test('does not truncate when under limit', () => {
    const logFn = vi.fn()
    const violations = Array.from({ length: 15 }, (_, i) =>
      makeViolation({
        filePath: `src/${i}.ts`,
        range: { start: { line: i, column: 0 }, end: { line: i, column: 5 } },
      }),
    )
    displayRemovedViolations(violations, logFn)
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(allOutput).not.toContain('... and')
  })

  test('displays each violation with - prefix', () => {
    const logFn = vi.fn()
    displayRemovedViolations([makeViolation()], logFn)
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
    expect(allOutput).toContain('-')
  })

  test('shows line number in output', () => {
    const logFn = vi.fn()
    displayRemovedViolations(
      [makeViolation({ range: { start: { line: 77, column: 0 }, end: { line: 77, column: 5 } } })],
      logFn,
    )
    const allOutput = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(allOutput).toContain('77')
  })
})

describe('diff-helpers: displayDiffReport', () => {
  function makeReport(overrides: Record<string, unknown> = {}) {
    return {
      base: 'HEAD~1',
      head: 'HEAD',
      added: [],
      removed: [],
      improved: [],
      summary: {
        addedCount: 0,
        removedCount: 0,
        improvedCount: 0,
        netChange: 0,
        totalBase: 10,
        totalHead: 10,
      },
      ...overrides,
    }
  }

  test('always calls logFn for header', () => {
    const logFn = vi.fn()
    displayDiffReport(makeReport(), false, logFn)
    expect(logFn.mock.calls.length).toBeGreaterThan(0)
  })

  test('shows improvement message when netChange < 0', () => {
    const logFn = vi.fn()
    displayDiffReport(
      makeReport({
        summary: {
          addedCount: 0,
          removedCount: 5,
          improvedCount: 0,
          netChange: -5,
          totalBase: 10,
          totalHead: 5,
        },
      }),
      false,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('improved')
  })

  test('shows regression message when netChange > 0', () => {
    const logFn = vi.fn()
    displayDiffReport(
      makeReport({
        summary: {
          addedCount: 3,
          removedCount: 0,
          improvedCount: 0,
          netChange: 3,
          totalBase: 10,
          totalHead: 13,
        },
      }),
      false,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('regressed')
  })

  test('shows no-change message when netChange === 0', () => {
    const logFn = vi.fn()
    displayDiffReport(
      makeReport({
        summary: {
          addedCount: 0,
          removedCount: 0,
          improvedCount: 0,
          netChange: 0,
          totalBase: 10,
          totalHead: 10,
        },
      }),
      false,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('No net change')
  })

  test('verbose mode shows added violations', () => {
    const logFn = vi.fn()
    displayDiffReport(
      makeReport({
        added: [makeViolation({ filePath: 'src/added.ts' })],
        summary: {
          addedCount: 1,
          removedCount: 0,
          improvedCount: 0,
          netChange: 1,
          totalBase: 0,
          totalHead: 1,
        },
      }),
      true,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('src/added.ts')
    expect(output).toContain('Added Violations')
  })

  test('verbose mode shows removed violations', () => {
    const logFn = vi.fn()
    displayDiffReport(
      makeReport({
        removed: [makeViolation({ filePath: 'src/removed.ts' })],
        summary: {
          addedCount: 0,
          removedCount: 1,
          improvedCount: 0,
          netChange: -1,
          totalBase: 1,
          totalHead: 0,
        },
      }),
      true,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('src/removed.ts')
    expect(output).toContain('Removed Violations')
  })

  test('non-verbose mode does not show individual violations', () => {
    const logFn = vi.fn()
    displayDiffReport(
      makeReport({
        added: [makeViolation({ filePath: 'src/hidden.ts' })],
        summary: {
          addedCount: 1,
          removedCount: 0,
          improvedCount: 0,
          netChange: 1,
          totalBase: 0,
          totalHead: 1,
        },
      }),
      false,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).not.toContain('src/hidden.ts')
  })

  test('verbose mode truncates added violations at limit', () => {
    const logFn = vi.fn()
    const manyAdded = Array.from({ length: 25 }, (_, i) =>
      makeViolation({
        filePath: `src/${i}.ts`,
        range: { start: { line: i, column: 0 }, end: { line: i, column: 5 } },
      }),
    )
    displayDiffReport(
      makeReport({
        added: manyAdded,
        summary: {
          addedCount: 25,
          removedCount: 0,
          improvedCount: 0,
          netChange: 25,
          totalBase: 0,
          totalHead: 25,
        },
      }),
      true,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('... and 5 more')
  })

  test('verbose mode truncates removed violations at limit', () => {
    const logFn = vi.fn()
    const manyRemoved = Array.from({ length: 22 }, (_, i) =>
      makeViolation({
        filePath: `src/${i}.ts`,
        range: { start: { line: i, column: 0 }, end: { line: i, column: 5 } },
      }),
    )
    displayDiffReport(
      makeReport({
        removed: manyRemoved,
        summary: {
          addedCount: 0,
          removedCount: 22,
          improvedCount: 0,
          netChange: -22,
          totalBase: 22,
          totalHead: 0,
        },
      }),
      true,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('... and 2 more')
  })

  test('shows both added and removed in verbose mode', () => {
    const logFn = vi.fn()
    displayDiffReport(
      makeReport({
        added: [
          makeViolation({
            filePath: 'src/new.ts',
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          }),
        ],
        removed: [
          makeViolation({
            filePath: 'src/old.ts',
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          }),
        ],
        summary: {
          addedCount: 1,
          removedCount: 1,
          improvedCount: 0,
          netChange: 0,
          totalBase: 1,
          totalHead: 1,
        },
      }),
      true,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('Added Violations')
    expect(output).toContain('Removed Violations')
  })

  test('includes base and head in comparison line', () => {
    const logFn = vi.fn()
    displayDiffReport(makeReport({ base: 'v1.0', head: 'v2.0' }), false, logFn)
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('v1.0')
    expect(output).toContain('v2.0')
  })

  test('displays Violation Diff Analysis header', () => {
    const logFn = vi.fn()
    displayDiffReport(makeReport(), false, logFn)
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('Violation Diff Analysis')
  })

  test('verbose mode with no added violations does not show Added header', () => {
    const logFn = vi.fn()
    displayDiffReport(
      makeReport({
        removed: [makeViolation()],
        summary: {
          addedCount: 0,
          removedCount: 1,
          improvedCount: 0,
          netChange: -1,
          totalBase: 1,
          totalHead: 0,
        },
      }),
      true,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).not.toContain('Added Violations')
  })

  test('verbose mode with no removed violations does not show Removed header', () => {
    const logFn = vi.fn()
    displayDiffReport(
      makeReport({
        added: [makeViolation()],
        summary: {
          addedCount: 1,
          removedCount: 0,
          improvedCount: 0,
          netChange: 1,
          totalBase: 0,
          totalHead: 1,
        },
      }),
      true,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).not.toContain('Removed Violations')
  })

  test('shows summary counts', () => {
    const logFn = vi.fn()
    displayDiffReport(
      makeReport({
        summary: {
          addedCount: 7,
          removedCount: 3,
          improvedCount: 0,
          netChange: 4,
          totalBase: 20,
          totalHead: 24,
        },
      }),
      false,
      logFn,
    )
    const output = logFn.mock.calls.map((c: unknown[]) => c[0] as string).join(' ')
    expect(output).toContain('20')
    expect(output).toContain('24')
    expect(output).toContain('+7')
    expect(output).toContain('-3')
  })
})
