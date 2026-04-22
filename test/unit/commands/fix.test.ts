import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

interface FixFlags {
  ci: boolean
  concurrency: number
  config: string | undefined
  'dry-run': boolean
  ignore?: string[]
  rules: string | undefined
  'safe-only': boolean
  verbose: boolean
}

function defaultFlags(overrides: Partial<FixFlags> = {}): FixFlags {
  return {
    ci: false,
    concurrency: 4,
    config: undefined,
    'dry-run': false,
    ignore: undefined,
    rules: undefined,
    'safe-only': false,
    verbose: false,
    ...overrides,
  }
}

function createCommandWithMockedParse(
  Command: typeof import('../../../src/commands/fix.js').default,
  flags: Partial<FixFlags> = {},
  args: Record<string, unknown> = {},
) {
  const command = new Command([], {} as never)
  const cmdWithMock = command as unknown as {
    error: ReturnType<typeof vi.fn>
    exit: ReturnType<typeof vi.fn>
    log: ReturnType<typeof vi.fn>
    parse: ReturnType<typeof vi.fn>
  }
  cmdWithMock.parse = vi.fn().mockResolvedValue({
    args,
    flags: defaultFlags(flags),
  })
  cmdWithMock.log = vi.fn()
  cmdWithMock.error = vi.fn()
  cmdWithMock.exit = vi.fn()
  return command
}

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    text: '',
  })),
}))

vi.mock('p-limit', () => ({
  default: vi.fn(() => (fn: () => Promise<unknown>) => fn()),
}))

vi.mock('chalk', () => ({
  default: {
    bold: vi.fn((s: string) => s),
    blue: vi.fn((s: string) => s),
    dim: vi.fn((s: string) => s),
    green: vi.fn((s: string) => s),
    red: vi.fn((s: string) => s),
    yellow: vi.fn((s: string) => s),
  },
}))

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function () {
    return {
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
    }
  }),
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return {
      register: vi.fn(),
      disable: vi.fn(),
      runRules: vi.fn().mockReturnValue([createMockViolation()]),
    }
  }),
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

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {
    'test-fixable-rule': {
      meta: { id: 'test-fixable-rule', description: 'Test fixable rule', fixable: true },
      fix: vi.fn(),
    },
    'another-fixable-rule': {
      meta: { id: 'another-fixable-rule', description: 'Another fixable rule' },
      fix: vi.fn(),
    },
    'non-fixable-rule': {
      meta: { id: 'non-fixable-rule', description: 'Non fixable rule' },
    },
  },
  getRuleCategory: vi.fn().mockReturnValue('test'),
}))

vi.mock('../../../src/config/types.js', () => ({
  DEFAULT_CONFIG: {
    files: ['src/**/*.ts'],
    ignore: ['node_modules/**'],
  },
}))

import Fix from '../../../src/commands/fix.js'
import { discoverFiles } from '../../../src/core/file-discovery.js'
import { applyFixesToFile } from '../../../src/fix/fixer.js'
import { Parser } from '../../../src/core/parser.js'
import { RuleRegistry } from '../../../src/core/rule-registry.js'
import * as fs from 'node:fs/promises'
import ora from 'ora'
import pLimit from 'p-limit'
import { logger, LogLevel } from '../../../src/utils/logger.js'

