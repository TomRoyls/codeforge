import { describe, test, expect, beforeEach, vi } from 'vitest'
import { execSync } from 'node:child_process'

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
})