describe('Fix Command', () => {
  let FixCommand: typeof Fix

  beforeEach(async () => {
    vi.clearAllMocks()
    FixCommand = (await import('../../../src/commands/fix.js')).default
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('command metadata - description', () => {
    it('has correct description', () => {
      expect(FixCommand.description).toContain('fix violations')
    })

    it('description mentions source files', () => {
      expect(FixCommand.description).toContain('source files')
    })

    it('description mentions automatically', () => {
      expect(FixCommand.description).toContain('Automatically')
    })
  })

  describe('command metadata - flags', () => {
    it('defines all required flags', () => {
      expect(FixCommand.flags).toBeDefined()
      expect(FixCommand.flags['dry-run']).toBeDefined()
      expect(FixCommand.flags.rules).toBeDefined()
      expect(FixCommand.flags.verbose).toBeDefined()
      expect(FixCommand.flags.ci).toBeDefined()
      expect(FixCommand.flags.concurrency).toBeDefined()
      expect(FixCommand.flags.config).toBeDefined()
      expect(FixCommand.flags.ignore).toBeDefined()
      expect(FixCommand.flags['safe-only']).toBeDefined()
      expect(FixCommand.flags['ignore-path']).toBeDefined()
    })

    it('dry-run flag has char d', () => {
      expect(FixCommand.flags['dry-run'].char).toBe('d')
    })

    it('dry-run flag defaults to false', () => {
      expect(FixCommand.flags['dry-run'].default).toBe(false)
    })

    it('dry-run flag has description', () => {
      expect(FixCommand.flags['dry-run'].description).toContain('Preview')
    })

    it('verbose flag has char v', () => {
      expect(FixCommand.flags.verbose.char).toBe('v')
    })

    it('verbose flag defaults to false', () => {
      expect(FixCommand.flags.verbose.default).toBe(false)
    })

    it('verbose flag has description', () => {
      expect(FixCommand.flags.verbose.description).toContain('detailed')
    })

    it('ci flag defaults to false', () => {
      expect(FixCommand.flags.ci.default).toBe(false)
    })

    it('ci flag has description', () => {
      expect(FixCommand.flags.ci.description).toContain('CI mode')
    })

    it('concurrency flag is integer type', () => {
      expect(FixCommand.flags.concurrency).toBeDefined()
    })

    it('concurrency flag has description', () => {
      expect(FixCommand.flags.concurrency.description).toContain('parallel')
    })

    it('concurrency flag has default based on CPUs', () => {
      expect(typeof FixCommand.flags.concurrency.default).toBe('number')
      expect(FixCommand.flags.concurrency.default).toBeGreaterThan(0)
    })

    it('config flag has char c', () => {
      expect(FixCommand.flags.config.char).toBe('c')
    })

    it('config flag has description', () => {
      expect(FixCommand.flags.config.description).toContain('config')
    })

    it('ignore flag has char i', () => {
      expect(FixCommand.flags.ignore.char).toBe('i')
    })

    it('ignore flag allows multiple values', () => {
      expect(FixCommand.flags.ignore.multiple).toBe(true)
    })

    it('ignore flag has description', () => {
      expect(FixCommand.flags.ignore.description).toContain('ignore')
    })

    it('rules flag has char r', () => {
      expect(FixCommand.flags.rules.char).toBe('r')
    })

    it('rules flag does not allow multiple', () => {
      expect(FixCommand.flags.rules.multiple).toBe(false)
    })

    it('rules flag has description', () => {
      expect(FixCommand.flags.rules.description).toContain('comma-separated')
    })

    it('safe-only flag defaults to false', () => {
      expect(FixCommand.flags['safe-only'].default).toBe(false)
    })

    it('safe-only flag has description', () => {
      expect(FixCommand.flags['safe-only'].description).toContain('safe')
    })

    it('ignore-path flag has description', () => {
      expect(FixCommand.flags['ignore-path'].description).toContain('ignore file')
    })
  })

  describe('command metadata - args', () => {
    it('defines files arg', () => {
      expect(FixCommand.args).toBeDefined()
      expect(FixCommand.args.files).toBeDefined()
    })

    it('files arg is not required', () => {
      expect(FixCommand.args.files.required).toBe(false)
    })

    it('files arg allows multiple values', () => {
      expect(FixCommand.args.files.multiple).toBe(true)
    })

    it('files arg has description', () => {
      expect(FixCommand.args.files.description).toContain('Files or patterns')
    })
  })

  describe('command metadata - examples', () => {
    it('has examples defined', () => {
      expect(FixCommand.examples).toBeDefined()
      expect(Array.isArray(FixCommand.examples)).toBe(true)
    })

    it('has at least 4 examples', () => {
      expect(FixCommand.examples.length).toBeGreaterThanOrEqual(4)
    })

    it('examples include basic fix command without flags', () => {
      const commands = FixCommand.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => !c.includes('--'))).toBe(true)
    })

    it('examples include --dry-run', () => {
      const commands = FixCommand.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => c.includes('--dry-run'))).toBe(true)
    })

    it('examples include --rules', () => {
      const commands = FixCommand.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => c.includes('--rules'))).toBe(true)
    })

    it('examples include --concurrency', () => {
      const commands = FixCommand.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => c.includes('--concurrency'))).toBe(true)
    })

    it('all examples have description', () => {
      for (const example of FixCommand.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
        expect((example as { description: string }).description.length).toBeGreaterThan(0)
      }
    })

    it('examples use template tags for bin and command id', () => {
      const commands = FixCommand.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => c.includes('<%= config.bin %>'))).toBe(true)
    })
  })

  describe('getRulesWithFixes', () => {
    it('returns rules with fix functions when safeOnly is false', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const rulesWithFixes = (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly: boolean) => Map<string, unknown>
        }
      ).getRulesWithFixes(false)

      expect(rulesWithFixes.size).toBe(2)
      expect(rulesWithFixes.has('test-fixable-rule')).toBe(true)
      expect(rulesWithFixes.has('another-fixable-rule')).toBe(true)
    })

    it('excludes rules without fix function', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const rulesWithFixes = (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly: boolean) => Map<string, unknown>
        }
      ).getRulesWithFixes(false)

      expect(rulesWithFixes.has('non-fixable-rule')).toBe(false)
    })

    it('filters to only meta.fixable rules when safeOnly is true', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const rulesWithFixes = (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly: boolean) => Map<string, unknown>
        }
      ).getRulesWithFixes(true)

      expect(rulesWithFixes.size).toBe(1)
      expect(rulesWithFixes.has('test-fixable-rule')).toBe(true)
      expect(rulesWithFixes.has('another-fixable-rule')).toBe(false)
    })

    it('sets priority to 10 for each rule', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const rulesWithFixes = (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly: boolean) => Map<string, { priority: number }>
        }
      ).getRulesWithFixes(false)

      for (const rule of rulesWithFixes.values()) {
        expect(rule.priority).toBe(10)
      }
    })

    it('sets id to ruleId for each rule', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const rulesWithFixes = (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly: boolean) => Map<string, { id: string }>
        }
      ).getRulesWithFixes(false)

      expect(rulesWithFixes.get('test-fixable-rule')?.id).toBe('test-fixable-rule')
      expect(rulesWithFixes.get('another-fixable-rule')?.id).toBe('another-fixable-rule')
    })

    it('includes fix function for each rule', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const rulesWithFixes = (
        cmd as unknown as {
          getRulesWithFixes: (
            safeOnly: boolean,
          ) => Map<string, { fix: (...args: unknown[]) => unknown }>
        }
      ).getRulesWithFixes(false)

      for (const rule of rulesWithFixes.values()) {
        expect(typeof rule.fix).toBe('function')
      }
    })

    it('defaults safeOnly parameter to false', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const rulesWithFixes = (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly?: boolean) => Map<string, unknown>
        }
      ).getRulesWithFixes()

      expect(rulesWithFixes.size).toBe(2)
    })

    it('returns same Map instance for same parameters', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const getRulesWithFixes = (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly: boolean) => Map<string, unknown>
        }
      ).getRulesWithFixes

      const result1 = getRulesWithFixes(false)
      const result2 = getRulesWithFixes(false)
      expect(result1).not.toBe(result2)
    })

    it('wraps fix function to accept sourceFile and violation', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const rulesWithFixes = (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly: boolean) => Map<string, { fix: (ctx: unknown) => unknown }>
        }
      ).getRulesWithFixes(false)

      const rule = rulesWithFixes.get('test-fixable-rule')
      expect(rule).toBeDefined()
      expect(() => rule!.fix({ sourceFile: {}, violation: {} })).not.toThrow()
    })
  })

  describe('setupFixContext', () => {
    it('returns null when no files found in non-CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      const result = await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({}, defaultFlags(), false)

      expect(result).toBeNull()
    })

    it('logs "No files found" in non-CI mode when no files', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({}, defaultFlags(), false)

      expect(logs.some((l) => l.includes('No files found'))).toBe(true)
    })

    it('outputs JSON error in CI mode when no files found', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({}, defaultFlags({ ci: true }), true)

      const jsonOutput = logs.find((l) => l.includes('No files found'))
      expect(jsonOutput).toBeDefined()
    })

    it('returns null when no fixable rules in non-CI mode', async () => {
      const { allRules } = await import('../../../src/rules/index.js')
      const originalRules = { ...allRules }
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { 'safe-only': true })
      cmd.log = vi.fn()

      const result = await (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly: boolean) => Map<string, unknown>
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({}, defaultFlags({ 'safe-only': true }), false)

      vi.restoreAllMocks()
      expect(result).toBeDefined()
    })

    it('calls discoverFiles with resolved patterns', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()

      await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({ files: ['custom/**/*.ts'] }, defaultFlags(), false)

      expect(discoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          patterns: ['custom/**/*.ts'],
        }),
      )
    })

    it('falls back to config patterns when no args files', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()

      await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({ files: undefined }, defaultFlags(), false)

      expect(discoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          patterns: expect.any(Array),
        }),
      )
    })

    it('uses ignore flag patterns', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ignore: ['dist/**'] })
      cmd.log = vi.fn()

      await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({}, defaultFlags({ ignore: ['dist/**'] }), false)

      expect(discoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: ['dist/**'],
        }),
      )
    })

    it('falls back to config ignore when no flag', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()

      await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({}, defaultFlags(), false)

      expect(discoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: expect.any(Array),
        }),
      )
    })

    it('parses rules flag as comma-separated', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { rules: 'rule-a,rule-b' })
      cmd.log = vi.fn()

      await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({}, defaultFlags({ rules: 'rule-a,rule-b' }), false)

      expect(RuleRegistry).toHaveBeenCalled()
    })

    it('logs file count in non-CI mode when files found', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('a.ts'),
        createMockFile('b.ts'),
      ])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({}, defaultFlags(), false)

      expect(logs.some((l) => l.includes('2 file(s)'))).toBe(true)
    })

    it('does not log file count in CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))

      await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({}, defaultFlags({ ci: true }), true)

      expect(logs.some((l) => l.includes('Fixing') && !l.includes('CI'))).toBe(false)
    })

    it('returns context with correct dryRun value', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true })
      cmd.log = vi.fn()

      const result = (await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<{ context: { dryRun: boolean } } | null>
        }
      ).setupFixContext({}, defaultFlags({ 'dry-run': true }), false))!

      expect(result).not.toBeNull()
      expect(result.context.dryRun).toBe(true)
    })

    it('returns context with parser instance', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()

      const result = (await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<{ context: { parser: unknown } } | null>
        }
      ).setupFixContext({}, defaultFlags(), false))!

      expect(result.context.parser).toBeDefined()
    })

    it('returns context with registry instance', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()

      const result = (await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<{ context: { registry: unknown } } | null>
        }
      ).setupFixContext({}, defaultFlags(), false))!

      expect(result.context.registry).toBeDefined()
    })

    it('returns context with rulesWithFixes map', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()

      const result = (await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<{ context: { rulesWithFixes: Map<string, unknown> } } | null>
        }
      ).setupFixContext({}, defaultFlags(), false))!

      expect(result.context.rulesWithFixes).toBeInstanceOf(Map)
      expect(result.context.rulesWithFixes.size).toBeGreaterThan(0)
    })

    it('returns discoveredFiles in result', async () => {
      const files = [createMockFile('a.ts'), createMockFile('b.ts')]
      vi.mocked(discoverFiles).mockResolvedValueOnce(files)

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()

      const result = (await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<{ discoveredFiles: DiscoveredFile[] } | null>
        }
      ).setupFixContext({}, defaultFlags(), false))!

      expect(result.discoveredFiles).toHaveLength(2)
    })

    it('uses cwd from process.cwd()', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('test.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()

      await (
        cmd as unknown as {
          setupFixContext: (
            args: { files: string[] | undefined },
            flags: FixFlags,
            ciMode: boolean,
          ) => Promise<unknown>
        }
      ).setupFixContext({}, defaultFlags(), false)

      expect(discoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: expect.any(String),
        }),
      )
    })
  })

  describe('processFile', () => {
    it('returns unchanged when sourceFile is null', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: null,
            filePath: '/test/null.ts',
            parseTime: 10,
          }),
        } as never
      })

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      const result = await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<{
            status: string
            fixesApplied: number
            file: string
          }>
        }
      ).processFile(createMockFile('null.ts'), context)

      expect(result.status).toBe('unchanged')
      expect(result.fixesApplied).toBe(0)
    })

    it('returns unchanged when no violations found', async () => {
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      const result = await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<{ status: string; fixesApplied: number }>
        }
      ).processFile(createMockFile('clean.ts'), context)

      expect(result.status).toBe('unchanged')
      expect(result.fixesApplied).toBe(0)
    })

    it('returns processed with fixes on success', async () => {
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({ fixesApplied: 3, fixesSkipped: 0 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      const result = await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<{ status: string; fixesApplied: number; file: string }>
        }
      ).processFile(createMockFile('fixable.ts'), context)

      expect(result.status).toBe('processed')
      expect(result.fixesApplied).toBe(3)
    })

    it('writes file when not dryRun and fixes > 0', async () => {
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({ fixesApplied: 1, fixesSkipped: 0 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<unknown>
        }
      ).processFile(createMockFile('write.ts'), context)

      expect(fs.writeFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'utf8')
    })

    it('does not write file in dryRun mode', async () => {
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({ fixesApplied: 1, fixesSkipped: 0 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: true,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<unknown>
        }
      ).processFile(createMockFile('dryrun.ts'), context)

      expect(fs.writeFile).not.toHaveBeenCalled()
    })

    it('does not write file when fixesApplied is 0', async () => {
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({ fixesApplied: 0, fixesSkipped: 0 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<unknown>
        }
      ).processFile(createMockFile('nofix.ts'), context)

      expect(fs.writeFile).not.toHaveBeenCalled()
    })

    it('returns error status on exception', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue(new Error('Parse failure')),
        } as never
      })

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      const result = await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<{ status: string; error?: string }>
        }
      ).processFile(createMockFile('error.ts'), context)

      expect(result.status).toBe('error')
      expect(result.error).toBe('Parse failure')
    })

    it('handles non-Error thrown values', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue('string error'),
        } as never
      })

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      const result = await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<{ status: string; error?: string }>
        }
      ).processFile(createMockFile('string-err.ts'), context)

      expect(result.status).toBe('error')
      expect(result.error).toBe('string error')
    })

    it('returns file path in result', async () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      const result = await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<{ file: string }>
        }
      ).processFile(createMockFile('my-file.ts'), context)

      expect(result.file).toBe('my-file.ts')
    })

    it('includes conflicts from fixReport', async () => {
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({
          fixesApplied: 1,
          fixesSkipped: 1,
          conflicts: [{ ruleId: 'rule-a', conflictingRule: 'rule-b', reason: 'overlap' }],
        }),
      )

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      const result = await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<{ conflicts: Array<{ ruleId: string }> }>
        }
      ).processFile(createMockFile('conflict.ts'), context)

      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].ruleId).toBe('rule-a')
    })

    it('returns fixesSkipped from fixReport', async () => {
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({ fixesApplied: 1, fixesSkipped: 3 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      const result = await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<{ fixesSkipped: number }>
        }
      ).processFile(createMockFile('skipped.ts'), context)

      expect(result.fixesSkipped).toBe(3)
    })

    it('calls applyFixesToFile with violations and rules', async () => {
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport())

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const rulesMap = new Map()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: rulesMap,
      }

      await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<unknown>
        }
      ).processFile(createMockFile('test.ts'), context)

      expect(applyFixesToFile).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Array),
        rulesMap,
        false,
      )
    })

    it('writes getFullText content to file', async () => {
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const parser = new Parser()
      const registry = new RuleRegistry()
      const context = {
        dryRun: false,
        parser,
        registry,
        rulesWithFixes: new Map(),
      }

      await (
        cmd as unknown as {
          processFile: (
            file: DiscoveredFile,
            context: {
              dryRun: boolean
              parser: unknown
              registry: unknown
              rulesWithFixes: Map<string, unknown>
            },
          ) => Promise<unknown>
        }
      ).processFile(createMockFile('content.ts'), context)

      expect(fs.writeFile).toHaveBeenCalledWith(expect.any(String), 'fixed code', 'utf8')
    })
  })

  describe('processFiles', () => {
    it('aggregates totalFixesApplied across files', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('a.ts'),
        createMockFile('b.ts'),
      ])
      vi.mocked(applyFixesToFile)
        .mockReturnValueOnce(createMockFixReport({ fixesApplied: 2 }))
        .mockReturnValueOnce(createMockFixReport({ fixesApplied: 3 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixes applied: 5'))).toBe(true)
    })

    it('tracks filesModified in non-dry-run mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('mod.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Files modified: 1'))).toBe(true)
    })

    it('tracks filesUnchanged', async () => {
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('clean.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Files unchanged: 1'))).toBe(true)
    })

    it('logs errors for error-status files', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue(new Error('bad file')),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('bad.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Error processing bad.ts'))).toBe(true)
      expect(logs.some((l) => l.includes('bad file'))).toBe(true)
    })

    it('logs verbose fix messages when verbose flag set', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('v.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 5 }))

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixed 5 violation(s) in v.ts'))).toBe(true)
    })

    it('does not log verbose messages without verbose flag', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('quiet.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 2 }))

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: false })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixed 2 violation(s)'))).toBe(false)
    })

    it('logs would-fix messages in dry-run verbose mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('dry.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 3 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true, verbose: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Would fix 3 violation(s) in dry.ts'))).toBe(true)
    })

    it('logs conflict warnings in verbose mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('conf.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({
          fixesApplied: 1,
          fixesSkipped: 2,
          conflicts: [{ ruleId: 'r1', conflictingRule: 'r2', reason: 'overlap' }],
        }),
      )

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Skipped r1 (conflicts with r2)'))).toBe(true)
    })

    it('does not log conflicts without verbose flag', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('conf.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({
          fixesApplied: 1,
          fixesSkipped: 1,
          conflicts: [{ ruleId: 'r1', conflictingRule: 'r2', reason: 'overlap' }],
        }),
      )

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: false })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('conflicts with'))).toBe(false)
    })

    it('creates spinner in non-CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('spin.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: false })
      cmd.log = vi.fn()
      await cmd.run()

      expect(ora).toHaveBeenCalledWith('Fixing files...')
    })

    it('does not create spinner in CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('ci.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      cmd.log = vi.fn()
      await cmd.run()

      expect(ora).not.toHaveBeenCalled()
    })

    it('handles empty file list', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('No files found'))).toBe(true)
    })

    it('handles multiple files with mixed results', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        let callCount = 0
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockImplementation(async () => {
            callCount++
            if (callCount === 2) {
              return { sourceFile: null, filePath: '/test/b.ts', parseTime: 5 }
            }
            return {
              sourceFile: {
                getFilePath: () => `/test/${callCount === 1 ? 'a' : 'c'}.ts`,
                getText: () => 'code',
                getFullText: () => 'fixed',
              },
              filePath: `/test/${callCount === 1 ? 'a' : 'c'}.ts`,
              parseTime: 10,
            }
          }),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('a.ts'),
        createMockFile('b.ts'),
        createMockFile('c.ts'),
      ])
      vi.mocked(applyFixesToFile)
        .mockReturnValueOnce(createMockFixReport({ fixesApplied: 2 }))
        .mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixing 3 file(s)'))).toBe(true)
      expect(logs.some((l) => l.includes('Fixes applied: 3'))).toBe(true)
    })

    it('aggregates totalFixesSkipped', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('skip.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({ fixesApplied: 1, fixesSkipped: 4 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixes skipped: 4'))).toBe(true)
    })
  })

  describe('outputFixResults', () => {
    it('calls outputJson in CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('ci-out.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          JSON.parse(l)
          return true
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
    })

    it('calls printSummary in non-CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('sum.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand, { ci: false })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fix Summary'))).toBe(true)
    })

    it('passes dryRun to CI output', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('cidry.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true, 'dry-run': true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => l.includes('dryRun'))
      expect(jsonLog).toBeDefined()
      const parsed = JSON.parse(jsonLog!)
      expect(parsed.dryRun).toBe(true)
    })
  })

  describe('printSummary', () => {
    it('prints Fix Summary header', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('hdr.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fix Summary'))).toBe(true)
    })

    it('shows dry run mode label when flag set', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('drylbl.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Dry run'))).toBe(true)
    })

    it('does not show dry run label when flag not set', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('nodry.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': false })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Mode: Dry run'))).toBe(false)
    })

    it('shows fixes applied count', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('cnt.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 7 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixes applied: 7'))).toBe(true)
    })

    it('shows fixes skipped when > 0', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('skp.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({ fixesApplied: 1, fixesSkipped: 3 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixes skipped: 3'))).toBe(true)
    })

    it('does not show fixes skipped when 0', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('noskp.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({ fixesApplied: 1, fixesSkipped: 0 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixes skipped'))).toBe(false)
    })

    it('shows files modified count in non-dry-run', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('modcnt.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Files modified:'))).toBe(true)
    })

    it('shows files unchanged count in non-dry-run', async () => {
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('unch.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Files unchanged:'))).toBe(true)
    })

    it('shows would-be-modified in dry-run with fixes', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('wouldmod.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('would be modified'))).toBe(true)
    })

    it('shows no violations message when nothing to fix', async () => {
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('clean.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('No violations found'))).toBe(true)
    })

    it('shows success message after applying fixes', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('succ.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 2 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixes applied successfully'))).toBe(true)
    })

    it('does not show success in dry-run mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('drysucc.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 2 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixes applied successfully!'))).toBe(false)
    })
  })

  describe('outputJson', () => {
    it('outputs valid JSON in CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('json.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          JSON.parse(l)
          return true
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
      const parsed = JSON.parse(jsonLog!)
      expect(parsed).toHaveProperty('summary')
    })

    it('CI output includes filesModified', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('fmod.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => l.includes('filesModified'))
      expect(jsonLog).toBeDefined()
    })

    it('CI output includes filesUnchanged', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('funch.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => l.includes('filesUnchanged'))
      expect(jsonLog).toBeDefined()
    })

    it('CI output includes dryRun field', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('fdr.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true, 'dry-run': true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return typeof p.dryRun === 'boolean'
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
    })

    it('CI output uses 2-space indent', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('find.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => l.includes('summary'))
      expect(jsonLog).toBeDefined()
      expect(jsonLog).toContain('  ')
    })
  })

  describe('run method', () => {
    it('sets logger level to DEBUG in verbose mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true })
      cmd.log = vi.fn()
      await cmd.run()

      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
    })

    it('sets logger level to DEBUG in CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      cmd.log = vi.fn()
      await cmd.run()

      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
    })

    it('does not set logger level without verbose or ci', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: false, ci: false })
      cmd.log = vi.fn()
      await cmd.run()

      expect(logger.setLevel).not.toHaveBeenCalled()
    })

    it('returns early when setupFixContext returns null', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(applyFixesToFile).not.toHaveBeenCalled()
    })

    it('calls processFiles when setup succeeds', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('proc.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(applyFixesToFile).toHaveBeenCalled()
    })

    it('handles CLIError in non-CI mode', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      vi.mocked(discoverFiles).mockRejectedValueOnce(new CLIError('test cli error'))

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()
      await cmd.run()

      expect(cmd.error).toHaveBeenCalledWith('test cli error')
    })

    it('handles generic Error in non-CI mode', async () => {
      vi.mocked(discoverFiles).mockRejectedValueOnce(new Error('generic error'))

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()
      await cmd.run()

      expect(cmd.error).toHaveBeenCalledWith(expect.stringContaining('Fix failed'))
    })

    it('outputs JSON error in CI mode on failure', async () => {
      vi.mocked(discoverFiles).mockRejectedValueOnce(new Error('ci error'))

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return p.error !== undefined
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
      const parsed = JSON.parse(jsonLog!)
      expect(parsed.error).toContain('ci error')
    })

    it('calls exit(1) in CI mode on failure', async () => {
      vi.mocked(discoverFiles).mockRejectedValueOnce(new Error('exit test'))

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      cmd.log = vi.fn()
      await cmd.run()

      expect(cmd.exit).toHaveBeenCalledWith(1)
    })

    it('wraps non-Error with Fix failed prefix', async () => {
      vi.mocked(discoverFiles).mockRejectedValueOnce('string error')

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()
      await cmd.run()

      expect(cmd.error).toHaveBeenCalledWith(expect.stringContaining('Fix failed'))
    })

    it('handles string error in CI mode', async () => {
      vi.mocked(discoverFiles).mockRejectedValueOnce('plain string')

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return p.error !== undefined
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
      const parsed = JSON.parse(jsonLog!)
      expect(parsed.error).toBe('plain string')
    })
  })

  describe('CI mode', () => {
    it('does not show spinner in CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('cispin.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      cmd.log = vi.fn()
      await cmd.run()

      expect(ora).not.toHaveBeenCalled()
    })

    it('outputs JSON for no files in CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return p.error === 'No files found to fix'
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
    })

    it('does not show "Fixing N file(s)" in CI mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('cifile.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixing') && l.includes('file(s)'))).toBe(false)
    })

    it('CI output has fixesApplied in summary', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('cisum.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 5 }))

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return p.summary?.fixesApplied !== undefined
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
    })

    it('CI output has fixesSkipped in summary', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('ciskp.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({ fixesApplied: 1, fixesSkipped: 2 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return p.summary?.fixesSkipped !== undefined
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
    })

    it('CI mode with dry-run outputs dryRun true', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('cidr.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true, 'dry-run': true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return p.dryRun === true
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
    })

    it('CI mode with dry-run false outputs dryRun false', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('cidr2.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true, 'dry-run': false })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return p.dryRun === false
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
    })

    it('CI mode logger set to DEBUG', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      cmd.log = vi.fn()
      await cmd.run()

      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
    })
  })

  describe('dry-run mode', () => {
    it('does not write files in dry-run mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('dryw.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true })
      cmd.log = vi.fn()
      await cmd.run()

      expect(fs.writeFile).not.toHaveBeenCalled()
    })

    it('writes files in non-dry-run mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('writ.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': false })
      cmd.log = vi.fn()
      await cmd.run()

      expect(fs.writeFile).toHaveBeenCalled()
    })

    it('shows dry run mode label in summary', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('drylbl2.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Dry run'))).toBe(true)
    })

    it('shows would-fix message in dry-run verbose', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('wdfix.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 3 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true, verbose: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Would fix 3 violation(s)'))).toBe(true)
    })

    it('does not show fixed message in dry-run mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('nofix.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 2 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true, verbose: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixed 2 violation(s)'))).toBe(false)
    })

    it('shows "would be modified" instead of "modified" in dry-run', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('wmod.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('would be modified'))).toBe(true)
      expect(logs.some((l) => l.includes('Files modified:') && !l.includes('would'))).toBe(false)
    })
  })

  describe('verbose mode', () => {
    it('shows per-file fix details in verbose mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('det.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 4 }))

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixed 4 violation(s) in det.ts'))).toBe(true)
    })

    it('hides per-file fix details without verbose flag', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('nodet.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 4 }))

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: false })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixed 4 violation(s)'))).toBe(false)
    })

    it('shows conflict details in verbose mode', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('cdet.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({
          fixesApplied: 1,
          conflicts: [{ ruleId: 'r-x', conflictingRule: 'r-y', reason: 'overlap' }],
        }),
      )

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Skipped r-x (conflicts with r-y)'))).toBe(true)
    })

    it('hides conflict details without verbose flag', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('noconf.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({
          fixesApplied: 1,
          conflicts: [{ ruleId: 'r-x', conflictingRule: 'r-y', reason: 'overlap' }],
        }),
      )

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: false })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('conflicts with'))).toBe(false)
    })

    it('shows error details in verbose mode', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue(new Error('verbose error msg')),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('verr.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Error processing verr.ts'))).toBe(true)
      expect(logs.some((l) => l.includes('verbose error msg'))).toBe(true)
    })

    it('shows error details even without verbose', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue(new Error('non-verbose error')),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('nverr.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: false })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Error processing'))).toBe(true)
    })

    it('verbose + dry-run shows would-fix but not fixed', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('vdr.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 2 }))

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true, 'dry-run': true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Would fix 2 violation(s)'))).toBe(true)
      expect(logs.some((l) => l.includes('Fixed 2 violation(s)'))).toBe(false)
    })

    it('verbose mode sets logger to DEBUG', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true })
      cmd.log = vi.fn()
      await cmd.run()

      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
    })
  })

  describe('safe-only mode', () => {
    it('safe-only flag is defined', () => {
      expect(FixCommand.flags['safe-only']).toBeDefined()
    })

    it('safe-only defaults to false', () => {
      expect(FixCommand.flags['safe-only'].default).toBe(false)
    })

    it('safe-only filters to fixable rules', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const rules = (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly: boolean) => Map<string, unknown>
        }
      ).getRulesWithFixes(true)

      expect(rules.size).toBe(1)
      expect(rules.has('test-fixable-rule')).toBe(true)
    })

    it('without safe-only includes all rules with fix', () => {
      const cmd = createCommandWithMockedParse(FixCommand)
      const rules = (
        cmd as unknown as {
          getRulesWithFixes: (safeOnly: boolean) => Map<string, unknown>
        }
      ).getRulesWithFixes(false)

      expect(rules.size).toBe(2)
    })

    it('safe-only runs with filtered rules', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('safe.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { 'safe-only': true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(RuleRegistry).toHaveBeenCalled()
    })

    it('safe-only false includes all fixable rules', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('unsafe.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { 'safe-only': false })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(RuleRegistry).toHaveBeenCalled()
    })
  })

  describe('rule filtering', () => {
    it('filters to specific rules via --rules flag', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { rules: 'prefer-const,no-console' })
      cmd.log = vi.fn()
      await cmd.run()

      const registryInstance = vi.mocked(RuleRegistry).mock.results[0]?.value
      if (registryInstance) {
        expect(registryInstance.disable).toHaveBeenCalled()
      }
    })

    it('registers all rules when no rules flag', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()
      await cmd.run()

      const registryInstance = vi.mocked(RuleRegistry).mock.results[0]?.value
      if (registryInstance) {
        expect(registryInstance.register).toHaveBeenCalled()
      }
    })

    it('handles single rule in --rules flag', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('rule1.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { rules: 'prefer-const' })
      cmd.log = vi.fn()
      await cmd.run()

      expect(RuleRegistry).toHaveBeenCalled()
    })

    it('trims whitespace from rules', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('rule2.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { rules: 'rule-a , rule-b ' })
      cmd.log = vi.fn()
      await cmd.run()

      expect(RuleRegistry).toHaveBeenCalled()
    })

    it('handles empty rules string', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('rule3.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { rules: '' })
      cmd.log = vi.fn()
      await cmd.run()

      expect(RuleRegistry).toHaveBeenCalled()
    })
  })

  describe('concurrency', () => {
    it('pLimit is called with concurrency value', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('conc.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { concurrency: 8 })
      cmd.log = vi.fn()
      await cmd.run()

      expect(pLimit).toHaveBeenCalledWith(8)
    })

    it('pLimit uses default concurrency', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('defconc.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { concurrency: 4 })
      cmd.log = vi.fn()
      await cmd.run()

      expect(pLimit).toHaveBeenCalledWith(4)
    })

    it('concurrency 1 processes files sequentially', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('seq.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { concurrency: 1 })
      cmd.log = vi.fn()
      await cmd.run()

      expect(pLimit).toHaveBeenCalledWith(1)
    })
  })

  describe('file discovery integration', () => {
    it('exits early when no files found', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('No files found'))).toBe(true)
      expect(applyFixesToFile).not.toHaveBeenCalled()
    })

    it('discovers files with provided patterns', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('pat.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, {}, { files: ['src/**/*.ts'] })
      cmd.log = vi.fn()
      await cmd.run()

      expect(discoverFiles).toHaveBeenCalled()
    })

    it('processes discovered files', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('d1.ts'),
        createMockFile('d2.ts'),
      ])

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()
      await cmd.run()

      expect(applyFixesToFile).toHaveBeenCalled()
    })

    it('passes ignore patterns to discoverFiles', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('ign.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { ignore: ['dist/**', 'build/**'] })
      cmd.log = vi.fn()
      await cmd.run()

      expect(discoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: ['dist/**', 'build/**'],
        }),
      )
    })

    it('handles file with special characters in path', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('path/with spaces/file.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixing 1 file(s)'))).toBe(true)
    })
  })

  describe('error handling', () => {
    it('handles parse errors gracefully', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue(new Error('Syntax error')),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('parse-err.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Error processing'))).toBe(true)
      expect(logs.some((l) => l.includes('Syntax error'))).toBe(true)
    })

    it('handles null sourceFile from parser', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: null,
            filePath: '/test/null.ts',
            parseTime: 10,
          }),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('nullsrc.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Files unchanged: 1'))).toBe(true)
    })

    it('handles non-Error thrown values in processFile', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue(42),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('numerr.ts')])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Error processing'))).toBe(true)
      expect(logs.some((l) => l.includes('42'))).toBe(true)
    })

    it('continues processing after file error', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        let callCount = 0
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockImplementation(async () => {
            callCount++
            if (callCount === 1) throw new Error('first fails')
            return {
              sourceFile: {
                getFilePath: () => '/test/second.ts',
                getText: () => 'code',
                getFullText: () => 'fixed',
              },
              filePath: '/test/second.ts',
              parseTime: 10,
            }
          }),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('fail.ts'),
        createMockFile('pass.ts'),
      ])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Error processing fail.ts'))).toBe(true)
      expect(logs.some((l) => l.includes('Fixes applied: 1'))).toBe(true)
    })

    it('handles CLIError in run catch block', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      vi.mocked(discoverFiles).mockRejectedValueOnce(new CLIError('cli specific error'))

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()
      await cmd.run()

      expect(cmd.error).toHaveBeenCalledWith('cli specific error')
    })

    it('handles generic Error in run catch block', async () => {
      vi.mocked(discoverFiles).mockRejectedValueOnce(new Error('something broke'))

      const cmd = createCommandWithMockedParse(FixCommand)
      cmd.log = vi.fn()
      await cmd.run()

      expect(cmd.error).toHaveBeenCalledWith('Fix failed: something broke')
    })

    it('CI mode outputs JSON error on discoverFiles failure', async () => {
      vi.mocked(discoverFiles).mockRejectedValueOnce(new Error('discovery fail'))

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return p.error !== undefined
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
    })

    it('CI mode calls exit(1) on error', async () => {
      vi.mocked(discoverFiles).mockRejectedValueOnce(new Error('exit on error'))

      const cmd = createCommandWithMockedParse(FixCommand, { ci: true })
      cmd.log = vi.fn()
      await cmd.run()

      expect(cmd.exit).toHaveBeenCalledWith(1)
    })
  })

  describe('edge cases', () => {
    it('handles zero violations across all files', async () => {
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('e1.ts'),
        createMockFile('e2.ts'),
      ])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('No violations found'))).toBe(true)
    })

    it('handles single file with single fix', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('single.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixes applied: 1'))).toBe(true)
      expect(logs.some((l) => l.includes('Files modified: 1'))).toBe(true)
    })

    it('handles large number of files', async () => {
      const files = Array.from({ length: 50 }, (_, i) => createMockFile(`file${i}.ts`))
      vi.mocked(discoverFiles).mockResolvedValueOnce(files)
      vi.mocked(applyFixesToFile).mockReturnValue(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('50 file(s)'))).toBe(true)
      expect(logs.some((l) => l.includes('Fixes applied: 50'))).toBe(true)
    })

    it('handles fixes applied and skipped together', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('both.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({ fixesApplied: 3, fixesSkipped: 2 }),
      )

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Fixes applied: 3'))).toBe(true)
      expect(logs.some((l) => l.includes('Fixes skipped: 2'))).toBe(true)
    })

    it('handles all files with errors', async () => {
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue(new Error('all fail')),
        } as never
      })
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        createMockFile('err1.ts'),
        createMockFile('err2.ts'),
      ])

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.filter((l) => l.includes('Error processing')).length).toBe(2)
    })

    it('handles multiple conflicts in one file', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('multiconf.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(
        createMockFixReport({
          fixesApplied: 1,
          fixesSkipped: 3,
          conflicts: [
            { ruleId: 'r1', conflictingRule: 'r2', reason: 'a' },
            { ruleId: 'r3', conflictingRule: 'r4', reason: 'b' },
            { ruleId: 'r5', conflictingRule: 'r6', reason: 'c' },
          ],
        }),
      )

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Skipped r1 (conflicts with r2)'))).toBe(true)
      expect(logs.some((l) => l.includes('Skipped r3 (conflicts with r4)'))).toBe(true)
      expect(logs.some((l) => l.includes('Skipped r5 (conflicts with r6)'))).toBe(true)
    })

    it('handles undefined args.files', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, {}, { files: undefined })
      cmd.log = vi.fn()
      await cmd.run()

      expect(discoverFiles).toHaveBeenCalled()
    })

    it('handles args.files as empty array', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, {}, { files: [] })
      cmd.log = vi.fn()
      await cmd.run()

      expect(discoverFiles).toHaveBeenCalled()
    })

    it('handles all flags combined', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, {
        ci: true,
        'dry-run': true,
        verbose: true,
        'safe-only': true,
        rules: 'test-fixable-rule',
        concurrency: 2,
        config: '/path/to/config',
        ignore: ['dist/**'],
      })
      cmd.log = vi.fn()
      await cmd.run()

      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
    })

    it('handles write file error', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('wferr.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('disk full'))

      const cmd = createCommandWithMockedParse(FixCommand)
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(logs.some((l) => l.includes('Error processing') || l.includes('disk full'))).toBe(true)
    })

    it('handles rules flag with trailing comma', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('trail.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, { rules: 'rule-a,' })
      cmd.log = vi.fn()
      await cmd.run()

      expect(RuleRegistry).toHaveBeenCalled()
    })
  })

  describe('utility function resolvePatterns', () => {
    it('returns array args directly', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns(['a.ts', 'b.ts'], ['default.ts'])).toEqual(['a.ts', 'b.ts'])
    })

    it('wraps string arg in array', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns('single.ts', ['default.ts'])).toEqual(['single.ts'])
    })

    it('falls back to config files', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns(undefined, ['config.ts'])).toEqual(['config.ts'])
    })

    it('returns empty array when both undefined', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns(undefined, undefined)).toEqual([])
    })

    it('returns empty array when args empty and config undefined', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')
      expect(resolvePatterns([], undefined)).toEqual([])
    })
  })

  describe('utility function setupRuleRegistry', () => {
    it('returns a registry instance', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const registry = setupRuleRegistry()
      expect(registry).toBeDefined()
    })

    it('handles empty requested rules array', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const registry = setupRuleRegistry([])
      expect(registry).toBeDefined()
    })

    it('handles specific requested rules', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const registry = setupRuleRegistry(['test-fixable-rule'])
      expect(registry).toBeDefined()
    })

    it('handles undefined requested rules', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const registry = setupRuleRegistry(undefined)
      expect(registry).toBeDefined()
    })
  })

  describe('flag combinations', () => {
    it('dry-run + CI produces JSON with dryRun true', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('dci.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand, { 'dry-run': true, ci: true })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return p.dryRun === true
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
    })

    it('verbose + CI sets logger once', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { verbose: true, ci: true })
      cmd.log = vi.fn()
      await cmd.run()

      expect(logger.setLevel).toHaveBeenCalledTimes(1)
    })

    it('safe-only + rules combines both filters', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('combo.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, {
        'safe-only': true,
        rules: 'test-fixable-rule',
      })
      cmd.log = vi.fn()
      await cmd.run()

      expect(RuleRegistry).toHaveBeenCalled()
    })

    it('all flags disabled still works', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('noflag.ts')])

      const cmd = createCommandWithMockedParse(FixCommand, {
        ci: false,
        'dry-run': false,
        verbose: false,
        'safe-only': false,
      })
      cmd.log = vi.fn()
      await cmd.run()

      expect(applyFixesToFile).toHaveBeenCalled()
    })

    it('config flag is passed through', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, { config: '/custom/config.json' })
      cmd.log = vi.fn()
      await cmd.run()

      expect(discoverFiles).toHaveBeenCalled()
    })

    it('ignore-path flag is defined', () => {
      expect(FixCommand.flags['ignore-path']).toBeDefined()
      expect(FixCommand.flags['ignore-path'].description).toBeDefined()
    })

    it('dry-run + verbose + CI all together', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('all3.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 2 }))

      const cmd = createCommandWithMockedParse(FixCommand, {
        'dry-run': true,
        verbose: true,
        ci: true,
      })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      const jsonLog = logs.find((l) => {
        try {
          const p = JSON.parse(l)
          return p.dryRun === true
        } catch {
          return false
        }
      })
      expect(jsonLog).toBeDefined()
    })

    it('config and ignore flags together', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, {
        config: '.codeforgerc.json',
        ignore: ['**/*.test.ts'],
      })
      cmd.log = vi.fn()
      await cmd.run()

      expect(discoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: ['**/*.test.ts'],
        }),
      )
    })

    it('multiple ignore patterns passed through', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const cmd = createCommandWithMockedParse(FixCommand, {
        ignore: ['dist/**', 'build/**', 'coverage/**'],
      })
      cmd.log = vi.fn()
      await cmd.run()

      expect(discoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: ['dist/**', 'build/**', 'coverage/**'],
        }),
      )
    })

    it('concurrency and verbose together', async () => {
      vi.mocked(discoverFiles).mockResolvedValueOnce([createMockFile('cv.ts')])
      vi.mocked(applyFixesToFile).mockReturnValueOnce(createMockFixReport({ fixesApplied: 1 }))

      const cmd = createCommandWithMockedParse(FixCommand, {
        concurrency: 2,
        verbose: true,
      })
      const logs: string[] = []
      cmd.log = vi.fn((msg: string) => logs.push(msg))
      await cmd.run()

      expect(pLimit).toHaveBeenCalledWith(2)
      expect(logs.some((l) => l.includes('Fixed 1 violation(s)'))).toBe(true)
    })
  })
})
